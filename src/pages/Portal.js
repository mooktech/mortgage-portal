import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  Home, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  FileText, 
  Upload, 
  MessageCircle, 
  LogOut,
  CheckCircle,
  Clock,
  AlertCircle,
  Menu,
  Zap,
  Target,
  Brain,
  Sparkles,
  X,
  ExternalLink,
  Award,
  ShoppingCart,
  Briefcase,
  Home as HomeIcon,
  Wrench,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

const Portal = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [missionControlOpen, setMissionControlOpen] = useState(null);
  const [propertyNews, setPropertyNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [currentRates, setCurrentRates] = useState(null);
  const [newsLastUpdated, setNewsLastUpdated] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (missionControlOpen === 'market-alert' && propertyNews.length === 0) {
      fetchPropertyNews();
    }
  }, [missionControlOpen, propertyNews.length, fetchPropertyNews]);

  const fetchPropertyNews = useCallback(async () => {
    setNewsLoading(true);
    
    try {
      const newsDoc = await getDoc(doc(db, 'propertyNews', 'latest'));
      
      if (newsDoc.exists()) {
        const data = newsDoc.data();
        setPropertyNews(data.articles || []);
        setCurrentRates(data.rates || null);
        setNewsLastUpdated(data.lastUpdated?.toDate() || new Date());
      }
    } catch (error) {
      console.error('Error loading property news:', error);
    } finally {
      setNewsLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const openMissionControl = (tileId) => {
    setMissionControlOpen(tileId);
  };

  const closeMissionControl = () => {
    setMissionControlOpen(null);
  };

  const formatLastUpdated = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Updated just now';
    if (diffHours === 1) return 'Updated 1 hour ago';
    if (diffHours < 24) return `Updated ${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Updated yesterday';
    return `Updated ${diffDays} days ago`;
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

  // Mission Control Content
  const MissionControlContent = () => {
    switch(missionControlOpen) {
      case 'next-steps':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Next Steps</h3>
            
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">1. Upload March Payslip</div>
                  <div className="text-sm text-gray-600 mb-3">
                    This will unlock £15,000 extra borrowing power and improve your rate
                  </div>
                  <button 
                    onClick={() => {
                      closeMissionControl();
                      navigate('/documents');
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Upload Now
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">2. Complete Fact-Find (60% done)</div>
                  <div className="text-sm text-gray-600 mb-3">
                    Answer 8 more questions to submit for Decision in Principle
                  </div>
                  <button 
                    onClick={() => {
                      closeMissionControl();
                      navigate('/factfind');
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'market-alert':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Live UK Property Market News</h3>
                {newsLastUpdated && (
                  <p className="text-xs text-gray-500 mt-1">{formatLastUpdated(newsLastUpdated)}</p>
                )}
              </div>
              <button 
                onClick={fetchPropertyNews}
                disabled={newsLoading}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw size={16} className={newsLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            {currentRates && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="text-green-600" size={20} />
                  <div className="font-bold text-gray-900">Current Market Rates</div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">2-Year Fixed</div>
                    <div className="text-2xl font-bold text-green-700">
                      {currentRates.twoYearFixed?.average || currentRates.twoYearFixed}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">5-Year Fixed</div>
                    <div className="text-2xl font-bold text-green-700">
                      {currentRates.fiveYearFixed?.average || currentRates.fiveYearFixed}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Base Rate</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {currentRates.baseRate}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {newsLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading latest news...</p>
              </div>
            ) : propertyNews.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No news available. Try refreshing.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {propertyNews.map((news, index) => (
                  <a 
                    key={index}
                    href={news.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {news.impact === 'positive' && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                          {news.impact === 'negative' && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                          {news.impact === 'neutral' && <div className="w-2 h-2 bg-gray-400 rounded-full"></div>}
                          <div className="font-semibold text-gray-900 line-clamp-2">{news.title}</div>
                        </div>
                        {news.summary && (
                          <div className="text-sm text-gray-600 mb-2 line-clamp-2">{news.summary}</div>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="font-medium">{news.source}</span>
                          <span>•</span>
                          <span>{news.time}</span>
                        </div>
                      </div>
                      <ExternalLink size={16} className="text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                  </a>
                ))}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
              <div className="flex items-start gap-3">
                <Sparkles className="text-blue-600 flex-shrink-0" size={20} />
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Live Market Intelligence</div>
                  <div className="text-sm text-gray-600">
                    This news is automatically updated daily at 6am UK time from official sources.
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Document Intelligence</h3>
            
            <div className="space-y-3">
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                    <div>
                      <div className="font-semibold text-gray-900">Payslip - February 2025</div>
                      <div className="text-sm text-gray-600 mt-1 space-y-1">
                        <div>✓ Salary: <span className="font-bold">£52,340</span></div>
                        <div>✓ Employer: <span className="font-bold">Tech Corp Ltd</span></div>
                        <div>✓ Tax Code: <span className="font-bold">1257L</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs bg-green-600 text-white px-2 py-1 rounded">AI Verified</div>
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
                    <div>
                      <div className="font-semibold text-gray-900">March Payslip - NEEDED</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Upload to verify 3 months continuous employment
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      closeMissionControl();
                      navigate('/documents');
                    }}
                    className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                  >
                    Upload
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 opacity-50">
                <div className="flex items-start gap-3">
                  <Clock className="text-gray-400 flex-shrink-0" size={24} />
                  <div>
                    <div className="font-semibold text-gray-900">Bank Statement</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Required after payslips verified
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mt-4">
              <div className="flex items-start gap-3">
                <Brain className="text-purple-600 flex-shrink-0" size={20} />
                <div>
                  <div className="font-semibold text-gray-900 mb-1">AI Progress</div>
                  <div className="text-sm text-gray-600">
                    Auto-filled 12 fields in your fact-find from uploaded documents
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'recommendations':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Recommendations</h3>
            
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Target className="text-orange-600 flex-shrink-0" size={24} />
                <div className="flex-1">
                  <div className="font-bold text-gray-900 mb-2">Increase Your Deposit by £2,000</div>
                  <div className="text-sm text-gray-600 mb-3">
                    Moving from 82% to 80% LTV will unlock better rates based on current market data
                  </div>
                  <div className="bg-white rounded-lg p-3 mb-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Current LTV</div>
                        <div className="font-bold text-lg">82%</div>
                      </div>
                      <div>
                        <div className="text-gray-500">New LTV</div>
                        <div className="font-bold text-lg text-green-600">80%</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Current Rate</div>
                        <div className="font-bold text-lg">4.8%</div>
                      </div>
                      <div>
                        <div className="text-gray-500">New Rate</div>
                        <div className="font-bold text-lg text-green-600">4.2%</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm bg-green-50 border border-green-200 rounded-lg p-2">
                    <div className="font-semibold text-green-900">💰 You'll save £180/month</div>
                    <div className="text-green-700">That's £10,800 over 5 years!</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Award className="text-blue-600 flex-shrink-0" size={20} />
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Based on Live Market Data</div>
                  <div className="text-sm text-gray-600">
                    With current average rates around 4.5% for 2-year fixes, optimizing your LTV could save you significantly.
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'services':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Services Marketplace</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => {
                  closeMissionControl();
                  navigate('/solicitors');
                }}
                className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-400 cursor-pointer transition-all hover:shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Briefcase className="text-blue-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 mb-1">Find a Solicitor</div>
                    <div className="text-sm text-gray-600 mb-2">
                      Compare conveyancing quotes from verified solicitors
                    </div>
                    <div className="text-xs text-blue-600 font-medium">From £800 • View 12 options →</div>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-green-400 cursor-pointer transition-all hover:shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <HomeIcon className="text-green-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 mb-1">Book a Survey</div>
                    <div className="text-sm text-gray-600 mb-2">
                      Get your property surveyed by RICS qualified surveyors
                    </div>
                    <div className="text-xs text-green-600 font-medium">From £400 • View options →</div>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => {
                  closeMissionControl();
                  navigate('/removals');
                }}
                className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-orange-400 cursor-pointer transition-all hover:shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShoppingCart className="text-orange-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 mb-1">Removal Companies</div>
                    <div className="text-sm text-gray-600 mb-2">
                      Get quotes from trusted removal companies in your area
                    </div>
                    <div className="text-xs text-orange-600 font-medium">From £500 • Compare quotes →</div>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-purple-400 cursor-pointer transition-all hover:shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="text-purple-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 mb-1">Setup New Home Utilities</div>
                    <div className="text-sm text-gray-600 mb-2">
                      Switch energy, broadband, water for your new property
                    </div>
                    <div className="text-xs text-purple-600 font-medium">Save avg £300/year • Setup →</div>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-red-400 cursor-pointer transition-all hover:shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="text-red-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 mb-1">Home Insurance</div>
                    <div className="text-sm text-gray-600 mb-2">
                      Compare buildings & contents insurance quotes
                    </div>
                    <div className="text-xs text-red-600 font-medium">From £15/month • Get quotes →</div>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-400 cursor-pointer transition-all hover:shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Wrench className="text-indigo-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 mb-1">Switch Existing Utilities</div>
                    <div className="text-sm text-gray-600 mb-2">
                      Save money by switching your current energy suppliers
                    </div>
                    <div className="text-xs text-indigo-600 font-medium">Avg saving £450/year →</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
              <div className="flex items-start gap-3">
                <Sparkles className="text-blue-600 flex-shrink-0" size={20} />
                <div>
                  <div className="font-semibold text-gray-900 mb-1">We've Got You Covered</div>
                  <div className="text-sm text-gray-600">
                    All services are verified partners. We've negotiated exclusive discounts for GETMY.MORTGAGE customers.
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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

      {/* Mission Control Overlay */}
      {missionControlOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={closeMissionControl}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-2xl font-bold text-gray-900">Mission Control</h2>
              <button 
                onClick={closeMissionControl}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <MissionControlContent />
            </div>
          </div>
        </div>
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
            <button 
              onClick={() => navigate('/factfind')}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
            >
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
            
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to Your Portal
              </h1>
              <p className="text-gray-600">
                Your AI-powered mortgage journey with live market data
              </p>
            </div>

            {/* ALL 6 SMART TILES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              
              {/* 1. Next Steps Tile */}
              <div 
                onClick={() => openMissionControl('next-steps')}
                className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg cursor-pointer transform transition-all hover:scale-105 relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                      <Zap className="text-white" size={20} />
                    </div>
                    <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs backdrop-blur">
                      <Sparkles size={12} />
                      <span>AI Guided</span>
                    </div>
                  </div>
                  <div className="text-sm text-blue-100 mb-1">Next Steps</div>
                  <div className="text-2xl font-bold mb-2">Upload Payslip</div>
                  <div className="text-sm text-blue-100">
                    Unlock £15k extra borrowing power
                  </div>
                </div>
                <div className="absolute inset-0 rounded-2xl border-2 border-white/30"></div>
              </div>

              {/* 2. Market Alert Tile */}
              <div 
                onClick={() => openMissionControl('market-alert')}
                className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg cursor-pointer transform transition-all hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                    <TrendingDown className="text-white" size={20} />
                  </div>
                  <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs backdrop-blur">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    <span>Live</span>
                  </div>
                </div>
                <div className="text-sm text-green-100 mb-1">Market Alert</div>
                <div className="text-2xl font-bold mb-2">Property News</div>
                <div className="text-sm text-green-100">
                  Auto-updates daily • Latest UK news
                </div>
              </div>

              {/* 3. Documents AI Tile */}
              <div 
                onClick={() => openMissionControl('documents')}
                className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg cursor-pointer transform transition-all hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                    <FileText className="text-white" size={20} />
                  </div>
                  <div className="flex items-center gap-1 bg-green-500 px-3 py-1 rounded-full text-xs">
                    <CheckCircle size={12} />
                    <span>1 Verified</span>
                  </div>
                </div>
                <div className="text-sm text-purple-100 mb-1">Documents AI</div>
                <div className="text-2xl font-bold mb-2">1 Needed</div>
                <div className="text-sm text-purple-100">
                  AI extracted £52,340 from payslip ✓
                </div>
              </div>

              {/* 4. Smart Recommendations Tile */}
              <div 
                onClick={() => openMissionControl('recommendations')}
                className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg cursor-pointer transform transition-all hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                    <Target className="text-white" size={20} />
                  </div>
                  <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs backdrop-blur">
                    <Brain size={12} />
                    <span>AI Insight</span>
                  </div>
                </div>
                <div className="text-sm text-yellow-100 mb-1">Recommendation</div>
                <div className="text-2xl font-bold mb-2">Save £180/mo</div>
                <div className="text-sm text-yellow-100">
                  Add £2k deposit for better rates
                </div>
              </div>

              {/* 5. Services Marketplace Tile */}
              <div 
                onClick={() => openMissionControl('services')}
                className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg cursor-pointer transform transition-all hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                    <ShoppingCart className="text-white" size={20} />
                  </div>
                  <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs backdrop-blur">
                    <span>6 Services</span>
                  </div>
                </div>
                <div className="text-sm text-cyan-100 mb-1">Marketplace</div>
                <div className="text-2xl font-bold mb-2">Moving Services</div>
                <div className="text-sm text-cyan-100">
                  Solicitors, removals, utilities & more
                </div>
              </div>

              {/* 6. Quote Status Tile */}
              {userData?.quoteData && (
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                      <DollarSign className="text-white" size={20} />
                    </div>
                    <div className="flex items-center gap-1 bg-green-500 px-3 py-1 rounded-full text-xs">
                      <CheckCircle size={12} />
                      <span>Saved</span>
                    </div>
                  </div>
                  <div className="text-sm text-indigo-100 mb-1">Your Quote</div>
                  <div className="text-2xl font-bold mb-2">
                    £{userData.quoteData.loanAmount?.toLocaleString()}
                  </div>
                  <div className="text-sm text-indigo-100">
                    {userData.quoteData.ltv}% LTV • £{userData.quoteData.estimatedMonthlyPayment}/mo
                  </div>
                </div>
              )}

            </div>

            {/* JOURNEY TIMELINE - Next Steps Cards */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Journey</h2>
              <div className="space-y-4">
                {/* Step 1 - Completed */}
                <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900">Quote Received</h3>
                    <p className="text-sm text-gray-600">We've saved your initial quote details</p>
                  </div>
                </div>

                {/* Step 2 - Active */}
                <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Complete Your Application</h3>
                    <p className="text-sm text-gray-600 mb-3">Fill out the full fact-find to proceed with your mortgage application</p>
                    <button 
                      onClick={() => navigate('/factfind')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                    >
                      Start Application
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Step 3 - Active */}
                <div className="flex items-start gap-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <Upload className="text-purple-600 flex-shrink-0 mt-1" size={24} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Upload Documents</h3>
                    <p className="text-sm text-gray-600 mb-3">Upload your payslips and bank statements - our AI will extract the data automatically</p>
                    <button 
                      onClick={() => navigate('/documents')}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
                    >
                      Upload Documents
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Step 4 - Pending */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl opacity-50">
                  <Clock className="text-gray-400 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900">Decision in Principle</h3>
                    <p className="text-sm text-gray-600">We'll process your DIP after documents are submitted</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote Details Card */}
            {userData?.quoteData && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
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

          </div>
        </main>
      </div>
    </div>
  );
};

export default Portal;