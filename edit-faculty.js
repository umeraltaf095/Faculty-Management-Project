document.addEventListener("DOMContentLoaded", async () => {
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
      console.error("Error fetching departments:", error);
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
        console.error("Error parsing faculty data:", e);
      }
    } else {
      alert("No faculty selected for editing.");
      window.location.href = "admin-dashboard.html";
      return;
    }

    // Handle form submit
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const id = form.querySelector("input[name='id']").value;
      const updatedData = {
        name: form.querySelector("input[name='name']").value.trim(),
        department_id: form.querySelector("select[name='department_id']").value,
        courses_taught: form.querySelector("input[name='courses_taught']").value.trim(),
        expertise: form.querySelector("input[name='expertise']").value.trim(),
        interests: form.querySelector("input[name='interests']").value.trim(),
        contact: form.querySelector("input[name='contact']").value.trim(),
      };

      const imageFile = form.querySelector("input[name='image']").files[0];

      // Function to send data as JSON
      const sendUpdate = async (data) => {
        try {
          const response = await fetch(`http://localhost/my-api/faculty.php?id=${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });

          if (response.ok) {
            alert("Faculty updated successfully!");
            sessionStorage.removeItem("editFaculty");
            window.location.href = "admin-dashboard.html";
          } else {
            const errorData = await response.json().catch(() => null);
            alert(errorData?.error || "Failed to update faculty. Please try again.");
          }
        } catch (error) {
          console.error("Error updating faculty:", error);
          alert("An error occurred while updating the record.");
        }
      };

      if (imageFile) {
        const reader = new FileReader();
        reader.onload = () => {
          updatedData.image = reader.result; // Base64 string
          sendUpdate(updatedData);
        };
        reader.onerror = () => {
          alert("Error reading image file.");
        };
        reader.readAsDataURL(imageFile);
      } else {
        sendUpdate(updatedData);
      }
    });
  }
});
