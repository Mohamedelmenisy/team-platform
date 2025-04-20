```javascript
/**
 * Initializes the Employee Scheduling feature logic.
 * This function is called by dashboard.js after the HTML and this script are loaded.
 * @param {object} currentUser - The currently logged-in user object.
 * @param {Array} teamMembers - An array of team member objects.
 */
function initializeEmployeeScheduling(currentUser, teamMembers) {
    console.log("Initializing Employee Schedule Feature...");
    const sectionContainer = document.getElementById('featureSections'); // Container where HTML was loaded

    if (!sectionContainer) {
        console.error("Schedule Init Error: Cannot find section container '#featureSections'");
        return;
    }

    // --- DOM Elements ---
    const weekDisplay = sectionContainer.querySelector('#weekDisplay');
    const scheduleTableBody = sectionContainer.querySelector('#scheduleTableBody');
    const scheduleThead = sectionContainer.querySelector('.schedule-table thead tr');
    const prevWeekBtn = sectionContainer.querySelector('#prevWeekBtn');
    const nextWeekBtn = sectionContainer.querySelector('#nextWeekBtn');
    const saveScheduleBtn = sectionContainer.querySelector('#saveScheduleBtn');
    const sendRemindersBtn = sectionContainer.querySelector('#sendRemindersBtn');
    const addNewEmployeeBtn = sectionContainer.querySelector('#addNewEmployeeBtn'); // New button

    // Shift Edit Modal Elements
    const editShiftModal = sectionContainer.querySelector('#editShiftModal');
    const editShiftForm = sectionContainer.querySelector('#editShiftForm');
    const shiftTypeSelect = sectionContainer.querySelector('#shiftTypeSelect'); // Corrected ID
    const editShiftEmployeeIdInput = sectionContainer.querySelector('#editShiftEmployeeId');
    const editShiftDayIndexInput = sectionContainer.querySelector('#editShiftDayIndex');
    const editShiftWeekOffsetInput = sectionContainer.querySelector('#editShiftWeekOffset');
    const editShiftModalTitle = sectionContainer.querySelector('#editShiftModalTitle');
    const shiftEmployeeNameDisplay = sectionContainer.querySelector('#shiftEmployeeNameDisplay'); // Display only field

    // Check for essential elements
    if (!weekDisplay || !scheduleTableBody || !scheduleThead || !prevWeekBtn || !nextWeekBtn || !editShiftModal || !editShiftForm || !shiftTypeSelect) {
        console.error("Schedule Init Error: Missing essential elements (week display, table, buttons, modal).");
        sectionContainer.innerHTML = `<div class='placeholder-content error'>Initialization Error: Required elements missing.</div>`;
        return;
    }

    // --- Feature State & Data ---
    let currentScheduleWeekOffset = 0; // 0 = current week, -1 = last week, 1 = next week
    let scheduleMinWeekOffset = 0; // To limit past navigation
    let mockScheduleData = {}; // Stores schedule shifts { 'employeeId-weekOffset-dayIndex': 'shiftType' }
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; // Use 3-letter abbreviations for header
    const fullDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]; // For modal titles, etc.

    // --- Helper Functions ---

    // Get Date object for Sunday of a given week offset
    function getWeekStartDate(weekOffset = 0) {
        const today = new Date();
        const currentDayOfWeek = today.getDay(); // 0=Sun, 1=Mon,...
        const diffToSunday = today.getDate() - currentDayOfWeek;
        const sunday = new Date(today);
        sunday.setDate(diffToSunday + (weekOffset * 7));
        sunday.setHours(0, 0, 0, 0); // Start of the day
        return sunday;
    }

     // Get all 7 dates (Sun-Sat) for a given week offset
    function getWeekDates(weekOffset = 0) {
        const sunday = getWeekStartDate(weekOffset);
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(sunday);
            date.setDate(sunday.getDate() + i);
            dates.push(date);
        }
        return dates;
    }

    // Format Date for Display (Example: Jan 1)
    function formatDateForDisplay(date) {
        if (!(date instanceof Date)) return '';
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }

    // Get Text Representation of Shift Type
    function getShiftText(type) {
        switch (type) {
            case 'morning': return '9A-5P'; // Shorter text
            case 'afternoon': return '12P-8P';
            case 'night': return '8P-4A';
            case 'off': return 'OFF';
            case 'sick': return 'Sick';
            case 'vacation': return 'Vacation';
            default: return 'N/A';
        }
    }

     // Find Toast function (assumes a global function exists from dashboard.js)
     const showToast = window.showToast || ((msg, type) => console.log(`Toast (${type}): ${msg}`));
     const showConfirmModal = window.showConfirmModal || ((title, msg, cb) => { if(confirm(`${title}\n${msg}`)) cb(); });

    // --- Core Rendering Logic ---
    function renderSchedule(weekOffset) {
        console.log(`Rendering schedule for offset: ${weekOffset}`);
        if (isNaN(weekOffset)) weekOffset = 0; // Default to current week if invalid

        const weekDates = getWeekDates(weekOffset); // Sun - Sat
        const start = weekDates[0];
        const end = weekDates[6];

        // Update Week Display in Controls
        weekDisplay.textContent = `${formatDateForDisplay(start)} - ${formatDateForDisplay(end)}`;

        // Update Navigation Button States
        // Example: Disable 'Prev' if it goes before a certain date/offset
        // prevWeekBtn.disabled = weekOffset <= someMinOffset;
        // nextWeekBtn.disabled = weekOffset >= someMaxOffset;
        // For now, let's just enable them
        prevWeekBtn.disabled = false;
        nextWeekBtn.disabled = false;


        // Render Table Header (Sun-Sat)
        scheduleThead.innerHTML = '<th>Employee</th>'; // Reset header days
        weekDates.forEach((date, index) => {
            scheduleThead.innerHTML += `
                 <th>
                    <div class="day-header">
                        <span class="day-name">${days[index]}</span>
                        <span class="day-date">${formatDateForDisplay(date)}</span>
                    </div>
                 </th>
             `;
        });

        // Render Table Body
        scheduleTableBody.innerHTML = ''; // Clear existing body
        if (!teamMembers || teamMembers.length === 0) {
            scheduleTableBody.innerHTML = `<tr><td colspan="8">No team members found.</td></tr>`;
            return;
        }

        teamMembers.forEach(employee => {
            const row = document.createElement('tr');
            // Employee Name Cell (Sticky)
            row.innerHTML = `<td class="employee-name">${employee.name || 'Unknown'}</td>`;

            // Day Cells (Sun - Sat)
            for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                const cell = document.createElement('td');
                const date = weekDates[dayIndex];
                const scheduleKey = `${employee.id}-${weekOffset}-${dayIndex}`;
                const isWeekend = dayIndex === 5 || dayIndex === 6; // Fri or Sat

                // Determine shift type: default to 'off' for weekends, get stored/random otherwise
                let shiftType;
                if (isWeekend) {
                    shiftType = 'off';
                } else {
                    // Generate random shift if not stored (for demo purposes)
                    if (!mockScheduleData[scheduleKey]) {
                        const shiftTypes = ['morning', 'afternoon', 'night', 'off', 'sick', 'vacation'];
                        mockScheduleData[scheduleKey] = shiftTypes[Math.floor(Math.random() * shiftTypes.length)];
                    }
                    shiftType = mockScheduleData[scheduleKey];
                }

                // Add specific weekend class for styling
                if (isWeekend) {
                    cell.classList.add('weekend-cell');
                }

                // Create Shift Div
                const shiftDiv = document.createElement('div');
                shiftDiv.classList.add('shift');
                if (isWeekend) {
                    shiftDiv.classList.add('shift-weekend-off'); // Special style for weekend OFF
                } else {
                    shiftDiv.classList.add(`shift-${shiftType.replace('_', '-')}`); // Standard shift style
                }
                shiftDiv.textContent = getShiftText(shiftType);

                // Make weekdays editable by admin/supervisor
                if (!isWeekend && ['admin', 'supervisor'].includes(currentUser.role)) {
                    shiftDiv.classList.add('editable');
                    shiftDiv.dataset.employeeId = employee.id;
                    shiftDiv.dataset.employeeName = employee.name; // Store name for modal title
                    shiftDiv.dataset.dayIndex = dayIndex;
                    shiftDiv.dataset.weekOffset = weekOffset;
                    shiftDiv.dataset.date = formatDateForDisplay(date); // Store formatted date
                    shiftDiv.title = `Edit ${employee.name}'s shift`;
                    shiftDiv.addEventListener('click', handleEditShiftClick);
                } else {
                    shiftDiv.title = shiftDiv.textContent; // Just show shift text as title
                }

                cell.appendChild(shiftDiv);
                row.appendChild(cell);
            }
            scheduleTableBody.appendChild(row);
        });
    }

    // --- Event Handlers ---
    function handleWeekChange(direction) {
        currentScheduleWeekOffset += direction;
        renderSchedule(currentScheduleWeekOffset);
    }

    function handleEditShiftClick(event) {
        const target = event.target.closest('.shift.editable'); // Ensure target is the shift div
        if (!target) return;

        const employeeId = target.dataset.employeeId;
        const employeeName = target.dataset.employeeName;
        const dayIndex = target.dataset.dayIndex;
        const weekOffset = target.dataset.weekOffset;
        const dateStr = target.dataset.date; // Get stored date string

        const scheduleKey = `${employeeId}-${weekOffset}-${dayIndex}`;
        const currentShift = mockScheduleData[scheduleKey] || 'morning'; // Default if somehow unset

        // Populate Modal
        editShiftEmployeeIdInput.value = employeeId;
        editShiftDayIndexInput.value = dayIndex;
        editShiftWeekOffsetInput.value = weekOffset;
        shiftTypeSelect.value = currentShift;
        shiftEmployeeNameDisplay.value = employeeName; // Show employee name (readonly)
        editShiftModalTitle.textContent = `Edit Shift for ${employeeName} on ${fullDays[dayIndex]} (${dateStr})`;

        // Show Modal
        editShiftModal?.classList.add('active');
    }

    function handleShiftFormSubmit(event) {
        event.preventDefault();
        const employeeId = editShiftEmployeeIdInput.value;
        const dayIndex = editShiftDayIndexInput.value;
        const weekOffset = editShiftWeekOffsetInput.value;
        const newShiftType = shiftTypeSelect.value;

        const scheduleKey = `${employeeId}-${weekOffset}-${dayIndex}`;
        mockScheduleData[scheduleKey] = newShiftType; // Update mock data

        renderSchedule(parseInt(weekOffset)); // Re-render the table for the current week
        editShiftModal?.classList.remove('active'); // Close modal
        showToast("Shift updated successfully.", "success");
    }

    function handleSaveSchedule() {
         showConfirmModal('Confirm Save', 'Save all current schedule changes?', () => {
             saveScheduleBtn.disabled = true;
             saveScheduleBtn.innerHTML = '<span class="spinner"></span> Saving...';
             console.log("Saving schedule data:", mockScheduleData);
             // Simulate API call
             setTimeout(() => {
                 showToast("Schedule saved successfully!", "success");
                 saveScheduleBtn.disabled = false;
                 saveScheduleBtn.innerHTML = '<i class="fas fa-save"></i> Save Schedule';
             }, 1500);
         }, 'btn-primary');
    }

     function handleSendReminders() {
        const btn = sendRemindersBtn; // Already referenced
        if (!btn) return;

        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Sending...';
        console.log("Preparing reminders for week offset:", currentScheduleWeekOffset);

        const weekDates = getWeekDates(currentScheduleWeekOffset);
        const weekStart = formatDateForDisplay(weekDates[0]);
        const weekEnd = formatDateForDisplay(weekDates[6]);
        const emailSubject = `Schedule Reminder: Week ${weekStart} - ${weekEnd}`;

        let emailsSentCount = 0;
        // Simulate sending email to each employee visible in the schedule
        teamMembers.forEach(employee => {
            let scheduleString = `Your schedule for week ${weekStart} - ${weekEnd}:\n`;
            let hasWork = false;
            for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                const scheduleKey = `${employee.id}-${currentScheduleWeekOffset}-${dayIndex}`;
                const shiftType = mockScheduleData[scheduleKey] || (dayIndex >= 5 ? 'off' : 'off'); // Default to OFF
                scheduleString += `- ${days[dayIndex]}: ${getShiftText(shiftType)}\n`;
                if (!['off', 'sick', 'vacation'].includes(shiftType)) {
                    hasWork = true;
                }
            }
            if (hasWork) { // Only send reminder if they have work shifts
                console.log(`--- Simulating Email to ${employee.email} ---`);
                console.log(`Subject: ${emailSubject}`);
                console.log(scheduleString);
                console.log(`-----------------------------------------`);
                emailsSentCount++;
            }
        });

        setTimeout(() => {
            showToast(`Simulated sending reminders to ${emailsSentCount} employees.`, "success");
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-envelope"></i> Send Reminders';
        }, 1000 + emailsSentCount * 50); // Simulate delay
     }

     function handleAddNewEmployee() {
        // Option 1: Navigate to Settings > Team Management
         showToast("Redirecting to Team Management in Settings to add employees...", "info");
         // Need access to the main dashboard's navigation function
         if (window.setActiveFeature) { // Check if global function exists
             window.setActiveFeature('settings', 'team');
         } else {
             console.error("Cannot navigate: setActiveFeature not found globally.");
         }

         // Option 2: Open a dedicated Add Employee Modal (if you create one)
         // const addEmpModal = document.getElementById('globalAddEmployeeModal'); // Find a global modal
         // if (addEmpModal) addEmpModal.classList.add('active');
     }


    // --- Initial Setup & Event Listeners ---

    // Role-based visibility for buttons
    const canManage = ['admin', 'supervisor'].includes(currentUser.role);
    if (saveScheduleBtn) saveScheduleBtn.style.display = canManage ? 'flex' : 'none';
    if (sendRemindersBtn) sendRemindersBtn.style.display = canManage ? 'flex' : 'none';
    if (addNewEmployeeBtn) addNewEmployeeBtn.style.display = canManage ? 'flex' : 'none';


    // Attach Event Listeners
    prevWeekBtn.addEventListener('click', () => handleWeekChange(-1));
    nextWeekBtn.addEventListener('click', () => handleWeekChange(1));
    if (saveScheduleBtn) saveScheduleBtn.addEventListener('click', handleSaveSchedule);
    if (sendRemindersBtn) sendRemindersBtn.addEventListener('click', handleSendReminders);
    if (addNewEmployeeBtn) addNewEmployeeBtn.addEventListener('click', handleAddNewEmployee);
    editShiftForm.addEventListener('submit', handleShiftFormSubmit);

    // Modal close buttons (using delegation on the section)
    sectionContainer.addEventListener('click', (event) => {
        if (event.target.matches('[data-close-modal]')) {
            const modal = event.target.closest('.modal');
            if (modal) modal.classList.remove('active');
        }
        // Close on backdrop click
        if (event.target.classList.contains('modal') && event.target.classList.contains('active')) {
             event.target.classList.remove('active');
        }
    });


    // Initial Render
    renderSchedule(currentScheduleWeekOffset);

    console.log("Employee Schedule Feature Initialized.");

} // === End of initializeEmployeeSchedule ===
