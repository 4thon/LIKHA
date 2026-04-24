document.addEventListener("DOMContentLoaded", () => {
  const categorySelect = document.getElementById("commissionCategory");
  const preview = document.getElementById("commissionPreview");
  const referenceInput = document.getElementById("referenceImage");
  const referenceFileInput = document.getElementById("referenceImageInput");
  if (!categorySelect || !preview) return;

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

  const setPreview = (src, label = "Reference image") => {
    preview.src = src;
    preview.alt = label;
    if (referenceInput) referenceInput.value = src;
  };

  const buildDefaultPreview = (category) => {
    const items = categories[category] || [];
    if (!items.length) return;
    setPreview(items[0].src, items[0].label);
  };

  buildDefaultPreview(categorySelect.value);

  categorySelect.addEventListener("change", () => {
    buildDefaultPreview(categorySelect.value);
    if (referenceFileInput) {
      referenceFileInput.value = "";
    }
  });

  if (referenceFileInput) {
    referenceFileInput.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        if (window.LikhaPopup) {
          window.LikhaPopup.error("Please upload a valid image file.", {
            title: "Invalid image",
          });
        }
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result, file.name);
      };
      reader.readAsDataURL(file);
    });
  }
});
