// 測試正常預約流程是否會正確工作
function testNormalBookingFlow() {
  console.log('🧪 測試正常預約流程...');
  
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
  
  // 1. 模擬學生進入預約頁面的流程
  console.log('\n1️⃣ === 模擬學生預約流程 ===');
  
  // 檢查預約頁面會看到什麼課程
  const schedules = JSON.parse(localStorage.getItem('courseSchedules') || '[]');
  const publishedSchedules = schedules.filter(s => s.status === 'published');
  
  console.log(`發布的課程排程: ${publishedSchedules.length} 個`);
  
  let availableCourses = [];
  
  publishedSchedules.forEach(schedule => {
    if (schedule.generatedSessions && schedule.generatedSessions.length > 0) {
      schedule.generatedSessions.forEach(session => {
        const sessionHashId = hashString(session.id);
        
        availableCourses.push({
          id: session.id,
          title: `${schedule.templateTitle} - ${session.title || `Lesson ${session.sessionNumber}`}`,
          date: session.date,
          timeSlot: `${session.startTime}-${session.endTime}`,
          teacher: session.teacherName || '老師',
          timeslot_id: sessionHashId, // 這是關鍵！
          sessionId: session.id
        });
      });
    }
  });
  
  console.log(`學生可預約的課程: ${availableCourses.length} 堂`);
  
  // 顯示前 3 堂課程的詳細信息
  availableCourses.slice(0, 3).forEach((course, index) => {
    console.log(`  ${index + 1}. ${course.title}`);
    console.log(`     日期: ${course.date} ${course.timeSlot}`);
    console.log(`     SessionID: ${course.sessionId}`);
    console.log(`     TimeslotID: ${course.timeslot_id}`);
  });
  
  // 2. 模擬學生選擇並預約第一堂課
  console.log('\n2️⃣ === 模擬預約 API 調用 ===');
  
  const firstCourse = availableCourses[0];
  if (firstCourse) {
    console.log(`學生選擇預約: ${firstCourse.title}`);
    console.log(`要發送的 timeslot_id: ${firstCourse.timeslot_id}`);
    
    // 模擬 API 調用會做的事情
    const mockUserId = 3; // 假設是學生 3
    const mockBookingId = Date.now();
    
    // 創建預約記錄（模擬 API 行為）
    const newAppointment = {
      id: mockBookingId,
      class_timeslot_id: firstCourse.timeslot_id, // 使用相同的 hash ID
      user_id: mockUserId,
      status: 'CONFIRMED',
      created_at: new Date().toISOString()
    };
    
    // 模擬保存到 localStorage（BookingSystem 會做的）
    let appointments = JSON.parse(localStorage.getItem('classAppointments') || '[]');
    appointments.push(newAppointment);
    localStorage.setItem('classAppointments', JSON.stringify(appointments));
    
    console.log('✅ 模擬預約已創建:', newAppointment);
    
    // 3. 檢查時段管理是否能正確顯示
    console.log('\n3️⃣ === 檢查時段管理顯示 ===');
    
    // 找到對應的 session
    let foundSession = null;
    publishedSchedules.forEach(schedule => {
      if (schedule.generatedSessions) {
        schedule.generatedSessions.forEach(session => {
          if (session.id === firstCourse.sessionId) {
            foundSession = session;
          }
        });
      }
    });
    
    if (foundSession) {
      const sessionHashId = hashString(foundSession.id);
      const updatedAppointments = JSON.parse(localStorage.getItem('classAppointments') || '[]');
      const matchingBookings = updatedAppointments.filter(apt => 
        apt.class_timeslot_id === sessionHashId && apt.status === 'CONFIRMED'
      );
      
      console.log(`Session ID: ${foundSession.id}`);
      console.log(`Hash ID: ${sessionHashId}`);
      console.log(`匹配的預約數: ${matchingBookings.length}`);
      console.log(`時段管理應該顯示: ${matchingBookings.length} 位學生`);
      
      if (matchingBookings.length > 0) {
        console.log('✅ 正常流程會正確工作！');
      } else {
        console.log('❌ 正常流程有問題！');
      }
    }
    
    // 4. 測試 getAllTimeslotsWithBookings 函數
    console.log('\n4️⃣ === 測試時段服務函數 ===');
    
    // 模擬 timeslotService 的邏輯
    let totalTimeslots = 0;
    let timeslotsWithBookings = 0;
    
    publishedSchedules.forEach(schedule => {
      if (schedule.generatedSessions) {
        schedule.generatedSessions.forEach(session => {
          totalTimeslots++;
          const sessionHashId = hashString(session.id);
          const bookingCount = updatedAppointments.filter(apt => 
            apt.class_timeslot_id === sessionHashId && apt.status === 'CONFIRMED'
          ).length;
          
          if (bookingCount > 0) {
            timeslotsWithBookings++;
            console.log(`  ${session.id}: ${bookingCount} 位學生`);
          }
        });
      }
    });
    
    console.log(`總時段數: ${totalTimeslots}`);
    console.log(`有預約的時段: ${timeslotsWithBookings}`);
    
  } else {
    console.log('❌ 沒有可預約的課程');
  }
  
  console.log('\n5️⃣ === 檢查潛在問題 ===');
  
  // 檢查是否有重複的 Hash ID
  const allSessionIds = [];
  const allHashIds = [];
  
  publishedSchedules.forEach(schedule => {
    if (schedule.generatedSessions) {
      schedule.generatedSessions.forEach(session => {
        allSessionIds.push(session.id);
        allHashIds.push(hashString(session.id));
      });
    }
  });
  
  const uniqueSessionIds = [...new Set(allSessionIds)];
  const uniqueHashIds = [...new Set(allHashIds)];
  
  console.log(`Session ID 總數: ${allSessionIds.length}, 唯一數: ${uniqueSessionIds.length}`);
  console.log(`Hash ID 總數: ${allHashIds.length}, 唯一數: ${uniqueHashIds.length}`);
  
  if (allSessionIds.length !== uniqueSessionIds.length) {
    console.log('⚠️ 有重複的 Session ID！');
  }
  
  if (allHashIds.length !== uniqueHashIds.length) {
    console.log('⚠️ 有重複的 Hash ID！這可能導致預約數據混亂');
  }
  
  console.log('\n📊 === 測試總結 ===');
  console.log('如果上面顯示「正常流程會正確工作」，那麼學生平常預約就會正確顯示');
  console.log('如果有警告訊息，那可能需要進一步修正');
}

// 執行測試
testNormalBookingFlow();