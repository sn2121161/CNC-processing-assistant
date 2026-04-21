import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Copy, Check, RotateCcw, Sparkles, Code2 } from 'lucide-react';
import { Button } from '@client/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@client/src/components/ui/card';
import { Textarea } from '@client/src/components/ui/textarea';
import { capabilityClient } from '@lark-apaas/client-toolkit';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { toast } from 'sonner';

const GCodeGeneratePage: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (output && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output]);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('代码已复制到剪贴板');
    } catch (err) {
      logger.error('复制失败', err);
      toast.error('复制失败');
    }
  };

  const handleRegenerate = () => {
    if (input.trim()) {
      handleGenerate();
    }
  };

  const handleGenerate = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setOutput('');
    setError(null);

    try {
      const pluginInstanceId = 'g_code_generation_1';
      
      const stream = capabilityClient.load(pluginInstanceId).callStream('textGenerate', {
        machining_requirement: input,
        cnc_system: 'FANUC',
      });

      for await (const chunk of stream as AsyncIterable<{ content?: string }>) {
        const content = chunk.content || '';
        setOutput((prev) => prev + content);
      }

      if (!output && !error) {
        toast.success('G代码生成成功');
      }
    } catch (err) {
      logger.error('G代码生成失败', err);
      setError('G代码生成失败，请稍后重试');
      toast.error('G代码生成失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-1 bg-[#FACC15] rounded-full" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF]">G-Code Generator</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1E293B] mb-3">
              G代码生成
            </h1>
            <p className="text-sm text-[#64748B] max-w-md">
              输入加工需求描述，AI 将自动生成对应的 G代码程序
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 border border-[#F3F4F6]">
            <Code2 className="w-4 h-4 text-[#FACC15]" />
            <span className="text-xs font-medium text-[#64748B]">Powered by AI</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 输入区 */}
        <Card className="bg-white rounded-[2rem] shadow-sm border border-[#F3F4F6] overflow-hidden">
          <CardHeader className="p-6 pb-4 border-b border-[#F3F4F6]">
            <CardTitle className="text-lg font-bold tracking-tight text-[#1E293B] flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FACC15] to-[#F59E0B] flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              加工需求描述
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-4">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="例如：加工一个直径30mm、深度20mm的圆柱台阶，使用FANUC系统，切削速度150m/min..."
              className="min-h-[300px] resize-none border-[#F3F4F6] rounded-2xl text-[#1E293B] placeholder:text-[#9CA3AF] focus:border-[#FACC15] focus:ring-[#FACC15]/20 font-mono text-sm bg-[#F9FAFB]"
            />
            <div className="mt-4 flex gap-3">
              <Button
                onClick={handleGenerate}
                disabled={!input.trim() || isLoading}
                className="flex-1 h-12 bg-[#FACC15] text-[#1E293B] hover:bg-[#EAB308] rounded-full font-bold transition-all duration-300"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Send className="w-5 h-5 mr-2" />
                )}
                生成代码
              </Button>
              {output && (
                <Button
                  onClick={handleRegenerate}
                  disabled={isLoading}
                  variant="outline"
                  className="h-12 px-6 rounded-full border-[#E5E7EB] text-[#64748B] hover:bg-[#F9FAFB] transition-all"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  重新生成
                </Button>
              )}
            </div>
            <p className="text-xs text-[#9CA3AF] mt-3 text-center">
              按 Ctrl/Cmd + Enter 快速生成
            </p>
          </CardContent>
        </Card>

        {/* 输出区 */}
        <Card className="bg-white rounded-[2rem] shadow-sm border border-[#F3F4F6] overflow-hidden">
          <CardHeader className="p-6 pb-4 border-b border-[#F3F4F6]">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold tracking-tight text-[#1E293B]">
                生成的 G代码
              </CardTitle>
              {output && (
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-full border-[#E5E7EB] text-[#64748B] hover:bg-[#F9FAFB] transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1 text-green-500" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      复制代码
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-4">
            {!output && !isLoading && !error ? (
              <div className="min-h-[300px] flex items-center justify-center text-center">
                <div className="text-[#9CA3AF]">
                  <div className="w-16 h-16 bg-[#F9FAFB] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <p className="text-sm">生成的 G代码将在此显示</p>
                </div>
              </div>
            ) : error ? (
              <div className="min-h-[300px] flex items-center justify-center">
                <p className="text-red-500 text-sm font-medium">{error}</p>
              </div>
            ) : (
              <div
                ref={outputRef}
                className="min-h-[300px] max-h-[500px] overflow-auto bg-[#1E293B] rounded-2xl p-4"
              >
                <pre className="font-mono text-sm text-[#E2E8F0] whitespace-pre-wrap break-all">
                  {output}
                  {isLoading && <span className="animate-pulse text-[#FACC15]">▌</span>}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 提示信息 */}
      <Card className="mt-6 bg-white rounded-[2rem] shadow-sm border border-[#F3F4F6]">
        <CardContent className="p-6">
          <h4 className="font-bold tracking-tight text-[#1E293B] mb-4">使用提示</h4>
          <ul className="text-sm text-[#64748B] space-y-2">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-[#FACC15] rounded-full mt-2 shrink-0" />
              <span>描述越详细，生成的 G代码越准确</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-[#FACC15] rounded-full mt-2 shrink-0" />
              <span>请包含：工件材料、刀具规格、加工尺寸、机床系统（FANUC/西门子等）</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-[#FACC15] rounded-full mt-2 shrink-0" />
              <span>生成的代码仅供参考，实际使用前请仔细检查并根据机床实际情况调整</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default GCodeGeneratePage;
