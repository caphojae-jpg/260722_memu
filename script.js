const categoryNav = document.getElementById("categoryNav");
const menuContainer = document.getElementById("menuContainer");
const promoBannerTrack = document.getElementById("promoBannerTrack");

const BANNER_INTERVAL_MS = 5000;
const LIKE_STORAGE_KEY = "haru-udon-liked-menu-ids";

function loadLikedMenuIds() {
  try {
    const savedIds = JSON.parse(localStorage.getItem(LIKE_STORAGE_KEY));
    if (!Array.isArray(savedIds)) return new Set();

    const menuItemIds = new Set(menuItems.map((item) => item.id));
    return new Set(savedIds.filter((id) => menuItemIds.has(id)));
  } catch {
    return new Set();
  }
}

const likedMenuIds = loadLikedMenuIds();

function formatPrice(price) {
  return `${price.toLocaleString("ko-KR")}원`;
}

function createCategoryButton(id, label, isActive) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = isActive ? "category-btn active" : "category-btn";
  button.dataset.category = id;
  button.textContent = label;
  return button;
}

function renderCategoryNav() {
  categoryNav.appendChild(createCategoryButton("all", "전체", true));

  categories
    .filter((category) => category.visible)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .forEach((category) => {
      const label = `${category.icon} ${category.name}`;
      categoryNav.appendChild(createCategoryButton(category.id, label, false));
    });

  categoryNav.appendChild(
    createCategoryButton("liked", `♥ 좋아요 (${likedMenuIds.size})`, false),
  );
}

function createBadge(label, type) {
  const badge = document.createElement("span");
  badge.className = `menu-badge menu-badge--${type}`;
  badge.textContent = label;
  return badge;
}

function createBadgeRow(item) {
  const badgeRow = document.createElement("div");
  badgeRow.className = "menu-badges";

  if (item.stronglyRecommended) {
    badgeRow.appendChild(createBadge("🔥 강력추천", "strong-recommended"));
  }
  if (item.recommended) badgeRow.appendChild(createBadge("추천", "recommended"));
  if (item.new) badgeRow.appendChild(createBadge("New", "new"));
  if (item.soldOut) badgeRow.appendChild(createBadge("품절", "sold-out"));

  return badgeRow;
}

const MENU_IMAGE_PLACEHOLDER =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23e7ddd0'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='20' text-anchor='middle' dominant-baseline='middle' fill='%238a7a6f'%3E이미지 준비중%3C/text%3E%3C/svg%3E";

function createBannerSlide(slide, isActive) {
  const image = document.createElement("img");
  image.className = isActive ? "promo-banner-slide active" : "promo-banner-slide";
  image.src = slide.image;
  image.alt = slide.alt;
  image.onerror = () => {
    image.onerror = null;
    image.src = MENU_IMAGE_PLACEHOLDER;
  };
  return image;
}

function renderPromoBanner() {
  bannerSlides.forEach((slide, index) => {
    promoBannerTrack.appendChild(createBannerSlide(slide, index === 0));
  });
}

function startPromoBannerAutoplay() {
  const slides = promoBannerTrack.querySelectorAll(".promo-banner-slide");
  if (slides.length <= 1) return;

  let activeIndex = 0;

  setInterval(() => {
    const nextIndex = (activeIndex + 1) % slides.length;
    slides[activeIndex].classList.remove("active");
    slides[nextIndex].classList.add("active");
    activeIndex = nextIndex;
  }, BANNER_INTERVAL_MS);
}

function createMenuImage(item) {
  const image = document.createElement("img");
  image.className = "menu-image";
  image.src = item.image;
  image.alt = item.name;
  image.loading = "lazy";
  image.onerror = () => {
    image.onerror = null;
    image.src = MENU_IMAGE_PLACEHOLDER;
  };
  return image;
}

function updateLikeButton(button, item) {
  const isLiked = likedMenuIds.has(item.id);
  button.classList.toggle("is-liked", isLiked);
  button.setAttribute("aria-pressed", String(isLiked));
  button.setAttribute(
    "aria-label",
    isLiked ? `${item.name} 좋아요 취소` : `${item.name} 좋아요`,
  );

  button.querySelector(".menu-like-icon").textContent = isLiked ? "♥" : "♡";
  button.querySelector(".menu-like-label").textContent = isLiked ? "좋아요 완료" : "좋아요";
}

function createMenuLikeButton(item) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "menu-like-button";
  button.dataset.itemId = item.id;

  const icon = document.createElement("span");
  icon.className = "menu-like-icon";
  icon.setAttribute("aria-hidden", "true");

  const label = document.createElement("span");
  label.className = "menu-like-label";

  button.append(icon, label);
  updateLikeButton(button, item);
  return button;
}

function createMenuCard(item) {
  const card = document.createElement("section");
  card.className = item.soldOut ? "menu-item sold-out" : "menu-item";
  card.dataset.category = item.category;
  card.dataset.itemId = item.id;
  card.classList.toggle("is-liked", likedMenuIds.has(item.id));

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "menu-item-trigger";
  trigger.dataset.itemId = item.id;
  trigger.setAttribute("aria-label", `${item.name} 상세보기`);

  const info = document.createElement("div");
  info.className = "menu-info";

  const name = document.createElement("h2");
  name.className = "menu-name";
  name.textContent = item.name;

  const desc = document.createElement("p");
  desc.className = "menu-desc";
  desc.textContent = item.description;

  const price = document.createElement("span");
  price.className = "menu-price";
  price.textContent = formatPrice(item.price);

  const badgeRow = createBadgeRow(item);
  if (badgeRow.children.length > 0) info.appendChild(badgeRow);
  info.append(name, desc, price);

  trigger.append(createMenuImage(item), info);
  card.append(trigger, createMenuLikeButton(item));
  return card;
}

function renderMenuItems() {
  menuItems.forEach((item) => {
    menuContainer.appendChild(createMenuCard(item));
  });
}

function filterMenuByCategory(category) {
  const cards = menuContainer.querySelectorAll(".menu-item");
  cards.forEach((card) => {
    const matches =
      category === "all" ||
      card.dataset.category === category ||
      (category === "liked" && likedMenuIds.has(card.dataset.itemId));
    card.classList.toggle("hidden", !matches);
  });
}

function updateLikedCategoryButton() {
  const button = categoryNav.querySelector('[data-category="liked"]');
  if (button) button.textContent = `♥ 좋아요 (${likedMenuIds.size})`;
}

function saveLikedMenuIds() {
  try {
    localStorage.setItem(LIKE_STORAGE_KEY, JSON.stringify([...likedMenuIds]));
  } catch {
    // 저장 공간을 사용할 수 없어도 현재 화면에서는 좋아요 기능을 유지합니다.
  }
}

function handleMenuLikeClick(event) {
  const button = event.target.closest(".menu-like-button");
  if (!button) return;

  const item = menuItems.find((menuItem) => menuItem.id === button.dataset.itemId);
  if (!item) return;

  if (likedMenuIds.has(item.id)) {
    likedMenuIds.delete(item.id);
  } else {
    likedMenuIds.add(item.id);
  }

  saveLikedMenuIds();
  updateLikeButton(button, item);
  button.closest(".menu-item").classList.toggle("is-liked", likedMenuIds.has(item.id));
  updateLikedCategoryButton();

  const activeCategory = categoryNav.querySelector(".category-btn.active")?.dataset.category;
  if (activeCategory === "liked") filterMenuByCategory("liked");
}

function activateCategory(category) {
  categoryNav.querySelectorAll(".category-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.category === category);
  });
  filterMenuByCategory(category);
}

function handleCategoryClick(event) {
  const button = event.target.closest(".category-btn");
  if (!button) return;

  activateCategory(button.dataset.category);
}

function handleSubmenuClick(event) {
  const link = event.target.closest(".submenu-link");
  if (!link) return;

  activateCategory(link.dataset.category);
}

renderPromoBanner();
startPromoBannerAutoplay();
renderCategoryNav();
renderMenuItems();
categoryNav.addEventListener("click", handleCategoryClick);
menuContainer.addEventListener("click", handleMenuLikeClick);
document.querySelector(".submenu-list").addEventListener("click", handleSubmenuClick);
