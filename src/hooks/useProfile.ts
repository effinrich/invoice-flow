import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface Profile {
  userId: string;
  displayName: string;
  businessEmail: string;
  businessAddress: string;
  accentColor: string;
  logoText: string;
  logoUrl: string | null;
  updatedAt: string | null;
}

export type ProfileInput = {
  displayName: string;
  businessEmail: string;
  businessAddress: string;
  accentColor: string;
  logoText: string;
  logoUrl: string | null;
};

const EMPTY_PROFILE = (userId: string): Profile => ({
  userId,
  displayName: "",
  businessEmail: "",
  businessAddress: "",
  accentColor: "hsl(16 95% 52%)",
  logoText: "",
  logoUrl: null,
  updatedAt: null,
});

function rowToProfile(row: Record<string, unknown>): Profile {
  return {
    userId: String(row.user_id),
    displayName: (row.display_name as string) ?? "",
    businessEmail: (row.business_email as string) ?? "",
    businessAddress: (row.business_address as string) ?? "",
    accentColor: (row.accent_color as string) ?? "hsl(16 95% 52%)",
    logoText: (row.logo_text as string) ?? "",
    logoUrl: (row.logo_url as string) ?? null,
    updatedAt: (row.updated_at as string) ?? null,
  };
}

export interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  save: (input: ProfileInput) => Promise<Profile>;
  refetch: () => Promise<void>;
}

export function useProfile(userId: string | null): ProfileState {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      setProfile(data ? rowToProfile(data) : EMPTY_PROFILE(userId));
    } catch {
      setProfile(EMPTY_PROFILE(userId));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    setIsLoading(true);
    fetchProfile();
  }, [fetchProfile]);

  const save = useCallback(
    async (input: ProfileInput): Promise<Profile> => {
      if (!userId) throw new Error("Not signed in");

      const row = {
        user_id: userId,
        display_name: input.displayName.trim() || null,
        business_email: input.businessEmail.trim() || null,
        business_address: input.businessAddress.trim() || null,
        accent_color: input.accentColor || "hsl(16 95% 52%)",
        logo_text: input.logoText.trim() || null,
        logo_url: input.logoUrl,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("profiles")
        .upsert(row, { onConflict: "user_id" })
        .select("*")
        .single();

      if (error) throw error;
      const saved = rowToProfile(data);
      setProfile(saved);
      return saved;
    },
    [userId],
  );

  return {
    profile,
    isLoading,
    save,
    refetch: fetchProfile,
  };
}
