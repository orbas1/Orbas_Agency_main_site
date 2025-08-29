const express = require('express');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'OrbusLanding')));

const BUG_DIR = path.join(__dirname, 'bug-reports');
const LEVELS = ['critical', 'high', 'moderate', 'low'];

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

app.post('/submit-bug', (req, res) => {
  const { name, contact, country, error_url, error_category, error_level, description } = req.body;
  if (!LEVELS.includes(error_level)) return res.status(400).send('Invalid level');
  const dir = path.join(BUG_DIR, error_level);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(dir, `${timestamp}.csv`);
  const header = 'name,contact,country,error_url,error_category,error_level,description\n';
  const line = `"${name}","${contact}","${country}","${error_url}","${error_category}","${error_level}","${(description || '').replace(/"/g, '""')}"\n`;
  fs.writeFileSync(filePath, header + line);
  res.sendStatus(200);
});

const transporter = nodemailer.createTransport({
  host: 'mailcow.orbsend.site',
  port: 587,
  secure: false,
  auth: {
    user: 'hello@mail1.orbsend.site',
    pass: 'Sollarmint_96'
  },
});

cron.schedule('0 0 3/6 * * *', () => {
  const counts = getCounts();
  const text = `Bug report summary:\nCritical: ${counts.critical}\nHigh: ${counts.high}\nModerate: ${counts.moderate}\nLow: ${counts.low}`;
  transporter.sendMail({
    from: 'hello@mail1.orbsend.site',
    to: 'support@orbas.io',
    subject: 'Bug Report Summary',
    text,
  }, (err) => {
    if (err) console.error('Email error', err);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

