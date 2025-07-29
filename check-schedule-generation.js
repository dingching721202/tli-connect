// 檢查課程排程生成問題
function checkScheduleGeneration() {
  console.log('🔍 檢查課程排程生成...');
  
  const schedules = JSON.parse(localStorage.getItem('courseSchedules') || '[]');
  console.log('所有排程:', schedules);
  
  const pronunciationSchedule = schedules.find(s => 
    s.templateTitle === 'Pronunciation' || s.templateTitle?.includes('Pronunciation')
  );
  
  if (!pronunciationSchedule) {
    console.log('❌ 找不到 Pronunciation 排程');
    return;
  }
  
  console.log('✅ 找到 Pronunciation 排程:', pronunciationSchedule);
  
  // 檢查是否有 generatedSessions
  if (!pronunciationSchedule.generatedSessions || pronunciationSchedule.generatedSessions.length === 0) {
    console.log('⚠️ 排程沒有生成課程時段，嘗試手動生成...');
    
    // 手動生成課程時段
    const startDate = new Date(pronunciationSchedule.startDate || '2025-08-01');
    const endDate = new Date(pronunciationSchedule.endDate || '2025-08-31');
    const timeSlots = pronunciationSchedule.timeSlots || [];
    
    console.log('排程資訊:', {
      startDate: pronunciationSchedule.startDate,
      endDate: pronunciationSchedule.endDate,
      timeSlots: timeSlots
    });
    
    // 如果有時段設定，生成課程時段
    if (timeSlots.length > 0) {
      const generatedSessions = [];
      let sessionCount = 0;
      const templateId = pronunciationSchedule.templateId;
      
      for (let date = new Date(startDate); date <= endDate && sessionCount < 4; date.setDate(date.getDate() + 1)) {
        const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
        
        timeSlots.forEach(slot => {
          if (slot.weekdays && slot.weekdays.includes(dayOfWeek) && sessionCount < 4) {
            sessionCount++;
            const dateStr = date.toISOString().split('T')[0];
            
            generatedSessions.push({
              id: `session_${templateId}_${sessionCount}`,
              date: dateStr,
              sessionNumber: sessionCount,
              title: `Lesson ${sessionCount}`,
              startTime: slot.startTime,
              endTime: slot.endTime,
              teacherId: slot.teacherId,
              teacherName: pronunciationSchedule.teacherName || '王老師',
              virtualClassroomLink: '',
              materialLink: ''
            });
          }
        });
      }
      
      // 更新排程
      pronunciationSchedule.generatedSessions = generatedSessions;
      
      // 保存更新的排程
      const updatedSchedules = schedules.map(s => 
        s.id === pronunciationSchedule.id ? pronunciationSchedule : s
      );
      localStorage.setItem('courseSchedules', JSON.stringify(updatedSchedules));
      
      console.log('✅ 已生成課程時段:', generatedSessions);
    }
  } else {
    console.log('✅ 排程已有生成的課程時段:', pronunciationSchedule.generatedSessions);
  }
  
  console.log('\n🔄 請重新整理頁面查看更新結果');
}

// 同時創建對應的預約數據
function createMatchingBookings() {
  console.log('📝 創建匹配的預約數據...');
  
  // Hash function
  function hashString(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
  
  const schedules = JSON.parse(localStorage.getItem('courseSchedules') || '[]');
  const pronunciationSchedule = schedules.find(s => 
    s.templateTitle === 'Pronunciation' || s.templateTitle?.includes('Pronunciation')
  );
  
  if (!pronunciationSchedule || !pronunciationSchedule.generatedSessions) {
    console.log('❌ 找不到有效的課程排程');
    return;
  }
  
  let appointments = JSON.parse(localStorage.getItem('classAppointments') || '[]');
  
  // 清理舊的 Pronunciation 預約
  appointments = appointments.filter(apt => 
    !apt.course_name || !apt.course_name.includes('Pronunciation')
  );
  
  // 為每個生成的課程時段創建預約
  pronunciationSchedule.generatedSessions.forEach((session, index) => {
    const sessionHashId = hashString(session.id);
    
    const newAppointment = {
      id: Date.now() + index,
      user_id: 2, // Alice Wang
      class_timeslot_id: sessionHashId,
      course_name: `Pronunciation - ${session.title}`,
      status: 'CONFIRMED',
      created_at: new Date().toISOString(),
      booking_date: session.date,
      booking_time: `${session.startTime}-${session.endTime}`
    };
    
    appointments.push(newAppointment);
    console.log(`✅ 創建預約 ${index + 1}:`, {
      sessionId: session.id,
      hashId: sessionHashId,
      courseName: newAppointment.course_name,
      date: newAppointment.booking_date,
      time: newAppointment.booking_time
    });
  });
  
  localStorage.setItem('classAppointments', JSON.stringify(appointments));
  console.log('✅ 所有預約數據已創建完成');
}

// 執行檢查和修正
console.log('開始執行課程排程檢查和修正...');
checkScheduleGeneration();
setTimeout(() => {
  createMatchingBookings();
}, 1000);