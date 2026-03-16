import { DEFAULT_CATEGORIES, DEFAULT_INTERCESORS } from "@/src/data/intercesors";
import { useAuth } from "@/src/providers/AuthProvider";
import { LiturgicalSeason, THEMES, useTheme } from "@/src/providers/ThemeProvider";
import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Edit3,
  Lock,
  LogIn,
  LogOut,
  Mail,
  Palette,
  Plus,
  RotateCcw,
  Trash2,
  UserCircle,
  UserPlus,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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
  const { colors, season, setSeason } = useTheme();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Display name editing
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  // Saints management
  const [showSaints, setShowSaints] = useState(false);
  const [newSaint, setNewSaint] = useState("");

  // Categories management
  const [showCategories, setShowCategories] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // Theme section
  const [showThemes, setShowThemes] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Por favor ingresa tu correo y contraseña.");
      return;
    }
    setAuthLoading(true);
    const { error } = isSignUp
      ? await signUp(email.trim(), password)
      : await signIn(email.trim(), password);
    setAuthLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else if (isSignUp) {
      Alert.alert(
        "¡Cuenta creada!",
        "Revisa tu correo para confirmar tu cuenta, o inicia sesión si la confirmación está desactivada."
      );
    }
  };

  const handleSignOut = async () => {
    await signOut();
    queryClient.clear();
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert(
        "Correo requerido",
        "Por favor ingresa tu correo electrónico para restablecer la contraseña."
      );
      return;
    }
    setAuthLoading(true);
    const { error } = await resetPassword(trimmedEmail);
    setAuthLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert(
        "Correo enviado",
        "Revisa tu bandeja de entrada para restablecer tu contraseña."
      );
    }
  };

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    const { error } = await updateDisplayName(trimmed);
    if (error) Alert.alert("Error", error.message);
    setEditingName(false);
  };

  // Saints CRUD
  const handleAddSaint = async () => {
    const trimmed = newSaint.trim();
    if (!trimmed) return;
    if (saints.includes(trimmed)) {
      Alert.alert("Aviso", "Este santo ya está en tu lista.");
      return;
    }
    const { error } = await updateSaints([...saints, trimmed]);
    if (error) Alert.alert("Error", error.message);
    setNewSaint("");
  };

  const handleRemoveSaint = async (saint: string) => {
    const filtered = saints.filter((s) => s !== saint);
    const { error } = await updateSaints(filtered);
    if (error) Alert.alert("Error", error.message);
  };

  const handleResetSaints = async () => {
    const { error } = await updateSaints([...DEFAULT_INTERCESORS]);
    if (error) Alert.alert("Error", error.message);
  };

  // Categories CRUD
  const handleAddCategory = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      Alert.alert("Aviso", "Esta categoría ya existe.");
      return;
    }
    const { error } = await updateCategories([...categories, trimmed]);
    if (error) Alert.alert("Error", error.message);
    setNewCategory("");
  };

  const handleRemoveCategory = async (cat: string) => {
    const filtered = categories.filter((c) => c !== cat);
    if (filtered.length === 0) {
      Alert.alert("Aviso", "Debes tener al menos una categoría.");
      return;
    }
    const { error } = await updateCategories(filtered);
    if (error) Alert.alert("Error", error.message);
  };

  const handleResetCategories = async () => {
    const { error } = await updateCategories([...DEFAULT_CATEGORIES]);
    if (error) Alert.alert("Error", error.message);
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

  // ─── Authenticated View ───
  if (user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["bottom"]}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {/* Avatar */}
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

            {/* Editable Display Name */}
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

            {/* Fix #5: Email — ensure full email is visible */}
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

          {/* ─── Liturgical Theme Section ─── */}
          <Pressable
            onPress={() => setShowThemes(!showThemes)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: showThemes ? 0 : 12,
              borderBottomLeftRadius: showThemes ? 0 : 12,
              borderBottomRightRadius: showThemes ? 0 : 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Palette color={colors.primary} size={20} />
              <View>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
                  Tema Litúrgico
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                  {THEMES[season].emoji} {THEMES[season].label}
                </Text>
              </View>
            </View>
            {showThemes ? (
              <ChevronUp color={colors.muted} size={20} />
            ) : (
              <ChevronDown color={colors.muted} size={20} />
            )}
          </Pressable>

          {showThemes && (
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
              {(Object.keys(THEMES) as LiturgicalSeason[]).map((key) => {
                const t = THEMES[key];
                const isActive = key === season;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setSeason(key)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      backgroundColor: isActive ? t.colors.primary + "15" : "transparent",
                      marginBottom: 4,
                    }}
                  >
                    {/* Color swatch */}
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: t.colors.primary,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: isActive ? 3 : 0,
                        borderColor: isActive ? t.colors.primaryDark : "transparent",
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>{t.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: isActive ? t.colors.primary : colors.text,
                          fontSize: 15,
                          fontWeight: isActive ? "700" : "500",
                        }}
                      >
                        {t.label}
                      </Text>
                      <Text
                        style={{
                          color: colors.muted,
                          fontSize: 12,
                          marginTop: 2,
                        }}
                      >
                        {t.description}
                      </Text>
                    </View>
                    {isActive && <Check color={t.colors.primary} size={20} />}
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* ─── Saints Section ─── */}
          <Pressable
            onPress={() => setShowSaints(!showSaints)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: showSaints ? 0 : 12,
              borderBottomLeftRadius: showSaints ? 0 : 12,
              borderBottomRightRadius: showSaints ? 0 : 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Text style={{ fontSize: 18 }}>🙏</Text>
              <View>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
                  Mis Santos Intercesores
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                  {saints.length} santos
                </Text>
              </View>
            </View>
            {showSaints ? (
              <ChevronUp color={colors.muted} size={20} />
            ) : (
              <ChevronDown color={colors.muted} size={20} />
            )}
          </Pressable>

          {showSaints && (
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
              {/* Add saint input */}
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <TextInput
                  placeholder="Agregar santo..."
                  placeholderTextColor={colors.muted}
                  value={newSaint}
                  onChangeText={setNewSaint}
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
                  onPress={handleAddSaint}
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

              {/* Saints list */}
              {saints.map((saint, idx) => (
                <View
                  key={`${saint}-${idx}`}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 10,
                    paddingHorizontal: 4,
                    borderBottomWidth: idx < saints.length - 1 ? 1 : 0,
                    borderBottomColor: colors.inputBg,
                  }}
                >
                  <Text
                    style={{ color: colors.text, fontSize: 14, flex: 1 }}
                    numberOfLines={1}
                  >
                    {saint}
                  </Text>
                  <Pressable
                    onPress={() => handleRemoveSaint(saint)}
                    style={{ padding: 6 }}
                  >
                    <Trash2 color={colors.danger} size={16} />
                  </Pressable>
                </View>
              ))}

              {/* Reset */}
              <Pressable
                onPress={handleResetSaints}
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
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}>
                  Restaurar predeterminados
                </Text>
              </Pressable>
            </View>
          )}

          {/* ─── Categories Section ─── */}
          <Pressable
            onPress={() => setShowCategories(!showCategories)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: showCategories ? 0 : 12,
              borderBottomLeftRadius: showCategories ? 0 : 12,
              borderBottomRightRadius: showCategories ? 0 : 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Text style={{ fontSize: 18 }}>📂</Text>
              <View>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
                  Mis Categorías
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                  {categories.length} categorías
                </Text>
              </View>
            </View>
            {showCategories ? (
              <ChevronUp color={colors.muted} size={20} />
            ) : (
              <ChevronDown color={colors.muted} size={20} />
            )}
          </Pressable>

          {showCategories && (
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
              {/* Add category input */}
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <TextInput
                  placeholder="Agregar categoría..."
                  placeholderTextColor={colors.muted}
                  value={newCategory}
                  onChangeText={setNewCategory}
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
                  onPress={handleAddCategory}
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

              {/* Categories list */}
              {categories.map((cat, idx) => (
                <View
                  key={`${cat}-${idx}`}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 10,
                    paddingHorizontal: 4,
                    borderBottomWidth: idx < categories.length - 1 ? 1 : 0,
                    borderBottomColor: colors.inputBg,
                  }}
                >
                  <Text
                    style={{ color: colors.text, fontSize: 14, flex: 1 }}
                    numberOfLines={1}
                  >
                    {cat}
                  </Text>
                  <Pressable
                    onPress={() => handleRemoveCategory(cat)}
                    style={{ padding: 6 }}
                  >
                    <Trash2 color={colors.danger} size={16} />
                  </Pressable>
                </View>
              ))}

              {/* Reset */}
              <Pressable
                onPress={handleResetCategories}
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
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}>
                  Restaurar predeterminados
                </Text>
              </Pressable>
            </View>
          )}

          {/* Sign Out */}
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

  // ─── Unauthenticated View ───
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={{ alignItems: "center", marginBottom: 40 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.chipBg,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <UserCircle color={colors.primary} size={48} />
            </View>
            <Text
              style={{
                color: colors.text,
                fontSize: 28,
                fontWeight: "800",
                letterSpacing: -0.5,
              }}
            >
              Intercesión
            </Text>
            <Text style={{ color: colors.muted, fontSize: 14, marginTop: 4 }}>
              {isSignUp ? "Crea tu cuenta" : "Inicia sesión para continuar"}
            </Text>
          </View>

          {/* Email */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.card,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 16,
              marginBottom: 12,
            }}
          >
            <Mail color={colors.muted} size={18} />
            <TextInput
              placeholder="Correo electrónico"
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              style={{
                flex: 1,
                color: colors.text,
                fontSize: 16,
                paddingVertical: 16,
                paddingLeft: 12,
              }}
            />
          </View>

          {/* Password */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.card,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 16,
              marginBottom: 24,
            }}
          >
            <Lock color={colors.muted} size={18} />
            <TextInput
              placeholder="Contraseña"
              placeholderTextColor={colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={{
                flex: 1,
                color: colors.text,
                fontSize: 16,
                paddingVertical: 16,
                paddingLeft: 12,
              }}
            />
          </View>

          {/* Primary Action Button */}
          <Pressable
            onPress={handleAuth}
            disabled={authLoading}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              backgroundColor: authLoading
                ? colors.muted
                : pressed
                  ? colors.primaryDark
                  : colors.primary,
              borderRadius: 12,
              paddingVertical: 16,
              marginBottom: 16,
            })}
          >
            {authLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : isSignUp ? (
              <UserPlus color="#ffffff" size={20} />
            ) : (
              <LogIn color="#ffffff" size={20} />
            )}
            <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "700" }}>
              {authLoading
                ? "Cargando..."
                : isSignUp
                  ? "Crear Cuenta"
                  : "Iniciar Sesión"}
            </Text>
          </Pressable>

          {/* Toggle */}
          <Pressable onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: "center" }}>
              {isSignUp ? "¿Ya tienes cuenta? " : "¿No tienes cuenta? "}
              <Text style={{ color: colors.primary, fontWeight: "600" }}>
                {isSignUp ? "Inicia Sesión" : "Regístrate"}
              </Text>
            </Text>
          </Pressable>

          {/* Forgot Password */}
          {!isSignUp && (
            <Pressable onPress={handleForgotPassword} style={{ marginTop: 16 }}>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 14,
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                ¿Olvidaste tu contraseña?
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
