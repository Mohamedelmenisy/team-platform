function initializeEmployeeSchedule(currentUserFromDashboard, teamMembersFromDashboard) {
    // --- START: Input Validation & Logging ---
    console.log("Initializing Employee Schedule...");
    if (!currentUserFromDashboard || typeof currentUserFromDashboard !== 'object') {
        console.error("initializeEmployeeSchedule: Invalid currentUserFromDashboard received.", currentUserFromDashboard);
        // Display error to user?
         const placeholder = document.getElementById('featurePlaceholder');
         if(placeholder) {
            placeholder.innerHTML = `<h2>Error</h2><p>Failed to initialize schedule: Invalid user data received.</p>`;
            placeholder.style.display = 'flex';
         }
        return; // Stop execution if data is invalid
    }
     if (!Array.isArray(teamMembersFromDashboard)) {
        console.error("initializeEmployeeSchedule: Invalid teamMembersFromDashboard received.", teamMembersFromDashboard);
         const placeholder = document.getElementById('featurePlaceholder');
         if(placeholder) {
            placeholder.innerHTML = `<h2>Error</h2><p>Failed to initialize schedule: Invalid team member data received.</p>`;
            placeholder.style.display = 'flex';
         }
        return; // Stop execution
    }
    console.log("Received Current User:", JSON.parse(JSON.stringify(currentUserFromDashboard))); // Log a copy
    console.log("Received Team Members:", JSON.parse(JSON.stringify(teamMembersFromDashboard))); // Log a copy
    // --- END: Input Validation & Logging ---


    // --- Use data passed from dashboard ---
    const currentUser = currentUserFromDashboard; // Use the parameter
    let employees = teamMembersFromDashboard;   // Use the parameter, make it 'let' if adding employees modifies it

    // --- DOM Elements (scoped to the schedule content) ---
    const scheduleContainer = document.querySelector('#featureSections .schedule-container');
    if (!scheduleContainer) {
        console.error("initializeEmployeeSchedule: Schedule container not found in the loaded HTML.");
        return; // Cannot proceed without the container
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
    const shiftTypeSelect = scheduleContainer.parentElement.querySelector('#shiftType'); // Renamed variable for clarity
    const customShiftGroup = scheduleContainer.parentElement.querySelector('#customShiftGroup');
    const deleteShiftBtn = scheduleContainer.parentElement.querySelector('#deleteShiftBtn');
    const prevWeekBtn = scheduleContainer.parentElement.querySelector('#prevWeekBtn');
    const nextWeekBtn = scheduleContainer.parentElement.querySelector('#nextWeekBtn');
    const weekDisplay = scheduleContainer.parentElement.querySelector('#weekDisplay');
    const saveScheduleBtn = scheduleContainer.parentElement.querySelector('#saveScheduleBtn');
    // const userEmail = document.getElementById('userEmail'); // These are part of dashboard header, not schedule section
    // const userInitials = document.getElementById('userInitials');
    const scheduleTableBody = scheduleContainer.querySelector('#scheduleTableBody'); // Target tbody for rows
    const shiftDateInput = scheduleContainer.parentElement.querySelector('#shiftDate');
    const toastNotification = scheduleContainer.parentElement.querySelector('#toastNotification');

     // Check if all essential elements were found
     const essentialElements = { employeeModal, shiftModal, addEmployeeBtn, sendRemindersBtn, closeEmployeeModal, closeShiftModal, cancelEmployeeBtn, cancelShiftBtn, employeeForm, shiftForm, shiftTypeSelect, customShiftGroup, deleteShiftBtn, prevWeekBtn, nextWeekBtn, weekDisplay, saveScheduleBtn, scheduleTableBody, shiftDateInput, toastNotification };
     for (const key in essentialElements) {
         if (!essentialElements[key]) {
             console.error(`initializeEmployeeSchedule: Element with ID/Selector '${key}' not found.`);
             // Optionally display an error message to the user
             return; // Stop initialization if a critical element is missing
         }
     }

    // --- State & Configuration ---
    let currentWeekStart = getStartOfWeek(new Date(2025, 4, 5)); // Start on Monday, May 5, 2025
    const minDate = new Date(2025, 4, 1); // May 1, 2025
    const maxDate = new Date(2025, 4, 31); // May 31, 2025
    const daysOfWeek = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

     // In a real app, shift data would be fetched/managed separately
     // For this example, we'll simulate some data structure to hold shifts
     let scheduleData = {}; // Example: { "empId_day": { type: "morning", text: "9AM-5PM" }, ... }
     // Pre-populate with initial example data if needed, or fetch it.
     // Let's assume for now the initial HTML structure reflects the 'default' state.


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
         // Adjust border color based on type
         toastNotification.style.borderLeftColor = type === 'success' ? 'var(--primary-dark)' : '#dc2626';
        toastNotification.classList.add('show');

        // Ensure previous timeouts are cleared if rapidly showing toasts
        if (toastNotification.timerId) {
            clearTimeout(toastNotification.timerId);
        }

        toastNotification.timerId = setTimeout(() => {
            toastNotification.classList.remove('show');
            toastNotification.timerId = null; // Clear timer reference
        }, 3000);
    }

    // --- Core Logic ---

    // Update week display and navigation buttons
    function updateWeekDisplay() {
        if (!weekDisplay || !prevWeekBtn || !nextWeekBtn) return;

        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const options = { month: 'short', day: 'numeric' };
        const startStr = currentWeekStart.toLocaleDateString('en-US', options);
        const endStr = weekEnd.toLocaleDateString('en-US', options);
        const year = currentWeekStart.getFullYear();

        weekDisplay.textContent = `${startStr} - ${endStr}, ${year}`;

        // Update table headers with dates
        const dateCells = scheduleContainer.querySelectorAll('.day-date');
        const tempDate = new Date(currentWeekStart);
        dateCells.forEach((cell) => {
            const dateStr = tempDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            cell.textContent = dateStr;
            tempDate.setDate(tempDate.getDate() + 1);
        });

        // Enable/Disable navigation buttons based on date range
        const prevWeekTest = new Date(currentWeekStart);
        prevWeekTest.setDate(prevWeekTest.getDate() - 1); // Check if day before start is < minDate
        prevWeekBtn.disabled = prevWeekTest < minDate;

        const nextWeekTest = new Date(weekEnd);
         nextWeekTest.setDate(nextWeekTest.getDate() + 1); // Check if day after end is > maxDate
        nextWeekBtn.disabled = nextWeekTest > maxDate;

        // Refresh the schedule table for the new week
        renderScheduleTable();
    }

     // Render the main schedule table rows
    function renderScheduleTable() {
        if (!scheduleTableBody) return;
        scheduleTableBody.innerHTML = ''; // Clear existing rows

        if (!employees || employees.length === 0) {
             scheduleTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--gray);">No employees found. Add employees using the dashboard settings.</td></tr>`;
             return;
        }


        const canEdit = currentUser.role === 'admin' || currentUser.role === 'supervisor';

        employees.forEach(employee => {
            const row = document.createElement('tr');
            row.dataset.employeeId = employee.id; // Add identifier to row

            // Employee Name Cell (Sticky)
            const nameCell = document.createElement('td');
            nameCell.className = 'employee-name';
            nameCell.textContent = employee.name;
            row.appendChild(nameCell);

            // Day Cells
            daysOfWeek.forEach((day, dayIndex) => {
                const dayCell = document.createElement('td');
                dayCell.className = 'admin-controls'; // Class for potential edit button
                dayCell.dataset.day = day;
                dayCell.dataset.employeeId = employee.id;

                // --- Populate Shift Data (Example: retrieve from scheduleData or default) ---
                // In a real app, fetch shift data for this employee/day/week
                // For now, let's just create empty cells or use initial HTML structure logic
                const shiftKey = `${employee.id}_${day}`; // Example key
                const currentShift = scheduleData[shiftKey]; // Get shift if saved

                let shiftDiv = null;
                 // Create shift div based on stored data or leave empty
                 // This part needs real data logic. Let's just add the edit button for now.
                /*
                 if (currentShift) {
                     shiftDiv = document.createElement('div');
                     shiftDiv.className = `shift shift-${currentShift.type}`; // Add appropriate class
                     shiftDiv.textContent = currentShift.text;
                     dayCell.appendChild(shiftDiv);
                 }
                 */

                // Add Edit Link (conditionally)
                if (canEdit) {
                    const editSpan = document.createElement('span');
                    editSpan.className = 'edit-shift';
                    editSpan.textContent = '(edit)';
                    editSpan.dataset.emp = employee.id; // Keep original data attributes if needed
                    editSpan.dataset.day = day;
                    // editSpan.style.display = 'inline'; // Directly display if user can edit
                    editSpan.style.display = 'block'; // Use block for column layout
                    editSpan.addEventListener('click', handleEditShiftClick); // Add listener directly
                    dayCell.appendChild(editSpan);
                } else {
                     // Maybe add a placeholder or leave empty if user cannot edit
                     dayCell.innerHTML = 'â€“'; // Example placeholder
                }

                row.appendChild(dayCell);
            });

            scheduleTableBody.appendChild(row);
        });

        // Re-apply RBAC styles/visibility after rendering
        applyRoleBasedStyles();
    }

    // Apply role-based visibility (e.g., show edit buttons)
    function applyRoleBasedStyles() {
        const canManage = currentUser.role === 'admin' || currentUser.role === 'supervisor';

        // Show/hide control buttons
        if (addEmployeeBtn) addEmployeeBtn.style.display = canManage ? 'flex' : 'none';
        if (sendRemindersBtn) sendRemindersBtn.style.display = canManage ? 'flex' : 'none';
        if (saveScheduleBtn) saveScheduleBtn.style.display = canManage ? 'flex' : 'none';

        // Show/hide edit shift buttons within the table
        const editShiftSpans = scheduleContainer.querySelectorAll('.edit-shift');
        editShiftSpans.forEach(span => {
            // span.style.display = canManage ? 'inline' : 'none';
            span.style.display = canManage ? 'block' : 'none'; // Use block for column layout
        });
    }

    // --- Event Handlers ---

    // Modal Controls
    function openModal(modal) {
        if (modal) modal.style.display = 'flex';
    }
    function closeModal(modal) {
        if (modal) modal.style.display = 'none';
    }

    // Add Employee Modal (Note: Adding employees should ideally happen in dashboard settings)
    // This modal might be redundant if handled elsewhere. Keeping the logic for now.
    if (addEmployeeBtn) {
         addEmployeeBtn.addEventListener('click', () => {
            employeeForm.reset();
            openModal(employeeModal);
         });
    }
     if (closeEmployeeModal) closeEmployeeModal.addEventListener('click', () => closeModal(employeeModal));
     if (cancelEmployeeBtn) cancelEmployeeBtn.addEventListener('click', () => closeModal(employeeModal));
     if (employeeForm) {
         employeeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('empName').value;
            const email = document.getElementById('empEmail').value;
            // const position = document.getElementById('empPosition').value; // Not used in display logic directly
            // const role = document.getElementById('empRole').value;       // Role assignment might be complex

             // **IMPORTANT**: This adds to the *local* `employees` array within this script's scope.
             // It does *not* update the main dashboard's `teamMembers` array or localStorage persistently.
             // Adding employees should ideally trigger an update *back* to the main dashboard state.
             // For now, it just updates the local view for this session.
             const newEmployee = {
                id: Date.now(), // Use timestamp for temporary unique ID
                name: name,
                email: email,
                // Add position, role if needed by render logic
             };
             employees.push(newEmployee);

             renderScheduleTable(); // Re-render table with the new employee
             closeModal(employeeModal);
             showToast(`Employee ${name} added locally to this view.`);
         });
     }


    // Edit Shift Click Handler (attached in renderScheduleTable)
    function handleEditShiftClick(event) {
        const span = event.target;
        const empId = parseInt(span.dataset.emp);
        const day = span.dataset.day;
        const currentCell = span.closest('td');

        const employee = employees.find(e => e.id == empId); // Use == for potential string/number mismatch
        const dayIndex = daysOfWeek.indexOf(day);

        if (employee && dayIndex !== -1) {
            const date = new Date(currentWeekStart);
            date.setDate(date.getDate() + dayIndex);

            document.getElementById('shiftEmployee').value = employee.name;

            // Format date as YYYY-MM-DD for the date input
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const dayOfMonth = date.getDate().toString().padStart(2, '0');
            const formattedDate = `${year}-${month}-${dayOfMonth}`;

            shiftDateInput.value = formattedDate;
             // Set min/max based on the overall allowed range
             const minFormatted = minDate.toISOString().split('T')[0];
             const maxFormatted = maxDate.toISOString().split('T')[0];
             shiftDateInput.min = minFormatted; // e.g., '2025-05-01'
             shiftDateInput.max = maxFormatted; // e.g., '2025-05-31'


            // Get current shift type from cell (needs actual data fetching/storage)
            // For now, reset or use a default.
            const shiftDiv = currentCell.querySelector('.shift');
             shiftTypeSelect.value = 'morning'; // Default or derive from shiftDiv if available
             customShiftGroup.style.display = 'none';
             document.getElementById('customShift').value = '';
             document.getElementById('shiftNotes').value = ''; // Clear notes


             if (shiftDiv) {
                 if (shiftDiv.classList.contains('shift-morning')) shiftTypeSelect.value = 'morning';
                 else if (shiftDiv.classList.contains('shift-afternoon')) shiftTypeSelect.value = 'afternoon';
                 else if (shiftDiv.classList.contains('shift-night')) shiftTypeSelect.value = 'night';
                 else if (shiftDiv.classList.contains('day-off')) shiftTypeSelect.value = 'day-off';
                 else if (shiftDiv.classList.contains('sick-leave')) shiftTypeSelect.value = 'sick-leave';
                 else if (shiftDiv.classList.contains('vacation')) shiftTypeSelect.value = 'vacation';
                 else {
                     // Assume custom if no standard class matches
                     shiftTypeSelect.value = 'custom';
                     document.getElementById('customShift').value = shiftDiv.textContent;
                     customShiftGroup.style.display = 'block';
                 }
             }


            // Store reference to the cell being edited using data attributes
            shiftModal.dataset.editingEmpId = empId;
            shiftModal.dataset.editingDay = day;

            openModal(shiftModal);
        } else {
             console.error("Could not find employee or day index for editing.", { empId, day, employee, dayIndex });
             showToast("Error preparing edit form.", "danger");
        }
    }


    // Edit Shift Modal Controls
     if (closeShiftModal) closeShiftModal.addEventListener('click', () => closeModal(shiftModal));
     if (cancelShiftBtn) cancelShiftBtn.addEventListener('click', () => closeModal(shiftModal));
     if (shiftTypeSelect) {
         shiftTypeSelect.addEventListener('change', function() {
            if (customShiftGroup) customShiftGroup.style.display = this.value === 'custom' ? 'block' : 'none';
         });
     }

    // Save Shift Changes
    if (shiftForm) {
        shiftForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const empId = shiftModal.dataset.editingEmpId;
            const day = shiftModal.dataset.editingDay;
            const shiftTypeValue = shiftTypeSelect.value;
            const customShiftText = document.getElementById('customShift').value;
            // const shiftDate = shiftDateInput.value; // Date is for context, not usually saved directly with the shift type
            // const notes = document.getElementById('shiftNotes').value;

             if (!empId || !day) {
                console.error("Missing employee ID or day for saving shift.");
                showToast("Error saving shift: Missing data.", "danger");
                return;
             }

            // --- Update Simulated Shift Data ---
            const shiftKey = `${empId}_${day}`;
            let shiftText = '';
            let shiftClass = `shift-${shiftTypeValue}`; // Base class

            switch(shiftTypeValue) {
                case 'morning': shiftText = '9AM-5PM'; break;
                case 'afternoon': shiftText = '12PM-8PM'; break;
                case 'night': shiftText = '5PM-1AM'; break;
                case 'day-off': shiftText = 'OFF'; break;
                case 'sick-leave': shiftText = 'SICK'; break;
                case 'vacation': shiftText = 'VAC'; break;
                case 'custom':
                    shiftText = customShiftText || 'Custom';
                    // Decide on a default visual style for custom, e.g., morning
                    shiftClass = 'shift-morning'; // Or add a specific 'shift-custom' style
                    break;
                 default: shiftText = 'N/A'; shiftClass = ''; // Handle unexpected value
            }

            scheduleData[shiftKey] = { type: shiftTypeValue, text: shiftText }; // Save to our temporary store

            // --- Update the specific cell in the UI ---
             const cellToUpdate = scheduleTableBody.querySelector(`tr[data-employee-id="${empId}"] td[data-day="${day}"]`);
             if (cellToUpdate) {
                 // Remove existing shift div if present
                 const existingShiftDiv = cellToUpdate.querySelector('.shift');
                 if (existingShiftDiv) existingShiftDiv.remove();

                 // Create and insert new shift div
                 const newShiftDiv = document.createElement('div');
                 newShiftDiv.className = `shift ${shiftClass}`;
                 newShiftDiv.textContent = shiftText;
                 // Insert before the edit link (if it exists)
                 const editLink = cellToUpdate.querySelector('.edit-shift');
                 cellToUpdate.insertBefore(newShiftDiv, editLink);
             } else {
                console.error("Could not find cell to update in UI", {empId, day});
             }


            closeModal(shiftModal);
            const employeeName = document.getElementById('shiftEmployee').value;
            showToast(`Shift for ${employeeName} on ${day.toUpperCase()} updated.`);

            // In real app: Send update to server here
        });
    }

    // Delete Shift
    if (deleteShiftBtn) {
        deleteShiftBtn.addEventListener('click', () => {
            const empId = shiftModal.dataset.editingEmpId;
            const day = shiftModal.dataset.editingDay;
            const employeeName = document.getElementById('shiftEmployee').value;


            if (!empId || !day) {
                 console.error("Missing employee ID or day for deleting shift.");
                 showToast("Error deleting shift: Missing data.", "danger");
                 return;
            }

            // --- Update Simulated Shift Data ---
             const shiftKey = `${empId}_${day}`;
             delete scheduleData[shiftKey]; // Remove from our temporary store

             // --- Update the specific cell in the UI ---
             const cellToUpdate = scheduleTableBody.querySelector(`tr[data-employee-id="${empId}"] td[data-day="${day}"]`);
             if (cellToUpdate) {
                 const shiftDiv = cellToUpdate.querySelector('.shift');
                 if (shiftDiv) {
                     shiftDiv.remove();
                      showToast(`Shift for ${employeeName} on ${day.toUpperCase()} deleted.`, 'danger');
                 } else {
                     showToast(`No shift found for ${employeeName} on ${day.toUpperCase()} to delete.`, 'warning');
                 }
             }

            closeModal(shiftModal);
            // In real app: Send delete request to server here
        });
    }


    // Week Navigation
    if (prevWeekBtn) {
        prevWeekBtn.addEventListener('click', () => {
            currentWeekStart.setDate(currentWeekStart.getDate() - 7);
            updateWeekDisplay();
        });
    }
    if (nextWeekBtn) {
        nextWeekBtn.addEventListener('click', () => {
            currentWeekStart.setDate(currentWeekStart.getDate() + 7);
            updateWeekDisplay();
        });
    }


    // Save Schedule Button
    if (saveScheduleBtn) {
        saveScheduleBtn.addEventListener('click', () => {
            // In a real app, gather `scheduleData` and send it to the server
            console.log("Simulating save schedule:", scheduleData);
            showToast('Schedule changes saved (simulated)!');
        });
    }

    // Send Reminders Button
    if (sendRemindersBtn) {
        sendRemindersBtn.addEventListener('click', () => {
            // In a real app, this would likely trigger a backend process
            // For frontend simulation, create mailto link:
             const subject = encodeURIComponent(`Work Schedule Reminder: ${weekDisplay.textContent}`);
             let body = `Dear Team,\n\nPlease review your schedule for the upcoming week:\n\n`;

              // Basic text representation of the schedule (can be improved)
             employees.forEach(emp => {
                 body += `${emp.name}:\n`;
                 daysOfWeek.forEach(day => {
                     const shiftKey = `${emp.id}_${day}`;
                     const shift = scheduleData[shiftKey];
                     body += `  ${day.toUpperCase()}: ${shift ? shift.text : 'Not Assigned'}\n`;
                 });
                 body += '\n';
             });

              body += `\nBest regards,\n${currentUser.name}`; // Use dashboard's user name

              const recipientEmails = employees.map(e => e.email).join(',');
              if (recipientEmails) {
                  const mailtoLink = `mailto:?bcc=${recipientEmails}&subject=${subject}&body=${encodeURIComponent(body)}`;
                  // Use window.open for potentially long links that might fail with direct assignment
                  window.open(mailtoLink, '_blank');
                  showToast('Reminder email prepared (simulated).');
              } else {
                  showToast('No employee emails found to send reminders.', 'warning');
              }
        });
    }

     // Close modals when clicking outside
     window.addEventListener('click', function(event) {
         if (event.target === employeeModal) {
             closeModal(employeeModal);
         }
         if (event.target === shiftModal) {
             closeModal(shiftModal);
         }
     });


    // --- Initial Setup Calls ---
    applyRoleBasedStyles(); // Set initial visibility of buttons
    updateWeekDisplay(); // Render table for the initial week

    console.log("Employee Schedule Initialized Successfully.");

} // --- End of initializeEmployeeSchedule function ---
