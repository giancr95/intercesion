import { useAuth } from "@/src/providers/AuthProvider";
import { useTheme } from "@/src/providers/ThemeProvider";
import { cancelCandleNotification, scheduleCandleNotification } from "@/src/lib/notifications";
import { supabase } from "@/src/lib/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Clock,
  Flame,
  Pencil,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  SectionList,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Types ───
interface Intention {
  id: string;
  user_id: string;
  raw_text: string;
  status: "Sown" | "In Cultivation" | "Harvested";
  is_public: boolean;
  category: string | null;
  intercesor: string | null;
  candle_mode: boolean;
  created_at: string;
}

// ─── Status config ───
const STATUS_LIST: Intention["status"][] = ["Sown", "In Cultivation", "Harvested"];

const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string; icon: typeof Sparkles }
> = {
  Sown: { label: "Sembrada", color: "#4a7c59", bgColor: "#e8f0e3", icon: Clock },
  "In Cultivation": {
    label: "En Cultivo",
    color: "#8b6f1e",
    bgColor: "#fef3c7",
    icon: Sparkles,
  },
  Harvested: {
    label: "Cosechada",
    color: "#166534",
    bgColor: "#dcfce7",
    icon: CheckCircle,
  },
};

// Category colors
const categoryColors: Record<string, string> = {
  Salud: "#d946a0",
  Familia: "#ea7e30",
  Unión: "#7c5cbf",
  Vocación: "#0e87c9",
  General: "#5f7282",
};

const EXTRA_COLORS = ["#c2410c", "#a855f7", "#0891b2", "#65a30d", "#e11d48", "#6366f1"];
function getCategoryColor(cat: string): string {
  if (categoryColors[cat]) return categoryColors[cat];
  let hash = 0;
  for (let i = 0; i < cat.length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash);
  return EXTRA_COLORS[Math.abs(hash) % EXTRA_COLORS.length];
}

type ViewMode = "todos" | "estado" | "intercesor";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ─── Status Change Modal ───
function StatusModal({
  visible,
  current,
  onSelect,
  onClose,
}: {
  visible: boolean;
  current: string;
  onSelect: (s: Intention["status"]) => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: colors.modalOverlay,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 20,
            width: "80%",
            borderWidth: 1,
            borderColor: colors.border,
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: "700",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            Cambiar Estado
          </Text>
          {STATUS_LIST.map((s) => {
            const cfg = statusConfig[s];
            const isActive = s === current;
            return (
              <Pressable
                key={s}
                onPress={() => onSelect(s)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor: isActive ? cfg.bgColor : "transparent",
                  marginBottom: 4,
                }}
              >
                <cfg.icon color={cfg.color} size={18} />
                <Text
                  style={{
                    color: isActive ? cfg.color : colors.textSecondary,
                    fontSize: 16,
                    fontWeight: isActive ? "700" : "500",
                    flex: 1,
                  }}
                >
                  {cfg.label}
                </Text>
                {isActive && <CheckCircle color={cfg.color} size={18} />}
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Edit Prayer Modal ───
function EditPrayerModal({
  visible,
  item,
  categories,
  saints,
  onSave,
  onClose,
  onAddCategory,
  onAddSaint,
}: {
  visible: boolean;
  item: Intention | null;
  categories: string[];
  saints: string[];
  onSave: (data: { id: string; raw_text: string; category: string; intercesor: string | null }) => void;
  onClose: () => void;
  onAddCategory: (cat: string) => Promise<void>;
  onAddSaint: (saint: string) => Promise<void>;
}) {
  const { colors } = useTheme();
  const [text, setText] = useState("");
  const [category, setCategory] = useState("General");
  const [intercesor, setIntercesor] = useState<string | null>(null);
  const [intercesorInput, setIntercesorInput] = useState("");
  const [showIntercesorList, setShowIntercesorList] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");

  React.useEffect(() => {
    if (item) {
      setText(item.raw_text);
      setCategory(item.category || "General");
      setIntercesor(item.intercesor);
      setIntercesorInput("");
      setShowIntercesorList(false);
      setShowAddCategory(false);
      setNewCategoryInput("");
    }
  }, [item]);

  const filteredIntercesors = useMemo(() => {
    if (!intercesorInput.trim()) return saints;
    const lower = intercesorInput.toLowerCase();
    return saints.filter((i) => i.toLowerCase().includes(lower));
  }, [intercesorInput, saints]);

  const hasNoMatch = intercesorInput.trim().length > 0 && filteredIntercesors.length === 0;

  if (!item) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <Pressable
          onPress={() => { onClose(); setShowIntercesorList(false); }}
          style={{
            flex: 1,
            backgroundColor: colors.modalOverlay,
            justifyContent: "flex-end",
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.card,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderTopWidth: 1,
              borderColor: colors.border,
              maxHeight: "85%",
            }}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                padding: 20,
                paddingBottom: 8,
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>
                  Editar Intención
                </Text>
                <Pressable
                  onPress={() => { onClose(); setShowIntercesorList(false); }}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: colors.chipBg,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X color={colors.textSecondary} size={18} />
                </Pressable>
              </View>

              {/* Prayer Text */}
              <TextInput
                placeholder="Escribe tu intención de oración..."
                placeholderTextColor={colors.muted}
                value={text}
                onChangeText={setText}
                multiline
                style={{
                  backgroundColor: colors.inputBg,
                  borderRadius: 12,
                  padding: 14,
                  color: colors.text,
                  fontSize: 16,
                  minHeight: 80,
                  textAlignVertical: "top",
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 14,
                }}
              />

              {/* Category Chips */}
              <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "600", marginBottom: 8 }}>
                Categoría
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                {categories.map((cat) => {
                  const isActive = cat === category;
                  const color = getCategoryColor(cat);
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => setCategory(cat)}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor: isActive ? color + "20" : colors.chipBg,
                        borderWidth: 1,
                        borderColor: isActive ? color : colors.border,
                      }}
                    >
                      <Text
                        style={{
                          color: isActive ? color : colors.textSecondary,
                          fontSize: 13,
                          fontWeight: isActive ? "700" : "500",
                        }}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  );
                })}
                {/* Add category button */}
                {showAddCategory ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <TextInput
                      placeholder="Nueva..."
                      placeholderTextColor={colors.muted}
                      value={newCategoryInput}
                      onChangeText={setNewCategoryInput}
                      autoFocus
                      style={{
                        backgroundColor: colors.inputBg,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: colors.primary,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        fontSize: 13,
                        color: colors.text,
                        minWidth: 80,
                      }}
                      onSubmitEditing={async () => {
                        if (newCategoryInput.trim()) {
                          await onAddCategory(newCategoryInput.trim());
                          setCategory(newCategoryInput.trim());
                          setNewCategoryInput("");
                          setShowAddCategory(false);
                        }
                      }}
                    />
                    <Pressable
                      onPress={() => { setShowAddCategory(false); setNewCategoryInput(""); }}
                    >
                      <X color={colors.muted} size={16} />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => setShowAddCategory(true)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: colors.chipBg,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderStyle: "dashed",
                    }}
                  >
                    <Plus color={colors.muted} size={14} />
                  </Pressable>
                )}
              </View>

              {/* Intercesor Search */}
              <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "600", marginBottom: 8 }}>
                Intercesor (opcional)
              </Text>
              <View style={{ position: "relative", marginBottom: 14 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: colors.inputBg,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: showIntercesorList ? colors.primary : colors.border,
                    paddingHorizontal: 12,
                  }}
                >
                  <Search color={colors.muted} size={16} />
                  <TextInput
                    placeholder="Buscar intercesor..."
                    placeholderTextColor={colors.muted}
                    value={intercesor || intercesorInput}
                    onChangeText={(t) => {
                      setIntercesorInput(t);
                      setIntercesor(null);
                      setShowIntercesorList(true);
                    }}
                    onFocus={() => setShowIntercesorList(true)}
                    style={{
                      flex: 1,
                      color: colors.text,
                      fontSize: 14,
                      paddingVertical: 12,
                      paddingLeft: 8,
                    }}
                  />
                  {intercesor ? (
                    <Pressable onPress={() => { setIntercesor(null); setIntercesorInput(""); }}>
                      <X color={colors.muted} size={16} />
                    </Pressable>
                  ) : null}
                </View>

                {showIntercesorList && !intercesor && (
                  <View
                    style={{
                      backgroundColor: colors.card,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      marginTop: 4,
                      maxHeight: 150,
                    }}
                  >
                    <FlatList
                      data={filteredIntercesors}
                      keyExtractor={(i) => i}
                      keyboardShouldPersistTaps="handled"
                      renderItem={({ item: saint }) => (
                        <Pressable
                          onPress={() => {
                            setIntercesor(saint);
                            setIntercesorInput("");
                            setShowIntercesorList(false);
                          }}
                          style={{
                            paddingVertical: 10,
                            paddingHorizontal: 14,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.inputBg,
                          }}
                        >
                          <Text style={{ color: colors.text, fontSize: 14 }}>{saint}</Text>
                        </Pressable>
                      )}
                      ListFooterComponent={
                        hasNoMatch ? (
                          <Pressable
                            onPress={async () => {
                              const name = intercesorInput.trim();
                              await onAddSaint(name);
                              setIntercesor(name);
                              setIntercesorInput("");
                              setShowIntercesorList(false);
                            }}
                            style={{
                              paddingVertical: 12,
                              paddingHorizontal: 14,
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <Plus color={colors.primary} size={16} />
                            <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "600" }}>
                              Agregar "{intercesorInput.trim()}"
                            </Text>
                          </Pressable>
                        ) : null
                      }
                    />
                  </View>
                )}
              </View>
            </ScrollView>

              {/* Save — pinned footer */}
              <View
                style={{
                  paddingHorizontal: 20,
                  paddingTop: 10,
                  paddingBottom: Platform.OS === "android" ? 32 : 20,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  backgroundColor: colors.card,
                }}
              >
              <Pressable
                onPress={() => {
                  if (!text.trim()) return;
                  onSave({ id: item.id, raw_text: text.trim(), category, intercesor });
                }}
                disabled={!text.trim()}
                style={({ pressed }) => ({
                  backgroundColor: !text.trim() ? colors.chipBg : pressed ? colors.primaryDark : colors.primary,
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: "center",
                })}
              >
                <Text
                  style={{
                    color: text.trim() ? "#ffffff" : colors.textSecondary,
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  Guardar Cambios
                </Text>
              </Pressable>
              </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Prayer Card ───
function PrayerCard({
  item,
  onStatusPress,
  onEditPress,
  onCandleToggle,
}: {
  item: Intention;
  onStatusPress: () => void;
  onEditPress: () => void;
  onCandleToggle: () => void;
}) {
  const { colors } = useTheme();
  const config = statusConfig[item.status] || statusConfig["Sown"];
  const StatusIcon = config.icon;
  const catColor = getCategoryColor(item.category || "General");

  return (
    <Pressable
      onLongPress={onEditPress}
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: item.candle_mode ? colors.candleColor : colors.border,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      }}
    >
      {/* Candle indicator */}
      {item.candle_mode && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            marginBottom: 6,
          }}
        >
          <Text style={{ fontSize: 14 }}>🕯️</Text>
          <Text style={{ color: "#d97706", fontSize: 11, fontWeight: "700" }}>
            Vela encendida
          </Text>
        </View>
      )}

      <Text
        style={{
          color: colors.text,
          fontSize: 16,
          fontWeight: "500",
          marginBottom: 10,
          lineHeight: 22,
        }}
      >
        {item.raw_text}
      </Text>

      {/* Intercesor */}
      {item.intercesor ? (
        <Text
          style={{
            color: "#7c5cbf",
            fontSize: 12,
            fontWeight: "600",
            marginBottom: 10,
            fontStyle: "italic",
          }}
        >
          🙏 {item.intercesor}
        </Text>
      ) : null}

      {/* Badges row */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {/* Status — tappable */}
        <Pressable onPress={onStatusPress}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: config.bgColor,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              gap: 6,
            }}
          >
            <StatusIcon color={config.color} size={14} />
            <Text
              style={{
                color: config.color,
                fontSize: 12,
                fontWeight: "700",
                letterSpacing: 0.5,
              }}
            >
              {config.label}
            </Text>
            <ChevronDown color={config.color} size={12} />
          </View>
        </Pressable>

        {/* Category */}
        {item.category ? (
          <View
            style={{
              backgroundColor: catColor + "18",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: catColor, fontSize: 11, fontWeight: "700" }}>
              {item.category}
            </Text>
          </View>
        ) : null}

        {/* Candle toggle */}
        <Pressable onPress={onCandleToggle}>
          <View
            style={{
              backgroundColor: item.candle_mode ? colors.candleBg : colors.badgeMutedBg,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: item.candle_mode ? colors.candleColor : colors.border,
            }}
          >
            <Flame
              color={item.candle_mode ? colors.candleColor : colors.muted}
              size={14}
            />
          </View>
        </Pressable>

        {/* Edit button */}
        <Pressable onPress={onEditPress}>
          <View
            style={{
              backgroundColor: colors.badgeMutedBg,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Pencil color={colors.muted} size={14} />
          </View>
        </Pressable>
      </View>

      {/* Creation date */}
      <Text
        style={{
          color: colors.muted,
          fontSize: 11,
          marginTop: 10,
          fontStyle: "italic",
        }}
      >
        📅 {formatDate(item.created_at)}
      </Text>
    </Pressable>
  );
}

// ─── Section Header ───
function SectionHeader({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: 4,
        paddingTop: 16,
        paddingBottom: 8,
      }}
    >
      <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "700", letterSpacing: 0.5 }}>
        {title}
      </Text>
    </View>
  );
}

// ─── Main Screen ───
export default function MisOracionesScreen() {
  const { user, saints, categories, updateSaints, updateCategories } = useAuth();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [newPrayer, setNewPrayer] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("General");
  const [intercesorInput, setIntercesorInput] = useState("");
  const [selectedIntercesor, setSelectedIntercesor] = useState<string | null>(null);
  const [showIntercesorList, setShowIntercesorList] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("todos");

  // Inline add category in add modal
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");

  // Status change
  const [statusModalItem, setStatusModalItem] = useState<Intention | null>(null);

  // Edit
  const [editModalItem, setEditModalItem] = useState<Intention | null>(null);

  // Fetch intentions
  const {
    data: intentions = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Intention[]>({
    queryKey: ["intentions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("intentions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  // Insert mutation
  const addMutation = useMutation({
    mutationFn: async (payload: {
      text: string;
      category: string;
      intercesor: string | null;
    }) => {
      const { error } = await supabase.from("intentions").insert({
        user_id: user!.id,
        raw_text: payload.text,
        status: "Sown",
        is_public: false,
        category: payload.category,
        intercesor: payload.intercesor,
        candle_mode: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intentions", user?.id] });
    },
  });

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("intentions")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intentions", user?.id] });
    },
  });

  // Edit mutation
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intentions", user?.id] });
    },
  });

  // Candle mode toggle mutation
  const candleMutation = useMutation({
    mutationFn: async ({ id, candle_mode }: { id: string; candle_mode: boolean }) => {
      const { error } = await supabase
        .from("intentions")
        .update({ candle_mode })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intentions", user?.id] });
    },
  });

  const handleAddPrayer = () => {
    const trimmed = newPrayer.trim();
    if (!trimmed) return;
    addMutation.mutate({
      text: trimmed,
      category: selectedCategory,
      intercesor: selectedIntercesor,
    });
    setNewPrayer("");
    setSelectedCategory("General");
    setSelectedIntercesor(null);
    setIntercesorInput("");
    setModalVisible(false);
  };

  const handleStatusChange = (status: Intention["status"]) => {
    if (statusModalItem) {
      updateStatusMutation.mutate({ id: statusModalItem.id, status });
      setStatusModalItem(null);
    }
  };

  const handleEditSave = (data: {
    id: string;
    raw_text: string;
    category: string;
    intercesor: string | null;
  }) => {
    editMutation.mutate(data);
    setEditModalItem(null);
  };

  const handleCandleToggle = async (item: Intention) => {
    const newCandleMode = !item.candle_mode;
    candleMutation.mutate({ id: item.id, candle_mode: newCandleMode });

    if (newCandleMode) {
      await scheduleCandleNotification(item.id, item.raw_text);
    } else {
      await cancelCandleNotification(item.id);
    }
  };

  // Helper to add category inline
  const handleInlineAddCategory = async (cat: string) => {
    if (categories.includes(cat)) {
      Alert.alert("Aviso", "Esta categoría ya existe.");
      return;
    }
    await updateCategories([...categories, cat]);
  };

  // Helper to add saint inline
  const handleInlineAddSaint = async (saint: string) => {
    if (saints.includes(saint)) return;
    await updateSaints([...saints, saint]);
  };

  // Filtered intercesor suggestions
  const filteredIntercesors = useMemo(() => {
    if (!intercesorInput.trim()) return saints;
    const lower = intercesorInput.toLowerCase();
    return saints.filter((i) => i.toLowerCase().includes(lower));
  }, [intercesorInput, saints]);

  const hasNoMatch = intercesorInput.trim().length > 0 && filteredIntercesors.length === 0;

  // Grouped data for SectionList
  const sectionsByStatus = useMemo(() => {
    const groups: Record<string, Intention[]> = {};
    intentions.forEach((i) => {
      const label = statusConfig[i.status]?.label || i.status;
      if (!groups[label]) groups[label] = [];
      groups[label].push(i);
    });
    return Object.entries(groups).map(([title, data]) => ({ title, data }));
  }, [intentions]);

  const sectionsByIntercesor = useMemo(() => {
    const groups: Record<string, Intention[]> = {};
    intentions.forEach((i) => {
      const label = i.intercesor || "Sin Intercesor";
      if (!groups[label]) groups[label] = [];
      groups[label].push(i);
    });
    return Object.entries(groups).map(([title, data]) => ({ title, data }));
  }, [intentions]);

  // ─── Loading ───
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["bottom"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.muted, marginTop: 12, fontSize: 14 }}>
            Cargando intenciones...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Error ───
  if (isError) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["bottom"]}>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}
        >
          <AlertTriangle color="#dc2626" size={48} />
          <Text
            style={{ color: "#dc2626", fontSize: 16, marginTop: 16, textAlign: "center" }}
          >
            Error al cargar. Revisa tu conexión.
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={{
              marginTop: 16,
              backgroundColor: colors.chipBg,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: "600" }}>Reintentar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const renderCard = ({ item }: { item: Intention }) => (
    <PrayerCard
      item={item}
      onStatusPress={() => setStatusModalItem(item)}
      onEditPress={() => setEditModalItem(item)}
      onCandleToggle={() => handleCandleToggle(item)}
    />
  );

  const emptyComponent = (
    <View style={{ alignItems: "center", marginTop: 80 }}>
      <Sparkles color={colors.border} size={48} />
      <Text
        style={{ color: colors.muted, fontSize: 16, marginTop: 16, textAlign: "center" }}
      >
        No tienes intenciones de oración aún.{"\n"}Toca el botón + para agregar una.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["bottom"]}>
      {/* View Mode Tabs */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 4,
          gap: 0,
        }}
      >
        {(
          [
            { key: "todos", label: "Todos" },
            { key: "estado", label: "Por Estado" },
            { key: "intercesor", label: "Por Intercesor" },
          ] as const
        ).map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setViewMode(tab.key)}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: "center",
              borderBottomWidth: 2,
              borderBottomColor: viewMode === tab.key ? colors.primary : colors.border,
            }}
          >
            <Text
              style={{
                color: viewMode === tab.key ? colors.primary : colors.muted,
                fontSize: 13,
                fontWeight: viewMode === tab.key ? "700" : "500",
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Count */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
        <Text style={{ color: colors.muted, fontSize: 14 }}>
          {intentions.length} {intentions.length === 1 ? "intención" : "intenciones"}
        </Text>
      </View>

      {/* List */}
      {viewMode === "todos" ? (
        <FlatList
          data={intentions}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={emptyComponent}
        />
      ) : (
        <SectionList
          sections={viewMode === "estado" ? sectionsByStatus : sectionsByIntercesor}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          renderSectionHeader={({ section }) => <SectionHeader title={section.title} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={emptyComponent}
        />
      )}

      {/* FAB — Balloon button, unmissable */}
      <Pressable
        onPress={() => setModalVisible(true)}
        style={({ pressed }) => ({
          position: "absolute",
          bottom: 90,
          right: 20,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 22,
          paddingVertical: 16,
          borderRadius: 30,
          backgroundColor: pressed ? colors.fabPressed : colors.fabBg,
          elevation: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.45,
          shadowRadius: 12,
        })}
      >
        <Plus color="#ffffff" size={22} strokeWidth={3} />
        <Text style={{ color: "#ffffff", fontSize: 15, fontWeight: "700" }}>Orar</Text>
      </Pressable>

      {/* Status Change Modal */}
      <StatusModal
        visible={!!statusModalItem}
        current={statusModalItem?.status || "Sown"}
        onSelect={handleStatusChange}
        onClose={() => setStatusModalItem(null)}
      />

      {/* Edit Prayer Modal */}
      <EditPrayerModal
        visible={!!editModalItem}
        item={editModalItem}
        categories={[...categories]}
        saints={saints}
        onSave={handleEditSave}
        onClose={() => setEditModalItem(null)}
        onAddCategory={handleInlineAddCategory}
        onAddSaint={handleInlineAddSaint}
      />

      {/* ─── Add Prayer Modal — Fixes #2, #3, #4 ─── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <Pressable
            onPress={() => {
              setModalVisible(false);
              setShowIntercesorList(false);
            }}
            style={{
              flex: 1,
              backgroundColor: colors.modalOverlay,
              justifyContent: "flex-end",
            }}
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={{
                backgroundColor: colors.card,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                borderTopWidth: 1,
                borderColor: colors.border,
                maxHeight: "85%",
              }}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                  padding: 20,
                  paddingBottom: 8,
                }}
              >
                {/* Modal Header */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>
                    Nueva Intención
                  </Text>
                  <Pressable
                    onPress={() => {
                      setModalVisible(false);
                      setShowIntercesorList(false);
                    }}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: colors.chipBg,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X color={colors.textSecondary} size={18} />
                  </Pressable>
                </View>

                {/* Prayer Text */}
                <TextInput
                  placeholder="Escribe tu intención de oración..."
                  placeholderTextColor={colors.muted}
                  value={newPrayer}
                  onChangeText={setNewPrayer}
                  multiline
                  style={{
                    backgroundColor: colors.inputBg,
                    borderRadius: 12,
                    padding: 14,
                    color: colors.text,
                    fontSize: 16,
                    minHeight: 80,
                    textAlignVertical: "top",
                    borderWidth: 1,
                    borderColor: colors.border,
                    marginBottom: 14,
                  }}
                />

                {/* Category Chips */}
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 13,
                    fontWeight: "600",
                    marginBottom: 8,
                  }}
                >
                  Categoría
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 }}
                >
                  {categories.map((cat) => {
                    const isActive = cat === selectedCategory;
                    const color = getCategoryColor(cat);
                    return (
                      <Pressable
                        key={cat}
                        onPress={() => setSelectedCategory(cat)}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 20,
                          backgroundColor: isActive ? color + "20" : colors.chipBg,
                          borderWidth: 1,
                          borderColor: isActive ? color : colors.border,
                        }}
                      >
                        <Text
                          style={{
                            color: isActive ? color : colors.textSecondary,
                            fontSize: 13,
                            fontWeight: isActive ? "700" : "500",
                          }}
                        >
                          {cat}
                        </Text>
                      </Pressable>
                    );
                  })}
                  {/* Add category inline */}
                  {showAddCategory ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <TextInput
                        placeholder="Nueva..."
                        placeholderTextColor={colors.muted}
                        value={newCategoryInput}
                        onChangeText={setNewCategoryInput}
                        autoFocus
                        style={{
                          backgroundColor: colors.inputBg,
                          borderRadius: 20,
                          borderWidth: 1,
                          borderColor: colors.primary,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          fontSize: 13,
                          color: colors.text,
                          minWidth: 80,
                        }}
                        onSubmitEditing={async () => {
                          if (newCategoryInput.trim()) {
                            await handleInlineAddCategory(newCategoryInput.trim());
                            setSelectedCategory(newCategoryInput.trim());
                            setNewCategoryInput("");
                            setShowAddCategory(false);
                          }
                        }}
                      />
                      <Pressable
                        onPress={() => { setShowAddCategory(false); setNewCategoryInput(""); }}
                      >
                        <X color={colors.muted} size={16} />
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable
                      onPress={() => setShowAddCategory(true)}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor: colors.chipBg,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderStyle: "dashed",
                      }}
                    >
                      <Plus color={colors.muted} size={14} />
                    </Pressable>
                  )}
                </View>

                {/* Intercesor Search */}
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 13,
                    fontWeight: "600",
                    marginBottom: 8,
                  }}
                >
                  Intercesor (opcional)
                </Text>
                <View style={{ position: "relative", marginBottom: 4 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: colors.inputBg,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: showIntercesorList ? colors.primary : colors.border,
                      paddingHorizontal: 12,
                    }}
                  >
                    <Search color={colors.muted} size={16} />
                    <TextInput
                      placeholder="Buscar intercesor..."
                      placeholderTextColor={colors.muted}
                      value={selectedIntercesor || intercesorInput}
                      onChangeText={(text) => {
                        setIntercesorInput(text);
                        setSelectedIntercesor(null);
                        setShowIntercesorList(true);
                      }}
                      onFocus={() => setShowIntercesorList(true)}
                      style={{
                        flex: 1,
                        color: colors.text,
                        fontSize: 14,
                        paddingVertical: 12,
                        paddingLeft: 8,
                      }}
                    />
                    {selectedIntercesor ? (
                      <Pressable
                        onPress={() => {
                          setSelectedIntercesor(null);
                          setIntercesorInput("");
                        }}
                      >
                        <X color={colors.muted} size={16} />
                      </Pressable>
                    ) : null}
                  </View>

                  {/* Dropdown */}
                  {showIntercesorList && !selectedIntercesor && (
                    <View
                      style={{
                        backgroundColor: colors.card,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 12,
                        marginTop: 4,
                        maxHeight: 150,
                      }}
                    >
                      <FlatList
                        data={filteredIntercesors}
                        keyExtractor={(item) => item}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({ item }) => (
                          <Pressable
                            onPress={() => {
                              setSelectedIntercesor(item);
                              setIntercesorInput("");
                              setShowIntercesorList(false);
                            }}
                            style={{
                              paddingVertical: 10,
                              paddingHorizontal: 14,
                              borderBottomWidth: 1,
                              borderBottomColor: colors.inputBg,
                            }}
                          >
                            <Text style={{ color: colors.text, fontSize: 14 }}>
                              {item}
                            </Text>
                          </Pressable>
                        )}
                        ListFooterComponent={
                          hasNoMatch ? (
                            <Pressable
                              onPress={async () => {
                                const name = intercesorInput.trim();
                                await handleInlineAddSaint(name);
                                setSelectedIntercesor(name);
                                setIntercesorInput("");
                                setShowIntercesorList(false);
                              }}
                              style={{
                                paddingVertical: 12,
                                paddingHorizontal: 14,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <Plus color={colors.primary} size={16} />
                              <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "600" }}>
                                Agregar "{intercesorInput.trim()}"
                              </Text>
                            </Pressable>
                          ) : null
                        }
                      />
                    </View>
                  )}
                </View>
              </ScrollView>

              {/* Submit — FIXED: pinned footer, never scrolls away */}
              <View
                style={{
                  paddingHorizontal: 20,
                  paddingTop: 10,
                  paddingBottom: Platform.OS === "android" ? 32 : 20,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  backgroundColor: colors.card,
                }}
              >
                <Pressable
                  onPress={handleAddPrayer}
                  disabled={!newPrayer.trim() || addMutation.isPending}
                  style={({ pressed }) => ({
                    backgroundColor:
                      !newPrayer.trim() || addMutation.isPending
                        ? colors.chipBg
                        : pressed
                          ? colors.primaryDark
                          : colors.primary,
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: "center",
                  })}
                >
                  {addMutation.isPending ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text
                      style={{
                        color: newPrayer.trim() ? "#ffffff" : colors.textSecondary,
                        fontSize: 16,
                        fontWeight: "700",
                      }}
                    >
                      Agregar Oración
                    </Text>
                  )}
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
