import { create } from "zustand";
import { getPortfolioData, savePortfolioData, PortfolioData } from "@/lib/portfolioData";
import { fetchPortfolioFromDb, savePortfolioToDb } from "@/lib/turso";

interface PortfolioState {
  data: PortfolioData;
  dbError: string | null;
  isWriting: boolean;
  isDbLoaded: boolean;
  load: () => void;
  loadFromDb: () => Promise<void>;
  updateData: (newData: PortfolioData) => Promise<boolean>;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  data: getPortfolioData(),
  dbError: null,
  isWriting: false,
  isDbLoaded: true, // 0ms initial render

  load: () => set({ data: getPortfolioData() }),

  loadFromDb: async () => {
    if (get().isWriting) return;

    try {
      const dbPromise = fetchPortfolioFromDb();
      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("Database fetch timed out.")), 4000)
      );

      const dbData = await Promise.race([dbPromise, timeoutPromise]);
      if (dbData) {
        if (get().isWriting) return;
        set({ dbError: null });
        const currentData = get().data;
        if (JSON.stringify(currentData) !== JSON.stringify(dbData)) {
          savePortfolioData(dbData);
          set({ data: dbData });
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("portfolioDataUpdate"));
          }
        }
      }
    } catch (error) {
      console.error("Zustand background db loading error:", error);
    }
  },

  updateData: async (newData: PortfolioData): Promise<boolean> => {
    set({ isWriting: true });
    savePortfolioData(newData);
    set({ data: newData });
    try {
      const success = await savePortfolioToDb(newData);
      if (success) {
        set({ dbError: null });
        return true;
      } else {
        set({ dbError: "Failed to write updates to the database." });
        return false;
      }
    } catch (error) {
      console.error("Zustand db update error:", error);
      set({ dbError: (error as Error).message || "Database write error." });
      return false;
    } finally {
      set({ isWriting: false });
    }
  },
}));
