package com.futuremeal.service.impl;

import com.futuremeal.dto.request.FoodItemRequest;
import com.futuremeal.dto.response.FoodItemResponse;
import com.futuremeal.entity.FoodItem;
import com.futuremeal.entity.Restaurant;
import com.futuremeal.entity.User;
import com.futuremeal.exception.ResourceNotFoundException;
import com.futuremeal.exception.UnauthorizedException;
import com.futuremeal.repository.FoodItemRepository;
import com.futuremeal.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FoodItemServiceImpl {

    private final FoodItemRepository foodItemRepository;
    private final RestaurantRepository restaurantRepository;

    public List<FoodItemResponse> getByRestaurant(Long restaurantId) {
        Restaurant restaurant = findRestaurant(restaurantId);
        return foodItemRepository.findByRestaurantAndIsAvailableTrue(restaurant)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<FoodItemResponse> getAllByRestaurant(Long restaurantId) {
        Restaurant restaurant = findRestaurant(restaurantId);
        return foodItemRepository.findByRestaurantOrderByPopularity(restaurant)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public FoodItemResponse getById(Long id) {
        return toResponse(findById(id));
    }

    public List<FoodItemResponse> search(String query) {
        return foodItemRepository.searchFoods(query)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<FoodItemResponse> getPopular() {
        return foodItemRepository.findPopular(PageRequest.of(0, 12))
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<FoodItemResponse> getByCuisine(String cuisine) {
        return foodItemRepository.findByCuisine(cuisine, PageRequest.of(0, 20))
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public FoodItemResponse create(FoodItemRequest req, User owner) {
        Restaurant restaurant = restaurantRepository.findByOwner(owner)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found for your account"));
        FoodItem item = buildFromRequest(req, restaurant);
        return toResponse(foodItemRepository.save(item));
    }

    @Transactional
    public FoodItemResponse update(Long id, FoodItemRequest req, User owner) {
        FoodItem item = findById(id);
        validateOwnership(item, owner);
        updateFromRequest(item, req);
        return toResponse(foodItemRepository.save(item));
    }

    @Transactional
    public void delete(Long id, User owner) {
        FoodItem item = findById(id);
        validateOwnership(item, owner);
        foodItemRepository.delete(item);
    }

    @Transactional
    public FoodItemResponse toggleAvailability(Long id, boolean isAvailable, User owner) {
        FoodItem item = findById(id);
        validateOwnership(item, owner);
        item.setAvailable(isAvailable);
        return toResponse(foodItemRepository.save(item));
    }

    public FoodItem findById(Long id) {
        return foodItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item", id));
    }

    private Restaurant findRestaurant(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", id));
    }

    private void validateOwnership(FoodItem item, User owner) {
        if (owner.getRole().name().equals("ADMIN")) return;
        if (item.getRestaurant().getOwner() == null
                || !item.getRestaurant().getOwner().getId().equals(owner.getId())) {
            throw new UnauthorizedException("You do not own this food item");
        }
    }

    private FoodItem buildFromRequest(FoodItemRequest req, Restaurant restaurant) {
        return FoodItem.builder()
                .name(req.getName())
                .description(req.getDescription())
                .image(req.getImage())
                .price(req.getPrice())
                .originalPrice(req.getOriginalPrice())
                .category(req.getCategory())
                .restaurant(restaurant)
                .dietaryType(req.getDietaryType())
                .spiceLevel(req.getSpiceLevel())
                .preparationTime(req.getPreparationTime())
                .isAvailable(req.isAvailable())
                .isBestseller(req.isBestseller())
                .isRecommended(req.isRecommended())
                .build();
    }

    private void updateFromRequest(FoodItem item, FoodItemRequest req) {
        if (req.getName() != null) item.setName(req.getName());
        if (req.getDescription() != null) item.setDescription(req.getDescription());
        if (req.getImage() != null) item.setImage(req.getImage());
        if (req.getPrice() != null) item.setPrice(req.getPrice());
        if (req.getOriginalPrice() != null) item.setOriginalPrice(req.getOriginalPrice());
        if (req.getCategory() != null) item.setCategory(req.getCategory());
        if (req.getDietaryType() != null) item.setDietaryType(req.getDietaryType());
        if (req.getSpiceLevel() != null) item.setSpiceLevel(req.getSpiceLevel());
        if (req.getPreparationTime() != null) item.setPreparationTime(req.getPreparationTime());
        item.setAvailable(req.isAvailable());
        item.setBestseller(req.isBestseller());
        item.setRecommended(req.isRecommended());
    }

    public FoodItemResponse toResponse(FoodItem f) {
        return FoodItemResponse.builder()
                .id(f.getId())
                .name(f.getName())
                .description(f.getDescription())
                .image(f.getImage())
                .price(f.getPrice())
                .originalPrice(f.getOriginalPrice())
                .category(f.getCategory())
                .restaurantId(f.getRestaurant().getId())
                .restaurantName(f.getRestaurant().getName())
                .dietaryType(f.getDietaryType())
                .spiceLevel(f.getSpiceLevel())
                .rating(f.getRating())
                .totalReviews(f.getTotalReviews())
                .preparationTime(f.getPreparationTime())
                .isAvailable(f.isAvailable())
                .isBestseller(f.isBestseller())
                .isRecommended(f.isRecommended())
                .build();
    }
}
