function initializeEmployeeSchedule(currentUserFromDashboard, teamMembersFromDashboard) {
  // --- START: Input Validation & Logging ---
  console.log("Initializing Employee Schedule...");
  if (!currentUserFromDashboard || typeof currentUserFromDashboard !== 'object') {
    console.error("initializeEmployeeSchedule: Invalid currentUserFromDashboard received.", currentUserFromDashboard);
    displayErrorMessage("Invalid user data received.");
    return;
  }
  // Check if teamMembersFromDashboard is an array
  if (!Array.isArray(teamMembersFromDashboard)) {
    console.error("initializeEmployeeSchedule: Invalid teamMembersFromDashboard received. It is not an array.", teamMembersFromDashboard);
    displayErrorMessage("Invalid team member data received. Data is not in the expected format.");
    return;
  }
  // Check if the array is empty
  if (teamMembersFromDashboard.length === 0) {
    console.warn("initializeEmployeeSchedule: teamMembersFromDashboard is an empty array.");
    displayErrorMessage("No team members found.");
    return;
  }
  console.log("Received Current User:", JSON.parse(JSON.stringify(currentUserFromDashboard)));
  console.log("Received Team Members:", JSON.parse(JSON.stringify(teamMembersFromDashboard)));
  // --- END: Input Validation & Logging ---

  // --- Use data passed from dashboard ---
  const currentUser = currentUserFromDashboard;
  let employees = teamMembersFromDashboard;

  // --- DOM Elements (scoped to the schedule content) ---
  const scheduleContainer = document.querySelector('#featureSections .schedule-container');
  if (!scheduleContainer) {
    console.error("initializeEmployeeSchedule: Schedule container not found in the loaded HTML.");
    return;
  }
  const employeeModal = scheduleContainer.parentElement.querySelector('#employeeModal');
  const shiftModal = scheduleContainer.parentElement.querySelector('#shiftModal');
  const addEmployeeBtn = scheduleContainer.parentElement.querySelector('#addEmployeeBtn');
  const sendRemindersBtn = scheduleContainer.parentElement.querySelector('#sendRemindersBtn');
  const closeEmployeeModal = scheduleContainer.parentElement.querySelector('#closeEmployeeModal');
  const closeShiftModal = scheduleContainer.parentElement.querySelector('#closeShiftModal');
  const cancelEmployeeBtn = scheduleContainer.parentElement.querySelector('#cancelEmployeeBtn');
  const cancelShiftBtn = scheduleContainer.parentElement.querySelector('#cancelShiftBtn');
  const employeeForm = scheduleContainer.parentElement.querySelector('#employeeForm');
  const shiftForm = scheduleContainer.parentElement.querySelector('#shiftForm');
  const shiftTypeSelect = scheduleContainer.parentElement.querySelector('#shiftType');
  const customShiftGroup = scheduleContainer.parentElement.querySelector('#customShiftGroup');
  const deleteShiftBtn = scheduleContainer.parentElement.querySelector('#deleteShiftBtn');
  const prevWeekBtn = scheduleContainer.parentElement.querySelector('#prevWeekBtn');
  const nextWeekBtn = scheduleContainer.parentElement.querySelector('#nextWeekBtn');
  const weekDisplay = scheduleContainer.parentElement.querySelector('#weekDisplay');
  const saveScheduleBtn = scheduleContainer.parentElement.querySelector('#saveScheduleBtn');
  const scheduleTableBody = scheduleContainer.querySelector('#scheduleTableBody');
  const shiftDateInput = scheduleContainer.parentElement.querySelector('#shiftDate');
  const toastNotification = scheduleContainer.parentElement.querySelector('#toastNotification');

  // Check if all essential elements were found
  const essentialElements = {
    employeeModal, shiftModal, addEmployeeBtn, sendRemindersBtn, closeEmployeeModal,
    closeShiftModal, cancelEmployeeBtn, cancelShiftBtn, employeeForm, shiftForm,
    shiftTypeSelect, customShiftGroup, deleteShiftBtn, prevWeekBtn, nextWeekBtn,
    weekDisplay, saveScheduleBtn, scheduleTableBody, shiftDateInput, toastNotification
  };
  for (const key in essentialElements) {
    if (!essentialElements[key]) {
      console.error(`initializeEmployeeSchedule: Element with ID/Selector '${key}' not found.`);
      return; // Stop initialization if a critical element is missing
    }
  }

  // --- State & Configuration ---
  let currentWeekStart = getStartOfWeek(new Date(2025, 4, 5)); // Start on Monday, May 5, 2025
  const minDate = new Date(2025, 4, 1); // May 1, 2025
  const maxDate = new Date(2025, 4, 31); // May 31, 2025
  const daysOfWeek = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  // --- Helper Functions ---
  function getStartOfWeek(date) {
    const dt = new Date(date);
    const day = dt.getDay(); // 0 = Sunday, 1 = Monday, ...
    const diff = dt.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday (0)
    return new Date(dt.setDate(diff));
  }

  function showToast(message, type = 'success') {
    if (!toastNotification) return;
    toastNotification.textContent = message;
    toastNotification.style.backgroundColor = type === 'success' ? 'var(--primary)' : 'var(--danger)';
    toastNotification.style.borderLeftColor = type === 'success' ? 'var(--primary-dark)' : '#dc2626';
    toastNotification.classList.add('show');
    if (toastNotification.timerId) {
      clearTimeout(toastNotification.timerId);
    }
    toastNotification.timerId = setTimeout(() => {
      toastNotification.classList.remove('show');
      toastNotification.timerId = null;
    }, 3000);
  }

  function displayErrorMessage(message) {
    const placeholder = document.getElementById('featurePlaceholder');
    if (placeholder) {
      placeholder.innerHTML = `

${message}`;
      placeholder.style.display = 'flex';
    }
  }

  // --- Core Logic ---
  function updateWeekDisplay() {
    if (!weekDisplay || !prevWeekBtn || !nextWeekBtn) return;
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const options = { month: 'short', day: 'numeric' };
    const startStr = currentWeekStart.toLocaleDateString('en-US', options);
    const endStr = weekEnd.toLocaleDateString('en-US', options);
    const year = currentWeekStart.getFullYear();
    weekDisplay.textContent = `${startStr} - ${endStr}, ${year}`;

    const dateCells = scheduleContainer.querySelectorAll('.day-date');
    const tempDate = new Date(currentWeekStart);
    dateCells.forEach((cell) => {
      const dateStr = tempDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      cell.textContent = dateStr;
      tempDate.setDate(tempDate.getDate() + 1);
    });

    const prevWeekTest = new Date(currentWeekStart);
    prevWeekTest.setDate(prevWeekTest.getDate() - 1);
    prevWeekBtn.disabled = prevWeekTest < minDate;

    const nextWeekTest = new Date(weekEnd);
    nextWeekTest.setDate(nextWeekTest.getDate() + 1);
    nextWeekBtn.disabled = nextWeekTest > maxDate;

    renderScheduleTable();
  }

  function renderScheduleTable() {
    if (!scheduleTableBody) return;
    scheduleTableBody.innerHTML = '';

    if (!employees || employees.length === 0) {
      scheduleTableBody.innerHTML = `

No employees found.`;
      return;
    }

    employees.forEach(employee => {
      const row = document.createElement('tr');
      const nameCell = document.createElement('td');
      nameCell.className = 'employee-name';
      nameCell.textContent = employee.name;
      row.appendChild(nameCell);

      daysOfWeek.forEach(day => {
        const cell = document.createElement('td');
        let shiftInfo = '---'; // Default value if no shift

        // Check if employee has shifts and if the shift exists for the current day
        if (employee.shifts && employee.shifts[day]) {
          shiftInfo = employee.shifts[day].text || 'Shift Details';
          cell.className = `shift shift-${employee.shifts[day].type}`; // Apply shift type as a class
        } else {
          cell.className = 'no-shift'; // Apply class for no shift
        }

        cell.textContent = shiftInfo; // Use shift information
        row.appendChild(cell);
      });

      scheduleTableBody.appendChild(row);
    });
  }

  // --- Event Listeners ---
  prevWeekBtn.addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    updateWeekDisplay();
  });

  nextWeekBtn.addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    updateWeekDisplay();
  });
  updateWeekDisplay();
}
