const apiBaseUrl = "http://localhost/my-api/faculty.php";

const tableBody = document.querySelector(".faculty-table tbody");
const searchInputs = document.querySelectorAll(".search-bars input");
const viewModal = document.getElementById("viewModal");
const viewForm = document.getElementById("viewForm");
const closeBtn = viewModal.querySelector(".btn-close");

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
      <tr 
        data-id="${faculty.id}" 
        data-name="${faculty.name}" 
        data-department="${faculty.department}" 
        data-courses="${faculty.courses_taught}" 
        data-expertise="${faculty.expertise}" 
        data-interests="${faculty.interests}" 
        data-contact="${faculty.contact}"
      >
        <td>${faculty.name}</td>
        <td>${faculty.department}</td>
        <td>${faculty.courses_taught}</td>
        <td>${faculty.expertise}</td>
        <td>${faculty.interests}</td>
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
// VIEW ICON — open read-only modal and show details
if (e.target.classList.contains("view-symbol")) {
  const row = e.target.closest("tr");

  // Get data from attributes (or show sample text)
  const name = row?.dataset?.name ?? "Dr. Example Name";
  const department = row?.dataset?.department ?? "Computer Science";
  const courses = row?.dataset?.courses ?? "Database Systems, Web Development";
  const expertise = row?.dataset?.expertise ?? "APIs, Databases";
  const interests = row?.dataset?.interests ?? "Research, Teaching";
  const contact = row?.dataset?.contact ?? "email@example.com";

  // Get modal elements
  const viewModal = document.getElementById("viewModal");

  // Fill data in spans
  document.getElementById("viewName").textContent = name;
  document.getElementById("viewDepartment").textContent = department;
  document.getElementById("viewCourses").textContent = courses;
  document.getElementById("viewExpertise").textContent = expertise;
  document.getElementById("viewInterests").textContent = interests;
  document.getElementById("viewContact").textContent = contact;

  // Show modal
  viewModal.style.display = "flex";

  // Close button
  const closeBtn = viewModal.querySelector(".btn-close");
  closeBtn.onclick = () => {
    viewModal.style.display = "none";
  };

  // Close when clicking outside the modal
  viewModal.onclick = (evt) => {
    if (evt.target === viewModal) viewModal.style.display = "none";
  };
}


// close if clicked outside modal content
window.addEventListener("click", (e) => {
  if (e.target === viewModal) {
    viewModal.style.display = "none";
  }
});

// EDIT ICON
if (e.target.classList.contains("edit-symbol")) {
  const row = e.target.closest("tr");

  // Get data from attributes
  const id = row.dataset.id;
  const name = row.dataset.name;
  const department = row.dataset.department;
  const courses = row.dataset.courses;
  const expertise = row.dataset.expertise;
  const interests = row.dataset.interests;
  const contact = row.dataset.contact;

  // Open modal and fill form
  const editModal = document.getElementById("editModal");
  const form = editModal.querySelector(".modal-form");

  editModal.style.display = "flex";

  // Fill form fields
  form.querySelector('input[name="name"]').value = name;
  form.querySelector('input[name="department"]').value = department;
  form.querySelector('input[name="courses_taught"]').value = courses;
  form.querySelector('input[name="expertise"]').value = expertise;
  form.querySelector('input[name="interests"]').value = interests;
  form.querySelector('input[name="contact"]').value = contact;

  // Store faculty ID in form
  form.dataset.id = id;

  // Close modal when Cancel clicked
  const cancelBtn = editModal.querySelector(".btn-cancel");
  cancelBtn.onclick = () => {
    editModal.style.display = "none";
  };

  // Handle UPDATE (PUT request)
  const saveBtn = editModal.querySelector(".btn-add-modal");
  saveBtn.onclick = async (event) => {
    event.preventDefault();

    const updatedData = {
      name: form.querySelector('input[name="name"]').value.trim(),
      department: form.querySelector('input[name="department"]').value.trim(),
      courses_taught: form.querySelector('input[name="courses_taught"]').value.trim(),
      expertise: form.querySelector('input[name="expertise"]').value.trim(),
      interests: form.querySelector('input[name="interests"]').value.trim(),
      contact: form.querySelector('input[name="contact"]').value.trim(),
    };

    try {
      const response = await fetch(`http://localhost/my-api/faculty.php?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        alert("Faculty updated successfully!");
        editModal.style.display = "none";
        fetchFaculty(); // refresh table to show updated data
      } else {
        alert("Failed to update faculty. Please try again.");
      }
    } catch (error) {
      console.error("Error updating faculty:", error);
      alert("An error occurred while updating the record.");
    }
  };
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

