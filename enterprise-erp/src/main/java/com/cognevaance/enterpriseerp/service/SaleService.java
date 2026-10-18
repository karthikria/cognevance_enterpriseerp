
package com.cognevaance.enterpriseerp.service;

import com.cognevaance.enterpriseerp.entity.Product;
import com.cognevaance.enterpriseerp.entity.Sale;
import com.cognevaance.enterpriseerp.repository.ProductRepository;
import com.cognevaance.enterpriseerp.repository.SaleRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;

    public SaleService(
            SaleRepository saleRepository,
            ProductRepository productRepository) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
    }

    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }

    @Transactional
    public Sale createSale(Long productId, int quantity) {

        if (quantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than zero");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                    new RuntimeException(
                            "Product not found: " + productId));

        if (product.getQuantity() < quantity) {
            throw new IllegalArgumentException(
                    "Insufficient stock available");
        }

        BigDecimal unitPrice = product.getPrice();

        if (unitPrice == null || unitPrice.signum() < 0) {
            throw new IllegalStateException(
                    "Product price is invalid");
        }

        BigDecimal totalAmount = unitPrice.multiply(
                BigDecimal.valueOf(quantity));

        product.setQuantity(product.getQuantity() - quantity);
        productRepository.save(product);

        Sale sale = new Sale();
        sale.setProduct(product);
        sale.setQuantity(quantity);
        sale.setUnitPrice(unitPrice);
        sale.setTotalAmount(totalAmount);
        sale.setSaleDate(LocalDateTime.now());

        return saleRepository.save(sale);
    }
}
