import { LiturgicalSeason, THEMES, useTheme } from "@/src/providers/ThemeProvider";
import { Check, ChevronDown, ChevronUp, Palette } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export function ThemePicker() {
  const { colors, season, setSeason } = useTheme();
  const [expanded, setExpanded] = useState(false);

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
                  <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                    {t.description}
                  </Text>
                </View>
                {isActive && <Check color={t.colors.primary} size={20} />}
              </Pressable>
            );
          })}
        </View>
      )}
    </>
  );
}
