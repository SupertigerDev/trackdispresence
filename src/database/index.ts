import { Database } from "bun:sqlite";

export const db = new Database("mydb.sqlite", { create: true });

export interface Detectable {
  id: string;
  icon: string;
  name: string;
}

export const insertDetectable = (detectable: Detectable) => {
  db.query(
    `
        INSERT INTO detectables (name, icon, id) VALUES (?, ?, ?) `,
  ).run(detectable.name, detectable.icon, detectable.id);
};

export const getDetectableByName = (name: string) =>
  db.query(`SELECT id, icon FROM detectables WHERE name = ?`).get(name) as {
    id: string;
    icon: string;
  };
export const getDetectableById = (id?: string | null) =>
  id
    ? (db.query(`SELECT id, icon FROM detectables WHERE id = ?`).get(id) as {
        id: string;
        icon: string;
      })
    : null;
