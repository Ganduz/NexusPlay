# NexusPlay

## Progetto di Tecnologie Internet

**Corso:** Tecnologie Internet  
**Sviluppatori:** Gandolfi Davide, Alex Medioli

---

## Descrizione del Progetto

NexusPlay è una piattaforma web di e-commerce per videogiochi digitali. Consente agli utenti di navigare un catalogo di giochi, visualizzare dettagli (prezzi, piattaforme, edizioni, requisiti di sistema, screenshot e trailer), gestire una lista dei desideri, recensire e votare recensioni, aggiungere prodotti al carrello e completare ordini simulati con generazione di chiavi seriali.

## Architettura Generale

L'applicazione segue un'architettura **client-server** con separazione tra frontend e backend:

- **Client** (`client/`): Sviluppato in React, Javascript e CSS.
- **Server** (`server/`): Sviluppato in Node.js, Express, Database mariaDB(xampp).
- **API Esterna**: RAWG Video Games Database API (metadati, screenshot, trailer).

## Funzionalità

- **Autenticazione** — registrazione e login con email/password
- **Navigazione Giochi** — sezioni della homepage (in evidenza, nuove uscite, di tendenza, preordini, migliori offerte), pagine di dettaglio con screenshot, trailer e serie
- **Ricerca** — ricerca full-text con filtri per piattaforma, fascia di prezzo e ordinamento; risultati dal database locale arricchiti con i metadati di RAWG (immagini, valutazioni, generi)
- **Carrello** — localStorage per gli utenti anonimi, memorizzazione su database per gli utenti registrati, unione automatica al momento del login
- **Pagamento (Checkout)** — flusso di pagamento simulato, conferma dell'ordine con generazione delle chiavi seriali
- **Cronologia Ordini** — elenco ordini con tutti i dettagli
- **Lista dei Desideri (Wishlist)** — aggiunta/rimozione dei giochi, verifica dello stato per singolo gioco
- **Recensioni** — valutazioni da 1 a 5 stelle con titolo e testo, votazione utile/non utile (up/down voting), una sola recensione per utente per ciascun gioco
- **Profili Utente** — caricamento dell'avatar, biografia, libreria dei giochi (giochi acquistati), bacheca delle recensioni personali

## Database

### Schema ER

Il database è composto da **10 tabelle**:

| Tabella          | Descrizione                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------- |
| `users`          | Utenti registrati (email, username, password_hash, avatar)                                    |
| `games`          | Catalogo giochi con metadati locali (slug, nome, flag featured/new/trending/preorder)         |
| `platforms`      | Piattaforme di gioco (PC, PS5, Xbox Series X\|S, Nintendo Switch)                             |
| `game_editions`  | Edizioni per gioco (Standard, Deluxe, Ultimate)                                               |
| `game_platforms` | Associazioni gioco-piattaforma-edizione con prezzo, sconto e `final_price` (colonna GENERATA) |
| `cart_items`     | Carrello utente con quantità                                                                  |
| `orders`         | Ordini completati con numero ordine univoco, totale, stato pagamento                          |
| `order_items`    | Prodotti acquistati                                                                           |
| `wishlist`       | Lista desideri utente-gioco                                                                   |
| `reviews`        | Recensioni (1-5 stelle, titolo, corpo, flag edited)                                           |
| `review_votes`   | Voti up/down sulle recensioni (toggle)                                                        |

## Backend

### Struttura

```
routes/      → Definizione endpoint (metodo + path + middleware)
controllers/ → Gestione richieste HTTP (req/res)
services/    → Logica di business complessa (ordini, RAWG, auth, cache)
models/      → Data access layer (query SQL pure)
middleware/  → Auth JWT, rate limiting, upload file, validazione, error handler
validators/  → Regole express-validator
utils/       → Classi helper
```

### API Endpoints (alcuni)

| Area         | Endpoint                                                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth**     | `POST /api/auth/register`, `/login`, `/refresh`, `/logout`, `GET /me`                                                                                                                 |
| **Games**    | `GET /api/games` (catalogo filtrato), `/homepage` (sezioni), `/search`, `/genres`, `/:slug` (dettaglio), `/:slug/screenshots`, `/:slug/trailers`, `/:slug/series`, `/:slug/platforms` |
| **Cart**     | `GET /`, `POST /`, `DELETE /:itemId`, `DELETE /`, `POST /merge`                                                                                                                       |
| **Orders**   | `POST /` (crea con transazione), `GET /` (storico), `GET /:id` (dettaglio)                                                                                                            |
| **Wishlist** | `GET /`, `POST /:gameId` (toggle), `GET /check/:gameId`                                                                                                                               |
| **Reviews**  | `GET /games/:slug/reviews`, `POST /games/:slug/reviews`, `PUT /reviews/:reviewId`, `DELETE /reviews/:reviewId`, `POST /reviews/:reviewId/vote`                                        |
| **Profile**  | `GET /`, `PUT /`, `POST /avatar`, `GET /dashboard`, `GET /library`, `GET /reviews`                                                                                                    |

### Integrazione Esterna

- **RAWG API**: recupero metadati (descrizioni, immagini, rating, generi, publisher, sviluppatori), screenshot, trailer

## Frontend

### Struttura

```
api/         → Funzioni Axios per ogni dominio (auth, games, cart, orders, profile, reviews, wishlist)
components/  → Componenti riutilizzabili suddivisi per dominio (common/, game/, home/, profile/)
pages/       → Componenti route-level (HomePage, GamePage, SearchPage, CartPage, CheckoutPage, ProfilePage, Auth)
store/       → Stato globale con Zustand (authStore, cartStore, uiStore)
hooks/       → Custom hook (useDebounce, useClickOutside)
styles/      → CSS
utils/       → Formattatori (prezzi €, date), costanti (piattaforme, opzioni ordinamento)
```

### Pagine

| Pagina                       | Descrizione                                                                                         |
| ---------------------------- | --------------------------------------------------------------------------------------------------- |
| **HomePage**                 | Hero banner + sezioni Featured/New Releases/Trending/Preorders/Best Deals con PlatformTabs          |
| **GamePage**                 | Dettaglio gioco: hero, selettore piattaforma/edizione, galleria multimediale, requisiti, recensioni |
| **SearchPage**               | Ricerca con filtri (piattaforma, prezzo, ordinamento) e griglia risultati                           |
| **CartPage**                 | Carrello con items, riepilogo prezzi, pulsante checkout                                             |
| **CheckoutPage**             | Riepilogo ordine e pagamento simulato                                                               |
| **OrderConfirmationPage**    | Conferma con serial keys                                                                            |
| **ProfilePage**              | Dashboard, Libreria, Ordini, Recensioni, Wishlist, Impostazioni (tab)                               |
| **LoginPage / RegisterPage** | Form autenticazione con merge carrello post-login                                                   |
| **NotFoundPage**             | Pagina 404                                                                                          |

## Project Structure

```
nexusplay/
├── client/                     # React front-end
│   ├── public/
│   ├── src/
│   │   ├── api/                # Axios instances & API helpers
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
│
├── server/                     # Express back-end
│   ├── scripts/
│   │   ├── schema.sql          # Database DDL
│   │   ├── migrate.js          # Migration runner
│   │   ├── seed.js             # Seed runner
│   │   └── seedData.js         # seed data
│   ├── src/
│   │   ├── config/             # env, database pool, passport
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/          # auth, upload, rate-limiter, validate
│   │   ├── models/             # Raw SQL data-access layer
│   │   ├── routes/             # Express routers
│   │   ├── services/           # Business logic (auth, orders, RAWG, mail)
│   │   ├── utils/              # ApiError, asyncHandler
│   │   ├── validators/         # express-validator rule sets
│   │   ├── app.js              # Express app setup
│   │   └── index.js            # Server entry point
│   ├── uploads/                # User-uploaded files (avatars)
│   ├── .env                    # Environment variables (not committed)
│
│
└── README.md
```

## Installazione e Avvio

1. Clonare il repository
2. Installare dipendenze: `cd client && npm install` e `cd server && npm install`
3. Configurare il file `.env` in `server/` (gia configurato)
4. Creare database: `npm run migrate` (esegue `schema.sql`)
5. Popolare con dati di esempio: `npm run seed` (giochi da RAWG)
6. Avviare server: `npm run dev` (porta 5000)
7. Avviare client: `npm run dev` (porta 5173)

---
