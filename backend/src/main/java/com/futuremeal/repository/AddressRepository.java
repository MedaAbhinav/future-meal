package com.futuremeal.repository;

import com.futuremeal.entity.Address;
import com.futuremeal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUserOrderByIsDefaultDesc(User user);
    Optional<Address> findByUserAndIsDefaultTrue(User user);
    long countByUser(User user);
}
