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
import notificationService from "./services/notificationService";
import { updateReminder, updateReminderNotificationId } from "./utils/storage";

// Only import DateTimePicker on native platforms
let DateTimePicker;
if (Platform.OS !== "web") {
  DateTimePicker = require("@react-native-community/datetimepicker").default;
}

export default function EditReminder() {
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
        id: params.id,
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

      // Update the reminder
      await updateReminder(reminderData.id, reminderData);

      // Cancel existing notification if it exists
      if (params.notificationId) {
        await notificationService.cancelNotification(params.notificationId);
      }

      // Schedule new notification
      const notificationId = await notificationService.scheduleNotification(
        reminderData
      );

      // Update reminder with new notification ID
      if (notificationId) {
        await updateReminderNotificationId(reminderData.id, notificationId);
      }

      Alert.alert("Success", "Reminder updated successfully!", [
        {
          text: "OK",
          onPress: () => router.push("/(drawer)"),
        },
      ]);
    } catch (error) {
      console.error("Error updating reminder:", error);
      Alert.alert("Error", "Failed to update reminder. Please try again.");
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

  return (
    <View style={[styles.container, { backgroundColor: "#2C2C2C" }]}>
      {/* Custom Orange Header */}
      <View style={styles.orangeHeader}>
        <TouchableOpacity onPress={() => router.push("/(drawer)")}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Edit</Text>
          <Text style={styles.headerSubtitle}>Reminder</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={(text) => {
                console.log("Title changed to:", text);
                setTitle(text);
              }}
              placeholder="Enter reminder title"
              placeholderTextColor="#CCCCCC"
              maxLength={100}
              editable={true}
              selectTextOnFocus={true}
            />
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              value={description}
              onChangeText={(text) => {
                console.log("Description changed to:", text);
                setDescription(text);
              }}
              placeholder="Enter description"
              placeholderTextColor="#CCCCCC"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
              editable={true}
              selectTextOnFocus={true}
            />
          </View>

          {/* Date Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date *</Text>
            {Platform.OS === "web" ? (
              <input
                type="date"
                value={date.toISOString().split("T")[0]}
                onChange={(e) => setDate(new Date(e.target.value))}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  border: "1px solid #555555",
                  backgroundColor: "#3C3C3C",
                  color: "#FFFFFF",
                  fontSize: 16,
                }}
              />
            ) : (
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
                <Text style={styles.dateTimeText}>
                  {date.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Time Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Time *</Text>
            {Platform.OS === "web" ? (
              <input
                type="time"
                value={time.toTimeString().slice(0, 5)}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(":");
                  const newTime = new Date(time);
                  newTime.setHours(parseInt(hours), parseInt(minutes));
                  setTime(newTime);
                }}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  border: "1px solid #555555",
                  backgroundColor: "#3C3C3C",
                  color: "#FFFFFF",
                  fontSize: 16,
                }}
              />
            ) : (
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color="#FFFFFF" />
                <Text style={styles.dateTimeText}>
                  {time.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Update Button */}
          <TouchableOpacity
            style={[styles.updateButton, { opacity: saving ? 0.7 : 1 }]}
            onPress={handleUpdate}
            disabled={saving}
          >
            <Ionicons
              name={saving ? "hourglass" : "checkmark"}
              size={20}
              color="white"
            />
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
    color: "#FFFFFF",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: "System",
    backgroundColor: "#3C3C3C",
    color: "#FFFFFF",
    borderColor: "#555555",
    minHeight: 50,
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
    backgroundColor: "#3C3C3C",
    borderColor: "#555555",
  },
  dateTimeText: {
    fontSize: 16,
    flex: 1,
    color: "#FFFFFF",
  },
  updateButton: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#FF9800",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  updateButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
});
