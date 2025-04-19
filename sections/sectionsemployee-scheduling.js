// Function signature now accepts the container element first
function initializeEmployeeSchedule(containerElement, currentUserFromDashboard, teamMembersFromDashboard) {
    // --- START: Input Validation & Logging ---
    console.log("Initializing Employee Schedule inside container:", containerElement);
    if (!containerElement) {
        console.error("initializeEmployeeSchedule: Invalid or null containerElement received.");
        const generalPlaceholder = document.getElementById('featurePlaceholder');
        if (generalPlaceholder) {
           generalPlaceholder.querySelector('#featureTitle').textContent = 'Initialization Error';
           generalPlaceholder.querySelector('#featureDescription').textContent = 'Failed to initialize: Container element missing.';
           generalPlaceholder.querySelector('.loading-indicator').style.display = 'none';
           generalPlaceholder.querySelector('.error-message').style.display = 'block';
           generalPlaceholder.style.display = 'flex';
        }
        return; // Stop execution
    }
    if (!currentUserFromDashboard || typeof currentUserFromDashboard !== 'object') {
        console.error("initializeEmployeeSchedule: Invalid currentUserFromDashboard received.", currentUserFromDashboard);
        containerElement.innerHTML = `<div class="placeholder-content error-message" style="display:flex; flex-direction:column; align-items:center;"><h2>Error</h2><p>Failed to initialize schedule: Invalid user data.</p></div>`;
        return; // Stop execution
    }
    if (!Array.isArray(teamMembersFromDashboard)) {
        console.error("initializeEmployeeSchedule: Invalid teamMembersFromDashboard received.", teamMembersFromDashboard);
        containerElement.innerHTML = `<div class="placeholder-content error-message" style="display:flex; flex-direction:column; align-items:center;"><h2>Error</h2><p>Failed to initialize schedule: Invalid team member data.</p></div>`;
        return; // Stop execution
    }
    console.log("Received Current User:", JSON.parse(JSON.stringify(currentUserFromDashboard)));
    console.log("Received Team Members:", JSON.parse(JSON.stringify(teamMembersFromDashboard)));
    // --- END: Input Validation & Logging ---


    // --- Use data passed from dashboard ---
    const currentUser = currentUserFromDashboard;
    let employees = teamMembersFromDashboard;

    // --- DOM Elements (scoped to the passed containerElement) ---
    const scheduleContainer = containerElement.querySelector('.schedule-container');
    const employeeModal = containerElement.querySelector('#employeeModal');
    const shiftModal = containerElement.querySelector('#shiftModal');
    const addEmployeeBtn = containerElement.querySelector('#addEmployeeBtn');
    const sendRemindersBtn = containerElement.querySelector('#sendRemindersBtn');
    const closeEmployeeModal = containerElement.querySelector('#closeEmployeeModal');
    const closeShiftModal = containerElement.querySelector('#closeShiftModal');
    const cancelEmployeeBtn = containerElement.querySelector('#cancelEmployeeBtn');
    const cancelShiftBtn = containerElement.querySelector('#cancelShiftBtn');
    const employeeForm = containerElement.querySelector('#employeeForm');
    const shiftForm = containerElement.querySelector('#shiftForm');
    const shiftTypeSelect = containerElement.querySelector('#shiftType');
    const customShiftGroup = containerElement.querySelector('#customShiftGroup');
    const deleteShiftBtn = containerElement.querySelector('#deleteShiftBtn');
    const prevWeekBtn = containerElement.querySelector('#prevWeekBtn');
    const nextWeekBtn = containerElement.querySelector('#nextWeekBtn');
    const weekDisplay = containerElement.querySelector('#weekDisplay');
    const saveScheduleBtn = containerElement.querySelector('#saveScheduleBtn');
    const scheduleTableBody = containerElement.querySelector('#scheduleTableBody');
    const shiftDateInput = containerElement.querySelector('#shiftDate');
    const toastNotification = containerElement.querySelector('#toastNotification');

     // Check if essential elements for core functionality were found
     const essentialElements = { scheduleContainer, prevWeekBtn, nextWeekBtn, weekDisplay, scheduleTableBody };
     let missingElement = false;
     for (const key in essentialElements) {
         if (!essentialElements[key]) {
             console.error(`initializeEmployeeSchedule: Essential element with Selector '${key}' not found within the container.`);
             missingElement = true;
         }
     }
     // Check optional modal/form elements needed for interaction
     const modalElements = { employeeModal, shiftModal, addEmployeeBtn, sendRemindersBtn, saveScheduleBtn, toastNotification };
      for (const key in modalElements) {
         if (!modalElements[key]) {
             console.warn(`initializeEmployeeSchedule: Optional element with ID/Selector '${key}' not found. Some features might be disabled.`);
         }
     }
     if (missingElement) {
          containerElement.innerHTML = `<div class="placeholder-content error-message" style="display:flex; flex-direction:column; align-items:center;"><h2>Error</h2><p>Failed to initialize schedule: Core table elements missing.</p></div>`;
          return; // Stop initialization if critical elements are missing
     }

    // --- State & Configuration ---
    let currentWeekStart = getStartOfWeek(new Date(2025, 4, 5));
    const minDate = new Date(2025, 4, 1);
    const maxDate = new Date(2025, 4, 31);
    const daysOfWeek = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    let scheduleData = {}; // Simulate data store { "empId_day": { type: "...", text: "..." } }
    // Simulate initial data based on the hardcoded example from original file
    scheduleData['1_mon'] = { type: 'morning', text: '9AM-5PM' };
    scheduleData['1_tue'] = { type: 'morning', text: '9AM-5PM' };
    scheduleData['1_wed'] = { type: 'afternoon', text: '12PM-8PM' };
    scheduleData['1_thu'] = { type: 'morning', text: '9AM-5PM' };
    scheduleData['1_fri'] = { type: 'day-off', text: 'OFF' };
    scheduleData['1_sat'] = { type: 'night', text: '5PM-1AM' };
    scheduleData['1_sun'] = { type: 'night', text: '5PM-1AM' };
    scheduleData['2_mon'] = { type: 'afternoon', text: '12PM-8PM' };
    scheduleData['2_tue'] = { type: 'morning', text: '9AM-5PM' };
    scheduleData['2_wed'] = { type: 'morning', text: '9AM-5PM' };
    scheduleData['2_thu'] = { type: 'afternoon', text: '12PM-8PM' };
    scheduleData['2_fri'] = { type: 'morning', text: '9AM-5PM' };
    scheduleData['2_sat'] = { type: 'day-off', text: 'OFF' };
    scheduleData['2_sun'] = { type: 'day-off', text: 'OFF' };
    scheduleData['3_mon'] = { type: 'night', text: '5PM-1AM' };
    scheduleData['3_tue'] = { type: 'night', text: '5PM-1AM' };
    scheduleData['3_wed'] = { type: 'day-off', text: 'OFF' };
    scheduleData['3_thu'] = { type: 'morning', text: '9AM-5PM' };
    scheduleData['3_fri'] = { type: 'afternoon', text: '12PM-8PM' };
    scheduleData['3_sat'] = { type: 'morning', text: '9AM-5PM' };
    scheduleData['3_sun'] = { type: 'sick-leave', text: 'SICK' };
    scheduleData['4_mon'] = { type: 'vacation', text: 'VAC' };
    scheduleData['4_tue'] = { type: 'vacation', text: 'VAC' };
    scheduleData['4_wed'] = { type: 'morning', text: '9AM-5PM' };
    scheduleData['4_thu'] = { type: 'night', text: '5PM-1AM' };
    scheduleData['4_fri'] = { type: 'night', text: '5PM-1AM' };
    scheduleData['4_sat'] = { type: 'day-off', text: 'OFF' };
    scheduleData['4_sun'] = { type: 'morning', text: '9AM-5PM' };

    // --- Helper Functions ---
    function getStartOfWeek(date) {
        const dt = new Date(date); const day = dt.getDay();
        const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(dt.setDate(diff));
    }
    function showToast(message, type = 'success') {
        if (!toastNotification) { console.warn("Toast element missing."); alert(message); return; }
        toastNotification.textContent = message;
        toastNotification.style.backgroundColor = type === 'success' ? 'var(--success)' : 'var(--danger)';
        toastNotification.style.borderLeftColor = type === 'success' ? '#0d9f6e' : '#dc2626';
        toastNotification.classList.add('show');
        if (toastNotification.timerId) clearTimeout(toastNotification.timerId);
        toastNotification.timerId = setTimeout(() => { toastNotification.classList.remove('show'); toastNotification.timerId = null; }, 3000);
    }

    // --- Core Logic ---
    function updateWeekDisplay() {
        if (!weekDisplay || !prevWeekBtn || !nextWeekBtn) return;
        const weekEnd = new Date(currentWeekStart); weekEnd.setDate(weekEnd.getDate() + 6);
        const options = { month: 'short', day: 'numeric' };
        const startStr = currentWeekStart.toLocaleDateString('en-US', options); const endStr = weekEnd.toLocaleDateString('en-US', options); const year = currentWeekStart.getFullYear();
        weekDisplay.textContent = `${startStr} - ${endStr}, ${year}`;
        const dateCells = containerElement.querySelectorAll('.day-date'); const tempDate = new Date(currentWeekStart);
        dateCells.forEach((cell) => { const dateStr = tempDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); cell.textContent = dateStr; tempDate.setDate(tempDate.getDate() + 1); });
        const prevWeekTest = new Date(currentWeekStart); prevWeekTest.setDate(prevWeekTest.getDate() - 1); prevWeekBtn.disabled = prevWeekTest < minDate;
        const nextWeekTest = new Date(weekEnd); nextWeekTest.setDate(nextWeekTest.getDate() + 1); nextWeekBtn.disabled = nextWeekTest > maxDate;
        renderScheduleTable();
    }
    function renderScheduleTable() {
        if (!scheduleTableBody) return; scheduleTableBody.innerHTML = '';
        if (!employees || employees.length === 0) { scheduleTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--gray);">No employees found.</td></tr>`; return; }
        const canEdit = currentUser.role === 'admin' || currentUser.role === 'supervisor';
        employees.forEach(employee => {
            const row = document.createElement('tr'); row.dataset.employeeId = employee.id;
            const nameCell = document.createElement('td'); nameCell.className = 'employee-name'; nameCell.textContent = employee.name; row.appendChild(nameCell);
            daysOfWeek.forEach((day) => {
                const dayCell = document.createElement('td'); dayCell.className = 'admin-controls'; dayCell.dataset.day = day; dayCell.dataset.employeeId = employee.id;
                const shiftKey = `${employee.id}_${day}`; const currentShift = scheduleData[shiftKey];
                if (currentShift) {
                    const shiftDiv = document.createElement('div'); let shiftClass = '';
                    if (['morning', 'afternoon', 'night', 'day-off', 'sick-leave', 'vacation'].includes(currentShift.type)) { shiftClass = `shift-${currentShift.type}`; } else { shiftClass = 'shift-morning'; }
                    shiftDiv.className = `shift ${shiftClass}`; shiftDiv.textContent = currentShift.text; dayCell.appendChild(shiftDiv);
                }
                if (canEdit) {
                    const editSpan = document.createElement('span'); editSpan.className = 'edit-shift'; editSpan.textContent = '(edit)'; editSpan.dataset.emp = employee.id; editSpan.dataset.day = day;
                    editSpan.style.display = 'block'; editSpan.addEventListener('click', handleEditShiftClick); dayCell.appendChild(editSpan);
                }
                row.appendChild(dayCell);
            });
            scheduleTableBody.appendChild(row);
        });
        applyRoleBasedStyles();
    }
    function applyRoleBasedStyles() {
        const canManage = currentUser.role === 'admin' || currentUser.role === 'supervisor';
        if (addEmployeeBtn) addEmployeeBtn.style.display = canManage ? 'flex' : 'none';
        if (sendRemindersBtn) sendRemindersBtn.style.display = canManage ? 'flex' : 'none';
        if (saveScheduleBtn) saveScheduleBtn.style.display = canManage ? 'flex' : 'none';
    }

    // --- Event Handlers ---
    function openModal(modal) { if (modal) modal.style.display = 'flex'; }
    function closeModal(modal) { if (modal) modal.style.display = 'none'; }
    if (addEmployeeBtn) { addEmployeeBtn.addEventListener('click', () => { if(employeeForm) employeeForm.reset(); openModal(employeeModal); }); }
    if (closeEmployeeModal) closeEmployeeModal.addEventListener('click', () => closeModal(employeeModal));
    if (cancelEmployeeBtn) cancelEmployeeBtn.addEventListener('click', () => closeModal(employeeModal));
    if (employeeForm) {
         employeeForm.addEventListener('submit', (e) => {
            e.preventDefault(); const name = containerElement.querySelector('#empName').value; const email = containerElement.querySelector('#empEmail').value;
            const newEmployee = { id: Date.now(), name: name, email: email, role: containerElement.querySelector('#empRole').value };
            employees.push(newEmployee); renderScheduleTable(); closeModal(employeeModal); showToast(`Employee ${name} added locally.`);
            // Consider dispatching event to update dashboard's main list
            // containerElement.dispatchEvent(new CustomEvent('teamMemberAdded', { detail: newEmployee }));
         });
     }
    function handleEditShiftClick(event) {
        if (!shiftModal || !shiftForm || !shiftDateInput || !shiftTypeSelect || !customShiftGroup) { showToast("Edit components missing.", "danger"); return; }
        const span = event.target; const empId = parseInt(span.dataset.emp); const day = span.dataset.day;
        const employee = employees.find(e => e.id == empId); const dayIndex = daysOfWeek.indexOf(day);
        if (employee && dayIndex !== -1) {
            shiftForm.reset(); customShiftGroup.style.display = 'none';
            containerElement.querySelector('#shiftEmployee').value = employee.name; // Use containerElement.querySelector
            const date = new Date(currentWeekStart); date.setDate(date.getDate() + dayIndex);
            const year = date.getFullYear(); const month = (date.getMonth() + 1).toString().padStart(2, '0'); const dayOfMonth = date.getDate().toString().padStart(2, '0');
            const formattedDate = `${year}-${month}-${dayOfMonth}`; shiftDateInput.value = formattedDate;
            const minFormatted = minDate.toISOString().split('T')[0]; const maxFormatted = maxDate.toISOString().split('T')[0];
            shiftDateInput.min = minFormatted; shiftDateInput.max = maxFormatted;
            const shiftKey = `${empId}_${day}`; const currentShift = scheduleData[shiftKey];
            if (currentShift) {
                 shiftTypeSelect.value = currentShift.type;
                 if (currentShift.type === 'custom') { containerElement.querySelector('#customShift').value = currentShift.text; customShiftGroup.style.display = 'block'; }
            } else { shiftTypeSelect.value = 'morning'; }
            shiftModal.dataset.editingEmpId = empId; shiftModal.dataset.editingDay = day; openModal(shiftModal);
        } else { console.error("Edit error: Emp/Day not found.", { empId, day }); showToast("Error preparing edit.", "danger"); }
    }
    if (closeShiftModal) closeShiftModal.addEventListener('click', () => closeModal(shiftModal));
    if (cancelShiftBtn) cancelShiftBtn.addEventListener('click', () => closeModal(shiftModal));
    if (shiftTypeSelect) { shiftTypeSelect.addEventListener('change', function() { if (customShiftGroup) customShiftGroup.style.display = this.value === 'custom' ? 'block' : 'none'; }); }
    if (shiftForm) {
        shiftForm.addEventListener('submit', (e) => {
            e.preventDefault(); const empId = shiftModal.dataset.editingEmpId; const day = shiftModal.dataset.editingDay;
            const shiftTypeValue = shiftTypeSelect.value; const customShiftText = containerElement.querySelector('#customShift').value;
            if (!empId || !day) { console.error("Save error: Missing data."); showToast("Error saving.", "danger"); return; }
            const shiftKey = `${empId}_${day}`; let shiftText = ''; let shiftClass = `shift-${shiftTypeValue}`;
            switch(shiftTypeValue) {
                case 'morning': shiftText = '9AM-5PM'; break; case 'afternoon': shiftText = '12PM-8PM'; break; case 'night': shiftText = '5PM-1AM'; break;
                case 'day-off': shiftText = 'OFF'; break; case 'sick-leave': shiftText = 'SICK'; break; case 'vacation': shiftText = 'VAC'; break;
                case 'custom': shiftText = customShiftText || 'Custom'; shiftClass = 'shift-morning'; break; default: shiftText = 'N/A'; shiftClass = '';
            }
            scheduleData[shiftKey] = { type: shiftTypeValue, text: shiftText };
            const cellToUpdate = scheduleTableBody.querySelector(`tr[data-employee-id="${empId}"] td[data-day="${day}"]`);
            if (cellToUpdate) {
                 const existingShiftDiv = cellToUpdate.querySelector('.shift'); if (existingShiftDiv) existingShiftDiv.remove();
                 const newShiftDiv = document.createElement('div'); newShiftDiv.className = `shift ${shiftClass}`; newShiftDiv.textContent = shiftText;
                 const editLink = cellToUpdate.querySelector('.edit-shift'); cellToUpdate.insertBefore(newShiftDiv, editLink);
            }
            closeModal(shiftModal); const employeeName = containerElement.querySelector('#shiftEmployee').value; showToast(`Shift for ${employeeName} updated.`);
        });
    }
    if (deleteShiftBtn) {
        deleteShiftBtn.addEventListener('click', () => {
            const empId = shiftModal.dataset.editingEmpId; const day = shiftModal.dataset.editingDay; const employeeName = containerElement.querySelector('#shiftEmployee').value;
            if (!empId || !day) { console.error("Delete error: Missing data."); showToast("Error deleting.", "danger"); return; }
            const shiftKey = `${empId}_${day}`; delete scheduleData[shiftKey];
            const cellToUpdate = scheduleTableBody.querySelector(`tr[data-employee-id="${empId}"] td[data-day="${day}"]`);
            if (cellToUpdate) { const shiftDiv = cellToUpdate.querySelector('.shift'); if (shiftDiv) { shiftDiv.remove(); showToast(`Shift for ${employeeName} deleted.`, 'warning'); } }
            closeModal(shiftModal);
        });
    }
    if (prevWeekBtn) { prevWeekBtn.addEventListener('click', () => { currentWeekStart.setDate(currentWeekStart.getDate() - 7); updateWeekDisplay(); }); }
    if (nextWeekBtn) { nextWeekBtn.addEventListener('click', () => { currentWeekStart.setDate(currentWeekStart.getDate() + 7); updateWeekDisplay(); }); }
    if (saveScheduleBtn) { saveScheduleBtn.addEventListener('click', () => { console.log("Simulating save:", scheduleData); showToast('Schedule saved (simulated)!'); }); }
    if (sendRemindersBtn) { sendRemindersBtn.addEventListener('click', () => {
        const subject = encodeURIComponent(`Schedule Reminder: ${weekDisplay.textContent}`); let body = `Team,\n\nSchedule for the week:\n\n`;
        employees.forEach(emp => { body += `${emp.name}:\n`; daysOfWeek.forEach(day => { const shift = scheduleData[`${emp.id}_${day}`]; body += `  ${day.toUpperCase()}: ${shift ? shift.text : '--'}\n`; }); body += '\n'; });
        body += `\nBest,\n${currentUser.name}`; const emails = employees.map(e => e.email).filter(Boolean).join(',');
        if (emails) { window.open(`mailto:?bcc=${emails}&subject=${subject}&body=${encodeURIComponent(body)}`, '_blank'); showToast('Reminder email prepared.'); } else { showToast('No emails found.', 'warning'); }
     }); }
     window.addEventListener('click', function(event) {
         if (employeeModal && event.target === employeeModal) { closeModal(employeeModal); }
         if (shiftModal && event.target === shiftModal) { closeModal(shiftModal); }
     });

    // --- Initial Setup Calls ---
    applyRoleBasedStyles();
    updateWeekDisplay();
    const generalPlaceholder = document.getElementById('featurePlaceholder');
    if (generalPlaceholder) generalPlaceholder.style.display = 'none';
    console.log("Employee Schedule Initialized Successfully.");
}
