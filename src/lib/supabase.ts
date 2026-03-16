import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const SUPABASE_URL = "https://djivvvbphlhcfgqljkyg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqaXZ2dmJwaGxoY2ZncWxqa3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMDQ3ODIsImV4cCI6MjA4ODY4MDc4Mn0.4uFBQYz4tDg2h9Bpowrl8TJ9g_VSNqQIdyyrgi8KwW8";

// SecureStore adapter for Supabase auth session persistence
const SecureStoreAdapter = {
    getItem: async (key: string): Promise<string | null> => {
        if (Platform.OS === "web") {
            if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
                return localStorage.getItem(key);
            }
            return null;
        }
        return await SecureStore.getItemAsync(key);
    },
    setItem: async (key: string, value: string): Promise<void> => {
        if (Platform.OS === "web") {
            if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
                localStorage.setItem(key, value);
            }
            return;
        }
        await SecureStore.setItemAsync(key, value);
    },
    removeItem: async (key: string): Promise<void> => {
        if (Platform.OS === "web") {
            if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
                localStorage.removeItem(key);
            }
            return;
        }
        await SecureStore.deleteItemAsync(key);
    },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: SecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
