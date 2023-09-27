import sqlite3 from "sqlite3";

// Crete a function to save a new Register of fetch inside de sqlite database
export function increaseFetch() {
  // create a new table to count the fetch if not exists
  const db = new sqlite3.Database("database.sqlite3");

  // create the table with an count column to count the number of fetches
  db.run(
    `
    CREATE TABLE IF NOT EXISTS fetch (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      type TEXT
    )
  `,
    () => {
      // increment the fetch count
      db.run(`
    INSERT INTO fetch (date, type)
    VALUES (datetime('now'), 'product')
  `);
      // close the connection
      db.close();
    }
  );
}

export async function numberOfFetchs() {
  // create a new table to count the fetch if not exists
  const db = new sqlite3.Database("database.sqlite3");

  // select the count of fetches and return as a promise
  return new Promise((resolve, reject) => {
    // create the table with an count column to count the number of fetches
    db.run(
      `
    CREATE TABLE IF NOT EXISTS fetch (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      type TEXT
    )
  `,
      () => {
        db.get(
          `
      SELECT COUNT(*) as count
      FROM fetch
      WHERE type = 'product'
    `,
          (err, row) => {
            if (err) reject(err);
            resolve(row.count);
          }
        );
      }
    );
  });
}

export function removeFetches() {
  // remove the table
  const db = new sqlite3.Database("database.sqlite3");
  try {
    // remove the table if exists
    db.run(`
    DROP TABLE IF EXISTS fetch
  `);

    // close the connection
  } finally {
    db.close();
  }
}
