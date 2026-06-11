'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Mail,
  Phone,
  Clock,
  MoreVertical,
  Eye,
  Trash2,
  X,
  Check,
  Archive,
  Star,
  Reply,
  User,
  Send,
  Filter,
  Loader2,
  AlertCircle,
  MailOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [readFilter, setReadFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const params = new URLSearchParams();
      if (readFilter === 'unread') params.set('read', 'false');
      if (readFilter === 'read') params.set('read', 'true');
      if (searchQuery) params.set('search', searchQuery);

      const response = await fetch(`/api/admin/messages?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data.messages);
      setUnreadCount(data.unreadCount);
      setError(null);
    } catch (err) {
      setError('Failed to load messages');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchMessages();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, readFilter]);

  // Mark as read when selecting a message
  const handleSelectMessage = async (message: Message) => {
    setSelectedMessage(message);

    if (!message.read) {
      try {
        const response = await fetch(`/api/admin/messages/${message.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ read: true }),
        });

        if (response.ok) {
          setMessages(messages.map(m =>
            m.id === message.id ? { ...m, read: true } : m
          ));
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } catch (err) {
        console.error('Failed to mark message as read:', err);
      }
    }
  };

  // Toggle read/unread
  const handleToggleRead = async (id: string) => {
    const message = messages.find(m => m.id === id);
    if (!message) return;

    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: !message.read }),
      });

      if (response.ok) {
        setMessages(messages.map(m =>
          m.id === id ? { ...m, read: !m.read } : m
        ));
        setUnreadCount(prev => message.read ? prev + 1 : Math.max(0, prev - 1));
        if (selectedMessage?.id === id) {
          setSelectedMessage({ ...selectedMessage, read: !message.read });
        }
        toast.success(message.read ? 'Marked as unread' : 'Marked as read');
      }
    } catch (err) {
      toast.error('Failed to update message');
    }
  };

  // Delete message
  const handleDelete = async () => {
    if (!selectedMessage) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/messages/${selectedMessage.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      toast.success('Message deleted successfully');
      setMessages(messages.filter(m => m.id !== selectedMessage.id));
      if (!selectedMessage.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setSelectedMessage(null);
      setShowDeleteConfirm(false);
    } catch (err) {
      toast.error('Failed to delete message');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Send reply via SMTP
  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/messages/${selectedMessage.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: `Re: ${selectedMessage.subject}`,
          body: replyText,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send');
      }

      setReplyText('');
      toast.success('Reply sent successfully');
      // Mark as read in UI
      setMessages(messages.map(m => m.id === selectedMessage.id ? { ...m, read: true } : m));
      setSelectedMessage({ ...selectedMessage, read: true });
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="size-12 text-red-500" />
        <p className="text-lg text-slate-600 dark:text-slate-400">{error}</p>
        <button
          onClick={() => {
            setIsLoading(true);
            fetchMessages();
          }}
          className="px-4 py-2 bg-primary text-black rounded-lg font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      {/* Page Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Messages & Inquiries
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Manage contact form submissions and customer inquiries
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg">
            <Mail className="size-4" />
            <span className="text-sm font-medium">{unreadCount} unread message{unreadCount > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Messages', value: messages.length, icon: MessageSquare, color: 'bg-slate-100 text-slate-600' },
          { label: 'Unread', value: unreadCount, icon: Mail, color: 'bg-blue-100 text-blue-600' },
          { label: 'Read', value: messages.filter(m => m.read).length, icon: MailOpen, color: 'bg-green-100 text-green-600' },
          { label: 'Today', value: messages.filter(m => new Date(m.createdAt).toDateString() === new Date().toDateString()).length, icon: Clock, color: 'bg-amber-100 text-amber-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
            <div className={cn('p-3 rounded-lg', stat.color)}>
              <stat.icon className="size-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* Search & Filter */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-700">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>
            <select
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          {/* Messages */}
          <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[600px] overflow-y-auto">
            {messages.map((message) => (
              <button
                key={message.id}
                onClick={() => handleSelectMessage(message)}
                className={cn(
                  'w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors',
                  selectedMessage?.id === message.id && 'bg-primary/10',
                  !message.read && 'bg-blue-50/50 dark:bg-blue-900/10'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                      <User className="size-5 text-slate-500" />
                    </div>
                    {!message.read && (
                      <div className="absolute -top-0.5 -right-0.5 size-3 bg-blue-500 rounded-full border-2 border-white dark:border-slate-800" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={cn('text-sm font-semibold truncate', !message.read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300')}>
                        {message.name}
                      </span>
                      <span className="text-xs text-slate-400 shrink-0">
                        {new Date(message.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className={cn('text-sm truncate', !message.read ? 'font-medium text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400')}>
                      {message.subject}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-1">{message.message}</p>
                  </div>
                </div>
              </button>
            ))}

            {messages.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="size-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No messages found</p>
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          {selectedMessage ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                      <User className="size-6 text-slate-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{selectedMessage.name}</h3>
                      <p className="text-sm text-slate-500">{selectedMessage.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleRead(selectedMessage.id)}
                      className={cn('p-2 rounded-lg transition-colors', selectedMessage.read ? 'text-slate-400 hover:bg-slate-100' : 'text-blue-500 bg-blue-50')}
                      title={selectedMessage.read ? 'Mark as unread' : 'Mark as read'}
                    >
                      {selectedMessage.read ? <MailOpen className="size-5" /> : <Mail className="size-5" />}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="size-5" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <span className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border',
                    selectedMessage.read
                      ? 'bg-slate-100 text-slate-600 border-slate-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  )}>
                    <span className={cn('size-1.5 rounded-full', selectedMessage.read ? 'bg-slate-400' : 'bg-blue-500')} />
                    {selectedMessage.read ? 'Read' : 'Unread'}
                  </span>
                  {selectedMessage.phone && (
                    <a href={`tel:${selectedMessage.phone}`} className="flex items-center gap-1 text-sm text-slate-500 hover:text-primary">
                      <Phone className="size-4" />
                      {selectedMessage.phone}
                    </a>
                  )}
                  <span className="flex items-center gap-1 text-sm text-slate-500">
                    <Clock className="size-4" />
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{selectedMessage.subject}</h4>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </p>
              </div>

              {/* Reply Section */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Reply className="size-4" />
                  Reply
                </h4>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white resize-none mb-3"
                />
                <div className="flex justify-end gap-3">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Open in Email Client
                  </a>
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg text-sm font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                    {isSubmitting ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <Mail className="size-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Select a message</h3>
                <p className="text-slate-500">Choose a message from the list to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <Trash2 className="size-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-2">Delete Message</h3>
              <p className="text-center text-slate-500 mb-6">
                Are you sure you want to delete the message from <span className="font-semibold">{selectedMessage.name}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
