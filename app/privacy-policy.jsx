import { ScrollView, StyleSheet, Text, View } from "react-native";
import Header from "./components/Header";
import { useTheme } from "./contexts/ThemeContext";

export default function PrivacyPolicy() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Privacy Policy" showMenu={false} />
      <ScrollView style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>
          Privacy Policy
        </Text>
        <Text style={[styles.text, { color: theme.textSecondary }]}>
          Your privacy is important to us. This privacy policy explains what
          information we collect, how we use it, and your rights regarding your
          data.
        </Text>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Information We Collect
        </Text>
        <Text style={[styles.text, { color: theme.textSecondary }]}>
          We collect information you provide directly to us, such as when you
          create reminders or use our services.
        </Text>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          How We Use Your Information
        </Text>
        <Text style={[styles.text, { color: theme.textSecondary }]}>
          We use the information we collect to provide, maintain, and improve
          our services, and to communicate with you.
        </Text>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Data Security
        </Text>
        <Text style={[styles.text, { color: theme.textSecondary }]}>
          We implement appropriate security measures to protect your personal
          information against unauthorized access, alteration, disclosure, or
          destruction.
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
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
