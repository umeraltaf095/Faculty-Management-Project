document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.querySelector(".btn-add");
  const modal = document.getElementById("addModal");
  const cancelBtn = document.querySelector(".btn-cancel");
  const modalForm = document.querySelector(".modal-form");

 
  addBtn.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  
  cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

 
 modalForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const facultyData = {
    name: modalForm.querySelector("input[name='name']").value,
    department: modalForm.querySelector("input[name='department']").value,
    courses_taught: modalForm.querySelector("input[name='courses_taught']").value,
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      if (errorData && errorData.error) {
        alert(errorData.error); // *** shows "Email already exists" or "Contact already exists"
      } else {
        alert("Failed to add faculty. Please try again.");
      }
      return;
    }

    alert("Faculty added successfully!");
    modal.style.display = "none";
    modalForm.reset();

    if (typeof fetchFaculty === "function") {
      fetchFaculty();
    }

  } catch (error) {
    console.error("Error:", error);
    alert("Error connecting to server.");
  }
});

});
