import { useTheme } from "@/src/providers/ThemeProvider";
import { getCategoryColor, Intention } from "@/src/types/intention";
import { Plus, Search, X } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
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

export function EditPrayerModal({
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
  onSave: (data: {
    id: string;
    raw_text: string;
    category: string;
    intercesor: string | null;
  }) => void;
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

  const hasNoMatch =
    intercesorInput.trim().length > 0 && filteredIntercesors.length === 0;

  if (!item) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        style={{ flex: 1 }}
      >
        <Pressable
          onPress={() => {
            onClose();
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
                  Editar Intención
                </Text>
                <Pressable
                  onPress={() => {
                    onClose();
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
                          setCategory(newCategoryInput.trim());
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
              <View style={{ position: "relative", marginBottom: 14 }}>
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
                    <Pressable
                      onPress={() => {
                        setIntercesor(null);
                        setIntercesorInput("");
                      }}
                    >
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
                          <Text style={{ color: colors.text, fontSize: 14 }}>
                            {saint}
                          </Text>
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
                onPress={() => {
                  if (!text.trim()) return;
                  onSave({
                    id: item.id,
                    raw_text: text.trim(),
                    category,
                    intercesor,
                  });
                }}
                disabled={!text.trim()}
                style={({ pressed }) => ({
                  backgroundColor: !text.trim()
                    ? colors.border
                    : pressed
                      ? colors.primaryDark
                      : colors.primary,
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: "center",
                })}
              >
                <Text
                  style={{
                    color: text.trim() ? "#ffffff" : colors.muted,
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
