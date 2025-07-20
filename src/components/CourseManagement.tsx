'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import * as XLSX from 'xlsx';
import SafeIcon from './common/SafeIcon';
import CourseManagementModals from './CourseManagementModals';
import { useAuth } from '@/contexts/AuthContext';
import {
  ManagedCourse,
  Instructor,
  getManagedCourses,
  getInstructors,
  addManagedCourse,
  updateManagedCourse,
  deleteManagedCourse,
  addInstructor,
  regenerateAllCourseSessions
} from '@/data/courseData';

const {
  FiBook,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiDownload,
  FiSend
} = FiIcons;

// TypeScript interfaces
interface Schedule {
  weekdays: string[];
  startTime: string;
  endTime: string;
  instructorId: string | number;
}

interface Session {
  title: string;
  classroom: string;
  materials: string;
}

interface GeneratedSession {
  date: string;
  title: string;
  startTime: string;
  endTime: string;
  instructorId: string | number;
  instructorName: string;
  classroom: string;
  materials: string;
}

// 使用統一的 ManagedCourse 類型
type Course = ManagedCourse;

interface Instructor {
  id: number;
  name: string;
  email: string;
  expertise: string;
  availability: Record<string, string[]>;
  rating: number;
  courses: number[];
}

interface NewInstructor {
  name: string;
  email: string;
  expertise: string;
  availability: Record<string, string[]>;
}

const CourseManagement = () => {
  const { user } = useAuth();
  const isInstructor = user?.role === 'instructor';
  
  // 主要狀態
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [showAddInstructorModal, setShowAddInstructorModal] = useState(false);
  const [, setEditingCourse] = useState<Course | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'active' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 新課程表單狀態
  const [newCourse, setNewCourse] = useState<Course>({
    title: '',
    description: '',
    startDate: '',
    totalSessions: 1,
    excludeDates: [],
    endDate: '',
    status: 'draft',
    category: '',
    level: 'intermediate',
    globalSchedules: [
      {
        weekdays: [],
        startTime: '',
        endTime: '',
        instructorId: ''
      }
    ],
    sessions: [
      {
        title: '',
        classroom: '',
        materials: ''
      }
    ],
    generatedSessions: []
  });

  // 新教師表單狀態
  const [newInstructor, setNewInstructor] = useState<NewInstructor>({
    name: '',
    email: '',
    expertise: '',
    availability: {}
  });

  // 載入課程和教師數據
  useEffect(() => {
    const loadData = () => {
      const coursesData = getManagedCourses();
      const instructorsData = getInstructors();
      
      // 如果是講師，只顯示被指派的課程
      if (isInstructor && user) {
        const assignedCourses = coursesData.filter(course => 
          course.globalSchedules.some(schedule => 
            schedule.instructorId === user.id || 
            schedule.instructorId === user.id.toString()
          )
        );
        setCourses(assignedCourses);
      } else {
        setCourses(coursesData);
      }
      
      setInstructors(instructorsData);
    };
    loadData();
  }, [isInstructor, user]);

  // 自動計算結束日期函數
  const calculateEndDate = (courseData?: Course) => {
    const course = courseData || newCourse;
    const { startDate, totalSessions, globalSchedules, excludeDates } = course;
    
    if (!startDate || totalSessions <= 0 || globalSchedules.length === 0) return;
    
    // 計算每週上課天數
    const weekdaysCount = globalSchedules.reduce((total, schedule) => {
      return total + schedule.weekdays.length;
    }, 0);
    
    if (weekdaysCount === 0) return;
    
    // 估算需要的週數
    const weeksNeeded = Math.ceil(totalSessions / weekdaysCount);
    
    // 計算結束日期
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + (weeksNeeded * 7));
    
    // 考慮排除日期
    if (excludeDates && excludeDates.length > 0) {
      const excludeDaysCount = excludeDates.length;
      const additionalDays = Math.ceil(excludeDaysCount / weekdaysCount) * 7;
      end.setDate(end.getDate() + additionalDays);
    }
    
    const endDateStr = end.toISOString().split('T')[0];
    
    setNewCourse(prev => ({
      ...prev,
      endDate: endDateStr
    }));
    
    return endDateStr;
  };

  // 處理總堂數變化
  const handleTotalSessionsChange = (total: string) => {
    const currentSessions = [...newCourse.sessions];
    const newTotal = parseInt(total) || 1;
    
    if (newTotal > currentSessions.length) {
      // 增加課程
      const additional = Array(newTotal - currentSessions.length).fill(0).map(() => ({
        title: '',
        classroom: '',
        materials: ''
      }));
      
      const updatedCourse = {
        ...newCourse,
        totalSessions: newTotal,
        sessions: [...currentSessions, ...additional]
      };
      
      setNewCourse(updatedCourse);
      setTimeout(() => calculateEndDate(updatedCourse), 0);
    } else if (newTotal < currentSessions.length) {
      // 減少課程
      const updatedCourse = {
        ...newCourse,
        totalSessions: newTotal,
        sessions: currentSessions.slice(0, newTotal)
      };
      
      setNewCourse(updatedCourse);
      setTimeout(() => calculateEndDate(updatedCourse), 0);
    }
  };

  // 處理排除日期
  const handleExcludeDate = (date: string) => {
    if (!date) return;
    
    setNewCourse(prev => {
      const excludeDates = [...prev.excludeDates];
      let updatedCourse: Course;
      
      if (excludeDates.includes(date)) {
        updatedCourse = {
          ...prev,
          excludeDates: excludeDates.filter(d => d !== date)
        };
      } else {
        updatedCourse = {
          ...prev,
          excludeDates: [...excludeDates, date].sort()
        };
      }
      
      // 自動計算結束日期
      setTimeout(() => calculateEndDate(updatedCourse), 0);
      return updatedCourse;
    });
  };

  // 處理每堂課內容變化
  const handleSessionChange = (sessionIndex: number, field: keyof Session, value: string) => {
    const updatedSessions = [...newCourse.sessions];
    updatedSessions[sessionIndex] = {
      ...updatedSessions[sessionIndex],
      [field]: value
    };

    setNewCourse(prev => ({
      ...prev,
      sessions: updatedSessions
    }));
  };

  // 處理全局時間段變化
  const handleGlobalScheduleChange = (scheduleIndex: number, field: keyof Schedule, value: string | string[]) => {
    const updatedSchedules = [...newCourse.globalSchedules];
    
    updatedSchedules[scheduleIndex] = {
      ...updatedSchedules[scheduleIndex],
      [field]: value
    };
    
    const updatedCourse = {
      ...newCourse,
      globalSchedules: updatedSchedules
    };
    
    setNewCourse(updatedCourse);
    
    // 如果修改了星期或時間，重新計算結束日期
    if (field === 'weekdays') {
      setTimeout(() => calculateEndDate(updatedCourse), 0);
    }
  };

  // 新增全局時間段
  const addGlobalSchedule = () => {
    const updatedSchedules = [...newCourse.globalSchedules];
    
    updatedSchedules.push({
      weekdays: [],
      startTime: '',
      endTime: '',
      instructorId: ''
    });
    
    setNewCourse(prev => ({
      ...prev,
      globalSchedules: updatedSchedules
    }));
  };

  // 移除全局時間段
  const removeGlobalSchedule = (scheduleIndex: number) => {
    if (newCourse.globalSchedules.length <= 1) {
      alert('課程至少需要一個時間段');
      return;
    }
    
    const updatedSchedules = [...newCourse.globalSchedules];
    updatedSchedules.splice(scheduleIndex, 1);
    
    setNewCourse(prev => ({
      ...prev,
      globalSchedules: updatedSchedules
    }));
  };

  // 處理星期選擇
  const handleWeekdayToggle = (scheduleIndex: number, day: string) => {
    const updatedSchedules = [...newCourse.globalSchedules];
    const currentWeekdays = [...updatedSchedules[scheduleIndex].weekdays];
    
    const dayIndex = currentWeekdays.indexOf(day);
    if (dayIndex >= 0) {
      currentWeekdays.splice(dayIndex, 1);
    } else {
      currentWeekdays.push(day);
      currentWeekdays.sort();
    }
    
    updatedSchedules[scheduleIndex].weekdays = currentWeekdays;
    
    const updatedCourse = {
      ...newCourse,
      globalSchedules: updatedSchedules
    };
    
    setNewCourse(updatedCourse);
    
    // 重新計算結束日期
    setTimeout(() => calculateEndDate(updatedCourse), 0);
  };

  // 新增教師
  const handleAddInstructor = () => {
    if (!newInstructor.name || !newInstructor.email) {
      alert('請填寫教師姓名和電子郵件');
      return;
    }
    
    const newInstructorData = addInstructor({
      name: newInstructor.name,
      email: newInstructor.email,
      expertise: newInstructor.expertise,
      availability: {
        '1': ['09:00-17:00'],
        '2': ['09:00-17:00'],
        '3': ['09:00-17:00'],
        '4': ['09:00-17:00'],
        '5': ['09:00-17:00']
      },
      rating: 5.0,
      courses: []
    });
    
    setInstructors(prev => [...prev, newInstructorData]);
    setShowAddInstructorModal(false);
    setNewInstructor({
      name: '',
      email: '',
      expertise: '',
      availability: {}
    });
    
    alert('✅ 教師已成功新增！');
  };

  // 生成課程實例
  const generateCourseSessions = (courseData?: Course): GeneratedSession[] => {
    const course = courseData || newCourse;
    const { startDate, endDate, globalSchedules, sessions, excludeDates, totalSessions } = course;
    
    if (!startDate || !endDate || globalSchedules.length === 0 || sessions.length === 0) return [];
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const generatedSessions: GeneratedSession[] = [];
    let sessionCount = 0;
    let currentSessionIndex = 0;
    
    // 遍歷日期範圍內的每一天
    const currentDate = new Date(start);
    
    while (currentDate <= end && sessionCount < totalSessions) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // 檢查是否是排除日期
      if (!excludeDates || !excludeDates.includes(dateStr)) {
        const dayOfWeek = currentDate.getDay().toString();
        
        // 遍歷每個全局時間段
        for (const schedule of globalSchedules) {
          // 檢查當前日期是否是指定的上課日
          if (schedule.weekdays.includes(dayOfWeek)) {
            // 獲取教師資訊
            const instructor = instructors.find(i => i.id === parseInt(schedule.instructorId.toString()));
            const instructorName = instructor ? instructor.name : '未指定';
            
            // 獲取對應的課程內容
            const sessionContent = sessions[currentSessionIndex % sessions.length];
            
            generatedSessions.push({
              date: dateStr,
              title: sessionContent.title || `第 ${sessionCount + 1} 堂課`,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              instructorId: schedule.instructorId,
              instructorName,
              classroom: sessionContent.classroom,
              materials: sessionContent.materials
            });
            
            sessionCount++;
            currentSessionIndex++;
            
            // 如果已達到總課程數，跳出
            if (sessionCount >= totalSessions) break;
          }
        }
      }
      
      // 移至下一天
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // 按日期排序
    return generatedSessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, totalSessions);
  };

  // 表單驗證
  const validateCourseForm = (): string[] => {
    const errors: string[] = [];
    
    if (!newCourse.title.trim()) errors.push('課程標題');
    if (!newCourse.startDate) errors.push('開始日期');
    if (newCourse.totalSessions <= 0) errors.push('總堂數');
    
    // 驗證全局時間段
    let hasScheduleErrors = false;
    
    newCourse.globalSchedules.forEach((schedule, index) => {
      if (schedule.weekdays.length === 0) {
        errors.push(`第 ${index + 1} 個時間段的上課星期`);
        hasScheduleErrors = true;
      }
      
      if (!schedule.startTime) {
        errors.push(`第 ${index + 1} 個時間段的開始時間`);
        hasScheduleErrors = true;
      }
      
      if (!schedule.endTime) {
        errors.push(`第 ${index + 1} 個時間段的結束時間`);
        hasScheduleErrors = true;
      }
      
      if (!schedule.instructorId) {
        errors.push(`第 ${index + 1} 個時間段的教師`);
        hasScheduleErrors = true;
      }
      
      // 檢查時間格式
      if (schedule.startTime && schedule.endTime && schedule.startTime >= schedule.endTime) {
        errors.push(`第 ${index + 1} 個時間段的結束時間必須晚於開始時間`);
        hasScheduleErrors = true;
      }
    });
    
    // 驗證每堂課內容
    newCourse.sessions.forEach((session, index) => {
      if (!session.title.trim()) {
        errors.push(`第 ${index + 1} 堂課的標題`);
      }
    });
    
    // 生成課程實例並檢查數量
    const generatedSessions = generateCourseSessions();
    
    if (generatedSessions.length === 0 && !hasScheduleErrors) {
      errors.push('沒有生成任何課程實例，請檢查日期範圍和上課星期');
    } else if (generatedSessions.length < newCourse.totalSessions) {
      errors.push(`生成的課程實例數量(${generatedSessions.length})少於總堂數(${newCourse.totalSessions})，請調整日期範圍或新增更多上課時間`);
    }
    
    return errors;
  };

  // 提交課程表單
  const handleSubmitCourse = (isDraft = false) => {
    // 更新生成的課程實例
    const generatedSessions = generateCourseSessions();
    setNewCourse(prev => ({ ...prev, generatedSessions }));
    
    // 表單驗證
    const errors = validateCourseForm();
    
    if (errors.length > 0 && !isDraft) {
      alert(`請檢查以下欄位：\n\n${errors.join('\n')}`);
      return;
    }
    
    // 創建新課程對象
    const courseToAdd: ManagedCourse = {
      ...newCourse,
      status: isDraft ? 'draft' : 'active'
    };
    
    // 使用數據管理系統新增課程
    const newCourseData = addManagedCourse(courseToAdd);
    
    // 更新本地狀態
    setCourses(prev => [...prev, newCourseData]);
    
    // 重置表單並關閉模態框
    resetCourseForm();
    setShowAddCourseModal(false);
    
    alert(`課程已${isDraft ? '儲存為草稿' : '發布'}`);
  };

  // 編輯課程
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setNewCourse({
      ...course,
      generatedSessions: generateCourseSessions(course)
    });
    setShowEditCourseModal(true);
  };

  // 更新課程
  const handleUpdateCourse = (isDraft = false) => {
    // 更新生成的課程實例
    const generatedSessions = generateCourseSessions();
    setNewCourse(prev => ({ ...prev, generatedSessions }));
    
    // 表單驗證
    const errors = validateCourseForm();
    
    if (errors.length > 0 && !isDraft) {
      alert(`請檢查以下欄位：\n\n${errors.join('\n')}`);
      return;
    }
    
    // 更新課程對象
    const courseUpdates = {
      ...newCourse,
      status: isDraft ? 'draft' : 'active'
    };
    
    // 使用數據管理系統更新課程
    const updatedCourse = updateManagedCourse(newCourse.id!, courseUpdates);
    
    if (updatedCourse) {
      // 更新本地狀態
      setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
    }
    
    // 重置表單並關閉模態框
    resetCourseForm();
    setShowEditCourseModal(false);
    
    alert(`課程已${isDraft ? '儲存為草稿' : '更新'}`);
  };

  // 刪除課程
  const handleDeleteCourse = (courseId: number) => {
    if (confirm('確定要刪除此課程嗎？此操作無法撤銷。')) {
      const success = deleteManagedCourse(courseId);
      if (success) {
        setCourses(courses.filter(c => c.id !== courseId));
        alert('課程已刪除');
      }
    }
  };

  // 重置課程表單
  const resetCourseForm = () => {
    setNewCourse({
      title: '',
      description: '',
      startDate: '',
      totalSessions: 1,
      excludeDates: [],
      endDate: '',
      status: 'draft',
      category: '',
      level: 'intermediate',
      globalSchedules: [
        {
          weekdays: [],
          startTime: '',
          endTime: '',
          instructorId: ''
        }
      ],
      sessions: [
        {
          title: '',
          classroom: '',
          materials: ''
        }
      ],
      generatedSessions: []
    });
    
    setEditingCourse(null);
  };

  // 發布課程
  const handlePublishCourse = (courseId: number) => {
    if (confirm('確定要發布此課程嗎？發布後將對學生可見。')) {
      const updatedCourse = updateManagedCourse(courseId, { status: 'active' });
      if (updatedCourse) {
        setCourses(courses.map(c => c.id === courseId ? updatedCourse : c));
        alert('課程已發布');
      }
    }
  };

  // 過濾課程
  const getFilteredCourses = (): Course[] => {
    return courses.filter(course => {
      // 狀態過濾
      if (filterStatus !== 'all' && course.status !== filterStatus) {
        return false;
      }
      
      // 搜尋過濾
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          course.title.toLowerCase().includes(searchLower) ||
          course.description.toLowerCase().includes(searchLower) ||
          course.category.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  };

  // 獲取狀態標籤顏色
  const getStatusColor = (status: Course['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 獲取狀態標籤文字
  const getStatusText = (status: Course['status']) => {
    switch (status) {
      case 'draft': return '草稿';
      case 'active': return '進行中';
      case 'completed': return '已完成';
      default: return '未知';
    }
  };

  // 獲取等級標籤顏色
  const getLevelColor = (level: Course['level']) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 獲取等級標籤文字
  const getLevelText = (level: Course['level']) => {
    switch (level) {
      case 'beginner': return '初級';
      case 'intermediate': return '中級';
      case 'advanced': return '高級';
      default: return '未知';
    }
  };

  // 格式化星期文字
  const formatWeekdays = (weekdays: string[]) => {
    const weekdayNames: Record<string, string> = {
      '0': '週日',
      '1': '週一',
      '2': '週二',
      '3': '週三',
      '4': '週四',
      '5': '週五',
      '6': '週六'
    };
    
    return weekdays.map(day => weekdayNames[day]).join('、');
  };

  // 導出課程數據為 XLS 格式
  const handleExportCourses = () => {
    const filteredCourses = getFilteredCourses();
    
    // 準備課程基本資料工作表
    const courseData = filteredCourses.map(course => ({
      '課程ID': course.id || '',
      '課程標題': course.title,
      '課程描述': course.description,
      '開始日期': course.startDate,
      '結束日期': course.endDate,
      '總課程數': course.totalSessions,
      '狀態': course.status === 'draft' ? '草稿' : course.status === 'active' ? '進行中' : '已完成',
      '類別': course.category,
      '難度': course.level === 'beginner' ? '初級' : course.level === 'intermediate' ? '中級' : '高級',
      '排除日期': course.excludeDates.join(', '),
      '建立時間': new Date().toISOString().split('T')[0]
    }));

    // 準備課程排程工作表
    const scheduleData: any[] = [];
    filteredCourses.forEach(course => {
      course.globalSchedules.forEach((schedule, index) => {
        const instructor = instructors.find(i => i.id === parseInt(schedule.instructorId.toString()));
        scheduleData.push({
          '課程ID': course.id || '',
          '課程標題': course.title,
          '排程編號': index + 1,
          '上課星期': schedule.weekdays.join(', '),
          '開始時間': schedule.startTime,
          '結束時間': schedule.endTime,
          '講師ID': schedule.instructorId,
          '講師姓名': instructor ? instructor.name : '未指定'
        });
      });
    });

    // 準備課程內容工作表
    const sessionData: any[] = [];
    filteredCourses.forEach(course => {
      course.sessions.forEach((session, index) => {
        sessionData.push({
          '課程ID': course.id || '',
          '課程標題': course.title,
          '課程編號': index + 1,
          '課程主題': session.title,
          '教室': session.classroom,
          '教材': session.materials
        });
      });
    });

    // 準備已生成課程時段工作表
    const generatedSessionData: any[] = [];
    filteredCourses.forEach(course => {
      course.generatedSessions.forEach((session, index) => {
        generatedSessionData.push({
          '課程ID': course.id || '',
          '課程標題': course.title,
          '時段編號': index + 1,
          '上課日期': session.date,
          '課程主題': session.title,
          '開始時間': session.startTime,
          '結束時間': session.endTime,
          '講師ID': session.instructorId,
          '講師姓名': session.instructorName,
          '教室': session.classroom,
          '教材': session.materials
        });
      });
    });

    // 建立工作簿
    const workbook = XLSX.utils.book_new();
    
    // 新增工作表
    const courseSheet = XLSX.utils.json_to_sheet(courseData);
    const scheduleSheet = XLSX.utils.json_to_sheet(scheduleData);
    const sessionSheet = XLSX.utils.json_to_sheet(sessionData);
    const generatedSheet = XLSX.utils.json_to_sheet(generatedSessionData);
    
    // 設定欄位寬度
    const setColumnWidths = (sheet: any) => {
      const cols = [
        { wch: 10 }, // 課程ID
        { wch: 25 }, // 課程標題
        { wch: 40 }, // 課程描述/其他
        { wch: 12 }, // 日期
        { wch: 12 }, // 時間
        { wch: 8 },  // 數字
        { wch: 10 }, // 狀態
        { wch: 15 }, // 類別
        { wch: 10 }, // 難度
        { wch: 30 }, // 其他
      ];
      sheet['!cols'] = cols;
    };

    setColumnWidths(courseSheet);
    setColumnWidths(scheduleSheet);
    setColumnWidths(sessionSheet);
    setColumnWidths(generatedSheet);
    
    // 將工作表加入工作簿
    XLSX.utils.book_append_sheet(workbook, courseSheet, '課程基本資料');
    XLSX.utils.book_append_sheet(workbook, scheduleSheet, '課程排程');
    XLSX.utils.book_append_sheet(workbook, sessionSheet, '課程內容');
    XLSX.utils.book_append_sheet(workbook, generatedSheet, '已生成時段');
    
    // 導出檔案
    const fileName = `課程管理數據_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    alert(`✅ 課程數據已導出為 XLS 格式！\n\n檔案名稱：${fileName}\n\n包含工作表：\n• 課程基本資料\n• 課程排程\n• 課程內容\n• 已生成時段`);
  };

  return (
    <div className="space-y-6">
      {/* 標題和操作按鈕 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">課程管理</h2>
          <p className="text-sm text-gray-600 mt-1">創建和管理華語文課程</p>
        </div>
        {!isInstructor && (
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportCourses}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <SafeIcon icon={FiDownload} className="text-sm" />
              <span>導出數據</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                resetCourseForm();
                setShowAddCourseModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <SafeIcon icon={FiPlus} className="text-sm" />
              <span>新增課程</span>
            </motion.button>
          </div>
        )}
      </div>

      {/* 過濾和搜尋 */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋課程標題、描述或分類..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">全部狀態</option>
          <option value="draft">草稿</option>
          <option value="active">進行中</option>
          <option value="completed">已完成</option>
        </select>
      </div>

      {/* 課程列表 */}
      {getFilteredCourses().length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredCourses().map((course) => (
            <motion.div
              key={course.id}
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100/60 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">{course.title}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.status)}`}>
                    {getStatusText(course.status)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div>
                    <label className="block text-xs text-gray-500">開始日期</label>
                    <span className="text-sm font-medium text-gray-700">{course.startDate}</span>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">結束日期</label>
                    <span className="text-sm font-medium text-gray-700">{course.endDate}</span>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">總堂數</label>
                    <span className="text-sm font-medium text-blue-600">{course.totalSessions} 堂</span>
                  </div>
                  {course.category && (
                    <div>
                      <label className="block text-xs text-gray-500">分類</label>
                      <span className="text-sm font-medium text-blue-600">{course.category}</span>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs text-gray-500">級別</label>
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getLevelColor(course.level)}`}>
                      {getLevelText(course.level)}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs text-gray-500 mb-1">上課時間</label>
                  <div className="space-y-1">
                    {course.globalSchedules && course.globalSchedules.map((schedule, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-2 text-xs">
                        <div className="text-gray-800">
                          {formatWeekdays(schedule.weekdays)} {schedule.startTime}-{schedule.endTime}
                        </div>
                        <div className="text-blue-600">
                          教師: {instructors.find(i => i.id === parseInt(schedule.instructorId.toString()))?.name || '未指定'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {!isInstructor && (
                  <div className="flex justify-between">
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEditCourse(course)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="編輯課程"
                      >
                        <SafeIcon icon={FiEdit2} className="text-sm" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteCourse(course.id!)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="刪除課程"
                      >
                        <SafeIcon icon={FiTrash2} className="text-sm" />
                      </motion.button>
                    </div>
                    {course.status === 'draft' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePublishCourse(course.id!)}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs"
                      >
                        <SafeIcon icon={FiSend} className="text-xs" />
                        <span>發布</span>
                      </motion.button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100/60 p-8 text-center">
          <SafeIcon icon={FiBook} className="text-4xl text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暫無課程</h3>
          <p className="text-gray-600 mb-4">點擊&quot;新增課程&quot;按鈕創建第一個課程</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              resetCourseForm();
              setShowAddCourseModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <SafeIcon icon={FiPlus} className="inline mr-2" /> 新增課程
          </motion.button>
        </div>
      )}

      {/* 模態框 */}
      <CourseManagementModals
        showAddCourseModal={showAddCourseModal}
        showEditCourseModal={showEditCourseModal}
        showAddInstructorModal={showAddInstructorModal}
        setShowAddCourseModal={setShowAddCourseModal}
        setShowEditCourseModal={setShowEditCourseModal}
        setShowAddInstructorModal={setShowAddInstructorModal}
        newCourse={newCourse}
        setNewCourse={setNewCourse}
        newInstructor={newInstructor}
        setNewInstructor={setNewInstructor}
        instructors={instructors}
        handleTotalSessionsChange={handleTotalSessionsChange}
        handleExcludeDate={handleExcludeDate}
        calculateEndDate={calculateEndDate}
        handleSessionChange={handleSessionChange}
        handleGlobalScheduleChange={handleGlobalScheduleChange}
        addGlobalSchedule={addGlobalSchedule}
        removeGlobalSchedule={removeGlobalSchedule}
        handleWeekdayToggle={handleWeekdayToggle}
        generateCourseSessions={generateCourseSessions}
        handleSubmitCourse={handleSubmitCourse}
        handleUpdateCourse={handleUpdateCourse}
        handleAddInstructor={handleAddInstructor}
      />
    </div>
  );
};

export default CourseManagement;