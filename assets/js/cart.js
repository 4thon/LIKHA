(() => {
  const store = window.LikhaStore;
  if (!store) return;

  const popup = window.LikhaPopup;

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

  const getList = (key) => {
    const list = store.get(key);
    return Array.isArray(list) ? list : [];
  };

  const saveList = (key, list) => {
    store.set(key, Array.isArray(list) ? list : []);
  };

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

  const normalizeQuantity = (value) => {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed < 1) return 1;
    return parsed;
  };

  const addOrIncrement = (list, item, quantity = 1) => {
    const id = getId(item);
    if (!id) return list;
    const existingIndex = list.findIndex((entry) => getId(entry) === id);
    if (existingIndex >= 0) {
      const current = list[existingIndex];
      const nextQuantity =
        normalizeQuantity(current.quantity || 1) + normalizeQuantity(quantity);
      const next = {
        ...current,
        ...item,
        quantity: nextQuantity,
      };
      list[existingIndex] = next;
      return list;
    }
    return [
      ...list,
      {
        ...item,
        id,
        quantity: normalizeQuantity(quantity),
      },
    ];
  };

  const removeFromList = (key, item) => {
    const id = getId(item);
    const list = getList(key).filter((entry) => getId(entry) !== id);
    saveList(key, list);
  };

  const updateListItem = (key, itemId, patch) => {
    const list = getList(key).map((entry) =>
      getId(entry) === itemId ? { ...entry, ...patch } : entry
    );
    saveList(key, list);
    return list.find((entry) => getId(entry) === itemId) || null;
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

  const setModalSide = (modal, side = "center") => {
    if (!modal) return;
    modal.classList.remove("modal-left", "modal-right");
    if (side === "left") modal.classList.add("modal-left");
    if (side === "right") modal.classList.add("modal-right");
  };

  const openModal = (modal, side = "center") => {
    if (!modal) return;
    setModalSide(modal, side);
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
  const itemModalActions = document.getElementById("inboxItemActions");
  const purchaseModal = document.getElementById("purchaseModal");
  const purchaseForm = document.getElementById("purchaseForm");
  const commissionModal = document.getElementById("quickCommissionModal");
  const commissionForm = document.getElementById("quickCommissionForm");
  const walletFields = document.getElementById("walletFields");

  const openItemModal = (item, source = "Cart") => {
    if (!itemModal || !itemModalDetails) return;
    const quantity = normalizeQuantity(item.quantity || 1);
    itemModalDetails.innerHTML = `
      <img src="${resolveImage(item.image)}" alt="${item.title || "Item"}" />
      <div class="inbox-item-copy">
        <h3>${item.title || "Handmade Item"}</h3>
        <div><strong>Artist:</strong> ${item.maker || item.artistName || "Likha Artist"}</div>
        <div><strong>Price:</strong> ${item.price || "N/A"}</div>
        <div><strong>Category:</strong> ${item.category || "Handmade"}</div>
        <div><strong>Quantity:</strong> ${quantity}</div>
        <div><strong>Source:</strong> ${source}</div>
        ${
          item.paymentMethod
            ? `<div><strong>Payment:</strong> ${item.paymentMethod}</div>`
            : ""
        }
        ${
          item.walletProvider
            ? `<div><strong>Wallet:</strong> ${item.walletProvider}</div>`
            : ""
        }
        ${
          item.walletNumber
            ? `<div><strong>Wallet Number:</strong> ${item.walletNumber}</div>`
            : ""
        }
        ${
          item.walletReference
            ? `<div><strong>Reference #:</strong> ${item.walletReference}</div>`
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

    if (itemModalActions) {
      const isPurchase = source.toLowerCase().includes("purchase");
      itemModalActions.innerHTML = `
        <label class="field item-quantity-field">
          Quantity
          <input type="number" min="1" value="${quantity}" id="modalItemQuantity" />
        </label>
        <label class="field item-reason-field">
          ${
            isPurchase
              ? "Cancel reason"
              : "Remove reason"
          }
          <textarea id="modalItemReason" rows="3" placeholder="${
            isPurchase ? "Why do you want to cancel this order?" : "Why do you want to remove this cart item?"
          }"></textarea>
        </label>
        <div class="modal-actions item-modal-buttons">
          <button type="button" class="ghost-btn" data-item-qty-save>Save Quantity</button>
          <button type="button" class="ghost-btn" data-item-remove>${
            isPurchase ? "Cancel Order" : "Remove Item"
          }</button>
        </div>
      `;

      const quantityInput = itemModalActions.querySelector("#modalItemQuantity");
      const reasonInput = itemModalActions.querySelector("#modalItemReason");
      const saveBtn = itemModalActions.querySelector("[data-item-qty-save]");
      const removeBtn = itemModalActions.querySelector("[data-item-remove]");
      const sourceKey = isPurchase ? PURCHASE_KEY : CART_KEY;

      saveBtn?.addEventListener("click", () => {
        const nextQuantity = normalizeQuantity(quantityInput?.value);
        updateListItem(sourceKey, item.id, { quantity: nextQuantity });
        renderPanel();
        window.LikhaActivity?.log({
          type: isPurchase ? "purchase-quantity" : "cart-quantity",
          message: `Updated quantity for ${item.title || "item"} to ${nextQuantity}`,
          item: { ...item, quantity: nextQuantity },
        });
        popup?.success("Quantity updated successfully.", {
          title: "Updated",
          autoClose: 1200,
        });
        closeModal(itemModal);
      });

      removeBtn?.addEventListener("click", () => {
        const reason = reasonInput?.value.trim();
        if (!reason) {
          popup?.error(
            isPurchase
              ? "Please enter a reason before canceling this order."
              : "Please enter a reason before removing this cart item.",
            {
              title: "Validation needed",
            }
          );
          return;
        }

        popup?.confirm(
          isPurchase
            ? "Cancel this purchased item?"
            : "Remove this item from your cart?",
          () => {
            if (isPurchase) {
              removeFromList(PURCHASE_KEY, item);
            } else {
              removeFromList(CART_KEY, item);
            }
            renderPanel();
            if (window.LikhaActivity) {
              window.LikhaActivity.log({
                type: isPurchase ? "purchase-cancel" : "cart-remove",
                message: isPurchase
                  ? `Canceled ${item.title || "purchased item"}`
                  : `Removed ${item.title || "cart item"} from cart`,
                item,
              });
            }
            popup?.success(
              isPurchase
                ? "Order canceled successfully."
                : "Cart item removed successfully.",
              {
                title: "Done",
                autoClose: 1200,
              }
            );
            closeModal(itemModal);
          },
          {
            title: isPurchase ? "Cancel order" : "Remove cart item",
            confirmText: "Yes",
            cancelText: "No",
          }
        );
      });
    }

    openModal(itemModal, "center");
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
      row.dataset.source = sourceLabel;
      row.dataset.itemId = getId(item);
      row.innerHTML = `
        <img src="${resolveImage(item.image)}" alt="${item.title || "Item"}" />
        <div class="inbox-info">
          <div class="inbox-title">${item.title || "Handmade Item"}</div>
          <div class="inbox-meta">${item.maker ? `By ${item.maker}` : ""}</div>
          <div class="inbox-meta">Qty: ${normalizeQuantity(item.quantity || 1)}</div>
        </div>
        <div class="inbox-price">${item.price || ""}</div>
      `;
      row.addEventListener("click", () => {
        openItemModal(item, sourceLabel);
      });
      container.appendChild(row);
    });
  };

  const totalQuantity = (items) =>
    items.reduce((sum, item) => sum + normalizeQuantity(item.quantity || 1), 0);

  const updateBadges = () => {
    const cartCount = totalQuantity(getList(CART_KEY));
    const purchaseCount = totalQuantity(getList(PURCHASE_KEY));
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
    const updated = addOrIncrement([...current], item, 1);
    saveList(CART_KEY, updated);
    renderPanel();
    if (updated.length !== current.length || totalQuantity(updated) > totalQuantity(current)) {
      window.LikhaActivity?.log({
        type: "cart",
        message: `Added to cart: ${item.title || "Handmade item"}`,
        item: { ...item, quantity: 1 },
      });
      popup?.success("Item added to cart.", {
        title: "Added",
        autoClose: 1200,
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
      quantity: details.quantity,
      paymentMethod: details.paymentMethod,
      walletProvider: details.walletProvider || "",
      walletNumber: details.walletNumber || "",
      walletReference: details.walletReference || "",
      deliveryAddress: details.deliveryAddress,
      messageToArtist: details.messageToArtist,
      status: "Pending",
      createdAt: Date.now(),
    };
    requests.unshift(request);
    saveList(PURCHASE_REQUEST_KEY, requests);
  };

  const purchaseItem = (item, details) => {
    const current = getList(PURCHASE_KEY);
    const enrichedItem = {
      ...item,
      quantity: normalizeQuantity(details.quantity || 1),
      paymentMethod: details.paymentMethod,
      walletProvider: details.walletProvider || "",
      walletNumber: details.walletNumber || "",
      walletReference: details.walletReference || "",
      deliveryAddress: details.deliveryAddress,
      messageToArtist: details.messageToArtist,
      purchasedAt: Date.now(),
    };
    const updated = addOrIncrement([...current], enrichedItem, enrichedItem.quantity);
    saveList(PURCHASE_KEY, updated);
    addPurchaseRequestForArtist(item, details);
    renderPanel();
    window.LikhaActivity?.log({
      type: "purchase",
      message: `Purchased ${item.title || "handmade item"} via ${details.paymentMethod}`,
      item: enrichedItem,
    });
    popup?.success("Your order has been submitted successfully.", {
      title: "Order sent",
      autoClose: 1400,
    });
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
    requests.unshift(request);
    saveList(COMMISSION_KEY, requests);
    window.LikhaActivity?.log({
      type: "commission",
      message: `Sent commission request to ${request.artistName}`,
      item: {
        title: item.title,
        maker: request.artistName,
        category: item.category,
      },
    });
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
      const quantityInput = document.getElementById("purchaseQuantity");
      const paymentMethod = document.getElementById("paymentMethod");
      const walletProvider = document.getElementById("walletProvider");
      const walletNumber = document.getElementById("walletNumber");
      const walletReference = document.getElementById("walletReference");
      const deliveryAddress = document.getElementById("deliveryAddress");
      const purchaseMessage = document.getElementById("purchaseMessage");
      if (purchaseForm) purchaseForm.reset();
      if (itemNameInput) itemNameInput.value = item.title || "Handmade Item";
      if (artistInput) {
        const artist = findArtistForItem(item);
        artistInput.value = artist?.name || item.artistName || item.maker || "";
      }
      if (quantityInput) quantityInput.value = "1";
      if (paymentMethod) paymentMethod.value = "";
      if (walletProvider) walletProvider.value = "";
      if (walletNumber) walletNumber.value = "";
      if (walletReference) walletReference.value = "";
      if (deliveryAddress) deliveryAddress.value = "";
      if (purchaseMessage) purchaseMessage.value = "";
      if (walletFields) walletFields.hidden = true;
      openModal(purchaseModal, "right");
      return;
    }

    const commissionBtn = event.target.closest("[data-open-commission]");
    if (commissionBtn) {
      event.preventDefault();
      const item = getActiveItem();
      if (!item || !commissionModal) return;
      const artistInput = document.getElementById("quickCommissionArtist");
      const itemInput = document.getElementById("quickCommissionItem");
      const budget = document.getElementById("quickCommissionBudget");
      const message = document.getElementById("quickCommissionMessage");
      if (commissionForm) commissionForm.reset();
      if (artistInput) {
        const artist = findArtistForItem(item);
        artistInput.value = artist?.name || item.artistName || item.maker || "";
      }
      if (itemInput) itemInput.value = item.title || "Handmade Item";
      if (budget) budget.value = "";
      if (message) message.value = "";
      openModal(commissionModal, "left");
    }
  });

  const paymentMethod = document.getElementById("paymentMethod");
  if (paymentMethod && walletFields) {
    paymentMethod.addEventListener("change", () => {
      walletFields.hidden = paymentMethod.value !== "E-Wallet";
    });
  }

  if (purchaseForm) {
    purchaseForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const item = getActiveItem();
      if (!item) return;
      const quantity = normalizeQuantity(
        document.getElementById("purchaseQuantity")?.value || 1
      );
      const paymentMethodValue =
        document.getElementById("paymentMethod")?.value.trim() || "";
      const deliveryAddress =
        document.getElementById("deliveryAddress")?.value.trim() || "";
      const messageToArtist =
        document.getElementById("purchaseMessage")?.value.trim() || "";
      const walletProviderValue =
        document.getElementById("walletProvider")?.value.trim() || "";
      const walletNumberValue =
        document.getElementById("walletNumber")?.value.trim() || "";
      const walletReferenceValue =
        document.getElementById("walletReference")?.value.trim() || "";

      if (!paymentMethodValue || !deliveryAddress) {
        popup?.error("Please provide a payment method and delivery address.", {
          title: "Purchase validation",
        });
        return;
      }

      if (paymentMethodValue === "E-Wallet") {
        if (!walletProviderValue || !walletNumberValue || !walletReferenceValue) {
          popup?.error(
            "Please complete the e-wallet provider, number, and reference number.",
            { title: "E-Wallet validation" }
          );
          return;
        }
        if (!/^\d+$/.test(walletNumberValue)) {
          popup?.error("The e-wallet number should contain digits only.", {
            title: "E-Wallet validation",
          });
          return;
        }
      }

      purchaseItem(item, {
        quantity,
        paymentMethod: paymentMethodValue,
        walletProvider: walletProviderValue,
        walletNumber: walletNumberValue,
        walletReference: walletReferenceValue,
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
        popup?.error("Please provide your budget and commission message.", {
          title: "Commission validation",
        });
        return;
      }
      sendCommissionRequest(item, { budget, message });
      closeModal(commissionModal);
      popup?.success("Commission request sent successfully.", {
        title: "Request sent",
        autoClose: 1400,
      });
    });
  }

  renderPanel();
})();
