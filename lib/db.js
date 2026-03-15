/**
 * lib/db.js
 * MySQL connection pool using mysql2/promise.
 * Compatible with MySQL as required by hackathon spec.
 */

let pool;

export async function getPool() {
  if (typeof window !== 'undefined') return null; // browser guard
  try {
    const mysql = await import('mysql2/promise');
    if (!pool) {
      pool = mysql.createPool({
        host:     process.env.DB_HOST     || 'localhost',
        port:     parseInt(process.env.DB_PORT || '3306', 10),
        user:     process.env.DB_USER     || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME     || 'sip_calculator',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
    }
    return pool;
  } catch {
    return null;
  }
}