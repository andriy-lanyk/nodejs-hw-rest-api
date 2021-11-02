const crypto = require('crypto');
const DB = require('./db');
const contactsDB = new DB('contacts.json');

const listContacts = async () => {
  return await contactsDB.read();
};

const getContactById = async (contactId) => {
  console.log('contactId: ', typeof contactId);
  const contacts = await contactsDB.read();
  const [contact] = contacts.filter(
    (contact) => String(contact.id) === contactId
  );
  return contact;
};

const removeContact = async (contactId) => {
  const contacts = await contactsDB.read();
  const index = contacts.findIndex(
    (contact) => String(contact.id) === contactId
  );
  if (index !== -1) {
    const [result] = contacts.splice(index, 1);
    await contactsDB.write(contacts);
    return result;
  }
  return null;
};

const addContact = async (body) => {
  const contacts = await contactsDB.read();
  const newContact = {
    id: crypto.randomUUID(),
    ...body,
  };
  contacts.push(newContact);
  await contactsDB.write(contacts);
  return newContact;
};

const updateContact = async (contactId, body) => {
  const contacts = await contactsDB.read();
  const index = contacts.findIndex(
    (contact) => String(contact.id) === contactId
  );
  if (index !== -1) {
    contacts[index] = { ...contacts[index], ...body };
    await contactsDB.write(contacts);
    return contacts[index];
  }
  return null;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
