import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
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
import { saveReminder, updateReminderNotificationId } from "./utils/storage";

// Only import DateTimePicker on native platforms
let DateTimePicker;
if (Platform.OS !== "web") {
  DateTimePicker = require("@react-native-community/datetimepicker").default;
}

export default function CreateReminder() {
  const { theme } = useTheme();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
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

      // Save the reminder first
      const savedReminder = await saveReminder(reminderData);

      // Schedule notification for the reminder
      const notificationId = await notificationService.scheduleNotification(
        savedReminder
      );

      // Update reminder with notification ID if scheduled successfully
      if (notificationId) {
        await updateReminderNotificationId(savedReminder.id, notificationId);
        console.log(`Notification scheduled with ID: ${notificationId}`);
      }

      Alert.alert("Success", "Reminder created successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Clear form and navigate back
            setTitle("");
            setDescription("");
            setDate(new Date());
            setTime(new Date());
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error("Error saving reminder:", error);
      Alert.alert("Error", "Failed to save reminder. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(currentDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(currentTime);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString();
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Web-specific handlers
  const handleWebDateChange = (event) => {
    const newDate = new Date(event.target.value + "T00:00:00");
    setDate(newDate);
  };

  const handleWebTimeChange = (event) => {
    const [hours, minutes] = event.target.value.split(":");
    const newTime = new Date();
    newTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    setTime(newTime);
  };

  const getDateInputValue = () => {
    return date.toISOString().split("T")[0];
  };

  const getTimeInputValue = () => {
    return time.toTimeString().slice(0, 5);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Create Reminder" showMenu={false} />
      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <Text style={[styles.label, { color: theme.text }]}>Title *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter reminder title"
            placeholderTextColor={theme.textSecondary}
          />

          <Text style={[styles.label, { color: theme.text }]}>Description</Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter reminder description"
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={4}
          />

          <Text style={[styles.label, { color: theme.text }]}>Date</Text>
          {Platform.OS === "web" ? (
            <View
              style={[
                styles.dateTimeButton,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <Ionicons name="calendar-outline" size={20} color={theme.text} />
              <input
                type="date"
                value={getDateInputValue()}
                onChange={handleWebDateChange}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  color: theme.text,
                  fontSize: 16,
                  marginLeft: 12,
                  flex: 1,
                  outline: "none",
                }}
              />
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.dateTimeButton,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => {
                  console.log("Date picker button pressed");
                  setShowDatePicker(true);
                }}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={theme.text}
                />
                <Text style={[styles.dateTimeText, { color: theme.text }]}>
                  {formatDate(date)}
                </Text>
              </TouchableOpacity>

              {showDatePicker && DateTimePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onDateChange}
                />
              )}
            </>
          )}

          <Text style={[styles.label, { color: theme.text }]}>Time</Text>
          {Platform.OS === "web" ? (
            <View
              style={[
                styles.dateTimeButton,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <Ionicons name="time-outline" size={20} color={theme.text} />
              <input
                type="time"
                value={getTimeInputValue()}
                onChange={handleWebTimeChange}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  color: theme.text,
                  fontSize: 16,
                  marginLeft: 12,
                  flex: 1,
                  outline: "none",
                }}
              />
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.dateTimeButton,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => {
                  console.log("Time picker button pressed");
                  setShowTimePicker(true);
                }}
              >
                <Ionicons name="time-outline" size={20} color={theme.text} />
                <Text style={[styles.dateTimeText, { color: theme.text }]}>
                  {formatTime(time)}
                </Text>
              </TouchableOpacity>

              {showTimePicker && DateTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onTimeChange}
                  is24Hour={false}
                />
              )}
            </>
          )}

          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: saving ? theme.border : theme.primary,
                opacity: saving ? 0.7 : 1,
              },
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            <Ionicons
              name={saving ? "hourglass" : "checkmark"}
              size={20}
              color="white"
            />
            <Text style={styles.saveButtonText}>
              {saving ? "Saving..." : "Save Reminder"}
            </Text>
          </TouchableOpacity>
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
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: "top",
    minHeight: 100,
  },
  dateTimeButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 50,
  },
  dateTimeText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  saveButton: {
    marginTop: 30,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
