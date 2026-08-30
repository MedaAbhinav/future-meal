package com.futuremeal.service.impl;

import com.futuremeal.dto.request.CartItemRequest;
import com.futuremeal.dto.request.FutureMealRequest;
import com.futuremeal.dto.request.OrderRequest;
import com.futuremeal.dto.response.FoodItemResponse;
import com.futuremeal.dto.response.FutureMealResponse;
import com.futuremeal.dto.response.OrderResponse;
import com.futuremeal.dto.response.RestaurantResponse;
import com.futuremeal.entity.*;
import com.futuremeal.entity.enums.FutureMealStatus;
import com.futuremeal.entity.enums.PaymentMethod;
import com.futuremeal.exception.BadRequestException;
import com.futuremeal.exception.ResourceNotFoundException;
import com.futuremeal.exception.UnauthorizedException;
import com.futuremeal.repository.*;
import com.futuremeal.service.ai.AIService;
import com.futuremeal.service.recommendation.RecommendationEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional(readOnly = true)
public class FutureMealServiceImpl {

    private final FutureMealRepository futureMealRepository;
    private final AddressRepository addressRepository;
    private final RestaurantRepository restaurantRepository;
    private final FoodItemRepository foodItemRepository;
    private final RecommendationEngine recommendationEngine;
    private final AIService aiService;
    private final CartServiceImpl cartService;
    private final OrderServiceImpl orderService;

    // Use @Lazy to break circular dependency: FutureMealService → OrderService → CartService → FutureMealService (none actually)
    public FutureMealServiceImpl(
            FutureMealRepository futureMealRepository,
            AddressRepository addressRepository,
            RestaurantRepository restaurantRepository,
            FoodItemRepository foodItemRepository,
            RecommendationEngine recommendationEngine,
            AIService aiService,
            @Lazy CartServiceImpl cartService,
            @Lazy OrderServiceImpl orderService) {
        this.futureMealRepository = futureMealRepository;
        this.addressRepository = addressRepository;
        this.restaurantRepository = restaurantRepository;
        this.foodItemRepository = foodItemRepository;
        this.recommendationEngine = recommendationEngine;
        this.aiService = aiService;
        this.cartService = cartService;
        this.orderService = orderService;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CRUD
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public FutureMealResponse create(User user, FutureMealRequest req) {
        Address address = null;

        // Try the explicitly provided address first
        if (req.getDeliveryAddressId() != null) {
            address = addressRepository.findById(req.getDeliveryAddressId())
                    .filter(a -> a.getUser().getId().equals(user.getId()))
                    .orElse(null);
        }

        // Fall back to user's default address
        if (address == null) {
            address = addressRepository.findByUserAndIsDefaultTrue(user)
                    .orElseGet(() -> addressRepository.findByUserOrderByIsDefaultDesc(user)
                            .stream().findFirst().orElse(null));
        }

        // Last resort: create a placeholder address so FutureMeal creation never fails
        if (address == null) {
            address = Address.builder()
                    .user(user)
                    .label("Demo Location")
                    .street("Demo Street")
                    .area("City Center")
                    .city("Hyderabad")
                    .state("Telangana")
                    .pincode("500001")
                    .isDefault(false)
                    .build();
            address = addressRepository.save(address);
        }

        Restaurant preferredRestaurant = null;
        if (req.getPreferredRestaurantId() != null) {
            preferredRestaurant = restaurantRepository.findById(req.getPreferredRestaurantId()).orElse(null);
        }

        FutureMeal meal = FutureMeal.builder()
                .user(user)
                .description(req.getDescription())
                .plannedDate(req.getPlannedDate())
                .plannedTime(req.getPlannedTime())
                .maxBudget(req.getMaxBudget())
                .cuisine(req.getCuisine())
                .dietaryPreference(req.getDietaryPreference())
                .spicePreference(req.getSpicePreference())
                .preferredRestaurant(preferredRestaurant)
                .deliveryAddress(address)
                .specialConditions(req.getSpecialConditions())
                .status(FutureMealStatus.PLANNED)
                .build();

        return toResponse(futureMealRepository.save(meal));
    }

    public List<FutureMealResponse> getMyFutureMeals(User user) {
        return futureMealRepository.findByUserOrderByCreatedAtDesc(user)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public FutureMealResponse getById(Long id, User user) {
        FutureMeal meal = findById(id);
        checkAccess(meal, user);
        return toResponse(meal);
    }

    @Transactional
    public FutureMealResponse update(Long id, User user, FutureMealRequest req) {
        FutureMeal meal = findById(id);
        checkAccess(meal, user);

        if (!List.of(FutureMealStatus.PLANNED, FutureMealStatus.MATCH_FOUND, FutureMealStatus.POSTPONED)
                .contains(meal.getStatus())) {
            throw new BadRequestException("Cannot modify a FutureMeal in status: " + meal.getStatus());
        }

        if (req.getDescription() != null) meal.setDescription(req.getDescription());
        if (req.getPlannedDate() != null) meal.setPlannedDate(req.getPlannedDate());
        if (req.getPlannedTime() != null) meal.setPlannedTime(req.getPlannedTime());
        if (req.getMaxBudget() != null) meal.setMaxBudget(req.getMaxBudget());
        if (req.getCuisine() != null) meal.setCuisine(req.getCuisine());
        if (req.getDietaryPreference() != null) meal.setDietaryPreference(req.getDietaryPreference());
        if (req.getSpicePreference() != null) meal.setSpicePreference(req.getSpicePreference());
        if (req.getSpecialConditions() != null) meal.setSpecialConditions(req.getSpecialConditions());

        // Reset recommendation when plan changes
        meal.setStatus(FutureMealStatus.PLANNED);
        meal.setRecommendedFoodItem(null);
        meal.setRecommendedRestaurant(null);
        meal.setRecommendationScore(null);

        return toResponse(futureMealRepository.save(meal));
    }

    @Transactional
    public FutureMealResponse cancel(Long id, User user) {
        FutureMeal meal = findById(id);
        checkAccess(meal, user);

        if (meal.getStatus() == FutureMealStatus.ORDERED) {
            throw new BadRequestException("Cannot cancel an already ordered FutureMeal");
        }
        meal.setStatus(FutureMealStatus.CANCELLED);
        meal.setCancelledAt(LocalDateTime.now());
        return toResponse(futureMealRepository.save(meal));
    }

    @Transactional
    public FutureMealResponse postpone(Long id, User user, LocalDate newDate, LocalTime newTime) {
        FutureMeal meal = findById(id);
        checkAccess(meal, user);

        meal.setPlannedDate(newDate);
        meal.setPlannedTime(newTime);
        meal.setStatus(FutureMealStatus.POSTPONED);
        meal.setPostponedAt(LocalDateTime.now());
        meal.setRecommendedFoodItem(null);
        meal.setRecommendedRestaurant(null);
        return toResponse(futureMealRepository.save(meal));
    }

    @Transactional
    public FutureMealResponse evaluate(Long id, User user) {
        FutureMeal meal = findById(id);
        checkAccess(meal, user);

        if (!List.of(FutureMealStatus.PLANNED, FutureMealStatus.MATCH_FOUND, FutureMealStatus.POSTPONED)
                .contains(meal.getStatus())) {
            throw new BadRequestException("Cannot evaluate FutureMeal in status: " + meal.getStatus());
        }
        return toResponse(runEvaluation(meal));
    }

    @Transactional
    public OrderResponse orderFutureMeal(Long id, User user, PaymentMethod paymentMethod) {
        FutureMeal meal = findById(id);
        checkAccess(meal, user);

        if (meal.getStatus() != FutureMealStatus.READY) {
            throw new BadRequestException("FutureMeal is not ready. Current status: " + meal.getStatus());
        }
        if (meal.getRecommendedFoodItem() == null) {
            throw new BadRequestException("No recommendation available yet");
        }

        // Add recommended item to cart
        CartItemRequest cartReq = new CartItemRequest();
        cartReq.setFoodItemId(meal.getRecommendedFoodItem().getId());
        cartReq.setQuantity(1);
        cartService.addItem(user, cartReq);

        // Place order
        OrderRequest orderReq = new OrderRequest();
        orderReq.setAddressId(meal.getDeliveryAddress().getId());
        orderReq.setPaymentMethod(paymentMethod);
        OrderResponse orderResponse = orderService.placeOrder(user, orderReq);

        meal.setStatus(FutureMealStatus.ORDERED);
        meal.setOrderedAt(LocalDateTime.now());
        meal.setOrderId(orderResponse.getId());
        futureMealRepository.save(meal);

        return orderResponse;
    }

    @Transactional
    public void delete(Long id, User user) {
        FutureMeal meal = findById(id);
        checkAccess(meal, user);
        futureMealRepository.delete(meal);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Scheduled evaluation — every 5 minutes, evaluates upcoming FutureMeals
    // ─────────────────────────────────────────────────────────────────────────

    @Scheduled(fixedDelay = 300000, initialDelay = 60000)
    @Transactional
    public void scheduledEvaluation() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        LocalTime windowEnd = now.plusMinutes(35);

        List<FutureMeal> due = futureMealRepository.findDueForEvaluation(today, now, windowEnd);
        if (!due.isEmpty()) {
            log.info("Scheduled FutureMeal evaluation: {} candidates", due.size());
        }

        due.forEach(meal -> {
            try {
                runEvaluation(meal);
            } catch (Exception e) {
                log.error("Error evaluating FutureMeal {}: {}", meal.getId(), e.getMessage());
            }
        });

        // Expire overdue meals
        futureMealRepository.findExpired(today).forEach(meal -> {
            if (meal.getStatus() != FutureMealStatus.CANCELLED
                    && meal.getStatus() != FutureMealStatus.ORDERED) {
                meal.setStatus(FutureMealStatus.EXPIRED);
                futureMealRepository.save(meal);
                log.info("Marked FutureMeal {} as EXPIRED", meal.getId());
            }
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Core evaluation logic
    // ─────────────────────────────────────────────────────────────────────────

    private FutureMeal runEvaluation(FutureMeal meal) {
        // Get candidates: food items within budget + dietary preferences
        com.futuremeal.entity.enums.DietaryType dietaryType = toDietaryType(meal.getDietaryPreference());

        List<FoodItem> candidates = foodItemRepository.findByBudgetAndPreferences(
                meal.getMaxBudget() * 1.2,
                dietaryType,
                meal.getSpicePreference(),
                PageRequest.of(0, 50)
        ).stream()
                .filter(f -> f.getRestaurant().isOpen() && f.isAvailable())
                .collect(Collectors.toList());

        if (candidates.isEmpty()) {
            log.debug("No candidates for FutureMeal {}", meal.getId());
            return meal;
        }

        // Try AI first; fall back to deterministic engine
        Optional<RecommendationEngine.RecommendationResult> result = Optional.empty();

        if (aiService.isEnabled()) {
            result = aiService.generateMealRecommendation(meal, candidates)
                    .map(ar -> new RecommendationEngine.RecommendationResult(
                            ar.foodItem(),
                            ar.foodItem().getRestaurant(),
                            ar.score(),
                            ar.explanation(),
                            true));
        }

        if (result.isEmpty()) {
            result = recommendationEngine.recommend(meal, candidates);
        }

        result.ifPresent(r -> {
            meal.setRecommendedFoodItem(r.foodItem());
            meal.setRecommendedRestaurant(r.restaurant());
            meal.setRecommendationScore(r.score());
            meal.setRecommendationReason(r.reason());
            meal.setAIRecommended(r.isAIGenerated());

            // READY if within 30-min window, MATCH_FOUND otherwise
            LocalDateTime plannedDateTime = LocalDateTime.of(meal.getPlannedDate(), meal.getPlannedTime());
            boolean isNearby = LocalDateTime.now().isAfter(plannedDateTime.minusMinutes(30));

            if (isNearby) {
                meal.setStatus(FutureMealStatus.READY);
                meal.setReadyAt(LocalDateTime.now());
            } else {
                meal.setStatus(FutureMealStatus.MATCH_FOUND);
                meal.setMatchFoundAt(LocalDateTime.now());
            }

            log.info("FutureMeal {} → {} | Food: '{}' | Score: {}",
                    meal.getId(), meal.getStatus(), r.foodItem().getName(), r.score());
        });

        return futureMealRepository.save(meal);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private com.futuremeal.entity.enums.DietaryType toDietaryType(
            com.futuremeal.entity.enums.DietaryPreference pref) {
        if (pref == null) return null;
        return switch (pref) {
            case VEG -> com.futuremeal.entity.enums.DietaryType.VEG;
            case VEGAN -> com.futuremeal.entity.enums.DietaryType.VEGAN;
            case JAIN -> com.futuremeal.entity.enums.DietaryType.JAIN;
            case NON_VEG -> null; // null = no dietary filter for non-veg
        };
    }

    private void checkAccess(FutureMeal meal, User user) {
        if (!meal.getUser().getId().equals(user.getId())
                && !user.getRole().name().equals("ADMIN")) {
            throw new UnauthorizedException("Access denied");
        }
    }

    private FutureMeal findById(Long id) {
        return futureMealRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FutureMeal", id));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Mapper
    // ─────────────────────────────────────────────────────────────────────────

    public FutureMealResponse toResponse(FutureMeal fm) {
        DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

        FutureMealResponse.AddressInfo addrInfo = null;
        if (fm.getDeliveryAddress() != null) {
            Address a = fm.getDeliveryAddress();
            addrInfo = FutureMealResponse.AddressInfo.builder()
                    .id(a.getId()).label(a.getLabel()).street(a.getStreet())
                    .area(a.getArea()).city(a.getCity()).pincode(a.getPincode())
                    .build();
        }

        FoodItemResponse foodResp = null;
        if (fm.getRecommendedFoodItem() != null) {
            FoodItem f = fm.getRecommendedFoodItem();
            foodResp = FoodItemResponse.builder()
                    .id(f.getId()).name(f.getName()).description(f.getDescription())
                    .image(f.getImage()).price(f.getPrice()).category(f.getCategory())
                    .restaurantId(f.getRestaurant().getId())
                    .restaurantName(f.getRestaurant().getName())
                    .dietaryType(f.getDietaryType()).spiceLevel(f.getSpiceLevel())
                    .rating(f.getRating()).preparationTime(f.getPreparationTime())
                    .isAvailable(f.isAvailable()).isBestseller(f.isBestseller())
                    .build();
        }

        RestaurantResponse restResp = null;
        if (fm.getRecommendedRestaurant() != null) {
            Restaurant r = fm.getRecommendedRestaurant();
            restResp = RestaurantResponse.builder()
                    .id(r.getId()).name(r.getName()).logo(r.getLogo())
                    .cuisines(r.getCuisines()).rating(r.getRating())
                    .totalReviews(r.getTotalReviews()).deliveryTime(r.getDeliveryTime())
                    .deliveryFee(r.getDeliveryFee()).isOpen(r.isOpen())
                    .build();
        }

        return FutureMealResponse.builder()
                .id(fm.getId())
                .userId(fm.getUser().getId())
                .description(fm.getDescription())
                .plannedDate(fm.getPlannedDate() != null ? fm.getPlannedDate().toString() : null)
                .plannedTime(fm.getPlannedTime() != null ? fm.getPlannedTime().toString() : null)
                .maxBudget(fm.getMaxBudget())
                .cuisine(fm.getCuisine())
                .dietaryPreference(fm.getDietaryPreference())
                .spicePreference(fm.getSpicePreference())
                .preferredRestaurantId(fm.getPreferredRestaurant() != null
                        ? fm.getPreferredRestaurant().getId() : null)
                .preferredRestaurantName(fm.getPreferredRestaurant() != null
                        ? fm.getPreferredRestaurant().getName() : null)
                .deliveryAddress(addrInfo)
                .specialConditions(fm.getSpecialConditions())
                .status(fm.getStatus())
                .recommendedFoodItem(foodResp)
                .recommendedRestaurant(restResp)
                .recommendationScore(fm.getRecommendationScore())
                .recommendationReason(fm.getRecommendationReason())
                .isAIRecommended(fm.isAIRecommended())
                .orderId(fm.getOrderId())
                .createdAt(fm.getCreatedAt() != null ? fm.getCreatedAt().format(fmt) : null)
                .updatedAt(fm.getUpdatedAt() != null ? fm.getUpdatedAt().format(fmt) : null)
                .build();
    }
}
