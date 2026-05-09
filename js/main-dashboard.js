const facultyApiUrl = "http://localhost/my-api/faculty.php";
const departmentApiUrl = "http://localhost/my-api/department.php";

async function fetchDashboardData() {
    try {
        // Fetch both concurrently
        const [facultyRes, departmentRes] = await Promise.all([
            fetch(facultyApiUrl),
            fetch(departmentApiUrl)
        ]);

        let facultyData = await facultyRes.json();
        let departmentData = await departmentRes.json();

        // Convert to array if necessary
        facultyData = Array.isArray(facultyData) ? facultyData : [facultyData];
        departmentData = Array.isArray(departmentData) ? departmentData : [departmentData];

        // Update counts
        // Handle case where API returns error JSON or empty instead of array
        const totalFaculty = facultyData.length && facultyData[0].id ? facultyData.length : 0;
        const totalDepartments = departmentData.length && departmentData[0].id ? departmentData.length : 0;

        document.getElementById('totalFaculty').innerText = totalFaculty;
        document.getElementById('totalDepartments').innerText = totalDepartments;

        // Animate numbers
        animateValue("totalFaculty", 0, totalFaculty, 1000);
        animateValue("totalDepartments", 0, totalDepartments, 1000);

        // Process Recent Faculty
        renderRecentFaculty(facultyData);

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        document.getElementById('recentFacultyList').innerHTML = `<div class="loading-state">Failed to load data.</div>`;
    }
}

function renderRecentFaculty(facultyData) {
    const listContainer = document.getElementById('recentFacultyList');
    
    if (!facultyData || facultyData.length === 0 || !facultyData[0].id) {
        listContainer.innerHTML = `<div class="loading-state">No recent activity found.</div>`;
        return;
    }

    // Sort by ID descending (assuming higher ID = newer)
    const sortedFaculty = facultyData.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    
    // Take top 5
    const recent5 = sortedFaculty.slice(0, 5);

    listContainer.innerHTML = ''; // clear loading state

    recent5.forEach((faculty, index) => {
        const placeholder = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNjY2MiLz48L3N2Zz4=';
        const imageUrl = (faculty.image_url && faculty.image_url !== "null") ? faculty.image_url : placeholder;

        // Optional: add staggered animation delay
        const delay = index * 0.1;

        const itemHtml = `
            <div class="recent-item" style="animation: fadeInUp 0.5s ease-out ${delay}s both;">
                <img src="${imageUrl}" alt="${faculty.name}" onerror="this.src='${placeholder}'">
                <div class="recent-details">
                    <h4>${faculty.name}</h4>
                    <p>${faculty.department_name}</p>
                </div>
                <div class="recent-time">New</div>
            </div>
        `;
        listContainer.insertAdjacentHTML('beforeend', itemHtml);
    });
}

// Function to animate numbers counting up
function animateValue(id, start, end, duration) {
    if (start === end) return;
    var range = end - start;
    var current = start;
    var increment = end > start ? 1 : -1;
    var stepTime = Math.abs(Math.floor(duration / range));
    // Max framerate fallback
    if(stepTime < 20) stepTime = 20; 
    
    var obj = document.getElementById(id);
    var timer = setInterval(function() {
        current += increment;
        obj.innerHTML = current;
        if (current == end) {
            clearInterval(timer);
        }
    }, stepTime);
}

// Initialize
document.addEventListener('DOMContentLoaded', fetchDashboardData);
