import { StyleSheet, Text, View } from "react-native";

export default function Homescreen() {
  return (
    <View style={styles.container}>
<<<<<<< HEAD
      <Text style={styles.text}>Welcome to the homepage!</Text>
=======
      <Text style={styles.text}>Hello, World!</Text>
>>>>>>> a3c67dbc02701af1ba81f70a0729bf0100dc29b9
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
