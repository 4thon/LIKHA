document.addEventListener("DOMContentLoaded", () => {
  const store = window.LikhaStore;
  const needsProfile =
    sessionStorage.getItem("likhaNeedsProfile") === "true" ||
    (store && !store.get("likhaProfileComplete"));

  const content = document.querySelector(".content");
  const settingsCard = document.querySelector(".settings-card");

  const headerTitle = document.getElementById("profileHeaderTitle");
  const headerSubtitle = document.getElementById("profileHeaderSubtitle");

  const inputMap = {
    firstName: document.getElementById("profileFirstName"),
    lastName: document.getElementById("profileLastName"),
    email: document.getElementById("profileEmailInput"),
    tel: document.getElementById("profileTelInput"),
    address: document.getElementById("profileAddressInput"),
    addressConfirm: document.getElementById("profileAddressConfirm"),
    password: document.getElementById("profilePassword"),
    passwordConfirm: document.getElementById("profilePasswordConfirm"),
  };

  const outputMap = {
    handle: document.getElementById("profileHandle"),
    email: document.getElementById("profileEmail"),
    name: document.getElementById("profileName"),
    emailInfo: document.getElementById("profileEmailInfo"),
    telInfo: document.getElementById("profileTelInfo"),
    address: document.getElementById("profileAddress"),
    bio: document.getElementById("profileBio"),
  };

  const loadProfile = () => store?.get("likhaProfileData") || {};

  const buildHandle = (profile) => {
    if (profile.handle) return profile.handle;
    const base =
      profile.firstName || profile.lastName || profile.email?.split("@")[0];
    return base ? `@${base.toLowerCase().replace(/\s+/g, "")}` : "@likhauser";
  };

  const renderProfile = (profile = {}) => {
    const fullName = [profile.firstName, profile.lastName]
      .filter(Boolean)
      .join(" ");
    if (outputMap.handle) outputMap.handle.textContent = buildHandle(profile);
    if (outputMap.email)
      outputMap.email.textContent = profile.email || "user@email.com";
    if (outputMap.name) outputMap.name.textContent = fullName || "Your name";
    if (outputMap.emailInfo)
      outputMap.emailInfo.textContent = profile.email || "-";
    if (outputMap.telInfo) outputMap.telInfo.textContent = profile.tel || "-";
    if (outputMap.address)
      outputMap.address.textContent = profile.address || "-";
    if (outputMap.bio) outputMap.bio.textContent = profile.bio || "Tell us about you.";
  };

  const fillForm = (profile = {}) => {
    if (inputMap.firstName) inputMap.firstName.value = profile.firstName || "";
    if (inputMap.lastName) inputMap.lastName.value = profile.lastName || "";
    if (inputMap.email) inputMap.email.value = profile.email || "";
    if (inputMap.tel) inputMap.tel.value = profile.tel || "";
    if (inputMap.address) inputMap.address.value = profile.address || "";
    if (inputMap.addressConfirm)
      inputMap.addressConfirm.value = profile.address || "";
  };

  const currentProfile = loadProfile();
  fillForm(currentProfile);
  renderProfile(currentProfile);

  if (needsProfile && content) {
    document.body.classList.add("profile-setup");
    const banner = document.createElement("div");
    banner.className = "setup-banner";
    banner.innerHTML = `
      <div>
        <strong>Complete your profile</strong>
        <span>Fill in your details to finish setting up your account.</span>
      </div>
    `;
    content.prepend(banner);
    content.classList.add("setup-active");
    if (headerTitle) headerTitle.textContent = "Complete Profile";
    if (headerSubtitle)
      headerSubtitle.textContent =
        "Please complete your details before using the dashboard.";
    if (settingsCard) {
      settingsCard.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const completeProfile = () => {
    const profile = {
      firstName: inputMap.firstName?.value.trim() || "",
      lastName: inputMap.lastName?.value.trim() || "",
      email: inputMap.email?.value.trim() || "",
      tel: inputMap.tel?.value.trim() || "",
      address: inputMap.address?.value.trim() || "",
      bio: currentProfile.bio || "Likha creator",
    };

    if (!profile.firstName || !profile.lastName || !profile.email || !profile.tel) {
      alert("Please complete your name, email, and phone number.");
      return;
    }

    if (inputMap.addressConfirm?.value.trim() !== profile.address) {
      alert("Address confirmation does not match.");
      return;
    }

    if (store) {
      store.set("likhaProfileData", profile);
      store.set("likhaProfileComplete", true);
    } else {
      localStorage.setItem("likhaProfileData", JSON.stringify(profile));
      localStorage.setItem("likhaProfileComplete", "true");
    }

    sessionStorage.removeItem("likhaNeedsProfile");
    document.body.classList.remove("profile-setup");
    const banner = document.querySelector(".setup-banner");
    if (banner) banner.remove();
    content?.classList.remove("setup-active");
    if (headerTitle) headerTitle.textContent = "Profile Settings";
    if (headerSubtitle)
      headerSubtitle.textContent = "Keep your artist information up to date.";

    renderProfile(profile);
  };

  document.querySelectorAll("[data-save-profile]").forEach((button) => {
    button.addEventListener("click", completeProfile);
  });
});
