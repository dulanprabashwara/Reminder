import { StyleSheet, Text, View } from "react-native";

export default function Homescreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the homepage!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    backgroundColor: "#fff",
  },
  text: { fontSize: 24, fontWeight: "600" },
});
