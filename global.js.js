// ============================================
// LUXURY GIFT STORE - MAIN JAVASCRIPT
// ============================================

// Mobile Menu Toggle
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuClose = mobileMenu?.querySelector('.mobile-menu__close');

mobileMenuToggle?.addEventListener('click', () => {
  mobileMenu.classList.add('active');
  document.body.style.overflow = 'hidden';
});

mobileMenuClose?.addEventListener('click', () => {
  mobileMenu.classList.remove('active');
  document.body.style.overflow = '';
});

// Close mobile menu when clicking outside
mobileMenu?.addEventListener('click', (e) => {
  if (e.target === mobileMenu) {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// ============================================
// CART DRAWER
// ============================================

const cartDrawer = document.getElementById('cart-drawer');
const cartToggle = document.getElementById('cart-toggle');
const cartDrawerOverlay = cartDrawer?.querySelector('.cart-drawer__overlay');
const cartDrawerClose = cartDrawer?.querySelector('.cart-drawer__close');

function openCartDrawer() {
  cartDrawer?.classList.add('active');
  document.body.style.overflow = 'hidden';
  updateCartDrawer();
}

function closeCartDrawer() {
  cartDrawer?.classList.remove('active');
  document.body.style.overflow = '';
}

cartToggle?.addEventListener('click', openCartDrawer);
cartDrawerClose?.addEventListener('click', closeCartDrawer);
cartDrawerOverlay?.addEventListener('click', closeCartDrawer);

// Update cart drawer content
async function updateCartDrawer() {
  try {
    const response = await fetch('/cart.js');
    const cart = await response.json();
    
    const cartItemsContainer = document.getElementById('cart-drawer-items');
    if (!cartItemsContainer) return;

    if (cart.item_count === 0) {
      cartItemsContainer.innerHTML = `
        <div style="padding: 4rem 2.5rem; text-align: center;">
          <p style="font-size: 1.6rem; color: #999; margin-bottom: 2rem;">Your cart is empty</p>
          <a href="/collections/all" class="btn btn-primary" onclick="closeCartDrawer()">Continue Shopping</a>
        </div>
      `;
      return;
    }

    let cartHTML = '<div style="padding: 2.5rem; flex: 1; overflow-y: auto;">';
    
    cart.items.forEach(item => {
      const itemTotal = item.final_line_price / 100;
      cartHTML += `
        <div class="cart-item" style="display: flex; gap: 1.5rem; padding: 2rem 0; border-bottom: 1px solid #E5E5E5;">
          <img src="${item.image}" alt="${item.title}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;">
          <div style="flex: 1;">
            <h4 style="font-size: 1.5rem; margin: 0 0 0.5rem; font-weight: 600;">${item.product_title}</h4>
            ${item.variant_title !== 'Default Title' ? `<p style="font-size: 1.3rem; color: #999; margin: 0 0 0.5rem;">${item.variant_title}</p>` : ''}
            <p style="font-size: 1.4rem; font-weight: 600; color: var(--color-maroon);">$${itemTotal.toFixed(2)}</p>
            <div style="display: flex; align-items: center; gap: 1rem; margin-top: 1rem;">
              <button class="cart-quantity-btn" data-line="${item.index}" data-action="decrease" style="width: 30px; height: 30px; border: 1px solid #D4A5A5; background: white; border-radius: 4px; cursor: pointer;">-</button>
              <span style="font-size: 1.4rem; font-weight: 600; min-width: 30px; text-align: center;">${item.quantity}</span>
              <button class="cart-quantity-btn" data-line="${item.index}" data-action="increase" style="width: 30px; height: 30px; border: 1px solid #D4A5A5; background: white; border-radius: 4px; cursor: pointer;">+</button>
              <button class="cart-remove-btn" data-line="${item.index}" style="margin-left: auto; background: none; border: none; color: #999; cursor: pointer; font-size: 1.3rem; text-decoration: underline;">Remove</button>
            </div>
          </div>
        </div>
      `;
    });

    cartHTML += '</div>';
    
    // Cart footer
    const cartTotal = cart.total_price / 100;
    cartHTML += `
      <div style="padding: 2.5rem; border-top: 2px solid #E5E5E5; background: #F9F9F9;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 2rem; font-size: 1.8rem;">
          <span style="font-weight: 600;">Subtotal:</span>
          <span style="font-weight: 700; color: var(--color-maroon);">$${cartTotal.toFixed(2)}</span>
        </div>
        <p style="font-size: 1.3rem; color: #999; margin-bottom: 2rem;">Taxes and shipping calculated at checkout</p>
        <a href="/checkout" class="btn btn-primary" style="width: 100%; display: block; text-align: center; text-decoration: none;">Checkout</a>
        <button onclick="closeCartDrawer()" style="width: 100%; margin-top: 1rem; padding: 1.2rem; background: white; border: 2px solid var(--color-maroon); color: var(--color-maroon); border-radius: 4px; cursor: pointer; font-weight: 600;">Continue Shopping</button>
      </div>
    `;

    cartItemsContainer.innerHTML = cartHTML;

    // Add event listeners for quantity buttons
    document.querySelectorAll('.cart-quantity-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        const line = this.dataset.line;
        const action = this.dataset.action;
        const currentQty = parseInt(this.parentElement.querySelector('span').textContent);
        const newQty = action === 'increase' ? currentQty + 1 : Math.max(0, currentQty - 1);
        
        await updateCartQuantity(line, newQty);
      });
    });

    // Add event listeners for remove buttons
    document.querySelectorAll('.cart-remove-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        await updateCartQuantity(this.dataset.line, 0);
      });
    });

    // Update cart count
    updateCartCount(cart.item_count);

  } catch (error) {
    console.error('Error updating cart:', error);
  }
}

// Update cart quantity
async function updateCartQuantity(line, quantity) {
  try {
    const response = await fetch('/cart/change.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        line: line,
        quantity: quantity
      })
    });
    
    if (response.ok) {
      await updateCartDrawer();
    }
  } catch (error) {
    console.error('Error updating cart quantity:', error);
  }
}

// Update cart count bubble
function updateCartCount(count) {
  const cartCountBubbles = document.querySelectorAll('.cart-count-bubble');
  cartCountBubbles.forEach(bubble => {
    if (count > 0) {
      bubble.textContent = count;
      bubble.style.display = 'flex';
    } else {
      bubble.style.display = 'none';
    }
  });
}

// ============================================
// ADD TO CART
// ============================================

document.addEventListener('submit', async function(e) {
  if (e.target.matches('#product-form')) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('[type="submit"]');
    const originalText = submitButton.textContent;
    
    // Disable button
    submitButton.disabled = true;
    submitButton.textContent = 'Adding...';
    
    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        submitButton.textContent = 'Added!';
        setTimeout(() => {
          submitButton.textContent = originalText;
          submitButton.disabled = false;
        }, 1500);
        
        openCartDrawer();
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error:', error);
      submitButton.textContent = 'Error - Try Again';
      setTimeout(() => {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
      }, 2000);
    }
  }
});

// ============================================
// BUY NOW BUTTON
// ============================================

document.getElementById('buy-now')?.addEventListener('click', async function() {
  const form = document.getElementById('product-form');
  const formData = new FormData(form);
  
  try {
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      window.location.href = '/checkout';
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

// ============================================
// QUICK VIEW MODAL
// ============================================

document.addEventListener('click', async function(e) {
  const quickViewBtn = e.target.closest('.product-card__quick-view');
  if (!quickViewBtn) return;
  
  e.preventDefault();
  const productUrl = quickViewBtn.dataset.productUrl;
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'quick-view-modal';
  modal.innerHTML = `
    <div class="quick-view-overlay"></div>
    <div class="quick-view-content">
      <button class="quick-view-close">×</button>
      <div class="quick-view-loading">Loading...</div>
    </div>
  `;
  
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  
  // Fetch product content
  try {
    const response = await fetch(productUrl);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const productContent = doc.querySelector('.product__grid');
    
    modal.querySelector('.quick-view-content').innerHTML = `
      <button class="quick-view-close">×</button>
      ${productContent.outerHTML}
    `;
  } catch (error) {
    modal.querySelector('.quick-view-loading').textContent = 'Error loading product';
  }
  
  // Close modal
  modal.querySelector('.quick-view-close').addEventListener('click', () => {
    modal.remove();
    document.body.style.overflow = '';
  });
  
  modal.querySelector('.quick-view-overlay').addEventListener('click', () => {
    modal.remove();
    document.body.style.overflow = '';
  });
});

// ============================================
// PRODUCT RECOMMENDATIONS
// ============================================

const recommendationsContainer = document.getElementById('product-recommendations');
if (recommendationsContainer) {
  const productId = recommendationsContainer.dataset.productId;
  
  fetch(`/recommendations/products.json?product_id=${productId}&limit=4`)
    .then(response => response.json())
    .then(data => {
      if (data.products && data.products.length > 0) {
        let html = '<div style="margin-top: 8rem;"><h2 style="text-align: center; font-size: 4rem; margin-bottom: 5rem; color: var(--color-maroon);">You May Also Like</h2><div class="grid grid--4">';
        
        data.products.forEach(product => {
          const price = (product.price / 100).toFixed(2);
          html += `
            <div class="product-card">
              <a href="${product.url}">
                <div class="product-card__image-wrapper">
                  <img src="${product.featured_image}" alt="${product.title}" class="product-card__image" loading="lazy">
                </div>
                <h3 class="product-card__title">${product.title}</h3>
                <div class="product-card__price">$${price}</div>
              </a>
            </div>
          `;
        });
        
        html += '</div></div>';
        recommendationsContainer.innerHTML = html;
      }
    })
    .catch(error => console.error('Error loading recommendations:', error));
}

// Initialize cart count on page load
fetch('/cart.js')
  .then(response => response.json())
  .then(cart => updateCartCount(cart.item_count))
  .catch(error => console.error('Error loading cart:', error));