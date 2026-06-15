const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data', 'db.json');

// Ensure db directory and file exist
function initDB() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], products: [], orders: [] }, null, 2));
  }
}

function readDB() {
  initDB();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { users: [], products: [], orders: [] };
  }
}

function writeDB(data) {
  initDB();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Simple ObjectId validation
const ObjectId = {
  isValid: (id) => typeof id === 'string' && id.length === 24,
  toString: (id) => String(id)
};

// Generate a random 24-char hex string as mock ObjectId
function generateId() {
  let id = '';
  const hex = '0123456789abcdef';
  for (let i = 0; i < 24; i++) {
    id += hex[Math.floor(Math.random() * 16)];
  }
  return id;
}

class Schema {
  constructor(definition, options) {
    this.definition = definition;
    this.options = options || {};
    this.methods = {};
    this.pres = {};
  }

  pre(event, fn) {
    if (!this.pres[event]) this.pres[event] = [];
    this.pres[event].push(fn);
  }
}

Schema.Types = {
  ObjectId: 'ObjectId'
};

const models = {};

class QueryPromise {
  constructor(execPromise) {
    this.execPromise = execPromise;
    this.modifiers = [];
  }

  sort(arg) {
    this.modifiers.push((data) => {
      if (!Array.isArray(data)) return data;
      if (typeof arg === 'object') {
        const key = Object.keys(arg)[0];
        const dir = arg[key]; // 1 or -1
        return data.sort((a, b) => {
          let valA = a[key];
          let valB = b[key];
          if (valA instanceof Date) valA = valA.getTime();
          if (valB instanceof Date) valB = valB.getTime();
          if (valA < valB) return dir === -1 ? 1 : -1;
          if (valA > valB) return dir === -1 ? -1 : 1;
          return 0;
        });
      }
      return data;
    });
    return this;
  }

  populate(pathName, select) {
    this.modifiers.push(async (data) => {
      const isArray = Array.isArray(data);
      const items = isArray ? data : (data ? [data] : []);
      
      for (const item of items) {
        if (pathName === 'userId') {
          const userId = item.userId;
          if (userId) {
            const db = readDB();
            const user = db.users.find(u => String(u._id) === String(userId));
            if (user) {
              item.userId = {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
              };
            }
          }
        } else if (pathName === 'createdBy') {
          const createdBy = item.createdBy;
          if (createdBy) {
            const db = readDB();
            const user = db.users.find(u => String(u._id) === String(createdBy));
            if (user) {
              item.createdBy = {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
              };
            }
          }
        }
      }
      return data;
    });
    return this;
  }

  select(arg) {
    // Select is handled implicitly or as a no-op since password can be checked by controller
    return this;
  }

  async then(onFulfilled, onRejected) {
    try {
      let result = await this.execPromise;
      if (result !== null && result !== undefined) {
        // Run modifiers
        for (const modifier of this.modifiers) {
          result = await modifier(result);
        }

        const clone = (item) => {
          if (item && item.constructor && item.constructor.name === 'Model') {
            const raw = JSON.parse(JSON.stringify(item));
            return new item.constructor(raw);
          }
          return JSON.parse(JSON.stringify(item));
        };

        if (Array.isArray(result)) {
          result = result.map(clone);
        } else {
          result = clone(result);
        }
      }
      if (onFulfilled) return onFulfilled(result);
      return result;
    } catch (err) {
      if (onRejected) return onRejected(err);
      throw err;
    }
  }

  async catch(onRejected) {
    return this.then(null, onRejected);
  }
}

function createModel(modelName, schema) {
  const collectionName = modelName.toLowerCase() + 's';

  class Model {
    constructor(data) {
      Object.assign(this, data);

      // Apply schema defaults
      for (const [key, prop] of Object.entries(schema.definition)) {
        if (this[key] === undefined && prop && typeof prop === 'object' && 'default' in prop) {
          this[key] = typeof prop.default === 'function' ? prop.default() : prop.default;
        }
      }

      if (!this._id) {
        this._id = generateId();
      }
      
      if (schema.options.timestamps) {
        if (!this.createdAt) {
          this.createdAt = new Date().toISOString();
        }
        this.updatedAt = new Date().toISOString();
      } else {
        if (schema.definition.createdAt && this.createdAt === undefined) {
          const prop = schema.definition.createdAt;
          if (prop && prop.default) {
            this.createdAt = typeof prop.default === 'function' ? prop.default() : prop.default;
          }
        }
      }

      // Copy methods from schema.methods
      for (const [key, fn] of Object.entries(schema.methods)) {
        this[key] = fn.bind(this);
      }
    }

    isModified(field) {
      if (field === 'password') {
        // Assume password is modified if it's not currently hashed
        return this.password && !this.password.startsWith('$2a$');
      }
      return true;
    }

    async save() {
      // Run pre-save hooks
      if (schema.pres['save']) {
        for (const preFn of schema.pres['save']) {
          await new Promise((resolve, reject) => {
            preFn.call(this, (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        }
      }

      const db = readDB();
      const collection = db[collectionName];
      const index = collection.findIndex(item => String(item._id) === String(this._id));
      
      const doc = JSON.parse(JSON.stringify(this)); // plain object to save
      if (index >= 0) {
        collection[index] = doc;
      } else {
        collection.push(doc);
      }
      writeDB(db);
      return this;
    }
  }

  // Static Methods
  Model.find = function (filter) {
    const promise = (async () => {
      const db = readDB();
      const collection = db[collectionName];
      if (!filter || Object.keys(filter).length === 0) {
        return collection.map(d => new Model(d));
      }
      return collection
        .filter(item => matchFilter(item, filter))
        .map(d => new Model(d));
    })();
    return new QueryPromise(promise);
  };

  Model.findOne = function (filter) {
    const promise = (async () => {
      const db = readDB();
      const collection = db[collectionName];
      if (!filter || Object.keys(filter).length === 0) {
        return collection.length > 0 ? new Model(collection[0]) : null;
      }
      const item = collection.find(item => matchFilter(item, filter));
      return item ? new Model(item) : null;
    })();
    return new QueryPromise(promise);
  };

  Model.findById = function (id) {
    const promise = (async () => {
      const db = readDB();
      const collection = db[collectionName];
      const item = collection.find(item => String(item._id) === String(id));
      return item ? new Model(item) : null;
    })();
    return new QueryPromise(promise);
  };

  Model.create = async function (data) {
    const instance = new Model(data);
    await instance.save();
    return instance;
  };

  Model.findByIdAndDelete = function (id) {
    const promise = (async () => {
      const db = readDB();
      const collection = db[collectionName];
      const index = collection.findIndex(item => String(item._id) === String(id));
      if (index >= 0) {
        const [deleted] = collection.splice(index, 1);
        writeDB(db);
        return new Model(deleted);
      }
      return null;
    })();
    return new QueryPromise(promise);
  };

  Model.deleteMany = async function (filter) {
    const db = readDB();
    if (!filter || Object.keys(filter).length === 0) {
      db[collectionName] = [];
    } else {
      db[collectionName] = db[collectionName].filter(item => !matchFilter(item, filter));
    }
    writeDB(db);
    return { deletedCount: db[collectionName].length };
  };

  Model.insertMany = async function (arr) {
    const docs = [];
    for (const data of arr) {
      const instance = new Model(data);
      await instance.save();
      docs.push(instance);
    }
    return docs;
  };

  models[modelName] = Model;
  return Model;
}

function matchFilter(item, filter) {
  if (!filter || Object.keys(filter).length === 0) return true;
  for (const key of Object.keys(filter)) {
    if (key === '$or') {
      const conditions = filter.$or;
      let matchOr = false;
      for (const cond of conditions) {
        if (matchFilter(item, cond)) {
          matchOr = true;
          break;
        }
      }
      if (!matchOr) return false;
    } else {
      const val = filter[key];
      const itemVal = item[key];
      if (val && typeof val === 'object' && val.$regex) {
        const regex = new RegExp(val.$regex, val.$options || '');
        if (!regex.test(itemVal || '')) return false;
      } else {
        if (String(itemVal) !== String(val)) return false;
      }
    }
  }
  return true;
}

const mockMongoose = {
  Schema,
  model: (name, schema) => models[name] || createModel(name, schema),
  connect: async (uri, options) => {
    console.log('Mocking Mongoose database connection to in-memory JSON storage...');
    initDB();
    return {
      connection: {
        host: 'localhost (Mock JSON DB)'
      }
    };
  },
  connection: {
    close: () => {
      console.log('Mock database connection closed.');
    }
  },
  Types: {
    ObjectId: {
      isValid: ObjectId.isValid
    }
  }
};

module.exports = mockMongoose;
