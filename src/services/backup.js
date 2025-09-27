import { Filesystem, Directory } from '@capacitor/filesystem';
import * as db from './database';

const BACKUP_FILE = 'bmsys_backup.json';

export const createBackup = async () => {
    try {
        console.log("Starting backup...");
        const customers = (await db.getCustomers()).values || [];
        const jobs = (await db.getJobs()).values || [];

        const backupData = {
            createdAt: new Date().toISOString(),
            data: {
                customers,
                jobs,
            }
        };

        await Filesystem.writeFile({
            path: BACKUP_FILE,
            data: JSON.stringify(backupData, null, 2),
            directory: Directory.Documents,
            recursive: true,
        });

        console.log("Backup created successfully.");
        return true;
    } catch (error) {
        console.error("Error creating backup:", error);
        return false;
    }
};

export const restoreBackup = async () => {
    try {
        console.log("Starting restore...");
        const contents = await Filesystem.readFile({
            path: BACKUP_FILE,
            directory: Directory.Documents,
        });

        const backupData = JSON.parse(new TextDecoder().decode(contents.data));
        const { customers, jobs } = backupData.data;

        // Clear existing data
        const database = db.getDB();
        await database.execute('DELETE FROM labour;');
        await database.execute('DELETE FROM materials;');
        await database.execute('DELETE FROM jobs;');
        await database.execute('DELETE FROM customers;');

        // Restore customers
        for (const customer of customers) {
            await db.addCustomer(customer);
        }

        // Restore jobs and their items
        for (const job of jobs) {
            const newJobId = await db.addJob(job);
            const fullJobData = { ...job, id: newJobId };
            await db.updateJob(fullJobData);
        }

        console.log("Restore completed successfully.");
        return true;
    } catch (error) {
        console.error("Error restoring backup:", error);
        return false;
    }
};

export const getLastBackupTimestamp = async () => {
    try {
        const result = await Filesystem.stat({
            path: BACKUP_FILE,
            directory: Directory.Documents,
        });
        return result.mtime;
    } catch (e) {
        // File doesn't exist
        return 0;
    }
};