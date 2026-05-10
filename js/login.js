
const form = document.querySelector(".login-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");

form.addEventListener("submit", async (event) => {
  event.preventDefault(); // stop form from reloading page

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    showToast("Please fill in both email and password.", "error");
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
      localStorage.setItem('role', 'admin');
      showToast("Login successful! Redirecting...", "success");
      setTimeout(() => { window.location.href = "pages/main-dashboard.html"; }, 1500); // redirect to main dashboard
    } else {
      showToast("Invalid email or password.", "error");
    }
  } catch (error) {
    showToast("Something went wrong. Please try again.", "error");
  }
});
