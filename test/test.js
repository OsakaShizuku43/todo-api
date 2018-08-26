'use strict';

const chai = require('chai');
const expect = require('chai').expect;
const fs = require('fs');

chai.use(require('chai-http'));

describe('API endpoint /todo', function() {
    this.timeout(3000);

    let app;
    before(() => {
        // Backup file database and create a dummy one
        if (fs.existsSync('database.json')) {
            const fileData = fs.readFileSync('database.json', 'utf8');
            fs.writeFileSync('database.bak.json', fileData);
        }
        const dummyData = {
            counter: 5,
            data: {
                "1": { id: 1, title: 'Todo item 1', isCompleted: false },
                "2": { id: 2, title: 'Todo item 2', isCompleted: true },
                "4": { id: 4, title: 'Extra', isCompleted: false },
            }
        };
        fs.writeFileSync('database.json', JSON.stringify(dummyData));
        
        app = require('../app');
    });
    
    after(() => {
        // Reset file
        fs.unlinkSync('database.json');
        if (fs.existsSync('database.bak.json')) {
            fs.renameSync('database.bak.json', 'database.json');
        }

        app.close();
    });

    it('should give 404 for invalid paths', () => {
        return chai.request(app)
            .get('/INVALID_PATH')
            .then(res => {
                expect(res).to.have.status(404);
            });
    });

    it('should create a new todo item and return it', () => {
        return chai.request(app)
            .post('/todo')
            .type('json')
            .send({ title: 'New todo item' })
            .then(res => {
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body.error).to.be.false;
                expect(res.body.item).to.be.an('object');
                expect(res.body.item).to.deep.equal(
                    { id: 5, title: 'New todo item', isCompleted: false }
                );
            });
    });

    it('should be able to increment counter automatically', () => {
        return chai.request(app)
            .post('/todo')
            .type('json')
            .send({ title: 'ID 6' })
            .then(res => {
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body.error).to.be.false;
                expect(res.body.item).to.be.an('object');
                expect(res.body.item).to.deep.equal(
                    { id: 6, title: 'ID 6', isCompleted: false }
                );
            });
    });

    it('should reject create request without title field', () => {
        return chai.request(app)
            .post('/todo')
            .type('json')
            .send({ INVALID: 'todo item' })
            .then(res => {
                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body.error).to.be.true;
                expect(res.body.message).to.equal('title is a required field');
            })
    });

    it('should give information of one item by its id', () => {
        return chai.request(app)
            .get('/todo/5')
            .then(res => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body.error).to.be.false;
                expect(res.body.item).to.be.an('object');
                expect(res.body.item).to.deep.equal(
                    { id: 5, title: 'New todo item', isCompleted: false }
                );
            });
    });

    it('should give 404 for items that do not exist when querying', () => {
        return chai.request(app)
            .get('/todo/100')
            .then(res => {
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body.error).to.be.true;
                expect(res.body.message).to.equal('Item with id 100 not found')
            });
    });

    it('should be able to toggle complete status to TRUE', () => {
        return chai.request(app)
            .put('/todo/6')
            .then(res => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body.error).to.be.false;
                expect(res.body.item).to.be.an('object');
                expect(res.body.item).to.deep.equal(
                    { id: 6, title: 'ID 6', isCompleted: true }
                );
            });
    });

    it('should be able to toggle complete status to FALSE', () => {
        return chai.request(app)
            .put('/todo/2')
            .then(res => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body.error).to.be.false;
                expect(res.body.item).to.be.an('object');
                expect(res.body.item).to.deep.equal(
                    { id: 2, title: 'Todo item 2', isCompleted: false }
                );
            });
    });

    it('should give 404 for items that do not exist when toggling', () => {
        return chai.request(app)
            .put('/todo/100')
            .then(res => {
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body.error).to.be.true;
                expect(res.body.message).to.equal('Item with id 100 not found')
            });
    });

    it('should delete an item by its id', () => {
        return chai.request(app)
            .del('/todo/5')
            .then(res => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body.error).to.be.false;
            })
    });
    it('should give 404 for items that do not exist when deleting', () => {
        return chai.request(app)
            .del('/todo/100')
            .then(res => {
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body.error).to.be.true;
                expect(res.body.message).to.equal('Item with id 100 not found')
            });
    });

    it('should return all todo items', () => {
        return chai.request(app)
            .get('/todo')
            .then(res => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body.error).to.be.false;
                expect(res.body.items).to.be.an('array');
                expect(res.body.items).to.have.length(4);
                expect(res.body.items).to.deep.equal([
                    { id: 1, title: 'Todo item 1', isCompleted: false },
                    { id: 2, title: 'Todo item 2', isCompleted: false },
                    { id: 4, title: 'Extra', isCompleted: false },
                    { id: 6, title: 'ID 6', isCompleted: true },
                ]);
            });
    });
});
