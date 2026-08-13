package com.futuremeal.service.impl;

import com.futuremeal.dto.request.RestaurantRequest;
import com.futuremeal.dto.response.RestaurantResponse;
import com.futuremeal.entity.Restaurant;
import com.futuremeal.entity.User;
import com.futuremeal.entity.enums.RestaurantStatus;
import com.futuremeal.exception.BadRequestException;
import com.futuremeal.exception.ConflictException;
import com.futuremeal.exception.ResourceNotFoundException;
import com.futuremeal.exception.UnauthorizedException;
import com.futuremeal.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantServiceImpl {

    private final RestaurantRepository restaurantRepository;

    public List<RestaurantResponse> getAllActive(String city, String cuisine, String sortBy) {
        List<Restaurant> restaurants;
        if (cuisine != null && !cuisine.isBlank()) {
            restaurants = restaurantRepository.findByCuisine(cuisine,
                    PageRequest.of(0, 50, Sort.by("rating").descending()));
        } else if (city != null && !city.isBlank()) {
            restaurants = restaurantRepository.findActiveByCity(city,
                    PageRequest.of(0, 50, Sort.by("rating").descending()));
        } else {
            restaurants = restaurantRepository.findByStatusAndIsOpenTrue(RestaurantStatus.ACTIVE);
        }
        return restaurants.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public RestaurantResponse getById(Long id) {
        return toResponse(findById(id));
    }

    public List<RestaurantResponse> getFeatured() {
        return restaurantRepository.findFeatured(PageRequest.of(0, 8))
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<RestaurantResponse> getNearby(String city) {
        return restaurantRepository.findActiveByCity(city, PageRequest.of(0, 10))
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<RestaurantResponse> search(String query) {
        return restaurantRepository.searchByQuery(query)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public RestaurantResponse createRestaurant(RestaurantRequest req, User owner) {
        if (restaurantRepository.existsByOwner(owner)) {
            throw new ConflictException("You already have a registered restaurant. Contact admin to add another.");
        }
        Restaurant restaurant = buildFromRequest(req, owner);
        restaurant.setStatus(RestaurantStatus.PENDING_APPROVAL);
        return toResponse(restaurantRepository.save(restaurant));
    }

    @Transactional
    public RestaurantResponse updateRestaurant(Long id, RestaurantRequest req, User owner) {
        Restaurant restaurant = findById(id);
        validateOwnership(restaurant, owner);
        updateFromRequest(restaurant, req);
        return toResponse(restaurantRepository.save(restaurant));
    }

    @Transactional
    public RestaurantResponse toggleStatus(Long id, boolean isOpen, User owner) {
        Restaurant restaurant = findById(id);
        validateOwnership(restaurant, owner);
        restaurant.setOpen(isOpen);
        return toResponse(restaurantRepository.save(restaurant));
    }

    public RestaurantResponse getMyRestaurant(User owner) {
        return restaurantRepository.findByOwner(owner)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("No restaurant found for your account"));
    }

    public Restaurant findById(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", id));
    }

    // Admin operations
    @Transactional
    public RestaurantResponse approve(Long id) {
        Restaurant r = findById(id);
        r.setStatus(RestaurantStatus.ACTIVE);
        return toResponse(restaurantRepository.save(r));
    }

    @Transactional
    public RestaurantResponse suspend(Long id, String reason) {
        Restaurant r = findById(id);
        r.setStatus(RestaurantStatus.SUSPENDED);
        return toResponse(restaurantRepository.save(r));
    }

    private void validateOwnership(Restaurant restaurant, User owner) {
        if (owner.getRole().name().equals("ADMIN")) return;
        if (restaurant.getOwner() == null || !restaurant.getOwner().getId().equals(owner.getId())) {
            throw new UnauthorizedException("You do not own this restaurant");
        }
    }

    private Restaurant buildFromRequest(RestaurantRequest req, User owner) {
        return Restaurant.builder()
                .name(req.getName())
                .description(req.getDescription())
                .coverImage(req.getCoverImage())
                .logo(req.getLogo())
                .cuisines(req.getCuisines())
                .deliveryTime(req.getDeliveryTime())
                .deliveryFee(req.getDeliveryFee())
                .minimumOrder(req.getMinimumOrder())
                .street(req.getStreet())
                .area(req.getArea())
                .city(req.getCity())
                .state(req.getState())
                .pincode(req.getPincode())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .offers(req.getOffers() != null ? req.getOffers() : List.of())
                .tags(req.getTags() != null ? req.getTags() : List.of())
                .owner(owner)
                .isOpen(true)
                .build();
    }

    private void updateFromRequest(Restaurant r, RestaurantRequest req) {
        if (req.getName() != null) r.setName(req.getName());
        if (req.getDescription() != null) r.setDescription(req.getDescription());
        if (req.getCoverImage() != null) r.setCoverImage(req.getCoverImage());
        if (req.getLogo() != null) r.setLogo(req.getLogo());
        if (req.getCuisines() != null) r.setCuisines(req.getCuisines());
        if (req.getDeliveryTime() != null) r.setDeliveryTime(req.getDeliveryTime());
        if (req.getDeliveryFee() != null) r.setDeliveryFee(req.getDeliveryFee());
        if (req.getMinimumOrder() != null) r.setMinimumOrder(req.getMinimumOrder());
        if (req.getOffers() != null) r.setOffers(req.getOffers());
        if (req.getTags() != null) r.setTags(req.getTags());
    }

    public RestaurantResponse toResponse(Restaurant r) {
        return RestaurantResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .description(r.getDescription())
                .coverImage(r.getCoverImage())
                .logo(r.getLogo())
                .cuisines(r.getCuisines())
                .rating(r.getRating())
                .totalReviews(r.getTotalReviews())
                .deliveryTime(r.getDeliveryTime())
                .deliveryFee(r.getDeliveryFee())
                .minimumOrder(r.getMinimumOrder())
                .address(RestaurantResponse.AddressInfo.builder()
                        .street(r.getStreet()).area(r.getArea()).city(r.getCity())
                        .state(r.getState()).pincode(r.getPincode())
                        .latitude(r.getLatitude()).longitude(r.getLongitude())
                        .build())
                .isOpen(r.isOpen())
                .status(r.getStatus())
                .offers(r.getOffers())
                .tags(r.getTags())
                .ownerId(r.getOwner() != null ? r.getOwner().getId() : null)
                .build();
    }
}
