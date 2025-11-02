import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Trash2 } from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  isLocal: boolean;
}

interface ChatProps {
  onSendMessage: (message: string) => void;
  messages: Message[];
  onTyping: (isTyping: boolean) => void;
  remoteTyping: boolean;
  remoteName: string;
  onClearChat: () => void;
  isOpen: boolean;
}

export function Chat({
  onSendMessage,
  messages,
  onTyping,
  remoteTyping,
  remoteName,
  onClearChat,
  isOpen
}: ChatProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator
    if (e.target.value.length > 0) {
      onTyping(true);

      // Stop typing indicator after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    } else {
      onTyping(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      onTyping(false);
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear all messages?')) {
      onClearChat();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="h-full bg-gray-800 flex flex-col border-l border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Chat
        </h3>
        <button
          onClick={handleClearChat}
          className="text-gray-400 hover:text-red-400 transition-colors"
          title="Clear all messages"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isLocal ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg p-3 ${
                      message.isLocal
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    <div className="text-xs opacity-75 mb-1">
                      {message.isLocal ? 'You' : message.sender}
                    </div>
                    <div className="break-words">{message.text}</div>
                    <div className="text-xs opacity-75 mt-1 text-right">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {/* Typing indicator */}
            {remoteTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-300 rounded-lg p-3 text-sm italic">
                  {remoteName} is typing...
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
