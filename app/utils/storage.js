import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const REMINDERS_KEY = "reminders";

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
  removeItem: async (key) => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  },
};

// Use localStorage for web, AsyncStorage for native
const storage = Platform.OS === "web" ? webStorage : AsyncStorage;

// Generate unique ID for reminders
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Get all reminders from storage
export const getReminders = async () => {
  try {
    console.log("Getting reminders from storage...");
    const remindersJson = await storage.getItem(REMINDERS_KEY);
    console.log("Raw reminders JSON:", remindersJson);
    const reminders = remindersJson ? JSON.parse(remindersJson) : [];
    console.log("Parsed reminders:", reminders);
    return reminders;
  } catch (error) {
    console.error("Error getting reminders:", error);
    return [];
  }
};

// Save a new reminder
export const saveReminder = async (reminderData) => {
  try {
    console.log("Saving reminder:", reminderData);
    const existingReminders = await getReminders();
    console.log("Existing reminders:", existingReminders);
    const newReminder = {
      id: generateId(),
      ...reminderData,
      createdAt: new Date().toISOString(),
      completed: false,
    };
    console.log("New reminder to save:", newReminder);

    const updatedReminders = [...existingReminders, newReminder];
    console.log("Updated reminders array:", updatedReminders);
    await storage.setItem(REMINDERS_KEY, JSON.stringify(updatedReminders));
    console.log("Reminder saved successfully");
    return newReminder;
  } catch (error) {
    console.error("Error saving reminder:", error);
    throw error;
  }
};

// Update an existing reminder
export const updateReminder = async (id, updates) => {
  try {
    console.log("UpdateReminder called with:", { id, updates });
    const reminders = await getReminders();
    console.log("Current reminders before update:", reminders);

    const updatedReminders = reminders.map((reminder) =>
      reminder.id === id ? { ...reminder, ...updates } : reminder
    );

    console.log("Updated reminders array:", updatedReminders);
    await storage.setItem(REMINDERS_KEY, JSON.stringify(updatedReminders));

    const updatedReminder = updatedReminders.find(
      (reminder) => reminder.id === id
    );
    console.log("Final updated reminder:", updatedReminder);

    return updatedReminder;
  } catch (error) {
    console.error("Error updating reminder:", error);
    throw error;
  }
};

// Delete a reminder
export const deleteReminder = async (id) => {
  try {
    const reminders = await getReminders();
    const filteredReminders = reminders.filter(
      (reminder) => reminder.id !== id
    );
    await storage.setItem(REMINDERS_KEY, JSON.stringify(filteredReminders));
    return true;
  } catch (error) {
    console.error("Error deleting reminder:", error);
    throw error;
  }
};

// Clear all reminders (for testing purposes)
export const clearAllReminders = async () => {
  try {
    await AsyncStorage.removeItem(REMINDERS_KEY);
    return true;
  } catch (error) {
    console.error("Error clearing reminders:", error);
    throw error;
  }
};

// Get reminders by status
export const getRemindersByStatus = async (completed = false) => {
  try {
    const allReminders = await getReminders();
    return allReminders.filter((reminder) => reminder.completed === completed);
  } catch (error) {
    console.error("Error getting reminders by status:", error);
    return [];
  }
};

// Get upcoming reminders (not completed and future date/time)
export const getUpcomingReminders = async () => {
  try {
    const allReminders = await getReminders();
    const now = new Date();

    return allReminders.filter((reminder) => {
      if (reminder.completed) return false;

      // Combine date and time to check if it's in the future
      const reminderDateTime = new Date(`${reminder.date}T${reminder.time}`);
      return reminderDateTime > now;
    });
  } catch (error) {
    console.error("Error getting upcoming reminders:", error);
    return [];
  }
};

// Save snooze time preference
export const saveSnoozeTime = async (minutes) => {
  try {
    await storage.setItem("snooze_time", minutes.toString());
  } catch (error) {
    console.error("Error saving snooze time:", error);
  }
};

// Get snooze time preference (default to 5 minutes)
export const getSnoozeTime = async () => {
  try {
    const snoozeTime = await storage.getItem("snooze_time");
    return snoozeTime ? parseInt(snoozeTime) : 5;
  } catch (error) {
    console.error("Error getting snooze time:", error);
    return 5; // Default to 5 minutes
  }
};

// Update reminder with notification ID
export const updateReminderNotificationId = async (
  reminderId,
  notificationId
) => {
  try {
    const reminders = await getReminders();
    const updatedReminders = reminders.map((reminder) =>
      reminder.id === reminderId ? { ...reminder, notificationId } : reminder
    );

    await storage.setItem(REMINDERS_KEY, JSON.stringify(updatedReminders));
    return true;
  } catch (error) {
    console.error("Error updating reminder notification ID:", error);
    return false;
  }
};

// Get reminder by ID
export const getReminderById = async (id) => {
  try {
    const reminders = await getReminders();
    return reminders.find((reminder) => reminder.id === id);
  } catch (error) {
    console.error("Error getting reminder by ID:", error);
    return null;
  }
};
