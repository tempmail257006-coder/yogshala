import Groq from "groq-sdk";
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Trash2, User } from 'lucide-react';
import Markdown from 'react-markdown';
import { ChatMessage } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedGreeting, t } from '../lib/i18n';
import { YogshalaLogoIcon } from './YogshalaLogoIcon';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

const AIChat: React.FC = () => {
  const { profile } = useAuth();
  const { language } = useLanguage();
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    if (profile && isFirstRender) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: getLocalizedGreeting(profile, language),
          timestamp: Date.now(),
        },
      ]);
      setIsFirstRender(false);
    }
  }, [language, profile, isFirstRender]);

  useEffect(() => {
    if (location.state?.initialQuery && !hasInitialized.current && !isFirstRender) {
      hasInitialized.current = true;
      handleSend(location.state.initialQuery);
    }
  }, [location.state, isFirstRender]);

  const SUGGESTED_PROMPTS = [
    { label: t('suggestedFlexibility', language), text: language === 'ta' ? 'நெகிழ்வை எப்படி மேம்படுத்துவது?' : 'How to improve flexibility?' },
    { label: t('suggestedBackPain', language), text: language === 'ta' ? 'முதுகு வலிக்கு சிறந்த ஆசனங்கள்' : 'Best poses for back pain' },
    { label: t('suggestedBeginner', language), text: language === 'ta' ? 'ஒரு தொடக்கப் பயிற்சி திட்டம் உருவாக்கு' : 'Create a beginner routine' },
    { label: t('suggestedStress', language), text: language === 'ta' ? 'மனஅழுத்த நிவாரணத்திற்கு யோகா' : 'Yoga for stress relief' },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    if (!customText) setInput('');
    setIsTyping(true);

    try {
      if (!import.meta.env.VITE_GROQ_API_KEY) {
        throw new Error('Missing VITE_GROQ_API_KEY.');
      }

      const history = messages.slice(1).map((m): Groq.Chat.Completions.ChatCompletionMessageParam => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const systemInstruction = `You are YOGSHALA AI, a supportive and knowledgeable YOGSHALA assistant. 
      The user you are helping has the following profile:
      - Name: ${profile?.name || 'User'}
      - YOGSHALALevel: ${profile?.YOGSHALALevel || 'Beginner'}
      - Fitness Goal: ${profile?.fitnessGoal || 'General Wellness'}
      - Daily Streak: ${profile?.dailyStreak || 0} days
      - Total Sessions: ${profile?.completedSessions || 0}
      - Today's YOGSHALA Time: ${profile?.todayYOGSHALATime || 0} minutes
      ${location.state?.currentPose ? `- Current Activity: Practicing ${location.state.currentPose}` : ''}
      
      Provide concise, direct, and encouraging YOGSHALA advice tailored to their level and goals. 
      If they are a beginner, provide clear modifications and avoid overly complex poses. 
      If their goal is flexibility, emphasize stretching and restorative poses.
      If they are currently practicing a specific pose, provide a breakdown of alignment tips, breathing cues, and safety precautions.
      Keep the formatting simple.
      Reply in ${language === 'ta' ? 'Tamil' : 'English'}.
      Always suggest consulting a professional for physical limitations or pain.`;
      
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemInstruction },
          ...history,
          { role: 'user', content: textToSend }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.6,
      });

      const responseText = completion.choices[0]?.message?.content;

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText || "I'm sorry, I couldn't process that. Please try again.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('typingError', language),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="page-shell flex flex-col space-y-6">
      <header className="flex items-center justify-between pt-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 glass-card flex items-center justify-center shadow-lg overflow-hidden p-0">
            <img src="images/yogshala-logo.png" alt="YOGSHALA Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-section-title text-gray-900">{t('aiGuide', language)}</h2>
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-small-label text-gray-500">{t('alwaysHere', language)}</span>
            </div>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex w-full ${msg.role === 'user' ? "justify-end" : "justify-start"}`}
          >
            <div className={`flex max-w-full sm:max-w-[85%] space-x-3 ${msg.role === 'user' ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${
                msg.role === 'user' ? "bg-deep-purple text-white" : "glass-card text-gray-600"
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <YogshalaLogoIcon size={16} className="w-full h-full" />}
              </div>
              <div className={`p-4 rounded-2xl text-body shadow-sm break-words ${
                msg.role === 'user' 
                  ? "bg-animated-gradient text-white rounded-tr-none" 
                  : "glass-card text-gray-800 rounded-tl-none border-white/40"
              }`}>
                <div className="markdown-body">
                  <Markdown>{msg.content}</Markdown>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-start items-center space-x-3"
          >
            <div className="w-8 h-8 rounded-full glass-card flex items-center justify-center text-gray-400">
              <YogshalaLogoIcon size={16} className="w-full h-full" />
            </div>
            <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-none flex items-center space-x-1">
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} className="w-1.5 h-1.5 bg-deep-purple rounded-full" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-deep-purple rounded-full" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-deep-purple rounded-full" />
            </div>
          </motion.div>
        )}
      </div>

      <div className="pb-6 space-y-4">
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <motion.button
                key={prompt.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleSend(prompt.text)}
                disabled={isTyping}
                className="px-4 py-2 rounded-xl glass-card text-small-label text-gray-600 hover:bg-deep-purple/10 hover:text-deep-purple transition-all active:scale-95 disabled:opacity-50"
              >
                {prompt.label}
              </motion.button>
            ))}
          </div>
        )}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('askAboutPoses', language)}
              className="w-full pl-6 pr-6 py-5 glass-card bg-white/50 border-white/40 focus:ring-2 focus:ring-deep-purple outline-none transition-all shadow-xl"
            />
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMessages([messages[0]])}
              className="w-12 h-12 glass-card flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-lg border-white/60"
            >
              <Trash2 size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="w-12 h-12 bg-deep-purple text-white rounded-xl flex items-center justify-center shadow-lg shadow-deep-purple/30 transition-all disabled:opacity-50"
            >
              <Send size={20} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
