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
            companyName TEXT,
            email TEXT,
            phoneNumbers TEXT,
            roleTitle TEXT,
            address TEXT
        );
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customerId INTEGER,
            jobTitle TEXT NOT NULL,
            status TEXT,
            dateRequested TEXT,
            taxRate REAL,
            subTotal REAL,
            taxAmount REAL,
            total REAL,
            createdAt TEXT,
            FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            jobId INTEGER,
            description TEXT NOT NULL,
            completed INTEGER DEFAULT 0,
            FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS vendors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            jobId INTEGER,
            name TEXT NOT NULL,
            contact TEXT,
            FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS job_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            jobId INTEGER,
            type TEXT,
            imagePath TEXT,
            FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE
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
        CREATE TABLE IF NOT EXISTS app_settings (
            key TEXT PRIMARY KEY,
            value TEXT
        );
    `;
    await db.execute(schema);
    const res = await db.query('SELECT * FROM business_profile WHERE id = 1;');
    if (res.values.length === 0) {
        await db.run('INSERT INTO business_profile (id, name) VALUES (1, "Your Business Name");');
    }

    const defaultSettings = [
        { key: 'reminders', value: 'daily' },
        { key: 'theme', value: 'light' },
        { key: 'backupLocation', value: '' }
    ];

    for (const setting of defaultSettings) {
        const existing = await db.query('SELECT * FROM app_settings WHERE key = ?;', [setting.key]);
        if (existing.values.length === 0) {
            await db.run('INSERT INTO app_settings (key, value) VALUES (?, ?);', [setting.key, setting.value]);
        }
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
    const { name, companyName, email, phoneNumbers, roleTitle, address } = customer;
    const sql = 'INSERT INTO customers (name, companyName, email, phoneNumbers, roleTitle, address) VALUES (?, ?, ?, ?, ?, ?);';
    return await getDB().run(sql, [name, companyName, email, phoneNumbers, roleTitle, address]);
};
export const updateCustomer = async (customer) => {
    const { id, name, companyName, email, phoneNumbers, roleTitle, address } = customer;
    const sql = 'UPDATE customers SET name = ?, companyName = ?, email = ?, phoneNumbers = ?, roleTitle = ?, address = ? WHERE id = ?;';
    return await getDB().run(sql, [name, companyName, email, phoneNumbers, roleTitle, address, id]);
};

// --- Job Operations ---
export const getJobs = async () => {
    const jobsResult = await getDB().query('SELECT * FROM jobs ORDER BY createdAt DESC;');
    const jobs = jobsResult.values || [];
    for (const job of jobs) {
        const labourResult = await getDB().query('SELECT * FROM labour WHERE jobId = ?;', [job.id]);
        job.labour = labourResult.values || [];
        const materialsResult = await getDB().query('SELECT * FROM materials WHERE jobId = ?;', [job.id]);
        job.materials = materialsResult.values || [];
        const tasksResult = await getDB().query('SELECT * FROM tasks WHERE jobId = ?;', [job.id]);
        job.tasks = tasksResult.values || [];
        const vendorsResult = await getDB().query('SELECT * FROM vendors WHERE jobId = ?;', [job.id]);
        job.vendors = vendorsResult.values || [];
        const imagesResult = await getDB().query('SELECT * FROM job_images WHERE jobId = ?;', [job.id]);
        job.images = imagesResult.values || [];
    }
    return { values: jobs };
};

export const addJob = async (job) => {
    const { customerId, jobTitle, status, dateRequested } = job;
    const createdAt = new Date().toISOString();
    const sql = 'INSERT INTO jobs (customerId, jobTitle, status, dateRequested, createdAt) VALUES (?, ?, ?, ?, ?);';
    const res = await getDB().run(sql, [customerId, jobTitle, status, dateRequested, createdAt]);
    return res.changes.lastId;
};

export const updateJob = async (job) => {
    const { id, customerId, jobTitle, status, dateRequested, taxRate, subTotal, taxAmount, total, labour, materials, tasks, vendors, images } = job;

    const jobSql = 'UPDATE jobs SET customerId = ?, jobTitle = ?, status = ?, dateRequested = ?, taxRate = ?, subTotal = ?, taxAmount = ?, total = ? WHERE id = ?;';
    await getDB().run(jobSql, [customerId, jobTitle, status, dateRequested, taxRate, subTotal, taxAmount, total, id]);

    await getDB().run('DELETE FROM labour WHERE jobId = ?;', [id]);
    await getDB().run('DELETE FROM materials WHERE jobId = ?;', [id]);
    await getDB().run('DELETE FROM tasks WHERE jobId = ?;', [id]);
    await getDB().run('DELETE FROM vendors WHERE jobId = ?;', [id]);
    await getDB().run('DELETE FROM job_images WHERE jobId = ?;', [id]);

    for (const item of labour || []) {
        const labourSql = 'INSERT INTO labour (jobId, description, hours, rate) VALUES (?, ?, ?, ?);';
        await getDB().run(labourSql, [id, item.description, item.hours, item.rate]);
    }
    for (const item of materials || []) {
        const materialSql = 'INSERT INTO materials (jobId, name, quantity, cost) VALUES (?, ?, ?, ?);';
        await getDB().run(materialSql, [id, item.name, item.quantity, item.cost]);
    }
    for (const item of tasks || []) {
        const taskSql = 'INSERT INTO tasks (jobId, description, completed) VALUES (?, ?, ?);';
        await getDB().run(taskSql, [id, item.description, item.completed]);
    }
    for (const item of vendors || []) {
        const vendorSql = 'INSERT INTO vendors (jobId, name, contact) VALUES (?, ?, ?);';
        await getDB().run(vendorSql, [id, item.name, item.contact]);
    }
    for (const item of images || []) {
        const imageSql = 'INSERT INTO job_images (jobId, type, imagePath) VALUES (?, ?, ?);';
        await getDB().run(imageSql, [id, item.type, item.imagePath]);
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

// --- App Settings Operations ---
export const getAppSettings = async () => {
    const res = await getDB().query('SELECT * FROM app_settings;');
    return res.values.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
    }, {});
};

export const updateAppSetting = async (key, value) => {
    const sql = 'UPDATE app_settings SET value = ? WHERE key = ?;';
    return await getDB().run(sql, [value, key]);
};

export { initializeDB };