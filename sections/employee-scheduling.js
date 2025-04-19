// sections/employee-scheduling.js

// Wrap all code in the initialization function
function initializeEmployeeSchedule(currentUser, teamMembers) {
    console.log("%c--- initializeEmployeeSchedule STARTED ---", "color: blue; font-weight: bold;");
    console.log("Received currentUser:", currentUser);
    // Ensure teamMembers is an array before logging length or using spread
    const scheduleEmployees = Array.isArray(teamMembers) ? [...teamMembers] : [];
    console.log("Received teamMembers (Count):", scheduleEmployees.length);
     // console.log("Received teamMembers (Full Data):", JSON.stringify(scheduleEmployees)); // Uncomment for detailed view if needed

    // --- DOM Elements (Scoped to the #featureSections container) ---
    const featureContainer = document.getElementById('featureSections');
    if (!featureContainer) {
        console.error("CRITICAL: #featureSections container not found! Cannot initialize schedule.");
        return; // Stop execution if the main container is missing
    }

    // Find elements *within* the featureContainer
    const employeeModal = featureContainer.querySelector('#employeeModal');
    const shiftModal = featureContainer.querySelector('#shiftModal');
    const addEmployeeBtn = featureContainer.querySelector('#addEmployeeBtn');
    const sendRemindersBtn = featureContainer.querySelector('#sendRemindersBtn');
    const closeEmployeeModal = featureContainer.querySelector('#closeEmployeeModal');
    const closeShiftModal = featureContainer.querySelector('#closeShiftModal');
    const cancelEmployeeBtn = featureContainer.querySelector('#cancelEmployeeBtn');
    const cancelShiftBtn = featureContainer.querySelector('#cancelShiftBtn');
    const employeeForm = featureContainer.querySelector('#employeeForm');
    const shiftForm = featureContainer.querySelector('#shiftForm');
    const shiftTypeSelect = featureContainer.querySelector('#shiftType');
    const customShiftGroup = featureContainer.querySelector('#customShiftGroup');
    const prevWeekBtn = featureContainer.querySelector('#prevWeekBtn');
    const nextWeekBtn = featureContainer.querySelector('#nextWeekBtn');
    const weekDisplay = featureContainer.querySelector('#weekDisplay');
    const saveScheduleBtn = featureContainer.querySelector('#saveScheduleBtn');
    const scheduleTableBody = featureContainer.querySelector('#scheduleTableBody');
    const scheduleTable = featureContainer.querySelector('#scheduleTable'); // Get table for headers
    const toastNotification = featureContainer.querySelector('#toastNotification');
    const shiftEmployeeDisplay = featureContainer.querySelector('#shiftEmployeeDisplay');
    const shiftDateDisplay = featureContainer.querySelector('#shiftDateDisplay');
    const customShiftInput = featureContainer.querySelector('#customShift');
    const shiftNotesInput = featureContainer.querySelector('#shiftNotes');
    const editShiftEmpIdInput = featureContainer.querySelector('#editShiftEmpId');
    const editShiftDayIndexInput = featureContainer.querySelector('#editShiftDayIndex');
    const empRoleSelect = featureContainer.querySelector('#empRole'); // For add employee modal

    // Verify crucial elements
    if (!scheduleTableBody || !weekDisplay || !employeeModal || !shiftModal || !prevWeekBtn || !nextWeekBtn || !shiftTypeSelect) {
         console.error("CRITICAL: One or more essential Schedule DOM elements not found within #featureSections. Check HTML structure and IDs.");
         // Display error in UI
         featureContainer.innerHTML = `<div class="placeholder-content error-message">Failed to initialize Schedule: Missing essential HTML elements.</div>`;
         return;
    }
    console.log("All essential DOM elements found.");


    // --- State & Config (specific to this module) ---
    let scheduleData = {}; // Stores { 'empId-yyyy-mm-dd': { type: '...', text: '...', notes: '' } }
    let currentWeekStart = getStartOfWeek(new Date()); // Start with the current week (Monday)

    // --- Permissions (Derived from passed currentUser) ---
    const isAdmin = currentUser && currentUser.role === 'admin';
    const isSupervisor = currentUser && currentUser.role === 'supervisor';
    const canEditSchedule = isAdmin || isSupervisor;
    console.log(`Permissions: isAdmin=${isAdmin}, isSupervisor=${isSupervisor}, canEditSchedule=${canEditSchedule}`);

    // --- Utility Functions ---
    function showToast(message, type = 'success') {
        if (!toastNotification) {
            console.warn("Toast element not found, cannot show message:", message);
            return;
        }
        toastNotification.textContent = message;
        // Use theme variables for colors if defined, otherwise fallback
        const successColor = getComputedStyle(document.documentElement).getPropertyValue('--success') || '#10b981';
        const dangerColor = getComputedStyle(document.documentElement).getPropertyValue('--danger') || '#ef4444';
        toastNotification.style.backgroundColor = type === 'success' ? successColor : dangerColor;
        toastNotification.classList.add('show');
        // Automatically remove after duration
        setTimeout(() => {
            toastNotification.classList.remove('show');
        }, 3000);
    }

    function getStartOfWeek(date) {
        const dt = new Date(date);
        const day = dt.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        const diff = dt.getDate() - day + (day === 0 ? -6 : 1); // Adjust Sunday to start on preceding Monday
        dt.setDate(diff);
        dt.setHours(0, 0, 0, 0); // Normalize to start of the day
        return dt;
    }

    function formatDate(date, format = 'yyyy-mm-dd') {
        try {
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');

            if (format === 'yyyy-mm-dd') {
                return `${yyyy}-${mm}-${dd}`;
            } else if (format === 'short') {
                // More robust short format
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            } else if (format === 'weekday-short') {
                 return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            }
            return `${yyyy}-${mm}-${dd}`; // Default
        } catch (e) {
            console.error("Error formatting date:", date, e);
            return "Invalid Date";
        }
    }

    function getShiftClass(type) {
        const classes = {
            'morning': 'shift-morning', 'afternoon': 'shift-afternoon', 'night': 'shift-night',
            'day-off': 'day-off', 'sick-leave': 'sick-leave', 'vacation': 'vacation',
            'custom': 'shift-custom' // Use a distinct class for custom
        };
        return classes[type] || 'shift-custom'; // Default to custom if type unknown
    }

    function getShiftText(type, customText = '') {
        const texts = {
            'morning': '9AM-5PM', 'afternoon': '12PM-8PM', 'night': '5PM-1AM',
            'day-off': 'OFF', 'sick-leave': 'SICK', 'vacation': 'VAC'
        };
        if (type === 'custom') {
            return customText || 'Custom'; // Return provided custom text or default
        }
        return texts[type] || type; // Return standard text or the type itself if unknown
    }

    // --- Core Logic ---
    function updateWeekDisplay() {
        console.log(`updateWeekDisplay: Updating for week starting: ${currentWeekStart.toDateString()}`);
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const startStr = formatDate(currentWeekStart, 'short');
        const endStr = formatDate(weekEnd, 'short');
        const year = currentWeekStart.getFullYear();
        weekDisplay.textContent = `${startStr} - ${endStr}, ${year}`;

        // Update table header dates
        const dateHeaders = scheduleTable?.querySelectorAll('thead .day-date'); // Be more specific
        if (dateHeaders && dateHeaders.length === 7) {
             const tempDate = new Date(currentWeekStart);
             dateHeaders.forEach(cell => {
                 cell.textContent = formatDate(tempDate, 'short');
                 tempDate.setDate(tempDate.getDate() + 1);
             });
        } else {
            console.warn("Could not find exactly 7 '.day-date' elements in table header.");
        }


        // Disable navigation buttons if needed (adjust range as necessary)
        // const minDate = new Date(2023, 0, 1); // Example min
        // const maxDate = new Date(2026, 11, 31); // Example max
        // prevWeekBtn.disabled = currentWeekStart <= minDate;
        // nextWeekBtn.disabled = weekEnd >= maxDate;
         prevWeekBtn.disabled = false; // Enable for now
         nextWeekBtn.disabled = false;

        // Render the schedule table for the new week
        renderScheduleTable();
    }

    function renderScheduleTable() {
        console.log("renderScheduleTable: Starting render...");
        if (!scheduleTableBody) {
            console.error("renderScheduleTable: CRITICAL - scheduleTableBody element not found!");
            return;
        }
        scheduleTableBody.innerHTML = ''; // Clear previous rows

        if (scheduleEmployees.length === 0) {
            console.log("renderScheduleTable: No employees array or empty array.");
            scheduleTableBody.innerHTML = `<tr><td colspan="8">No employees found. Add employees via Settings > Team Management.</td></tr>`;
            return;
        }

        console.log(`renderScheduleTable: Rendering ${scheduleEmployees.length} employee rows...`);
        scheduleEmployees.forEach((emp, empIndex) => {
             if (!emp || typeof emp.id === 'undefined' || !emp.name) {
                  console.warn(`renderScheduleTable: Skipping invalid employee data at index ${empIndex}:`, emp);
                  return; // Skip invalid employee entries
             }
            console.log(`  Rendering row ${empIndex + 1}: ID=${emp.id}, Name=${emp.name}`);
            const row = document.createElement('tr');
            row.dataset.employeeId = emp.id;

            // Employee Name Cell
            const nameCell = document.createElement('td');
            nameCell.className = 'employee-name';
            nameCell.textContent = emp.name;
            row.appendChild(nameCell);

            // Day Cells
            for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                const cellDate = new Date(currentWeekStart);
                cellDate.setDate(cellDate.getDate() + dayIndex);
                const dateStr = formatDate(cellDate); // Get 'yyyy-mm-dd'
                const key = `${emp.id}-${dateStr}`;
                const shiftInfo = scheduleData[key]; // Get shift data for this specific cell

                const cell = document.createElement('td');
                cell.dataset.date = dateStr;
                cell.dataset.dayIndex = dayIndex; // Store 0-6 index

                let cellContent = '';
                if (shiftInfo) {
                    cellContent = `<div class="shift ${getShiftClass(shiftInfo.type)}" title="${shiftInfo.notes || ''}">${getShiftText(shiftInfo.type, shiftInfo.text)}</div>`;
                }

                if (canEditSchedule) {
                    cell.classList.add('admin-controls');
                    // Add the edit span regardless of whether there's a shift, so it can be clicked to *add* a shift
                    cellContent += `<span class="edit-shift" title="Edit Shift"></span>`;
                     cell.innerHTML = cellContent;
                    // Add listener directly to the span AFTER setting innerHTML
                     const editSpan = cell.querySelector('.edit-shift');
                     if (editSpan) {
                         editSpan.addEventListener('click', handleEditShiftClick);
                     }
                } else {
                     cell.innerHTML = cellContent; // Just show the shift div if it exists
                }
                row.appendChild(cell);
            }
            scheduleTableBody.appendChild(row);
        });
        console.log("renderScheduleTable: Finished rendering rows.");
    }

    // --- Event Handlers ---
    function handlePrevWeek() {
        console.log("handlePrevWeek clicked");
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        updateWeekDisplay();
    }

    function handleNextWeek() {
        console.log("handleNextWeek clicked");
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        updateWeekDisplay();
    }

    function handleShiftTypeChange() {
        console.log("handleShiftTypeChange:", this.value);
        if (customShiftGroup) {
             customShiftGroup.style.display = this.value === 'custom' ? 'block' : 'none';
        }
    }

    function openEmployeeModal() {
        console.log("openEmployeeModal clicked");
        if (!isAdmin) { // Security check
            showToast("Only Admins can add employees here.", "danger");
            return;
        }
        if (!employeeModal) return;
        employeeForm.reset(); // Clear form
        // Optional: Set default role or apply role restrictions based on current user
        if (empRoleSelect) {
            const adminOption = empRoleSelect.querySelector('option[value="admin"]');
            const supervisorOption = empRoleSelect.querySelector('option[value="supervisor"]');
            if(adminOption) adminOption.disabled = !isAdmin; // Only admins can add admins
            if(supervisorOption) supervisorOption.disabled = !isAdmin; // Only admins can add supervisors
        }
        employeeModal.classList.add('active'); // Use class to show modal
        featureContainer.querySelector('#empName')?.focus(); // Optional chaining for safety
    }

    function closeEmployeeModalHandler() {
        console.log("closeEmployeeModalHandler called");
        if (!employeeModal) return;
        employeeModal.classList.remove('active'); // Use class to hide
    }

    function handleAddEmployeeSubmit(e) {
        e.preventDefault();
        console.log("handleAddEmployeeSubmit called");
         if (!isAdmin) { // Security check
              showToast("Permission denied.", "danger");
              return;
         }

        const nameInput = featureContainer.querySelector('#empName');
        const emailInput = featureContainer.querySelector('#empEmail');
        const positionInput = featureContainer.querySelector('#empPosition');
        const roleInput = featureContainer.querySelector('#empRole');

        if(!nameInput || !emailInput || !roleInput) {
            console.error("Could not find employee form inputs.");
            return;
        }

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const position = positionInput?.value.trim() || ''; // Position is optional
        const role = roleInput.value;

        if (!name || !email || !role) {
            showToast("Please fill in Name, Email, and Role.", "danger");
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) { // Basic email validation
             showToast("Please enter a valid email address.", "danger");
             return;
        }

        if (scheduleEmployees.some(emp => emp.email.toLowerCase() === email.toLowerCase())) {
            showToast("An employee with this email already exists in the schedule view.", "danger");
            return;
        }

        // IMPORTANT: This adds locally ONLY. Needs mechanism to update main dashboard data.
        const newEmployee = {
            id: `temp-${Date.now()}`, // Temporary ID for local rendering
            name: name,
            email: email,
            role: role,
            position: position,
            // Add initials if needed: initials: name.split(' ').map(n=>n[0]).join('').toUpperCase()
        };
        console.log("Adding new employee locally:", newEmployee);
        scheduleEmployees.push(newEmployee);
        renderScheduleTable(); // Re-render table
        closeEmployeeModalHandler();
        showToast(`Employee ${name} added to schedule view.`);

        // Emit an event to notify dashboard.js (requires dashboard.js to listen)
         console.log("Dispatching teamMemberAdded event");
         document.dispatchEvent(new CustomEvent('teamMemberAdded', {
             detail: { ...newEmployee } // Send a copy
         }));
    }


    function handleEditShiftClick(event) {
        console.log("handleEditShiftClick called");
        if (!canEditSchedule) return; // Permission check

        const targetCell = event.target.closest('td');
        if (!targetCell) {
            console.error("Could not find parent cell for edit click.");
            return;
        }
        const targetRow = targetCell.closest('tr');
        if (!targetRow) {
            console.error("Could not find parent row for edit click.");
            return;
        }

        const empIdStr = targetRow.dataset.employeeId; // ID might be string if temporary
        const dateStr = targetCell.dataset.date; // 'yyyy-mm-dd'
        const dayIndexStr = targetCell.dataset.dayIndex; // '0'-'6'

        if (typeof empIdStr === 'undefined' || typeof dateStr === 'undefined' || typeof dayIndexStr === 'undefined') {
            console.error("Missing data attributes on cell/row:", { empIdStr, dateStr, dayIndexStr });
            return;
        }

        const dayIndex = parseInt(dayIndexStr, 10);
        // Find employee (handle potential string/number ID difference if using temporary IDs)
        const employee = scheduleEmployees.find(e => String(e.id) === empIdStr);

        if (!employee) {
            console.error(`Employee not found for ID: ${empIdStr}`);
            return;
        }
        console.log(`Editing shift for Employee: ${employee.name} (${empIdStr}), Date: ${dateStr}, DayIndex: ${dayIndex}`);

        const key = `${empIdStr}-${dateStr}`;
        const currentShift = scheduleData[key];
        console.log("Current shift data for this cell:", currentShift);

        // --- Populate Modal ---
        if (!editShiftEmpIdInput || !editShiftDayIndexInput || !shiftEmployeeDisplay || !shiftDateDisplay || !shiftForm || !shiftTypeSelect || !customShiftInput || !shiftNotesInput) {
            console.error("One or more shift modal elements not found!");
            return;
        }

        editShiftEmpIdInput.value = empIdStr;
        editShiftDayIndexInput.value = dayIndex; // Store index
        shiftEmployeeDisplay.value = employee.name;
        // Display a more readable date in the modal
        const displayDate = new Date(dateStr + 'T00:00:00'); // Ensure correct date parsing
        shiftDateDisplay.value = formatDate(displayDate, 'weekday-short');

        if (currentShift) {
            shiftTypeSelect.value = currentShift.type || 'morning'; // Default if type missing
            customShiftInput.value = currentShift.type === 'custom' ? currentShift.text : '';
            shiftNotesInput.value = currentShift.notes || '';
        } else {
            // Reset form if no current shift exists for this cell
            shiftForm.reset();
            shiftTypeSelect.value = 'morning'; // Default to morning shift
        }

        // Trigger change event manually to ensure custom field visibility updates
         shiftTypeSelect.dispatchEvent(new Event('change'));


        shiftModal.classList.add('active'); // Show modal using class
        shiftTypeSelect.focus();
    }

    function closeShiftModalHandler() {
        console.log("closeShiftModalHandler called");
        if (!shiftModal) return;
        shiftModal.classList.remove('active'); // Hide modal using class
    }

    function handleShiftFormSubmit(e) {
        e.preventDefault();
        console.log("handleShiftFormSubmit called");

        const empId = editShiftEmpIdInput.value; // Keep as string to match temp IDs
        const dayIndex = parseInt(editShiftDayIndexInput.value, 10);
        const shiftType = shiftTypeSelect.value;
        const customText = customShiftInput.value.trim();
        const notes = shiftNotesInput.value.trim();

        if (isNaN(dayIndex) || dayIndex < 0 || dayIndex > 6) {
            console.error("Invalid dayIndex retrieved from form:", dayIndex);
            return;
        }

        // Reconstruct the date string based on the *current* week start and the stored dayIndex
        const targetDate = new Date(currentWeekStart);
        targetDate.setDate(targetDate.getDate() + dayIndex);
        const dateStr = formatDate(targetDate); // 'yyyy-mm-dd'

        const key = `${empId}-${dateStr}`;
        console.log(`Saving shift for key: ${key}, Type: ${shiftType}`);

        if (shiftType === 'delete') {
            delete scheduleData[key]; // Remove the entry
            console.log(`Deleted shift data for key: ${key}`);
        } else {
            scheduleData[key] = {
                type: shiftType,
                text: shiftType === 'custom' ? (customText || 'Custom') : getShiftText(shiftType), // Use custom text or standard
                notes: notes
            };
            console.log(`Saved shift data for key ${key}:`, scheduleData[key]);
        }

        // --- Update the specific cell in the table (Direct DOM Manipulation) ---
        const cellToUpdate = scheduleTableBody?.querySelector(`tr[data-employee-id="${empId}"] td[data-day-index="${dayIndex}"]`);

        if (cellToUpdate) {
             console.log("Found cell to update directly.");
             const updatedShiftInfo = scheduleData[key]; // Get the potentially new/deleted info
             let newCellContent = '';

             if (updatedShiftInfo) {
                 newCellContent = `<div class="shift ${getShiftClass(updatedShiftInfo.type)}" title="${updatedShiftInfo.notes || ''}">${getShiftText(updatedShiftInfo.type, updatedShiftInfo.text)}</div>`;
             }

             if (canEditSchedule) {
                 newCellContent += `<span class="edit-shift" title="Edit Shift"></span>`;
                 cellToUpdate.innerHTML = newCellContent;
                 // Re-attach listener to the new edit span
                 const newEditSpan = cellToUpdate.querySelector('.edit-shift');
                 if (newEditSpan) {
                     newEditSpan.addEventListener('click', handleEditShiftClick);
                 }
             } else {
                 cellToUpdate.innerHTML = newCellContent; // Just update shift div
             }
        } else {
            console.warn(`Could not find cell to update: [empId="${empId}", dayIndex="${dayIndex}"]. Performing full table re-render as fallback.`);
            renderScheduleTable(); // Fallback if direct update fails
        }

        closeShiftModalHandler();
        showToast(`Shift for ${shiftEmployeeDisplay.value} on ${dateStr} updated!`);
        // Consider marking schedule as 'dirty' / needing save
        if(saveScheduleBtn) saveScheduleBtn.style.border = '2px solid var(--warning)'; // Visual indicator
    }


    function handleSaveSchedule() {
        console.log("handleSaveSchedule clicked. Saving data:", scheduleData);
        // Simulate saving to backend/localStorage
        try {
            localStorage.setItem('employeeScheduleData', JSON.stringify(scheduleData));
            showToast('Schedule saved successfully!');
             if(saveScheduleBtn) saveScheduleBtn.style.border = 'none'; // Remove indicator
        } catch (e) {
            console.error("Error saving schedule data to localStorage:", e);
            showToast('Error saving schedule.', 'danger');
        }
        // In a real app, you'd send `scheduleData` to your server API.
    }

    function handleSendReminders() {
         console.log("handleSendReminders clicked");
         if (!canEditSchedule) { // Only admins/supervisors
             showToast("Permission denied.", "danger");
             return;
         }
         const subject = encodeURIComponent(`Work Schedule: Week of ${formatDate(currentWeekStart, 'short')}`);
         const body = encodeURIComponent(`Hi Team,\n\nPlease find your schedule for the upcoming week (${formatDate(currentWeekStart, 'short')} - ${formatDate(new Date(currentWeekStart).setDate(currentWeekStart.getDate() + 6), 'short')}).\n\n[You might add a link to the schedule or specific details here if possible]\n\nBest regards,\n${currentUser.name || 'Management'}`);
         const recipientEmails = scheduleEmployees.map(e => e.email).filter(Boolean).join(',');

         if (!recipientEmails) {
             showToast('No employee emails found to send reminders.', 'danger');
             return;
         }

         const mailtoLink = `mailto:?bcc=${recipientEmails}&subject=${subject}&body=${body}`;
         console.log("Generated mailto link (length):", mailtoLink.length); // Check length limits if issues

         try {
             // Attempt to open mail client
             // window.open(mailtoLink); // Can be blocked
             const link = document.createElement('a');
             link.href = mailtoLink;
             link.style.display = 'none';
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);
             showToast('Email client should be opening...');
         } catch (e) {
             console.error("Error opening mailto link:", e);
             showToast('Could not open mail client.', 'danger');
             // Fallback or provide link
             prompt("Copy mailto link:", mailtoLink);
         }
     }


    // --- Event Listener Setup ---
    function setupScheduleEventListeners() {
        console.log("setupScheduleEventListeners: Attaching listeners...");

        prevWeekBtn?.addEventListener('click', handlePrevWeek);
        nextWeekBtn?.addEventListener('click', handleNextWeek);
        shiftTypeSelect?.addEventListener('change', handleShiftTypeChange);

        // Modals
        addEmployeeBtn?.addEventListener('click', openEmployeeModal);
        closeEmployeeModal?.addEventListener('click', closeEmployeeModalHandler);
        cancelEmployeeBtn?.addEventListener('click', closeEmployeeModalHandler);
        closeShiftModal?.addEventListener('click', closeShiftModalHandler);
        cancelShiftBtn?.addEventListener('click', closeShiftModalHandler);

        // Close modals on background click
        employeeModal?.addEventListener('click', (event) => { if (event.target === employeeModal) closeEmployeeModalHandler(); });
        shiftModal?.addEventListener('click', (event) => { if (event.target === shiftModal) closeShiftModalHandler(); });

        // Forms
        employeeForm?.addEventListener('submit', handleAddEmployeeSubmit);
        shiftForm?.addEventListener('submit', handleShiftFormSubmit);

        // Action Buttons
        saveScheduleBtn?.addEventListener('click', handleSaveSchedule);
        sendRemindersBtn?.addEventListener('click', handleSendReminders);

         // Listeners for dynamically added '.edit-shift' are attached in renderScheduleTable/handleShiftFormSubmit
        console.log("setupScheduleEventListeners: Listeners attached.");
    }

    // --- Initial Setup Called Once ---
    function init() {
        console.log("init: Starting Employee Schedule module initialization...");
        // 1. Load any saved schedule state specific to this module
        const savedData = localStorage.getItem('employeeScheduleData');
        if (savedData) {
            try {
                scheduleData = JSON.parse(savedData);
                console.log("init: Successfully loaded schedule data from localStorage.");
            } catch (e) {
                console.error("init: Error parsing saved schedule data:", e);
                scheduleData = {}; // Reset if parsing fails
            }
        } else {
            console.log("init: No schedule data found in localStorage, starting fresh.");
            scheduleData = {}; // Ensure it's an empty object
        }

        // 2. Apply Permissions (Show/hide buttons)
        if (addEmployeeBtn) addEmployeeBtn.style.display = isAdmin ? 'flex' : 'none'; // Only admin adds directly here
        if (sendRemindersBtn) sendRemindersBtn.style.display = canEditSchedule ? 'flex' : 'none';
        if (saveScheduleBtn) saveScheduleBtn.style.display = canEditSchedule ? 'flex' : 'none';

        // 3. Setup Event Listeners for the schedule section
        setupScheduleEventListeners();

        // 4. Initial Render
        updateWeekDisplay(); // This will render the table for the current week

        console.log("%c--- initializeEmployeeSchedule FINISHED ---", "color: blue; font-weight: bold;");
    }

    // --- Run Initialization ---
    init();

} // End of initializeEmployeeSchedule function
