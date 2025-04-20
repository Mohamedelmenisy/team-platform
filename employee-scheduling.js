// employee-scheduling.js

// This script assumes global variables like MOCK_USERS, mockScheduleData, currentUser,
// currentScheduleWeekOffset, scheduleMinWeekOffset, and utility functions
// (formatDateForDisplay, showConfirmModal, showToast) are defined in the main HTML script.

// *** MODIFICATION: Explicitly assign function to window object ***
window.initializeEmployeeScheduleLogic = function() {
    // *** ADDED: Log to confirm function execution starts ***
    console.log("initializeEmployeeScheduleLogic: Function execution started.");

    // Check if required globals exist (important check)
    if (typeof currentUser === 'undefined' || typeof MOCK_USERS === 'undefined' || typeof mockScheduleData === 'undefined') {
        console.error("initializeEmployeeScheduleLogic Error: Required global variables not found.");
        const container = document.getElementById('featureSectionsContainer');
        if(container) container.innerHTML = '<div class="placeholder-content error-message" style="display: block;">Failed to initialize schedule: Missing required data.</div>';
        return;
    }
    if (typeof formatDateForDisplay === 'undefined' || typeof showConfirmModal === 'undefined' || typeof showToast === 'undefined') {
        console.error("initializeEmployeeScheduleLogic Error: Required global utility functions not found.");
        const container = document.getElementById('featureSectionsContainer');
         if(container) container.innerHTML = '<div class="placeholder-content error-message" style="display: block;">Failed to initialize schedule: Missing required utility functions.</div>';
        return;
    }


    console.log("Initializing Employee Schedule Logic...");

    // Define schedule-specific constants/variables
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Get DOM elements within the loaded schedule HTML
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
        console.error("initializeEmployeeScheduleLogic Error: Core DOM elements for schedule not found within loaded HTML.");
         const container = document.getElementById('featureSectionsContainer');
         if(container) container.innerHTML = '<div class="placeholder-content error-message" style="display: block;">Failed to initialize schedule: UI elements missing.</div>';
        return;
    }

    // --- Helper Functions (Copied from original main script - REQUIRED here if not global) ---
    // Assuming formatDateForDisplay IS global, so no need to copy.
    // If it wasn't global, you would copy it here.

    function getWeekDates(weekOffset = 0) {
        const baseDate = new Date();
        const startOfWeek = new Date(baseDate);
        const dayOfWeek = baseDate.getDay(); // 0=Sun
        const diff = baseDate.getDate() - dayOfWeek;
        startOfWeek.setDate(diff + (weekOffset * 7));
        startOfWeek.setHours(0,0,0,0);

        const dates = [];
        for (let i = 0; i < 7; i++) { // Get all 7 dates (Sun-Sat)
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            dates.push(date);
        }
        return dates;
    }

    function getShiftText(type) {
        switch (type) {
            case 'morning': return '9AM-5PM';
            case 'afternoon': return '12PM-8PM';
            case 'night': return '8PM-4AM';
            case 'off': return 'OFF';
            case 'sick': return 'Sick';
            case 'vacation': return 'Vacation';
            default: return 'N/A';
        }
    }
    // --- End Helper Functions ---


    // --- Core Rendering Logic ---
    function renderSchedule(weekOffset) {
         console.log(`Rendering schedule for week offset: ${weekOffset}`);
         if (isNaN(weekOffset)) {
             console.error("Invalid weekOffset provided to renderSchedule:", weekOffset);
             weekOffset = currentScheduleWeekOffset; // Fallback to global current offset
         }
         // Access global state/utils directly
         if (typeof formatDateForDisplay === 'undefined' || typeof MOCK_USERS === 'undefined' || typeof mockScheduleData === 'undefined' || typeof scheduleMinWeekOffset === 'undefined') {
            console.error("Cannot render schedule: Missing global utilities or data.");
            return;
         }

         const weekDates = getWeekDates(weekOffset); // Use local helper
         const start = weekDates[0];
         const end = weekDates[6];
         if(weekDisplay) weekDisplay.textContent = `${formatDateForDisplay(start)} - ${formatDateForDisplay(end)}`;

         // Disable Prev button if at or before May 1st, 2025 week
         if (prevWeekBtn) {
            prevWeekBtn.disabled = weekOffset <= scheduleMinWeekOffset; // Use global min offset
         }


         // Render Table Header (Sun-Sat)
         if(scheduleThead) {
             scheduleThead.innerHTML = '<th>Employee</th>'; // Reset header days
             weekDates.forEach((date, index) => {
                 scheduleThead.innerHTML += `
                     <th>
                        <div class="day-header">
                            <span class="day-name" style="color: white;">${days[index]}</span>
                            <span class="day-date">${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}</span>
                        </div>
                     </th>
                 `;
             });
         } else {
            console.error("renderSchedule: scheduleThead element not found!");
         }

         // Render Table Body (Sun-Sat)
         if(scheduleTableBody) {
             scheduleTableBody.innerHTML = ''; // Clear body
             if (MOCK_USERS.length === 0) {
                 scheduleTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--gray);">No employees found.</td></tr>`; // Colspan = 8
                 return;
             }

             MOCK_USERS.forEach(employee => {
                 const row = document.createElement('tr');
                 row.innerHTML = `<td class="employee-name">${employee.name}</td>`;

                 for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                     const cell = document.createElement('td');
                     const scheduleKey = `${employee.id}-${weekOffset}-${dayIndex}`;
                     const isWeekend = dayIndex === 5 || dayIndex === 6; // Fri/Sat for SA context

                     let shiftType;
                     // Use global currentUser
                     let isEditable = currentUser && currentUser.role === 'admin' && !isWeekend;

                     if (isWeekend) {
                         shiftType = 'off';
                         mockScheduleData[scheduleKey] = 'off'; // Use global data
                         cell.classList.add('weekend-cell');
                     } else {
                         // Use global data
                         if (!mockScheduleData[scheduleKey]) {
                             const shiftTypes = ['morning', 'afternoon', 'night', 'off', 'sick', 'vacation'];
                             const randomType = shiftTypes[Math.floor(Math.random() * shiftTypes.length)];
                             mockScheduleData[scheduleKey] = randomType;
                         }
                         shiftType = mockScheduleData[scheduleKey];
                     }

                     const shiftDiv = document.createElement('div');
                     shiftDiv.classList.add('shift');

                     if (isWeekend) {
                         shiftDiv.classList.add('shift-weekend-off');
                     } else {
                        shiftDiv.classList.add(`shift-${shiftType.replace('_', '-')}`);
                     }

                     shiftDiv.textContent = getShiftText(shiftType); // Use local helper

                      if (isEditable) {
                         shiftDiv.classList.add('editable');
                         shiftDiv.dataset.employeeId = employee.id;
                         shiftDiv.dataset.employeeName = employee.name;
                         shiftDiv.dataset.dayIndex = dayIndex;
                         shiftDiv.dataset.weekOffset = weekOffset;
                         shiftDiv.dataset.date = formatDateForDisplay(weekDates[dayIndex]); // Use global util
                         shiftDiv.title = `Click to edit ${employee.name}'s shift on ${days[dayIndex]}`;
                         // Event listener added later via delegation
                     } else if (isWeekend) {
                         shiftDiv.title = "Weekend Off";
                     }

                     cell.appendChild(shiftDiv);
                     row.appendChild(cell);
                 }
                 scheduleTableBody.appendChild(row);
             });
        } else {
             console.error("renderSchedule: scheduleTableBody element not found!");
        }
    }
    // --- End Rendering Logic ---


    // --- Event Handlers ---
    function handleEditShiftClick(targetShiftDiv) { // Pass the clicked div directly
        if (!targetShiftDiv || !targetShiftDiv.classList.contains('editable')) return;

        const employeeId = targetShiftDiv.dataset.employeeId;
        const dayIndex = targetShiftDiv.dataset.dayIndex;
        const weekOffset = targetShiftDiv.dataset.weekOffset;
        const employeeName = targetShiftDiv.dataset.employeeName;
        const dateStr = targetShiftDiv.dataset.date;

        const scheduleKey = `${employeeId}-${weekOffset}-${dayIndex}`;
        const currentShift = mockScheduleData[scheduleKey] || 'morning'; // Use global data

        if (editShiftEmployeeIdInput) editShiftEmployeeIdInput.value = employeeId;
        if (editShiftDayIndexInput) editShiftDayIndexInput.value = dayIndex;
        if (editShiftWeekOffsetInput) editShiftWeekOffsetInput.value = weekOffset;
        if (shiftTypeSelect) shiftTypeSelect.value = currentShift;
        if (editShiftModalTitle) editShiftModalTitle.textContent = `Edit ${employeeName}'s Shift on ${days[dayIndex] || dateStr}`;

        if (editShiftModal) editShiftModal.classList.add('active');
        else console.error("handleEditShiftClick: editShiftModal not found!");
    }

    function handleSendReminders() {
        // Access global utils/data directly
        if (typeof showConfirmModal === 'undefined' || typeof showToast === 'undefined' || typeof MOCK_USERS === 'undefined' || typeof mockScheduleData === 'undefined' || typeof formatDateForDisplay === 'undefined' || typeof currentScheduleWeekOffset === 'undefined') {
            console.error("handleSendReminders: Missing global utilities or data.");
            return;
        }
        const btn = document.getElementById('sendRemindersBtn'); // Re-select inside handler scope
        if (!btn) {
            console.error("handleSendReminders: Send Reminders button not found!");
            return;
        }

        showConfirmModal('Send Reminders', `Send schedule reminders for the week of ${weekDisplay?.textContent || 'this week'} to all ${MOCK_USERS.length} employees?`, () => {
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner"></span> Sending...';
            console.log("Preparing to send schedule reminders...");
            // ... (rest of reminder logic using global data/utils) ...
             const weekDates = getWeekDates(currentScheduleWeekOffset); // Use global current offset
             const weekStart = formatDateForDisplay(weekDates[0]);
             const weekEnd = formatDateForDisplay(weekDates[6]);
             const emailSubject = `Schedule Reminder for Week: ${weekStart} - ${weekEnd}`;
             const emailFooter = "\n\nRegards,\nTeam Management System";
             const fullDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
             let emailsSent = 0;
             let emailsFailed = 0;

             MOCK_USERS.forEach((user) => {
                 let userScheduleInfo = `Your schedule for the week starting ${weekStart}:\n`;
                 for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                     const scheduleKey = `${user.id}-${currentScheduleWeekOffset}-${dayIndex}`;
                     const shiftType = mockScheduleData[scheduleKey] || 'off'; // Access global data
                     userScheduleInfo += `- ${fullDays[dayIndex]} (${formatDateForDisplay(weekDates[dayIndex])}): ${getShiftText(shiftType)}\n`; // Use global/local utils
                 }
                 const emailBody = `Hi ${user.name.split(' ')[0]},\n\nPlease find your work schedule details below. Remember to check the system for any updates.\n\n${userScheduleInfo}\nPlease ensure you log your times accurately.${emailFooter}`;
                 console.log(`--- Sending to: ${user.email} ---`);
                 console.log(`Subject: ${emailSubject}`);
                 console.log(`Body:\n${emailBody}`);
                 console.log(`---------------------------------`);
                 const success = Math.random() > 0.1;
                 if (success) emailsSent++;
                 else emailsFailed++;
             });

            setTimeout(() => {
                if (emailsFailed > 0) {
                   showToast(`Sent ${emailsSent} reminders. Failed to send ${emailsFailed}.`, "error");
                } else {
                   showToast(`Successfully sent ${emailsSent} schedule reminders!`, "success");
                }
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-envelope"></i> Send Reminders';
            }, 1500 + MOCK_USERS.length * 50);
        }, 'btn-primary');
    }

    function handleShiftEditFormSubmit(event) {
        event.preventDefault();
        // Access global data/utils directly
        if (typeof mockScheduleData === 'undefined' || typeof showToast === 'undefined') {
             console.error("Cannot save shift: Missing global data or utilities.");
             return;
        }
        const employeeId = editShiftEmployeeIdInput?.value;
        const dayIndex = editShiftDayIndexInput?.value;
        const weekOffset = editShiftWeekOffsetInput?.value;
        const newShiftType = shiftTypeSelect?.value;

        if (employeeId === undefined || dayIndex === undefined || weekOffset === undefined || newShiftType === undefined) {
            console.error("handleShiftEditFormSubmit: Could not read shift data from modal inputs.");
            showToast("Error saving shift: Could not read data.", "error");
            return;
        }

        const scheduleKey = `${employeeId}-${weekOffset}-${dayIndex}`;
        mockScheduleData[scheduleKey] = newShiftType; // Update the GLOBAL data

        renderSchedule(parseInt(weekOffset)); // Re-render using the correct offset
        if(editShiftModal) editShiftModal.classList.remove('active');
        showToast("Shift updated.");
    }

    // --- End Event Handlers ---


    // --- Attach Event Listeners ---
    console.log("Attaching schedule event listeners...");
    // Use event delegation for shift edits
    if (scheduleTableBody) {
        scheduleTableBody.addEventListener('click', function(event) {
            const editableShiftDiv = event.target.closest('.shift.editable');
            if (editableShiftDiv) {
                console.log("Editable shift clicked:", editableShiftDiv.dataset);
                handleEditShiftClick(editableShiftDiv); // Pass the specific div
            }
        });
    } else {
        console.error("Cannot attach listener: scheduleTableBody not found!");
    }

    // Basic controls
    if (prevWeekBtn) {
        prevWeekBtn.addEventListener('click', () => {
            // Access global state directly
            if (currentScheduleWeekOffset > scheduleMinWeekOffset) {
                currentScheduleWeekOffset--; // Modify global state
                renderSchedule(currentScheduleWeekOffset); // Render using global state
            }
        });
    } else {
         console.error("Cannot attach listener: prevWeekBtn not found!");
    }
    if (nextWeekBtn) {
        nextWeekBtn.addEventListener('click', () => {
            currentScheduleWeekOffset++; // Modify global state
            renderSchedule(currentScheduleWeekOffset); // Render using global state
        });
    } else {
        console.error("Cannot attach listener: nextWeekBtn not found!");
    }

    // Conditional buttons (Access global currentUser)
    if (saveScheduleBtn && currentUser && currentUser.role === 'admin') {
        saveScheduleBtn.style.display = 'inline-flex';
        saveScheduleBtn.addEventListener('click', () => {
             // Access global utils
            if (typeof showConfirmModal === 'undefined' || typeof showToast === 'undefined') {
                console.error("Cannot save schedule: Missing global utilities.");
                return;
            }
            showConfirmModal('Save Schedule', 'Save the current schedule changes?', () => {
                saveScheduleBtn.disabled = true;
                saveScheduleBtn.innerHTML = '<span class="spinner"></span> Saving...';
                console.log("Saving schedule...", mockScheduleData); // Use global data
                setTimeout(() => {
                    showToast("Schedule saved successfully!", "success");
                    saveScheduleBtn.disabled = false;
                    saveScheduleBtn.innerHTML = '<i class="fas fa-save"></i> Save Schedule';
                }, 1000);
            }, 'btn-primary');
        });
    } else if (!saveScheduleBtn && currentUser && currentUser.role === 'admin') {
         console.warn("Save Schedule button element not found, cannot attach listener.");
    }
    if (sendRemindersBtn && currentUser && currentUser.role === 'admin') {
         sendRemindersBtn.style.display = 'inline-flex';
        sendRemindersBtn.addEventListener('click', handleSendReminders);
    } else if (!sendRemindersBtn && currentUser && currentUser.role === 'admin') {
        console.warn("Send Reminders button element not found, cannot attach listener.");
    }


    // Modal listeners
    if (editShiftModal) {
        editShiftModal.querySelectorAll('[data-close-modal]').forEach(btn => {
            btn.addEventListener('click', () => editShiftModal.classList.remove('active'));
        });
        editShiftModal.addEventListener('click', (event) => {
            if (event.target === editShiftModal) {
                editShiftModal.classList.remove('active');
            }
        });
    } else {
        console.error("Cannot attach modal listeners: editShiftModal not found!");
    }

     if (editShiftForm) {
        editShiftForm.addEventListener('submit', handleShiftEditFormSubmit);
    } else {
         console.error("Cannot attach form listener: editShiftForm not found!");
    }

    // --- Initial Render ---
    // Initial offset calculation is done in the main script (initDashboard)
    renderSchedule(currentScheduleWeekOffset); // Render with the correct GLOBAL offset
    console.log("Employee schedule initialized and rendered.");

}; // *** END of window.initializeEmployeeScheduleLogic definition ***

// *** ADDED: Log to confirm script parsing is complete ***
console.log("employee-scheduling.js: Script parsed, initializeEmployeeScheduleLogic assigned to window.");
