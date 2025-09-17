const express = require('express');
const path = require('path');
const morgan = require('morgan');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.set('layout', 'layout'); // gunakan layout.ejs sebagai layout utama

app.use(expressLayouts);
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use(session({
  secret: 'inventaris-secret',
  resave: false,
  saveUninitialized: true
}));

// Middleware agar res.locals selalu tersedia
app.use((req, res, next) => {
  res.locals.title = 'Inventaris';
  res.locals.messages = req.session?.messages || [];
  if (req.session) req.session.messages = [];
  next();
});

// Dummy data untuk contoh
const items = [
  { id: 1, name: 'Laptop', code: 'ITM001' },
  { id: 2, name: 'Proyektor', code: 'ITM002' }
];

let loans = [
  {
    id: 1,
    item_id: 1,
    item_code: 'ITM001',
    item_name: 'Laptop',
    borrower: 'Budi',
    contact: '08123456789',
    qty: 1,
    borrowed_at: '2025-09-17 09:00',
    due_at: '2025-09-18 09:00',
    returned_at: null
  }
];

// Untuk flash message sederhana (tanpa package tambahan)
const setMessage = (req, type, text) => {
  if (!req.session) return;
  req.session.messages = req.session.messages || [];
  req.session.messages.push({ type, text });
};

// Halaman utama
app.get('/', (req, res) => {
  res.render('index', { title: 'Inventaris' });
});

// Halaman daftar peminjaman (dengan title dinamis)
app.get('/loans', (req, res) => {
  const status = req.query.status || 'all';
  let filteredLoans = loans;
  if (status === 'active') filteredLoans = loans.filter(l => !l.returned_at);
  if (status === 'returned') filteredLoans = loans.filter(l => l.returned_at);
  res.render('loans', { items, loans: filteredLoans, title: 'Peminjaman' }); // <-- title dinamis
});

// Proses tambah peminjaman
app.post('/loans/new', (req, res) => {
  const { item_id, borrower, contact, qty, due_at } = req.body;
  const item = items.find(i => i.id == item_id);
  if (!item) {
    setMessage(req, 'danger', 'Item tidak ditemukan.');
    return res.redirect('/loans');
  }
  const newLoan = {
    id: loans.length + 1,
    item_id: item.id,
    item_code: item.code,
    item_name: item.name,
    borrower,
    contact,
    qty: Number(qty),
    borrowed_at: new Date().toISOString().slice(0, 16).replace('T', ' '),
    due_at: due_at ? due_at.replace('T', ' ') : null,
    returned_at: null
  };
  loans.push(newLoan);
  setMessage(req, 'success', 'Peminjaman berhasil ditambahkan.');
  res.redirect('/loans');
});

// Proses pengembalian
app.post('/loans/:id/return', (req, res) => {
  const loan = loans.find(l => l.id == req.params.id);
  if (loan && !loan.returned_at) {
    loan.returned_at = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setMessage(req, 'success', 'Barang berhasil dikembalikan.');
  } else {
    setMessage(req, 'danger', 'Peminjaman tidak ditemukan atau sudah dikembalikan.');
  }
  res.redirect('/loans');
});

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});