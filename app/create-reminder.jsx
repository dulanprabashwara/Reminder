import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "./components/Header";
import { useTheme } from "./contexts/ThemeContext";

export default function CreateReminder() {
  const { theme } = useTheme();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a reminder title");
      return;
    }

    // Add your save reminder logic here
    console.log("Saving reminder:", { title, description, date, time });
    Alert.alert("Success", "Reminder created successfully!");

    // Clear form
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
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
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={date}
            onChangeText={setDate}
            placeholder="DD/MM/YYYY"
            placeholderTextColor={theme.textSecondary}
          />

          <Text style={[styles.label, { color: theme.text }]}>Time</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={time}
            onChangeText={setTime}
            placeholder="HH:MM"
            placeholderTextColor={theme.textSecondary}
          />

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={handleSave}
          >
            <Ionicons name="checkmark" size={20} color="white" />
            <Text style={styles.saveButtonText}>Save Reminder</Text>
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
