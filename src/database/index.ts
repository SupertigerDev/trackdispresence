import { Database } from "bun:sqlite";

export const db = new Database("mydb.sqlite", {create: true});


export interface Detectable {
    id: string;
    icon: string;
    name: string;
}


export const insertDetectable = (detectable: Detectable) => {
    db.query(`
        INSERT INTO detectables (name, icon, id) VALUES (?, ?, ?) ON CONFLICT(name) DO UPDATE SET icon = ? , id = ? WHERE detectables.name = ?
    `).run(detectable.name, detectable.icon, detectable.id, detectable.icon, detectable.id, detectable.name);
}

export const getDetectable = (name: string) => db.query(`SELECT id, icon FROM detectables WHERE name = ?`).get(name) as {id: string, icon: string};