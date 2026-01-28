import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";

import { models } from "../models";
import migrations from "./migrations";
import schema from "./schema";

// Create Adapter
const adapter = new SQLiteAdapter({
    schema,
    migrations,
    jsi: false, // keep false for expo managed workflow
    dbName: "zemenawi_defter_db",
    onSetUpError: (error) => {
        console.error("Database setup error:", error);
    },
});

// Create Database instance
const database = new Database({
    adapter,
    modelClasses: models,
});

export default database;
