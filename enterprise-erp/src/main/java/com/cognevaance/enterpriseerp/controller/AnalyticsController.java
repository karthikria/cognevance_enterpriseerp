
package com.cognevaance.enterpriseerp.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cognevaance.enterpriseerp.service.AnalyticsService;

import java.util.List;
//import java.util.Map;
//import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboardAnalytics() {
        return analyticsService.getDashboardAnalytics();
    }
    @GetMapping("/revenue-history")
    public List<Map<String, Object>> getRevenueHistory() {
        return analyticsService.getRevenueHistory();
    }

    @GetMapping("/sales-history")
    public List<Map<String, Object>> getSalesHistory() {
        return analyticsService.getSalesHistory();
    }
    
}
