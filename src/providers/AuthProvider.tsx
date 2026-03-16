import { DEFAULT_CATEGORIES, DEFAULT_INTERCESORS } from "@/src/data/intercesors";
import { supabase } from "@/src/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  displayName: string;
  saints: string[];
  categories: string[];
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateDisplayName: (name: string) => Promise<{ error: Error | null }>;
  updateSaints: (saints: string[]) => Promise<{ error: Error | null }>;
  updateCategories: (categories: string[]) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  displayName: "Guerrero de Oración",
  saints: [...DEFAULT_INTERCESORS],
  categories: [...DEFAULT_CATEGORIES],
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null }),
  updateDisplayName: async () => ({ error: null }),
  updateSaints: async () => ({ error: null }),
  updateCategories: async () => ({ error: null }),
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("Guerrero de Oración");
  const [saints, setSaints] = useState<string[]>([...DEFAULT_INTERCESORS]);
  const [categories, setCategories] = useState<string[]>([...DEFAULT_CATEGORIES]);

  // Fetch user profile from public.users
  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from("users")
      .select("display_name, saints, categories")
      .eq("id", userId)
      .single();
    if (data?.display_name) {
      setDisplayName(data.display_name);
    } else {
      setDisplayName("Guerrero de Oración");
    }
    if (data?.saints && data.saints.length > 0) {
      setSaints(data.saints);
    } else {
      setSaints([...DEFAULT_INTERCESORS]);
    }
    if (data?.categories && data.categories.length > 0) {
      setCategories(data.categories);
    } else {
      setCategories([...DEFAULT_CATEGORIES]);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchUserProfile(session.user.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchUserProfile(session.user.id);
      else {
        setDisplayName("Guerrero de Oración");
        setSaints([...DEFAULT_INTERCESORS]);
        setCategories([...DEFAULT_CATEGORIES]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error: error as Error | null };
  };

  const updateDisplayName = async (name: string) => {
    if (!session?.user) return { error: new Error("Not authenticated") };
    const { error } = await supabase
      .from("users")
      .update({ display_name: name })
      .eq("id", session.user.id);
    if (!error) setDisplayName(name);
    return { error: error as Error | null };
  };

  const updateSaints = async (newSaints: string[]) => {
    if (!session?.user) return { error: new Error("Not authenticated") };
    const { error } = await supabase
      .from("users")
      .update({ saints: newSaints })
      .eq("id", session.user.id);
    if (!error) setSaints(newSaints);
    return { error: error as Error | null };
  };

  const updateCategories = async (newCategories: string[]) => {
    if (!session?.user) return { error: new Error("Not authenticated") };
    const { error } = await supabase
      .from("users")
      .update({ categories: newCategories })
      .eq("id", session.user.id);
    if (!error) setCategories(newCategories);
    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        displayName,
        saints,
        categories,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateDisplayName,
        updateSaints,
        updateCategories,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
