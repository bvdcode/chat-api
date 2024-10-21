CREATE TABLE user_key_values (
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent VARCHAR(255) NOT NULL,
    ip_address VARCHAR(255) NOT NULL
);