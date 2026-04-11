document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const resetForm = document.getElementById("resetForm");
  const resetModal = document.getElementById("resetModal");
  const resetMessage = document.getElementById("resetMessage");
  const forgotBtn = document.getElementById("forgotPassword");
  const toggleButtons = document.querySelectorAll("[data-toggle-password]");
  const store = window.LikhaStore;


  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      sessionStorage.setItem("likhaLoggedIn", "true");
      if (typeof window.name === "string") {
        if (window.name.indexOf("likhaLoggedIn=true") === -1) {
          window.name = `${window.name} likhaLoggedIn=true`.trim();
        }
      } else {
        window.name = "likhaLoggedIn=true";
      }
      const profileComplete =
        store?.get("likhaProfileComplete") ||
        localStorage.getItem("likhaProfileComplete") === "true";
      if (!profileComplete) {
        sessionStorage.setItem("likhaNeedsProfile", "true");
        window.location.href = "profile.html";
      } else {
        window.location.href = "dashboard.html";
      }
    });
  }

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  if (forgotBtn && resetMessage) {
    forgotBtn.addEventListener("click", () => {
      resetMessage.textContent = "";
      resetMessage.classList.remove("success");
      if (resetForm) resetForm.reset();
    });
  }

  if (resetForm) {
    resetForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = document.getElementById("resetEmail")?.value.trim();
      const otp = document.getElementById("resetOtp")?.value.trim();
      const password = document.getElementById("resetPassword")?.value;
      const confirm = document.getElementById("resetConfirm")?.value;

      if (!email || !otp || !password || !confirm) {
        if (resetMessage) {
          resetMessage.textContent = "Please complete all fields.";
          resetMessage.classList.remove("success");
        }
        return;
      }

      if (!/^\d{6}$/.test(otp)) {
        if (resetMessage) {
          resetMessage.textContent = "OTP code must be 6 digits.";
          resetMessage.classList.remove("success");
        }
        return;
      }

      if (password !== confirm) {
        if (resetMessage) {
          resetMessage.textContent = "Passwords do not match.";
          resetMessage.classList.remove("success");
        }
        return;
      }

      if (resetMessage) {
        resetMessage.textContent = "Password updated successfully.";
        resetMessage.classList.add("success");
      }

      setTimeout(() => {
        closeModal(resetModal);
      }, 1200);
    });
  }

  toggleButtons.forEach((button) => {
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
});
