document.addEventListener("DOMContentLoaded", () => {
  if (!window.LIKHA_ARTISTS) return;
  const params = new URLSearchParams(window.location.search);
  const artistId = params.get("artist");
  const artist =
    window.LIKHA_ARTISTS.find((item) => item.id === artistId) ||
    window.LIKHA_ARTISTS[0];
  if (!artist) return;

  const STORAGE_KEY = "likhaCommissionRequests";
  const PURCHASE_KEY = "likhaPurchaseRequests";
  const store = window.LikhaStore;
  const loadRequests = () => store?.get(STORAGE_KEY) || [];
  const loadPurchases = () => store?.get(PURCHASE_KEY) || [];

  const saveRequests = (requests) => {
    store?.set(STORAGE_KEY, requests);
  };

  const resolvePath = (src) => {
    if (!src) return "";
    if (src.startsWith("assets/")) return `../${src}`;
    return src;
  };

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "";
  };

  const avatar = document.getElementById("artistAvatar");
  if (avatar) {
    avatar.src = resolvePath(artist.avatar);
    avatar.alt = artist.name;
  }

  setText("artistName", artist.name);
  setText("artistEmail", artist.email);
  setText("artistTel", artist.tel);
  setText("artistBio", artist.bio);
  setText("artistCraft", artist.craft);
  setText("artistHandle", artist.handle);

  const itemsGrid = document.getElementById("artistItems");
  if (itemsGrid) {
    itemsGrid.innerHTML = "";
    artist.items.forEach((item) => {
      const img = document.createElement("img");
      img.src = resolvePath(item);
      img.alt = artist.name;
      itemsGrid.appendChild(img);
    });
  }

  const categorySelect = document.getElementById("commissionCategory");
  if (categorySelect && artist.craft) {
    const option = Array.from(categorySelect.options).find(
      (opt) => opt.value === artist.craft
    );
    if (option) {
      categorySelect.value = artist.craft;
      categorySelect.dispatchEvent(new Event("change"));
    }
  }

  const preview = document.getElementById("commissionPreview");
  const referenceInput = document.getElementById("referenceImage");
  if (preview && artist.items && artist.items.length) {
    preview.src = resolvePath(artist.items[0]);
    preview.alt = artist.name;
    if (referenceInput) {
      referenceInput.value = resolvePath(artist.items[0]);
    }
  }

  const inbox = document.getElementById("commissionInbox");
  const purchaseInbox = document.getElementById("purchaseInbox");
  const commissionModal = document.getElementById("commissionModal");
  const confirmModal = document.getElementById("confirmModal");
  const confirmMessage = document.getElementById("confirmMessage");
  const confirmYes = document.querySelector("[data-confirm-yes]");
  const confirmNo = document.querySelector("[data-confirm-no]");
  const confirmClose = document.querySelector("[data-confirm-close]");
  const requestIdInput = document.getElementById("commissionRequestId");

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
  const renderInbox = () => {
    if (!inbox) return;
    const allRequests = loadRequests();
    const requests = allRequests
      .filter((req) => req.artistId === artist.id)
      .sort((a, b) => b.createdAt - a.createdAt);

    if (!requests.length) {
      inbox.innerHTML =
        '<div class="inbox-empty">No commission requests yet.</div>';
      return;
    }

    inbox.innerHTML = "";
    requests.forEach((req) => {
      const card = document.createElement("div");
      card.className = "inbox-card";

      const thumb = document.createElement("img");
      thumb.className = "inbox-thumb";
      thumb.src = resolvePath(req.referenceImage || artist.avatar);
      thumb.alt = req.itemType || "Commission";

      const info = document.createElement("div");
      info.className = "inbox-info";
      const created = new Date(req.createdAt).toLocaleDateString();

      info.innerHTML = `
        <strong>${req.itemType || "Custom Item"} request</strong>
        <span>Requester: ${req.requester || "Likha User"}</span>
        <div class="inbox-meta">
          <span>Category: ${req.category || artist.craft}</span>
          <span>Budget: ${req.budget || "N/A"}</span>
          <span>Deadline: ${req.deadline || "Flexible"}</span>
          <span>Contact: ${req.contact || "Email"}</span>
          <span>${created}</span>
        </div>
        <span>${req.description || "No description provided."}</span>
      `;

      const actions = document.createElement("div");
      actions.className = "inbox-actions";
      actions.innerHTML = `
        <button class="btn-edit" type="button" data-inbox-action="edit" data-request-id="${req.id}">Edit</button>
        <button class="btn-cancel" type="button" data-inbox-action="cancel" data-request-id="${req.id}">Cancel</button>
      `;
      info.appendChild(actions);

      card.appendChild(thumb);
      card.appendChild(info);
      inbox.appendChild(card);
    });
  };

  const renderPurchaseInbox = () => {
    if (!purchaseInbox) return;
    const purchases = loadPurchases()
      .filter((req) => req.artistId === artist.id)
      .sort((a, b) => b.createdAt - a.createdAt);

    if (!purchases.length) {
      purchaseInbox.innerHTML =
        '<div class="inbox-empty">No purchase orders yet.</div>';
      return;
    }

    purchaseInbox.innerHTML = "";
    purchases.forEach((order) => {
      const card = document.createElement("div");
      card.className = "inbox-card";
      card.innerHTML = `
        <img class="inbox-thumb" src="${resolvePath(
          order.itemImage || artist.avatar
        )}" alt="${order.itemTitle || "Purchased item"}" />
        <div class="inbox-info">
          <strong>${order.itemTitle || "Purchased item"}</strong>
          <span>Buyer: ${order.buyerName || "Likha User"}</span>
        <div class="inbox-meta">
          <span>Price: ${order.itemPrice || "N/A"}</span>
          <span>Qty: ${order.quantity || 1}</span>
          <span>Payment: ${order.paymentMethod || "N/A"}</span>
          <span>Status: ${order.status || "Pending"}</span>
        </div>
        ${
          order.walletProvider
            ? `<span><strong>Wallet:</strong> ${order.walletProvider}</span>`
            : ""
        }
        ${
          order.walletNumber
            ? `<span><strong>Wallet Number:</strong> ${order.walletNumber}</span>`
            : ""
        }
        ${
          order.walletReference
            ? `<span><strong>Reference #:</strong> ${order.walletReference}</span>`
            : ""
        }
        ${
          order.buyerEmail
            ? `<span><strong>Email:</strong> ${order.buyerEmail}</span>`
            : ""
          }
          ${
            order.buyerTel
              ? `<span><strong>Phone:</strong> ${order.buyerTel}</span>`
              : ""
          }
          <span><strong>Address:</strong> ${order.deliveryAddress || "-"}</span>
          ${
            order.messageToArtist
              ? `<span><strong>Message:</strong> ${order.messageToArtist}</span>`
              : ""
          }
        </div>
      `;
      purchaseInbox.appendChild(card);
    });
  };

  renderInbox();
  renderPurchaseInbox();

  const form = document.getElementById("commissionForm");
  const submitButton = form?.querySelector(".primary-btn");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const editingId = requestIdInput?.value;
      const itemType = document.getElementById("commissionItemType")?.value;
      const category = document.getElementById("commissionCategory")?.value;
      const description =
        document.getElementById("commissionDescription")?.value?.trim();
      const budget = document.getElementById("commissionBudget")?.value;
      const deadline = document.getElementById("commissionDeadline")?.value;
      const contact = document.getElementById("commissionContact")?.value;
      const reference = document.getElementById("referenceImage")?.value;

      const missing = [];
      if (!itemType) missing.push("item type");
      if (!description) missing.push("description");

      if (missing.length) {
        openConfirm(
          `Please complete the following before submitting: ${missing.join(
            ", "
          )}.`,
          null,
          { confirmText: "OK", hideCancel: true }
        );
        return;
      }

      openConfirm(
        editingId ? "Update this commission request?" : "Send this commission request?",
        () => {
          const allRequests = loadRequests();
          if (editingId) {
            const target = allRequests.find((req) => req.id === editingId);
            if (target) {
              target.itemType = itemType;
              target.category = category;
              target.description = description;
              target.budget = budget;
              target.deadline = deadline;
              target.contact = contact;
              target.referenceImage = reference;
              target.updatedAt = Date.now();
            }
          } else {
            const request = {
              id: `req_${Date.now()}`,
              artistId: artist.id,
              artistName: artist.name,
              requester: "Likha User",
              itemType,
              category,
              description,
              budget,
              deadline,
              contact,
              referenceImage: reference,
              createdAt: Date.now(),
            };
            allRequests.push(request);
          }

          saveRequests(allRequests);
          renderInbox();

          form.reset();
          if (requestIdInput) requestIdInput.value = "";
          if (submitButton) submitButton.textContent = "Send Request";
          if (categorySelect && artist.craft) {
            categorySelect.value = artist.craft;
            categorySelect.dispatchEvent(new Event("change"));
          }

          closeModal(commissionModal);

          if (window.LikhaActivity) {
            window.LikhaActivity.log({
              type: editingId ? "commission-update" : "commission",
              message: editingId
                ? `Updated commission request for ${artist.name}`
                : `Sent commission request to ${artist.name}`,
              item: {
                title: itemType || "Commission request",
                maker: artist.name,
                category: category || artist.craft,
              },
            });
          }

          openConfirm(
            editingId
              ? "Commission request updated."
              : "Commission request sent.",
            null,
            { confirmText: "OK", hideCancel: true }
          );
        }
      );
    });
  }

  const openConfirm = (
    message,
    onConfirm,
    { confirmText = "Yes", cancelText = "No", hideCancel = false } = {}
  ) => {
    if (!confirmModal || !confirmMessage || !confirmYes || !confirmNo) return;
    confirmMessage.textContent = message;
    confirmYes.textContent = confirmText;
    confirmNo.textContent = cancelText;
    confirmNo.style.display = hideCancel ? "none" : "inline-flex";
    confirmModal.dataset.pendingAction = "true";
    confirmModal.dataset.onConfirm = "";
    confirmModal._confirmHandler = onConfirm;
    openModal(confirmModal);
  };

  if (confirmYes) {
    confirmYes.addEventListener("click", () => {
      if (confirmModal && confirmModal._confirmHandler) {
        confirmModal._confirmHandler();
      }
      closeModal(confirmModal);
      if (confirmModal) confirmModal._confirmHandler = null;
    });
  }

  if (confirmNo) {
    confirmNo.addEventListener("click", () => {
      closeModal(confirmModal);
      if (confirmModal) confirmModal._confirmHandler = null;
    });
  }

  if (confirmClose) {
    confirmClose.addEventListener("click", () => {
      closeModal(confirmModal);
      if (confirmModal) confirmModal._confirmHandler = null;
    });
  }

  if (confirmModal) {
    confirmModal.addEventListener("click", (event) => {
      if (event.target === confirmModal) {
        closeModal(confirmModal);
        confirmModal._confirmHandler = null;
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && confirmModal?.classList.contains("active")) {
      closeModal(confirmModal);
      if (confirmModal) confirmModal._confirmHandler = null;
    }
  });

  if (inbox) {
    inbox.addEventListener("click", (event) => {
      const action = event.target.closest("[data-inbox-action]");
      if (!action) return;
      const requestId = action.dataset.requestId;
      const allRequests = loadRequests();
      const request = allRequests.find((req) => req.id === requestId);
      if (!request) return;

      if (action.dataset.inboxAction === "edit") {
        openConfirm("Edit this commission request?", () => {
          if (requestIdInput) requestIdInput.value = request.id;
          const itemType = document.getElementById("commissionItemType");
          const category = document.getElementById("commissionCategory");
          const description = document.getElementById("commissionDescription");
          const budget = document.getElementById("commissionBudget");
          const deadline = document.getElementById("commissionDeadline");
          const contact = document.getElementById("commissionContact");
          if (itemType) itemType.value = request.itemType || itemType.value;
          if (category) category.value = request.category || category.value;
          if (description) description.value = request.description || "";
          if (budget) budget.value = request.budget || budget.value;
          if (deadline) deadline.value = request.deadline || "";
          if (contact) contact.value = request.contact || contact.value;
          if (referenceInput) {
            referenceInput.value = request.referenceImage || "";
          }
          if (preview && request.referenceImage) {
            preview.src = resolvePath(request.referenceImage);
          }
          if (submitButton) submitButton.textContent = "Update Request";
          openModal(commissionModal);
        });
      }

      if (action.dataset.inboxAction === "cancel") {
        openConfirm("Cancel this commission request?", () => {
          const updated = allRequests.filter((req) => req.id !== requestId);
          saveRequests(updated);
          renderInbox();
          if (window.LikhaActivity) {
            window.LikhaActivity.log({
              type: "commission-cancel",
              message: `Canceled commission request for ${artist.name}`,
              item: {
                title: request.itemType || "Commission request",
                maker: artist.name,
                category: request.category || artist.craft,
              },
            });
          }
        });
      }
    });
  }
});
