'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { FiActivity, FiClock, FiUsers, FiStar, FiCalendar, FiSearch, FiMapPin, FiEye, FiUserCheck } from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';

interface TeacherTrainingEvent {
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
  trainingType: string;
  tags: string[];
  features: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
}

const TeacherTrainingEventsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedTrainingType, setSelectedTrainingType] = useState('all');

  // Mock data for Teacher Training events
  const teacherTrainingEvents: TeacherTrainingEvent[] = [
    {
      id: 1,
      title: 'Modern Chinese Teaching Methodology',
      organizer: 'Education Innovation Institute',
      duration: '6 hours',
      participants: 28,
      maxParticipants: 35,
      rating: 4.9,
      price: 3500,
      schedule: '2025-08-19 09:00',
      location: 'Teacher Development Center',
      description: 'Learn cutting-edge pedagogical approaches for teaching Chinese as a second language in modern educational settings.',
      level: 'intermediate',
      trainingType: 'Methodology',
      tags: ['pedagogy', 'modern', 'effective'],
      features: ['Interactive Techniques', 'Assessment Methods', 'Curriculum Design'],
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Digital Teaching Tools & Technology',
      organizer: 'EdTech Training Academy',
      duration: '4 hours',
      participants: 22,
      maxParticipants: 30,
      rating: 4.7,
      price: 2800,
      schedule: '2025-08-26 14:00',
      location: 'Technology Training Lab',
      description: 'Master digital tools and platforms for enhanced Chinese language instruction in hybrid and online environments.',
      level: 'beginner',
      trainingType: 'Technology',
      tags: ['digital', 'online', 'tools'],
      features: ['Platform Training', 'Interactive Software', 'Virtual Classroom'],
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'Advanced Assessment & Evaluation Techniques',
      organizer: 'Language Assessment Center',
      duration: '5 hours',
      participants: 20,
      maxParticipants: 25,
      rating: 4.8,
      price: 4200,
      schedule: '2025-09-02 10:00',
      location: 'Assessment Training Facility',
      description: 'Develop sophisticated skills in creating, administering, and analyzing Chinese language assessments and evaluations.',
      level: 'advanced',
      trainingType: 'Assessment',
      tags: ['evaluation', 'testing', 'analysis'],
      features: ['Test Design', 'Data Analysis', 'Feedback Systems'],
      status: 'upcoming'
    },
    {
      id: 4,
      title: 'Classroom Management for Language Teachers',
      organizer: 'Professional Development Institute',
      duration: '3 hours',
      participants: 32,
      maxParticipants: 40,
      rating: 4.6,
      price: 2200,
      schedule: '2025-09-07 13:30',
      location: 'Training Classroom',
      description: 'Essential strategies for effective classroom management, student engagement, and learning environment optimization.',
      level: 'beginner',
      trainingType: 'Classroom Management',
      tags: ['management', 'engagement', 'environment'],
      features: ['Behavior Strategies', 'Engagement Techniques', 'Learning Environment'],
      status: 'upcoming'
    },
    {
      id: 5,
      title: 'Cultural Integration in Language Teaching',
      organizer: 'Cultural Education Society',
      duration: '4.5 hours',
      participants: 24,
      maxParticipants: 30,
      rating: 4.5,
      price: 3200,
      schedule: '2025-09-13 11:00',
      location: 'Cultural Center',
      description: 'Learn to seamlessly integrate Chinese cultural elements into language instruction for deeper learning experiences.',
      level: 'intermediate',
      trainingType: 'Cultural Integration',
      tags: ['culture', 'integration', 'immersive'],
      features: ['Cultural Activities', 'Authentic Materials', 'Cross-cultural Skills'],
      status: 'upcoming'
    },
    {
      id: 6,
      title: 'Special Needs & Inclusive Teaching',
      organizer: 'Inclusive Education Center',
      duration: '5 hours',
      participants: 18,
      maxParticipants: 24,
      rating: 4.8,
      price: 3800,
      schedule: '2025-09-18 09:30',
      location: 'Accessibility Training Center',
      description: 'Develop skills for teaching Chinese to students with diverse learning needs and creating inclusive classroom environments.',
      level: 'advanced',
      trainingType: 'Special Needs',
      tags: ['inclusive', 'accessibility', 'adaptive'],
      features: ['Adaptive Techniques', 'Inclusive Design', 'Support Strategies'],
      status: 'upcoming'
    }
  ];

  const levels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' }
  ];

  const trainingTypes = [
    { id: 'all', name: 'All Training Types' },
    { id: 'Methodology', name: 'Methodology' },
    { id: 'Technology', name: 'Technology' },
    { id: 'Assessment', name: 'Assessment' },
    { id: 'Classroom Management', name: 'Classroom Management' },
    { id: 'Cultural Integration', name: 'Cultural Integration' },
    { id: 'Special Needs', name: 'Special Needs' }
  ];

  const filteredEvents = teacherTrainingEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || event.level === selectedLevel;
    const matchesTrainingType = selectedTrainingType === 'all' || event.trainingType === selectedTrainingType;
    
    return matchesSearch && matchesLevel && matchesTrainingType;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrainingTypeColor = (trainingType: string) => {
    const colors = [
      'bg-teal-100 text-teal-800',
      'bg-cyan-100 text-cyan-800',
      'bg-sky-100 text-sky-800',
      'bg-blue-100 text-blue-800',
      'bg-indigo-100 text-indigo-800',
      'bg-violet-100 text-violet-800'
    ];
    const index = Math.abs(trainingType.charCodeAt(0)) % colors.length;
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
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Teacher Training & Development
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-teal-100">
              Enhance your teaching skills with professional development programs
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiUserCheck} size={20} />
                <span>Professional Development</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiActivity} size={20} />
                <span>Interactive Training</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiUsers} size={20} />
                <span>Peer Learning</span>
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
                  placeholder="Search teacher training events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="lg:w-48">
              <select
                value={selectedTrainingType}
                onChange={(e) => setSelectedTrainingType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {trainingTypes.map(trainingType => (
                  <option key={trainingType.id} value={trainingType.id}>
                    {trainingType.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:w-40">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
            Found {filteredEvents.length} teacher training events
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
              <div className="relative h-48 bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <SafeIcon icon={FiUserCheck} size={48} className="text-white z-10 group-hover:scale-110 transition-transform" />
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTrainingTypeColor(event.trainingType)}`}>
                    {event.trainingType}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
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

                  <div className="bg-teal-50 rounded-lg p-3">
                    <div className="text-xs text-teal-600 font-medium mb-1">Training Features</div>
                    <div className="flex flex-wrap gap-1">
                      {event.features.map((feature, i) => (
                        <span key={i} className="text-xs text-teal-800 bg-teal-100 px-2 py-1 rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-teal-600">
                    {event.price === 0 ? 'Free' : `NT$ ${event.price}`}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={event.participants >= event.maxParticipants}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                      event.participants >= event.maxParticipants
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-teal-600 text-white hover:bg-teal-700'
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No teacher training events found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TeacherTrainingEventsPage;