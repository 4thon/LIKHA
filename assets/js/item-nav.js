(() => {
  const store = window.LikhaStore;
  const ACTIVE_KEY = "likhaActiveItem";

  const normalizeSrc = (src = "") => {
    let cleaned = src.replace(window.location.origin, "");
    cleaned = cleaned.replace(/^(\.\.\/)+/, "");
    cleaned = cleaned.replace(/^(\.\/)+/, "");
    return cleaned;
  };

  const extractCardData = (card) => {
    const image = card.querySelector("img");
    const imageSrc = normalizeSrc(image?.getAttribute("src") || image?.src || "");
    const titleNode =
      card.querySelector(".overlay strong") || card.querySelector(".card-title");
    const title = titleNode ? titleNode.textContent.trim() : "Handmade Item";
    const makerNode =
      card.querySelector(".overlay span") || card.querySelector(".maker");
    let maker = makerNode ? makerNode.textContent.trim() : "";
    maker = maker.replace(/^by\s+/i, "");
    const priceNode =
      card.querySelector(".overlay strong:last-of-type") ||
      card.querySelector(".price");
    const price = priceNode ? priceNode.textContent.trim() : "";
    const category = card.dataset.category || document.body.dataset.category || "Accessories";
    const id = card.dataset.id || imageSrc || title;
    return {
      id,
      title,
      maker,
      price,
      image: imageSrc,
      category,
      description: "Kindly email the design you want based on the picture.",
    };
  };

  document.addEventListener("click", (event) => {
    const likeBtn = event.target.closest(".like");
    if (likeBtn) return;
    const card = event.target.closest(".card, .gallery-card, .liked-card");
    if (!card) return;
    if (!card.querySelector(".overlay, .card-details, .card-title")) return;
    const data = extractCardData(card);
    if (store && data) {
      store.set(ACTIVE_KEY, data);
    }
    const inPages = window.location.pathname.toLowerCase().includes("/pages/");
    const target = inPages ? "item.html" : "pages/item.html";
    window.location.href = target;
  });
})();
