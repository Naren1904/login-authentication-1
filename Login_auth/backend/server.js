const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const logFile = path.join(__dirname, 'loginLogs.json');
// contentFile removed (no longer used)
const usersFile = path.join(__dirname, 'users.json');

// Ensure storage files exist
if (!fs.existsSync(logFile)) fs.writeFileSync(logFile, '[]');
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, '{}');

// Removed /api/content endpoint (no longer used)

// Create account (stores hashed password)
app.post('/api/signup', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ success: false, message: 'Username and password are required' });

  const users = JSON.parse(fs.readFileSync(usersFile));
  if (users[username]) {
    return res.status(409).json({ success: false, message: 'Username already exists' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  users[username] = { passwordHash, createdAt: new Date().toISOString() };
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

  res.json({ success: true, message: 'Signup successful' });
});

// Handle login (verifies credentials using bcrypt and logs without plaintext)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ success: false, message: 'Username and password are required' });

  const users = JSON.parse(fs.readFileSync(usersFile));
  const user = users[username];
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  }

  const isValid = bcrypt.compareSync(password, user.passwordHash);
  const logEntry = {
    username,
    date: new Date().toLocaleString(),
    success: !!isValid
  };
  const logs = JSON.parse(fs.readFileSync(logFile));
  logs.push(logEntry);
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));

  if (!isValid) return res.status(401).json({ success: false, message: 'Invalid username or password' });

  res.json({ success: true, message: 'Login successful' });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
