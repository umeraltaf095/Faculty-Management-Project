const apiBaseUrl = "http://localhost/my-api/department.php";

const tableBody = document.querySelector("#departmentTable tbody");
const searchInput = document.getElementById("searchDepartment");

let currentDepartmentList = [];
let currentPage = 1;
const itemsPerPage = 10;

// Function to fetch department data
async function fetchDepartments() {
  try {
    const departmentName = searchInput ? searchInput.value.trim() : "";

    // Assuming the API supports some filtering or we filter on the frontend.
    // For now, let's fetch all and filter on frontend since the API wasn't fully specified for search.
    const response = await fetch(apiBaseUrl);

    let data = await response.json();
    
    // Convert to array if not
    data = Array.isArray(data) ? data : [data];

    // Filter by name if search input is provided
    if (departmentName) {
      data = data.filter(dep => dep.department.toLowerCase().includes(departmentName.toLowerCase()));
    }

    currentDepartmentList = data;
    currentPage = 1; // Reset to page 1 on new search

    renderTable();
  } catch (error) {
    console.error("Error fetching departments:", error);
  }
}

function renderTable() {
  tableBody.innerHTML = ""; // clear table

  if (currentDepartmentList.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center;">No records found</td></tr>`;
    renderPagination();
    return;
  }

  // Pagination Logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = currentDepartmentList.slice(startIndex, endIndex);

  // Detect if user is admin (based on presence of Add Button)
  const isAdmin = document.querySelector(".btn-add") !== null;

  pageData.forEach(dep => {
    let actionIcons = '';
    
    if (isAdmin) {
      actionIcons = `
        <span class="edit-symbol">✏️</span>
        <span class="delete-symbol">🗑️</span>
      `;
    } else {
      actionIcons = `<span>-</span>`;
    }

    const row = `
      <tr 
        data-id="${dep.id}" 
        data-department="${dep.department}" 
      >
        <td>${dep.id}</td>
        <td>${dep.department}</td>
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

  const totalItems = currentDepartmentList.length;
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
if (searchInput) {
  searchInput.addEventListener("input", fetchDepartments);
}

// Initial load
fetchDepartments();

// Global click event listener for all symbols
document.addEventListener("click", function (e) {
  // EDIT ICON
  if (e.target.classList.contains("edit-symbol")) {
    const row = e.target.closest("tr");

    // Get data from attributes
    const departmentData = {
      id: row.dataset.id,
      department: row.dataset.department
    };

    // Store data in sessionStorage and redirect
    sessionStorage.setItem("editDepartment", JSON.stringify(departmentData));
    window.location.href = "edit-department.html";
  }

  // DELETE ICON
  if (e.target.classList.contains("delete-symbol")) {
    const isAdmin = document.querySelector(".btn-add") !== null;

    if (isAdmin) {
      const row = e.target.closest("tr");
      const departmentName = row.dataset.department; 
      const departmentId = row.dataset.id; 

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
            `http://localhost/my-api/department.php?id=${departmentId}`,
            { method: "DELETE" }
          );

          if (response.ok) {
            // Remove row from table
            row.remove();
            alert(`Department "${departmentName}" deleted successfully.`);
            fetchDepartments(); // refresh
          } else {
            alert("Failed to delete department. Please try again.");
          }
        } catch (error) {
          console.error("Error deleting department:", error);
          alert("An error occurred while deleting the record.");
        } finally {
          deleteModal.style.display = "none";
        }
      };
    }
  }
});
