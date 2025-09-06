import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Alert, Platform } from "react-native";
import notificationService from "../services/notificationService";

export default function NotificationListener() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Initialize notification service
    notificationService.initialize();

    // Listener for when a notification is received while app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
        // Play custom sound and vibrate when notification is received
        notificationService.playNotificationSound();

        // Additional vibration for when app is in foreground
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      });

    // Listener for when user taps on notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
        handleNotificationResponse(response);
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const handleNotificationResponse = (response) => {
    const { notification } = response;
    const { data } = notification.request.content;

    if (data.type === "reminder" || data.type === "snooze") {
      // Show snooze option
      showSnoozeDialog(data.reminderId, data.originalTime);
    }
  };

  const showSnoozeDialog = (reminderId, originalTime) => {
    // Strong vibration when showing the dialog
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    Alert.alert(
      "🔔 Reminder Alert",
      "Your reminder is due! What would you like to do?",
      [
        {
          text: "Dismiss",
          style: "cancel",
          onPress: () => {
            // Light haptic feedback for dismiss
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            console.log("Reminder dismissed");
          },
        },
        {
          text: "Snooze",
          onPress: () => handleSnooze(reminderId, originalTime),
        },
        {
          text: "Mark Complete",
          onPress: () => handleMarkComplete(reminderId),
        },
      ],
      { cancelable: false }
    );
  };

  const handleSnooze = async (reminderId, originalTime) => {
    try {
      // Medium haptic feedback for snooze action
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      await notificationService.snoozeNotification(reminderId, originalTime);
      Alert.alert("Snoozed", "Reminder has been snoozed successfully!");
    } catch (error) {
      console.error("Error snoozing reminder:", error);
      Alert.alert("Error", "Failed to snooze reminder");
    }
  };

  const handleMarkComplete = (reminderId) => {
    try {
      // Success haptic feedback for completion
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // This would integrate with your storage system to mark reminder as complete
      console.log("Marking reminder as complete:", reminderId);
      Alert.alert("Completed", "Reminder marked as complete!");
    } catch (error) {
      console.error("Error marking reminder complete:", error);
    }
  };

  // This component doesn't render anything
  return null;
}
