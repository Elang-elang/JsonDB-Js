import fs from 'fs' ;
import path from 'path';

/**
 * Class for managing a simple JSON database.
 * 
 * This class provides basic operations such as create, read, 
 * update, and delete data in JSON format.
 */
class JsonDB {
    /**
     * Initialize JSON database.
     * 
     * @param {string} filePath - Path to the JSON file to be used as database
     */
    constructor(filePath) {
        this.filePath = filePath;
        this.data = {};
        
        // Create directory if it doesn't exist
        const directory = path.dirname(filePath);
        if (directory && !fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }
        
        // Create empty file if it doesn't exist
        if (!fs.existsSync(filePath)) {
            this._saveToFile({});
        }
        
        // Load data from file
        this._loadFromFile();
    }
    
    /**
     * Load data from JSON file to memory.
     * @private
     */
    _loadFromFile() {
        try {
            const content = fs.readFileSync(this.filePath, 'utf-8').trim();
            if (content) {
                this.data = JSON.parse(content);
            } else {
                this.data = {};
            }
        } catch (error) {
            console.log(`Warning: Failed to load JSON file. Using empty database. Error: ${error.message}`);
            this.data = {};
        }
    }
    
    /**
     * Save data to JSON file.
     * 
     * @param {Object} [data] - Data to be saved. If null, use this.data
     * @private
     */
    _saveToFile(data = null) {
        const saveData = data !== null ? data : this.data;
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(saveData, null, 2), 'utf-8');
        } catch (error) {
            console.log(`Error: Failed to save to file. ${error.message}`);
        }
    }
    
    /**
     * Create a new table in the database.
     * 
     * @param {string} tableName - Name of the table to be created
     * @param {*} [initialData] - Initial data for the table (optional)
     * @returns {boolean} True if successful, false if table already exists
     */
    createTable(tableName, initialData = null) {
        if (tableName in this.data) {
            console.log(`Warning: Table '${tableName}' already exists.`);
            return false;
        }
        
        // If no initial data, create as empty array
        this.data[tableName] = initialData !== null ? initialData : [];
        this._saveToFile();
        return true;
    }
    
    /**
     * Add data to table.
     * 
     * @param {string} tableName - Table name
     * @param {*} data - Data to be added
     * @returns {boolean} True if successful
     */
    insertData(tableName, data) {
        if (!(tableName in this.data)) {
            console.log(`Warning: Table '${tableName}' not found. Creating new table.`);
            this.createTable(tableName);
        }
        
        // If table is an array, push data
        if (Array.isArray(this.data[tableName])) {
            this.data[tableName].push(data);
        }
        // If table is object and data is also object, merge
        else if (typeof this.data[tableName] === 'object' && 
                 this.data[tableName] !== null && 
                 typeof data === 'object' && 
                 data !== null &&
                 !Array.isArray(this.data[tableName]) &&
                 !Array.isArray(data)) {
            Object.assign(this.data[tableName], data);
        }
        // If table is single value, convert to array
        else {
            const oldData = this.data[tableName];
            this.data[tableName] = [oldData, data];
        }
        
        this._saveToFile();
        return true;
    }
    
    /**
     * Update data in table.
     * 
     * @param {string} tableName - Table name
     * @param {Function} [condition] - Function to determine which data to update
     * @param {*} [newData] - New data
     * @returns {boolean} True if successful
     */
    updateData(tableName, condition = null, newData = null) {
        if (!(tableName in this.data)) {
            console.log(`Error: Table '${tableName}' not found.`);
            return false;
        }
        
        // If no condition, replace entire data
        if (condition === null) {
            this.data[tableName] = newData;
        } else {
            // For array, update items that meet condition
            if (Array.isArray(this.data[tableName])) {
                for (let i = 0; i < this.data[tableName].length; i++) {
                    if (condition(this.data[tableName][i])) {
                        this.data[tableName][i] = newData;
                    }
                }
            }
        }
        
        this._saveToFile();
        return true;
    }
    
    /**
     * Delete data from table.
     * 
     * @param {string} tableName - Table name
     * @param {Function} [condition] - Function to determine which data to delete
     * @param {boolean} [deleteAll=false] - If true, delete all data in table
     * @returns {boolean} True if successful
     */
    deleteData(tableName, condition = null, deleteAll = false) {
        if (!(tableName in this.data)) {
            console.log(`Error: Table '${tableName}' not found.`);
            return false;
        }
        
        if (deleteAll) {
            if (Array.isArray(this.data[tableName])) {
                this.data[tableName] = [];
            } else if (typeof this.data[tableName] === 'object' && this.data[tableName] !== null) {
                this.data[tableName] = {};
            } else {
                this.data[tableName] = null;
            }
        } else if (condition) {
            if (Array.isArray(this.data[tableName])) {
                this.data[tableName] = this.data[tableName].filter(item => !condition(item));
            }
        }
        
        this._saveToFile();
        return true;
    }
    
    /**
     * Retrieve data from table or entire database.
     * 
     * @param {string} [tableName] - Table name (optional)
     * @returns {*} Data from table or entire database
     */
    getData(tableName = null) {
        if (tableName === null) {
            return this.data;
        }
        
        if (!(tableName in this.data)) {
            console.log(`Warning: Table '${tableName}' not found.`);
            return null;
        }
        
        return this.data[tableName];
    }
    
    /**
     * Display data information in readable format.
     * 
     * @param {string} [tableName] - Table name (optional)
     */
    showData(tableName = null) {
        if (tableName === null) {
            console.log("=== Entire Database ===");
            for (const [key, value] of Object.entries(this.data)) {
                console.log(`Table: ${key}`);
                console.log(`Type: ${this._getType(value)}`);
                if (Array.isArray(value) || typeof value === 'object' || typeof value === 'string') {
                    console.log(`Length: ${this._getLength(value)}`);
                }
                console.log(`Data: ${JSON.stringify(value, null, 2)}`);
                console.log("-".repeat(40));
            }
        } else {
            if (!(tableName in this.data)) {
                console.log(`Table '${tableName}' not found.`);
                return;
            }
            
            const data = this.data[tableName];
            console.log(`=== Table: ${tableName} ===`);
            console.log(`Type: ${this._getType(data)}`);
            if (Array.isArray(data) || typeof data === 'object' || typeof data === 'string') {
                console.log(`Length: ${this._getLength(data)}`);
            }
            console.log(`Data: ${JSON.stringify(data, null, 2)}`);
        }
    }
    
    /**
     * Return list of all table names.
     * 
     * @returns {string[]} Array of table names
     */
    listTables() {
        return Object.keys(this.data);
    }
    
    /**
     * Check if table exists.
     * 
     * @param {string} tableName - Table name
     * @returns {boolean} True if table exists
     */
    tableExists(tableName) {
        return tableName in this.data;
    }
    
    /**
     * Get detailed information about table.
     * 
     * @param {string} tableName - Table name
     * @returns {Object} Object with table information
     */
    getTableInfo(tableName) {
        if (!(tableName in this.data)) {
            return { exists: false };
        }
        
        const data = this.data[tableName];
        return {
            exists: true,
            name: tableName,
            type: this._getType(data),
            length: this._getLength(data),
            data: data
        };
    }
    
    /**
     * Get type of value.
     * 
     * @param {*} value - Value to check type
     * @returns {string} Type name
     * @private
     */
    _getType(value) {
        if (Array.isArray(value)) return 'Array';
        if (value === null) return 'null';
        return typeof value;
    }
    
    /**
     * Get length of value if applicable.
     * 
     * @param {*} value - Value to check length
     * @returns {number} Length or 0
     * @private
     */
    _getLength(value) {
        if (Array.isArray(value) || typeof value === 'string') {
            return value.length;
        }
        if (typeof value === 'object' && value !== null) {
            return Object.keys(value).length;
        }
        return 0;
    }
}

export { JsonDB };
