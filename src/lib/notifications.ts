import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure how notifications behave when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Request notification permissions (needed for Android 13+)
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
}

// Schedule a repeating notification for candle mode
// Uses a unique identifier per intention so we can cancel individually
export async function scheduleCandleNotification(
  intentionId: string,
  prayerText: string
): Promise<string | null> {
  if (Platform.OS === "web") return null;

  const granted = await requestNotificationPermissions();
  if (!granted) return null;

  // Cancel any existing notification for this intention first
  await cancelCandleNotification(intentionId);

  // Schedule a repeating notification every 30 minutes (~1800 seconds)
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: "🕯️ Intención de Oración",
      body: prayerText.length > 100 ? prayerText.slice(0, 97) + "..." : prayerText,
      data: { intentionId },
      sticky: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1800, // 30 minutes
      repeats: true,
    },
  });

  // Also show an immediate notification so user sees it right away
  await Notifications.scheduleNotificationAsync({
    identifier: `${intentionId}-immediate`,
    content: {
      title: "🕯️ Vela Encendida",
      body: prayerText.length > 100 ? prayerText.slice(0, 97) + "..." : prayerText,
      data: { intentionId },
      sticky: true,
    },
    trigger: null, // show immediately
  });

  return identifier;
}

// Cancel notification for a specific intention
export async function cancelCandleNotification(
  intentionId: string
): Promise<void> {
  if (Platform.OS === "web") return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    if (notification.content.data?.intentionId === intentionId) {
      await Notifications.cancelScheduledNotificationAsync(
        notification.identifier
      );
    }
  }

  // Also dismiss the immediate one
  try {
    await Notifications.dismissNotificationAsync(`${intentionId}-immediate`);
  } catch {
    // ignore if not found
  }
}

// Cancel all candle notifications (e.g., on sign out)
export async function cancelAllCandleNotifications(): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.dismissAllNotificationsAsync();
}
