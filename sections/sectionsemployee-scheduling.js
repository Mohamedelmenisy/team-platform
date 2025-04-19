document.addEventListener('DOMContentLoaded', function() {
    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    const sendRemindersBtn = document.getElementById('sendRemindersBtn');
    const saveScheduleBtn = document.getElementById('saveScheduleBtn');
    const weekDisplay = document.getElementById('weekDisplay');
    const prevWeekBtn = document.getElementById('prevWeekBtn');
    const nextWeekBtn = document.getElementById('nextWeekBtn');
    const toast = document.getElementById('toastNotification');

    // إظهار عناصر التحكم حسب الصلاحيات (لو admin)
    addEmployeeBtn.style.display = 'flex';
    sendRemindersBtn.style.display = 'flex';
    saveScheduleBtn.style.display = 'flex';

    let currentWeek = new Date(2025, 4, 5); // يبدأ من 6 مايو

    function updateWeekDisplay() {
        let endWeek = new Date(currentWeek);
        endWeek.setDate(endWeek.getDate() + 6);
        weekDisplay.textContent = `${currentWeek.toLocaleDateString()} - ${endWeek.toLocaleDateString()}`;
    }

    prevWeekBtn.addEventListener('click', function() {
        currentWeek.setDate(currentWeek.getDate() - 7);
        updateWeekDisplay();
    });

    nextWeekBtn.addEventListener('click', function() {
        currentWeek.setDate(currentWeek.getDate() + 7);
        updateWeekDisplay();
    });

    saveScheduleBtn.addEventListener('click', function() {
        toast.textContent = "Schedule saved successfully!";
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    });

    document.querySelectorAll('.edit-shift').forEach(item => {
        item.addEventListener('click', () => {
            toast.textContent = `Edit Shift for Employee ID ${item.dataset.emp} on ${item.dataset.day.toUpperCase()}`;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        });
    });

    updateWeekDisplay();
});
