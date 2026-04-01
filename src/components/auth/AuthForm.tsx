import { useTheme } from "@/src/providers/ThemeProvider";
import { Lock, LogIn, Mail, UserCircle, UserPlus } from "lucide-react-native";
import { useState } from "react";
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

export function AuthForm({
  onSignIn,
  onSignUp,
  onForgotPassword,
}: {
  onSignIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  onSignUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  onForgotPassword: (email: string) => Promise<{ error: Error | null }>;
}) {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Por favor ingresa tu correo y contraseña.");
      return;
    }
    setLoading(true);
    const { error } = isSignUp
      ? await onSignUp(email.trim(), password)
      : await onSignIn(email.trim(), password);
    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else if (isSignUp) {
      Alert.alert(
        "¡Cuenta creada!",
        "Revisa tu correo para confirmar tu cuenta, o inicia sesión si la confirmación está desactivada."
      );
    }
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
    setLoading(true);
    const { error } = await onForgotPassword(trimmedEmail);
    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert(
        "Correo enviado",
        "Revisa tu bandeja de entrada para restablecer tu contraseña."
      );
    }
  };

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

          <Pressable
            onPress={handleAuth}
            disabled={loading}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              backgroundColor: loading
                ? colors.muted
                : pressed
                  ? colors.primaryDark
                  : colors.primary,
              borderRadius: 12,
              paddingVertical: 16,
              marginBottom: 16,
            })}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : isSignUp ? (
              <UserPlus color="#ffffff" size={20} />
            ) : (
              <LogIn color="#ffffff" size={20} />
            )}
            <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "700" }}>
              {loading
                ? "Cargando..."
                : isSignUp
                  ? "Crear Cuenta"
                  : "Iniciar Sesión"}
            </Text>
          </Pressable>

          <Pressable onPress={() => setIsSignUp(!isSignUp)}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 14,
                textAlign: "center",
              }}
            >
              {isSignUp ? "¿Ya tienes cuenta? " : "¿No tienes cuenta? "}
              <Text style={{ color: colors.primary, fontWeight: "600" }}>
                {isSignUp ? "Inicia Sesión" : "Regístrate"}
              </Text>
            </Text>
          </Pressable>

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
