// Sample initial data  
const user = {  
    username: "John Doe",  
    email: "john.doe@example.com",  
    role: "Admin",  
    teamCount: 5,  
    taskCount: 12,  
    projectCount: 3,  
    recentActivities: [  
        { username: "Alice", action: "Completed Task 1", time: "2 minutes ago" },  
        { username: "Bob", action: "Added Project A", time: "1 hour ago" },  
        { username: "Charlie", action: "Uploaded File X", time: "3 hours ago" }  
    ]  
};  

document.getElementById("username").textContent = user.username;  
document.getElementById("email").textContent = user.email;  
document.getElementById("role").textContent = user.role;  
document.getElementById("teamCount").textContent = user.teamCount;  
document.getElementById("taskCount").textContent = user.taskCount;  
document.getElementById("projectCount").textContent = user.projectCount;  

// Function to show recent activities  
function showRecentActivities() {  
    const activityList = document.getElementById("activityList");  
    activityList.innerHTML = '';  
    user.recentActivities.forEach(activity => {  
        const li = document.createElement("li");  
        li.textContent = `${activity.username} ${activity.action} - ${activity.time}`;  
        activityList.appendChild(li);  
    });  
}  

// Show recent activities initially  
showRecentActivities();  

// Handle sidebar navigation  
function showContent(content) {  
    const mainContent = document.getElementById("mainContent");  
    switch (content) {  
        case 'taskManagement':  
            mainContent.innerHTML = '<h4>Task Management Content Here...</h4>';  
            break;  
        case 'employeeScheduling':  
            mainContent.innerHTML = '<h4>Employee Scheduling Content Here...</h4>';  
            break;  
        case 'fileSharing':  
            mainContent.innerHTML = '<h4>File Sharing Content Here...</h4>';  
            break;  
        case 'dataManagement':  
            mainContent.innerHTML = '<h4>Data Management Content Here...</h4>';  
            break;  
        case 'projectTracking':  
            mainContent.innerHTML = '<h4>Project Tracking Content Here...</h4>';  
            break;  
        case 'teamCalendar':  
            mainContent.innerHTML = '<h4>Team Calendar Content Here...</h4>';  
            break;  
        case 'deadlineTracking':  
            mainContent.innerHTML = '<h4>Deadline Tracking Content Here...</h4>';  
            break;  
        case 'innovationHub':  
            mainContent.innerHTML = '<h4>Innovation Hub Content Here...</h4>';  
            break;  
        case 'settings':  
            mainContent.innerHTML = `  
                <h4>Settings</h4>  
                <p>Appearance, Change Password, Language, Notification Settings</p>  
                <form id="addUserForm">  
                    <h5>Add Member</h5>  
                    <input type="text" id="newName" placeholder="Name" required>  
                    <input type="email" id="newEmail" placeholder="Email" required>  
                    <input type="text" id="newRole" placeholder="Role" required>  
                    <button type="submit">Add Member</button>  
                </form>  
            `;  
            document.getElementById("addUserForm").addEventListener("submit", addUser);  
            break;  
        case 'profile':  
            mainContent.innerHTML = `  
                <h4>Profile</h4>  
                <form id="profileForm">  
                    <label>Name: <input type="text" id="profileName" value="${user.username}" required></label>  
                    <label>Email: <input type="email" id="profileEmail" value="${user.email}" required></label>  
                    <label>Phone: <input type="tel" id="profilePhone" required></label>  
                    <button type="submit">Save Changes</button>  
                </form>  
            `;  
            document.getElementById("profileForm").addEventListener("submit", saveProfile);  
            break;  
        default:  
            mainContent.innerHTML = '<h4>Select an option from the sidebar to display content here.</h4>';  
            break;  
    }  
}  

// Function to save profile changes  
function saveProfile(event) {  
    event.preventDefault();  
    const newName = document.getElementById("profileName").value;  
    const newEmail = document.getElementById("profileEmail").value;  
    const newPhone = document.getElementById("profilePhone").value;  
    
    // Update user data  
    user.username = newName;  
    user.email = newEmail;  

    // For demonstration: Mock saving to a database  
    alert("Profile updated successfully!");  

    // Refresh the displayed information  
    showContent('profile');  
}  

// Function to add new users  
function addUser(event) {  
    event.preventDefault();  
    const newName = document.getElementById("newName").value;  
    const newEmail = document.getElementById("newEmail").value;  
    const newRole = document.getElementById("newRole").value;  

    // Mock action for adding a user  
    alert(`Member added: ${newName}, Email: ${newEmail}, Role: ${newRole}`);  

    // Here you would typically send this data to your server.  
}  

// Handle notification toggle  
document.getElementById("notificationBtn").addEventListener("click", function () {  
    const notifications = document.getElementById("notifications");  
    notifications.classList.toggle("hidden");  
});  

// Automatically show recent activities  
showRecentActivities();  