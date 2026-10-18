
package com.cognevaance.enterpriseerp.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.cognevaance.enterpriseerp.entity.FinanceTransaction;
import com.cognevaance.enterpriseerp.service.FinanceTransactionService;

@RestController
@RequestMapping("/api/finance")
public class FinanceController {

    private final FinanceTransactionService service;

    public FinanceController(FinanceTransactionService service) {
        this.service = service;
    }

    @GetMapping
    public List<FinanceTransaction> getAllTransactions(
            @RequestParam(required = false) String type) {
        try {
            if (type != null && !type.isBlank()) {
                return service.getTransactionsByType(type);
            }
            return service.getAllTransactions();
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    @GetMapping("/{id}")
    public FinanceTransaction getTransaction(@PathVariable Long id) {
        try {
            return service.getTransactionById(id);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, ex.getMessage());
        }
    }

    @PostMapping
    @org.springframework.web.bind.annotation.ResponseStatus(
            HttpStatus.CREATED)
    public FinanceTransaction createTransaction(
            @RequestBody FinanceTransaction transaction) {
        try {
            return service.createTransaction(transaction);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    @PutMapping("/{id}")
    public FinanceTransaction updateTransaction(
            @PathVariable Long id,
            @RequestBody FinanceTransaction transaction) {
        try {
            return service.updateTransaction(id, transaction);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @org.springframework.web.bind.annotation.ResponseStatus(
            HttpStatus.NO_CONTENT)
    public void deleteTransaction(@PathVariable Long id) {
        try {
            service.deleteTransaction(id);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, ex.getMessage());
        }
    }

    @GetMapping("/summary")
    public Map<String, BigDecimal> getFinanceSummary() {
        return Map.of(
                "totalIncome", service.getTotalIncome(),
                "totalExpenses", service.getTotalExpenses(),
                "netBalance", service.getNetBalance()
        );
    }
}
