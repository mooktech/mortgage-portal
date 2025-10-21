import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  Home, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Upload, 
  MessageCircle, 
  LogOut,
  CheckCircle,
  Clock,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';

const Portal = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } else {
        // Not logged in, redirect to login
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu size={24} />
              </button>
              <div className="text-xl font-bold">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">GETMY</span>
                <span className="text-gray-800">.MORTGAGE</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <div className="text-sm text-gray-600">Welcome back</div>
                <div className="text-sm font-semibold text-gray-900">{user?.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg z-40 transform transition-transform lg:transform-none overflow-y-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <nav className="p-4 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg font-medium">
              <Home size={20} />
              Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
              <FileText size={20} />
              My Application
            </button>
            <button 
              onClick={() => navigate('/documents')}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
            >
              <Upload size={20} />
              Documents
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
              <TrendingUp size={20} />
              Rates
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
              <MessageCircle size={20} />
              Messages
            </button>

            {/* Marketplace Section */}
            <div className="pt-4 mt-4 border-t">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2 px-4">
                Marketplace
              </div>
              <button 
                onClick={() => navigate('/solicitors')}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Find a Solicitor
              </button>
              <button 
                onClick={() => navigate('/removals')}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                Find Removals
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to Your Portal
              </h1>
              <p className="text-gray-600">
                Here's everything you need to track your mortgage application
              </p>
            </div>

            {/* Stats Widgets - iOS Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Application Status */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Clock size={20} />
                  </div>
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Active</span>
                </div>
                <div className="text-2xl font-bold mb-1">Quote Saved</div>
                <div className="text-sm text-blue-100">Ready for next steps</div>
              </div>

              {/* Loan Amount */}
              {userData?.quoteData && (
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <DollarSign size={20} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    £{userData.quoteData.loanAmount?.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-100">Loan Amount</div>
                </div>
              )}

              {/* Monthly Payment */}
              {userData?.quoteData && (
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <TrendingUp size={20} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    £{userData.quoteData.estimatedMonthlyPayment?.toLocaleString()}
                  </div>
                  <div className="text-sm text-purple-100">Est. Monthly Payment</div>
                </div>
              )}

              {/* LTV */}
              {userData?.quoteData && (
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Home size={20} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {userData.quoteData.ltv}%
                  </div>
                  <div className="text-sm text-orange-100">Loan to Value</div>
                </div>
              )}
            </div>

            {/* Quote Details Card */}
            {userData?.quoteData && (
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Your Quote Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Property Value</div>
                    <div className="text-lg font-semibold text-gray-900">
                      £{parseFloat(userData.quoteData.propertyValue).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Deposit Amount</div>
                    <div className="text-lg font-semibold text-gray-900">
                      £{parseFloat(userData.quoteData.depositAmount).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Employment Status</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {userData.quoteData.employmentStatus}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Annual Income</div>
                    <div className="text-lg font-semibold text-gray-900">
                      £{parseFloat(userData.quoteData.annualIncome).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Postcode</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {userData.quoteData.postcode}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Next Steps</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900">Quote Received</h3>
                    <p className="text-sm text-gray-600">We've saved your initial quote details</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Complete Your Application</h3>
                    <p className="text-sm text-gray-600 mb-3">Fill out the full fact-find to proceed with your mortgage application</p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                      Start Application
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <Upload className="text-purple-600 flex-shrink-0 mt-1" size={24} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Upload Documents</h3>
                    <p className="text-sm text-gray-600 mb-3">Upload your payslips and bank statements - our AI will extract the data automatically</p>
                    <button 
                      onClick={() => navigate('/documents')}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
                    >
                      Upload Documents
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <Clock className="text-gray-400 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900">Decision in Principle</h3>
                    <p className="text-sm text-gray-600">We'll process your DIP after documents are submitted</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Portal;