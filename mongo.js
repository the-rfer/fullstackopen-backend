require('dotenv').config();

const password = process.argv[2];
const contactName = process.argv[3];
const contactNumber = process.argv[4];
const url = process.env.URL_P1 + password + process.env.URL_P2;

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

mongoose.connect(url);

const contactSchema = new mongoose.Schema({
    name: String,
    number: String,
});

const Contact = mongoose.model('Contact', contactSchema);

const contact = new Contact({
    name: contactName,
    number: contactNumber,
});

switch (process.argv.length) {
    case 5:
        contact.save().then((result) => {
            console.log(
                'Added',
                contactName,
                'number',
                contactNumber,
                'to phonebook'
            );
            mongoose.connection.close();
        });
        break;
    case 3:
        Contact.find({}).then((result) => {
            console.log('Phonebook:');
            result.forEach((contact) => {
                console.log(contact.name, contact.number);
            });
            mongoose.connection.close();
        });
        break;
    default:
        console.log('Wrong number of arguments');
        process.exit(1);
}
