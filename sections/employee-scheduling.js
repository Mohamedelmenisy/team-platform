/**
 * Initialize Employee Schedule with Enhanced Data Handling
 * @param {Object} currentUserFromDashboard - بيانات المستخدم الحالي
 * @param {Array|Object} teamMembersFromDashboard - بيانات الفريق (مصفوفة أو كائن)
 */
function initializeEmployeeSchedule(currentUserFromDashboard, teamMembersFromDashboard) {
  // --- START: Enhanced Data Validation ---
  console.log("🚀 Starting Schedule Initialization...");
  
  // 1. تحقق من بيانات المستخدم
  if (!currentUserFromDashboard || typeof currentUserFromDashboard !== 'object') {
    console.error("❌ Invalid currentUser:", currentUserFromDashboard);
    displayErrorMessage("خطأ في بيانات المستخدم");
    return;
  }

  // 2. معالجة بيانات الفريق
  let employees = [];
  if (Array.isArray(teamMembersFromDashboard)) {
    employees = teamMembersFromDashboard;
  } else if (teamMembersFromDashboard && typeof teamMembersFromDashboard === 'object') {
    console.warn("⚠️ Converting Object to Array...");
    employees = Object.values(teamMembersFromDashboard);
  } else {
    console.error("❌ Invalid team data:", typeof teamMembersFromDashboard);
    displayErrorMessage("بيانات الفريق غير صالحة");
    return;
  }

  // 3. تحقق من وجود بيانات
  if (employees.length === 0) {
    console.warn("⚠️ No employees found");
    displayErrorMessage("لا يوجد موظفين لعرضهم");
    return;
  }

  // 4. تسجيل البيانات للفحص
  console.log("✅ Valid Data Received:", {
    currentUser: currentUserFromDashboard,
    employees: employees
  });
  // --- END: Enhanced Data Validation ---

  // --- DOM Elements (باستخدام querySelector الآمن) ---
  const getElement = (selector, parent = document) => {
    const el = parent.querySelector(selector);
    if (!el) console.error(`❌ Element not found: ${selector}`);
    return el;
  };

  const scheduleContainer = getElement('#featureSections .schedule-container');
  const scheduleTableBody = getElement('#scheduleTableBody', scheduleContainer);
  const weekDisplay = getElement('#weekDisplay', scheduleContainer.parentElement);
  const prevWeekBtn = getElement('#prevWeekBtn', scheduleContainer.parentElement);
  const nextWeekBtn = getElement('#nextWeekBtn', scheduleContainer.parentElement);

  // --- إعداد التواريخ ---
  let currentWeekStart = new Date();
  currentWeekStart.setHours(0, 0, 0, 0);
  currentWeekStart = getStartOfWeek(currentWeekStart);

  const daysOfWeek = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  // --- الوظائف المساعدة ---
  function getStartOfWeek(date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  function displayErrorMessage(message) {
    const placeholder = getElement('#featurePlaceholder');
    if (placeholder) {
      placeholder.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle"></i>
          ${message}
        </div>
      `;
    }
  }

  // --- عرض الجدول الرئيسي ---
  function renderScheduleTable() {
    if (!scheduleTableBody) return;

    scheduleTableBody.innerHTML = employees.map(employee => `
      <tr>
        <td class="employee-name">${employee.name || '---'}</td>
        ${daysOfWeek.map(day => `
          <td class="${getShiftClass(employee, day)}">
            ${getShiftText(employee, day)}
          </td>
        `).join('')}
      </tr>
    `).join('');

    // إضافة event listeners للخلايا
    document.querySelectorAll('#scheduleTableBody td:not(.employee-name)').forEach(cell => {
      cell.addEventListener('click', () => handleCellClick(cell));
    });
  }

  function getShiftClass(employee, day) {
    if (!employee.shifts?.[day]) return 'no-shift';
    return `shift shift-${employee.shifts[day].type}`;
  }

  function getShiftText(employee, day) {
    if (!employee.shifts?.[day]) return '---';
    return employee.shifts[day].text || 'وردية';
  }

  function handleCellClick(cell) {
    const rowIndex = cell.parentElement.rowIndex - 1;
    const dayIndex = cell.cellIndex - 1;
    const employee = employees[rowIndex];
    const day = daysOfWeek[dayIndex];
    
    console.log(`Editing shift for ${employee.name} on ${day}`);
    // هنا يمكنك فتح المودال لتعديل الوردية
  }

  // --- التحكم في الأسابيع ---
  function updateWeekDisplay() {
    if (!weekDisplay) return;

    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    weekDisplay.textContent = `
      ${formatDate(currentWeekStart)} - ${formatDate(weekEnd)}
    `;

    // تحديث تواريخ الأعمدة
    document.querySelectorAll('.day-date').forEach((cell, i) => {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      cell.textContent = formatDate(date, true);
    });

    renderScheduleTable();
  }

  function formatDate(date, short = false) {
    return date.toLocaleDateString('ar-EG', {
      month: short ? 'short' : 'long',
      day: 'numeric'
    });
  }

  // --- Event Listeners ---
  prevWeekBtn?.addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    updateWeekDisplay();
  });

  nextWeekBtn?.addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    updateWeekDisplay();
  });

  // --- التهيئة الأولية ---
  updateWeekDisplay();
}

// --- الاستخدام الآمن ---
document.addEventListener('DOMContentLoaded', () => {
  // هذه البيانات يجب أن تأتي من صفحة الـ Dashboard
  initializeEmployeeSchedule(
    { name: "مدير النظام" }, // currentUserFromDashboard
    [ // teamMembersFromDashboard (مثال)
      {
        name: "أحمد محمد",
        shifts: {
          mon: { type: "morning", text: "8 ص - 4 م" },
          tue: { type: "afternoon", text: "12 ظ - 8 م" }
        }
      },
      {
        name: "مريم علي",
        shifts: {
          wed: { type: "night", text: "8 م - 8 ص" },
          thu: { type: "morning", text: "8 ص - 4 م" }
        }
      }
    ]
  );
});
