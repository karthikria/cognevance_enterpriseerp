
package com.cognevaance.enterpriseerp.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cognevaance.enterpriseerp.entity.Sale;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    List<Sale> findBySaleDateGreaterThanEqualAndSaleDateLessThan(
            LocalDateTime start,
            LocalDateTime end
    );

}
