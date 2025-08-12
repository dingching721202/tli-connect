'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import RoleEntry from '@/components/RoleEntry';
import { FiActivity, FiClock, FiUsers, FiStar, FiCalendar, FiSearch, FiMapPin, FiEye } from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';

interface Event {
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
  category: string;
  tags: string[];
  features: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
}

const StudentEventsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock data for events
  const events: Event[] = [
    {
      id: 1,
      title: 'Chinese Culture Festival 2025',
      organizer: 'TLI Cultural Department',
      duration: '3 hours',
      participants: 45,
      maxParticipants: 100,
      rating: 4.8,
      price: 0,
      schedule: '2025-08-15 14:00',
      location: 'TLI Main Campus',
      description: 'Experience traditional Chinese culture through interactive workshops, performances, and cultural exhibits.',
      level: 'beginner',
      category: '文化',
      tags: ['文化', '免費', '體驗'],
      features: ['Cultural Workshops', 'Traditional Performances', 'Interactive Exhibits'],
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Business Chinese Networking',
      organizer: 'Business Language Center',
      duration: '2 hours',
      participants: 25,
      maxParticipants: 50,
      rating: 4.6,
      price: 500,
      schedule: '2025-08-20 18:30',
      location: 'Downtown Conference Hall',
      description: 'Network with professionals while practicing business Chinese in real-world scenarios.',
      level: 'intermediate',
      category: '商業',
      tags: ['networking', 'business', 'professional'],
      features: ['Professional Networking', 'Case Studies', 'Business Scenarios'],
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'Language Exchange Meetup',
      organizer: 'Language Corner Team',
      duration: '1.5 hours',
      participants: 60,
      maxParticipants: 80,
      rating: 4.7,
      price: 0,
      schedule: '2025-08-25 16:00',
      location: 'TLI Community Center',
      description: 'Practice multiple languages in a relaxed, friendly environment with native speakers.',
      level: 'beginner',
      category: '外文',
      tags: ['exchange', 'multilingual', 'social'],
      features: ['Multiple Languages', 'Native Speakers', 'Casual Environment'],
      status: 'upcoming'
    },
    {
      id: 5,
      title: 'Chinese Calligraphy Art Class',
      organizer: 'Traditional Arts Society',
      duration: '2.5 hours',
      participants: 15,
      maxParticipants: 20,
      rating: 4.5,
      price: 300,
      schedule: '2025-09-10 14:00',
      location: 'Art Studio',
      description: 'Learn the elegant art of Chinese calligraphy from master calligraphers.',
      level: 'beginner',
      category: '中文',
      tags: ['calligraphy', 'art', 'traditional'],
      features: ['Master Teachers', 'Traditional Tools', 'Take-home Artwork'],
      status: 'upcoming'
    },
    {
      id: 6,
      title: 'International Food & Language Fair',
      organizer: 'Cultural Exchange Program',
      duration: '5 hours',
      participants: 150,
      maxParticipants: 200,
      rating: 4.4,
      price: 200,
      schedule: '2025-09-20 11:00',
      location: 'City Convention Center',
      description: 'Explore global cuisines while practicing different languages with international participants.',
      level: 'intermediate',
      category: '文化',
      tags: ['international', 'food', 'languages'],
      features: ['Global Cuisine', 'Multiple Languages', 'Cultural Performances'],
      status: 'upcoming'
    }
  ];

  const levels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' }
  ];

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: '中文', name: 'Chinese' },
    { id: '外文', name: 'Foreign Languages' },
    { id: '文化', name: 'Culture' },
    { id: '商業', name: 'Business' },
    { id: '師培', name: 'Teacher Training' }
  ];

  const statuses = [
    { id: 'all', name: 'All Events' },
    { id: 'upcoming', name: 'Upcoming' },
    { id: 'ongoing', name: 'Ongoing' },
    { id: 'completed', name: 'Completed' }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || event.level === selectedLevel;
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || event.status === selectedStatus;
    
    return matchesSearch && matchesLevel && matchesCategory && matchesStatus;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = [
      'bg-orange-100 text-orange-800',
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800'
    ];
    const index = Math.abs(category.charCodeAt(0)) % colors.length;
    return colors[index];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getParticipationColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio < 0.5) return 'text-green-600';
    if (ratio < 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <RoleEntry requiredRole="STUDENT">
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
          <div className="px-4 py-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
                TLI Events & Activities
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-orange-100">
                Join engaging events and expand your learning experience
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiActivity} size={20} />
                  <span>Diverse Activities</span>
                </div>
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiUsers} size={20} />
                  <span>Community Learning</span>
                </div>
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiMapPin} size={20} />
                  <span>Multiple Locations</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="px-4 py-8">
          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="lg:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:w-40">
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {levels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:w-40">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {statuses.map(status => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              Found {filteredEvents.length} events
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
                <div className="relative h-48 bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <SafeIcon icon={FiActivity} size={48} className="text-white z-10 group-hover:scale-110 transition-transform" />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                      {event.category}
                    </span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
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

                    <div className="bg-orange-50 rounded-lg p-3">
                      <div className="text-xs text-orange-600 font-medium mb-1">Event Details</div>
                      <div className="flex flex-wrap gap-1">
                        {event.features.slice(0, 2).map((feature, i) => (
                          <span key={i} className="text-xs text-orange-800 bg-orange-100 px-2 py-1 rounded-full">
                            {feature}
                          </span>
                        ))}
                        {event.features.length > 2 && (
                          <span className="text-xs text-orange-600">+{event.features.length - 2} more</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-orange-600">
                      {event.price === 0 ? 'Free' : `NT$ ${event.price}`}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={event.participants >= event.maxParticipants}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                        event.participants >= event.maxParticipants
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-orange-600 text-white hover:bg-orange-700'
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </motion.div>
          )}
        </div>
      </div>
    </RoleEntry>
  );
};

export default StudentEventsPage;