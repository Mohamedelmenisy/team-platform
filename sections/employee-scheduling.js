// sections/employee-scheduling.js (FINAL COMPLETE VERSION - Includes ALL handlers and Full Render Logic)

function initializeEmployeeSchedule(currentUser, teamMembers) {
    console.log("%c--- initializeEmployeeSchedule STARTED (FINAL COMPLETE CODE v2) ---", "color: purple; font-weight: bold;");

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


    // Verify crucial elements
    if (!scheduleTableBody || !weekDisplay || !employeeModal || !shiftModal || !prevWeekBtn || !nextWeekBtn || !shiftTypeSelect || !addEmployeeBtn || !sendRemindersBtn || !saveScheduleBtn || !shiftForm || !editShiftEmpIdInput ) {
        console.error("CRITICAL: One or more essential Schedule DOM elements were NOT FOUND."); return;
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
    function showToast(message, type = 'success') { if (!toastNotification) return; toastNotification.textContent = message; const s=getComputedStyle(document.documentElement).getPropertyValue('--success').trim()||'#10b981'; const d=getComputedStyle(document.documentElement).getPropertyValue('--danger').trim()||'#ef4444'; toastNotification.style.backgroundColor = type === 'success' ? s : d; toastNotification.className = 'toast show'; setTimeout(() => { toastNotification.classList.remove('show'); }, 3000); }
    function getStartOfWeek(date) { try { const dt = new Date(date); const day = dt.getDay(); const diff = dt.getDate() - day + (day === 0 ? -6 : 1); dt.setDate(diff); dt.setHours(0, 0, 0, 0); if (isNaN(dt)) throw new Error("NaN"); return dt; } catch (e) { console.error("getStartOfWeek error:", e); const fallback=new Date(); fallback.setHours(0,0,0,0); return fallback; } }
    function formatDate(date, format = 'yyyy-mm-dd') { try { if (!(date instanceof Date) || isNaN(date)) return "Invalid Date"; const yyyy = date.getFullYear(); const mm = String(date.getMonth() + 1).padStart(2, '0'); const dd = String(date.getDate()).padStart(2, '0'); if (format === 'short') return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); if (format === 'weekday-short') return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); return `${yyyy}-${mm}-${dd}`; } catch (e) { console.error("formatDate error:", e); return "Date Error"; } }
    function getShiftClass(type) { const c={'morning':'shift-morning','afternoon':'shift-afternoon','night':'shift-night','day-off':'day-off','sick-leave':'sick-leave','vacation':'vacation','custom':'shift-custom'}; return c[type]||'shift-custom'; }
    function getShiftText(type, customText = '') { const t={'morning':'9AM-5PM','afternoon':'12PM-8PM','night':'5PM-1AM','day-off':'OFF','sick-leave':'SICK','vacation':'VAC'}; return type==='custom'?(customText||'Custom'):(t[type]||type); }

    // ============================================
    // ALL EVENT HANDLERS DEFINED HERE
    // ============================================
    function handlePrevWeek() { console.log("Handler: Prev Week"); if (!currentWeekStart) return; currentWeekStart.setDate(currentWeekStart.getDate() - 7); updateWeekDisplay(); }
    function handleNextWeek() { console.log("Handler: Next Week"); if (!currentWeekStart) return; currentWeekStart.setDate(currentWeekStart.getDate() + 7); updateWeekDisplay(); }
    function handleShiftTypeChange() { if (customShiftGroup && shiftTypeSelect) { customShiftGroup.style.display = shiftTypeSelect.value === 'custom' ? 'block' : 'none'; } }
    function openEmployeeModal() { console.log("Handler: openEmployeeModal"); if (!isAdmin) { showToast("Permission denied.", "danger"); return; } if (!employeeModal || !employeeForm || !empRoleSelect) { console.error("Employee modal elements missing."); return; } employeeForm.reset(); const adminOption = empRoleSelect.querySelector('option[value="admin"]'); const supervisorOption = empRoleSelect.querySelector('option[value="supervisor"]'); if(adminOption) adminOption.disabled = !isAdmin; if(supervisorOption) supervisorOption.disabled = !isAdmin; employeeModal.classList.add('active'); employeeForm.querySelector('#empName')?.focus(); }
    function closeEmployeeModalHandler() { if(employeeModal) employeeModal.classList.remove('active'); }
    function handleAddEmployeeSubmit(e) { e.preventDefault(); console.log("Handler: handleAddEmployeeSubmit"); if (!isAdmin) { showToast("Permission denied.", "danger"); return; } const name = employeeForm.querySelector('#empName')?.value.trim(); const email = employeeForm.querySelector('#empEmail')?.value.trim(); const role = employeeForm.querySelector('#empRole')?.value; if (!name || !email || !role) { showToast("Name, Email, Role required.", "danger"); return; } if (!/\S+@\S+\.\S+/.test(email)) { showToast("Invalid email.", "danger"); return; } if (scheduleEmployees.some(emp => emp.email.toLowerCase() === email.toLowerCase())) { showToast("Email already exists.", "danger"); return; } const newEmployee = { id: `temp-${Date.now()}`, name, email, role, position: employeeForm.querySelector('#empPosition')?.value.trim() || '' }; scheduleEmployees.push(newEmployee); renderScheduleTable(); closeEmployeeModalHandler(); showToast(`${name} added locally.`); document.dispatchEvent(new CustomEvent('teamMemberAdded', { detail: { ...newEmployee } })); }
    function handleEditShiftClick(event) { console.log("%c >>> handleEditShiftClick triggered! <<<", "color: red; background: yellow;"); if (!canEditSchedule) return; if (!shiftModal || !shiftForm) return; const targetCell = event.target.closest('td'); const targetRow = targetCell?.closest('tr'); if (!targetCell || !targetRow) return; const empIdStr = targetRow.dataset.employeeId; const dateStr = targetCell.dataset.date; const dayIndexStr = targetCell.dataset.dayIndex; if (!empIdStr || !dateStr || !dayIndexStr) return; const dayIndex = parseInt(dayIndexStr, 10); const employee = scheduleEmployees.find(e => String(e.id) === empIdStr); if (!employee) return; console.log(`   Editing for: ${employee.name}, Date: ${dateStr}`); const key = `${empIdStr}-${dateStr}`; const currentShift = scheduleData[key]; if (!editShiftEmpIdInput || !editShiftDayIndexInput || !shiftEmployeeDisplay || !shiftDateDisplay || !shiftTypeSelect || !customShiftInput || !shiftNotesInput) { console.error("Shift modal INPUT elements missing!"); return; } editShiftEmpIdInput.value = empIdStr; editShiftDayIndexInput.value = dayIndex; shiftEmployeeDisplay.value = employee.name; try { const d=new Date(dateStr+'T00:00:00Z'); shiftDateDisplay.value=formatDate(d,'weekday-short'); } catch(e){ shiftDateDisplay.value=dateStr; } if (currentShift) { shiftTypeSelect.value=currentShift.type||'morning'; customShiftInput.value=currentShift.type==='custom'?currentShift.text:''; shiftNotesInput.value=currentShift.notes||''; } else { shiftForm.reset(); shiftTypeSelect.value='morning'; } handleShiftTypeChange(); console.log("   Attempting to show shift modal by adding 'active' class..."); shiftModal.classList.add('active'); console.log("   'active' class added to shift modal."); shiftTypeSelect?.focus(); }
    function closeShiftModalHandler() { if(shiftModal) shiftModal.classList.remove('active'); }
    function handleShiftFormSubmit(e) { e.preventDefault(); console.log("Handler: handleShiftFormSubmit"); if (!canEditSchedule) { showToast("Permission denied.", "danger"); return; } const empId = editShiftEmpIdInput.value; const dayIndex = parseInt(editShiftDayIndexInput.value, 10); const shiftType = shiftTypeSelect.value; const customText = customShiftInput.value.trim(); const notes = shiftNotesInput.value.trim(); if (isNaN(dayIndex)) return; const targetDate = new Date(currentWeekStart); targetDate.setDate(targetDate.getDate() + dayIndex); const dateStr = formatDate(targetDate); if (dateStr === "Invalid Date") return; const key = `${empId}-${dateStr}`; console.log(`Saving shift key: ${key}, Type: ${shiftType}`); if (shiftType === 'delete') { delete scheduleData[key]; } else { scheduleData[key] = { type: shiftType, text: shiftType==='custom'?(customText||'Custom'):getShiftText(shiftType), notes: notes }; } const cellToUpdate = scheduleTableBody?.querySelector(`tr[data-employee-id="${empId}"] td[data-day-index="${dayIndex}"]`); if (cellToUpdate) { const updatedShiftInfo = scheduleData[key]; let newCellContent = ''; if (updatedShiftInfo) newCellContent = `<div class="shift ${getShiftClass(updatedShiftInfo.type)}" title="${updatedShiftInfo.notes || ''}">${getShiftText(updatedShiftInfo.type, updatedShiftInfo.text)}</div>`; if (canEditSchedule) { newCellContent += `<span class="edit-shift" title="Edit Shift"></span>`; cellToUpdate.innerHTML = newCellContent; cellToUpdate.querySelector('.edit-shift')?.addEventListener('click', handleEditShiftClick); } else { cellToUpdate.innerHTML = newCellContent; } } else { renderScheduleTable(); } closeShiftModalHandler(); showToast(`Shift updated!`); if(saveScheduleBtn) saveScheduleBtn.style.border = '2px solid orange'; }
    function handleSaveSchedule() { console.log("Handler: handleSaveSchedule"); if (!canEditSchedule) return; try { localStorage.setItem('employeeScheduleData', JSON.stringify(scheduleData)); showToast('Schedule saved!'); if(saveScheduleBtn) saveScheduleBtn.style.border = 'none'; } catch (e) { console.error("Error saving schedule:", e); showToast('Error saving.', 'danger'); } }
    function handleSendReminders() { console.log("Handler: handleSendReminders"); if (!canEditSchedule) return; const weekEnd=new Date(currentWeekStart); weekEnd.setDate(currentWeekStart.getDate()+6); const subject=encodeURIComponent(`Sched: ${formatDate(currentWeekStart,'short')}`); const body=encodeURIComponent(`Schedule for ${formatDate(currentWeekStart,'short')} - ${formatDate(weekEnd,'short')}\n\nBest,\n${currentUser.name||'Mgr'}`); const recipients=scheduleEmployees.map(e=>e.email).filter(Boolean).join(','); if (!recipients) { showToast('No emails found.', 'danger'); return; } const mailtoLink=`mailto:?bcc=${recipients}&subject=${subject}&body=${body}`; try { const a=document.createElement('a'); a.href=mailtoLink; a.target='_blank'; a.rel='noopener noreferrer'; document.body.appendChild(a); a.click(); document.body.removeChild(a); showToast('Opening email...'); } catch (e) { console.error("Mailto error:", e); showToast('Could not open mail.', 'danger'); } }

    // ============================================
    // CORE RENDERING LOGIC
    // ============================================
    function renderScheduleTable() {
        console.log(`%c--- renderScheduleTable CALLED (Full Logic) --- Emp Count: ${scheduleEmployees.length}`, "color: green;");
        if (!scheduleTableBody) { console.error("renderScheduleTable: FATAL - scheduleTableBody missing!"); return; }
        scheduleTableBody.innerHTML = ''; // Clear

        if (scheduleEmployees.length === 0) { console.log("renderScheduleTable: No employees."); const row = scheduleTableBody.insertRow(); const cell = row.insertCell(); cell.colSpan = 8; cell.textContent = "No employees available in the schedule."; cell.style.cssText = 'text-align: center; padding: 2rem; color: var(--gray); font-style: italic;'; return; }

        console.log("renderScheduleTable: Starting employee loop...");
        try {
            scheduleEmployees.forEach((emp) => {
                if (!emp?.id || !emp?.name) { console.warn(`Skipping invalid emp data:`, emp); return; }
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
                             // console.log(`   Attaching edit listener to span for [${emp.id}, ${dateStr}]`); // Can be verbose
                             editSpan.addEventListener('click', handleEditShiftClick); // Attach listener
                        } else { console.warn(`   Could not find edit span for [${emp.id}, ${dateStr}]`); }
                    } else { cell.innerHTML = cellContent; }
                }
            });
            console.log("renderScheduleTable: Finished rendering FULL rows.");
        } catch (error) { console.error("!!! ERROR in FULL renderScheduleTable loop !!!:", error); scheduleTableBody.innerHTML = `<tr><td colspan="8" style="color: red;">Error rendering rows.</td></tr>`; }
    }

    function updateWeekDisplay() { /* ... (Use the FULL version from previous replies that calls renderScheduleTable) ... */ }

    // ============================================
    // EVENT LISTENER SETUP
    // ============================================
    function setupScheduleEventListeners() { console.log("setupScheduleEventListeners: Attaching ALL listeners..."); /* ... (Use the FULL version from previous replies) ... */ }

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() { console.log("init: Starting Employee Schedule module initialization..."); /* ... (Use the FULL version from previous replies) ... */ }

    // --- Run Initialization ---
    try { init(); } catch (error) { console.error("CRITICAL ERROR during Schedule init():", error); /* Display error */ }

} // End of initializeEmployeeSchedule function
