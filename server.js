const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'OrbusLanding')));

const BUG_DIR = path.join(__dirname, 'bug-reports');
const UPLOAD_DIR = path.join(BUG_DIR, 'uploads');
const LEVELS = ['critical', 'high', 'moderate', 'low'];

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({ dest: UPLOAD_DIR });

function getCounts() {
  const counts = {};
  LEVELS.forEach(level => {
    const dir = path.join(BUG_DIR, level);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    counts[level] = fs.readdirSync(dir).filter(f => f.endsWith('.csv')).length;
  });
  return counts;
}

app.get('/bug-report-counts', (req, res) => {
  res.json(getCounts());
});

app.post('/submit-bug', upload.single('evidence'), (req, res) => {
  const {
    title,
    name,
    contact,
    country,
    error_url,
    error_category,
    error_level,
    description,
    steps,
    environment,
    expected,
    actual,
    console_logs
  } = req.body;

  if (!LEVELS.includes(error_level)) return res.status(400).send('Invalid level');

  const dir = path.join(BUG_DIR, error_level);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(dir, `${timestamp}.csv`);

  const escape = (val = '') => `"${String(val).replace(/"/g, '""')}"`;
  const evidencePath = req.file ? req.file.filename : '';

  const header = 'title,name,contact,country,error_url,error_category,error_level,description,steps,environment,expected,actual,console_logs,evidence\n';
  const line = [title, name, contact, country, error_url, error_category, error_level, description, steps, environment, expected, actual, console_logs, evidencePath]
    .map(escape)
    .join(',') + '\n';

  fs.writeFileSync(filePath, header + line);
  res.status(200).json({ success: true });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

