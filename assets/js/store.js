(() => {
  const STORAGE_KEY = "__likha_store";
  const NAME_PREFIX = "LIKHA_STORE=";

  const safeParse = (value) => {
    if (!value) return {};
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      return {};
    }
  };

  const canLocalStorage = () => {
    try {
      const testKey = "__likha_test";
      localStorage.setItem(testKey, "1");
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  };

  const readWindowName = () => {
    if (!window.name || !window.name.startsWith(NAME_PREFIX)) return {};
    return safeParse(window.name.slice(NAME_PREFIX.length));
  };

  const writeWindowName = (data) => {
    window.name = `${NAME_PREFIX}${JSON.stringify(data)}`;
  };

  const readStore = () => {
    let data = {};
    if (canLocalStorage()) {
      data = safeParse(localStorage.getItem(STORAGE_KEY));
    }
    if (!Object.keys(data).length) {
      data = readWindowName();
    }
    return data;
  };

  const writeStore = (data) => {
    if (canLocalStorage()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    writeWindowName(data);
  };

  window.LikhaStore = {
    get(key) {
      const data = readStore();
      return data[key];
    },
    set(key, value) {
      const data = readStore();
      data[key] = value;
      writeStore(data);
    },
    remove(key) {
      const data = readStore();
      delete data[key];
      writeStore(data);
    },
  };
})();
