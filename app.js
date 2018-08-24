const app = require('express')();
const bodyParser = require('body-parser');
const db = require('./db');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
    const items = db.findAll();
    res.json({ error: false, items: items });
});

app.post('/', (req, res) => {
    const title = req.body.title;
    if (!title || title.trim() === '') {
        res.status(400).json({ error: true, message: 'title is a required field' });
        return;
    }
    const newTodo = db.create(title);
    res.status(201).json({ error: false, item: newTodo });
});

app.get('/:id', (req, res) => {
    const id = req.params.id;
    const todoItem = db.findById(id);
    if (todoItem) {
        res.json({ error: false, item: todoItem });
    } else {
        res.status(404).json({ error: true, message: `Item with id ${id} not found` });
    }
})

app.put('/:id', (req, res) => {
    const id = req.params.id;
    const updatedItem = db.toggleCompleteById(id);
    if (updatedItem) {
        res.json({ error: false, item: updatedItem });
    } else {
        res.status(404).json({ error: true, message: `Item with id ${id} not found` });
    }
});

app.delete('/:id', (req, res) => {
    const id = req.params.id;
    if (db.deleteById(id)) {
        res.json({ error: false });
    } else {
        res.status(404).json({ error: true, message: `Item with id ${id} not found` });
    }
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🌎 Todo API listening at http://localhost:${port}`);
});
