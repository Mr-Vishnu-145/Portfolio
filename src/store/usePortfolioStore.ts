import { create } from "zustand";
import { getPortfolioData, savePortfolioData, PortfolioData } from "@/lib/portfolioData";
import { fetchPortfolioFromDb, savePortfolioToDb } from "@/lib/turso";

interface PortfolioState {
  data: PortfolioData;
  dbError: string | null;
  load: () => void;
  loadFromDb: () => Promise<void>;
  updateData: (newData: PortfolioData) => Promise<boolean>;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  data: getPortfolioData(),
  dbError: null,
  load: () => set({ data: getPortfolioData() }),
  loadFromDb: async () => {
    try {
      const dbData = await fetchPortfolioFromDb();
      if (dbData) {
        set({ dbError: null });
        const currentData = usePortfolioStore.getState().data;
        if (JSON.stringify(currentData) !== JSON.stringify(dbData)) {
          savePortfolioData(dbData);
          set({ data: dbData });
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("portfolioDataUpdate"));
          }
        }
      } else {
        set({ dbError: "Failed to load database. Please verify VITE_TURSO_AUTH_TOKEN is configured." });
      }
    } catch (error) {
      console.error("Zustand db loading error:", error);
      set({ dbError: (error as Error).message || "Database load error." });
    }
  },
  updateData: async (newData: PortfolioData): Promise<boolean> => {
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
    }
  },
}));
