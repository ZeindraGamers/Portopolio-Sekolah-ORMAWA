import { Router } from 'express';
import { ItemsRepo } from '../repos/itemsRepo.js';


const router = Router();


router.get('/', (req, res) => {
const q = (req.query.q||'').trim();
const items = ItemsRepo.all(q);
res.render('items', { items, q });
});


router.get('/new', (req, res) => res.render('item_form', { item: null }));


router.post('/new', (req, res) => {
try {
ItemsRepo.create(req.body);
res.redirect('/items');
} catch (e) {
res.status(400).send(String(e.message||e));
}
});


router.get('/:id/edit', (req, res) => {
const item = ItemsRepo.get(req.params.id);
if (!item) return res.sendStatus(404);
res.render('item_form', { item });
});


router.post('/:id/edit', (req, res) => {
try {
ItemsRepo.update(req.params.id, req.body);
res.redirect('/items');
} catch (e) {
res.status(400).send(String(e.message||e));
}
});


export default router;