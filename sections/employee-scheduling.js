// sections/employee-scheduling.js
// FINAL COMPLETE VERSION - Including ALL handlers and Full Render Logic

// ★★★ MAKE SURE THIS FUNCTION IS IN THE GLOBAL SCOPE ★★★
function initializeEmployeeSchedule(currentUser, teamMembers) {
    console.log("%c--- initializeEmployeeSchedule STARTED (FINAL COMPLETE CODE) ---", "color: purple; font-weight: bold;");

    // --- Data Validation & Setup ---
    if (!currentUser || typeof currentUser !== 'object') { console.error("CRITICAL: currentUser invalid in initializeEmployeeSchedule!"); return; }
    // Create a local copy or use the passed array directly, ensure it's an array
    const scheduleEmployees = Array.isArray(teamMembers) ? [...teamMembers] : [];
    console.log(`Data Received in Schedule: User Role: ${currentUser.role}, Employee Count: ${scheduleEmployees.length}`);
    if (scheduleEmployees.length === 0) { console.warn("WARNING: scheduleEmployees array is EMPTY in initializeEmployeeSchedule."); }

    // --- DOM Elements (Search *within* the loaded section) ---
    const featureContainer = document.getElementById('featureSections'); // The main container where HTML was injected
    if (!featureContainer) { console.error("CRITICAL: #featureSections container missing in initializeEmployeeSchedule!"); return; }
    console.log("DOM: #featureSections found by schedule script.");

    // Select ALL necessary elements *within* featureContainer
    const scheduleTableBody = featureContainer.querySelector('#scheduleTableBody');
    const weekDisplay = featureContainer.querySelector('#weekDisplay');
    const employeeModal = featureContainer.querySelector('#employeeModal');
    const shiftModal = featureContainer.querySelector('#shiftModal');
    const prevWeekBtn = featureContainer.querySelector('#prevWeekBtn');
    const nextWeekBtn = featureContainer.querySelector('#nextWeekBtn');
    const shiftTypeSelect = featureContainer.querySelector('#shiftType');
    const addEmployeeBtn = featureContainer.querySelector('#addEmployeeBtn');
    const sendRemindersBtn = featureContainer.querySelector('#sendRemindersBtn');
    const saveScheduleBtn = featureContainer.querySelector('#saveScheduleBtn');
    const closeEmployeeModal = featureContainer.querySelector('#closeEmployeeModal');
    const closeShiftModal = featureContainer.querySelector('#closeShiftModal');
    const cancelEmployeeBtn = featureContainer.querySelector('#cancelEmployeeBtn');
    const cancelShiftBtn = featureContainer.querySelector('#cancelShiftBtn');
    const employeeForm = featureContainer.querySelector('#employeeForm');
    const shiftForm = featureContainer.querySelector('#shiftForm');
    const customShiftGroup = featureContainer.querySelector('#customShiftGroup');
    const toastNotification = featureContainer.querySelector('#toastNotification');
    const editShiftEmpIdInput = featureContainer.querySelector('#editShiftEmpId');
    // Corrected ID lookup based on HTML provided
    const editShiftDayIndexInput = featureContainer.querySelector('#editShiftDayIndex'); // Use the ID from HTML
    const shiftEmployeeDisplay = featureContainer.querySelector('#shiftEmployeeDisplay');
    const shiftDateDisplay = featureContainer.querySelector('#shiftDateDisplay');
    const customShiftInput = featureContainer.querySelector('#customShift');
    const shiftNotesInput = featureContainer.querySelector('#shiftNotes');
    const empRoleSelect = featureContainer.querySelector('#empRole');


    // Verify crucial elements needed for core functionality
    if (!scheduleTableBody || !weekDisplay || !employeeModal || !shiftModal || !prevWeekBtn || !nextWeekBtn || !shiftTypeSelect || !addEmployeeBtn || !sendRemindersBtn || !saveScheduleBtn || !editShiftDayIndexInput /*Added check*/ ) {
        console.error("CRITICAL: One or more essential Schedule DOM elements were NOT FOUND within #featureSections.");
        // Optionally display an error message within the featureContainer itself
         featureContainer.innerHTML = '<p style="color:red; padding: 2rem;">Error: Could not initialize schedule section. Required elements missing.</p>';
        return; // Stop initialization if core elements are missing
    }
    console.log("DOM: All essential schedule elements located by schedule script.");

    // --- State & Config ---
    let scheduleData = {}; // To store { 'empId-yyyy-mm-dd': { type: '...', text: '...', notes: '...' } }
    let currentWeekStart = null; // Initialize safely in init()

    // --- Permissions ---
    const isAdmin = currentUser.role === 'admin';
    const isSupervisor = currentUser.role === 'supervisor';
    const canEditSchedule = isAdmin || isSupervisor;
    console.log(`Schedule Permissions: isAdmin=${isAdmin}, isSupervisor=${isSupervisor}, canEditSchedule=${canEditSchedule}`);

    // --- Utility Functions ---
    function showToast(message, type = 'success') {
        if (!toastNotification) { console.warn("Toast element not found"); return; }
        toastNotification.textContent = message;
        // Get colors from CSS variables for theme compatibility
        const successColor = getComputedStyle(document.documentElement).getPropertyValue('--success').trim() || '#10b981';
        const dangerColor = getComputedStyle(document.documentElement).getPropertyValue('--danger').trim() || '#ef4444';
        toastNotification.style.backgroundColor = type === 'success' ? successColor : dangerColor;
        toastNotification.className = 'toast show'; // Use classList for better control if needed
        setTimeout(() => { toastNotification.classList.remove('show'); }, 3000);
    }

    function getStartOfWeek(date) {
        try {
            const dt = new Date(date); // Create a new Date object to avoid modifying the original
            const day = dt.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            // Adjust to Monday (diff = current date - day of week + 1)
            // If Sunday (day=0), treat it as the end of the previous week, so go back 6 days (-6)
            const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
            dt.setDate(diff);
            dt.setHours(0, 0, 0, 0); // Reset time to the start of the day
            if (isNaN(dt)) throw new Error("Calculated date is NaN");
            return dt;
        } catch (e) {
            console.error("Error in getStartOfWeek:", e, "Input date:", date);
            const fallbackDate = new Date(); // Fallback to current date
            fallbackDate.setHours(0, 0, 0, 0);
            return fallbackDate;
        }
    }

    function formatDate(date, format = 'yyyy-mm-dd') {
        try {
            if (!(date instanceof Date) || isNaN(date)) {
                // console.warn("formatDate received invalid date:", date);
                return "Invalid Date";
            }
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
            const dd = String(date.getDate()).padStart(2, '0');

            if (format === 'short') { // e.g., Jul 29
                 return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
            if (format === 'weekday-short') { // e.g., Mon, Jul 29
                return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            }
            // Default 'yyyy-mm-dd'
            return `${yyyy}-${mm}-${dd}`;
        } catch (e) {
            console.error("Error in formatDate:", e);
            return "Date Error";
        }
    }

    function getShiftClass(type) {
        const classes = {
            'morning': 'shift-morning', 'afternoon': 'shift-afternoon', 'night': 'shift-night',
            'day-off': 'day-off', 'sick-leave': 'sick-leave', 'vacation': 'vacation',
            'custom': 'shift-custom'
        };
        return classes[type] || 'shift-custom'; // Default to custom if type is unknown
    }

    function getShiftText(type, customText = '') {
        const texts = {
            'morning': '9AM-5PM', 'afternoon': '12PM-8PM', 'night': '5PM-1AM',
            'day-off': 'OFF', 'sick-leave': 'SICK', 'vacation': 'VAC'
        };
        if (type === 'custom') {
            return customText || 'Custom'; // Use provided custom text or default
        }
        return texts[type] || type; // Return standard text or the type itself if unknown
    }

    // ============================================
    // ALL EVENT HANDLERS DEFINED HERE
    // ============================================

    function handlePrevWeek() {
        console.log("Handler: Prev Week triggered");
        if (!currentWeekStart) { console.error("Prev Week: currentWeekStart is null!"); return; }
        try {
            currentWeekStart.setDate(currentWeekStart.getDate() - 7);
            updateWeekDisplay(); // Re-render the schedule for the new week
        } catch (e) { console.error("Error in handlePrevWeek:", e); }
    }

    function handleNextWeek() {
        console.log("Handler: Next Week triggered");
        if (!currentWeekStart) { console.error("Next Week: currentWeekStart is null!"); return; }
        try {
            currentWeekStart.setDate(currentWeekStart.getDate() + 7);
            updateWeekDisplay(); // Re-render the schedule for the new week
        } catch(e) { console.error("Error in handleNextWeek:", e); }
    }

    function handleShiftTypeChange() {
        // Show/hide custom shift input based on selection
        if (customShiftGroup && shiftTypeSelect) {
            customShiftGroup.style.display = shiftTypeSelect.value === 'custom' ? 'block' : 'none';
        }
    }

    function openEmployeeModal() {
        console.log("Handler: openEmployeeModal");
        if (!isAdmin) { showToast("Permission denied to add employees.", "danger"); return; }
        if (!employeeModal || !employeeForm || !empRoleSelect) { console.error("Cannot open Employee modal - elements missing."); return; }

        employeeForm.reset(); // Clear previous entries

        // Dynamically enable/disable roles based on current user's role (Example: Only admin can add other admins)
        const adminOption = empRoleSelect.querySelector('option[value="admin"]');
        const supervisorOption = empRoleSelect.querySelector('option[value="supervisor"]');
        if (adminOption) adminOption.disabled = !isAdmin; // Only admin can create admin
        if (supervisorOption) supervisorOption.disabled = !isAdmin; // Only admin can create supervisor

        employeeModal.classList.add('active');
        employeeForm.querySelector('#empName')?.focus(); // Focus the first field
    }

    function closeEmployeeModalHandler() {
        if(employeeModal) employeeModal.classList.remove('active');
    }

    function handleAddEmployeeSubmit(e) {
        e.preventDefault();
        console.log("Handler: handleAddEmployeeSubmit");
        if (!isAdmin) { showToast("Permission denied.", "danger"); return; }

        const nameInput = employeeForm.querySelector('#empName');
        const emailInput = employeeForm.querySelector('#empEmail');
        const roleInput = employeeForm.querySelector('#empRole');
        const positionInput = employeeForm.querySelector('#empPosition');

        const name = nameInput?.value.trim();
        const email = emailInput?.value.trim();
        const role = roleInput?.value;
        const position = positionInput?.value.trim() || ''; // Optional field

        if (!name || !email || !role) { showToast("Full Name, Email, and Role are required.", "danger"); return; }

        // Basic Email Validation
        if (!/\S+@\S+\.\S+/.test(email)) { showToast("Invalid email format.", "danger"); return; }

        // Check for duplicate email (case-insensitive)
        if (scheduleEmployees.some(emp => emp.email.toLowerCase() === email.toLowerCase())) {
            showToast("An employee with this email already exists.", "danger");
            return;
        }

        // Add employee locally (In real app, send to server first)
        const newEmployee = {
            id: `temp-${Date.now()}`, // Temporary ID until saved on server
            name: name,
            email: email,
            role: role,
            position: position
        };

        scheduleEmployees.push(newEmployee); // Add to local array
        renderScheduleTable(); // Re-render the table with the new employee
        closeEmployeeModalHandler(); // Close the modal
        showToast(`${name} added to the schedule locally.`);

        // Optional: Dispatch a custom event to notify the main dashboard if needed
        // document.dispatchEvent(new CustomEvent('teamMemberAdded', { detail: { ...newEmployee } }));
    }

    function handleEditShiftClick(event) {
        console.log("Handler: handleEditShiftClick triggered");
        if (!canEditSchedule) { console.log("Edit denied: Insufficient permissions."); return; }
        if (!shiftModal || !shiftForm) { console.error("Cannot open Shift modal - elements missing."); return; }

        const editButton = event.target; // The clicked span.edit-shift
        const targetCell = editButton.closest('td');
        const targetRow = targetCell?.closest('tr');

        if (!targetCell || !targetRow) { console.error("Could not find target cell or row for edit."); return; }

        const empIdStr = targetRow.dataset.employeeId;
        const dateStr = targetCell.dataset.date;
        const dayIndexStr = targetCell.dataset.dayIndex;

        if (!empIdStr || !dateStr || !dayIndexStr) { console.error("Missing data attributes on cell/row for edit."); return; }

        const dayIndex = parseInt(dayIndexStr, 10);
        const employee = scheduleEmployees.find(e => String(e.id) === empIdStr);

        if (!employee) { console.error(`Employee with ID ${empIdStr} not found.`); return; }
        console.log(`Editing shift for Employee: ${employee.name} (ID: ${empIdStr}), Date: ${dateStr}, DayIndex: ${dayIndex}`);

        // Key to find shift data in scheduleData object
        const key = `${empIdStr}-${dateStr}`;
        const currentShift = scheduleData[key]; // Get existing shift data, if any

        // --- Populate Modal ---
        if (!editShiftEmpIdInput || !editShiftDayIndexInput || !shiftEmployeeDisplay || !shiftDateDisplay || !shiftTypeSelect || !customShiftInput || !shiftNotesInput) {
            console.error("Shift modal input elements missing! Cannot populate.");
            return;
        }

        // Set hidden fields and read-only display fields
        editShiftEmpIdInput.value = empIdStr;
        editShiftDayIndexInput.value = dayIndex; // Ensure this ID matches HTML
        shiftEmployeeDisplay.value = employee.name;
        try {
            // Attempt to format the date nicely for display
            const displayDate = new Date(dateStr + 'T00:00:00Z'); // Treat date string as UTC to avoid timezone issues
            shiftDateDisplay.value = formatDate(displayDate, 'weekday-short'); // e.g., "Mon, Jul 29"
        } catch (e) {
            shiftDateDisplay.value = dateStr; // Fallback to raw date string if formatting fails
        }

        // Set form fields based on current shift data or reset if no data
        if (currentShift) {
            shiftTypeSelect.value = currentShift.type || 'morning'; // Default to 'morning' if type is missing
            customShiftInput.value = (currentShift.type === 'custom') ? (currentShift.text || '') : '';
            shiftNotesInput.value = currentShift.notes || '';
        } else {
            // No existing shift, reset form fields
            shiftForm.reset(); // Resets most fields
            shiftTypeSelect.value = 'morning'; // Explicitly set default shift type
            customShiftInput.value = '';
            shiftNotesInput.value = '';
        }

        // Show/hide custom input based on selected type
        handleShiftTypeChange();

        // Show the modal
        shiftModal.classList.add('active');
        shiftTypeSelect.focus(); // Focus the shift type dropdown

    } // End handleEditShiftClick

    function closeShiftModalHandler() {
        if(shiftModal) shiftModal.classList.remove('active');
    }

    function handleShiftFormSubmit(e) {
        e.preventDefault();
        console.log("Handler: handleShiftFormSubmit");
        if (!canEditSchedule) { showToast("Permission denied to modify schedule.", "danger"); return; }

        // Get values from the modal form
        const empId = editShiftEmpIdInput.value;
        const dayIndexStr = editShiftDayIndexInput.value; // Check ID in HTML
        const shiftType = shiftTypeSelect.value;
        const customText = customShiftInput.value.trim();
        const notes = shiftNotesInput.value.trim();

        // Validate day index
        const dayIndex = parseInt(dayIndexStr, 10);
        if (isNaN(dayIndex) || dayIndex < 0 || dayIndex > 6) {
            console.error("Invalid dayIndex:", dayIndexStr);
            showToast("Error saving shift: Invalid data.", "danger");
            return;
        }

        // Calculate the date string for the shift
        const targetDate = new Date(currentWeekStart);
        targetDate.setDate(targetDate.getDate() + dayIndex);
        const dateStr = formatDate(targetDate); // Get 'yyyy-mm-dd' format

        if (dateStr === "Invalid Date") {
             console.error("Failed to calculate target date string.");
             showToast("Error saving shift: Date calculation failed.", "danger");
             return;
        }

        // Construct the key for the scheduleData object
        const key = `${empId}-${dateStr}`;
        console.log(`Saving shift for key: ${key}, Type: ${shiftType}`);

        // Update the scheduleData object
        if (shiftType === 'delete') {
            // User selected "-- Clear Shift --"
            delete scheduleData[key];
            console.log(`   Shift data deleted for ${key}`);
        } else {
            // Add or update shift data
            scheduleData[key] = {
                type: shiftType,
                // Use custom text only if type is 'custom', otherwise use standard text
                text: shiftType === 'custom' ? (customText || 'Custom') : getShiftText(shiftType),
                notes: notes
            };
            console.log(`   Shift data updated for ${key}:`, scheduleData[key]);
        }

        // --- Update the specific Cell UI directly for better performance ---
        const cellToUpdate = scheduleTableBody?.querySelector(`tr[data-employee-id="${empId}"] td[data-day-index="${dayIndex}"]`);
        if (cellToUpdate) {
            console.log(`   Updating cell UI for dayIndex ${dayIndex}`);
            const updatedShiftInfo = scheduleData[key]; // Get the potentially new/deleted data
            let newCellContent = '';

            if (updatedShiftInfo) {
                // If shift exists, create the shift div
                newCellContent = `<div class="shift ${getShiftClass(updatedShiftInfo.type)}" title="${updatedShiftInfo.notes || ''}">${getShiftText(updatedShiftInfo.type, updatedShiftInfo.text)}</div>`;
            } else {
                // If shift was deleted, the content is empty
                newCellContent = '';
            }

            // Add the edit button back if the user has permission
            if (canEditSchedule) {
                 cellToUpdate.classList.add('admin-controls'); // Ensure class is present
                 // Add edit span AFTER the shift content (or as the only content if shift is empty)
                 newCellContent += `<span class="edit-shift" title="Edit Shift"></span>`;
                 cellToUpdate.innerHTML = newCellContent;
                 // Re-attach the event listener to the NEW edit button
                 const newEditSpan = cellToUpdate.querySelector('.edit-shift');
                 if (newEditSpan) {
                     newEditSpan.addEventListener('click', handleEditShiftClick);
                 }
            } else {
                // User cannot edit, just set the shift content (which might be empty)
                 cellToUpdate.innerHTML = newCellContent;
                 cellToUpdate.classList.remove('admin-controls'); // Ensure class is absent
            }
             console.log(`   Cell UI updated.`);
        } else {
            // Fallback: If finding the specific cell fails, re-render the whole table
             console.warn("   Could not find specific cell to update. Re-rendering entire table as fallback.");
             renderScheduleTable();
        }


        closeShiftModalHandler(); // Close the modal
        showToast(`Shift updated successfully!`);

        // Indicate that changes are unsaved (e.g., visual cue on save button)
        if(saveScheduleBtn) {
             saveScheduleBtn.style.border = '2px solid orange'; // Example indicator
             saveScheduleBtn.textContent = 'Save Schedule*'; // Example indicator
        }

    } // End handleShiftFormSubmit


    function handleSaveSchedule() {
        console.log("Handler: handleSaveSchedule triggered");
        if (!canEditSchedule) { showToast("Permission denied to save schedule.", "danger"); return; }

        try {
            // In a real app, send scheduleData to the server via API call
            // For now, save to localStorage
            localStorage.setItem('employeeScheduleData', JSON.stringify(scheduleData));
            showToast('Schedule saved successfully!');
            console.log("Schedule data saved to localStorage.");

            // Remove unsaved changes indicator
             if(saveScheduleBtn) {
                 saveScheduleBtn.style.border = ''; // Remove indicator
                 saveScheduleBtn.innerHTML = '<i class="fas fa-save"></i> Save Schedule'; // Restore original text/icon
             }

        } catch (e) {
            console.error("Error saving schedule to localStorage:", e);
            showToast('Error saving schedule. Check console.', 'danger');
        }
    }

    function handleSendReminders() {
        console.log("Handler: handleSendReminders triggered");
        if (!canEditSchedule) { showToast("Permission denied.", "danger"); return; }

        if (!currentWeekStart) { showToast("Cannot send reminders: Week not loaded.", "danger"); return; }

        try {
            const weekEnd = new Date(currentWeekStart);
            weekEnd.setDate(currentWeekStart.getDate() + 6);

            const subject = `Schedule: ${formatDate(currentWeekStart, 'short')} - ${formatDate(weekEnd, 'short')}`;
            const body = `Hello Team,\n\nPlease find the schedule for the week of ${formatDate(currentWeekStart, 'short')} to ${formatDate(weekEnd, 'short')}.\n\n[You might want to add a link to the dashboard or attach the schedule data here]\n\nBest regards,\n${currentUser.name || 'Management'}`;

            // Get employee emails (filter out employees without emails)
            const recipients = scheduleEmployees
                .map(e => e.email)
                .filter(email => email && /\S+@\S+\.\S+/.test(email)) // Ensure email exists and is valid format
                .join(',');

            if (!recipients) {
                showToast('No valid employee emails found to send reminders.', 'danger');
                return;
            }

            // Construct mailto link (using bcc for privacy)
            // Note: mailto links have limitations on length and reliability across email clients
            const mailtoLink = `mailto:?bcc=${recipients}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            console.log("Generated mailto link:", mailtoLink);

            // Attempt to open the mail client
            // Using a temporary link element is a common way to trigger mailto
            const a = document.createElement('a');
            a.href = mailtoLink;
            a.target = '_blank'; // Suggest opening in a new tab/window (behavior depends on browser/OS)
            a.rel = 'noopener noreferrer';
            document.body.appendChild(a); // Append temporarily
            a.click(); // Trigger the link
            document.body.removeChild(a); // Clean up the link

            showToast('Opening email client...');

        } catch (e) {
             console.error("Error generating or triggering mailto link:", e);
             showToast('Could not open email client. Please copy emails manually.', 'danger');
        }
    }


    // ============================================
    // CORE RENDERING LOGIC
    // ============================================

    function renderScheduleTable() {
        console.log(`%c--- renderScheduleTable CALLED --- Emp Count: ${scheduleEmployees.length}`, "color: green;");
        if (!scheduleTableBody) { console.error("renderScheduleTable: FATAL - scheduleTableBody missing!"); return; }
        if (!currentWeekStart) { console.error("renderScheduleTable: FATAL - currentWeekStart is not set!"); return; }

        scheduleTableBody.innerHTML = ''; // Clear previous content

        if (scheduleEmployees.length === 0) {
            console.log("renderScheduleTable: No employees to display.");
            const row = scheduleTableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 8; // Employee name + 7 days
            cell.textContent = "No employees found or added yet.";
            cell.style.cssText = 'text-align: center; padding: 2rem; color: var(--gray); font-style: italic;';
            return;
        }

        console.log("renderScheduleTable: Starting to render rows for each employee...");
        try {
            scheduleEmployees.forEach((emp) => {
                if (!emp?.id || !emp?.name) { console.warn(`Skipping rendering for invalid employee data:`, emp); return; }

                const row = scheduleTableBody.insertRow();
                row.dataset.employeeId = emp.id; // Add employee ID for reference

                // --- Render Employee Name Cell (Sticky) ---
                const nameCell = row.insertCell();
                nameCell.className = 'employee-name'; // Apply sticky styling
                nameCell.textContent = emp.name;
                // You could add position/role here too if desired
                // nameCell.innerHTML = `${emp.name}<br><small>${emp.position || emp.role || ''}</small>`;

                // --- Render Cells for each day of the week ---
                for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                    const cellDate = new Date(currentWeekStart);
                    cellDate.setDate(cellDate.getDate() + dayIndex);
                    const dateStr = formatDate(cellDate); // 'yyyy-mm-dd' format

                    if (dateStr === "Invalid Date") {
                        console.error(`Failed to format date for dayIndex ${dayIndex}`);
                        const errorCell = row.insertCell();
                        errorCell.textContent = 'DateErr';
                        continue; // Skip to next day
                    }

                    // Key to look up shift data
                    const key = `${emp.id}-${dateStr}`;
                    const shiftInfo = scheduleData[key]; // Get data for this employee/day

                    const cell = row.insertCell();
                    cell.dataset.date = dateStr;        // Store date for reference
                    cell.dataset.dayIndex = dayIndex; // Store day index for reference

                    let cellContent = ''; // Start with empty content

                    // If shift data exists, create the shift display element
                    if (shiftInfo) {
                        cellContent = `<div class="shift ${getShiftClass(shiftInfo.type)}" title="${shiftInfo.notes || ''}">${getShiftText(shiftInfo.type, shiftInfo.text)}</div>`;
                    }

                    // If the current user can edit, add the edit button/controls
                    if (canEditSchedule) {
                        cell.classList.add('admin-controls'); // Add class for hover effect container
                        // Append the edit span AFTER the shift content (if any)
                        cellContent += `<span class="edit-shift" title="Edit Shift"></span>`;
                        cell.innerHTML = cellContent; // Set the combined content

                        // ★★★ Attach event listener ONLY to the newly created edit button ★★★
                        const editSpan = cell.querySelector('.edit-shift');
                        if (editSpan) {
                            editSpan.addEventListener('click', handleEditShiftClick);
                        }
                    } else {
                        // User cannot edit, just display the shift content (might be empty)
                        cell.innerHTML = cellContent;
                    }
                } // End loop through days
            }); // End loop through employees

            console.log("renderScheduleTable: Finished rendering all rows.");
        } catch (error) {
             console.error("!!! ERROR during renderScheduleTable loop !!!:", error);
             scheduleTableBody.innerHTML = `<tr><td colspan="8" style="color: red; text-align: center; padding: 2rem;">Error rendering schedule table. Check console.</td></tr>`;
        }
    } // End renderScheduleTable

    function updateWeekDisplay() {
        console.log(`%c--- updateWeekDisplay CALLED ---`, "color: blue;");
        if (!(currentWeekStart instanceof Date) || isNaN(currentWeekStart)) {
            console.error("updateWeekDisplay: currentWeekStart is invalid!", currentWeekStart);
            if(weekDisplay) weekDisplay.textContent = "Date Error";
            return;
        }
        if (!weekDisplay) { console.error("updateWeekDisplay: weekDisplay element missing!"); return; }

        try {
            // Calculate week end date
            const weekEnd = new Date(currentWeekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);

            // Format dates for display
            const startStr = formatDate(currentWeekStart, 'short'); // e.g., "Jul 29"
            const endStr = formatDate(weekEnd, 'short');       // e.g., "Aug 04"
            const year = currentWeekStart.getFullYear();

            if (startStr === "Invalid Date" || endStr === "Invalid Date") throw new Error("Date formatting failed");

            // Update the main week display text
            weekDisplay.textContent = `${startStr} - ${endStr}, ${year}`;

            // Update the individual date headers in the table
            const dateHeaders = featureContainer.querySelector('#scheduleTable thead')?.querySelectorAll('.day-date');
            if (dateHeaders && dateHeaders.length === 7) {
                 const currentDateHeader = new Date(currentWeekStart);
                 dateHeaders.forEach(header => {
                     header.textContent = formatDate(currentDateHeader, 'short'); // e.g., "Jul 29"
                     currentDateHeader.setDate(currentDateHeader.getDate() + 1); // Move to the next day
                 });
            } else {
                 console.warn("Could not find or update table date headers.");
            }

            // Enable navigation buttons (they might be disabled during loading)
            if(prevWeekBtn) prevWeekBtn.disabled = false;
            if(nextWeekBtn) nextWeekBtn.disabled = false;

            console.log("updateWeekDisplay: Triggering full table re-render...");
            renderScheduleTable(); // Call the full render function for the current week

            console.log("updateWeekDisplay: Finished successfully.");
        } catch (error) {
             console.error("Error during updateWeekDisplay:", error);
             if(weekDisplay) weekDisplay.textContent = "Update Error";
             // Optionally display a more prominent error in the UI
        }
    } // End updateWeekDisplay

    // ============================================
    // EVENT LISTENER SETUP (Called once during init)
    // ============================================
    function setupScheduleEventListeners() {
        console.log("setupScheduleEventListeners: Attaching ALL listeners for the schedule section...");
        try {
            // --- Navigation ---
            prevWeekBtn?.addEventListener('click', handlePrevWeek);
            nextWeekBtn?.addEventListener('click', handleNextWeek);

            // --- Shift Modal Type Change ---
            shiftTypeSelect?.addEventListener('change', handleShiftTypeChange);

            // --- Main Action Buttons (Visibility controlled by CSS/JS based on role) ---
            addEmployeeBtn?.addEventListener('click', openEmployeeModal);
            sendRemindersBtn?.addEventListener('click', handleSendReminders);
            saveScheduleBtn?.addEventListener('click', handleSaveSchedule);

            // --- Modal Close/Cancel Buttons ---
            closeEmployeeModal?.addEventListener('click', closeEmployeeModalHandler);
            cancelEmployeeBtn?.addEventListener('click', closeEmployeeModalHandler);
            closeShiftModal?.addEventListener('click', closeShiftModalHandler);
            cancelShiftBtn?.addEventListener('click', closeShiftModalHandler);

            // --- Modal Background Click Close ---
            // Add event listener to the modal overlay itself
            employeeModal?.addEventListener('click', (event) => {
                // Close only if the click is directly on the modal background
                if (event.target === employeeModal) {
                    closeEmployeeModalHandler();
                }
            });
            shiftModal?.addEventListener('click', (event) => {
                if (event.target === shiftModal) {
                    closeShiftModalHandler();
                }
            });

            // --- Form Submissions ---
            employeeForm?.addEventListener('submit', handleAddEmployeeSubmit);
            shiftForm?.addEventListener('submit', handleShiftFormSubmit);

            // --- Edit Shift Click ---
            // IMPORTANT: Listeners for '.edit-shift' are attached dynamically
            // inside renderScheduleTable() because these elements are created dynamically.
            // Adding a listener here to the table body using event delegation is an alternative,
            // but direct attachment in renderScheduleTable is also viable.

            console.log("setupScheduleEventListeners: Listeners attached.");
        } catch (error) {
            console.error("ERROR attaching schedule event listeners:", error);
        }
    } // End setupScheduleEventListeners

    // ============================================
    // INITIALIZATION FUNCTION (Called once by dashboard.js)
    // ============================================
    function init() {
        console.log("init: Starting Employee Schedule module initialization...");
        // --- Load saved schedule data ---
        try {
            const savedData = localStorage.getItem('employeeScheduleData');
            if (savedData) {
                scheduleData = JSON.parse(savedData);
                console.log("init: Schedule data loaded from localStorage.");
            } else {
                scheduleData = {}; // Initialize empty if nothing saved
                console.log("init: No schedule data found in localStorage, initializing empty.");
            }
        } catch (e) {
            console.error("init: Error loading scheduleData from localStorage", e);
            scheduleData = {}; // Fallback to empty on error
        }

        // --- Set initial safe value for currentWeekStart ---
        try {
            currentWeekStart = getStartOfWeek(new Date()); // Get start of the current week
            if (!currentWeekStart || isNaN(currentWeekStart)) throw new Error("getStartOfWeek returned invalid date");
             console.log("init: Initial week start date set to:", currentWeekStart);
        } catch (e) {
            console.error("init: Failed to set initial currentWeekStart", e);
            // Fallback to a known good date if calculation fails
            currentWeekStart = new Date();
            currentWeekStart.setHours(0, 0, 0, 0);
            console.warn("init: Fallback week start date set to:", currentWeekStart);
        }

        // --- Apply Permissions to Buttons ---
        console.log("init: Applying button visibility based on permissions...");
        if (addEmployeeBtn) addEmployeeBtn.style.display = isAdmin ? 'flex' : 'none';
        if (sendRemindersBtn) sendRemindersBtn.style.display = canEditSchedule ? 'flex' : 'none';
        if (saveScheduleBtn) saveScheduleBtn.style.display = canEditSchedule ? 'flex' : 'none';

        // --- Setup ALL event listeners for this section ---
        setupScheduleEventListeners();

        // --- Perform Initial Render ---
        console.log("init: Performing initial call to updateWeekDisplay to render the table...");
        updateWeekDisplay(); // This will render the table for the initial week

        console.log("%c--- initializeEmployeeSchedule INIT FINISHED ---", "color: purple; font-weight: bold;");
    } // End init

    // --- Run Initialization ---
    try {
        init();
    } catch (error) {
        console.error("CRITICAL ERROR during Schedule init():", error);
        // Display a user-friendly error message in the section container
        if(featureContainer) featureContainer.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--danger);">
            <h2>Initialization Error</h2>
            <p>Could not initialize the Employee Scheduling section.</p>
            <p>Please check the console for details.</p>
            </div>`;
    }

} // End of initializeEmployeeSchedule function
