import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Home, User, Briefcase, DollarSign, CreditCard, Target, CheckCircle } from 'lucide-react';

const MortgageFactFindPortal = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Personal Details
    fullName: '',
    dateOfBirth: '',
    maritalStatus: '',
    dependents: '',
    currentAddress: '',
    yearsAtAddress: '',
    previousAddress: '',
    email: '',
    phone: '',
    nationality: '',
    niNumber: '',
    
    // Employment & Income
    employmentStatus: '',
    employerName: '',
    jobTitle: '',
    yearsInJob: '',
    basicSalary: '',
    bonus: '',
    overtime: '',
    otherIncome: '',
    
    // Property Details
    propertyPurpose: '',
    propertyType: '',
    propertyValue: '',
    depositAmount: '',
    loanAmount: '',
    mortgageTerm: '25',
    
    // Financial Commitments
    monthlyRent: '',
    creditCards: '',
    loans: '',
    childMaintenance: '',
    councilTax: '',
    utilities: '',
    
    // Credit History
    creditIssues: 'no',
    ccjs: 'no',
    bankruptcy: 'no',
    
    // Assets & Savings
    totalSavings: '',
    depositSource: '',
    otherAssets: '',
    
    // Repayment Preferences
    repaymentType: '',
    ratePreference: '',
    
    // Future Plans
    futurePlans: '',
    incomeChanges: '',
    
    // Protection
    lifeInsurance: 'no',
    criticalIllness: 'no',
    
    // Objectives
    primaryGoal: '',
    concerns: ''
  });

  const steps = [
    { id: 0, title: 'Personal Details', icon: User },
    { id: 1, title: 'Employment & Income', icon: Briefcase },
    { id: 2, title: 'Property Details', icon: Home },
    { id: 3, title: 'Financial Commitments', icon: DollarSign },
    { id: 4, title: 'Credit & Assets', icon: CreditCard },
    { id: 5, title: 'Preferences & Goals', icon: Target },
    { id: 6, title: 'Review & Submit', icon: CheckCircle }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    alert('Fact Find submitted successfully! Your mortgage adviser will be in touch shortly.');
    console.log('Form Data:', formData);
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 0:
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Smith"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status *</label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="civil_partnership">Civil Partnership</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Dependents</label>
                <input
                  type="number"
                  name="dependents"
                  value={formData.dependents}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Address *</label>
              <input
                type="text"
                name="currentAddress"
                value={formData.currentAddress}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123 High Street, London, SW1A 1AA"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years at Current Address *</label>
                <input
                  type="number"
                  name="yearsAtAddress"
                  value={formData.yearsAtAddress}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2"
                  step="0.5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">National Insurance Number</label>
                <input
                  type="text"
                  name="niNumber"
                  value={formData.niNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="AB123456C"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john.smith@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="07123456789"
                />
              </div>
            </div>
          </div>
        );
        
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Employment & Income</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status *</label>
                <select
                  name="employmentStatus"
                  value={formData.employmentStatus}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="employed">Employed</option>
                  <option value="self_employed">Self-Employed</option>
                  <option value="contractor">Contractor</option>
                  <option value="retired">Retired</option>
                  <option value="unemployed">Unemployed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years in Current Job *</label>
                <input
                  type="number"
                  name="yearsInJob"
                  value={formData.yearsInJob}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="3"
                  step="0.5"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employer Name *</label>
              <input
                type="text"
                name="employerName"
                value={formData.employerName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ABC Company Ltd"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Software Developer"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Basic Annual Salary (£) *</label>
                <input
                  type="number"
                  name="basicSalary"
                  value={formData.basicSalary}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="45000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Bonus (£)</label>
                <input
                  type="number"
                  name="bonus"
                  value={formData.bonus}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5000"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Regular Overtime (£/year)</label>
                <input
                  type="number"
                  name="overtime"
                  value={formData.overtime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Other Income (£/year)</label>
                <input
                  type="number"
                  name="otherIncome"
                  value={formData.otherIncome}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Rental, investments, etc."
                />
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> You'll need to provide supporting documents such as 3 months payslips or 2-3 years accounts for self-employed applicants.
              </p>
            </div>
          </div>
        );
        
      case 2:
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="first_time_buyer">First Time Buyer</option>
                  <option value="moving_home">Moving Home</option>
                  <option value="remortgage">Remortgage</option>
                  <option value="buy_to_let">Buy to Let</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="detached">Detached House</option>
                  <option value="semi_detached">Semi-Detached House</option>
                  <option value="terraced">Terraced House</option>
                  <option value="flat">Flat/Apartment</option>
                  <option value="bungalow">Bungalow</option>
                  <option value="new_build">New Build</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Value/Price (£) *</label>
                <input
                  type="number"
                  name="propertyValue"
                  value={formData.propertyValue}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="350000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Available (£) *</label>
                <input
                  type="number"
                  name="depositAmount"
                  value={formData.depositAmount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="70000"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount Required (£) *</label>
                <input
                  type="number"
                  name="loanAmount"
                  value={formData.loanAmount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="280000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Mortgage Term (years) *</label>
                <input
                  type="number"
                  name="mortgageTerm"
                  value={formData.mortgageTerm}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="25"
                />
              </div>
            </div>
            
            {formData.propertyValue && formData.depositAmount && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>Loan to Value (LTV):</strong> {((parseFloat(formData.loanAmount || formData.propertyValue - formData.depositAmount) / parseFloat(formData.propertyValue)) * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Financial Commitments & Outgoings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent/Mortgage (£)</label>
                <input
                  type="number"
                  name="monthlyRent"
                  value={formData.monthlyRent}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credit Cards (total balance £)</label>
                <input
                  type="number"
                  name="creditCards"
                  value={formData.creditCards}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2000"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loans (monthly payment £)</label>
                <input
                  type="number"
                  name="loans"
                  value={formData.loans}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="350"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Child Maintenance (monthly £)</label>
                <input
                  type="number"
                  name="childMaintenance"
                  value={formData.childMaintenance}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Council Tax (monthly £)</label>
                <input
                  type="number"
                  name="councilTax"
                  value={formData.councilTax}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="150"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Utilities & Bills (monthly £)</label>
                <input
                  type="number"
                  name="utilities"
                  value={formData.utilities}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="200"
                />
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Accurate information about your financial commitments helps us find the best mortgage deal for you.
              </p>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Credit History & Assets</h2>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-800 mb-3">Credit History</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Any adverse credit history?</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="creditIssues"
                        value="no"
                        checked={formData.creditIssues === 'no'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      No
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="creditIssues"
                        value="yes"
                        checked={formData.creditIssues === 'yes'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Yes
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Any CCJs or Defaults?</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="ccjs"
                        value="no"
                        checked={formData.ccjs === 'no'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      No
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="ccjs"
                        value="yes"
                        checked={formData.ccjs === 'yes'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Yes
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Any Bankruptcy or IVAs?</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="bankruptcy"
                        value="no"
                        checked={formData.bankruptcy === 'no'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      No
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="bankruptcy"
                        value="yes"
                        checked={formData.bankruptcy === 'yes'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Yes
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Assets & Savings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Savings (£) *</label>
                  <input
                    type="number"
                    name="totalSavings"
                    value={formData.totalSavings}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="80000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source of Deposit *</label>
                  <select
                    name="depositSource"
                    value={formData.depositSource}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="savings">Savings</option>
                    <option value="gift">Gift from Family</option>
                    <option value="inheritance">Inheritance</option>
                    <option value="property_sale">Sale of Property</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Other Assets (£)</label>
                  <input
                    type="number"
                    name="otherAssets"
                    value={formData.otherAssets}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Investments, other properties, etc."
                  />
                </div>
              </div>
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Preferences & Goals</h2>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-800 mb-3">Repayment Preferences</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Repayment Type *</label>
                  <select
                    name="repaymentType"
                    value={formData.repaymentType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="repayment">Repayment (Capital & Interest)</option>
                    <option value="interest_only">Interest Only</option>
                    <option value="combination">Combination</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rate Preference *</label>
                  <select
                    name="ratePreference"
                    value={formData.ratePreference}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="fixed">Fixed Rate</option>
                    <option value="variable">Variable Rate</option>
                    <option value="tracker">Tracker</option>
                    <option value="discount">Discount</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-800 mb-3">Protection</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Do you have Life Insurance?</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="lifeInsurance"
                        value="yes"
                        checked={formData.lifeInsurance === 'yes'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="lifeInsurance"
                        value="no"
                        checked={formData.lifeInsurance === 'no'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      No
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Do you have Critical Illness Cover?</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="criticalIllness"
                        value="yes"
                        checked={formData.criticalIllness === 'yes'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="criticalIllness"
                        value="no"
                        checked={formData.criticalIllness === 'no'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      No
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Goal *</label>
              <select
                name="primaryGoal"
                value={formData.primaryGoal}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select...</option>
                <option value="lowest_rate">Lowest Interest Rate</option>
                <option value="lowest_payment">Lowest Monthly Payment</option>
                <option value="flexibility">Maximum Flexibility</option>
                <option value="short_term">Pay Off Quickly</option>
                <option value="stability">Payment Stability</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Future Plans</label>
              <textarea
                name="futurePlans"
                value={formData.futurePlans}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Any plans to move, retire, change careers, or other life changes?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Any Concerns or Special Requirements?</label>
              <textarea
                name="concerns"
                value={formData.concerns}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Tell us about any specific concerns or requirements you have..."
              />
            </div>
          </div>
        );
        
      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Review Your Information</h2>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-600 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Almost Done!</h3>
                  <p className="text-sm text-gray-700">Please review your information below before submitting. Your mortgage adviser will contact you within 24 hours.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <User size={18} />
                  Personal Details
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">Name:</div>
                  <div className="font-medium">{formData.fullName || 'Not provided'}</div>
                  <div className="text-gray-600">Email:</div>
                  <div className="font-medium">{formData.email || 'Not provided'}</div>
                  <div className="text-gray-600">Phone:</div>
                  <div className="font-medium">{formData.phone || 'Not provided'}</div>
                  <div className="text-gray-600">Marital Status:</div>
                  <div className="font-medium capitalize">{formData.maritalStatus.replace('_', ' ') || 'Not provided'}</div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Briefcase size={18} />
                  Employment & Income
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">Status:</div>
                  <div className="font-medium capitalize">{formData.employmentStatus.replace('_', ' ') || 'Not provided'}</div>
                  <div className="text-gray-600">Employer:</div>
                  <div className="font-medium">{formData.employerName || 'Not provided'}</div>
                  <div className="text-gray-600">Annual Salary:</div>
                  <div className="font-medium">£{formData.basicSalary ? parseInt(formData.basicSalary).toLocaleString() : 'Not provided'}</div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Home size={18} />
                  Property Details
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">Purpose:</div>
                  <div className="font-medium capitalize">{formData.propertyPurpose.replace('_', ' ') || 'Not provided'}</div>
                  <div className="text-gray-600">Property Value:</div>
                  <div className="font-medium">£{formData.propertyValue ? parseInt(formData.propertyValue).toLocaleString() : 'Not provided'}</div>
                  <div className="text-gray-600">Deposit:</div>
                  <div className="font-medium">£{formData.depositAmount ? parseInt(formData.depositAmount).toLocaleString() : 'Not provided'}</div>
                  <div className="text-gray-600">Loan Amount:</div>
                  <div className="font-medium">£{formData.loanAmount ? parseInt(formData.loanAmount).toLocaleString() : 'Not provided'}</div>
                  <div className="text-gray-600">Term:</div>
                  <div className="font-medium">{formData.mortgageTerm} years</div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Target size={18} />
                  Preferences
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">Repayment Type:</div>
                  <div className="font-medium capitalize">{formData.repaymentType.replace('_', ' ') || 'Not provided'}</div>
                  <div className="text-gray-600">Rate Preference:</div>
                  <div className="font-medium capitalize">{formData.ratePreference || 'Not provided'}</div>
                  <div className="text-gray-600">Primary Goal:</div>
                  <div className="font-medium capitalize">{formData.primaryGoal.replace('_', ' ') || 'Not provided'}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-800">
                <strong>Data Protection:</strong> Your information will be handled in accordance with GDPR and will only be used to process your mortgage application. We will not share your data with third parties without your consent.
              </p>
            </div>
            
            <div className="flex items-start gap-2 mt-4">
              <input type="checkbox" id="consent" className="mt-1" />
              <label htmlFor="consent" className="text-sm text-gray-700">
                I confirm that the information provided is accurate and I consent to a credit check being performed.
              </label>
            </div>
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mortgage Fact Find</h1>
          <p className="text-gray-600">Complete your mortgage application in a few simple steps</p>
        </div>
        
        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
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
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
        
        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {renderStepContent()}
        </div>
        
        {/* Navigation Buttons */}
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
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              Submit Application
              <CheckCircle size={20} />
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Next
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MortgageFactFindPortal;