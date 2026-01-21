[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/72n2o9cT)
# Lab 2: Test-Driven Development with Vitest

## Week 2 | Testing II (TDD)

## Overview

In this lab, you'll build a shopping cart price calculator using **Test-Driven Development (TDD)**. Rather than writing code first and tests second, you'll practice the Red-Green-Refactor cycle: write a failing test, write just enough code to pass it, then improve your code's design.

This domain—calculating prices, discounts, and taxes—is where TDD truly shines. Getting edge cases wrong in pricing code costs real money, so businesses rely on comprehensive test coverage. By the end of this lab, you'll have a working price calculator with robust tests—and you'll experience how TDD shapes the way you think about code.

**Time Estimate:** 90-120 minutes  
**Prerequisites:** Completion of Lab 1 (Vitest setup), Week 2 readings

> [!IMPORTANT]  
> **Windows Users:** We recommend using **PowerShell** instead of Command Prompt for this lab. PowerShell supports most Unix-style commands. Where commands differ, we provide both versions.

## Learning Objectives

By completing this lab, you will be able to:

1. **Apply** the Red-Green-Refactor cycle to develop functions incrementally
2. **Distinguish** between testing behavior vs. testing implementation details
3. **Write** focused unit tests that verify expected outputs for given inputs
4. **Recognize** when to use test doubles (and when real implementations suffice)
5. **Explain** how TDD influences code design decisions
6. **Achieve** high test coverage through test-first development

## Connection to Readings

This lab directly applies concepts from your Week 2 readings:

### From "Mocks Aren't Stubs" (Martin Fowler)

- **State verification vs. behavior verification:** In this lab, we'll primarily use _state verification_—checking that functions return expected values. Fowler describes this as examining "the state of the SUT [System Under Test] and its collaborators after the method was exercised."
- **Classical TDD approach:** We'll follow the classical TDD style, using real implementations where possible and reserving test doubles for truly awkward dependencies.

### From "Test Double" (Martin Fowler)

- You'll see how simple utility functions rarely need test doubles—they have no external dependencies to isolate.
- This reinforces Fowler's point that dummies, stubs, and mocks serve specific purposes; not every test needs them.

### From "Testing Implementation Details" (Kent C. Dodds)

- We'll write tests that verify _what_ functions do, not _how_ they do it internally.
- If you refactor the implementation, your tests should still pass (that's the goal!).

---

## Part 1: Project Setup (15 minutes)

### Step 1.1: Clone Your Repository

After accepting the GitHub Classroom assignment, you'll have a personal repository. Clone it to your local machine:

```bash
git clone git@github.com:ClarkCollege-CSE-SoftwareEngineering/lab-2-test-driven-development-YOURUSERNAME.git
cd lab-2-test-driven-development-YOURUSERNAME
```

> [!NOTE]
> Replace `YOURUSERNAME` with your actual GitHub username. You can copy the exact clone URL from your repository page on GitHub.

Your cloned repository already contains:

- `README.md` -- These lab instructions
- `.gitignore` -- Pre-configured to ignore `node_modules/`, `dist/`, `coverage/`, etc.
- `.github/workflows/test.yml` -- GitHub Actions workflow for automated testing

### Step 1.2: Initialize the Node.js Project

> [!WARNING]
> The [`npm-init`](https://docs.npmjs.com/cli/v8/commands/npm-init) command below must be run within the root directory of your project.

```bash
npm init -y
```

This creates a `package.json` file. Open it and update it to enable ES modules:

```diff
{
  "name": "lab-2-test-driven-development-YOURUSERNAME",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
-   "test": "echo \"Error: no test specified\" && exit 1"
+   "test": "vitest run",
+   "test:watch": "vitest",
+   "test:coverage": "vitest run --coverage",
+   "build": "tsc"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
- "type": "commonjs"
+ "type": "module"
}
```

### Step 1.3: Install Dependencies

Install TypeScript, Vitest, and related tooling:

```bash
npm install -D typescript vitest @vitest/coverage-v8
```

### Step 1.4: Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 1.5: Configure Vitest

Create a `vitest.config.ts` file in your project root:

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "vitest.config.ts"],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
});
```

### Step 1.6: Create Directory Structure

```bash
# Linux/macOS/PowerShell:
mkdir -p src/__tests__

# Windows Command Prompt:
mkdir src\__tests__
```

✅ **Checkpoint:** Run `npm test` — it should complete (with no tests found yet).

Your project structure should look like:

```text
lab-2-test-driven-development-YOURUSERNAME/
├── .github/
│   └── workflows/
│       └── test.yml        ← (provided in template)
├── .gitignore              ← (provided in template)
├── node_modules/
├── src/
│   └── __tests__/
├── package.json            ← (you created this)
├── README.md               ← (provided in template)
├── tsconfig.json           ← (you created this)
└── vitest.config.ts        ← (you created this)
```

---

## Part 2: Your First TDD Cycle — `applyDiscount()` (25 minutes)

Now we'll practice the Red-Green-Refactor cycle. Remember: **write the test first**, watch it fail, then write the minimum code to pass.

### Step 2.1: RED — Write a Failing Test

Create `src/__tests__/cartUtils.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { applyDiscount } from "../cartUtils";

describe("applyDiscount", () => {
  it("applies a percentage discount to a price", () => {
    expect(applyDiscount(100, 10)).toBe(90);
  });
});
```

Run the test:

```bash
npm test
```

✅ **Checkpoint:** You should see a **red** failing test. The error will say something like "Cannot find module '../cartUtils'". This is expected! We haven't written the implementation yet.

🤔 **Reflection Question:** Why do we intentionally write a failing test first? How does this relate to what Fowler describes as "state verification"?

We write a failing test first so that we know the minimal amount of code to write to make it pass. We are checking the functions output (like verifing applyDiscount(100,10) returns 90). Seeing the test fail first confirms we're actually testing the functions behavior and verifying its state. This helps to then write just enough code to produce a passing state.

### Step 2.2: GREEN — Write Minimal Code to Pass

Create `src/cartUtils.ts` with the absolute minimum to pass:

```typescript
export function applyDiscount(price: number, discountPercent: number): number {
  return price - (price * discountPercent) / 100;
}
```

Run the test:

```bash
npm test
```

✅ **Checkpoint:** Your test should now **pass** (green). We wrote just enough code—nothing more.

### Step 2.3: Add More Test Cases (Still in RED-GREEN)

Now let's handle edge cases. Add these tests one at a time, running tests after each addition:

```typescript
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
```

Some tests will fail! Update your implementation to make them pass:

```typescript
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

  return price - (price * discountPercent) / 100;
}
```

Run tests after each change to ensure all pass.

### Step 2.4: REFACTOR — Improve the Code

Our current implementation works. Let's consider if we can make it clearer:

```typescript
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
```

Run tests again to ensure nothing broke. Both implementations produce the same results—the refactored version just expresses the math differently.

🤔 **Reflection Question:** In the mockist vs. classicist debate from Fowler's article, which approach are we using here? Why don't we need any test doubles for this function?

We are using the classicist approach. We are testing the state of the response. We don't need test doubles because we arent testing anything outside of our function. We are simply testing that the function returns a correct value.
---

## Part 3: Guided TDD — `calculateTax()` (25 minutes)

Let's build a function that calculates sales tax, with support for tax-exempt items.

### Step 3.1: RED — Define the Behavior Through Tests

Add a new describe block in `src/__tests__/cartUtils.test.ts`:

```typescript
import { applyDiscount, calculateTax } from "../cartUtils";

// ... existing applyDiscount tests ...

describe("calculateTax", () => {
  it("calculates tax on a price", () => {
    expect(calculateTax(100, 8.5)).toBeCloseTo(8.5, 2);
  });

  it("returns 0 tax when rate is 0%", () => {
    expect(calculateTax(50, 0)).toBe(0);
  });

  it("handles decimal prices correctly", () => {
    expect(calculateTax(19.99, 10)).toBeCloseTo(2.0, 2);
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
```

Run the tests:

```bash
npm test
```

✅ **Checkpoint:** All `calculateTax` tests should fail (red) because the function doesn't exist.

### Step 3.2: GREEN — Implement Incrementally

Add to `src/cartUtils.ts`:

```typescript
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

  return price * (taxRate / 100);
}
```

Run the tests:

```bash
npm test
```

✅ **Checkpoint:** All tests should pass (green).

### Step 3.3: REFACTOR — Consider Alternatives

The current implementation is clean. One small improvement—we could round to 2 decimal places since we're dealing with currency:

```typescript
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
```

Run tests again—they should still pass since we're using `toBeCloseTo` for decimal comparisons.

🤔 **Reflection Question:** Notice that we changed the implementation (added rounding), but our tests still pass because we used `toBeCloseTo`. This is what Kent C. Dodds means by "not testing implementation details." What would a test that _does_ test implementation details look like?

A test that is testing implementation details would check how the function operates internally, rather than its end state. For example you could have a test that verifies we are calling Math.round. This test would fail if we used Math.floor, but it's still giving us the right end state. 


---

## Part 4: Independent TDD — `calculateTotal()` (30 minutes)

Now it's your turn! Implement a `calculateTotal` function using TDD. This function calculates the final price for a shopping cart, incorporating discounts and taxes.

### Requirements

The function should:

- Accept an array of cart items, each with `price`, `quantity`, and optionally `isTaxExempt`
- Accept a `discountPercent` (applied to subtotal before tax)
- Accept a `taxRate` (applied after discount, only to non-exempt items)
- Return an object with `subtotal`, `discount`, `tax`, and `total`

### Interface Definition

Add this type to your `src/cartUtils.ts`:

```typescript
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
```

### Your Task

**TODO:** Write at least 6 test cases FIRST, then implement the function.

Below is my calculateTotal function. It calculates the subtotal, applies discounts, calculates tax on non-exempt items, and returns the final totals:

```typescript
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
  for (let i = 0; i < items.length; i++) {
    subtotal += items[i].price * items[i].quantity;
  }

  // apply discount to subtotal
  const subtotalAfterDiscount = applyDiscount(subtotal, discountPercent);
  const discount = subtotal - subtotalAfterDiscount;

  // calculate tax on the discounted amount, but only for non tax exempt items
  let taxableSubtotal = 0;
  for (let i = 0; i < items.length; i++) {
    if (!items[i].isTaxExempt) {
      taxableSubtotal += items[i].price * items[i].quantity;
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
```


✅ **Checkpoint:** When complete, run `npm run test:coverage`. All tests should pass, and you should have at least 90% coverage.

---

## Part 5: Verify Coverage and Document (15 minutes)

### Step 5.1: Run Coverage Report

```bash
npm run test:coverage
```

✅ **Checkpoint:** Coverage should be at least 90% across all metrics. If not, identify untested code paths and add tests.

## How to run tests

- Run all tests: `npm test`
- Run tests with coverage: `npm run test:coverage`
- Build TypeScript: `npm run build`


Reflection Section: 

   - How did TDD change the way you approached implementing `calculateTotal`?
   - Which of Fowler's test double types (dummy, stub, fake, spy, mock) did you need for this lab? Why or why not?
   - What's one thing that would have been different if you wrote the implementation first?

1. Using TDD made me write more minimal concrete code in my actual functions. Writing a test that I knew I had to get the result of made writing the function easier.

2. I did not use any test double types. I was testing state, rather than behavior and never had the need to mock anything.

3. If I had wrote the implementation first I think I would have written more code in each function. I probably would have overdone it trying to write a perfect function, rather than just taking it simply test by test. 
---

## Deliverables

Your repository should contain:

```text
tdd-cart-calculator/
├── .github/
│   └── workflows/
│       └── test.yml         # GitHub Actions (provided)
├── src/
│   ├── __tests__/
│   │   └── cartUtils.test.ts    # At least 19 tests
│   └── cartUtils.ts             # applyDiscount, calculateTax, calculateTotal
├── .gitignore
├── package.json
├── README.md                    # With reflection section
├── tsconfig.json
└── vitest.config.ts
```

### Requirements Checklist

- [ ] All three functions implemented: `applyDiscount`, `calculateTax`, `calculateTotal`
- [ ] At least 19 total test cases (7 + 6 + 6 minimum)
- [ ] 90%+ test coverage
- [ ] README with reflection section
- [ ] All tests passing
- [ ] TypeScript compiles without errors

---

## Grading Rubric

| Criterion                              | Points  | Description                                                                    |
| -------------------------------------- | ------- | ------------------------------------------------------------------------------ |
| **Project Setup**                      | 15      | TypeScript, Vitest, and scripts configured correctly                           |
| **Guided Functions**                   | 20      | `applyDiscount` and `calculateTax` implemented with all provided tests passing |
| **Independent TDD (`calculateTotal`)** | 20      | At least 6 well-designed tests; function fully implemented                     |
| **Test Coverage**                      | 15      | 90%+ coverage across all metrics                                               |
| **README & Reflection**                | 20      | Clear documentation; thoughtful answers connecting to readings                 |
| **Code Quality**                       | 10      | Clean code, meaningful names, proper TypeScript types                          |
| **Total**                              | **100** |                                                                                |

---

## Stretch Goals

> [!Note]
> Any code added towards these goals will not be evaluated for grading purposes.

Finished early? Try these extensions:

1. **Add `applyPromoCode()` function** — Support different promo types: percentage off, fixed amount off, buy-one-get-one
2. **Add `calculateShipping()` function** — Free shipping over a threshold, flat rate, or weight-based
3. **Add quantity discounts** — "Buy 3+ get 10% off" logic
4. **Use parameterized tests** — Use Vitest's `it.each()` to test multiple discount/tax scenarios concisely

---

## Troubleshooting

### "Cannot find module" errors

Make sure your import path matches your file structure. The import should be:

```typescript
import { applyDiscount } from "../cartUtils"; // Note: no .ts extension
```

### TypeScript errors about `expect`

Ensure `globals: true` is set in `vitest.config.ts`, or explicitly import:

```typescript
import { describe, it, expect } from "vitest";
```

### Floating point precision issues

Use `toBeCloseTo` for decimal comparisons:

```typescript
expect(result).toBeCloseTo(17.99, 2); // 2 decimal places
```

### Coverage below 90%

Check the HTML coverage report in `coverage/index.html` to see which lines aren't covered. Common misses:

- Error-throwing branches
- Edge cases like empty arrays
- Optional parameters with default values

### Tests pass locally but fail in GitHub Actions

- Check that all dependencies are in `package.json` (not just installed locally)
- Ensure `package.json` has `"type": "module"`
- Verify the test script works with `npm test` (not just `vitest`)

---

## Submission

1. Push your completed code to your GitHub repository
2. Verify that GitHub Actions tests pass (green checkmark)
3. Submit your repository URL via Canvas

**Due:** Tuesday, January 20, 2026 at 11:59 PM

> [!NOTE]  
> **January 19 is Martin Luther King Jr. Day.** Per the Clark College [Academic Calendar](https://www.clark.edu/enroll/registration/academic-calendar.php), this is a campus holiday with no classes being held and campus closed. Therefore, the due date for this assignment has been shifted to the next day to accommdate.

---

## Resources

- 🔗 [Vitest Documentation](https://vitest.dev/)
- 🔗 [Mocks Aren't Stubs](https://martinfowler.com/articles/mocksArentStubs.html) — Martin Fowler
- 🔗 [Test Double](https://martinfowler.com/bliki/TestDouble.html) — Martin Fowler
- 🔗 [Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details) — Kent C. Dodds
