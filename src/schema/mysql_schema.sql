-- ============================================================================
-- MySQL Schema for Backend Database System
-- Database: backend (as per .env MYSQL_DATABASE)
-- ============================================================================

-- 1. Databases Table
-- Stores database definitions within projects
CREATE TABLE IF NOT EXISTS databasess (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    project_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project_id (project_id),
    UNIQUE KEY unique_name_project (name, project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Collections Table
-- Stores collection definitions within databases
CREATE TABLE IF NOT EXISTS collections (
    id VARCHAR(36) PRIMARY KEY,  -- UUID format
    database_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    project_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (database_id) REFERENCES databasess(id) ON DELETE CASCADE,
    INDEX idx_database_id (database_id),
    INDEX idx_project_id (project_id),
    UNIQUE KEY unique_name_database (name, database_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Attributes Table (Schema Definition)
-- Defines the structure/schema for collections
CREATE TABLE IF NOT EXISTS attributes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    collection_id VARCHAR(36) NOT NULL,
    database_id INT NOT NULL,
    name VARCHAR(64) NOT NULL,
    type VARCHAR(100) NOT NULL,  -- SQL data types like VARCHAR(255), INT, etc.
    required TINYINT(1) DEFAULT 0,
    project_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    FOREIGN KEY (database_id) REFERENCES databasess(id) ON DELETE CASCADE,
    INDEX idx_collection_id (collection_id),
    INDEX idx_project_id (project_id),
    UNIQUE KEY unique_name_collection (name, collection_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Documents Table (Actual Data Storage)
-- Stores the actual document data in JSON format
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(255) PRIMARY KEY,  -- Custom ID format: doc_timestamp_random
    collection_id VARCHAR(36) NOT NULL,
    data JSON NOT NULL,  -- Stores the actual document data
    project_id VARCHAR(255) NOT NULL,
    attribute_id INT NOT NULL,  -- Reference to first attribute (for FK constraint)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE,
    INDEX idx_collection_id (collection_id),
    INDEX idx_project_id (project_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Rate Limits Table (Optional - for MySQL-based rate limiting)
-- Tracks API request counts for rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL,  -- API key or IP address
    request_count INT DEFAULT 0,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_identifier (identifier),
    INDEX idx_window_start (window_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- End of Schema
-- ============================================================================
