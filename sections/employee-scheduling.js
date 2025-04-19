// sections/employee-scheduling.js
// FINAL VERSION - Restored Full Render, Ensured Button Listeners

function initializeEmployeeSchedule(currentUser, teamMembers) {
    console.log("%c--- initializeEmployeeSchedule STARTED (Final Version) ---", "color: green; font-weight: bold;");

    // --- Data Validation & Setup ---
    if (!currentUser || typeof currentUser !== 'object') { console.error("CRITICAL: currentUser invalid!"); return; }
    const scheduleEmployees = Array.isArray(teamMembers) ? [...teamMembers] : [];
    console.log(`Data Received: User Role: ${currentUser.role}, Employee Count: ${scheduleEmployees.length}`);

    // --- DOM Elements ---
    const featureContainer = document.getElementById('featureSections');
    if (!featureContainer) { console.error("CRITICAL: #featureSections container missing!"); return; }
    console.log("DOM: #featureSections found.");

    const scheduleTableBody = featureContainer.querySelector('#scheduleTableBody');
    const weekDisplay = featureContainer.querySelector('#weekDisplay');
    const employeeModal = featureContainer.querySelector('#employeeModal');
    const shiftModal = featureContainer.querySelector('#shiftModal');
    const prevWeekBtn = featureContainer.querySelector('#prevWeekBtn');
    const nextWeekBtn = featureContainer.querySelector('#nextWeekBtn');
    const shiftTypeSelect = featureContainer.querySelector('#shiftType');
    const addEmployeeBtn = featureContainer.querySelector('#addEmployeeBtn');       // << Ensure found
    const sendRemindersBtn = featureContainer.querySelector('#sendRemindersBtn'); // << Ensure found
    const saveScheduleBtn = featureContainer.querySelector('#saveScheduleBtn');     // << Ensure found
    const closeEmployeeModal = featureContainer.querySelector('#closeEmployeeModal');
    const closeShiftModal = featureContainer.querySelector('#closeShiftModal');
    const cancelEmployeeBtn = featureContainer.querySelector('#cancelEmployeeBtn');
    const cancelShiftBtn = featureContainer.querySelector('#cancelShiftBtn');
    const employeeForm = featureContainer.querySelector('#employeeForm');
    const shiftForm = featureContainer.querySelector('#shiftForm');
    const customShiftGroup = featureContainer.querySelector('#customShiftGroup');
    const toastNotification = featureContainer.querySelector('#toastNotification');
    // Add shift modal inputs
    const editShiftEmpIdInput = featureContainer.querySelector('#editShiftEmpId');
    const editShiftDayIndexInput = featureContainer.querySelector('#editShiftDayIndex');
    const shiftEmployeeDisplay = featureContainer.querySelector('#shiftEmployeeDisplay');
    const shiftDateDisplay = featureContainer.querySelector('#shiftDateDisplay');
    const customShiftInput = featureContainer.querySelector('#customShift');
    const shiftNotesInput = featureContainer.querySelector('#shiftNotes');


    // Verify crucial elements
    if (!scheduleTableBody || !weekDisplay || !employeeModal || !shiftModal || !prevWeekBtn || !nextWeekBtn || !shiftTypeSelect || !addEmployeeBtn || !sendRemindersBtn || !saveScheduleBtn) {
        console.error("CRITICAL: One or more essential Schedule DOM elements (including buttons) were NOT FOUND.");
        // Display error
        return;
    }
    console.log("DOM: All essential elements located.");


    // --- State & Config ---
    let scheduleData = {}; // Load in init()
    let currentWeekStart = getStartOfWeek(new Date());

    // --- Permissions ---
    const isAdmin = currentUser.role === 'admin';
    const isSupervisor = currentUser.role === 'supervisor';
    const canEditSchedule = isAdmin || isSupervisor;
    console.log(`Permissions: canEditSchedule=${canEditSchedule}`);

    // --- Utility Functions (Full Versions) ---
     function showToast(message, type = 'success') { /* ... full implementation ... */ }
     function getStartOfWeek(date) { /* ... full implementation ... */ }
     function formatDate(date, format = 'yyyy-mm-dd') { /* ... full implementation ... */ }
     function getShiftClass(type) { const c={'morning':'shift-morning','afternoon':'shift-afternoon','night':'shift-night','day-off':'day-off','sick-leave':'sick-leave','vacation':'vacation','custom':'shift-custom'}; return c[type]||'shift-custom'; }
     function getShiftText(type, customText = '') { const t={'morning':'9AM-5PM','afternoon':'12PM-8PM','night':'5PM-1AM','day-off':'OFF','sick-leave':'SICK','vacation':'VAC'}; return type==='custom'?(customText||'Custom'):(t[type]||type); }

    // --- Core Logic ---

    // *** RESTORED FULL renderScheduleTable ***
    function renderScheduleTable() {
        console.log(`%c--- renderScheduleTable CALLED (Full Logic) --- Emp Count: ${scheduleEmployees.length}`, "color: green;");
        if (!scheduleTableBody) { console.error("renderScheduleTable: FATAL - scheduleTableBody missing!"); return; }

        scheduleTableBody.innerHTML = ''; // Clear

        if (scheduleEmployees.length === 0) {
            console.log("renderScheduleTable: No employees.");
            const row = scheduleTableBody.insertRow(); const cell = row.insertCell(); cell.colSpan = 8; cell.textContent = "No employees available in the schedule."; cell.style.cssText = 'text-align: center; padding: 2rem; color: var(--gray); font-style: italic;'; return;
        }

        console.log("renderScheduleTable: Starting employee loop...");
        try {
            scheduleEmployees.forEach((emp) => {
                if (!emp?.id || !emp?.name) { console.warn(`Skipping invalid emp data:`, emp); return; }
                const row = scheduleTableBody.insertRow(); row.dataset.employeeId = emp.id;
                const nameCell = row.insertCell(); nameCell.className = 'employee-name'; nameCell.textContent = emp.name;

                for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                    const cellDate = new Date(currentWeekStart); cellDate.setDate(cellDate.getDate() + dayIndex);
                    const dateStr = formatDate(cellDate); if (dateStr === "Invalid Date") continue;
                    const key = `${emp.id}-${dateStr}`; const shiftInfo = scheduleData[key]; // << GET SHIFT DATA
                    const cell = row.insertCell(); cell.dataset.date = dateStr; cell.dataset.dayIndex = dayIndex;
                    let cellContent = '';
                    // >>>>>> DISPLAY SHIFT INFO <<<<<<<<
                    if (shiftInfo) {
                        cellContent = `<div class="shift ${getShiftClass(shiftInfo.type)}" title="${shiftInfo.notes || ''}">${getShiftText(shiftInfo.type, shiftInfo.text)}</div>`;
                    }
                    if (canEditSchedule) {
                        cell.classList.add('admin-controls'); cellContent += `<span class="edit-shift" title="Edit Shift"></span>`; cell.innerHTML = cellContent;
                        const editSpan = cell.querySelector('.edit-shift'); if (editSpan) editSpan.addEventListener('click', handleEditShiftClick);
                    } else { cell.innerHTML = cellContent; }
                }
            });
            console.log("renderScheduleTable: Finished rendering FULL rows.");
        } catch (error) { console.error("!!! ERROR in FULL renderScheduleTable loop !!!:", error); scheduleTableBody.innerHTML = `<tr><td colspan="8" style="color: red;">Error rendering rows.</td></tr>`; }
    }

    function updateWeekDisplay() {
        console.log(`%c--- updateWeekDisplay CALLED ---`, "color: blue;");
        // ... (update week text, update header dates - keep full implementation) ...
         const weekEnd = new Date(currentWeekStart); weekEnd.setDate(weekEnd.getDate() + 6); const startStr = formatDate(currentWeekStart, 'short'); const endStr = formatDate(weekEnd, 'short'); const year = currentWeekStart.getFullYear(); if(weekDisplay) weekDisplay.textContent = `${startStr} - ${endStr}, ${year}`;
         const dateHeaders = featureContainer.querySelector('#scheduleTable thead')?.querySelectorAll('.day-date'); if(dateHeaders) { const t = new Date(currentWeekStart); dateHeaders.forEach(c => { c.textContent = formatDate(t, 'short'); t.setDate(t.getDate() + 1); }); }
         if(prevWeekBtn) prevWeekBtn.disabled = false; if(nextWeekBtn) nextWeekBtn.disabled = false;

        console.log("updateWeekDisplay: Calling renderScheduleTable (Full Logic)...");
        renderScheduleTable(); // Call FULL render
        console.log("updateWeekDisplay: Finished successfully.");
    }

    // --- Event Handlers (Full Implementations) ---
    function handlePrevWeek() { console.log("Prev Week"); currentWeekStart.setDate(currentWeekStart.getDate() - 7); updateWeekDisplay(); }
    function handleNextWeek() { console.log("Next Week"); currentWeekStart.setDate(currentWeekStart.getDate() + 7); updateWeekDisplay(); }
    function handleShiftTypeChange() { if (customShiftGroup && shiftTypeSelect) { customShiftGroup.style.display = shiftTypeSelect.value === 'custom' ? 'block' : 'none'; } }

    function openEmployeeModal() {
        console.log("openEmployeeModal called");
        if (!isAdmin) { showToast("Permission denied.", "danger"); return; }
        if (!employeeModal || !employeeForm) return;
        employeeForm.reset();
        // Apply role restrictions if needed
        employeeModal.classList.add('active');
        employeeForm.querySelector('#empName')?.focus();
    }
    function closeEmployeeModalHandler() { if(employeeModal) employeeModal.classList.remove('active'); }
    function handleAddEmployeeSubmit(e) {
         e.preventDefault(); console.log("handleAddEmployeeSubmit"); if (!isAdmin) { showToast("Permission denied.", "danger"); return; }
         const name = employeeForm.querySelector('#empName')?.value.trim();
         const email = employeeForm.querySelector('#empEmail')?.value.trim();
         const role = employeeForm.querySelector('#empRole')?.value;
         if (!name || !email || !role) { showToast("Name, Email, Role required.", "danger"); return; }
         // ... (add validation, check duplicates) ...
         const newEmployee = { id: `temp-${Date.now()}`, name, email, role };
         scheduleEmployees.push(newEmployee); renderScheduleTable(); closeEmployeeModalHandler(); showToast(`${name} added locally.`);
         document.dispatchEvent(new CustomEvent('teamMemberAdded', { detail: { ...newEmployee } })); // Notify dashboard
     }

     function handleEditShiftClick(event) {
         console.log("handleEditShiftClick called"); if (!canEditSchedule) return; if (!shiftModal || !shiftForm) return;
         const targetCell = event.target.closest('td'); const targetRow = targetCell?.closest('tr'); if (!targetCell || !targetRow) return;
         const empIdStr = targetRow.dataset.employeeId; const dateStr = targetCell.dataset.date; const dayIndexStr = targetCell.dataset.dayIndex; if (!empIdStr || !dateStr || !dayIndexStr) return;
         const dayIndex = parseInt(dayIndexStr, 10); const employee = scheduleEmployees.find(e => String(e.id) === empIdStr); if (!employee) return;
         console.log(`Editing shift for: ${employee.name}, Date: ${dateStr}`);
         const key = `${empIdStr}-${dateStr}`; const currentShift = scheduleData[key];
         // Populate Modal
         if (!editShiftEmpIdInput || !editShiftDayIndexInput || !shiftEmployeeDisplay || !shiftDateDisplay || !shiftTypeSelect || !customShiftInput || !shiftNotesInput) return;
         editShiftEmpIdInput.value = empIdStr; editShiftDayIndexInput.value = dayIndex; shiftEmployeeDisplay.value = employee.name;
         try { const d = new Date(dateStr + 'T00:00:00Z'); shiftDateDisplay.value = formatDate(d, 'weekday-short');} catch(e){ shiftDateDisplay.value = dateStr; }
         if (currentShift) { shiftTypeSelect.value = currentShift.type || 'morning'; customShiftInput.value = currentShift.type === 'custom' ? currentShift.text : ''; shiftNotesInput.value = currentShift.notes || ''; }
         else { shiftForm.reset(); shiftTypeSelect.value = 'morning'; } // Reset if no current shift
         handleShiftTypeChange(); // Update custom field visibility
         shiftModal.classList.add('active'); shiftTypeSelect.focus();
     }

     function closeShiftModalHandler() { if(shiftModal) shiftModal.classList.remove('active'); }

     function handleShiftFormSubmit(e) {
         e.preventDefault(); console.log("handleShiftFormSubmit"); if (!canEditSchedule) { showToast("Permission denied.", "danger"); return; }
         const empId = editShiftEmpIdInput.value; const dayIndex = parseInt(editShiftDayIndexInput.value, 10);
         const shiftType = shiftTypeSelect.value; const customText = customShiftInput.value.trim(); const notes = shiftNotesInput.value.trim();
         if (isNaN(dayIndex)) return;
         const targetDate = new Date(currentWeekStart); targetDate.setDate(targetDate.getDate() + dayIndex); const dateStr = formatDate(targetDate); if (dateStr === "Invalid Date") return;
         const key = `${empId}-${dateStr}`; console.log(`Saving shift key: ${key}, Type: ${shiftType}`);
         if (shiftType === 'delete') { delete scheduleData[key]; }
         else { scheduleData[key] = { type: shiftType, text: shiftType === 'custom' ? (customText || 'Custom') : getShiftText(shiftType), notes: notes }; }
         // Update Cell UI
         const cellToUpdate = scheduleTableBody?.querySelector(`tr[data-employee-id="${empId}"] td[data-day-index="${dayIndex}"]`);
         if (cellToUpdate) {
             const updatedShiftInfo = scheduleData[key]; let newCellContent = '';
             if (updatedShiftInfo) newCellContent = `<div class="shift ${getShiftClass(updatedShiftInfo.type)}" title="${updatedShiftInfo.notes || ''}">${getShiftText(updatedShiftInfo.type, updatedShiftInfo.text)}</div>`;
             if (canEditSchedule) { newCellContent += `<span class="edit-shift" title="Edit Shift"></span>`; cellToUpdate.innerHTML = newCellContent; cellToUpdate.querySelector('.edit-shift')?.addEventListener('click', handleEditShiftClick); }
             else { cellToUpdate.innerHTML = newCellContent; }
         } else { renderScheduleTable(); } // Fallback
         closeShiftModalHandler(); showToast(`Shift updated!`);
         if(saveScheduleBtn) saveScheduleBtn.style.border = '2px solid orange'; // Mark dirty
     }

     function handleSaveSchedule() {
         console.log("handleSaveSchedule clicked"); if (!canEditSchedule) return;
         try { localStorage.setItem('employeeScheduleData', JSON.stringify(scheduleData)); showToast('Schedule saved!'); if(saveScheduleBtn) saveScheduleBtn.style.border = 'none'; }
         catch (e) { console.error("Error saving schedule:", e); showToast('Error saving schedule.', 'danger'); }
     }

     function handleSendReminders() {
         console.log("handleSendReminders clicked"); if (!canEditSchedule) return;
         const weekEnd = new Date(currentWeekStart); weekEnd.setDate(currentWeekStart.getDate() + 6);
         const subject = encodeURIComponent(`Work Schedule: Week of ${formatDate(currentWeekStart, 'short')}`);
         const body = encodeURIComponent(`Hi Team,\n\nSchedule for ${formatDate(currentWeekStart, 'short')} - ${formatDate(weekEnd, 'short')} is available.\n\nBest,\n${currentUser.name || 'Management'}`);
         const recipients = scheduleEmployees.map(e => e.email).filter(Boolean).join(',');
         if (!recipients) { showToast('No employee emails found.', 'danger'); return; }
         const mailtoLink = `mailto:?bcc=${recipients}&subject=${subject}&body=${body}`;
         try { const a=document.createElement('a'); a.href=mailtoLink; a.target='_blank'; a.rel='noopener noreferrer'; document.body.appendChild(a); a.click(); document.body.removeChild(a); showToast('Opening email client...'); }
         catch (e) { console.error("Mailto error:", e); showToast('Could not open mail client.', 'danger'); }
     }

    // --- Event Listener Setup ---
    function setupScheduleEventListeners() {
        console.log("setupScheduleEventListeners: Attaching FULL listeners...");
        try {
            // Use optional chaining for robustness
            prevWeekBtn?.addEventListener('click', handlePrevWeek);
            nextWeekBtn?.addEventListener('click', handleNextWeek);
            shiftTypeSelect?.addEventListener('change', handleShiftTypeChange);
            addEmployeeBtn?.addEventListener('click', openEmployeeModal); // <<<< Attach Add Employee
            sendRemindersBtn?.addEventListener('click', handleSendReminders); // <<<< Attach Send Reminders
            saveScheduleBtn?.addEventListener('click', handleSaveSchedule); // <<<< Attach Save Schedule
            closeEmployeeModal?.addEventListener('click', closeEmployeeModalHandler);
            cancelEmployeeBtn?.addEventListener('click', closeEmployeeModalHandler);
            closeShiftModal?.addEventListener('click', closeShiftModalHandler);
            cancelShiftBtn?.addEventListener('click', closeShiftModalHandler);
            employeeModal?.addEventListener('click', (event) => { if (event.target === employeeModal) closeEmployeeModalHandler(); });
            shiftModal?.addEventListener('click', (event) => { if (event.target === shiftModal) closeShiftModalHandler(); });
            employeeForm?.addEventListener('submit', handleAddEmployeeSubmit);
            shiftForm?.addEventListener('submit', handleShiftFormSubmit);

            // Initial attachment for edit buttons already in the table (done in render loop)

            console.log("setupScheduleEventListeners: FULL Listeners attached successfully.");
        } catch (error) {
            console.error("ERROR attaching FULL schedule event listeners:", error);
        }
    }

    // --- Initial Setup ---
    function init() {
        console.log("init: Starting Employee Schedule module initialization...");
        // Load schedule data
        try { const d=localStorage.getItem('employeeScheduleData'); if(d) scheduleData=JSON.parse(d); else scheduleData={}; console.log("init: Schedule data loaded."); }
        catch(e) { console.error("init: Error loading scheduleData", e); scheduleData = {}; }

        // Apply Permissions
        console.log("init: Applying button permissions...");
        if(addEmployeeBtn) addEmployeeBtn.style.display = isAdmin ? 'flex' : 'none';
        if(sendRemindersBtn) sendRemindersBtn.style.display = canEditSchedule ? 'flex' : 'none';
        if(saveScheduleBtn) saveScheduleBtn.style.display = canEditSchedule ? 'flex' : 'none';

        // Setup FULL listeners
        setupScheduleEventListeners();

        // Initial Render
        console.log("init: Performing initial call to updateWeekDisplay (which calls full render)...");
        updateWeekDisplay();

        console.log("%c--- initializeEmployeeSchedule FINISHED (Full Render Logic) ---", "color: green; font-weight: bold;");
    }

    // --- Run Initialization ---
    try { init(); }
    catch (error) { console.error("CRITICAL ERROR during Schedule init():", error); /* Display error */ }

} // End of initializeEmployeeSchedule function
