document.addEventListener("DOMContentLoaded", () => {
  const stacks = document.querySelectorAll(".media-stack.auto-morph");
  if (!stacks.length) return;

  const basePath = window.location.pathname.includes("/pages/")
    ? "../assets"
    : "assets";

  const sequences = [
    {
      primary: `${basePath}/images/products/crochetbag.jpg`,
      secondary: `${basePath}/images/products/crochet.jpg`,
      primaryAlt: "Red crochet bag",
      secondaryAlt: "Crochet pouch set",
      label: "Accessories",
      heartIndex: 0,
    },
    {
      primary: `${basePath}/images/clothing/c4.jpg`,
      secondary: `${basePath}/images/clothing/c10.jpg`,
      primaryAlt: "Crochet clothing set",
      secondaryAlt: "Handmade crochet outfit",
      label: "Clothing",
      heartIndex: 1,
    },
    {
      primary: `${basePath}/images/accessories/a.12.jpg`,
      secondary: `${basePath}/images/products/bracelet.jpg`,
      primaryAlt: "Handmade necklace",
      secondaryAlt: "Star bracelet",
      label: "Jewelries",
      heartIndex: 2,
    },
  ];

  const applySet = (primaryImg, secondaryImg, titleSpan, hearts, set) => {
    primaryImg.src = set.primary;
    secondaryImg.src = set.secondary;
    if (set.primaryAlt) primaryImg.alt = set.primaryAlt;
    if (set.secondaryAlt) secondaryImg.alt = set.secondaryAlt;
    if (titleSpan && set.label) {
      titleSpan.textContent = set.label;
    }
    if (hearts && hearts.length) {
      hearts.forEach((heart) => {
        heart.classList.remove("filled", "pulse");
      });
      const index = Number.isInteger(set.heartIndex) ? set.heartIndex : 0;
      const target = hearts[index] || hearts[0];
      if (target) {
        target.classList.add("filled", "pulse");
        setTimeout(() => target.classList.remove("pulse"), 600);
      }
    }
  };

  stacks.forEach((stack) => {
    const primaryImg = stack.querySelector(".media-card.primary img");
    const secondaryImg = stack.querySelector(".media-card.secondary img");
    const authMedia = stack.closest(".auth-media");
    const titleSpan = authMedia?.querySelector(".media-title span");
    const hearts = authMedia?.querySelectorAll(".media-hearts .heart");
    if (!primaryImg || !secondaryImg) return;

    stack.classList.add("is-scripted");

    let index = parseInt(stack.dataset.start, 10);
    if (Number.isNaN(index)) index = 0;
    index = ((index % sequences.length) + sequences.length) % sequences.length;

    applySet(primaryImg, secondaryImg, titleSpan, hearts, sequences[index]);

    const interval = parseInt(stack.dataset.interval, 10) || 5200;
    const morphDuration = 900;

    setInterval(() => {
      stack.classList.add("morph-out");
      setTimeout(() => {
        index = (index + 1) % sequences.length;
        applySet(primaryImg, secondaryImg, titleSpan, hearts, sequences[index]);
        stack.classList.remove("morph-out");
      }, morphDuration);
    }, interval);
  });
});
