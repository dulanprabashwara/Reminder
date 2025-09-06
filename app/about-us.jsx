import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Header from "./components/Header";
import { useTheme } from "./contexts/ThemeContext";

export default function AboutUs() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="About Us" showMenu={false} />
      <ScrollView style={styles.content}>
        <View style={styles.logoContainer}>
          <Ionicons name="alarm" size={80} color={theme.primary} />
          <Text style={[styles.appName, { color: theme.text }]}>
            Reminder App
          </Text>
        </View>

        <Text style={[styles.description, { color: theme.textSecondary }]}>
          We are dedicated to helping you stay organized and never miss
          important tasks or events. Our reminder app is designed with
          simplicity and efficiency in mind.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Our Mission
        </Text>
        <Text style={[styles.text, { color: theme.textSecondary }]}>
          To provide a simple, reliable, and user-friendly reminder application
          that helps people manage their daily tasks and important events.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Features
        </Text>
        <Text style={[styles.text, { color: theme.textSecondary }]}>
          • Easy reminder creation{"\n"}• Dark and light theme support{"\n"}•
          User-friendly interface{"\n"}• Secure and private
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Version
        </Text>
        <Text style={[styles.text, { color: theme.textSecondary }]}>1.0.0</Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Contact
        </Text>
        <Text style={[styles.text, { color: theme.textSecondary }]}>
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
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
});
