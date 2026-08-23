# E-Commerce Platform

A full-featured e-commerce marketplace, designed to help people list products, purchase items, manage orders, process payments, and track deliveries — with built-in impact features for sellers.

**Live demo:** https://ecommerce-platform-09ag.onrender.com

## Features

- **User authentication** — secure registration and login with JWT tokens, bcrypt password hashing
- **Product listings** — sellers can create, edit, and delete products; public browsing with no login required
- **Product photos** — sellers upload real product images via Cloudinary, automatically resized and optimized
- **Search & category filtering** — buyers can search by name and filter by category on the storefront
- **Shopping cart** — add, update, and remove items, with automatic quantity merging
- **Checkout** — transaction-safe order creation with automatic stock reduction and cart clearing
- **Payments** — three integrated methods:
  - Stripe (international cards) — live
  - M-Pesa (STK Push, Safaricom Daraja API)
  - Airtel Money
- **Delivery tracking** — auto-created at checkout, status updates from dispatch to delivery, with live auto-refresh for buyers
- **Product reviews & ratings** — verified-purchase enforcement (only buyers with a completed, paid order can review), one review per buyer per product, reviewer names shown
- **Seller product management** — dedicated "My Products" view with inline stock updates, deletion, and low-stock warnings
- **Seller analytics dashboard** — sales summary, top products, recent orders, low-stock count in one view
- **Custom visual identity** — a "Duka Sign Painting" design system (bold colors, thick borders, hard shadows) inspired by Kenyan hand-painted shop signage, applied consistently across the whole app

## Tech Stack

- **Backend:** JavaScript, Node.js, Express
- **Frontend:** React (Vite)
- **Database:** PostgreSQL
- **Authentication:** JWT, bcrypt
- **Payments:** Stripe SDK, Safaricom Daraja API, Airtel Money API
- **Image storage:** Cloudinary
- **Development environment:** Termux
- **Deployment:** Render (backend + PostgreSQL)

## Project Structure

```text
src/
├── config/       # Database and Cloudinary connection setup
├── controllers/  # Request handling and business logic
├── middleware/   # Auth, role-based access checks, image upload handling
├── migrations/   # SQL files defining the database schema
├── models/       # Database queries, organized by resource
├── routes/       # API endpoint definitions
├── app.js        # Express app setup
└── server.js     # Entry point / server listener

client/
├── src/
│   ├── components/  # React views (Shop, Cart, My Orders, Sell, My Products, Dashboard, Login)
│   ├── context/      # Cart state management
│   ├── theme.css      # Design system tokens (colors, fonts, shared styles)
│   └── App.jsx        # Main app shell and tab navigation
```


## Getting Started
**Prerequisites:**
*Node.js and npm
*PostgreSQL

**Installation**

```bash
git clone https://github.com/EngReteti/ecommerce-platform.git

cd ecommerce-platform
npm install
cd client && npm install
```

## Environment Setup

Create a `.env` file in the root directory with the following:

```env
DB_USER=postgres
DB_HOST=127.0.0.1
DB_NAME=ecommerce_db
DB_PASSWORD=
DB_PORT=5432
PORT=5000
JWT_SECRET=your_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
UPESA_CONSUMER_KEY=your_mpesa_key
UPESA_CONSUMER_SECRET=your_mpesa_secret
UPESA_SHORTCODE=174379
UPESA_PASSKEY=your_mpesa_passkey
UPESA_CALLBACK_URL=your_callback_url
AIRTEL_CLIENT_ID=your_airtel_client_id
AIRTEL_CLIENT_SECRET=your_airtel_client_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret


Create a separate .env file inside client/ with:
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Database Setup

```bash
psql -U postgres -d ecommerce_db -f src/migrations/001_init_schema.sql
psql -U postgres -d ecommerce_db -f src/migrations/002_add_cart.sql
psql -U postgres -d ecommerce_db -f src/migrations/003_add_reviews.sql


Running the Server
Backend:
npm run dev
Server runs on http://localhost:5000 by default.

Frontend:
cd client
npm run dev
Runs on http://localhost:5173 by default.
```

## API Documentation
See the [API Documentation](API.md) for the full list of endpoints.


Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.


## Deployment

This service is deployed live on Render as a cloud Web Service, with a managed PostgreSQL database also on Render, and images hosted on Cloudinary. To replicate or deploy your own instance:

1. **Database Provisioning**
   Provision a managed PostgreSQL instance (e.g., Supabase, Railway, or Render PostgreSQL). 
   Run the schema migration scripts in sequence using `psql`:
   ```bash
   psql -h <HOST> -U <USER> -d <DATABASE> -f src/migrations/001_init_schema.sql
   psql -h <HOST> -U <USER> -d <DATABASE> -f src/migrations/002_add_cart.sql
   psql -h <HOST> -U <USER> -d <DATABASE> -f src/migrations/003_add_reviews.sql
  ```

2. **Environment Variables**
Inject all values defined in .env into your host's secrets settings:
​```bash
Set NODE_ENV=production.
Ensure MPESA_CALLBACK_URL points to your live, SSL-secured domain.
​Ensure Cloudinary credentials are set for product image uploads.
```

3. **Server Management**
Run a process manager like PM2 to keep the API server alive:
```bash
npm install -g pm2
pm2 start src/server.js --name "ecommerce-api"
```


## License
MIT

