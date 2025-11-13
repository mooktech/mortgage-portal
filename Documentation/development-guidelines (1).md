# Development Guidelines

## Overview
This document establishes uniform development practices, coding standards, and procedures for GETMY.MORTGAGE platform development. Following these guidelines ensures consistency, maintainability, and quality across the codebase.

---

## Core Principles

### 1. Documentation First
- Document architectural decisions before implementation
- Update documentation immediately when code changes
- Reference existing documentation before creating new solutions
- Keep documentation in sync with code

### 2. Test Before Deploy
- Write tests for all critical functionality
- Test with real client scenarios
- Verify changes don't break existing features
- Use staging environment before production

### 3. Security and Compliance
- FCA compliance is non-negotiable
- Protect client data at all times
- Follow Firebase security best practices
- Regular security audits and reviews

### 4. User-Centric Design
- Prioritize user experience over technical elegance
- Mobile-first responsive design
- Accessibility compliance (WCAG 2.1 Level AA minimum)
- Clear error messages and guidance

### 5. Iterative Development
- Ship working increments frequently
- Get feedback early and often
- Refactor as understanding improves
- Don't prematurely optimize

---

## Code Organization

### Directory Structure

```
/getmy-mortgage
  /src
    /components         # Reusable UI components
      /forms           # Form components
      /dashboard       # Dashboard widgets
      /matching        # Matching engine components
    /services          # Business logic services
      /firebase        # Firebase integration
      /matching        # Matching engine
      /validation      # Data validation
    /utils             # Utility functions
    /pages             # Page components/views
    /styles            # Global styles and themes
    /config            # Configuration files
    /assets            # Static assets (images, etc.)
  /functions           # Firebase Cloud Functions
  /import-scripts      # Lender data import scripts
    /pepper-money
    /west-one
    /the-mortgage-lender
    /bluestone
    /templates
    /utils
  /tests               # Test files
    /unit
    /integration
    /e2e
  /docs                # Documentation
  /public              # Public assets
```

### File Naming Conventions

**Components:**
- PascalCase for component files: `ClientForm.jsx`, `DashboardWidget.jsx`
- kebab-case for CSS modules: `client-form.module.css`

**Services:**
- camelCase for service files: `matchingEngine.js`, `firebaseService.js`

**Utils:**
- camelCase for utility files: `dateCalculations.js`, `validators.js`

**Import Scripts:**
- Kebab-case: `import-pepper-AAA.js`, `import-west-one-tier-1.js`

**Tests:**
- Same name as file being tested plus `.test`: `matchingEngine.test.js`

---

## Coding Standards

### JavaScript/React Style

**Use Modern ES6+ Syntax:**
```javascript
// ✓ Good - arrow functions, destructuring, const/let
const calculateLTV = ({ loanAmount, propertyValue }) => {
  const ltv = (loanAmount / propertyValue) * 100;
  return ltv.toFixed(2);
};

// ✗ Bad - old var, function keyword for simple functions
var calculateLTV = function(data) {
  var ltv = (data.loanAmount / data.propertyValue) * 100;
  return ltv.toFixed(2);
};
```

**Meaningful Variable Names:**
```javascript
// ✓ Good - clear and descriptive
const monthsSinceCCJ = calculateMonthsBetween(ccjDate, today);
const clientQualifies = monthsSinceCCJ >= requiredMonths;

// ✗ Bad - unclear abbreviations
const msc = calcMB(cd, td);
const cq = msc >= rm;
```

**Component Structure:**
```javascript
// ✓ Good - clear organization
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './ClientForm.module.css';

const ClientForm = ({ onSubmit, initialData }) => {
  // 1. State hooks
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState({});
  
  // 2. Effect hooks
  useEffect(() => {
    validateForm();
  }, [formData]);
  
  // 3. Event handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // 4. Helper functions
  const validateForm = () => {
    // validation logic
  };
  
  // 5. Render
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      {/* form fields */}
    </form>
  );
};

ClientForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object
};

export default ClientForm;
```

**Async/Await Over Promises:**
```javascript
// ✓ Good - cleaner async/await
const saveClient = async (clientData) => {
  try {
    const docRef = await db.collection('clients').add(clientData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving client:', error);
    throw error;
  }
};

// ✗ Avoid - promise chains harder to read
const saveClient = (clientData) => {
  return db.collection('clients').add(clientData)
    .then(docRef => docRef.id)
    .catch(error => {
      console.error('Error saving client:', error);
      throw error;
    });
};
```

### Comment Guidelines

**When to Comment:**
```javascript
// ✓ Good - explain WHY, not WHAT
// West One requires minimum £500 balance for single adverse events
// to prevent matching clients with trivial credit issues
if (ccjCount === 1 && ccjValue < minBalance) {
  return false;
}

// ✗ Bad - stating the obvious
// Check if CCJ count is 1 and value is less than min balance
if (ccjCount === 1 && ccjValue < minBalance) {
  return false;
}
```

**Complex Logic:**
```javascript
// ✓ Good - break down complex logic
const qualifiesForProduct = (client, product) => {
  // Step 1: Check basic eligibility (LTV, loan amount, income)
  if (!meetsBasicEligibility(client, product)) {
    return false;
  }
  
  // Step 2: Verify lender accepts client's adverse credit types
  if (!adverseCreditAllowed(client, product)) {
    return false;
  }
  
  // Step 3: Validate specific adverse credit criteria
  if (!meetsAdverseCriteria(client, product)) {
    return false;
  }
  
  return true;
};
```

**Document References:**
```javascript
// When implementing features from documentation, reference the doc
// See: matching-engine-docs.md - "West One minBalance Requirement"
if (product.adverseCriteria.ccjs.minBalance) {
  if (client.ccjCount === 1 && client.ccjValue < product.adverseCriteria.ccjs.minBalance) {
    return false;
  }
}
```

---

## Firebase Best Practices

### Security Rules

**Always Use Authentication:**
```javascript
// ✓ Good - authenticated users only
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /clients/{clientId} {
      allow read, write: if request.auth != null 
                         && request.auth.uid == clientId;
    }
  }
}

// ✗ Bad - public access
match /clients/{clientId} {
  allow read, write: if true;  // NEVER DO THIS
}
```

**Validate Data:**
```javascript
// ✓ Good - validate field types and values
match /clients/{clientId} {
  allow write: if request.auth != null 
               && request.resource.data.email is string
               && request.resource.data.ltv >= 0
               && request.resource.data.ltv <= 100;
}
```

### Query Optimization

**Use Indexes:**
```javascript
// ✓ Good - query with indexed fields
const activeClients = await db.collection('clients')
  .where('status', '==', 'active')
  .orderBy('createdAt', 'desc')
  .limit(20)
  .get();

// Note: Create composite index for status + createdAt
```

**Limit Results:**
```javascript
// ✓ Good - always limit queries
const products = await db.collection('lenders')
  .doc('pepper-money')
  .collection('products')
  .where('active', '==', true)
  .limit(50)  // Always set reasonable limits
  .get();

// ✗ Bad - unlimited query
const products = await db.collection('lenders')
  .doc('pepper-money')
  .collection('products')
  .get();  // Could return thousands of docs
```

**Batch Writes:**
```javascript
// ✓ Good - batch multiple operations
const batch = db.batch();

products.forEach(product => {
  const docRef = db.collection('lenders')
    .doc('pepper-money')
    .collection('products')
    .doc(product.id);
  batch.set(docRef, product);
});

await batch.commit();

// ✗ Bad - individual writes in loop
for (const product of products) {
  await db.collection('lenders')
    .doc('pepper-money')
    .collection('products')
    .doc(product.id)
    .set(product);  // Very slow, wasteful
}
```

### Error Handling

**Always Handle Errors:**
```javascript
// ✓ Good - comprehensive error handling
const getClient = async (clientId) => {
  try {
    const doc = await db.collection('clients').doc(clientId).get();
    
    if (!doc.exists) {
      throw new Error(`Client ${clientId} not found`);
    }
    
    return { id: doc.id, ...doc.data() };
    
  } catch (error) {
    console.error('Error fetching client:', error);
    
    // Log to monitoring service
    logError({
      function: 'getClient',
      clientId,
      error: error.message,
      timestamp: new Date()
    });
    
    // Re-throw or return appropriate error
    throw new Error('Failed to load client data. Please try again.');
  }
};
```

---

## Testing Strategy

### Unit Tests

**Test Pure Functions:**
```javascript
// dateCalculations.test.js
describe('calculateMonthsBetween', () => {
  it('calculates months correctly for same year', () => {
    const start = new Date('2024-01-15');
    const end = new Date('2024-06-15');
    expect(calculateMonthsBetween(start, end)).toBe(5);
  });
  
  it('calculates months correctly across years', () => {
    const start = new Date('2023-10-15');
    const end = new Date('2024-02-15');
    expect(calculateMonthsBetween(start, end)).toBe(4);
  });
  
  it('handles same date', () => {
    const date = new Date('2024-01-15');
    expect(calculateMonthsBetween(date, date)).toBe(0);
  });
});
```

**Test Matching Logic:**
```javascript
// matchingEngine.test.js
describe('Matching Engine', () => {
  const testProduct = {
    adverseCriteria: {
      ccjs: {
        allowed: true,
        maxCount: 2,
        maxValue: 1000,
        monthsSinceMostRecent: 36
      }
    }
  };
  
  it('matches client with qualifying CCJs', () => {
    const client = {
      hasCCJs: true,
      ccjCount: 1,
      ccjValue: 500,
      ccjDate: new Date('2020-01-15') // >36 months ago
    };
    
    expect(matchesProduct(client, testProduct)).toBe(true);
  });
  
  it('rejects client with too many CCJs', () => {
    const client = {
      hasCCJs: true,
      ccjCount: 3, // Exceeds maxCount of 2
      ccjValue: 500,
      ccjDate: new Date('2020-01-15')
    };
    
    expect(matchesProduct(client, testProduct)).toBe(false);
  });
});
```

### Integration Tests

**Test Complete Flows:**
```javascript
// clientSubmission.test.js
describe('Client Submission Flow', () => {
  it('completes full fact-find and matching', async () => {
    // 1. Submit fact-find
    const clientData = createTestClient();
    const clientId = await submitFactFind(clientData);
    expect(clientId).toBeDefined();
    
    // 2. Verify saved to Firebase
    const savedClient = await getClient(clientId);
    expect(savedClient.email).toBe(clientData.email);
    
    // 3. Run matching engine
    const matches = await runMatching(clientId);
    expect(matches.length).toBeGreaterThan(0);
    
    // 4. Verify results
    expect(matches[0].rate).toBeLessThan(0.1); // Sanity check
  });
});
```

### Test Data

**Create Reusable Test Fixtures:**
```javascript
// testFixtures.js
export const testClients = {
  cleanCredit: {
    firstName: 'John',
    lastName: 'Test',
    email: 'john@test.com',
    annualIncome: 50000,
    propertyValue: 300000,
    depositAmount: 75000,
    ltv: 75,
    hasCCJs: false,
    hasDefaults: false,
    // ... all required fields
  },
  
  singleCCJ: {
    firstName: 'Jane',
    lastName: 'Test',
    email: 'jane@test.com',
    annualIncome: 45000,
    propertyValue: 250000,
    depositAmount: 50000,
    ltv: 80,
    hasCCJs: true,
    ccjCount: 1,
    ccjValue: 800,
    ccjDate: new Date('2021-06-15'),
    ccjSatisfied: true,
    hasDefaults: false,
    // ... all required fields
  }
};
```

---

## Debugging Procedures

### Logging Standards

**Use Structured Logging:**
```javascript
// ✓ Good - structured, searchable logs
console.log('Matching product against client', {
  productId: product.id,
  productName: product.productName,
  clientId: client.id,
  ltvCheck: { client: client.ltv, min: product.minLTV, max: product.maxLTV },
  result: 'PASS'
});

// ✗ Bad - unstructured strings
console.log('Checking ' + product.productName + ' for client ' + client.id);
```

**Log Levels:**
```javascript
// ERROR - Something failed
console.error('Failed to save client:', error);

// WARN - Unexpected but handled
console.warn('Client LTV borderline:', client.ltv);

// INFO - Normal operations
console.log('Client matching completed:', { matches: results.length });

// DEBUG - Detailed troubleshooting (remove before production)
console.debug('CCJ criteria check:', { clientValue, maxValue, result });
```

### Debugging Matching Issues

**Use Downloadable Log Files:**
```javascript
const debugMatching = (client) => {
  const logs = [];
  
  // Log each check
  products.forEach(product => {
    logs.push(`\n=== ${product.productName} ===`);
    logs.push(`LTV Check: ${client.ltv} vs ${product.minLTV}-${product.maxLTV}: ${checkLTV ? 'PASS' : 'FAIL'}`);
    logs.push(`CCJ Check: ${client.ccjCount} vs max ${product.ccjs.maxCount}: ${checkCCJ ? 'PASS' : 'FAIL'}`);
    // ... all checks
  });
  
  // Download logs
  downloadLogs(logs.join('\n'));
};
```

### Browser Console Tips

**Use Console Groups:**
```javascript
console.group('Matching Client:', client.id);
console.log('Client Data:', client);
console.log('Running against', products.length, 'products');

products.forEach(product => {
  console.group(product.productName);
  console.log('Eligibility Checks:', checks);
  console.log('Result:', result ? '✓ Match' : '✗ No Match');
  console.groupEnd();
});

console.groupEnd();
```

---

## Git Workflow

### Branch Strategy

**Main Branches:**
- `main` - Production code only
- `develop` - Integration branch for features
- `staging` - Pre-production testing

**Feature Branches:**
- `feature/matching-engine-improvements`
- `feature/credit-roadmap`
- `bugfix/west-one-minbalance`

### Commit Messages

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting, missing semi-colons, etc.
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance tasks

**Examples:**
```
feat(matching): Add West One minBalance check

Implement special handling for West One Tier 1 products that require
minimum £500 balance for single adverse events. This prevents matching
clients with trivial credit issues.

Refs: matching-engine-docs.md "West One minBalance Requirement"

---

fix(firebase): Correct CCJ criteria field mapping

Fixed incorrect field reference in Bluestone AAA import script.
Changed adverseCriteria.ccjs.maxInPeriod from 0 to 1.

Closes #42

---

docs(roadmap): Add credit improvement roadmap documentation

Complete documentation for planned credit improvement roadmap feature
including technical implementation, regulatory considerations, and
lender permission strategy.
```

### Pull Request Process

1. **Create Feature Branch**
2. **Develop and Test**
3. **Update Documentation** if needed
4. **Create PR** with description
5. **Code Review** by at least one other person
6. **Address Feedback**
7. **Merge to Develop**
8. **Deploy to Staging**
9. **Test on Staging**
10. **Merge to Main** when ready for production

---

## Deployment Process

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] No console errors in browser
- [ ] Firebase security rules reviewed
- [ ] Staging environment tested
- [ ] Backup of production database
- [ ] Rollback plan prepared

### Deployment Steps

1. **Backup Production Data**
   ```bash
   # Firebase backup
   gcloud firestore export gs://backup-bucket/$(date +%Y%m%d)
   ```

2. **Deploy to Staging**
   ```bash
   git checkout staging
   git merge develop
   netlify deploy --site=staging-site-id
   ```

3. **Verify Staging**
   - Test critical user flows
   - Check matching engine
   - Verify Firebase connectivity
   - Review error logs

4. **Deploy to Production**
   ```bash
   git checkout main
   git merge staging
   netlify deploy --prod --site=production-site-id
   ```

5. **Post-Deployment Verification**
   - Smoke test critical features
   - Monitor error rates
   - Check performance metrics
   - Verify database connections

6. **Rollback if Needed**
   ```bash
   netlify rollback --site=production-site-id
   ```

---

## Performance Guidelines

### React Optimization

**Use React.memo for Expensive Components:**
```javascript
// ✓ Good - memoize expensive renders
const ProductCard = React.memo(({ product }) => {
  // Complex rendering logic
  return <div>{/* ... */}</div>;
});
```

**Lazy Load Components:**
```javascript
// ✓ Good - code splitting
const DashboardWidget = React.lazy(() => import('./DashboardWidget'));

function Dashboard() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardWidget />
    </Suspense>
  );
}
```

### Bundle Size

**Monitor Bundle Size:**
```bash
# Analyze bundle
npx webpack-bundle-analyzer
```

**Code Split Large Dependencies:**
```javascript
// ✓ Good - dynamic import for large libraries
const loadChartLibrary = async () => {
  const { Chart } = await import('chart.js');
  return Chart;
};
```

---

## Accessibility Standards

### Semantic HTML

```jsx
// ✓ Good - semantic elements
<nav>
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
  </ul>
</nav>

<main>
  <h1>Client Dashboard</h1>
  <section>
    <h2>Matched Products</h2>
    {/* ... */}
  </section>
</main>

// ✗ Bad - div soup
<div class="nav">
  <div class="menu">
    <div><span onClick={...}>Dashboard</span></div>
  </div>
</div>
```

### ARIA Labels

```jsx
// ✓ Good - accessible form
<label htmlFor="income">Annual Income</label>
<input
  id="income"
  type="number"
  aria-required="true"
  aria-describedby="income-help"
/>
<span id="income-help">Enter your gross annual income</span>

// Icons need labels
<button aria-label="Delete client">
  <TrashIcon aria-hidden="true" />
</button>
```

### Keyboard Navigation

```jsx
// ✓ Good - keyboard accessible
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyPress={(e) => e.key === 'Enter' && handleClick()}
>
  Click me
</div>
```

---

## Documentation Maintenance

### When to Update Documentation

**Always Update When:**
- Adding new features
- Changing existing functionality
- Fixing bugs that affect documented behavior
- Making architectural decisions
- Discovering edge cases

**Documentation Checklist:**
- [ ] README.md updated with new features
- [ ] API/function documentation updated
- [ ] Comments added for complex logic
- [ ] Strategic decisions log updated
- [ ] Related docs cross-referenced

### Documentation Review

**Quarterly Reviews:**
- Verify all documentation is current
- Remove outdated information
- Add missing documentation
- Improve clarity based on questions received

---

## Security Best Practices

### Client Data Protection

**Never Log Sensitive Data:**
```javascript
// ✓ Good - log IDs only
console.log('Processing client:', clientId);

// ✗ Bad - logs PII
console.log('Processing client:', client.email, client.phone);
```

**Sanitize User Input:**
```javascript
// ✓ Good - validate and sanitize
const sanitizedEmail = validator.normalizeEmail(userInput.email);
const validEmail = validator.isEmail(sanitizedEmail);
if (!validEmail) {
  throw new Error('Invalid email format');
}
```

**Use Environment Variables:**
```javascript
// ✓ Good - sensitive config in env vars
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  // ...
};

// ✗ Bad - hardcoded secrets
const apiKey = 'AIzaSyAbc123def456...'; // NEVER DO THIS
```

---

## Code Review Guidelines

### What to Look For

**Functionality:**
- Does code work as intended?
- Are edge cases handled?
- Is error handling appropriate?

**Code Quality:**
- Is code readable and maintainable?
- Are naming conventions followed?
- Is there appropriate documentation?

**Performance:**
- Are there any obvious bottlenecks?
- Could queries be more efficient?
- Is unnecessary re-rendering happening?

**Security:**
- Are inputs validated?
- Is sensitive data protected?
- Are security best practices followed?

### Providing Feedback

**Be Constructive:**
```
✓ "Consider extracting this logic into a separate function for reusability 
   and easier testing. See dateCalculations.js for similar patterns."

✗ "This code is messy."
```

**Explain Why:**
```
✓ "Using React.memo here would prevent unnecessary re-renders when parent 
   updates, improving performance for the product list."

✗ "Add React.memo."
```

---

## Version Control

### Version Numbers

Use Semantic Versioning: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features, backwards compatible
- **PATCH**: Bug fixes

**Examples:**
- `1.0.0` - Initial release
- `1.1.0` - Added credit roadmap feature
- `1.1.1` - Fixed West One matching bug
- `2.0.0` - Changed API contract

---

## Related Documentation

- See `README.md` for documentation navigation
- See `firebase-structure.md` for database standards
- See `matching-engine-docs.md` for algorithm documentation
- See `strategic-decisions.md` for architectural decisions

---

## Maintenance Schedule

**Daily:**
- Monitor error logs
- Check staging deployments

**Weekly:**
- Review pending PRs
- Update task tracking

**Monthly:**
- Review and update lender rate cards
- Check for dependency updates
- Review performance metrics

**Quarterly:**
- Documentation review and updates
- Security audit
- Dependency security review
- Performance optimization review

---

## Getting Help

**When Stuck:**
1. Check relevant documentation
2. Search existing code for similar patterns
3. Review test files for examples
4. Search GitHub issues
5. Ask for help with context

**Asking Good Questions:**
```
✓ "I'm implementing the credit roadmap feature and need to calculate months 
   between dates. I found calculateMonthsBetween in utils but it doesn't 
   account for leap years. Should I modify this function or create a new one? 
   See credit-improvement-roadmap.md section 'Date Calculations.'"

✗ "Date function broken, help?"
```

---

## Version History

**Version 1.0** (November 2024)
- Initial development guidelines
- Code standards established
- Testing strategy defined
- Deployment process documented
