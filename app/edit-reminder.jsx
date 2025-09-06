import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "./components/Header";
import { useTheme } from "./contexts/ThemeContext";
import notificationService from "./services/notificationService";
import {
  getReminderById,
  updateReminder,
  updateReminderNotificationId,
} from "./utils/storage";

// Only import DateTimePicker on native platforms
let DateTimePicker;
if (Platform.OS !== "web") {
  DateTimePicker = require("@react-native-community/datetimepicker").default;
}

export default function EditReminder() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load existing reminder data from params
    if (params.title) setTitle(params.title);
    if (params.description) setDescription(params.description);

    if (params.date && params.time) {
      const reminderDate = new Date(params.date);
      setDate(reminderDate);

      const [hours, minutes] = params.time.split(":");
      const reminderTime = new Date();
      reminderTime.setHours(parseInt(hours), parseInt(minutes));
      setTime(reminderTime);
    }
  }, [params]);

  const handleUpdate = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a reminder title");
      return;
    }

    setSaving(true);
    try {
      const reminderData = {
        title: title.trim(),
        description: description.trim(),
        date: date.toISOString().split("T")[0], // YYYY-MM-DD format
        time: time.toTimeString().slice(0, 5), // HH:MM format
        dateTime: new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          time.getHours(),
          time.getMinutes()
        ).toISOString(),
      };

      console.log("Updating reminder with data:", reminderData);

      // Get existing reminder to check for notification ID
      const existingReminder = await getReminderById(params.id);

      // Cancel existing notification if it exists
      if (existingReminder && existingReminder.notificationId) {
        await notificationService.cancelNotification(
          existingReminder.notificationId
        );
      }

      // Update the reminder
      const updatedReminder = await updateReminder(params.id, reminderData);

      // Schedule new notification
      const notificationId = await notificationService.scheduleNotification(
        updatedReminder
      );

      // Update reminder with new notification ID if scheduled successfully
      if (notificationId) {
        await updateReminderNotificationId(params.id, notificationId);
        console.log(`New notification scheduled with ID: ${notificationId}`);
      }

      console.log("Reminder updated successfully");
      router.back();
    } catch (error) {
      console.error("Error updating reminder:", error);
      Alert.alert("Error", "Failed to update reminder. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString();
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Edit Reminder" showMenu={false} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Title *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter reminder title"
              placeholderTextColor={theme.textSecondary}
              maxLength={100}
            />
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>
              Description (Optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.descriptionInput,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description"
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
          </View>

          {/* Date Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Date *</Text>
            {Platform.OS === "web" ? (
              <input
                type="date"
                value={date.toISOString().split("T")[0]}
                onChange={(e) => setDate(new Date(e.target.value))}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  border: `1px solid ${theme.border}`,
                  backgroundColor: theme.surface,
                  color: theme.text,
                  fontSize: 16,
                  fontFamily: "inherit",
                }}
              />
            ) : (
              <TouchableOpacity
                style={[
                  styles.dateTimeButton,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={theme.textSecondary}
                />
                <Text style={[styles.dateTimeText, { color: theme.text }]}>
                  {formatDate(date)}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Time Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Time *</Text>
            {Platform.OS === "web" ? (
              <input
                type="time"
                value={time.toTimeString().slice(0, 5)}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(":");
                  const newTime = new Date();
                  newTime.setHours(parseInt(hours), parseInt(minutes));
                  setTime(newTime);
                }}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  border: `1px solid ${theme.border}`,
                  backgroundColor: theme.surface,
                  color: theme.text,
                  fontSize: 16,
                  fontFamily: "inherit",
                }}
              />
            ) : (
              <TouchableOpacity
                style={[
                  styles.dateTimeButton,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={theme.textSecondary}
                />
                <Text style={[styles.dateTimeText, { color: theme.text }]}>
                  {formatTime(time)}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Update Button */}
          <TouchableOpacity
            style={[
              styles.updateButton,
              {
                backgroundColor: theme.primary || "#007AFF",
                opacity: saving ? 0.7 : 1,
              },
            ]}
            onPress={handleUpdate}
            disabled={saving}
          >
            <Text style={styles.updateButtonText}>
              {saving ? "Updating..." : "Update Reminder"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Picker (Native only) */}
      {Platform.OS !== "web" && showDatePicker && DateTimePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker (Native only) */}
      {Platform.OS !== "web" && showTimePicker && DateTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}
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
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: "System",
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: "top",
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  dateTimeText: {
    fontSize: 16,
    flex: 1,
  },
  updateButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  updateButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
