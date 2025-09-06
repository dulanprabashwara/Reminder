import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

const Header = ({
  title,
  onprofilepress,
  showMenu = false,
  showProfile = true,
}) => {
  const navigation = useNavigation();
  const router = useRouter();
  const { theme } = useTheme();

  const handleMenuPress = () => {
    console.log("Menu button pressed");
    console.log("Navigation object:", navigation);
    console.log("openDrawer function exists:", !!navigation.openDrawer);

    if (navigation.openDrawer) {
      console.log("Calling openDrawer...");
      navigation.openDrawer();
    } else {
      console.log("openDrawer function not available");
    }
  };

  const handleBackPress = () => {
    console.log("Back button pressed");

    // Try expo-router first, then fall back to react-navigation
    if (router && router.canGoBack && router.canGoBack()) {
      console.log("Using expo-router to go back");
      router.back();
    } else if (navigation && navigation.canGoBack && navigation.canGoBack()) {
      console.log("Using react-navigation to go back");
      navigation.goBack();
    } else {
      console.log("No back navigation available");
      // Fallback - try to go to the home screen
      if (router) {
        router.push("/(drawer)");
      }
    }
  };

  return (
    <View
      style={[
        styles.headerContainer,
        { backgroundColor: theme.surface, borderBottomColor: theme.border },
      ]}
    >
      {showMenu ? (
        <TouchableOpacity style={styles.iconButton} onPress={handleMenuPress}>
          <Ionicons name="menu" size={24} color={theme.text} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.iconButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
      )}

      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      </View>

      {showProfile ? (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onprofilepress || (() => console.log("settings pressed"))}
        >
          <Ionicons name="settings" size={24} color={theme.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconButton} />
      )}
    </View>
  );
};
export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    borderBottomWidth: 1,
  },
  iconButton: {
    padding: 8,
    width: 40,
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
  },
});
