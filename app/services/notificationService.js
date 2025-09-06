import { Audio } from "expo-av";
import * as Device from "expo-device";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getSnoozeTime } from "../utils/storage";

// Configure how notifications should be handled when received
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.sound = null;
    this.permissionGranted = false;
  }

  // Initialize the notification service
  async initialize() {
    try {
      // Request permissions
      const { status } = await this.requestPermissions();
      this.permissionGranted = status === "granted";

      if (this.permissionGranted) {
        console.log("Notification permissions granted");
        // Set up notification channels for Android
        if (Platform.OS === "android") {
          await this.setupNotificationChannels();
        }
      } else {
        console.log("Notification permissions denied");
      }

      return this.permissionGranted;
    } catch (error) {
      console.error("Error initializing notifications:", error);
      return false;
    }
  }

  // Request notification permissions
  async requestPermissions() {
    let finalStatus = "denied";

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
    } else {
      console.log("Must use physical device for Push Notifications");
    }

    return { status: finalStatus };
  }

  // Setup notification channels for Android
  async setupNotificationChannels() {
    await Notifications.setNotificationChannelAsync("reminder-channel", {
      name: "Reminder Notifications",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500, 200, 500, 200, 500], // Stronger vibration pattern
      lightColor: "#2196F3",
      sound: "ringtone.mp3", // Use custom ringtone
      enableVibrate: true,
    });
  }

  // Schedule a notification for a reminder
  async scheduleNotification(reminder) {
    if (!this.permissionGranted) {
      console.log("Notifications not permitted");
      return null;
    }

    try {
      const trigger = new Date(reminder.dateTime);

      // Don't schedule notifications for past dates
      if (trigger <= new Date()) {
        console.log("Cannot schedule notification for past date");
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "🔔 Reminder",
          body: reminder.title,
          data: {
            reminderId: reminder.id,
            type: "reminder",
            originalTime: reminder.dateTime,
          },
          sound: "ringtone.mp3", // Use custom ringtone
          priority: Notifications.AndroidImportance.HIGH,
          vibrate: [0, 500, 200, 500, 200, 500], // Custom vibration pattern
          categoryId: "reminder-channel", // Use our custom channel
        },
        trigger: {
          date: trigger,
        },
      });

      console.log(`Scheduled notification ${notificationId} for ${trigger}`);
      return notificationId;
    } catch (error) {
      console.error("Error scheduling notification:", error);
      return null;
    }
  }

  // Cancel a scheduled notification
  async cancelNotification(notificationId) {
    if (notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        console.log(`Cancelled notification ${notificationId}`);
      } catch (error) {
        console.error("Error cancelling notification:", error);
      }
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("Cancelled all notifications");
    } catch (error) {
      console.error("Error cancelling all notifications:", error);
    }
  }

  // Handle snooze functionality
  async snoozeNotification(reminderId, originalTime) {
    try {
      const snoozeMinutes = await getSnoozeTime();
      const snoozeTime = new Date();
      snoozeTime.setMinutes(snoozeTime.getMinutes() + snoozeMinutes);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "🔔 Reminder (Snoozed)",
          body: `Reminder snoozed for ${snoozeMinutes} minutes`,
          data: {
            reminderId,
            type: "snooze",
            originalTime,
          },
          sound: "ringtone.mp3", // Use custom ringtone
          priority: Notifications.AndroidImportance.HIGH,
          vibrate: [0, 500, 200, 500, 200, 500], // Custom vibration pattern
          categoryId: "reminder-channel", // Use our custom channel
        },
        trigger: {
          date: snoozeTime,
        },
      });

      console.log(`Snoozed notification for ${snoozeMinutes} minutes`);
      return notificationId;
    } catch (error) {
      console.error("Error snoozing notification:", error);
      return null;
    }
  }

  // Play notification sound
  async playNotificationSound() {
    try {
      // Unload previous sound if exists
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      console.log("Playing custom notification sound...");

      // Load and play the custom ringtone
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/sounds/ringtone.mp3"),
        { shouldPlay: true, isLooping: false, volume: 1.0 }
      );

      this.sound = sound;

      // Trigger haptic feedback (vibration)
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      }

      // Auto-cleanup after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });

      return true;
    } catch (error) {
      console.log("Could not load custom notification sound:", error);

      // Fallback to haptic feedback only
      try {
        if (Platform.OS !== "web") {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
        }
      } catch (hapticError) {
        console.log("Could not trigger haptic feedback:", hapticError);
      }

      return false;
    }
  }

  // Get all scheduled notifications
  async getScheduledNotifications() {
    try {
      const notifications =
        await Notifications.getAllScheduledNotificationsAsync();
      return notifications;
    } catch (error) {
      console.error("Error getting scheduled notifications:", error);
      return [];
    }
  }

  // Cleanup resources
  async cleanup() {
    if (this.sound) {
      try {
        await this.sound.unloadAsync();
      } catch (error) {
        console.log("Error cleaning up sound:", error);
      }
    }
  }
}

// Create and export a singleton instance
const notificationService = new NotificationService();
export default notificationService;

// Export individual functions for convenience
export const {
  initialize,
  scheduleNotification,
  cancelNotification,
  cancelAllNotifications,
  snoozeNotification,
  playNotificationSound,
  getScheduledNotifications,
  cleanup,
} = notificationService;
