import { useTheme } from "@/src/providers/ThemeProvider";
import { getCategoryColor } from "@/src/types/intention";
import { Plus, Search, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export function AddPrayerModal({
  visible,
  categories,
  saints,
  isPending,
  onAdd,
  onClose,
  onAddCategory,
  onAddSaint,
}: {
  visible: boolean;
  categories: string[];
  saints: string[];
  isPending: boolean;
  onAdd: (data: {
    text: string;
    category: string;
    intercesor: string | null;
  }) => void;
  onClose: () => void;
  onAddCategory: (cat: string) => Promise<void>;
  onAddSaint: (saint: string) => Promise<void>;
}) {
  const { colors } = useTheme();
  const [newPrayer, setNewPrayer] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("General");
  const [intercesorInput, setIntercesorInput] = useState("");
  const [selectedIntercesor, setSelectedIntercesor] = useState<string | null>(null);
  const [showIntercesorList, setShowIntercesorList] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");

  const reset = () => {
    setNewPrayer("");
    setSelectedCategory("General");
    setSelectedIntercesor(null);
    setIntercesorInput("");
    setShowIntercesorList(false);
    setShowAddCategory(false);
    setNewCategoryInput("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleAdd = () => {
    const trimmed = newPrayer.trim();
    if (!trimmed) return;
    onAdd({ text: trimmed, category: selectedCategory, intercesor: selectedIntercesor });
    reset();
  };

  const filteredIntercesors = useMemo(() => {
    if (!intercesorInput.trim()) return saints;
    const lower = intercesorInput.toLowerCase();
    return saints.filter((i) => i.toLowerCase().includes(lower));
  }, [intercesorInput, saints]);

  const hasNoMatch =
    intercesorInput.trim().length > 0 && filteredIntercesors.length === 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <Pressable
          onPress={() => {
            handleClose();
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
              contentContainerStyle={{ padding: 20, paddingBottom: 8 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}
                >
                  Nueva Intención
                </Text>
                <Pressable
                  onPress={() => {
                    handleClose();
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
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 14,
                }}
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
                {showAddCategory ? (
                  <View
                    style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                  >
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
                          setSelectedCategory(newCategoryInput.trim());
                          setNewCategoryInput("");
                          setShowAddCategory(false);
                        }
                      }}
                    />
                    <Pressable
                      onPress={() => {
                        setShowAddCategory(false);
                        setNewCategoryInput("");
                      }}
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
                    borderColor: showIntercesorList
                      ? colors.primary
                      : colors.border,
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
                              await onAddSaint(name);
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
                            <Text
                              style={{
                                color: colors.primary,
                                fontSize: 14,
                                fontWeight: "600",
                              }}
                            >
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
                onPress={handleAdd}
                disabled={!newPrayer.trim() || isPending}
                style={({ pressed }) => ({
                  backgroundColor:
                    !newPrayer.trim() || isPending
                      ? colors.border
                      : pressed
                        ? colors.primaryDark
                        : colors.primary,
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: "center",
                })}
              >
                {isPending ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text
                    style={{
                      color: newPrayer.trim() ? "#ffffff" : colors.muted,
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
  );
}
