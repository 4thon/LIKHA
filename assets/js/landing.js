const landingTopbar = document.getElementById("topbar");

const updateTopbar = () => {
  if (!landingTopbar) return;
  if (window.scrollY > 10) {
    landingTopbar.classList.add("scrolled");
  } else {
    landingTopbar.classList.remove("scrolled");
  }
};

const revealCards = () => {
  const cards = Array.from(document.querySelectorAll(".gallery-card"));
  const windowBottom = window.scrollY + window.innerHeight - 40;

  cards.forEach((card) => {
    if (card.classList.contains("is-visible")) return;
    const rect = card.getBoundingClientRect();
    const cardTop = rect.top + window.scrollY;
    if (cardTop < windowBottom) {
      card.classList.add("is-visible");
    }
  });
};

const initLanding = () => {
  document.documentElement.classList.add("js-enabled");
  updateTopbar();
  revealCards();
  window.addEventListener("scroll", updateTopbar, { passive: true });
  window.addEventListener("scroll", revealCards, { passive: true });
  window.addEventListener("resize", revealCards, { passive: true });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLanding);
} else {
  initLanding();
}
