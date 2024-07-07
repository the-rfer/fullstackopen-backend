require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Contact = require('./models/contact');
const mongoose = require('mongoose');

const PORT = process.env.PORT;
const app = express();

app.use(express.static('dist'));
app.use(express.json());
app.use(cors());

mongoose.set('strictQuery', false);

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

async function totalEntries() {
    const count = await Contact.countDocuments();
    return `<p>Phonebook has info for ${count} people.</p>`;
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

app.get('/api/persons', (_, res) => {
    let contacts = [];

    Contact.find({}).then((result) => {
        result.forEach((contact) => {
            contacts.push(contact);
        });
        res.json(contacts);
    });
});

app.get('/info', async (_, res) => {
    const info = (await totalEntries()) + timestamp();
    res.send(info);
});

app.get('/api/persons/:id', (req, res, next) => {
    Contact.findById(req.params.id)
        .then((result) => {
            if (result) {
                res.json(result);
            } else {
                res.status(404).send({ message: 'contact not found' });
            }
        })
        .catch((error) => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {
    Contact.findByIdAndDelete(req.params.id)
        .then((result) => {
            if (result) {
                res.status(204).end();
            } else {
                res.status(404).end();
            }
        })
        .catch((error) => next(error));
});

app.post('/api/persons', (req, res, next) => {
    const body = req.body;

    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'name and number are required.',
        });
    }

    const contact = new Contact({
        name: body.name,
        number: body.number,
    });

    contact
        .save()
        .then((result) => {
            res.json(result);
        })
        .catch((error) => next(error));
});

app.put('/api/persons/:id', (req, res, next) => {
    const { name, number } = req.body;

    Contact.findByIdAndUpdate(
        req.params.id,
        { name, number },
        { new: true, runValidators: true, context: 'query' }
    )
        .then((updatedContact) => {
            res.json(updatedContact);
        })
        .catch((error) => next(error));
});

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
    console.error('ERROR NAME:', error.name);
    console.error('ERROR MESSAGE:', error.message);

    switch (error.name) {
        case 'CastError':
            return res.status(400).json({ error: 'malformatted id' });

        case 'ValidationError':
            return res.status(400).json({ error: error.message });

        default:
            next(error);
    }
};

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running...\nListeing on port ${PORT}`);
});
