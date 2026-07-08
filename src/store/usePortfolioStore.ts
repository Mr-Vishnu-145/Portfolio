import { create } from "zustand";
import { getPortfolioData, savePortfolioData, PortfolioData } from "@/lib/portfolioData";
import { fetchPortfolioFromDb, savePortfolioToDb, isTursoActive } from "@/lib/turso";

interface PortfolioState {
  data: PortfolioData;
  load: () => void;
  loadFromDb: () => Promise<void>;
  updateData: (newData: PortfolioData) => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  data: getPortfolioData(),
  load: () => set({ data: getPortfolioData() }),
  loadFromDb: async () => {
    const dbData = await fetchPortfolioFromDb();
    if (dbData) {
      const currentData = usePortfolioStore.getState().data;
      if (JSON.stringify(currentData) !== JSON.stringify(dbData)) {
        savePortfolioData(dbData);
        set({ data: dbData });
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("portfolioDataUpdate"));
        }
      }
    }
  },
  updateData: (newData: PortfolioData) => {
    savePortfolioData(newData);
    set({ data: newData });
    // Save to Turso Cloud DB in background
    savePortfolioToDb(newData);
  },
}));

// Synchronize storage updates across tabs/windows in real-time if Turso is not active
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "portfolio_data" && !isTursoActive) {
      usePortfolioStore.getState().load();
    }
  });
}
