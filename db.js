const fs = require('fs');

// Read data from file or create a new data file
let data, counter;
if (fs.existsSync('database.json')) {
    try {
        const readContent = JSON.parse(fs.readFileSync('database.json', 'utf8'));
        data = readContent.data;
        counter = readContent.counter;
        console.log('👌 Data loaded from file');
    } catch (err) {
        throw new Error('❌ Error when reading database.json, you may delete it to clear and reset data.');
    };
} else {
    fs.writeFileSync('database.json', JSON.stringify({ counter: 1, data: {} }));
    console.log('👌 Created a new empty database file');
}

/* 
 =========================
        Todo Schema
 - id: integer
 - title: string
 - isCompleted: boolean
 =========================
*/

// Save data to file database
const save = () => {
    const writeContent = JSON.stringify({
        counter: counter,
        data: data
    });
    fs.writeFileSync('database.json', writeContent);
}

// Create item
const create = (title) => {
    const newTodo = {
        id: counter,
        title: title,
        isCompleted: false
    };
    data[counter] = newTodo;
    counter++;
    save();
    return newTodo;
}

// Get item by id
const findById = (id) => data[id] || null;

// Get all items
const findAll = () => data;

// Toggle complete
const toggleCompleteById = (id) => {
    if (data[id]) {
        data[id].isCompleted = !data[id].isCompleted;
        save();
        return data[id];
    }
    return false;
}

// Delete item
const deleteById = (id) => {
    if (data[id]) {
        delete data[id];
        save();
        return true;
    }
    return false;
}

module.exports = {
    create, findById, findAll, toggleCompleteById, deleteById
}
