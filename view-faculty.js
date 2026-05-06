document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("viewFacultyForm");

  if (form) {
    // Pre-fill the form with data from sessionStorage
    const facultyDataStr = sessionStorage.getItem("viewFaculty");
    if (facultyDataStr) {
      try {
        const facultyData = JSON.parse(facultyDataStr);
        document.getElementById("view-name").textContent = facultyData.name;
        document.getElementById("view-department").textContent = facultyData.department;
        document.getElementById("view-courses_taught").textContent = facultyData.courses;
        document.getElementById("view-expertise").textContent = facultyData.expertise;
        document.getElementById("view-interests").textContent = facultyData.interests;
        document.getElementById("view-contact").textContent = facultyData.contact;
      } catch (e) {
        console.error("Error parsing faculty data:", e);
      }
    } else {
      // If no data, probably loaded page directly, redirect back
      alert("No faculty selected for viewing.");
      window.history.back();
    }
  }
});
