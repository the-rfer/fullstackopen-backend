const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const url = process.env.MONGODB_URI;

console.log('connecting to MongoDB...');

mongoose
    .connect(url)
    .then(() => {
        console.log('connected to MongoDB');
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message);
    });

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: [3, 'Name must be at least 3 characters long'],
        required: true,
    },
    number: {
        type: String,
        validate: {
            validator: function (v) {
                return (
                    /^\d{3,4}-\d{4,}$/.test(v) &&
                    v.replace(/-/g, '').length >= 8
                );
            },
            message:
                'contact must follow the pattern: 123-45678 OR 1234-5678. At least 8 digits required.',
        },
        required: true,
    },
});

contactSchema.set('toJSON', {
    transform: (_, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = mongoose.model('Contact', contactSchema);
