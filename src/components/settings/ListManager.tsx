import { useTheme } from "@/src/providers/ThemeProvider";
import { ChevronDown, ChevronUp, Plus, RotateCcw, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

export function ListManager({
  title,
  icon,
  items,
  defaults,
  onUpdate,
  addPlaceholder,
  minItems,
}: {
  title: string;
  icon: string;
  items: string[];
  defaults: string[];
  onUpdate: (items: string[]) => Promise<{ error: Error | null }>;
  addPlaceholder: string;
  minItems?: number;
}) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [newItem, setNewItem] = useState("");

  const handleAdd = async () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    if (items.includes(trimmed)) {
      Alert.alert("Aviso", "Este elemento ya está en la lista.");
      return;
    }
    const { error } = await onUpdate([...items, trimmed]);
    if (error) Alert.alert("Error", error.message);
    setNewItem("");
  };

  const handleRemove = async (item: string) => {
    if (minItems && items.length <= minItems) {
      Alert.alert("Aviso", `Debes tener al menos ${minItems} elemento.`);
      return;
    }
    const filtered = items.filter((i) => i !== item);
    const { error } = await onUpdate(filtered);
    if (error) Alert.alert("Error", error.message);
  };

  const handleReset = async () => {
    const { error } = await onUpdate([...defaults]);
    if (error) Alert.alert("Error", error.message);
  };

  return (
    <>
      <Pressable
        onPress={() => setExpanded(!expanded)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: expanded ? 0 : 12,
          borderBottomLeftRadius: expanded ? 0 : 12,
          borderBottomRightRadius: expanded ? 0 : 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={{ fontSize: 18 }}>{icon}</Text>
          <View>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
              {title}
            </Text>
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
              {items.length} elementos
            </Text>
          </View>
        </View>
        {expanded ? (
          <ChevronUp color={colors.muted} size={20} />
        ) : (
          <ChevronDown color={colors.muted} size={20} />
        )}
      </Pressable>

      {expanded && (
        <View
          style={{
            backgroundColor: colors.card,
            borderWidth: 1,
            borderTopWidth: 0,
            borderColor: colors.border,
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            padding: 16,
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
            <TextInput
              placeholder={addPlaceholder}
              placeholderTextColor={colors.muted}
              value={newItem}
              onChangeText={setNewItem}
              style={{
                flex: 1,
                backgroundColor: colors.inputBg,
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 10,
                color: colors.text,
                fontSize: 14,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            />
            <Pressable
              onPress={handleAdd}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 10,
                width: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus color="#ffffff" size={20} />
            </Pressable>
          </View>

          {items.map((item, idx) => (
            <View
              key={`${item}-${idx}`}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 10,
                paddingHorizontal: 4,
                borderBottomWidth: idx < items.length - 1 ? 1 : 0,
                borderBottomColor: colors.inputBg,
              }}
            >
              <Text
                style={{ color: colors.text, fontSize: 14, flex: 1 }}
                numberOfLines={1}
              >
                {item}
              </Text>
              <Pressable onPress={() => handleRemove(item)} style={{ padding: 6 }}>
                <Trash2 color={colors.danger} size={16} />
              </Pressable>
            </View>
          ))}

          <Pressable
            onPress={handleReset}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              marginTop: 12,
              paddingVertical: 10,
            }}
          >
            <RotateCcw color={colors.primary} size={14} />
            <Text
              style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}
            >
              Restaurar predeterminados
            </Text>
          </Pressable>
        </View>
      )}
    </>
  );
}
