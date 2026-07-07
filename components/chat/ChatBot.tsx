'use client';

import React, { useState } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey there! 👋 I\'m your AI shopping assistant. I can help you find products, answer questions, and suggest awesome features. What would you like to know?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const suggestedFeatures = [
    'AI Product Recommendations',
    'Virtual Try-on with AR',
    'Voice Shopping Assistant',
    'Personalized Wishlists',
    'Smart Price Alerts',
    'Live Shopping Events',
    'Social Shopping Features',
    'Subscription Box Service',
  ];

  const suggestedQuestions = [
    'How do I track my order?',
    'What payment methods do you accept?',
    'Can I return items?',
    'How long is shipping?',
  ];

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Feature suggestions
    if (lowerMessage.includes('feature') || lowerMessage.includes('suggest')) {
      return `Great question! Here are some awesome features we could implement:\n\n${suggestedFeatures
        .slice(0, 4)
        .map((f) => `• ${f}`)
        .join(
          '\n'
        )}\n\nWould you like to know more about any of these?`;
    }

    // Track order
    if (lowerMessage.includes('track') || lowerMessage.includes('order')) {
      return 'You can track your order by going to your account and clicking "Orders". You\'ll see real-time updates on your shipment status and estimated delivery date. 📦';
    }

    // Payment
    if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
      return 'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, Apple Pay, and Google Pay. Your payment is secured with industry-standard encryption. 💳';
    }

    // Returns
    if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
      return 'We offer 30-day returns on most items. If you\'re not satisfied, just initiate a return from your account and we\'ll provide a prepaid shipping label. Returns are typically processed within 5-7 business days. ↩️';
    }

    // Shipping
    if (lowerMessage.includes('ship') || lowerMessage.includes('delivery')) {
      return 'Standard shipping takes 3-5 business days. We also offer Express (1-2 days) and Overnight shipping. Orders over $100 qualify for free standard shipping! 🚚';
    }

    // Help
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return 'I\'m here to help! You can:\n• Ask about products and pricing\n• Get help with orders and shipping\n• Learn about new features\n• Suggest improvements\n\nWhat can I assist you with? 😊';
    }

    // Default response
    return `That\'s a great question! While I don\'t have specific information about that, I\'d recommend:\n• Browsing our FAQ section\n• Contacting our support team via WhatsApp\n• Visiting our Help Center\n\nIs there anything else I can help you with?`;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(input),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsLoading(false);
    }, 500);
  };

  const handleSuggestedClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 max-h-96 glass-card rounded-2xl shadow-2xl shadow-cyan-500/20 border border-cyan-500/20 flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-4 border-b border-cyan-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-white">AI Shopping Assistant</h3>
        </div>
        <button
          onClick={() => {
            const element = document.getElementById('chatbot-widget');
            if (element) {
              element.classList.toggle('hidden');
            }
          }}
          className="p-1 hover:bg-red-500/20 rounded-lg transition-colors text-slate-300 hover:text-red-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-3 rounded-xl ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-none'
                  : 'bg-slate-700/50 text-slate-100 border border-cyan-500/20 rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700/50 text-slate-100 px-4 py-3 rounded-xl border border-cyan-500/20 rounded-bl-none">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested */}
      {messages.length === 1 && (
        <div className="px-4 py-2 border-t border-cyan-500/20 max-h-20 overflow-y-auto">
          <p className="text-xs text-slate-400 mb-2">Quick suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSuggestedClick(q)}
                className="text-xs px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30 transition-colors whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-cyan-500/20 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 bg-slate-700/50 border border-cyan-500/20 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 text-sm"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white p-2 rounded-lg transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
