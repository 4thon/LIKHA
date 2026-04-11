document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("likedSections");
  const filterContainer = document.getElementById("likedFilters");
  const searchInput = document.getElementById("likedSearch");
  const filterBar = document.getElementById("likedFilterBar");
  if (!container) return;

  const STORAGE_KEY = "likhaLikedItems";
  const store = window.LikhaStore;
  const loadLikes = () => store?.get(STORAGE_KEY) || {};

  const items = Object.values(loadLikes());
  if (!items.length) {
    container.innerHTML = `<div class="empty-state">No liked items yet. Browse the collections and tap the heart to save your favorites.</div>`;
    return;
  }

  const groupOrder = [
    "Accessories",
    "Jewelry",
    "Clothing",
    "Home & Decor",
    "Featured",
  ];

  const grouped = items.reduce((acc, item) => {
    const key = item.category || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const categories = [
    ...groupOrder.filter((cat) => grouped[cat]),
    ...Object.keys(grouped).filter((cat) => !groupOrder.includes(cat)),
  ];

  const getImageSrc = (src) => {
    if (!src) return "";
    if (src.startsWith("assets/")) {
      return `../${src}`;
    }
    if (src.startsWith("../") || src.startsWith("./")) {
      return src;
    }
    return src;
  };

  const createCard = (item, category) => {
    const card = document.createElement("article");
    card.className = "liked-card";
    card.dataset.id = item.id;
    card.dataset.category = item.category || category;

    const img = document.createElement("img");
    img.src = getImageSrc(item.image);
    img.alt = item.title || "Liked item";

    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.innerHTML = `
        <strong>${item.title || "Handmade Item"}</strong>
        <span>${item.maker ? `by ${item.maker}` : ""}</span>
        <strong>${item.price || ""}</strong>
      `;

    const like = document.createElement("button");
    like.className = "like";
    like.type = "button";
    like.textContent = "\u2665";
    like.classList.add("active");
    like.setAttribute("aria-pressed", "true");

    card.appendChild(img);
    card.appendChild(overlay);
    card.appendChild(like);
    return card;
  };

  const sectionsMap = new Map();

  categories.forEach((category) => {
    const section = document.createElement("section");
    section.className = "liked-section";
    section.dataset.category = category;

    const heading = document.createElement("h2");
    heading.textContent = category;
    section.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "liked-grid";

    grouped[category].forEach((item) => {
      grid.appendChild(createCard(item, category));
    });

    section.appendChild(grid);
    container.appendChild(section);
    sectionsMap.set(category, section);
  });

  if (filterContainer) {
    const buildFilters = () => {
      filterContainer.innerHTML = "";
      const allButton = document.createElement("button");
      allButton.className = "filter-chip active";
      allButton.type = "button";
      allButton.dataset.filter = "all";
      allButton.textContent = "All";
      filterContainer.appendChild(allButton);

      categories.forEach((category) => {
        const chip = document.createElement("button");
        chip.className = "filter-chip";
        chip.type = "button";
        chip.dataset.filter = category;
        chip.textContent = category;
        filterContainer.appendChild(chip);
      });
    };

    const applyFilters = () => {
      const active =
        filterContainer.querySelector(".filter-chip.active")?.dataset.filter ||
        "all";
      const query = (searchInput?.value || "").trim().toLowerCase();

      sectionsMap.forEach((section, category) => {
        const matchesCategory = active === "all" || active === category;
        let hasMatch = false;
        section.querySelectorAll(".liked-card").forEach((card) => {
          const text = card.textContent.toLowerCase();
          const matchesSearch = !query || text.includes(query);
          const show = matchesCategory && matchesSearch;
          card.style.display = show ? "" : "none";
          if (show) hasMatch = true;
        });
        section.style.display = hasMatch ? "" : "none";
      });
    };

    buildFilters();
    applyFilters();

    filterContainer.addEventListener("click", (event) => {
      const chip = event.target.closest(".filter-chip");
      if (!chip) return;
      filterContainer
        .querySelectorAll(".filter-chip")
        .forEach((btn) => btn.classList.remove("active"));
      chip.classList.add("active");
      applyFilters();
    });

    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }
  }

  const refreshFilters = () => {
    const hasCards = container.querySelector(".liked-card");
    if (filterBar) {
      filterBar.style.display = hasCards ? "flex" : "none";
    }
  };

  refreshFilters();

  const scheduleRemoval = (card, likeButton) => {
    setTimeout(() => {
      if (!likeButton.classList.contains("active")) {
        const section = card.closest(".liked-section");
        card.remove();
        if (section && !section.querySelector(".liked-card")) {
          section.remove();
        }
        if (!container.querySelector(".liked-card")) {
          container.innerHTML = `<div class="empty-state">No liked items yet. Browse the collections and tap the heart to save your favorites.</div>`;
        }
        refreshFilters();
      }
    }, 0);
  };

  const likeButtons = container.querySelectorAll(".like");
  likeButtons.forEach((button) => {
    button.dataset.bound = "true";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const card = button.closest(".liked-card");
      if (!card) return;
      const itemId = card.dataset.id;
      const likes = loadLikes();
      const itemData = likes[itemId];
      delete likes[itemId];
      store?.set(STORAGE_KEY, likes);
      button.classList.remove("active");
      button.textContent = "\u2661";
      if (window.LikhaActivity) {
        window.LikhaActivity.log({
          type: "unlike",
          message: `Removed like from ${itemData?.title || "item"}`,
          item: itemData,
        });
      }
      scheduleRemoval(card, button);
    });
  });
});
