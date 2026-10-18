
package com.cognevaance.enterpriseerp.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cognevaance.enterpriseerp.entity.FinanceTransaction;
import com.cognevaance.enterpriseerp.repository.FinanceTransactionRepository;

@Service
public class FinanceTransactionService {

    private final FinanceTransactionRepository repository;

    public FinanceTransactionService(
            FinanceTransactionRepository repository) {
        this.repository = repository;
    }

    public List<FinanceTransaction> getAllTransactions() {
        return repository.findAll();
    }


public FinanceTransaction getTransactionById(Long id) {
    return repository.findById(id)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Finance transaction not found: " + id));
}

    public List<FinanceTransaction> getTransactionsByType(String type) {
        validateType(type);
        return repository.findByType(type.toUpperCase());
    }

    @Transactional
    public FinanceTransaction createTransaction(
            FinanceTransaction transaction) {

        validateTransaction(transaction);
        transaction.setType(transaction.getType().toUpperCase());

        return repository.save(transaction);
    }

    @Transactional
    public FinanceTransaction updateTransaction(
            Long id, FinanceTransaction updated) {

        FinanceTransaction existing = getTransactionById(id);
        validateTransaction(updated);

        existing.setType(updated.getType().toUpperCase());
        existing.setAmount(updated.getAmount());
        existing.setCategory(updated.getCategory());
        existing.setDescription(updated.getDescription());
        existing.setTransactionDate(updated.getTransactionDate());

        return repository.save(existing);
    }

    @Transactional
    public void deleteTransaction(Long id) {
        FinanceTransaction existing = getTransactionById(id);
        repository.delete(existing);
    }

    public BigDecimal getTotalIncome() {
        return calculateTotal("INCOME");
    }

    public BigDecimal getTotalExpenses() {
        return calculateTotal("EXPENSE");
    }

    public BigDecimal getNetBalance() {
        return getTotalIncome().subtract(getTotalExpenses());
    }

    private BigDecimal calculateTotal(String type) {
        return repository.findByType(type)
                .stream()
                .map(FinanceTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private void validateTransaction(FinanceTransaction transaction) {
        if (transaction == null) {
            throw new IllegalArgumentException(
                    "Transaction data is required");
        }

        validateType(transaction.getType());

        if (transaction.getAmount() == null
                || transaction.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Amount must be greater than zero");
        }

        if (transaction.getCategory() == null
                || transaction.getCategory().isBlank()) {
            throw new IllegalArgumentException(
                    "Category is required");
        }
    }

    private void validateType(String type) {
        if (type == null
                || !(type.equalsIgnoreCase("INCOME")
                || type.equalsIgnoreCase("EXPENSE"))) {
            throw new IllegalArgumentException(
                    "Type must be INCOME or EXPENSE");
        }
    }
}
