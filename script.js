document.getElementById("notificationBtn").addEventListener("click", function () {  
    const notifications = document.getElementById("notifications");  
    notifications.classList.toggle("hidden");  
});  

// Sample data for recent activities  
let activities = [  
    { username: "Alice", action: "completed a task", time: "2 minutes ago" },  
    { username: "Bob", action: "added a new project", time: "1 hour ago" },  
    { username: "Charlie", action: "uploaded a file", time: "3 hours ago" }  
];  

function showRecentActivities() {  
    const activityList = document.getElementById("activityList");  
    activityList.innerHTML = '';  
    activities.forEach(activity => {  
        const li = document.createElement("li");  
        li.textContent = `${activity.username} ${activity.action} - ${activity.time}`;  
        activityList.appendChild(li);  
    });  
}  

showRecentActivities();  

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
            mainContent.innerHTML = '<h4>Settings Content Here...</h4>';  
            break;  
        case 'profile':  
            mainContent.innerHTML = '<h4>Profile Content Here...</h4>';  
            break;  
        default:  
            mainContent.innerHTML = '<h4>Select an option from the sidebar to display content here.</h4>';  
            break;  
    }  
}  