const categoryNav = document.getElementById("categoryNav");
const menuContainer = document.getElementById("menuContainer");

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

  card.append(createMenuImage(item), info);
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

renderCategoryNav();
renderMenuItems();
categoryNav.addEventListener("click", handleCategoryClick);
document.querySelector(".submenu-list").addEventListener("click", handleSubmenuClick);
