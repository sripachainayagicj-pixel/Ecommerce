// products.js
// Product Listing Page client-side logic.
// Handles API fetch, search, category filtering, sorting, pagination, and cart count.

const API_URL = 'http://localhost:5000/api/products';
const PRODUCTS_PER_PAGE = 6;

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;

const productsGrid = document.getElementById('productsGrid');
const spinner = document.getElementById('spinner');
const errorMessage = document.getElementById('errorMessage');
const categorySelect = document.getElementById('categorySelect');
const sortSelect = document.getElementById('sortSelect');
const searchInput = document.getElementById('searchInput');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');
const cartCountEl = document.getElementById('cartCount');
const toast = document.getElementById('toast');

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" fill="%239ca3af" font-size="24" font-family="Arial" text-anchor="middle" dy="8">No Image</text></svg>';

window.addEventListener('DOMContentLoaded', () => {
  attachListeners();
  updateCartCount();
  fetchProducts();
});

function attachListeners() {
  searchInput.addEventListener('input', () => {
    currentPage = 1;
    applyFiltersAndRender();
  });

  categorySelect.addEventListener('change', () => {
    currentPage = 1;
    applyFiltersAndRender();
  });

  sortSelect.addEventListener('change', () => {
    currentPage = 1;
    applyFiltersAndRender();
  });

  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage -= 1;
      renderProducts();
      renderPagination();
    }
  });

  nextBtn.addEventListener('click', () => {
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
    if (currentPage < totalPages) {
      currentPage += 1;
      renderProducts();
      renderPagination();
    }
  });
}

async function fetchProducts() {
  showError(null);
  showSpinner(true);

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    const rawProducts = Array.isArray(data) ? data : Array.isArray(data.products) ? data.products : [];

    allProducts = rawProducts.map(normalizeProduct);
    applyFiltersAndRender();
  } catch (error) {
    console.error('Product fetch failed', error);
    showError('Sorry — failed to load products. Please try again later.');
    allProducts = [];
    filteredProducts = [];
    renderProducts();
    renderPagination();
  } finally {
    showSpinner(false);
  }
}

function normalizeProduct(raw) {
  return {
    id: raw._id ?? raw.id ?? raw.productId ?? String(Math.random()).slice(2),
    name: raw.name ?? raw.title ?? 'Untitled Product',
    description: raw.description ?? raw.shortDescription ?? '',
    category: raw.category ?? 'Other',
    price: typeof raw.price === 'number' ? raw.price : parseFloat(raw.price) || 0,
    rating: typeof raw.rating === 'number' ? raw.rating : parseFloat(raw.rating) || 0,
    countInStock: raw.countInStock ?? raw.stock ?? raw.qty ?? 0,
    image: raw.image ?? raw.imageUrl ?? raw.photo ?? '',
    raw
  };
}

function applyFiltersAndRender() {
  filterProducts();
  sortProducts();
  clampCurrentPage();
  renderProducts();
  renderPagination();
}

function filterProducts() {
  const category = categorySelect.value;
  const searchTerm = searchInput.value.trim().toLowerCase();

  filteredProducts = allProducts.filter(product => {
    if (category !== 'all' && product.category !== category) {
      return false;
    }

    if (searchTerm && !product.name.toLowerCase().includes(searchTerm)) {
      return false;
    }

    return true;
  });
}

function sortProducts() {
  const sort = sortSelect.value;

  if (sort === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sort === 'name-asc') {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'name-desc') {
    filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
  }
}

function clampCurrentPage() {
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }
}

function renderProducts() {
  productsGrid.innerHTML = '';
  productsGrid.classList.remove('fade-in');

  if (filteredProducts.length === 0) {
    productsGrid.innerHTML = '<div class="no-results">No products found.</div>';
    return;
  }

  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  const fragment = document.createDocumentFragment();

  paginatedProducts.forEach(product => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-media">
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" onerror="this.onerror=null;this.src='${PLACEHOLDER}';">
      </div>
      <div class="product-body">
        <div class="product-title">${escapeHtml(product.name)}</div>
        <div class="product-desc">${escapeHtml(truncate(product.description, 120))}</div>
        <div class="product-meta">
          <div class="category">${escapeHtml(product.category)}</div>
          <div class="price">$${product.price.toFixed(2)}</div>
        </div>
        <div class="product-meta">
          <div class="rating">${renderStars(product.rating)}</div>
          <div class="stock">${product.countInStock > 0 ? '<span style="color:var(--success)">In Stock</span>' : '<span style="color:var(--danger)">Out of stock</span>'}</div>
        </div>
        <div class="card-actions">
          <button class="btn add-cart">Add to Cart</button>
          <button class="btn secondary view-details">View Details</button>
        </div>
      </div>
    `;

    card.querySelector('.add-cart').addEventListener('click', () => addToCart(product.id));
    card.querySelector('.view-details').addEventListener('click', () => {
      if (product.raw && (product.raw._id || product.raw.id)) {
        window.location.href = `product.html?id=${encodeURIComponent(product.id)}`;
      } else {
        showToast('Product details not available', 'info');
      }
    });

    fragment.appendChild(card);
  });

  productsGrid.appendChild(fragment);
  window.requestAnimationFrame(() => productsGrid.classList.add('fade-in'));
}

function renderPagination() {
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
}

function addToCart(productId) {
  const product = allProducts.find(item => item.id === productId);
  if (!product) {
    showToast('Unable to add product to cart', 'warning');
    return;
  }

  const cart = getCart();
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
  }

  setCart(cart);
  updateCartCount();
  showToast(`${product.name} added to cart`, 'success');
}

function getCart() {
  try {
    const raw = localStorage.getItem('cart');
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn('Failed to read cart', error);
    return [];
  }
}

function setCart(cart) {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    console.warn('Failed to save cart', error);
  }
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  cartCountEl.textContent = count;
}

function showSpinner(visible) {
  spinner.classList.toggle('hidden', !visible);
  spinner.setAttribute('aria-hidden', String(!visible));
}

function showError(message) {
  if (!message) {
    errorMessage.classList.add('hidden');
    errorMessage.textContent = '';
    return;
  }

  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
}

function escapeHtml(value) {
  if (!value) return '';
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function truncate(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function renderStars(value) {
  const rounded = Math.round((value || 0) * 2) / 2;
  const fullStars = Math.floor(rounded);
  const halfStar = rounded - fullStars >= 0.5;
  let stars = '★'.repeat(fullStars);
  if (halfStar) stars += '☆';
  stars = stars.padEnd(5, '☆');
  return `<span title="Rating: ${rounded}">${stars}</span> <span style="color:var(--muted);font-size:0.85rem">${rounded}</span>`;
}

function showToast(message, type = 'success', duration = 2200) {
  toast.textContent = message;
  toast.className = `toast ${type} show`;

  clearTimeout(window.__toastTimeout);
  window.__toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.remove('success', 'info', 'warning', 'error');
  }, duration);
}
