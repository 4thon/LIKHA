(() => {
  const store = window.LikhaStore;
  const ACTIVE_KEY = "likhaActiveItem";
  const itemCard = document.getElementById("itemCard");
  if (!itemCard || !store) return;

  const resolveImage = (src = "") => {
    if (!src) return "";
    if (src.startsWith("http") || src.startsWith("data:")) return src;
    const inPages = window.location.pathname.toLowerCase().includes("/pages/");
    const cleaned = src.replace(/^(\.\.\/)+/, "");
    return inPages ? `../${cleaned}` : cleaned;
  };

  const hashNumber = (value) => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash * 31 + value.charCodeAt(i)) % 100000;
    }
    return hash;
  };

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

    return inputTokens.filter((token) => artistTokens.includes(token)).length;
  };

  const getLikeCount = (item) => {
    const base = hashNumber(item.id || item.title || "likha");
    return 80 + (base % 60);
  };

  const defaultItem = {
    id: "likha-default",
    title: "Handmade Crochet Wallet",
    maker: "Alwina Lapuz",
    price: "PHP 80",
    image: "assets/images/accessories/a.2.jpg",
    category: "Accessories",
    description: "Kindly email the design you want based on the picture.",
  };

  const item = { ...(store.get(ACTIVE_KEY) || defaultItem) };
  window.LIKHA_ACTIVE_ITEM = item;

  const imageEl = document.getElementById("itemImage");
  const titleEl = document.getElementById("itemTitle");
  const makerEl = document.getElementById("itemMaker");
  const priceEl = document.getElementById("itemPrice");
  const categoryEl = document.getElementById("itemCategory");
  const descEl = document.getElementById("itemDescription");
  const likesEl = document.getElementById("itemLikes");

  if (imageEl) imageEl.src = resolveImage(item.image);
  if (titleEl) titleEl.textContent = item.title;
  if (makerEl) makerEl.textContent = item.maker;
  if (priceEl) priceEl.textContent = item.price;
  if (categoryEl) categoryEl.textContent = item.category;
  if (descEl) descEl.textContent = item.description;
  if (likesEl) likesEl.textContent = getLikeCount(item);

  itemCard.dataset.id = item.id;
  itemCard.dataset.category = item.category;

  const processSets = {
    Accessories: [
      "assets/images/accessories/a.1.jpg",
      "assets/images/accessories/a.2.jpg",
      "assets/images/accessories/a.3.jpg",
      "assets/images/accessories/a.4.jpg",
      "assets/images/accessories/a.5.jpg",
      "assets/images/accessories/a.6.jpg",
      "assets/images/accessories/a.7.jpg",
      "assets/images/accessories/a.8.jpg",
    ],
    Jewelry: [
      "assets/images/products/necklace.jpg",
      "assets/images/products/handmadenecklace.jpg",
      "assets/images/products/bracelet.jpg",
      "assets/images/products/earrings.jpg",
      "assets/images/products/claycharms.jpg",
      "assets/images/accessories/a.12.jpg",
      "assets/images/accessories/a.13.jpg",
      "assets/images/accessories/a.14.jpg",
    ],
    Clothing: [
      "assets/images/clothing/c1.jpg",
      "assets/images/clothing/c2.jpg",
      "assets/images/clothing/c3.jpg",
      "assets/images/clothing/c4.jpg",
      "assets/images/clothing/c5.jpg",
      "assets/images/clothing/c6.jpg",
      "assets/images/clothing/c7.jpg",
      "assets/images/clothing/c8.jpg",
    ],
    "Home & Decor": [
      "assets/images/home-decor/hd1.jpg",
      "assets/images/home-decor/hd2.jpg",
      "assets/images/home-decor/hd3.jpg",
      "assets/images/home-decor/hd4.jpg",
      "assets/images/home-decor/hd5.jpg",
      "assets/images/home-decor/hd6.jpg",
      "assets/images/home-decor/hd7.jpg",
      "assets/images/home-decor/hd8.jpg",
    ],
  };

  const gallery = processSets[item.category] || processSets.Accessories;
  const grid = document.getElementById("processGrid");
  if (grid) {
    grid.innerHTML = "";
    gallery.forEach((src, index) => {
      const card = document.createElement("div");
      card.className = "process-card";
      const img = document.createElement("img");
      img.src = resolveImage(src);
      img.alt = `Process step ${index + 1}`;
      const label = document.createElement("span");
      label.textContent = index + 1;
      card.appendChild(img);
      card.appendChild(label);
      grid.appendChild(card);
    });
  }

  const artists = window.LIKHA_ARTISTS || [];
  const makerName = item.maker || "";
  let match = null;
  let bestScore = 0;

  artists.forEach((artist) => {
    const score = scoreNameMatch(makerName, artist.name || "");
    if (score > bestScore) {
      bestScore = score;
      match = artist;
    }
  });

  if (match && bestScore >= 1) {
    item.artistId = match.id;
    item.artistName = match.name;
    window.LIKHA_ACTIVE_ITEM = item;
    store.set(ACTIVE_KEY, item);
  }

  const quickCommissionArtist = document.getElementById("quickCommissionArtist");
  const quickCommissionItem = document.getElementById("quickCommissionItem");
  if (quickCommissionArtist) {
    quickCommissionArtist.value = match?.name || item.maker || "Likha Artist";
  }
  if (quickCommissionItem) {
    quickCommissionItem.value = item.title || "Handmade Item";
  }
})();
