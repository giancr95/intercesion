import { useTheme } from "@/src/providers/ThemeProvider";
import {
  formatDate,
  getCategoryColor,
  Intention,
  statusConfig,
} from "@/src/types/intention";
import { CheckCircle, ChevronDown, Clock, Flame, Pencil, Sparkles } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

const statusIcons: Record<string, typeof Sparkles> = {
  Sown: Clock,
  "In Cultivation": Sparkles,
  Harvested: CheckCircle,
};

export function PrayerCard({
  item,
  onStatusPress,
  onEditPress,
  onCandleToggle,
}: {
  item: Intention;
  onStatusPress: () => void;
  onEditPress: () => void;
  onCandleToggle: () => void;
}) {
  const { colors } = useTheme();
  const config = statusConfig[item.status] || statusConfig["Sown"];
  const StatusIcon = statusIcons[item.status] || statusIcons["Sown"];
  const catColor = getCategoryColor(item.category || "General");

  return (
    <Pressable
      onLongPress={onEditPress}
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: item.candle_mode ? colors.candleColor : colors.border,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      }}
    >
      {item.candle_mode && (
        <View
          style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 6 }}
        >
          <Text style={{ fontSize: 14 }}>🕯️</Text>
          <Text style={{ color: "#d97706", fontSize: 11, fontWeight: "700" }}>
            Vela encendida
          </Text>
        </View>
      )}

      <Text
        style={{
          color: colors.text,
          fontSize: 16,
          fontWeight: "500",
          marginBottom: 10,
          lineHeight: 22,
        }}
      >
        {item.raw_text}
      </Text>

      {item.intercesor ? (
        <Text
          style={{
            color: "#7c5cbf",
            fontSize: 12,
            fontWeight: "600",
            marginBottom: 10,
            fontStyle: "italic",
          }}
        >
          🙏 {item.intercesor}
        </Text>
      ) : null}

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <Pressable onPress={onStatusPress}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: config.bgColor,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              gap: 6,
            }}
          >
            <StatusIcon color={config.color} size={14} />
            <Text
              style={{
                color: config.color,
                fontSize: 12,
                fontWeight: "700",
                letterSpacing: 0.5,
              }}
            >
              {config.label}
            </Text>
            <ChevronDown color={config.color} size={12} />
          </View>
        </Pressable>

        {item.category ? (
          <View
            style={{
              backgroundColor: catColor + "18",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: catColor, fontSize: 11, fontWeight: "700" }}>
              {item.category}
            </Text>
          </View>
        ) : null}

        <Pressable onPress={onCandleToggle}>
          <View
            style={{
              backgroundColor: item.candle_mode ? colors.candleBg : colors.badgeMutedBg,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: item.candle_mode ? colors.candleColor : colors.border,
            }}
          >
            <Flame
              color={item.candle_mode ? colors.candleColor : colors.muted}
              size={14}
            />
          </View>
        </Pressable>

        <Pressable onPress={onEditPress}>
          <View
            style={{
              backgroundColor: colors.badgeMutedBg,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Pencil color={colors.muted} size={14} />
          </View>
        </Pressable>
      </View>

      <Text
        style={{ color: colors.muted, fontSize: 11, marginTop: 10, fontStyle: "italic" }}
      >
        📅 {formatDate(item.created_at)}
      </Text>
    </Pressable>
  );
}
