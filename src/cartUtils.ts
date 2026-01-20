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
  // Handle empty array for empty cart
  if (items.length === 0) {
    return {
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0
    };
  }

  // calculate subtotal - sum of price * quantity for all items
  let subtotal = 0;
  // loop through items for subtotal
  for (const item of items) {
    subtotal += item.price * item.quantity;
  }

  // apply discount to subtotal
  const subtotalAfterDiscount = applyDiscount(subtotal, discountPercent);
  const discount = subtotal - subtotalAfterDiscount;

  // calculate tax on the discounted amount, but only for non tax exempt items
  // figure out what portion of the discounted amount is taxable
  let taxableSubtotal = 0;
  for (const item of items) {
    if (!item.isTaxExempt) {
      taxableSubtotal += item.price * item.quantity;
    }
  }

  // apply the same discount percentage to the taxable portion
  const taxableAfterDiscount = applyDiscount(taxableSubtotal, discountPercent);
  const tax = calculateTax(taxableAfterDiscount, taxRate, false);

  const total = subtotalAfterDiscount + tax;

 // return object 
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100
  };
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
