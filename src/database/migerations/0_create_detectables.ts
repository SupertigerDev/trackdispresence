import { db } from "..";

db.query(
  `
    CREATE TABLE detectables (
        id TEXT NOT NULL PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT NOT NULL
    );
`,
).run();
