import { useAuth } from "@/src/providers/AuthProvider";
import { useTheme } from "@/src/providers/ThemeProvider";
import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import { Tabs, useRouter, useSegments } from "expo-router";
import { BookHeart, Church, UserCircle } from "lucide-react-native";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { user, loading } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (loading) return;
    const currentTab = segments[1];
    if (!user && currentTab !== "profile") {
      router.replace("/(tabs)/profile");
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: 64 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        headerStyle: {
          backgroundColor: colors.headerBg,
        },
        headerTintColor: colors.headerText,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Mis Oraciones",
          tabBarIcon: ({ color, size }) => (
            <BookHeart color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="upper-room"
        options={{
          title: "Aposento Alto",
          tabBarIcon: ({ color, size }) => (
            <Church color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <UserCircle color={color} size={size} />
          ),
        }}
      />
    </Tabs>
    </ErrorBoundary>
  );
}
