import { useTheme } from "@/src/providers/ThemeProvider";
import { Intention, STATUS_LIST, statusConfig } from "@/src/types/intention";
import { CheckCircle, Clock, Sparkles } from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";

const statusIcons: Record<string, typeof Sparkles> = {
  Sown: Clock,
  "In Cultivation": Sparkles,
  Harvested: CheckCircle,
};

export function StatusModal({
  visible,
  current,
  onSelect,
  onClose,
}: {
  visible: boolean;
  current: string;
  onSelect: (s: Intention["status"]) => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: colors.modalOverlay,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 20,
            width: "80%",
            borderWidth: 1,
            borderColor: colors.border,
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: "700",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            Cambiar Estado
          </Text>
          {STATUS_LIST.map((s) => {
            const cfg = statusConfig[s];
            const Icon = statusIcons[s];
            const isActive = s === current;
            return (
              <Pressable
                key={s}
                onPress={() => onSelect(s)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor: isActive ? cfg.bgColor : "transparent",
                  marginBottom: 4,
                }}
              >
                <Icon color={cfg.color} size={18} />
                <Text
                  style={{
                    color: isActive ? cfg.color : colors.textSecondary,
                    fontSize: 16,
                    fontWeight: isActive ? "700" : "500",
                    flex: 1,
                  }}
                >
                  {cfg.label}
                </Text>
                {isActive && <CheckCircle color={cfg.color} size={18} />}
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
}
