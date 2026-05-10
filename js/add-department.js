if (localStorage.getItem('role') !== 'admin') {
  window.location.href = "department-list.html";
}

document.getElementById("addDepartmentForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const departmentName = document.getElementById("department").value.trim();

  if (!departmentName) {
    showToast("Please enter a department name.", "error");
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
      showToast("Department added successfully!", "success");
      setTimeout(() => { window.location.href = "department-list.html"; }, 1500);
    } else {
      showToast("Failed to add department. Please try again.", "error");
    }
  } catch (error) {
    showToast("An error occurred while communicating with the server.", "error");
  }
});
