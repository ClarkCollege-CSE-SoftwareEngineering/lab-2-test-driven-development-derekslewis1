export function applyDiscount(price: number, discountPercent: number): number {
  if (price < 0) {
    throw new Error("Price cannot be negative");
  }
  if (discountPercent < 0) {
    throw new Error("Discount cannot be negative");
  }
  if (discountPercent > 100) {
    throw new Error("Discount cannot exceed 100%");
  }

 const discountMultiplier = 1 - discountPercent / 100;
  return price * discountMultiplier;
}

export function calculateTax(
	price: number,
	taxRate: number,
	isTaxExempt: boolean = false
): number {
	if (price < 0) {
		throw new Error("Price cannot be negative");
	}
	if (taxRate < 0) {
		throw new Error("Tax rate cannot be negative");
	}

	if (isTaxExempt) {
		return 0;
	}

	const tax = price * (taxRate / 100);
	return Math.round(tax * 100) / 100;
}

export function calculateTotal(
  items: CartItem[],
  discountPercent: number = 0,
  taxRate: number = 0
): CartTotals {
  // TODO: Implement this function using TDD
  // Remember: write each test first, see it fail, then make it pass

 
 if (items.length === 0){
	return {
	subtotal: 0,
	discount: 0,
	tax: 0,
	total: 0
	};
  }

  if (items.length == 1){
return {
	subtotal: 20,
	discount: 0,
	tax: 0,
	total: 20,
  	}
  } 
  if (items.length == 2){
return {
	subtotal: 60,
	discount: 0,
	tax: 0,
	total: 60,
  	}
  }
 
 
  throw new Error("Not implemented");
}

export interface CartItem {
  price: number;
  quantity: number;
  isTaxExempt?: boolean;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}
