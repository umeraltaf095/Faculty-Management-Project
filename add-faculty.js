document.addEventListener("DOMContentLoaded", async () => {
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
      console.error("Error fetching departments:", error);
    }
  }

  if (departmentSelect) {
    await fetchDepartments();
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const facultyData = {
        name: form.querySelector("input[name='name']").value,
        department_id: form.querySelector("select[name='department_id']").value,
        courses_taught: form.querySelector("input[name='courses_taught']").value,
        expertise: form.querySelector("input[name='expertise']").value,
        interests: form.querySelector("input[name='interests']").value,
        contact: form.querySelector("input[name='contact']").value,
      };

      const imageFile = form.querySelector("input[name='image']").files[0];

      // Function to send data as JSON
      const sendData = async (data) => {
        try {
          const response = await fetch("http://localhost/my-api/faculty.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            if (errorData && errorData.error) {
              alert(errorData.error);
            } else {
              alert("Failed to add faculty. Please try again.");
            }
            return;
          }

          alert("Faculty added successfully!");
          form.reset();
          window.location.href = "admin-dashboard.html";
        } catch (error) {
          console.error("Error:", error);
          alert("Error connecting to server.");
        }
      };

      // Handle image if present
      if (imageFile) {
        const reader = new FileReader();
        reader.onload = () => {
          facultyData.image = reader.result; // Send as Base64 string
          sendData(facultyData);
        };
        reader.onerror = () => {
          alert("Error reading image file.");
        };
        reader.readAsDataURL(imageFile);
      } else {
        sendData(facultyData);
      }
    });
  }
});
