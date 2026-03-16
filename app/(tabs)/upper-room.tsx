import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Church, Users, Heart } from "lucide-react-native";
import { useTheme } from "@/src/providers/ThemeProvider";

export default function UpperRoomScreen() {
    const { colors } = useTheme();

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{ padding: 20, alignItems: "center" }}
        >
            {/* Main Icon */}
            <View
                style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    backgroundColor: colors.chipBg,
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 40,
                    marginBottom: 24,
                }}
            >
                <Church color={colors.primary} size={48} />
            </View>

            <Text
                style={{
                    color: colors.text,
                    fontSize: 24,
                    fontWeight: "700",
                    marginBottom: 8,
                    textAlign: "center",
                }}
            >
                Aposento Alto
            </Text>

            <Text
                style={{
                    color: colors.textSecondary,
                    fontSize: 15,
                    textAlign: "center",
                    lineHeight: 22,
                    marginBottom: 40,
                    paddingHorizontal: 20,
                }}
            >
                Un espacio de oración comunitaria donde puedes compartir tus intenciones con otros creyentes.
            </Text>

            {/* Feature Cards */}
            <View style={{ width: "100%", gap: 16 }}>
                <View
                    style={{
                        backgroundColor: colors.card,
                        borderRadius: 16,
                        padding: 20,
                        borderWidth: 1,
                        borderColor: colors.border,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 16,
                        elevation: 2,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.06,
                        shadowRadius: 4,
                    }}
                >
                    <View
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            backgroundColor: colors.chipBg,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Users color={colors.primary} size={24} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600", marginBottom: 4 }}>
                            Oración en Comunidad
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 18 }}>
                            Comparte y ora junto a otros hermanos en la fe.
                        </Text>
                    </View>
                </View>

                <View
                    style={{
                        backgroundColor: colors.card,
                        borderRadius: 16,
                        padding: 20,
                        borderWidth: 1,
                        borderColor: colors.border,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 16,
                        elevation: 2,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.06,
                        shadowRadius: 4,
                    }}
                >
                    <View
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            backgroundColor: colors.candleBg,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Heart color={colors.candleColor} size={24} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600", marginBottom: 4 }}>
                            Intercesión Grupal
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 18 }}>
                            Únete a cadenas de oración por necesidades urgentes.
                        </Text>
                    </View>
                </View>
            </View>

            {/* Coming Soon Badge */}
            <View
                style={{
                    marginTop: 40,
                    backgroundColor: colors.chipBg,
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 20,
                }}
            >
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}>
                    🚀 Próximamente
                </Text>
            </View>
        </ScrollView>
    );
}
