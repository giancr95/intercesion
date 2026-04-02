import React from "react";
import { Pressable, Text, View } from "react-native";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: unknown): State {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    return { hasError: true, message };
  }

  reset = () => this.setState({ hasError: false, message: "" });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}
        >
          <Text style={{ fontSize: 32, marginBottom: 16 }}>⚠️</Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              textAlign: "center",
              marginBottom: 8,
              color: "#dc2626",
            }}
          >
            Algo salió mal
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#6b7280",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            {this.state.message}
          </Text>
          <Pressable
            onPress={this.reset}
            style={{
              backgroundColor: "#6366f1",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "600" }}>
              Reintentar
            </Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}
