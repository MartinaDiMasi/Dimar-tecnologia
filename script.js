// JavaScript - script.js
class TechStore {
    constructor() {
        this.products = [
            {
                id: 1,
                name: "Laptop Gaming MSI",
                category: "laptops",
                price: 1299.99,
                originalPrice: 1499.99,
                image: "img/laptop1.jpg",
                description: "Laptop gaming de alta performance con procesador Intel i7 y tarjeta gráfica RTX 3060",
                specs: ["Intel i7-11800H", "16GB RAM", "RTX 3060", "512GB SSD"],
                discount: 13
            },
            {
                id: 2,
                name: "iPhone 14 Pro Max",
                category: "celulares",
                price: 1099.99,
                originalPrice: 1199.99,
                image: "img/iphone.avif",
                description: "El último iPhone con cámara pro y chip A16 Bionic",
                specs: ["A16 Bionic", "128GB", "Cámara 48MP", "Pantalla 6.7\""],
                discount: 8
            },
            {
                id: 3,
                name: "Teclado Mecánico RGB",
                category: "gaming",
                price: 159.99,
                originalPrice: 199.99,
                image: "img/keyboard.jpg",
                description: "Teclado mecánico para gaming con switches Cherry MX y retroiluminación RGB",
                specs: ["Cherry MX Blue", "RGB Personalizable", "Anti-ghosting", "USB-C"],
                discount: 20
            },
            {
                id: 4,
                name: "Auriculares Bluetooth",
                category: "accesorios",
                price: 89.99,
                originalPrice: 119.99,
                image: "img/headphone.png",
                description: "Auriculares inalámbricos con cancelación de ruido activa",
                specs: ["Bluetooth 5.0", "30h batería", "Cancelación ruido", "Carga rápida"],
                discount: 25
            },
            {
                id: 5,
                name: "Monitor 4K Gaming",
                category: "gaming",
                price: 449.99,
                originalPrice: 549.99,
                image: "img/monitores.png",
                description: "Monitor 4K de 27 pulgadas con 144Hz para gaming profesional",
                specs: ["4K UHD", "144Hz", "1ms", "HDR400"],
                discount: 18
            },
            {
                id: 6,
                name: "MacBook Air M2",
                category: "laptops",
                price: 999.99,
                originalPrice: 1199.99,
                image: "img/macbook.png",
                description: "La nueva MacBook Air con chip M2 y diseño renovado",
                specs: ["Chip M2", "8GB RAM", "256GB SSD", "13.6\" Liquid Retina"],
                discount: 17
            },
            {
                id: 7,
                name: "Samsung Galaxy S23",
                category: "celulares",
                price: 799.99,
                originalPrice: 899.99,
                image: "img/samsung.jpeg",
                description: "Smartphone Android flagship con cámara de 200MP",
                specs: ["Snapdragon 8 Gen 2", "8GB RAM", "Cámara 200MP", "5000mAh"],
                discount: 11
            },
            {
                id: 8,
                name: "Mouse Gaming Inalámbrico",
                category: "accesorios",
                price: 39.99,
                originalPrice: 69.99,
                image: "img/mouse.webp",
                description: "Mouse gaming de precisión con sensor óptico de 25,600 DPI",
                specs: ["25,600 DPI", "70h batería", "11 botones", "RGB"],
                discount: 20
            }
        ];
        
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.filteredProducts = [...this.products];

        this.init();
    }

    saveCartToStorage() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    init() {
        this.renderProducts();
        this.setupEventListeners();
        this.updateCartUI();
    }
    
    setupEventListeners() {
        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchProducts(e.target.value);
        });
        
        document.getElementById('searchBtn').addEventListener('click', () => {
            const query = document.getElementById('searchInput').value;
            this.searchProducts(query);
        });
        
        // Category filters
        document.querySelectorAll('[data-category]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.getAttribute('data-category') || 
                               e.target.closest('[data-category]').getAttribute('data-category');
                this.filterByCategory(category);
            });
        });
        
        // Checkout button
        document.getElementById('checkoutBtn').addEventListener('click', () => {
            this.processCheckout();
        });
        
        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    renderProducts() {
        const container = document.getElementById('productsContainer');
        container.innerHTML = '';
        
        this.filteredProducts.forEach(product => {
            const productCard = this.createProductCard(product);
            container.appendChild(productCard);
        });
    }
    
    createProductCard(product) {
        const col = document.createElement('div');
        col.className = 'col-lg-3 col-md-6 mb-4';

        const discountBadge = product.discount ? 
            `<span class="product-badge">-${product.discount}%</span>` : '';

        col.innerHTML = `
            <div class="product-card h-100" onclick="techStore.viewProduct(${product.id})">
                ${discountBadge}
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" class="img-fluid product-img" 
                         onerror="this.parentElement.innerHTML='<div class=\\'product-placeholder\\'><span>FOTO ${product.id}</span></div>'">
                </div>
                <div class="product-info">
                    <h6 class="fw-bold mb-2">${product.name}</h6>
                    <p class="text-muted small mb-3">${product.description.substring(0, 80)}...</p>
                    <div class="mb-3">
                        <span class="product-price">$${product.price}</span>
                        ${product.originalPrice ? `<span class="product-original-price ms-2">$${product.originalPrice}</span>` : ''}
                    </div>
                    <div class="d-grid gap-2">
                        <button class="btn btn-success btn-sm" onclick="event.stopPropagation(); techStore.addToCart(${product.id})">
                            <i class="fas fa-cart-plus me-1"></i>Agregar al Carrito
                        </button>
                    </div>
                </div>
            </div>
        `;

        return col;
    }
    
    searchProducts(query) {
        if (!query.trim()) {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(product =>
                product.name.toLowerCase().includes(query.toLowerCase()) ||
                product.description.toLowerCase().includes(query.toLowerCase()) ||
                product.category.toLowerCase().includes(query.toLowerCase())
            );
        }
        this.renderProducts();
        
        // Scroll to products section
        document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
    }
    
    filterByCategory(category) {
        this.filteredProducts = this.products.filter(product => 
            product.category === category
        );
        this.renderProducts();
        
        // Scroll to products section
        document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
    }
    
    viewProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        const modal = document.getElementById('productModal');
        const modalTitle = document.getElementById('productModalTitle');
        const modalBody = document.getElementById('productModalBody');
        
        modalTitle.textContent = product.name;
        
        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div class="product-image mb-3" style="height: 300px;">
                        <img src="${product.image}" alt="${product.name}" class="img-fluid h-100 w-100" 
                             style="object-fit: cover; border-radius: 8px;"
                             onerror="this.parentElement.innerHTML='<div class=\\'product-placeholder h-100\\'><span>FOTO ${product.id}</span></div>'">
                    </div>
                </div>
                <div class="col-md-6">
                    <h4 class="fw-bold mb-3">${product.name}</h4>
                    <p class="text-muted mb-3">${product.description}</p>
                    
                    <h6 class="fw-bold mb-2">Especificaciones:</h6>
                    <ul class="list-unstyled mb-3">
                        ${product.specs.map(spec => `<li><i class="fas fa-check text-success me-2"></i>${spec}</li>`).join('')}
                    </ul>
                    
                    <div class="mb-4">
                        <span class="product-price fs-3">$${product.price}</span>
                        ${product.originalPrice ? `<span class="product-original-price ms-2 fs-6">$${product.originalPrice}</span>` : ''}
                        ${product.discount ? `<span class="badge bg-danger ms-2">-${product.discount}%</span>` : ''}
                    </div>
                    
                    <div class="d-grid">
                        <button class="btn btn-success btn-lg" onclick="techStore.addToCart(${product.id}); bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();">
                            <i class="fas fa-cart-plus me-2"></i>Agregar al Carrito
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        new bootstrap.Modal(modal).show();
    }
    
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1
            });
        }
        
        this.updateCartUI();
        this.saveCartToStorage();
        this.showNotification(`${product.name} agregado al carrito`, 'success');
    }
    
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCartUI();
        this.saveCartToStorage();
        this.showNotification('Producto eliminado del carrito', 'info');
    }
    
    updateQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (!item) return;

        item.quantity += change;

        if (item.quantity <= 0) {
            this.removeFromCart(productId);
        } else {
            this.updateCartUI();
            this.saveCartToStorage();
        }
    }

    processCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('Tu carrito está vacío', 'warning');
            return;
        }

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const checkoutBtn = document.getElementById('checkoutBtn');
        const originalText = checkoutBtn.innerHTML;
        checkoutBtn.innerHTML = '<span class="loading me-2"></span>Procesando.';
        checkoutBtn.disabled = true;

        setTimeout(() => {
            this.cart = [];
            this.updateCartUI();
            this.saveCartToStorage();
            bootstrap.Modal.getInstance(document.getElementById('cartModal')).hide();
            this.showNotification(`¡Compra realizada con éxito! Total: $${total.toFixed(2)}`, 'success');
            checkoutBtn.innerHTML = originalText;
            checkoutBtn.disabled = false;
        }, 2000);
    }
    
    updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        // Update cart count
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'inline' : 'none';
        
        // Update cart items
        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-shopping-cart fa-3x mb-3"></i>
                    <p>Tu carrito está vacío</p>
                </div>
            `;
        } else {
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div class="row align-items-center">
                        <div class="col-2">
                            <div class="cart-item-image">
                                <img src="${item.image}" alt="${item.name}" class="img-fluid" 
                                    onerror="this.parentElement.innerHTML='<span class=\\'small\\'>IMG</span>'">
                            </div>
                        </div>
                        <div class="col-4">
                            <h6 class="mb-1">${item.name}</h6>
                            <small class="text-muted">$${item.price}</small>
                        </div>
                        <div class="col-3">
                            <div class="quantity-controls">
                                <button class="quantity-btn" onclick="techStore.updateQuantity(${item.id}, -1)">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="mx-2">${item.quantity}</span>
                                <button class="quantity-btn" onclick="techStore.updateQuantity(${item.id}, 1)">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-2">
                            <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                        </div>
                        <div class="col-1">
                            <button class="btn btn-sm btn-outline-danger" onclick="techStore.removeFromCart(${item.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        // Update total
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = total.toFixed(2);
        
        // Update checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        checkoutBtn.disabled = this.cart.length === 0;
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
        
        notification.innerHTML = `
            <strong>${type === 'success' ? '¡Éxito!' : type === 'warning' ? '¡Atención!' : 'Información'}</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// API Simulation for Backend Integration
class APIService {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
    }
    
    async getProducts() {
        try {
            // Simulate API delay
            await this.delay(500);
            
            // In real implementation, this would be:
            // const response = await fetch(`${this.baseURL}/products`);
            // return await response.json();
            
            return techStore.products;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }
    
    async addProduct(product) {
        try {
            await this.delay(300);
            
            // Simulate API call
            console.log('Adding product:', product);
            return { success: true, id: Date.now() };
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    }
    
    async processOrder(orderData) {
        try {
            await this.delay(1000);
            
            // Simulate order processing
            const orderId = 'ORD-' + Date.now();
            console.log('Processing order:', orderId, orderData);
            
            return {
                success: true,
                orderId: orderId,
                total: orderData.total,
                estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            };
        } catch (error) {
            console.error('Error processing order:', error);
            throw error;
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application
let techStore;
let apiService;

document.addEventListener('DOMContentLoaded', function() {
    techStore = new TechStore();
    apiService = new APIService();
    
    // Add loading animation to page
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Add scroll effects
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
           
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
});

// Export for potential Node.js backend integration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TechStore, APIService };
}
