import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";

function CustomDrawerContent(props) {
  const { theme, isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logout pressed");
    // For example: clear user data, navigate to login screen
  };

  const navigateToScreen = (screenName) => {
    props.navigation.closeDrawer();
    router.push(screenName);
  };

  return (
    <View style={[styles.drawerContent, { backgroundColor: theme.surface }]}>
      {/* Profile Header */}
      <View
        style={[
          styles.drawerHeader,
          {
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <Ionicons name="person-circle" size={60} color={theme.text} />
        <Text style={[styles.drawerHeaderText, { color: theme.text }]}>
          Welcome User
        </Text>
      </View>

      {/* Navigation Items */}
      <View style={styles.drawerItems}>
        {/* Theme Toggle */}
        <View style={[styles.drawerItem, styles.themeToggle]}>
          <View style={styles.themeToggleLeft}>
            <Ionicons
              name={isDark ? "moon" : "sunny"}
              size={24}
              color={theme.text}
            />
            <Text style={[styles.drawerItemText, { color: theme.text }]}>
              {isDark ? "Dark Mode" : "Light Mode"}
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isDark ? "#f5dd4b" : "#f4f3f4"}
          />
        </View>
        {/* Create Reminder Button */}
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => navigateToScreen("/create-reminder")}
        >
          <Ionicons name="add-circle-outline" size={24} color={theme.text} />
          <Text style={[styles.drawerItemText, { color: theme.text }]}>
            Create Reminder
          </Text>
        </TouchableOpacity>

        {/* Privacy Policy Button */}
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => navigateToScreen("/privacy-policy")}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={24}
            color={theme.text}
          />
          <Text style={[styles.drawerItemText, { color: theme.text }]}>
            Privacy Policy
          </Text>
        </TouchableOpacity>

        {/* About Us Button */}
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => navigateToScreen("/about-us")}
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={theme.text}
          />
          <Text style={[styles.drawerItemText, { color: theme.text }]}>
            About Us
          </Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.drawerItem, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#ff4444" />
          <Text style={[styles.drawerItemText, { color: "#ff4444" }]}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DrawerLayoutContent() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            width: 280,
          },
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: "Home",
            title: "Home",
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

export default function DrawerLayout() {
  return (
    <DrawerLayoutContent />
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    padding: 30,
    alignItems: "center",
    borderBottomWidth: 1,
  },
  drawerHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  drawerItems: {
    flex: 1,
    padding: 20,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  drawerItemText: {
    fontSize: 16,
    marginLeft: 15,
    fontWeight: "500",
  },
  themeToggle: {
    justifyContent: "space-between",
  },
  themeToggleLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutButton: {
    marginTop: "auto",
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 20,
  },
});
