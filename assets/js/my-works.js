document.addEventListener("DOMContentLoaded", () => {
  const store = window.LikhaStore;
  const popup = window.LikhaPopup;
  if (!store) return;

  const KEY = "likhaMyWorks";
  const grid = document.getElementById("worksGrid");
  const modal = document.getElementById("workModal");
  const infoModal = document.getElementById("workInfoModal");
  const form = document.getElementById("workForm");
  const openBtn = document.querySelector("[data-open-modal]");
  const closeBtn = document.querySelector("[data-close-modal]");
  const previewInput = document.getElementById("workImageInput");
  const previewImage = document.getElementById("workPreviewImage");
  const previewBox = previewInput?.closest(".upload-box");
  const processInputs = document.querySelectorAll(".process-input");
  const titleInput = document.getElementById("workTitle");
  const categoryInput = document.getElementById("workCategory");
  const priceInput = document.getElementById("workPrice");
  const descInput = document.getElementById("workDescription");

  const infoMap = {
    image: document.getElementById("workInfoImage"),
    item: document.getElementById("workInfoItem"),
    category: document.getElementById("workInfoCategory"),
    price: document.getElementById("workInfoPrice"),
    likes: document.getElementById("workInfoLikes"),
    carts: document.getElementById("workInfoCarts"),
    description: document.getElementById("workInfoDescription"),
  };

  const seedItems = [
    {
      id: "work_1",
      title: "Handmade Charms",
      image: "assets/images/accessories/a.3.jpg",
      likes: 125,
      carts: 87,
      size: "wide",
      category: "Accessories",
      price: "₱180",
      description: "Colorful charm set for bags and keys.",
    },
    {
      id: "work_2",
      title: "Beaded Necklace",
      image: "assets/images/products/handmadenecklace.jpg",
      likes: 231,
      carts: 101,
      size: "tall",
      category: "Jewelry",
      price: "₱280",
      description: "Hand-strung necklace with soft pastel beads.",
    },
    {
      id: "work_3",
      title: "Beaded Curtain",
      image: "assets/images/home-decor/hd7.jpg",
      likes: 123,
      carts: 69,
      size: "tall",
      category: "Home & Decor",
      price: "₱420",
      description: "Decor curtain for cozy room corners.",
    },
    {
      id: "work_4",
      title: "Crochet Cardigan",
      image: "assets/images/clothing/c3.jpg",
      likes: 23,
      carts: 62,
      size: "tall",
      category: "Clothing",
      price: "₱750",
      description: "Light crochet cardigan for layered styling.",
    },
    {
      id: "work_5",
      title: "Crochet Accessories",
      image: "assets/images/clothing/c12.jpg",
      likes: 112,
      carts: 54,
      size: "",
      category: "Accessories",
      price: "₱150",
      description: "Mixed accessories pack for casual wear.",
    },
    {
      id: "work_6",
      title: "Handmade Keychains",
      image: "assets/images/accessories/a.4.jpg",
      likes: 121,
      carts: 87,
      size: "",
      category: "Accessories",
      price: "₱95",
      description: "Lightweight handmade keychain set.",
    },
  ];

  const loadWorks = () => {
    const saved = store.get(KEY);
    if (saved && saved.length) return saved;
    store.set(KEY, seedItems);
    return seedItems;
  };

  const saveWorks = (items) => {
    store.set(KEY, items);
  };

  const resolveImage = (src) => {
    if (!src) return "";
    if (src.startsWith("data:")) return src;
    if (src.startsWith("assets/")) return `../${src}`;
    return src;
  };

  const openModal = (element) => {
    if (!element) return;
    element.classList.add("active");
    element.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeModal = (element) => {
    if (!element) return;
    element.classList.remove("active");
    element.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const openInfoModal = (item) => {
    if (!infoModal) return;
    if (infoMap.image) {
      infoMap.image.src = resolveImage(item.image);
      infoMap.image.alt = item.title || "Work item";
    }
    if (infoMap.item) infoMap.item.textContent = item.title || "Handmade Item";
    if (infoMap.category) infoMap.category.textContent = item.category || "Accessories";
    if (infoMap.price) infoMap.price.textContent = item.price || "₱0";
    if (infoMap.likes) infoMap.likes.textContent = String(item.likes ?? 0);
    if (infoMap.carts) infoMap.carts.textContent = String(item.carts ?? 0);
    if (infoMap.description)
      infoMap.description.textContent = item.description || "No description provided.";
    openModal(infoModal);
  };

  const renderWorks = () => {
    if (!grid) return;
    const items = loadWorks();
    grid.innerHTML = "";
    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = `work-card ${item.size || ""}`.trim();
      card.dataset.id = item.id;
      const img = document.createElement("img");
      img.src = resolveImage(item.image);
      img.alt = item.title || "Work item";

      const stats = document.createElement("div");
      stats.className = "work-stats";
      stats.innerHTML = `
        <div class="work-stat">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 21s-7-4.35-7-10a4 4 0 017-2 4 4 0 017 2c0 5.65-7 10-7 10z" />
          </svg>
          ${item.likes ?? 0}
        </div>
        <div class="work-stat">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 6h14l-2 9H7L6 6z" />
            <path d="M6 6l-2-3H2" />
          </svg>
          ${item.carts ?? 0}
        </div>
      `;

      const del = document.createElement("button");
      del.className = "work-delete";
      del.type = "button";
      del.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
        </svg>
      `;
      del.addEventListener("click", (event) => {
        event.stopPropagation();
        popup?.confirm(
          "Remove this item from My Works?",
          () => {
            const updated = loadWorks().filter((work) => work.id !== item.id);
            saveWorks(updated);
            renderWorks();
            window.LikhaActivity?.log({
              type: "work-remove",
              message: `Removed ${item.title || "product"} from My Works`,
              item,
            });
          },
          { title: "Remove item", confirmText: "Yes", cancelText: "No" }
        );
      });

      card.addEventListener("click", (event) => {
        if (event.target.closest(".work-delete")) return;
        openInfoModal(item);
      });

      card.appendChild(img);
      card.appendChild(stats);
      card.appendChild(del);
      grid.appendChild(card);
    });
  };

  const setPreview = (box, img, src) => {
    if (!box || !img) return;
    img.src = src;
    box.classList.add("has-preview");
  };

  if (previewInput && previewBox && previewImage) {
    previewInput.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        popup?.error("Please upload an image file for the product preview.", {
          title: "Invalid image",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(previewBox, previewImage, reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  processInputs.forEach((input) => {
    const box = input.closest(".upload-box");
    const img = box?.querySelector("img");
    if (!box || !img) return;
    input.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        popup?.error("Please upload a valid process image.", {
          title: "Invalid image",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(box, img, reader.result);
      };
      reader.readAsDataURL(file);
    });
  });

  if (openBtn) {
    openBtn.addEventListener("click", () => openModal(modal));
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => closeModal(modal));
  }

  document.querySelectorAll("[data-work-info-close]").forEach((button) => {
    button.addEventListener("click", () => closeModal(infoModal));
  });

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal(modal);
  });

  infoModal?.addEventListener("click", (event) => {
    if (event.target === infoModal) closeModal(infoModal);
  });

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const title = titleInput?.value.trim();
      const description = descInput?.value.trim();
      if (!title || !description) {
        popup?.error("Please add an item type and description before publishing.", {
          title: "Validation needed",
        });
        return;
      }

      const newItem = {
        id: `work_${Date.now()}`,
        title,
        category: categoryInput?.value || "Accessories",
        price: priceInput?.value ? `₱${priceInput.value}` : "₱0",
        description,
        image: previewImage?.src
          ? previewImage.src
          : "assets/images/accessories/a.2.jpg",
        process: Array.from(document.querySelectorAll(".process-upload img"))
          .map((img) => img.src)
          .filter((src) => src && src.startsWith("data:")),
        likes: 0,
        carts: 0,
        size: ["", "tall", "wide"][Math.floor(Math.random() * 3)],
      };
      const updated = [newItem, ...loadWorks()];
      saveWorks(updated);
      renderWorks();
      window.LikhaActivity?.log({
        type: "work-add",
        message: `Added new product: ${newItem.title}`,
        item: newItem,
      });
      popup?.success("Your product has been published successfully.", {
        title: "Published",
        autoClose: 1400,
      });
      form.reset();
      previewBox?.classList.remove("has-preview");
      previewImage?.removeAttribute("src");
      document
        .querySelectorAll(".process-upload .upload-box")
        .forEach((box) => box.classList.remove("has-preview"));
      document
        .querySelectorAll(".process-upload img")
        .forEach((img) => img.removeAttribute("src"));
      closeModal(modal);
    });
  }

  renderWorks();
});
