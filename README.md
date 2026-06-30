# NexusPlay

Progetto Universitario Ecommerce Videogiochi sviluppato da Gandolfi Davide e Alex Medioli per il corso di Tecnologie Internet.

## Features

- **Authentication** — email/password registration & login, Google OAuth 2.0, JWT access + refresh token rotation
- **Game Browsing** — homepage sections (featured, new releases, trending, pre-orders, best deals), detail pages with screenshots, trailers and series
- **Search** — full-text search with platform, price range and sort filters; results from local DB enriched with RAWG metadata (images, ratings, genres)
- **Cart** — localStorage for anonymous users, database-backed for logged-in users, automatic merge on login
- **Checkout** — simulated payment flow (no real gateway), order confirmation with generated serial keys
- **Order History** — paginated list with full order details
- **Wishlist** — toggle games in/out, check status per game
- **Reviews** — 1-5 star ratings with title and body, up/down voting, one review per user per game
- **User Profiles** — avatar upload, bio, game library (purchased games), personal reviews dashboard
- **Seed Data** — 24 games pre-loaded from the RAWG API across 4 platforms

<br>

| API                                                  | Purpose                                                                   |
| ---------------------------------------------------- | ------------------------------------------------------------------------- |
| [RAWG Video Games Database](https://rawg.io/apidocs) | Game metadata, screenshots, trailers (proxied through the Express server) |

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/nexusplay.git
cd nexusplay
```

### 2. Install dependencies

```bash
# Client
cd client
npm install

# Server
cd ../server
npm install
```

### 3. Configure environment variables

Create a `.env` file inside `server/` then fill in the values
<br>

### 4. Create the database and run migrations

```bash
cd server
npm run migrate
```

This executes `scripts/schema.sql` which creates the `nexusplay` database, all tables and seeds the platform lookup table.

### 5. Seed the game catalogue

```bash
npm run seed
```

Inserts 24 games with editions, platforms and pricing pulled from `scripts/seedData.js`.

### 6. Start the development servers

Open **two terminals**:

```bash
# Terminal 1 — Server (port 5000)
cd server
npm run dev

# Terminal 2 — Client (port 5173)
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
nexusplay/
├── client/                     # React front-end
│   ├── public/
│   ├── src/
│   │   ├── api/                # Axios instances & API helpers
│   │   ├── assets/             # Static assets (images, fonts)
│   │   ├── components/         # Reusable UI components
│   │   │   ├── common/         #   Shared (Navbar, Footer, Loader…)
│   │   │   ├── game/           #   Game cards, detail sections
│   │   │   ├── home/           #   Homepage sections & hero
│   │   │   └── profile/        #   Profile tabs & forms
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Route-level page components
│   │   ├── store/              # Zustand stores (auth, cart, ui)
│   │   ├── styles/             # CSS organized by domain (pages/, components/)
│   │   ├── utils/              # Helpers & constants
│   │   ├── App.jsx             # Root component & router
│   │   └── main.jsx            # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Express back-end
│   ├── scripts/
│   │   ├── schema.sql          # Database DDL
│   │   ├── migrate.js          # Migration runner
│   │   ├── seed.js             # Seed runner
│   │   └── seedData.js         # 24 games seed data
│   ├── src/
│   │   ├── config/             # env, database pool, passport
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/          # auth, upload, rate-limiter, validate
│   │   ├── models/             # Raw SQL data-access layer
│   │   ├── routes/             # Express routers
│   │   ├── services/           # Business logic (auth, orders, RAWG, mail)
│   │   ├── templates/          # Email HTML templates
│   │   ├── utils/              # ApiError, asyncHandler
│   │   ├── validators/         # express-validator rule sets
│   │   ├── app.js              # Express app setup
│   │   └── index.js            # Server entry point
│   ├── uploads/                # User-uploaded files (avatars)
│   ├── .env                    # Environment variables (not committed)
│   └── package.json
│
│
└── README.md
```
