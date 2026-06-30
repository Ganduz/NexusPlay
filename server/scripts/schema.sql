CREATE DATABASE IF NOT EXISTS nexusplay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nexusplay;

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email           VARCHAR(255) NOT NULL,
  username        VARCHAR(50) NOT NULL,
  password_hash   VARCHAR(255) NULL,
  avatar_url      VARCHAR(500) DEFAULT NULL,
  role            ENUM('customer','admin') DEFAULT 'customer',
  provider        ENUM('local') DEFAULT 'local',
  provider_id     VARCHAR(255) DEFAULT NULL,
  email_verified  BOOLEAN DEFAULT FALSE,
  bio             VARCHAR(500) DEFAULT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_username (username),
  INDEX idx_users_provider (provider, provider_id)
) ENGINE=InnoDB;


-- GAMES (metadata locale + link RAWG)
CREATE TABLE IF NOT EXISTS games (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  rawg_id      INT UNSIGNED NOT NULL,
  slug         VARCHAR(255) NOT NULL,
  name         VARCHAR(255) NOT NULL,
  release_date DATE DEFAULT NULL,
  is_new       BOOLEAN DEFAULT FALSE,
  is_trending  BOOLEAN DEFAULT FALSE,
  is_preorder  BOOLEAN DEFAULT FALSE,
  featured     BOOLEAN DEFAULT FALSE,
  active       BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_games_rawg_id (rawg_id),
  UNIQUE KEY uq_games_slug (slug),
  INDEX idx_games_is_new (is_new, active),
  INDEX idx_games_is_trending (is_trending, active),
  INDEX idx_games_is_preorder (is_preorder, active),
  INDEX idx_games_featured (featured, active),
  INDEX idx_games_release_date (release_date)
) ENGINE=InnoDB;

-- PLATFORMS (lookup table)
CREATE TABLE IF NOT EXISTS platforms (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug       VARCHAR(50) NOT NULL,
  name       VARCHAR(100) NOT NULL,
  icon       VARCHAR(50) DEFAULT NULL,
  sort_order TINYINT UNSIGNED DEFAULT 0,
  UNIQUE KEY uq_platforms_slug (slug)
) ENGINE=InnoDB;

-- GAME EDITIONS (Standard, Deluxe, Ultimate)
CREATE TABLE IF NOT EXISTS game_editions (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  game_id    INT UNSIGNED NOT NULL,
  name       VARCHAR(100) NOT NULL,
  slug       VARCHAR(100) NOT NULL,
  sort_order TINYINT UNSIGNED DEFAULT 0,
  UNIQUE KEY uq_edition_game_slug (game_id, slug),
  CONSTRAINT fk_editions_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- GAME PLATFORMS (prezzo per game + piattaforma + edizione)
CREATE TABLE IF NOT EXISTS game_platforms (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  game_id          INT UNSIGNED NOT NULL,
  platform_id      INT UNSIGNED NOT NULL,
  edition_id       INT UNSIGNED NOT NULL,
  base_price       DECIMAL(10,2) NOT NULL,
  discount_percent TINYINT UNSIGNED DEFAULT 0,
  final_price      DECIMAL(10,2) GENERATED ALWAYS AS (ROUND(base_price * (1 - discount_percent / 100), 2)) STORED,
  stock_status     ENUM('available','out_of_stock','preorder') DEFAULT 'available',
  delivery_type    ENUM('digital_key','digital_download') DEFAULT 'digital_key',
  active           BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_gp_combo (game_id, platform_id, edition_id),
  INDEX idx_gp_platform (platform_id),
  INDEX idx_gp_price (final_price),
  INDEX idx_gp_stock (stock_status),
  CONSTRAINT fk_gp_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  CONSTRAINT fk_gp_platform FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE RESTRICT,
  CONSTRAINT fk_gp_edition FOREIGN KEY (edition_id) REFERENCES game_editions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- CART ITEMS
CREATE TABLE IF NOT EXISTS cart_items (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id          INT UNSIGNED NOT NULL,
  game_platform_id INT UNSIGNED NOT NULL,
  quantity         TINYINT UNSIGNED DEFAULT 1,
  added_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cart_user_gp (user_id, game_platform_id),
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_gp FOREIGN KEY (game_platform_id) REFERENCES game_platforms(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NOT NULL,
  order_number   VARCHAR(20) NOT NULL,
  status         ENUM('pending','completed','cancelled','refunded') DEFAULT 'pending',
  subtotal       DECIMAL(10,2) NOT NULL,
  discount_total DECIMAL(10,2) DEFAULT 0.00,
  total          DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'simulated',
  payment_status ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_order_number (order_number),
  INDEX idx_orders_user (user_id),
  INDEX idx_orders_status (status),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id         INT UNSIGNED NOT NULL,
  game_platform_id INT UNSIGNED NOT NULL,
  game_name        VARCHAR(255) NOT NULL,
  platform_name    VARCHAR(100) NOT NULL,
  edition_name     VARCHAR(100) NOT NULL,
  base_price       DECIMAL(10,2) NOT NULL,
  discount_percent TINYINT UNSIGNED DEFAULT 0,
  final_price      DECIMAL(10,2) NOT NULL,
  quantity         TINYINT UNSIGNED DEFAULT 1,
  serial_key       VARCHAR(255) DEFAULT NULL,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_oi_order (order_id),
  CONSTRAINT fk_oi_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_oi_gp FOREIGN KEY (game_platform_id) REFERENCES game_platforms(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- WISHLIST
CREATE TABLE IF NOT EXISTS wishlist (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  game_id     INT UNSIGNED NOT NULL,
  platform_id INT UNSIGNED DEFAULT NULL,
  added_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_wishlist_user_game (user_id, game_id),
  CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_platform FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  game_id    INT UNSIGNED NOT NULL,
  rating     TINYINT UNSIGNED NOT NULL,
  title      VARCHAR(200) DEFAULT NULL,
  body       TEXT DEFAULT NULL,
  is_edited  BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_review_user_game (user_id, game_id),
  INDEX idx_reviews_game (game_id),
  INDEX idx_reviews_rating (rating),
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  CONSTRAINT chk_rating_range CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB;

-- REVIEW VOTES
CREATE TABLE IF NOT EXISTS review_votes (
  id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  review_id INT UNSIGNED NOT NULL,
  user_id   INT UNSIGNED NOT NULL,
  vote_type ENUM('up','down') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_vote_user_review (user_id, review_id),
  CONSTRAINT fk_votes_review FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  CONSTRAINT fk_votes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
 
-- SEED PLATFORMS
INSERT IGNORE INTO platforms (slug, name, icon, sort_order) VALUES
  ('pc', 'PC', 'icon-pc', 1),
  ('playstation5', 'PlayStation 5', 'icon-ps5', 2),
  ('xbox-series-x', 'Xbox Series X|S', 'icon-xbox', 3),
  ('nintendo-switch', 'Nintendo Switch', 'icon-switch', 4);
