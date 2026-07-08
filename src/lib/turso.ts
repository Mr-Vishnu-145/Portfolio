import { createClient } from "@libsql/client/web";
import { PortfolioData, defaultPortfolioData } from "./portfolioData";

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
 * Initializes the portfolio_data table and inserts the default portfolio data if empty
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

    // Check if initial row exists
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

/**
 * Fetches the portfolio data from the Turso database
 */
export const fetchPortfolioFromDb = async (): Promise<PortfolioData | null> => {
  if (!dbToken) return null;

  try {
    await initDatabase();
    const result = await client.execute("SELECT data FROM portfolio_data WHERE id = 1 LIMIT 1");
    if (result.rows.length > 0) {
      const rawData = result.rows[0].data as string;
      return JSON.parse(rawData) as PortfolioData;
    }
  } catch (error) {
    console.error("Error fetching portfolio from Turso DB:", error);
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
