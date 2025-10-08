// faculty-list.js

const apiBaseUrl = "http://localhost/my-api/faculty.php";


const tableBody = document.querySelector(".faculty-table tbody");
const searchInputs = document.querySelectorAll(".search-bars input");

// Function to fetch faculty data
async function fetchFaculty() {
  try {
    // Take values directly from search inputs
    const name = searchInputs[0].value.trim();
    const department = searchInputs[1].value.trim();
    const courses = searchInputs[2].value.trim();
    const expertise = searchInputs[3].value.trim();

   
    const response = await fetch(
      apiBaseUrl +
      "?name=" + name +
      "&department=" + department +
      "&courses_taught=" + courses +
      "&expertise=" + expertise
    );

    const data = await response.json();

   
    const facultyList = Array.isArray(data) ? data : [data];

    renderTable(facultyList);
  } catch (error) {
    console.error("Error fetching faculty:", error);
  }
}


function renderTable(facultyList) {
  tableBody.innerHTML = ""; // clear table

  if (facultyList.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No records found</td></tr>`;
    return;
  }

  facultyList.forEach(faculty => {
    const row = `
      <tr>
        <td>${faculty.name}</td>
        <td>${faculty.department}</td>
        <td>${faculty.courses_taught}</td>
        <td>${faculty.expertise}</td>
        <td>${faculty.contact}</td>
        <td><span class="view-symbol">👁️</span></td>
      </tr>
    `;
    tableBody.insertAdjacentHTML("beforeend", row);
  });
}

// Event listeners for search inputs
searchInputs.forEach(input => {
  input.addEventListener("input", fetchFaculty);
});

// Fetch all faculty after adding new faculty
fetchFaculty();
