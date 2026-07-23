const menuModalOverlay = document.getElementById("menuModalOverlay");
const menuModalState = { images: [], index: 0, triggerEl: null };

function getItemImages(item) {
  return item.images && item.images.length > 0 ? item.images : [item.image];
}

function renderMenuModal() {
  const total = menuModalState.images.length;
  const showArrows = total > 1;

  menuModalOverlay.innerHTML = "";

  const modal = document.createElement("div");
  modal.className = "menu-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", menuModalState.item.name);

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "menu-modal-close";
  closeBtn.setAttribute("aria-label", "닫기");
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", closeMenuModal);

  const slider = document.createElement("div");
  slider.className = "menu-modal-slider";

  const image = document.createElement("img");
  image.className = "menu-modal-image";
  image.src = menuModalState.images[menuModalState.index];
  image.alt = menuModalState.item.name;
  image.onerror = () => {
    image.onerror = null;
    image.src = MENU_IMAGE_PLACEHOLDER;
  };
  slider.appendChild(image);

  if (showArrows) {
    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "menu-modal-arrow menu-modal-arrow--prev";
    prevBtn.setAttribute("aria-label", "이전 이미지");
    prevBtn.textContent = "‹";
    prevBtn.addEventListener("click", () => showAdjacentSlide(-1));

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "menu-modal-arrow menu-modal-arrow--next";
    nextBtn.setAttribute("aria-label", "다음 이미지");
    nextBtn.textContent = "›";
    nextBtn.addEventListener("click", () => showAdjacentSlide(1));

    const counter = document.createElement("span");
    counter.className = "menu-modal-counter";
    counter.textContent = `${menuModalState.index + 1} / ${total}`;

    slider.append(prevBtn, nextBtn, counter);
  }

  const info = document.createElement("div");
  info.className = "menu-modal-info";

  const name = document.createElement("h2");
  name.className = "menu-name";
  name.textContent = menuModalState.item.name;

  const desc = document.createElement("p");
  desc.className = "menu-desc";
  desc.textContent = menuModalState.item.description;

  const price = document.createElement("span");
  price.className = "menu-price";
  price.textContent = formatPrice(menuModalState.item.price);

  const badgeRow = createBadgeRow(menuModalState.item);
  if (badgeRow.children.length > 0) info.appendChild(badgeRow);
  info.append(name, desc, price);

  modal.append(closeBtn, slider, info);
  menuModalOverlay.appendChild(modal);
}

function showAdjacentSlide(step) {
  const total = menuModalState.images.length;
  menuModalState.index = (menuModalState.index + step + total) % total;
  renderMenuModal();
}

function openMenuModal(item, triggerEl) {
  menuModalState.item = item;
  menuModalState.images = getItemImages(item);
  menuModalState.index = 0;
  menuModalState.triggerEl = triggerEl;

  renderMenuModal();
  menuModalOverlay.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeMenuModal() {
  menuModalOverlay.hidden = true;
  menuModalOverlay.innerHTML = "";
  document.body.style.overflow = "";
  if (menuModalState.triggerEl) menuModalState.triggerEl.focus();
}

function handleMenuCardClick(event) {
  const trigger = event.target.closest(".menu-item-trigger");
  if (!trigger) return;

  const item = menuItems.find((menuItem) => menuItem.id === trigger.dataset.itemId);
  if (!item) return;

  openMenuModal(item, trigger);
}

function handleMenuModalOverlayClick(event) {
  if (event.target === menuModalOverlay) closeMenuModal();
}

function handleMenuModalKeydown(event) {
  if (menuModalOverlay.hidden) return;

  if (event.key === "Escape") closeMenuModal();
  if (event.key === "ArrowLeft" && menuModalState.images.length > 1) showAdjacentSlide(-1);
  if (event.key === "ArrowRight" && menuModalState.images.length > 1) showAdjacentSlide(1);
}

menuContainer.addEventListener("click", handleMenuCardClick);
menuModalOverlay.addEventListener("click", handleMenuModalOverlayClick);
document.addEventListener("keydown", handleMenuModalKeydown);
