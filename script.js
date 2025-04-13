// --- TeamFlow Pro JavaScript Logic ---

document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".sidebar-menu li a");
    const content = document.getElementById("appContent");

    links.forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();

            links.forEach(l => l.classList.remove("active"));
            link.classList.add("active");

            const section = link.dataset.section;

            content.innerHTML = `
                <div class="section-loaded">
                  <h2>${section.replace(/-/g, ' ').toUpperCase()}</h2>
                  <button onclick="history.back()" class="back-button">Back</button>
                </div>
            `;
        });
    });

    console.log("Dashboard Loaded and Ready!");
});
