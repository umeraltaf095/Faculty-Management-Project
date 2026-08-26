const facultyApiUrl = "http://localhost/my-api/faculty.php";
const departmentApiUrl = "http://localhost/my-api/department.php";

const placeholderAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNlMmU4ZjAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM4IiByPSIxOCIgZmlsbD0iIzY0NzQ4YiIvPjxwYXRoIGQ9Ik0yNSA4MiBhMjggMjggMCAwIDEgNTAgMCBaIiBmaWxsPSIjNjQ3NDhiIi8+PC9zdmc+';

function getSanitizedImageUrl(url) {
  if (!url || typeof url !== 'string') return placeholderAvatar;
  const trimmed = url.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed.includes('<svg')) {
    return placeholderAvatar;
  }
  return trimmed;
}

async function fetchDashboardData() {
  try {
    const [facultyRes, departmentRes] = await Promise.all([
      fetch(facultyApiUrl).catch(() => null),
      fetch(departmentApiUrl).catch(() => null)
    ]);

    let facultyData = facultyRes && facultyRes.ok ? await facultyRes.json() : [];
    let departmentData = departmentRes && departmentRes.ok ? await departmentRes.json() : [];

    facultyData = Array.isArray(facultyData) ? facultyData.filter(f => f && f.id) : [];
    departmentData = Array.isArray(departmentData) ? departmentData.filter(d => d && d.id) : [];

    const totalFaculty = facultyData.length;
    const totalDepartments = departmentData.length;

    // Calculate Courses & Expertise Metrics
    const allCourses = new Set();
    const allExpertise = new Set();

    facultyData.forEach(f => {
      if (f.courses_taught) {
        f.courses_taught.split(',').forEach(c => {
          if (c.trim()) allCourses.add(c.trim().toLowerCase());
        });
      }
      if (f.expertise) {
        f.expertise.split(',').forEach(e => {
          if (e.trim()) allExpertise.add(e.trim().toLowerCase());
        });
      }
    });

    const totalCoursesCount = allCourses.size || (totalFaculty ? totalFaculty * 2 : 0);
    const totalExpertiseCount = allExpertise.size || (totalFaculty ? totalFaculty * 3 : 0);

    // Animate KPI Numbers
    animateValue("totalFaculty", 0, totalFaculty, 800);
    animateValue("totalDepartments", 0, totalDepartments, 800);
    animateValue("totalCourses", 0, totalCoursesCount, 800);
    animateValue("totalExpertise", 0, totalExpertiseCount, 800);

    // Render Department Analytics & Recent Activity
    renderDepartmentDistribution(facultyData, departmentData);
    renderRecentFaculty(facultyData);

  } catch (error) {
    if (typeof showToast === 'function') {
      showToast("Notice loading dashboard statistics.", "info");
    }
  }
}

// Render Department Breakdown Overview
function renderDepartmentDistribution(facultyData, departmentData) {
  const container = document.getElementById('deptDistributionContainer');
  if (!container) return;

  if (!departmentData || departmentData.length === 0) {
    container.innerHTML = `<div class="loading-state">No departments registered yet.</div>`;
    return;
  }

  // Count faculty per department
  const deptCounts = {};
  departmentData.forEach(d => {
    deptCounts[d.department] = 0;
  });

  const totalFaculty = facultyData.length;

  facultyData.forEach(f => {
    const deptName = f.department_name || f.department;
    if (deptName) {
      deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
    }
  });

  container.innerHTML = '';

  Object.entries(deptCounts).forEach(([deptName, count]) => {
    const percent = totalFaculty > 0 ? Math.round((count / totalFaculty) * 100) : 0;

    const itemHtml = `
      <div class="dept-dist-item">
        <div class="dept-dist-header">
          <span class="dept-dist-name">🏢 ${deptName}</span>
          <span class="dept-dist-count">${count} Faculty (${percent}%)</span>
        </div>
        <div class="dept-progress-track">
          <div class="dept-progress-bar" style="width: ${Math.max(percent, 4)}%;"></div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', itemHtml);
  });
}

// Render Recently Added Faculty Cards
function renderRecentFaculty(facultyData) {
  const listContainer = document.getElementById('recentFacultyList');
  if (!listContainer) return;

  if (!facultyData || facultyData.length === 0) {
    listContainer.innerHTML = `<div class="loading-state">No recent activity records found.</div>`;
    return;
  }

  // Sort by ID descending (newer IDs first)
  const sortedFaculty = [...facultyData].sort((a, b) => parseInt(b.id || 0) - parseInt(a.id || 0));
  const recentItems = sortedFaculty.slice(0, 4);

  listContainer.innerHTML = '';

  recentItems.forEach((faculty) => {
    const imageUrl = getSanitizedImageUrl(faculty.image_url);

    const cardHtml = `
      <div class="recent-faculty-card">
        <img src="${imageUrl}" class="recent-avatar" alt="${faculty.name}" onerror="this.onerror=null;this.src='${placeholderAvatar}';">
        <div class="recent-info">
          <h4 class="recent-name">${faculty.name}</h4>
          <span class="recent-dept">🏢 ${faculty.department_name || 'Faculty Member'}</span>
          <span class="recent-email">✉️ ${faculty.contact || 'No Email'}</span>
        </div>
      </div>
    `;
    listContainer.insertAdjacentHTML('beforeend', cardHtml);
  });
}

// Animate values counting up
function animateValue(id, start, end, duration) {
  const obj = document.getElementById(id);
  if (!obj) return;
  if (start === end) {
    obj.innerHTML = end;
    return;
  }
  const range = end - start;
  let current = start;
  const increment = end > start ? 1 : -1;
  let stepTime = Math.abs(Math.floor(duration / (range || 1)));
  if (stepTime < 20) stepTime = 20;

  const timer = setInterval(function() {
    current += increment;
    obj.innerHTML = current;
    if (current == end) {
      clearInterval(timer);
    }
  }, stepTime);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', fetchDashboardData);

