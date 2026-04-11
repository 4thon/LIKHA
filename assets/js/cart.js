(() => {
  const store = window.LikhaStore;
  if (!store) return;

  const CART_KEY = "likhaCartItems";
  const PURCHASE_KEY = "likhaPurchasedItems";

  const resolveImage = (src = "") => {
    if (!src) return "";
    if (src.startsWith("http") || src.startsWith("data:")) return src;
    const inPages = window.location.pathname.toLowerCase().includes("/pages/");
    const cleaned = src.replace(/^(\.\.\/)+/, "");
    return inPages ? `../${cleaned}` : cleaned;
  };

  const getList = (key) => store.get(key) || [];
  const saveList = (key, list) => store.set(key, list);

  const getId = (item) => item.id || item.image || item.title;

  const addUnique = (list, item) => {
    const id = getId(item);
    if (!id) return list;
    if (list.some((entry) => getId(entry) === id)) {
      return list;
    }
    return [...list, { ...item, id }];
  };

  const removeFromList = (key, item) => {
    const id = getId(item);
    const list = getList(key).filter((entry) => getId(entry) !== id);
    saveList(key, list);
  };

  const renderList = (container, items, emptyText) => {
    if (!container) return;
    container.innerHTML = "";
    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "inbox-empty";
      empty.textContent = emptyText;
      container.appendChild(empty);
      return;
    }
    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "inbox-item";
      row.innerHTML = `
        <img src="${resolveImage(item.image)}" alt="${item.title || "Item"}" />
        <div class="inbox-info">
          <div class="inbox-title">${item.title || "Handmade Item"}</div>
          <div class="inbox-meta">${item.maker ? `By ${item.maker}` : ""}</div>
        </div>
        <div class="inbox-price">${item.price || ""}</div>
      `;
      container.appendChild(row);
    });
  };

  const updateBadges = () => {
    const cartCount = getList(CART_KEY).length;
    const purchaseCount = getList(PURCHASE_KEY).length;
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      el.textContent = cartCount;
    });
    document.querySelectorAll("[data-inbox-count]").forEach((el) => {
      el.textContent = cartCount + purchaseCount;
    });
  };

  const renderPanel = () => {
    renderList(
      document.getElementById("cartList"),
      getList(CART_KEY),
      "No items in your cart yet."
    );
    renderList(
      document.getElementById("purchaseList"),
      getList(PURCHASE_KEY),
      "No purchases yet."
    );
    updateBadges();
  };

  const openPanel = () => {
    const panel = document.getElementById("inboxPanel");
    const overlay = document.querySelector(".inbox-overlay");
    if (panel) {
      panel.classList.add("open");
      panel.setAttribute("aria-hidden", "false");
    }
    if (overlay) overlay.classList.add("open");
    document.body.classList.add("panel-open");
  };

  const closePanel = () => {
    const panel = document.getElementById("inboxPanel");
    const overlay = document.querySelector(".inbox-overlay");
    if (panel) {
      panel.classList.remove("open");
      panel.setAttribute("aria-hidden", "true");
    }
    if (overlay) overlay.classList.remove("open");
    document.body.classList.remove("panel-open");
  };

  const addToCart = (item) => {
    const current = getList(CART_KEY);
    const updated = addUnique(current, item);
    saveList(CART_KEY, updated);
    updateBadges();
    renderPanel();
    if (updated.length !== current.length && window.LikhaActivity) {
      window.LikhaActivity.log({
        type: "cart",
        message: `Added to cart: ${item.title || "Handmade item"}`,
        item,
      });
    }
  };

  const purchaseItem = (item) => {
    const current = getList(PURCHASE_KEY);
    const updated = addUnique(current, item);
    saveList(PURCHASE_KEY, updated);
    removeFromList(CART_KEY, item);
    updateBadges();
    renderPanel();
    if (updated.length !== current.length && window.LikhaActivity) {
      window.LikhaActivity.log({
        type: "purchase",
        message: `Purchased ${item.title || "handmade item"}`,
        item,
      });
    }
  };

  window.LikhaCart = {
    addToCart,
    purchaseItem,
    renderPanel,
  };

  document.addEventListener("DOMContentLoaded", renderPanel);

  document.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-inbox-toggle]");
    if (toggle) {
      event.preventDefault();
      openPanel();
      return;
    }
    const close = event.target.closest("[data-inbox-close]");
    if (close) {
      event.preventDefault();
      closePanel();
    }
  });

  renderPanel();

  document.addEventListener("click", (event) => {
    const addBtn = event.target.closest("[data-add-cart]");
    if (addBtn) {
      event.preventDefault();
      const item = window.LIKHA_ACTIVE_ITEM;
      if (item) addToCart(item);
    }
    const buyBtn = event.target.closest("[data-buy]");
    if (buyBtn) {
      event.preventDefault();
      const item = window.LIKHA_ACTIVE_ITEM;
      if (item) purchaseItem(item);
      openPanel();
    }
  });
})();
