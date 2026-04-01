import { supabase } from "@/src/lib/supabase";
import {
  cancelCandleNotification,
  scheduleCandleNotification,
} from "@/src/lib/notifications";
import { Intention } from "@/src/types/intention";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function usePrayerIntentions(userId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = ["intentions", userId];

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey });

  const { data: intentions = [], isLoading, isError, refetch } = useQuery<Intention[]>({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("intentions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });

  const addMutation = useMutation({
    mutationFn: async (payload: {
      text: string;
      category: string;
      intercesor: string | null;
    }) => {
      const { error } = await supabase.from("intentions").insert({
        user_id: userId!,
        raw_text: payload.text,
        status: "Sown",
        is_public: false,
        category: payload.category,
        intercesor: payload.intercesor,
        candle_mode: false,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("intentions")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const editMutation = useMutation({
    mutationFn: async (payload: {
      id: string;
      raw_text: string;
      category: string;
      intercesor: string | null;
    }) => {
      const { error } = await supabase
        .from("intentions")
        .update({
          raw_text: payload.raw_text,
          category: payload.category,
          intercesor: payload.intercesor,
        })
        .eq("id", payload.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const candleMutation = useMutation({
    mutationFn: async ({
      id,
      candle_mode,
    }: {
      id: string;
      candle_mode: boolean;
    }) => {
      const { error } = await supabase
        .from("intentions")
        .update({ candle_mode })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const handleCandleToggle = async (item: Intention) => {
    const newCandleMode = !item.candle_mode;
    candleMutation.mutate({ id: item.id, candle_mode: newCandleMode });
    if (newCandleMode) {
      await scheduleCandleNotification(item.id, item.raw_text);
    } else {
      await cancelCandleNotification(item.id);
    }
  };

  return {
    intentions,
    isLoading,
    isError,
    refetch,
    addMutation,
    updateStatusMutation,
    editMutation,
    handleCandleToggle,
  };
}
