// sections/employee-scheduling.js
// FIX for 'handleEditShiftClick is not defined' error

function initializeEmployeeSchedule(currentUser, teamMembers) {
    console.log("%c--- initializeEmployeeSchedule STARTED (Fixing ReferenceError) ---", "color: green; font-weight: bold;");

    // --- Data Validation & Setup ---
    // ... (Keep as is) ...
    const scheduleEmployees = Array.isArray(teamMembers) ? [...teamMembers] : [];

    // --- DOM Elements ---
    // ... (Keep as is, ensure all needed elements are selected) ...
    const featureContainer = document.getElementById('featureSections');
    const scheduleTableBody = featureContainer?.querySelector('#scheduleTableBody');
    const weekDisplay = featureContainer?.querySelector('#weekDisplay');
    const shiftModal = featureContainer?.querySelector('#shiftModal'); // Needed by handleEditShiftClick
    const shiftForm = featureContainer?.querySelector('#shiftForm'); // Needed by handleEditShiftClick
    const editShiftEmpIdInput = featureContainer?.querySelector('#editShiftEmpId'); // Needed by handleEditShiftClick
    const editShiftDayIndexInput = featureContainer?.querySelector('#editShiftDayIndexInput'); // Corrected ID? Check HTML
    const shiftEmployeeDisplay = featureContainer?.querySelector('#shiftEmployeeDisplay'); // Needed by handleEditShiftClick
    const shiftDateDisplay = featureContainer?.querySelector('#shiftDateDisplay'); // Needed by handleEditShiftClick
    const shiftTypeSelect = featureContainer?.querySelector('#shiftType'); // Needed by handleEditShiftClick
    const customShiftInput = featureContainer?.querySelector('#customShift'); // Needed by handleEditShiftClick
    const shiftNotesInput = featureContainer?.querySelector('#shiftNotes'); // Needed by handleEditShiftClick
    const customShiftGroup = featureContainer?.querySelector('#customShiftGroup'); // Needed by handleEditShiftClick


    if (!featureContainer || !scheduleTableBody || !weekDisplay || !shiftModal || !shiftForm /* || check other modal inputs */) {
         console.error("CRITICAL: Missing essential elements for rendering or editing.");
         return;
    }

    // --- State & Config ---
    // ... (Keep as is) ...
    let scheduleData = {};
    let currentWeekStart = getStartOfWeek(new Date()); // Assume getStartOfWeek is defined and working

    // --- Permissions ---
    // ... (Keep as is) ...
    const isAdmin = currentUser.role === 'admin';
    const isSupervisor = currentUser.role === 'supervisor';
    const canEditSchedule = isAdmin || isSupervisor;

    // --- Utility Functions ---
    // ... (Keep definitions for: showToast, getStartOfWeek, formatDate, getShiftClass, getShiftText) ...
    function getStartOfWeek(date) { /* ... implementation ... */ }
    function formatDate(date, format = 'yyyy-mm-dd') { /* ... implementation ... */ }
    function getShiftClass(type) { /* ... implementation ... */ }
    function getShiftText(type, customText = '') { /* ... implementation ... */ }
    function showToast(message, type = 'success') { /* ... implementation ... */ }
    function handleShiftTypeChange() { if (customShiftGroup && shiftTypeSelect) { customShiftGroup.style.display = shiftTypeSelect.value === 'custom' ? 'block' : 'none'; } } // Define this helper if used


    // --->>> ADD DEFINITION FOR handleEditShiftClick HERE <<<---
    function handleEditShiftClick(event) {
        console.log("handleEditShiftClick triggered!");
        if (!canEditSchedule) { console.warn("Edit denied due to permissions."); return; }
        if (!shiftModal || !shiftForm) { console.error("Shift modal or form not found."); return; }

        const targetCell = event.target.closest('td');
        const targetRow = targetCell?.closest('tr');
        if (!targetCell || !targetRow) { console.error("Could not find cell/row for edit."); return; }

        const empIdStr = targetRow.dataset.employeeId;
        const dateStr = targetCell.dataset.date;
        const dayIndexStr = targetCell.dataset.dayIndex;

        if (typeof empIdStr === 'undefined' || !dateStr || typeof dayIndexStr === 'undefined') {
            console.error("Missing data attributes for edit:", { empIdStr, dateStr, dayIndexStr });
            return;
        }

        const dayIndex = parseInt(dayIndexStr, 10);
        const employee = scheduleEmployees.find(e => String(e.id) === empIdStr);

        if (!employee) { console.error(`Employee not found for ID: ${empIdStr}`); return; }
        console.log(`Editing shift for: ${employee.name} (${empIdStr}), Date: ${dateStr}`);

        const key = `${empIdStr}-${dateStr}`;
        const currentShift = scheduleData[key];
        console.log("Current shift data:", currentShift);

        // Populate Modal (Check elements exist)
        if (!editShiftEmpIdInput || !editShiftDayIndexInput || !shiftEmployeeDisplay || !shiftDateDisplay || !shiftTypeSelect || !customShiftInput || !shiftNotesInput) {
             console.error("One or more shift modal input elements not found!"); return;
        }
        editShiftEmpIdInput.value = empIdStr;
        // Make sure the ID here matches your HTML: editShiftDayIndexInput vs editShiftDayIndex
        if(editShiftDayIndexInput) editShiftDayIndexInput.value = dayIndex; else console.error("#editShiftDayIndexInput not found");
        shiftEmployeeDisplay.value = employee.name;
        try { const d = new Date(dateStr + 'T00:00:00Z'); shiftDateDisplay.value = formatDate(d, 'weekday-short');}
        catch(e){ shiftDateDisplay.value = dateStr + " (Err)"; }

        if (currentShift) {
            shiftTypeSelect.value = currentShift.type || 'morning';
            customShiftInput.value = currentShift.type === 'custom' ? currentShift.text : '';
            shiftNotesInput.value = currentShift.notes || '';
        } else {
            shiftForm.reset();
            shiftTypeSelect.value = 'morning';
        }

        handleShiftTypeChange(); // Update custom field visibility
        shiftModal.classList.add('active'); // Show modal
        shiftTypeSelect.focus();
    }
    // --- End of handleEditShiftClick definition ---


    // --- Core Logic ---
    function renderScheduleTable() {
        console.log(`renderScheduleTable: Rendering ${scheduleEmployees.length} employees.`);
        if (!scheduleTableBody) return;
        scheduleTableBody.innerHTML = ''; // Clear

        if (scheduleEmployees.length === 0) { /* Show 'No employees' */ return; }

        try {
            scheduleEmployees.forEach((emp) => {
                if (!emp?.id || !emp?.name) { return; }
                const row = scheduleTableBody.insertRow(); row.dataset.employeeId = emp.id;
                const nameCell = row.insertCell(); nameCell.className = 'employee-name'; nameCell.textContent = emp.name;

                for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                    const cellDate = new Date(currentWeekStart); cellDate.setDate(cellDate.getDate() + dayIndex);
                    const dateStr = formatDate(cellDate); if (dateStr === "Invalid Date" || dateStr === "Date Error") { const c=row.insertCell(); c.textContent="Err"; continue; }
                    const key = `${emp.id}-${dateStr}`; const shiftInfo = scheduleData[key];
                    const cell = row.insertCell(); cell.dataset.date = dateStr; cell.dataset.dayIndex = dayIndex;
                    let cellContent = '';
                    if (shiftInfo) { cellContent = `<div class="shift ${getShiftClass(shiftInfo.type)}" title="${shiftInfo.notes || ''}">${getShiftText(shiftInfo.type, shiftInfo.text)}</div>`; }
                    if (canEditSchedule) {
                        cell.classList.add('admin-controls'); cellContent += `<span class="edit-shift" title="Edit Shift"></span>`; cell.innerHTML = cellContent;
                        // --->>> Attach listener HERE <<<---
                        const editSpan = cell.querySelector('.edit-shift');
                        if (editSpan) {
                             editSpan.addEventListener('click', handleEditShiftClick); // Now the function exists
                        } else {
                             console.warn(`Could not find edit span for cell [${emp.id}, ${dateStr}]`);
                        }
                    } else { cell.innerHTML = cellContent; }
                }
            });
            console.log("renderScheduleTable: Finished rendering rows.");
        } catch (error) { console.error("ERROR inside renderScheduleTable loop:", error); /* Show error UI */ }
    }

    function updateWeekDisplay() {
        // ... (Keep implementation as before, ensuring it calls renderScheduleTable) ...
         console.log(`%c--- updateWeekDisplay CALLED ---`, "color: blue;");
         if (!(currentWeekStart instanceof Date) || isNaN(currentWeekStart)) { console.error("updateWeekDisplay: currentWeekStart invalid!", currentWeekStart); return; }
         if (!weekDisplay) { console.error("updateWeekDisplay: weekDisplay missing!"); return; }
         try {
             const weekEnd = new Date(currentWeekStart); weekEnd.setDate(weekEnd.getDate() + 6);
             const startStr = formatDate(currentWeekStart, 'short'); const endStr = formatDate(weekEnd, 'short');
             const year = currentWeekStart.getFullYear();
             if (startStr === "Invalid Date" || endStr === "Invalid Date") throw new Error("Date formatting failed");
             weekDisplay.textContent = `${startStr} - ${endStr}, ${year}`;
             const dateHeaders = featureContainer.querySelector('#scheduleTable thead')?.querySelectorAll('.day-date');
             if (dateHeaders) { const t = new Date(currentWeekStart); dateHeaders.forEach(c=>{ c.textContent=formatDate(t,'short'); t.setDate(t.getDate()+1); }); }
             if(prevWeekBtn) prevWeekBtn.disabled = false; if(nextWeekBtn) nextWeekBtn.disabled = false;
             console.log("updateWeekDisplay: Calling renderScheduleTable...");
             renderScheduleTable(); // Call render
             console.log("updateWeekDisplay: Finished.");
         } catch (error) { console.error("Error during updateWeekDisplay:", error); /* Show error UI */ }
    }

    // --- Other Event Handlers (Keep full implementations) ---
    // ... handlePrevWeek, handleNextWeek, openEmployeeModal, closeEmployeeModalHandler, handleAddEmployeeSubmit, closeShiftModalHandler, handleShiftFormSubmit, handleSaveSchedule, handleSendReminders ...

    // --- Event Listener Setup ---
    function setupScheduleEventListeners() {
        console.log("setupScheduleEventListeners: Attaching listeners...");
         // ... (Attach listeners for prev/next buttons, modal buttons, forms etc. - Keep full implementation) ...
          const prevBtn = featureContainer.querySelector('#prevWeekBtn');
          const nextBtn = featureContainer.querySelector('#nextWeekBtn');
          if(prevBtn) prevBtn.addEventListener('click', handlePrevWeek);
          if(nextBtn) nextBtn.addEventListener('click', handleNextWeek);
         // Attach other listeners...
         console.log("setupScheduleEventListeners: Listeners attached.");
    }


    // --- Initial Setup ---
    function init() {
        console.log("init: Starting Employee Schedule module initialization...");
        // ... (Load scheduleData from localStorage) ...
        // ... (Apply button permissions based on role) ...
        setupScheduleEventListeners();
        console.log("init: Performing initial call to updateWeekDisplay...");
        updateWeekDisplay(); // Initial render
        console.log("%c--- initializeEmployeeSchedule FINISHED ---", "color: green; font-weight: bold;");
    }

    // --- Run Initialization ---
    try { init(); }
    catch (error) { console.error("CRITICAL ERROR during Schedule init():", error); /* Display error */ }

} // End of initializeEmployeeSchedule function
