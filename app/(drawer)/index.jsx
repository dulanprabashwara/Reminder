import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../components/Header";
import { useTheme } from "../contexts/ThemeContext";
import notificationService from "../services/notificationService";
import {
  deleteReminder,
  getReminderById,
  getReminders,
} from "../utils/storage";

export default function Homescreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [reminders, setReminders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadReminders = async () => {
    try {
      console.log("Loading reminders...");
      const savedReminders = await getReminders();
      console.log("Loaded reminders:", savedReminders);
      setReminders(savedReminders);
    } catch (error) {
      console.error("Error loading reminders:", error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReminders();
    setRefreshing(false);
  }, []);

  const handleEditReminder = (item) => {
    router.push({
      pathname: "/edit-reminder",
      params: {
        id: item.id,
        title: item.title,
        description: item.description || "",
        date: item.date,
        time: item.time,
      },
    });
  };

  const handleDelete = async (id) => {
    try {
      // Get reminder to check for notification ID
      const reminder = await getReminderById(id);

      // Cancel notification if it exists
      if (reminder && reminder.notificationId) {
        await notificationService.cancelNotification(reminder.notificationId);
        console.log(
          `Cancelled notification ${reminder.notificationId} for deleted reminder`
        );
      }

      await deleteReminder(id);
      await loadReminders();
    } catch (error) {
      console.error("Error deleting reminder:", error);
    }
  };

  // Load reminders when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadReminders();
    }, [])
  );

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return (
      date.toLocaleDateString() +
      " at " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const isOverdue = (dateTime) => {
    return new Date(dateTime) < new Date();
  };

  const isToday = (dateTime) => {
    const today = new Date();
    const reminderDate = new Date(dateTime);
    return today.toDateString() === reminderDate.toDateString();
  };

  const categorizeReminders = () => {
    const now = new Date();
    const today = [];
    const upcoming = [];
    const previous = [];

    reminders.forEach((reminder) => {
      const reminderDate = new Date(reminder.dateTime);

      if (isToday(reminder.dateTime)) {
        today.push(reminder);
      } else if (reminderDate > now) {
        upcoming.push(reminder);
      } else {
        previous.push(reminder);
      }
    });

    // Sort each category
    const sortByDateTime = (a, b) =>
      new Date(a.dateTime) - new Date(b.dateTime);
    today.sort(sortByDateTime);
    upcoming.sort(sortByDateTime);
    previous.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime)); // Recent first for previous

    const sections = [];
    if (today.length > 0) {
      sections.push({ title: "Today", data: today });
    }
    if (upcoming.length > 0) {
      sections.push({ title: "Upcoming", data: upcoming });
    }
    if (previous.length > 0) {
      sections.push({ title: "Previous", data: previous });
    }

    return sections;
  };

  const handleCreateReminder = () => {
    router.push("/create-reminder");
  };

  const handleSettingsPress = () => {
    router.push("/profile");
  };

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={[styles.sectionHeader, { backgroundColor: theme.background }]}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
    </View>
  );

  const renderReminder = ({ item }) => (
    <View
      style={[
        styles.reminderItem,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.reminderContent}
        onPress={() => handleEditReminder(item)}
      >
        <View style={styles.reminderHeader}>
          <Text
            style={[
              styles.reminderTitle,
              {
                color: theme.text,
              },
            ]}
          >
            {item.title}
          </Text>
        </View>

        {item.description ? (
          <Text
            style={[styles.reminderDescription, { color: theme.textSecondary }]}
          >
            {item.description}
          </Text>
        ) : null}

        <View style={styles.reminderFooter}>
          <Text
            style={[
              styles.reminderDateTime,
              {
                color: isOverdue(item.dateTime)
                  ? "#FF5722"
                  : theme.textSecondary,
              },
            ]}
          >
            {formatDateTime(item.dateTime)}
            {isOverdue(item.dateTime) && " (Overdue)"}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#FF5722" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Daily Reminder"
        showMenu={true}
        onprofilepress={handleSettingsPress}
      />
      <View style={styles.content}>
        {reminders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="alarm-outline"
              size={80}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No reminders yet
            </Text>
            <Text style={[styles.emptySubText, { color: theme.textSecondary }]}>
              Create your first reminder to get started
            </Text>
          </View>
        ) : (
          <SectionList
            sections={categorizeReminders()}
            renderItem={renderReminder}
            renderSectionHeader={renderSectionHeader}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: "#000000" }]}
        onPress={handleCreateReminder}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: "600",
    marginTop: 20,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  listContainer: {
    padding: 16,
  },
  reminderItem: {
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  reminderContent: {
    flex: 1,
    padding: 16,
  },
  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    marginRight: 12,
  },
  reminderDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  reminderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reminderDateTime: {
    fontSize: 12,
    fontWeight: "500",
  },
  deleteButton: {
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
