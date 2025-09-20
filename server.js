// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer  = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic security middlewares
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many requests, try again later." }
});

// Sessions (for demo use memory store; for production use Redis or DB-backed store)
app.use(session({
  name: 'studyvibe.sid',
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    // secure: true, // enable when using HTTPS in production
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 3 // 3 hours
  }
}));

// Serve static site
app.use(express.static(path.join(__dirname, 'public')));

// Ensure uploads dir exists
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Multer setup for PDF files only
const upload = multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: 10 * 1024 * 1024 }, // max 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
});

// Simple JSON store for studyMaterials (demo). In production, use a DB.
const STORE_FILE = path.join(__dirname, 'data_store.json');
let dataStore = { studyMaterials: {} };
if (fs.existsSync(STORE_FILE)) {
  try { dataStore = JSON.parse(fs.readFileSync(STORE_FILE)); } catch (e) { /* ignore */ }
}

// Save store helper
function saveStore() {
  fs.writeFileSync(STORE_FILE, JSON.stringify(dataStore, null, 2));
}

// Helper: check login
function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// API: login
app.post('/api/login', authLimiter, async (req, res) => {
  const { id, password } = req.body;
  if (!id || !password) return res.status(400).json({ error: 'Missing credentials' });

  // ADMIN_ID in .env, ADMIN_PWD_HASH in .env (bcrypt hashed)
  const ADMIN_ID = process.env.ADMIN_ID;
  const ADMIN_PWD_HASH = process.env.ADMIN_PWD_HASH;

  if (!ADMIN_ID || !ADMIN_PWD_HASH) {
    console.error('Admin credentials not configured in .env');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  if (id !== ADMIN_ID) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, ADMIN_PWD_HASH);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  req.session.isAdmin = true;
  req.session.adminId = ADMIN_ID;
  return res.json({ ok: true });
});

// API: logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

// API: status
app.get('/api/status', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

// API: save resource (protected). Accepts multipart/form-data
app.post('/api/save-resource', requireAuth, upload.single('pdfFile'), (req, res) => {
  try {
    const { year, stream, subject, type, title, description, url } = req.body;
    if (!year || !stream || !subject || !type || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const yr = year.toString();
    if (!dataStore.studyMaterials[yr]) dataStore.studyMaterials[yr] = {};
    if (!dataStore.studyMaterials[yr][stream]) dataStore.studyMaterials[yr][stream] = {};
    if (!dataStore.studyMaterials[yr][stream][subject]) dataStore.studyMaterials[yr][stream][subject] = [];

    let resourceUrl = '#';
    if (type === 'pdf' && req.file) {
      // rename to safer filename: timestamp-originalname
      const safeName = `${Date.now()}-${req.file.originalname.replace(/\s+/g,'_')}`;
      const newPath = path.join(UPLOAD_DIR, safeName);
      fs.renameSync(req.file.path, newPath);
      resourceUrl = `/uploads/${safeName}`; // expose route below
    } else if (type === 'youtube' || type === 'website') {
      if (!url) return res.status(400).json({ error: 'URL required for this type' });
      resourceUrl = url;
    }

    const newResource = {
      type,
      title,
      url: resourceUrl,
      views: 0,
      description: description || ''
    };

    dataStore.studyMaterials[yr][stream][subject].push(newResource);
    saveStore();

    return res.json({ ok: true, resource: newResource });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

// Serve uploaded PDFs statically under /uploads
app.use('/uploads', express.static(UPLOAD_DIR, {
  dotfiles: 'deny',
  index: false,
  maxAge: '7d'
}));

// Fallback to index.html for SPA routes
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
