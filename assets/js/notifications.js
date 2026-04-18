(() => {
  const store = window.LikhaStore;
  if (!store) return;

  const KEY = "likhaActivities";
  const loadActivities = () => store.get(KEY) || [];
  let activityModal = null;
  let activityDetails = null;
  let activityMeta = null;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp || Date.now());
    return date.toLocaleString();
  };

  const resolveImage = (src = "") => {
    if (!src) return "";
    if (src.startsWith("http") || src.startsWith("data:")) return src;
    const inPages = window.location.pathname.toLowerCase().includes("/pages/");
    const cleaned = src.replace(/^(\.\.\/)+/, "");
    return inPages ? `../${cleaned}` : cleaned;
  };

  const ensureItemModal = () => {
    if (activityModal) return;
    activityModal = document.createElement("div");
    activityModal.className = "modal";
    activityModal.id = "activityItemModal";
    activityModal.setAttribute("aria-hidden", "true");
    activityModal.innerHTML = `
      <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="activityItemTitle">
        <button class="modal-close" type="button" data-activity-close aria-label="Close">&times;</button>
        <h3 id="activityItemTitle">Activity Item</h3>
        <p class="modal-subtitle" id="activityItemMeta"></p>
        <div class="activity-item-modal" id="activityItemDetails"></div>
      </div>
    `;
    document.body.appendChild(activityModal);
    activityDetails = activityModal.querySelector("#activityItemDetails");
    activityMeta = activityModal.querySelector("#activityItemMeta");
  };

  const closeItemModal = () => {
    if (!activityModal) return;
    activityModal.classList.remove("active");
    activityModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  const openItemModal = (activity) => {
    if (!activity?.item) return;
    ensureItemModal();
    if (!activityDetails || !activityMeta) return;

    const item = activity.item;
    const title = item.title || "Handmade Item";
    const maker = item.maker || item.artistName || "Likha Artist";

    activityMeta.textContent = `${activity.message || "Activity"} - ${formatTime(
      activity.createdAt
    )}`;

    activityDetails.innerHTML = `
      <img src="${resolveImage(item.image)}" alt="${title}" />
      <div class="activity-item-copy">
        <h3>${title}</h3>
        <div><strong>Artist:</strong> ${maker}</div>
        <div><strong>Category:</strong> ${item.category || "Handmade"}</div>
        <div><strong>Price:</strong> ${item.price || "N/A"}</div>
      </div>
    `;

    activityModal.classList.add("active");
    activityModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
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
          if (item.item) {
            row.classList.add("clickable");
            row.setAttribute("role", "button");
            row.tabIndex = 0;
            row.addEventListener("click", () => openItemModal(item));
            row.addEventListener("keydown", (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openItemModal(item);
              }
            });
          }
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
    ensureItemModal();
    document.querySelectorAll(".notif-wrap").forEach(setupPanel);

    document.addEventListener("click", (event) => {
      if (event.target === activityModal || event.target.closest("[data-activity-close]")) {
        closeItemModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeItemModal();
      }
    });
  });
})();
