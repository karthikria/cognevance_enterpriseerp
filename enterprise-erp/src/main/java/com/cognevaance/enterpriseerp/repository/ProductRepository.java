
package com.cognevaance.enterpriseerp.repository;

import com.cognevaance.enterpriseerp.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository
        extends JpaRepository<Product, Long> {
}
