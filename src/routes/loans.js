import { Router } from 'express';
import { LoansRepo } from '../repos/loansRepo.js';
import db from '../db.js';


const router = Router();


router.get('/', (req, res) => {
const status = req.query.status || 'all';
const loans = LoansRepo.all(status);
const items = db.prepare('SELECT id, name FROM items ORDER BY name ASC').all();
res.render('loans', { loans, status, items });
});


router.post('/new', (req, res) => {
try {
LoansRepo.create(req.body);
res.redirect('/loans');
} catch (e) {
res.status(e.status||400).send(String(e.message||e));
}
});


router.post('/:id/return', (req, res) => {
LoansRepo.returnLoan(req.params.id);
res.redirect('/loans');
});


export default router;