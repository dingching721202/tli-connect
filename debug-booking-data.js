// 調試預約數據的腳本
// 在瀏覽器控制台中執行此腳本來檢查問題

function debugBookingData() {
  console.log('🔍 開始調試預約數據...');
  
  // Hash function (與系統一致)
  function hashString(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
  
  console.log('\n=== 1. 檢查課程模板 ===');
  const templates = JSON.parse(localStorage.getItem('courseTemplates') || '[]');
  console.log('所有課程模板:', templates.map(t => ({ id: t.id, title: t.title })));
  
  const pronunciationTemplate = templates.find(t => t.title === 'Pronunciation');
  if (pronunciationTemplate) {
    console.log('✅ 找到 Pronunciation 模板:', pronunciationTemplate.id);
  } else {
    console.log('❌ 找不到 Pronunciation 模板');
  }
  
  console.log('\n=== 2. 檢查課程排程 ===');
  const schedules = JSON.parse(localStorage.getItem('courseSchedules') || '[]');
  console.log('所有課程排程:', schedules.map(s => ({ id: s.id, templateId: s.templateId, templateTitle: s.templateTitle })));
  
  const pronunciationSchedule = schedules.find(s => s.templateTitle === 'Pronunciation');
  if (pronunciationSchedule) {
    console.log('✅ 找到 Pronunciation 排程:', pronunciationSchedule.id);
    console.log('生成的課程時段:', pronunciationSchedule.generatedSessions?.map(s => ({ 
      id: s.id, 
      sessionNumber: s.sessionNumber, 
      title: s.title,
      date: s.date,
      time: `${s.startTime}-${s.endTime}`
    })));
  } else {
    console.log('❌ 找不到 Pronunciation 排程');
  }
  
  console.log('\n=== 3. 檢查現有預約 ===');
  const appointments = JSON.parse(localStorage.getItem('classAppointments') || '[]');
  console.log('所有預約數量:', appointments.length);
  console.log('預約詳情:', appointments.map(apt => ({
    id: apt.id,
    user_id: apt.user_id,
    class_timeslot_id: apt.class_timeslot_id,
    course_name: apt.course_name,
    status: apt.status
  })));
  
  const pronunciationBookings = appointments.filter(apt => 
    apt.course_name && apt.course_name.includes('Pronunciation')
  );
  console.log('Pronunciation 相關預約:', pronunciationBookings);
  
  console.log('\n=== 4. 檢查 Session ID 匹配 ===');
  if (pronunciationSchedule && pronunciationSchedule.generatedSessions) {
    pronunciationSchedule.generatedSessions.forEach(session => {
      const sessionHashId = hashString(session.id);
      const matchingBookings = appointments.filter(apt => apt.class_timeslot_id === sessionHashId);
      console.log(`Session: ${session.id}`);
      console.log(`  HashID: ${sessionHashId}`);
      console.log(`  匹配預約數: ${matchingBookings.length}`);
      console.log(`  匹配預約:`, matchingBookings);
    });
  }
  
  console.log('\n=== 5. 手動創建測試預約 ===');
  if (pronunciationSchedule && pronunciationSchedule.generatedSessions && pronunciationSchedule.generatedSessions.length > 0) {
    const firstSession = pronunciationSchedule.generatedSessions[0];
    const testSessionId = firstSession.id;
    const testHashId = hashString(testSessionId);
    
    console.log(`準備創建測試預約:`);
    console.log(`  Session ID: ${testSessionId}`);
    console.log(`  Hash ID: ${testHashId}`);
    
    // 檢查是否已有此預約
    const existingBooking = appointments.find(apt => apt.class_timeslot_id === testHashId);
    if (existingBooking) {
      console.log('⚠️ 已存在此預約:', existingBooking);
    } else {
      console.log('🆕 創建新預約...');
      const newAppointment = {
        id: Date.now(),
        user_id: 2, // Alice Wang
        class_timeslot_id: testHashId,
        course_name: `Pronunciation - ${firstSession.title}`,
        status: 'CONFIRMED',
        created_at: new Date().toISOString(),
        booking_date: firstSession.date,
        booking_time: `${firstSession.startTime}-${firstSession.endTime}`
      };
      
      appointments.push(newAppointment);
      localStorage.setItem('classAppointments', JSON.stringify(appointments));
      console.log('✅ 測試預約已創建:', newAppointment);
    }
  }
  
  console.log('\n=== 6. 驗證系統實際使用的 ID 格式 ===');
  // 檢查系統在課程預約中實際使用的格式
  const bookingSessions = JSON.parse(localStorage.getItem('bookingSessions') || '[]');
  console.log('BookingSessions 數據:', bookingSessions);
  
  console.log('\n🔄 調試完成，請重新整理頁面查看結果');
}

// 執行調試
debugBookingData();