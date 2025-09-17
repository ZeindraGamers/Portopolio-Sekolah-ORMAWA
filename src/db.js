import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';


const dbFile = path.join(process.cwd(), 'inventory.db');
const firstTime = !fs.existsSync(dbFile);
const db = new Database(dbFile);


db.pragma('journal_mode = WAL');


if (firstTime) {
db.exec(`
CREATE TABLE IF NOT EXISTS items (
id INTEGER PRIMARY KEY AUTOINCREMENT,
code TEXT UNIQUE NOT NULL,
name TEXT NOT NULL,
location TEXT,
condition TEXT,
notes TEXT,
quantity INTEGER DEFAULT 1,
created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS loans (
id INTEGER PRIMARY KEY AUTOINCREMENT,
item_id INTEGER NOT NULL,
borrower TEXT NOT NULL,
contact TEXT,
qty INTEGER DEFAULT 1,
borrowed_at TEXT DEFAULT (datetime('now')),
due_at TEXT,
returned_at TEXT,
notes TEXT,
FOREIGN KEY(item_id) REFERENCES items(id)
);
`);
}


export default db;