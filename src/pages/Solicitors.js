import React, { useState } from 'react';
import { Search, Star, MapPin, MessageCircle, Filter, Award, CheckCircle } from 'lucide-react';
const SolicitorsMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  // Sample solicitor data (will come from database later)
  const solicitors = [
    {
      id: 1,
      name: "Thompson Legal Services",
      firmName: "Thompson & Partners LLP",
      location: "Manchester City Centre",
      postcode: "M1 2AB",
      distance: "2.3 miles",
      rating: 4.9,
      reviewCount: 127,
      price: "£850",
      priceNote: "Fixed fee",
      responseTime: "Within 2 hours",
      completionRate: 98,
      specialty: ["First Time Buyers", "Remortgage", "Leasehold"],
      yearsExperience: 15,
      avatar: "https://ui-avatars.com/api/?name=Thompson+Legal&background=3b82f6&color=fff&size=200",
      featured: true,
      topReview: "Excellent service, very responsive and explained everything clearly. Made our first home purchase stress-free!",
      stats: {
        avgCompletionTime: "8 weeks",
        casesCompleted: 450,
        onPanel: ["Nationwide", "HSBC", "Barclays"]
      }
    },
    {
      id: 2,
      name: "Sarah Mitchell",
      firmName: "Mitchell Conveyancing Ltd",
      location: "Salford Quays",
      postcode: "M50 3AG",
      distance: "3.1 miles",
      rating: 4.8,
      reviewCount: 93,
      price: "£795",
      priceNote: "No completion, no fee",
      responseTime: "Same day",
      completionRate: 96,
      specialty: ["Buy to Let", "New Build", "Shared Ownership"],
      yearsExperience: 12,
      avatar: "https://ui-avatars.com/api/?name=Sarah+Mitchell&background=8b5cf6&color=fff&size=200",
      featured: true,
      topReview: "Sarah was fantastic! Really knew her stuff and kept us updated throughout. Highly recommend for buy-to-let purchases.",
      stats: {
        avgCompletionTime: "7 weeks",
        casesCompleted: 380,
        onPanel: ["Santander", "NatWest", "TSB"]
      }
    },
    {
      id: 3,
      name: "David Chen",
      firmName: "City Law Group",
      location: "Manchester Central",
      postcode: "M2 5DB",
      distance: "1.8 miles",
      rating: 4.7,
      reviewCount: 156,
      price: "£925",
      priceNote: "Premium service",
      responseTime: "Within 4 hours",
      completionRate: 97,
      specialty: ["High Value Properties", "Commercial", "Auction"],
      yearsExperience: 20,
      avatar: "https://ui-avatars.com/api/?name=David+Chen&background=10b981&color=fff&size=200",
      featured: false,
      topReview: "Professional and thorough. Worth every penny for the peace of mind on our £500k purchase.",
      stats: {
        avgCompletionTime: "9 weeks",
        casesCompleted: 620,
        onPanel: ["HSBC", "Barclays", "Lloyds"]
      }
    },
    {
      id: 4,
      name: "Emma Rodriguez",
      firmName: "Quick Convey Solutions",
      location: "Stockport",
      postcode: "SK1 1EB",
      distance: "6.2 miles",
      rating: 4.9,
      reviewCount: 201,
      price: "£750",
      priceNote: "Best value",
      responseTime: "Within 1 hour",
      completionRate: 99,
      specialty: ["First Time Buyers", "Help to Buy", "Fast Track"],
      yearsExperience: 8,
      avatar: "https://ui-avatars.com/api/?name=Emma+Rodriguez&background=f59e0b&color=fff&size=200",
      featured: true,
      topReview: "Lightning fast! Completed in 6 weeks. Emma was available whenever we had questions. Amazing value!",
      stats: {
        avgCompletionTime: "6 weeks",
        casesCompleted: 520,
        onPanel: ["Nationwide", "Halifax", "Virgin Money"]
      }
    },
    {
      id: 5,
      name: "James Patterson",
      firmName: "Heritage Legal Partners",
      location: "Altrincham",
      postcode: "WA14 1SA",
      distance: "8.5 miles",
      rating: 4.6,
      reviewCount: 87,
      price: "£895",
      priceNote: "Includes searches",
      responseTime: "Within 6 hours",
      completionRate: 95,
      specialty: ["Period Properties", "Listed Buildings", "Remortgage"],
      yearsExperience: 18,
      avatar: "https://ui-avatars.com/api/?name=James+Patterson&background=ef4444&color=fff&size=200",
      featured: false,
      topReview: "Expert knowledge on our Victorian terrace. Handled complex survey issues brilliantly.",
      stats: {
        avgCompletionTime: "10 weeks",
        casesCompleted: 340,
        onPanel: ["Santander", "TSB", "Skipton"]
      }
    }
  ];

  const specialties = [
    "All Specialties",
    "First Time Buyers",
    "Remortgage",
    "Buy to Let",
    "New Build",
    "Leasehold",
    "Help to Buy"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Find Your Perfect Solicitor</h1>
          <p className="text-xl text-blue-100">Compare conveyancing solicitors by ratings, price, and reviews</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by location, postcode, or firm name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Specialty Filter */}
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {specialties.map(specialty => (
                <option key={specialty} value={specialty.toLowerCase()}>
                  {specialty}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="rating">Highest Rated</option>
              <option value="price-low">Lowest Price</option>
              <option value="price-high">Highest Price</option>
              <option value="reviews">Most Reviews</option>
              <option value="distance">Nearest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{solicitors.length}</span> solicitors found
          </p>
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
            <Filter size={18} />
            More Filters
          </button>
        </div>

        {/* Solicitor Cards */}
        <div className="space-y-6">
          {solicitors.map((solicitor) => (
            <div key={solicitor.id} className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden ${solicitor.featured ? 'ring-2 ring-blue-500' : ''}`}>
              {solicitor.featured && (
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 text-sm font-semibold flex items-center gap-2">
                  <Award size={16} />
                  Featured Solicitor
                </div>
              )}

              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: Avatar & Basic Info */}
                  <div className="flex gap-4">
                    <img 
                      src={solicitor.avatar} 
                      alt={solicitor.name}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{solicitor.name}</h3>
                      <p className="text-gray-600 mb-2">{solicitor.firmName}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin size={16} />
                          <span>{solicitor.location}</span>
                        </div>
                        <span>•</span>
                        <span>{solicitor.distance} away</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Stats & Info */}
                  <div className="flex-1">
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={18} 
                            className={i < Math.floor(solicitor.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-lg">{solicitor.rating}</span>
                      <span className="text-gray-500">({solicitor.reviewCount} reviews)</span>
                    </div>

                    {/* Top Review */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700 italic">"{solicitor.topReview}"</p>
                    </div>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {solicitor.specialty.map(spec => (
                        <span key={spec} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                          {spec}
                        </span>
                      ))}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Response Time</div>
                        <div className="font-semibold text-gray-900">{solicitor.responseTime}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Completion Rate</div>
                        <div className="font-semibold text-green-600">{solicitor.completionRate}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Avg Time</div>
                        <div className="font-semibold text-gray-900">{solicitor.stats.avgCompletionTime}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Cases Done</div>
                        <div className="font-semibold text-gray-900">{solicitor.stats.casesCompleted}+</div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & CTA */}
                  <div className="flex flex-col items-end justify-between lg:w-64 border-l pl-6">
                    <div className="text-right mb-4">
                      <div className="text-sm text-gray-500 mb-1">From</div>
                      <div className="text-4xl font-bold text-gray-900 mb-1">{solicitor.price}</div>
                      <div className="text-sm text-green-600 font-medium">{solicitor.priceNote}</div>
                      <div className="text-xs text-gray-500 mt-2">+ disbursements & searches</div>
                    </div>

                    <div className="space-y-2 w-full">
                      <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                        <MessageCircle size={18} />
                        Get Quote
                      </button>
                      <button className="w-full border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all">
                        View Profile
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
                      <CheckCircle size={16} className="text-green-600" />
                      <span>Verified reviews</span>
                    </div>
                  </div>
                </div>

                {/* Lender Panel Info */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">On panel for:</p>
                  <div className="flex flex-wrap gap-2">
                    {solicitor.stats.onPanel.map(lender => (
                      <span key={lender} className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs font-medium">
                        {lender}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="bg-white border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all">
            Load More Solicitors
          </button>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-white border-t py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <p className="text-gray-600">Verified Solicitors</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
              <p className="text-gray-600">Successful Completions</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">4.8★</div>
              <p className="text-gray-600">Average Rating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolicitorsMarketplace;