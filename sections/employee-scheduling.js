// sections/employee-scheduling.js (FINAL COMPLETE VERSION - Includes ALL handlers and Full Render Logic)

function initializeEmployeeSchedule(currentUser, teamMembers) {
    console.log("%c--- initializeEmployeeSchedule STARTED (FINAL COMPLETE CODE v3) ---", "color: purple; font-weight: bold;");

    // --- Data Validation & Setup ---
    if (!currentUser || typeof currentUser !== 'object') { console.error("CRITICAL: currentUser invalid!"); return; }
    const scheduleEmployees = Array.isArray(teamMembers) ? [...teamMembers] : [];
    console.log(`Data Received: User Role: ${currentUser.role}, Employee Count: ${scheduleEmployees.length}`);
    if (scheduleEmployees.length === 0) { console.warn("WARNING: scheduleEmployees array is EMPTY."); }

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
    const editShiftDayIndexInput = featureContainer.querySelector('#editShiftDayIndexInput'); // CHECK HTML ID
    const shiftEmployeeDisplay = featureContainer.querySelector('#shiftEmployeeDisplay');
    const shiftDateDisplay = featureContainer.querySelector('#shiftDateDisplay');
    const customShiftInput = featureContainer.querySelector('#customShift');
    const shiftNotesInput = featureContainer.querySelector('#shiftNotes');
    const empRoleSelect = featureContainer.querySelector('#empRole');

    if (!scheduleTableBody || !weekDisplay || !employeeModal || !shiftModal || !prevWeekBtn || !nextWeekBtn || !shiftTypeSelect || !addEmployeeBtn || !sendRemindersBtn || !saveScheduleBtn || !shiftForm || !editShiftEmpIdInput ) {
        console.error("CRITICAL: One or more essential Schedule DOM elements were NOT FOUND."); return;
    }
    console.log("DOM: All essential elements located.");

    // --- State & Config ---
    let scheduleData = {}; // Loaded in init()
    let currentWeekStart = null; // Initialized in init()

    // --- Permissions ---
    const isAdmin = currentUser.role === 'admin';
    const isSupervisor = currentUser.role === 'supervisor';
    const canEditSchedule = isAdmin || isSupervisor;

    // --- Utility Functions ---
    function showToast(message, type = 'success') { if (!toastNotification) return; toastNotification.textContent = message; const s=getComputedStyle(document.documentElement).getPropertyValue('--success').trim()||'#10b981'; const d=getComputedStyle(document.documentElement).getPropertyValue('--danger').trim()||'#ef4444'; toastNotification.style.backgroundColor = type === 'success' ? s : d; toastNotification.className = 'toast show'; setTimeout(() => { toastNotification.classList.remove('show'); }, 3000); }
    function getStartOfWeek(date) { try { const dt = new Date(date); const day = dt.getDay(); const diff = dt.getDate() - day + (day === 0 ? -6 : 1); dt.setDate(diff); dt.setHours(0, 0, 0, 0); if (isNaN(dt)) throw new Error("NaN"); return dt; } catch (e) { console.error("getStartOfWeek error:", e); const fallback=new Date(); fallback.setHours(0,0,0,0); return fallback; } }
    function formatDate(date, format = 'yyyy-mm-dd') { try { if (!(date instanceof Date) || isNaN(date)) return "Invalid Date"; const yyyy = date.getFullYear(); const mm = String(date.getMonth() + 1).padStart(2, '0'); const dd = String(date.getDate()).padStart(2, '0'); if (format === 'short') return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); if (format === 'weekday-short') return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); return `${yyyy}-${mm}-${dd}`; } catch (e) { console.error("formatDate error:", e); return "Date Error"; } }
    function getShiftClass(type) { const c={'morning':'shift-morning','afternoon':'shift-afternoon','night':'shift-night','day-off':'day-off','sick-leave':'sick-leave','vacation':'vacation','custom':'shift-custom'}; return c[type]||'shift-custom'; }
    function getShiftText(type, customText = '') { const t={'morning':'9AM-5PM','afternoon':'12PM-8PM','night':'5PM-1AM','day-off':'OFF','sick-leave':'SICK','vacation':'VAC'}; return type==='custom'?(customText||'Custom'):(t[type]||type); }

    // ============================================
    // EVENT HANDLERS
    // ============================================
    function handlePrevWeek() { if (!currentWeekStart) return; currentWeekStart.setDate(currentWeekStart.getDate() - 7); updateWeekDisplay(); }
    function handleNextWeek() { if (!currentWeekStart) return; currentWeekStart.setDate(currentWeekStart.getDate() + 7); updateWeekDisplay(); }
    function handleShiftTypeChange() { if (customShiftGroup && shiftTypeSelect) { customShiftGroup.style.display = shiftTypeSelect.value === 'custom' ? 'block' : 'none'; } }
    function openEmployeeModal() { if (!isAdmin) { showToast("Permission denied.", "danger"); return; } if (!employeeModal || !employeeForm || !empRoleSelect) { console.error("Employee modal elements missing."); return; } employeeForm.reset(); const adminOption = empRoleSelect.querySelector('option[value="admin"]'); const supervisorOption = empRoleSelect.querySelector('option[value="supervisor"]'); if(adminOption) adminOption.disabled = !isAdmin; if(supervisorOption) supervisorOption.disabled = !isAdmin; employeeModal.classList.add('active'); employeeForm.querySelector('#empName')?.focus(); }
    function closeEmployeeModalHandler() { if(employeeModal) employeeModal.classList.remove('active'); }
    function handleAddEmployeeSubmit(e) { e.preventDefault(); if (!isAdmin) { showToast("Permission denied.", "danger"); return; } const name = employeeForm.querySelector('#empName')?.value.trim(); const email = employeeForm.querySelector('#empEmail')?.value.trim(); const role = employeeForm.querySelector('#empRole')?.value; if (!name || !email || !role) { showToast("Name, Email, Role required.", "danger"); return; } if (!/\S+@\S+\.\S+/.test(email)) { showToast("Invalid email.", "danger"); return; } if (scheduleEmployees.some(emp => emp.email.toLowerCase() === email.toLowerCase())) { showToast("Email already exists.", "danger"); return; } const newEmployee = { id: `temp-${Date.now()}`, name, email, role, position: employeeForm.querySelector('#empPosition')?.value.trim() || '' }; scheduleEmployees.push(newEmployee); renderScheduleTable(); closeEmployeeModalHandler(); showToast(`${name} added locally.`); document.dispatchEvent(new CustomEvent('teamMemberAdded', { detail: { ...newEmployee } })); }
    function handleEditShiftClick(event) { console.log("%c handleEditShiftClick triggered!", "color: red; background: yellow;"); if (!canEditSchedule) return; if (!shiftModal || !shiftForm) return; const targetCell = event.target.closest('td'); const targetRow = targetCell?.closest('tr'); if (!targetCell || !targetRow) return; const empIdStr = targetRow.dataset.employeeId; const dateStr = targetCell.dataset.date; const dayIndexStr = targetCell.dataset.dayIndex; if (!empIdStr || !dateStr || !dayIndexStr) return; const dayIndex = parseInt(dayIndexStr, 10); const employee = scheduleEmployees.find(e => String(e.id) === empIdStr); if (!employee) return; console.log(`   Editing for: ${employee.name}, Date: ${dateStr}`); const key = `${empIdStr}-${dateStr}`; const currentShift = scheduleData[key]; if (!editShiftEmpIdInput || !editShiftDayIndexInput || !shiftEmployeeDisplay || !shiftDateDisplay || !shiftTypeSelect || !customShiftInput || !shiftNotesInput) { console.error("Shift modal INPUT elements missing!"); return; } editShiftEmpIdInput.value = empIdStr; editShiftDayIndexInput.value = dayIndex; shiftEmployeeDisplay.value = employee.name; try { const d=new Date(dateStr+'T00:00:00Z'); shiftDateDisplay.value=formatDate(d,'weekday-short'); } catch(e){ shiftDateDisplay.value=dateStr; } if (currentShift) { shiftTypeSelect.value=currentShift.type||'morning'; customShiftInput.value=currentShift.type==='custom'?currentShift.text:''; shiftNotesInput.value=currentShift.notes||''; } else { shiftForm.reset(); shiftTypeSelect.value='morning'; } handleShiftTypeChange(); console.log("   Attempting to show shift modal..."); shiftModal.classList.add('active'); console.log("   'active' class added."); shiftTypeSelect?.focus(); }
    function closeShiftModalHandler() { if(shiftModal) shiftModal.classList.remove('active'); }
    function handleShiftFormSubmit(e) { e.preventDefault(); if (!canEditSchedule) return; const empId = editShiftEmpIdInput.value; const dayIndex = parseInt(editShiftDayIndexInput.value, 10); const shiftType = shiftTypeSelect.value; const customText = customShiftInput.value.trim(); const notes = shiftNotesInput.value.trim(); if (isNaN(dayIndex)) return; const targetDate = new Date(currentWeekStart); targetDate.setDate(targetDate.getDate() + dayIndex); const dateStr = formatDate(targetDate); if (dateStr === "Invalid Date") return; const key = `${empId}-${dateStr}`; if (shiftType === 'delete') { delete scheduleData[key]; } else { scheduleData[key] = { type: shiftType, text: shiftType==='custom'?(customText||'Custom'):getShiftText(shiftType), notes: notes }; } const cellToUpdate = scheduleTableBody?.querySelector(`tr[data-employee-id="${empId}"] td[data-day-index="${dayIndex}"]`); if (cellToUpdate) { const info = scheduleData[key]; let content = ''; if (info) content = `<div class="shift ${getShiftClass(info.type)}" title="${info.notes || ''}">${getShiftText(info.type, info.text)}</div>`; if (canEditSchedule) { content += `<span class="edit-shift" title="Edit Shift"></span>`; cellToUpdate.innerHTML = content; cellToUpdate.querySelector('.edit-shift')?.addEventListener('click', handleEditShiftClick); } else { cellToUpdate.innerHTML = content; } } else { renderScheduleTable(); } closeShiftModalHandler(); showToast(`Shift updated!`); if(saveScheduleBtn) saveScheduleBtn.style.border = '2px solid orange'; }
    function handleSaveSchedule() { if (!canEditSchedule) return; try { localStorage.setItem('employeeScheduleData', JSON.stringify(scheduleData)); showToast('Schedule saved!'); if(saveScheduleBtn) saveScheduleBtn.style.border = 'none'; } catch (e) { console.error("Save error:", e); showToast('Error saving.', 'danger'); } }
    function handleSendReminders() { if (!canEditSchedule) return; const weekEnd=new Date(currentWeekStart); weekEnd.setDate(currentWeekStart.getDate()+6); const subject=encodeURIComponent(`Sched: ${formatDate(currentWeekStart,'short')}`); const body=encodeURIComponent(`Schedule for ${formatDate(currentWeekStart,'short')} - ${formatDate(weekEnd,'short')}\n\nBest,\n${currentUser.name||'Mgr'}`); const recipients=scheduleEmployees.map(e=>e.email).filter(Boolean).join(','); if (!recipients) { showToast('No emails.', 'danger'); return; } const mailtoLink=`mailto:?bcc=${recipients}&subject=${subject}&body=${body}`; try { const a=document.createElement('a'); a.href=mailtoLink; a.target='_blank'; a.rel='noopener noreferrer'; document.body.appendChild(a); a.click(); document.body.removeChild(a); showToast('Opening email...'); } catch (e) { console.error("Mailto error:", e); showToast('Could not open mail.', 'danger'); } }

    // ============================================
    // CORE RENDERING LOGIC
    // ============================================
    function renderScheduleTable() {
        console.log(`%c--- renderScheduleTable CALLED --- Emp Count: ${scheduleEmployees.length}`, "color: green;");
        if (!scheduleTableBody) { console.error("renderScheduleTable: FATAL - scheduleTableBody missing!"); return; }
        scheduleTableBody.innerHTML = ''; // Clear
        if (scheduleEmployees.length === 0) { const r = scheduleTableBody.insertRow(); const c = r.insertCell(); c.colSpan = 8; c.textContent = "No employees available."; c.style.cssText= 'text-align: center; padding: 2rem; color: var(--gray);'; return; }
        console.log("renderScheduleTable: Starting employee loop...");
        try {
            scheduleEmployees.forEach((emp) => {
                if (!emp?.id || !emp?.name) { console.warn(`Skipping invalid emp:`, emp); return; }
                const row = scheduleTableBody.insertRow(); row.dataset.employeeId = emp.id;
                const nameCell = row.insertCell(); nameCell.className = 'employee-name'; nameCell.textContent = emp.name;
                for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                    const cellDate = new Date(currentWeekStart); cellDate.setDate(cellDate.getDate() + dayIndex); const dateStr = formatDate(cellDate); if (dateStr === "Invalid Date") { const c=row.insertCell(); c.textContent="Err"; continue; }
                    const key = `${emp.id}-${dateStr}`; const shiftInfo = scheduleData[key];
                    const cell = row.insertCell(); cell.dataset.date = dateStr; cell.dataset.dayIndex = dayIndex;
                    let cellContent = '';
                    if (shiftInfo) { cellContent = `<div class="shift ${getShiftClass(shiftInfo.type)}" title="${shiftInfo.notes || ''}">${getShiftText(shiftInfo.type, shiftInfo.text)}</div>`; }
                    if (canEditSchedule) {
                        cell.classList.add('admin-controls'); cellContent += `<span class="edit-shift" title="Edit Shift"></span>`; cell.innerHTML = cellContent;
                        const editSpan = cell.querySelector('.edit-shift'); if (editSpan) editSpan.addEventListener('click', handleEditShiftClick); // Attach listener
                    } else { cell.innerHTML = cellContent; }
                }
            });
            console.log("renderScheduleTable: Finished rendering rows.");
        } catch (error) { console.error("!!! ERROR in renderScheduleTable loop !!!:", error); scheduleTableBody.innerHTML = `<tr><td colspan="8" style="color: red;">Error rendering rows.</td></tr>`; }
    }

    function updateWeekDisplay() {
        console.log(`%c--- updateWeekDisplay CALLED ---`, "color: blue;");
        if (!(currentWeekStart instanceof Date) || isNaN(currentWeekStart)) { console.error("updateWeekDisplay: currentWeekStart invalid!"); return; }
        if (!weekDisplay) { console.error("updateWeekDisplay: weekDisplay missing!"); return; }
        try {
            const weekEnd=new Date(currentWeekStart); weekEnd.setDate(weekEnd.getDate()+6); const startStr=formatDate(currentWeekStart,'short'); const endStr=formatDate(weekEnd,'short'); const year=currentWeekStart.getFullYear();
            if (startStr === "Invalid Date" || endStr === "Invalid Date") throw new Error("Date formatting failed");
            weekDisplay.textContent = `${startStr} - ${endStr}, ${year}`;
            const dateHeaders = featureContainer.querySelector('#scheduleTable thead')?.querySelectorAll('.day-date');
            if (dateHeaders) { const t = new Date(currentWeekStart); dateHeaders.forEach(c=>{ c.textContent=formatDate(t,'short'); t.setDate(t.getDate()+1); }); }
            if(prevWeekBtn) prevWeekBtn.disabled = false; if(nextWeekBtn) nextWeekBtn.disabled = false;
            console.log("updateWeekDisplay: Calling renderScheduleTable...");
            renderScheduleTable(); // Call render
            console.log("updateWeekDisplay: Finished successfully.");
        } catch (error) { console.error("Error during updateWeekDisplay:", error); /* Show error UI */ }
    }

    // ============================================
    // EVENT LISTENER SETUP
    // ============================================
    function setupScheduleEventListeners() {
        console.log("setupScheduleEventListeners: Attaching ALL listeners...");
        try {
            prevWeekBtn?.addEventListener('click', handlePrevWeek); nextWeekBtn?.addEventListener('click', handleNextWeek);
            shiftTypeSelect?.addEventListener('change', handleShiftTypeChange);
            addEmployeeBtn?.addEventListener('click', openEmployeeModal); sendRemindersBtn?.addEventListener('click', handleSendReminders); saveScheduleBtn?.addEventListener('click', handleSaveSchedule);
            closeEmployeeModal?.addEventListener('click', closeEmployeeModalHandler); cancelEmployeeBtn?.addEventListener('click', closeEmployeeModalHandler);
            closeShiftModal?.addEventListener('click', closeShiftModalHandler); cancelShiftBtn?.addEventListener('click', closeShiftModalHandler);
            employeeModal?.addEventListener('click', (event) => { if (event.target === employeeModal) closeEmployeeModalHandler(); });
            shiftModal?.addEventListener('click', (event) => { if (event.target === shiftModal) closeShiftModalHandler(); });
            employeeForm?.addEventListener('submit', handleAddEmployeeSubmit); shiftForm?.addEventListener('submit', handleShiftFormSubmit);
            console.log("setupScheduleEventListeners: ALL Listeners attached.");
        } catch (error) { console.error("ERROR attaching schedule event listeners:", error); }
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        console.log("init: Starting Employee Schedule module initialization...");
        try { const d=localStorage.getItem('employeeScheduleData'); if(d) scheduleData=JSON.parse(d); else scheduleData={}; console.log("init: Schedule data loaded."); } catch(e) { console.error("init: Error loading scheduleData", e); scheduleData = {}; }
        try { currentWeekStart = getStartOfWeek(new Date()); if (!currentWeekStart) throw new Error("getStartOfWeek failed"); } catch(e) { console.error("init: Failed initial currentWeekStart", e); currentWeekStart = new Date(); }
        console.log("init: Applying button permissions...");
        if(addEmployeeBtn) addEmployeeBtn.style.display = isAdmin ? 'flex' : 'none';
        if(sendRemindersBtn) sendRemindersBtn.style.display = canEditSchedule ? 'flex' : 'none';
        if(saveScheduleBtn) saveScheduleBtn.style.display = canEditSchedule ? 'flex' : 'none';
        setupScheduleEventListeners();
        console.log("init: Performing initial call to updateWeekDisplay...");
        updateWeekDisplay(); // Initial render
        console.log("%c--- initializeEmployeeSchedule FINISHED (FINAL COMPLETE CODE v3) ---", "color: purple; font-weight: bold;");
    }
    try { init(); } catch (error) { console.error("CRITICAL ERROR during Schedule init():", error); /* Display error */ }

} // End of initializeEmployeeSchedule function
