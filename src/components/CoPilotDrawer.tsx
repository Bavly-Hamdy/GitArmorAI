import React from 'react';
import { Vulnerability } from '../types';
import { queryCopilotAI } from '../services/apiService';
import { Bot, Send, X, ShieldAlert, Terminal, Activity, User, AlertCircle } from 'lucide-react';

interface CoPilotDrawerProps {
  vuln: Vulnerability;
  repository: string;
  onClose: () => void;
  lang?: 'ar' | 'en';
}

interface ChatMessage {
  id: string;
  sender: 'copilot' | 'user';
  text: string;
  codeSnippet?: string;
  timestamp: string;
}

export function CoPilotDrawer({ vuln, repository, onClose, lang = 'en' }: CoPilotDrawerProps) {
  const isAr = lang === 'ar';
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'copilot',
      text: isAr
        ? `مرحباً بك! أنا مهندس أمن سيبراني آلي مدعوم بـ Google Gemini 3.8 Flash. حللت الثغرة (${vuln.cwe}) في الملف ${vuln.file} (السطر ${vuln.line}). كيف يمكنني مساعدتك في استيعاب طريقة استغلالها أو تطبيق كود حماية بديل؟`
        : `Hello! I am your GitArmor DevSecOps Co-Pilot powered by Google Gemini 3.8 Flash. I have reviewed vulnerability ${vuln.cwe} in ${vuln.file} (line ${vuln.line}). How can I assist you with exploit mechanics, defense-in-depth, or patches?`,
      timestamp: 'الآن',
    },
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errorText, setErrorText] = React.useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setErrorText(null);

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: 'الآن',
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const reply = await queryCopilotAI(
        userText,
        vuln,
        repository,
        updatedMessages.map(m => ({ sender: m.sender, text: m.text }))
      );

      let codeSnippet: string | undefined = undefined;
      const codeMatch = reply.match(/```(?:[a-zA-Z]*)\n([\s\S]*?)```/);
      if (codeMatch && codeMatch[1]) {
        codeSnippet = codeMatch[1].trim();
      }

      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'copilot',
          text: reply.replace(/```(?:[a-zA-Z]*)\n[\s\S]*?```/g, '').trim() || reply,
          codeSnippet: codeSnippet || (reply.includes('diff') ? vuln.suggestedPatch : undefined),
          timestamp: 'الآن',
        },
      ]);
    } catch (err: any) {
      console.error('Copilot request failed:', err);
      setErrorText(err.message || 'Could not fetch reply from Gemini');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-40 bg-neutral-950/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md sm:max-w-lg bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-neutral-900 dark:text-white">GitArmor Co-Pilot</span>
              <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 font-mono">
                Gemini 3.8
              </span>
            </div>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {isAr ? 'مستشار الأمن البرمجي الفعلي' : 'Real-Time Security Architect'}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Target finding tag */}
      <div className="px-5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center gap-2 text-xs">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="truncate text-neutral-800 dark:text-neutral-200 font-mono text-[11px]">
          {vuln.file}:{vuln.line}
        </span>
        <span className="text-neutral-300 dark:text-neutral-700">·</span>
        <span className="text-neutral-600 dark:text-neutral-400 font-mono text-[11px]">{vuln.cwe.split(':')[0]}</span>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-2.5 text-xs leading-relaxed ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-6 h-6 rounded-md shrink-0 flex items-center justify-center text-xs ${
                msg.sender === 'user'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3 h-3" /> : <Terminal className="w-3 h-3" />}
            </div>

            <div
              className={`p-3.5 rounded-lg max-w-[85%] space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-2xs'
                  : 'bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              {msg.codeSnippet && (
                <div className="mt-2 p-2.5 bg-neutral-950 text-neutral-200 rounded-md border border-neutral-800 font-mono text-[11px] overflow-x-auto dir-ltr text-left">
                  <pre>{msg.codeSnippet}</pre>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 text-xs">
            <div className="w-6 h-6 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center">
              <Activity className="w-3 h-3 animate-spin" />
            </div>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
              <span className="text-[11px] font-mono">
                {isAr ? 'Gemini يفحص تدفق الكود وسياق الـ AST...' : 'Gemini is analyzing AST dataflow...'}
              </span>
            </div>
          </div>
        )}

        {errorText && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>{errorText}</span>
          </div>
        )}
      </div>

      {/* Suggested quick questions */}
      <div className="px-3 sm:px-4 py-2 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none whitespace-nowrap">
        <button
          onClick={() => setInput(isAr ? 'كيف يستغل المخترق هذه الثغرة بالضبط؟' : 'How does an attacker exploit this vulnerability?')}
          className="px-2.5 py-1 text-[11px] bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-750 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-md transition-colors cursor-pointer shrink-0"
        >
          {isAr ? 'سيناريو الهجوم؟' : 'Exploit scenario?'}
        </button>
        <button
          onClick={() => setInput(isAr ? 'اكتب لي كود الحل المعياري الآمن' : 'Provide standard secure fix code')}
          className="px-2.5 py-1 text-[11px] bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-750 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-md transition-colors cursor-pointer shrink-0"
        >
          {isAr ? 'كود الحل الآمن' : 'Secure code fix'}
        </button>
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={isAr ? 'اسأل Gemini عن أمان الكود...' : 'Ask Gemini about code security...'}
          className="flex-1 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:border-neutral-900 dark:focus:border-white shadow-2xs min-h-[40px]"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="min-w-[40px] min-h-[40px] flex items-center justify-center p-2 bg-neutral-950 hover:bg-neutral-850 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer shadow-2xs shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
      </div>
    </>
  );
}
