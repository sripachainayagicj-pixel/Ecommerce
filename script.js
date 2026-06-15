// ===================== Configuration =====================
const API_URL = 'http://localhost:5000/api';

// ===================== Utility Functions =====================

/**
 * Show notification message to user
 */
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background-color: ${type === 'success' ? '#28a745' : '#dc3545'};
    color: white;
    border-radius: 5px;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

/**
 * Format price to currency format
 */
function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

/**
 * Get token from localStorage
 */
function getToken() {
  return localStorage.getItem('token');
}

/**
 * Get user info from localStorage
 */
function getUserInfo() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
  return !!getToken();
}

/**
 * Logout user
 */
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('cart');
  showNotification('Logged out successfully');
  window.location.href = 'index.html';
}

/**
 * Update navigation bar based on login status
 */
function updateNavigation() {
  const navUser = document.getElementById('navUser');
  if (!navUser) return;

  const user = getUserInfo();
  
  if (user) {
    if (user.role === 'admin') {
      navUser.innerHTML = `
        <a href="admin.html">Admin</a>
        <a href="#" onclick="logout()">Logout</a>
      `;
    } else {
      navUser.innerHTML = `
        <span style="color: white; margin-right: 1rem;">${user.name}</span>
        <a href="#" onclick="logout()">Logout</a>
      `;
    }
  }
}

/**
 * Update cart count in navigation
 */
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const cartCounts = document.querySelectorAll('#cartCount');
  cartCounts.forEach(count => {
    count.textContent = cart.length;
  });
}

/**
 * Get cart from localStorage
 */
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

/**
 * Save cart to localStorage
 */
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

// ===================== API Functions =====================

/**
 * Generic fetch function with error handling
 */
async function apiCall(endpoint, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Add token if available
  const token = getToken();
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  const mergedOptions = { ...defaultOptions, ...options };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, mergedOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API error');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * User Registration
 */
async function registerUser(name, email, password, confirmPassword) {
  try {
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });

    // Save token and user info
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));

    showNotification('Registration successful!');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

/**
 * User Login
 */
async function loginUser(email, password) {
  try {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Save token and user info
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));

    showNotification('Login successful!');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

/**
 * Fetch all products
 */
async function fetchProducts(search = '', category = '') {
  try {
    let endpoint = '/products';
    const params = new URLSearchParams();
    
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    const response = await apiCall(endpoint);
    return response.products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Fetch single product
 */
async function fetchProductById(id) {
  try {
    const response = await apiCall(`/products/${id}`);
    return response.product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

/**
 * Create order
 */
async function createOrder(products, totalAmount, shippingAddress, paymentMethod) {
  try {
    const response = await apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify({
        products,
        totalAmount,
        shippingAddress,
        paymentMethod,
      }),
    });

    showNotification('Order placed successfully!');
    return response.order;
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

/**
 * Fetch all orders (for admin)
 */
async function fetchOrders() {
  try {
    const response = await apiCall('/orders');
    return response.orders || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

/**
 * Update order status (admin only)
 */
async function updateOrderStatus(orderId, status, notes = '') {
  try {
    const response = await apiCall(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });

    showNotification('Order updated successfully!');
    return response.order;
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

/**
 * Add new product (admin only)
 */
async function addProduct(productData) {
  try {
    const response = await apiCall('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });

    showNotification('Product added successfully!');
    return response.product;
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

/**
 * Update product (admin only)
 */
async function updateProduct(productId, productData) {
  try {
    const response = await apiCall(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });

    showNotification('Product updated successfully!');
    return response.product;
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

/**
 * Delete product (admin only)
 */
async function deleteProduct(productId) {
  try {
    await apiCall(`/products/${productId}`, {
      method: 'DELETE',
    });

    showNotification('Product deleted successfully!');
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

// ===================== Page-Specific Functions =====================

/**
 * Load and display featured products on home page
 */
async function loadFeaturedProducts() {
  const container = document.getElementById('featuredProducts');
  if (!container) return;

  container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

  try {
    const products = await fetchProducts();
    const featured = products.slice(0, 6);

    container.innerHTML = '';
    if (featured.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No products available</p>';
      return;
    }

    featured.forEach(product => {
      container.appendChild(createProductCard(product));
    });
  } catch (error) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: red;">Error loading products</p>';
  }
}

/**
 * Create product card element
 */
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}" class="product-image">
    <div class="product-info">
      <div class="product-name">${product.name}</div>
      <div class="product-category">${product.category}</div>
      <div class="product-price">${formatPrice(product.price)}</div>
      <div class="product-description">${product.description.substring(0, 50)}...</div>
      <div class="product-actions">
        <button class="btn btn-secondary" onclick="viewProduct('${product._id}')">View</button>
        <button class="btn btn-primary" onclick="addToCart('${product._id}', '${product.name}', ${product.price}, '${product.image}')">Add to Cart</button>
      </div>
    </div>
  `;
  return card;
}

/**
 * View product details in modal
 */
async function viewProduct(productId) {
  try {
    const product = await fetchProductById(productId);
    if (!product) {
      showNotification('Product not found', 'error');
      return;
    }

    const modal = document.getElementById('productModal');
    if (!modal) return;

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
      <img src="${product.image}" alt="${product.name}" style="width: 100%; margin-bottom: 1rem; border-radius: 5px;">
      <h2>${product.name}</h2>
      <p style="color: #666; margin: 0.5rem 0;">${product.category}</p>
      <h3 style="color: #007bff; margin: 1rem 0;">${formatPrice(product.price)}</h3>
      <p>${product.description}</p>
      <p style="color: #666; margin: 1rem 0;">Stock: <strong>${product.stock}</strong></p>
      <button class="btn btn-primary btn-block" onclick="addToCart('${product._id}', '${product.name}', ${product.price}, '${product.image}'); closeModal();">Add to Cart</button>
    `;

    modal.style.display = 'flex';
  } catch (error) {
    showNotification('Error loading product details', 'error');
  }
}

/**
 * Close product modal
 */
function closeModal() {
  const modal = document.getElementById('productModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

/**
 * Load and display products on products page
 */
async function loadProducts(search = '', category = '') {
  const container = document.getElementById('productsGrid');
  const noProducts = document.getElementById('noProducts');
  if (!container) return;

  container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

  try {
    const products = await fetchProducts(search, category);

    container.innerHTML = '';
    if (products.length === 0) {
      noProducts.style.display = 'block';
      return;
    }

    noProducts.style.display = 'none';
    products.forEach(product => {
      container.appendChild(createProductCard(product));
    });
  } catch (error) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: red;">Error loading products</p>';
  }
}

/**
 * Add product to cart
 */
function addToCart(productId, productName, price, image) {
  const cart = getCart();
  
  const existingItem = cart.find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      productId,
      name: productName,
      price,
      image,
      quantity: 1,
    });
  }

  saveCart(cart);
  showNotification(`${productName} added to cart!`);
}

/**
 * Load and display cart items
 */
function loadCartItems() {
  const cartItems = document.getElementById('cartItems');
  const emptyCart = document.getElementById('emptyCart');
  if (!cartItems) return;

  const cart = getCart();

  if (cart.length === 0) {
    cartItems.style.display = 'none';
    emptyCart.style.display = 'block';
    return;
  }

  cartItems.style.display = 'block';
  emptyCart.style.display = 'none';

  cartItems.innerHTML = '';
  cart.forEach((item, index) => {
    const cartItemDiv = document.createElement('div');
    cartItemDiv.className = 'cart-item';
    cartItemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-details">
        <h3>${item.name}</h3>
        <p>${formatPrice(item.price)}</p>
      </div>
      <div class="quantity-controls">
        <button onclick="updateQuantity(${index}, -1)">−</button>
        <span>${item.quantity}</span>
        <button onclick="updateQuantity(${index}, 1)">+</button>
      </div>
      <div class="cart-item-total">
        ${formatPrice(item.price * item.quantity)}
        <br>
        <button class="btn btn-danger" style="width: 100%; margin-top: 0.5rem;" onclick="removeFromCart(${index})">Remove</button>
      </div>
    `;
    cartItems.appendChild(cartItemDiv);
  });

  updateCartSummary();
}

/**
 * Update item quantity
 */
function updateQuantity(index, change) {
  const cart = getCart();
  cart[index].quantity += change;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  saveCart(cart);
  loadCartItems();
}

/**
 * Remove item from cart
 */
function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  loadCartItems();
}

/**
 * Update cart summary with totals
 */
function updateCartSummary() {
  const cart = getCart();
  
  // Calculate subtotal
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate shipping (free if over $50, otherwise $5)
  const shipping = subtotal > 50 ? 0 : 5;
  
  // Calculate tax (10%)
  const tax = subtotal * 0.1;
  
  // Calculate total
  const total = subtotal + shipping + tax;

  // Update display
  const elements = {
    '#subtotal': formatPrice(subtotal),
    '#shipping': formatPrice(shipping),
    '#tax': formatPrice(tax),
    '#total': formatPrice(total),
    '#checkoutSubtotal': formatPrice(subtotal),
    '#checkoutShipping': formatPrice(shipping),
    '#checkoutTax': formatPrice(tax),
    '#checkoutTotal': formatPrice(total),
  };

  Object.entries(elements).forEach(([selector, value]) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  });
}

/**
 * Load checkout page
 */
function loadCheckout() {
  const cart = getCart();
  if (cart.length === 0) {
    window.location.href = 'cart.html';
    return;
  }

  // Display cart items in checkout
  const checkoutItems = document.getElementById('checkoutItems');
  if (checkoutItems) {
    checkoutItems.innerHTML = '';
    cart.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #dee2e6;">
          <span>${item.name} × ${item.quantity}</span>
          <span>${formatPrice(item.price * item.quantity)}</span>
        </div>
      `;
      checkoutItems.appendChild(itemDiv);
    });
  }

  updateCartSummary();
}

/**
 * Process checkout form submission
 */
async function processCheckout(event) {
  event.preventDefault();

  // Check if user is logged in
  if (!isLoggedIn()) {
    showNotification('Please login first', 'error');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    showNotification('Cart is empty', 'error');
    return;
  }

  // Get form data
  const street = document.getElementById('street').value;
  const city = document.getElementById('city').value;
  const state = document.getElementById('state').value;
  const zipCode = document.getElementById('zipCode').value;
  const country = document.getElementById('country').value;
  const paymentMethod = document.getElementById('paymentMethod').value;

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 5;
  const tax = subtotal * 0.1;
  const totalAmount = subtotal + shipping + tax;

  try {
    // Create order
    const order = await createOrder(
      cart,
      totalAmount,
      { street, city, state, zipCode, country },
      paymentMethod
    );

    // Clear cart
    localStorage.removeItem('cart');
    updateCartCount();

    // Show success modal
    const modal = document.getElementById('successModal');
    if (modal) {
      document.getElementById('orderMessage').textContent = 'Your order has been placed successfully!';
      document.getElementById('orderId').textContent = `Order ID: ${order.orderId}`;
      modal.style.display = 'flex';
    }
  } catch (error) {
    console.error('Error during checkout:', error);
  }
}

// ===================== Authentication Pages =====================

/**
 * Handle registration form submission
 */
function handleRegister(event) {
  event.preventDefault();

  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;

  registerUser(name, email, password, confirmPassword);
}

/**
 * Handle login form submission
 */
function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  loginUser(email, password);
}

// ===================== Admin Panel Functions =====================

/**
 * Check admin access and load admin panel
 */
function loadAdminPanel() {
  const user = getUserInfo();

  if (!user || user.role !== 'admin') {
    const notAuthorized = document.getElementById('notAuthorized');
    const adminPanel = document.getElementById('adminPanel');
    
    if (notAuthorized) notAuthorized.style.display = 'block';
    if (adminPanel) adminPanel.style.display = 'none';
    
    return;
  }

  const adminPanel = document.getElementById('adminPanel');
  if (adminPanel) {
    adminPanel.style.display = 'block';
  }

  // Load initial data
  loadAdminProducts();
  loadAdminOrders();
}

/**
 * Switch admin tabs
 */
function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });

  // Show selected tab
  const tabElement = document.getElementById(tabName + 'Tab');
  if (tabElement) {
    tabElement.classList.add('active');
  }

  // Mark button as active
  event.target.classList.add('active');
}

/**
 * Load admin products
 */
async function loadAdminProducts() {
  try {
    const products = await fetchProducts();
    const tableBody = document.getElementById('productsTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    products.forEach(product => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${product._id.substring(0, 8)}...</td>
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>${formatPrice(product.price)}</td>
        <td>${product.stock}</td>
        <td>
          <button class="btn btn-secondary" onclick="openEditModal('${product._id}')">Edit</button>
          <button class="btn btn-danger" onclick="adminDeleteProduct('${product._id}')">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    showNotification('Error loading products', 'error');
  }
}

/**
 * Load admin orders
 */
async function loadAdminOrders() {
  try {
    const orders = await fetchOrders();
    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    orders.forEach(order => {
      const row = document.createElement('tr');
      const date = new Date(order.createdAt).toLocaleDateString();
      const userName = order.userId?.name || 'Unknown User';
      
      row.innerHTML = `
        <td>${order.orderId}</td>
        <td>${userName}</td>
        <td>${formatPrice(order.totalAmount)}</td>
        <td>${order.status}</td>
        <td>${date}</td>
        <td>
          <button class="btn btn-primary" onclick="openOrderModal('${order._id}')">Update</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    showNotification('Error loading orders', 'error');
  }
}

/**
 * Handle add product form submission (admin)
 */
async function handleAddProduct(event) {
  event.preventDefault();

  const productData = {
    name: document.getElementById('productName').value,
    price: parseFloat(document.getElementById('productPrice').value),
    description: document.getElementById('productDescription').value,
    category: document.getElementById('productCategory').value,
    stock: parseInt(document.getElementById('productStock').value),
    image: document.getElementById('productImage').value || 'https://via.placeholder.com/300',
  };

  try {
    await addProduct(productData);
    document.getElementById('addProductForm').reset();
    loadAdminProducts();
  } catch (error) {
    console.error('Error adding product:', error);
  }
}

/**
 * Open edit product modal
 */
async function openEditModal(productId) {
  try {
    const product = await fetchProductById(productId);
    if (!product) {
      showNotification('Product not found', 'error');
      return;
    }

    document.getElementById('editProductId').value = productId;
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductDescription').value = product.description;
    document.getElementById('editProductCategory').value = product.category;
    document.getElementById('editProductStock').value = product.stock;

    document.getElementById('editProductModal').style.display = 'flex';
  } catch (error) {
    showNotification('Error loading product', 'error');
  }
}

/**
 * Close edit modal
 */
function closeEditModal() {
  document.getElementById('editProductModal').style.display = 'none';
}

/**
 * Handle edit product form submission
 */
async function handleEditProduct(event) {
  event.preventDefault();

  const productId = document.getElementById('editProductId').value;
  const productData = {
    name: document.getElementById('editProductName').value,
    price: parseFloat(document.getElementById('editProductPrice').value),
    description: document.getElementById('editProductDescription').value,
    category: document.getElementById('editProductCategory').value,
    stock: parseInt(document.getElementById('editProductStock').value),
  };

  try {
    await updateProduct(productId, productData);
    closeEditModal();
    loadAdminProducts();
  } catch (error) {
    console.error('Error updating product:', error);
  }
}

/**
 * Delete product (admin)
 */
async function adminDeleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product?')) {
    return;
  }

  try {
    await deleteProduct(productId);
    loadAdminProducts();
  } catch (error) {
    console.error('Error deleting product:', error);
  }
}

/**
 * Open order status modal
 */
function openOrderModal(orderId) {
  document.getElementById('updateOrderId').value = orderId;
  document.getElementById('orderStatusModal').style.display = 'flex';
}

/**
 * Close order modal
 */
function closeOrderModal() {
  document.getElementById('orderStatusModal').style.display = 'none';
}

/**
 * Handle update order status
 */
async function handleUpdateOrder(event) {
  event.preventDefault();

  const orderId = document.getElementById('updateOrderId').value;
  const status = document.getElementById('newOrderStatus').value;
  const notes = document.getElementById('orderNotes').value;

  try {
    await updateOrderStatus(orderId, status, notes);
    closeOrderModal();
    loadAdminOrders();
  } catch (error) {
    console.error('Error updating order:', error);
  }
}

// ===================== Event Listeners & Initialization =====================

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
  // Update navigation
  updateNavigation();
  updateCartCount();

  // Set up form event listeners
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', processCheckout);
  }

  const addProductForm = document.getElementById('addProductForm');
  if (addProductForm) {
    addProductForm.addEventListener('submit', handleAddProduct);
  }

  const editProductForm = document.getElementById('editProductForm');
  if (editProductForm) {
    editProductForm.addEventListener('submit', handleEditProduct);
  }

  const updateOrderForm = document.getElementById('updateOrderForm');
  if (updateOrderForm) {
    updateOrderForm.addEventListener('submit', handleUpdateOrder);
  }

  // Set up modal close handlers
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.addEventListener('click', function (e) {
      if (e.target === this) {
        this.style.display = 'none';
      }
    });
  });

  // Handle product search and filter
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  
  if (searchInput || categoryFilter) {
    const handleSearch = () => {
      const search = searchInput?.value || '';
      const category = categoryFilter?.value || '';
      loadProducts(search, category);
    };

    if (searchInput) {
      searchInput.addEventListener('input', handleSearch);
    }
    if (categoryFilter) {
      categoryFilter.addEventListener('change', handleSearch);
    }
  }

  // Page-specific initializations
  if (document.getElementById('featuredProducts')) {
    loadFeaturedProducts();
  }

  if (document.getElementById('productsGrid')) {
    loadProducts();
  }

  if (document.getElementById('cartItems')) {
    loadCartItems();
  }

  if (document.getElementById('checkoutItems')) {
    loadCheckout();
  }

  if (document.getElementById('adminPanel')) {
    loadAdminPanel();
  }

  // Set up checkout button
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function () {
      if (!isLoggedIn()) {
        showNotification('Please login first', 'error');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);
      } else {
        window.location.href = 'checkout.html';
      }
    });
  }
});
