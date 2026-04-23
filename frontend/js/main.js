// main.js - Common functionality across the site

document.addEventListener('DOMContentLoaded', async () => {
    // 2. Render Navbar and Footer (assuming components are standard across non-auth pages)
    // Note: In a real implementation this might be done server-side or via a framework.
    
    // Here we'll just handle cart badge updates.
    await updateCartBadge();
});



// -- Utility Functions --
function showToast(message, type = 'success') {
    // Requires Bootstrap Toast setup in HTML, falling back to alert for simplicity if not present
    alert(`${type.toUpperCase()}: ${message}`);
}

async function updateCartBadge() {
    const badge = document.getElementById('cart-count');
    if (badge) {
        const token = localStorage.getItem('token');
        let totalItems = 0;
        
        if (token && typeof getCartAPI === 'function') {
            try {
                const cart = await getCartAPI();
                if (Array.isArray(cart)) {
                    totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                }
            } catch (e) {
                console.error("Failed to fetch cart for badge:", e);
            }
        }
        
        badge.innerText = totalItems;
        badge.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}


function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}
