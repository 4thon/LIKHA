(() => {
  const store = window.LikhaStore;
  if (!store) return;

  const CART_KEY = "likhaCartItems";
  const PURCHASE_KEY = "likhaPurchasedItems";
  const PURCHASE_REQUEST_KEY = "likhaPurchaseRequests";
  const COMMISSION_KEY = "likhaCommissionRequests";
  const PROFILE_KEY = "likhaProfileData";

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
  const getProfile = () => store.get(PROFILE_KEY) || {};

  const normalizeTokens = (value = "") =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean);

  const scoreNameMatch = (inputName, artistName) => {
    const inputTokens = normalizeTokens(inputName);
    const artistTokens = normalizeTokens(artistName);
    if (!inputTokens.length || !artistTokens.length) return 0;

    const inputNormalized = inputTokens.join(" ");
    const artistNormalized = artistTokens.join(" ");
    if (inputNormalized === artistNormalized) return 100;

    const overlap = inputTokens.filter((token) =>
      artistTokens.includes(token)
    ).length;
    return overlap;
  };

  const getRequesterName = () => {
    const profile = getProfile();
    const fullName = [profile.firstName, profile.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    return fullName || "Likha User";
  };

  const addUnique = (list, item) => {
    const id = getId(item);
    if (!id) return list;
    if (list.some((entry) => getId(entry) === id)) return list;
    return [...list, { ...item, id }];
  };

  const removeFromList = (key, item) => {
    const id = getId(item);
    const list = getList(key).filter((entry) => getId(entry) !== id);
    saveList(key, list);
  };

  const findArtistForItem = (item) => {
    const artists = window.LIKHA_ARTISTS || [];
    if (item.artistId) {
      const byId = artists.find((artist) => artist.id === item.artistId);
      if (byId) return byId;
    }
    const maker = item.maker || item.artistName || "";
    if (!maker) return null;

    let bestArtist = null;
    let bestScore = 0;
    artists.forEach((artist) => {
      const score = scoreNameMatch(maker, artist.name || "");
      if (score > bestScore) {
        bestScore = score;
        bestArtist = artist;
      }
    });
    return bestScore >= 1 ? bestArtist : null;
  };

  const openModal = (modal) => {
    if (!modal) return;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const itemModal = document.getElementById("inboxItemModal");
  const itemModalDetails = document.getElementById("inboxItemDetails");
  const purchaseModal = document.getElementById("purchaseModal");
  const purchaseForm = document.getElementById("purchaseForm");
  const commissionModal = document.getElementById("quickCommissionModal");
  const commissionForm = document.getElementById("quickCommissionForm");

  const openItemModal = (item, source = "Cart") => {
    if (!itemModal || !itemModalDetails) return;
    itemModalDetails.innerHTML = `
      <img src="${resolveImage(item.image)}" alt="${item.title || "Item"}" />
      <div class="inbox-item-copy">
        <h3>${item.title || "Handmade Item"}</h3>
        <div><strong>Artist:</strong> ${item.maker || item.artistName || "Likha Artist"}</div>
        <div><strong>Price:</strong> ${item.price || "N/A"}</div>
        <div><strong>Category:</strong> ${item.category || "Handmade"}</div>
        <div><strong>Source:</strong> ${source}</div>
        ${
          item.paymentMethod
            ? `<div><strong>Payment:</strong> ${item.paymentMethod}</div>`
            : ""
        }
        ${
          item.deliveryAddress
            ? `<div><strong>Address:</strong> ${item.deliveryAddress}</div>`
            : ""
        }
        ${
          item.messageToArtist
            ? `<div><strong>Message:</strong> ${item.messageToArtist}</div>`
            : ""
        }
      </div>
    `;
    openModal(itemModal);
  };

  const renderList = (container, items, emptyText, sourceLabel) => {
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
      row.addEventListener("click", () => {
        openItemModal(item, sourceLabel);
      });
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
      "No items in your cart yet.",
      "Cart"
    );
    renderList(
      document.getElementById("purchaseList"),
      getList(PURCHASE_KEY),
      "No purchases yet.",
      "Purchased"
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
    renderPanel();
    if (updated.length !== current.length && window.LikhaActivity) {
      window.LikhaActivity.log({
        type: "cart",
        message: `Added to cart: ${item.title || "Handmade item"}`,
        item,
      });
    }
  };

  const addPurchaseRequestForArtist = (item, details) => {
    const artist = findArtistForItem(item);
    const profile = getProfile();
    const requests = getList(PURCHASE_REQUEST_KEY);
    const request = {
      id: `purchase_${Date.now()}`,
      artistId: artist?.id || item.artistId || "",
      artistName: artist?.name || item.artistName || item.maker || "Likha Artist",
      buyerName: getRequesterName(),
      buyerEmail: profile.email || "",
      buyerTel: profile.tel || "",
      itemId: item.id,
      itemTitle: item.title,
      itemImage: item.image,
      itemPrice: item.price,
      paymentMethod: details.paymentMethod,
      deliveryAddress: details.deliveryAddress,
      messageToArtist: details.messageToArtist,
      status: "Pending",
      createdAt: Date.now(),
    };
    requests.push(request);
    saveList(PURCHASE_REQUEST_KEY, requests);
  };

  const purchaseItem = (item, details) => {
    const current = getList(PURCHASE_KEY);
    const enrichedItem = {
      ...item,
      paymentMethod: details.paymentMethod,
      deliveryAddress: details.deliveryAddress,
      messageToArtist: details.messageToArtist,
      purchasedAt: Date.now(),
    };
    const updated = addUnique(current, enrichedItem);
    saveList(PURCHASE_KEY, updated);
    addPurchaseRequestForArtist(item, details);
    removeFromList(CART_KEY, item);
    renderPanel();
    if (updated.length !== current.length && window.LikhaActivity) {
      window.LikhaActivity.log({
        type: "purchase",
        message: `Purchased ${item.title || "handmade item"} via ${
          details.paymentMethod
        }`,
        item: enrichedItem,
      });
    }
  };

  const sendCommissionRequest = (item, formData) => {
    const artist = findArtistForItem(item);
    const profile = getProfile();
    const requests = getList(COMMISSION_KEY);
    const request = {
      id: `req_${Date.now()}`,
      artistId: artist?.id || item.artistId || "",
      artistName: artist?.name || item.artistName || item.maker || "Likha Artist",
      requester: getRequesterName(),
      requesterEmail: profile.email || "",
      requesterTel: profile.tel || "",
      itemType: item.title || "Custom Item",
      category: item.category || "Accessories",
      description: formData.message,
      budget: formData.budget,
      deadline: "",
      contact: profile.email || "Email",
      referenceImage: item.image || "",
      createdAt: Date.now(),
      source: "Item page quick commission",
    };
    requests.push(request);
    saveList(COMMISSION_KEY, requests);
    if (window.LikhaActivity) {
      window.LikhaActivity.log({
        type: "commission",
        message: `Sent commission request to ${request.artistName}`,
        item: {
          title: item.title,
          maker: request.artistName,
          category: item.category,
        },
      });
    }
  };

  const getActiveItem = () => window.LIKHA_ACTIVE_ITEM || null;

  window.LikhaCart = {
    addToCart,
    purchaseItem,
    renderPanel,
  };

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
      return;
    }
    if (event.target.closest("[data-item-close]")) {
      event.preventDefault();
      closeModal(itemModal);
      return;
    }
    if (event.target.closest("[data-purchase-close]")) {
      event.preventDefault();
      closeModal(purchaseModal);
      return;
    }
    if (event.target.closest("[data-commission-close]")) {
      event.preventDefault();
      closeModal(commissionModal);
    }
  });

  document.addEventListener("click", (event) => {
    if (event.target === itemModal) closeModal(itemModal);
    if (event.target === purchaseModal) closeModal(purchaseModal);
    if (event.target === commissionModal) closeModal(commissionModal);
  });

  document.addEventListener("click", (event) => {
    const addBtn = event.target.closest("[data-add-cart]");
    if (addBtn) {
      event.preventDefault();
      const item = getActiveItem();
      if (item) addToCart(item);
      return;
    }

    const buyBtn = event.target.closest("[data-buy]");
    if (buyBtn) {
      event.preventDefault();
      const item = getActiveItem();
      if (!item || !purchaseModal) return;
      const itemNameInput = document.getElementById("purchaseItemName");
      const artistInput = document.getElementById("purchaseArtist");
      if (itemNameInput) itemNameInput.value = item.title || "Handmade Item";
      if (artistInput) {
        const artist = findArtistForItem(item);
        artistInput.value = artist?.name || item.artistName || item.maker || "";
      }
      if (purchaseForm) purchaseForm.reset();
      if (itemNameInput) itemNameInput.value = item.title || "Handmade Item";
      if (artistInput) {
        const artist = findArtistForItem(item);
        artistInput.value = artist?.name || item.artistName || item.maker || "";
      }
      openModal(purchaseModal);
      return;
    }

    const commissionBtn = event.target.closest("[data-open-commission]");
    if (commissionBtn) {
      event.preventDefault();
      const item = getActiveItem();
      if (!item || !commissionModal) return;
      const artistInput = document.getElementById("quickCommissionArtist");
      const itemInput = document.getElementById("quickCommissionItem");
      if (artistInput) {
        const artist = findArtistForItem(item);
        artistInput.value = artist?.name || item.artistName || item.maker || "";
      }
      if (itemInput) itemInput.value = item.title || "Handmade Item";
      if (commissionForm) commissionForm.reset();
      if (artistInput) {
        const artist = findArtistForItem(item);
        artistInput.value = artist?.name || item.artistName || item.maker || "";
      }
      if (itemInput) itemInput.value = item.title || "Handmade Item";
      openModal(commissionModal);
    }
  });

  if (purchaseForm) {
    purchaseForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const item = getActiveItem();
      if (!item) return;
      const paymentMethod =
        document.getElementById("paymentMethod")?.value.trim() || "";
      const deliveryAddress =
        document.getElementById("deliveryAddress")?.value.trim() || "";
      const messageToArtist =
        document.getElementById("purchaseMessage")?.value.trim() || "";
      if (!paymentMethod || !deliveryAddress) {
        alert("Please provide payment method and delivery address.");
        return;
      }
      purchaseItem(item, {
        paymentMethod,
        deliveryAddress,
        messageToArtist,
      });
      closeModal(purchaseModal);
      openPanel();
    });
  }

  if (commissionForm) {
    commissionForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const item = getActiveItem();
      if (!item) return;
      const budget =
        document.getElementById("quickCommissionBudget")?.value.trim() || "";
      const message =
        document.getElementById("quickCommissionMessage")?.value.trim() || "";
      if (!budget || !message) {
        alert("Please provide budget and commission message.");
        return;
      }
      sendCommissionRequest(item, { budget, message });
      closeModal(commissionModal);
      alert("Commission request sent.");
    });
  }

  renderPanel();
})();
