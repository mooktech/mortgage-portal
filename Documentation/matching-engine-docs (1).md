# Matching Engine Documentation

## Overview
The GETMY.MORTGAGE matching engine is the core algorithm that compares client circumstances against lender product criteria to identify suitable mortgage options. This document explains the matching logic, special handling cases, and debugging procedures.

---

## Core Matching Logic

### High-Level Algorithm

```
For each active product from all lenders:
  1. Check basic eligibility (LTV, loan amount, income, age)
  2. Check adverse credit allowances
  3. If adverse credit present, validate against specific criteria
  4. Handle special cases (West One minBalance, etc.)
  5. If all checks pass, add to matched products array
Return matched products sorted by rate (lowest to highest)
```

### Matching Flow Diagram

```
Client Data → Basic Eligibility Check → Adverse Credit Check → Special Cases → Match/No Match
                    ↓ FAIL                    ↓ FAIL             ↓ FAIL            ↓
                   Skip                      Skip              Skip          Add to Results
```

---

## Step-by-Step Matching Process

### Step 1: Basic Eligibility Checks

These checks happen first and act as filters to quickly eliminate unsuitable products.

**LTV (Loan-to-Value) Check:**
```javascript
clientLTV = (loanAmount / propertyValue) * 100
match = clientLTV >= product.eligibility.minLTV && 
        clientLTV <= product.eligibility.maxLTV
```

**Loan Amount Check:**
```javascript
match = loanAmount >= product.eligibility.minLoanAmount && 
        loanAmount <= product.eligibility.maxLoanAmount
```

**Income Check:**
```javascript
match = clientIncome >= product.eligibility.minIncome
```

**Age Check:**
```javascript
clientAge = calculateAge(dateOfBirth)
match = clientAge >= product.eligibility.minAge && 
        clientAge <= product.eligibility.maxAge
```

**Employment Type Check:**
```javascript
match = product.eligibility.employmentTypes.includes(client.employmentStatus)
```

**Property Type Check:**
```javascript
match = product.eligibility.propertyTypes.includes(client.propertyType)
```

**Property Use Check:**
```javascript
match = product.eligibility.propertyUse.includes(client.propertyUse)
```

If **any** basic eligibility check fails, the product is immediately excluded and the engine moves to the next product.

---

### Step 2: Adverse Credit Allowances

Before checking specific criteria values, verify the lender accepts the types of adverse credit the client has.

**CCJ Allowance:**
```javascript
if (client.hasCCJs === true) {
  if (product.adverseCriteria.ccjs.allowed !== true) {
    return false; // Product doesn't accept CCJs at all
  }
}
```

**Defaults Allowance:**
```javascript
if (client.hasDefaults === true) {
  if (product.adverseCriteria.defaults.allowed !== true) {
    return false; // Product doesn't accept defaults at all
  }
}
```

**Arrears Allowance:**
```javascript
if (client.hasArrears === true) {
  if (product.adverseCriteria.arrears.allowed !== true) {
    return false;
  }
}
```

Similar checks for bankruptcy, IVA, and DMP.

---

### Step 3: Specific Adverse Credit Criteria

If the lender accepts the adverse credit type, now check if the client's specific circumstances meet the criteria.

#### CCJ Criteria Checks

**Count Check:**
```javascript
if (client.ccjCount > product.adverseCriteria.ccjs.maxCount) {
  return false; // Too many CCJs
}
```

**Value Check:**
```javascript
if (client.ccjValue > product.adverseCriteria.ccjs.maxValue) {
  return false; // CCJ value too high
}
```

**Recency Check:**
```javascript
monthsSinceCCJ = calculateMonthsBetween(client.ccjDate, today)
if (monthsSinceCCJ < product.adverseCriteria.ccjs.monthsSinceMostRecent) {
  return false; // CCJ too recent
}
```

**Period Check (maxInPeriod):**
```javascript
// Check if client has more CCJs in last N years than allowed
yearsToCheck = product.adverseCriteria.ccjs.periodYears || 6
if (client.ccjCount > product.adverseCriteria.ccjs.maxInPeriod) {
  return false; // Too many CCJs in the period
}
```

**Satisfied Check:**
```javascript
if (product.adverseCriteria.ccjs.mustBeSatisfied === true) {
  if (client.ccjSatisfied !== true) {
    return false; // CCJs must be satisfied but aren't
  }
}
```

#### Defaults Criteria Checks

Identical structure to CCJs:
- Count vs maxCount
- Value vs maxValue
- Recency vs monthsSinceMostRecent
- Count vs maxInPeriod (within periodYears)
- Satisfied status vs mustBeSatisfied

#### Other Adverse Credit Checks

**Arrears:**
```javascript
if (client.hasArrears) {
  if (client.arrearsValue > product.adverseCriteria.arrears.maxValue) {
    return false;
  }
  monthsSinceArrears = calculateMonthsBetween(client.arrearsDate, today)
  if (monthsSinceArrears < product.adverseCriteria.arrears.monthsSinceMostRecent) {
    return false;
  }
}
```

**Bankruptcy:**
```javascript
if (client.hasBankruptcy) {
  yearsSinceBankruptcy = calculateYearsBetween(client.bankruptcyDate, today)
  if (yearsSinceBankruptcy < product.adverseCriteria.bankruptcy.yearsSinceDischarge) {
    return false;
  }
}
```

**IVA and DMP:** Similar year-based checks

---

### Step 4: Special Case Handling

#### West One minBalance Requirement

West One Tier 1 has a unique requirement: if a client has exactly 1 CCJ or 1 default, its value must be at least £500. This prevents matching clients with very minor credit issues who could likely get better rates with mainstream lenders.

**Implementation:**
```javascript
// For West One Tier 1 products only
if (product.adverseCriteria.ccjs.minBalance) {
  if (client.ccjCount === 1 && client.ccjValue < product.adverseCriteria.ccjs.minBalance) {
    return false; // Single CCJ below minimum threshold
  }
}

if (product.adverseCriteria.defaults.minBalance) {
  if (client.defaultCount === 1 && client.defaultValue < product.adverseCriteria.defaults.minBalance) {
    return false; // Single default below minimum threshold
  }
}
```

**Why This Matters:**
- Without this check, West One Tier 1 would match clients with tiny CCJs (e.g., £100)
- These clients would be paying specialist lender rates unnecessarily
- Better to direct them to mainstream lenders for better rates

**Debugging Note:**
If West One products are appearing for clients with small single adverse events, check that `minBalance` is properly set in the product criteria and that the matching engine is checking it.

---

## Field Mapping Reference

### Client to Product Field Mappings

| Client Field | Product Field | Check Type |
|--------------|---------------|------------|
| `loanAmount` | `eligibility.minLoanAmount` | >= |
| `loanAmount` | `eligibility.maxLoanAmount` | <= |
| `ltv` | `eligibility.minLTV` | >= |
| `ltv` | `eligibility.maxLTV` | <= |
| `annualIncome` | `eligibility.minIncome` | >= |
| `age` (calculated) | `eligibility.minAge` | >= |
| `age` (calculated) | `eligibility.maxAge` | <= |
| `employmentStatus` | `eligibility.employmentTypes` | includes |
| `propertyType` | `eligibility.propertyTypes` | includes |
| `propertyUse` | `eligibility.propertyUse` | includes |
| `hasCCJs` | `adverseCriteria.ccjs.allowed` | must be true if client has CCJs |
| `ccjCount` | `adverseCriteria.ccjs.maxCount` | <= |
| `ccjCount` | `adverseCriteria.ccjs.maxInPeriod` | <= |
| `ccjValue` | `adverseCriteria.ccjs.maxValue` | <= |
| `ccjValue` | `adverseCriteria.ccjs.minBalance` | >= (if count=1, West One only) |
| `ccjDate` | `adverseCriteria.ccjs.monthsSinceMostRecent` | months between >= required |
| `ccjSatisfied` | `adverseCriteria.ccjs.mustBeSatisfied` | must match |
| `hasDefaults` | `adverseCriteria.defaults.allowed` | must be true if client has defaults |
| `defaultCount` | `adverseCriteria.defaults.maxCount` | <= |
| `defaultCount` | `adverseCriteria.defaults.maxInPeriod` | <= |
| `defaultValue` | `adverseCriteria.defaults.maxValue` | <= |
| `defaultValue` | `adverseCriteria.defaults.minBalance` | >= (if count=1, West One only) |
| `defaultDate` | `adverseCriteria.defaults.monthsSinceMostRecent` | months between >= required |
| `hasArrears` | `adverseCriteria.arrears.allowed` | must be true if client has arrears |
| `arrearsValue` | `adverseCriteria.arrears.maxValue` | <= |
| `arrearsDate` | `adverseCriteria.arrears.monthsSinceMostRecent` | months between >= required |
| `hasBankruptcy` | `adverseCriteria.bankruptcy.allowed` | must be true if client has bankruptcy |
| `bankruptcyDate` | `adverseCriteria.bankruptcy.yearsSinceDischarge` | years between >= required |
| `hasIVA` | `adverseCriteria.iva.allowed` | must be true if client has IVA |
| `ivaDate` | `adverseCriteria.iva.yearsSinceCompletion` | years between >= required |
| `hasDMP` | `adverseCriteria.dmp.allowed` | must be true if client has DMP |
| `dmpDate` | `adverseCriteria.dmp.yearsSinceCompletion` | years between >= required |

---

## Date Calculation Functions

### Months Between Dates
```javascript
function calculateMonthsBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let months = (end.getFullYear() - start.getFullYear()) * 12;
  months += end.getMonth() - start.getMonth();
  
  return months;
}
```

**Example:**
- CCJ Date: January 15, 2021
- Today: November 8, 2024
- Months: (2024-2021)*12 + (10-0) = 36 + 10 = 46 months
- Product requires: 36 months
- Result: 46 >= 36 ✓ Qualifies

### Years Between Dates
```javascript
function calculateYearsBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let years = end.getFullYear() - start.getFullYear();
  
  // Adjust if haven't reached anniversary yet
  if (end.getMonth() < start.getMonth() || 
      (end.getMonth() === start.getMonth() && end.getDate() < start.getDate())) {
    years--;
  }
  
  return years;
}
```

**Example:**
- Bankruptcy Discharge: March 1, 2018
- Today: November 8, 2024
- Years: 2024 - 2018 = 6 years
- Product requires: 6 years since discharge
- Result: 6 >= 6 ✓ Qualifies

---

## Debugging Guide

### Common Matching Issues

#### Issue: Expected Product Not Appearing

**Systematic Debugging Process:**

1. **Generate Detailed Logs**
   ```javascript
   // Add comprehensive logging to matching function
   console.log('Client Data:', client);
   console.log('Product Being Checked:', product.productName);
   console.log('Basic Eligibility Checks:');
   console.log('  LTV Check:', clientLTV, 'vs', product.eligibility.minLTV, '-', product.eligibility.maxLTV);
   console.log('  Loan Amount Check:', loanAmount, 'vs', product.eligibility.minLoanAmount, '-', product.eligibility.maxLoanAmount);
   // ... continue for all checks
   ```

2. **Download Logs as File**
   ```javascript
   // Create downloadable log file
   const logContent = matchingLogs.join('\n');
   const blob = new Blob([logContent], { type: 'text/plain' });
   const url = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = `matching-debug-${Date.now()}.txt`;
   a.click();
   ```

3. **Review Log File Systematically**
   - Find the product in question
   - Check each eligibility criterion in order
   - Identify which check is failing
   - Verify client data is correct
   - Verify product criteria is correct

**Example Debug Output:**
```
Product: Bluestone AAA 2 Year Fixed
✓ LTV Check: 75.00 vs 60-90 PASS
✓ Loan Amount Check: 250000 vs 25000-500000 PASS
✓ Income Check: 45000 vs 25000 PASS
✗ CCJ Count Check: 2 vs 1 FAIL - Client has too many CCJs
→ Product excluded
```

#### Issue: Unexpected Product Appearing

**Common Causes:**

1. **Missing Criteria Check**
   - Verify all adverse criteria are being checked
   - Look for missing `if` statements in matching engine
   - Example: West One minBalance wasn't being checked initially

2. **Incorrect Field Reference**
   - Check field names match Firebase exactly (case-sensitive)
   - Example: `maxValue` vs `maxvalue` - JavaScript is case-sensitive

3. **Logic Error**
   - Review boolean logic (AND vs OR)
   - Check comparison operators (>= vs >)
   - Verify nested object access (null checking)

**Debugging Example - West One False Positives:**
```
Problem: West One Tier 1 matching clients with 1 CCJ of £100
Expected: Should only match if CCJ >= £500

Debug Steps:
1. Check product criteria in Firebase
   → minBalance: 500 ✓ Present
2. Check matching engine code
   → Missing minBalance check ✗
3. Add minBalance check to matching engine
4. Test with same client
   → Now correctly excluded ✓
```

---

## Performance Optimization

### Current Performance

**Typical Matching Operation:**
- Client count: 1
- Active products: ~34 (across 4 lenders)
- Checks per product: ~15-20
- Total operations: ~500-700
- Execution time: <100ms

**Acceptable:** Current performance is excellent for user-facing application.

### Future Optimization Strategies

If product database grows significantly (>500 products):

1. **Index-Based Pre-filtering**
   - Create Firestore indexes on key criteria
   - Filter products before detailed matching
   - Example: Only query products where `adverseCriteria.ccjs.allowed = true` if client has CCJs

2. **Tiered Matching**
   - Level 1: Basic eligibility (fast filters)
   - Level 2: Adverse credit (moderate complexity)
   - Level 3: Special cases (complex logic)
   - Exit early at each level if possible

3. **Caching**
   - Cache product criteria in memory
   - Reduce Firestore reads
   - Invalidate cache on product updates

4. **Parallel Processing**
   - Use Promise.all() for lender-level parallelization
   - Process each lender's products simultaneously
   - Combine results at the end

**Note:** Premature optimization should be avoided. Current performance is sufficient.

---

## Testing Strategy

### Unit Testing Key Scenarios

**Test 1: Clean Credit Profile**
```javascript
testClient = {
  ltv: 75,
  loanAmount: 250000,
  income: 50000,
  hasCCJs: false,
  hasDefaults: false,
  // ... all other adverse = false
}
// Expected: Should match top-tier products from all lenders
```

**Test 2: Single Recent CCJ**
```javascript
testClient = {
  ltv: 75,
  loanAmount: 250000,
  income: 50000,
  hasCCJs: true,
  ccjCount: 1,
  ccjValue: 800,
  ccjDate: '2022-06-15', // ~28 months ago
  ccjSatisfied: true,
  // ... all other adverse = false
}
// Expected: Should match mid-tier products accepting recent CCJs
```

**Test 3: Multiple Older Adverse Events**
```javascript
testClient = {
  ltv: 75,
  loanAmount: 250000,
  income: 50000,
  hasCCJs: true,
  ccjCount: 3,
  ccjValue: 2500,
  ccjDate: '2019-01-15', // ~70 months ago
  ccjSatisfied: true,
  hasDefaults: true,
  defaultCount: 2,
  defaultValue: 1800,
  defaultDate: '2019-06-15',
  // ... all other adverse = false
}
// Expected: Should match lower-tier products with flexible criteria
```

**Test 4: West One minBalance Edge Case**
```javascript
testClient = {
  ltv: 75,
  loanAmount: 250000,
  income: 50000,
  hasCCJs: true,
  ccjCount: 1,
  ccjValue: 300, // Below £500 threshold
  ccjDate: '2020-01-15',
  ccjSatisfied: true,
  // ... all other adverse = false
}
// Expected: Should NOT match West One Tier 1
```

**Test 5: High LTV Specialist**
```javascript
testClient = {
  ltv: 92,
  loanAmount: 250000,
  income: 50000,
  hasCCJs: true,
  ccjCount: 1,
  ccjValue: 500,
  ccjDate: '2021-01-15',
  ccjSatisfied: true,
  // ... all other adverse = false
}
// Expected: Should match Bluestone Deposit Unlock products
// Expected: Should NOT match standard products (max LTV 85-90)
```

### Integration Testing

Test complete workflow:
1. Client submits fact-find
2. Data saved to Firebase
3. Matching engine retrieves and processes
4. Results displayed in UI
5. Verify correct products shown with accurate details

### Regression Testing

After any matching engine changes:
1. Run full test suite with known client profiles
2. Compare results against expected matches
3. Investigate any discrepancies
4. Update tests if business logic intentionally changed

---

## Known Edge Cases and Handling

### Edge Case 1: Borderline LTV
**Scenario:** Client LTV = 85.00%, Product max = 85%  
**Handling:** Inclusive comparison (<=) means client qualifies  
**Rationale:** Industry standard treats boundaries as inclusive

### Edge Case 2: Exactly Meeting Criteria
**Scenario:** Client has 2 CCJs, product allows max 2  
**Handling:** Client qualifies (<=)  
**Rationale:** "Max" means "up to and including"

### Edge Case 3: Zero Adverse Credit
**Scenario:** Client has `hasCCJs = false`, no CCJ details provided  
**Handling:** All CCJ checks are skipped, no impact on matching  
**Rationale:** If adverse flag is false, related criteria irrelevant

### Edge Case 4: Missing Product Criteria Fields
**Scenario:** Product imported without `minBalance` field  
**Handling:** Check for field existence before using:
```javascript
if (product.adverseCriteria.ccjs.minBalance !== undefined) {
  // perform minBalance check
}
```
**Rationale:** Gracefully handle incomplete data, only fail required fields

### Edge Case 5: Same-Day Adverse Event
**Scenario:** CCJ dated today  
**Handling:** Counts as 0 months elapsed, won't meet any recency requirement  
**Rationale:** Conservative approach protects client and lender

---

## Error Handling

### Graceful Degradation

If matching engine encounters an error:

1. **Log the Error**
   ```javascript
   console.error('Matching error:', error);
   console.error('Client data:', client);
   console.error('Product data:', product);
   ```

2. **Continue Processing**
   - Skip problematic product
   - Continue checking other products
   - Don't fail entire matching operation

3. **Notify User Appropriately**
   - "We found N matches from X lenders"
   - Don't mention errors in UI unless critical
   - Log errors for admin review

4. **Alert Administrator**
   - Send error details to monitoring system
   - Include full context for debugging
   - Flag for immediate review if critical

---

## Future Enhancements

### Planned Improvements

1. **Match Score/Ranking**
   - Beyond just rate, rank by overall suitability
   - Consider fees, flexibility, lender service quality
   - Weight factors based on client priorities

2. **Explanation Generator**
   - For each matched product, explain why it matched
   - For products that didn't match, explain why not
   - Help clients understand their options

3. **"Near Miss" Suggestions**
   - Identify products client almost qualified for
   - Show credit improvement roadmap to qualify
   - Estimate timeline to qualification

4. **Multi-Applicant Matching**
   - Handle joint applications
   - Consider both applicants' credit profiles
   - Apply lender-specific joint application rules

5. **Buy-to-Let Specific Logic**
   - Rental coverage calculations
   - Portfolio landlord rules
   - Stress testing requirements

---

## Related Documentation

- See `firebase-structure.md` for database schema details
- See `import-scripts-inventory.md` for how products are imported
- See `strategic-decisions.md` for rationale behind matching approach
- See `credit-improvement-roadmap.md` for planned feature using matching data

---

## Version History

**Version 1.0** (Current)
- Core matching logic for residential purchases
- All major adverse credit types supported
- West One minBalance special handling
- Comprehensive debugging logging

**Planned Version 1.1**
- Match scoring and ranking
- Explanation generation
- Near-miss detection
- Performance optimizations

---

## Maintenance Notes

**When to Update This Document:**
- New lender with unique criteria added
- Matching logic modified or enhanced
- New edge case discovered and handled
- Performance optimizations implemented
- Testing strategy evolved

**Review Schedule:**
- After each lender addition
- Quarterly as part of platform review
- Whenever matching accuracy issues reported
- Before major platform updates
