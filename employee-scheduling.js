```javascript
// employee-scheduling.js

// This script assumes utility functions like showConfirmModal, showToast, formatDateForDisplay
// AND GLOBAL STATE like mockScheduleData, currentScheduleWeekOffset, scheduleMinWeekOffset are available globally.

// *** MODIFICATION: Function now accepts userData and teamData as parameters ***
window.initializeEmployeeScheduleLogic = function(userData, teamData) {
    // *** Log received data ***
    console.log("initializeEmployeeScheduleLogic: Function execution started.", {
        receivedUserData: userData, // Log the received user object
        receivedTeamDataLength: teamData?.length // Log the length of the received team array
    });

    // *** MODIFICATION: Check received parameters instead of globals directly ***
    if (!userData || !teamData || !Array.isArray(teamData)) {
        console.error("initializeEmployeeScheduleLogic Error: Missing or invalid userData or teamData parameters.");
        const container = document.getElementById('featureSectionsContainer');
        if(container) container.innerHTML = '<div class="placeholder-content error-message" style="display: block;">Failed to initialize schedule: Invalid data received.</div>';
        return;
    }
    // Check for required global UTILITIES and STATE (still needed)
    if (typeof formatDateForDisplay === 'undefined' || typeof showConfirmModal === 'undefined' || typeof showToast === 'undefined' || typeof mockScheduleData === 'undefined' || typeof currentScheduleWeekOffset === 'undefined' || typeof scheduleMinWeekOffset === 'undefined') {
        console.error("initializeEmployeeScheduleLogic Error: Required global utility functions or state variables not found.");
        const container = document.getElementById('featureSectionsContainer');
         if(container) container.innerHTML = '<div class="placeholder-content error-message" style="display: block;">Failed to initialize schedule: Missing required utilities/state.</div>';
        return;
    }

    console.log("Initializing Employee Schedule Logic with received data...");

    // Use passed parameters and global state/utils
    const currentUserInfo = userData; // Use parameter
    const usersToSchedule = teamData; // Use parameter
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Get DOM elements (same as before)
    const weekDisplay = document.getElementById('weekDisplay');
    const scheduleTableBody = document.getElementById('scheduleTableBody');
    const scheduleThead = document.querySelector('.schedule-table thead tr');
    const prevWeekBtn = document.getElementById('prevWeekBtn');
    const nextWeekBtn = document.getElementById('nextWeekBtn');
    const saveScheduleBtn = document.getElementById('saveScheduleBtn');
    const sendRemindersBtn = document.getElementById('sendRemindersBtn');
    const editShiftModal = document.getElementById('editShiftModal');
    const editShiftForm = document.getElementById('editShiftForm');
    const shiftTypeSelect = document.getElementById('shiftType');
    const editShiftEmployeeIdInput = document.getElementById('editShiftEmployeeId');
    const editShiftDayIndexInput = document.getElementById('editShiftDayIndex');
    const editShiftWeekOffsetInput = document.getElementById('editShiftWeekOffset');
    const editShiftModalTitle = document.getElementById('editShiftModalTitle');

     // Safety checks for essential DOM elements
    if (!weekDisplay || !scheduleTableBody || !scheduleThead || !prevWeekBtn || !nextWeekBtn || !editShiftModal) {
        console.error("initializeEmployeeScheduleLogic Error: Core DOM elements for schedule not found.");
        const container = document.getElementById('featureSectionsContainer');
         if(container) container.innerHTML = '<div class="placeholder-content error-message" style="display: block;">Failed to initialize schedule: UI elements missing.</div>';
        return;
    }

    // --- Helper Functions (Keep as is - they don't depend on user/team data directly) ---
    function getWeekDates(weekOffset = 0) { /* ... Keep as is ... */ }
    function getShiftText(type) { /* ... Keep as is ... */ }
    // --- End Helper Functions ---


    // --- Core Rendering Logic (Use parameters and globals appropriately) ---
    function renderSchedule(weekOffset) {
         console.log(`Rendering schedule for week offset: ${weekOffset}`);
         if (isNaN(weekOffset)) { weekOffset = currentScheduleWeekOffset; } // Use GLOBAL offset state

         const weekDates = getWeekDates(weekOffset);
         const start = weekDates[0];
         const end = weekDates[6];
         if(weekDisplay) weekDisplay.textContent = `${formatDateForDisplay(start)} - ${formatDateForDisplay(end)}`; // Use GLOBAL util

         // Disable Prev button using GLOBAL state
         if (prevWeekBtn) { prevWeekBtn.disabled = weekOffset <= scheduleMinWeekOffset; }

         // Render Table Header
         if(scheduleThead) {
             scheduleThead.innerHTML = '<th>Employee</th>';
             weekDates.forEach((date, index) => { scheduleThead.innerHTML += `<th><div class="day-header"><span class="day-name" style="color: white;">${days[index]}</span><span class="day-date">${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}</span></div></th>`; });
         } else { console.error("renderSchedule: scheduleThead element not found!"); }

         // Render Table Body
         if(scheduleTableBody) {
             scheduleTableBody.innerHTML = '';
             // *** MODIFICATION: Use passed teamData parameter ***
             if (usersToSchedule.length === 0) {
                 scheduleTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--gray);">No employees found.</td></tr>`;
                 return;
             }

             // *** MODIFICATION: Iterate over passed teamData ***
             usersToSchedule.forEach(employee => {
                 const row = document.createElement('tr');
                 row.innerHTML = `<td class="employee-name">${employee.name}</td>`;

                 for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                     const cell = document.createElement('td');
                     const scheduleKey = `${employee.id}-${weekOffset}-${dayIndex}`;
                     const isWeekend = dayIndex === 5 || dayIndex === 6;
                     // *** MODIFICATION: Use passed userData parameter for role check ***
                     let isEditable = currentUserInfo && currentUserInfo.role === 'admin' && !isWeekend;

                     let shiftType;
                     if (isWeekend) {
                         shiftType = 'off';
                         mockScheduleData[scheduleKey] = 'off'; // Still update GLOBAL state
                         cell.classList.add('weekend-cell');
                     } else {
                          // Still use GLOBAL state for schedule data
                         if (!mockScheduleData[scheduleKey]) {
                             const shiftTypes = ['morning', 'afternoon', 'night', 'off', 'sick', 'vacation'];
                             const randomType = shiftTypes[Math.floor(Math.random() * shiftTypes.length)];
                             mockScheduleData[scheduleKey] = randomType;
                         }
                         shiftType = mockScheduleData[scheduleKey];
                     }

                     const shiftDiv = document.createElement('div');
                     shiftDiv.classList.add('shift');
                     if (isWeekend) { shiftDiv.classList.add('shift-weekend-off'); }
                     else { shiftDiv.classList.add(`shift-${shiftType.replace('_', '-')}`); }
                     shiftDiv.textContent = getShiftText(shiftType);

                      if (isEditable) {
                         shiftDiv.classList.add('editable');
                         shiftDiv.dataset.employeeId = employee.id;
                         shiftDiv.dataset.employeeName = employee.name; // Use name from loop
                         shiftDiv.dataset.dayIndex = dayIndex;
                         shiftDiv.dataset.weekOffset = weekOffset;
                         shiftDiv.dataset.date = formatDateForDisplay(weekDates[dayIndex]); // Use GLOBAL util
                         shiftDiv.title = `Click to edit ${employee.name}'s shift on ${days[dayIndex]}`;
                     } else if (isWeekend) { shiftDiv.title = "Weekend Off"; }

                     cell.appendChild(shiftDiv);
                     row.appendChild(cell);
                 }
                 scheduleTableBody.appendChild(row);
             });
        } else { console.error("renderSchedule: scheduleTableBody element not found!"); }
    }
    // --- End Rendering Logic ---


    // --- Event Handlers (Use parameters and globals appropriately) ---
    function handleEditShiftClick(targetShiftDiv) { /* ... Keep as is, uses dataset ... */ }

    function handleSendReminders() {
        // Use passed teamData
        if (typeof showConfirmModal === 'undefined' || typeof showToast === 'undefined' || !usersToSchedule || typeof mockScheduleData === 'undefined' || typeof formatDateForDisplay === 'undefined' || typeof currentScheduleWeekOffset === 'undefined') {
            console.error("handleSendReminders: Missing global utilities or data.");
            return;
        }
        const btn = document.getElementById('sendRemindersBtn');
        if (!btn) { console.error("handleSendReminders: Send Reminders button not found!"); return; }

        showConfirmModal('Send Reminders', `Send reminders for week ${weekDisplay?.textContent || ''} to ${usersToSchedule.length} employees?`, () => {
            btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Sending...';
            console.log("Preparing schedule reminders...");
             const weekDates = getWeekDates(currentScheduleWeekOffset); // Use GLOBAL offset
             const weekStart = formatDateForDisplay(weekDates[0]);
             const weekEnd = formatDateForDisplay(weekDates[6]);
             const emailSubject = `Schedule Reminder: ${weekStart} - ${weekEnd}`;
             const emailFooter = "\n\nRegards,\nTeamFlow System";
             const fullDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
             let emailsSent = 0, emailsFailed = 0;

             // *** MODIFICATION: Iterate over passed teamData ***
             usersToSchedule.forEach((user) => {
                 let userScheduleInfo = `Your schedule for the week starting ${weekStart}:\n`;
                 for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                     const scheduleKey = `${user.id}-${currentScheduleWeekOffset}-${dayIndex}`;
                     const shiftType = mockScheduleData[scheduleKey] || 'off'; // Use GLOBAL data
                     userScheduleInfo += `- ${fullDays[dayIndex]} (${formatDateForDisplay(weekDates[dayIndex])}): ${getShiftText(shiftType)}\n`;
                 }
                 const emailBody = `Hi ${user.name.split(' ')[0]},\n\n${userScheduleInfo}\nPlease ensure you log your times accurately.${emailFooter}`;
                 console.log(`--- Sending to: ${user.email} ---`); // Log sending simulation
                 const success = Math.random() > 0.1; if (success) emailsSent++; else emailsFailed++;
             });

            setTimeout(() => {
                if (emailsFailed > 0) { showToast(`Sent ${emailsSent} reminders. Failed: ${emailsFailed}.`, "error"); }
                else { showToast(`Successfully sent ${emailsSent} schedule reminders!`, "success"); }
                btn.disabled = false; btn.innerHTML = '<i class="fas fa-envelope"></i> Send Reminders';
            }, 1000 + usersToSchedule.length * 50);
        }, 'btn-primary');
    }

    function handleShiftEditFormSubmit(event) { /* ... Keep as is, uses modal inputs and GLOBAL mockScheduleData ... */ }

    // --- End Event Handlers ---


    // --- Attach Event Listeners (Use passed currentUserInfo for role check) ---
    console.log("Attaching schedule event listeners...");
    if (scheduleTableBody) { scheduleTableBody.addEventListener('click', function(event) { const editableShiftDiv = event.target.closest('.shift.editable'); if (editableShiftDiv) { handleEditShiftClick(editableShiftDiv); } }); }
    else { console.error("Cannot attach listener: scheduleTableBody not found!"); }

    if (prevWeekBtn) { prevWeekBtn.addEventListener('click', () => { if (currentScheduleWeekOffset > scheduleMinWeekOffset) { currentScheduleWeekOffset--; renderSchedule(currentScheduleWeekOffset); } }); } // Modify GLOBAL offset
    else { console.error("Cannot attach listener: prevWeekBtn not found!"); }
    if (nextWeekBtn) { nextWeekBtn.addEventListener('click', () => { currentScheduleWeekOffset++; renderSchedule(currentScheduleWeekOffset); }); } // Modify GLOBAL offset
    else { console.error("Cannot attach listener: nextWeekBtn not found!"); }

    // *** MODIFICATION: Use passed userData for role check ***
    if (saveScheduleBtn && currentUserInfo && currentUserInfo.role === 'admin') {
        saveScheduleBtn.style.display = 'inline-flex';
        saveScheduleBtn.addEventListener('click', () => { /* ... save logic using GLOBAL mockScheduleData ... */ });
    } else if (saveScheduleBtn) { saveScheduleBtn.style.display = 'none'; } // Hide if no permission

    if (sendRemindersBtn && currentUserInfo && currentUserInfo.role === 'admin') {
         sendRemindersBtn.style.display = 'inline-flex';
        sendRemindersBtn.addEventListener('click', handleSendReminders);
    } else if (sendRemindersBtn) { sendRemindersBtn.style.display = 'none'; } // Hide if no permission

    if (editShiftModal) { /* ... Keep modal listeners as is ... */ }
    else { console.error("Cannot attach modal listeners: editShiftModal not found!"); }
     if (editShiftForm) { editShiftForm.addEventListener('submit', handleShiftEditFormSubmit); }
     else { console.error("Cannot attach form listener: editShiftForm not found!"); }

    // --- Initial Render ---
    renderSchedule(currentScheduleWeekOffset); // Render with the correct GLOBAL offset
    console.log("Employee schedule initialized and rendered.");

}; // *** END of window.initializeEmployeeScheduleLogic definition ***

// *** Log to confirm script parsing is complete ***
console.log("employee-scheduling.js: Script parsed, initializeEmployeeScheduleLogic assigned to window.");
