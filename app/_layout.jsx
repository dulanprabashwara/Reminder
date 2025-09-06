import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import { ThemeProvider } from "./contexts/ThemeContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <View style={styles.container}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(drawer)" />
          <Stack.Screen name="privacy-policy" />
          <Stack.Screen name="about-us" />
          <Stack.Screen name="create-reminder" />
        </Stack>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
