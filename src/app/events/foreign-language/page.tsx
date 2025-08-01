'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { FiActivity, FiClock, FiUsers, FiStar, FiCalendar, FiSearch, FiMapPin, FiEye, FiGlobe } from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';

interface ForeignLanguageEvent {
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
  language: string;
  tags: string[];
  features: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
}

const ForeignLanguageEventsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  // Mock data for Foreign Language events
  const foreignLanguageEvents: ForeignLanguageEvent[] = [
    {
      id: 1,
      title: 'English Speaking Club',
      organizer: 'International Language Center',
      duration: '2 hours',
      participants: 25,
      maxParticipants: 30,
      rating: 4.7,
      price: 0,
      schedule: '2025-08-16 18:00',
      location: 'Community Center',
      description: 'Practice conversational English with native speakers and fellow learners in a relaxed environment.',
      level: 'intermediate',
      language: 'English',
      tags: ['conversation', 'free', 'native speakers'],
      features: ['Native Speakers', 'Group Discussions', 'Free Participation'],
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Japanese Tea Ceremony & Language',
      organizer: 'Japan Cultural Association',
      duration: '3 hours',
      participants: 12,
      maxParticipants: 16,
      rating: 4.8,
      price: 1200,
      schedule: '2025-08-22 14:00',
      location: 'Japanese Culture Center',
      description: 'Learn Japanese language through traditional tea ceremony, combining cultural practice with language learning.',
      level: 'beginner',
      language: 'Japanese',
      tags: ['cultural', 'traditional', 'immersive'],
      features: ['Authentic Ceremony', 'Cultural Context', 'Language Practice'],
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'Korean K-Pop Dance & Language Workshop',
      organizer: 'Korean Cultural Center',
      duration: '2.5 hours',
      participants: 20,
      maxParticipants: 25,
      rating: 4.6,
      price: 800,
      schedule: '2025-08-28 16:00',
      location: 'Dance Studio',
      description: 'Learn Korean through popular K-Pop songs and dance choreography, making language learning fun and engaging.',
      level: 'beginner',
      language: 'Korean',
      tags: ['k-pop', 'dance', 'modern'],
      features: ['Dance Choreography', 'Song Lyrics', 'Cultural Trends'],
      status: 'upcoming'
    },
    {
      id: 4,
      title: 'Spanish Cooking & Conversation',
      organizer: 'Hispanic Cultural Society',
      duration: '4 hours',
      participants: 15,
      maxParticipants: 20,
      rating: 4.5,
      price: 1500,
      schedule: '2025-09-03 11:00',
      location: 'Culinary Institute',
      description: 'Learn Spanish while cooking traditional Latin American dishes with native Spanish-speaking chefs.',
      level: 'intermediate',
      language: 'Spanish',
      tags: ['cooking', 'practical', 'authentic'],
      features: ['Hands-on Cooking', 'Native Chefs', 'Recipe Cards'],
      status: 'upcoming'
    },
    {
      id: 5,
      title: 'French Wine Tasting & Culture',
      organizer: 'Alliance Française',
      duration: '3 hours',
      participants: 18,
      maxParticipants: 24,
      rating: 4.9,
      price: 2000,
      schedule: '2025-09-08 19:00',
      location: 'Wine Bar',
      description: 'Explore French culture and language through wine tasting, learning about regions, varieties, and traditions.',
      level: 'advanced',
      language: 'French',
      tags: ['wine', 'culture', 'sophisticated'],
      features: ['Professional Sommelier', 'Wine Varieties', 'Cultural History'],
      status: 'upcoming'
    },
    {
      id: 6,
      title: 'German Oktoberfest Language Festival',
      organizer: 'German Cultural Institute',
      duration: '5 hours',
      participants: 40,
      maxParticipants: 60,
      rating: 4.4,
      price: 1800,
      schedule: '2025-09-12 13:00',
      location: 'Festival Grounds',
      description: 'Celebrate German culture with traditional food, music, and games while practicing German conversation.',
      level: 'beginner',
      language: 'German',
      tags: ['festival', 'traditional', 'immersive'],
      features: ['Traditional Food', 'Live Music', 'Cultural Games'],
      status: 'upcoming'
    }
  ];

  const levels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' }
  ];

  const languages = [
    { id: 'all', name: 'All Languages' },
    { id: 'English', name: 'English' },
    { id: 'Japanese', name: 'Japanese' },
    { id: 'Korean', name: 'Korean' },
    { id: 'Spanish', name: 'Spanish' },
    { id: 'French', name: 'French' },
    { id: 'German', name: 'German' }
  ];

  const filteredEvents = foreignLanguageEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || event.level === selectedLevel;
    const matchesLanguage = selectedLanguage === 'all' || event.language === selectedLanguage;
    
    return matchesSearch && matchesLevel && matchesLanguage;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLanguageColor = (language: string) => {
    switch (language) {
      case 'English': return 'bg-blue-100 text-blue-800';
      case 'Japanese': return 'bg-pink-100 text-pink-800';
      case 'Korean': return 'bg-purple-100 text-purple-800';
      case 'Spanish': return 'bg-orange-100 text-orange-800';
      case 'French': return 'bg-indigo-100 text-indigo-800';
      case 'German': return 'bg-yellow-100 text-yellow-800';
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Foreign Language Events
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100">
              Explore global languages through immersive cultural experiences
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiGlobe} size={20} />
                <span>Multiple Languages</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiActivity} size={20} />
                <span>Cultural Immersion</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiUsers} size={20} />
                <span>Native Speakers</span>
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
                  placeholder="Search foreign language events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="lg:w-48">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {languages.map(language => (
                  <option key={language.id} value={language.id}>
                    {language.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:w-40">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
            Found {filteredEvents.length} foreign language events
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
              <div className="relative h-48 bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <SafeIcon icon={FiGlobe} size={48} className="text-white z-10 group-hover:scale-110 transition-transform" />
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLanguageColor(event.language)}`}>
                    {event.language}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
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

                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-xs text-green-600 font-medium mb-1">Event Features</div>
                    <div className="flex flex-wrap gap-1">
                      {event.features.map((feature, i) => (
                        <span key={i} className="text-xs text-green-800 bg-green-100 px-2 py-1 rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-green-600">
                    {event.price === 0 ? 'Free' : `NT$ ${event.price}`}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={event.participants >= event.maxParticipants}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                      event.participants >= event.maxParticipants
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No foreign language events found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ForeignLanguageEventsPage;