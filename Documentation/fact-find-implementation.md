# Fact-Find Implementation Guide

## Overview
The Fact-Find form is an 11-step comprehensive mortgage application that collects all necessary information for adverse credit mortgage sourcing. This document details the implementation, field structure, validation logic, and data flow.

---

## Form Architecture

### Location
**File:** `src/pages/FactFind.js`

### Key Features
- **11-step progressive form** with visual progress tracking
- **Auto-save functionality** (debounced to prevent excessive writes)
- **Resume capability** (loads most recent incomplete application)
- **Field validation** with real-time feedback
- **Conditional logic** (shows/hides fields based on answers)
- **Dynamic arrays** (add multiple CCJs, defaults, income sources, etc.)
- **LTV auto-calculation** (updates as user enters property/deposit values)

### State Management

**Primary State:**
```javascript
const [currentStep, setCurrentStep] = useState(0);        // Current step index (0-10)
const [applicationId, setApplicationId] = useState(null); // Firebase document ID
const [saving, setSaving] = useState(false);              // Save in progress flag
const [userId, setUserId] = useState(null);               // Authenticated user ID
const [formData, setFormData] = useState({
  // 160+ fields stored here
});
```

---

## The 11 Steps

### Step 0: Personal Details

**Fields:**
- `fullName` (string, required)
- `dateOfBirth` (date, required)
- `maritalStatus` (select: single/married/divorced/widowed)
- `dependents` (number)
- `email` (string, required)
- `phone` (string, required)
- `nationality` (string)
- `niNumber` (string, format: XX123456X)
- `residentialStatus` (select: uk_citizen/permanent_resident/visa)

**Purpose:** Basic identity and contact information

**Validation:**
- Email format validation
- NI number format validation (2 letters, 6 digits, 1 letter)
- Phone number format
- Date of birth must be 18+ years old

---

### Step 1: Address History

**Fields:**
- `currentAddress` (string, required)
- `yearsAtAddress` (number)
- `monthsAtAddress` (number)
- `previousAddress` (string, conditional: if <3 years at current)
- `yearsAtPreviousAddress` (number)

**Purpose:** Establish 3-year address history for credit checks

**Conditional Logic:**
```javascript
// Show previous address fields if less than 3 years at current
const needsPreviousAddress = 
  (parseInt(formData.yearsAtAddress) || 0) < 3;
```

**Validation:**
- Total address history must cover 3+ years
- If current address < 3 years, previous address is required

---

### Step 2: Employment & Income

**Section A: Employment Status**
- `employmentStatus` (select: employed/self_employed/retired/unemployed/other)
- Conditional sections based on selection

**For Employed:**
- `employerName` (string)
- `jobTitle` (string)
- `yearsInJob` (number)
- `monthsInJob` (number)
- `employmentType` (select: permanent/contract/temporary/zero_hours)
- `basicSalary` (number, annual gross)
- `bonus` (number, annual)
- `overtime` (number, annual)
- `commission` (number, annual)

**For Self-Employed:**
- `selfEmployedYearsTrading` (number)
- `selfEmployedAccountant` (yes/no)
- `selfEmployedBusinessType` (select: sole_trader/partnership/limited_company)
- `selfEmployedYear1NetProfit` (number, most recent year)
- `selfEmployedYear2NetProfit` (number, previous year)
- `selfEmployedYear1Salary` (number, for directors)
- `selfEmployedYear2Salary` (number)
- `selfEmployedYear1Dividends` (number)
- `selfEmployedYear2Dividends` (number)

**Section B: Secondary Income**
- `hasSecondaryIncome` (yes/no)
- `secondaryIncomes` (array of income sources)
  - Each item: `{ source, amount, frequency }`

**Section C: Other Income**
- `rentalIncome` (number, monthly)
- `pensionIncome` (number, monthly)
- `benefitsIncome` (number, monthly)
- `maintenanceIncome` (number, monthly)
- `investmentIncome` (number, monthly)
- `otherIncomeSource` (string)
- `otherIncomeAmount` (number)

**Purpose:** Calculate total income for affordability assessment

**Income Calculation:**
```javascript
const calculateTotalIncome = () => {
  let total = 0;
  
  // Employment income
  total += parseFloat(formData.basicSalary) || 0;
  total += parseFloat(formData.bonus) || 0;
  total += parseFloat(formData.overtime) || 0;
  total += parseFloat(formData.commission) || 0;
  
  // Self-employed (average of 2 years)
  if (formData.employmentStatus === 'self_employed') {
    const year1 = (
      parseFloat(formData.selfEmployedYear1NetProfit) || 0 +
      parseFloat(formData.selfEmployedYear1Salary) || 0 +
      parseFloat(formData.selfEmployedYear1Dividends) || 0
    );
    const year2 = (
      parseFloat(formData.selfEmployedYear2NetProfit) || 0 +
      parseFloat(formData.selfEmployedYear2Salary) || 0 +
      parseFloat(formData.selfEmployedYear2Dividends) || 0
    );
    total += (year1 + year2) / 2;
  }
  
  // Other income (convert monthly to annual)
  total += (parseFloat(formData.rentalIncome) || 0) * 12;
  total += (parseFloat(formData.pensionIncome) || 0) * 12;
  total += (parseFloat(formData.benefitsIncome) || 0) * 12;
  
  return total;
};
```

---

### Step 3: Property Details

**Section A: Property Purpose**
- `propertyPurpose` (select: primary_residence/buy_to_let/second_home/investment)
- `purchaseType` (select: purchase/remortgage)

**Section B: Property Financials**
- `propertyValue` (number, required)
- `depositAmount` (number, required)
- `loanAmount` (number, auto-calculated: propertyValue - depositAmount)
- `calculatedLTV` (number, auto-calculated: (loanAmount/propertyValue) * 100)
- `mortgageTerm` (number, years, default: 25)

**LTV Auto-Calculation:**
```javascript
useEffect(() => {
  const property = parseFloat(formData.propertyValue) || 0;
  const deposit = parseFloat(formData.depositAmount) || 0;
  
  if (property > 0 && deposit > 0) {
    const loan = property - deposit;
    const ltv = (loan / property) * 100;
    
    setFormData(prev => ({
      ...prev,
      loanAmount: loan.toFixed(2),
      calculatedLTV: ltv.toFixed(2)
    }));
  }
}, [formData.propertyValue, formData.depositAmount]);
```

**Section C: Property Details**
- `propertyType` (select: house/flat/bungalow/maisonette/other)
- `propertyBedrooms` (number)
- `propertyConstruction` (select: standard/non_standard/new_build)
- `propertyTenure` (select: freehold/leasehold)
- `leaseYearsRemaining` (number, conditional: if leasehold)

**Section D: Remortgage Details** (conditional: if remortgage)
- `existingMortgageBalance` (number)
- `existingMortgageRate` (number)
- `existingMortgageLender` (string)
- `existingMortgageEndDate` (date)

**Section E: Current Housing Costs**
- `monthlyRent` (number, if currently renting)

**Purpose:** Understand property requirements and current situation

**Validation:**
- Property value must be > deposit amount
- LTV must be between 5% and 95%
- If leasehold, must have 70+ years remaining for mortgage

---

### Step 4: Financial Commitments

**Section A: Credit Cards**
- `creditCards` (array)
  - Each item: `{ provider, limit, balance, monthlyPayment }`

**Section B: Loans**
- `loans` (array)
  - Each item: `{ provider, balance, monthlyPayment, endDate }`

**Section C: Other Commitments**
- `carFinance` (number, monthly)
- `childMaintenance` (number, monthly)
- `councilTax` (number, monthly)
- `utilities` (number, monthly)
- `otherCommitments` (number, monthly)

**Purpose:** Calculate total monthly commitments for affordability

**Commitment Calculation:**
```javascript
const calculateTotalCommitments = () => {
  let total = 0;
  
  // Credit cards (minimum payments)
  formData.creditCards?.forEach(card => {
    total += parseFloat(card.monthlyPayment) || 0;
  });
  
  // Loans
  formData.loans?.forEach(loan => {
    total += parseFloat(loan.monthlyPayment) || 0;
  });
  
  // Other
  total += parseFloat(formData.carFinance) || 0;
  total += parseFloat(formData.childMaintenance) || 0;
  total += parseFloat(formData.councilTax) || 0;
  total += parseFloat(formData.utilities) || 0;
  total += parseFloat(formData.otherCommitments) || 0;
  
  return total;
};
```

**Dynamic Array Management:**
```javascript
const addCreditCard = () => {
  setFormData(prev => ({
    ...prev,
    creditCards: [
      ...(prev.creditCards || []),
      { provider: '', limit: '', balance: '', monthlyPayment: '' }
    ]
  }));
};

const removeCreditCard = (index) => {
  setFormData(prev => ({
    ...prev,
    creditCards: prev.creditCards.filter((_, i) => i !== index)
  }));
};

const updateCreditCard = (index, field, value) => {
  setFormData(prev => ({
    ...prev,
    creditCards: prev.creditCards.map((card, i) => 
      i === index ? { ...card, [field]: value } : card
    )
  }));
};
```

---

### Step 5: Adverse Credit

**Overview Question:**
- `hasAdverseCredit` (yes/no)

**Section A: CCJs (County Court Judgments)**
- `hasCCJs` (yes/no)
- `ccjs` (array, conditional)
  - Each item: `{ amount, dateRegistered, satisfied, reference }`

**Section B: Defaults**
- `hasDefaults` (yes/no)
- `defaults` (array, conditional)
  - Each item: `{ amount, dateRegistered, company, satisfied }`

**Section C: Mortgage Arrears**
- `hasMortgageArrears` (yes/no)
- `mortgageArrears` (array, conditional)
  - Each item: `{ amount, monthsMissed, dateOfArrears }`
- `currentlyInArrears` (yes/no)

**Section D: Unsecured Arrears**
- `hasUnsecuredArrears` (yes/no)
- `unsecuredArrears` (array, conditional)
  - Each item: `{ creditor, amount, monthsMissed }`

**Section E: Debt Management**
- `hasDebtManagement` (yes/no)
- `debtManagementType` (select: dmp/iva/dro, conditional)
- `debtManagementStartDate` (date)
- `debtManagementEndDate` (date)
- `debtManagementStatus` (select: active/completed)
- `debtManagementMonthsActive` (number)

**Section F: Bankruptcy**
- `hasBankruptcy` (yes/no)
- `bankruptcyDischargeDate` (date, conditional)

**Section G: Repossession**
- `hasRepossession` (yes/no)
- `repossessionDate` (date, conditional)

**Section H: IVA (Individual Voluntary Arrangement)**
- `hasIVA` (yes/no)
- `ivaStartDate` (date, conditional)
- `ivaDischargeDate` (date, conditional)
- `ivaStatus` (select: active/completed, conditional)

**Purpose:** Critical data for adverse credit lender matching

**Data Structure Example:**
```javascript
formData.ccjs = [
  {
    amount: "850",
    dateRegistered: "2020-06-15",
    satisfied: "yes",
    reference: "CCJ-12345"
  },
  {
    amount: "1200",
    dateRegistered: "2019-03-22",
    satisfied: "yes",
    reference: "CCJ-67890"
  }
];
```

**Adverse Credit Summary Calculation:**
```javascript
const calculateAdverseCreditSummary = () => {
  const totalCCJs = formData.ccjs?.length || 0;
  const totalCCJValue = formData.ccjs?.reduce(
    (sum, ccj) => sum + (parseFloat(ccj.amount) || 0), 0
  ) || 0;
  
  const totalDefaults = formData.defaults?.length || 0;
  const totalDefaultValue = formData.defaults?.reduce(
    (sum, def) => sum + (parseFloat(def.amount) || 0), 0
  ) || 0;
  
  const mostRecentCCJ = formData.ccjs?.length > 0
    ? new Date(Math.max(...formData.ccjs.map(c => new Date(c.dateRegistered))))
    : null;
    
  return {
    totalCCJs,
    totalCCJValue,
    totalDefaults,
    totalDefaultValue,
    mostRecentAdverseEvent: mostRecentCCJ
  };
};
```

---

### Step 6: Assets & Savings

**Section A: Savings**
- `totalSavings` (number)
- `depositSource` (select: savings/gift/sale_of_property/inheritance/other)
- `giftAmount` (number, conditional: if gift)
- `giftGiverRelationship` (string, conditional: if gift)
- `otherAssets` (string, description)

**Section B: Property Owned**
- `propertyOwned` (yes/no)
- `propertyOwnedValue` (number, conditional)
- `propertyOwnedMortgageBalance` (number, conditional)

**Purpose:** Verify deposit source and additional assets

**Equity Calculation:**
```javascript
const propertyEquity = 
  (parseFloat(formData.propertyOwnedValue) || 0) -
  (parseFloat(formData.propertyOwnedMortgageBalance) || 0);
```

---

### Step 7: Mortgage Preferences

**Section A: Repayment Structure**
- `repaymentType` (select: repayment/interest_only/part_and_part)
- `interestOnlyAmount` (number, conditional: if interest_only or part_and_part)
- `repaymentStrategy` (select, conditional: if interest_only)
  - Options: investment/sale_of_property/pension/savings/other

**Section B: Rate Preferences**
- `ratePreference` (select: fixed/variable/tracker/discount)
- `fixedRatePeriod` (select: 2/3/5/10 years, conditional: if fixed)

**Section C: Future Plans**
- `futurePlans` (text: any plans to move, downsize, etc.)
- `incomeChanges` (text: expected income changes)
- `planningChildren` (yes/no/unsure)
- `planningRetirement` (text: retirement plans)

**Purpose:** Match to appropriate product types

---

### Step 8: Protection & Insurance

**Section A: Life Insurance**
- `lifeInsurance` (yes/no)
- `lifeInsuranceCover` (number, conditional)

**Section B: Critical Illness**
- `criticalIllness` (yes/no)
- `criticalIllnessCover` (number, conditional)

**Section C: Income Protection**
- `incomeProtection` (yes/no)

**Section D: Buildings Insurance**
- `buildingsInsurance` (yes/no)

**Purpose:** Identify protection needs and compliance requirements

---

### Step 9: Goals & Concerns

**Section A: Primary Goal**
- `primaryGoal` (select)
  - Options: lowest_rate/lowest_payment/flexibility/speed/certainty

**Section B: Concerns**
- `concerns` (textarea)
  - Free text: any concerns about mortgage application

**Section C: Additional Information**
- `additionalInfo` (textarea)
  - Free text: anything else adviser should know

**Section D: Solicitor Preference**
- `solicitorPreference` (select: use_your_panel/use_my_own/undecided)

**Purpose:** Personalize advice and service delivery

---

### Step 10: Declaration & Consent

**Displays Summary:**
- Personal details
- Property requirements
- Income summary
- Commitments summary
- Adverse credit summary

**Required Consents:**
- `dataProtectionConsent` (checkbox, required)
  - "I consent to data processing in accordance with GDPR"
- `consentCreditCheck` (checkbox, required)
  - "I consent to credit searches being performed"
- `accuracyDeclaration` (checkbox, required)
  - "I declare all information provided is accurate"

**Purpose:** Legal compliance and final review

**Submission:**
```javascript
const handleSubmit = async () => {
  if (!formData.dataProtectionConsent || 
      !formData.consentCreditCheck || 
      !formData.accuracyDeclaration) {
    alert('Please accept all required declarations');
    return;
  }
  
  try {
    // Update application status to completed
    await updateDoc(doc(db, 'factFinds', applicationId), {
      ...formData,
      status: 'completed',
      completedAt: new Date(),
      lastUpdated: new Date()
    });
    
    // Navigate to matching results
    navigate('/sourcing-results', {
      state: { clientData: formData }
    });
  } catch (error) {
    console.error('Submission error:', error);
    alert('Failed to submit application. Please try again.');
  }
};
```

---

## Auto-Save Implementation

### Save Trigger

```javascript
// Auto-save on step change
const nextStep = async () => {
  setSaving(true);
  await saveToFirebase();
  setSaving(false);
  setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
};

const prevStep = async () => {
  setSaving(true);
  await saveToFirebase();
  setSaving(false);
  setCurrentStep(prev => Math.max(prev - 1, 0));
};
```

### Save Function

```javascript
const saveToFirebase = async () => {
  if (!userId) return;
  
  try {
    const dataToSave = {
      ...formData,
      userId: userId,
      currentStep: currentStep,
      lastUpdated: new Date(),
      status: 'in-progress'
    };
    
    if (applicationId) {
      // Update existing application
      await updateDoc(doc(db, 'factFinds', applicationId), dataToSave);
      console.log('✅ Application updated:', applicationId);
    } else {
      // Create new application
      const docRef = await addDoc(collection(db, 'factFinds'), {
        ...dataToSave,
        createdAt: new Date()
      });
      setApplicationId(docRef.id);
      console.log('✅ New application created:', docRef.id);
    }
  } catch (error) {
    console.error('❌ Save error:', error);
    // Show error to user
    alert('Failed to save progress. Please check your connection.');
  }
};
```

---

## Resume Functionality

### Load Existing Application

```javascript
const loadExistingApplication = async (uid) => {
  try {
    // Query for most recent in-progress application
    const q = query(
      collection(db, 'factFinds'),
      where('userId', '==', uid),
      orderBy('lastUpdated', 'desc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      console.log('✅ Loaded existing application:', doc.id);
      
      // Restore application ID and step
      setApplicationId(doc.id);
      setCurrentStep(data.currentStep || 0);
      
      // Restore all form data
      setFormData({
        fullName: data.fullName || '',
        dateOfBirth: data.dateOfBirth || '',
        // ... restore all 160+ fields
      });
    } else {
      console.log('📝 No existing application found - starting fresh');
    }
  } catch (error) {
    console.error('❌ Error loading application:', error);
  }
};

// Call on component mount
useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (user) {
      setUserId(user.uid);
      loadExistingApplication(user.uid);
    } else {
      navigate('/login');
    }
  });
  return () => unsubscribe();
}, [navigate]);
```

---

## Progress Tracking

### Visual Progress Bar

```javascript
<div className="w-full bg-gray-200 rounded-full h-2">
  <div 
    className="bg-blue-600 h-2 rounded-full transition-all"
    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
  />
</div>
<p className="text-center text-sm text-gray-600 mt-2">
  Step {currentStep + 1} of {steps.length} • 
  {Math.round((currentStep / (steps.length - 1)) * 100)}%
</p>
```

### Step Icons

```javascript
{steps.map((step, index) => {
  const Icon = step.icon;
  const isActive = index === currentStep;
  const isCompleted = index < currentStep;
  
  return (
    <div className={`rounded-full flex items-center justify-center ${
      isActive ? 'bg-blue-600 text-white' : 
      isCompleted ? 'bg-green-500 text-white' : 
      'bg-gray-200 text-gray-500'
    }`}>
      <Icon size={20} />
    </div>
  );
})}
```

---

## Field Validation

### Real-Time Validation

```javascript
const validateField = (fieldName, value) => {
  let error = '';
  
  switch(fieldName) {
    case 'email':
      if (!value.includes('@')) {
        error = 'Please enter a valid email';
      }
      break;
      
    case 'niNumber':
      const niPattern = /^[A-Z]{2}[0-9]{6}[A-Z]$/;
      if (!niPattern.test(value)) {
        error = 'Invalid NI number format (e.g. AB123456C)';
      }
      break;
      
    case 'propertyValue':
      if (parseFloat(value) <= 0) {
        error = 'Property value must be greater than 0';
      }
      break;
      
    case 'depositAmount':
      const property = parseFloat(formData.propertyValue);
      const deposit = parseFloat(value);
      if (deposit >= property) {
        error = 'Deposit must be less than property value';
      }
      break;
  }
  
  return error;
};
```

### Submit Validation

```javascript
const validateStep = (stepIndex) => {
  const errors = [];
  
  switch(stepIndex) {
    case 0: // Personal Details
      if (!formData.fullName) errors.push('Full name is required');
      if (!formData.dateOfBirth) errors.push('Date of birth is required');
      if (!formData.email) errors.push('Email is required');
      break;
      
    case 3: // Property Details
      if (!formData.propertyValue) errors.push('Property value is required');
      if (!formData.depositAmount) errors.push('Deposit amount is required');
      const ltv = parseFloat(formData.calculatedLTV);
      if (ltv < 5 || ltv > 95) {
        errors.push('LTV must be between 5% and 95%');
      }
      break;
      
    // ... validation for other steps
  }
  
  return errors;
};
```

---

## Data Mapping to Firebase

### Firestore Document Structure

```
factFinds/{applicationId}
{
  // Meta
  userId: string,
  createdAt: timestamp,
  lastUpdated: timestamp,
  currentStep: number,
  status: string (in-progress/completed),
  completedAt: timestamp (optional),
  
  // Personal (Step 0)
  fullName: string,
  dateOfBirth: string,
  maritalStatus: string,
  dependents: number,
  email: string,
  phone: string,
  nationality: string,
  niNumber: string,
  residentialStatus: string,
  
  // Address (Step 1)
  currentAddress: string,
  yearsAtAddress: number,
  monthsAtAddress: number,
  previousAddress: string,
  yearsAtPreviousAddress: number,
  
  // Employment (Step 2)
  employmentStatus: string,
  employerName: string,
  basicSalary: number,
  // ... all employment fields
  
  // Property (Step 3)
  propertyValue: number,
  depositAmount: number,
  loanAmount: number,
  calculatedLTV: number,
  // ... all property fields
  
  // Commitments (Step 4)
  creditCards: array,
  loans: array,
  carFinance: number,
  // ... all commitment fields
  
  // Adverse Credit (Step 5)
  hasCCJs: string (yes/no),
  ccjs: array [
    { amount, dateRegistered, satisfied, reference }
  ],
  hasDefaults: string (yes/no),
  defaults: array [
    { amount, dateRegistered, company, satisfied }
  ],
  // ... all adverse credit fields
  
  // Assets (Step 6)
  totalSavings: number,
  depositSource: string,
  // ... all asset fields
  
  // Preferences (Step 7)
  repaymentType: string,
  ratePreference: string,
  // ... all preference fields
  
  // Protection (Step 8)
  lifeInsurance: string (yes/no),
  // ... all protection fields
  
  // Goals (Step 9)
  primaryGoal: string,
  concerns: string,
  // ... all goal fields
  
  // Declarations (Step 10)
  dataProtectionConsent: boolean,
  consentCreditCheck: boolean,
  accuracyDeclaration: boolean
}
```

---

## Performance Optimizations

### Debounced Auto-Save (Planned)

```javascript
// Instead of saving on every keystroke, debounce saves
useEffect(() => {
  const saveTimer = setTimeout(() => {
    saveToFirebase();
  }, 2000); // Wait 2 seconds after last change
  
  return () => clearTimeout(saveTimer);
}, [formData]);
```

### Conditional Rendering

```javascript
// Only render current step content
const renderStepContent = () => {
  switch(currentStep) {
    case 0: return <PersonalDetailsStep />;
    case 1: return <AddressHistoryStep />;
    // ... only active step is rendered
    default: return null;
  }
};
```

---

## Error Handling

### Network Errors

```javascript
const saveToFirebase = async () => {
  try {
    await updateDoc(doc(db, 'factFinds', applicationId), dataToSave);
  } catch (error) {
    if (error.code === 'unavailable') {
      // Network issue - queue for retry
      queueSaveForRetry(dataToSave);
      alert('Connection lost. Your data will be saved when connection is restored.');
    } else {
      console.error('Save error:', error);
      alert('Failed to save. Please try again.');
    }
  }
};
```

### Data Validation Errors

```javascript
const nextStep = async () => {
  const errors = validateStep(currentStep);
  
  if (errors.length > 0) {
    setErrors(errors);
    // Show errors to user
    alert('Please fix the following errors:\n' + errors.join('\n'));
    return;
  }
  
  // Proceed to next step
  await saveToFirebase();
  setCurrentStep(prev => prev + 1);
};
```

---

## Testing Considerations

### Test Cases

**Data Persistence:**
- [ ] Form saves on step change
- [ ] Application ID is created on first save
- [ ] Subsequent saves update existing document
- [ ] Data loads correctly on page refresh
- [ ] Multiple sessions don't create duplicate applications

**Validation:**
- [ ] Required fields prevent progression
- [ ] Email format validation works
- [ ] NI number format validation works
- [ ] LTV calculation is accurate
- [ ] Date validations work correctly

**Conditional Logic:**
- [ ] Self-employed fields show/hide correctly
- [ ] Previous address shows if <3 years at current
- [ ] Adverse credit arrays work correctly
- [ ] Gift fields show when deposit source is "gift"

**User Flow:**
- [ ] Can navigate back and forth between steps
- [ ] Progress bar updates correctly
- [ ] Can resume from where they left off
- [ ] Final submission works correctly
- [ ] Navigates to results after submission

---

## Future Enhancements

### Planned Improvements

1. **Real-Time Validation**
   - Validate fields as user types
   - Show green checkmarks for valid fields
   - Instant feedback on errors

2. **Smart Defaults**
   - Pre-fill fields based on previous answers
   - Suggest typical values
   - Learn from user patterns

3. **Progress Saving Indicator**
   - Visual confirmation of auto-save
   - "Saved at HH:MM" timestamp
   - Retry button if save fails

4. **Field-Level Help**
   - Tooltips explaining each field
   - Examples for complex fields
   - Links to relevant guides

5. **Mobile Optimization**
   - Better keyboard handling for number inputs
   - Swipe between steps
   - Improved date pickers

6. **Accessibility**
   - ARIA labels on all fields
   - Keyboard navigation
   - Screen reader optimization

---

## Related Documentation

- See `application-architecture.md` for overall app structure
- See `firebase-structure.md` for complete database schema
- See `matching-engine-docs.md` for how fact-find data is used
- See `development-guidelines.md` for coding standards

---

## Version History

**Version 1.0** (November 2024)
- 11-step comprehensive fact-find
- Auto-save functionality
- Resume capability
- Dynamic arrays for adverse credit
- LTV auto-calculation
- Progress tracking
- Validation and error handling
