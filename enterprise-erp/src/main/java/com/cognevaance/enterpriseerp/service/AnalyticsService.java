
package com.cognevaance.enterpriseerp.service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.math.BigDecimal;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.cognevaance.enterpriseerp.repository.EmployeeRepository;
import com.cognevaance.enterpriseerp.repository.ProductRepository;
import com.cognevaance.enterpriseerp.repository.SaleRepository;

@Service
public class AnalyticsService {

    private final EmployeeRepository employeeRepository;
    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;
    private final FinanceTransactionService financeService;

    public AnalyticsService(
            EmployeeRepository employeeRepository,
            ProductRepository productRepository,
            SaleRepository saleRepository,
            FinanceTransactionService financeService) {
        this.employeeRepository = employeeRepository;
        this.productRepository = productRepository;
        this.saleRepository = saleRepository;
        this.financeService = financeService;
    }

    public Map<String, Object> getDashboardAnalytics() {

        BigDecimal totalRevenue = saleRepository.findAll()
                .stream()
                .map(sale -> sale.getTotalAmount() == null
                        ? BigDecimal.ZERO : sale.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
                "totalEmployees", employeeRepository.count(),
                "totalProducts", productRepository.count(),
                "totalSales", saleRepository.count(),
                "totalRevenue", totalRevenue,
                "totalIncome", financeService.getTotalIncome(),
                "totalExpenses", financeService.getTotalExpenses(),
                "netBalance", financeService.getNetBalance()
        );
    }

public List<Map<String, Object>> getRevenueHistory() {
    LocalDate today = LocalDate.now();
    LocalDate startDate = today.minusMonths(5)
            .withDayOfMonth(1);

    LocalDateTime start = startDate.atStartOfDay();
    LocalDateTime end = today.plusDays(1).atStartOfDay();

    List<Map<String, Object>> history = new ArrayList<>();

    DateTimeFormatter formatter =
            DateTimeFormatter.ofPattern("MMM");

    for (int i = 0; i < 6; i++) {
        LocalDate month = startDate.plusMonths(i);
        history.add(Map.of(
                "period", month.format(formatter),
                "revenue", BigDecimal.ZERO
        ));
    }

    Map<String, BigDecimal> monthlyTotals = new LinkedHashMap<>();

    for (Map<String, Object> item : history) {
        monthlyTotals.put(
                (String) item.get("period"),
                (BigDecimal) item.get("revenue")
        );
    }

    saleRepository
            .findBySaleDateGreaterThanEqualAndSaleDateLessThan(start, end)
            .forEach(sale -> {
                if (sale.getSaleDate() != null) {
                    String period = sale.getSaleDate()
                            .format(formatter);

                    if (monthlyTotals.containsKey(period)) {
                        monthlyTotals.merge(
                                period,
                                sale.getTotalAmount() == null
                                        ? BigDecimal.ZERO
                                        : sale.getTotalAmount(),
                                BigDecimal::add
                        );
                    }
                }
            });

    for (int i = 0; i < history.size(); i++) {
        String period = (String) history.get(i).get("period");

        history.set(i, Map.of(
                "period", period,
                "revenue", monthlyTotals.get(period)
        ));
    }

    return history;
}

public List<Map<String, Object>> getSalesHistory() {
    LocalDate today = LocalDate.now();
    LocalDate startDate = today.minusMonths(5)
            .withDayOfMonth(1);

    LocalDateTime start = startDate.atStartOfDay();
    LocalDateTime end = today.plusDays(1).atStartOfDay();

    DateTimeFormatter formatter =
            DateTimeFormatter.ofPattern("MMM");

    Map<String, Integer> monthlyCounts = new LinkedHashMap<>();

    for (int i = 0; i < 6; i++) {
        monthlyCounts.put(
                startDate.plusMonths(i).format(formatter),
                0
        );
    }

    saleRepository
            .findBySaleDateGreaterThanEqualAndSaleDateLessThan(start, end)
            .forEach(sale -> {
                if (sale.getSaleDate() != null) {
                    String period = sale.getSaleDate()
                            .format(formatter);

                    if (monthlyCounts.containsKey(period)) {
                        monthlyCounts.merge(period, 1, Integer::sum);
                    }
                }
            });

    List<Map<String, Object>> history = new ArrayList<>();

    monthlyCounts.forEach((period, count) ->
            history.add(Map.of(
                    "period", period,
                    "sales", count
            ))
    );

    return history;
}

}
