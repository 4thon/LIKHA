document.addEventListener("DOMContentLoaded", () => {
  const store = window.LikhaStore;
  const auth = window.LikhaAuth;
  const popup = window.LikhaPopup;
  const currentAccount = auth?.getCurrentUser?.();
  const needsProfile =
    sessionStorage.getItem("likhaNeedsProfile") === "true" ||
    Boolean(store && !store.get("likhaProfileComplete"));

  const content = document.querySelector(".content");
  const settingsCard = document.querySelector(".settings-card");

  const headerTitle = document.getElementById("profileHeaderTitle");
  const headerSubtitle = document.getElementById("profileHeaderSubtitle");
  const avatarImage = document.getElementById("profileAvatarImage");
  const avatarInput = document.getElementById("profileAvatarInput");
  const editAvatarBtn = document.getElementById("editProfileAvatar");

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

  const defaultAvatar = "../assets/images/accessories/a.12.jpg";

  const loadProfile = () => {
    const profile = store?.get("likhaProfileData") || {};
    const accountProfile = currentAccount?.profile || {};
    return {
      ...accountProfile,
      ...profile,
      avatar: profile.avatar || accountProfile.avatar || currentAccount?.avatar || defaultAvatar,
      email:
        profile.email ||
        accountProfile.email ||
        currentAccount?.email ||
        "",
    };
  };

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
    if (avatarImage) {
      avatarImage.src = profile.avatar || defaultAvatar;
      avatarImage.alt = profile.firstName || profile.lastName || "Artist profile";
    }
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

  let currentProfile = loadProfile();
  fillForm(currentProfile);
  renderProfile(currentProfile);

  const setAvatar = (avatar) => {
    if (!avatar) return;
    currentProfile = { ...currentProfile, avatar };
    renderProfile({ ...currentProfile, avatar });
    auth?.setProfileAvatar?.(avatar);
    store?.set("likhaProfileData", { ...currentProfile, avatar });
  };

  if (avatarInput) {
    avatarInput.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        popup?.error("Please upload a valid image file for your profile photo.", {
          title: "Invalid image",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(reader.result);
        popup?.success("Profile picture updated successfully.", {
          title: "Photo updated",
          autoClose: 1200,
        });
      };
      reader.readAsDataURL(file);
    });
  }

  if (editAvatarBtn && avatarInput) {
    editAvatarBtn.addEventListener("click", () => {
      avatarInput.click();
    });
  }

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
      avatar: currentProfile.avatar || defaultAvatar,
      handle: currentProfile.handle || buildHandle(currentProfile),
    };
    const password = inputMap.password?.value || "";
    const passwordConfirm = inputMap.passwordConfirm?.value || "";

    if (
      !profile.firstName ||
      !profile.lastName ||
      !profile.email ||
      !profile.tel ||
      !profile.address
    ) {
      popup?.error("Please complete your name, email, phone number, and address.", {
        title: "Profile validation",
      });
      return;
    }

    if (password || passwordConfirm) {
      if (!password || !passwordConfirm) {
        popup?.error("Please fill in both password fields if you want to change your password.", {
          title: "Password validation",
        });
        return;
      }
      if (password !== passwordConfirm) {
        popup?.error("Password confirmation does not match.", {
          title: "Password validation",
        });
        return;
      }
      const account = auth?.getCurrentUser?.();
      if (account) {
        auth?.upsertAccount?.({
          ...account,
          password,
        });
      }
    }

    if (inputMap.addressConfirm?.value.trim() !== profile.address) {
      popup?.error("Address confirmation does not match.", {
        title: "Profile validation",
      });
      return;
    }

    const saved = auth?.saveProfile?.(profile) || profile;
    currentProfile = { ...currentProfile, ...saved };
    store?.set("likhaProfileData", saved);
    store?.set("likhaProfileComplete", true);
    window.LikhaActivity?.log({
      type: "profile-update",
      message: `Updated profile for ${saved.firstName || saved.email || "Likha user"}`,
      item: {
        title: `${saved.firstName || ""} ${saved.lastName || ""}`.trim() || "Profile update",
        maker: saved.email || "Likha User",
        category: "Profile",
      },
    });

    sessionStorage.removeItem("likhaNeedsProfile");
    document.body.classList.remove("profile-setup");
    const banner = document.querySelector(".setup-banner");
    if (banner) banner.remove();
    content?.classList.remove("setup-active");
    if (headerTitle) headerTitle.textContent = "Profile Settings";
    if (headerSubtitle)
      headerSubtitle.textContent = "Keep your artist information up to date.";

    renderProfile(saved);
    fillForm(saved);
    popup?.success("Profile information saved successfully.", {
      title: "Profile saved",
      autoClose: 1400,
    });
  };

  document.querySelectorAll("[data-save-profile]").forEach((button) => {
    button.addEventListener("click", completeProfile);
  });
});
