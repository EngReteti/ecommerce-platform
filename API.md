# API Reference

## Authentication Endpoints
- **`POST /api/auth/register`** — Register a new user account (supports role assignment such as customer or seller).
- **`POST /api/auth/login`** — Authenticate existing user credentials and return a JSON Web Token (JWT) for secure session handling.

## Product Endpoints
- **`GET /api/products`** — Retrieve a public list of all available products in the catalog.
- **`POST /api/products`** — Create a new product listing (requires seller authorization/JWT role verification).

## Shopping Cart Endpoints
- **`GET /api/cart`** — Retrieve the current authenticated user's shopping cart items.
- **`POST /api/cart`** — Add a product item to the user's cart (handles automatic quantity merging).

## Order & Checkout Endpoints
- **`POST /api/orders`** — Convert current cart items into a transaction-safe order, automatically reducing stock levels and clearing the active cart.

## Payment Gateway Endpoints
- **`POST /api/payments/stk-push`** — Initiate a Safaricom M-Pesa Daraja STK Push mobile payment request for order checkout.

