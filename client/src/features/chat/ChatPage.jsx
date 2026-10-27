import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import chatService from './services/chatService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import {
  MessageSquare,
  Send,
  Search,
  Building,
  User,
  Plus,
  Circle,
  Clock,
  Check,
  CheckCheck,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export const ChatPage = () => {
  const { user } = useAuth();
  const socket = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // New Chat Modal state (For students starting chats with companies)
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [companiesDirectory, setCompaniesDirectory] = useState([]);
  const [isStartingChat, setIsStartingChat] = useState(false);

  // Typing indicator state
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  const isStudent = user?.role === 'student';

  // Scroll to bottom of message stream
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Load conversations list
  const loadConversations = useCallback(async (selectFirst = false) => {
    try {
      setIsLoadingConversations(true);
      const data = await chatService.getConversations();
      setConversations(data);

      if (selectFirst && data.length > 0 && !activeConversation) {
        selectConversation(data[0]);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [activeConversation]);

  // Load companies for the new chat modal (if student)
  const loadCompanies = async () => {
    try {
      const data = await chatService.getCompanies();
      setCompaniesDirectory(data);
    } catch (err) {
      console.error('Failed to load companies:', err);
    }
  };

  useEffect(() => {
    loadConversations(true);
    if (isStudent) {
      loadCompanies();
    }
  }, []);

  // Select conversation & load messages
  const selectConversation = async (conv) => {
    setActiveConversation(conv);
    setIsOtherTyping(false);

    try {
      setIsLoadingMessages(true);
      const data = await chatService.getMessages(conv._id);
      setMessages(data.messages || []);

      // Decrement unread count locally
      setConversations((prev) =>
        prev.map((c) => (c._id === conv._id ? { ...c, unreadCount: 0 } : c))
      );

      setTimeout(() => scrollToBottom('auto'), 50);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Join/leave conversation socket rooms
  useEffect(() => {
    if (!socket || !activeConversation) return;

    socket.emit('join_conversation', { conversationId: activeConversation._id });

    // Listen for incoming messages
    const handleNewMessage = ({ message }) => {
      if (message.conversation === activeConversation._id) {
        setMessages((prev) => {
          // Avoid duplicate messages
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
        setIsOtherTyping(false);
        setTimeout(() => scrollToBottom('smooth'), 50);
      }

      // Update last message in conversations list
      setConversations((prev) =>
        prev.map((c) => {
          if (c._id === message.conversation) {
            return {
              ...c,
              lastMessage: message.content,
              lastMessageAt: message.createdAt,
              unreadCount:
                c._id === activeConversation._id || message.sender._id === user?.id
                  ? 0
                  : (c.unreadCount || 0) + 1,
            };
          }
          return c;
        })
      );
    };

    // Listen for typing indicators
    const handleUserTyping = ({ conversationId }) => {
      if (conversationId === activeConversation._id) {
        setIsOtherTyping(true);
      }
    };

    const handleUserStopTyping = ({ conversationId }) => {
      if (conversationId === activeConversation._id) {
        setIsOtherTyping(false);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.emit('leave_conversation', { conversationId: activeConversation._id });
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
    };
  }, [socket, activeConversation, user?.id]);

  // Handle message sending (via WebSocket or REST fallback)
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const content = messageInput.trim();
    if (!content || !activeConversation || isSending) return;

    setMessageInput('');
    setIsSending(true);

    if (socket && socket.connected) {
      socket.emit('stop_typing', { conversationId: activeConversation._id });
    }

    try {
      if (socket && socket.connected) {
        // Send via WebSocket
        socket.emit(
          'send_message',
          { conversationId: activeConversation._id, content },
          (res) => {
            if (res?.success) {
              setMessages((prev) => {
                if (prev.some((m) => m._id === res.message._id)) return prev;
                return [...prev, res.message];
              });
              scrollToBottom('smooth');
            }
          }
        );
      } else {
        // Fallback to REST API
        const newMsg = await chatService.sendMessage(activeConversation._id, content);
        setMessages((prev) => [...prev, newMsg]);
        scrollToBottom('smooth');
      }

      // Update sidebar preview
      setConversations((prev) =>
        prev.map((c) =>
          c._id === activeConversation._id
            ? { ...c, lastMessage: content, lastMessageAt: new Date().toISOString() }
            : c
        )
      );
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Typing event handler with debounce
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    if (!socket || !activeConversation) return;

    socket.emit('typing', {
      conversationId: activeConversation._id,
      userName: user?.name,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { conversationId: activeConversation._id });
    }, 2000);
  };

  // Start new chat with a company
  const handleStartChatWithCompany = async (companyId) => {
    try {
      setIsStartingChat(true);
      const conversation = await chatService.startConversation({ companyId });
      setIsNewChatModalOpen(false);
      await loadConversations();
      selectConversation(conversation);
    } catch (err) {
      console.error('Failed to start conversation:', err);
    } finally {
      setIsStartingChat(false);
    }
  };

  // Helper to format conversation participant name & avatar
  const getParticipantInfo = (conv) => {
    if (!conv) return { name: 'Chat', subtitle: '', avatar: null };

    if (isStudent) {
      return {
        name: conv.company?.name || 'Company Recruiter',
        subtitle: conv.company?.industry || conv.company?.location?.city || 'Hiring Partner',
        avatar: conv.company?.logoUrl,
        isCompany: true,
      };
    } else {
      return {
        name: conv.student?.name || 'Student Candidate',
        subtitle: conv.student?.email || 'Applicant',
        avatar: conv.student?.avatarUrl,
        isCompany: false,
      };
    }
  };

  // Filter conversations by search keyword
  const filteredConversations = conversations.filter((c) => {
    const info = getParticipantInfo(c);
    return info.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatConversationDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return formatMessageTime(dateStr);
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const activeInfo = getParticipantInfo(activeConversation);

  return (
    <div className="h-[calc(100vh-140px)] min-h-[550px] max-h-[850px] flex flex-col md:flex-row gap-4">
      {/* =========================================================================
          LEFT SIDEBAR: Conversations List
         ========================================================================= */}
      <Card className="w-full md:w-80 lg:w-96 p-4 flex flex-col !rounded-[10px] shadow-sm">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-150">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-gray-900 text-lg">Direct Messages</h2>
          </div>
          {isStudent && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsNewChatModalOpen(true)}
              className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 !rounded-[8px]"
              title="Start New Chat"
              aria-label="Start New Chat"
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Search bar */}
        <div className="pt-3 pb-2">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 !rounded-[8px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto space-y-1 pt-2 pr-1">
          {isLoadingConversations ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Spinner size="md" />
              <p className="text-xs mt-2 font-medium">Loading chats...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-10 px-3">
              <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <h4 className="text-xs font-semibold text-gray-700">No conversations yet</h4>
              <p className="text-[11px] text-gray-400 mt-1">
                {isStudent
                  ? 'Click the "+" button above to start a chat with registered hiring partners.'
                  : 'Candidate messages and direct outreach will appear here.'}
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const info = getParticipantInfo(conv);
              const isSelected = activeConversation?._id === conv._id;

              return (
                <div
                  key={conv._id}
                  onClick={() => selectConversation(conv)}
                  className={`p-3 !rounded-[8px] cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-indigo-50/80 border border-indigo-200/80 shadow-2xs'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  {/* Participant Avatar */}
                  <div className="relative shrink-0">
                    {info.avatar ? (
                      <img
                        src={info.avatar}
                        alt={info.name}
                        className="w-10 h-10 object-cover rounded-full border border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-2xs">
                        {info.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {isSelected && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-semibold text-xs text-gray-900 truncate">
                        {info.name}
                      </h4>
                      {conv.lastMessageAt && (
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {formatConversationDate(conv.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                  </div>

                  {/* Unread Badge */}
                  {conv.unreadCount > 0 && (
                    <span className="shrink-0 px-1.5 py-0.5 bg-indigo-600 text-white font-bold text-[10px] rounded-full">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* =========================================================================
          MAIN CHAT WINDOW
         ========================================================================= */}
      <Card className="flex-1 p-0 flex flex-col justify-between !rounded-[10px] shadow-sm overflow-hidden bg-white">
        {activeConversation ? (
          <>
            {/* 1. Chat Header */}
            <div className="px-5 py-3.5 border-b border-gray-150 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {activeInfo.avatar ? (
                    <img
                      src={activeInfo.avatar}
                      alt={activeInfo.name}
                      className="w-10 h-10 object-cover rounded-full border border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-2xs">
                      {activeInfo.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-sm">{activeInfo.name}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 !rounded-none bg-slate-100 text-slate-700">
                      {activeInfo.isCompany ? 'Company' : 'Student'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{activeInfo.subtitle}</p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <Circle className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
                <span>Live Socket Active</span>
              </div>
            </div>

            {/* 2. Message History Stream */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/40">
              {isLoadingMessages ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Spinner size="md" />
                  <p className="text-xs mt-2">Loading message history...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="p-3 bg-indigo-50 rounded-full text-indigo-600 mb-2">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-800">Start the conversation</h4>
                  <p className="text-xs text-gray-500 max-w-xs mt-1">
                    Send a message to introduce yourself, discuss technical criteria, or coordinate interviews.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn =
                    msg.sender?._id === user?.id || msg.sender === user?.id;

                  return (
                    <div
                      key={msg._id}
                      className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md lg:max-w-lg px-4 py-2.5 !rounded-[10px] text-xs sm:text-sm shadow-2xs leading-relaxed ${
                          isOwn
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 px-1">
                        <span>{formatMessageTime(msg.createdAt)}</span>
                        {isOwn && (
                          msg.readStatus ? (
                            <CheckCheck className="w-3 h-3 text-indigo-500" />
                          ) : (
                            <Check className="w-3 h-3 text-gray-400" />
                          )
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {isOtherTyping && (
                <div className="flex items-center gap-2 text-xs text-gray-500 italic bg-white px-3 py-1.5 rounded-full border border-gray-200 w-fit">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </span>
                  <span>{activeInfo.name} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 3. Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-150 flex gap-2">
              <input
                type="text"
                placeholder={`Message ${activeInfo.name}...`}
                value={messageInput}
                onChange={handleInputChange}
                disabled={isSending}
                className="flex-1 bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-xs sm:text-sm !rounded-[8px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!messageInput.trim() || isSending}
                className="px-4 !rounded-[8px] gap-1.5 shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </form>
          </>
        ) : (
          /* Empty State when no conversation is selected */
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-50/30">
            <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 mb-3">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Your Messages</h3>
            <p className="text-xs text-gray-500 max-w-sm mt-1">
              Select an ongoing conversation from the sidebar or initiate a direct chat with partner companies.
            </p>
            {isStudent && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsNewChatModalOpen(true)}
                className="mt-4 gap-1.5 !rounded-[8px]"
              >
                <Plus className="w-4 h-4" />
                Start New Chat
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* =========================================================================
          MODAL: Start New Chat with a Company (For Students)
         ========================================================================= */}
      <Modal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        title="Start Direct Chat with Company"
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-500">
            Select a verified hiring partner to initiate direct recruitment communication.
          </p>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {companiesDirectory.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-4 text-center">
                No companies registered yet.
              </p>
            ) : (
              companiesDirectory.map((comp) => (
                <div
                  key={comp._id}
                  className="p-3 border border-gray-200/80 !rounded-[8px] hover:border-indigo-300 hover:bg-indigo-50/40 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {comp.logoUrl ? (
                      <img
                        src={comp.logoUrl}
                        alt={comp.name}
                        className="w-9 h-9 object-cover rounded-full border border-gray-200"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs">
                        {comp.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">
                        {comp.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 truncate">
                        {comp.industry} • {comp.location?.city || 'Sri Lanka'}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isStartingChat}
                    onClick={() => handleStartChatWithCompany(comp._id)}
                    className="text-xs px-3 py-1 !rounded-[6px]"
                  >
                    Chat
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsNewChatModalOpen(false)}
              className="!rounded-[8px]"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
