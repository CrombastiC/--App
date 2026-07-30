import { supportService, type SupportMessage } from "@/services";
import ToastManager from "@/utils/toast";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator, Icon, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SupportChatScreen() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [conversationStatus, setConversationStatus] = useState<
    "open" | "closed"
  >("open");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<SupportMessage>>(null);

  const loadMessages = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    const [error, data] = await supportService.getMessages();
    if (!error) {
      setMessages(data.messages);
      setConversationStatus(data.status);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMessages(true);
    }, [loadMessages]),
  );

  useEffect(() => {
    const timer = setInterval(() => loadMessages(), 4000);
    return () => clearInterval(timer);
  }, [loadMessages]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    const [hasError, result] = await supportService.sendMessage(content);
    setSending(false);
    if (hasError) {
      ToastManager.show(result.message || "消息发送失败");
      return;
    }
    const message = result;
    setConversationStatus("open");
    setMessages((current) => [...current, message]);
    setInput("");
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.serviceStatus}>
        <View style={styles.onlineDot} />
        <Text style={styles.serviceStatusText}>
          人工客服在线 · 通常几分钟内回复
        </Text>
      </View>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#FF7214" />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messages}
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: false })
            }
            ListEmptyComponent={
              <View style={styles.welcomeCard}>
                <View style={styles.welcomeIcon}>
                  <Icon source="headset" size={30} color="#FF7214" />
                </View>
                <Text style={styles.welcomeTitle}>你好，这里是在线客服</Text>
                <Text style={styles.welcomeText}>
                  请描述你遇到的问题，我们会尽快回复你。
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const mine = item.senderRole === "user";
              return (
                <View
                  style={[
                    styles.messageRow,
                    mine ? styles.mineRow : styles.adminRow,
                  ]}
                >
                  {!mine && (
                    <View style={styles.avatar}>
                      <Icon source="headset" size={20} color="#fff" />
                    </View>
                  )}
                  <View
                    style={[
                      styles.bubble,
                      mine ? styles.mineBubble : styles.adminBubble,
                    ]}
                  >
                    <Text style={[styles.messageText, mine && styles.mineText]}>
                      {item.content}
                    </Text>
                    <Text style={[styles.messageTime, mine && styles.mineTime]}>
                      {new Date(item.createdAt).toLocaleTimeString("zh-CN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        <View style={styles.inputBar}>
          {conversationStatus === "closed" && (
            <Text style={styles.closedHint}>
              该会话已结束，发送新消息会重新发起咨询
            </Text>
          )}
          <View style={styles.inputRow}>
            <TextInput
              mode="outlined"
              placeholder="请输入消息"
              value={input}
              onChangeText={(value: string) => setInput(value.slice(0, 1000))}
              multiline
              style={styles.input}
              outlineStyle={styles.inputOutline}
              activeOutlineColor="#FF7214"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!input.trim() || sending) && styles.sendButtonDisabled,
              ]}
              disabled={!input.trim() || sending}
              onPress={sendMessage}
            >
              {sending ? (
                <ActivityIndicator size={20} color="#fff" />
              ) : (
                <Icon source="send" size={21} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F5F5" },
  serviceStatus: {
    height: 38,
    backgroundColor: "#FFF5EC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#36B36A",
    marginRight: 7,
  },
  serviceStatusText: { color: "#8A5A34", fontSize: 12 },
  keyboardView: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  messages: { padding: 16, flexGrow: 1 },
  welcomeCard: {
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 22,
    marginTop: 42,
    maxWidth: 300,
  },
  welcomeIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFF1E7",
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeTitle: {
    color: "#333",
    fontWeight: "700",
    fontSize: 16,
    marginTop: 12,
  },
  welcomeText: {
    color: "#888",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 6,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 14,
    alignItems: "flex-end",
  },
  mineRow: { justifyContent: "flex-end" },
  adminRow: { justifyContent: "flex-start" },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FF7214",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  bubble: {
    maxWidth: "76%",
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  mineBubble: { backgroundColor: "#FF7214", borderBottomRightRadius: 4 },
  adminBubble: { backgroundColor: "#fff", borderBottomLeftRadius: 4 },
  messageText: { color: "#333", lineHeight: 21 },
  mineText: { color: "#fff" },
  messageTime: { color: "#aaa", fontSize: 9, marginTop: 4, textAlign: "right" },
  mineTime: { color: "#FFE2CF" },
  inputBar: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingTop: 9,
    paddingBottom: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
  },
  closedHint: {
    color: "#999",
    fontSize: 11,
    textAlign: "center",
    marginBottom: 7,
  },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 9 },
  input: { flex: 1, maxHeight: 100, backgroundColor: "#F7F7F7", fontSize: 14 },
  inputOutline: { borderRadius: 20, borderColor: "#E5E5E5" },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FF7214",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 1,
  },
  sendButtonDisabled: { backgroundColor: "#D7D7D7" },
});
