```javascript
// employee-scheduling.js

// This script assumes global variables like MOCK_USERS, mockScheduleData, currentUser,
// currentScheduleWeekOffset, scheduleMinWeekOffset, and utility functions
// (formatDateForDisplay, showConfirmModal, showToast) are defined in the main HTML script.

function initializeEmployeeScheduleLogic() {
    console.log("Initializing Employee Schedule Logic...");

    // Check if required globals exist
    if (typeof currentUser === 'undefined' || typeof MOCK_USERS === 'undefined' || typeof mockScheduleData === 'undefined') {
        console.error("Error: Required global variables (currentUser, MOCK_USERS, mockScheduleData) not found for Employee Scheduling.");
        // Optionally display an error in the UI
        const container = document.getElementById('featureSectionsContainer');
        if(container) container.innerHTML = '<div class="placeholder-content error-message" style="display: block;">Failed to initialize schedule: Missing required data.</div>';
        return;
    }

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

    // --- Helper Functions (Copied from original main script) ---
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
         // Ensure global variables are accessible
         if (typeof formatDateForDisplay === 'undefined' || typeof MOCK_USERS === 'undefined' || typeof mockScheduleData === 'undefined') {
            console.error("Cannot render schedule: Missing global utilities or data.");
            return;
         }

         const weekDates = getWeekDates(weekOffset); // Gets Sun-Sat
         const start = weekDates[0]; // Sunday
         const end = weekDates[6]; // Saturday
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
                 // Use global MOCK_USERS to get names
                 row.innerHTML = `<td class="employee-name">${employee.name}</td>`;

                 for (let dayIndex = 0; dayIndex < 7; dayIndex++) { // Loop 7 times for Sun-Sat
                     const cell = document.createElement('td');
                     const scheduleKey = `${employee.id}-${weekOffset}-${dayIndex}`;
                     const isWeekend = dayIndex === 5 || dayIndex === 6; // Friday (5) or Saturday (6) is weekend in SA context

                     let shiftType;
                      // Use global currentUser for role check
                     let isEditable = currentUser && currentUser.role === 'admin' && !isWeekend;

                     // Force 'off' for weekends, otherwise get stored/random shift
                     if (isWeekend) {
                         shiftType = 'off';
                         mockScheduleData[scheduleKey] = 'off'; // Ensure global data consistency
                         cell.classList.add('weekend-cell');
                     } else {
                         // Use global mockScheduleData
                         if (!mockScheduleData[scheduleKey]) {
                             const shiftTypes = ['morning', 'afternoon', 'night', 'off', 'sick', 'vacation'];
                             const randomType = shiftTypes[Math.floor(Math.random() * shiftTypes.length)];
                             mockScheduleData[scheduleKey] = randomType;
                         }
                         shiftType = mockScheduleData[scheduleKey];
                     }

                     const shiftDiv = document.createElement('div');
                     shiftDiv.classList.add('shift');

                     // Apply specific class based on shift type, including special weekend style
                     if (isWeekend) {
                         shiftDiv.classList.add('shift-weekend-off');
                     } else {
                        shiftDiv.classList.add(`shift-${shiftType.replace('_', '-')}`);
                     }

                     shiftDiv.textContent = getShiftText(shiftType);

                      if (isEditable) {
                         shiftDiv.classList.add('editable');
                         shiftDiv.dataset.employeeId = employee.id;
                         shiftDiv.dataset.employeeName = employee.name; // Use global MOCK_USERS for name
                         shiftDiv.dataset.dayIndex = dayIndex;
                         shiftDiv.dataset.weekOffset = weekOffset;
                         shiftDiv.dataset.date = formatDateForDisplay(weekDates[dayIndex]); // Use global utility
                         shiftDiv.title = `Click to edit ${employee.name}'s shift on ${days[dayIndex]}`;
                         // Event listener added later
                     } else if (isWeekend) {
                         shiftDiv.title = "Weekend Off"; // Title for non-editable weekend
                     }

                     cell.appendChild(shiftDiv);
                     row.appendChild(cell);
                 }
                 scheduleTableBody.appendChild(row);
             });
        } // end if scheduleTableBody
    }
    // --- End Rendering Logic ---


    // --- Event Handlers ---
    function handleEditShiftClick(event) {
        const target = event.target;
        if (!target.classList.contains('editable')) return;

        const employeeId = target.dataset.employeeId;
        const dayIndex = target.dataset.dayIndex;
        const weekOffset = target.dataset.weekOffset;
        const employeeName = target.dataset.employeeName;
        const dateStr = target.dataset.date; // Use global MOCK_USERS for name

        const scheduleKey = `${employeeId}-${weekOffset}-${dayIndex}`;
        // Use global mockScheduleData
        const currentShift = mockScheduleData[scheduleKey] || 'morning';

        if (editShiftEmployeeIdInput) editShiftEmployeeIdInput.value = employeeId;
        if (editShiftDayIndexInput) editShiftDayIndexInput.value = dayIndex;
        if (editShiftWeekOffsetInput) editShiftWeekOffsetInput.value = weekOffset;
        if (shiftTypeSelect) shiftTypeSelect.value = currentShift;
        if (editShiftModalTitle) editShiftModalTitle.textContent = `Edit ${employeeName}'s Shift on ${days[dayIndex] || dateStr}`;

        if (editShiftModal) editShiftModal.classList.add('active');
    }

    function handleSendReminders() {
        // Ensure global utilities are available
        if (typeof showConfirmModal === 'undefined' || typeof showToast === 'undefined' || typeof MOCK_USERS === 'undefined' || typeof mockScheduleData === 'undefined' || typeof formatDateForDisplay === 'undefined') {
            console.error("Cannot send reminders: Missing global utilities or data.");
            if(sendRemindersBtn) { // Reset button if error occurs
                sendRemindersBtn.disabled = false;
                sendRemindersBtn.innerHTML = '<i class="fas fa-envelope"></i> Send Reminders';
            }
            return;
        }

        const btn = document.getElementById('sendRemindersBtn'); // Re-select inside handler scope
        if (!btn) return;

        showConfirmModal('Send Reminders', `Send schedule reminders for the week of ${weekDisplay?.textContent || 'this week'} to all ${MOCK_USERS.length} employees?`, () => {
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner"></span> Sending...';

            console.log("Preparing to send schedule reminders...");

            const weekDates = getWeekDates(currentScheduleWeekOffset); // Use global current offset
            const weekStart = formatDateForDisplay(weekDates[0]);
            const weekEnd = formatDateForDisplay(weekDates[6]);

            const emailSubject = `Schedule Reminder for Week: ${weekStart} - ${weekEnd}`;
            const emailFooter = "\n\nRegards,\nTeam Management System";
            const fullDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

            let emailsSent = 0;
            let emailsFailed = 0;

            MOCK_USERS.forEach((user, index) => {
                let userScheduleInfo = `Your schedule for the week starting ${weekStart}:\n`;
                for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                    const scheduleKey = `${user.id}-${currentScheduleWeekOffset}-${dayIndex}`;
                    const shiftType = mockScheduleData[scheduleKey] || 'off';
                    userScheduleInfo += `- ${fullDays[dayIndex]} (${formatDateForDisplay(weekDates[dayIndex])}): ${getShiftText(shiftType)}\n`;
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
        }, 'btn-primary'); // Use primary style for confirmation
    }

    function handleShiftEditFormSubmit(event) {
        event.preventDefault();
        // Ensure global utilities/data are available
        if (typeof mockScheduleData === 'undefined' || typeof showToast === 'undefined') {
             console.error("Cannot save shift: Missing global data or utilities.");
             return;
        }
        const employeeId = editShiftEmployeeIdInput.value;
        const dayIndex = editShiftDayIndexInput.value;
        const weekOffset = editShiftWeekOffsetInput.value;
        const newShiftType = shiftTypeSelect.value;

        const scheduleKey = `${employeeId}-${weekOffset}-${dayIndex}`;
        mockScheduleData[scheduleKey] = newShiftType; // Update the global data

        renderSchedule(parseInt(weekOffset)); // Re-render the currently viewed week
        if(editShiftModal) editShiftModal.classList.remove('active'); // Close modal
        showToast("Shift updated.");
    }

    // --- End Event Handlers ---


    // --- Attach Event Listeners ---

    // Use event delegation for shift edits as rows are dynamic
    if (scheduleTableBody) {
        scheduleTableBody.addEventListener('click', function(event) {
            if (event.target.closest('.shift.editable')) {
                handleEditShiftClick(event.target.closest('.shift.editable'));
            }
        });
    }

    // Basic controls
    if (prevWeekBtn) {
        prevWeekBtn.addEventListener('click', () => {
            if (currentScheduleWeekOffset > scheduleMinWeekOffset) { // Use global variables
                currentScheduleWeekOffset--;
                renderSchedule(currentScheduleWeekOffset);
            }
        });
    }
    if (nextWeekBtn) {
        nextWeekBtn.addEventListener('click', () => {
            currentScheduleWeekOffset++; // Use global variable
            renderSchedule(currentScheduleWeekOffset);
        });
    }

    // Conditional buttons (only add listeners if elements exist and user has permission)
    if (saveScheduleBtn && currentUser && currentUser.role === 'admin') {
        saveScheduleBtn.style.display = 'inline-flex'; // Show button
        saveScheduleBtn.addEventListener('click', () => {
            // Use global utilities
             if (typeof showConfirmModal === 'undefined' || typeof showToast === 'undefined') {
                console.error("Cannot save schedule: Missing global utilities.");
                return;
            }
            showConfirmModal('Save Schedule', 'Are you sure you want to save the current schedule changes?', () => {
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
    }
    if (sendRemindersBtn && currentUser && currentUser.role === 'admin') {
         sendRemindersBtn.style.display = 'inline-flex'; // Show button
        sendRemindersBtn.addEventListener('click', handleSendReminders);
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
    }
    if (editShiftForm) {
        editShiftForm.addEventListener('submit', handleShiftEditFormSubmit);
    }

    // --- Initial Calculation & Render ---
    const calculateAndSetInitialOffsets = () => {
        const today = new Date();
        const mayFirst2025 = new Date(2025, 4, 1); // May 1st
        mayFirst2025.setHours(0, 0, 0, 0);

        const currentDayOfWeek = today.getDay();
        const diffToSunday = today.getDate() - currentDayOfWeek;
        const startOfCurrentWeek = new Date(today);
        startOfCurrentWeek.setDate(diffToSunday);
        startOfCurrentWeek.setHours(0, 0, 0, 0);

        const mayFirstDayOfWeek = mayFirst2025.getDay();
        const diffToMayFirstSunday = mayFirst2025.getDate() - mayFirstDayOfWeek;
        const startOfMayFirstWeek = new Date(mayFirst2025);
        startOfMayFirstWeek.setDate(diffToMayFirstSunday);
        startOfMayFirstWeek.setHours(0, 0, 0, 0);

        const msPerDay = 24 * 60 * 60 * 1000;
        const weeksDifference = Math.round((startOfMayFirstWeek.getTime() - startOfCurrentWeek.getTime()) / (7 * msPerDay));

        // Update GLOBAL state variables
        currentScheduleWeekOffset = weeksDifference;
        scheduleMinWeekOffset = weeksDifference;
        console.log(`Schedule initial week offset set to: ${currentScheduleWeekOffset}`);
    };

    calculateAndSetInitialOffsets();
    renderSchedule(currentScheduleWeekOffset); // Initial render with the correct global offset
}

// No automatic call here - it will be called by the main script after loading.
