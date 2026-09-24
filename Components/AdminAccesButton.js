import React, { useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";

import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react-native";

// =====================================================
// Admin Password
// =====================================================

const ADMIN_PASSWORD = "123456";

// =====================================================
// Admin Access Button
// =====================================================

export default function AdminAccessButton({
  navigation,
}) {
  const [modalVisible, setModalVisible] =
    useState(false);

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  // ===================================================
  // Open Modal
  // ===================================================

  const openModal = () => {
    setPassword("");
    setShowPassword(false);
    setModalVisible(true);
  };

  // ===================================================
  // Close Modal
  // ===================================================

  const closeModal = () => {
    setPassword("");
    setShowPassword(false);
    setModalVisible(false);
  };

  // ===================================================
  // Admin Login
  // ===================================================

  const handleAdminAccess = () => {
    const enteredPassword = password.trim();

    // Empty password
    if (!enteredPassword) {
      Alert.alert(
        "ئاگاداری",
        "تکایە وشەی نهێنی بنووسە."
      );
      return;
    }

    // Wrong password
    if (enteredPassword !== ADMIN_PASSWORD) {
      Alert.alert(
        "وشەی نهێنی هەڵەیە",
        "وشەی نهێنی بەڕێوەبەر دروست نییە."
      );
      return;
    }

    // Close modal
    closeModal();

    // Go to Root Stack
    const rootNavigation =
      navigation?.getParent?.("root") ||
      navigation?.getParent?.();

    if (rootNavigation) {
      rootNavigation.navigate("AdminPanel", {
        isAdmin: true,
      });
    } else {
      // Fallback
      navigation.navigate("AdminPanel", {
        isAdmin: true,
      });
    }
  };

  return (
    <>
      {/* =================================================
          Admin Icon
      ================================================= */}

      <TouchableOpacity
        style={styles.adminButton}
        activeOpacity={0.8}
        onPress={openModal}
      >
        <ShieldCheck
          size={22}
          color="#f59e0b"
        />
      </TouchableOpacity>

      {/* =================================================
          Admin Modal
      ================================================= */}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>

            {/* Icon */}

            <View style={styles.iconBox}>
              <Lock
                size={28}
                color="#f59e0b"
              />
            </View>

            {/* Title */}

            <Text style={styles.title}>
              بەشی بەڕێوەبەر
            </Text>

            {/* Subtitle */}

            <Text style={styles.subtitle}>
              وشەی نهێنی بەڕێوەبەر بنووسە
            </Text>

            {/* Password Input */}

            <View style={styles.inputBox}>
              <Lock
                size={19}
                color="#94a3b8"
              />

              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="وشەی نهێنی"
                placeholderTextColor="#64748b"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textAlign="right"
                returnKeyType="done"
                onSubmitEditing={
                  handleAdminAccess
                }
              />

              <TouchableOpacity
                onPress={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
                style={styles.eyeButton}
                activeOpacity={0.7}
              >
                {showPassword ? (
                  <Eye
                    size={20}
                    color="#94a3b8"
                  />
                ) : (
                  <EyeOff
                    size={20}
                    color="#94a3b8"
                  />
                )}
              </TouchableOpacity>
            </View>

            {/* Actions */}

            <View style={styles.actions}>

              {/* Cancel */}

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeModal}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelText}>
                  پاشگەزبوونەوە
                </Text>
              </TouchableOpacity>

              {/* Login */}

              <TouchableOpacity
                style={styles.enterButton}
                onPress={handleAdminAccess}
                activeOpacity={0.8}
              >
                <Text style={styles.enterText}>
                  چوونەژوورەوە
                </Text>
              </TouchableOpacity>

            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

// =====================================================
// Styles
// =====================================================

const styles = StyleSheet.create({

  // ---------------------------------------------------
  // Admin Icon Button
  // ---------------------------------------------------

  adminButton: {
    width: 40,
    height: 40,
    borderRadius: 20,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#172554",

    borderWidth: 1,
    borderColor: "#f59e0b",
  },

  // ---------------------------------------------------
  // Overlay
  // ---------------------------------------------------

  overlay: {
    flex: 1,

    backgroundColor:
      "rgba(0,0,0,0.72)",

    justifyContent: "center",
    alignItems: "center",

    padding: 20,
  },

  // ---------------------------------------------------
  // Modal
  // ---------------------------------------------------

  modal: {
    width: "100%",
    maxWidth: 420,

    backgroundColor: "#1e293b",

    borderRadius: 20,

    padding: 22,

    borderWidth: 1,
    borderColor: "#334155",
  },

  // ---------------------------------------------------
  // Modal Icon
  // ---------------------------------------------------

  iconBox: {
    width: 62,
    height: 62,

    borderRadius: 31,

    backgroundColor: "#172554",

    alignItems: "center",
    justifyContent: "center",

    alignSelf: "center",

    marginBottom: 14,
  },

  // ---------------------------------------------------
  // Title
  // ---------------------------------------------------

  title: {
    color: "#fff",

    fontSize: 21,

    fontWeight: "900",

    textAlign: "center",
  },

  // ---------------------------------------------------
  // Subtitle
  // ---------------------------------------------------

  subtitle: {
    color: "#94a3b8",

    fontSize: 13,

    textAlign: "center",

    marginTop: 8,

    marginBottom: 18,
  },

  // ---------------------------------------------------
  // Input Box
  // ---------------------------------------------------

  inputBox: {
    minHeight: 54,

    backgroundColor: "#0f172a",

    borderWidth: 1,

    borderColor: "#334155",

    borderRadius: 12,

    flexDirection: "row-reverse",

    alignItems: "center",

    paddingHorizontal: 12,
  },

  // ---------------------------------------------------
  // Input
  // ---------------------------------------------------

  input: {
    flex: 1,

    color: "#fff",

    marginHorizontal: 10,

    paddingVertical: 12,

    textAlign: "right",
  },

  // ---------------------------------------------------
  // Eye Button
  // ---------------------------------------------------

  eyeButton: {
    padding: 4,
  },

  // ---------------------------------------------------
  // Actions
  // ---------------------------------------------------

  actions: {
    flexDirection: "row-reverse",

    gap: 10,

    marginTop: 18,
  },

  // ---------------------------------------------------
  // Cancel Button
  // ---------------------------------------------------

  cancelButton: {
    flex: 1,

    backgroundColor: "#374151",

    borderRadius: 11,

    minHeight: 48,

    alignItems: "center",
    justifyContent: "center",
  },

  // ---------------------------------------------------
  // Cancel Text
  // ---------------------------------------------------

  cancelText: {
    color: "#fff",

    fontWeight: "800",
  },

  // ---------------------------------------------------
  // Enter Button
  // ---------------------------------------------------

  enterButton: {
    flex: 1,

    backgroundColor: "#f59e0b",

    borderRadius: 11,

    minHeight: 48,

    alignItems: "center",
    justifyContent: "center",
  },

  // ---------------------------------------------------
  // Enter Text
  // ---------------------------------------------------

  enterText: {
    color: "#000",

    fontWeight: "900",
  },
});