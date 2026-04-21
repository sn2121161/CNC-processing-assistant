import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Bot, User, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@client/src/components/ui/button';
import { Card, CardContent } from '@client/src/components/ui/card';
import { Textarea } from '@client/src/components/ui/textarea';
import { Streamdown } from '@client/src/components/ui/streamdown';
import { capabilityClient } from '@lark-apaas/client-toolkit';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastRequestTimeRef = useRef<number>(0);
  const RATE_LIMIT_INTERVAL = 3000; // 3秒请求间隔

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCopy = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      logger.error('复制失败', err);
      toast.error('复制失败');
    }
  };

  const handleClear = () => {
    setMessages([]);
    toast.success('对话已清空');
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // 请求节流检查
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTimeRef.current;
    if (timeSinceLastRequest < RATE_LIMIT_INTERVAL) {
      const waitTime = Math.ceil((RATE_LIMIT_INTERVAL - timeSinceLastRequest) / 1000);
      toast.error(`操作过于频繁，请${waitTime}秒后再试`);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const pluginInstanceId = 'cnc_qa_generate_1';
      
      const stream = capabilityClient.load(pluginInstanceId).callStream('textGenerate', {
        user_question: userMessage.content,
      });

      for await (const chunk of stream as AsyncIterable<{ content?: string }>) {
        const content = chunk.content || '';
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: msg.content + content }
              : msg
          )
        );
      }
    } catch (err: any) {
      logger.error('AI 对话请求失败', err);
      
      // 判断是否限流错误
      const isRateLimit = err?.name === 'RateLimitError' || 
                          err?.message?.includes('请求过于频繁') ||
                          err?.message?.includes('Rate limit');
      
      const errorMessage = isRateLimit 
        ? '请求过于频繁，请稍后再试。'
        : '抱歉，AI 服务暂时不可用，请稍后重试。';
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: errorMessage }
            : msg
        )
      );
      
      toast.error(isRateLimit ? '请求过于频繁，请稍后再试' : 'AI 服务暂时不可用');
    } finally {
      lastRequestTimeRef.current = Date.now();
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col p-4 md:p-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-1 bg-[#FACC15] rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF]">AI Assistant</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1E293B]">AI 对话</h1>
          <p className="text-sm text-[#64748B] mt-1">
            与 AI 助手进行 CNC 加工相关问题交流
          </p>
        </div>
        {messages.length > 0 && (
          <Button
            variant="outline"
            onClick={handleClear}
            className="border-[#E5E7EB] text-[#64748B] hover:bg-[#FEF2F2] hover:text-[#DC2626] hover:border-[#FCA5A5] rounded-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            清空对话
          </Button>
        )}
      </div>

      {/* 消息列表 */}
      <Card className="flex-1 bg-white rounded-[2rem] shadow-sm border border-[#F3F4F6] overflow-hidden flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FACC15] to-[#F59E0B] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#1E293B] mb-2">
                开始与 AI 助手对话
              </h3>
              <p className="text-sm text-[#64748B] max-w-md">
                您可以询问关于数控系统、刀具选择、加工参数、材料特性、G代码等问题
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* 头像 */}
                <div
                  className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ${
                    message.role === 'user'
                      ? 'bg-[#1E293B] text-white'
                      : 'bg-gradient-to-br from-[#FACC15] to-[#F59E0B] text-white'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>

                {/* 消息内容 */}
                <div
                  className={`flex-1 max-w-[80%] ${
                    message.role === 'user' ? 'text-right' : ''
                  }`}
                >
                  <div
                    className={`inline-block p-4 text-left max-w-full rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-[#1E293B] text-white'
                        : 'bg-[#F9FAFB] text-[#1E293B] border border-[#F3F4F6]'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <Streamdown>{message.content}</Streamdown>
                      </div>
                    )}
                    {message.role === 'assistant' && message.content && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(message.content, message.id)}
                        className="mt-2 h-7 text-xs text-[#64748B] hover:text-[#1E293B] hover:bg-[#F3F4F6] rounded-full"
                      >
                        {copiedId === message.id ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            已复制
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1" />
                            复制
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-[#9CA3AF] mt-1 px-1">
                    {message.timestamp.toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FACC15] to-[#F59E0B] flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="inline-block p-4 bg-[#F9FAFB] rounded-2xl border border-[#F3F4F6]">
                  <Loader2 className="w-5 h-5 animate-spin text-[#FACC15]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      {/* 输入区域 */}
      <div className="mt-4 bg-white rounded-2xl shadow-sm border border-[#F3F4F6] p-4">
        <div className="flex gap-3 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入您的问题，按 Enter 发送..."
            className="flex-1 min-h-[56px] max-h-[200px] resize-none border-0 text-[#1E293B] placeholder:text-[#9CA3AF] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-11 w-11 bg-[#FACC15] text-[#1E293B] hover:bg-[#EAB308] rounded-full shrink-0 p-0"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-[#9CA3AF] mt-2 text-center">
          AI 助手基于 CNC 加工知识库生成回答，仅供参考
        </p>
      </div>
    </div>
  );
};

export default AIChatPage;
