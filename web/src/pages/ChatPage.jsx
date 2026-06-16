import { useEffect, useState, useRef, useCallback, useReducer } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import { store } from '../store/store';
import {
  getUserConversations,
  userDetails,
  getMessages,
  getProfileImageUrl,
  getPresence,
} from '../api/user-profile';
import { ApiConfig } from '../config/api-config';
import Avatar from '../components/Avatar';

const WS_URL = ApiConfig.BASE_URL.replace(/^http/, 'ws') + '/ws-chat';

const messagesReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true };
    case 'LOADED':
      return { messages: action.messages, loading: false };
    case 'APPEND':
      return {
        ...state,
        messages: state.messages.some((m) => m.id === action.message.id)
          ? state.messages
          : [...state.messages, action.message],
      };
    default:
      return state;
  }
};

const ConversationItem = ({ conversation, otherUser, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
      isActive ? 'bg-teal-50' : 'hover:bg-slate-50'
    }`}
  >
    <Avatar
      src={otherUser?.profileImageKey ? getProfileImageUrl(otherUser.id) : null}
      name={otherUser?.name}
      size="md"
    />
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium text-slate-900">{otherUser?.name || 'Unknown'}</p>
      <p className="truncate text-xs text-slate-500">
        {conversation.lastMessageAt
          ? new Date(conversation.lastMessageAt).toLocaleDateString()
          : 'No messages yet'}
      </p>
    </div>
  </button>
);

const MessageBubble = ({ message, isOwn }) => (
  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
        isOwn ? 'rounded-br-md bg-teal-700 text-white' : 'rounded-bl-md bg-slate-100 text-slate-900'
      }`}
    >
      <p>{message.content}</p>
      <p className={`mt-0.5 text-[10px] ${isOwn ? 'text-teal-200' : 'text-slate-400'}`}>
        {message.createdAt
          ? new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : ''}
      </p>
    </div>
  </div>
);

const ChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const user = store((state) => state.user);
  const messagesEndRef = useRef(null);
  const stompClient = useRef(null);
  const subRef = useRef(null);
  const presenceSubRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [otherUsers, setOtherUsers] = useState({});
  const [connected, setConnected] = useState(false);
  const [presence, setPresence] = useState({});
  const [messagesState, dispatch] = useReducer(messagesReducer, {
    messages: [],
    loading: false,
  });
  const { messages, loading: loadingMsgs } = messagesState;
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const activeConversation = conversations.find((c) => c.conversationId === conversationId);

  const otherUserId = activeConversation
    ? activeConversation.finderId === user?.id
      ? activeConversation.brokerId
      : activeConversation.finderId
    : null;

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // STOMP connection
  useEffect(() => {
    if (!user) return;
    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: { userId: user.id },
      reconnectDelay: 5000,
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
    });
    client.activate();
    stompClient.current = client;
    return () => {
      subRef.current?.unsubscribe();
      presenceSubRef.current?.unsubscribe();
      client.deactivate();
    };
  }, [user]);

  // Subscribe to conversation topic
  useEffect(() => {
    subRef.current?.unsubscribe();
    subRef.current = null;
    if (!stompClient.current?.connected || !conversationId) return;
    subRef.current = stompClient.current.subscribe(
      `/topic/conversations.private/${conversationId}`,
      (frame) => {
        const msg = JSON.parse(frame.body);
        dispatch({ type: 'APPEND', message: msg });
      }
    );
  }, [conversationId, connected]);

  // Subscribe to presence for the other user
  useEffect(() => {
    let cancelled = false;
    presenceSubRef.current?.unsubscribe();
    presenceSubRef.current = null;
    if (!stompClient.current?.connected || !otherUserId) return;
    getPresence(otherUserId)
      .then((data) => {
        if (!cancelled) setPresence(data);
      })
      .catch(() => {});
    presenceSubRef.current = stompClient.current.subscribe(
      `/topic/presence/${otherUserId}`,
      (frame) => {
        const online = JSON.parse(frame.body);
        setPresence((prev) => ({ ...prev, online }));
      }
    );
    return () => {
      cancelled = true;
      presenceSubRef.current?.unsubscribe();
    };
  }, [otherUserId, connected]);

  // Fetch conversations
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    const fetch = async () => {
      try {
        const data = await getUserConversations(user.id);
        setConversations(data);
        const ids = [
          ...new Set(data.flatMap((c) => [c.finderId, c.brokerId]).filter((id) => id !== user.id)),
        ];
        const profileCache = {};
        await Promise.all(
          ids.map(async (id) => {
            try {
              const details = await userDetails(id);
              profileCache[id] = details;
            } catch {
              profileCache[id] = { name: 'Unknown', id };
            }
          })
        );
        setOtherUsers(profileCache);
      } catch (err) {
        console.error('Failed to load conversations', err);
      } finally {
        setLoadingConvs(false);
      }
    };
    fetch();
  }, [user, navigate]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!conversationId) {
      dispatch({ type: 'LOADED', messages: [] });
      return;
    }
    let cancelled = false;
    dispatch({ type: 'LOADING' });
    const fetch = async () => {
      try {
        const data = await getMessages(conversationId, 0, 100);
        if (!cancelled) dispatch({ type: 'LOADED', messages: data });
      } catch (err) {
        if (!cancelled) {
          dispatch({ type: 'LOADED', messages: [] });
          console.error('Failed to load messages', err);
        }
      }
    };
    fetch();
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !conversationId || !user || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);
    const isFinder = user.profileType === 'FINDER';
    const messageFor = isFinder ? 'FINDER_TO_BROKER' : 'BROKER_TO_FINDER';
    stompClient.current?.publish({
      destination: '/app/conversations.private.send',
      body: JSON.stringify({
        senderId: user.id,
        conversationId,
        content,
        messageType: 'TEXT',
        messageFor,
      }),
    });
    // Message will arrive via subscription; clear sending after timeout
    setTimeout(() => setSending(false), 500);
  };

  const handleSelectConversation = (convId) => {
    navigate(`/conversations/${convId}`);
  };

  if (!user) return null;

  const otherUser = otherUserId ? otherUsers[otherUserId] : null;

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-6xl border-x border-slate-200 bg-white">
      {/* Left sidebar */}
      <aside className="flex w-80 shrink-0 flex-col border-r border-slate-200">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-semibold text-slate-900">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="space-y-1 p-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex animate-pulse items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-1.5 py-3">
                    <div className="h-3 w-28 rounded bg-slate-200" />
                    <div className="h-2.5 w-20 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-400">No conversations yet</div>
          ) : (
            conversations.map((conv) => (
              <ConversationItem
                key={conv.conversationId}
                conversation={conv}
                otherUser={otherUsers[conv.finderId === user.id ? conv.brokerId : conv.finderId]}
                isActive={conv.conversationId === conversationId}
                onClick={() => handleSelectConversation(conv.conversationId)}
              />
            ))
          )}
        </div>
      </aside>

      {/* Right panel */}
      <main className="flex flex-1 flex-col">
        {!conversationId ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <svg
                  className="h-8 w-8 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-medium text-slate-700">Your messages</h3>
              <p className="mt-1 text-sm text-slate-400">Select a conversation to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-3">
              <Avatar
                src={otherUser?.profileImageKey ? getProfileImageUrl(otherUser.id) : null}
                name={otherUser?.name}
                size="sm"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {otherUser?.name || 'Unknown'}
                </p>
                {presence.online ? (
                  <p className="flex items-center gap-1 text-xs text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Online
                  </p>
                ) : presence.lastSeen ? (
                  <p className="text-xs text-slate-400">
                    Last seen{' '}
                    {new Date(presence.lastSeen).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">Offline</p>
                )}
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {loadingMsgs ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex animate-pulse ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`h-10 w-48 rounded-2xl bg-slate-200 ${i % 2 === 0 ? 'rounded-bl-md' : 'rounded-br-md'}`}
                      />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-slate-400">No messages yet. Start a conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwn={msg.messageFor?.startsWith(user.profileType)}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 border-t border-slate-200 px-5 py-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm transition outline-none focus:border-teal-500 focus:bg-white"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-white transition hover:bg-teal-800 disabled:opacity-40"
              >
                {sending ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19V5m0 0l-7 7m7-7l7 7"
                    />
                  </svg>
                )}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
};

export default ChatPage;
