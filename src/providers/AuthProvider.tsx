import { DEFAULT_CATEGORIES, DEFAULT_INTERCESORS } from "@/src/data/intercesors";
import { supabase } from "@/src/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";

function toError(e: unknown): Error | null {
  if (!e) return null;
  if (e instanceof Error) return e;
  return new Error(String(e));
}

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

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from("users")
      .select("display_name, saints, categories")
      .eq("id", userId)
      .single();
    setDisplayName(data?.display_name || "Guerrero de Oración");
    setSaints(data?.saints?.length ? data.saints : [...DEFAULT_INTERCESORS]);
    setCategories(data?.categories?.length ? data.categories : [...DEFAULT_CATEGORIES]);
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
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setDisplayName("Guerrero de Oración");
        setSaints([...DEFAULT_INTERCESORS]);
        setCategories([...DEFAULT_CATEGORIES]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: toError(error) };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: toError(error) };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error: toError(error) };
  };

  const updateDisplayName = async (name: string) => {
    if (!session?.user) return { error: new Error("Not authenticated") };
    const { error } = await supabase
      .from("users")
      .update({ display_name: name })
      .eq("id", session.user.id);
    if (!error) setDisplayName(name);
    return { error: toError(error) };
  };

  const updateSaints = async (newSaints: string[]) => {
    if (!session?.user) return { error: new Error("Not authenticated") };
    const { error } = await supabase
      .from("users")
      .update({ saints: newSaints })
      .eq("id", session.user.id);
    if (!error) setSaints(newSaints);
    return { error: toError(error) };
  };

  const updateCategories = async (newCategories: string[]) => {
    if (!session?.user) return { error: new Error("Not authenticated") };
    const { error } = await supabase
      .from("users")
      .update({ categories: newCategories })
      .eq("id", session.user.id);
    if (!error) setCategories(newCategories);
    return { error: toError(error) };
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
