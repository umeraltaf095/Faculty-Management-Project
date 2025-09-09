
const form = document.querySelector(".login-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");

form.addEventListener("submit", async (event) => {
  event.preventDefault(); // stop form from reloading page

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert("Please fill in both email and password.");
    return;
  }

  try {
    // Send login request to API
    const response = await fetch("http://localhost/my-api/login.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    // Assuming API returns something like { success: true } if login matches
    if (result.success) {
      alert("Login successful! Redirecting...");
      window.location.href = "admin-dashboard.html"; // redirect to admin dashboard
    } else {
      alert("Invalid email or password.");
    }
  } catch (error) {
    console.error("Error during login:", error);
    alert("Something went wrong. Please try again.");
  }
});

