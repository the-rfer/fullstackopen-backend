const express = require('express');
const { v4 } = require('uuid');
const morgan = require('morgan');
const cors = require('cors');

const PORT = 3001;

const app = express();
app.use(express.json());
app.use(cors());

morgan.token('body', (req) => {
    if (req.method === 'POST') {
        return JSON.stringify(req.body);
    }
    return '';
});
app.use(
    morgan(
        ':method :url :status :res[content-length] - :response-time ms :body'
    )
);

let contacts = [
    {
        id: '1',
        name: 'Arto Hellas',
        number: '040-123456',
    },
    {
        id: '2',
        name: 'Ada Lovelace',
        number: '39-44-5323523',
    },
    {
        id: '3',
        name: 'Dan Abramov',
        number: '12-43-234345',
    },
    {
        id: '4',
        name: 'Mary Poppendieck',
        number: '39-23-6423122',
    },
];

function totalEntries() {
    return `<p>Phonebook has info for ${contacts.length} people.</p>`;
}

function timestamp() {
    const date = new Date();
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'long',
    };

    return `<p>${date.toLocaleDateString('en-US', options)}</p>`;
}

app.get('/api/persons', (req, res) => {
    res.json(contacts);
});

app.get('/info', (req, res) => {
    res.send(totalEntries() + timestamp());
});

app.get('/api/persons/:id', (req, res) => {
    const id = req.params.id;
    const contact = contacts.find((contact) => contact.id === id);
    if (contact) {
        res.json(contact);
    } else {
        res.status(404).end();
    }
});

app.delete('/api/persons/:id', (req, res) => {
    const id = req.params.id;

    const userToDelete = contacts.find((contact) => contact.id === id);
    if (!userToDelete) return res.status(404).end();

    contacts = contacts.filter((contact) => contact.id !== id);
    res.status(204).end();
});

app.post('/api/persons', (req, res) => {
    const body = req.body;

    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'name and number are required.',
        });
    }

    if (contacts.find((contact) => contact.name === body.name)) {
        return res.status(400).json({
            error: 'name must be unique.',
        });
    }

    const newUser = { id: v4(), name: body.name, number: body.number };

    contacts = contacts.concat(newUser);
    res.json(newUser);
});

app.listen(PORT, () => {
    console.log(`Server running...\nListeing on port ${PORT}`);
});
