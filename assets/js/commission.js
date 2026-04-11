document.addEventListener("DOMContentLoaded", () => {
  const categorySelect = document.getElementById("commissionCategory");
  const pickerGrid = document.getElementById("itemPickerGrid");
  const preview = document.getElementById("commissionPreview");
  const referenceInput = document.getElementById("referenceImage");
  if (!categorySelect || !pickerGrid || !preview) return;

  const basePath = "../assets/images";
  const categories = {
    Accessories: [
      { src: `${basePath}/accessories/a.2.jpg`, label: "Accessories" },
      { src: `${basePath}/accessories/a.8.jpg`, label: "Accessories" },
      { src: `${basePath}/accessories/a.9.jpg`, label: "Accessories" },
      { src: `${basePath}/accessories/a.12.jpg`, label: "Accessories" },
      { src: `${basePath}/accessories/a.14.jpg`, label: "Accessories" },
      { src: `${basePath}/accessories/a.16.jpg`, label: "Accessories" },
    ],
    Jewelry: [
      { src: `${basePath}/products/bracelet.jpg`, label: "Bracelet" },
      { src: `${basePath}/products/necklace.jpg`, label: "Necklace" },
      { src: `${basePath}/products/handmadenecklace.jpg`, label: "Necklace" },
      { src: `${basePath}/products/earrings.jpg`, label: "Earrings" },
      { src: `${basePath}/products/claycharms.jpg`, label: "Clay Charms" },
      { src: `${basePath}/products/keychains.jpg`, label: "Keychains" },
    ],
    Clothing: [
      { src: `${basePath}/clothing/c1.jpg`, label: "Clothing" },
      { src: `${basePath}/clothing/c4.jpg`, label: "Clothing" },
      { src: `${basePath}/clothing/c7.jpg`, label: "Clothing" },
      { src: `${basePath}/clothing/c10.jpg`, label: "Clothing" },
      { src: `${basePath}/clothing/c13.jpg`, label: "Clothing" },
      { src: `${basePath}/clothing/c15.jpg`, label: "Clothing" },
    ],
    "Home & Decor": [
      { src: `${basePath}/home-decor/hd1.jpg`, label: "Home Decor" },
      { src: `${basePath}/home-decor/hd5.jpg`, label: "Home Decor" },
      { src: `${basePath}/home-decor/hd7.jpg`, label: "Home Decor" },
      { src: `${basePath}/home-decor/hd10.jpg`, label: "Home Decor" },
      { src: `${basePath}/home-decor/hd12.jpg`, label: "Home Decor" },
      { src: `${basePath}/home-decor/hd15.jpg`, label: "Home Decor" },
    ],
  };

  const closePicker = () => {
    const modal = document.getElementById("itemPickerModal");
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  };

  const buildGrid = (category) => {
    pickerGrid.innerHTML = "";
    const items = categories[category] || [];
    items.forEach((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "picker-item";
      button.innerHTML = `<img src="${item.src}" alt="${item.label}" />`;
      button.addEventListener("click", () => {
        preview.src = item.src;
        preview.alt = item.label;
        if (referenceInput) referenceInput.value = item.src;
        closePicker();
      });
      pickerGrid.appendChild(button);
      if (index === 0) {
        preview.src = item.src;
        preview.alt = item.label;
        if (referenceInput) referenceInput.value = item.src;
      }
    });
  };

  buildGrid(categorySelect.value);

  categorySelect.addEventListener("change", () => {
    buildGrid(categorySelect.value);
  });
});
