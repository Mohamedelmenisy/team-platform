// ====================================================================
// === sections/employee-scheduling.js (Ensure it's Globally Scoped) ===
// ====================================================================

function initializeEmployeeSchedule(currentUser, teamMembers) {
    console.log("%c--- initializeEmployeeSchedule STARTED ---", "color: purple; font-weight: bold;");
    console.log("   Received currentUser:", currentUser);
    console.log("   Received teamMembers:", teamMembers);


    // --- DOM Elements (Scoped Search) ---
    const featureContainer = document.getElementById('featureSections');
    if (!featureContainer) {
        console.error("   ❌ CRITICAL: #featureSections container not found in initializeEmployeeSchedule!");
        return;
    }
    console.log("   DOM: #featureSections located.");

    // Helper to find elements *within* the section
    const findElement = (selector, required = true) => {
        const el = featureContainer.querySelector(selector);
        if (!el && required) {
            console.error(`   ❌ Critical Error (Schedule Init): Element '${selector}' not found within #featureSections!`);
        } else if (!el) {
             console.warn(`   ⚠️ Warning (Schedule Init): Optional element '${selector}' not found.`);
        }
        return el;
    };

    // Find all required elements
    const scheduleTableBody = findElement('#scheduleTableBody');
    const weekDisplay = findElement('#weekDisplay');
    const employeeModal = findElement('#employeeModal');
    const shiftModal = findElement('#shiftModal');
    const prevWeekBtn = findElement('#prevWeekBtn');
    const nextWeekBtn = findElement('#nextWeekBtn');
    const shiftTypeSelect = findElement('#shiftType');
    const addEmployeeBtn = findElement('#addEmployeeBtn'); // May be hidden by RBAC later
    const sendRemindersBtn = findElement('#sendRemindersBtn'); // May be hidden
    const saveScheduleBtn = findElement('#saveScheduleBtn');   // May be hidden
    const closeEmployeeModal = findElement('#closeEmployeeModal');
    const closeShiftModal = findElement('#closeShiftModal');
    const cancelEmployeeBtn = findElement('#cancelEmployeeBtn');
    const cancelShiftBtn = findElement('#cancelShiftBtn');
    const employeeForm = findElement('#employeeForm');
    const shiftForm = findElement('#shiftForm');
    const customShiftGroup = findElement('#customShiftGroup');
    const toastNotification = findElement('#toastNotification', false); // Toast is optional
    const editShiftEmpIdInput = findElement('#editShiftEmpId');
    const editShiftDayIndexInput = findElement('#editShiftDayIndex'); // Corrected ID used here
    const shiftEmployeeDisplay = findElement('#shiftEmployeeDisplay');
    const shiftDateDisplay = findElement('#shiftDateDisplay');
    const customShiftInput = findElement('#customShift');
    const shiftNotesInput = findElement('#shiftNotes');
    const empRoleSelect = findElement('#empRole'); // Inside Employee Modal

    // Stop initialization if critical elements are missing
    if (!scheduleTableBody || !weekDisplay || !employeeModal || !shiftModal || !prevWeekBtn || !nextWeekBtn || !shiftTypeSelect || !addEmployeeBtn || !sendRemindersBtn || !saveScheduleBtn || !editShiftEmpIdInput || !editShiftDayIndexInput) {
        console.error("   ❌ Halting schedule initialization due to missing critical elements.");
         // Provide feedback in the UI if possible
         featureContainer.innerHTML = '<p style="color:red; padding: 2rem; text-align:center;">Error: Could not initialize Employee Scheduling UI components.</p>';
        return;
    }
     console.log("   DOM: All essential schedule elements located.");

    // --- State & Config ---
    let scheduleData = {}; // { 'empId-yyyy-mm-dd': { type: '...', text: '...', notes: '...' } }
    let currentWeekStart = null; // Will be set in init()
    const scheduleEmployees = Array.isArray(teamMembers) ? JSON.parse(JSON.stringify(teamMembers)) : []; // Use a deep copy if modifications are expected
    console.log(`   Processed employee count: ${scheduleEmployees.length}`);


    // --- Permissions ---
    const isAdmin = currentUser?.role === 'admin';
    const isSupervisor = currentUser?.role === 'supervisor';
    const canEditSchedule = isAdmin || isSupervisor;
    console.log(`   Schedule Permissions: canEditSchedule=${canEditSchedule}`);

    // --- Utility Functions ---
    // (showToast, getStartOfWeek, formatDate, getShiftClass, getShiftText - Keep these as they were in the previous full version)
     function showToast(message, type = 'success') {
        if (!toastNotification) { console.warn("Toast element not found"); return; }
        toastNotification.textContent = message;
        const successColor = getComputedStyle(document.documentElement).getPropertyValue('--success').trim() || '#10b981';
        const dangerColor = getComputedStyle(document.documentElement).getPropertyValue('--danger').trim() || '#ef4444';
        toastNotification.style.backgroundColor = type === 'success' ? successColor : dangerColor;
        toastNotification.className = 'toast show'; // Use classList for better control if needed
        setTimeout(() => { toastNotification.classList.remove('show'); }, 3000);
    }

    function getStartOfWeek(date) {
        try {
            const dt = new Date(date); const day = dt.getDay();
            const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
            dt.setDate(diff); dt.setHours(0, 0, 0, 0);
            if (isNaN(dt)) throw new Error("NaN"); return dt;
        } catch (e) { console.error("Error in getStartOfWeek:", e); const fallback=new Date(); fallback.setHours(0,0,0,0); return fallback; }
    }

    function formatDate(date, format = 'yyyy-mm-dd') {
        try {
            if (!(date instanceof Date) || isNaN(date)) return "Invalid Date";
            const yyyy = date.getFullYear(); const mm = String(date.getMonth() + 1).padStart(2, '0'); const dd = String(date.getDate()).padStart(2, '0');
            if (format === 'short') return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (format === 'weekday-short') return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            return `${yyyy}-${mm}-${dd}`;
        } catch (e) { console.error("Error in formatDate:", e); return "Date Error"; }
    }

    function getShiftClass(type) { const c={'morning':'shift-morning','afternoon':'shift-afternoon','night':'shift-night','day-off':'day-off','sick-leave':'sick-leave','vacation':'vacation','custom':'shift-custom'}; return c[type]||'shift-custom'; }
    function getShiftText(type, customText = '') { const t={'morning':'9AM-5PM','afternoon':'12PM-8PM','night':'5PM-1AM','day-off':'OFF','sick-leave':'SICK','vacation':'VAC'}; return type==='custom'?(customText||'Custom'):(t[type]||type); }


    // --- Event Handlers ---
    // (Include ALL handlers: handlePrevWeek, handleNextWeek, handleShiftTypeChange, openEmployeeModal, closeEmployeeModalHandler, handleAddEmployeeSubmit, handleEditShiftClick, closeShiftModalHandler, handleShiftFormSubmit, handleSaveSchedule, handleSendReminders - Keep these as they were in the previous full version)
    function handlePrevWeek() { console.log("Handler: Prev Week"); if (!currentWeekStart) return; currentWeekStart.setDate(currentWeekStart.getDate() - 7); updateWeekDisplay(); }
    function handleNextWeek() { console.log("Handler: Next Week"); if (!currentWeekStart) return; currentWeekStart.setDate(currentWeekStart.getDate() + 7); updateWeekDisplay(); }
    function handleShiftTypeChange() { if (customShiftGroup && shiftTypeSelect) customShiftGroup.style.display = shiftTypeSelect.value === 'custom' ? 'block' : 'none'; }
    function openEmployeeModal() { console.log("Handler: openEmployeeModal"); if (!isAdmin) { showToast("Permission denied.", "danger"); return; } if (!employeeModal || !employeeForm || !empRoleSelect) return; employeeForm.reset(); const adminOption = empRoleSelect.querySelector('option[value="admin"]'); const supervisorOption = empRoleSelect.querySelector('option[value="supervisor"]'); if(adminOption) adminOption.disabled = !isAdmin; if(supervisorOption) supervisorOption.disabled = !isAdmin; employeeModal.classList.add('active'); employeeForm.querySelector('#empName')?.focus(); }
    function closeEmployeeModalHandler() { if(employeeModal) employeeModal.classList.remove('active'); }
    function handleAddEmployeeSubmit(e) { e.preventDefault(); console.log("Handler: handleAddEmployeeSubmit"); if (!isAdmin) { showToast("Permission denied.", "danger"); return; } const name = employeeForm.querySelector('#empName')?.value.trim(); const email = employeeForm.querySelector('#empEmail')?.value.trim(); const role = employeeForm.querySelector('#empRole')?.value; if (!name || !email || !role) { showToast("Name, Email, Role required.", "danger"); return; } if (!/\S+@\S+\.\S+/.test(email)) { showToast("Invalid email.", "danger"); return; } if (scheduleEmployees.some(emp => emp.email?.toLowerCase() === email.toLowerCase())) { showToast("Email already exists.", "danger"); return; } const newEmployee = { id: `temp-${Date.now()}`, name, email, role, position: employeeForm.querySelector('#empPosition')?.value.trim() || '' }; scheduleEmployees.push(newEmployee); renderScheduleTable(); closeEmployeeModalHandler(); showToast(`${name} added locally.`); /* Dispatch event if needed */ }
    function handleEditShiftClick(event) { console.log("Handler: handleEditShiftClick"); if (!canEditSchedule) return; if (!shiftModal || !shiftForm) return; const targetCell = event.target.closest('td'); const targetRow = targetCell?.closest('tr'); if (!targetCell || !targetRow) return; const empIdStr = targetRow.dataset.employeeId; const dateStr = targetCell.dataset.date; const dayIndexStr = targetCell.dataset.dayIndex; if (!empIdStr || !dateStr || !dayIndexStr) return; const dayIndex = parseInt(dayIndexStr, 10); const employee = scheduleEmployees.find(e => String(e.id) === empIdStr); if (!employee) return; console.log(`Editing shift for: ${employee.name}, Date: ${dateStr}`); const key = `${empIdStr}-${dateStr}`; const currentShift = scheduleData[key]; if (!editShiftEmpIdInput || !editShiftDayIndexInput || !shiftEmployeeDisplay || !shiftDateDisplay || !shiftTypeSelect || !customShiftInput || !shiftNotesInput) return; editShiftEmpIdInput.value = empIdStr; editShiftDayIndexInput.value = dayIndex; shiftEmployeeDisplay.value = employee.name; try { const d=new Date(dateStr+'T00:00:00Z'); shiftDateDisplay.value=formatDate(d,'weekday-short'); } catch(e){ shiftDateDisplay.value=dateStr; } if (currentShift) { shiftTypeSelect.value=currentShift.type||'morning'; customShiftInput.value=currentShift.type==='custom'?currentShift.text:''; shiftNotesInput.value=currentShift.notes||''; } else { shiftForm.reset(); shiftTypeSelect.value='morning'; } handleShiftTypeChange(); shiftModal.classList.add('active'); shiftTypeSelect.focus(); }
    function closeShiftModalHandler() { if(shiftModal) shiftModal.classList.remove('active'); }
    function handleShiftFormSubmit(e) { e.preventDefault(); console.log("Handler: handleShiftFormSubmit"); if (!canEditSchedule) { showToast("Permission denied.", "danger"); return; } const empId = editShiftEmpIdInput.value; const dayIndexStr = editShiftDayIndexInput.value; const shiftType = shiftTypeSelect.value; const customText = customShiftInput.value.trim(); const notes = shiftNotesInput.value.trim(); const dayIndex = parseInt(dayIndexStr, 10); if (isNaN(dayIndex)) return; const targetDate = new Date(currentWeekStart); targetDate.setDate(targetDate.getDate() + dayIndex); const dateStr = formatDate(targetDate); if (dateStr === "Invalid Date") return; const key = `${empId}-${dateStr}`; console.log(`Saving shift key: ${key}, Type: ${shiftType}`); if (shiftType === 'delete') { delete scheduleData[key]; } else { scheduleData[key] = { type: shiftType, text: shiftType==='custom'?(customText||'Custom'):getShiftText(shiftType), notes: notes }; } const cellToUpdate = scheduleTableBody?.querySelector(`tr[data-employee-id="${empId}"] td[data-day-index="${dayIndex}"]`); if (cellToUpdate) { const updatedShiftInfo = scheduleData[key]; let newCellContent = ''; if (updatedShiftInfo) newCellContent = `<div class="shift ${getShiftClass(updatedShiftInfo.type)}" title="${updatedShiftInfo.notes || ''}">${getShiftText(updatedShiftInfo.type, updatedShiftInfo.text)}</div>`; if (canEditSchedule) { cellToUpdate.classList.add('admin-controls'); newCellContent += `<span class="edit-shift" title="Edit Shift"></span>`; cellToUpdate.innerHTML = newCellContent; cellToUpdate.querySelector('.edit-shift')?.addEventListener('click', handleEditShiftClick); } else { cellToUpdate.innerHTML = newCellContent; cellToUpdate.classList.remove('admin-controls'); } } else { renderScheduleTable(); } closeShiftModalHandler(); showToast(`Shift updated!`); if(saveScheduleBtn) saveScheduleBtn.style.border = '2px solid orange'; }
    function handleSaveSchedule() { console.log("Handler: handleSaveSchedule"); if (!canEditSchedule) return; try { localStorage.setItem('employeeScheduleData', JSON.stringify(scheduleData)); showToast('Schedule saved!'); if(saveScheduleBtn) saveScheduleBtn.style.border = ''; if(saveScheduleBtn) saveScheduleBtn.innerHTML = '<i class="fas fa-save"></i> Save Schedule'; } catch (e) { console.error("Error saving schedule:", e); showToast('Error saving.', 'danger'); } }
    function handleSendReminders() { console.log("Handler: handleSendReminders"); if (!canEditSchedule) return; const weekEnd=new Date(currentWeekStart); weekEnd.setDate(currentWeekStart.getDate()+6); const subject=encodeURIComponent(`Sched: ${formatDate(currentWeekStart,'short')}`); const body=encodeURIComponent(`Schedule for ${formatDate(currentWeekStart,'short')} - ${formatDate(weekEnd,'short')}\n\nBest,\n${currentUser?.name||'Mgr'}`); const recipients=scheduleEmployees.map(e=>e.email).filter(Boolean).join(','); if (!recipients) { showToast('No emails found.', 'danger'); return; } const mailtoLink=`mailto:?bcc=${recipients}&subject=${subject}&body=${body}`; try { const a=document.createElement('a'); a.href=mailtoLink; a.target='_blank'; a.rel='noopener noreferrer'; document.body.appendChild(a); a.click(); document.body.removeChild(a); showToast('Opening email...'); } catch (e) { console.error("Mailto error:", e); showToast('Could not open mail.', 'danger'); } }


    // --- Core Rendering Logic ---
    // (renderScheduleTable, updateWeekDisplay - Keep these as they were in the previous full version)
    function renderScheduleTable() {
        console.log(`   🔄 Rendering Schedule Table... (Employees: ${scheduleEmployees.length})`);
        if (!scheduleTableBody) return;
        scheduleTableBody.innerHTML = ''; // Clear

        if (scheduleEmployees.length === 0) {
            const row = scheduleTableBody.insertRow();
            const cell = row.insertCell(); cell.colSpan = 8;
            cell.textContent = "No employees found or added yet.";
            cell.style.cssText = 'text-align: center; padding: 2rem; color: var(--gray); font-style: italic;';
            console.log("      Rendered 'No employees' message.");
            return;
        }

        try {
            scheduleEmployees.forEach((emp) => {
                if (!emp?.id || !emp?.name) return; // Skip invalid data
                const row = scheduleTableBody.insertRow(); row.dataset.employeeId = emp.id;
                const nameCell = row.insertCell(); nameCell.className = 'employee-name'; nameCell.textContent = emp.name;
                for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                    const cellDate = new Date(currentWeekStart); cellDate.setDate(cellDate.getDate() + dayIndex); const dateStr = formatDate(cellDate); if (dateStr === "Invalid Date") continue;
                    const key = `${emp.id}-${dateStr}`; const shiftInfo = scheduleData[key];
                    const cell = row.insertCell(); cell.dataset.date = dateStr; cell.dataset.dayIndex = dayIndex;
                    let cellContent = '';
                    if (shiftInfo) cellContent = `<div class="shift ${getShiftClass(shiftInfo.type)}" title="${shiftInfo.notes || ''}">${getShiftText(shiftInfo.type, shiftInfo.text)}</div>`;
                    if (canEditSchedule) { cell.classList.add('admin-controls'); cellContent += `<span class="edit-shift" title="Edit Shift"></span>`; cell.innerHTML = cellContent; const editSpan = cell.querySelector('.edit-shift'); if (editSpan) editSpan.addEventListener('click', handleEditShiftClick); }
                    else { cell.innerHTML = cellContent; }
                }
            });
            console.log("      ✅ Finished rendering employee rows.");
        } catch (error) { console.error("      ❌ ERROR in renderScheduleTable loop:", error); scheduleTableBody.innerHTML = `<tr><td colspan="8" style="color: red;">Error rendering rows.</td></tr>`; }
    }

    function updateWeekDisplay() {
        console.log(`   🔄 Updating Week Display...`);
        if (!currentWeekStart || isNaN(currentWeekStart) || !weekDisplay) return;
        try {
            const weekEnd=new Date(currentWeekStart); weekEnd.setDate(weekEnd.getDate()+6); const startStr=formatDate(currentWeekStart,'short'); const endStr=formatDate(weekEnd,'short'); const year=currentWeekStart.getFullYear();
            if (startStr === "Invalid Date" || endStr === "Invalid Date") throw new Error("Date formatting failed");
            weekDisplay.textContent = `${startStr} - ${endStr}, ${year}`;
            const dateHeaders = featureContainer.querySelector('#scheduleTable thead')?.querySelectorAll('.day-date');
            if (dateHeaders) { const t = new Date(currentWeekStart); dateHeaders.forEach(c=>{ c.textContent=formatDate(t,'short'); t.setDate(t.getDate()+1); }); }
            if(prevWeekBtn) prevWeekBtn.disabled = false; if(nextWeekBtn) nextWeekBtn.disabled = false;
            renderScheduleTable(); // Re-render table for the new week
            console.log(`      ✅ Week Display updated to: ${weekDisplay.textContent}`);
        } catch (error) { console.error("      ❌ Error during updateWeekDisplay:", error); }
    }


    // --- Event Listener Setup ---
    function setupScheduleEventListeners() {
        console.log("   🎧 Setting up Schedule Event Listeners...");
        // Use a helper to avoid errors if elements are missing (though checked earlier)
        const addListener = (element, event, handler) => {
             if (element) {
                 element.addEventListener(event, handler);
             } else {
                 // console.warn(`   Listener not added: Element for ${event} handler is missing.`);
             }
        };

        addListener(prevWeekBtn, 'click', handlePrevWeek);
        addListener(nextWeekBtn, 'click', handleNextWeek);
        addListener(shiftTypeSelect, 'change', handleShiftTypeChange);
        addListener(addEmployeeBtn, 'click', openEmployeeModal);
        addListener(sendRemindersBtn, 'click', handleSendReminders);
        addListener(saveScheduleBtn, 'click', handleSaveSchedule);
        addListener(closeEmployeeModal, 'click', closeEmployeeModalHandler);
        addListener(cancelEmployeeBtn, 'click', closeEmployeeModalHandler);
        addListener(closeShiftModal, 'click', closeShiftModalHandler);
        addListener(cancelShiftBtn, 'click', closeShiftModalHandler);
        addListener(employeeModal, 'click', (event) => { if (event.target === employeeModal) closeEmployeeModalHandler(); });
        addListener(shiftModal, 'click', (event) => { if (event.target === shiftModal) closeShiftModalHandler(); });
        addListener(employeeForm, 'submit', handleAddEmployeeSubmit);
        addListener(shiftForm, 'submit', handleShiftFormSubmit);

         // Note: Edit shift listeners are added dynamically in renderScheduleTable

         console.log("      ✅ Schedule listeners attached.");
    }

    // --- Initialization ---
    function init() {
        console.log("   🚀 Initializing Employee Schedule Module...");
        // Load saved data
        try { const d=localStorage.getItem('employeeScheduleData'); if(d) scheduleData=JSON.parse(d); else scheduleData={}; }
        catch(e) { console.error("   ❌ Error loading scheduleData", e); scheduleData = {}; }

        // Set initial week start
        currentWeekStart = getStartOfWeek(new Date());
         console.log("      Initial week start:", currentWeekStart);

        // Apply Permissions to buttons
        if(addEmployeeBtn) addEmployeeBtn.style.display = isAdmin ? 'flex' : 'none';
        if(sendRemindersBtn) sendRemindersBtn.style.display = canEditSchedule ? 'flex' : 'none';
        if(saveScheduleBtn) saveScheduleBtn.style.display = canEditSchedule ? 'flex' : 'none';
        console.log("      Button permissions applied.");

        // Setup listeners
        setupScheduleEventListeners();

        // Initial Render
        updateWeekDisplay();

        console.log("   ✅ Employee Schedule Module Initialized.");
    }

    // --- Run Initialization ---
    try {
        init();
    } catch (error) {
        console.error("   ❌ CRITICAL ERROR during Schedule init():", error);
        featureContainer.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--danger);"><h2>Initialization Error</h2><p>Could not initialize the Employee Scheduling section: ${error.message}</p></div>`;
    }

    console.log("%c--- initializeEmployeeSchedule FINISHED ---", "color: purple; font-weight: bold;");

} // --- End of initializeEmployeeSchedule function ---
