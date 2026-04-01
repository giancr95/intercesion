import { useAuth } from "@/src/providers/AuthProvider";
import { useTheme } from "@/src/providers/ThemeProvider";
import { AddPrayerModal } from "@/src/components/prayers/AddPrayerModal";
import { EditPrayerModal } from "@/src/components/prayers/EditPrayerModal";
import { PrayerCard } from "@/src/components/prayers/PrayerCard";
import { StatusModal } from "@/src/components/prayers/StatusModal";
import { usePrayerIntentions } from "@/src/hooks/usePrayerIntentions";
import { Intention, statusConfig } from "@/src/types/intention";
import { AlertTriangle, Plus, Sparkles } from "lucide-react-native";
import { Alert } from "react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SectionList,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ViewMode = "todos" | "estado" | "intercesor";

function SectionHeader({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ paddingHorizontal: 4, paddingTop: 16, paddingBottom: 8 }}>
      <Text
        style={{
          color: colors.primary,
          fontSize: 14,
          fontWeight: "700",
          letterSpacing: 0.5,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

export default function MisOracionesScreen() {
  const { user, saints, categories, updateSaints, updateCategories } = useAuth();
  const { colors } = useTheme();

  const {
    intentions,
    isLoading,
    isError,
    refetch,
    addMutation,
    updateStatusMutation,
    editMutation,
    handleCandleToggle,
  } = usePrayerIntentions(user?.id);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [statusModalItem, setStatusModalItem] = useState<Intention | null>(null);
  const [editModalItem, setEditModalItem] = useState<Intention | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("todos");

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

  const handleInlineAddCategory = async (cat: string) => {
    if (categories.includes(cat)) {
      Alert.alert("Aviso", "Esta categoría ya existe.");
      return;
    }
    await updateCategories([...categories, cat]);
  };

  const handleInlineAddSaint = async (saint: string) => {
    if (saints.includes(saint)) return;
    await updateSaints([...saints, saint]);
  };

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
              borderBottomColor:
                viewMode === tab.key ? colors.primary : colors.border,
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

      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
        <Text style={{ color: colors.muted, fontSize: 14 }}>
          {intentions.length}{" "}
          {intentions.length === 1 ? "intención" : "intenciones"}
        </Text>
      </View>

      {viewMode === "todos" ? (
        <FlatList
          data={intentions}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 4,
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={emptyComponent}
        />
      ) : (
        <SectionList
          sections={
            viewMode === "estado" ? sectionsByStatus : sectionsByIntercesor
          }
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          renderSectionHeader={({ section }) => (
            <SectionHeader title={section.title} />
          )}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 4,
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={emptyComponent}
        />
      )}

      {/* FAB */}
      <Pressable
        onPress={() => setAddModalVisible(true)}
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
        <Text style={{ color: "#ffffff", fontSize: 15, fontWeight: "700" }}>
          Orar
        </Text>
      </Pressable>

      <StatusModal
        visible={!!statusModalItem}
        current={statusModalItem?.status || "Sown"}
        onSelect={(status) => {
          if (statusModalItem) {
            updateStatusMutation.mutate({ id: statusModalItem.id, status });
            setStatusModalItem(null);
          }
        }}
        onClose={() => setStatusModalItem(null)}
      />

      <EditPrayerModal
        visible={!!editModalItem}
        item={editModalItem}
        categories={[...categories]}
        saints={saints}
        onSave={(data) => {
          editMutation.mutate(data);
          setEditModalItem(null);
        }}
        onClose={() => setEditModalItem(null)}
        onAddCategory={handleInlineAddCategory}
        onAddSaint={handleInlineAddSaint}
      />

      <AddPrayerModal
        visible={addModalVisible}
        categories={[...categories]}
        saints={saints}
        isPending={addMutation.isPending}
        onAdd={(data) => {
          addMutation.mutate(data);
          setAddModalVisible(false);
        }}
        onClose={() => setAddModalVisible(false)}
        onAddCategory={handleInlineAddCategory}
        onAddSaint={handleInlineAddSaint}
      />
    </SafeAreaView>
  );
}
