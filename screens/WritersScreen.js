import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ArrowRight, ShieldCheck, Clock3 } from "lucide-react-native";

export default function ManageWritersScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleBox}>
          <ShieldCheck color="#D97706" size={22} />

          <Text style={styles.headerTitle}>
            بەڕێوەبردنی نووسەران
          </Text>
        </View>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <ArrowRight color="#FFF" size={22} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.messageCard}>
          <View style={styles.iconBox}>
            <Clock3 color="#D97706" size={32} />
          </View>

          <Text style={styles.title}>
            بەڕێزان
          </Text>

          <Text style={styles.message}>
            بەشی نووسەران لە وەشانی داهاتووی ئەپەکەدا
            چالاک دەکرێت.
          </Text>

          <Text style={styles.subMessage}>
            تکایە چاوەڕێی نوێکردنەوەی داهاتوو بن.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B131F",
  },

  header: {
    minHeight: 64,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1E2C3D",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitleBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  headerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900",
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#172554",
  },

  content: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },

  messageCard: {
    backgroundColor: "#131D2A",
    borderWidth: 1,
    borderColor: "#1E2C3D",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
  },

  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "rgba(217, 119, 6, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  title: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 12,
  },

  message: {
    color: "#CBD5E1",
    fontSize: 15,
    lineHeight: 26,
    textAlign: "center",
  },

  subMessage: {
    color: "#64748B",
    fontSize: 12,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 12,
  },
});