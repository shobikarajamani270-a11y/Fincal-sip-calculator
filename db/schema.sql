-- ═══════════════════════════════════════════════
-- HDFC SIP Calculator — MySQL Schema
-- Compatible: MySQL 5.7+ / MySQL 8.x
-- ═══════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS sip_calculator
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sip_calculator;

CREATE TABLE IF NOT EXISTS calculations (
  id              BIGINT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  goal_type       VARCHAR(32)       NOT NULL DEFAULT 'custom',
  present_cost    DECIMAL(15,2)     NOT NULL,
  years           TINYINT UNSIGNED  NOT NULL,
  inflation_rate  DECIMAL(5,2)      NOT NULL,
  expected_return DECIMAL(5,2)      NOT NULL,
  future_goal     DECIMAL(15,2)     NOT NULL,
  monthly_sip     DECIMAL(15,2)     NOT NULL,
  created_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_goal_type  (goal_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;