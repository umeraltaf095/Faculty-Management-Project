document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.querySelector(".btn-add");
  const modal = document.getElementById("addModal");
  const cancelBtn = document.querySelector(".btn-cancel");
  const modalForm = document.querySelector(".modal-form");

  // Show modal when Add button is clicked
  addBtn.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  // Hide modal when Cancel button is clicked
  cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Handle form submission
  modalForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Collect input values
    const facultyData = {
      name: modalForm.querySelector("input[name='name']").value,
      department: modalForm.querySelector("input[name='department']").value,
      courses_taught: modalForm.querySelector("input[name='courses_taught']")
        .value,
      expertise: modalForm.querySelector("input[name='expertise']").value,
      interests: modalForm.querySelector("input[name='interests']").value,
      contact: modalForm.querySelector("input[name='contact']").value,
    };

    try {
      const response = await fetch("http://localhost/my-api/faculty.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(facultyData),
      });

      if (response.ok) {
        alert("Faculty added successfully!");
        modal.style.display = "none";
        modalForm.reset();
        if (typeof fetchFaculty === "function") {
          fetchFaculty();
        }
      } else {
        const errorText = await response.text();
        console.error("Server Response:", errorText);
        alert("Failed to add faculty: " + errorText);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error connecting to server.");
    }
  });
});
