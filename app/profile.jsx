import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
  const router = useRouter();
  const [taskStats, setTaskStats] = useState({
    completed: 0,
    pending: 0,
  });
  const [selectedSnoozeDuration, setSelectedSnoozeDuration] = useState(5); // Default 5 minutes

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    soundEnabled: true,
    vibrationEnabled: true,
    soundVolume: 80, // 0-100
    vibrationPattern: "short", // 'short', 'long', 'pattern'
    showBadge: true,
  });

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

  // Notification settings functions
  const saveNotificationSettings = async (settings) => {
    try {
      await storage.setItem("notification_settings", JSON.stringify(settings));
      setNotificationSettings(settings);
    } catch (error) {
      console.error("Error saving notification settings:", error);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const saved = await storage.getItem("notification_settings");
      if (saved) {
        setNotificationSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
    }
  };

  const toggleSetting = (key) => {
    const newSettings = {
      ...notificationSettings,
      [key]: !notificationSettings[key],
    };
    saveNotificationSettings(newSettings);
  };

  const updateVolume = (volume) => {
    const newSettings = { ...notificationSettings, soundVolume: volume };
    saveNotificationSettings(newSettings);
  };

  const updateVibrationPattern = (pattern) => {
    const newSettings = { ...notificationSettings, vibrationPattern: pattern };
    saveNotificationSettings(newSettings);
  };

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTaskStats();
      loadSnoozeDuration();
      loadNotificationSettings();
    }, [])
  );

  const renderStatsCard = (title, count, icon, color) => (
    <View style={styles.statsCard}>
      <View style={[styles.statsIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statsInfo}>
        <Text style={styles.statsCount}>{count}</Text>
        <Text style={styles.statsTitle}>{title}</Text>
      </View>
    </View>
  );

  const CustomSlider = () => {
    if (Platform.OS === "web") {
      return (
        <View style={styles.sliderContainer}>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>
              {formatSnoozeDuration(minSnooze)}
            </Text>
            <Text style={styles.sliderValue}>
              {formatSnoozeDuration(selectedSnoozeDuration)}
            </Text>
            <Text style={styles.sliderLabel}>
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
              background: `linear-gradient(to right, #FF9800 0%, #FF9800 ${
                ((selectedSnoozeDuration - minSnooze) /
                  (maxSnooze - minSnooze)) *
                100
              }%, #555555 ${
                ((selectedSnoozeDuration - minSnooze) /
                  (maxSnooze - minSnooze)) *
                100
              }%, #555555 100%)`,
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
          <Text style={styles.sliderLabel}>
            {formatSnoozeDuration(minSnooze)}
          </Text>
          <Text style={styles.sliderValue}>
            {formatSnoozeDuration(selectedSnoozeDuration)}
          </Text>
          <Text style={styles.sliderLabel}>
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
                  backgroundColor: "#555555",
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
                  backgroundColor: "#FF9800",
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
                backgroundColor: "#FF9800",
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

  const VolumeSlider = () => {
    if (Platform.OS === "web") {
      return (
        <View style={styles.volumeSliderContainer}>
          <input
            type="range"
            min="0"
            max="100"
            value={notificationSettings.soundVolume}
            onChange={(e) => updateVolume(parseInt(e.target.value))}
            style={{
              width: "100%",
              height: "8px",
              borderRadius: "4px",
              background: `linear-gradient(to right, #FF9800 0%, #FF9800 ${notificationSettings.soundVolume}%, #555555 ${notificationSettings.soundVolume}%, #555555 100%)`,
              outline: "none",
              appearance: "none",
            }}
          />
          <View style={styles.volumeLabels}>
            <Text style={styles.volumeLabel}>0%</Text>
            <Text style={styles.volumeValue}>
              {notificationSettings.soundVolume}%
            </Text>
            <Text style={styles.volumeLabel}>100%</Text>
          </View>
        </View>
      );
    }

    // Mobile version (simplified for now)
    return (
      <View style={styles.volumeSliderContainer}>
        <View style={styles.volumeLabels}>
          <Text style={styles.volumeLabel}>0%</Text>
          <Text style={styles.volumeValue}>
            {notificationSettings.soundVolume}%
          </Text>
          <Text style={styles.volumeLabel}>100%</Text>
        </View>
        <View style={styles.volumeControls}>
          <TouchableOpacity
            style={styles.volumeButton}
            onPress={() =>
              updateVolume(Math.max(0, notificationSettings.soundVolume - 10))
            }
          >
            <Ionicons name="remove" size={20} color="#FF9800" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.volumeButton}
            onPress={() =>
              updateVolume(Math.min(100, notificationSettings.soundVolume + 10))
            }
          >
            <Ionicons name="add" size={20} color="#FF9800" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: "#2C2C2C" }]}>
      {/* Custom Orange Header */}
      <View style={styles.orangeHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/")}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>& Preferences</Text>
        </View>
        <View style={styles.settingsIconContainer}>
          <Ionicons name="settings" size={24} color="white" />
        </View>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileContainer}>
          {/* Task Statistics */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Task Statistics</Text>
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
            <Text style={styles.sectionTitle}>Default Snooze Duration</Text>
            <Text style={styles.settingDescription}>
              Slide to choose how long to snooze reminders by default
            </Text>
            <CustomSlider />
          </View>

          {/* Notification Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Notification Settings</Text>

            {/* Sound Toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="volume-high" size={20} color="#FF9800" />
                <Text style={styles.settingTitle}>Sound</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  notificationSettings.soundEnabled &&
                    styles.toggleButtonActive,
                ]}
                onPress={() => toggleSetting("soundEnabled")}
              >
                <View
                  style={[
                    styles.toggleCircle,
                    notificationSettings.soundEnabled &&
                      styles.toggleCircleActive,
                  ]}
                />
              </TouchableOpacity>
            </View>

            {/* Volume Control */}
            {notificationSettings.soundEnabled && (
              <View style={styles.volumeSection}>
                <Text style={styles.subSettingTitle}>Sound Volume</Text>
                <VolumeSlider />
              </View>
            )}

            {/* Vibration Toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="phone-portrait" size={20} color="#FF9800" />
                <Text style={styles.settingTitle}>Vibration</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  notificationSettings.vibrationEnabled &&
                    styles.toggleButtonActive,
                ]}
                onPress={() => toggleSetting("vibrationEnabled")}
              >
                <View
                  style={[
                    styles.toggleCircle,
                    notificationSettings.vibrationEnabled &&
                      styles.toggleCircleActive,
                  ]}
                />
              </TouchableOpacity>
            </View>

            {/* Vibration Pattern */}
            {notificationSettings.vibrationEnabled && (
              <View style={styles.vibrationSection}>
                <Text style={styles.subSettingTitle}>Vibration Pattern</Text>
                <View style={styles.patternButtons}>
                  {["short", "long", "pattern"].map((pattern) => (
                    <TouchableOpacity
                      key={pattern}
                      style={[
                        styles.patternButton,
                        notificationSettings.vibrationPattern === pattern &&
                          styles.patternButtonActive,
                      ]}
                      onPress={() => updateVibrationPattern(pattern)}
                    >
                      <Text
                        style={[
                          styles.patternButtonText,
                          notificationSettings.vibrationPattern === pattern &&
                            styles.patternButtonTextActive,
                        ]}
                      >
                        {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Badge Toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications" size={20} color="#FF9800" />
                <Text style={styles.settingTitle}>Show Badge</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  notificationSettings.showBadge && styles.toggleButtonActive,
                ]}
                onPress={() => toggleSetting("showBadge")}
              >
                <View
                  style={[
                    styles.toggleCircle,
                    notificationSettings.showBadge && styles.toggleCircleActive,
                  ]}
                />
              </TouchableOpacity>
            </View>
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
  orangeHeader: {
    backgroundColor: "#FF9800",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50, // Account for status bar
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "white",
    textAlign: "center",
    letterSpacing: 2,
    marginTop: -2,
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    backgroundColor: "#FF9800",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#FFFFFF",
  },
  settingDescription: {
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
    color: "#CCCCCC",
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
    backgroundColor: "#3C3C3C",
    borderColor: "#555555",
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
    color: "#FFFFFF",
  },
  statsTitle: {
    fontSize: 12,
    textAlign: "center",
    color: "#CCCCCC",
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
    color: "#CCCCCC",
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
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
  backButton: {
    padding: 4,
  },
  settingsIconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#555555",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    marginLeft: 12,
  },
  subSettingTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#CCCCCC",
    marginBottom: 10,
    marginTop: 15,
  },
  toggleButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#555555",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleButtonActive: {
    backgroundColor: "#FF9800",
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
  },
  toggleCircleActive: {
    alignSelf: "flex-end",
  },
  volumeSection: {
    marginLeft: 32,
    marginTop: 10,
  },
  volumeSliderContainer: {
    marginTop: 10,
  },
  volumeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  volumeLabel: {
    fontSize: 12,
    color: "#CCCCCC",
  },
  volumeValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF9800",
  },
  volumeControls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 10,
  },
  volumeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3C3C3C",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF9800",
  },
  vibrationSection: {
    marginLeft: 32,
    marginTop: 10,
  },
  patternButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  patternButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#3C3C3C",
    borderWidth: 1,
    borderColor: "#555555",
  },
  patternButtonActive: {
    backgroundColor: "#FF9800",
    borderColor: "#FF9800",
  },
  patternButtonText: {
    fontSize: 14,
    color: "#CCCCCC",
    fontWeight: "500",
  },
  patternButtonTextActive: {
    color: "#FFFFFF",
  },
});
