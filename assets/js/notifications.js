(() => {
  const store = window.LikhaStore;
  if (!store) return;

  const KEY = "likhaActivities";
  const loadActivities = () => store.get(KEY) || [];

  const formatTime = (timestamp) => {
    const date = new Date(timestamp || Date.now());
    return date.toLocaleString();
  };

  const setupPanel = (wrap) => {
    const button = wrap.querySelector(".notif-btn");
    const panel = wrap.querySelector(".notif-panel");
    const badge = wrap.querySelector(".notif-badge");
    const list = wrap.querySelector(".notif-list");

    if (!button || !panel || !list) return;

    const render = () => {
      const items = loadActivities();
      list.innerHTML = "";
      if (!items.length) {
        const empty = document.createElement("div");
        empty.className = "notif-empty";
        empty.textContent = "No activities yet.";
        list.appendChild(empty);
      } else {
        items.slice(0, 10).forEach((item) => {
          const row = document.createElement("div");
          row.className = "notif-item";
          row.innerHTML = `
            <div class="notif-message">${item.message}</div>
            <div class="notif-time">${formatTime(item.createdAt)}</div>
          `;
          list.appendChild(row);
        });
      }

      if (badge) {
        const count = items.length;
        badge.textContent = count > 9 ? "9+" : String(count);
        badge.style.display = count ? "inline-flex" : "none";
      }
    };

    const closePanel = () => {
      panel.classList.remove("open");
      panel.setAttribute("aria-hidden", "true");
    };

    button.addEventListener("click", (event) => {
      event.preventDefault();
      panel.classList.toggle("open");
      panel.setAttribute(
        "aria-hidden",
        panel.classList.contains("open") ? "false" : "true"
      );
    });

    document.addEventListener("click", (event) => {
      if (!panel.classList.contains("open")) return;
      if (panel.contains(event.target) || button.contains(event.target)) return;
      closePanel();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closePanel();
    });

    window.addEventListener("likha:activity", render);
    render();
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".notif-wrap").forEach(setupPanel);
  });
})();
