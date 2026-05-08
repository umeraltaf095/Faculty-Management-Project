const apiBaseUrl = "http://localhost/my-api/faculty.php";

const tableBody = document.querySelector(".faculty-table tbody");
const searchInputs = document.querySelectorAll(".search-bars input");
const viewModal = document.getElementById("viewModal");
const viewForm = document.getElementById("viewForm");
const closeBtn = viewModal ? viewModal.querySelector(".btn-close") : null;


let currentFacultyList = [];
let currentPage = 1;
const itemsPerPage = 10;

// Function to fetch faculty data
async function fetchFaculty() {
  try {
    const name = searchInputs[0].value.trim();
    const department = searchInputs[1].value.trim();
    const courses = searchInputs[2].value.trim();
    const expertise = searchInputs[3].value.trim();

    const response = await fetch(
      apiBaseUrl +
      "?name=" + name +
      "&department=" + department +
      "&courses_taught=" + courses +
      "&expertise=" + expertise
    );

    const data = await response.json();
    currentFacultyList = Array.isArray(data) ? data : [data];
    currentPage = 1; // Reset to page 1 on new search

    renderTable();
  } catch (error) {
    console.error("Error fetching faculty:", error);
  }
}

function renderTable() {
  tableBody.innerHTML = ""; // clear table

  if (currentFacultyList.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No records found</td></tr>`;
    renderPagination();
    return;
  }

  // Pagination Logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = currentFacultyList.slice(startIndex, endIndex);

  // Detect if user is admin (based on presence of Add Button)
  const isAdmin = document.querySelector(".btn-add") !== null;

  pageData.forEach(faculty => {
    const actionIcons = isAdmin
      ? `
        <span class="view-symbol">👁️</span>
        <span class="edit-symbol">✏️</span>
        <span class="delete-symbol">🗑️</span>
      `
      : `
        <span class="view-symbol">👁️</span>
      `;

    const placeholder = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNjY2MiLz48L3N2Zz4=';
    const imageUrl = (faculty.image_url && faculty.image_url !== "null") ? faculty.image_url : placeholder;

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
        data-image="${faculty.image_url}"
      >
        <td><img src="${imageUrl}" class="faculty-img" alt="" onerror="this.src='${placeholder}'"></td>
        <td>${faculty.name}</td>
        <td>${faculty.department_name}</td>
        <td>${faculty.courses_taught}</td>
        <td>${faculty.expertise}</td>
        <td>${faculty.interests}</td>
        <td>${faculty.contact}</td>
        <td>${actionIcons}</td>
      </tr>
    `;
    tableBody.insertAdjacentHTML("beforeend", row);
  });

  renderPagination();
}

function renderPagination() {
  let paginationContainer = document.getElementById("paginationContainer");
  if (!paginationContainer) return;
  paginationContainer.innerHTML = "";

  // The wrapper for the whole bottom bar
  paginationContainer.className = "pagination-wrapper";

  const totalItems = currentFacultyList.length;
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // Results info on the left
  const infoSpan = document.createElement("span");
  infoSpan.className = "results-info";
  infoSpan.innerHTML = `<strong>Results: ${startIndex} - ${endIndex} of ${totalItems}</strong>`;
  paginationContainer.appendChild(infoSpan);

  // Pagination controls on the right
  const controlsDiv = document.createElement("div");
  controlsDiv.className = "pagination-controls";

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Prev Button
  const prevBtn = document.createElement("button");
  prevBtn.innerHTML = "&#8249;"; // <
  prevBtn.className = "page-btn prev-btn";
  if (currentPage === 1) prevBtn.disabled = true;
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
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
      renderTable();
    });
    controlsDiv.appendChild(btn);
  }

  // Next Button
  const nextBtn = document.createElement("button");
  nextBtn.innerHTML = "&#8250;"; // >
  nextBtn.className = "page-btn next-btn";
  if (currentPage === totalPages) nextBtn.disabled = true;
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderTable();
    }
  });
  controlsDiv.appendChild(nextBtn);

  paginationContainer.appendChild(controlsDiv);
}

// Event listeners for search inputs
searchInputs.forEach(input => {
  input.addEventListener("input", fetchFaculty);
});

// Initial load
fetchFaculty();

// Global click event listener for all symbols
document.addEventListener("click", function (e) {
  // VIEW ICON
  if (e.target.classList.contains("view-symbol")) {
    const row = e.target.closest("tr");

    // Get data from attributes (or show sample text)
    const facultyData = {
      name: row?.dataset?.name ?? "Dr. Example Name",
      department: row?.dataset?.departmentName ?? "Computer Science",
      courses: row?.dataset?.courses ?? "Database Systems, Web Development",
      expertise: row?.dataset?.expertise ?? "APIs, Databases",
      interests: row?.dataset?.interests ?? "Research, Teaching",
      contact: row?.dataset?.contact ?? "email@example.com",
      image: row?.dataset?.image
    };

    // Store data in sessionStorage and redirect
    sessionStorage.setItem("viewFaculty", JSON.stringify(facultyData));
    window.location.href = "view-faculty.html";
  }

  // EDIT ICON
  if (e.target.classList.contains("edit-symbol")) {
    const row = e.target.closest("tr");

    // Get data from attributes
    const facultyData = {
      id: row.dataset.id,
      name: row.dataset.name,
      department_id: row.dataset.departmentId,
      department_name: row.dataset.departmentName,
      courses: row.dataset.courses,
      expertise: row.dataset.expertise,
      interests: row.dataset.interests,
      contact: row.dataset.contact,
      image: row.dataset.image
    };

    // Store data in sessionStorage and redirect
    sessionStorage.setItem("editFaculty", JSON.stringify(facultyData));
    window.location.href = "edit-faculty.html";
  }




  // DELETE ICON
  if (e.target.classList.contains("delete-symbol")) {
    const isAdmin = document.querySelector(".btn-add") !== null;

    if (isAdmin) {
      const row = e.target.closest("tr");
      const facultyName = row.children[0].textContent.trim(); // optional for message
      const facultyId = row.getAttribute("data-id"); // we'll set this later

      const deleteModal = document.getElementById("deleteModal");
      const cancelBtn = deleteModal.querySelector(".btn-cancel-delete");
      const confirmBtn = deleteModal.querySelector(".btn-confirm-delete");

      deleteModal.style.display = "flex";

      // Cancel button hides modal
      cancelBtn.onclick = () => {
        deleteModal.style.display = "none";
      };

      // Confirm deletion
      confirmBtn.onclick = async () => {
        try {
          const response = await fetch(
            `http://localhost/my-api/faculty.php?id=${facultyId}`,
            { method: "DELETE" }
          );

          if (response.ok) {
            // Remove row from table
            row.remove();

            alert(`Faculty "${facultyName}" deleted successfully.`);
          } else {
            alert("Failed to delete faculty. Please try again.");
          }
        } catch (error) {
          console.error("Error deleting faculty:", error);
          alert("An error occurred while deleting the record.");
        } finally {
          deleteModal.style.display = "none";
        }
      };
    }
  }

});

