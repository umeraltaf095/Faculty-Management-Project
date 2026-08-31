const apiBaseUrl = "http://localhost/my-api/faculty.php";

const facultyGrid = document.getElementById("facultyGrid");
const tableContainer = document.getElementById("tableContainer");
const tableBody = document.querySelector("#facultyTable tbody");

const searchName = document.getElementById("searchName");
const searchDept = document.getElementById("searchDept");
const searchCourse = document.getElementById("searchCourse");
const searchExpertise = document.getElementById("searchExpertise");
const searchInterests = document.getElementById("searchInterests");

const viewGridBtn = document.getElementById("viewGridBtn");
const viewTableBtn = document.getElementById("viewTableBtn");

let currentFacultyList = [];
let currentPage = 1;
const itemsPerPage = 9; // 9 cards per page looks great in 3x3 grid
let currentViewMode = localStorage.getItem("facultyViewMode") || "grid";

// View mode switcher setup
function setViewMode(mode) {
  currentViewMode = mode;
  localStorage.setItem("facultyViewMode", mode);

  if (mode === "grid") {
    if (facultyGrid) facultyGrid.style.display = "grid";
    if (tableContainer) tableContainer.style.display = "none";
    if (viewGridBtn) viewGridBtn.classList.add("active");
    if (viewTableBtn) viewTableBtn.classList.remove("active");
  } else {
    if (facultyGrid) facultyGrid.style.display = "none";
    if (tableContainer) tableContainer.style.display = "block";
    if (viewTableBtn) viewTableBtn.classList.add("active");
    if (viewGridBtn) viewGridBtn.classList.remove("active");
  }
  renderDirectory();
}

if (viewGridBtn && viewTableBtn) {
  viewGridBtn.addEventListener("click", () => setViewMode("grid"));
  viewTableBtn.addEventListener("click", () => setViewMode("table"));
}

// Fetch faculty data from API
async function fetchFaculty() {
  try {
    const name = searchName ? searchName.value.trim() : "";
    const department = searchDept ? searchDept.value.trim() : "";
    const courses = searchCourse ? searchCourse.value.trim() : "";
    const expertise = searchExpertise ? searchExpertise.value.trim() : "";
    const interests = searchInterests ? searchInterests.value.trim() : "";

    const url = new URL(apiBaseUrl);
    if (name) url.searchParams.append("name", name);
    if (department) {
      url.searchParams.append("department", department);
      url.searchParams.append("department_name", department);
    }
    if (courses) url.searchParams.append("courses_taught", courses);
    if (expertise) url.searchParams.append("expertise", expertise);

    const response = await fetch(url.toString());
    const data = await response.json();
    let list = Array.isArray(data) ? data : (data && typeof data === 'object' ? [data] : []);

    // Filter by name on frontend
    if (name && Array.isArray(list)) {
      list = list.filter(item => 
        item && item.name && item.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    // Filter by department on frontend (checking department_name and department fields)
    if (department && Array.isArray(list)) {
      list = list.filter(item => {
        if (!item) return false;
        const deptName = (item.department_name || item.department || "").toString().toLowerCase();
        return deptName.includes(department.toLowerCase());
      });
    }

    // Filter by courses on frontend
    if (courses && Array.isArray(list)) {
      list = list.filter(item => 
        item && item.courses_taught && item.courses_taught.toLowerCase().includes(courses.toLowerCase())
      );
    }

    // Filter by expertise on frontend
    if (expertise && Array.isArray(list)) {
      list = list.filter(item => 
        item && item.expertise && item.expertise.toLowerCase().includes(expertise.toLowerCase())
      );
    }

    // Filter by interests on frontend
    if (interests && Array.isArray(list)) {
      list = list.filter(item => 
        item && item.interests && item.interests.toLowerCase().includes(interests.toLowerCase())
      );
    }

    currentFacultyList = list;
    currentPage = 1; // Reset to page 1 on new search query

    renderDirectory();
  } catch (error) {
    showToast("Error fetching faculty data.", "error");
  }
}

// Master Render function
function renderDirectory() {
  if (currentViewMode === "grid") {
    renderCards();
  } else {
    renderTable();
  }
  renderPagination();
}

const placeholder = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNlMmU4ZjAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM4IiByPSIxOCIgZmlsbD0iIzY0NzQ4YiIvPjxwYXRoIGQ9Ik0yNSA4MiBhMjggMjggMCAwIDEgNTAgMCBaIiBmaWxsPSIjNjQ3NDhiIi8+PC9zdmc+';

function getSanitizedImageUrl(url) {
  if (!url || typeof url !== 'string') return placeholder;
  const trimmed = url.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed.includes('<svg')) {
    return placeholder;
  }
  return trimmed;
}

// Render Card Grid View
function renderCards() {
  if (!facultyGrid) return;
  facultyGrid.innerHTML = "";

  if (currentFacultyList.length === 0 || !currentFacultyList[0]?.id) {
    facultyGrid.innerHTML = `<div class="no-records" style="grid-column: 1 / -1;">No faculty members found.</div>`;
    return;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = currentFacultyList.slice(startIndex, endIndex);

  const role = localStorage.getItem('role');
  const isAdmin = role === 'admin';

  pageData.forEach(faculty => {
    const imageUrl = getSanitizedImageUrl(faculty.image_url);

    // Convert comma-separated strings to pill tags
    const expertiseTags = faculty.expertise ? faculty.expertise.split(',').filter(t => t.trim()).map(tag => `<span class="tag-pill expertise">${tag.trim()}</span>`).join('') : '';
    const interestTags = faculty.interests ? faculty.interests.split(',').filter(t => t.trim()).map(tag => `<span class="tag-pill interest">${tag.trim()}</span>`).join('') : '';

    const adminButtons = isAdmin ? `
      <button type="button" class="action-icon-btn edit-btn edit-symbol" title="Edit Faculty" data-id="${faculty.id}">✏️</button>
      <button type="button" class="action-icon-btn delete-btn delete-symbol" title="Delete Faculty" data-id="${faculty.id}" data-name="${faculty.name}">🗑️</button>
    ` : '';

    const cardHtml = `
      <div class="faculty-card" 
        data-id="${faculty.id}" 
        data-name="${faculty.name}" 
        data-department-id="${faculty.department_id}" 
        data-department-name="${faculty.department_name}" 
        data-courses="${faculty.courses_taught}" 
        data-expertise="${faculty.expertise}" 
        data-interests="${faculty.interests}" 
        data-contact="${faculty.contact}"
        data-image="${faculty.image_url || ''}"
      >
        <div class="card-header-banner"></div>
        <div class="card-avatar-wrapper">
          <img src="${imageUrl}" class="card-avatar" alt="${faculty.name}" onerror="this.onerror=null;this.src='${placeholder}';">
        </div>

        <div class="card-body">
          <div class="card-title-group">
            <h3 class="faculty-name">${faculty.name}</h3>
            ${faculty.department_name ? `<span class="dept-badge" title="${faculty.department_name}">🏢 ${faculty.department_name}</span>` : ''}
          </div>

          <div class="card-info-item">
            <span class="info-label">Contact / Email</span>
            <a href="mailto:${faculty.contact}" class="email-link">✉️ ${faculty.contact}</a>
          </div>

          <div class="card-info-item">
            <span class="info-label">Courses Taught</span>
            <span class="info-value">📚 ${faculty.courses_taught || 'N/A'}</span>
          </div>

          ${expertiseTags ? `
          <div class="card-info-item">
            <span class="info-label">Area of Expertise</span>
            <div class="tag-container">${expertiseTags}</div>
          </div>` : ''}

          ${interestTags ? `
          <div class="card-info-item">
            <span class="info-label">Professional Interests</span>
            <div class="tag-container">${interestTags}</div>
          </div>` : ''}
        </div>

        <div class="card-footer">
          <button type="button" class="btn-card-view view-symbol">
            <span>👁️</span> View Profile
          </button>
          <div class="card-action-icons">
            ${adminButtons}
          </div>
        </div>
      </div>
    `;

    facultyGrid.insertAdjacentHTML("beforeend", cardHtml);
  });
}

// Render Table View
function renderTable() {
  if (!tableBody) return;
  tableBody.innerHTML = "";

  if (currentFacultyList.length === 0 || !currentFacultyList[0]?.id) {
    tableBody.innerHTML = `<tr><td colspan="8" class="no-records">No faculty members found.</td></tr>`;
    return;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = currentFacultyList.slice(startIndex, endIndex);

  const role = localStorage.getItem('role');
  const isAdmin = role === 'admin';

  pageData.forEach(faculty => {
    const actionIcons = isAdmin
      ? `
        <span class="view-symbol" style="cursor:pointer;" title="View">👁️</span>
        <span class="edit-symbol" style="cursor:pointer; margin-left:8px;" title="Edit">✏️</span>
        <span class="delete-symbol" style="cursor:pointer; margin-left:8px;" title="Delete">🗑️</span>
      `
      : `
        <span class="view-symbol" style="cursor:pointer;" title="View">👁️</span>
      `;

    const imageUrl = getSanitizedImageUrl(faculty.image_url);

    const row = `
      <tr 
        data-id="${faculty.id}" 
        data-name="${faculty.name}" 
        data-department-id="${faculty.department_id}" 
        data-department-name="${faculty.department_name}" 
        data-courses="${faculty.courses_taught}" 
        data-expertise="${faculty.expertise}" 
        data-interests="${faculty.interests}" 
        data-contact="${faculty.contact}"
        data-image="${faculty.image_url || ''}"
      >
        <td><img src="${imageUrl}" class="faculty-img" alt="" onerror="this.onerror=null;this.src='${placeholder}';"></td>
        <td><strong>${faculty.name}</strong></td>
        <td><span class="dept-badge">${faculty.department_name}</span></td>
        <td>${faculty.courses_taught}</td>
        <td>${faculty.expertise}</td>
        <td>${faculty.interests}</td>
        <td><a href="mailto:${faculty.contact}" class="email-link">${faculty.contact}</a></td>
        <td>${actionIcons}</td>
      </tr>
    `;
    tableBody.insertAdjacentHTML("beforeend", row);
  });
}

// Render Pagination
function renderPagination() {
  let paginationContainer = document.getElementById("paginationContainer");
  if (!paginationContainer) return;
  paginationContainer.innerHTML = "";

  paginationContainer.className = "pagination-wrapper";

  const totalItems = (currentFacultyList[0]?.id) ? currentFacultyList.length : 0;
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  const infoSpan = document.createElement("span");
  infoSpan.className = "results-info";
  infoSpan.innerHTML = `Showing <strong>${startIndex} - ${endIndex}</strong> of <strong>${totalItems}</strong> faculty members`;
  paginationContainer.appendChild(infoSpan);

  const controlsDiv = document.createElement("div");
  controlsDiv.className = "pagination-controls";

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Prev Button
  const prevBtn = document.createElement("button");
  prevBtn.innerHTML = "&#8249;";
  prevBtn.className = "page-btn prev-btn";
  if (currentPage === 1) prevBtn.disabled = true;
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderDirectory();
    }
  });
  controlsDiv.appendChild(prevBtn);

  // Page Numbers
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = "page-btn number-btn";
    if (i === currentPage) {
      btn.classList.add("active");
    }
    btn.addEventListener("click", () => {
      currentPage = i;
      renderDirectory();
    });
    controlsDiv.appendChild(btn);
  }

  // Next Button
  const nextBtn = document.createElement("button");
  nextBtn.innerHTML = "&#8250;";
  nextBtn.className = "page-btn next-btn";
  if (currentPage === totalPages) nextBtn.disabled = true;
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderDirectory();
    }
  });
  controlsDiv.appendChild(nextBtn);

  paginationContainer.appendChild(controlsDiv);
}

// Event Listeners for Search Inputs
[searchName, searchDept, searchCourse, searchExpertise, searchInterests].forEach(input => {
  if (input) {
    input.addEventListener("input", fetchFaculty);
  }
});

// Initial Setup & Load
document.addEventListener("DOMContentLoaded", () => {
  setViewMode(currentViewMode);
  fetchFaculty();
});

// Global Click Events for View, Edit, Delete
document.addEventListener("click", function (e) {
  const target = e.target.closest(".view-symbol, .edit-symbol, .delete-symbol");
  if (!target) return;

  const cardOrRow = target.closest(".faculty-card, tr");
  if (!cardOrRow) return;

  const facultyData = {
    id: cardOrRow.dataset.id,
    name: cardOrRow.dataset.name,
    department_id: cardOrRow.dataset.departmentId,
    department: cardOrRow.dataset.departmentName,
    department_name: cardOrRow.dataset.departmentName,
    courses: cardOrRow.dataset.courses,
    expertise: cardOrRow.dataset.expertise,
    interests: cardOrRow.dataset.interests,
    contact: cardOrRow.dataset.contact,
    image: cardOrRow.dataset.image
  };

  // VIEW ACTION
  if (target.classList.contains("view-symbol")) {
    sessionStorage.setItem("viewFaculty", JSON.stringify(facultyData));
    window.location.href = "view-faculty.html";
  }

  // EDIT ACTION
  if (target.classList.contains("edit-symbol")) {
    sessionStorage.setItem("editFaculty", JSON.stringify(facultyData));
    window.location.href = "edit-faculty.html";
  }

  // DELETE ACTION
  if (target.classList.contains("delete-symbol")) {
    const isAdmin = localStorage.getItem('role') === 'admin';
    if (!isAdmin) return;

    const facultyId = facultyData.id;
    const facultyName = facultyData.name;

    const deleteModal = document.getElementById("deleteModal");
    if (!deleteModal) return;

    const cancelBtn = deleteModal.querySelector(".btn-cancel-delete");
    const confirmBtn = deleteModal.querySelector(".btn-confirm-delete");

    deleteModal.style.display = "flex";

    cancelBtn.onclick = () => {
      deleteModal.style.display = "none";
    };

    confirmBtn.onclick = async () => {
      try {
        const response = await fetch(
          `${apiBaseUrl}?id=${facultyId}`,
          { method: "DELETE" }
        );

        if (response.ok) {
          showToast(`Faculty "${facultyName}" deleted successfully.`, "success");
          fetchFaculty(); // Reload directory
        } else {
          showToast("Failed to delete faculty. Please try again.", "error");
        }
      } catch (error) {
        showToast("An error occurred while deleting the record.", "error");
      } finally {
        deleteModal.style.display = "none";
      }
    };
  }
});


