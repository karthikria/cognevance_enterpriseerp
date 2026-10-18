
package com.cognevaance.enterpriseerp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cognevaance.enterpriseerp.entity.FinanceTransaction;

public interface FinanceTransactionRepository
        extends JpaRepository<FinanceTransaction, Long> {

    List<FinanceTransaction> findByType(String type);

    List<FinanceTransaction> findByCategoryIgnoreCase(String category);
}
