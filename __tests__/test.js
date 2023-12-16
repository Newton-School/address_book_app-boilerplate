const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/app');
const mongoose = require('mongoose');
const Contact = require('../models/Contact');
const dotenv = require('dotenv');

chai.use(chaiHttp);
const expect = chai.expect;

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
dotenv.config();

describe('Contact Controller', () => {
  beforeEach(async () => {
    await Contact.deleteMany({});
  });

  before(async () => {
    await mongoose.connect('mongodb://mongoService:27017/ads', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('connected to DB');
  });

  after(async () => {
    await mongoose.disconnect();
    console.log('disconnected DB');
  });

  it('should add a new contact', async () => {
    const response = await chai.request(app).post('/api/v1/contacts/add').send({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
    });

    expect(response).to.have.status(201);
    expect(response.body)
      .to.have.property('message')
      .equal('Contact added successfully');
    expect(response.body).to.have.property('contact');
    expect(response.body.contact).to.have.property('name').equal('John Doe');
  });

  it('should view all contacts', async () => {
    // Add some contacts to the database for testing
    await Contact.create([
      { name: 'Contact 1', email: 'contact1@example.com', phone: '1111111111' },
      { name: 'Contact 2', email: 'contact2@example.com', phone: '2222222222' },
    ]);

    const response = await chai.request(app).get('/api/v1/contacts/view');

    expect(response).to.have.status(200);
    expect(response.body)
      .to.have.property('message')
      .equal('Viewing all contacts');
    expect(response.body).to.have.property('contacts');
    expect(response.body.contacts).to.be.an('array');
    expect(response.body.contacts).to.have.lengthOf(2);
  });

  it('should update a contact', async () => {
    // Add a contact to the database for testing
    const contact = await Contact.create({
      name: 'Original Contact',
      email: 'original@example.com',
      phone: '1234567890',
    });

    const response = await chai
      .request(app)
      .put(`/api/v1/contacts/update/${contact._id}`)
      .send({ name: 'Updated Contact' });

    expect(response).to.have.status(200);
    expect(response.body)
      .to.have.property('message')
      .equal('Contact updated successfully');
    expect(response.body).to.have.property('contact');
    expect(response.body.contact)
      .to.have.property('name')
      .equal('Updated Contact');
  });

  it('should delete a contact', async () => {
    // Add a contact to the database for testing
    const contact = await Contact.create({
      name: 'Contact to be deleted',
      email: 'delete@example.com',
      phone: '1234567890',
    });

    const response = await chai
      .request(app)
      .delete(`/api/v1/contacts/delete/${contact._id}`);

    expect(response).to.have.status(200);
    expect(response.body)
      .to.have.property('message')
      .equal('Contact deleted successfully');
  });

  it('should search for contacts', async () => {
    // Add some contacts to the database for testing
    await Contact.create([
      { name: 'John Doe', email: 'john@example.com', phone: '1111111111' },
      { name: 'Jane Doe', email: 'jane@example.com', phone: '2222222222' },
    ]);

    const response = await chai
      .request(app)
      .get('/api/v1/contacts/search?query=john');

    expect(response).to.have.status(200);
    expect(response.body).to.have.property('message').equal('Search results');
    expect(response.body).to.have.property('results');
    expect(response.body.results).to.be.an('array');
    expect(response.body.results).to.have.lengthOf(1);
    expect(response.body.results[0]).to.have.property('name').equal('John Doe');
  });
});
