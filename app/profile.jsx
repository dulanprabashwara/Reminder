import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "./components/Header";
import { useTheme } from "./contexts/ThemeContext";
import notificationService from "./services/notificationService";
import { getReminders, saveSnoozeTime } from "./utils/storage";

// Web storage fallback
const webStorage = {
  getItem: async (key) => {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItem: async (key, value) => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  },
};

const storage = Platform.OS === "web" ? webStorage : AsyncStorage;

const SNOOZE_DURATION_KEY = "default_snooze_duration";

export default function ProfileScreen() {
  const { theme } = useTheme();
  const [taskStats, setTaskStats] = useState({
    completed: 0,
    pending: 0,
  });
  const [selectedSnoozeDuration, setSelectedSnoozeDuration] = useState(5); // Default 5 minutes

  // Snooze duration options for the slider (1 min to 60 min)
  const minSnooze = 1;
  const maxSnooze = 60;
  const snoozeStep = 1;

  const formatSnoozeDuration = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} hour${hours > 1 ? "s" : ""}`;
      } else {
        return `${hours}h ${remainingMinutes}m`;
      }
    }
    return `${minutes} min${minutes > 1 ? "s" : ""}`;
  };

  const loadTaskStats = async () => {
    try {
      const reminders = await getReminders();
      const now = new Date();

      let completed = 0;
      let pending = 0;

      reminders.forEach((reminder) => {
        const reminderDate = new Date(reminder.dateTime);

        // Check if reminder has a completed field, otherwise use date logic
        if (reminder.completed === true) {
          completed++;
        } else if (
          reminder.completed === false ||
          reminder.completed === undefined
        ) {
          // If not explicitly completed, check if it's overdue (past date = completed)
          if (reminderDate < now) {
            completed++;
          } else {
            pending++;
          }
        }
      });

      setTaskStats({
        completed,
        pending,
      });
    } catch (error) {
      console.error("Error loading task stats:", error);
    }
  };

  const loadSnoozeDuration = async () => {
    try {
      const savedDuration = await storage.getItem(SNOOZE_DURATION_KEY);
      if (savedDuration) {
        setSelectedSnoozeDuration(parseInt(savedDuration));
      }
    } catch (error) {
      console.error("Error loading snooze duration:", error);
    }
  };

  const saveSnoozeDuration = async (duration) => {
    try {
      await storage.setItem(SNOOZE_DURATION_KEY, duration.toString());
      // Also save using the new storage utility function
      await saveSnoozeTime(duration);
      setSelectedSnoozeDuration(duration);
    } catch (error) {
      console.error("Error saving snooze duration:", error);
    }
  };

  const handleSliderChange = (value) => {
    setSelectedSnoozeDuration(value);
    saveSnoozeDuration(value);
  };

  // Test notification function
  const testNotification = async () => {
    try {
      // Initialize notification service first
      const initialized = await notificationService.initialize();

      if (!initialized) {
        Alert.alert(
          "Permission Required",
          "Please enable notifications in your device settings to test reminders."
        );
        return;
      }

      // Create a test reminder for 5 seconds from now
      const testTime = new Date();
      testTime.setSeconds(testTime.getSeconds() + 5);

      const testReminder = {
        id: "test-" + Date.now(),
        title: "Test Reminder",
        description: "This is a test notification",
        dateTime: testTime.toISOString(),
      };

      await notificationService.scheduleNotification(testReminder);

      Alert.alert(
        "Test Notification Scheduled",
        "A test notification will appear in 5 seconds with reminder sound."
      );
    } catch (error) {
      console.error("Error testing notification:", error);
      Alert.alert("Error", "Failed to schedule test notification");
    }
  };

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTaskStats();
      loadSnoozeDuration();
    }, [])
  );

  const renderStatsCard = (title, count, icon, color) => (
    <View
      style={[
        styles.statsCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={[styles.statsIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statsInfo}>
        <Text style={[styles.statsCount, { color: theme.text }]}>{count}</Text>
        <Text style={[styles.statsTitle, { color: theme.textSecondary }]}>
          {title}
        </Text>
      </View>
    </View>
  );

  const CustomSlider = () => {
    if (Platform.OS === "web") {
      return (
        <View style={styles.sliderContainer}>
          <View style={styles.sliderLabels}>
            <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>
              {formatSnoozeDuration(minSnooze)}
            </Text>
            <Text style={[styles.sliderValue, { color: theme.text }]}>
              {formatSnoozeDuration(selectedSnoozeDuration)}
            </Text>
            <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>
              {formatSnoozeDuration(maxSnooze)}
            </Text>
          </View>

          <input
            type="range"
            min={minSnooze}
            max={maxSnooze}
            value={selectedSnoozeDuration}
            onChange={(e) => handleSliderChange(parseInt(e.target.value))}
            style={{
              width: "280px",
              height: "8px",
              borderRadius: "4px",
              background: `linear-gradient(to right, ${
                theme.primary || "#007AFF"
              } 0%, ${theme.primary || "#007AFF"} ${
                ((selectedSnoozeDuration - minSnooze) /
                  (maxSnooze - minSnooze)) *
                100
              }%, ${theme.border || "#E0E0E0"} ${
                ((selectedSnoozeDuration - minSnooze) /
                  (maxSnooze - minSnooze)) *
                100
              }%, ${theme.border || "#E0E0E0"} 100%)`,
              outline: "none",
              appearance: "none",
              cursor: "pointer",
            }}
          />
        </View>
      );
    }

    // Mobile implementation
    const sliderWidth = 280;
    const knobSize = 24;
    const trackHeight = 8;

    const getKnobPosition = () => {
      const percentage =
        (selectedSnoozeDuration - minSnooze) / (maxSnooze - minSnooze);
      return percentage * (sliderWidth - knobSize);
    };

    const handleSliderPress = (event) => {
      const { locationX } = event.nativeEvent;
      console.log("Slider pressed at locationX:", locationX);

      // Calculate percentage based on the full track width
      const percentage = Math.max(0, Math.min(1, locationX / sliderWidth));
      const newValue = Math.round(
        minSnooze + percentage * (maxSnooze - minSnooze)
      );

      console.log("Calculated percentage:", percentage);
      console.log("New value:", newValue);

      handleSliderChange(newValue);
    };

    return (
      <View style={styles.sliderContainer}>
        <View style={styles.sliderLabels}>
          <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>
            {formatSnoozeDuration(minSnooze)}
          </Text>
          <Text style={[styles.sliderValue, { color: theme.text }]}>
            {formatSnoozeDuration(selectedSnoozeDuration)}
          </Text>
          <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>
            {formatSnoozeDuration(maxSnooze)}
          </Text>
        </View>

        <View style={styles.sliderWrapper}>
          <TouchableOpacity
            style={[styles.sliderTrack, { width: sliderWidth }]}
            onPress={handleSliderPress}
            activeOpacity={1}
          >
            {/* Track background */}
            <View
              style={[
                styles.sliderTrackBackground,
                {
                  backgroundColor: theme.border || "#E0E0E0",
                  height: trackHeight,
                  width: sliderWidth,
                },
              ]}
            />

            {/* Active track */}
            <View
              style={[
                styles.sliderTrackActive,
                {
                  backgroundColor: theme.primary || "#007AFF",
                  width: getKnobPosition() + knobSize / 2,
                  height: trackHeight,
                },
              ]}
            />
          </TouchableOpacity>

          {/* Knob */}
          <TouchableOpacity
            style={[
              styles.sliderKnob,
              {
                backgroundColor: theme.primary || "#007AFF",
                left: getKnobPosition(),
                width: knobSize,
                height: knobSize,
              },
            ]}
            onPress={() => console.log("Knob pressed")}
            activeOpacity={0.8}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Settings" showMenu={false} showProfile={false} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileContainer}>
          {/* Settings Header */}
          <View style={styles.profileHeader}>
            <View
              style={[
                styles.profileAvatar,
                { backgroundColor: theme.primary || "#007AFF" },
              ]}
            >
              <Ionicons name="settings" size={40} color="white" />
            </View>
            <Text style={[styles.profileName, { color: theme.text }]}>
              Settings
            </Text>
          </View>

          {/* Task Statistics */}
          <View style={styles.statsSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Task Statistics
            </Text>
            <View style={styles.statsGrid}>
              {renderStatsCard(
                "Completed",
                taskStats.completed,
                "checkmark-circle",
                "#4CAF50"
              )}
              {renderStatsCard("Pending", taskStats.pending, "time", "#FF9800")}
            </View>
          </View>

          {/* Snooze Duration Settings */}
          <View style={styles.settingsSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Default Snooze Duration
            </Text>
            <Text
              style={[
                styles.sectionDescription,
                { color: theme.textSecondary },
              ]}
            >
              Slide to choose how long to snooze reminders by default
            </Text>
            <CustomSlider />
          </View>

          {/* Notification Test */}
          <View style={styles.settingsSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Notification Test
            </Text>
            <Text
              style={[
                styles.sectionDescription,
                { color: theme.textSecondary },
              ]}
            >
              Test reminder notifications with sound
            </Text>
            <TouchableOpacity
              style={[
                styles.testButton,
                { backgroundColor: theme.primary || "#007AFF" },
              ]}
              onPress={testNotification}
            >
              <Ionicons name="notifications" size={20} color="white" />
              <Text style={styles.testButtonText}>Test Notification</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  profileContainer: {
    padding: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  statsCard: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statsInfo: {
    alignItems: "center",
  },
  statsCount: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statsTitle: {
    fontSize: 12,
    textAlign: "center",
  },
  settingsSection: {
    marginBottom: 30,
  },
  sliderContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: 280,
    marginBottom: 20,
  },
  sliderLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  sliderWrapper: {
    width: 280,
    height: 40,
    justifyContent: "center",
    position: "relative",
  },
  sliderTrack: {
    height: 40,
    justifyContent: "center",
    paddingVertical: 16,
  },
  sliderTrackBackground: {
    borderRadius: 4,
    position: "absolute",
    top: 16,
  },
  sliderTrackActive: {
    borderRadius: 4,
    position: "absolute",
    top: 16,
  },
  sliderKnob: {
    borderRadius: 12,
    position: "absolute",
    top: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 2,
    borderColor: "white",
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  testButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
