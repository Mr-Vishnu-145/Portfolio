import { createClient } from "@libsql/client/web";
import { PortfolioData, defaultPortfolioData } from "./portfolioData";

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

const dbUrl = import.meta.env.VITE_TURSO_DATABASE_URL || "libsql://database-mr-vishnu-145.aws-ap-south-1.turso.io";
const dbToken = import.meta.env.VITE_TURSO_AUTH_TOKEN || "";

export const isTursoActive = !!dbToken;

// Normalize libsql:// to https:// for browser-based fetch client compatibility
const normalizeUrl = (url: string) => {
  if (url.startsWith("libsql://")) {
    return "https://" + url.substring(9);
  }
  return url;
};

// Create LibSQL Client compatible with Web/Browser envs
const client = createClient({
  url: normalizeUrl(dbUrl),
  authToken: dbToken,
});

let isDbInitialized = false;

/**
 * Initializes the database tables
 */
export const initDatabase = async (): Promise<void> => {
  if (!dbToken) {
    console.warn("Turso VITE_TURSO_AUTH_TOKEN is not configured. Database connection skipped.");
    return;
  }
  if (isDbInitialized) return;

  try {
    // Create the schema table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS portfolio_data (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        data TEXT NOT NULL
      );
    `);

    // Create the contact messages table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check if initial row exists in portfolio_data
    const result = await client.execute("SELECT COUNT(*) as cnt FROM portfolio_data");
    const count = Number(result.rows[0]?.cnt ?? 0);
    
    if (count === 0) {
      await client.execute({
        sql: "INSERT INTO portfolio_data (id, data) VALUES (1, ?)",
        args: [JSON.stringify(defaultPortfolioData)],
      });
    }
    isDbInitialized = true;
  } catch (error) {
    console.error("Failed to initialize Turso database schema:", error);
    throw error;
  }
};

export const fetchPortfolioFromDb = async (): Promise<PortfolioData | null> => {
  if (!dbToken) return null;

  try {
    const result = await client.execute("SELECT data FROM portfolio_data WHERE id = 1 LIMIT 1");
    if (result.rows.length > 0) {
      const rawData = result.rows[0].data as string;
      return JSON.parse(rawData) as PortfolioData;
    }
  } catch (error: any) {
    const errMsg = error?.message || "";
    if (errMsg.includes("no such table") || errMsg.includes("does not exist") || errMsg.includes("not found")) {
      try {
        console.log("Database table not found. Initializing schema...");
        await initDatabase();
        const result = await client.execute("SELECT data FROM portfolio_data WHERE id = 1 LIMIT 1");
        if (result.rows.length > 0) {
          const rawData = result.rows[0].data as string;
          return JSON.parse(rawData) as PortfolioData;
        }
      } catch (initError) {
        console.error("Error after database initialization:", initError);
      }
    } else {
      console.error("Error fetching portfolio from Turso DB:", error);
    }
  }
  return null;
};

/**
 * Saves the portfolio data to the Turso database
 */
export const savePortfolioToDb = async (data: PortfolioData): Promise<boolean> => {
  if (!dbToken) {
    console.warn("Turso Auth Token is missing. Remote DB update skipped.");
    return false;
  }

  try {
    await initDatabase();
    await client.execute({
      sql: "INSERT OR REPLACE INTO portfolio_data (id, data) VALUES (1, ?)",
      args: [JSON.stringify(data)],
    });
    return true;
  } catch (error) {
    console.error("Error saving portfolio to Turso DB:", error);
    return false;
  }
};

/**
 * Saves a contact message to the Turso database
 */
export const saveContactMessage = async (
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<boolean> => {
  if (!isTursoActive) {
    console.error("Database connection inactive. Cannot save contact message.");
    return false;
  }

  try {
    await initDatabase();
    await client.execute({
      sql: "INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
      args: [name, email, subject, message],
    });
    return true;
  } catch (error) {
    console.error("Error saving contact message to Turso DB:", error);
    return false;
  }
};

/**
 * Fetches all contact messages from the database
 */
export const fetchContactMessages = async (): Promise<ContactMessage[]> => {
  if (!isTursoActive) {
    console.error("Database connection inactive. Cannot fetch contact messages.");
    return [];
  }

  try {
    const result = await client.execute("SELECT * FROM contact_messages ORDER BY created_at DESC");
    return result.rows.map((row) => ({
      id: Number(row.id),
      name: row.name as string,
      email: row.email as string,
      subject: row.subject as string,
      message: row.message as string,
      created_at: row.created_at as string,
    })) as ContactMessage[];
  } catch (error: any) {
    const errMsg = error?.message || "";
    if (errMsg.includes("no such table") || errMsg.includes("does not exist") || errMsg.includes("not found")) {
      try {
        await initDatabase();
        const result = await client.execute("SELECT * FROM contact_messages ORDER BY created_at DESC");
        return result.rows.map((row) => ({
          id: Number(row.id),
          name: row.name as string,
          email: row.email as string,
          subject: row.subject as string,
          message: row.message as string,
          created_at: row.created_at as string,
        })) as ContactMessage[];
      } catch (initError) {
        console.error("Error after database initialization:", initError);
      }
    } else {
      console.error("Error fetching contact messages from Turso DB:", error);
    }
    return [];
  }
};

/**
 * Deletes a contact message by ID
 */
export const deleteContactMessage = async (id: number): Promise<boolean> => {
  if (!isTursoActive) {
    console.error("Database connection inactive. Cannot delete contact message.");
    return false;
  }

  try {
    await initDatabase();
    await client.execute({
      sql: "DELETE FROM contact_messages WHERE id = ?",
      args: [id],
    });
    return true;
  } catch (error) {
    console.error("Error deleting contact message from Turso DB:", error);
    return false;
  }
};
