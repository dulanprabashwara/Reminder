import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTheme } from "../contexts/ThemeContext";

function CustomDrawerContent(props) {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();

  const navigateToScreen = (screenName) => {
    props.navigation.closeDrawer();
    router.push(screenName);
  };

  return (
    <View style={[styles.drawerContent, { backgroundColor: theme.background }]}>
      {/* Orange Header */}
      <View style={styles.drawerHeader}>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="alarm" size={42} color="white" />
          </View>
          <View style={styles.appNameContainer}>
            <Text style={styles.appTitle}>Daily</Text>
            <Text style={styles.appSubtitle}>Reminder</Text>
          </View>
          {/* Theme Toggle Button */}
          <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
            <Ionicons
              name={isDark ? "sunny" : "moon"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Items */}
      <View style={styles.drawerItems}>
        {/* Create Reminder Button */}
        <TouchableOpacity
          style={[styles.drawerItem, { backgroundColor: theme.surface }]}
          onPress={() => navigateToScreen("/create-reminder")}
        >
          <Ionicons name="add-circle-outline" size={24} color={theme.text} />
          <Text style={[styles.drawerItemText, { color: theme.text }]}>
            Create Reminder
          </Text>
        </TouchableOpacity>

        {/* Privacy Policy Button */}
        <TouchableOpacity
          style={[styles.drawerItem, { backgroundColor: theme.surface }]}
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
          style={[styles.drawerItem, { backgroundColor: theme.surface }]}
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

        {/* Settings Button */}
        <TouchableOpacity
          style={[styles.drawerItem, { backgroundColor: theme.surface }]}
          onPress={() => navigateToScreen("/profile")}
        >
          <Ionicons name="settings-outline" size={24} color={theme.text} />
          <Text style={[styles.drawerItemText, { color: theme.text }]}>
            Settings
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
  return <DrawerLayoutContent />;
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    backgroundColor: "#FF9800",
    paddingTop: 55,
    paddingBottom: 25,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 60,
  },
  iconContainer: {
    padding: 4,
    marginRight: 4,
  },
  appNameContainer: {
    marginLeft: 16,
    flex: 1,
    alignItems: "center",
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    letterSpacing: 1.5,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    lineHeight: 28,
  },
  appSubtitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    letterSpacing: 1.5,
    marginTop: -2,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    lineHeight: 28,
  },
  themeToggle: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  drawerItems: {
    flex: 1,
    padding: 20,
    paddingTop: 30,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 6,
    backgroundColor: "#3C3C3C",
  },
  drawerItemText: {
    fontSize: 16,
    marginLeft: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});
