-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS polls (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS options (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER REFERENCES polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  poll_id INTEGER REFERENCES polls(id) ON DELETE CASCADE,
  option_id INTEGER REFERENCES options(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, poll_id)
);

-- Initial Data
-- admin@example.com / password123
INSERT INTO users (name, email, password_hash, role) 
VALUES ('Admin User', 'admin@example.com', '$2a$10$EqfJv17p.7pS6FmXh.t5Teo6q6O1e9e7y1Fh.N6q6O1e9e7y1Fh.N6', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Some initial polls
INSERT INTO polls (question, created_by) 
SELECT 'Which UI feature do you like most?', id FROM users WHERE email = 'admin@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO options (poll_id, option_text) 
SELECT p.id, t.opt FROM polls p CROSS JOIN (SELECT 'Transitions' as opt UNION SELECT 'Icon Animations' UNION SELECT 'Staggered Cards') t
WHERE p.question = 'Which UI feature do you like most?'
ON CONFLICT DO NOTHING;

