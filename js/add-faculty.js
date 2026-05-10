document.addEventListener("DOMContentLoaded", async () => {
  if (localStorage.getItem('role') !== 'admin') {
    window.location.href = "faculty-list.html";
    return;
  }
  const form = document.getElementById("addFacultyForm");
  const departmentSelect = document.getElementById("departmentSelect");

  // Fetch and populate departments
  async function fetchDepartments() {
    try {
      const response = await fetch("http://localhost/my-api/department.php");
      const departments = await response.json();
      
      if (Array.isArray(departments)) {
        departments.forEach(dept => {
          const option = document.createElement("option");
          option.value = dept.id;
          option.textContent = dept.department;
          departmentSelect.appendChild(option);
        });
      }
    } catch (error) {
      showToast("Error fetching departments:", error, "error");
    }
  }

  if (departmentSelect) {
    await fetchDepartments();
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);

      // Function to send data
      const sendData = async (data) => {
        try {
          const response = await fetch("http://localhost/my-api/faculty.php", {
            method: "POST",
            body: data, // fetch automatically sets Content-Type to multipart/form-data with boundary
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            if (errorData && errorData.error) {
              showToast(errorData.error, "error");
            } else {
              showToast("Failed to add faculty. Please try again.", "error");
            }
            return;
          }

          showToast("Faculty added successfully!", "success");
          form.reset();
          window.location.href = "faculty-list.html";
        } catch (error) {
          showToast("Error connecting to server.", "error");
        }
      };

      sendData(formData);
    });
  }
});
