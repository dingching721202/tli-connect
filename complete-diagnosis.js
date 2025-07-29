// 完全徹查課程管理時段預約數字問題
function completeDiagnosis() {
  console.log('🔍 開始完全徹查課程管理時段預約數字問題...');
  console.log('='.repeat(80));
  
  // Hash function (確保與系統一致)
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
  
  console.log('\n1️⃣ === 檢查 localStorage 中的所有數據 ===');
  console.log('📋 classAppointments:');
  const appointments = JSON.parse(localStorage.getItem('classAppointments') || '[]');
  console.log('預約總數:', appointments.length);
  appointments.forEach((apt, index) => {
    console.log(`  ${index + 1}. ID: ${apt.id}, User: ${apt.user_id}, TimeslotID: ${apt.class_timeslot_id}, Status: ${apt.status}`);
    if (apt.course_name) console.log(`     課程: ${apt.course_name}`);
    if (apt.booking_date) console.log(`     日期: ${apt.booking_date} ${apt.booking_time || ''}`);
  });
  
  console.log('\n📚 courseTemplates:');
  const templates = JSON.parse(localStorage.getItem('courseTemplates') || '[]');
  console.log('模板總數:', templates.length);
  templates.forEach(template => {
    console.log(`  - ${template.title} (ID: ${template.id})`);
  });
  
  console.log('\n📅 courseSchedules:');
  const schedules = JSON.parse(localStorage.getItem('courseSchedules') || '[]');
  console.log('排程總數:', schedules.length);
  schedules.forEach(schedule => {
    console.log(`  - ${schedule.templateTitle || 'No Title'} (ID: ${schedule.id})`);
    console.log(`    狀態: ${schedule.status}, 模板ID: ${schedule.templateId}`);
    if (schedule.generatedSessions) {
      console.log(`    生成時段數量: ${schedule.generatedSessions.length}`);
      schedule.generatedSessions.forEach((session, idx) => {
        const sessionHash = hashString(session.id);
        const matchingBookings = appointments.filter(apt => 
          apt.class_timeslot_id === sessionHash && apt.status === 'CONFIRMED'
        );
        console.log(`      ${idx + 1}. ${session.id} (Hash: ${sessionHash}) - 預約數: ${matchingBookings.length}`);
        console.log(`         日期: ${session.date} ${session.startTime}-${session.endTime}`);
        console.log(`         標題: ${session.title}`);
        if (matchingBookings.length > 0) {
          console.log(`         📝 匹配的預約:`, matchingBookings.map(b => `User${b.user_id}(ID:${b.id})`));
        }
      });
    } else {
      console.log(`    ⚠️ 沒有生成的課程時段！`);
    }
  });
  
  console.log('\n2️⃣ === 檢查 Pronunciation 課程的具體情況 ===');
  const pronunciationTemplate = templates.find(t => t.title === 'Pronunciation');
  if (pronunciationTemplate) {
    console.log('✅ 找到 Pronunciation 模板:', pronunciationTemplate.id);
    
    const pronunciationSchedule = schedules.find(s => s.templateId === pronunciationTemplate.id);
    if (pronunciationSchedule) {
      console.log('✅ 找到 Pronunciation 排程:', pronunciationSchedule.id);
      console.log('排程狀態:', pronunciationSchedule.status);
      
      if (pronunciationSchedule.generatedSessions && pronunciationSchedule.generatedSessions.length > 0) {
        console.log('✅ 有生成的課程時段:', pronunciationSchedule.generatedSessions.length, '個');
        
        console.log('\n🔍 詳細檢查每個時段的預約情況:');
        pronunciationSchedule.generatedSessions.forEach((session, idx) => {
          const sessionHash = hashString(session.id);
          const matchingBookings = appointments.filter(apt => 
            apt.class_timeslot_id === sessionHash && apt.status === 'CONFIRMED'
          );
          
          console.log(`\n時段 ${idx + 1}:`);
          console.log(`  Session ID: ${session.id}`);
          console.log(`  Hash ID: ${sessionHash}`);
          console.log(`  日期時間: ${session.date} ${session.startTime}-${session.endTime}`);
          console.log(`  標題: ${session.title}`);
          console.log(`  預約數量: ${matchingBookings.length}`);
          
          if (matchingBookings.length > 0) {
            console.log(`  📋 預約詳情:`);
            matchingBookings.forEach(booking => {
              console.log(`    - 用戶 ${booking.user_id}, 預約ID: ${booking.id}, 狀態: ${booking.status}`);
              console.log(`      創建時間: ${booking.created_at}`);
            });
          } else {
            console.log(`  ❌ 沒有找到匹配的預約！`);
            
            // 檢查是否有其他可能匹配的預約
            console.log(`  🔍 檢查所有預約中是否有相關的:`);
            const relatedBookings = appointments.filter(apt => 
              apt.course_name && apt.course_name.includes('Pronunciation')
            );
            if (relatedBookings.length > 0) {
              console.log(`    找到 ${relatedBookings.length} 個相關預約:`);
              relatedBookings.forEach(booking => {
                console.log(`      - 用戶 ${booking.user_id}, TimeslotID: ${booking.class_timeslot_id} (應該是: ${sessionHash})`);
                console.log(`        課程名稱: ${booking.course_name}`);
                console.log(`        狀態: ${booking.status}`);
              });
            }
          }
        });
      } else {
        console.log('❌ 沒有生成的課程時段！');
      }
    } else {
      console.log('❌ 找不到 Pronunciation 排程！');
    }
  } else {
    console.log('❌ 找不到 Pronunciation 模板！');
  }
  
  console.log('\n3️⃣ === 測試時段服務函數 ===');
  
  // 模擬 getAllTimeslotsWithBookings 函數的邏輯
  console.log('🔧 模擬時段服務邏輯:');
  
  const publishedSchedules = schedules.filter(schedule => schedule.status === 'published');
  console.log(`發布的排程數量: ${publishedSchedules.length}`);
  
  let totalProcessedTimeslots = 0;
  
  for (const schedule of publishedSchedules) {
    if (!schedule.generatedSessions || schedule.generatedSessions.length === 0) {
      console.log(`⚠️ 排程 ${schedule.id} 沒有生成的時段`);
      continue;
    }
    
    console.log(`\n處理排程: ${schedule.templateTitle} (${schedule.generatedSessions.length} 個時段)`);
    
    for (const session of schedule.generatedSessions) {
      const sessionHashId = hashString(session.id);
      const timeslotBookings = appointments.filter(booking => 
        booking.class_timeslot_id === sessionHashId && 
        booking.status === 'CONFIRMED'
      );
      
      const bookedCount = timeslotBookings.length;
      totalProcessedTimeslots++;
      
      console.log(`  時段: ${session.id}`);
      console.log(`    Hash: ${sessionHashId}`);
      console.log(`    預約數: ${bookedCount}`);
      console.log(`    日期: ${session.date} ${session.startTime}-${session.endTime}`);
      
      if (bookedCount > 0) {
        console.log(`    👥 學生列表:`);
        timeslotBookings.forEach(booking => {
          console.log(`      - 學生 ${booking.user_id} (預約ID: ${booking.id})`);
        });
      }
    }
  }
  
  console.log(`\n處理的時段總數: ${totalProcessedTimeslots}`);
  
  console.log('\n4️⃣ === 手動創建測試預約 ===');
  
  if (pronunciationSchedule && pronunciationSchedule.generatedSessions && pronunciationSchedule.generatedSessions.length > 0) {
    console.log('🛠️ 為第一個 Pronunciation 時段創建測試預約...');
    
    const firstSession = pronunciationSchedule.generatedSessions[0];
    const testSessionHashId = hashString(firstSession.id);
    
    // 檢查是否已經存在預約
    const existingBooking = appointments.find(apt => 
      apt.class_timeslot_id === testSessionHashId && apt.status === 'CONFIRMED'
    );
    
    if (existingBooking) {
      console.log('✅ 已存在預約:', existingBooking);
    } else {
      console.log('🆕 創建新的測試預約...');
      
      const newBooking = {
        id: Date.now(),
        class_timeslot_id: testSessionHashId,
        user_id: 2, // Alice Wang
        status: 'CONFIRMED',
        created_at: new Date().toISOString(),
        course_name: `Pronunciation - ${firstSession.title}`,
        booking_date: firstSession.date,
        booking_time: `${firstSession.startTime}-${firstSession.endTime}`
      };
      
      appointments.push(newBooking);
      localStorage.setItem('classAppointments', JSON.stringify(appointments));
      
      console.log('✅ 測試預約已創建:', newBooking);
      console.log(`Session ID: ${firstSession.id}`);
      console.log(`Hash ID: ${testSessionHashId}`);
      console.log(`用戶: ${newBooking.user_id}`);
    }
  }
  
  console.log('\n5️⃣ === 驗證修正後的結果 ===');
  
  // 重新檢查
  const updatedAppointments = JSON.parse(localStorage.getItem('classAppointments') || '[]');
  console.log(`更新後的預約總數: ${updatedAppointments.length}`);
  
  if (pronunciationSchedule && pronunciationSchedule.generatedSessions) {
    pronunciationSchedule.generatedSessions.forEach((session, idx) => {
      const sessionHash = hashString(session.id);
      const matchingBookings = updatedAppointments.filter(apt => 
        apt.class_timeslot_id === sessionHash && apt.status === 'CONFIRMED'
      );
      
      console.log(`時段 ${idx + 1}: ${session.title} - 預約數: ${matchingBookings.length}`);
    });
  }
  
  console.log('\n='.repeat(80));
  console.log('🔄 診斷完成！請重新整理頁面查看結果');
  console.log('📱 如果問題仍然存在，請查看瀏覽器控制台的錯誤訊息');
}

// 執行完整診斷
completeDiagnosis();