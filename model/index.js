const { Schema, model } = require('mangoose');

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Set name for contact'],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

contactSchema.path('email').validate(function (value) {
  const re =
    /^(([^<>()[\]\\.,;:\s@]+(\.[^<>()[\]\\.,;:\s@]+)*)|(.+))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/im;
  return re.test(String(value));
});

contactSchema.path('phone').validate(function (value) {
  const re = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;
  return re.test(String(value));
});

const Contact = model('contact', contactSchema);

module.exports = Contact;

// const listContacts = async () => {
//   return await contactsDB.read();
// };

// const getContactById = async (contactId) => {
//   console.log('contactId: ', typeof contactId);
//   const contacts = await contactsDB.read();
//   const [contact] = contacts.filter(
//     (contact) => String(contact.id) === contactId
//   );
//   return contact;
// };

// const removeContact = async (contactId) => {
//   const contacts = await contactsDB.read();
//   const index = contacts.findIndex(
//     (contact) => String(contact.id) === contactId
//   );
//   if (index !== -1) {
//     const [result] = contacts.splice(index, 1);
//     await contactsDB.write(contacts);
//     return result;
//   }
//   return null;
// };

// const addContact = async (body) => {
//   const contacts = await contactsDB.read();
//   const newContact = {
//     id: crypto.randomUUID(),
//     ...body,
//   };
//   contacts.push(newContact);
//   await contactsDB.write(contacts);
//   return newContact;
// };

// const updateContact = async (contactId, body) => {
//   const contacts = await contactsDB.read();
//   const index = contacts.findIndex(
//     (contact) => String(contact.id) === contactId
//   );
//   if (index !== -1) {
//     contacts[index] = { ...contacts[index], ...body };
//     await contactsDB.write(contacts);
//     return contacts[index];
//   }
//   return null;
// };

// module.exports = {
//   listContacts,
//   getContactById,
//   removeContact,
//   addContact,
//   updateContact,
// };
