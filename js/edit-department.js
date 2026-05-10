document.addEventListener("DOMContentLoaded", () => {
  const departmentDataStr = sessionStorage.getItem("editDepartment");

  if (!departmentDataStr) {
    showToast("No department data found. Redirecting...", "error");
    window.location.href = "admin-department.html";
    return;
  }

  const departmentData = JSON.parse(departmentDataStr);

  document.getElementById("departmentId").value = departmentData.id;
  document.getElementById("departmentName").value = departmentData.department;
});

document.getElementById("editDepartmentForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const id = document.getElementById("departmentId").value;
  const departmentName = document.getElementById("departmentName").value.trim();

  if (!departmentName) {
    showToast("Please enter a department name.", "error");
    return;
  }

  // Use PUT request to update department
  const payload = {
    id: id,
    department: departmentName
  };

  try {
    const response = await fetch("http://localhost/my-api/department.php", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      showToast("Department updated successfully!", "success");
      // Clear session storage
      sessionStorage.removeItem("editDepartment");
      window.location.href = "admin-department.html";
    } else {
      showToast("Failed to update department. Please try again.", "error");
    }
  } catch (error) {
    showToast("An error occurred while communicating with the server.", "error");
  }
});
