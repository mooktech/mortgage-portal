import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, ArrowRight, CheckCircle, Clock, Shield, Users, Star, Menu, X } from 'lucide-react';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <div className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">GETMY</span>
                <span className="text-gray-800">.MORTGAGE</span>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors">How It Works</a>
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">Features</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">About</a>
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all">
                Login
              </button>
            </div>

            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              <a href="#how-it-works" className="block text-gray-700 hover:text-blue-600">How It Works</a>
              <a href="#features" className="block text-gray-700 hover:text-blue-600">Features</a>
              <a href="#about" className="block text-gray-700 hover:text-blue-600">About</a>
              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold">
                Login
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 opacity-90">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2),transparent_50%)]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="text-white">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                Get Your Mortgage<br />
                <span className="text-blue-200">From Your Sofa</span>
              </h1>
              
              <p className="text-xl text-blue-100 mb-8">
                Your complete mortgage journey in one beautiful portal. No stress, no hassle, just results.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link 
                  to="/quote"
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg"
                >
                  Get Started Now
                  <ArrowRight size={20} />
                </Link>
                
                <button className="border-2 border-white/50 hover:bg-white/10 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-all backdrop-blur-sm">
                  <Phone size={20} />
                  Speak to a Broker
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white">2 min</div>
                  <div className="text-sm text-blue-100">Quick Quote</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white">24/7</div>
                  <div className="text-sm text-blue-100">Portal Access</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white">100+</div>
                  <div className="text-sm text-blue-100">Lenders</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-2 transform hover:scale-105 transition-transform">
                <div className="aspect-[4/3] rounded-lg overflow-hidden">
  <img 
    src="/heroimage.jpg" 
    alt="Get your mortgage from your sofa"
    className="w-full h-full object-cover"
  />
</div>
              </div>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-purple-400 rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-400 rounded-full opacity-20 blur-2xl"></div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose GETMY.MORTGAGE?</h2>
            <p className="text-xl text-gray-600">Everything you need in one place</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white border-2 border-blue-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4">
                <Clock className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Get a quote in 2 minutes. Decision in Principle in 24 hours.</p>
            </div>

            <div className="bg-white border-2 border-purple-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                <Shield className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">100% Secure</h3>
              <p className="text-gray-600">Bank-level encryption. Your data is completely protected.</p>
            </div>

            <div className="bg-white border-2 border-indigo-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                <Users className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Brokers</h3>
              <p className="text-gray-600">Real people, real expertise. Chat with us anytime.</p>
            </div>

            <div className="bg-white border-2 border-blue-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <Star className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Best Rates</h3>
              <p className="text-gray-600">Access to 100+ lenders. We find your perfect match.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Your mortgage in 4 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Quote</h3>
              <p className="text-gray-600">Answer 5 questions and get instant rate estimates</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Account</h3>
              <p className="text-gray-600">Set up your secure portal in seconds</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Documents</h3>
              <p className="text-gray-600">Easy drag-and-drop. AI does the rest</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                4
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Approved</h3>
              <p className="text-gray-600">Decision in Principle in 24 hours</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link 
              to="/quote"
              className="inline-flex bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-lg font-semibold text-lg items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
            >
              Start Your Journey
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-12 text-white shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">Everything In One Place</h2>
                <p className="text-xl text-blue-100 mb-8">
                  No more jumping between websites, emails, and phone calls. Your entire mortgage journey lives in your personal portal.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <CheckCircle className="text-blue-200 flex-shrink-0 mt-1" size={24} />
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Real-Time Updates</h3>
                      <p className="text-blue-100">Track your application progress 24/7</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <CheckCircle className="text-blue-200 flex-shrink-0 mt-1" size={24} />
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Direct Broker Chat</h3>
                      <p className="text-blue-100">Message your broker anytime, get fast responses</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <CheckCircle className="text-blue-200 flex-shrink-0 mt-1" size={24} />
                    <div>
                      <h3 className="font-semibold text-lg mb-1">AI Document Processing</h3>
                      <p className="text-blue-100">Upload docs once, AI extracts everything automatically</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <CheckCircle className="text-blue-200 flex-shrink-0 mt-1" size={24} />
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Area Insights</h3>
                      <p className="text-blue-100">Discover everything about your new neighborhood</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-2xl">
                <div className="aspect-square bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-600 p-8">
                    <div className="text-6xl mb-4">🏠</div>
                    <p className="text-sm font-medium">Client Portal Preview</p>
                    <p className="text-xs mt-2 text-gray-500">Dashboard screenshot goes here</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Your Mortgage?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands who have already started their journey
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/quote"
              className="inline-flex bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-semibold text-lg items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg"
            >
              Get Started Now
              <ArrowRight size={20} />
            </Link>
            
            <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg inline-flex items-center justify-center gap-2 transition-all backdrop-blur-sm">
              <MessageCircle size={20} />
              Chat With Us
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">GETMY</span>
                <span className="text-white">.MORTGAGE</span>
              </div>
              <p className="text-gray-400 text-sm">
                Making mortgages simple, personal, and stress-free.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#how-it-works" className="hover:text-blue-400">How It Works</a></li>
                <li><a href="#features" className="hover:text-blue-400">Features</a></li>
                <li><button onClick={() => {}} className="hover:text-blue-400">Pricing</button></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={() => {}} className="hover:text-blue-400">About Us</button></li>
                <li><button onClick={() => {}} className="hover:text-blue-400">Contact</button></li>
                <li><button onClick={() => {}} className="hover:text-blue-400">Careers</button></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={() => {}} className="hover:text-blue-400">Privacy Policy</button></li>
                <li><button onClick={() => {}} className="hover:text-blue-400">Terms of Service</button></li>
                <li><button onClick={() => {}} className="hover:text-blue-400">FCA Information</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2025 GETMY.MORTGAGE. All rights reserved.</p>
            <p className="mt-2">FCA Registered. Your home may be repossessed if you do not keep up repayments on your mortgage.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;