import { useState, useRef, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { useWorkoutStore } from '../store/workoutStore';
import { useDietStore } from '../store/dietStore';
import { sendCoachMessage, getCoachContext } from '../services/groqService';
import type { ChatMessage } from '../services/groqService';

const Coach = () => {
  const user = useUserStore();
  const workout = useWorkoutStore();
  const diet = useDietStore();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with system prompt when component mounts
  useEffect(() => {
    const systemPrompt: ChatMessage = {
      role: 'system',
      content: getCoachContext(user, diet, workout, user.savedPlan)
    };
    setMessages([systemPrompt]);
  }, [user, diet, workout, user.savedPlan]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const responseContent = await sendCoachMessage(newMessages);
      setMessages([...newMessages, { role: 'assistant', content: responseContent }]);
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: 'assistant', content: 'SYSTEM ERROR: Connection to Shadow Realm severed.' }]);
    } finally {
      setLoading(false);
    }
  };

  // Filter out the system prompt for the UI
  const displayMessages = messages.filter(m => m.role !== 'system');

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col h-[calc(100vh-80px)]">
      <div className="header-badge mt-2 shrink-0">SHADOW COACH</div>
      
      <div className="flex-1 overflow-y-auto mt-6 mb-4 space-y-4 pr-2 custom-scrollbar">
        {displayMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-16 h-16 rounded-full bg-sl-surface border border-sl-border flex items-center justify-center mb-4">
              <span className="text-2xl">👤</span>
            </div>
            <p className="font-share text-sl-blue tracking-widest text-sm mb-2">LINK ESTABLISHED</p>
            <p className="text-sl-text-dim text-sm">Arise, Hunter. Ask me about your programming, form, or nutrition.</p>
          </div>
        ) : (
          displayMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 ${
                msg.role === 'user' 
                  ? 'bg-sl-blue/10 border border-sl-blue text-white' 
                  : 'bg-sl-surface border border-sl-border-strong text-sl-text-mid'
              }`}>
                {msg.role === 'assistant' && (
                  <p className="font-share text-[10px] text-sl-blue tracking-widest mb-1">SHADOW COACH</p>
                )}
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-sl-surface border border-sl-border-strong p-3">
              <p className="font-share text-[10px] text-sl-blue tracking-widest mb-1">SHADOW COACH</p>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-sl-blue rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-sl-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-sl-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="shrink-0 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your coach..."
          className="flex-1 bg-sl-surface border border-sl-border text-white p-3 font-share text-sm focus:border-sl-blue outline-none"
        />
        <button 
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-sl-blue/10 border border-sl-blue text-sl-blue px-4 flex items-center justify-center hover:bg-sl-blue/20 transition-colors disabled:opacity-50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  );
};

export default Coach;
