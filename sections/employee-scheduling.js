// sections/employee-scheduling.js
// FINAL COMPLETE VERSION - Added logs for Edit button listener/handler

function initializeEmployeeSchedule(currentUser, teamMembers) {
    console.log("%c--- initializeEmployeeSchedule STARTED (FINAL COMPLETE CODE) ---", "color: purple; font-weight: bold;");

    // --- Data Validation & Setup ---
    if (!currentUser || typeof currentUser !== 'object') { console.error("CRITICAL: currentUser invalid!"); return; }
    const scheduleEmployees = Array.isArray(teamMembers) ? [...teamMembers] : [];
    console.log(`Data Received: User Role: ${currentUser.role}, Employee Count: ${scheduleEmployees.length}`);
    if (scheduleEmployees.length === 0) { console.warn("WARNING: scheduleEmployees array is EMPTY."); }

    // --- DOM Elements ---
    const featureContainer = document.getElementById('featureSections');
    if (!featureContainer) { console.error("CRITICAL: #featureSections container missing!"); return; }
    console.log("DOM: #featureSections found.");

    // Select ALL necessary elements
    const scheduleTableBody = featureContainer.querySelector('#scheduleTableBody');
    const weekDisplay = featureContainer.querySelector('#weekDisplay');
    const employeeModal = featureContainer.querySelector('#employeeModal');
    const shiftModal = featureContainer.querySelector('#shiftModal'); // <<<<<< NEEDED
    const prevWeekBtn = featureContainer.querySelector('#prevWeekBtn');
    const nextWeekBtn = featureContainer.querySelector('#nextWeekBtn');
    const shiftTypeSelect = featureContainer.querySelector('#shiftType'); // <<<<<< NEEDED
    const addEmployeeBtn = featureContainer.querySelector('#addEmployeeBtn');
    const sendRemindersBtn = featureContainer.querySelector('#sendRemindersBtn');
    const saveScheduleBtn = featureContainer.querySelector('#saveScheduleBtn');
    const closeEmployeeModal = featureContainer.querySelector('#closeEmployeeModal');
    const closeShiftModal = featureContainer.querySelector('#closeShiftModal'); // <<<<<< NEEDED
    const cancelEmployeeBtn = featureContainer.querySelector('#cancelEmployeeBtn');
    const cancelShiftBtn = featureContainer.querySelector('#cancelShiftBtn'); // <<<<<< NEEDED
    const employeeForm = featureContainer.querySelector('#employeeForm');
    const shiftForm = featureContainer.querySelector('#shiftForm'); // <<<<<< NEEDED
    const customShiftGroup = featureContainer.querySelector('#customShiftGroup'); // <<<<<< NEEDED
    const toastNotification = featureContainer.querySelector('#toastNotification');
    const editShiftEmpIdInput = featureContainer.querySelector('#editShiftEmpId'); // <<<<<< NEEDED
    const editShiftDayIndexInput = featureContainer.querySelector('#editShiftDayIndexInput'); // <<<<<< NEEDED (Check ID in HTML)
    const shiftEmployeeDisplay = featureContainer.querySelector('#shiftEmployeeDisplay'); // <<<<<< NEEDED
    const shiftDateDisplay = featureContainer.querySelector('#shiftDateDisplay'); // <<<<<< NEEDED
    const customShiftInput = featureContainer.querySelector('#customShift'); // <<<<<< NEEDED
    const shiftNotesInput = featureContainer.querySelector('#shiftNotes'); // <<<<<< NEEDED
    const empRoleSelect = featureContainer.querySelector('#empRole');


    // Verify crucial elements needed for core functionality AND edit modal
    if (!scheduleTableBody || !weekDisplay || !employeeModal || !shiftModal || !prevWeekBtn || !nextWeekBtn || !shiftTypeSelect || !addEmployeeBtn || !sendRemindersBtn || !saveScheduleBtn || !shiftForm || !editShiftEmpIdInput /* Add checks for other modal inputs if strict check needed */ ) {
        console.error("CRITICAL: One or more essential Schedule DOM elements (including modal/form parts) were NOT FOUND.");
        return;
    }
    console.log("DOM: All essential elements located.");

    // --- State & Config ---
    let scheduleData = {}; // Loaded in init()
    let currentWeekStart = getStartOfWeek(new Date()); // Initialize safely in init()

    // --- Permissions ---
    const isAdmin = currentUser.role === 'admin';
    const isSupervisor = currentUser.role === 'supervisor';
    const canEditSchedule = isAdmin || isSupervisor;
    console.log(`Permissions: canEditSchedule=${canEditSchedule}`);

    // --- Utility Functions ---
    // ... (Keep definitions for: showToast, getStartOfWeek, formatDate, getShiftClass, getShiftText) ...
    function showToast(message, type = 'success') { /* ... */ }
    function getStartOfWeek(date) { /* ... */ }
    function formatDate(date, format = 'yyyy-mm-dd') { /* ... */ }
    function getShiftClass(type) { /* ... */ }
    function getShiftText(type, customText = '') { /* ... */ }


    // ============================================
    // ALL EVENT HANDLERS DEFINED HERE
    // ============================================
    function handlePrevWeek() { /* ... */ }
    function handleNextWeek() { /* ... */ }
    function handleShiftTypeChange() { /* ... */ }
    function openEmployeeModal() { /* ... */ }
    function closeEmployeeModalHandler() { /* ... */ }
    function handleAddEmployeeSubmit(e) { /* ... */ }

    // --- handleEditShiftClick --- (Ensure it tries to show the modal)
    function handleEditShiftClick(event) {
        console.log("%c >>> handleEditShiftClick triggered! <<<", "color: red; background: yellow;"); // <<< Log Trigger
        if (!canEditSchedule) { console.warn("Edit denied due to permissions."); return; }
        if (!shiftModal || !shiftForm) { console.error("Shift modal or form elements missing!"); return; }

        const targetCell = event.target.closest('td');
        const targetRow = targetCell?.closest('tr');
        if (!targetCell || !targetRow) { console.error("Could not find cell/row for edit."); return; }

        const empIdStr = targetRow.dataset.employeeId;
        const dateStr = targetCell.dataset.date;
        const dayIndexStr = targetCell.dataset.dayIndex;

        if (!empIdStr || !dateStr || !dayIndexStr) { console.error("Missing data attributes for edit."); return; }

        const dayIndex = parseInt(dayIndexStr, 10);
        const employee = scheduleEmployees.find(e => String(e.id) === empIdStr);
        if (!employee) { console.error(`Employee not found: ${empIdStr}`); return; }
        console.log(`   Editing for: ${employee.name}, Date: ${dateStr}`);

        const key = `${empIdStr}-${dateStr}`;
        const currentShift = scheduleData[key];

        // Populate Modal (Ensure input elements exist)
        if (!editShiftEmpIdInput || !editShiftDayIndexInput || !shiftEmployeeDisplay || !shiftDateDisplay || !shiftTypeSelect || !customShiftInput || !shiftNotesInput) {
            console.error("Shift modal INPUT elements missing!"); return;
        }
        editShiftEmpIdInput.value = empIdStr;
        editShiftDayIndexInput.value = dayIndex;
        shiftEmployeeDisplay.value = employee.name;
        try { const d=new Date(dateStr+'T00:00:00Z'); shiftDateDisplay.value=formatDate(d,'weekday-short'); } catch(e){ shiftDateDisplay.value=dateStr; }
        if (currentShift) { shiftTypeSelect.value=currentShift.type||'morning'; customShiftInput.value=currentShift.type==='custom'?currentShift.text:''; shiftNotesInput.value=currentShift.notes||''; }
        else { shiftForm.reset(); shiftTypeSelect.value='morning'; }

        handleShiftTypeChange(); // Update custom field visibility

        console.log("   Attempting to show shift modal by adding 'active' class..."); // <<< Log before showing
        shiftModal.classList.add('active'); // <<< THIS SHOWS THE MODAL
        shiftTypeSelect?.focus();
        console.log("   'active' class added to shift modal."); // <<< Log after showing
    }

    function closeShiftModalHandler() { /* ... */ }
    function handleShiftFormSubmit(e) { /* ... */ }
    function handleSaveSchedule() { /* ... */ }
    function handleSendReminders() { /* ... */ }

    // ============================================
    // CORE RENDERING LOGIC
    // ============================================
    function renderScheduleTable() {
        console.log(`%c--- renderScheduleTable CALLED --- Emp Count: ${scheduleEmployees.length}`, "color: green;");
        if (!scheduleTableBody) { console.error("renderScheduleTable: FATAL - scheduleTableBody missing!"); return; }
        scheduleTableBody.innerHTML = '';

        if (scheduleEmployees.length === 0) { /* Show 'No employees' message */ return; }

        console.log("renderScheduleTable: Starting employee loop...");
        try {
            scheduleEmployees.forEach((emp) => {
                if (!emp?.id || !emp?.name) { return; }
                const row = scheduleTableBody.insertRow(); row.dataset.employeeId = emp.id;
                const nameCell = row.insertCell(); nameCell.className = 'employee-name'; nameCell.textContent = emp.name;
                for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                    const cellDate = new Date(currentWeekStart); cellDate.setDate(cellDate.getDate() + dayIndex); const dateStr = formatDate(cellDate); if (dateStr === "Invalid Date") continue;
                    const key = `${emp.id}-${dateStr}`; const shiftInfo = scheduleData[key];
                    const cell = row.insertCell(); cell.dataset.date = dateStr; cell.dataset.dayIndex = dayIndex;
                    let cellContent = '';
                    if (shiftInfo) { cellContent = `<div class="shift ${getShiftClass(shiftInfo.type)}" title="${shiftInfo.notes || ''}">${getShiftText(shiftInfo.type, shiftInfo.text)}</div>`; }
                    if (canEditSchedule) {
                        cell.classList.add('admin-controls'); cellContent += `<span class="edit-shift" title="Edit Shift"></span>`; cell.innerHTML = cellContent;
                        const editSpan = cell.querySelector('.edit-shift');
                        if (editSpan) {
                             // --->>> Log attaching listener <<<---
                             console.log(`   Attaching edit listener to span for [${emp.id}, ${dateStr}]`);
                             editSpan.addEventListener('click', handleEditShiftClick); // Attach listener
                        } else { console.warn(`   Could not find edit span for [${emp.id}, ${dateStr}]`); }
                    } else { cell.innerHTML = cellContent; }
                }
            });
            console.log("renderScheduleTable: Finished rendering FULL rows.");
        } catch (error) { console.error("!!! ERROR in FULL renderScheduleTable loop !!!:", error); /* Show error UI */ }
    }

    function updateWeekDisplay() { /* ... Keep full implementation ... */ renderScheduleTable(); }

    // ============================================
    // EVENT LISTENER SETUP
    // ============================================
    function setupScheduleEventListeners() {
        console.log("setupScheduleEventListeners: Attaching ALL listeners...");
        try {
            // Attach ALL listeners correctly
            prevWeekBtn?.addEventListener('click', handlePrevWeek);
            nextWeekBtn?.addEventListener('click', handleNextWeek);
            shiftTypeSelect?.addEventListener('change', handleShiftTypeChange);
            addEmployeeBtn?.addEventListener('click', openEmployeeModal);
            sendRemindersBtn?.addEventListener('click', handleSendReminders);
            saveScheduleBtn?.addEventListener('click', handleSaveSchedule);
            closeEmployeeModal?.addEventListener('click', closeEmployeeModalHandler);
            cancelEmployeeBtn?.addEventListener('click', closeEmployeeModalHandler);
            closeShiftModal?.addEventListener('click', closeShiftModalHandler);
            cancelShiftBtn?.addEventListener('click', closeShiftModalHandler);
            employeeModal?.addEventListener('click', (event) => { if (event.target === employeeModal) closeEmployeeModalHandler(); });
            shiftModal?.addEventListener('click', (event) => { if (event.target === shiftModal) closeShiftModalHandler(); });
            employeeForm?.addEventListener('submit', handleAddEmployeeSubmit);
            shiftForm?.addEventListener('submit', handleShiftFormSubmit);
            console.log("setupScheduleEventListeners: ALL Listeners attached successfully.");
        } catch (error) { console.error("ERROR attaching schedule event listeners:", error); }
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        console.log("init: Starting Employee Schedule module initialization...");
        // ... (Load scheduleData) ...
        // ... (Apply button permissions) ...
        setupScheduleEventListeners(); // <<<< MAKE SURE THIS IS CALLED
        console.log("init: Performing initial call to updateWeekDisplay...");
        updateWeekDisplay(); // Initial render
        console.log("%c--- initializeEmployeeSchedule FINISHED (COMPLETE CODE) ---", "color: purple; font-weight: bold;");
    }

    // --- Run Initialization ---
    try { init(); }
    catch (error) { console.error("CRITICAL ERROR during Schedule init():", error); /* Display error */ }

} // End of initializeEmployeeSchedule function
