document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("editFacultyForm");

  if (form) {
    // Pre-fill the form with data from sessionStorage
    const facultyDataStr = sessionStorage.getItem("editFaculty");
    if (facultyDataStr) {
      try {
        const facultyData = JSON.parse(facultyDataStr);
        form.querySelector("input[name='id']").value = facultyData.id;
        form.querySelector("input[name='name']").value = facultyData.name;
        form.querySelector("input[name='department']").value = facultyData.department;
        form.querySelector("input[name='courses_taught']").value = facultyData.courses;
        form.querySelector("input[name='expertise']").value = facultyData.expertise;
        form.querySelector("input[name='interests']").value = facultyData.interests;
        form.querySelector("input[name='contact']").value = facultyData.contact;
      } catch (e) {
        console.error("Error parsing faculty data:", e);
      }
    } else {
      // If no data, probably loaded page directly, redirect back
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
        department: form.querySelector("input[name='department']").value.trim(),
        courses_taught: form.querySelector("input[name='courses_taught']").value.trim(),
        expertise: form.querySelector("input[name='expertise']").value.trim(),
        interests: form.querySelector("input[name='interests']").value.trim(),
        contact: form.querySelector("input[name='contact']").value.trim(),
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
          sessionStorage.removeItem("editFaculty"); // clear storage
          window.location.href = "admin-dashboard.html";
        } else {
          alert("Failed to update faculty. Please try again.");
        }
      } catch (error) {
        console.error("Error updating faculty:", error);
        alert("An error occurred while updating the record.");
      }
    });
  }
});
