import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { DailyGoals, FavoriteProduct, HistoryEntry, Product, Recipe } from "@/lib/types/product";

interface NutriScanDB extends DBSchema {
  history: {
    key: string;
    value: HistoryEntry;
    indexes: { "by-timestamp": number };
  };
  favorites: {
    key: string;
    value: FavoriteProduct;
  };
  manualProducts: {
    key: string;
    value: Product;
  };
  settings: {
    key: string;
    value: DailyGoals | unknown;
  };
  recipes: {
    key: string;
    value: Recipe;
  };
}

const DB_NAME = "nutriscan-db";
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<NutriScanDB>> | null = null;

function getDb(): Promise<IDBPDatabase<NutriScanDB>> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available in this environment"));
  }
  if (!dbPromise) {
    dbPromise = openDB<NutriScanDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("history")) {
          const store = db.createObjectStore("history", { keyPath: "id" });
          store.createIndex("by-timestamp", "timestamp");
        }
        if (!db.objectStoreNames.contains("favorites")) {
          db.createObjectStore("favorites", { keyPath: "barcode" });
        }
        if (!db.objectStoreNames.contains("manualProducts")) {
          db.createObjectStore("manualProducts", { keyPath: "barcode" });
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings");
        }
        if (!db.objectStoreNames.contains("recipes")) {
          db.createObjectStore("recipes", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

export const DEFAULT_GOALS: DailyGoals = {
  energyKcal: 2050,
  proteins: 100,
  carbohydrates: 250,
  fat: 70,
};

export async function addHistoryEntry(entry: HistoryEntry): Promise<void> {
  const db = await getDb();
  await db.put("history", entry);
}

export async function getAllHistory(): Promise<HistoryEntry[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex("history", "by-timestamp");
  return all.reverse();
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("history", id);
}

export async function getHistoryForDate(date: Date): Promise<HistoryEntry[]> {
  const all = await getAllHistory();
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return all.filter((e) => e.timestamp >= start.getTime() && e.timestamp <= end.getTime());
}

export async function getFavorites(): Promise<FavoriteProduct[]> {
  const db = await getDb();
  const all = await db.getAll("favorites");
  return all.sort((a, b) => b.addedAt - a.addedAt);
}

export async function addFavorite(favorite: FavoriteProduct): Promise<void> {
  const db = await getDb();
  await db.put("favorites", favorite);
}

export async function removeFavorite(barcode: string): Promise<void> {
  const db = await getDb();
  await db.delete("favorites", barcode);
}

export async function isFavorite(barcode: string): Promise<boolean> {
  const db = await getDb();
  const value = await db.get("favorites", barcode);
  return value !== undefined;
}

export async function saveManualProduct(product: Product): Promise<void> {
  const db = await getDb();
  await db.put("manualProducts", product);
}

export async function getManualProduct(barcode: string): Promise<Product | undefined> {
  const db = await getDb();
  return db.get("manualProducts", barcode);
}

export async function getDailyGoals(): Promise<DailyGoals> {
  const db = await getDb();
  const value = await db.get("settings", "dailyGoals");
  return (value as DailyGoals) ?? DEFAULT_GOALS;
}

export async function setDailyGoals(goals: DailyGoals): Promise<void> {
  const db = await getDb();
  await db.put("settings", goals, "dailyGoals");
}

export async function getFrequentProducts(limit = 10): Promise<HistoryEntry[]> {
  const all = await getAllHistory();
  const countByBarcode = new Map<string, { count: number; latest: HistoryEntry }>();
  for (const entry of all) {
    const existing = countByBarcode.get(entry.barcode);
    if (existing) {
      existing.count += 1;
      if (entry.timestamp > existing.latest.timestamp) existing.latest = entry;
    } else {
      countByBarcode.set(entry.barcode, { count: 1, latest: entry });
    }
  }
  return Array.from(countByBarcode.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((v) => v.latest);
}

export async function getAllRecipes(): Promise<Recipe[]> {
  const db = await getDb();
  const all = await db.getAll("recipes");
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveRecipe(recipe: Recipe): Promise<void> {
  const db = await getDb();
  await db.put("recipes", recipe);
}

export async function deleteRecipe(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("recipes", id);
}
