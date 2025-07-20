'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';

const {
  FiBookOpen,
  FiClock,
  FiCalendar,
  FiPlus,
  FiTrash2,
  FiX,
  FiSend,
  FiArchive,
  FiSave,
  FiRotateCcw
} = FiIcons;

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

interface Course {
  id?: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  totalSessions: number;
  excludeDates: string[];
  status: 'draft' | 'active' | 'completed';
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  globalSchedules: Schedule[];
  sessions: Session[];
  generatedSessions: GeneratedSession[];
}

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

interface CourseManagementModalsProps {
  // Modal states
  showAddCourseModal: boolean;
  showEditCourseModal: boolean;
  showAddInstructorModal: boolean;
  setShowAddCourseModal: (show: boolean) => void;
  setShowEditCourseModal: (show: boolean) => void;
  setShowAddInstructorModal: (show: boolean) => void;
  
  // Data
  newCourse: Course;
  setNewCourse: React.Dispatch<React.SetStateAction<Course>>;
  newInstructor: NewInstructor;
  setNewInstructor: React.Dispatch<React.SetStateAction<NewInstructor>>;
  instructors: Instructor[];
  
  // Handlers
  handleTotalSessionsChange: (total: string) => void;
  handleExcludeDate: (date: string) => void;
  calculateEndDate: (courseData?: Course) => string | undefined;
  handleSessionChange: (sessionIndex: number, field: keyof Session, value: string) => void;
  handleGlobalScheduleChange: (scheduleIndex: number, field: keyof Schedule, value: string | string[]) => void;
  addGlobalSchedule: () => void;
  removeGlobalSchedule: (scheduleIndex: number) => void;
  handleWeekdayToggle: (scheduleIndex: number, day: string) => void;
  generateCourseSessions: (courseData?: Course) => GeneratedSession[];
  handleSubmitCourse: (isDraft?: boolean) => void;
  handleUpdateCourse: (isDraft?: boolean) => void;
  handleAddInstructor: () => void;
}

const CourseManagementModals: React.FC<CourseManagementModalsProps> = ({
  showAddCourseModal,
  showEditCourseModal,
  showAddInstructorModal,
  setShowAddCourseModal,
  setShowEditCourseModal,
  setShowAddInstructorModal,
  newCourse,
  setNewCourse,
  newInstructor,
  setNewInstructor,
  instructors,
  handleTotalSessionsChange,
  handleExcludeDate,
  handleSessionChange,
  handleGlobalScheduleChange,
  addGlobalSchedule,
  removeGlobalSchedule,
  handleWeekdayToggle,
  generateCourseSessions,
  handleSubmitCourse,
  handleUpdateCourse,
  handleAddInstructor
}) => {
  const CourseFormContent = ({ isEdit = false }: { isEdit?: boolean }) => (
    <form className="space-y-6">
      {/* 課程基本資訊 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <SafeIcon icon={FiBookOpen} className="mr-2 text-blue-600" />
          課程基本資訊
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              課程標題 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newCourse.title}
              onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="請輸入課程標題"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              課程描述
            </label>
            <textarea
              rows={3}
              value={newCourse.description}
              onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="簡要描述課程內容和目標..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              開始日期 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={newCourse.startDate}
              onChange={(e) => {
                const updatedCourse = { ...newCourse, startDate: e.target.value };
                setNewCourse(updatedCourse);
                setTimeout(() => calculateEndDate(updatedCourse), 0);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              總堂數 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={newCourse.totalSessions}
              onChange={(e) => handleTotalSessionsChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              排除日期
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                type="date"
                onChange={(e) => handleExcludeDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {newCourse.excludeDates.map((date) => (
                  <div
                    key={date}
                    className="flex items-center bg-gray-100 px-2 py-1 rounded text-xs"
                  >
                    <span>{date}</span>
                    <button
                      type="button"
                      onClick={() => handleExcludeDate(date)}
                      className="ml-1 text-gray-500 hover:text-red-500"
                    >
                      <SafeIcon icon={FiX} className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              結束日期（自動計算）
            </label>
            <input
              type="date"
              value={newCourse.endDate}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              課程分類
            </label>
            <input
              type="text"
              value={newCourse.category}
              onChange={(e) => setNewCourse(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="例：商務華語、基礎華語..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              課程級別
            </label>
            <select
              value={newCourse.level}
              onChange={(e) => setNewCourse(prev => ({ ...prev, level: e.target.value as Course['level'] }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="beginner">初級</option>
              <option value="intermediate">中級</option>
              <option value="advanced">高級</option>
            </select>
          </div>
        </div>
      </div>

      {/* 全局上課時間設置 */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <SafeIcon icon={FiClock} className="mr-2 text-purple-600" />
            全局上課時間設置
          </h4>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={addGlobalSchedule}
            className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
          >
            <SafeIcon icon={FiPlus} className="inline mr-1 text-xs" />
            新增時間段
          </motion.button>
        </div>
        
        <div className="space-y-4">
          {newCourse.globalSchedules.map((schedule, scheduleIndex) => (
            <div key={scheduleIndex} className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="flex justify-between items-center mb-4">
                <h6 className="font-medium text-gray-900">時間段 {scheduleIndex + 1}</h6>
                {scheduleIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => removeGlobalSchedule(scheduleIndex)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <SafeIcon icon={FiTrash2} className="text-sm" />
                  </button>
                )}
              </div>
              
              {/* 星期選擇 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  上課星期 <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {['1', '2', '3', '4', '5', '6', '0'].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleWeekdayToggle(scheduleIndex, day)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        schedule.weekdays.includes(day)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {['週日', '週一', '週二', '週三', '週四', '週五', '週六'][parseInt(day)]}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 時間和教師選擇 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    開始時間 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={schedule.startTime}
                    onChange={(e) => handleGlobalScheduleChange(scheduleIndex, 'startTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    結束時間 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={schedule.endTime}
                    onChange={(e) => handleGlobalScheduleChange(scheduleIndex, 'endTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    選擇教師 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={schedule.instructorId}
                      onChange={(e) => handleGlobalScheduleChange(scheduleIndex, 'instructorId', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">請選擇教師</option>
                      {instructors.map((instructor) => (
                        <option key={instructor.id} value={instructor.id}>
                          {instructor.name} - {instructor.expertise}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowAddInstructorModal(true)}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <SafeIcon icon={FiPlus} className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 每堂課內容設置 */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <SafeIcon icon={FiCalendar} className="mr-2 text-green-600" />
          每堂課內容設置
        </h4>
        
        <div className="space-y-4">
          {newCourse.sessions.map((session, sessionIndex) => (
            <div key={sessionIndex} className="bg-white rounded-lg p-4 border border-green-200">
              <h5 className="font-semibold text-gray-900 mb-3">第 {sessionIndex + 1} 堂課</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    課程標題 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={session.title}
                    onChange={(e) => handleSessionChange(sessionIndex, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="請輸入課程標題"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    虛擬教室連結
                  </label>
                  <input
                    type="text"
                    value={session.classroom}
                    onChange={(e) => handleSessionChange(sessionIndex, 'classroom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="請輸入虛擬教室連結"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    教材連結
                  </label>
                  <input
                    type="text"
                    value={session.materials}
                    onChange={(e) => handleSessionChange(sessionIndex, 'materials', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="請輸入教材連結"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 生成的課程預覽 */}
      <button
        type="button"
        onClick={() => {
          const generatedSessions = generateCourseSessions();
          setNewCourse(prev => ({ ...prev, generatedSessions }));
        }}
        className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
      >
        <SafeIcon icon={FiRotateCcw} className="inline mr-2" />
        生成課程預覽
      </button>
      
      {newCourse.generatedSessions.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <SafeIcon icon={FiCalendar} className="mr-2 text-yellow-600" />
              預覽生成的課程
              <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                共 {newCourse.generatedSessions.length} 堂課
              </span>
            </h4>
          </div>
          <div className="overflow-y-auto max-h-60">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">標題</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">時間</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">教師</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {newCourse.generatedSessions.map((session, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2 text-sm text-gray-900">{session.date}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{session.title}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{session.startTime}-{session.endTime}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{session.instructorName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 操作按鈕 */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => isEdit ? handleUpdateCourse(false) : handleSubmitCourse(false)}
          className={`flex-1 ${isEdit ? 'bg-gradient-to-r from-green-600 to-teal-700' : 'bg-gradient-to-r from-blue-600 to-indigo-700'} text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2`}
        >
          <SafeIcon icon={isEdit ? FiSave : FiSend} />
          <span>{isEdit ? '更新課程' : '發布課程'}</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => isEdit ? handleUpdateCourse(true) : handleSubmitCourse(true)}
          className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl hover:bg-gray-300 transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <SafeIcon icon={FiArchive} />
          <span>儲存為草稿</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => isEdit ? setShowEditCourseModal(false) : setShowAddCourseModal(false)}
          className="px-8 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium"
        >
          取消
        </motion.button>
      </div>
    </form>
  );

  return (
    <>
      {/* 新增課程模態框 */}
      {showAddCourseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-xl sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">新增課程</h3>
                <button onClick={() => setShowAddCourseModal(false)}>
                  <SafeIcon icon={FiX} className="text-white text-xl" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <CourseFormContent />
            </div>
          </motion.div>
        </div>
      )}

      {/* 編輯課程模態框 */}
      {showEditCourseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white p-6 rounded-t-xl sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">編輯課程</h3>
                <button onClick={() => setShowEditCourseModal(false)}>
                  <SafeIcon icon={FiX} className="text-white text-xl" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <CourseFormContent isEdit={true} />
            </div>
          </motion.div>
        </div>
      )}

      {/* 新增教師模態框 */}
      {showAddInstructorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-md w-full"
          >
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">新增教師</h3>
                <button onClick={() => setShowAddInstructorModal(false)}>
                  <SafeIcon icon={FiX} className="text-white text-xl" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    教師姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newInstructor.name}
                    onChange={(e) => setNewInstructor(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="請輸入教師姓名"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電子郵件 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newInstructor.email}
                    onChange={(e) => setNewInstructor(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="請輸入電子郵件"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    專業領域
                  </label>
                  <input
                    type="text"
                    value={newInstructor.expertise}
                    onChange={(e) => setNewInstructor(prev => ({ ...prev, expertise: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="例：商務華語、華語文法（用逗號分隔）"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleAddInstructor}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
                  >
                    新增教師
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setShowAddInstructorModal(false)}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default CourseManagementModals;