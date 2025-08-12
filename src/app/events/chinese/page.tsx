'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { FiActivity, FiClock, FiUsers, FiStar, FiCalendar, FiSearch, FiMapPin, FiEye, FiEdit3 } from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';

interface ChineseEvent {
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
  eventType: string;
  tags: string[];
  features: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
}

const ChineseEventsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedEventType, setSelectedEventType] = useState('all');

  // Mock data for Chinese events
  const chineseEvents: ChineseEvent[] = [
    {
      id: 1,
      title: 'Chinese Calligraphy Workshop',
      organizer: 'Traditional Arts Center',
      duration: '3 hours',
      participants: 18,
      maxParticipants: 25,
      rating: 4.8,
      price: 800,
      schedule: '2025-08-15 14:00',
      location: 'Art Studio A',
      description: 'Learn the fundamentals of Chinese calligraphy from master artists, exploring brush techniques and character formation.',
      level: 'beginner',
      eventType: '書法',
      tags: ['traditional', 'art', 'hands-on'],
      features: ['Master Instructor', 'Traditional Tools', 'Take-home Artwork'],
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Chinese Poetry Appreciation',
      organizer: 'Literature Department',
      duration: '2 hours',
      participants: 15,
      maxParticipants: 30,
      rating: 4.6,
      price: 500,
      schedule: '2025-08-20 19:00',
      location: 'Conference Room B',
      description: 'Explore the beauty of classical Chinese poetry through recitation, interpretation, and cultural context.',
      level: 'intermediate',
      eventType: '詩詞',
      tags: ['literature', 'cultural', 'interactive'],
      features: ['Classical Texts', 'Group Discussion', 'Cultural Context'],
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'Chinese Tea Ceremony Experience',
      organizer: 'Cultural Heritage Society',
      duration: '2.5 hours',
      participants: 12,
      maxParticipants: 20,
      rating: 4.7,
      price: 600,
      schedule: '2025-08-25 15:30',
      location: 'Tea House',
      description: 'Immerse yourself in the traditional Chinese tea ceremony, learning about tea culture and proper techniques.',
      level: 'beginner',
      eventType: '茶藝',
      tags: ['traditional', 'ceremony', 'cultural'],
      features: ['Authentic Tea Sets', 'Traditional Ceremony', 'Tea Tasting'],
      status: 'upcoming'
    },
    {
      id: 4,
      title: 'Advanced Chinese Debate Competition',
      organizer: 'Chinese Language Institute',
      duration: '4 hours',
      participants: 24,
      maxParticipants: 32,
      rating: 4.9,
      price: 300,
      schedule: '2025-09-05 13:00',
      location: 'Main Auditorium',
      description: 'Test your advanced Chinese speaking skills in a formal debate competition with contemporary topics.',
      level: 'advanced',
      eventType: '辯論',
      tags: ['competition', 'speaking', 'advanced'],
      features: ['Formal Competition', 'Contemporary Topics', 'Awards Ceremony'],
      status: 'upcoming'
    },
    {
      id: 5,
      title: 'Chinese Character Evolution Workshop',
      organizer: 'Language Research Center',
      duration: '3 hours',
      participants: 20,
      maxParticipants: 25,
      rating: 4.5,
      price: 700,
      schedule: '2025-09-10 10:00',
      location: 'Research Lab',
      description: 'Trace the fascinating evolution of Chinese characters from ancient pictographs to modern forms.',
      level: 'intermediate',
      eventType: '漢字',
      tags: ['etymology', 'history', 'educational'],
      features: ['Historical Analysis', 'Interactive Timeline', 'Character Practice'],
      status: 'upcoming'
    },
    {
      id: 6,
      title: 'Chinese Cooking & Language Class',
      organizer: 'Cultural Exchange Program',
      duration: '3.5 hours',
      participants: 16,
      maxParticipants: 20,
      rating: 4.4,
      price: 900,
      schedule: '2025-09-15 11:00',
      location: 'Culinary Center',
      description: 'Combine language learning with hands-on cooking as you learn to prepare authentic Chinese dishes.',
      level: 'beginner',
      eventType: '烹飪',
      tags: ['cooking', 'practical', 'cultural'],
      features: ['Hands-on Cooking', 'Recipe Cards', 'Full Meal'],
      status: 'upcoming'
    }
  ];

  const levels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' }
  ];

  const eventTypes = [
    { id: 'all', name: 'All Types' },
    { id: '書法', name: 'Calligraphy' },
    { id: '詩詞', name: 'Poetry' },
    { id: '茶藝', name: 'Tea Ceremony' },
    { id: '辯論', name: 'Debate' },
    { id: '漢字', name: 'Characters' },
    { id: '烹飪', name: 'Cooking' }
  ];

  const filteredEvents = chineseEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || event.level === selectedLevel;
    const matchesEventType = selectedEventType === 'all' || event.eventType === selectedEventType;
    
    return matchesSearch && matchesLevel && matchesEventType;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeColor = (eventType: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-teal-100 text-teal-800',
      'bg-orange-100 text-orange-800'
    ];
    const index = Math.abs(eventType.charCodeAt(0)) % colors.length;
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Chinese Cultural Events
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Immerse yourself in traditional and modern Chinese culture
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiEdit3} size={20} />
                <span>Calligraphy & Arts</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiActivity} size={20} />
                <span>Cultural Activities</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiUsers} size={20} />
                <span>Interactive Learning</span>
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
                  placeholder="Search Chinese events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="lg:w-48">
              <select
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {eventTypes.map(eventType => (
                  <option key={eventType.id} value={eventType.id}>
                    {eventType.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:w-40">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            Found {filteredEvents.length} Chinese cultural events
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
              <div className="relative h-48 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <SafeIcon icon={FiEdit3} size={48} className="text-white z-10 group-hover:scale-110 transition-transform" />
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.eventType)}`}>
                    {event.eventType}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
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

                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-xs text-blue-600 font-medium mb-1">Event Features</div>
                    <div className="flex flex-wrap gap-1">
                      {event.features.map((feature, i) => (
                        <span key={i} className="text-xs text-blue-800 bg-blue-100 px-2 py-1 rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-blue-600">
                    {event.price === 0 ? 'Free' : `NT$ ${event.price}`}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={event.participants >= event.maxParticipants}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                      event.participants >= event.maxParticipants
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Chinese events found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChineseEventsPage;