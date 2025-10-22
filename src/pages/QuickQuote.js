import React, { useState, useEffect } from 'react';
import { ArrowRight, Home, DollarSign, Briefcase, MapPin, Mail, TrendingUp, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';

const QuickQuoteForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    propertyValue: '',
    depositAmount: '',
    employmentStatus: '',
    annualIncome: '',
    postcode: '',
    email: ''
  });
  const [showResults, setShowResults] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mortgageProducts, setMortgageProducts] = useState([]);
  const [loadingRates, setLoadingRates] = useState(false);

  // Fetch mortgage products from Firebase
  const fetchMortgageProducts = async (ltv) => {
    setLoadingRates(true);
    try {
      const productsRef = collection(db, 'mortgageProducts');
      const q = query(productsRef, where('status', '==', 'active'));
      
      const querySnapshot = await getDocs(q);
      const products = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Filter client-side: only include products where maxLTV >= ltv
        if (data.maxLTV >= ltv) {
          products.push({ id: doc.id, ...data });
        }
      });

      console.log(`Found ${products.length} products for LTV ${ltv.toFixed(1)}%`); // Debug log

      // Sort by rate (lowest first)
      products.sort((a, b) => a.rate - b.rate);
      
      // Take top 5 products
      setMortgageProducts(products.slice(0, 5));
      
      if (products.length === 0) {
        setError('No products found for your LTV. Please adjust your deposit.');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Could not load mortgage rates. Please try again.');
    } finally {
      setLoadingRates(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = async () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      // Calculate LTV and fetch real products
      const loanAmount = parseFloat(formData.propertyValue) - parseFloat(formData.depositAmount);
      const ltv = (loanAmount / parseFloat(formData.propertyValue)) * 100;
      
      await fetchMortgageProducts(ltv);
      setShowResults(true);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Calculate monthly payment for a given loan amount and rate
  const calculateMonthlyPayment = (loanAmount, annualRate, termYears = 25) => {
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = termYears * 12;
    
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    return Math.round(monthlyPayment);
  };

  const loanAmount = parseFloat(formData.propertyValue) - parseFloat(formData.depositAmount);
  const ltv = ((loanAmount / parseFloat(formData.propertyValue)) * 100).toFixed(1);

  // Create account and continue
  const handleCreateAccount = async () => {
    setError('');

    if (!password || !confirmPassword) {
      setError('Please enter a password');
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        password
      );

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: formData.email,
        createdAt: new Date().toISOString(),
        role: 'client',
        quoteData: {
          propertyValue: formData.propertyValue,
          depositAmount: formData.depositAmount,
          employmentStatus: formData.employmentStatus,
          annualIncome: formData.annualIncome,
          postcode: formData.postcode,
          loanAmount: loanAmount,
          ltv: ltv,
          estimatedMonthlyPayment: mortgageProducts.length > 0 ? calculateMonthlyPayment(loanAmount, mortgageProducts[0].rate) : null
        }
      });

      navigate('/portal');

    } catch (err) {
      console.error('Account creation error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please log in instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          
          {/* Success Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Great News!</h1>
            <p className="text-xl text-gray-600">Here are your personalized mortgage options from REAL lenders</p>
          </div>

          {/* Quick Summary */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-blue-100 mb-1">Loan Amount</div>
                <div className="text-3xl font-bold">£{loanAmount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-blue-100 mb-1">Loan to Value</div>
                <div className="text-3xl font-bold">{ltv}%</div>
              </div>
              <div>
                <div className="text-sm text-blue-100 mb-1">Best Rate Available</div>
                <div className="text-3xl font-bold">
                  {mortgageProducts.length > 0 ? `${mortgageProducts[0].rate}%` : 'Loading...'}
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loadingRates && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Finding your best rates from our database...</p>
            </div>
          )}

          {/* Rate Options */}
          {!loadingRates && mortgageProducts.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Best Rates (Real Lender Data)</h2>
              <div className="grid grid-cols-1 gap-4">
                {mortgageProducts.map((product, index) => {
                  const monthlyPayment = calculateMonthlyPayment(loanAmount, product.rate, 25);
                  
                  return (
                    <div key={product.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-2 border-transparent hover:border-blue-500">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-gray-900">{product.lender}</h3>
                            {index === 0 && (
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                                Best Rate
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">{product.productName}</p>
                          <div className="flex items-center gap-6 text-sm flex-wrap">
                            <div>
                              <span className="text-gray-500">Rate: </span>
                              <span className="font-semibold text-gray-900">{product.rate}%</span>
                            </div>
                            <div>
                              <span className="text-gray-500">APR: </span>
                              <span className="font-semibold text-gray-900">{product.apr}%</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Fee: </span>
                              <span className="font-semibold text-gray-900">
                                {product.productFee === 0 ? 'FREE' : `£${product.productFee.toLocaleString()}`}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Term: </span>
                              <span className="font-semibold text-gray-900">{product.term} years</span>
                            </div>
                          </div>
                          
                          {/* Features */}
                          {product.features && product.features.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {product.features.slice(0, 2).map((feature, i) => (
                                <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-6">
                          <div className="text-sm text-gray-500 mb-1">Monthly Payment</div>
                          <div className="text-3xl font-bold text-blue-600">
                            £{monthlyPayment.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Based on 25yr term</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Products Found */}
          {!loadingRates && mortgageProducts.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center mb-6">
              <p className="text-gray-600">No products found for your criteria. Please contact us for specialist advice.</p>
            </div>
          )}

          {/* CTA Buttons - Create Account */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Save Your Quote & Continue</h3>
            <p className="text-center text-gray-600 mb-6">Create your account to access your personalized portal</p>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            <div className="max-w-md mx-auto space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Your Username)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Create a Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleCreateAccount}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Create Account & Continue
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
              <button className="flex-1 border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all">
                Speak to a Broker
              </button>
            </div>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 font-semibold hover:underline"
              >
                Log in here
              </button>
            </p>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">GETMY</span>
            <span className="text-gray-800">.MORTGAGE</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Get Your Quote in 2 Minutes</h1>
          <p className="text-gray-600">Answer 6 quick questions to see your best rates from REAL lenders</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Question {step} of 6</span>
            <span className="text-sm text-gray-600">{Math.round((step / 6) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          
          {step === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Home className="text-blue-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">What's the property value?</h2>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">£</span>
                <input
                  type="number"
                  name="propertyValue"
                  value={formData.propertyValue}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-4 text-2xl border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="350000"
                  autoFocus
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="text-green-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">How much deposit do you have?</h2>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">£</span>
                <input
                  type="number"
                  name="depositAmount"
                  value={formData.depositAmount}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-4 text-2xl border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="70000"
                  autoFocus
                />
              </div>
              {formData.propertyValue && formData.depositAmount && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Loan to Value:</strong> {((parseFloat(formData.propertyValue) - parseFloat(formData.depositAmount)) / parseFloat(formData.propertyValue) * 100).toFixed(1)}%
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="text-purple-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">What's your employment status?</h2>
              </div>
              <div className="space-y-3">
                {['Employed', 'Self-Employed', 'Retired', 'Other'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, employmentStatus: status }));
                      setTimeout(nextStep, 300);
                    }}
                    className={`w-full p-4 text-lg font-semibold rounded-xl border-2 transition-all ${
                      formData.employmentStatus === status
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-blue-300 text-gray-700'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-indigo-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">What's your annual income?</h2>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">£</span>
                <input
                  type="number"
                  name="annualIncome"
                  value={formData.annualIncome}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-4 text-2xl border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="50000"
                  autoFocus
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <MapPin className="text-orange-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">What's the property postcode?</h2>
              </div>
              <input
                type="text"
                name="postcode"
                value={formData.postcode}
                onChange={handleInputChange}
                className="w-full px-4 py-4 text-2xl border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none uppercase"
                placeholder="SW1A 1AA"
                autoFocus
              />
            </div>
          )}

          {step === 6 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                  <Mail className="text-pink-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Where should we send your quote?</h2>
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-4 text-xl border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                placeholder="your.email@example.com"
                autoFocus
              />
            </div>
          )}

        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Back
            </button>
          )}
          <button
            onClick={nextStep}
            disabled={
              (step === 1 && !formData.propertyValue) ||
              (step === 2 && !formData.depositAmount) ||
              (step === 4 && !formData.annualIncome) ||
              (step === 5 && !formData.postcode) ||
              (step === 6 && !formData.email)
            }
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {step === 6 ? 'See My Real Rates' : 'Continue'}
            <ArrowRight size={20} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default QuickQuoteForm;