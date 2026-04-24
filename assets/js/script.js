const heartFilled = "\u2665";
const heartOutline = "\u2661";
const LIKE_STORAGE_KEY = "likhaLikedItems";
const store = window.LikhaStore;

const loadLikes = () => store?.get(LIKE_STORAGE_KEY) || {};

const saveLikes = (likes) => {
  store?.set(LIKE_STORAGE_KEY, likes);
};

const normalizeSrc = (src = "") => {
  let cleaned = src.replace(window.location.origin, "");
  cleaned = cleaned.replace(/^(\.\.\/)+/, "");
  cleaned = cleaned.replace(/^(\.\/)+/, "");
  return cleaned;
};

const extractItemData = (button) => {
  const card = button.closest(".gallery-card, .card, .item-card");
  if (!card) return null;
  const image = card.querySelector("img");
  const imageSrc = normalizeSrc(
    image?.getAttribute("src") || image?.src || ""
  );

  const titleNode =
    card.querySelector(".card-title") ||
    card.querySelector(".overlay strong");
  const title = titleNode ? titleNode.textContent.trim() : "Handmade Item";

  const makerNode =
    card.querySelector(".maker") || card.querySelector(".overlay span");
  let maker = makerNode ? makerNode.textContent.trim() : "";
  maker = maker.replace(/^by\s+/i, "");

  let price = "";
  const priceNode =
    card.querySelector(".price") ||
    card.querySelector(".overlay strong:last-of-type");
  if (priceNode) {
    price = priceNode.textContent.trim();
  }

  let category =
    card.dataset.category || document.body.dataset.category || "Featured";
  if (!card.dataset.category && !document.body.dataset.category && imageSrc) {
    if (imageSrc.includes("accessories")) category = "Accessories";
    else if (imageSrc.includes("clothing")) category = "Clothing";
    else if (imageSrc.includes("home-decor")) category = "Home & Decor";
    else if (imageSrc.includes("products")) category = "Jewelry";
  }

  const id = card.dataset.id || imageSrc || title;
  return {
    id,
    title,
    maker,
    price,
    image: imageSrc,
    category,
  };
};

const applyLikeState = (button, liked) => {
  button.classList.toggle("active", liked);
  button.textContent = liked ? heartFilled : heartOutline;
  button.setAttribute("aria-pressed", liked ? "true" : "false");
};

const initLikeButtons = (scope = document) => {
  const likes = loadLikes();
  const buttons = scope.querySelectorAll(".like");
  buttons.forEach((button) => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";

    const item = extractItemData(button);
    if (item && likes[item.id]) {
      applyLikeState(button, true);
    } else {
      applyLikeState(button, false);
    }

    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const itemData = extractItemData(button);
      if (!itemData) return;
      const liked = !button.classList.contains("active");
      applyLikeState(button, liked);
      if (liked) {
        button.classList.add("pulse");
        setTimeout(() => button.classList.remove("pulse"), 450);
      }
      const updatedLikes = loadLikes();
      if (liked) {
        updatedLikes[itemData.id] = itemData;
      } else {
        delete updatedLikes[itemData.id];
      }
      saveLikes(updatedLikes);
      if (typeof window.onLikeToggle === "function") {
        window.onLikeToggle({
          button,
          liked,
          item: itemData,
        });
      }
    });
  });
};

window.initLikeButtons = initLikeButtons;
initLikeButtons();

const form = document.getElementById("contactForm");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.elements["name"].value || "Guest";
    if (window.LikhaPopup) {
      window.LikhaPopup.success(`Thanks, ${name}! We'll get back to you soon.`, {
        title: "Message sent",
        autoClose: 1400,
      });
    }
    form.reset();
  });
}

const topbar = document.getElementById("topbar");
const updateTopbar = () => {
  if (!topbar) return;
  if (window.scrollY > 10) {
    topbar.classList.add("scrolled");
  } else {
    topbar.classList.remove("scrolled");
  }
};

updateTopbar();
window.addEventListener("scroll", updateTopbar, { passive: true });

const DASHBOARD_RETURN_KEY = "likhaShowDashboardBackLink";
const DASHBOARD_RETURN_PAGES = new Set([
  "accessories.html",
  "jewelry.html",
  "clothing.html",
  "home-decor.html",
  "item.html",
]);

const getPageName = () => {
  const path = window.location.pathname.replace(/\\/g, "/").toLowerCase();
  return path.split("/").pop() || "";
};

const markDashboardReturn = () => {
  sessionStorage.setItem(DASHBOARD_RETURN_KEY, "true");
};

const ensureDashboardLink = () => {
  if (sessionStorage.getItem(DASHBOARD_RETURN_KEY) !== "true") return;
  if (!DASHBOARD_RETURN_PAGES.has(getPageName())) return;

  const nav = document.querySelector(".topbar .nav");
  if (!nav || nav.querySelector(".dashboard-link")) return;

  const link = document.createElement("a");
  link.href = "dashboard.html";
  link.textContent = "Dashboard";
  link.className = "dashboard-link";
  nav.insertBefore(link, nav.firstChild);
};

if (document.querySelector(".dashboard")) {
  document
    .querySelectorAll(
      '.dashboard .nav a[href$="accessories.html"], .dashboard .nav a[href$="jewelry.html"], .dashboard .nav a[href$="clothing.html"], .dashboard .nav a[href$="home-decor.html"]'
    )
    .forEach((link) => {
      link.addEventListener("click", markDashboardReturn);
    });
}

ensureDashboardLink();
