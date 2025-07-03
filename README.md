# JsonDB-Simple

A simple, file-based JSON database manager accessible from the command line. This tool allows you to perform CRUD (Create, Read, Update, Delete) operations on JSON files using an interactive REPL, with commands inspired by SQL.

## Features

- **Interactive REPL**: Manage your JSON data interactively.
- **SQL-like Commands**: Use commands like `.create`, `.insert`, `.update`, `.delete`, and `.show`.
- **Tab Completion**: Smart tab completion for commands, file paths, and table names.
- **No Dependencies**: The core library works without any external Node.js modules.

## Installation

To install `JsonDB-Simple` globally, run the following command:

```bash
npm install @elang_muhammad/json-db-js
```

Make sure you are in the `JsonDB-Simple` directory when you run this command.

## Usage

Once installed, you can start the interactive REPL by simply running:

```bash
jsondb
```

Or, you can directly open a JSON file:

```bash
jsondb /path/to/your/database.json
```

### Example

```
$ jsondb

🌟 JsonDB >>> .build
📁 Enter database path (example: data/mydb.json): my_database.json
✅ Database 'my_database.json' created/opened successfully!
💡 Use '.create <table_name>' to create a new table

📦 [my_database.json] >>> .create users
✅ Table 'users' created successfully!

📦 [my_database.json] >>> .use users
✅ Successfully selected table 'users'!
💡 Use '.insert' to add data

📋 [users] >>> .insert
... (interactive prompt to add data) ...

📋 [users] >>> .show
... (displays data in the 'users' table) ...
```

## Library Usage

In addition to the interactive REPL, you can use `JsonDB-Simple` as a Node.js module in your projects.

### Importing
You can import the `JsonDB` class into your JavaScript file like this:

```javascript
import { JsonDB } from '@elang_muhammad/json-db-js';
// Or using require
// const { JsonDB } = require('@elang_muhammad/json-db-js');
```

### Example Usage

Here is a basic example of how to use the library:

```javascript
import { JsonDB } from '@elang_muhammad/json-db-js';

// 1. Initialize the database
const db = new JsonDB('my_database.json');

// 2. Create a table
db.createTable('users');

// 3. Insert data into the 'users' table
db.insertData('users', { id: 1, name: 'Alice', age: 30 });
db.insertData('users', { id: 2, name: 'Bob', age: 25 });

// 4. Get all data from the 'users' table
const users = db.getData('users');
console.log('All users:', users);
// Output: All users: [ { id: 1, name: 'Alice', age: 30 }, { id: 2, name: 'Bob', age: 25 } ]

// 5. Update data
// Update user where id is 1
db.updateData('users', (user) => user.id === 1, { id: 1, name: 'Alice Smith', age: 31 });

// 6. Delete data
// Delete user where age is 25
db.deleteData('users', (user) => user.age === 25);

// 7. Show the final data
console.log('Final users data:');
db.showData('users');
// Output:
// === Table: users ===
// Type: Array
// Length: 1
// Data: [
//   {
//     "id": 1,
//     "name": "Alice Smith",
//     "age": 31
//   }
// ]
```

### API Reference

Here are the main methods available in the `JsonDB` class:

- **`constructor(filePath)`**: Initializes the database with the given JSON file path.

- **`createTable(tableName, [initialData])`**: Creates a new table (a key in the JSON object).
  - `tableName` (string): The name of the table.
  - `initialData` (any): Optional initial data for the table. Defaults to an empty array `[]`.

- **`insertData(tableName, data)`**: Adds data to a table. If the table is an array, it pushes the data. If it's an object, it merges the data.
  - `tableName` (string): The name of the table.
  - `data` (any): The data to be added.

- **`updateData(tableName, [condition], newData)`**: Updates data in a table.
  - `tableName` (string): The name of the table.
  - `condition` (function): A function that returns `true` for the item(s) to be updated. If `null`, the entire table content is replaced.
  - `newData` (any): The new data to replace the old data.

- **`deleteData(tableName, [condition], [deleteAll])`**: Deletes data from a table.
  - `tableName` (string): The name of the table.
  - `condition` (function): A function that returns `true` for the item(s) to be deleted.
  - `deleteAll` (boolean): If `true`, all data in the table will be cleared.

- **`getData([tableName])`**: Retrieves data.
  - `tableName` (string): The name of the table. If omitted, returns the entire database object.

- **`listTables()`**: Returns an array of all table names.

- **`tableExists(tableName)`**: Checks if a table exists. Returns `true` or `false`.

- **`showData([tableName])`**: Prints data to the console in a readable format. If `tableName` is omitted, it prints the entire database.

- **`getTableInfo(tableName)`**: Returns an object containing detailed information about a table, such as its name, type, and length.

## Author

- **Elang Muhammad**

## License

This project is licensed under the MIT License.