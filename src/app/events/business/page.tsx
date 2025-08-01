'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { FiActivity, FiClock, FiUsers, FiStar, FiCalendar, FiSearch, FiMapPin, FiEye, FiBriefcase } from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';

interface BusinessEvent {
  id: number;
  title: string;
  organizer: string;
  duration: string;
  participants: number;
  maxParticipants: number;
  rating: number;
  price: number;
  schedule: string;
  location: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  businessType: string;
  tags: string[];
  features: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
}

const BusinessEventsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedBusinessType, setSelectedBusinessType] = useState('all');

  // Mock data for Business events
  const businessEvents: BusinessEvent[] = [
    {
      id: 1,
      title: 'Corporate Chinese Communication Workshop',
      organizer: 'Business Language Institute',
      duration: '4 hours',
      participants: 22,
      maxParticipants: 30,
      rating: 4.7,
      price: 2500,
      schedule: '2025-08-17 09:00',
      location: 'Corporate Training Center',
      description: 'Master professional Chinese communication skills for corporate environments, including presentations and negotiations.',
      level: 'intermediate',
      businessType: 'Communication',
      tags: ['corporate', 'professional', 'communication'],
      features: ['Role-play Scenarios', 'Business Presentations', 'Networking Practice'],
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'International Trade Chinese Seminar',
      organizer: 'Trade Association',
      duration: '6 hours',
      participants: 35,
      maxParticipants: 50,
      rating: 4.8,
      price: 3200,
      schedule: '2025-08-23 10:00',
      location: 'Trade Center',
      description: 'Learn specialized vocabulary and practices for international trade, import/export, and cross-border business.',
      level: 'advanced',
      businessType: 'International Trade',
      tags: ['trade', 'import-export', 'specialized'],
      features: ['Trade Documentation', 'Contract Negotiation', 'Market Analysis'],
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'Startup Pitch Competition in Chinese',
      organizer: 'Entrepreneurship Hub',
      duration: '5 hours',
      participants: 18,
      maxParticipants: 25,
      rating: 4.6,
      price: 1800,
      schedule: '2025-08-29 13:00',
      location: 'Innovation Center',
      description: 'Practice presenting startup ideas and business plans to Chinese-speaking investors and mentors.',
      level: 'intermediate',
      businessType: 'Entrepreneurship',
      tags: ['startup', 'pitching', 'competition'],
      features: ['Investor Panel', 'Pitch Coaching', 'Networking Event'],
      status: 'upcoming'
    },
    {
      id: 4,
      title: 'Financial Chinese for Banking',
      organizer: 'Finance Training Institute',
      duration: '3 hours',
      participants: 28,
      maxParticipants: 35,
      rating: 4.9,
      price: 2800,
      schedule: '2025-09-06 14:30',
      location: 'Banking Academy',
      description: 'Specialized training for banking professionals working with Chinese-speaking clients and markets.',
      level: 'advanced',
      businessType: 'Finance & Banking',
      tags: ['finance', 'banking', 'professional'],
      features: ['Financial Terminology', 'Client Interaction', 'Market Updates'],
      status: 'upcoming'
    },
    {
      id: 5,
      title: 'E-commerce Business Chinese',
      organizer: 'Digital Commerce Academy',
      duration: '4 hours',
      participants: 25,
      maxParticipants: 40,
      rating: 4.5,
      price: 2200,
      schedule: '2025-09-11 11:00',
      location: 'Tech Hub',
      description: 'Learn business Chinese specifically for e-commerce, online marketing, and digital business operations.',
      level: 'beginner',
      businessType: 'E-commerce',
      tags: ['e-commerce', 'digital', 'marketing'],
      features: ['Platform Navigation', 'Customer Service', 'Digital Marketing'],
      status: 'upcoming'
    },
    {
      id: 6,
      title: 'Hotel & Tourism Business Chinese',
      organizer: 'Hospitality Training Center',
      duration: '3.5 hours',
      participants: 20,
      maxParticipants: 30,
      rating: 4.4,
      price: 1900,
      schedule: '2025-09-16 15:00',
      location: 'Hotel Training Facility',
      description: 'Specialized Chinese language training for hospitality and tourism industry professionals.',
      level: 'beginner',
      businessType: 'Hospitality',
      tags: ['hospitality', 'tourism', 'service'],
      features: ['Guest Interaction', 'Service Excellence', 'Cultural Sensitivity'],
      status: 'upcoming'
    }
  ];

  const levels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' }
  ];

  const businessTypes = [
    { id: 'all', name: 'All Business Types' },
    { id: 'Communication', name: 'Communication' },
    { id: 'International Trade', name: 'International Trade' },
    { id: 'Entrepreneurship', name: 'Entrepreneurship' },
    { id: 'Finance & Banking', name: 'Finance & Banking' },
    { id: 'E-commerce', name: 'E-commerce' },
    { id: 'Hospitality', name: 'Hospitality' }
  ];

  const filteredEvents = businessEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || event.level === selectedLevel;
    const matchesBusinessType = selectedBusinessType === 'all' || event.businessType === selectedBusinessType;
    
    return matchesSearch && matchesLevel && matchesBusinessType;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBusinessTypeColor = (businessType: string) => {
    const colors = [
      'bg-red-100 text-red-800',
      'bg-pink-100 text-pink-800',
      'bg-rose-100 text-rose-800',
      'bg-orange-100 text-orange-800',
      'bg-amber-100 text-amber-800',
      'bg-yellow-100 text-yellow-800',
      'bg-lime-100 text-lime-800'
    ];
    const index = Math.abs(businessType.charCodeAt(0)) % colors.length;
    return colors[index];
  };

  const getParticipationColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio < 0.5) return 'text-green-600';
    if (ratio < 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Business Events & Training
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-red-100">
              Advance your career with professional business Chinese training
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiBriefcase} size={20} />
                <span>Professional Training</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiActivity} size={20} />
                <span>Industry Expertise</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiUsers} size={20} />
                <span>Career Development</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search business events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="lg:w-48">
              <select
                value={selectedBusinessType}
                onChange={(e) => setSelectedBusinessType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {businessTypes.map(businessType => (
                  <option key={businessType.id} value={businessType.id}>
                    {businessType.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:w-40">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {levels.map(level => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Found {filteredEvents.length} business events
          </div>
        </motion.div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
            >
              <div className="relative h-48 bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <SafeIcon icon={FiBriefcase} size={48} className="text-white z-10 group-hover:scale-110 transition-transform" />
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBusinessTypeColor(event.businessType)}`}>
                    {event.businessType}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex items-center text-yellow-500">
                    <SafeIcon icon={FiStar} size={16} />
                    <span className="ml-1 text-sm font-medium text-gray-700">{event.rating}</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-500">Organizer: {event.organizer}</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(event.level)}`}>
                      {levels.find(l => l.id === event.level)?.name}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <SafeIcon icon={FiClock} size={14} className="mr-2" />
                    <span>{event.duration}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-500">
                      <SafeIcon icon={FiUsers} size={14} className="mr-2" />
                      <span className={getParticipationColor(event.participants, event.maxParticipants)}>
                        {event.participants}/{event.maxParticipants} participants
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {event.maxParticipants - event.participants > 0 
                        ? `${event.maxParticipants - event.participants} spots left`
                        : 'Full'
                      }
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <SafeIcon icon={FiCalendar} size={14} className="mr-2" />
                    <span>{new Date(event.schedule).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <SafeIcon icon={FiMapPin} size={14} className="mr-2" />
                    <span>{event.location}</span>
                  </div>

                  <div className="bg-red-50 rounded-lg p-3">
                    <div className="text-xs text-red-600 font-medium mb-1">Event Features</div>
                    <div className="flex flex-wrap gap-1">
                      {event.features.map((feature, i) => (
                        <span key={i} className="text-xs text-red-800 bg-red-100 px-2 py-1 rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-red-600">
                    {event.price === 0 ? 'Free' : `NT$ ${event.price}`}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={event.participants >= event.maxParticipants}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                      event.participants >= event.maxParticipants
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    <SafeIcon icon={event.participants >= event.maxParticipants ? FiEye : FiActivity} size={16} />
                    <span>{event.participants >= event.maxParticipants ? 'View Details' : 'Join Event'}</span>
                  </motion.button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {event.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <SafeIcon icon={FiSearch} size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No business events found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BusinessEventsPage;