import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AboutUs() {
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: "#2C2C2C" }]}>
      {/* Custom Orange Header */}
      <View style={styles.orangeHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>About</Text>
          <Text style={styles.headerSubtitle}>Us</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.logoContainer}>
          <Ionicons name="alarm" size={80} color="#FF9800" />
          <Text style={styles.appName}>Daily Reminder</Text>
        </View>

        <Text style={styles.description}>
          We are dedicated to helping you stay organized and never miss
          important tasks or events. Our reminder app is designed with
          simplicity and efficiency in mind.
        </Text>

        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.text}>
          To provide a simple, reliable, and user-friendly reminder application
          that helps people manage their daily tasks and important events.
        </Text>

        <Text style={styles.sectionTitle}>Features</Text>
        <Text style={styles.text}>
          • Easy reminder creation{"\n"}• Dark and light theme support{"\n"}•
          User-friendly interface{"\n"}• Secure and private
        </Text>

        <Text style={styles.sectionTitle}>Version</Text>
        <Text style={styles.text}>1.0.0</Text>

        <Text style={styles.sectionTitle}>Contact</Text>
        <Text style={styles.text}>
          For support or feedback, please contact us through the app settings.
        </Text>
      </ScrollView>
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
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
    color: "#FFFFFF",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 30,
    color: "#CCCCCC",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
    color: "#FFFFFF",
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
    color: "#CCCCCC",
  },
});
