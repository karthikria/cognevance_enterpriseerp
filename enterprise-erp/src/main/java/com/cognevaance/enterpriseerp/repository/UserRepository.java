
package com.cognevaance.enterpriseerp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cognevaance.enterpriseerp.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
}
