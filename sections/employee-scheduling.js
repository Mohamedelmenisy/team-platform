document.addEventListener('DOMContentLoaded', function() {
    // Initialize the schedule section
    initEmployeeScheduling();
});

function initEmployeeScheduling() {
    // DOM Elements
    const employeeModal = document.getElementById('employeeModal');
    const shiftModal = document.getElementById('shiftModal');
    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    const sendRemindersBtn = document.getElementById('sendRemindersBtn');
    const closeEmployeeModal = document.getElementById('closeEmployeeModal');
    const closeShiftModal = document.getElementById('closeShiftModal');
    const cancelEmployeeBtn = document.getElementById('cancelEmployeeBtn');
    const cancelShiftBtn = document.getElementById('cancelShiftBtn');
    const employeeForm = document.getElementById('employeeForm');
    const shiftForm = document.getElementById('shiftForm');
    const shiftType = document.getElementById('shiftType');
    const customShiftGroup = document.getElementById('customShiftGroup');
    const deleteShiftBtn = document.getElementById('deleteShiftBtn');
    const prevWeekBtn = document.getElementById('prevWeekBtn');
    const nextWeekBtn = document.getElementById('nextWeekBtn');
    const weekDisplay = document.getElementById('weekDisplay');
    const saveScheduleBtn = document.getElementById('saveScheduleBtn');
    const additionalEmployeesRow = document.getElementById('additionalEmployeesRow');
    const shiftDateInput = document.getElementById('shiftDate');
    const toastNotification = document.getElementById('toastNotification');
    
    // Employee data
    const employees = [
        { id: 1, name: 'Mohamed Elmenisy', email: 'mohamed@example.com' },
        { id: 2, name: 'Yousef', email: 'yousef@example.com' },
        { id: 3, name: 'Esraa Lashin', email: 'esraa@example.com' },
        { id: 4, name: 'Bassant Badr', email: 'bassant@example.com' }
    ];
    
    // Current week tracking
    let currentWeekStart = new Date(2025, 4, 5);
    const minDate = new Date(2025, 4, 1);
    const maxDate = new Date(2025, 4, 31);
    
    // Show toast notification
    function showToast(message, type = 'success') {
        toastNotification.textContent = message;
        toastNotification.style.backgroundColor = type === 'success' ? 'var(--primary)' : 'var(--danger)';
        toastNotification.classList.add('show');
        
        setTimeout(() => {
            toastNotification.classList.remove('show');
        }, 3000);
    }
    
    // Update week display
    function updateWeekDisplay() {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const options = { month: 'short', day: 'numeric' };
        const startStr = currentWeekStart.toLocaleDateString('en-US', options);
        const endStr = weekEnd.toLocaleDateString('en-US', options);
        const year = currentWeekStart.getFullYear();
        
        weekDisplay.textContent = `${startStr} - ${endStr}, ${year}`;
        
        // Update table headers with dates
        const dateCells = document.querySelectorAll('.day-date');
        const tempDate = new Date(currentWeekStart);
        
        dateCells.forEach((cell) => {
            const dateStr = tempDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            cell.textContent = dateStr;
            tempDate.setDate(tempDate.getDate() + 1);
        });
        
        // Disable navigation buttons when at limits
        const prevWeek = new Date(currentWeekStart);
        prevWeek.setDate(prevWeek.getDate() - 7);
        prevWeekBtn.disabled = prevWeek < minDate;
        
        const nextWeek = new Date(weekEnd);
        nextWeek.setDate(nextWeek.getDate() + 1);
        nextWeekBtn.disabled = nextWeek > maxDate;
    }
    
    // Navigation between weeks
    prevWeekBtn.addEventListener('click', function() {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        updateWeekDisplay();
    });
    
    nextWeekBtn.addEventListener('click', function() {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        updateWeekDisplay();
    });
    
    // Show/hide custom shift input
    shiftType.addEventListener('change', function() {
        customShiftGroup.style.display = this.value === 'custom' ? 'block' : 'none';
    });
    
    // Modal controls
    addEmployeeBtn.addEventListener('click', function() {
        employeeModal.style.display = 'flex';
    });
    
    closeEmployeeModal.addEventListener('click', function() {
        employeeModal.style.display = 'none';
    });
    
    cancelEmployeeBtn.addEventListener('click', function() {
        employeeModal.style.display = 'none';
    });
    
    closeShiftModal.addEventListener('click', function() {
        shiftModal.style.display = 'none';
    });
    
    cancelShiftBtn.addEventListener('click', function() {
        shiftModal.style.display = 'none';
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === employeeModal) {
            employeeModal.style.display = 'none';
        }
        if (event.target === shiftModal) {
            shiftModal.style.display = 'none';
        }
    });
    
    // Add new employee
    employeeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('empName').value;
        const email = document.getElementById('empEmail').value;
        const position = document.getElementById('empPosition').value;
        const role = document.getElementById('empRole').value;
        
        // Create new employee
        const newEmployee = {
            id: employees.length + 1,
            name: name,
            email: email
        };
        
        employees.push(newEmployee);
        
        // Add new row to the table
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td class="employee-name">${name}</td>
            <td class="admin-controls">
                <span class="edit-shift" data-emp="${newEmployee.id}" data-day="mon">(edit)</span>
            </td>
            <td class="admin-controls">
                <span class="edit-shift" data-emp="${newEmployee.id}" data-day="tue">(edit)</span>
            </td>
            <td class="admin-controls">
                <span class="edit-shift" data-emp="${newEmployee.id}" data-day="wed">(edit)</span>
            </td>
            <td class="admin-controls">
                <span class="edit-shift" data-emp="${newEmployee.id}" data-day="thu">(edit)</span>
            </td>
            <td class="admin-controls">
                <span class="edit-shift" data-emp="${newEmployee.id}" data-day="fri">(edit)</span>
            </td>
            <td class="admin-controls">
                <span class="edit-shift" data-emp="${newEmployee.id}" data-day="sat">(edit)</span>
            </td>
            <td class="admin-controls">
                <span class="edit-shift" data-emp="${newEmployee.id}" data-day="sun">(edit)</span>
            </td>
        `;
        
        // Show edit buttons if admin
        if (currentUser.role === 'admin' || currentUser.role === 'supervisor') {
            newRow.querySelectorAll('.edit-shift').forEach(el => el.style.display = 'inline');
        }
        
        additionalEmployeesRow.parentNode.insertBefore(newRow, additionalEmployeesRow);
        
        // Reset form and close modal
        employeeForm.reset();
        employeeModal.style.display = 'none';
        
        showToast(`Employee ${name} added successfully!`);
    });
    
    // Edit shift buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-shift')) {
            const button = e.target;
            const empId = parseInt(button.getAttribute('data-emp'));
            const day = button.getAttribute('data-day');
            const currentCell = button.closest('td');
            
            const employee = employees.find(e => e.id === empId);
            const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
            const dayIndex = days.indexOf(day);
            
            if (employee && dayIndex !== -1) {
                const date = new Date(currentWeekStart);
                date.setDate(date.getDate() + dayIndex);
                
                document.getElementById('shiftEmployee').value = employee.name;
                
                // Format date for input
                const formattedDate = date.toISOString().split('T')[0];
                shiftDateInput.value = formattedDate;
                shiftDateInput.min = '2025-05-01';
                shiftDateInput.max = '2025-05-31';
                
                // Set current shift type
                const shiftDiv = currentCell.querySelector('.shift');
                
                if (shiftDiv) {
                    if (shiftDiv.classList.contains('shift-morning')) {
                        shiftType.value = 'morning';
                    } else if (shiftDiv.classList.contains('shift-afternoon')) {
                        shiftType.value = 'afternoon';
                    } else if (shiftDiv.classList.contains('shift-night')) {
                        shiftType.value = 'night';
                    } else if (shiftDiv.classList.contains('day-off')) {
                        shiftType.value = 'day-off';
                    } else if (shiftDiv.classList.contains('sick-leave')) {
                        shiftType.value = 'sick-leave';
                    } else if (shiftDiv.classList.contains('vacation')) {
                        shiftType.value = 'vacation';
                    }
                } else {
                    shiftType.value = 'morning';
                }
                
                // Store reference to the cell being edited
                shiftModal.dataset.currentCell = currentCell.id || '';
                if (!currentCell.id) {
                    currentCell.id = `cell-${Date.now()}`;
                    shiftModal.dataset.currentCell = currentCell.id;
                }
                
                shiftModal.style.display = 'flex';
            }
        }
    });
    
    // Save shift changes
    shiftForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const employeeName = document.getElementById('shiftEmployee').value;
        const shiftTypeValue = document.getElementById('shiftType').value;
        const customShift = document.getElementById('customShift').value;
        
        // Get the cell being edited
        const currentCellId = shiftModal.dataset.currentCell;
        const currentCell = document.getElementById(currentCellId);
        
        if (currentCell) {
            // Remove any existing shift div
            const existingShift = currentCell.querySelector('.shift');
            if (existingShift) {
                currentCell.removeChild(existingShift);
            }
            
            // Create new shift div
            let shiftDiv = document.createElement('div');
            shiftDiv.className = 'shift';
            
            switch(shiftTypeValue) {
                case 'morning':
                    shiftDiv.classList.add('shift-morning');
                    shiftDiv.textContent = '9AM-5PM';
                    break;
                case 'afternoon':
                    shiftDiv.classList.add('shift-afternoon');
                    shiftDiv.textContent = '12PM-8PM';
                    break;
                case 'night':
                    shiftDiv.classList.add('shift-night');
                    shiftDiv.textContent = '5PM-1AM';
                    break;
                case 'day-off':
                    shiftDiv.classList.add('day-off');
                    shiftDiv.textContent = 'OFF';
                    break;
                case 'sick-leave':
                    shiftDiv.classList.add('sick-leave');
                    shiftDiv.textContent = 'SICK';
                    break;
                case 'vacation':
                    shiftDiv.classList.add('vacation');
                    shiftDiv.textContent = 'VAC';
                    break;
                case 'custom':
                    shiftDiv.classList.add('shift-morning');
                    shiftDiv.textContent = customShift || 'Custom';
                    break;
            }
            
            // Insert the new shift before the edit link
            const editLink = currentCell.querySelector('.edit-shift');
            currentCell.insertBefore(shiftDiv, editLink);
            
            showToast(`Shift for ${employeeName} updated successfully!`);
        }
        
        shiftModal.style.display = 'none';
    });
    
    // Delete shift
    deleteShiftBtn.addEventListener('click', function() {
        const employeeName = document.getElementById('shiftEmployee').value;
        const currentCellId = shiftModal.dataset.currentCell;
        const currentCell = document.getElementById(currentCellId);
        
        if (currentCell) {
            const shiftDiv = currentCell.querySelector('.shift');
            if (shiftDiv) {
                currentCell.removeChild(shiftDiv);
                showToast(`Shift for ${employeeName} deleted successfully!`, 'danger');
            }
        }
        
        shiftModal.style.display = 'none';
    });
    
    // Save schedule button
    saveScheduleBtn.addEventListener('click', function() {
        showToast('Schedule saved successfully!');
    });
    
    // Send reminders button
    sendRemindersBtn.addEventListener('click', function() {
        const subject = encodeURIComponent('Upcoming Work Schedule Reminder');
        const body = encodeURIComponent(`Dear Team,\n\nThis is a reminder of your upcoming work schedule for the week of ${weekDisplay.textContent}.\n\nPlease review your shifts below and let us know if you have any questions or conflicts.\n\nBest regards,\n${currentUser.name}\n${currentUser.email}`);
        
        const recipientEmails = employees.map(e => e.email).join(',');
        const mailtoLink = `mailto:?bcc=${recipientEmails}&subject=${subject}&body=${body}`;
        window.open(mailtoLink, '_blank');
        
        showToast('Reminder email prepared for all employees. Please review and send.');
    });
    
    // Initialize
    updateWeekDisplay();
    
    // Show admin controls if user is admin
    if (currentUser.role === 'admin' || currentUser.role === 'supervisor') {
        document.querySelectorAll('.edit-shift').forEach(el => el.style.display = 'inline');
        addEmployeeBtn.style.display = 'flex';
        sendRemindersBtn.style.display = 'flex';
        saveScheduleBtn.style.display = 'flex';
    }
}
