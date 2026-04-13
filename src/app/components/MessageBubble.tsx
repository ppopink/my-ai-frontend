<<<<<<< HEAD
import { motion } from "motion/react";
import { Bot, User } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

export interface MessageBubbleProps {
  content: string;
  role: "user" | "assistant";
=======
import { motion } from 'motion/react';
import { Bot, User } from 'lucide-react';

export interface MessageBubbleProps {
  content: string;
  role: 'user' | 'assistant';
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
  isStreaming?: boolean;
}

export function MessageBubble({ content, role, isStreaming = false }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
<<<<<<< HEAD
      transition={{ duration: 0.3, ease: "easeOut" }}
=======
      transition={{ duration: 0.3, ease: 'easeOut' }}
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser
            ? 'bg-indigo-100 dark:bg-indigo-500/20'
            : 'bg-violet-100 dark:bg-violet-500/20'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        ) : (
          <Bot className="w-4 h-4 text-violet-600 dark:text-violet-400" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl whitespace-pre-wrap ${
          isUser
            ? 'bg-indigo-500 text-white dark:bg-indigo-600'
            : 'bg-white border border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200'
        }`}
      >
<<<<<<< HEAD
        {isUser ? (
          content
        ) : (
          <MarkdownRenderer
            content={content}
            className="[&_*]:text-inherit [&_pre]:bg-slate-950 [&_pre]:text-slate-100 [&_pre]:shadow-none [&_pre]:border-0"
          />
        )}
=======
        {content}
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
        {isStreaming && (
          <span className="inline-block w-2 h-4 ml-1 bg-current rounded-sm animate-pulse align-middle" />
        )}
      </div>
    </motion.div>
  );
}
