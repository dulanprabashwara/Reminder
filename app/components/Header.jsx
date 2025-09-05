import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
const Header = ({ title, onmenupress, onprofilepress }) => {
  return (
    <View style={styles.headercontainer}>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={onmenupress || (() => console.log("menu pressed"))}
      >
        <Ionicons name="menu" size={24} color="#333" />
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <TouchableOpacity
        onPress={onprofilepress || (() => console.log("profile pressed"))}
      >
        <Ionicons name="person-circle" size={24} color="#333" />
      </TouchableOpacity>
    </View>
  );
};
export default Header;

const styles = StyleSheet.create({
  headercontainer: {
    paddinghorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
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
    color: "#333",
  },
});
