package com.futuremeal.service.impl;

import com.futuremeal.dto.request.OrderRequest;
import com.futuremeal.dto.response.CartResponse;
import com.futuremeal.dto.response.OrderResponse;
import com.futuremeal.entity.*;
import com.futuremeal.entity.enums.*;
import com.futuremeal.exception.BadRequestException;
import com.futuremeal.exception.ResourceNotFoundException;
import com.futuremeal.exception.UnauthorizedException;
import com.futuremeal.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class OrderServiceImpl {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final CartServiceImpl cartService;

    private static final double TAX_RATE = 0.05;
    private static final double DELIVERY_FEE_THRESHOLD = 199.0;
    private static final double DELIVERY_FEE = 30.0;

    @Transactional
    public OrderResponse placeOrder(User user, OrderRequest req) {
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        Address address = addressRepository.findById(req.getAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("Invalid delivery address");
        }

        // Build order
        CartResponse cartSnapshot = cartService.toResponse(cart);

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .user(user)
                .restaurant(cart.getRestaurant())
                .deliveryAddress(address)
                .paymentMethod(req.getPaymentMethod())
                .paymentStatus(req.getPaymentMethod() == PaymentMethod.CASH_ON_DELIVERY
                        ? PaymentStatus.PENDING : PaymentStatus.PROCESSING)
                .subtotal(cartSnapshot.getSubtotal())
                .deliveryFee(cartSnapshot.getDeliveryFee())
                .taxes(cartSnapshot.getTaxes())
                .discount(cartSnapshot.getDiscount())
                .total(cartSnapshot.getTotal())
                .specialInstructions(req.getSpecialInstructions())
                .couponCode(cart.getCouponCode())
                .estimatedDeliveryTime(
                        cart.getRestaurant() != null ? cart.getRestaurant().getDeliveryTime() + 10 : 40)
                .status(OrderStatus.ORDER_PLACED)
                .build();

        // Add order items from cart
        cart.getItems().forEach(cartItem -> {
            OrderItem oi = OrderItem.builder()
                    .order(order)
                    .foodItemId(cartItem.getFoodItem().getId())
                    .foodItemName(cartItem.getFoodItem().getName())
                    .foodItemImage(cartItem.getFoodItem().getImage())
                    .price(cartItem.getFoodItem().getPrice())
                    .quantity(cartItem.getQuantity())
                    .specialInstructions(cartItem.getSpecialInstructions())
                    .subtotal(cartItem.getFoodItem().getPrice() * cartItem.getQuantity())
                    .build();
            order.getItems().add(oi);

            // Increment food item order count
            cartItem.getFoodItem().setOrderCount(
                    cartItem.getFoodItem().getOrderCount() + cartItem.getQuantity());
        });

        Order saved = orderRepository.save(order);

        // Clear cart after successful order
        cartService.clearCart(user);

        log.info("Order placed: {} by user {}", saved.getOrderNumber(), user.getEmail());
        return toResponse(saved);
    }

    public Page<OrderResponse> getMyOrders(User user, int page, int size) {
        return orderRepository.findByUserOrderByPlacedAtDesc(
                user, PageRequest.of(page, size)).map(this::toResponse);
    }

    public OrderResponse getOrderById(Long id, User user) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        // Customers can only see their own orders
        if (!user.getRole().name().equals("ADMIN")
                && !order.getUser().getId().equals(user.getId())
                && (order.getDeliveryPartner() == null
                    || !order.getDeliveryPartner().getId().equals(user.getId()))) {
            throw new UnauthorizedException("Access denied");
        }
        return toResponse(order);
    }

    public OrderResponse getByOrderNumber(String orderNumber) {
        return toResponse(orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderNumber)));
    }

    @Transactional
    public OrderResponse cancelOrder(Long id, User user, String reason) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        if (!order.getUser().getId().equals(user.getId()) && !user.getRole().name().equals("ADMIN")) {
            throw new UnauthorizedException("Cannot cancel this order");
        }

        if (!List.of(OrderStatus.ORDER_PLACED, OrderStatus.CONFIRMED).contains(order.getStatus())) {
            throw new BadRequestException("Order cannot be cancelled at this stage");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancellationReason(reason);
        order.setCancelledAt(LocalDateTime.now());

        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatus status, User actor) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        order.setStatus(status);
        LocalDateTime now = LocalDateTime.now();

        switch (status) {
            case CONFIRMED -> order.setConfirmedAt(now);
            case PREPARING -> order.setPreparingAt(now);
            case READY_FOR_PICKUP -> order.setReadyAt(now);
            case OUT_FOR_DELIVERY -> order.setPickedUpAt(now);
            case DELIVERED -> {
                order.setDeliveredAt(now);
                if (order.getPaymentMethod() != PaymentMethod.CASH_ON_DELIVERY) {
                    order.setPaymentStatus(PaymentStatus.SUCCESS);
                } else {
                    order.setPaymentStatus(PaymentStatus.SUCCESS);
                }
            }
            default -> {}
        }

        return toResponse(orderRepository.save(order));
    }

    // Restaurant owner — get orders
    public List<OrderResponse> getRestaurantOrders(Restaurant restaurant, String status) {
        if (status != null && !status.isBlank()) {
            return orderRepository
                    .findByRestaurantAndStatusIn(restaurant, List.of(OrderStatus.valueOf(status)))
                    .stream().map(this::toResponse).collect(Collectors.toList());
        }
        return orderRepository
                .findByRestaurantOrderByPlacedAtDesc(restaurant, PageRequest.of(0, 50, Sort.by("placedAt").descending()))
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // Delivery partner
    public List<OrderResponse> getAvailableDeliveries() {
        return orderRepository.findByStatusIn(List.of(OrderStatus.READY_FOR_PICKUP))
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse acceptDelivery(Long orderId, User partner) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (order.getStatus() != OrderStatus.READY_FOR_PICKUP) {
            throw new BadRequestException("Order is not available for pickup");
        }

        order.setDeliveryPartner(partner);
        order.setStatus(OrderStatus.OUT_FOR_DELIVERY);
        order.setPickedUpAt(LocalDateTime.now());
        return toResponse(orderRepository.save(order));
    }

    private String generateOrderNumber() {
        return "FM" + System.currentTimeMillis() % 1000000000L +
               UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    public OrderResponse toResponse(Order o) {
        DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

        List<OrderResponse.OrderItemResponse> items = o.getItems().stream()
                .map(i -> OrderResponse.OrderItemResponse.builder()
                        .id(i.getId())
                        .foodItemId(i.getFoodItemId())
                        .foodItemName(i.getFoodItemName())
                        .foodItemImage(i.getFoodItemImage())
                        .price(i.getPrice())
                        .quantity(i.getQuantity())
                        .specialInstructions(i.getSpecialInstructions())
                        .subtotal(i.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        Address addr = o.getDeliveryAddress();
        OrderResponse.AddressResponse addressResp = addr != null ? OrderResponse.AddressResponse.builder()
                .id(addr.getId()).label(addr.getLabel()).street(addr.getStreet())
                .area(addr.getArea()).city(addr.getCity()).state(addr.getState())
                .pincode(addr.getPincode()).landmark(addr.getLandmark())
                .build() : null;

        return OrderResponse.builder()
                .id(o.getId())
                .orderNumber(o.getOrderNumber())
                .userId(o.getUser().getId())
                .restaurantId(o.getRestaurant().getId())
                .restaurantName(o.getRestaurant().getName())
                .restaurantLogo(o.getRestaurant().getLogo())
                .items(items)
                .deliveryAddress(addressResp)
                .status(o.getStatus())
                .paymentMethod(o.getPaymentMethod())
                .paymentStatus(o.getPaymentStatus())
                .subtotal(o.getSubtotal())
                .deliveryFee(o.getDeliveryFee())
                .taxes(o.getTaxes())
                .discount(o.getDiscount())
                .total(o.getTotal())
                .specialInstructions(o.getSpecialInstructions())
                .estimatedDeliveryTime(o.getEstimatedDeliveryTime())
                .deliveryPartnerId(o.getDeliveryPartner() != null ? o.getDeliveryPartner().getId() : null)
                .deliveryPartnerName(o.getDeliveryPartner() != null ? o.getDeliveryPartner().getName() : null)
                .deliveryPartnerPhone(o.getDeliveryPartner() != null ? o.getDeliveryPartner().getPhone() : null)
                .placedAt(o.getPlacedAt() != null ? o.getPlacedAt().format(fmt) : null)
                .confirmedAt(o.getConfirmedAt() != null ? o.getConfirmedAt().format(fmt) : null)
                .preparingAt(o.getPreparingAt() != null ? o.getPreparingAt().format(fmt) : null)
                .readyAt(o.getReadyAt() != null ? o.getReadyAt().format(fmt) : null)
                .pickedUpAt(o.getPickedUpAt() != null ? o.getPickedUpAt().format(fmt) : null)
                .deliveredAt(o.getDeliveredAt() != null ? o.getDeliveredAt().format(fmt) : null)
                .cancelledAt(o.getCancelledAt() != null ? o.getCancelledAt().format(fmt) : null)
                .cancellationReason(o.getCancellationReason())
                .build();
    }
}
