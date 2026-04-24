document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm");
  const popup = window.LikhaPopup;
  const store = window.LikhaStore;
  const auth = window.LikhaAuth;
  const fieldErrorSelector = (fieldId) =>
    document.querySelector(`[data-error-for="${fieldId}"]`);

  const clearFieldErrors = () => {
    document.querySelectorAll(".field-error").forEach((error) => {
      error.textContent = "";
      error.classList.remove("active");
    });
  };

  const showFieldError = (fieldId, message) => {
    const error = fieldErrorSelector(fieldId);
    if (!error) return;
    error.textContent = message;
    error.classList.add("active");
  };

  const getValue = (id) => document.getElementById(id)?.value.trim() || "";

  const getAccountSummary = ({ name, email, phone, loginMethod }) => ({
    id: `acct_${Date.now()}`,
    name,
    email,
    phone,
    password: document.getElementById("password")?.value || "",
    loginMethod,
    createdAt: Date.now(),
    profileComplete: false,
    handle: `@${name.toLowerCase().replace(/[^a-z0-9]+/g, "") || "likhauser"}`,
    avatar: "",
    profile: {
      firstName: name,
      lastName: "",
      email,
      tel: phone,
      address: "",
      bio: "",
      avatar: "",
    },
  });

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearFieldErrors();

      const name = getValue("name");
      const email = getValue("email");
      const phone = getValue("phone");
      const password = document.getElementById("password")?.value || "";
      const confirmPassword = document.getElementById("confirmPassword")?.value || "";
      const loginMethod = document.querySelector('input[name="loginMethod"]:checked')?.value || "";
      const termsAccepted = document.getElementById("terms")?.checked || false;

      const errors = [];

      if (!name) {
        errors.push("Name is required.");
        showFieldError("name", "Name is required.");
      } else if (name.length < 2) {
        errors.push("Name should be at least 2 characters.");
        showFieldError("name", "Please enter a valid name.");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) {
        errors.push("Email is required.");
        showFieldError("email", "Email is required.");
      } else if (!emailRegex.test(email)) {
        errors.push("Email format is invalid.");
        showFieldError("email", "Please enter a valid email address.");
      }

      const phoneDigits = phone.replace(/\D/g, "");
      if (!phone) {
        errors.push("Phone number is required.");
        showFieldError("phone", "Phone number is required.");
      } else if (phoneDigits.length < 9) {
        errors.push("Phone number is too short.");
        showFieldError("phone", "Please enter a valid phone number.");
      }

      if (!password) {
        errors.push("Password is required.");
        showFieldError("password", "Password is required.");
      } else if (password.length < 6) {
        errors.push("Password must be at least 6 characters.");
        showFieldError("password", "Password must be at least 6 characters long.");
      }

      if (!confirmPassword) {
        errors.push("Please confirm your password.");
        showFieldError("confirmPassword", "Please confirm your password.");
      } else if (password !== confirmPassword) {
        errors.push("Password confirmation does not match.");
        showFieldError("confirmPassword", "Passwords do not match.");
      }

      if (!loginMethod) {
        errors.push("Please choose a login method.");
        showFieldError("loginMethod", "Please select a login method.");
      }

      if (!termsAccepted) {
        errors.push("You must agree to the terms and policy.");
        showFieldError("terms", "Please accept the terms & policy.");
      }

      if (auth?.findAccountByEmail?.(email)) {
        errors.push("That email already has an account.");
        showFieldError("email", "This email is already registered.");
      }
      if (auth?.findAccountByPhone?.(phone)) {
        errors.push("That phone number already has an account.");
        showFieldError("phone", "This phone number is already registered.");
      }

      if (errors.length) {
        popup?.error("Please fix the highlighted fields before continuing.", {
          title: "Signup validation",
        });
        return;
      }

      const account = getAccountSummary({ name, email, phone, loginMethod });
      auth?.upsertAccount?.(account);
      auth?.setCurrentUser?.(account);
      store?.set("likhaLoggedIn", true);
      store?.set("likhaProfileComplete", false);
      store?.set("likhaNeedsProfile", true);
      window.LikhaActivity?.log({
        type: "signup",
        message: `Created account for ${name}`,
        item: {
          title: name,
          maker: name,
          category: "Profile",
        },
      });

      popup?.success(
        "Your account has been created. We will take you to complete your profile now.",
        {
          title: "Signup successful",
          autoClose: 1400,
        }
      );

      setTimeout(() => {
        window.location.href = "profile.html";
      }, 1400);
    });
  }

  document.querySelectorAll("[data-toggle-password]").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (!input) return;
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      button.setAttribute(
        "aria-label",
        isHidden ? "Hide password" : "Show password"
      );
    });
  });

  const terms = document.getElementById("terms");
  if (terms) {
    terms.addEventListener("change", () => {
      const error = fieldErrorSelector("terms");
      if (terms.checked && error) {
        error.textContent = "";
        error.classList.remove("active");
      }
    });
  }

  document.querySelectorAll(".input-field").forEach((input) => {
    input.addEventListener("focus", () => input.parentElement?.classList.add("focused"));
    input.addEventListener("blur", () => input.parentElement?.classList.remove("focused"));
  });
});
