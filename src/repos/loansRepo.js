import db from '../db.js';


export const LoansRepo = {
all(status='all') {
let base = `SELECT l.*, i.name AS item_name, i.code AS item_code
FROM loans l JOIN items i ON i.id = l.item_id`;
if (status === 'active') {
base += ` WHERE l.returned_at IS NULL`;
} else if (status === 'returned') {
base += ` WHERE l.returned_at IS NOT NULL`;
}
base += ` ORDER BY l.borrowed_at DESC`;
return db.prepare(base).all();
},
get(id) {
return db.prepare(`SELECT * FROM loans WHERE id = ?`).get(id);
},
create(data) {
// cek stok
const available = db.prepare(`SELECT MAX(quantity - IFNULL((SELECT SUM(qty) FROM loans WHERE item_id = ? AND returned_at IS NULL),0),0) AS available FROM items WHERE id=?`).get(data.item_id, data.item_id).available;
const qty = Number(data.qty||1);
if (qty > available) {
const e = new Error(`Stok tidak cukup. Tersedia: ${available}`);
e.status = 400;
throw e;
}
const info = db.prepare(`INSERT INTO loans(item_id, borrower, contact, qty, due_at, notes) VALUES (?,?,?,?,?,?)`)
.run(Number(data.item_id), data.borrower, data.contact, qty, data.due_at||null, data.notes||null);
return this.get(info.lastInsertRowid);
},
returnLoan(id) {
db.prepare(`UPDATE loans SET returned_at = datetime('now') WHERE id=? AND returned_at IS NULL`).run(id);
return this.get(id);
}
};