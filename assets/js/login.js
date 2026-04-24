document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const resetForm = document.getElementById("resetForm");
  const resetModal = document.getElementById("resetModal");
  const resetMessage = document.getElementById("resetMessage");
  const forgotBtn = document.getElementById("forgotPassword");
  const toggleButtons = document.querySelectorAll("[data-toggle-password]");
  const store = window.LikhaStore;
  const auth = window.LikhaAuth;
  const popup = window.LikhaPopup;
  const RESET_KEY = "likhaPasswordResetRequest";

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const openModal = (modal) => {
    if (!modal) return;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const getAccounts = () => auth?.getAccounts?.() || [];

  const saveResetRequest = (request) => {
    if (store) {
      store.set(RESET_KEY, request);
    }
  };

  const loadResetRequest = () => store?.get(RESET_KEY) || null;

  const updateResetMessage = (message, success = false) => {
    if (!resetMessage) return;
    resetMessage.textContent = message || "";
    resetMessage.classList.toggle("success", Boolean(success));
  };

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = document.getElementById("email")?.value.trim();
      const password = document.getElementById("password")?.value;

      if (!email || !password) {
        popup?.error("Please enter both email and password.", {
          title: "Login validation",
        });
        return;
      }

      const account = auth?.findAccountByEmail?.(email);
      if (!account) {
        popup?.confirm(
          "We could not find an account with that email. Would you like to create one now?",
          () => {
            window.location.href = "sign-up.html";
          },
          {
            title: "No account found",
            confirmText: "Go to Sign Up",
            cancelText: "Close",
          }
        );
        return;
      }

      if (account.password !== password) {
        popup?.error("The password you entered is incorrect.", {
          title: "Login failed",
        });
        return;
      }

      auth?.setCurrentUser?.(account);
      store?.set("likhaLoggedIn", true);
      store?.remove("likhaNeedsProfile");
      window.LikhaActivity?.log({
        type: "login",
        message: `Logged in as ${account.name || account.email}`,
        item: {
          title: account.name || account.email,
          maker: account.name || account.email,
          category: "Account",
        },
      });

      const profileComplete =
        Boolean(store?.get("likhaProfileComplete")) ||
        Boolean(account.profileComplete) ||
        Boolean(account.profile);

      const nextUrl = profileComplete ? "dashboard.html" : "profile.html";
      popup?.success(
        profileComplete
          ? "Welcome back. Redirecting you to your dashboard."
          : "Login successful. Please complete your profile first.",
        {
          title: "Login successful",
          autoClose: 1200,
        }
      );

      setTimeout(() => {
        window.location.href = nextUrl;
      }, 1200);
    });
  }

  if (forgotBtn) {
    forgotBtn.addEventListener("click", () => {
      updateResetMessage("");
      if (resetForm) resetForm.reset();
      const emailField = document.getElementById("email");
      const email = emailField?.value.trim();
      const account = email ? auth?.findAccountByEmail?.(email) : null;
      if (account) {
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        saveResetRequest({
          email: account.email,
          otp,
          createdAt: Date.now(),
        });
        popup?.success(
          `A demo OTP has been generated for ${account.email}. Use code ${otp} inside the reset form.`,
          {
            title: "Reset code ready",
            autoClose: 2200,
          }
        );
        openModal(resetModal);
      } else {
        openModal(resetModal);
      }
    });
  }

  if (resetForm) {
    resetForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = document.getElementById("resetEmail")?.value.trim();
      const otp = document.getElementById("resetOtp")?.value.trim();
      const password = document.getElementById("resetPassword")?.value;
      const confirm = document.getElementById("resetConfirm")?.value;
      const request = loadResetRequest();
      const account = auth?.findAccountByEmail?.(email);

      if (!email || !otp || !password || !confirm) {
        popup?.error("Please complete all reset fields.", {
          title: "Reset validation",
        });
        return;
      }

      if (!account) {
        popup?.error("We could not find an account for that email.", {
          title: "Reset failed",
        });
        return;
      }

      if (!/^\d{6}$/.test(otp)) {
        popup?.error("OTP code must be 6 digits.", {
          title: "Reset validation",
        });
        return;
      }

      if (!request || request.email !== account.email || request.otp !== otp) {
        popup?.error("The OTP code does not match the one generated for this reset.", {
          title: "Reset validation",
        });
        return;
      }

      if (password !== confirm) {
        popup?.error("Passwords do not match.", {
          title: "Reset validation",
        });
        return;
      }

      const accounts = getAccounts().map((entry) => {
        if (entry.id !== account.id) return entry;
        return {
          ...entry,
          password,
          updatedAt: Date.now(),
        };
      });
      auth?.saveAccounts?.(accounts);
      store?.remove(RESET_KEY);
      updateResetMessage("Password updated successfully.", true);
      popup?.success("Password updated successfully. You can now log in with your new password.", {
        title: "Password updated",
        autoClose: 1600,
      });

      setTimeout(() => {
        closeModal(resetModal);
        resetForm.reset();
      }, 1400);
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
