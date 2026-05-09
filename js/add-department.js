document.getElementById("addDepartmentForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const departmentName = document.getElementById("department").value.trim();

  if (!departmentName) {
    alert("Please enter a department name.");
    return;
  }

  // Use POST request to add department. Adjust body format to match what your API expects.
  // The API likely expects a JSON or FormData. Using JSON since it's common.
  const payload = {
    department: departmentName
  };

  try {
    const response = await fetch("http://localhost/my-api/department.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      alert("Department added successfully!");
      window.location.href = "admin-department.html";
    } else {
      alert("Failed to add department. Please try again.");
    }
  } catch (error) {
    console.error("Error adding department:", error);
    alert("An error occurred while communicating with the server.");
  }
});
