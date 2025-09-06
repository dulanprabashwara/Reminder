import { StyleSheet, Text, View } from "react-native";
import Header from "../components/Header";
import { useTheme } from "../contexts/ThemeContext";

export default function Homescreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Homepage" showMenu={true} />
      <View style={styles.content}>
        <Text style={[styles.text, { color: theme.text }]}>
          Welcome to the homepage!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "600",
  },
});
