document.addEventListener('DOMContentLoaded', function() {
    const addButton = document.getElementById('addEmployeeBtn');
    if (addButton) {
        addButton.addEventListener('click', function() {
            alert("You clicked Add Employee!");
        });
    }
});
