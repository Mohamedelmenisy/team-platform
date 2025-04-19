// sections/employee-scheduling.js

// Wrap all code in the initialization function
function initializeEmployeeSchedule(currentUser, teamMembers) {
    console.log("%c--- initializeEmployeeSchedule STARTED ---", "color: blue; font-weight: bold;");

    // --- Ensure data is received correctly ---
    if (!currentUser || typeof currentUser !== 'object') {
        console.error("CRITICAL: currentUser data is invalid or missing!", currentUser);
        // Display error and stop
        const container = document.getElementById('featureSections');
        if (container) container.innerHTML = '<div class="placeholder-content error-message">Initialization failed: Invalid user data received.</div>';
        return;
    }
    // Ensure teamMembers is an array before logging length or using spread
    const scheduleEmployees = Array.isArray(teamMembers) ? [...teamMembers] : [];
    console.log(`Received currentUser Role: ${currentUser.role}`);
    console.log(`Received teamMembers Count: ${scheduleEmployees.length}`);
    if (scheduleEmployees.length === 0) {
        console.warn("Warning: Received an empty teamMembers array.");
        // Don't stop, but log it. renderScheduleTable should handle this.
    }
    // console.log("Received teamMembers Data:", JSON.stringify(scheduleEmployees)); // Uncomment for full data if needed

    // --- DOM Elements (Scoped & Checked) ---
    const featureContainer = document.getElementById('featureSections');
    if (!featureContainer) {
        console.error("CRITICAL: #featureSections container not found! Cannot initialize schedule.");
        return; // Stop execution if the main container is missing
    }
    console.log("Feature container #featureSections found."); // Confirm container exists

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
        console.error("CRITICAL: One or more essential Schedule DOM elements were NOT FOUND within #featureSections. Check HTML structure and IDs.");
        if (scheduleTableBody) { // Try to display error in table if body exists
            scheduleTableBody.innerHTML = `<tr><td colspan="8" class="error-message" style="color: red; text-align: center; padding: 1rem;">Error: Failed to find required page elements.</td></tr>`;
        } else if(featureContainer) { // Otherwise display in container
             featureContainer.innerHTML = `<div class="placeholder-content error-message">Initialization failed: Missing essential HTML elements for the schedule.</div>`;
        }
        return; // Stop if essential elements are missing
    }
    console.log("All essential DOM elements located successfully.");


    // --- State & Config (specific to this module) ---
    let scheduleData = {}; // Stores { 'empId-yyyy-mm-dd': { type: '...', text: '...', notes: '' } }
    let currentWeekStart = getStartOfWeek(new Date()); // Start with the current week (Monday)

    // --- Permissions (Derived from passed currentUser) ---
    const isAdmin = currentUser && currentUser.role === 'admin';
    const isSupervisor = currentUser && currentUser.role === 'supervisor';
    const canEditSchedule = isAdmin || isSupervisor;
    console.log(`Permissions set: isAdmin=${isAdmin}, isSupervisor=${isSupervisor}, canEditSchedule=${canEditSchedule}`);

    // --- Utility Functions ---
    function showToast(message, type = 'success') {
        if (!toastNotification) {
            console.warn("Toast element not found, cannot show message:", message);
            return;
        }
        toastNotification.textContent = message;
        // Use theme variables for colors if defined, otherwise fallback
        const successColor = getComputedStyle(document.documentElement).getPropertyValue('--success').trim() || '#10b981';
        const dangerColor = getComputedStyle(document.documentElement).getPropertyValue('--danger').trim() || '#ef4444';
        toastNotification.style.backgroundColor = type === 'success' ? successColor : dangerColor;
        toastNotification.className = 'toast'; // Reset classes then add show
        // Force reflow before adding class for animation restart
        void toastNotification.offsetWidth;
        toastNotification.classList.add('show');

        // Automatically remove after duration
        setTimeout(() => {
            toastNotification.classList.remove('show');
        }, 3000);
    }

    function getStartOfWeek(date) {
        const dt = new Date(date);
        const day = dt.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        // Adjust to make Monday the start of the week (day 1)
        const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
        dt.setDate(diff);
        dt.setHours(0, 0, 0, 0); // Normalize to start of the day
        return dt;
    }

    function formatDate(date, format = 'yyyy-mm-dd') {
        try {
            if (!(date instanceof Date) || isNaN(date)) {
                throw new Error("Invalid date object provided");
            }
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
    function renderScheduleTable() {
        console.log(`renderScheduleTable: Starting render for ${scheduleEmployees.length} employees.`);
        if (!scheduleTableBody) {
            console.error("renderScheduleTable: Cannot render, scheduleTableBody is missing!");
            return;
        }
        // Clear previous content *safely*
        while (scheduleTableBody.firstChild) {
            scheduleTableBody.removeChild(scheduleTableBody.firstChild);
        }

        if (scheduleEmployees.length === 0) {
            console.log("renderScheduleTable: No employees to display.");
            const row = scheduleTableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 8; // Ensure it spans all columns
            cell.innerHTML = "No employees available in the schedule."; // Use innerHTML for styling potential
            cell.style.textAlign = 'center';
            cell.style.padding = '2rem';
            cell.style.color = 'var(--gray)';
            cell.style.fontStyle = 'italic';
            return; // Exit after showing the message
        }

        // --- Wrap row creation in try...catch ---
        try {
            scheduleEmployees.forEach((emp, empIndex) => {
                if (!emp || typeof emp.id === 'undefined' || typeof emp.name === 'undefined') {
                    console.warn(`  Skipping invalid employee data at index ${empIndex}:`, emp);
                    return; // Continue to next employee
                }
                // console.log(`  Rendering row ${empIndex + 1}: ID=${emp.id}, Name=${emp.name}`); // Can be verbose

                const row = scheduleTableBody.insertRow(); // Use insertRow
                row.dataset.employeeId = emp.id;

                // Employee Name Cell
                const nameCell = row.insertCell();
                nameCell.className = 'employee-name';
                nameCell.textContent = emp.name || `Employee ${emp.id}`; // Fallback name

                // Day Cells
                for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                    const cellDate = new Date(currentWeekStart);
                    cellDate.setDate(cellDate.getDate() + dayIndex);
                    const dateStr = formatDate(cellDate); // Get 'yyyy-mm-dd'
                    if (dateStr === "Invalid Date") {
                        console.error(`  Error calculating date for day index ${dayIndex}`);
                        continue; // Skip this cell if date is invalid
                    }
                    const key = `${emp.id}-${dateStr}`;
                    const shiftInfo = scheduleData[key];

                    const cell = row.insertCell(); // Use insertCell
                    cell.dataset.date = dateStr;
                    cell.dataset.dayIndex = dayIndex; // Store 0-6 index

                    let cellContent = '';
                    if (shiftInfo) {
                        cellContent = `<div class="shift ${getShiftClass(shiftInfo.type)}" title="${shiftInfo.notes || ''}">${getShiftText(shiftInfo.type, shiftInfo.text)}</div>`;
                    }

                    if (canEditSchedule) {
                        cell.classList.add('admin-controls');
                        // Add the edit span regardless of whether there's a shift
                        cellContent += `<span class="edit-shift" title="Edit Shift"></span>`;
                        cell.innerHTML = cellContent;
                        // Attach listener
                        const editSpan = cell.querySelector('.edit-shift');
                        if (editSpan) {
                            editSpan.addEventListener('click', handleEditShiftClick);
                        } else {
                            console.warn(`Could not find .edit-shift span for cell [${emp.id}, ${dateStr}]`);
                        }
                    } else {
                        cell.innerHTML = cellContent; // Just show the shift div
                    }
                } // End of day cell loop
            }); // End of employee loop
            console.log("renderScheduleTable: Successfully finished rendering rows.");
        } catch (error) {
            console.error("CRITICAL ERROR during renderScheduleTable row creation:", error);
            // Display error message in the table body
            scheduleTableBody.innerHTML = `<tr><td colspan="8" style="color: red; text-align: center; padding: 1rem;">Error rendering schedule rows. Check console.</td></tr>`;
        }
    }

    function updateWeekDisplay() {
        console.log(`updateWeekDisplay: Updating display for week starting: ${currentWeekStart.toDateString()}`);
        if (!weekDisplay) {
            console.error("updateWeekDisplay: weekDisplay element is missing!");
            return;
        }
        try {
            const weekEnd = new Date(currentWeekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            const startStr = formatDate(currentWeekStart, 'short');
            const endStr = formatDate(weekEnd, 'short');
            const year = currentWeekStart.getFullYear();

            if (startStr === "Invalid Date" || endStr === "Invalid Date") {
                 throw new Error("Failed to format week start/end dates.");
            }

            weekDisplay.textContent = `${startStr} - ${endStr}, ${year}`;

            // Update header dates (ensure scheduleTable exists)
            const dateHeaders = featureContainer.querySelector('#scheduleTable thead')?.querySelectorAll('.day-date');
            if (dateHeaders && dateHeaders.length === 7) {
                const tempDate = new Date(currentWeekStart);
                dateHeaders.forEach(cell => {
                    cell.textContent = formatDate(tempDate, 'short');
                    tempDate.setDate(tempDate.getDate() + 1);
                });
            } else {
                console.warn("Could not find table header date cells for update.");
            }

            // --- Handle prev/next button disabling (Optional: Implement date range limits) ---
            // Example: Disable if going too far back/forward
            // const minAllowableDate = new Date(2023, 0, 1);
            // const maxAllowableDate = new Date(); maxAllowableDate.setFullYear(maxAllowableDate.getFullYear() + 1);
            // prevWeekBtn.disabled = currentWeekStart <= minAllowableDate;
            // nextWeekBtn.disabled = weekEnd >= maxAllowableDate;
             prevWeekBtn.disabled = false; // Keep enabled for now
             nextWeekBtn.disabled = false;


            // **Crucially, call renderScheduleTable AFTER setting the week**
            renderScheduleTable();
            console.log("updateWeekDisplay: Finished successfully.");

        } catch (error) {
             console.error("Error during updateWeekDisplay:", error);
             weekDisplay.textContent = "Error loading week";
             if(scheduleTableBody) scheduleTableBody.innerHTML = `<tr><td colspan="8" style="color: red; text-align: center; padding: 1rem;">Error updating week display. Check console.</td></tr>`;
        }
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
        //console.log("handleShiftTypeChange:", this.value); // 'this' might be tricky if called differently
        if (customShiftGroup && shiftTypeSelect) { // Check elements exist
             customShiftGroup.style.display = shiftTypeSelect.value === 'custom' ? 'block' : 'none';
        }
    }

    function openEmployeeModal() {
        console.log("openEmployeeModal clicked");
        if (!isAdmin) {
            showToast("Only Admins can add employees here.", "danger");
            return;
        }
        if (!employeeModal || !employeeForm || !empRoleSelect) {
             console.error("Cannot open employee modal: elements missing.");
             return;
        }
        employeeForm.reset(); // Clear form
        // Set role restrictions
        const adminOption = empRoleSelect.querySelector('option[value="admin"]');
        const supervisorOption = empRoleSelect.querySelector('option[value="supervisor"]');
        if(adminOption) adminOption.disabled = !isAdmin; // Only admins can add admins
        if(supervisorOption) supervisorOption.disabled = !isAdmin; // Only admins can add supervisors

        employeeModal.classList.add('active'); // Use class to show modal
        featureContainer.querySelector('#empName')?.focus(); // Optional chaining
    }

    function closeEmployeeModalHandler() {
        console.log("closeEmployeeModalHandler called");
        if (!employeeModal) return;
        employeeModal.classList.remove('active'); // Use class to hide
    }

    function handleAddEmployeeSubmit(e) {
        e.preventDefault();
        console.log("handleAddEmployeeSubmit called");
        if (!isAdmin) { showToast("Permission denied.", "danger"); return; }

        // Find inputs within the form
        const nameInput = employeeForm.querySelector('#empName');
        const emailInput = employeeForm.querySelector('#empEmail');
        const positionInput = employeeForm.querySelector('#empPosition');
        const roleInput = employeeForm.querySelector('#empRole');

        if(!nameInput || !emailInput || !roleInput) {
            console.error("Could not find employee form inputs.");
            showToast("Form error. Could not find input fields.", "danger");
            return;
        }

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const position = positionInput?.value.trim() || '';
        const role = roleInput.value;

        if (!name || !email || !role) { showToast("Please fill in Name, Email, and Role.", "danger"); return; }
        if (!/\S+@\S+\.\S+/.test(email)) { showToast("Please enter a valid email address.", "danger"); return; }
        if (scheduleEmployees.some(emp => emp.email.toLowerCase() === email.toLowerCase())) { showToast("An employee with this email already exists.", "danger"); return; }

        // Add locally (requires update mechanism for main dashboard data)
        const newEmployee = {
            id: `temp-${Date.now()}`, name: name, email: email, role: role, position: position,
        };
        console.log("Adding new employee locally:", newEmployee);
        scheduleEmployees.push(newEmployee);
        renderScheduleTable(); // Re-render table
        closeEmployeeModalHandler();
        showToast(`Employee ${name} added to schedule view.`);

        // Emit event for dashboard.js
         console.log("Dispatching teamMemberAdded event");
         document.dispatchEvent(new CustomEvent('teamMemberAdded', { detail: { ...newEmployee } }));
    }

    function handleEditShiftClick(event) {
        console.log("handleEditShiftClick called");
        if (!canEditSchedule) { console.warn("Edit denied due to permissions."); return; }
        if (!shiftModal || !shiftForm) { console.error("Shift modal or form not found."); return; }

        const targetCell = event.target.closest('td');
        const targetRow = targetCell?.closest('tr');
        if (!targetCell || !targetRow) { console.error("Could not find cell or row for edit click."); return; }

        const empIdStr = targetRow.dataset.employeeId;
        const dateStr = targetCell.dataset.date;
        const dayIndexStr = targetCell.dataset.dayIndex;

        if (typeof empIdStr === 'undefined' || !dateStr || typeof dayIndexStr === 'undefined') {
            console.error("Missing data attributes on cell/row:", { empIdStr, dateStr, dayIndexStr });
            return;
        }

        const dayIndex = parseInt(dayIndexStr, 10);
        const employee = scheduleEmployees.find(e => String(e.id) === empIdStr);

        if (!employee) { console.error(`Employee not found for ID: ${empIdStr}`); return; }
        console.log(`Editing shift for: ${employee.name} (${empIdStr}), Date: ${dateStr}`);

        const key = `${empIdStr}-${dateStr}`;
        const currentShift = scheduleData[key];
        console.log("Current shift data:", currentShift);

        // --- Populate Modal (Check element existence) ---
        if (!editShiftEmpIdInput || !editShiftDayIndexInput || !shiftEmployeeDisplay || !shiftDateDisplay || !shiftTypeSelect || !customShiftInput || !shiftNotesInput) {
             console.error("One or more shift modal elements not found!");
             return;
        }
        editShiftEmpIdInput.value = empIdStr;
        editShiftDayIndexInput.value = dayIndex;
        shiftEmployeeDisplay.value = employee.name;
        try {
             const displayDate = new Date(dateStr + 'T00:00:00Z'); // Use UTC or ensure consistent timezone handling
             shiftDateDisplay.value = formatDate(displayDate, 'weekday-short');
        } catch(e) {
             console.error("Error creating date for display:", e);
             shiftDateDisplay.value = dateStr + " (Error)";
        }


        if (currentShift) {
            shiftTypeSelect.value = currentShift.type || 'morning';
            customShiftInput.value = currentShift.type === 'custom' ? currentShift.text : '';
            shiftNotesInput.value = currentShift.notes || '';
        } else {
            shiftForm.reset();
            shiftTypeSelect.value = 'morning'; // Default
        }

        handleShiftTypeChange(); // Update custom field visibility based on populated/default value
        shiftModal.classList.add('active');
        shiftTypeSelect.focus();
    }

    function closeShiftModalHandler() {
        console.log("closeShiftModalHandler called");
        if (!shiftModal) return;
        shiftModal.classList.remove('active');
    }

    function handleShiftFormSubmit(e) {
        e.preventDefault();
        console.log("handleShiftFormSubmit called");
        if (!canEditSchedule) { showToast("Permission denied.", "danger"); return; }

        const empId = editShiftEmpIdInput.value;
        const dayIndex = parseInt(editShiftDayIndexInput.value, 10);
        const shiftType = shiftTypeSelect.value;
        const customText = customShiftInput.value.trim();
        const notes = shiftNotesInput.value.trim();

        if (isNaN(dayIndex) || dayIndex < 0 || dayIndex > 6) { console.error("Invalid dayIndex:", dayIndex); return; }

        // Reconstruct date string based on *current* week start and dayIndex
        const targetDate = new Date(currentWeekStart);
        targetDate.setDate(targetDate.getDate() + dayIndex);
        const dateStr = formatDate(targetDate);
        if (dateStr === "Invalid Date") { console.error("Failed to reconstruct date string for saving."); return; }

        const key = `${empId}-${dateStr}`;
        console.log(`Saving shift for key: ${key}, Type: ${shiftType}`);

        if (shiftType === 'delete') {
            delete scheduleData[key];
            console.log(`Deleted shift data for key: ${key}`);
        } else {
            scheduleData[key] = {
                type: shiftType,
                text: shiftType === 'custom' ? (customText || 'Custom') : getShiftText(shiftType),
                notes: notes
            };
            console.log(`Saved shift data for key ${key}:`, scheduleData[key]);
        }

        // --- Update the specific cell in the table ---
        const cellToUpdate = scheduleTableBody?.querySelector(`tr[data-employee-id="${empId}"] td[data-day-index="${dayIndex}"]`);
        if (cellToUpdate) {
            console.log("Found cell to update directly.");
            const updatedShiftInfo = scheduleData[key];
            let newCellContent = '';
            if (updatedShiftInfo) {
                newCellContent = `<div class="shift ${getShiftClass(updatedShiftInfo.type)}" title="${updatedShiftInfo.notes || ''}">${getShiftText(updatedShiftInfo.type, updatedShiftInfo.text)}</div>`;
            }
            if (canEditSchedule) {
                newCellContent += `<span class="edit-shift" title="Edit Shift"></span>`;
                cellToUpdate.innerHTML = newCellContent;
                const newEditSpan = cellToUpdate.querySelector('.edit-shift');
                if (newEditSpan) { newEditSpan.addEventListener('click', handleEditShiftClick); }
            } else {
                cellToUpdate.innerHTML = newCellContent;
            }
        } else {
            console.warn(`Could not find cell to update: [empId="${empId}", dayIndex="${dayIndex}"]. Re-rendering table.`);
            renderScheduleTable(); // Fallback
        }

        closeShiftModalHandler();
        showToast(`Shift updated successfully!`);
        if(saveScheduleBtn) saveScheduleBtn.style.border = '2px solid orange'; // Indicate unsaved changes
    }

    function handleSaveSchedule() {
        console.log("handleSaveSchedule clicked. Saving data:", scheduleData);
        try {
            localStorage.setItem('employeeScheduleData', JSON.stringify(scheduleData));
            showToast('Schedule saved successfully!');
            if(saveScheduleBtn) saveScheduleBtn.style.border = 'none'; // Reset indicator
        } catch (e) {
            console.error("Error saving schedule data to localStorage:", e);
            showToast('Error saving schedule.', 'danger');
        }
    }

    function handleSendReminders() {
        console.log("handleSendReminders clicked");
        if (!canEditSchedule) { showToast("Permission denied.", "danger"); return; }

        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(currentWeekStart.getDate() + 6);
        const subject = encodeURIComponent(`Work Schedule: Week of ${formatDate(currentWeekStart, 'short')}`);
        const body = encodeURIComponent(`Hi Team,\n\nYour schedule for ${formatDate(currentWeekStart, 'short')} - ${formatDate(weekEnd, 'short')} is available.\n\nBest regards,\n${currentUser.name || 'Management'}`);
        const recipientEmails = scheduleEmployees.map(e => e.email).filter(Boolean).join(',');

        if (!recipientEmails) { showToast('No employee emails found.', 'danger'); return; }

        const mailtoLink = `mailto:?bcc=${recipientEmails}&subject=${subject}&body=${body}`;
        console.log("Generated mailto link (length):", mailtoLink.length);

        try {
            const link = document.createElement('a');
            link.href = mailtoLink;
            link.target = '_blank'; // Try opening in new tab first
            link.rel = 'noopener noreferrer'; // Security measure
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('Attempting to open email client...');
        } catch (e) {
            console.error("Error opening mailto link:", e);
            showToast('Could not open mail client automatically.', 'danger');
            prompt("Copy mailto link:", mailtoLink);
        }
    }

    // --- Event Listener Setup ---
    function setupScheduleEventListeners() {
        console.log("setupScheduleEventListeners: Attaching listeners...");
        try {
            // Use optional chaining for safety in case elements are missing
            prevWeekBtn?.addEventListener('click', handlePrevWeek);
            nextWeekBtn?.addEventListener('click', handleNextWeek);
            shiftTypeSelect?.addEventListener('change', handleShiftTypeChange);

            addEmployeeBtn?.addEventListener('click', openEmployeeModal);
            closeEmployeeModal?.addEventListener('click', closeEmployeeModalHandler);
            cancelEmployeeBtn?.addEventListener('click', closeEmployeeModalHandler);
            closeShiftModal?.addEventListener('click', closeShiftModalHandler);
            cancelShiftBtn?.addEventListener('click', closeShiftModalHandler);

            employeeModal?.addEventListener('click', (event) => { if (event.target === employeeModal) closeEmployeeModalHandler(); });
            shiftModal?.addEventListener('click', (event) => { if (event.target === shiftModal) closeShiftModalHandler(); });

            employeeForm?.addEventListener('submit', handleAddEmployeeSubmit);
            shiftForm?.addEventListener('submit', handleShiftFormSubmit);

            saveScheduleBtn?.addEventListener('click', handleSaveSchedule);
            sendRemindersBtn?.addEventListener('click', handleSendReminders);

            console.log("setupScheduleEventListeners: Listeners attached successfully.");
        } catch (error) {
            console.error("ERROR attaching schedule event listeners:", error);
            showToast("Error setting up page interactions.", "danger");
        }
    }

    // --- Initial Setup Called Once ---
    function init() {
        console.log("init: Starting Employee Schedule module initialization...");
        // 1. Load saved schedule data
        try {
            const savedData = localStorage.getItem('employeeScheduleData');
            if (savedData) {
                scheduleData = JSON.parse(savedData);
                console.log("init: Successfully loaded schedule data from localStorage.");
            } else {
                console.log("init: No schedule data found in localStorage.");
                scheduleData = {};
            }
        } catch (e) {
            console.error("init: Error parsing schedule data from localStorage:", e);
            scheduleData = {}; // Start fresh on error
        }

        // 2. Apply Permissions
        console.log("init: Applying button permissions...");
        if (addEmployeeBtn) addEmployeeBtn.style.display = isAdmin ? 'flex' : 'none';
        if (sendRemindersBtn) sendRemindersBtn.style.display = canEditSchedule ? 'flex' : 'none';
        if (saveScheduleBtn) saveScheduleBtn.style.display = canEditSchedule ? 'flex' : 'none';

        // 3. Setup Event Listeners
        setupScheduleEventListeners();

        // 4. Initial Render **AFTER** listeners are set
        console.log("init: Performing initial week display and table render...");
        updateWeekDisplay();

        console.log("%c--- initializeEmployeeSchedule FINISHED ---", "color: green; font-weight: bold;");
    }

    // --- Run Initialization ---
    // Wrap init call in a try...catch as well
    try {
        init();
    } catch (error) {
        console.error("CRITICAL ERROR during Schedule init():", error);
        // Display error in UI
        if (scheduleTableBody) {
             scheduleTableBody.innerHTML = `<tr><td colspan="8" style="color: red; text-align: center; padding: 1rem;">Fatal error during schedule initialization. Check console.</td></tr>`;
        } else if (featureContainer) {
            featureContainer.innerHTML = `<div class="placeholder-content error-message">Fatal error initializing schedule. Check console.</div>`;
        }
    }

} // End of initializeEmployeeSchedule function
