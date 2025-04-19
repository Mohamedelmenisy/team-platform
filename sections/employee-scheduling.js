```javascript
// Wrap all code in an initialization function
// This function will be called by dashboard.js after the script is loaded
function initializeEmployeeSchedule(currentUser, teamMembers) {
    console.log("Initializing Employee Schedule Module...");
    console.log("Received currentUser:", currentUser);
    console.log("Received teamMembers:", teamMembers);

    // --- DOM Elements (scoped to the loaded section) ---
    const featureContainer = document.getElementById('featureSections'); // Get the parent container
    if (!featureContainer) {
        console.error("Feature container #featureSections not found!");
        return;
    }

    // Use featureContainer.querySelector to scope element selection
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
    const shiftTypeSelect = featureContainer.querySelector('#shiftType'); // Renamed from shiftType
    const customShiftGroup = featureContainer.querySelector('#customShiftGroup');
    const prevWeekBtn = featureContainer.querySelector('#prevWeekBtn');
    const nextWeekBtn = featureContainer.querySelector('#nextWeekBtn');
    const weekDisplay = featureContainer.querySelector('#weekDisplay');
    const saveScheduleBtn = featureContainer.querySelector('#saveScheduleBtn');
    const scheduleTableBody = featureContainer.querySelector('#scheduleTableBody');
    const scheduleTable = featureContainer.querySelector('#scheduleTable');
    const toastNotification = featureContainer.querySelector('#toastNotification');
    const shiftEmployeeDisplay = featureContainer.querySelector('#shiftEmployeeDisplay');
    const shiftDateDisplay = featureContainer.querySelector('#shiftDateDisplay');
    const customShiftInput = featureContainer.querySelector('#customShift');
    const shiftNotesInput = featureContainer.querySelector('#shiftNotes');
    const editShiftEmpIdInput = featureContainer.querySelector('#editShiftEmpId');
    const editShiftDayIndexInput = featureContainer.querySelector('#editShiftDayIndex');
    const empRoleSelect = featureContainer.querySelector('#empRole'); // For add employee modal


    // --- State & Config (specific to this module) ---
    let scheduleData = {}; // Store schedule { 'empId-yyyy-mm-dd': { type: 'morning', text: '9AM-5PM', notes: '' } }
    let currentWeekStart = getStartOfWeek(new Date()); // Start with the current week
    const scheduleEmployees = [...teamMembers]; // Use the passed teamMembers array

    // --- Permissions ---
    const isAdmin = currentUser.role === 'admin';
    const isSupervisor = currentUser.role === 'supervisor';
    const canEditSchedule = isAdmin || isSupervisor;

    // --- Utility Functions ---
    function showToast(message, type = 'success') {
        if (!toastNotification) return;
        toastNotification.textContent = message;
        toastNotification.style.backgroundColor = type === 'success' ? 'var(--success)' : 'var(--danger)'; // Use correct variables
        toastNotification.classList.add('show');
        setTimeout(() => {
            toastNotification.classList.remove('show');
        }, 3000);
    }

    function getStartOfWeek(date) {
         const dt = new Date(date);
         const day = dt.getDay(); // 0 = Sunday, 1 = Monday, ...
         const diff = dt.getDate() - day + (day === 0 ? -6 : 1); // Adjust when Sunday is 0 to make Monday the start
         return new Date(dt.setDate(diff));
     }

    function formatDate(date, format = 'yyyy-mm-dd') {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        if (format === 'yyyy-mm-dd') {
            return `${yyyy}-${mm}-${dd}`;
        } else if (format === 'short') {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        return `${yyyy}-${mm}-${dd}`; // Default
    }

    function getShiftClass(type) {
        const classes = {
            'morning': 'shift-morning', 'afternoon': 'shift-afternoon', 'night': 'shift-night',
            'day-off': 'day-off', 'sick-leave': 'sick-leave', 'vacation': 'vacation',
            'custom': 'shift-morning' // Default class for custom
        };
        return classes[type] || '';
    }

     function getShiftText(type, customText = '') {
        const texts = {
            'morning': '9AM-5PM', 'afternoon': '12PM-8PM', 'night': '5PM-1AM',
            'day-off': 'OFF', 'sick-leave': 'SICK', 'vacation': 'VAC'
        };
        return type === 'custom' ? (customText || 'Custom') : (texts[type] || '');
    }


    // --- Core Logic ---
    function updateWeekDisplay() {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const startStr = formatDate(currentWeekStart, 'short');
        const endStr = formatDate(weekEnd, 'short');
        const year = currentWeekStart.getFullYear();
        weekDisplay.textContent = `${startStr} - ${endStr}, ${year}`;

        // Update table header dates
        const dateHeaders = featureContainer.querySelectorAll('.day-date');
        const tempDate = new Date(currentWeekStart);
        dateHeaders.forEach(cell => {
            cell.textContent = formatDate(tempDate, 'short');
            tempDate.setDate(tempDate.getDate() + 1);
        });

        // Disable navigation buttons if out of reasonable range (e.g., +/- 1 year)
        const minDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
        const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
        const prevWeek = new Date(currentWeekStart);
        prevWeek.setDate(prevWeek.getDate() - 7);
        prevWeekBtn.disabled = prevWeek < minDate;

        const nextWeek = new Date(currentWeekStart);
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeekBtn.disabled = nextWeek > maxDate;

        // Render the schedule for the new week
        renderScheduleTable();
    }

     function renderScheduleTable() {
         if (!scheduleTableBody) return;
         scheduleTableBody.innerHTML = ''; // Clear existing rows

         if (scheduleEmployees.length === 0) {
             scheduleTableBody.innerHTML = `<tr><td colspan="8">No employees found. Add employees in Settings > Team Management.</td></tr>`;
             return;
         }

         scheduleEmployees.forEach(emp => {
             const row = document.createElement('tr');
             row.dataset.employeeId = emp.id;

             // Employee Name Cell (Sticky handled by CSS)
             row.innerHTML = `<td class="employee-name">${emp.name || 'Unnamed'}</td>`;

             // Day Cells
             for (let i = 0; i < 7; i++) {
                 const cellDate = new Date(currentWeekStart);
                 cellDate.setDate(cellDate.getDate() + i);
                 const dateStr = formatDate(cellDate);
                 const key = `${emp.id}-${dateStr}`;
                 const shiftInfo = scheduleData[key]; // Get saved shift info

                 const cell = document.createElement('td');
                 cell.dataset.date = dateStr;
                 cell.dataset.dayIndex = i; // Store day index (0=Mon, 6=Sun)

                 if (canEditSchedule) {
                     cell.classList.add('admin-controls'); // Add class for hover effect
                     cell.innerHTML = `
                         ${shiftInfo ? `<div class="shift ${getShiftClass(shiftInfo.type)}" title="${shiftInfo.notes || ''}">${getShiftText(shiftInfo.type, shiftInfo.text)}</div>` : ''}
                         <span class="edit-shift" title="Edit Shift"></span>
                     `;
                     const editSpan = cell.querySelector('.edit-shift');
                      editSpan.addEventListener('click', handleEditShiftClick); // Add listener directly
                 } else {
                      cell.innerHTML = shiftInfo ? `<div class="shift ${getShiftClass(shiftInfo.type)}">${getShiftText(shiftInfo.type, shiftInfo.text)}</div>` : '';
                 }
                 row.appendChild(cell);
             }
             scheduleTableBody.appendChild(row);
         });
     }


    // --- Event Handlers ---
    function handlePrevWeek() {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        updateWeekDisplay();
    }

    function handleNextWeek() {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        updateWeekDisplay();
    }

    function handleShiftTypeChange() {
        customShiftGroup.style.display = this.value === 'custom' ? 'block' : 'none';
    }

    function openEmployeeModal() {
        employeeForm.reset(); // Clear form
        if (empRoleSelect) { // Enable/disable roles based on current user's role
            const adminOption = empRoleSelect.querySelector('option[value="admin"]');
            const supervisorOption = empRoleSelect.querySelector('option[value="supervisor"]');
            if (adminOption) adminOption.disabled = !isAdmin;
            if (supervisorOption) supervisorOption.disabled = !isAdmin; // Only admins can add other admins/supervisors here
        }
        employeeModal.style.display = 'flex';
        featureContainer.querySelector('#empName').focus();
    }

    function closeEmployeeModalHandler() {
        employeeModal.style.display = 'none';
    }

     function handleAddEmployeeSubmit(e) {
         e.preventDefault();
         if (!isAdmin) { // Double check permission
              showToast("Permission denied to add employees.", "danger");
              return;
         }
         const name = featureContainer.querySelector('#empName').value.trim();
         const email = featureContainer.querySelector('#empEmail').value.trim();
         const position = featureContainer.querySelector('#empPosition').value.trim();
         const role = featureContainer.querySelector('#empRole').value;

         if (!name || !email || !role) {
             showToast("Please fill in Name, Email, and Role.", "danger");
             return;
         }
         if (scheduleEmployees.some(emp => emp.email.toLowerCase() === email.toLowerCase())) {
              showToast("An employee with this email already exists.", "danger");
             return;
         }

         // Note: This adds the employee *only* to the schedule view's local list.
         // Ideally, this should trigger an update in the main dashboard state (e.g., via a callback or custom event)
         // and then re-initialize this module or update scheduleEmployees.
         // For this example, we'll add locally and re-render.
         const newEmployee = {
             id: Date.now(), // Use timestamp for unique ID in this demo context
             name: name,
             email: email,
             role: role,
             // Add position, initials if needed
         };
         scheduleEmployees.push(newEmployee);
         renderScheduleTable(); // Re-render the table with the new employee
         employeeForm.reset();
         closeEmployeeModalHandler();
         showToast(`Employee ${name} added to schedule view.`);
         // --- TODO: Inform dashboard.js about the new employee ---
         // Example using CustomEvent:
         // document.dispatchEvent(new CustomEvent('teamMemberAdded', { detail: newEmployee }));
     }


    function handleEditShiftClick(event) {
         const target = event.target.closest('td'); // Get the table cell
         const empId = parseInt(target.closest('tr').dataset.employeeId);
         const dateStr = target.dataset.date;
         const dayIndex = parseInt(target.dataset.dayIndex);
         const employee = scheduleEmployees.find(e => e.id === empId);

         if (!employee || !dateStr) {
             console.error("Could not find employee or date for shift edit.");
             return;
         }

         const key = `${empId}-${dateStr}`;
         const currentShift = scheduleData[key];

         // Populate Modal
         editShiftEmpIdInput.value = empId;
         editShiftDayIndexInput.value = dayIndex;
         shiftEmployeeDisplay.value = employee.name;
         shiftDateDisplay.value = `${formatDate(new Date(dateStr), 'short')} (${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][dayIndex]})`; // Display readable date

         if (currentShift) {
             shiftTypeSelect.value = currentShift.type || 'morning';
             customShiftInput.value = currentShift.type === 'custom' ? currentShift.text : '';
             shiftNotesInput.value = currentShift.notes || '';
         } else {
             // Default to empty/placeholder if no shift exists
             shiftForm.reset(); // Reset form fields
             shiftTypeSelect.value = 'morning'; // Default selection
         }

         // Trigger change event to show/hide custom input
         shiftTypeSelect.dispatchEvent(new Event('change'));

         shiftModal.style.display = 'flex';
         shiftTypeSelect.focus();
     }

    function closeShiftModalHandler() {
        shiftModal.style.display = 'none';
    }

    function handleShiftFormSubmit(e) {
        e.preventDefault();
        const empId = parseInt(editShiftEmpIdInput.value);
        const dateStr = formatDate(new Date(currentWeekStart.setDate(currentWeekStart.getDate() + parseInt(editShiftDayIndexInput.value)))); // Reconstruct date string
        currentWeekStart.setDate(currentWeekStart.getDate() - parseInt(editShiftDayIndexInput.value)); // Reset week start date

        const dayIndex = parseInt(editShiftDayIndexInput.value); // Ensure this is correct

        const shiftType = shiftTypeSelect.value;
        const customText = customShiftInput.value.trim();
        const notes = shiftNotesInput.value.trim();
        const key = `${empId}-${dateStr}`;


        if (shiftType === 'delete') {
            delete scheduleData[key]; // Remove shift data
        } else {
             scheduleData[key] = {
                 type: shiftType,
                 text: shiftType === 'custom' ? customText : getShiftText(shiftType), // Get standard text if not custom
                 notes: notes
             };
        }

        // Update the specific cell in the table
        const cell = scheduleTableBody.querySelector(`tr[data-employee-id="${empId}"] td[data-day-index="${dayIndex}"]`);
        if (cell) {
             const updatedShiftInfo = scheduleData[key]; // Get potentially updated/deleted info
              if (canEditSchedule) { // Re-render cell content respecting permissions
                  cell.innerHTML = `
                      ${updatedShiftInfo ? `<div class="shift ${getShiftClass(updatedShiftInfo.type)}" title="${updatedShiftInfo.notes || ''}">${getShiftText(updatedShiftInfo.type, updatedShiftInfo.text)}</div>` : ''}
                      <span class="edit-shift" title="Edit Shift"></span>
                  `;
                  const editSpan = cell.querySelector('.edit-shift');
                  editSpan.addEventListener('click', handleEditShiftClick); // Re-attach listener
              } else {
                  cell.innerHTML = updatedShiftInfo ? `<div class="shift ${getShiftClass(updatedShiftInfo.type)}">${getShiftText(updatedShiftInfo.type, updatedShiftInfo.text)}</div>` : '';
              }
        } else {
            console.warn("Could not find cell to update after saving shift.");
             renderScheduleTable(); // Fallback to full re-render if cell not found
        }

        closeShiftModalHandler();
        showToast(`Shift updated successfully!`);
        // Mark schedule as potentially having unsaved changes if needed
    }


    function handleSaveSchedule() {
        // Simulate saving the scheduleData object
        console.log("Saving schedule data:", scheduleData);
        // Here you would typically send scheduleData to your backend API
        localStorage.setItem('employeeScheduleData', JSON.stringify(scheduleData)); // Simulate save
        showToast('Schedule saved successfully!');
        // Reset unsaved changes state if tracked
    }

     function handleSendReminders() {
         if (!isAdmin && !isSupervisor) {
             showToast("Permission denied.", "danger");
             return;
         }
         const subject = encodeURIComponent('Upcoming Work Schedule Reminder');
         const body = encodeURIComponent(`Dear Team,\n\nThis is a reminder of your upcoming work schedule for the week of ${weekDisplay.textContent}.\n\nPlease review your shifts.\n\nBest regards,\n${currentUser.name}`);
         const recipientEmails = scheduleEmployees.map(e => e.email).filter(Boolean).join(','); // Filter out empty emails

         if (!recipientEmails) {
             showToast('No employee emails found to send reminders.', 'danger');
             return;
         }

         // Use BCC for privacy
         const mailtoLink = `mailto:?bcc=${recipientEmails}&subject=${subject}&body=${body}`;

         // Try to open mail client
         try {
            // Using window.open might be blocked by pop-up blockers
            // A safer approach is creating a temporary link and clicking it
            const link = document.createElement('a');
            link.href = mailtoLink;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('Reminder email prepared. Please review and send in your mail client.');

         } catch (e) {
             console.error("Error opening mailto link:", e);
             showToast('Could not open mail client. Please check browser settings.', 'danger');
             // Fallback: show the link or content
             prompt("Copy this mailto link:", mailtoLink);
         }
     }


    // --- Event Listener Setup ---
    function setupScheduleEventListeners() {
        prevWeekBtn.addEventListener('click', handlePrevWeek);
        nextWeekBtn.addEventListener('click', handleNextWeek);
        shiftTypeSelect.addEventListener('change', handleShiftTypeChange);

        // Modal Triggers and Closers
        if (addEmployeeBtn) addEmployeeBtn.addEventListener('click', openEmployeeModal);
        if (closeEmployeeModal) closeEmployeeModal.addEventListener('click', closeEmployeeModalHandler);
        if (cancelEmployeeBtn) cancelEmployeeBtn.addEventListener('click', closeEmployeeModalHandler);
        if (closeShiftModal) closeShiftModal.addEventListener('click', closeShiftModalHandler);
        if (cancelShiftBtn) cancelShiftBtn.addEventListener('click', closeShiftModalHandler);

        // Close modals on outside click
        if (employeeModal) {
            employeeModal.addEventListener('click', (event) => {
                if (event.target === employeeModal) closeEmployeeModalHandler();
            });
        }
         if (shiftModal) {
            shiftModal.addEventListener('click', (event) => {
                if (event.target === shiftModal) closeShiftModalHandler();
            });
        }

        // Form Submissions
        if (employeeForm) employeeForm.addEventListener('submit', handleAddEmployeeSubmit);
        if (shiftForm) shiftForm.addEventListener('submit', handleShiftFormSubmit);

        // Action Buttons
        if (saveScheduleBtn) saveScheduleBtn.addEventListener('click', handleSaveSchedule);
        if (sendRemindersBtn) sendRemindersBtn.addEventListener('click', handleSendReminders);

        // Add initial listeners for dynamically added edit buttons (delegation is an alternative)
        // Note: Listeners are now added directly in renderScheduleTable and handleShiftFormSubmit
    }

    // --- Initial Setup ---
    function init() {
        // Load saved schedule data (if any)
        const savedData = localStorage.getItem('employeeScheduleData');
        if (savedData) {
            try {
                 scheduleData = JSON.parse(savedData);
            } catch (e) {
                 console.error("Error parsing saved schedule data:", e);
                 scheduleData = {};
            }
        }

        // Apply permissions to buttons
        if (addEmployeeBtn) addEmployeeBtn.style.display = isAdmin ? 'flex' : 'none'; // Only admin can add directly here
        if (sendRemindersBtn) sendRemindersBtn.style.display = canEditSchedule ? 'flex' : 'none';
        if (saveScheduleBtn) saveScheduleBtn.style.display = canEditSchedule ? 'flex' : 'none';


        setupScheduleEventListeners();
        updateWeekDisplay(); // Initial render
        console.log("Employee Schedule Module Initialized Successfully.");
    }

    // --- Run Initialization ---
    init();

} // End of initializeEmployeeSchedule function

// Note: This script assumes initializeEmployeeSchedule will be called by dashboard.js
// It doesn't run automatically on its own.
```
