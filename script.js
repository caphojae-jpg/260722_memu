const categoryNav = document.getElementById("categoryNav");
const menuContainer = document.getElementById("menuContainer");
const promoBannerTrack = document.getElementById("promoBannerTrack");

const BANNER_INTERVAL_MS = 5000;

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

function createMenuCard(item) {
  const card = document.createElement("section");
  card.className = item.soldOut ? "menu-item sold-out" : "menu-item";
  card.dataset.category = item.category;

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
  card.appendChild(trigger);
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
    const matches = category === "all" || card.dataset.category === category;
    card.classList.toggle("hidden", !matches);
  });
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
document.querySelector(".submenu-list").addEventListener("click", handleSubmenuClick);
