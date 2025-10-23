import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Home, User, Briefcase, DollarSign, CreditCard, Target, CheckCircle, AlertCircle, PlusCircle, Trash2, Calculator } from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, addDoc, doc, updateDoc, getDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

const FactFind = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [applicationId, setApplicationId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  
  // Get user ID from Firebase Auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        // Try to load existing application
        loadExistingApplication(user.uid);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const loadExistingApplication = async (uid) => {
    try {
      // Query for incomplete applications for this user (simpler query, no composite index needed)
      const q = query(
        collection(db, 'factFinds'),
        where('userId', '==', uid),
        orderBy('lastUpdated', 'desc'),
        limit(5)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Find the first incomplete one, or use the most recent
        let selectedDoc = null;
        
        for (const docSnapshot of querySnapshot.docs) {
          const data = docSnapshot.data();
          if (data.status !== 'completed') {
            selectedDoc = docSnapshot;
            break;
          }
        }
        
        // If no incomplete, use most recent
        if (!selectedDoc && querySnapshot.docs.length > 0) {
          selectedDoc = querySnapshot.docs[0];
        }
        
        if (selectedDoc) {
          const data = selectedDoc.data();
          
          console.log('✅ Loaded existing application:', selectedDoc.id);
          
          // Set the application ID
          setApplicationId(selectedDoc.id);
          
          // Set the current step
          setCurrentStep(data.currentStep || 0);
          
          // Populate all form data
          setFormData({
          // Personal Details
          fullName: data.fullName || '',
          dateOfBirth: data.dateOfBirth || '',
          maritalStatus: data.maritalStatus || '',
          dependents: data.dependents || '',
          currentAddress: data.currentAddress || '',
          yearsAtAddress: data.yearsAtAddress || '',
          monthsAtAddress: data.monthsAtAddress || '',
          previousAddress: data.previousAddress || '',
          yearsAtPreviousAddress: data.yearsAtPreviousAddress || '',
          email: data.email || '',
          phone: data.phone || '',
          nationality: data.nationality || '',
          niNumber: data.niNumber || '',
          residentialStatus: data.residentialStatus || '',
          
          // Employment & Income
          employmentStatus: data.employmentStatus || '',
          employerName: data.employerName || '',
          jobTitle: data.jobTitle || '',
          yearsInJob: data.yearsInJob || '',
          monthsInJob: data.monthsInJob || '',
          employmentType: data.employmentType || '',
          basicSalary: data.basicSalary || '',
          bonus: data.bonus || '',
          overtime: data.overtime || '',
          commission: data.commission || '',
          
          // Self-Employed
          selfEmployedYearsTrading: data.selfEmployedYearsTrading || '',
          selfEmployedAccountant: data.selfEmployedAccountant || '',
          selfEmployedBusinessType: data.selfEmployedBusinessType || '',
          selfEmployedYear1NetProfit: data.selfEmployedYear1NetProfit || '',
          selfEmployedYear2NetProfit: data.selfEmployedYear2NetProfit || '',
          selfEmployedYear1Salary: data.selfEmployedYear1Salary || '',
          selfEmployedYear2Salary: data.selfEmployedYear2Salary || '',
          selfEmployedYear1Dividends: data.selfEmployedYear1Dividends || '',
          selfEmployedYear2Dividends: data.selfEmployedYear2Dividends || '',
          
          // Secondary Income
          hasSecondaryIncome: data.hasSecondaryIncome || 'no',
          secondaryIncomes: data.secondaryIncomes || [],
          
          // Other Income
          rentalIncome: data.rentalIncome || '',
          pensionIncome: data.pensionIncome || '',
          benefitsIncome: data.benefitsIncome || '',
          maintenanceIncome: data.maintenanceIncome || '',
          investmentIncome: data.investmentIncome || '',
          otherIncomeSource: data.otherIncomeSource || '',
          otherIncomeAmount: data.otherIncomeAmount || '',
          
          // Property Details
          propertyPurpose: data.propertyPurpose || '',
          purchaseType: data.purchaseType || '',
          propertyValue: data.propertyValue || '',
          depositAmount: data.depositAmount || '',
          loanAmount: data.loanAmount || '',
          calculatedLTV: data.calculatedLTV || '',
          mortgageTerm: data.mortgageTerm || '25',
          propertyType: data.propertyType || '',
          propertyBedrooms: data.propertyBedrooms || '',
          propertyConstruction: data.propertyConstruction || '',
          propertyTenure: data.propertyTenure || '',
          leaseYearsRemaining: data.leaseYearsRemaining || '',
          
          // Existing Mortgage
          existingMortgageBalance: data.existingMortgageBalance || '',
          existingMortgageRate: data.existingMortgageRate || '',
          existingMortgageLender: data.existingMortgageLender || '',
          existingMortgageEndDate: data.existingMortgageEndDate || '',
          
          // Financial Commitments
          monthlyRent: data.monthlyRent || '',
          creditCards: data.creditCards || [],
          loans: data.loans || [],
          carFinance: data.carFinance || '',
          childMaintenance: data.childMaintenance || '',
          councilTax: data.councilTax || '',
          utilities: data.utilities || '',
          otherCommitments: data.otherCommitments || '',
          
          // Adverse Credit
          hasAdverseCredit: data.hasAdverseCredit || 'no',
          hasCCJs: data.hasCCJs || 'no',
          ccjs: data.ccjs || [],
          hasDefaults: data.hasDefaults || 'no',
          defaults: data.defaults || [],
          hasMortgageArrears: data.hasMortgageArrears || 'no',
          mortgageArrears: data.mortgageArrears || [],
          currentlyInArrears: data.currentlyInArrears || 'no',
          hasUnsecuredArrears: data.hasUnsecuredArrears || 'no',
          unsecuredArrears: data.unsecuredArrears || [],
          hasDebtManagement: data.hasDebtManagement || 'no',
          debtManagementType: data.debtManagementType || '',
          debtManagementStartDate: data.debtManagementStartDate || '',
          debtManagementEndDate: data.debtManagementEndDate || '',
          debtManagementStatus: data.debtManagementStatus || '',
          debtManagementMonthsActive: data.debtManagementMonthsActive || '',
          hasBankruptcy: data.hasBankruptcy || 'no',
          bankruptcyDischargeDate: data.bankruptcyDischargeDate || '',
          hasRepossession: data.hasRepossession || 'no',
          repossessionDate: data.repossessionDate || '',
          hasIVA: data.hasIVA || 'no',
          ivaStartDate: data.ivaStartDate || '',
          ivaDischargeDate: data.ivaDischargeDate || '',
          ivaStatus: data.ivaStatus || '',
          
          // Assets & Savings
          totalSavings: data.totalSavings || '',
          depositSource: data.depositSource || '',
          giftAmount: data.giftAmount || '',
          giftGiverRelationship: data.giftGiverRelationship || '',
          otherAssets: data.otherAssets || '',
          propertyOwned: data.propertyOwned || 'no',
          propertyOwnedValue: data.propertyOwnedValue || '',
          propertyOwnedMortgageBalance: data.propertyOwnedMortgageBalance || '',
          
          // Repayment Preferences
          repaymentType: data.repaymentType || '',
          interestOnlyAmount: data.interestOnlyAmount || '',
          repaymentStrategy: data.repaymentStrategy || '',
          ratePreference: data.ratePreference || '',
          fixedRatePeriod: data.fixedRatePeriod || '',
          
          // Future Plans
          futurePlans: data.futurePlans || '',
          incomeChanges: data.incomeChanges || '',
          planningChildren: data.planningChildren || '',
          planningRetirement: data.planningRetirement || '',
          
          // Protection
          lifeInsurance: data.lifeInsurance || 'no',
          lifeInsuranceCover: data.lifeInsuranceCover || '',
          criticalIllness: data.criticalIllness || 'no',
          criticalIllnessCover: data.criticalIllnessCover || '',
          incomeProtection: data.incomeProtection || 'no',
          buildingsInsurance: data.buildingsInsurance || 'no',
          
          // Objectives
          primaryGoal: data.primaryGoal || '',
          concerns: data.concerns || '',
          additionalInfo: data.additionalInfo || '',
          solicitorPreference: data.solicitorPreference || '',
          
          // Consent
          consentCreditCheck: data.consentCreditCheck || false,
          dataProtectionConsent: data.dataProtectionConsent || false,
          accuracyDeclaration: data.accuracyDeclaration || false
          });
          
          console.log('✅ Form populated with existing data');
        } else {
          console.log('ℹ️ No existing application found, starting fresh');
        }
      } else {
        console.log('ℹ️ No existing application found, starting fresh');
      }
    } catch (error) {
      console.error('❌ Error loading existing application:', error);
    }
  };
  
  const [formData, setFormData] = useState({
    // Personal Details
    fullName: '',
    dateOfBirth: '',
    maritalStatus: '',
    dependents: '',
    currentAddress: '',
    yearsAtAddress: '',
    monthsAtAddress: '',
    previousAddress: '',
    yearsAtPreviousAddress: '',
    email: '',
    phone: '',
    nationality: '',
    niNumber: '',
    residentialStatus: '',
    
    // Employment & Income - PRIMARY
    employmentStatus: '',
    employerName: '',
    jobTitle: '',
    yearsInJob: '',
    monthsInJob: '',
    employmentType: '',
    basicSalary: '',
    bonus: '',
    overtime: '',
    commission: '',
    
    // Self-Employed Details
    selfEmployedYearsTrading: '',
    selfEmployedAccountant: '',
    selfEmployedBusinessType: '',
    selfEmployedYear1NetProfit: '',
    selfEmployedYear2NetProfit: '',
    selfEmployedYear1Salary: '',
    selfEmployedYear2Salary: '',
    selfEmployedYear1Dividends: '',
    selfEmployedYear2Dividends: '',
    
    // Secondary Income
    hasSecondaryIncome: 'no',
    secondaryIncomes: [],
    
    // Other Income
    rentalIncome: '',
    pensionIncome: '',
    benefitsIncome: '',
    maintenanceIncome: '',
    investmentIncome: '',
    otherIncomeSource: '',
    otherIncomeAmount: '',
    
    // Property Details
    propertyPurpose: '',
    purchaseType: '',
    propertyValue: '',
    depositAmount: '',
    loanAmount: '',
    calculatedLTV: '',
    mortgageTerm: '25',
    propertyType: '',
    propertyBedrooms: '',
    propertyConstruction: '',
    propertyTenure: '',
    leaseYearsRemaining: '',
    
    // Existing Mortgage
    existingMortgageBalance: '',
    existingMortgageRate: '',
    existingMortgageLender: '',
    existingMortgageEndDate: '',
    
    // Financial Commitments
    monthlyRent: '',
    creditCards: [],
    loans: [],
    carFinance: '',
    childMaintenance: '',
    councilTax: '',
    utilities: '',
    otherCommitments: '',
    
    // ADVERSE CREDIT
    hasAdverseCredit: 'no',
    
    // CCJs
    hasCCJs: 'no',
    ccjs: [],
    
    // Defaults
    hasDefaults: 'no',
    defaults: [],
    
    // Mortgage Arrears
    hasMortgageArrears: 'no',
    mortgageArrears: [],
    currentlyInArrears: 'no',
    
    // Unsecured Arrears
    hasUnsecuredArrears: 'no',
    unsecuredArrears: [],
    
    // Debt Management
    hasDebtManagement: 'no',
    debtManagementType: '',
    debtManagementStartDate: '',
    debtManagementEndDate: '',
    debtManagementStatus: '',
    debtManagementMonthsActive: '',
    
    // Bankruptcy
    hasBankruptcy: 'no',
    bankruptcyDischargeDate: '',
    
    // Repossession
    hasRepossession: 'no',
    repossessionDate: '',
    
    // IVA
    hasIVA: 'no',
    ivaStartDate: '',
    ivaDischargeDate: '',
    ivaStatus: '',
    
    // Assets & Savings
    totalSavings: '',
    depositSource: '',
    giftAmount: '',
    giftGiverRelationship: '',
    otherAssets: '',
    propertyOwned: 'no',
    propertyOwnedValue: '',
    propertyOwnedMortgageBalance: '',
    
    // Repayment Preferences
    repaymentType: '',
    interestOnlyAmount: '',
    repaymentStrategy: '',
    ratePreference: '',
    fixedRatePeriod: '',
    
    // Future Plans
    futurePlans: '',
    incomeChanges: '',
    planningChildren: '',
    planningRetirement: '',
    
    // Protection
    lifeInsurance: 'no',
    lifeInsuranceCover: '',
    criticalIllness: 'no',
    criticalIllnessCover: '',
    incomeProtection: 'no',
    buildingsInsurance: 'no',
    
    // Objectives
    primaryGoal: '',
    concerns: '',
    additionalInfo: '',
    solicitorPreference: '',
    
    // Consent
    consentCreditCheck: false,
    dataProtectionConsent: false,
    accuracyDeclaration: false
  });

  const steps = [
    { id: 0, title: 'Personal Details', icon: User },
    { id: 1, title: 'Address History', icon: Home },
    { id: 2, title: 'Employment & Income', icon: Briefcase },
    { id: 3, title: 'Secondary Income', icon: DollarSign },
    { id: 4, title: 'Property Details', icon: Home },
    { id: 5, title: 'Financial Commitments', icon: CreditCard },
    { id: 6, title: 'Adverse Credit', icon: AlertCircle },
    { id: 7, title: 'Credit Details', icon: CreditCard },
    { id: 8, title: 'Assets & Protection', icon: Target },
    { id: 9, title: 'Preferences & Goals', icon: Target },
    { id: 10, title: 'Review & Submit', icon: CheckCircle }
  ];

  // Auto-calculate LTV
  useEffect(() => {
    if (formData.propertyValue && formData.depositAmount) {
      const value = parseFloat(formData.propertyValue);
      const deposit = parseFloat(formData.depositAmount);
      const loan = value - deposit;
      const ltv = ((loan / value) * 100).toFixed(2);
      
      setFormData(prev => ({
        ...prev,
        loanAmount: loan.toString(),
        calculatedLTV: ltv
      }));
    }
  }, [formData.propertyValue, formData.depositAmount]);

  // Save to Firebase after each step
  const saveToFirebase = async () => {
    if (!userId) return;
    
    setSaving(true);
    try {
      const applicationData = {
        ...formData,
        userId,
        lastUpdated: new Date().toISOString(),
        currentStep,
        completionPercentage: Math.round((currentStep / (steps.length - 1)) * 100)
      };

      if (applicationId) {
        await updateDoc(doc(db, 'factFinds', applicationId), applicationData);
      } else {
        const docRef = await addDoc(collection(db, 'factFinds'), applicationData);
        setApplicationId(docRef.id);
      }
      
      console.log('✅ Saved to Firebase');
    } catch (error) {
      console.error('❌ Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // Array handlers
  const addCCJ = () => {
    setFormData(prev => ({
      ...prev,
      ccjs: [...prev.ccjs, { amount: '', dateRegistered: '', dateSatisfied: '', satisfied: 'no', courtName: '' }]
    }));
  };

  const removeCCJ = (index) => {
    setFormData(prev => ({
      ...prev,
      ccjs: prev.ccjs.filter((_, i) => i !== index)
    }));
  };

  const updateCCJ = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      ccjs: prev.ccjs.map((ccj, i) => i === index ? { ...ccj, [field]: value } : ccj)
    }));
  };

  const addDefault = () => {
    setFormData(prev => ({
      ...prev,
      defaults: [...prev.defaults, { amount: '', dateRegistered: '', dateSatisfied: '', satisfied: 'no', creditor: '', type: '' }]
    }));
  };

  const removeDefault = (index) => {
    setFormData(prev => ({
      ...prev,
      defaults: prev.defaults.filter((_, i) => i !== index)
    }));
  };

  const updateDefault = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      defaults: prev.defaults.map((def, i) => i === index ? { ...def, [field]: value } : def)
    }));
  };

  const addMortgageArrear = () => {
    setFormData(prev => ({
      ...prev,
      mortgageArrears: [...prev.mortgageArrears, { when: '', amountArrears: '', missedPayments: '' }]
    }));
  };

  const removeMortgageArrear = (index) => {
    setFormData(prev => ({
      ...prev,
      mortgageArrears: prev.mortgageArrears.filter((_, i) => i !== index)
    }));
  };

  const updateMortgageArrear = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      mortgageArrears: prev.mortgageArrears.map((arrear, i) => i === index ? { ...arrear, [field]: value } : arrear)
    }));
  };

  const addSecondaryIncome = () => {
    setFormData(prev => ({
      ...prev,
      secondaryIncomes: [...prev.secondaryIncomes, { type: '', employer: '', amount: '', yearsReceiving: '' }]
    }));
  };

  const removeSecondaryIncome = (index) => {
    setFormData(prev => ({
      ...prev,
      secondaryIncomes: prev.secondaryIncomes.filter((_, i) => i !== index)
    }));
  };

  const updateSecondaryIncome = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      secondaryIncomes: prev.secondaryIncomes.map((income, i) => i === index ? { ...income, [field]: value } : income)
    }));
  };

  const addCreditCard = () => {
    setFormData(prev => ({
      ...prev,
      creditCards: [...prev.creditCards, { provider: '', balance: '', limit: '', monthlyPayment: '' }]
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
      creditCards: prev.creditCards.map((card, i) => i === index ? { ...card, [field]: value } : card)
    }));
  };

  const addLoan = () => {
    setFormData(prev => ({
      ...prev,
      loans: [...prev.loans, { provider: '', balance: '', monthlyPayment: '', endDate: '' }]
    }));
  };

  const removeLoan = (index) => {
    setFormData(prev => ({
      ...prev,
      loans: prev.loans.filter((_, i) => i !== index)
    }));
  };

  const updateLoan = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      loans: prev.loans.map((loan, i) => i === index ? { ...loan, [field]: value } : loan)
    }));
  };

  const nextStep = async () => {
    if (currentStep < steps.length - 1) {
      await saveToFirebase();
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    await saveToFirebase();
    
    if (applicationId) {
      await updateDoc(doc(db, 'factFinds', applicationId), {
        status: 'completed',
        completedAt: new Date().toISOString()
      });
    }
    
    alert('🎉 Application submitted successfully! We\'ll be in touch shortly.');
    navigate('/portal');
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 0:
        // PERSONAL DETAILS
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="John Smith"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="john@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="07XXX XXXXXX"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status *</label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select...</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="civil_partnership">Civil Partnership</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                  <option value="separated">Separated</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dependents</label>
                <input
                  type="number"
                  name="dependents"
                  value={formData.dependents}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality *</label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="British"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NI Number</label>
                <input
                  type="text"
                  name="niNumber"
                  value={formData.niNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="AB123456C"
                />
              </div>
            </div>
          </div>
        );

      case 1:
        // ADDRESS HISTORY
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Address History</h2>
            <p className="text-gray-600">Lenders need 3 years of address history.</p>
            
            <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Current Address</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
                  <input
                    type="text"
                    name="currentAddress"
                    value={formData.currentAddress}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="123 High Street, London, SW1A 1AA"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Years *</label>
                    <input
                      type="number"
                      name="yearsAtAddress"
                      value={formData.yearsAtAddress}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Months *</label>
                    <input
                      type="number"
                      name="monthsAtAddress"
                      value={formData.monthsAtAddress}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="11"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                    <select
                      name="residentialStatus"
                      value={formData.residentialStatus}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="owner">Owner</option>
                      <option value="tenant">Tenant</option>
                      <option value="living_with_parents">Living with Parents</option>
                    </select>
                  </div>
                </div>
                
                {formData.residentialStatus === 'tenant' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent *</label>
                    <input
                      type="number"
                      name="monthlyRent"
                      value={formData.monthlyRent}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="1200"
                    />
                  </div>
                )}
              </div>
            </div>
            
            {(parseInt(formData.yearsAtAddress) || 0) < 3 && (
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Previous Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <input
                      type="text"
                      name="previousAddress"
                      value={formData.previousAddress}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Years *</label>
                    <input
                      type="number"
                      name="yearsAtPreviousAddress"
                      value={formData.yearsAtPreviousAddress}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.5"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        // EMPLOYMENT & INCOME
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Employment & Income</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status *</label>
              <select
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select...</option>
                <option value="employed">Employed</option>
                <option value="self_employed">Self-Employed</option>
                <option value="director">Company Director</option>
                <option value="retired">Retired</option>
              </select>
            </div>
            
            {(formData.employmentStatus === 'employed' || formData.employmentStatus === 'director') && (
              <div className="bg-white border-2 border-blue-200 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employer *</label>
                    <input
                      type="text"
                      name="employerName"
                      value={formData.employerName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type *</label>
                    <select
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="permanent">Permanent</option>
                      <option value="contract">Contract</option>
                      <option value="temporary">Temporary</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Years in Job *</label>
                    <input
                      type="number"
                      name="yearsInJob"
                      value={formData.yearsInJob}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      step="0.1"
                      required
                    />
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Annual Income</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">£</span>
                        <input
                          type="number"
                          name="basicSalary"
                          value={formData.basicSalary}
                          onChange={handleInputChange}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="45000"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bonus</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">£</span>
                        <input
                          type="number"
                          name="bonus"
                          value={formData.bonus}
                          onChange={handleInputChange}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Overtime</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">£</span>
                        <input
                          type="number"
                          name="overtime"
                          value={formData.overtime}
                          onChange={handleInputChange}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Commission</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">£</span>
                        <input
                          type="number"
                          name="commission"
                          value={formData.commission}
                          onChange={handleInputChange}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                    <p className="text-sm text-green-800">
                      <strong>Total: £{(
                        (parseInt(formData.basicSalary) || 0) +
                        (parseInt(formData.bonus) || 0) +
                        (parseInt(formData.overtime) || 0) +
                        (parseInt(formData.commission) || 0)
                      ).toLocaleString()}</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {formData.employmentStatus === 'self_employed' && (
              <div className="bg-white border-2 border-blue-200 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold">Self-Employment Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Type *</label>
                    <select
                      name="selfEmployedBusinessType"
                      value={formData.selfEmployedBusinessType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="sole_trader">Sole Trader</option>
                      <option value="partnership">Partnership</option>
                      <option value="ltd_company">Limited Company</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Years Trading *</label>
                    <input
                      type="number"
                      name="selfEmployedYearsTrading"
                      value={formData.selfEmployedYearsTrading}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      step="0.1"
                      required
                    />
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Last 2 Years Income</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.selfEmployedBusinessType === 'ltd_company' ? (
                      <>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h5 className="font-medium mb-3">Year 1 (Recent)</h5>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs mb-1">Salary</label>
                              <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">£</span>
                                <input
                                  type="number"
                                  name="selfEmployedYear1Salary"
                                  value={formData.selfEmployedYear1Salary}
                                  onChange={handleInputChange}
                                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs mb-1">Dividends</label>
                              <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">£</span>
                                <input
                                  type="number"
                                  name="selfEmployedYear1Dividends"
                                  value={formData.selfEmployedYear1Dividends}
                                  onChange={handleInputChange}
                                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h5 className="font-medium mb-3">Year 2 (Previous)</h5>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs mb-1">Salary</label>
                              <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">£</span>
                                <input
                                  type="number"
                                  name="selfEmployedYear2Salary"
                                  value={formData.selfEmployedYear2Salary}
                                  onChange={handleInputChange}
                                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs mb-1">Dividends</label>
                              <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">£</span>
                                <input
                                  type="number"
                                  name="selfEmployedYear2Dividends"
                                  value={formData.selfEmployedYear2Dividends}
                                  onChange={handleInputChange}
                                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h5 className="font-medium mb-3">Year 1</h5>
                          <label className="block text-xs mb-1">Net Profit</label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">£</span>
                            <input
                              type="number"
                              name="selfEmployedYear1NetProfit"
                              value={formData.selfEmployedYear1NetProfit}
                              onChange={handleInputChange}
                              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h5 className="font-medium mb-3">Year 2</h5>
                          <label className="block text-xs mb-1">Net Profit</label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">£</span>
                            <input
                              type="number"
                              name="selfEmployedYear2NetProfit"
                              value={formData.selfEmployedYear2NetProfit}
                              onChange={handleInputChange}
                              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        // SECONDARY INCOME
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Additional Income</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Do you have any other income? *</label>
              <select
                name="hasSecondaryIncome"
                value={formData.hasSecondaryIncome}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            
            {formData.hasSecondaryIncome === 'yes' && (
              <div className="space-y-4">
                {formData.secondaryIncomes.map((income, index) => (
                  <div key={index} className="bg-white border-2 border-gray-200 rounded-lg p-4 relative">
                    <button
                      onClick={() => removeSecondaryIncome(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                    
                    <h3 className="font-semibold mb-3">Income Source #{index + 1}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-1">Type</label>
                        <select
                          value={income.type}
                          onChange={(e) => updateSecondaryIncome(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select...</option>
                          <option value="employment">Employment</option>
                          <option value="self_employment">Self-Employment</option>
                          <option value="rental">Rental Income</option>
                          <option value="pension">Pension</option>
                          <option value="benefits">Benefits</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm mb-1">Source</label>
                        <input
                          type="text"
                          value={income.employer}
                          onChange={(e) => updateSecondaryIncome(index, 'employer', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm mb-1">Annual Amount</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-500">£</span>
                          <input
                            type="number"
                            value={income.amount}
                            onChange={(e) => updateSecondaryIncome(index, 'amount', e.target.value)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm mb-1">Years Receiving</label>
                        <input
                          type="number"
                          value={income.yearsReceiving}
                          onChange={(e) => updateSecondaryIncome(index, 'yearsReceiving', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          step="0.1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addSecondaryIncome}
                  className="w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2"
                >
                  <PlusCircle size={20} />
                  Add Income Source
                </button>
              </div>
            )}
          </div>
        );

      case 4:
        // PROPERTY DETAILS
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Property Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
                <select
                  name="propertyPurpose"
                  value={formData.propertyPurpose}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select...</option>
                  <option value="purchase">Purchase</option>
                  <option value="remortgage">Remortgage</option>
                  <option value="shared_ownership">Shared Ownership</option>
                </select>
              </div>
              
              {formData.propertyPurpose === 'purchase' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Type *</label>
                  <select
                    name="purchaseType"
                    value={formData.purchaseType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="first_time_buyer">First Time Buyer</option>
                    <option value="next_time_buyer">Home Mover</option>
                    <option value="buy_to_let">Buy to Let</option>
                  </select>
                </div>
              )}
            </div>
            
            <div className="bg-white border-2 border-blue-200 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Property Value & Deposit</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Value *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">£</span>
                    <input
                      type="number"
                      name="propertyValue"
                      value={formData.propertyValue}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="250000"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deposit *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">£</span>
                    <input
                      type="number"
                      name="depositAmount"
                      value={formData.depositAmount}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="25000"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {formData.propertyValue && formData.depositAmount && (
                <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-300 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="text-blue-600" size={20} />
                    <span className="font-semibold">Auto-Calculated</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Loan Amount:</div>
                      <div className="text-xl font-bold">£{parseInt(formData.loanAmount).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">LTV:</div>
                      <div className={`text-xl font-bold ${
                        parseFloat(formData.calculatedLTV) <= 75 ? 'text-green-600' :
                        parseFloat(formData.calculatedLTV) <= 85 ? 'text-blue-600' :
                        parseFloat(formData.calculatedLTV) <= 90 ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {formData.calculatedLTV}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mortgage Term (Years) *</label>
                <input
                  type="number"
                  name="mortgageTerm"
                  value={formData.mortgageTerm}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="5"
                  max="40"
                  required
                />
              </div>
            </div>
            
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Property Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="detached_house">Detached House</option>
                    <option value="semi_detached">Semi-Detached</option>
                    <option value="terraced">Terraced</option>
                    <option value="flat">Flat</option>
                    <option value="bungalow">Bungalow</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms *</label>
                  <input
                    type="number"
                    name="propertyBedrooms"
                    value={formData.propertyBedrooms}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Construction *</label>
                  <select
                    name="propertyConstruction"
                    value={formData.propertyConstruction}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="standard">Standard (Brick/Stone)</option>
                    <option value="non_standard">Non-Standard</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tenure *</label>
                  <select
                    name="propertyTenure"
                    value={formData.propertyTenure}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="freehold">Freehold</option>
                    <option value="leasehold">Leasehold</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        // FINANCIAL COMMITMENTS
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Financial Commitments</h2>
            
            <div className="bg-white border-2 border-blue-200 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Credit Cards</h3>
              
              {formData.creditCards.map((card, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 relative">
                  <button
                    onClick={() => removeCreditCard(index)}
                    className="absolute top-2 right-2 text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs mb-1">Provider</label>
                      <input
                        type="text"
                        value={card.provider}
                        onChange={(e) => updateCreditCard(index, 'provider', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Balance</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500 text-sm">£</span>
                        <input
                          type="number"
                          value={card.balance}
                          onChange={(e) => updateCreditCard(index, 'balance', e.target.value)}
                          className="w-full pl-8 px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Limit</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500 text-sm">£</span>
                        <input
                          type="number"
                          value={card.limit}
                          onChange={(e) => updateCreditCard(index, 'limit', e.target.value)}
                          className="w-full pl-8 px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Monthly Payment</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500 text-sm">£</span>
                        <input
                          type="number"
                          value={card.monthlyPayment}
                          onChange={(e) => updateCreditCard(index, 'monthlyPayment', e.target.value)}
                          className="w-full pl-8 px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={addCreditCard}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <PlusCircle size={18} />
                Add Credit Card
              </button>
            </div>
            
            <div className="bg-white border-2 border-blue-200 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Loans</h3>
              
              {formData.loans.map((loan, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 relative">
                  <button
                    onClick={() => removeLoan(index)}
                    className="absolute top-2 right-2 text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs mb-1">Lender</label>
                      <input
                        type="text"
                        value={loan.provider}
                        onChange={(e) => updateLoan(index, 'provider', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Balance</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500 text-sm">£</span>
                        <input
                          type="number"
                          value={loan.balance}
                          onChange={(e) => updateLoan(index, 'balance', e.target.value)}
                          className="w-full pl-8 px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Monthly Payment</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500 text-sm">£</span>
                        <input
                          type="number"
                          value={loan.monthlyPayment}
                          onChange={(e) => updateLoan(index, 'monthlyPayment', e.target.value)}
                          className="w-full pl-8 px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs mb-1">End Date</label>
                      <input
                        type="date"
                        value={loan.endDate}
                        onChange={(e) => updateLoan(index, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={addLoan}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <PlusCircle size={18} />
                Add Loan
              </button>
            </div>
            
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Other Monthly Commitments</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Car Finance</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">£</span>
                    <input
                      type="number"
                      name="carFinance"
                      value={formData.carFinance}
                      onChange={handleInputChange}
                      className="w-full pl-8 px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1">Child Maintenance</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">£</span>
                    <input
                      type="number"
                      name="childMaintenance"
                      value={formData.childMaintenance}
                      onChange={handleInputChange}
                      className="w-full pl-8 px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1">Council Tax</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">£</span>
                    <input
                      type="number"
                      name="councilTax"
                      value={formData.councilTax}
                      onChange={handleInputChange}
                      className="w-full pl-8 px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1">Utilities</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">£</span>
                    <input
                      type="number"
                      name="utilities"
                      value={formData.utilities}
                      onChange={handleInputChange}
                      className="w-full pl-8 px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        // ADVERSE CREDIT OVERVIEW
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Credit History</h2>
            <p className="text-gray-600">This section is crucial for finding you the right lender.</p>
            
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-orange-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-orange-900 mb-2">Why We Need This</h3>
                  <p className="text-sm text-orange-800">
                    Specialist lenders have specific criteria for different credit issues. The more honest you are, the better we can match you.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* CCJs */}
              <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">County Court Judgments (CCJs)</h3>
                  <select
                    name="hasCCJs"
                    value={formData.hasCCJs}
                    onChange={handleInputChange}
                    className="px-3 py-1 border rounded-lg"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>
              
              {/* Defaults */}
              <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Defaults</h3>
                  <select
                    name="hasDefaults"
                    value={formData.hasDefaults}
                    onChange={handleInputChange}
                    className="px-3 py-1 border rounded-lg"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>
              
              {/* Mortgage Arrears */}
              <div className="bg-white border-2 border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Mortgage/Secured Arrears</h3>
                  <select
                    name="hasMortgageArrears"
                    value={formData.hasMortgageArrears}
                    onChange={handleInputChange}
                    className="px-3 py-1 border rounded-lg"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>
              
              {/* Debt Management */}
              <div className="bg-white border-2 border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">DMP / IVA / DRO</h3>
                  <select
                    name="hasDebtManagement"
                    value={formData.hasDebtManagement}
                    onChange={handleInputChange}
                    className="px-3 py-1 border rounded-lg"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>
              
              {/* Bankruptcy */}
              <div className="bg-white border-2 border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Bankruptcy</h3>
                  <select
                    name="hasBankruptcy"
                    value={formData.hasBankruptcy}
                    onChange={handleInputChange}
                    className="px-3 py-1 border rounded-lg"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        // DETAILED CREDIT INFO
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Detailed Credit Information</h2>
            
            {formData.hasCCJs === 'yes' && (
              <div className="bg-white border-2 border-blue-200 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold">CCJ Details</h3>
                
                {formData.ccjs.map((ccj, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 relative">
                    <button
                      onClick={() => removeCCJ(index)}
                      className="absolute top-2 right-2 text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                    
                    <h4 className="font-medium mb-3">CCJ #{index + 1}</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs mb-1">Amount *</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-500 text-sm">£</span>
                          <input
                            type="number"
                            value={ccj.amount}
                            onChange={(e) => updateCCJ(index, 'amount', e.target.value)}
                            className="w-full pl-8 px-3 py-2 border rounded-lg"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs mb-1">Date Registered *</label>
                        <input
                          type="date"
                          value={ccj.dateRegistered}
                          onChange={(e) => updateCCJ(index, 'dateRegistered', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs mb-1">Satisfied? *</label>
                        <select
                          value={ccj.satisfied}
                          onChange={(e) => updateCCJ(index, 'satisfied', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="no">No</option>
                          <option value="yes">Yes</option>
                        </select>
                      </div>
                      
                      {ccj.satisfied === 'yes' && (
                        <div>
                          <label className="block text-xs mb-1">Date Satisfied *</label>
                          <input
                            type="date"
                            value={ccj.dateSatisfied}
                            onChange={(e) => updateCCJ(index, 'dateSatisfied', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addCCJ}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <PlusCircle size={18} />
                  Add CCJ
                </button>
              </div>
            )}
            
            {formData.hasDefaults === 'yes' && (
              <div className="bg-white border-2 border-blue-200 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold">Default Details</h3>
                
                {formData.defaults.map((def, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 relative">
                    <button
                      onClick={() => removeDefault(index)}
                      className="absolute top-2 right-2 text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                    
                    <h4 className="font-medium mb-3">Default #{index + 1}</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs mb-1">Amount *</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-500 text-sm">£</span>
                          <input
                            type="number"
                            value={def.amount}
                            onChange={(e) => updateDefault(index, 'amount', e.target.value)}
                            className="w-full pl-8 px-3 py-2 border rounded-lg"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs mb-1">Creditor *</label>
                        <input
                          type="text"
                          value={def.creditor}
                          onChange={(e) => updateDefault(index, 'creditor', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs mb-1">Type *</label>
                        <select
                          value={def.type}
                          onChange={(e) => updateDefault(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="">Select...</option>
                          <option value="credit_card">Credit Card</option>
                          <option value="loan">Loan</option>
                          <option value="utilities">Utilities</option>
                          <option value="telecom">Telecoms</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs mb-1">Date Registered *</label>
                        <input
                          type="date"
                          value={def.dateRegistered}
                          onChange={(e) => updateDefault(index, 'dateRegistered', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs mb-1">Satisfied? *</label>
                        <select
                          value={def.satisfied}
                          onChange={(e) => updateDefault(index, 'satisfied', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="no">No</option>
                          <option value="yes">Yes</option>
                        </select>
                      </div>
                      
                      {def.satisfied === 'yes' && (
                        <div>
                          <label className="block text-xs mb-1">Date Satisfied *</label>
                          <input
                            type="date"
                            value={def.dateSatisfied}
                            onChange={(e) => updateDefault(index, 'dateSatisfied', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addDefault}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <PlusCircle size={18} />
                  Add Default
                </button>
              </div>
            )}
            
            {formData.hasMortgageArrears === 'yes' && (
              <div className="bg-white border-2 border-red-200 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold">Mortgage Arrears Details</h3>
                
                {formData.mortgageArrears.map((arrear, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 relative">
                    <button
                      onClick={() => removeMortgageArrear(index)}
                      className="absolute top-2 right-2 text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs mb-1">When?</label>
                        <input
                          type="text"
                          value={arrear.when}
                          onChange={(e) => updateMortgageArrear(index, 'when', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="18 months ago"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Missed Payments</label>
                        <input
                          type="number"
                          value={arrear.missedPayments}
                          onChange={(e) => updateMortgageArrear(index, 'missedPayments', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Max Arrears</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-500 text-sm">£</span>
                          <input
                            type="number"
                            value={arrear.amountArrears}
                            onChange={(e) => updateMortgageArrear(index, 'amountArrears', e.target.value)}
                            className="w-full pl-8 px-3 py-2 border rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addMortgageArrear}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <PlusCircle size={18} />
                  Add Arrears Instance
                </button>
              </div>
            )}
          </div>
        );

      case 8:
        // ASSETS & PROTECTION
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Assets & Protection</h2>
            
            <div className="bg-white border-2 border-blue-200 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Savings & Deposit</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Total Savings</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">£</span>
                    <input
                      type="number"
                      name="totalSavings"
                      value={formData.totalSavings}
                      onChange={handleInputChange}
                      className="w-full pl-8 px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm mb-1">Deposit Source</label>
                  <select
                    name="depositSource"
                    value={formData.depositSource}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select...</option>
                    <option value="savings">Savings</option>
                    <option value="gift">Gift</option>
                    <option value="sale_of_property">Sale of Property</option>
                    <option value="inheritance">Inheritance</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="bg-white border-2 border-green-200 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Protection</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Life Insurance</label>
                  <select
                    name="lifeInsurance"
                    value={formData.lifeInsurance}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm mb-1">Critical Illness</label>
                  <select
                    name="criticalIllness"
                    value={formData.criticalIllness}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 9:
        // PREFERENCES & GOALS
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Preferences & Goals</h2>
            
            <div className="bg-white border-2 border-blue-200 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Mortgage Preferences</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Repayment Type *</label>
                  <select
                    name="repaymentType"
                    value={formData.repaymentType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="capital_repayment">Capital Repayment</option>
                    <option value="interest_only">Interest Only</option>
                    <option value="part_and_part">Part & Part</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm mb-1">Rate Preference *</label>
                  <select
                    name="ratePreference"
                    value={formData.ratePreference}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="fixed">Fixed Rate</option>
                    <option value="variable">Variable</option>
                    <option value="tracker">Tracker</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="bg-white border-2 border-purple-200 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Your Goals</h3>
              
              <div>
                <label className="block text-sm mb-1">Primary Goal *</label>
                <select
                  name="primaryGoal"
                  value={formData.primaryGoal}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select...</option>
                  <option value="lowest_rate">Lowest Rate</option>
                  <option value="lowest_monthly">Lowest Monthly Payment</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="long_term_security">Long-term Security</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm mb-1">Any Concerns?</label>
                <textarea
                  name="concerns"
                  value={formData.concerns}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                />
              </div>
            </div>
          </div>
        );

      case 10:
        // REVIEW & SUBMIT
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Review & Submit</h2>
            
            <div className="space-y-4">
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User size={18} />
                  Personal
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">Name:</div>
                  <div className="font-medium">{formData.fullName}</div>
                  <div className="text-gray-600">Email:</div>
                  <div className="font-medium">{formData.email}</div>
                </div>
              </div>
              
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Home size={18} />
                  Property
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">Value:</div>
                  <div className="font-medium">£{parseInt(formData.propertyValue || 0).toLocaleString()}</div>
                  <div className="text-gray-600">Deposit:</div>
                  <div className="font-medium">£{parseInt(formData.depositAmount || 0).toLocaleString()}</div>
                  <div className="text-gray-600">LTV:</div>
                  <div className={`font-bold ${
                    parseFloat(formData.calculatedLTV) <= 75 ? 'text-green-600' :
                    parseFloat(formData.calculatedLTV) <= 85 ? 'text-blue-600' :
                    'text-orange-600'
                  }`}>
                    {formData.calculatedLTV}%
                  </div>
                </div>
              </div>
              
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CreditCard size={18} />
                  Credit Profile
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>CCJs:</span>
                    <span className={formData.hasCCJs === 'yes' ? 'text-orange-600' : 'text-green-600'}>
                      {formData.hasCCJs === 'yes' ? `${formData.ccjs.length} registered` : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Defaults:</span>
                    <span className={formData.hasDefaults === 'yes' ? 'text-orange-600' : 'text-green-600'}>
                      {formData.hasDefaults === 'yes' ? `${formData.defaults.length} registered` : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mortgage Arrears:</span>
                    <span className={formData.hasMortgageArrears === 'yes' ? 'text-red-600' : 'text-green-600'}>
                      {formData.hasMortgageArrears === 'yes' ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Data Protection:</strong> Your information will be handled in accordance with GDPR.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <input 
                  type="checkbox" 
                  id="dataConsent" 
                  name="dataProtectionConsent"
                  checked={formData.dataProtectionConsent}
                  onChange={handleInputChange}
                  className="mt-1" 
                  required 
                />
                <label htmlFor="dataConsent" className="text-sm">
                  I consent to data processing in accordance with GDPR. *
                </label>
              </div>
              
              <div className="flex items-start gap-2">
                <input 
                  type="checkbox" 
                  id="creditCheck" 
                  name="consentCreditCheck"
                  checked={formData.consentCreditCheck}
                  onChange={handleInputChange}
                  className="mt-1" 
                  required 
                />
                <label htmlFor="creditCheck" className="text-sm">
                  I consent to credit searches being performed. *
                </label>
              </div>
              
              <div className="flex items-start gap-2">
                <input 
                  type="checkbox" 
                  id="accuracy" 
                  name="accuracyDeclaration"
                  checked={formData.accuracyDeclaration}
                  onChange={handleInputChange}
                  className="mt-1" 
                  required 
                />
                <label htmlFor="accuracy" className="text-sm">
                  I declare all information is accurate. *
                </label>
              </div>
            </div>
            
            {saving && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
                <span className="text-sm text-green-700">Saving...</span>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Comprehensive Mortgage Application</h1>
          <p className="text-gray-600">Complete your detailed fact-find</p>
          {applicationId && (
            <p className="text-xs text-green-600 mt-2">✅ Auto-saving • ID: {applicationId}</p>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4 overflow-x-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center flex-1 min-w-0">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'bg-blue-600 text-white' : 
                      isCompleted ? 'bg-green-500 text-white' : 
                      'bg-gray-200 text-gray-500'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <span className={`text-xs mt-2 text-center hidden md:block ${
                      isActive ? 'text-blue-600 font-semibold' : 
                      isCompleted ? 'text-green-600' : 
                      'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 flex-1 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            Step {currentStep + 1} of {steps.length} • {Math.round((currentStep / (steps.length - 1)) * 100)}%
          </p>
        </div>
        
        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {renderStepContent()}
        </div>
        
        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium ${
              currentStep === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <ChevronLeft size={20} />
            Previous
          </button>
          
          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={!formData.dataProtectionConsent || !formData.consentCreditCheck || !formData.accuracyDeclaration}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Submit Application
              <CheckCircle size={20} />
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              {saving ? 'Saving...' : 'Next'}
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FactFind;