'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { FiActivity, FiClock, FiUsers, FiStar, FiCalendar, FiSearch, FiMapPin, FiEye, FiCompass } from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';

interface CulturalEvent {
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
  culturalFocus: string;
  tags: string[];
  features: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
}

const CulturalEventsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCulturalFocus, setSelectedCulturalFocus] = useState('all');

  // Mock data for Cultural events
  const culturalEvents: CulturalEvent[] = [
    {
      id: 1,
      title: 'Asian Cultural Heritage Festival',
      organizer: 'Asia Pacific Cultural Center',
      duration: '6 hours',
      participants: 150,
      maxParticipants: 200,
      rating: 4.8,
      price: 500,
      schedule: '2025-08-18 10:00',
      location: 'Cultural Plaza',
      description: 'Explore the rich diversity of Asian cultures through traditional performances, art exhibitions, and cultural workshops.',
      level: 'beginner',
      culturalFocus: 'Asian Heritage',
      tags: ['multicultural', 'festival', 'traditional'],
      features: ['Traditional Performances', 'Art Exhibitions', 'Cultural Workshops'],
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Indigenous Storytelling Circle',
      organizer: 'Indigenous Cultural Preservation Society',
      duration: '3 hours',
      participants: 25,
      maxParticipants: 40,
      rating: 4.9,
      price: 300,
      schedule: '2025-08-24 19:00',
      location: 'Heritage Museum',
      description: 'Listen to traditional stories and legends from indigenous elders, learning about ancient wisdom and cultural values.',
      level: 'intermediate',
      culturalFocus: 'Indigenous Culture',
      tags: ['storytelling', 'traditional', 'wisdom'],
      features: ['Elder Storytellers', 'Traditional Setting', 'Cultural Context'],
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'World Music Fusion Workshop',
      organizer: 'Global Music Collective',
      duration: '4 hours',
      participants: 30,
      maxParticipants: 35,
      rating: 4.7,
      price: 1200,
      schedule: '2025-08-30 14:00',
      location: 'Music Studio',
      description: 'Learn to blend traditional instruments from different cultures to create unique fusion music compositions.',
      level: 'advanced',
      culturalFocus: 'World Music',
      tags: ['music', 'fusion', 'instruments'],
      features: ['Traditional Instruments', 'Composition Techniques', 'Live Performance'],
      status: 'upcoming'
    },
    {
      id: 4,
      title: 'Mediterranean Cooking & Culture',
      organizer: 'Mediterranean Cultural Association',
      duration: '5 hours',
      participants: 20,
      maxParticipants: 24,
      rating: 4.6,
      price: 1800,
      schedule: '2025-09-04 12:00',
      location: 'Culinary Arts Center',
      description: 'Discover Mediterranean culture through authentic cooking experiences, learning traditional recipes and cultural significance.',
      level: 'beginner',
      culturalFocus: 'Mediterranean',
      tags: ['cooking', 'authentic', 'regional'],
      features: ['Authentic Recipes', 'Cultural History', 'Full Meal Experience'],
      status: 'upcoming'
    },
    {
      id: 5,
      title: 'African Dance & Rhythm Celebration',
      organizer: 'African Cultural Center',
      duration: '3 hours',
      participants: 35,
      maxParticipants: 50,
      rating: 4.5,
      price: 800,
      schedule: '2025-09-09 16:00',
      location: 'Dance Theater',
      description: 'Experience the vibrant energy of African culture through traditional dances, drumming, and rhythmic celebrations.',
      level: 'beginner',
      culturalFocus: 'African Heritage',
      tags: ['dance', 'rhythm', 'energetic'],
      features: ['Traditional Dances', 'Live Drumming', 'Cultural Costumes'],
      status: 'upcoming'
    },
    {
      id: 6,
      title: 'Nordic Folk Art & Crafts Workshop',
      organizer: 'Scandinavian Heritage Society',
      duration: '4 hours',
      participants: 18,
      maxParticipants: 22,
      rating: 4.4,
      price: 1500,
      schedule: '2025-09-14 13:00',
      location: 'Art Workshop Studio',
      description: 'Learn traditional Nordic folk art techniques including wood carving, textile patterns, and metal crafting.',
      level: 'intermediate',
      culturalFocus: 'Nordic Heritage',
      tags: ['crafts', 'traditional', 'hands-on'],
      features: ['Traditional Techniques', 'Authentic Materials', 'Take-home Crafts'],
      status: 'upcoming'
    }
  ];

  const levels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' }
  ];

  const culturalFoci = [
    { id: 'all', name: 'All Cultures' },
    { id: 'Asian Heritage', name: 'Asian Heritage' },
    { id: 'Indigenous Culture', name: 'Indigenous Culture' },
    { id: 'World Music', name: 'World Music' },
    { id: 'Mediterranean', name: 'Mediterranean' },
    { id: 'African Heritage', name: 'African Heritage' },
    { id: 'Nordic Heritage', name: 'Nordic Heritage' }
  ];

  const filteredEvents = culturalEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || event.level === selectedLevel;
    const matchesCulturalFocus = selectedCulturalFocus === 'all' || event.culturalFocus === selectedCulturalFocus;
    
    return matchesSearch && matchesLevel && matchesCulturalFocus;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCulturalFocusColor = (culturalFocus: string) => {
    const colors = [
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-teal-100 text-teal-800'
    ];
    const index = Math.abs(culturalFocus.charCodeAt(0)) % colors.length;
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
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Cultural Events & Experiences
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-purple-100">
              Discover the world&apos;s rich cultural heritage through immersive experiences
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiCompass} size={20} />
                <span>Cultural Exploration</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiActivity} size={20} />
                <span>Interactive Workshops</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiUsers} size={20} />
                <span>Community Learning</span>
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
                <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                <input
                  type="text"
                  placeholder="Search cultural events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="lg:w-48">
              <select
                value={selectedCulturalFocus}
                onChange={(e) => setSelectedCulturalFocus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {culturalFoci.map(culturalFocus => (
                  <option key={culturalFocus.id} value={culturalFocus.id}>
                    {culturalFocus.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:w-40">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            Found {filteredEvents.length} cultural events
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
              <div className="relative h-48 bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <SafeIcon icon={FiCompass} size={48} className="text-white z-10 group-hover:scale-110 transition-transform" />
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCulturalFocusColor(event.culturalFocus)}`}>
                    {event.culturalFocus}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
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

                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-xs text-purple-600 font-medium mb-1">Event Features</div>
                    <div className="flex flex-wrap gap-1">
                      {event.features.map((feature, i) => (
                        <span key={i} className="text-xs text-purple-800 bg-purple-100 px-2 py-1 rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-purple-600">
                    {event.price === 0 ? 'Free' : `NT$ ${event.price}`}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={event.participants >= event.maxParticipants}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                      event.participants >= event.maxParticipants
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No cultural events found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CulturalEventsPage;