import React, { useState } from 'react';
import { Search, Star, MapPin, Phone, Truck, Package, Shield, Clock, CheckCircle, Award, Users, TrendingUp } from 'lucide-react';

const RemovalsMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  // Sample removal company data
  const companies = [
    {
      id: 1,
      name: "Swift Moves Manchester",
      location: "Manchester City Centre",
      postcode: "M1 4BT",
      distance: "1.5 miles",
      rating: 4.9,
      reviewCount: 234,
      priceFrom: "£350",
      priceNote: "2 bed flat, local move",
      responseTime: "Within 1 hour",
      vehicleTypes: ["Large Van", "Luton Van", "7.5T Truck"],
      insurance: "£50,000 cover",
      teamSize: "2-4 movers",
      yearsExperience: 12,
      avatar: "https://ui-avatars.com/api/?name=Swift+Moves&background=3b82f6&color=fff&size=200",
      featured: true,
      services: ["House Moves", "Packing Service", "Storage", "Piano Moving"],
      topReview: "Absolutely brilliant! Turned up on time, careful with everything, and completed our 3-bed move in 5 hours. Worth every penny!",
      stats: {
        completedMoves: 1200,
        damageRate: "0.2%",
        onTimeRate: "99%"
      }
    },
    {
      id: 2,
      name: "Elite Removals North West",
      location: "Salford",
      postcode: "M5 3EJ",
      distance: "2.8 miles",
      rating: 4.8,
      reviewCount: 189,
      priceFrom: "£295",
      priceNote: "Best value guarantee",
      responseTime: "Same day",
      vehicleTypes: ["Large Van", "Luton Van"],
      insurance: "£100,000 cover",
      teamSize: "2-3 movers",
      yearsExperience: 8,
      avatar: "https://ui-avatars.com/api/?name=Elite+Removals&background=8b5cf6&color=fff&size=200",
      featured: true,
      services: ["House Moves", "Packing Service", "Office Moves", "Man & Van"],
      topReview: "Great value for money. The team was professional, efficient, and nothing was damaged. Highly recommend!",
      stats: {
        completedMoves: 890,
        damageRate: "0.3%",
        onTimeRate: "98%"
      }
    },
    {
      id: 3,
      name: "Premium Property Movers",
      location: "Didsbury",
      postcode: "M20 2GH",
      distance: "4.2 miles",
      rating: 5.0,
      reviewCount: 156,
      priceFrom: "£450",
      priceNote: "Premium white-glove service",
      responseTime: "Within 30 mins",
      vehicleTypes: ["Luton Van", "7.5T Truck", "18T Lorry"],
      insurance: "£250,000 cover",
      teamSize: "3-6 movers",
      yearsExperience: 15,
      avatar: "https://ui-avatars.com/api/?name=Premium+Movers&background=10b981&color=fff&size=200",
      featured: true,
      services: ["House Moves", "Full Packing", "Storage", "Piano Moving", "Art & Antiques"],
      topReview: "Used them for our £800k house move. Impeccable service, treated everything like precious cargo. Not cheap but worth it!",
      stats: {
        completedMoves: 650,
        damageRate: "0.1%",
        onTimeRate: "100%"
      }
    },
    {
      id: 4,
      name: "Speedy Shift Removals",
      location: "Stockport",
      postcode: "SK1 3TS",
      distance: "5.8 miles",
      rating: 4.7,
      reviewCount: 298,
      priceFrom: "£275",
      priceNote: "Budget friendly",
      responseTime: "Within 2 hours",
      vehicleTypes: ["Medium Van", "Large Van", "Luton Van"],
      insurance: "£30,000 cover",
      teamSize: "2 movers",
      yearsExperience: 6,
      avatar: "https://ui-avatars.com/api/?name=Speedy+Shift&background=f59e0b&color=fff&size=200",
      featured: false,
      services: ["House Moves", "Man & Van", "Single Item", "Student Moves"],
      topReview: "Perfect for our budget. Quick, friendly, and got the job done. A few minor scratches but nothing major.",
      stats: {
        completedMoves: 1450,
        damageRate: "0.5%",
        onTimeRate: "96%"
      }
    },
    {
      id: 5,
      name: "Family First Removals",
      location: "Bolton",
      postcode: "BL1 1SE",
      distance: "9.1 miles",
      rating: 4.9,
      reviewCount: 167,
      priceFrom: "£320",
      priceNote: "Family owned & operated",
      responseTime: "Within 3 hours",
      vehicleTypes: ["Large Van", "Luton Van", "7.5T Truck"],
      insurance: "£75,000 cover",
      teamSize: "2-4 movers",
      yearsExperience: 20,
      avatar: "https://ui-avatars.com/api/?name=Family+First&background=ef4444&color=fff&size=200",
      featured: false,
      services: ["House Moves", "Packing Service", "Storage", "Dismantling/Assembly"],
      topReview: "Lovely family-run business. Felt like they genuinely cared about our stuff. Great communication throughout.",
      stats: {
        completedMoves: 780,
        damageRate: "0.2%",
        onTimeRate: "99%"
      }
    }
  ];

  const services = [
    "All Services",
    "House Moves",
    "Packing Service",
    "Storage",
    "Man & Van",
    "Office Moves"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Find Your Removal Company</h1>
          <p className="text-xl text-orange-100">Compare trusted removal companies by ratings, price, and reviews</p>
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
                placeholder="Search by location, postcode, or company name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Service Filter */}
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            >
              {services.map(service => (
                <option key={service} value={service.toLowerCase()}>
                  {service}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
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
        <div className="mb-6">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{companies.length}</span> removal companies found
          </p>
        </div>

        {/* Company Cards */}
        <div className="space-y-6">
          {companies.map((company) => (
            <div key={company.id} className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden ${company.featured ? 'ring-2 ring-orange-500' : ''}`}>
              {company.featured && (
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 text-sm font-semibold flex items-center gap-2">
                  <Award size={16} />
                  Featured Company
                </div>
              )}

              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: Logo & Basic Info */}
                  <div className="flex gap-4">
                    <img 
                      src={company.avatar} 
                      alt={company.name}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{company.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin size={16} />
                          <span>{company.location}</span>
                        </div>
                        <span>•</span>
                        <span>{company.distance} away</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock size={14} />
                        <span>{company.yearsExperience} years experience</span>
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
                            className={i < Math.floor(company.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-lg">{company.rating}</span>
                      <span className="text-gray-500">({company.reviewCount} reviews)</span>
                    </div>

                    {/* Top Review */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700 italic">"{company.topReview}"</p>
                    </div>

                    {/* Services */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {company.services.map(service => (
                        <span key={service} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
                          {service}
                        </span>
                      ))}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <div className="text-sm text-gray-500">Response Time</div>
                        <div className="font-semibold text-gray-900">{company.responseTime}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Completed Moves</div>
                        <div className="font-semibold text-green-600">{company.stats.completedMoves}+</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">On-Time Rate</div>
                        <div className="font-semibold text-gray-900">{company.stats.onTimeRate}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Insurance</div>
                        <div className="font-semibold text-gray-900">{company.insurance}</div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & CTA */}
                  <div className="flex flex-col items-end justify-between lg:w-64 border-l pl-6">
                    <div className="text-right mb-4">
                      <div className="text-sm text-gray-500 mb-1">From</div>
                      <div className="text-4xl font-bold text-gray-900 mb-1">{company.priceFrom}</div>
                      <div className="text-sm text-green-600 font-medium">{company.priceNote}</div>
                      <div className="text-xs text-gray-500 mt-2">Exact quote based on your move</div>
                    </div>

                    <div className="space-y-2 w-full">
                      <button className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                        <Truck size={18} />
                        Get 3 Quotes
                      </button>
                      <button className="w-full border-2 border-orange-600 text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-all">
                        View Profile
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
                      <CheckCircle size={16} className="text-green-600" />
                      <span>Verified reviews</span>
                    </div>
                  </div>
                </div>

                {/* Vehicle Types & Team Info */}
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                        <Truck size={16} />
                        <span className="font-medium">Vehicle Types:</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {company.vehicleTypes.map(vehicle => (
                          <span key={vehicle} className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs font-medium">
                            {vehicle}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                        <Users size={16} />
                        <span className="font-medium">Team Size:</span> {company.teamSize}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Shield size={16} />
                        <span className="font-medium">Damage Rate:</span> {company.stats.damageRate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="bg-white border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all">
            Load More Companies
          </button>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-white border-t py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">300+</div>
              <p className="text-gray-600">Trusted Companies</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">50,000+</div>
              <p className="text-gray-600">Successful Moves</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">4.8★</div>
              <p className="text-gray-600">Average Rating</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">99%</div>
              <p className="text-gray-600">Damage-Free</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Get 3 Quotes</h3>
              <p className="text-gray-600">Tell us about your move and get instant quotes from 3 top-rated companies</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Compare & Choose</h3>
              <p className="text-gray-600">Review ratings, prices, and reviews to find your perfect match</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Book & Relax</h3>
              <p className="text-gray-600">Book online and let the pros handle your move stress-free</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemovalsMarketplace;