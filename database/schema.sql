-- ============================================================
-- FutureMeal Database Schema
-- MySQL 8.x
-- Run this if JPA ddl-auto is set to 'none' (production)
-- Otherwise JPA creates tables automatically on startup.
-- ============================================================

CREATE DATABASE IF NOT EXISTS futuremeal_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE futuremeal_db;

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id                 BIGINT          AUTO_INCREMENT PRIMARY KEY,
    name               VARCHAR(100)    NOT NULL,
    email              VARCHAR(255)    NOT NULL UNIQUE,
    password           VARCHAR(255)    NOT NULL,
    phone              VARCHAR(15),
    role               ENUM('CUSTOMER','RESTAURANT_OWNER','ADMIN','DELIVERY_PARTNER')
                                       NOT NULL DEFAULT 'CUSTOMER',
    profile_picture    VARCHAR(500),
    dietary_preference ENUM('VEG','NON_VEG','VEGAN','JAIN'),
    spice_preference   ENUM('MILD','MEDIUM','SPICY','EXTRA_SPICY'),
    budget_preference  VARCHAR(50),
    is_active          TINYINT(1)      NOT NULL DEFAULT 1,
    created_at         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role  (role)
);

-- ─── Addresses ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
    id         BIGINT       AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT       NOT NULL,
    label      VARCHAR(50)  NOT NULL,
    street     VARCHAR(255) NOT NULL,
    area       VARCHAR(100) NOT NULL,
    city       VARCHAR(100) NOT NULL,
    state      VARCHAR(100) NOT NULL,
    pincode    VARCHAR(10)  NOT NULL,
    landmark   VARCHAR(200),
    latitude   DOUBLE,
    longitude  DOUBLE,
    is_default TINYINT(1)   NOT NULL DEFAULT 0,
    created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_address_user (user_id)
);

-- ─── Restaurants ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS restaurants (
    id               BIGINT          AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(200)    NOT NULL,
    description      TEXT,
    cover_image      VARCHAR(500),
    logo             VARCHAR(500),
    rating           DECIMAL(3,2)    DEFAULT 0.00,
    total_reviews    INT             DEFAULT 0,
    delivery_time    INT             DEFAULT 30,
    delivery_fee     INT             DEFAULT 0,
    minimum_order    INT             DEFAULT 99,
    street           VARCHAR(255),
    area             VARCHAR(100),
    city             VARCHAR(100),
    restaurant_state VARCHAR(100),
    pincode          VARCHAR(10),
    latitude         DOUBLE,
    longitude        DOUBLE,
    is_open          TINYINT(1)      NOT NULL DEFAULT 1,
    status           ENUM('ACTIVE','INACTIVE','PENDING_APPROVAL','SUSPENDED')
                                     NOT NULL DEFAULT 'PENDING_APPROVAL',
    owner_id         BIGINT,
    created_at       DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_restaurant_status (status),
    INDEX idx_restaurant_city   (city),
    INDEX idx_restaurant_owner  (owner_id)
);

CREATE TABLE IF NOT EXISTS restaurant_cuisines (
    restaurant_id BIGINT       NOT NULL,
    cuisine       VARCHAR(100) NOT NULL,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS restaurant_offers (
    restaurant_id BIGINT       NOT NULL,
    offer         VARCHAR(200) NOT NULL,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS restaurant_tags (
    restaurant_id BIGINT      NOT NULL,
    tag           VARCHAR(50) NOT NULL,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- ─── Food Items ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS food_items (
    id               BIGINT          AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(200)    NOT NULL,
    description      TEXT,
    image            VARCHAR(500),
    price            DECIMAL(10,2)   NOT NULL,
    original_price   DECIMAL(10,2),
    category         VARCHAR(100)    NOT NULL,
    restaurant_id    BIGINT          NOT NULL,
    dietary_type     ENUM('VEG','NON_VEG','EGG','VEGAN','JAIN') NOT NULL DEFAULT 'VEG',
    spice_level      ENUM('MILD','MEDIUM','SPICY','EXTRA_SPICY') DEFAULT 'MEDIUM',
    rating           DECIMAL(3,2)    DEFAULT 0.00,
    total_reviews    INT             DEFAULT 0,
    preparation_time INT             DEFAULT 20,
    is_available     TINYINT(1)      NOT NULL DEFAULT 1,
    is_bestseller    TINYINT(1)      NOT NULL DEFAULT 0,
    is_recommended   TINYINT(1)      NOT NULL DEFAULT 0,
    calories         INT,
    protein          DECIMAL(6,2),
    carbs            DECIMAL(6,2),
    fat              DECIMAL(6,2),
    order_count      INT             DEFAULT 0,
    created_at       DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_food_restaurant (restaurant_id),
    INDEX idx_food_category   (category),
    INDEX idx_food_dietary    (dietary_type),
    INDEX idx_food_available  (is_available)
);

CREATE TABLE IF NOT EXISTS food_allergens (
    food_id   BIGINT      NOT NULL,
    allergen  VARCHAR(50) NOT NULL,
    FOREIGN KEY (food_id) REFERENCES food_items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS food_tags (
    food_id BIGINT      NOT NULL,
    tag     VARCHAR(50) NOT NULL,
    FOREIGN KEY (food_id) REFERENCES food_items(id) ON DELETE CASCADE
);

-- ─── Carts ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS carts (
    id            BIGINT        AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT        NOT NULL UNIQUE,
    restaurant_id BIGINT,
    coupon_code   VARCHAR(50),
    discount      DECIMAL(10,2),
    updated_at    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS cart_items (
    id                   BIGINT       AUTO_INCREMENT PRIMARY KEY,
    cart_id              BIGINT       NOT NULL,
    food_item_id         BIGINT       NOT NULL,
    quantity             INT          NOT NULL DEFAULT 1,
    special_instructions VARCHAR(500),
    FOREIGN KEY (cart_id)      REFERENCES carts(id)      ON DELETE CASCADE,
    FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE
);

-- ─── Orders ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id                    BIGINT          AUTO_INCREMENT PRIMARY KEY,
    order_number          VARCHAR(20)     NOT NULL UNIQUE,
    user_id               BIGINT          NOT NULL,
    restaurant_id         BIGINT          NOT NULL,
    delivery_address_id   BIGINT          NOT NULL,
    status                ENUM('ORDER_PLACED','CONFIRMED','PREPARING','READY_FOR_PICKUP',
                               'OUT_FOR_DELIVERY','DELIVERED','CANCELLED')
                                          NOT NULL DEFAULT 'ORDER_PLACED',
    payment_method        ENUM('UPI','CARD','CASH_ON_DELIVERY','NET_BANKING') NOT NULL,
    payment_status        ENUM('PENDING','PROCESSING','SUCCESS','FAILED','REFUNDED')
                                          NOT NULL DEFAULT 'PENDING',
    subtotal              DECIMAL(10,2)   NOT NULL,
    delivery_fee          DECIMAL(10,2)   DEFAULT 0,
    taxes                 DECIMAL(10,2)   DEFAULT 0,
    discount              DECIMAL(10,2)   DEFAULT 0,
    total                 DECIMAL(10,2)   NOT NULL,
    special_instructions  VARCHAR(500),
    coupon_code           VARCHAR(50),
    estimated_delivery_time INT           DEFAULT 30,
    delivery_partner_id   BIGINT,
    cancellation_reason   VARCHAR(500),
    future_meal_id        BIGINT,
    placed_at             DATETIME        DEFAULT CURRENT_TIMESTAMP,
    confirmed_at          DATETIME,
    preparing_at          DATETIME,
    ready_at              DATETIME,
    picked_up_at          DATETIME,
    delivered_at          DATETIME,
    cancelled_at          DATETIME,
    FOREIGN KEY (user_id)             REFERENCES users(id)       ON DELETE RESTRICT,
    FOREIGN KEY (restaurant_id)       REFERENCES restaurants(id) ON DELETE RESTRICT,
    FOREIGN KEY (delivery_address_id) REFERENCES addresses(id)   ON DELETE RESTRICT,
    FOREIGN KEY (delivery_partner_id) REFERENCES users(id)       ON DELETE SET NULL,
    INDEX idx_order_user        (user_id),
    INDEX idx_order_restaurant  (restaurant_id),
    INDEX idx_order_status      (status),
    INDEX idx_order_number      (order_number),
    INDEX idx_order_placed_at   (placed_at)
);

CREATE TABLE IF NOT EXISTS order_items (
    id                   BIGINT        AUTO_INCREMENT PRIMARY KEY,
    order_id             BIGINT        NOT NULL,
    food_item_id         BIGINT        NOT NULL,
    food_item_name       VARCHAR(200)  NOT NULL,
    food_item_image      VARCHAR(500),
    price                DECIMAL(10,2) NOT NULL,
    quantity             INT           NOT NULL,
    special_instructions VARCHAR(500),
    subtotal             DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ─── Future Meals ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS future_meals (
    id                        BIGINT       AUTO_INCREMENT PRIMARY KEY,
    user_id                   BIGINT       NOT NULL,
    description               VARCHAR(500) NOT NULL,
    planned_date              DATE         NOT NULL,
    planned_time              TIME         NOT NULL,
    max_budget                DECIMAL(10,2) NOT NULL,
    cuisine                   ENUM('SOUTH_INDIAN','NORTH_INDIAN','HYDERABADI','ANDHRA','PUNJABI',
                                   'MUGHLAI','STREET_FOOD','CHINESE','CONTINENTAL','BIRYANI',
                                   'SEAFOOD','DESSERTS','HEALTHY','ANY') DEFAULT 'ANY',
    dietary_preference        ENUM('VEG','NON_VEG','VEGAN','JAIN') DEFAULT 'NON_VEG',
    spice_preference          ENUM('MILD','MEDIUM','SPICY','EXTRA_SPICY') DEFAULT 'MEDIUM',
    preferred_restaurant_id   BIGINT,
    delivery_address_id       BIGINT       NOT NULL,
    special_conditions        VARCHAR(500),
    status                    ENUM('PLANNED','MATCH_FOUND','READY','ORDERED','POSTPONED','CANCELLED','EXPIRED')
                                           NOT NULL DEFAULT 'PLANNED',
    recommended_food_item_id  BIGINT,
    recommended_restaurant_id BIGINT,
    recommendation_score      DECIMAL(5,2),
    recommendation_reason     VARCHAR(1000),
    is_ai_recommended         TINYINT(1)   DEFAULT 0,
    order_id                  BIGINT,
    match_found_at            DATETIME,
    ready_at                  DATETIME,
    ordered_at                DATETIME,
    postponed_at              DATETIME,
    cancelled_at              DATETIME,
    created_at                DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at                DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)                   REFERENCES users(id)      ON DELETE CASCADE,
    FOREIGN KEY (preferred_restaurant_id)   REFERENCES restaurants(id) ON DELETE SET NULL,
    FOREIGN KEY (delivery_address_id)       REFERENCES addresses(id)  ON DELETE RESTRICT,
    FOREIGN KEY (recommended_food_item_id)  REFERENCES food_items(id) ON DELETE SET NULL,
    FOREIGN KEY (recommended_restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL,
    INDEX idx_futuremeal_user   (user_id),
    INDEX idx_futuremeal_status (status),
    INDEX idx_futuremeal_date   (planned_date)
);

-- ─── Reviews ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
    id             BIGINT        AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT        NOT NULL,
    restaurant_id  BIGINT        NOT NULL,
    order_id       BIGINT,
    rating         DECIMAL(3,2)  NOT NULL,
    comment        TEXT,
    food_rating    DECIMAL(3,2),
    delivery_rating DECIMAL(3,2),
    helpful_count  INT           DEFAULT 0,
    created_at     DATETIME      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_review_restaurant (restaurant_id),
    INDEX idx_review_user       (user_id)
);

-- ─── Notifications ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id         BIGINT       AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT       NOT NULL,
    type       VARCHAR(50)  NOT NULL,
    title      VARCHAR(200) NOT NULL,
    message    VARCHAR(500) NOT NULL,
    is_read    TINYINT(1)   DEFAULT 0,
    data_json  VARCHAR(200),
    created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notification_user (user_id),
    INDEX idx_notification_read (is_read)
);
