import prismadb from "./prismadb";
import { unstable_cache } from "next/cache";

const CACHE_TTL = 1000 * 60; // ⚡ CACHING TTL 60s (Senior Architect Rule enforced)

class GlobalDbCache {
    private cache: Record<string, { data: any, exp: number }> = {};

    async getOrFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
        const now = Date.now();
        if (this.cache[key] && this.cache[key].exp > now) {
            return this.cache[key].data;
        }
        
        // Removed Next.js unstable_cache wrapper because it hangs for 20+ seconds in DEV MODE!
        const data = await fetcher();
        this.cache[key] = { data, exp: now + CACHE_TTL };
        return data;
    }

    clear(keyPrefix?: string) {
        if (!keyPrefix) {
            this.cache = {};
        } else {
            for (const k of Object.keys(this.cache)) {
                if (k.startsWith(keyPrefix)) delete this.cache[k];
            }
        }
    }
}

declare global {
    var globalDbCache: GlobalDbCache | undefined;
}

export const dbCache = globalThis.globalDbCache || new GlobalDbCache();
if (process.env.NODE_ENV !== "production") globalThis.globalDbCache = dbCache;
