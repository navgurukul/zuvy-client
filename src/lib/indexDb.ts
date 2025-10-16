// db.ts
import Dexie, { Table } from "dexie";

export interface Permission {
  key: string;
  value: boolean;
}

class AppDB extends Dexie {
  permissions!: Table<Permission, string>;

  constructor() {
    super("AppDB");
    this.version(1).stores({
      permissions: "key", // key will be the permission name
    });
  }
}

export const db = new AppDB();
