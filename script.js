document.addEventListener("DOMContentLoaded", () => {
    const categoriesContainer = document.getElementById("categories");
    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");
    const basketContainer = document.getElementById("basketContainer");
    const checkoutContainer = document.getElementById("checkoutContainer");

    // Load basket
    const loadBasket = () => JSON.parse(localStorage.getItem("basket")) || [];
    let basket = loadBasket();

    // Update Basket Count 
    const updateBasketCount = () => {
        const basketCountElement = document.getElementById("basketCount");
        if (basketCountElement) {
            basketCountElement.textContent = basket.length;
        }
    };

    updateBasketCount();

    // Add to Basket
    const addToBasket = (product) => {
        basket = loadBasket(); // Reload basket 
        const existingProduct = basket.find((item) => item.id === product.id);
        if (!existingProduct) {
            basket.push(product);
            localStorage.setItem("basket", JSON.stringify(basket));
            alert(`${product.name} added to your basket!`);
            updateBasketCount();
        } else {
            alert(`${product.name} is already in your basket.`);
        }
    };

    // Render Categories
    if (categoriesContainer) {
        fetch("products.json")
            .then((response) => response.json())
            .then((data) => {
                const categories = data.categories;

                categories.forEach((category) => {
                    const categoryElement = document.createElement("div");
                    categoryElement.classList.add("category");

                    const categoryTitle = document.createElement("h2");
                    categoryTitle.textContent = category.name;
                    categoryElement.appendChild(categoryTitle);

                    category.products.forEach((product) => {
                        const productId = `${category.id}-${product.name.replace(/\s+/g, '-').toLowerCase()}`;

                        const productElement = document.createElement("div");
                        productElement.classList.add("product");

                        productElement.innerHTML = `
                            <img src="${product.image}" alt="${product.name}">
                            <p><strong>Name:</strong> ${product.name}</p>
                            <p><strong>Specifications:</strong> ${product.specs}</p>
                            <p><strong>Price:</strong> $${product.price}</p>
                            <button class="add-to-basket" 
                                data-id="${productId}" 
                                data-name="${product.name}" 
                                data-price="${product.price}" 
                                data-image="${product.image}">
                                Add to Basket
                            </button>
                        `;

                        productElement.querySelector(".add-to-basket").addEventListener("click", (e) => {
                            const button = e.target;
                            const productToAdd = {
                                id: button.getAttribute("data-id"),
                                name: button.getAttribute("data-name"),
                                price: button.getAttribute("data-price"),
                                image: button.getAttribute("data-image"),
                            };
                            addToBasket(productToAdd);
                        });

                        categoryElement.appendChild(productElement);
                    });

                    categoriesContainer.appendChild(categoryElement);
                });
            })
            .catch((error) => console.error("Error loading categories:", error));
    }

    // Search Page
    if (searchInput && searchResults) {
        let allProducts = [];

        // Fetch 
        fetch("products.json")
            .then((response) => response.json())
            .then((data) => {
                const categories = data.categories;
                categories.forEach((category) => {
                    category.products.forEach((product) => {
                        const productId = `${category.id}-${product.name.replace(/\s+/g, '-').toLowerCase()}`;
                        allProducts.push({
                            ...product,
                            id: productId,
                        });
                    });
                });
            })
            .catch((error) => console.error("Error loading products:", error));

        // Handle search
        searchInput.addEventListener("input", () => {
            const query = searchInput.value.toLowerCase();
            searchResults.innerHTML = "";

            if (query) {
                const filteredProducts = allProducts.filter((product) =>
                    product.name.toLowerCase().includes(query)
                );

                if (filteredProducts.length > 0) {
                    filteredProducts.forEach((product) => {
                        const productCard = document.createElement("div");
                        productCard.className = "product-card";

                        productCard.innerHTML = `
                            <img src="${product.image}" alt="${product.name}" class="product-image">
                            <h3>${product.name}</h3>
                            <p><strong>Specifications:</strong> ${product.specs}</p>
                            <p><strong>Price:</strong> $${product.price}</p>
                            <button class="add-to-basket" 
                                data-id="${product.id}" 
                                data-name="${product.name}" 
                                data-price="${product.price}" 
                                data-image="${product.image}">
                                Add to Basket
                            </button>
                        `;

                        productCard.querySelector(".add-to-basket").addEventListener("click", (e) => {
                            const button = e.target;
                            const productToAdd = {
                                id: button.getAttribute("data-id"),
                                name: button.getAttribute("data-name"),
                                price: button.getAttribute("data-price"),
                                image: button.getAttribute("data-image"),
                            };
                            addToBasket(productToAdd);
                        });

                        searchResults.appendChild(productCard);
                    });
                } else {
                    searchResults.innerHTML = `<p>No products found.</p>`;
                }
            }
        });
    }

    // Render Basket 
    if (basketContainer) {
        const renderBasket = () => {
            basket = loadBasket(); // Reload basket for consistency
            basketContainer.innerHTML = "";

            if (basket.length === 0) {
                basketContainer.innerHTML = "<p>Your basket is empty. Add items to proceed.</p>";
                return;
            }

            basket.forEach((item, index) => {
                const itemElement = document.createElement("div");
                itemElement.classList.add("basket-item");

                itemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="basket-item-image">
                    <p><strong>${item.name}</strong></p>
                    <p>Price: $${item.price}</p>
                    <button class="remove-from-basket" data-index="${index}">Remove</button>
                `;

                itemElement.querySelector(".remove-from-basket").addEventListener("click", () => {
                    basket.splice(index, 1);
                    localStorage.setItem("basket", JSON.stringify(basket));
                    renderBasket();
                    updateBasketCount();
                });

                basketContainer.appendChild(itemElement);
            });

            const total = basket.reduce((sum, item) => sum + parseFloat(item.price), 0);
            const totalElement = document.createElement("div");
            totalElement.classList.add("basket-total");
            totalElement.innerHTML = `
                <p><strong>Total: $${total.toFixed(2)}</strong></p>
                <a href="checkout.html" class="checkout-button">Proceed to Checkout</a>
            `;

            basketContainer.appendChild(totalElement);
        };

        renderBasket();
    }

    // Render Checkout
    if (checkoutContainer) {
        const renderCheckout = () => {
            checkoutContainer.innerHTML = "";

            if (basket.length === 0) {
                checkoutContainer.innerHTML = "<p>Your basket is empty. Add items to proceed with payment.</p>";
                return;
            }

            const orderSummary = document.createElement("div");
            orderSummary.classList.add("order-summary");

            basket.forEach((item) => {
                const itemElement = document.createElement("div");
                itemElement.classList.add("checkout-item");

                itemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="checkout-item-image">
                    <p><strong>${item.name}</strong></p>
                    <p>Price: $${item.price}</p>
                `;

                orderSummary.appendChild(itemElement);
            });

            const total = basket.reduce((sum, item) => sum + parseFloat(item.price), 0);
            const totalElement = document.createElement("div");
            totalElement.classList.add("checkout-total");
            totalElement.innerHTML = `<p><strong>Total: $${total.toFixed(2)}</strong></p>`;
            orderSummary.appendChild(totalElement);

            const paymentForm = document.createElement("form");
            paymentForm.classList.add("payment-form");

            paymentForm.innerHTML = `
                <h2>Payment Details</h2>
                <label for="name">Full Name</label>
                <input type="text" id="name" name="name" placeholder="Enter your name" required>
                <label for="cardNumber">Card Number</label>
                <input type="text" id="cardNumber" name="cardNumber" placeholder="1234 5678 9012 3456" maxlength="16" required>
                <label for="expiry">Expiry Date</label>
                <input type="month" id="expiry" name="expiry" required>
                <label for="cvv">CVV</label>
                <input type="text" id="cvv" name="cvv" placeholder="123" maxlength="3" required>
                <button type="submit" id="payButton" class="pay-button">Pay $${total.toFixed(2)}</button>
            `;

            paymentForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const name = document.getElementById("name").value.trim();
                const cardNumber = document.getElementById("cardNumber").value.trim();
                const expiry = document.getElementById("expiry").value.trim();
                const cvv = document.getElementById("cvv").value.trim();

                if (name && cardNumber.length === 16 && expiry && cvv.length === 3) {
                    alert("Payment successful! Thank you for your purchase.");
                    localStorage.removeItem("basket");
                    window.location.href = "index.html";
                } else {
                    alert("Invalid payment details. Please try again.");
                }
            });

            checkoutContainer.appendChild(orderSummary);
            checkoutContainer.appendChild(paymentForm);
        };

        renderCheckout();
    }
});
