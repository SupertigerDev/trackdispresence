import { db } from "..";

db.query(`
    CREATE TABLE detectables (
        name TEXT NOT NULL PRIMARY KEY,
        id TEXT NOT NULL,
        icon TEXT NOT NULL
    );
`).run();