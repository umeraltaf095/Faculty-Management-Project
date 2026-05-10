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

        const imgContainer = document.getElementById("view-image-container");
        const placeholder = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNjY2MiLz48L3N2Zz4=';
        const imgUrl = (facultyData.image && facultyData.image !== "null" && facultyData.image !== "undefined") ? facultyData.image : placeholder;
        imgContainer.innerHTML = `<img src="${imgUrl}" alt="${facultyData.name}" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 4px solid #ddd;" onerror="this.src='${placeholder}'">`;
      } catch (e) {
        showToast("Error parsing faculty data:", e, "error");
      }
    } else {
      // If no data, probably loaded page directly, redirect back
      showToast("No faculty selected for viewing.", "error");
      window.history.back();
    }
  }
});
