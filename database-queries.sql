-- Create a key-value table with an auto-incrementing primary key
CREATE TABLE user_key_values (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL
);

-- Add column with created_at timestamp automatically set to current time
ALTER TABLE
    user_key_values
ADD
    COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;