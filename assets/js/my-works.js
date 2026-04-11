document.addEventListener("DOMContentLoaded", () => {
  const store = window.LikhaStore;
  if (!store) return;

  const KEY = "likhaMyWorks";
  const grid = document.getElementById("worksGrid");
  const modal = document.getElementById("workModal");
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

  const seedItems = [
    {
      id: "work_1",
      title: "Handmade Charms",
      image: "assets/images/accessories/a.3.jpg",
      likes: 125,
      carts: 87,
      size: "wide",
    },
    {
      id: "work_2",
      title: "Beaded Necklace",
      image: "assets/images/products/handmadenecklace.jpg",
      likes: 231,
      carts: 101,
      size: "tall",
    },
    {
      id: "work_3",
      title: "Beaded Curtain",
      image: "assets/images/home-decor/hd7.jpg",
      likes: 123,
      carts: 69,
      size: "tall",
    },
    {
      id: "work_4",
      title: "Crochet Cardigan",
      image: "assets/images/clothing/c3.jpg",
      likes: 23,
      carts: 62,
      size: "tall",
    },
    {
      id: "work_5",
      title: "Crochet Accessories",
      image: "assets/images/clothing/c12.jpg",
      likes: 112,
      carts: 54,
      size: "",
    },
    {
      id: "work_6",
      title: "Handmade Keychains",
      image: "assets/images/accessories/a.4.jpg",
      likes: 121,
      carts: 87,
      size: "",
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

  const renderWorks = () => {
    if (!grid) return;
    const items = loadWorks();
    grid.innerHTML = "";
    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = `work-card ${item.size || ""}`.trim();
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
          ${item.likes}
        </div>
        <div class="work-stat">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 6h14l-2 9H7L6 6z" />
            <path d="M6 6l-2-3H2" />
          </svg>
          ${item.carts}
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
      del.addEventListener("click", () => {
        if (!confirm("Remove this item?")) return;
        const updated = loadWorks().filter((work) => work.id !== item.id);
        saveWorks(updated);
        renderWorks();
        if (window.LikhaActivity) {
          window.LikhaActivity.log({
            type: "work-remove",
            message: `Removed ${item.title || "product"} from My Works`,
            item,
          });
        }
      });

      card.appendChild(img);
      card.appendChild(stats);
      card.appendChild(del);
      grid.appendChild(card);
    });
  };

  const openModal = () => {
    if (!modal) return;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
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
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(box, img, reader.result);
      };
      reader.readAsDataURL(file);
    });
  });

  if (openBtn) {
    openBtn.addEventListener("click", openModal);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const title = titleInput?.value.trim();
      if (!title) {
        alert("Please add an item type.");
        return;
      }
      const newItem = {
        id: `work_${Date.now()}`,
        title,
        category: categoryInput?.value || "Accessories",
        price: priceInput?.value ? `₱${priceInput.value}` : "₱0",
        description: descInput?.value || "",
        image: previewImage?.src
          ? previewImage.src
          : "assets/images/accessories/a.2.jpg",
        process: Array.from(
          document.querySelectorAll(".process-upload img")
        )
          .map((img) => img.src)
          .filter((src) => src && src.startsWith("data:")),
        likes: Math.floor(20 + Math.random() * 150),
        carts: Math.floor(10 + Math.random() * 80),
        size: ["", "tall", "wide"][Math.floor(Math.random() * 3)],
      };
      const updated = [newItem, ...loadWorks()];
      saveWorks(updated);
      renderWorks();
      if (window.LikhaActivity) {
        window.LikhaActivity.log({
          type: "work-add",
          message: `Added new product: ${newItem.title}`,
          item: newItem,
        });
      }
      form.reset();
      previewBox?.classList.remove("has-preview");
      previewImage?.removeAttribute("src");
      document
        .querySelectorAll(".process-upload .upload-box")
        .forEach((box) => box.classList.remove("has-preview"));
      document
        .querySelectorAll(".process-upload img")
        .forEach((img) => img.removeAttribute("src"));
      closeModal();
    });
  }

  renderWorks();
});
