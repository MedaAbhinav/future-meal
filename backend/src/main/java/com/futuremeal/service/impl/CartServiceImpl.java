package com.futuremeal.service.impl;

import com.futuremeal.dto.request.CartItemRequest;
import com.futuremeal.dto.response.CartResponse;
import com.futuremeal.entity.Cart;
import com.futuremeal.entity.CartItem;
import com.futuremeal.entity.FoodItem;
import com.futuremeal.entity.User;
import com.futuremeal.exception.BadRequestException;
import com.futuremeal.exception.ResourceNotFoundException;
import com.futuremeal.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CartServiceImpl {

    private final CartRepository cartRepository;
    private final FoodItemServiceImpl foodItemService;

    private static final double DELIVERY_FEE_THRESHOLD = 199.0;
    private static final double DELIVERY_FEE = 30.0;
    private static final double TAX_RATE = 0.05;

    public CartResponse getCart(User user) {
        Cart cart = cartRepository.findByUser(user).orElseGet(() -> createEmptyCart(user));
        return toResponse(cart);
    }

    @Transactional
    public CartResponse addItem(User user, CartItemRequest req) {
        FoodItem foodItem = foodItemService.findById(req.getFoodItemId());

        if (!foodItem.isAvailable()) {
            throw new BadRequestException("This item is currently not available");
        }

        Cart cart = cartRepository.findByUser(user).orElseGet(() -> createEmptyCart(user));

        // If cart has items from different restaurant, clear it first
        if (cart.getRestaurant() != null
                && !cart.getRestaurant().getId().equals(foodItem.getRestaurant().getId())
                && !cart.getItems().isEmpty()) {
            cart.getItems().clear();
        }

        cart.setRestaurant(foodItem.getRestaurant());

        // Check if item already exists in cart
        CartItem existingItem = cart.getItems().stream()
                .filter(i -> i.getFoodItem().getId().equals(foodItem.getId()))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + req.getQuantity());
            if (req.getSpecialInstructions() != null) {
                existingItem.setSpecialInstructions(req.getSpecialInstructions());
            }
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .foodItem(foodItem)
                    .quantity(req.getQuantity())
                    .specialInstructions(req.getSpecialInstructions())
                    .build();
            cart.getItems().add(newItem);
        }

        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse updateItem(User user, Long itemId, int quantity, String specialInstructions) {
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(quantity);
            if (specialInstructions != null) {
                item.setSpecialInstructions(specialInstructions);
            }
        }

        if (cart.getItems().isEmpty()) {
            cart.setRestaurant(null);
        }

        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse removeItem(User user, Long itemId) {
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        cart.getItems().removeIf(i -> i.getId().equals(itemId));

        if (cart.getItems().isEmpty()) {
            cart.setRestaurant(null);
        }

        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public void clearCart(User user) {
        cartRepository.findByUser(user).ifPresent(cart -> {
            cart.getItems().clear();
            cart.setRestaurant(null);
            cart.setCouponCode(null);
            cart.setDiscount(null);
            cartRepository.save(cart);
        });
    }

    @Transactional
    public CartResponse applyCoupon(User user, String couponCode) {
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        // Basic coupon engine - extend with a Coupon entity for real use
        double discount = applyCouponLogic(couponCode, calculateSubtotal(cart.getItems()));
        cart.setCouponCode(couponCode);
        cart.setDiscount(discount);
        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse removeCoupon(User user) {
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
        cart.setCouponCode(null);
        cart.setDiscount(null);
        return toResponse(cartRepository.save(cart));
    }

    private Cart createEmptyCart(User user) {
        return cartRepository.save(Cart.builder().user(user).items(new ArrayList<>()).build());
    }

    private double applyCouponLogic(String code, double subtotal) {
        // Placeholder — integrate with a real Coupon service later
        return switch (code.toUpperCase()) {
            case "WELCOME10" -> subtotal * 0.10;
            case "FLAT50" -> Math.min(50.0, subtotal);
            case "FIRST100" -> Math.min(100.0, subtotal);
            default -> throw new BadRequestException("Invalid coupon code: " + code);
        };
    }

    private double calculateSubtotal(List<CartItem> items) {
        return items.stream()
                .mapToDouble(i -> i.getFoodItem().getPrice() * i.getQuantity())
                .sum();
    }

    public CartResponse toResponse(Cart cart) {
        double subtotal = calculateSubtotal(cart.getItems());
        double discount = cart.getDiscount() != null ? cart.getDiscount() : 0.0;
        double deliveryFee = (subtotal > 0 && subtotal < DELIVERY_FEE_THRESHOLD) ? DELIVERY_FEE : 0.0;
        double taxes = Math.round((subtotal - discount) * TAX_RATE * 100.0) / 100.0;
        double total = subtotal - discount + deliveryFee + taxes;

        List<CartResponse.CartItemResponse> itemResponses = cart.getItems().stream()
                .map(item -> CartResponse.CartItemResponse.builder()
                        .id(item.getId())
                        .foodItem(foodItemService.toResponse(item.getFoodItem()))
                        .quantity(item.getQuantity())
                        .specialInstructions(item.getSpecialInstructions())
                        .build())
                .collect(Collectors.toList());

        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .restaurantId(cart.getRestaurant() != null ? cart.getRestaurant().getId() : null)
                .restaurantName(cart.getRestaurant() != null ? cart.getRestaurant().getName() : null)
                .items(itemResponses)
                .subtotal(subtotal)
                .deliveryFee(deliveryFee)
                .taxes(taxes)
                .discount(discount)
                .total(Math.max(0, total))
                .couponCode(cart.getCouponCode())
                .build();
    }
}
