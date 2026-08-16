# E-Commerce Platform

A full-featured e-commerce backend, designed to help people list products, purchase items, manage orders, process payments, and track deliveries — with built-in impact features for sellers.

## Features

- **User authentication** — secure registration and login with JWT tokens, bcrypt password hashing
- **Product listings** — sellers can create, edit, and delete products; public browsing with no login required
- **Shopping cart** — add, update, and remove items, with automatic quantity merging
- **Checkout** — transaction-safe order creation with automatic stock reduction and cart clearing
- **Payments** — three integrated methods:
  - Stripe (international cards)
  - M-Pesa (STK Push, Safaricom Daraja API)
  - Airtel Money
- **Delivery tracking** — auto-created at checkout, status updates from dispatch to delivery
- **Product reviews & ratings** — verified-purchase enforcement, one review per buyer per product
- **Low-stock alerts** — configurable threshold, helps sellers avoid overselling
- **Seller analytics dashboard** — sales summary, top products, recent orders, low-stock count in one view

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Authentication:** JWT, bcrypt
- **Payments:** Stripe SDK, Safaricom Daraja API, Airtel Money API
- **Development environment:** Termux (Android)

## Project Structure

```text
src/
├── config/       # Database connection setup
├── controllers/  # Request handling and business logic
├── middleware/   # Auth and role-based access checks
├── migrations/   # SQL files defining the database schema
├── models/       # Database queries, organized by resource
├── routes/       # API endpoint definitions
├── app.js        # Express app setup
└── server.js     # Entry point / server listener
```

## Getting Started

### Prerequisites
- Node.js and npm
- PostgreSQL

### Installation

```bash
git clone https://github.com/EngReteti/ecommerce-platform.git
cd ecommerce-platform
npm install
```

## Environment Setup

Create a .env file in the root directory with the following:
```env

DB_USER=postgres
DB_HOST=127.0.0.1
DB_NAME=ecommerce_db
DB_PASSWORD=
DB_PORT=5432
PORT=5000
JWT_SECRET=your_secret_key
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
MPESA_CONSUMER_KEY=your_mpesa_key
MPESA_CONSUMER_SECRET=your_mpesa_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_mpesa_passkey
MPESA_CALLBACK_URL=your_callback_url
AIRTEL_CLIENT_ID=your_airtel_client_id
AIRTEL_CLIENT_SECRET=your_airtel_client_secret
```

## Database Setup

```bash
psql -U postgres -d ecommerce_db -f src/migrations/001_init_schema.sql
psql -U postgres -d ecommerce_db -f src/migrations/002_add_cart.sql
psql -U postgres -d ecommerce_db -f src/migrations/003_add_reviews.sql
```

## Running the Server

```bash
npm run dev

Server runs on http://localhost:5000 by default.
```

## API Documentation

See [API.md](./API.md) for the full list of endpoints.


## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

MIT
