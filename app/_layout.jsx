import { Stack } from "expo-router";
import { View } from "react-native";
import Header from "./components/Header";

export default function RootLayout() {
  return (
    <View>
      <Header
        title="Reminder"
        onmenupress={() => {}}
        onprofilepress={() => {}}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </View>
  );
}
