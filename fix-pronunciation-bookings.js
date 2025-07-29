// 修復 Pronunciation 課程的預約數據匹配問題
function fixPronunciationBookings() {
  console.log('🔧 開始修復 Pronunciation 課程預約數據...');
  
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
  
  // 獲取數據
  const templates = JSON.parse(localStorage.getItem('courseTemplates') || '[]');
  const schedules = JSON.parse(localStorage.getItem('courseSchedules') || '[]');
  let appointments = JSON.parse(localStorage.getItem('classAppointments') || '[]');
  
  console.log('📊 當前狀態:');
  console.log(`課程模板: ${templates.length} 個`);
  console.log(`課程排程: ${schedules.length} 個`);
  console.log(`預約記錄: ${appointments.length} 個`);
  
  // 尋找 Pronunciation 相關的課程（更寬鬆的匹配）
  const pronunciationTemplate = templates.find(t => 
    t.title && (t.title.includes('Pronunciation') || t.title.trim() === 'Pronunciation')
  );
  
  if (!pronunciationTemplate) {
    console.error('❌ 找不到 Pronunciation 課程模板');
    return;
  }
  
  console.log('✅ 找到模板:', pronunciationTemplate.title, '(ID:', pronunciationTemplate.id, ')');
  
  const pronunciationSchedule = schedules.find(s => s.templateId === pronunciationTemplate.id);
  
  if (!pronunciationSchedule) {
    console.error('❌ 找不到 Pronunciation 課程排程');
    return;
  }
  
  console.log('✅ 找到排程:', pronunciationSchedule.id);
  
  if (!pronunciationSchedule.generatedSessions || pronunciationSchedule.generatedSessions.length === 0) {
    console.error('❌ 排程沒有生成的課程時段');
    return;
  }
  
  console.log(`✅ 有 ${pronunciationSchedule.generatedSessions.length} 個生成的時段`);
  
  // 清理舊的 Pronunciation 相關預約（基於課程名稱）
  const oldCount = appointments.length;
  appointments = appointments.filter(apt => 
    !apt.course_name || !apt.course_name.includes('Pronunciation')
  );
  console.log(`🗑️ 清理了 ${oldCount - appointments.length} 個舊的 Pronunciation 預約`);
  
  // 為每個時段創建正確的預約數據
  const newBookings = [];
  
  pronunciationSchedule.generatedSessions.forEach((session, index) => {
    const sessionHashId = hashString(session.id);
    
    // 為前 4 個時段創建預約（模擬學生已預約的情況）
    if (index < 4) {
      const newBooking = {
        id: Date.now() + index,
        class_timeslot_id: sessionHashId,
        user_id: 2, // Alice Wang 的 ID
        status: 'CONFIRMED',
        created_at: new Date().toISOString(),
        course_name: `Pronunciation - ${session.title || `Lesson ${index + 1}`}`,
        booking_date: session.date,
        booking_time: `${session.startTime}-${session.endTime}`
      };
      
      newBookings.push(newBooking);
      console.log(`✅ 創建預約 ${index + 1}:`);
      console.log(`   Session ID: ${session.id}`);
      console.log(`   Hash ID: ${sessionHashId}`);
      console.log(`   日期: ${session.date} ${session.startTime}-${session.endTime}`);
      console.log(`   課程: ${newBooking.course_name}`);
    }
  });
  
  // 保存更新的預約數據
  appointments.push(...newBookings);
  localStorage.setItem('classAppointments', JSON.stringify(appointments));
  
  console.log(`\n🎉 修復完成！`);
  console.log(`📝 創建了 ${newBookings.length} 個新預約`);
  console.log(`💾 總預約數量: ${appointments.length}`);
  
  // 驗證修復結果
  console.log('\n🔍 驗證修復結果:');
  pronunciationSchedule.generatedSessions.forEach((session, index) => {
    const sessionHashId = hashString(session.id);
    const matchingBookings = appointments.filter(apt => 
      apt.class_timeslot_id === sessionHashId && apt.status === 'CONFIRMED'
    );
    
    console.log(`時段 ${index + 1}: ${session.title || `Lesson ${index + 1}`}`);
    console.log(`  Hash ID: ${sessionHashId}`);
    console.log(`  預約數量: ${matchingBookings.length}`);
    console.log(`  日期: ${session.date} ${session.startTime}-${session.endTime}`);
  });
  
  console.log('\n🔄 請重新整理「課程管理 → 時段管理」頁面查看結果！');
  
  // 觸發更新事件
  if (window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent('bookingsUpdated'));
    console.log('📡 已觸發預約更新事件');
  }
}

// 執行修復
fixPronunciationBookings();