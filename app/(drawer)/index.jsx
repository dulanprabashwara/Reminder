import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import notificationService from "../services/notificationService";
import {
  deleteReminder,
  getReminderById,
  getReminders,
} from "../utils/storage";

export default function Home() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const router = useRouter();
  const navigation = useNavigation();
  const [reminders, setReminders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredReminders, setFilteredReminders] = useState([]);

  const handleMenuPress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleMoreOptions = () => {
    Alert.alert("More Options", "Choose an option", [
      { text: "Settings", onPress: () => router.push("/profile") },
      { text: "About", onPress: () => router.push("/about-us") },
      { text: "Privacy Policy", onPress: () => router.push("/privacy-policy") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSearch = () => {
    setIsSearching(!isSearching);
    if (isSearching) {
      // If closing search, clear the search query
      setSearchQuery("");
      setFilteredReminders([]);
    }
  };

  const handleSearchQueryChange = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredReminders([]);
      return;
    }

    // Filter reminders by title (case insensitive)
    const filtered = reminders.filter((reminder) =>
      reminder.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredReminders(filtered);
  };

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
        notificationId: item.notificationId || "",
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
    // Use filtered reminders when searching, otherwise use all reminders
    const remindersToShow =
      isSearching && searchQuery.trim() !== "" ? filteredReminders : reminders;

    // If searching, return simple format without categorization
    if (isSearching && searchQuery.trim() !== "") {
      if (filteredReminders.length === 0) {
        return [{ title: "Search Results", data: [] }];
      }
      return [
        {
          title: `Search Results (${filteredReminders.length})`,
          data: filteredReminders,
        },
      ];
    }

    const now = new Date();
    const today = [];
    const upcoming = [];
    const previous = [];

    remindersToShow.forEach((reminder) => {
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
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderReminder = ({ item }) => {
    const isOverdueItem = isOverdue(item.dateTime);
    const sectionType = isToday(item.dateTime)
      ? "today"
      : new Date(item.dateTime) > new Date()
      ? "upcoming"
      : "past";

    // Color coding for different priorities/categories
    const getColorIndicator = (section) => {
      switch (section) {
        case "today":
          return "#FF9800"; // Orange for today
        case "upcoming":
          return "#4CAF50"; // Green for upcoming
        case "past":
          return "#9E9E9E"; // Gray for past
        default:
          return "#2196F3"; // Blue default
      }
    };

    return (
      <View style={styles.reminderCard}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => handleEditReminder(item)}
          activeOpacity={0.7}
        >
          <View style={styles.leftSection}>
            <Ionicons name="notifications" size={18} color="#FF9800" />
            <View style={styles.reminderInfo}>
              <Text
                style={styles.reminderTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.title}
              </Text>
              <View style={styles.dateTimeContainer}>
                <Ionicons name="calendar" size={12} color="#FF9800" />
                <Text style={styles.dateText}>
                  {new Date(item.dateTime).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
                <Ionicons
                  name="time"
                  size={12}
                  color="#FF9800"
                  style={styles.timeIcon}
                />
                <Text style={styles.timeText}>
                  {new Date(item.dateTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              {item.description && (
                <Text
                  style={styles.reminderDescription}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item.description}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.rightSection}>
            <View
              style={[
                styles.colorIndicator,
                { backgroundColor: getColorIndicator(sectionType) },
              ]}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={16} color="#FF5722" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View
      style={[
        getStyles(theme).container,
        { backgroundColor: theme.background },
      ]}
    >
      {/* Custom Orange Header */}
      <View style={getStyles(theme).orangeHeader}>
        <TouchableOpacity onPress={handleMenuPress}>
          <Ionicons name="menu" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Daily Reminder</Text>
        </View>
        <View style={styles.headerRightIcons}>
          <TouchableOpacity style={styles.headerIcon} onPress={handleSearch}>
            <Ionicons
              name={isSearching ? "close" : "search"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={handleSettingsPress}
          >
            <Ionicons name="settings" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={handleMoreOptions}
          >
            <Ionicons name="ellipsis-vertical" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
      {isSearching && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#FF9800"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search reminders by title..."
              placeholderTextColor="#CCCCCC"
              value={searchQuery}
              onChangeText={handleSearchQueryChange}
              autoFocus={true}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setFilteredReminders([]);
                }}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#CCCCCC" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <View style={styles.content}>
        {reminders.length === 0 && !isSearching ? (
          <View style={styles.emptyState}>
            <Ionicons name="alarm-outline" size={80} color="#888" />
            <Text style={styles.emptyText}>No reminders yet</Text>
            <Text style={styles.emptySubText}>
              Create your first reminder to get started
            </Text>
          </View>
        ) : isSearching &&
          searchQuery.trim() !== "" &&
          filteredReminders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={80} color="#888" />
            <Text style={styles.emptyText}>No results found</Text>
            <Text style={styles.emptySubText}>
              Try searching with different keywords
            </Text>
          </View>
        ) : (
          <SectionList
            style={{ flex: 1 }}
            sections={categorizeReminders()}
            renderItem={renderReminder}
            renderSectionHeader={renderSectionHeader}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={true}
            scrollEventThrottle={16}
            removeClippedSubviews={true}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={10}
          />
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleCreateReminder}>
        <Ionicons name="notifications" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
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
    headerRightIcons: {
      flexDirection: "row",
      alignItems: "center",
    },
    headerIcon: {
      marginLeft: 16,
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
      color: theme.text,
    },
    emptySubText: {
      fontSize: 16,
      marginTop: 8,
      textAlign: "center",
      color: theme.textSecondary,
    },
    listContainer: {
      paddingVertical: 8,
      paddingBottom: 100, // Extra padding for FAB
    },
    sectionHeader: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      backgroundColor: theme.background,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 8,
    },
    reminderCard: {
      backgroundColor: theme.surface,
      borderRadius: 8,
      marginHorizontal: 16,
      marginVertical: 4,
      padding: 12,
      elevation: 2,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    cardContent: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    leftSection: {
      flex: 1,
      flexDirection: "row",
      alignItems: "flex-start",
    },
    reminderInfo: {
      flex: 1,
      marginLeft: 8,
    },
    reminderTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 4,
    },
    dateTimeContainer: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      marginBottom: 2,
    },
    dateText: {
      fontSize: 12,
      color: "#FF9800",
      marginLeft: 4,
      marginRight: 12,
    },
    timeIcon: {
      marginLeft: 4,
    },
    timeText: {
      fontSize: 12,
      color: "#FF9800",
      marginLeft: 4,
    },
    reminderDescription: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
      numberOfLines: 2,
    },
    rightSection: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 40,
    },
    colorIndicator: {
      width: 4,
      height: 30,
      borderRadius: 2,
    },
    deleteButton: {
      position: "absolute",
      top: 8,
      right: 8,
      padding: 4,
      borderRadius: 12,
      backgroundColor: "rgba(255, 87, 34, 0.1)",
    },
    fab: {
      position: "absolute",
      bottom: 30,
      right: 30,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: "#FF9800",
      justifyContent: "center",
      alignItems: "center",
      elevation: 6,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    searchContainer: {
      backgroundColor: theme.background,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    searchInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
      paddingVertical: 8,
    },
    clearButton: {
      marginLeft: 8,
      padding: 4,
    },
    sectionHeader: {
      paddingVertical: 12,
      paddingHorizontal: 4,
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
    headerRightIcons: {
      flexDirection: "row",
      alignItems: "center",
    },
    headerIcon: {
      marginLeft: 16,
    },
  });
