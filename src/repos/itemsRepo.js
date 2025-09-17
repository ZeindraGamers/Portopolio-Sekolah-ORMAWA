import db from '../db.js';


export const ItemsRepo = {
all(q) {
if (q) {
const like = `%${q}%`;
return db.prepare(
`SELECT *,
MAX(quantity - IFNULL((SELECT SUM(qty) FROM loans WHERE item_id = items.id AND returned_at IS NULL),0),0) AS available
FROM items
WHERE name LIKE ? OR code LIKE ? OR IFNULL(location,'') LIKE ?
ORDER BY created_at DESC`
).all(like, like, like);
}
return db.prepare(
`SELECT *,
MAX(quantity - IFNULL((SELECT SUM(qty) FROM loans WHERE item_id = items.id AND returned_at IS NULL),0),0) AS available
FROM items ORDER BY created_at DESC`
).all();
},
get(id) {
return db.prepare('SELECT * FROM items WHERE id = ?').get(id);
},
create(data) {
const stmt = db.prepare(`INSERT INTO items(code,name,location,condition,notes,quantity) VALUES (?,?,?,?,?,?)`);
const info = stmt.run(data.code, data.name, data.location, data.condition, data.notes, Number(data.quantity||1));
return this.get(info.lastInsertRowid);
},
update(id, data) {
db.prepare(`UPDATE items SET code=?, name=?, location=?, condition=?, notes=?, quantity=? WHERE id=?`)
.run(data.code, data.name, data.location, data.condition, data.notes, Number(data.quantity||1), id);
return this.get(id);
}
};