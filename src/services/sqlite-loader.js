import { JeepSqlite } from 'jeep-sqlite/dist/components/jeep-sqlite';

customElements.define('jeep-sqlite', JeepSqlite);

window.addEventListener('DOMContentLoaded', async () => {
    const platform = Capacitor.getPlatform();
    if(platform === "web") {
        const jeepEl = document.createElement("jeep-sqlite");
        document.body.appendChild(jeepEl);
        await customElements.whenDefined('jeep-sqlite');
        const sqlite = await sqliteConnection.initWebStore();
    }
});