const express = require('express');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
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
  res.sendStatus(200);
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

cron.schedule('0 0 * * *', () => {
  const counts = getCounts();
  const text = `Bug report summary:\nCritical: ${counts.critical}\nHigh: ${counts.high}\nModerate: ${counts.moderate}\nLow: ${counts.low}`;
  transporter.sendMail(
    {
      from: process.env.SMTP_USER,
      to: 'support@orbas.io',
      subject: 'Bug Report Summary',
      text,
    },
    (err) => {
      if (err) console.error('Email error', err);
    }
  );
});

app.get('/test-email', (req, res) => {
  transporter.sendMail(
    {
      from: process.env.SMTP_USER,
      to: 'support@orbas.io',
      subject: 'Test Email',
      text: 'SMTP configuration successful',
    },
    (err) => {
      if (err) {
        console.error('Email error', err);
        return res.status(500).send('Email failed');
      }
      res.send('Email sent');
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

