-- Initial database setup script for Netflix Clone
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Log database initialization
SELECT 'Netflix database initialized with UUID and pgcrypto extensions' AS status;
