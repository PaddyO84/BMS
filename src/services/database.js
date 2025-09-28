import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';

const DB_NAME = 'bmsys_db';

let db = null;
const sqlite = new SQLiteConnection(CapacitorSQLite);

const initializeDB = async () => {
    try {
        const platform = Capacitor.getPlatform();
        if (platform === "web") {
            const jeepSqlite = document.createElement("jeep-sqlite");
            document.body.appendChild(jeepSqlite);
            await customElements.whenDefined('jeep-sqlite');
            await sqlite.initWebStore();
        }
        const ret = await sqlite.checkConnectionsConsistency();
        const isConn = (await sqlite.isConnection(DB_NAME, false)).result;

        if (ret.result && isConn) {
            db = await sqlite.retrieveConnection(DB_NAME, false);
        } else {
            db = await sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
        }

        await db.open();
        await createSchema(db);
        return db;
    } catch (err) {
        console.error("Error initializing database", err);
        return null;
    }
};

const createSchema = async (db) => {
    const schema = `
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            address TEXT
        );
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customerId INTEGER,
            jobTitle TEXT NOT NULL,
            status TEXT,
            taxRate REAL,
            subTotal REAL,
            taxAmount REAL,
            total REAL,
            createdAt TEXT,
            FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS labour (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            jobId INTEGER,
            description TEXT,
            hours REAL,
            rate REAL,
            FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS materials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            jobId INTEGER,
            name TEXT,
            quantity REAL,
            cost REAL,
            FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS business_profile (
            id INTEGER PRIMARY KEY DEFAULT 1,
            name TEXT,
            address TEXT,
            email TEXT,
            phone TEXT,
            mobile TEXT,
            vatNumber TEXT,
            logo TEXT
        );
    `;
    await db.execute(schema);
    const res = await db.query('SELECT * FROM business_profile WHERE id = 1;');
    if (res.values.length === 0) {
        await db.run('INSERT INTO business_profile (id, name) VALUES (1, "Your Business Name");');
    }
};

export const getDB = () => {
    if (!db) {
        throw new Error("Database not initialized. Call initializeDB first.");
    }
    return db;
};

// --- Customer Operations ---
export const getCustomers = async () => await getDB().query('SELECT * FROM customers ORDER BY name;');
export const getCustomerById = async (id) => await getDB().query('SELECT * FROM customers WHERE id = ?;', [id]);
export const addCustomer = async (customer) => {
    const { name, email, phone, address } = customer;
    const sql = 'INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?);';
    return await getDB().run(sql, [name, email, phone, address]);
};
export const updateCustomer = async (customer) => {
    const { id, name, email, phone, address } = customer;
    const sql = 'UPDATE customers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?;';
    return await getDB().run(sql, [name, email, phone, address, id]);
};

// --- Job Operations ---
export const getJobs = async () => {
    const db = getDB();
    const [jobsResult, labourResult, materialsResult] = await Promise.all([
        db.query('SELECT * FROM jobs ORDER BY createdAt DESC;'),
        db.query('SELECT * FROM labour;'),
        db.query('SELECT * FROM materials;')
    ]);

    const jobs = jobsResult.values || [];
    const labourItems = labourResult.values || [];
    const materialItems = materialsResult.values || [];

    const jobsById = new Map(jobs.map(job => [job.id, { ...job, labour: [], materials: [] }]));

    for (const item of labourItems) {
        if (jobsById.has(item.jobId)) {
            jobsById.get(item.jobId).labour.push(item);
        }
    }

    for (const item of materialItems) {
        if (jobsById.has(item.jobId)) {
            jobsById.get(item.jobId).materials.push(item);
        }
    }

    return { values: Array.from(jobsById.values()) };
};

export const addJob = async (job) => {
    const { customerId, jobTitle, status } = job;
    const createdAt = new Date().toISOString();
    const sql = 'INSERT INTO jobs (customerId, jobTitle, status, createdAt) VALUES (?, ?, ?, ?);';
    const res = await getDB().run(sql, [customerId, jobTitle, status, createdAt]);
    return res.changes.lastId;
};

export const updateJob = async (job) => {
    const { id, customerId, jobTitle, status, taxRate, subTotal, taxAmount, total, labour, materials } = job;

    const jobSql = 'UPDATE jobs SET customerId = ?, jobTitle = ?, status = ?, taxRate = ?, subTotal = ?, taxAmount = ?, total = ? WHERE id = ?;';
    await getDB().run(jobSql, [customerId, jobTitle, status, taxRate, subTotal, taxAmount, total, id]);

    await getDB().run('DELETE FROM labour WHERE jobId = ?;', [id]);
    await getDB().run('DELETE FROM materials WHERE jobId = ?;', [id]);

    for (const item of labour || []) {
        const labourSql = 'INSERT INTO labour (jobId, description, hours, rate) VALUES (?, ?, ?, ?);';
        await getDB().run(labourSql, [id, item.description, item.hours, item.rate]);
    }
    for (const item of materials || []) {
        const materialSql = 'INSERT INTO materials (jobId, name, quantity, cost) VALUES (?, ?, ?, ?);';
        await getDB().run(materialSql, [id, item.name, item.quantity, item.cost]);
    }
};

// --- Business Profile Operations ---
export const getBusinessProfile = async () => {
    const res = await getDB().query('SELECT * FROM business_profile WHERE id = 1;');
    return res.values[0];
};

export const updateBusinessProfile = async (profile) => {
    const { name, address, email, phone, mobile, vatNumber, logo } = profile;
    const sql = 'UPDATE business_profile SET name = ?, address = ?, email = ?, phone = ?, mobile = ?, vatNumber = ?, logo = ? WHERE id = 1;';
    return await getDB().run(sql, [name, address, email, phone, mobile, vatNumber, logo]);
};

export { initializeDB };