/* =========================================================
   MAILROUTE AI - REGISTER FUNCTIONALITY
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const terms = document.getElementById("terms");
    const message = document.getElementById("registerMessage");
    const togglePassword = document.getElementById("togglePassword");

    if (togglePassword && passwordInput && confirmPasswordInput) {
        togglePassword.addEventListener("click", function () {
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                confirmPasswordInput.type = "text";
                togglePassword.textContent = "🙈";
            } else {
                passwordInput.type = "password";
                confirmPasswordInput.type = "password";
                togglePassword.textContent = "👁️";
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            message.textContent = "";

            if (name.length < 3) {
                showMessage("Please enter your full name (at least 3 characters).", "error");
                nameInput.focus();
                return;
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                showMessage("Please enter a valid email address.", "error");
                emailInput.focus();
                return;
            }

            if (password.length < 6) {
                showMessage("Password must contain at least 6 characters.", "error");
                passwordInput.focus();
                return;
            }

            if (password !== confirmPassword) {
                showMessage("Passwords do not match.", "error");
                confirmPasswordInput.focus();
                return;
            }

            if (terms && !terms.checked) {
                showMessage("Please accept the terms and conditions.", "error");
                return;
            }

            let registeredSuccessfully = false;

            // 1. Try Backend API Registration if active
            if (CONFIG.isBackendLive) {
                const apiResult = await apiCall("/register", "POST", { name, email, password });
                if (apiResult && apiResult.success) {
                    registeredSuccessfully = true;
                } else if (apiResult && apiResult.message) {
                    showMessage(apiResult.message, "error");
                    return;
                }
            }

            // 2. Save in LocalStorage (for local static/GitHub Pages support)
            let users = JSON.parse(localStorage.getItem("mailrouteUsers")) || [];
            const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (existingUser && !CONFIG.isBackendLive) {
                showMessage("An account with this email already exists.", "error");
                return;
            }

            if (!existingUser) {
                const newUser = {
                    id: Date.now(),
                    name: name,
                    email: email,
                    password: password,
                    role: "Logistics Manager",
                    createdAt: new Date().toISOString()
                };
                users.push(newUser);
                localStorage.setItem("mailrouteUsers", JSON.stringify(users));
                registeredSuccessfully = true;
            }

            if (registeredSuccessfully) {
                showMessage("Account created successfully! Redirecting to login...", "success");
                setTimeout(function () {
                    window.location.href = "login.html";
                }, 1000);
            } else {
                showMessage("Failed to create account. Please try again.", "error");
            }
        });
    }

    function showMessage(text, type) {
        if (!message) return;
        message.textContent = text;
        if (type === "success") {
            message.style.color = "#4ade80";
        } else {
            message.style.color = "#f87171";
        }
    }
});