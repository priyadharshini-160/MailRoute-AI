/* =========================================================
   MAILROUTE AI - LOGIN FUNCTIONALITY
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");
    const loginMessage = document.getElementById("loginMessage");
    const rememberMe = document.getElementById("rememberMe");
    const forgotPassword = document.getElementById("forgotPassword");

    // Load remembered email
    const rememberedEmail = localStorage.getItem("mailrouteRememberedEmail");
    if (rememberedEmail && emailInput) {
        emailInput.value = rememberedEmail;
        if (rememberMe) rememberMe.checked = true;
    }

    // Toggle password visibility
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", function () {
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                togglePassword.textContent = "🙈";
            } else {
                passwordInput.type = "password";
                togglePassword.textContent = "👁️";
            }
        });
    }

    // Forgot password alert
    if (forgotPassword) {
        forgotPassword.addEventListener("click", function (e) {
            e.preventDefault();
            showMessage("Password recovery: Use your registered credentials or register a new account.", "info");
        });
    }

    // Form submit handler
    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            loginMessage.textContent = "";

            if (!email) {
                showMessage("Please enter your email address.", "error");
                emailInput.focus();
                return;
            }

            if (!password) {
                showMessage("Please enter your password.", "error");
                passwordInput.focus();
                return;
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                showMessage("Please enter a valid email address.", "error");
                emailInput.focus();
                return;
            }

            let authenticatedUser = null;

            // 1. Try Backend API Login if reachable
            if (CONFIG.isBackendLive) {
                const apiResult = await apiCall("/login", "POST", { email, password });
                if (apiResult && apiResult.success) {
                    authenticatedUser = apiResult.user;
                }
            }

            // 2. Fallback to LocalStorage Login
            if (!authenticatedUser) {
                const users = JSON.parse(localStorage.getItem("mailrouteUsers")) || [];
                const matchedUser = users.find(u => 
                    u.email.toLowerCase() === email.toLowerCase() && u.password === password
                );

                if (matchedUser) {
                    authenticatedUser = matchedUser;
                } else if (email === "demo@mailroute.ai" && password === "demo123") {
                    authenticatedUser = {
                        id: 1,
                        name: "Demo Logistics Manager",
                        email: "demo@mailroute.ai",
                        role: "Logistics Manager"
                    };
                }
            }

            // Success or Failure Response
            if (authenticatedUser) {
                // Save user session
                setCurrentUser(authenticatedUser);

                // Remember Me check
                if (rememberMe && rememberMe.checked) {
                    localStorage.setItem("mailrouteRememberedEmail", email);
                } else {
                    localStorage.removeItem("mailrouteRememberedEmail");
                }

                showMessage("Login successful! Redirecting to dashboard...", "success");

                setTimeout(function () {
                    window.location.href = "dashboard.html";
                }, 800);
            } else {
                showMessage("Invalid email or password. Please try again or create an account.", "error");
            }
        });
    }

    function showMessage(text, type) {
        if (!loginMessage) return;
        loginMessage.textContent = text;
        if (type === "success") {
            loginMessage.style.color = "#4ade80";
        } else if (type === "info") {
            loginMessage.style.color = "#38bdf8";
        } else {
            loginMessage.style.color = "#f87171";
        }
    }
});