# Import Scripts Inventory

## Overview
This document catalogs all import scripts used to populate the Firebase database with lender product information. Each script extracts data from lender rate cards and creates properly formatted product documents in Firestore.

---

## Script Naming Convention

**Pattern:** `import-{lender}-{product-tier}.js`

**Examples:**
- `import-pepper-AAA.js`
- `import-west-one-tier-1.js`
- `import-bluestone-deposit-unlock.js`

**Rules:**
1. Lender name in lowercase, hyphenated if multiple words
2. Product tier/category exactly as lender defines it
3. Use `.js` extension for JavaScript files
4. Keep names concise but descriptive

---

## Current Import Scripts by Lender

### Pepper Money (9 scripts)

| Script Name | Product Tier | Category | Last Updated |
|-------------|-------------|----------|--------------|
| `import-pepper-AAA.js` | AAA | Residential Purchase | 2024-11 |
| `import-pepper-AA.js` | AA | Residential Purchase | 2024-11 |
| `import-pepper-A.js` | A | Residential Purchase | 2024-11 |
| `import-pepper-B.js` | B | Residential Purchase | 2024-11 |
| `import-pepper-C.js` | C | Residential Purchase | 2024-11 |
| `import-pepper-D.js` | D | Residential Purchase | 2024-11 |
| `import-pepper-AAA-btl.js` | AAA Buy-to-Let | Buy-to-Let | 2024-11 |
| `import-pepper-AA-btl.js` | AA Buy-to-Let | Buy-to-Let | 2024-11 |
| `import-pepper-A-btl.js` | A Buy-to-Let | Buy-to-Let | 2024-11 |

**Source Document:** Pepper Money Rate Card (November 2024)  
**Total Products:** 9 tiers  
**Notes:** Residential products AAA through D represent increasingly flexible adverse credit criteria. BTL products available for AAA, AA, and A tiers only.

---

### West One (9 scripts)

| Script Name | Product Tier | Category | Last Updated |
|-------------|-------------|----------|--------------|
| `import-west-one-tier-1.js` | Tier 1 | Residential Purchase | 2024-11 |
| `import-west-one-tier-2.js` | Tier 2 | Residential Purchase | 2024-11 |
| `import-west-one-tier-3.js` | Tier 3 | Residential Purchase | 2024-11 |
| `import-west-one-tier-4.js` | Tier 4 | Residential Purchase | 2024-11 |
| `import-west-one-tier-5.js` | Tier 5 | Residential Purchase | 2024-11 |
| `import-west-one-tier-6.js` | Tier 6 | Residential Purchase | 2024-11 |
| `import-west-one-tier-7.js` | Tier 7 | Residential Purchase | 2024-11 |
| `import-west-one-tier-8.js` | Tier 8 | Residential Purchase | 2024-11 |
| `import-west-one-tier-9.js` | Tier 9 | Residential Purchase | 2024-11 |

**Source Document:** West One Lending Criteria Guide (November 2024)  
**Total Products:** 9 tiers  
**Notes:** Unique feature - Tier 1 requires minimum £500 CCJ/default balance if only 1 adverse event present. This prevents matching clients with very minor credit issues who might get better rates with mainstream lenders.

---

### The Mortgage Lender (8 scripts)

| Script Name | Product Tier | Category | Last Updated |
|-------------|-------------|----------|--------------|
| `import-tml-specialist-1.js` | Specialist 1 | Residential Purchase | 2024-11 |
| `import-tml-specialist-2.js` | Specialist 2 | Residential Purchase | 2024-11 |
| `import-tml-specialist-3.js` | Specialist 3 | Residential Purchase | 2024-11 |
| `import-tml-specialist-4.js` | Specialist 4 | Residential Purchase | 2024-11 |
| `import-tml-tier-1-btl.js` | Tier 1 BTL | Buy-to-Let | 2024-11 |
| `import-tml-tier-2-btl.js` | Tier 2 BTL | Buy-to-Let | 2024-11 |
| `import-tml-tier-3-btl.js` | Tier 3 BTL | Buy-to-Let | 2024-11 |
| `import-tml-tier-4-btl.js` | Tier 4 BTL | Buy-to-Let | 2024-11 |

**Source Document:** TML Specialist Lending Criteria (November 2024)  
**Total Products:** 8 tiers (4 residential, 4 BTL)  
**Notes:** Clear separation between residential specialist products and BTL tiers. Residential products focused on adverse credit history, BTL products emphasize rental coverage and property type.

---

### Bluestone Mortgages (8 scripts)

| Script Name | Product Tier | Category | Last Updated |
|-------------|-------------|----------|--------------|
| `import-bluestone-AAA.js` | AAA | Residential Purchase | 2024-11 |
| `import-bluestone-AA.js` | AA | Residential Purchase | 2024-11 |
| `import-bluestone-A.js` | A | Residential Purchase | 2024-11 |
| `import-bluestone-B.js` | B | Residential Purchase | 2024-11 |
| `import-bluestone-C.js` | C | Residential Purchase | 2024-11 |
| `import-bluestone-D.js` | D | Residential Purchase | 2024-11 |
| `import-bluestone-deposit-unlock.js` | Deposit Unlock | High LTV | 2024-11 |
| `import-bluestone-deposit-unlock-plus.js` | Deposit Unlock Plus | High LTV | 2024-11 |

**Source Document:** Bluestone Rate Card (November 2024)  
**Total Products:** 8 tiers  
**Notes:** AAA-D tiers mirror Pepper Money's structure. Deposit Unlock products are specialized for high LTV scenarios (90%+) with minimal adverse credit. Important: Deposit Unlock products require 90%+ LTV and have stricter adverse credit criteria than their tier letter might suggest.

---

## Total Script Count

**Lenders:** 4  
**Total Scripts:** 34  
**Categories:**
- Residential Purchase: 24 scripts
- Buy-to-Let: 8 scripts
- High LTV Specialist: 2 scripts

---

## Script Template Structure

All import scripts follow a consistent structure:

```javascript
const admin = require('firebase-admin');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('./serviceAccountKey.json'))
  });
}

const db = admin.firestore();

async function importProduct() {
  const productData = {
    // Core product information
    productName: 'Product Display Name',
    category: 'residential', // or 'buy-to-let', 'bridging'
    productType: 'purchase', // or 'remortgage', 'debt-consolidation'
    rateType: 'fixed', // or 'variable', 'tracker', 'discounted'
    term: 2, // years
    rate: 0.0549, // 5.49% as decimal
    aprc: 0.0573,
    revertRate: 0.0899,
    productFee: 1995,
    maxLoanAmount: 500000,
    
    // Adverse credit criteria
    adverseCriteria: {
      ccjs: {
        allowed: true,
        maxCount: 2,
        maxValue: 1000,
        monthsSinceMostRecent: 36,
        maxInPeriod: 2,
        periodYears: 6,
        mustBeSatisfied: true,
        minBalance: 500 // Optional, West One specific
      },
      defaults: {
        allowed: true,
        maxCount: 2,
        maxValue: 1000,
        monthsSinceMostRecent: 36,
        maxInPeriod: 2,
        periodYears: 6,
        mustBeSatisfied: true,
        minBalance: 500 // Optional, West One specific
      },
      arrears: {
        allowed: false,
        maxValue: 0,
        monthsSinceMostRecent: 0
      },
      bankruptcy: {
        allowed: false,
        yearsSinceDischarge: 0
      },
      iva: {
        allowed: false,
        yearsSinceCompletion: 0
      },
      dmp: {
        allowed: false,
        yearsSinceCompletion: 0
      }
    },
    
    // Eligibility criteria
    eligibility: {
      minIncome: 25000,
      maxAge: 70,
      minAge: 21,
      employmentTypes: ['employed', 'self-employed'],
      propertyTypes: ['house', 'flat', 'bungalow'],
      propertyUse: ['primary-residence'],
      minLoanAmount: 25000,
      maxLoanAmount: 500000,
      minLTV: 60,
      maxLTV: 90,
      minDepositPercent: 10,
      regions: ['england', 'scotland', 'wales']
    },
    
    // Metadata
    active: true,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    source: 'Lender Rate Card YYYY-MM',
    importScriptUsed: 'import-lender-tier.js',
    notes: 'Additional context about product'
  };
  
  try {
    await db
      .collection('lenders')
      .doc('lender-id')
      .collection('products')
      .doc('product-tier-id')
      .set(productData);
      
    console.log('Product imported successfully');
  } catch (error) {
    console.error('Error importing product:', error);
  }
}

importProduct();
```

---

## Import Workflow

### Standard Import Process

1. **Obtain Rate Card**
   - Download latest rate card from lender
   - Save as PDF in `/rate-cards/lender-name/` directory
   - Note effective date and version

2. **Extract Product Details**
   - Manually review rate card
   - Note all relevant criteria, rates, and fees
   - Pay special attention to adverse credit policies
   - Document any unique features or requirements

3. **Create/Update Script**
   - Copy template or existing similar script
   - Update all product fields with extracted data
   - Ensure adverse criteria accurately reflects lender policy
   - Add source document reference and date

4. **Test Script**
   - Run script against development Firebase instance
   - Verify product document structure in Firestore console
   - Check all fields are correctly populated
   - Validate adverse criteria logic

5. **Run Against Production**
   - Backup existing data
   - Run import script
   - Verify product appears in Firestore
   - Test with sample client data

6. **Document Import**
   - Update this inventory with script details
   - Note any special considerations or unique features
   - Record source document and date
   - Commit script to version control

---

## Maintenance Guidelines

### When to Update Scripts

**Quarterly Rate Reviews:**
- Review all lender rate cards
- Update rates, fees, and criteria if changed
- Re-run all affected import scripts
- Document changes in changelog

**New Product Launches:**
- Create new import script following naming convention
- Add to appropriate lender section in this inventory
- Update lender's product count
- Test thoroughly before production import

**Criteria Changes:**
- Update existing script with new criteria
- Note changes in script comments
- Document impact on existing clients
- Re-run matching engine tests

### Script Maintenance Best Practices

1. **Version Control:** All scripts should be in git repository
2. **Comments:** Include detailed comments for complex criteria
3. **Validation:** Add data validation checks before Firestore write
4. **Logging:** Log all import operations with timestamps
5. **Error Handling:** Robust try-catch blocks with specific error messages
6. **Idempotency:** Scripts should be safe to run multiple times (use `.set()` not `.add()`)

---

## Common Import Issues and Solutions

### Issue: Rates Not Displaying Correctly
**Cause:** Rate entered as percentage (5.49) instead of decimal (0.0549)  
**Solution:** Always use decimal format. Convert percentage by dividing by 100.

### Issue: Product Not Matching Eligible Clients
**Cause:** Criteria field mismatch or incorrect boolean logic  
**Solutions:**
- Check field names match Firebase structure exactly (camelCase)
- Verify boolean flags (allowed: true/false) are correct
- Review maxInPeriod vs maxCount distinction
- Test with known qualifying client

### Issue: West One Products Matching Incorrectly
**Cause:** Missing or incorrect minBalance implementation  
**Solution:** Ensure Tier 1 script includes `minBalance: 500` in both CCJs and defaults objects. Matching engine has special logic to handle this.

### Issue: Deposit Unlock Products Matching Low LTV Clients
**Cause:** LTV criteria not set correctly  
**Solution:** Deposit Unlock requires `minLTV: 90, maxLTV: 95`. Double-check these values in import script.

### Issue: Duplicate Products After Re-import
**Cause:** Using `.add()` instead of `.set()`  
**Solution:** Always use `.set()` with explicit document ID to ensure idempotency.

---

## Future Enhancements

### Planned Improvements

1. **Automated Rate Card Parsing**
   - OCR/PDF parsing to extract rates automatically
   - Reduce manual data entry errors
   - Speed up quarterly updates

2. **Validation Scripts**
   - Automated validation of import script outputs
   - Check for common errors before production import
   - Generate validation reports

3. **Bulk Import Tool**
   - Single command to import all products from a lender
   - Progress tracking and rollback capability
   - Comprehensive logging and error reporting

4. **Rate Change Detection**
   - Compare new imports against existing products
   - Flag rate changes for review
   - Notify affected clients of better rates

5. **Import Scheduling**
   - Scheduled automated imports from API-enabled lenders
   - Email notifications of successful imports
   - Automatic backup before import

---

## Lender API Integration Status

### Current Status: No API Integrations
All product data is currently imported manually via scripts.

### Future API Integrations

**Nationwide Building Society**
- Status: Accepted into Mortgage API Developer Program
- Expected: API access for direct product queries
- Timeline: TBD
- Impact: Could replace manual import scripts for Nationwide products

**Other Lenders**
Most adverse credit lenders don't offer API access. Manual import will likely remain primary method.

---

## Related Documentation

- See `firebase-structure.md` for complete database schema
- See `matching-engine-docs.md` for how imported products are used
- See `strategic-decisions.md` for rationale behind manual import approach

---

## Script Storage and Organization

### Directory Structure
```
/import-scripts
  /pepper-money
    import-pepper-AAA.js
    import-pepper-AA.js
    ...
  /west-one
    import-west-one-tier-1.js
    import-west-one-tier-2.js
    ...
  /the-mortgage-lender
    import-tml-specialist-1.js
    ...
  /bluestone
    import-bluestone-AAA.js
    ...
  /templates
    import-template-residential.js
    import-template-btl.js
  /utils
    validate-product.js
    rate-card-parser.js
```

### Backup Strategy
- All scripts version controlled in git
- Rate card PDFs stored in secure cloud storage
- Firebase data backed up daily
- Import logs retained for audit trail

---

## Version History

**Version 1.0** (Current)
- 34 import scripts across 4 lenders
- Manual import process
- Template-based approach
- Standard Firebase structure

**Planned Version 1.1**
- Add validation scripts
- Implement rate change detection
- Create bulk import tool
- Add automated testing

---

## Contact and Support

**For Questions About:**
- **Import Scripts:** Review template and existing examples
- **Rate Card Interpretation:** Contact lender BDM directly
- **Firebase Structure:** See `firebase-structure.md`
- **Matching Logic:** See `matching-engine-docs.md`

**Maintaining This Document:**
Update this inventory whenever:
- New import script is created
- Lender added or removed
- Script naming convention changes
- Import process updated
