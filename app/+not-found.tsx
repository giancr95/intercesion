import { Link, Stack } from "expo-router";
import { View, Text } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "¡Oops!" }} />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          backgroundColor: "#020617",
        }}
      >
        <Text style={{ color: "#f8fafc", fontSize: 18, fontWeight: "600", marginBottom: 16 }}>
          Esta pantalla no existe.
        </Text>
        <Link href="/" style={{ color: "#fbbf24", fontSize: 15 }}>
          Ir a la pantalla principal
        </Link>
      </View>
    </>
  );
}
