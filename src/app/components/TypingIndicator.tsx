import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-violet-600 dark:text-violet-400" />
      </div>
      <div className="bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 px-5 py-4 rounded-2xl flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block w-2 h-2 rounded-full bg-violet-400 dark:bg-violet-500"
            style={{
              animation: `typing-bounce 1.4s ease-in-out ${i * 0.16}s infinite`,
            }}
          />
        ))}
        <style>{`
          @keyframes typing-bounce {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
            30% { transform: translateY(-6px); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
