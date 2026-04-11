(() => {
  const store = window.LikhaStore;
  if (!store) return;

  const KEY = "likhaActivities";
  const MAX_ITEMS = 40;

  const load = () => store.get(KEY) || [];
  const save = (items) => store.set(KEY, items);

  const log = (entry = {}) => {
    const items = load();
    const record = {
      id: `act_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type: entry.type || "activity",
      message: entry.message || "New activity",
      createdAt: entry.createdAt || Date.now(),
      item: entry.item || null,
    };
    items.unshift(record);
    save(items.slice(0, MAX_ITEMS));
    window.dispatchEvent(new CustomEvent("likha:activity", { detail: record }));
  };

  const formatLikeMessage = (item, liked) => {
    const title = item?.title || "item";
    return liked ? `Liked ${title}` : `Removed like from ${title}`;
  };

  const previousToggle = window.onLikeToggle;
  window.onLikeToggle = (payload) => {
    if (typeof previousToggle === "function") {
      previousToggle(payload);
    }
    if (!payload?.item) return;
    log({
      type: payload.liked ? "like" : "unlike",
      message: formatLikeMessage(payload.item, payload.liked),
      item: payload.item,
    });
  };

  window.LikhaActivity = {
    log,
    getAll: load,
  };
})();
