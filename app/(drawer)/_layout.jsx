import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTheme } from "../contexts/ThemeContext";

function CustomDrawerContent(props) {
  const { theme, isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const navigateToScreen = (screenName) => {
    props.navigation.closeDrawer();
    router.push(screenName);
  };

  return (
    <View style={[styles.drawerContent, { backgroundColor: theme.surface }]}>
      {/* Theme Toggle in Top Right Corner */}
      <View style={styles.themeToggleContainer}>
        <View style={[styles.themeToggleCorner]}>
          <Ionicons
            name={isDark ? "moon" : "sunny"}
            size={20}
            color={theme.text}
            style={styles.themeIcon}
          />
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isDark ? "#f5dd4b" : "#f4f3f4"}
            style={styles.themeSwitch}
          />
        </View>
      </View>

      {/* Navigation Items */}
      <View style={styles.drawerItems}>
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
  themeToggleContainer: {
    paddingTop: 50,
    paddingRight: 20,
    alignItems: "flex-end",
  },
  themeToggleCorner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  themeIcon: {
    marginRight: 5,
  },
  themeSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  drawerItems: {
    flex: 1,
    padding: 20,
    paddingTop: 10,
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
});
