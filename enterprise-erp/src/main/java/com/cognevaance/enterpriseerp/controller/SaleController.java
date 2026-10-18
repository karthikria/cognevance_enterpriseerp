
package com.cognevaance.enterpriseerp.controller;

import com.cognevaance.enterpriseerp.entity.Sale;
import com.cognevaance.enterpriseerp.service.SaleService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    public static class SaleRequest {

        @NotNull
        private Long productId;

        @Min(1)
        private int quantity;

        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }
    }

    @GetMapping
    public List<Sale> getAllSales() {
        return saleService.getAllSales();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Sale createSale(
            @Valid @RequestBody SaleRequest request) {
        return saleService.createSale(
                request.getProductId(),
                request.getQuantity());
    }
}
