// sections/employee-scheduling.js
// FIX for 'getFullYear of undefined' error

function initializeEmployeeSchedule(currentUser, teamMembers) {
    console.log("%c--- initializeEmployeeSchedule STARTED (Fixing Date Error) ---", "color: green; font-weight: bold;");

    // --- Data Validation & Setup ---
    if (!currentUser || typeof currentUser !== 'object') { console.error("CRITICAL: currentUser invalid!"); return; }
    const scheduleEmployees = Array.isArray(teamMembers) ? [...teamMembers] : [];
    console.log(`Data Received: User Role: ${currentUser.role}, Employee Count: ${scheduleEmployees.length}`);

    // --- DOM Elements ---
    const featureContainer = document.getElementById('featureSections');
    if (!featureContainer) { console.error("CRITICAL: #featureSections container missing!"); return; }
    const scheduleTableBody = featureContainer.querySelector('#scheduleTableBody');
    const weekDisplay = featureContainer.querySelector('#weekDisplay');
    // ... (Get other elements: modals, buttons etc.) ...
    const prevWeekBtn = featureContainer.querySelector('#prevWeekBtn');
    const nextWeekBtn = featureContainer.querySelector('#nextWeekBtn');
    // ... other elements ...

    // Verify crucial elements
    if (!scheduleTableBody || !weekDisplay || !prevWeekBtn || !nextWeekBtn /* || !otherElements */) {
        console.error("CRITICAL: One or more essential Schedule DOM elements NOT FOUND.");
        return;
    }
    console.log("DOM: Essential elements located.");

    // --- State & Config ---
    let scheduleData = {};
    // --->>> Initialize currentWeekStart here and VERIFY <<<---
    let currentWeekStart; // Declare here
    try {
        currentWeekStart = getStartOfWeek(new Date()); // Assign value
        if (!(currentWeekStart instanceof Date) || isNaN(currentWeekStart)) {
             console.error("CRITICAL: getStartOfWeek failed to return a valid Date! Falling back to today.");
             currentWeekStart = new Date(); // Fallback to current date if function fails
             currentWeekStart.setHours(0,0,0,0);
        }
        console.log("Initial currentWeekStart set to:", currentWeekStart.toDateString());
    } catch (dateError) {
         console.error("CRITICAL ERROR during currentWeekStart initialization:", dateError);
         // Provide a hardcoded fallback date if everything else fails
         currentWeekStart = new Date(2024, 0, 1); // Example: Jan 1st, 2024
         currentWeekStart.setHours(0,0,0,0);
         console.log("Using hardcoded fallback date:", currentWeekStart.toDateString());
    }

    // --- Permissions ---
    const isAdmin = currentUser.role === 'admin';
    const isSupervisor = currentUser.role === 'supervisor';
    const canEditSchedule = isAdmin || isSupervisor;

    // --- Utility Functions ---
    function getStartOfWeek(date) {
        try {
             const dt = new Date(date); // Create a new Date object to avoid modifying the original
             const day = dt.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
             const diff = dt.getDate() - day + (day === 0 ? -6 : 1); // Adjust Sunday to start on preceding Monday
             dt.setDate(diff);
             dt.setHours(0, 0, 0, 0); // Normalize to start of the day
             if (isNaN(dt)) throw new Error("Resulting date is NaN"); // Check if date is valid
             console.log("getStartOfWeek successful, returning:", dt);
             return dt;
        } catch (e) {
             console.error("Error in getStartOfWeek:", e, "Input date:", date);
             return undefined; // Return undefined on error
        }
     }
    function formatDate(date, format = 'yyyy-mm-dd') { /* ... implementation ... */ }
    function getShiftClass(type) { /* ... implementation ... */ }
    function getShiftText(type, customText = '') { /* ... implementation ... */ }
    function showToast(message, type = 'success') { /* ... implementation ... */ }

    // --- Core Logic ---
    function renderScheduleTable() {
        console.log(`renderScheduleTable: Rendering for ${scheduleEmployees.length} employees.`);
        if (!scheduleTableBody) return;
        scheduleTableBody.innerHTML = ''; // Clear

        if (scheduleEmployees.length === 0) { /* Show 'No employees' message */ return; }

        try {
            scheduleEmployees.forEach((emp) => {
                if (!emp?.id || !emp?.name) { return; }
                const row = scheduleTableBody.insertRow(); row.dataset.employeeId = emp.id;
                const nameCell = row.insertCell(); nameCell.className = 'employee-name'; nameCell.textContent = emp.name;
                for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                    const cellDate = new Date(currentWeekStart); // Use the verified currentWeekStart
                    cellDate.setDate(cellDate.getDate() + dayIndex);
                    const dateStr = formatDate(cellDate);
                    if (dateStr === "Invalid Date" || dateStr === "Date Error") {
                         console.error(`Invalid date calculated for emp ${emp.id}, day ${dayIndex}`);
                         const cell = row.insertCell(); cell.textContent = "Date Error"; continue;
                    }
                    const key = `${emp.id}-${dateStr}`; const shiftInfo = scheduleData[key];
                    const cell = row.insertCell(); cell.dataset.date = dateStr; cell.dataset.dayIndex = dayIndex;
                    let cellContent = '';
                    if (shiftInfo) { cellContent = `<div class="shift ${getShiftClass(shiftInfo.type)}" title="${shiftInfo.notes || ''}">${getShiftText(shiftInfo.type, shiftInfo.text)}</div>`; }
                    if (canEditSchedule) { cell.classList.add('admin-controls'); cellContent += `<span class="edit-shift" title="Edit Shift"></span>`; cell.innerHTML = cellContent; cell.querySelector('.edit-shift')?.addEventListener('click', handleEditShiftClick); }
                    else { cell.innerHTML = cellContent; }
                }
            });
            console.log("renderScheduleTable: Finished rendering rows.");
        } catch (error) { console.error("ERROR inside renderScheduleTable loop:", error); /* Show error UI */ }
    }

    function updateWeekDisplay() {
        console.log(`%c--- updateWeekDisplay CALLED ---`, "color: blue;");
        // --->>> VERIFY currentWeekStart before using it <<<---
        if (!(currentWeekStart instanceof Date) || isNaN(currentWeekStart)) {
             console.error("CRITICAL in updateWeekDisplay: currentWeekStart is not a valid Date!", currentWeekStart);
             if(weekDisplay) weekDisplay.textContent = "Date Error!";
             // Optionally stop further execution or try to recover
             return;
        }
        console.log(`updateWeekDisplay: Using currentWeekStart: ${currentWeekStart.toDateString()}`);

        if (!weekDisplay) { console.error("updateWeekDisplay: weekDisplay element missing!"); return; }

        try {
            const weekEnd = new Date(currentWeekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            const startStr = formatDate(currentWeekStart, 'short');
            const endStr = formatDate(weekEnd, 'short');
            // --->>> Safely get the year <<<---
            const year = currentWeekStart.getFullYear(); // Now this should work
            if (startStr === "Invalid Date" || endStr === "Invalid Date") throw new Error("Date formatting failed");
            weekDisplay.textContent = `${startStr} - ${endStr}, ${year}`;

            // Update header dates
            const dateHeaders = featureContainer.querySelector('#scheduleTable thead')?.querySelectorAll('.day-date');
            if (dateHeaders) { const t = new Date(currentWeekStart); dateHeaders.forEach(c=>{ c.textContent=formatDate(t,'short'); t.setDate(t.getDate()+1); }); }

            // Update button states
            if(prevWeekBtn) prevWeekBtn.disabled = false; if(nextWeekBtn) nextWeekBtn.disabled = false;

            console.log("updateWeekDisplay: Calling renderScheduleTable...");
            renderScheduleTable();
            console.log("updateWeekDisplay: Finished successfully.");
        } catch (error) { console.error("Error during updateWeekDisplay:", error); /* Show error UI */ }
    }

    // --- Event Handlers (Keep full implementations) ---
    function handlePrevWeek() { console.log("Prev Week"); currentWeekStart.setDate(currentWeekStart.getDate() - 7); updateWeekDisplay(); }
    function handleNextWeek() { console.log("Next Week"); currentWeekStart.setDate(currentWeekStart.getDate() + 7); updateWeekDisplay(); }
    // ... other handlers: handleShiftTypeChange, openEmployeeModal, handleAddEmployeeSubmit, handleEditShiftClick, handleShiftFormSubmit, handleSaveSchedule, handleSendReminders ...

    // --- Event Listener Setup (Keep full implementation) ---
    function setupScheduleEventListeners() { /* ... attach all necessary listeners ... */ }

    // --- Initial Setup ---
    function init() {
        console.log("init: Starting Employee Schedule module initialization...");
        // Load schedule data
        try { const d=localStorage.getItem('employeeScheduleData'); if(d) scheduleData=JSON.parse(d); else scheduleData={}; }
        catch(e) { console.error("init: Error loading scheduleData", e); scheduleData = {}; }

        // Apply Permissions (Buttons visibility etc.)
        // ...

        // Setup FULL listeners
        setupScheduleEventListeners();

        // Initial Render
        console.log("init: Performing initial call to updateWeekDisplay...");
        updateWeekDisplay(); // This should now work as currentWeekStart is guaranteed to be a Date

        console.log("%c--- initializeEmployeeSchedule FINISHED ---", "color: green; font-weight: bold;");
    }

    // --- Run Initialization ---
    try { init(); }
    catch (error) { console.error("CRITICAL ERROR during Schedule init():", error); /* Display error */ }

} // End of initializeEmployeeSchedule function
