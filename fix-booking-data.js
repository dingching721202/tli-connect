// 修正預約數據的腳本
// 在瀏覽器控制台中執行此腳本

function fixBookingData() {
  console.log('🔧 開始修正預約數據...');
  
  // 獲取課程模板
  const templates = JSON.parse(localStorage.getItem('courseTemplates') || '[]');
  const pronunciationTemplate = templates.find(t => t.title === 'Pronunciation');
  
  if (!pronunciationTemplate) {
    console.error('❌ 找不到 Pronunciation 課程模板');
    return;
  }
  
  console.log(`📚 找到 Pronunciation 模板: ${pronunciationTemplate.id}`);
  
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
  
  // 清理舊的 Pronunciation 預約
  let appointments = JSON.parse(localStorage.getItem('classAppointments') || '[]');
  appointments = appointments.filter(apt => 
    !apt.course_name || !apt.course_name.includes('Pronunciation')
  );
  
  // 創建正確的預約數據
  const templateId = pronunciationTemplate.id;
  const sessionIds = [
    `session_${templateId}_1`, // Lesson 1 - 8月4日 週一 12:30-13:20
    `session_${templateId}_2`, // Lesson 2 - 8月5日 週二 19:30-20:20
    `session_${templateId}_3`, // Lesson 3 - 8月11日 週一 12:30-13:20
    `session_${templateId}_4`  // Lesson 4 - 8月12日 週二 19:30-20:20
  ];
  
  const newAppointments = sessionIds.map((sessionId, index) => ({
    id: Date.now() + index,
    user_id: 2, // Alice Wang的ID
    class_timeslot_id: hashString(sessionId),
    course_name: `Pronunciation - Lesson ${index + 1}`,
    status: 'CONFIRMED',
    created_at: new Date().toISOString(),
    booking_date: index < 2 ? '2025-08-04' : '2025-08-11',
    booking_time: index % 2 === 0 ? '12:30-13:20' : '19:30-20:20'
  }));
  
  appointments.push(...newAppointments);
  localStorage.setItem('classAppointments', JSON.stringify(appointments));
  
  console.log('✅ 預約數據修正完成！');
  console.log('📋 新增的預約:');
  newAppointments.forEach((apt, index) => {
    console.log(`  ${index + 1}. ${apt.course_name}`);
    console.log(`     SessionID: ${sessionIds[index]}`);
    console.log(`     TimeslotID: ${apt.class_timeslot_id}`);
    console.log(`     日期時間: ${apt.booking_date} ${apt.booking_time}`);
  });
  
  console.log('\n🔄 請重新整理頁面查看更新結果');
}

// 執行修正
fixBookingData();