document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("artistGrid");
  if (!grid || !window.LIKHA_ARTISTS) return;

  grid.innerHTML = "";

  window.LIKHA_ARTISTS.forEach((artist) => {
    const card = document.createElement("a");
    card.className = "artist-card";
    card.href = `artist.html?artist=${artist.id}`;

    card.innerHTML = `
      <div class="artist-avatar">
        <img src="../${artist.avatar}" alt="${artist.name}" />
      </div>
      <div class="artist-meta">
        <h3>${artist.name}</h3>
        <p class="artist-handle">${artist.handle}</p>
        <p class="artist-craft">${artist.craft}</p>
      </div>
    `;

    grid.appendChild(card);
  });
});
