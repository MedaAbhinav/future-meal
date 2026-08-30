package com.futuremeal.service.impl;

import com.futuremeal.dto.request.AddressRequest;
import com.futuremeal.dto.response.AddressResponse;
import com.futuremeal.dto.response.AuthResponse;
import com.futuremeal.entity.Address;
import com.futuremeal.entity.User;
import com.futuremeal.entity.enums.DietaryPreference;
import com.futuremeal.entity.enums.SpiceLevel;
import com.futuremeal.exception.BadRequestException;
import com.futuremeal.exception.ResourceNotFoundException;
import com.futuremeal.exception.UnauthorizedException;
import com.futuremeal.repository.AddressRepository;
import com.futuremeal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse.UserResponse getProfile(User user) {
        return AuthServiceImpl.mapToUserResponse(user);
    }

    @Transactional
    public AuthResponse.UserResponse updateProfile(User user, Map<String, Object> updates) {
        if (updates.containsKey("name")) {
            String name = (String) updates.get("name");
            if (name == null || name.trim().length() < 2) throw new BadRequestException("Invalid name");
            user.setName(name.trim());
        }
        if (updates.containsKey("phone")) {
            String phone = (String) updates.get("phone");
            if (phone != null && !phone.matches("^[6-9]\\d{9}$")) {
                throw new BadRequestException("Invalid phone number");
            }
            user.setPhone(phone);
        }
        if (updates.containsKey("dietaryPreference") && updates.get("dietaryPreference") != null) {
            user.setDietaryPreference(DietaryPreference.valueOf((String) updates.get("dietaryPreference")));
        }
        if (updates.containsKey("spicePreference") && updates.get("spicePreference") != null) {
            user.setSpicePreference(SpiceLevel.valueOf((String) updates.get("spicePreference")));
        }
        if (updates.containsKey("budgetPreference")) {
            user.setBudgetPreference((String) updates.get("budgetPreference"));
        }
        return AuthServiceImpl.mapToUserResponse(userRepository.save(user));
    }

    @Transactional
    public void changePassword(User user, String oldPassword, String newPassword) {
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        if (newPassword.length() < 8) throw new BadRequestException("Password too short");
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // ── Addresses ──────────────────────────────────────────────────────────

    public List<AddressResponse> getAddresses(User user) {
        return addressRepository.findByUserOrderByIsDefaultDesc(user)
                .stream().map(this::toAddressResponse).collect(Collectors.toList());
    }

    @Transactional
    public AddressResponse addAddress(User user, AddressRequest req) {
        if (req.isDefault()) {
            // Unset any existing default
            addressRepository.findByUserAndIsDefaultTrue(user)
                    .ifPresent(a -> { a.setDefault(false); addressRepository.save(a); });
        }

        boolean isFirst = addressRepository.countByUser(user) == 0;

        Address address = Address.builder()
                .user(user)
                .label(req.getLabel())
                .street(req.getStreet())
                .area(req.getArea())
                .city(req.getCity())
                .state(req.getState())
                .pincode(req.getPincode())
                .landmark(req.getLandmark())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .isDefault(req.isDefault() || isFirst)
                .build();

        return toAddressResponse(addressRepository.save(address));
    }

    @Transactional
    public AddressResponse updateAddress(User user, Long addressId, AddressRequest req) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        if (!address.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("Access denied");
        }
        address.setLabel(req.getLabel());
        address.setStreet(req.getStreet());
        address.setArea(req.getArea());
        address.setCity(req.getCity());
        address.setState(req.getState());
        address.setPincode(req.getPincode());
        if (req.getLandmark() != null) address.setLandmark(req.getLandmark());
        return toAddressResponse(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(User user, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        if (!address.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("Access denied");
        }
        addressRepository.delete(address);
    }

    @Transactional
    public AddressResponse setDefaultAddress(User user, Long addressId) {
        // Unset current default
        addressRepository.findByUserAndIsDefaultTrue(user)
                .ifPresent(a -> { a.setDefault(false); addressRepository.save(a); });

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        if (!address.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("Access denied");
        }
        address.setDefault(true);
        return toAddressResponse(addressRepository.save(address));
    }

    private AddressResponse toAddressResponse(Address a) {
        return AddressResponse.builder()
                .id(a.getId()).label(a.getLabel()).street(a.getStreet())
                .area(a.getArea()).city(a.getCity()).state(a.getState())
                .pincode(a.getPincode()).landmark(a.getLandmark())
                .latitude(a.getLatitude()).longitude(a.getLongitude())
                .isDefault(a.isDefault())
                .build();
    }
}
