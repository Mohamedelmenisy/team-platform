// sections/employee-scheduling.js

document.addEventListener('DOMContentLoaded', function() {
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
    const toastNotification = document.getElementById('toastNotification');

    const employees = [
        { id: 1, name: 'Mohamed Elmenisy', email: 'mohamed@example.com' },
        { id: 2, name: 'Yousef', email: 'yousef@example.com' },
        { id: 3, name: 'Esraa Lashin', email: 'esraa@example.com' },
        { id: 4, name: 'Bassant Badr', email: 'bassant@example.com' }
    ];

    const currentUser = { name: "Admin User", email: "admin@company.com", role: "admin" };

    if (currentUser.role === 'admin' || currentUser.role === 'supervisor') {
        document.querySelectorAll('.edit-shift').forEach(el => el.style.display = 'inline');
        addEmployeeBtn.style.display = 'flex';
        sendRemindersBtn.style.display = 'flex';
        saveScheduleBtn.style.display = 'flex';
    }

    let currentWeekStart = new Date(2025, 4, 5);
    const minDate = new Date(2025, 4, 1);
    const maxDate = new Date(2025, 4, 31);

    function showToast(message, type = 'success') {
        toastNotification.textContent = message;
        toastNotification.style.backgroundColor = type === 'success' ? 'var(--primary)' : 'var(--danger)';
        toastNotification.classList.add('show');
        setTimeout(() => toastNotification.classList.remove('show'), 3000);
    }

    function updateWeekDisplay() {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const options = { month: 'short', day: 'numeric' };
        const startStr = currentWeekStart.toLocaleDateString('en-US', options);
        const endStr = weekEnd.toLocaleDateString('en-US', options);
        const year = currentWeekStart.getFullYear();

        weekDisplay.textContent = `${startStr} - ${endStr}, ${year}`;

        const dateCells = document.querySelectorAll('.day-date');
        let tempDate = new Date(currentWeekStart);
        dateCells.forEach(cell => {
            cell.textContent = tempDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            tempDate.setDate(tempDate.getDate() + 1);
        });

        const prevWeek = new Date(currentWeekStart);
        prevWeek.setDate(prevWeek.getDate() - 7);
        prevWeekBtn.disabled = prevWeek < minDate;

        const nextWeek = new Date(weekEnd);
        nextWeek.setDate(nextWeek.getDate() + 1);
        nextWeekBtn.disabled = nextWeek > maxDate;
    }

    prevWeekBtn.addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        updateWeekDisplay();
    });

    nextWeekBtn.addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        updateWeekDisplay();
    });

    shiftType.addEventListener('change', function() {
        customShiftGroup.style.display = this.value === 'custom' ? 'block' : 'none';
    });

    addEmployeeBtn.addEventListener('click', () => employeeModal.style.display = 'flex');
    closeEmployeeModal.addEventListener('click', () => employeeModal.style.display = 'none');
    cancelEmployeeBtn.addEventListener('click', () => employeeModal.style.display = 'none');
    closeShiftModal.addEventListener('click', () => shiftModal.style.display = 'none');
    cancelShiftBtn.addEventListener('click', () => shiftModal.style.display = 'none');

    window.addEventListener('click', e => {
        if (e.target === employeeModal) employeeModal.style.display = 'none';
        if (e.target === shiftModal) shiftModal.style.display = 'none';
    });

    employeeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('empName').value;
        const newEmployee = { id: employees.length + 1, name: name };
        employees.push(newEmployee);
        showToast(`Employee ${name} added successfully!`);
        employeeModal.style.display = 'none';
        this.reset();
    });

    saveScheduleBtn.addEventListener('click', () => showToast('Schedule saved successfully!'));

    sendRemindersBtn.addEventListener('click', () => {
        const subject = encodeURIComponent('Upcoming Work Schedule Reminder');
        const body = encodeURIComponent(`Dear Team,\n\nThis is a reminder of your upcoming work schedule for the week of ${weekDisplay.textContent}.\n\nBest regards,\n${currentUser.name}\n${currentUser.email}`);
        const recipientEmails = employees.map(e => e.email).join(',');
        const mailtoLink = `mailto:?bcc=${recipientEmails}&subject=${subject}&body=${body}`;
        window.open(mailtoLink, '_blank');
        showToast('Reminder email prepared for all employees.');
    });

    updateWeekDisplay();
});
