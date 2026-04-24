document.addEventListener("DOMContentLoaded", () => {
  const store = window.LikhaStore;
  const summary = document.getElementById("storageSummary");
  const grid = document.getElementById("storageGrid");
  const refreshBtn = document.getElementById("refreshStorage");

  if (!store || !summary || !grid) return;

  const describeValue = (value) => {
    if (Array.isArray(value)) return `${value.length} item(s)`;
    if (value && typeof value === "object") return `${Object.keys(value).length} field(s)`;
    return typeof value;
  };

  const buildSummary = (data) => {
    const entries = Object.entries(data);
    const totalArrays = entries.filter(([, value]) => Array.isArray(value)).length;
    const totalObjects = entries.filter(([, value]) => value && typeof value === "object" && !Array.isArray(value)).length;
    summary.innerHTML = `
      <article class="summary-card">
        <strong>${entries.length}</strong>
        <span>Stored keys</span>
      </article>
      <article class="summary-card">
        <strong>${totalArrays}</strong>
        <span>Arrays</span>
      </article>
      <article class="summary-card">
        <strong>${totalObjects}</strong>
        <span>Objects</span>
      </article>
    `;
  };

  const render = () => {
    const data = store.getAll();
    buildSummary(data);
    grid.innerHTML = "";

    const entries = Object.entries(data);
    if (!entries.length) {
      const empty = document.createElement("div");
      empty.className = "storage-empty";
      empty.textContent = "No stored data yet.";
      grid.appendChild(empty);
      return;
    }

    entries.forEach(([key, value]) => {
      const card = document.createElement("article");
      card.className = "storage-card";
      card.innerHTML = `
        <div class="storage-card-head">
          <div>
            <h2>${key}</h2>
            <p>${describeValue(value)}</p>
          </div>
        </div>
        <pre>${JSON.stringify(value, null, 2)}</pre>
      `;
      grid.appendChild(card);
    });
  };

  refreshBtn?.addEventListener("click", render);
  window.addEventListener("storage", render);
  render();
});
