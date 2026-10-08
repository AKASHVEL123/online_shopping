// static/script.js
// Simple Vanilla JavaScript for Online Shopping System

/**
 * Confirm before deleting a product
 * @param {string} productName - The name of the product to delete
 * @returns {boolean} - true if user confirms, false otherwise
 */
function confirmDelete(productName) {
    var message = "Are you sure you want to delete this product?";
    if (productName) {
        message = 'Are you sure you want to delete "' + productName + '"?';
    }
    return window.confirm(message);
}

// Client-side validation helper when form is submitted
document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("productForm");
    if (form) {
        form.addEventListener("submit", function (event) {
            var nameInput = document.getElementById("name");
            var priceInput = document.getElementById("price");
            var quantityInput = document.getElementById("quantity");

            if (nameInput && nameInput.value.trim() === "") {
                alert("Please enter a valid product name.");
                nameInput.focus();
                event.preventDefault();
                return false;
            }

            if (priceInput && parseFloat(priceInput.value) < 0) {
                alert("Price cannot be negative.");
                priceInput.focus();
                event.preventDefault();
                return false;
            }

            if (quantityInput && parseInt(quantityInput.value, 10) < 0) {
                alert("Quantity cannot be negative.");
                quantityInput.focus();
                event.preventDefault();
                return false;
            }
        });
    }
});
