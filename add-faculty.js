document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addFacultyForm");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const facultyData = {
        name: form.querySelector("input[name='name']").value,
        department: form.querySelector("input[name='department']").value,
        courses_taught: form.querySelector("input[name='courses_taught']").value,
        expertise: form.querySelector("input[name='expertise']").value,
        interests: form.querySelector("input[name='interests']").value,
        contact: form.querySelector("input[name='contact']").value,
      };

      try {
        const response = await fetch("http://localhost/my-api/faculty.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(facultyData),
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
    });
  }
});
