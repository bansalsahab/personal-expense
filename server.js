const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./expense_tracker.db', (err) => {
  if (err) console.error(err.message);
  else console.log('Connected to SQLite database');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.get('SELECT email FROM users WHERE email = ?', [email], (err, row) => {
      if (row) return res.status(400).json({ message: 'Email already exists' });

      db.run(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword],
        function(err) {
          if (err) return res.status(500).json({ message: err.message });
          
          const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET, { expiresIn: '7d' });
          res.status(201).json({ 
            token, 
            user: { id: this.lastID, name, email } 
          });
        }
      );
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { id: user.id, name: user.name, email: user.email } 
    });
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  });
});

app.put('/api/auth/profile', authenticateToken, (req, res) => {
  const { name, currentPassword, newPassword } = req.body;
  
  if (newPassword) {
    db.get('SELECT password FROM users WHERE id = ?', [req.user.id], async (err, user) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) return res.status(400).json({ message: 'Current password is incorrect' });
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      db.run('UPDATE users SET name = ?, password = ? WHERE id = ?', 
        [name || req.user.name, hashedPassword, req.user.id],
        (err) => {
          if (err) return res.status(500).json({ message: 'Server error' });
          res.json({ message: 'Profile updated successfully' });
        }
      );
    });
  } else {
    db.run('UPDATE users SET name = ? WHERE id = ?', [name, req.user.id], (err) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      res.json({ message: 'Profile updated successfully' });
    });
  }
});

app.get('/api/transactions', authenticateToken, (req, res) => {
  db.all('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
});

app.post('/api/transactions', authenticateToken, (req, res) => {
  const { text, amount, category } = req.body;
  
  db.run(
    'INSERT INTO transactions (user_id, text, amount, category) VALUES (?, ?, ?, ?)',
    [req.user.id, text, amount, category],
    function(err) {
      if (err) return res.status(500).json({ message: err.message });
      res.status(201).json({ id: this.lastID, user_id: req.user.id, text, amount, category });
    }
  );
});

app.delete('/api/transactions/:id', authenticateToken, (req, res) => {
  db.run(
    'DELETE FROM transactions WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id],
    function(err) {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: 'Transaction deleted' });
    }
  );
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
