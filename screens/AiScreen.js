import React, { useState } from "react";

import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

// =====================================================
// Backend URL
// =====================================================
// گرنگ:
// ئەگەر لە مۆبایل/Expo Go تاقی دەکەیتەوە، localhost بەکارمەهێنە.
// IP ـی کۆمپیوتەرەکەت لە Windows بە ipconfig بدۆزەوە.
//
// نموونە:
// http://192.168.1.100:3000
//
// تەنها 192.168.1.100 بگۆڕە بە IP ـی کۆمپیوتەرەکەت.
// =====================================================

const API_URL = "http://10.222.133.114:3000";

export default function AiScreen({ navigation }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: "1",
      type: "ai",
      text:
        "سڵاو 👋\nمن یاریدەدەری زیرەکی بڵەسەنم.\nپرسیارەکەت بنووسە و من وەڵامی دەدەمەوە.",
    },
  ]);

  // =====================================================
  // Send Message To Backend
  // =====================================================

  const sendMessage = async () => {
    const cleanMessage = message.trim();

    if (!cleanMessage || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      type: "user",
      text: cleanMessage,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/ai/chat`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            message: cleanMessage,
          }),
        }
      );

      const data = await response.json();
console.log("SEND MESSAGE FIRED");
      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "کێشەیەک لە وەرگرتنی وەڵام ڕوویدا."
        );
      }

      const aiMessage = {
        id: `${Date.now()}-ai`,
        type: "ai",
        text: data.answer,
      };

      setMessages((prev) => [
        ...prev,
        aiMessage,
      ]);
    } catch (error) {
      console.log("AI CONNECTION ERROR:", error);

      const errorMessage = {
        id: `${Date.now()}-error`,
        type: "ai",
        text:
          "ببورە، ئێستا نەتوانرا پەیوەندی بە یاریدەدەری زیرەکی بکرێت. تکایە دووبارە هەوڵ بدەرەوە.",
      };

      setMessages((prev) => [
        ...prev,
        errorMessage,
      ]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // Quick Prompt
  // =====================================================

  const usePrompt = (text) => {
    setMessage(text);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >

        {/* =====================================================
            Header
        ===================================================== */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              navigation.goBack()
            }
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-forward"
              size={22}
              color="#f59e0b"
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.headerIconBox}>
              <MaterialCommunityIcons
                name="robot-outline"
                size={25}
                color="#f59e0b"
              />
            </View>

            <View>
              <Text style={styles.headerTitle}>
                زیرەکی دەستکرد
              </Text>

              <Text style={styles.headerSubtitle}>
                یاریدەدەری زیرەکی بڵەسەن
              </Text>
            </View>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* =====================================================
            Welcome Box
        ===================================================== */}

        <View style={styles.welcomeCard}>
          <View style={styles.welcomeIconBox}>
            <MaterialCommunityIcons
              name="creation"
              size={32}
              color="#f59e0b"
            />
          </View>

          <Text style={styles.welcomeTitle}>
            بەخێربێیت بۆ یاریدەدەری بڵەسەن
          </Text>

          <Text style={styles.welcomeText}>
            دەتوانیت پرسیار لەسەر بڵەسەن، مێژوو،
            شجرەنامە، زانیاری گشتی و بابەتە جۆراوجۆرەکان بکەیت.
          </Text>
        </View>

        {/* =====================================================
            Quick Questions
        ===================================================== */}

        <Text style={styles.quickTitle}>
          پرسیارە خێراکان
        </Text>

        <ScrollView
          horizontal
          inverted
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.quickScroll
          }
        >
          <TouchableOpacity
            style={styles.promptCard}
            onPress={() =>
              usePrompt(
                "بڵەسەن لە کوێیە؟"
              )
            }
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="map-marker"
              size={22}
              color="#f59e0b"
            />

            <Text style={styles.promptText}>
              بڵەسەن لە کوێیە؟
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.promptCard}
            onPress={() =>
              usePrompt(
                "مێژووی بڵەسەن چییە؟"
              )
            }
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={22}
              color="#f59e0b"
            />

            <Text style={styles.promptText}>
              مێژووی بڵەسەن؟
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.promptCard}
            onPress={() =>
              usePrompt(
                "شجرەنامەی بڵەسەن چۆنە؟"
              )
            }
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="family-tree"
              size={22}
              color="#f59e0b"
            />

            <Text style={styles.promptText}>
              شجرەنامە
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* =====================================================
            Chat
        ===================================================== */}

        <ScrollView
          style={styles.chatArea}
          contentContainerStyle={
            styles.chatContent
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((item) => (
            <View
              key={item.id}
              style={[
                styles.messageRow,
                item.type === "user"
                  ? styles.userRow
                  : styles.aiRow,
              ]}
            >
              {item.type === "ai" && (
                <View style={styles.messageIcon}>
                  <MaterialCommunityIcons
                    name="robot-outline"
                    size={18}
                    color="#f59e0b"
                  />
                </View>
              )}

              <View
                style={[
                  styles.messageBubble,
                  item.type === "user"
                    ? styles.userBubble
                    : styles.aiBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    item.type === "user"
                      ? styles.userMessageText
                      : styles.aiMessageText,
                  ]}
                >
                  {item.text}
                </Text>
              </View>
            </View>
          ))}

          {/* =====================================================
              AI Loading
          ===================================================== */}

          {loading && (
            <View style={styles.messageRow}>
              <View style={styles.messageIcon}>
                <MaterialCommunityIcons
                  name="robot-outline"
                  size={18}
                  color="#f59e0b"
                />
              </View>

              <View style={styles.aiBubble}>
                <View style={styles.loadingRow}>
                  <ActivityIndicator
                    size="small"
                    color="#f59e0b"
                  />

                  <Text style={styles.loadingText}>
                    AI وەڵام دەداتەوە...
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* =====================================================
            Input
        ===================================================== */}

        <View style={styles.inputArea}>
          <View style={styles.inputWrapper}>

            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="پرسیارەکەت بنووسە..."
              placeholderTextColor="#64748b"
              textAlign="right"
              multiline
              maxLength={1000}
              editable={!loading}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                (!message.trim() || loading) &&
                  styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={
                !message.trim() || loading
              }
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#64748b"
                />
              ) : (
                <Ionicons
                  name="send"
                  size={20}
                  color={
                    message.trim()
                      ? "#0b1329"
                      : "#64748b"
                  }
                />
              )}
            </TouchableOpacity>

          </View>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// =====================================================
// Styles
// =====================================================

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: "#0b1329",
  },

  // =====================================================
  // Header
  // =====================================================

  header: {
    minHeight: 68,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#172554",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#172554",
    borderWidth: 1,
    borderColor: "#1e3a8a",
    justifyContent: "center",
    alignItems: "center",
  },

  headerCenter: {
    flex: 1,
    marginHorizontal: 12,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
  },

  headerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#0f1b3a",
    borderWidth: 1,
    borderColor: "#1e3a8a",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "right",
  },

  headerSubtitle: {
    color: "#94a3b8",
    fontSize: 10,
    marginTop: 3,
    textAlign: "right",
  },

  headerSpacer: {
    width: 42,
  },

  // =====================================================
  // Welcome
  // =====================================================

  welcomeCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#172554",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1e3a8a",
    padding: 18,
    alignItems: "center",
  },

  welcomeIconBox: {
    width: 58,
    height: 58,
    borderRadius: 17,
    backgroundColor: "#0f1b3a",
    borderWidth: 1,
    borderColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  welcomeTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  welcomeText: {
    color: "#94a3b8",
    fontSize: 11,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 8,
  },

  // =====================================================
  // Quick Prompts
  // =====================================================

  quickTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 8,
    textAlign: "right",
  },

  quickScroll: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },

  promptCard: {
    backgroundColor: "#172554",
    borderWidth: 1,
    borderColor: "#1e3a8a",
    borderRadius: 13,
    minWidth: 130,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  promptText: {
    color: "#cbd5e1",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 6,
    textAlign: "center",
  },

  // =====================================================
  // Chat
  // =====================================================

  chatArea: {
    flex: 1,
    marginTop: 10,
  },

  chatContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  messageRow: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-end",
  },

  aiRow: {
    justifyContent: "flex-start",
  },

  userRow: {
    justifyContent: "flex-end",
  },

  messageIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#172554",
    borderWidth: 1,
    borderColor: "#1e3a8a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 7,
  },

  messageBubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderWidth: 1,
  },

  aiBubble: {
    backgroundColor: "#172554",
    borderColor: "#1e3a8a",
    borderTopLeftRadius: 5,
  },

  userBubble: {
    backgroundColor: "#f59e0b",
    borderColor: "#f59e0b",
    borderTopRightRadius: 5,
  },

  messageText: {
    fontSize: 12,
    lineHeight: 19,
    textAlign: "right",
  },

  aiMessageText: {
    color: "#e2e8f0",
  },

  userMessageText: {
    color: "#0b1329",
    fontWeight: "600",
  },

  loadingRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },

  loadingText: {
    color: "#94a3b8",
    fontSize: 11,
  },

  // =====================================================
  // Input
  // =====================================================

  inputArea: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: "#172554",
    backgroundColor: "#0b1329",
  },

  inputWrapper: {
    minHeight: 52,
    maxHeight: 120,
    backgroundColor: "#172554",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#1e3a8a",
    flexDirection: "row",
    alignItems: "flex-end",
    paddingLeft: 8,
    paddingRight: 8,
    paddingVertical: 6,
  },

  input: {
    flex: 1,
    color: "#fff",
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    maxHeight: 100,
    textAlign: "right",
  },

  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },

  sendButtonDisabled: {
    backgroundColor: "#1e293b",
  },
});