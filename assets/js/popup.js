(() => {
  const STYLE_ID = "likha-popup-style";
  const ROOT_ID = "likhaPopup";

  const css = `
    .likha-popup {
      position: fixed;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: rgba(0, 0, 0, 0.45);
      z-index: 1200;
    }

    .likha-popup.active {
      display: flex;
    }

    .likha-popup__dialog {
      position: relative;
      width: var(--popup-width, min(520px, 94vw));
      background: #ffffff;
      color: #2b1c1a;
      border-radius: 18px;
      box-shadow: 0 22px 50px rgba(0, 0, 0, 0.22);
      padding: 24px 24px 20px;
      transform: translateY(8px);
      opacity: 0;
      transition: transform 0.22s ease, opacity 0.22s ease;
    }

    .likha-popup.active .likha-popup__dialog {
      transform: translateY(0);
      opacity: 1;
    }

    .likha-popup__title {
      margin: 0 0 10px;
      font-size: 20px;
      color: #600202;
      line-height: 1.2;
    }

    .likha-popup__message {
      margin: 0;
      color: #6d5f5b;
      font-size: 13px;
      line-height: 1.65;
    }

    .likha-popup__body {
      display: grid;
      gap: 12px;
    }

    .likha-popup__details {
      display: grid;
      gap: 8px;
      margin-top: 6px;
    }

    .likha-popup__field {
      display: grid;
      gap: 6px;
      font-size: 12px;
      color: #2b1c1a;
      font-weight: 500;
    }

    .likha-popup__field input,
    .likha-popup__field select,
    .likha-popup__field textarea {
      border: 1px solid #e1d9d7;
      border-radius: 10px;
      padding: 10px 12px;
      font: inherit;
      font-size: 13px;
    }

    .likha-popup__field input:focus,
    .likha-popup__field select:focus,
    .likha-popup__field textarea:focus {
      outline: none;
      border-color: #600202;
    }

    .likha-popup__actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 18px;
      flex-wrap: wrap;
    }

    .likha-popup__button {
      border: 1px solid #e1d9d7;
      background: #ffffff;
      color: #2b1c1a;
      border-radius: 10px;
      padding: 10px 16px;
      font: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      min-width: 92px;
    }

    .likha-popup__button--primary {
      background: #600202;
      border-color: #600202;
      color: #ffffff;
    }

    .likha-popup__button--ghost {
      background: #ffffff;
    }

    .likha-popup__button--danger {
      background: #f4eceb;
      border-color: #e1d9d7;
      color: #600202;
    }

    .likha-popup__icon {
      width: 46px;
      height: 46px;
      border-radius: 14px;
      display: grid;
      place-items: center;
      margin-bottom: 14px;
      background: #f4eceb;
      color: #600202;
    }

    .likha-popup__icon svg {
      width: 22px;
      height: 22px;
      stroke: currentColor;
    }

    .likha-popup__close {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 50%;
      background: #f4eceb;
      color: #2b1c1a;
      font-size: 18px;
      cursor: pointer;
    }

    .likha-popup--success .likha-popup__icon {
      background: #eef7ef;
      color: #1d7a3d;
    }

    .likha-popup--error .likha-popup__icon {
      background: #f9ece9;
      color: #b12c1b;
    }

    .likha-popup--confirm .likha-popup__icon {
      background: #f4eceb;
      color: #600202;
    }

    body.popup-open {
      overflow: hidden;
    }

    @media (max-width: 600px) {
      .likha-popup {
        padding: 16px;
      }

      .likha-popup__dialog {
        padding: 20px 18px 16px;
      }

      .likha-popup__actions {
        justify-content: stretch;
      }

      .likha-popup__button {
        flex: 1 1 120px;
      }
    }
  `;

  const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  };

  const popup = {
    root: null,
    timer: null,
    current: null,
    ensure() {
      injectStyles();
      if (this.root) return this.root;
      let root = document.getElementById(ROOT_ID);
      if (!root) {
        root = document.createElement("div");
        root.id = ROOT_ID;
        root.className = "likha-popup";
        root.setAttribute("aria-hidden", "true");
        document.body.appendChild(root);
      }
      if (!root.dataset.bound) {
        root.addEventListener("click", (event) => {
          if (event.target === root) {
            this.close();
          }
        });
        root.dataset.bound = "true";
      }
      this.root = root;
      return root;
    },
    close() {
      if (!this.root) return;
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.root.classList.remove("active");
      this.root.setAttribute("aria-hidden", "true");
      this.root.innerHTML = "";
      document.body.classList.remove("popup-open");
      this.current = null;
    },
    render(config = {}) {
      const {
        type = "info",
        title = "Notice",
        message = "",
        details = "",
        body = null,
        confirmText = "OK",
        cancelText = "Cancel",
        hideCancel = false,
        onConfirm = null,
        onCancel = null,
        autoClose = 0,
        width = "",
      } = config;

      const root = this.ensure();
      root.innerHTML = "";
      root.className = `likha-popup likha-popup--${type}`;
      if (width) {
        root.style.setProperty("--popup-width", width);
      } else {
        root.style.removeProperty("--popup-width");
      }

      const dialog = document.createElement("div");
      dialog.className = "likha-popup__dialog";
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.setAttribute("aria-labelledby", "likhaPopupTitle");

      const close = document.createElement("button");
      close.type = "button";
      close.className = "likha-popup__close";
      close.setAttribute("aria-label", "Close");
      close.textContent = "x";
      close.addEventListener("click", () => this.close());

      const icon = document.createElement("div");
      icon.className = "likha-popup__icon";
      icon.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          ${
            type === "success"
              ? '<path d="M20 6L9 17l-5-5" />'
              : type === "error"
              ? '<path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10 3h4l7 7v4l-7 7h-4l-7-7V10z" />'
              : '<path d="M12 1.5l2.4 6.45L21 10l-6.4 2.05L12 18.5l-2.6-6.45L3 10l6.4-2.05L12 1.5z" />'
          }
        </svg>
      `;

      const content = document.createElement("div");
      content.className = "likha-popup__body";

      const heading = document.createElement("h2");
      heading.id = "likhaPopupTitle";
      heading.className = "likha-popup__title";
      heading.textContent = title;

      const messageEl = document.createElement("p");
      messageEl.className = "likha-popup__message";
      messageEl.textContent = message;

      content.appendChild(heading);
      content.appendChild(messageEl);

      if (details) {
        const detailsWrap = document.createElement("div");
        detailsWrap.className = "likha-popup__details";
        if (typeof details === "string") {
          detailsWrap.innerHTML = details;
        } else if (details instanceof Node) {
          detailsWrap.appendChild(details);
        }
        content.appendChild(detailsWrap);
      }

      if (body) {
        if (typeof body === "string") {
          const bodyWrap = document.createElement("div");
          bodyWrap.className = "likha-popup__details";
          bodyWrap.innerHTML = body;
          content.appendChild(bodyWrap);
        } else if (body instanceof Node) {
          const bodyWrap = document.createElement("div");
          bodyWrap.className = "likha-popup__details";
          bodyWrap.appendChild(body);
          content.appendChild(bodyWrap);
        }
      }

      const actions = document.createElement("div");
      actions.className = "likha-popup__actions";

      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.className = "likha-popup__button likha-popup__button--ghost";
      cancelBtn.textContent = cancelText;
      cancelBtn.addEventListener("click", () => {
        if (typeof onCancel === "function") onCancel();
        this.close();
      });

      const confirmBtn = document.createElement("button");
      confirmBtn.type = "button";
      confirmBtn.className = "likha-popup__button likha-popup__button--primary";
      confirmBtn.textContent = confirmText;
      confirmBtn.addEventListener("click", () => {
        if (typeof onConfirm === "function") onConfirm();
        this.close();
      });

      if (!hideCancel) {
        actions.appendChild(cancelBtn);
      }
      actions.appendChild(confirmBtn);

      dialog.appendChild(close);
      dialog.appendChild(icon);
      dialog.appendChild(content);
      dialog.appendChild(actions);
      root.appendChild(dialog);

      document.body.classList.add("popup-open");
      root.classList.add("active");
      root.setAttribute("aria-hidden", "false");
      this.current = config;

      if (autoClose) {
        this.timer = setTimeout(() => this.close(), autoClose);
      }
    },
    success(message, options = {}) {
      this.render({
        type: "success",
        title: options.title || "Success",
        message,
        hideCancel: true,
        confirmText: options.confirmText || "OK",
        onConfirm: options.onConfirm,
        autoClose: options.autoClose || 1600,
      });
    },
    error(message, options = {}) {
      this.render({
        type: "error",
        title: options.title || "Validation Needed",
        message,
        hideCancel: true,
        confirmText: options.confirmText || "OK",
        onConfirm: options.onConfirm,
        autoClose: options.autoClose || 2400,
      });
    },
    confirm(message, onConfirm, options = {}) {
      this.render({
        type: "confirm",
        title: options.title || "Please confirm",
        message,
        details: options.details || "",
        hideCancel: false,
        confirmText: options.confirmText || "Yes",
        cancelText: options.cancelText || "No",
        onConfirm,
        onCancel: options.onCancel,
      });
    },
  };

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      popup.close();
    }
  });

  window.LikhaPopup = popup;
})();
