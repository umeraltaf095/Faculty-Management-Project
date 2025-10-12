const apiBaseUrl = "http://localhost/my-api/faculty.php";

const tableBody = document.querySelector(".faculty-table tbody");
const searchInputs = document.querySelectorAll(".search-bars input");

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
    const facultyList = Array.isArray(data) ? data : [data];

    renderTable(facultyList);
  } catch (error) {
    console.error("Error fetching faculty:", error);
  }
}

function renderTable(facultyList) {
  tableBody.innerHTML = ""; // clear table

  if (facultyList.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No records found</td></tr>`;
    return;
  }

 facultyList.forEach(faculty => {
  const row = `
    <tr data-id="${faculty.id}">
      <td>${faculty.name}</td>
      <td>${faculty.department}</td>
      <td>${faculty.courses_taught}</td>
      <td>${faculty.expertise}</td>
      <td>${faculty.contact}</td>
      <td>
        <span class="view-symbol">👁️</span>
        <span class="edit-symbol">✏️</span>
        <span class="delete-symbol">🗑️</span>
      </td>
    </tr>
  `;
  tableBody.insertAdjacentHTML("beforeend", row);
});

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
    alert("View clicked!");
  }

  // EDIT ICON
  if (e.target.classList.contains("edit-symbol")) {
    alert("Edit clicked!");
  }

 // DELETE ICON
if (e.target.classList.contains("delete-symbol")) {
  const isAdmin = document.querySelector("#addModal") !== null;

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

