CREATE TABLE IF NOT EXISTS health_centers (
  center_id INT NOT NULL AUTO_INCREMENT,
  center_name VARCHAR(100) NOT NULL,
  barangay VARCHAR(100) NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  PRIMARY KEY (center_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  user_id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Staff',
  center_id INT NULL,
  refresh_token CHAR(64) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_username (username),
  CONSTRAINT fk_users_health_center
    FOREIGN KEY (center_id) REFERENCES health_centers (center_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS medicines (
  medicine_id INT NOT NULL AUTO_INCREMENT,
  generic_name VARCHAR(100) NOT NULL,
  dosage VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  PRIMARY KEY (medicine_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS medicine_batches (
  batch_id INT NOT NULL AUTO_INCREMENT,
  medicine_id INT NOT NULL,
  lot_number VARCHAR(50) NOT NULL,
  expiration_date DATE NOT NULL,
  status VARCHAR(30) DEFAULT 'Active',
  PRIMARY KEY (batch_id),
  CONSTRAINT fk_medicine_batches_medicine
    FOREIGN KEY (medicine_id) REFERENCES medicines (medicine_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS inventory_stocks (
  stock_id INT NOT NULL AUTO_INCREMENT,
  center_id INT NOT NULL,
  batch_id INT NOT NULL,
  quantity INT DEFAULT 0,
  PRIMARY KEY (stock_id),
  CONSTRAINT fk_inventory_stocks_center
    FOREIGN KEY (center_id) REFERENCES health_centers (center_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_inventory_stocks_batch
    FOREIGN KEY (batch_id) REFERENCES medicine_batches (batch_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS transfer_requests (
  transfer_id INT NOT NULL AUTO_INCREMENT,
  source_center_id INT NOT NULL,
  destination_center_id INT NOT NULL,
  request_date DATE NOT NULL,
  status VARCHAR(30) DEFAULT 'Pending',
  PRIMARY KEY (transfer_id),
  CONSTRAINT fk_transfer_requests_source
    FOREIGN KEY (source_center_id) REFERENCES health_centers (center_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_transfer_requests_destination
    FOREIGN KEY (destination_center_id) REFERENCES health_centers (center_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS transfer_items (
  item_id INT NOT NULL AUTO_INCREMENT,
  transfer_id INT NOT NULL,
  batch_id INT NOT NULL,
  transfer_quantity INT NOT NULL,
  PRIMARY KEY (item_id),
  CONSTRAINT fk_transfer_items_request
    FOREIGN KEY (transfer_id) REFERENCES transfer_requests (transfer_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_transfer_items_batch
    FOREIGN KEY (batch_id) REFERENCES medicine_batches (batch_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS disposal_certificates (
  certificate_id INT NOT NULL AUTO_INCREMENT,
  batch_id INT NOT NULL,
  disposal_date DATE NOT NULL,
  disposal_method VARCHAR(50) NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (certificate_id),
  UNIQUE KEY uq_disposal_certificates_batch (batch_id),
  CONSTRAINT fk_disposal_certificates_batch
    FOREIGN KEY (batch_id) REFERENCES medicine_batches (batch_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_disposal_certificates_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;
