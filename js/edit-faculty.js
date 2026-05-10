document.addEventListener("DOMContentLoaded", async () => {
  if (localStorage.getItem('role') !== 'admin') {
    window.location.href = "faculty-list.html";
    return;
  }
  const form = document.getElementById("editFacultyForm");
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
    // Pre-fill the form with data from sessionStorage
    const facultyDataStr = sessionStorage.getItem("editFaculty");
    if (facultyDataStr) {
      try {
        const facultyData = JSON.parse(facultyDataStr);
        form.querySelector("input[name='id']").value = facultyData.id;
        form.querySelector("input[name='name']").value = facultyData.name;
        if (departmentSelect) {
          departmentSelect.value = facultyData.department_id;
        }
        form.querySelector("input[name='courses_taught']").value = facultyData.courses;
        form.querySelector("input[name='expertise']").value = facultyData.expertise;
        form.querySelector("input[name='interests']").value = facultyData.interests;
        form.querySelector("input[name='contact']").value = facultyData.contact;

        // Show current image preview
        const preview = document.getElementById("imagePreview");
        const placeholder = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNjY2MiLz48L3N2Zz4=';
        if (preview) {
          const imgUrl = (facultyData.image && facultyData.image !== "null") ? facultyData.image : placeholder;
          preview.innerHTML = `<img src="${imgUrl}" class="faculty-img" style="width: 50px; height: 50px;" onerror="this.src='${placeholder}'">`;
        }
      } catch (e) {
        showToast("Error parsing faculty data:", e, "error");
      }
    } else {
      showToast("No faculty selected for editing.", "error");
            window.location.href = "faculty-list.html";
      return;
    }

    // Handle form submit
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const id = form.querySelector("input[name='id']").value;
      const formData = new FormData(form);
      formData.append('_method', 'PUT'); // Common convention for APIs to detect updates via POST

      // Function to send data
      const sendUpdate = async (data) => {
        try {
          const response = await fetch(`http://localhost/my-api/faculty.php?id=${id}`, {
            method: "POST", // Use POST so PHP can parse $_FILES properly
            body: data,
          });

          if (response.ok) {
            showToast("Faculty updated successfully!", "success");
            sessionStorage.removeItem("editFaculty");
                  window.location.href = "faculty-list.html";
          } else {
            const errorData = await response.json().catch(() => null);
            showToast(errorData?.error || "Failed to update faculty. Please try again.", "error");
          }
        } catch (error) {
          showToast("An error occurred while updating the record.", "error");
        }
      };

      sendUpdate(formData);
    });
  }
});
