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
                <h2>Loading ${section.charAt(0).toUpperCase() + section.slice(1)}...</h2>
                <p>Please wait while the content is being loaded.</p>
            `;

            fetch(`sections/${section}.html`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(html => {
                    content.innerHTML = html;
                })
                .catch(error => {
                    console.error("Error fetching section:", error);
                    content.innerHTML = `
                        <h2>Error</h2>
                        <p>Failed to load the ${section} section. Please try again later.</p>
                    `;
                });
        });
    });

    // Set active state on page load
    const currentSection = window.location.hash.substring(1) || "dashboard";
    const initialLink = document.querySelector(`.sidebar-menu li a[data-section="${currentSection}"]`);
    if (initialLink) {
        initialLink.classList.add("active");
        // Manually trigger the click event
        initialLink.click();
    }
});
