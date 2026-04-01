import { DEFAULT_CATEGORIES, DEFAULT_INTERCESORS } from "@/src/data/intercesors";
import { useAuth } from "@/src/providers/AuthProvider";
import { useTheme } from "@/src/providers/ThemeProvider";
import { AuthForm } from "@/src/components/auth/AuthForm";
import { ThemePicker } from "@/src/components/settings/ThemePicker";
import { ListManager } from "@/src/components/settings/ListManager";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Edit3, LogOut, UserCircle } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const {
    user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    loading,
    displayName,
    updateDisplayName,
    saints,
    categories,
    updateSaints,
    updateCategories,
  } = useAuth();
  const { colors } = useTheme();
  const queryClient = useQueryClient();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const handleSignOut = async () => {
    await signOut();
    queryClient.clear();
  };

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    const { error } = await updateDisplayName(trimmed);
    if (error) Alert.alert("Error", error.message);
    setEditingName(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <AuthForm
        onSignIn={signIn}
        onSignUp={signUp}
        onForgotPassword={resetPassword}
      />
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Avatar + Display Name */}
        <View style={{ alignItems: "center", marginTop: 20, marginBottom: 32 }}>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: colors.chipBg,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <UserCircle color={colors.primary} size={56} />
          </View>

          {editingName ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                autoFocus
                style={{
                  color: colors.text,
                  fontSize: 20,
                  fontWeight: "700",
                  borderBottomWidth: 2,
                  borderBottomColor: colors.primary,
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  minWidth: 150,
                  textAlign: "center",
                }}
              />
              <Pressable
                onPress={handleSaveName}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Check color="#ffffff" size={18} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => {
                setNameInput(displayName);
                setEditingName(true);
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <Text
                style={{ color: colors.text, fontSize: 22, fontWeight: "700" }}
              >
                {displayName}
              </Text>
              <Edit3 color={colors.muted} size={16} />
            </Pressable>
          )}

          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 14,
              textAlign: "center",
              paddingHorizontal: 16,
            }}
            selectable
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {user.email}
          </Text>
        </View>

        <ThemePicker />

        <ListManager
          title="Mis Santos Intercesores"
          icon="🙏"
          items={saints}
          defaults={[...DEFAULT_INTERCESORS]}
          onUpdate={updateSaints}
          addPlaceholder="Agregar santo..."
        />

        <ListManager
          title="Mis Categorías"
          icon="📂"
          items={categories}
          defaults={[...DEFAULT_CATEGORIES]}
          onUpdate={updateCategories}
          addPlaceholder="Agregar categoría..."
          minItems={1}
        />

        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            backgroundColor: pressed ? colors.dangerPressed : colors.danger,
            borderRadius: 12,
            paddingVertical: 16,
            marginTop: 16,
          })}
        >
          <LogOut color="#ffffff" size={20} />
          <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "700" }}>
            Cerrar Sesión
          </Text>
        </Pressable>

        <Text
          style={{
            color: colors.muted,
            fontSize: 12,
            textAlign: "center",
            marginTop: 40,
          }}
        >
          Intercesión v1.2.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
