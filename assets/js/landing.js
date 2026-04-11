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
  const $cards = $(".gallery-card");
  const windowBottom = $(window).scrollTop() + $(window).height() - 40;

  $cards.each(function () {
    const $card = $(this);
    if ($card.hasClass("is-visible")) return;
    if ($card.offset().top < windowBottom) {
      $card.addClass("is-visible");
    }
  });
};

updateTopbar();
window.addEventListener("scroll", updateTopbar, { passive: true });

$(document).ready(() => {
  revealCards();
  $(window).on("scroll", revealCards);
});
