import { useCallback, useEffect, useRef, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Empty,
  Input,
  List,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  message as notification,
} from "antd";
import {
  CheckCircleOutlined,
  MessageOutlined,
  ReloadOutlined,
  SearchOutlined,
  SendOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { api, type PaginatedResult } from "@/lib/request";
import type {
  SupportConversation,
  SupportMessage,
  SupportMessagesResult,
} from "@/types/admin";

export default function SupportPage() {
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [selected, setSelected] = useState<SupportConversation>();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"open" | "closed">("open");
  const [draft, setDraft] = useState("");
  const [listLoading, setListLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(
    async (silent = false) => {
      if (!silent) setListLoading(true);
      try {
        const result = await api.get<PaginatedResult<SupportConversation>>(
          "/admin/support/conversations",
          {
            params: {
              page: 1,
              limit: 100,
              status,
              search: search || undefined,
            },
          },
        );
        setConversations(result.data);
        setSelected((current) =>
          current
            ? result.data.find((item) => item.id === current.id) || current
            : current,
        );
        if (!selectedId && result.data.length > 0)
          setSelectedId(result.data[0].id);
      } finally {
        if (!silent) setListLoading(false);
      }
    },
    [search, selectedId, status],
  );

  const fetchMessages = useCallback(
    async (conversationId: string, silent = false) => {
      if (!silent) setMessagesLoading(true);
      try {
        const result = await api.get<SupportMessagesResult>(
          `/admin/support/conversations/${conversationId}/messages`,
        );
        setSelected(result.conversation);
        setMessages(result.messages);
        setConversations((current) =>
          current.map((item) =>
            item.id === conversationId
              ? { ...item, adminUnreadCount: 0 }
              : item,
          ),
        );
        requestAnimationFrame(() =>
          messagesEndRef.current?.scrollIntoView({
            behavior: silent ? "auto" : "smooth",
          }),
        );
      } finally {
        if (!silent) setMessagesLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedId) fetchMessages(selectedId);
    else {
      setSelected(undefined);
      setMessages([]);
    }
  }, [fetchMessages, selectedId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      fetchConversations(true);
      if (selectedId) fetchMessages(selectedId, true);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [fetchConversations, fetchMessages, selectedId]);

  const sendMessage = async () => {
    const content = draft.trim();
    if (!selectedId || !content || sending) return;
    setSending(true);
    try {
      const sent = await api.post<SupportMessage>(
        `/admin/support/conversations/${selectedId}/messages`,
        { content },
      );
      setMessages((current) => [...current, sent]);
      setDraft("");
      setSelected((current) =>
        current ? { ...current, status: "open" } : current,
      );
      await fetchConversations(true);
      requestAnimationFrame(() =>
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      );
    } finally {
      setSending(false);
    }
  };

  const toggleStatus = async () => {
    if (!selected) return;
    const nextStatus = selected.status === "open" ? "closed" : "open";
    await api.post(`/admin/support/conversations/${selected.id}/status`, {
      status: nextStatus,
    });
    notification.success(
      nextStatus === "closed" ? "会话已结束" : "会话已重新打开",
    );
    setSelected((current) =>
      current ? { ...current, status: nextStatus } : current,
    );
    await fetchConversations();
  };

  return (
    <div>
      <div style={styles.pageHeader}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            在线客服
          </Typography.Title>
          <Typography.Text type="secondary">
            处理移动端用户咨询，消息每 4 秒自动同步
          </Typography.Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            fetchConversations();
            if (selectedId) fetchMessages(selectedId);
          }}
        >
          刷新
        </Button>
      </div>

      <Card styles={{ body: { padding: 0 } }} bordered={false}>
        <div style={styles.workspace}>
          <aside style={styles.sidebar}>
            <div style={styles.filters}>
              <Input.Search
                allowClear
                prefix={<SearchOutlined />}
                placeholder="搜索昵称或手机号"
                onSearch={(value) => setSearch(value.trim())}
              />
              <Select
                value={status}
                style={{ width: "100%" }}
                options={[
                  { value: "open", label: "进行中的会话" },
                  { value: "closed", label: "已结束的会话" },
                ]}
                onChange={(value) => {
                  setStatus(value);
                  setSelectedId(undefined);
                }}
              />
            </div>
            <div style={styles.conversationList}>
              <Spin spinning={listLoading}>
                <List
                  dataSource={conversations}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="暂无客服会话"
                      />
                    ),
                  }}
                  renderItem={(item) => (
                    <List.Item
                      onClick={() => setSelectedId(item.id)}
                      style={{
                        ...styles.conversationItem,
                        ...(selectedId === item.id
                          ? styles.conversationItemActive
                          : {}),
                      }}
                    >
                      <List.Item.Meta
                        avatar={
                          <Badge count={item.adminUnreadCount} size="small">
                            <Avatar
                              src={item.user.avatar}
                              icon={<UserOutlined />}
                              style={{ backgroundColor: "#FF8A3D" }}
                            />
                          </Badge>
                        }
                        title={
                          <div style={styles.itemTitle}>
                            <Typography.Text strong ellipsis>
                              {item.user.username}
                            </Typography.Text>
                            <Typography.Text
                              type="secondary"
                              style={styles.itemTime}
                            >
                              {item.lastMessageAt
                                ? dayjs(item.lastMessageAt).format(
                                    "MM-DD HH:mm",
                                  )
                                : "新会话"}
                            </Typography.Text>
                          </div>
                        }
                        description={
                          <div>
                            <Typography.Text
                              type="secondary"
                              ellipsis
                              style={{ display: "block" }}
                            >
                              {item.lastMessagePreview || "等待用户发送消息"}
                            </Typography.Text>
                            <Typography.Text
                              type="secondary"
                              style={{ fontSize: 11 }}
                            >
                              {item.user.phone}
                            </Typography.Text>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Spin>
            </div>
          </aside>

          <section style={styles.chatPane}>
            {!selectedId ? (
              <div style={styles.emptyChat}>
                <Empty
                  image={
                    <MessageOutlined
                      style={{ fontSize: 54, color: "#d9d9d9" }}
                    />
                  }
                  description="选择一条会话开始回复"
                />
              </div>
            ) : (
              <>
                <div style={styles.chatHeader}>
                  <Space>
                    <Avatar
                      src={selected?.user.avatar}
                      icon={<UserOutlined />}
                      style={{ backgroundColor: "#FF8A3D" }}
                    />
                    <div>
                      <div>
                        <Typography.Text strong>
                          {selected?.user.username || "用户"}
                        </Typography.Text>
                        <Tag
                          color={
                            selected?.status === "closed" ? "default" : "green"
                          }
                          style={{ marginLeft: 8 }}
                        >
                          {selected?.status === "closed" ? "已结束" : "咨询中"}
                        </Tag>
                      </div>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: 12 }}
                      >
                        {selected?.user.phone}
                      </Typography.Text>
                    </div>
                  </Space>
                  <Button icon={<CheckCircleOutlined />} onClick={toggleStatus}>
                    {selected?.status === "closed" ? "重新打开" : "结束会话"}
                  </Button>
                </div>

                <div style={styles.messagesPane}>
                  <Spin spinning={messagesLoading}>
                    {messages.length === 0 ? (
                      <div style={styles.emptyMessages}>
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="暂无消息"
                        />
                      </div>
                    ) : (
                      messages.map((item) => {
                        const fromAdmin = item.senderRole === "admin";
                        return (
                          <div
                            key={item.id}
                            style={{
                              ...styles.messageRow,
                              justifyContent: fromAdmin
                                ? "flex-end"
                                : "flex-start",
                            }}
                          >
                            {!fromAdmin && (
                              <Avatar
                                size={32}
                                icon={<UserOutlined />}
                                style={{
                                  marginRight: 8,
                                  backgroundColor: "#FF8A3D",
                                }}
                              />
                            )}
                            <div
                              style={{
                                ...styles.messageBubble,
                                ...(fromAdmin
                                  ? styles.adminBubble
                                  : styles.userBubble),
                              }}
                            >
                              <div
                                style={{
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-word",
                                }}
                              >
                                {item.content}
                              </div>
                              <div
                                style={{
                                  ...styles.messageTime,
                                  color: fromAdmin
                                    ? "rgba(255,255,255,.75)"
                                    : "#999",
                                }}
                              >
                                {dayjs(item.createdAt).format("HH:mm")}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </Spin>
                </div>

                <div style={styles.composer}>
                  {selected?.status === "closed" && (
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      发送消息会自动重新打开该会话
                    </Typography.Text>
                  )}
                  <Input.TextArea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="输入回复，Enter 发送，Shift + Enter 换行"
                    autoSize={{ minRows: 2, maxRows: 5 }}
                    maxLength={1000}
                    onPressEnter={(event) => {
                      if (!event.shiftKey) {
                        event.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <div style={styles.composerFooter}>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {draft.length}/1000
                    </Typography.Text>
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      loading={sending}
                      disabled={!draft.trim()}
                      onClick={sendMessage}
                      style={{ background: "#FF7214" }}
                    >
                      发送
                    </Button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </Card>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  workspace: {
    display: "flex",
    height: "calc(100vh - 190px)",
    minHeight: 560,
    border: "1px solid #f0f0f0",
    borderRadius: 10,
    overflow: "hidden",
  },
  sidebar: {
    width: 330,
    minWidth: 280,
    borderRight: "1px solid #f0f0f0",
    display: "flex",
    flexDirection: "column",
    background: "#fff",
  },
  filters: {
    padding: 14,
    display: "grid",
    gap: 10,
    borderBottom: "1px solid #f0f0f0",
  },
  conversationList: { flex: 1, overflowY: "auto" },
  conversationItem: {
    padding: "14px 16px",
    cursor: "pointer",
    borderBlockEnd: "1px solid #f5f5f5",
  },
  conversationItemActive: {
    background: "#FFF3EB",
    borderLeft: "3px solid #FF7214",
  },
  itemTitle: { display: "flex", justifyContent: "space-between", gap: 6 },
  itemTime: { fontSize: 11, whiteSpace: "nowrap" },
  chatPane: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    background: "#FAFAFA",
  },
  emptyChat: { flex: 1, display: "grid", placeItems: "center" },
  chatHeader: {
    height: 68,
    padding: "0 18px",
    background: "#fff",
    borderBottom: "1px solid #f0f0f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  messagesPane: { flex: 1, overflowY: "auto", padding: 20 },
  emptyMessages: { paddingTop: 80 },
  messageRow: { display: "flex", alignItems: "flex-end", marginBottom: 16 },
  messageBubble: {
    maxWidth: "68%",
    padding: "10px 13px 7px",
    borderRadius: 14,
    boxShadow: "0 1px 2px rgba(0,0,0,.05)",
  },
  adminBubble: {
    background: "#FF7214",
    color: "#fff",
    borderBottomRightRadius: 3,
  },
  userBubble: { background: "#fff", color: "#333", borderBottomLeftRadius: 3 },
  messageTime: { fontSize: 10, marginTop: 4, textAlign: "right" },
  composer: {
    padding: "12px 16px",
    background: "#fff",
    borderTop: "1px solid #f0f0f0",
    display: "grid",
    gap: 8,
  },
  composerFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
};
