// 調試預約同步問題
function debugBookingSync() {
  console.log('🔍 調試預約同步問題...');
  
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
  
  console.log('\n1️⃣ === 檢查最新預約數據 ===');
  const appointments = JSON.parse(localStorage.getItem('classAppointments') || '[]');
  console.log(`總預約數: ${appointments.length}`);
  
  // 顯示最近的預約
  const recentAppointments = appointments
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);
    
  console.log('\n🕒 最近的 10 個預約:');
  recentAppointments.forEach((apt, index) => {
    console.log(`${index + 1}. ID: ${apt.id}, User: ${apt.user_id}, TimeslotID: ${apt.class_timeslot_id}, Status: ${apt.status}`);
    console.log(`   創建時間: ${apt.created_at}`);
    if (apt.course_name) console.log(`   課程: ${apt.course_name}`);
  });
  
  console.log('\n2️⃣ === 檢查課程時段匹配 ===');
  const schedules = JSON.parse(localStorage.getItem('courseSchedules') || '[]');
  const publishedSchedules = schedules.filter(s => s.status === 'published');
  
  publishedSchedules.forEach(schedule => {
    if (schedule.generatedSessions) {
      console.log(`\n📚 課程: ${schedule.templateTitle}`);
      schedule.generatedSessions.forEach((session, idx) => {
        const sessionHashId = hashString(session.id);
        const matchingBookings = appointments.filter(apt => 
          apt.class_timeslot_id === sessionHashId && apt.status === 'CONFIRMED'
        );
        
        console.log(`  時段 ${idx + 1}: ${session.title || `Lesson ${idx + 1}`}`);
        console.log(`    Session ID: ${session.id}`);
        console.log(`    Hash ID: ${sessionHashId}`);
        console.log(`    日期: ${session.date} ${session.startTime}-${session.endTime}`);
        console.log(`    匹配預約數: ${matchingBookings.length}`);
        
        if (matchingBookings.length > 0) {
          console.log(`    👥 預約學生:`);
          matchingBookings.forEach(booking => {
            console.log(`      - 用戶 ${booking.user_id} (預約ID: ${booking.id})`);
            console.log(`        創建時間: ${booking.created_at}`);
          });
        }
      });
    }
  });
  
  console.log('\n3️⃣ === 檢查預約頁面數據流 ===');
  
  // 模擬預約頁面看到的課程
  let availableCourses = [];
  publishedSchedules.forEach(schedule => {
    if (schedule.generatedSessions) {
      schedule.generatedSessions.forEach(session => {
        const sessionHashId = hashString(session.id);
        availableCourses.push({
          sessionId: session.id,
          hashId: sessionHashId,
          title: `${schedule.templateTitle} - ${session.title || `Lesson ${session.sessionNumber}`}`,
          date: session.date,
          timeSlot: `${session.startTime}-${session.endTime}`
        });
      });
    }
  });
  
  console.log('\n📋 預約頁面可見的課程:');
  availableCourses.slice(0, 5).forEach((course, index) => {
    console.log(`${index + 1}. ${course.title}`);
    console.log(`   Session ID: ${course.sessionId}`);
    console.log(`   Hash ID: ${course.hashId}`);
    console.log(`   日期: ${course.date} ${course.timeSlot}`);
    
    // 檢查這個課程是否有預約
    const bookingsForThisCourse = appointments.filter(apt => 
      apt.class_timeslot_id === course.hashId && apt.status === 'CONFIRMED'
    );
    console.log(`   當前預約數: ${bookingsForThisCourse.length}`);
  });
  
  console.log('\n4️⃣ === 檢查是否有不匹配的預約 ===');
  
  // 獲取所有有效的 Hash ID
  const validHashIds = [];
  publishedSchedules.forEach(schedule => {
    if (schedule.generatedSessions) {
      schedule.generatedSessions.forEach(session => {
        validHashIds.push(hashString(session.id));
      });
    }
  });
  
  console.log(`有效的 Hash ID 數量: ${validHashIds.length}`);
  console.log('有效的 Hash IDs:', validHashIds);
  
  // 找出不匹配的預約
  const confirmedAppointments = appointments.filter(apt => apt.status === 'CONFIRMED');
  const unmatchedBookings = confirmedAppointments.filter(apt => 
    !validHashIds.includes(apt.class_timeslot_id)
  );
  
  console.log(`\n❌ 不匹配的預約數量: ${unmatchedBookings.length}`);
  if (unmatchedBookings.length > 0) {
    console.log('不匹配的預約:');
    unmatchedBookings.forEach((booking, index) => {
      console.log(`${index + 1}. 用戶 ${booking.user_id}, TimeslotID: ${booking.class_timeslot_id}`);
      console.log(`   創建時間: ${booking.created_at}`);
      if (booking.course_name) console.log(`   課程名稱: ${booking.course_name}`);
    });
  }
  
  console.log('\n5️⃣ === 檢查時段管理服務 ===');
  
  // 模擬 getAllTimeslotsWithBookings 的邏輯
  console.log('🔧 模擬時段管理服務:');
  let totalTimeslots = 0;
  let timeslotsWithBookings = 0;
  
  publishedSchedules.forEach(schedule => {
    if (schedule.generatedSessions) {
      schedule.generatedSessions.forEach(session => {
        totalTimeslots++;
        const sessionHashId = hashString(session.id);
        const bookingCount = appointments.filter(apt => 
          apt.class_timeslot_id === sessionHashId && apt.status === 'CONFIRMED'
        ).length;
        
        if (bookingCount > 0) {
          timeslotsWithBookings++;
          console.log(`  ✅ ${session.title || `Lesson ${session.sessionNumber}`}: ${bookingCount} 位學生`);
        } else {
          console.log(`  ❌ ${session.title || `Lesson ${session.sessionNumber}`}: 0 位學生`);
        }
      });
    }
  });
  
  console.log(`\n📊 總結:`);
  console.log(`總時段數: ${totalTimeslots}`);
  console.log(`有預約的時段: ${timeslotsWithBookings}`);
  console.log(`確認狀態的預約: ${confirmedAppointments.length}`);
  console.log(`不匹配的預約: ${unmatchedBookings.length}`);
  
  if (unmatchedBookings.length > 0) {
    console.log('\n⚠️ 發現問題: 有預約數據但不匹配當前課程時段');
    console.log('這可能是因為:');
    console.log('1. 課程重新創建導致 Session ID 改變');
    console.log('2. Hash 函數計算不一致');
    console.log('3. 預約數據來自舊的課程設置');
  }
  
  console.log('\n🔄 調試完成');
}

// 執行調試
debugBookingSync();