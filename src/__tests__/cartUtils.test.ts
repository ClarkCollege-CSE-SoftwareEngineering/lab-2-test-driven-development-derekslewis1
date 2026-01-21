import { describe, it, expect } from "vitest";
import { applyDiscount, calculateTax, calculateTotal, CartItem } from "../cartUtils.js";

describe("applyDiscount", () => {
  it("applies a percentage discount to a price", () => {
    expect(applyDiscount(100, 10)).toBe(90);
  });

  it("returns the original price when discount is 0%", () => {
    expect(applyDiscount(50, 0)).toBe(50);
  });

  it("returns 0 when discount is 100%", () => {
    expect(applyDiscount(75, 100)).toBe(0);
  });

  it("handles decimal prices correctly", () => {
    expect(applyDiscount(19.99, 10)).toBeCloseTo(17.99, 2);
  });

  it("throws an error for negative prices", () => {
    expect(() => applyDiscount(-10, 10)).toThrow("Price cannot be negative");
  });

  it("throws an error for negative discount percentages", () => {
    expect(() => applyDiscount(100, -5)).toThrow("Discount cannot be negative");
  });

  it("throws an error for discount greater than 100%", () => {
    expect(() => applyDiscount(100, 150)).toThrow(
      "Discount cannot exceed 100%"
    );
  });
});

describe("calculateTax", () => {
  it("calculates tax on a price", () => {
    expect(calculateTax(100, 8.5)).toBeCloseTo(8.5, 2);
  });

  it("returns 0 tax when rate is 0%", () => {
    expect(calculateTax(50, 0)).toBe(0);
  });

  it("handles decimal prices correctly", () => {
    expect(calculateTax(19.99, 10)).toBeCloseTo(2.0, 2); // works for our rounding already
  });

  it("returns 0 tax when item is tax-exempt", () => {
    expect(calculateTax(100, 8.5, true)).toBe(0);
  });

  it("throws an error for negative prices", () => {
    expect(() => calculateTax(-10, 8.5)).toThrow("Price cannot be negative");
  });

  it("throws an error for negative tax rates", () => {
    expect(() => calculateTax(100, -5)).toThrow("Tax rate cannot be negative");
  });
});

describe("calculateTotal", () => {
  // TODO: Add at least 6 test cases
  // Consider: single item, multiple items, discounts, tax-exempt items,
  // empty cart, mixed tax-exempt and taxable items

  // test for single item
  it("calculates totals for a single item", () => {
    expect(calculateTotal([{ price:20, quantity: 1}
    ])).toStrictEqual({
	    subtotal: 20,
	    discount: 0,
	    tax: 0,
	    total: 20,
    });
  });

  // test for multiple items
  it("calculates totals for multiple items", () => {
    expect(calculateTotal([
	    {price: 20, quantity: 1},
	    {price: 40, quantity: 1}
    ])).toStrictEqual({
		subtotal: 60,
		discount: 0,
		tax: 0,
		total: 60,
    });
  });

  // test discounts
  it("applies discount before calculating tax", () => {
    
    expect(calculateTotal([{price: 20, quantity: 1, isTaxExempt: false}
    ], 10, 10)).toStrictEqual({
      subtotal: 20,
      discount: 2,  // 10% of 20
      tax: 1.80,    // 10% of 18 so 1.80 (after discount)
      total: 19.80 // should be 18 + 1.80 = 19.80
    });
  });

  // test tax
  it("excludes tax-exempt items from tax calculation", () => {
    expect(calculateTotal([{price: 20, quantity: 1, isTaxExempt: true}
    ], 0, 10)).toStrictEqual({
      subtotal: 20,
      discount: 0,
      tax: 0,  // Should be 0 because item is tax exempt
      total: 20
    });
  });

  // test empty cart
  it("reacts to empty cart correctly", () => {
    expect(calculateTotal([])).toStrictEqual({
	subtotal: 0,
	discount: 0,
	tax: 0,
	total: 0
    });	
  });

  // test mix of tax exempt, no tax
  it("can handle a mix of tax exempt / non tax exempt items", () => {
    expect(calculateTotal([
      {price: 20, quantity: 1, isTaxExempt: true},   // tax exempt item
      {price: 30, quantity: 1, isTaxExempt: false}  // taxable item
    ], 0, 10)).toStrictEqual({
      subtotal: 50,      // 20 + 30 should give us a 50 subtotal
      discount: 0,
      tax: 3,            // 10% tax only on the $30 item so + $3.
      total: 53          // 50 + 3 = 53 expected
    });
  });
});

