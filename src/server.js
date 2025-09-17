import express from 'express';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import db from './db.js';
import itemsRoutes from './routes/items.js';
import loansRoutes from './routes/loans.js';
import { toCsv } from './utils/csv.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));


app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));


app.get('/', (req, res) => {
  const total_items = db.prepare('SELECT COUNT(*) AS c FROM items').get().c;
  const total_loans_active = db.prepare("SELECT COUNT(*) AS c FROM loans WHERE returned_at IS NULL").get().c;
  const items = db.prepare('SELECT * FROM items ORDER BY created_at DESC LIMIT 5').all();
  const loans = db.prepare('SELECT * FROM loans ORDER BY borrowed_at DESC LIMIT 5').all();
  
  res.render('index', { 
    title: 'Dashboard · Inventaris',   // <<< tambahin ini
    total_items, 
    total_loans_active, 
    items, 
    loans 
  });
});

app.use((req, res, next) => {
  res.locals.title = 'Inventaris';   // biar <%= title %> aman
  res.locals.messages = [];          // biar blok messages tidak error
  next();
});

app.use('/items', itemsRoutes);
app.use('/loans', loansRoutes);


// Export CSV
app.get('/export/items.csv', (req,res)=>{
const items = db.prepare('SELECT * FROM items ORDER BY created_at DESC').all();
const rows = items.map(i=>[i.id, i.code, i.name, i.location||'', i.condition||'', i.quantity, i.created_at]);
const csv = toCsv(['id','code','name','location','condition','quantity','created_at'], rows);
res.header('Content-Type','text/csv');
res.attachment('items.csv');
res.send(csv);
});


app.get('/export/loans.csv', (req,res)=>{
const loans = db.prepare('SELECT * FROM loans ORDER BY borrowed_at DESC').all();
const rows = loans.map(l=>[l.id, l.item_id, l.borrower, l.contact||'', l.qty, l.borrowed_at, l.due_at||'', l.returned_at||'', l.notes||'']);
const csv = toCsv(['id','item_id','borrower','contact','qty','borrowed_at','due_at','returned_at','notes'], rows);
res.header('Content-Type','text/csv');
res.attachment('loans.csv');
res.send(csv);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`✅ Server running at http://localhost:${PORT}`));