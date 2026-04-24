document.addEventListener("DOMContentLoaded", () => {
  const auth = window.LikhaAuth;
  const isLoggedIn = () => Boolean(auth?.isLoggedIn?.());
  const inPages = window.location.pathname.toLowerCase().includes("/pages/");
  const loginPath = inPages ? "login.html" : "pages/login.html";
  const landingPath = inPages ? "../index.html" : "index.html";

  const ensureLoginModal = () => {
    if (document.getElementById("loginModal")) return;
    const modal = document.createElement("div");
    modal.className = "auth-modal";
    modal.id = "loginModal";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="auth-modal-content" role="dialog" aria-modal="true" aria-labelledby="loginModalTitle">
        <button class="auth-modal-close" type="button" data-login-close aria-label="Close">&times;</button>
        <h2 id="loginModalTitle">Login Required</h2>
        <p>Please log in to like items and unlock the full Likha experience.</p>
        <a class="auth-modal-action" href="${loginPath}">Go to Login</a>
      </div>
    `;
    document.body.appendChild(modal);
  };

  const ensureLogoutModal = () => {
    if (document.getElementById("logoutModal")) return;
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.id = "logoutModal";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="logoutTitle">
        <button class="modal-close" type="button" data-logout-close aria-label="Close">&times;</button>
        <h2 id="logoutTitle">Log out?</h2>
        <p class="modal-subtitle">Are you sure you want to log out?</p>
        <div class="modal-actions">
          <button type="button" class="ghost-btn" data-logout-cancel>No</button>
          <button type="button" class="primary-btn" data-logout-confirm>Yes</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  };

  const openLoginModal = () => {
    ensureLoginModal();
    const modal = document.getElementById("loginModal");
    if (!modal) return;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  const closeLoginModal = () => {
    const modal = document.getElementById("loginModal");
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  if (document.body.dataset.auth === "required" && !isLoggedIn()) {
    document.body.classList.add("locked");
    const container = document.querySelector(".container");
    const content = document.querySelector(".content");
    const target = container || content;
    if (target && !target.querySelector(".lock-banner")) {
      const banner = document.createElement("div");
      banner.className = "lock-banner";
      banner.innerHTML = `
        <div class="lock-info">
          <span class="lock-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="11" width="16" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 018 0v3" />
            </svg>
          </span>
          <div>
            <strong>Login required</strong>
            <span>Sign in to like items and unlock full access.</span>
          </div>
        </div>
        <button class="lock-action" type="button" data-login-modal>Go to Login</button>
      `;
      target.prepend(banner);
    }
  }

  if (isLoggedIn()) {
    document.body.classList.add("logged-in");
    document.querySelectorAll(".nav .login, .nav .signup").forEach((link) => link.remove());
    document.querySelectorAll(".nav .dashboard-link").forEach((link) => link.remove());
  }

  document.addEventListener(
    "click",
    (event) => {
      const loginTrigger = event.target.closest("[data-login-modal]");
      if (loginTrigger) {
        event.preventDefault();
        openLoginModal();
        return;
      }

      const gatedAction = event.target.closest(
        ".like, [data-buy], [data-add-cart], [data-open-commission]"
      );
      if (!gatedAction) return;
      if (!isLoggedIn()) {
        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === "function") {
          event.stopImmediatePropagation();
        }
        openLoginModal();
      }
    },
    true
  );

  const openLogoutModal = () => {
    ensureLogoutModal();
    const modal = document.getElementById("logoutModal");
    if (!modal) return;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  const closeLogoutModal = () => {
    const modal = document.getElementById("logoutModal");
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  const performLogout = () => {
    auth?.clearSession?.();
    window.location.href = landingPath;
  };

  document.querySelectorAll("[data-logout]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openLogoutModal();
    });
  });

  document.addEventListener("click", (event) => {
    const modal = document.getElementById("loginModal");
    if (!modal || !modal.classList.contains("active")) return;
    if (event.target === modal || event.target.closest("[data-login-close]")) {
      event.preventDefault();
      closeLoginModal();
    }
  });

  document.addEventListener("click", (event) => {
    const modal = document.getElementById("logoutModal");
    if (!modal) return;
    if (event.target === modal || event.target.closest("[data-logout-close]")) {
      event.preventDefault();
      closeLogoutModal();
      return;
    }
    if (event.target.closest("[data-logout-cancel]")) {
      event.preventDefault();
      closeLogoutModal();
      return;
    }
    if (event.target.closest("[data-logout-confirm]")) {
      event.preventDefault();
      closeLogoutModal();
      performLogout();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLoginModal();
      closeLogoutModal();
    }
  });
});
