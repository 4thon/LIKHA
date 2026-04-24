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

  const clone = (value) => {
    if (value === undefined) return value;
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (error) {
      return value;
    }
  };

  const storeApi = {
    get(key) {
      const data = readStore();
      return data[key];
    },
    set(key, value) {
      const data = readStore();
      data[key] = value;
      writeStore(data);
      return value;
    },
    remove(key) {
      const data = readStore();
      delete data[key];
      writeStore(data);
    },
    getAll() {
      return clone(readStore());
    },
    setAll(value) {
      writeStore(value && typeof value === "object" ? clone(value) : {});
    },
    keys() {
      return Object.keys(readStore());
    },
    clear() {
      writeStore({});
    },
  };

  const ACCOUNT_KEY = "likhaAccounts";
  const SESSION_KEY = "likhaSession";
  const PROFILE_KEY = "likhaProfileData";

  const normalizeEmail = (value = "") => String(value).trim().toLowerCase();
  const normalizePhone = (value = "") =>
    String(value)
      .replace(/[^\d+]/g, "")
      .trim();

  const getAccounts = () => {
    const accounts = storeApi.get(ACCOUNT_KEY);
    return Array.isArray(accounts) ? accounts : [];
  };

  const saveAccounts = (accounts) => {
    storeApi.set(ACCOUNT_KEY, Array.isArray(accounts) ? accounts : []);
  };

  const findAccountByEmail = (email) =>
    getAccounts().find(
      (account) => normalizeEmail(account.email) === normalizeEmail(email)
    );

  const findAccountByPhone = (phone) =>
    getAccounts().find(
      (account) => normalizePhone(account.phone) === normalizePhone(phone)
    );

  const findAccountById = (id) =>
    getAccounts().find((account) => account.id === id);

  const upsertAccount = (account) => {
    const accounts = getAccounts();
    const snapshot = clone(account);
    const index = accounts.findIndex((entry) => entry.id === snapshot.id);
    if (index >= 0) {
      accounts[index] = { ...accounts[index], ...snapshot };
    } else {
      accounts.unshift(snapshot);
    }
    saveAccounts(accounts);
    return snapshot;
  };

  const setCurrentUser = (account) => {
    if (!account) return null;
    const session = {
      userId: account.id,
      email: account.email,
      loggedInAt: Date.now(),
    };
    storeApi.set(SESSION_KEY, session);
    sessionStorage.setItem("likhaLoggedIn", "true");
    sessionStorage.setItem("likhaSessionUserId", account.id);
    if (
      typeof window.name === "string" &&
      window.name.indexOf("likhaLoggedIn=true") === -1
    ) {
      window.name = `${window.name} likhaLoggedIn=true`.trim();
    } else if (typeof window.name !== "string") {
      window.name = "likhaLoggedIn=true";
    }
    return session;
  };

  const clearSession = () => {
    storeApi.remove(SESSION_KEY);
    sessionStorage.removeItem("likhaLoggedIn");
    sessionStorage.removeItem("likhaSessionUserId");
    if (typeof window.name === "string") {
      window.name = window.name.replace("likhaLoggedIn=true", "").trim();
    }
  };

  const getCurrentSession = () => {
    const session = storeApi.get(SESSION_KEY);
    if (session && session.userId) return session;
    const userId = sessionStorage.getItem("likhaSessionUserId");
    if (userId) {
      return {
        userId,
        email: findAccountById(userId)?.email || "",
      };
    }
    return null;
  };

  const getCurrentUser = () => {
    const session = getCurrentSession();
    if (!session) return null;
    return (
      findAccountById(session.userId) ||
      findAccountByEmail(session.email) ||
      null
    );
  };

  const isLoggedIn = () => Boolean(getCurrentUser());

  const saveProfile = (profile) => {
    const current = getCurrentUser();
    const normalized = {
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      email: profile.email || current?.email || "",
      tel: profile.tel || "",
      address: profile.address || "",
      bio: profile.bio || "",
      avatar: profile.avatar || current?.avatar || "",
      handle: profile.handle || current?.handle || "",
    };
    storeApi.set(PROFILE_KEY, normalized);
    storeApi.set("likhaProfileComplete", true);
    storeApi.set("likhaNeedsProfile", false);
    if (current) {
      upsertAccount({
        ...current,
        name:
          [normalized.firstName, normalized.lastName]
            .filter(Boolean)
            .join(" ") || current.name || "",
        email: normalized.email || current.email,
        phone: normalized.tel || current.phone || "",
        avatar: normalized.avatar || current.avatar || "",
        profile: normalized,
        profileComplete: true,
      });
    }
    return normalized;
  };

  const setProfileAvatar = (avatar) => {
    const profile = storeApi.get(PROFILE_KEY) || {};
    const updated = { ...profile, avatar: avatar || "" };
    storeApi.set(PROFILE_KEY, updated);
    const current = getCurrentUser();
    if (current) {
      upsertAccount({
        ...current,
        avatar: avatar || current.avatar || "",
        profile: { ...(current.profile || {}), avatar: avatar || "" },
      });
    }
    return updated;
  };

  window.LikhaStore = storeApi;
  window.LikhaAuth = {
    normalizeEmail,
    normalizePhone,
    getAccounts,
    saveAccounts,
    findAccountByEmail,
    findAccountByPhone,
    findAccountById,
    upsertAccount,
    setCurrentUser,
    clearSession,
    getCurrentUser,
    getCurrentSession,
    isLoggedIn,
    saveProfile,
    setProfileAvatar,
  };
})();
