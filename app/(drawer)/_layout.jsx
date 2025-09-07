import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

function CustomDrawerContent(props) {
  const router = useRouter();

  const navigateToScreen = (screenName) => {
    props.navigation.closeDrawer();
    router.push(screenName);
  };

  return (
    <View style={[styles.drawerContent, { backgroundColor: "#2C2C2C" }]}>
      {/* Orange Header */}
      <View style={styles.drawerHeader}>
        <View style={styles.headerContent}>
          <Ionicons name="alarm" size={40} color="white" />
          <View style={styles.appNameContainer}>
            <Text style={styles.appTitle}>Daily</Text>
            <Text style={styles.appSubtitle}>Reminder</Text>
          </View>
        </View>
      </View>

      {/* Navigation Items */}
      <View style={styles.drawerItems}>
        {/* Create Reminder Button */}
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => navigateToScreen("/create-reminder")}
        >
          <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
          <Text style={styles.drawerItemText}>Create Reminder</Text>
        </TouchableOpacity>

        {/* Privacy Policy Button */}
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => navigateToScreen("/privacy-policy")}
        >
          <Ionicons name="shield-checkmark-outline" size={24} color="#FFFFFF" />
          <Text style={styles.drawerItemText}>Privacy Policy</Text>
        </TouchableOpacity>

        {/* About Us Button */}
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => navigateToScreen("/about-us")}
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.drawerItemText}>About Us</Text>
        </TouchableOpacity>

        {/* Settings Button */}
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => navigateToScreen("/profile")}
        >
          <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
          <Text style={styles.drawerItemText}>Settings</Text>
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  appNameContainer: {
    marginLeft: 16,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  appSubtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "white",
    letterSpacing: 2,
    marginTop: -2,
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
