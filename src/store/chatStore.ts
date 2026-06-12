import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage } from '../services/groqService';

interface ChatState {
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;
  setMessages: (msgs: ChatMessage[]) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
      clearMessages: () => set({ messages: [] }),
      setMessages: (msgs) => set({ messages: msgs })
    }),
    {
      name: 'fitforge-chat-storage',
    }
  )
);
