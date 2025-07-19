// Mobile Menu Toggle
console.log("Script loaded - v1.1"); // Version tag to verify new script is loading

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded - cart functionality active");
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
      navLinks.classList.toggle("active");
    });
  }

  // Close menu when clicking outside
  document.addEventListener("click", function (event) {
    if (
      !event.target.closest(".navbar") &&
      navLinks.classList.contains("active")
    ) {
      navLinks.classList.remove("active");
    }
  });

  // Initialize shopping cart
  initCart();

  // Load featured products
  loadFeaturedProducts();

  // Load featured artisans
  loadFeaturedArtisans();

  // Update cart count
  updateCartCount();
});

// Shopping Cart Functions
let cart = [];

// Initialize cart from localStorage if available
function initCart() {
  const savedCart = localStorage.getItem("chikankari_cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartCount();
  }
}

// Add item to cart
function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  // Save to localStorage
  localStorage.setItem("chikankari_cart", JSON.stringify(cart));

  // Update UI
  updateCartCount();

  // Show feedback
  showAddToCartFeedback(product.name);

  // Redirect to checkout
  setTimeout(() => {
    window.location.href = "checkout.html";
  }, 1000);
}

// Update cart count in header
function updateCartCount() {
  const cartCountElement = document.querySelector(".cart-count");
  if (cartCountElement) {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElement.textContent = totalItems;

    // Make it visible if there are items
    if (totalItems > 0) {
      cartCountElement.style.display = "inline-block";
    } else {
      cartCountElement.style.display = "none";
    }
  }
}

// Show feedback when item is added to cart
function showAddToCartFeedback(productName) {
  // Create feedback element
  const feedback = document.createElement("div");
  feedback.className = "cart-feedback";
  feedback.innerHTML = `
        <div class="cart-feedback-content">
            <i class="fas fa-check-circle"></i>
            <p>${productName} added to cart!</p>
            <p class="redirect-text">Redirecting to checkout...</p>
        </div>
    `;

  document.body.appendChild(feedback);

  // Remove after animation
  setTimeout(() => {
    feedback.classList.add("show");
  }, 10);

  setTimeout(() => {
    feedback.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(feedback);
    }, 300);
  }, 2000);
}

// Sample product data (in a real application, this would come from a database)
const products = [
  {
    id: 1,
    name: "Chikankari Embroidered Kurta",
    image: "images/img1.jpg",
    price: 2500,
    artisan: "Aisha Khan",
  },
  {
    id: 2,
    name: "Hand-stitched Chikankari Saree",
    image: "images/img2.webp",
    price: 5800,
    artisan: "Rahul Sharma",
  },
  {
    id: 3,
    name: "Chikankari Table Runner",
    image: "images/img3.webp",
    price: 1200,
    artisan: "Meera Patel",
  },
  {
    id: 4,
    name: "Embroidered Chikankari Dupatta",
    image: "images/img4.webp",
    price: 1800,
    artisan: "Vijay Kapoor",
  },
];

// Sample artisan data
const artisans = [
  {
    id: 1,
    name: "Priyanka Viswakarma",
    specialty: "Traditional Kurtas",
    image: "images/persons1.jpg",
    location: "Lucknow, UP",
  },
  {
    id: 2,
    name: "Chandan Singh",
    specialty: "Hand-stitched Sarees",
    image: "images/person3.png",
    location: "Varanasi, UP",
  },
  {
    id: 3,
    name: "Mohm. Anas",
    specialty: "Home Decor Items",
    image: "images/persons3.jpg",
    location: "Jaipur, Rajasthan",
  },
  {
    id: 4,
    name: "Himanshu Singh",
    specialty: "Dupattas",
    image: "images/persons4.jpg",
    location: "Lucknow, UP",
  },
  {
    id: 5,
    name: "Renu Prajapati",
    specialty: "Cotton Kurtas",
    image: "images/persons5.jpg",
    location: "Delhi, India",
  },
  {
    id: 6,
    name: "Harshit Singh",
    specialty: "Cushion Covers",
    image: "images/persons6.jpg",
    location: "Jaipur, Rajasthan",
  },
];

// Load featured products
function loadFeaturedProducts() {
  const productContainer = document.querySelector(".product-container");
  const productsGridContainer = document.querySelector(".products-grid");

  // Determine which container to use (homepage or shop page)
  const container = productContainer || productsGridContainer;

  if (!container) return;

  console.log("Loading products into container:", container);

  // Clear container if it's the shop page (for filtering)
  if (productsGridContainer) {
    productsGridContainer.innerHTML = "";
  }

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";

    productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.jpg'">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="artisan-name">By ${product.artisan}</p>
                <span class="price">₹${product.price}</span>
                <div class="product-buttons">
                    <button onclick="addToCart(${product.id})" class="btn primary-btn add-to-cart-btn" style="background-color: #e91e63; color: white; font-weight: bold;">
                        <i class="fas fa-shopping-cart"></i> ADD TO CART
                    </button>
                </div>
            </div>
        `;

    container.appendChild(productCard);
    console.log("Added product to container:", product.name);
  });
}

// Load featured artisans
function loadFeaturedArtisans() {
  const artisanContainer = document.querySelector(".artisan-container");

  if (!artisanContainer) return;

  artisans.forEach((artisan) => {
    const artisanCard = document.createElement("div");
    artisanCard.className = "artisan-card";

    artisanCard.innerHTML = `
            <div class="artisan-image">
                <img src="${artisan.image}" alt="${artisan.name}" onerror="this.src='images/placeholder.jpg'">
            </div>
            <h3>${artisan.name}</h3>
            <p>${artisan.specialty}</p>
            <p>${artisan.location}</p>
            <div class="social-icons">
                <a href="#"><i class="fab fa-facebook-f"></i></a>
                <a href="#"><i class="fab fa-instagram"></i></a>
                <a href="#"><i class="fab fa-twitter"></i></a>
            </div>
        `;

    artisanContainer.appendChild(artisanCard);
  });
}

// Form validation for contact and registration forms
function validateForm(formId) {
  const form = document.getElementById(formId);

  if (!form) return;

  form.addEventListener("submit", function (event) {
    let isValid = true;
    const inputs = form.querySelectorAll("input, textarea");

    inputs.forEach((input) => {
      if (input.required && !input.value.trim()) {
        isValid = false;
        input.classList.add("error");

        const errorMessage = document.createElement("p");
        errorMessage.className = "error-message";
        errorMessage.textContent = "This field is required";

        if (
          !input.nextElementSibling ||
          !input.nextElementSibling.classList.contains("error-message")
        ) {
          input.insertAdjacentElement("afterend", errorMessage);
        }
      } else if (
        input.type === "email" &&
        input.value &&
        !validateEmail(input.value)
      ) {
        isValid = false;
        input.classList.add("error");

        const errorMessage = document.createElement("p");
        errorMessage.className = "error-message";
        errorMessage.textContent = "Please enter a valid email address";

        if (
          !input.nextElementSibling ||
          !input.nextElementSibling.classList.contains("error-message")
        ) {
          input.insertAdjacentElement("afterend", errorMessage);
        }
      } else {
        input.classList.remove("error");
        if (
          input.nextElementSibling &&
          input.nextElementSibling.classList.contains("error-message")
        ) {
          input.nextElementSibling.remove();
        }
      }
    });

    if (!isValid) {
      event.preventDefault();
    }
  });

  // Remove error class on input
  const inputs = form.querySelectorAll("input, textarea");
  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      this.classList.remove("error");
      if (
        this.nextElementSibling &&
        this.nextElementSibling.classList.contains("error-message")
      ) {
        this.nextElementSibling.remove();
      }
    });
  });
}

// Validate email format
function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

// Initialize form validation on DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
  validateForm("contact-form");
  validateForm("register-form");
  validateForm("artisan-register-form");
  validateForm("login-form");
});
