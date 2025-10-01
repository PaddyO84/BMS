import { Filesystem, Directory } from '@capacitor/filesystem';
import * as db from './database';

const BACKUP_FILE = 'bmsys_backup.json';

export const createBackup = async () => {
    try {
        console.log("Starting backup...");
        const settings = await db.getAppSettings();
        const backupLocation = settings.backupLocation;

        if (!backupLocation) {
            console.warn("Backup location not set. Skipping backup.");
            return false;
        }

        const customers = (await db.getCustomers()).values || [];
        const jobs = (await db.getJobs()).values || [];
        const profile = await db.getBusinessProfile();

        const backupData = {
            createdAt: new Date().toISOString(),
            data: {
                customers,
                jobs,
                profile,
                settings,
            }
        };

        const path = `${backupLocation}/${BACKUP_FILE}`;

        await Filesystem.writeFile({
            path,
            data: JSON.stringify(backupData, null, 2),
            directory: Directory.External, // Use External to allow access to user-defined paths
            recursive: true,
        });

        console.log(`Backup created successfully at: ${path}`);
        return true;
    } catch (error) {
        console.error("Error creating backup:", error);
        return false;
    }
};

export const restoreBackup = async () => {
    try {
        console.log("Starting restore...");
        const settings = await db.getAppSettings();
        const backupLocation = settings.backupLocation;

        if (!backupLocation) {
            console.error("Backup location not set. Cannot restore.");
            return false;
        }

        const path = `${backupLocation}/${BACKUP_FILE}`;
        const contents = await Filesystem.readFile({
            path,
            directory: Directory.External,
        });

        const backupData = JSON.parse(new TextDecoder().decode(contents.data));
        const { customers, jobs, profile, settings: backupSettings } = backupData.data;

        // Clear existing data
        const database = db.getDB();
        await database.execute('DELETE FROM labour;');
        await database.execute('DELETE FROM materials;');
        await database.execute('DELETE FROM tasks;');
        await database.execute('DELETE FROM vendors;');
        await database.execute('DELETE FROM job_images;');
        await database.execute('DELETE FROM jobs;');
        await database.execute('DELETE FROM customers;');

        // Restore business profile
        await db.updateBusinessProfile(profile);

        // Restore app settings
        for (const key in backupSettings) {
            await db.updateAppSetting(key, backupSettings[key]);
        }

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
        const settings = await db.getAppSettings();
        const backupLocation = settings.backupLocation;

        if (!backupLocation) {
            return 0;
        }

        const path = `${backupLocation}/${BACKUP_FILE}`;
        const result = await Filesystem.stat({
            path,
            directory: Directory.External,
        });
        return result.mtime;
    } catch (e) {
        // File doesn't exist or other error
        return 0;
    }
};