import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator as CalcIcon, Loader2, Copy, Check, ChevronRight } from 'lucide-react';
import { useMathJax } from '@client/src/hooks/useMathJax';
import { Button } from '@client/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@client/src/components/ui/card';
import { Input } from '@client/src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import { Badge } from '@client/src/components/ui/badge';
import { Code, SquareFunction } from 'lucide-react';
import { getCalculatorDetail, calculate, createRecentAccess } from '@client/src/api';
import { Streamdown } from '@client/src/components/ui/streamdown';
import type { Calculator, CalculatorInputField } from '@shared/api.interface';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit/logger';

// 公式渲染组件 - 使用 KaTeX
const FormulaRenderer: React.FC<{ latex: string; displayMode?: boolean }> = ({ latex, displayMode = false }) => {
  const { renderFormula, mathJaxReady } = useMathJax();

  if (!mathJaxReady) {
    return <span className="font-mono text-sm">{displayMode ? `$$${latex}$$` : `$${latex}$`}</span>;
  }

  const html = renderFormula(latex.trim(), displayMode);
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

// 渲染公式内容
const renderFormulaContent = (text: string): React.ReactNode => {
  if (!text.includes('$')) return text;

  const parts: React.ReactNode[] = [];
  let key = 0;

  // 处理块级公式 $$...$$
  const blockRegex = /\$\$([\s\S]*?)\$\$/g;
  let lastIndex = 0;
  let match;

  while ((match = blockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    }
    parts.push(
      <div key={key++} className="my-4 p-4 bg-[#F0F7FF] rounded-xl border border-[#165DFF]/20 overflow-x-auto">
        <div className="text-lg text-[#1E293B] font-medium leading-relaxed flex justify-center">
          <FormulaRenderer latex={match[1].trim()} displayMode={true} />
        </div>
      </div>
    );
    lastIndex = match.index + match[0].length;
  }

  // 处理剩余文本中的行内公式
  let remainingText = text.slice(lastIndex);
  const inlineRegex = /\$([^$\n]+)\$/g;
  let inlineLastIndex = 0;
  let inlineMatch;

  while ((inlineMatch = inlineRegex.exec(remainingText)) !== null) {
    if (inlineMatch.index > inlineLastIndex) {
      parts.push(<span key={key++}>{remainingText.slice(inlineLastIndex, inlineMatch.index)}</span>);
    }
    parts.push(
      <span key={key++} className="mx-1 px-2 py-0.5 bg-[#F0F7FF] text-[#165DFF] rounded text-sm font-medium">
        <FormulaRenderer latex={inlineMatch[1].trim()} />
      </span>
    );
    inlineLastIndex = inlineMatch.index + inlineMatch[0].length;
  }

  if (inlineLastIndex < remainingText.length) {
    parts.push(<span key={key++}>{remainingText.slice(inlineLastIndex)}</span>);
  }

  return parts;
};

// 倒角 SVG 示意图组件
const ChamferDiagram: React.FC = () => {
  return (
    <div className="my-6 p-6 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
      <svg viewBox="0 0 440 320" className="w-full max-w-lg mx-auto">
        <defs>
          <marker id="dimArrow" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto">
            <path d="M 0 0 L 8 3 L 0 6 Z" fill="#DC2626" />
          </marker>
          <marker id="dimArrowEnd" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
            <path d="M 8 0 L 0 3 L 8 6 Z" fill="#DC2626" />
          </marker>
          <marker id="diaArrow" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto">
            <path d="M 0 0 L 8 3 L 0 6 Z" fill="#16A34A" />
          </marker>
          <marker id="diaArrowEnd" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
            <path d="M 8 0 L 0 3 L 8 6 Z" fill="#16A34A" />
          </marker>
        </defs>

        {/* 左侧圆柱部分 */}
        <rect x="60" y="100" width="100" height="100" fill="#DBEAFE" stroke="#165DFF" strokeWidth="2" />
        
        {/* 倒角斜边线条（S） */}
        <line x1="160" y1="100" x2="220" y2="120" stroke="#165DFF" strokeWidth="2" />
        <line x1="160" y1="200" x2="220" y2="220" stroke="#165DFF" strokeWidth="2" />
        
        {/* 中心轴线（虚线） */}
        <line x1="30" y1="150" x2="380" y2="150" stroke="#9CA3AF" strokeWidth="1" strokeDasharray="6,4" />
        
        {/* === 倒角宽度 C 标注（水平） === */}
        <line x1="160" y1="85" x2="220" y2="105" stroke="#DC2626" strokeWidth="1" strokeDasharray="3,2" />
        <line x1="160" y1="75" x2="220" y2="95" stroke="#DC2626" strokeWidth="1.5" markerStart="url(#dimArrow)" markerEnd="url(#dimArrowEnd)" />
        <text x="190" y="78" fill="#DC2626" fontSize="13" fontWeight="600" textAnchor="middle">C</text>
        
        {/* === 倒角深度 h 标注（垂直） === */}
        <line x1="235" y1="120" x2="235" y2="150" stroke="#DC2626" strokeWidth="1.5" markerStart="url(#dimArrow)" markerEnd="url(#dimArrowEnd)" />
        <text x="248" y="138" fill="#DC2626" fontSize="13" fontWeight="600">h</text>
        <line x1="220" y1="120" x2="238" y2="120" stroke="#DC2626" strokeWidth="0.5" strokeDasharray="2" />
        <line x1="220" y1="150" x2="238" y2="150" stroke="#DC2626" strokeWidth="0.5" strokeDasharray="2" />
        
        {/* === 角度 θ 标注 === */}
        <path d="M 180 150 L 220 150 A 40 40 0 0 0 205 118" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
        <text x="190" y="142" fill="#F59E0B" fontSize="14" fontWeight="600">θ</text>
        
        {/* === 斜边长度 S 标注 === */}
        <line x1="145" y1="95" x2="205" y2="115" stroke="#7C3AED" strokeWidth="1.5" markerStart="url(#dimArrow)" markerEnd="url(#dimArrowEnd)" />
        <text x="165" y="98" fill="#7C3AED" fontSize="13" fontWeight="600">S</text>
        
        {/* === 基准直径 D 标注 === */}
        <line x1="35" y1="120" x2="35" y2="180" stroke="#16A34A" strokeWidth="1.5" markerStart="url(#diaArrow)" markerEnd="url(#diaArrowEnd)" />
        <line x1="35" y1="120" x2="55" y2="120" stroke="#16A34A" strokeWidth="0.5" strokeDasharray="2" />
        <line x1="35" y1="180" x2="55" y2="180" stroke="#16A34A" strokeWidth="0.5" strokeDasharray="2" />
        <text x="25" y="153" fill="#16A34A" fontSize="13" fontWeight="600" textAnchor="middle">D</text>
        
        {/* === 端部直径 d 标注 === */}
        <line x1="375" y1="100" x2="375" y2="200" stroke="#16A34A" strokeWidth="1.5" markerStart="url(#diaArrow)" markerEnd="url(#diaArrowEnd)" />
        <line x1="360" y1="100" x2="378" y2="100" stroke="#16A34A" strokeWidth="0.5" strokeDasharray="2" />
        <line x1="360" y1="200" x2="378" y2="200" stroke="#16A34A" strokeWidth="0.5" strokeDasharray="2" />
        <text x="388" y="153" fill="#16A34A" fontSize="13" fontWeight="600">d</text>
        
        <text x="220" y="260" fill="#64748B" fontSize="11" textAnchor="middle">倒角几何参数示意图（45°示例）</text>
        <text x="220" y="278" fill="#9CA3AF" fontSize="10" textAnchor="middle">C=倒角宽度  h=倒角深度  S=斜边长度  θ=倒角角度</text>
      </svg>
    </div>
  );
};

// 锥度 SVG 示意图组件
const TaperDiagram: React.FC = () => {
  return (
    <div className="my-6 p-6 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
      <svg viewBox="0 0 440 280" className="w-full max-w-lg mx-auto">
        <defs>
          <marker id="taperArrow" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto">
            <path d="M 0 0 L 8 3 L 0 6 Z" fill="#DC2626" />
          </marker>
          <marker id="taperArrowEnd" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
            <path d="M 8 0 L 0 3 L 8 6 Z" fill="#DC2626" />
          </marker>
        </defs>

        {/* 锥形工件 */}
        <polygon points="80,60 360,100 360,180 80,220" fill="#DBEAFE" stroke="#165DFF" strokeWidth="2" />
        
        {/* 中心轴线 */}
        <line x1="50" y1="140" x2="390" y2="140" stroke="#9CA3AF" strokeWidth="1" strokeDasharray="6,4" />
        
        {/* 大端直径 D */}
        <line x1="40" y1="60" x2="40" y2="220" stroke="#16A34A" strokeWidth="1.5" markerStart="url(#taperArrow)" markerEnd="url(#taperArrowEnd)" />
        <line x1="40" y1="60" x2="75" y2="60" stroke="#16A34A" strokeWidth="0.5" strokeDasharray="2" />
        <line x1="40" y1="220" x2="75" y2="220" stroke="#16A34A" strokeWidth="0.5" strokeDasharray="2" />
        <text x="25" y="145" fill="#16A34A" fontSize="13" fontWeight="600" textAnchor="middle">D</text>
        
        {/* 小端直径 d */}
        <line x1="375" y1="100" x2="375" y2="180" stroke="#16A34A" strokeWidth="1.5" markerStart="url(#taperArrow)" markerEnd="url(#taperArrowEnd)" />
        <line x1="358" y1="100" x2="378" y2="100" stroke="#16A34A" strokeWidth="0.5" strokeDasharray="2" />
        <line x1="358" y1="180" x2="378" y2="180" stroke="#16A34A" strokeWidth="0.5" strokeDasharray="2" />
        <text x="390" y="145" fill="#16A34A" fontSize="13" fontWeight="600">d</text>
        
        {/* 锥长 L */}
        <line x1="80" y1="240" x2="360" y2="240" stroke="#DC2626" strokeWidth="1.5" markerStart="url(#taperArrow)" markerEnd="url(#taperArrowEnd)" />
        <line x1="80" y1="225" x2="80" y2="243" stroke="#DC2626" strokeWidth="0.5" strokeDasharray="2" />
        <line x1="360" y1="185" x2="360" y2="243" stroke="#DC2626" strokeWidth="0.5" strokeDasharray="2" />
        <text x="220" y="258" fill="#DC2626" fontSize="13" fontWeight="600" textAnchor="middle">L</text>
        
        {/* 锥角 α */}
        <path d="M 200 140 L 240 140 A 40 40 0 0 0 230 115" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
        <text x="215" y="132" fill="#F59E0B" fontSize="14" fontWeight="600">α</text>
        
        <text x="220" y="30" fill="#64748B" fontSize="11" textAnchor="middle">锥度圆锥台示意图</text>
      </svg>
    </div>
  );
};

// 表面粗糙度 SVG 示意图组件
const RoughnessDiagram: React.FC = () => {
  return (
    <div className="my-6 p-6 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
      <svg viewBox="0 0 440 260" className="w-full max-w-lg mx-auto">
        <defs>
          <marker id="roughArrow" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto">
            <path d="M 0 0 L 8 3 L 0 6 Z" fill="#DC2626" />
          </marker>
          <marker id="roughArrowEnd" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
            <path d="M 8 0 L 0 3 L 8 6 Z" fill="#DC2626" />
          </marker>
        </defs>

        {/* 工件表面 */}
        <rect x="60" y="160" width="320" height="60" fill="#E5E7EB" stroke="#6B7280" strokeWidth="1" />
        
        {/* 刀尖圆弧示意 */}
        <path d="M 140 160 Q 160 120 180 160" fill="none" stroke="#165DFF" strokeWidth="3" />
        <circle cx="160" cy="140" r="20" fill="none" stroke="#165DFF" strokeWidth="1" strokeDasharray="3,2" />
        
        {/* 切削轨迹 */}
        <path d="M 100 160 Q 120 140 140 160 Q 160 130 180 160 Q 200 140 220 160 Q 240 130 260 160 Q 280 140 300 160 Q 320 130 340 160" 
              fill="none" stroke="#F59E0B" strokeWidth="2" />
        
        {/* 残留高度 h */}
        <line x1="200" y1="130" x2="200" y2="160" stroke="#DC2626" strokeWidth="1.5" markerStart="url(#roughArrow)" markerEnd="url(#roughArrowEnd)" />
        <text x="210" y="148" fill="#DC2626" fontSize="13" fontWeight="600">h</text>
        
        {/* 刀尖圆弧半径 r */}
        <line x1="160" y1="120" x2="180" y2="140" stroke="#16A34A" strokeWidth="1.5" markerStart="url(#roughArrow)" markerEnd="url(#roughArrowEnd)" />
        <text x="195" y="125" fill="#16A34A" fontSize="13" fontWeight="600">r</text>
        
        {/* 进给量 fn */}
        <line x1="140" y1="90" x2="180" y2="90" stroke="#7C3AED" strokeWidth="1.5" markerStart="url(#roughArrow)" markerEnd="url(#roughArrowEnd)" />
        <text x="158" y="85" fill="#7C3AED" fontSize="13" fontWeight="600">fn</text>
        
        <text x="220" y="40" fill="#64748B" fontSize="11" textAnchor="middle">表面粗糙度形成示意图</text>
      </svg>
    </div>
  );
};

// 钻削参数 SVG 示意图组件
const DrillingDiagram: React.FC = () => {
  return (
    <div className="my-6 p-6 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
      <svg viewBox="0 0 440 300" className="w-full max-w-lg mx-auto">
        <defs>
          <marker id="drillArrow" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto">
            <path d="M 0 0 L 8 3 L 0 6 Z" fill="#DC2626" />
          </marker>
          <marker id="drillArrowEnd" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
            <path d="M 8 0 L 0 3 L 8 6 Z" fill="#DC2626" />
          </marker>
        </defs>

        {/* 钻头主体 */}
        <polygon points="180,80 260,80 280,240 160,240" fill="#DBEAFE" stroke="#165DFF" strokeWidth="2" />
        
        {/* 钻尖 */}
        <polygon points="160,240 220,280 280,240" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
        
        {/* 切削刃 */}
        <line x1="220" y1="280" x2="170" y2="240" stroke="#DC2626" strokeWidth="2" />
        <line x1="220" y1="280" x2="270" y2="240" stroke="#DC2626" strokeWidth="2" />
        
        {/* 中心轴线 */}
        <line x1="220" y1="60" x2="220" y2="280" stroke="#9CA3AF" strokeWidth="1" strokeDasharray="6,4" />
        
        {/* 钻头直径 D */}
        <line x1="160" y1="70" x2="280" y2="70" stroke="#DC2626" strokeWidth="1.5" markerStart="url(#drillArrow)" markerEnd="url(#drillArrowEnd)" />
        <text x="218" y="65" fill="#DC2626" fontSize="13" fontWeight="600" textAnchor="middle">D</text>
        
        {/* 钻削深度 */}
        <line x1="300" y1="240" x2="300" y2="280" stroke="#16A34A" strokeWidth="1.5" markerStart="url(#drillArrow)" markerEnd="url(#drillArrowEnd)" />
        <line x1="280" y1="240" x2="303" y2="240" stroke="#16A34A" strokeWidth="0.5" strokeDasharray="2" />
        <line x1="280" y1="280" x2="303" y2="280" stroke="#16A34A" strokeWidth="0.5" strokeDasharray="2" />
        <text x="315" y="265" fill="#16A34A" fontSize="13" fontWeight="600">深度</text>
        
        {/* 顶角示意 */}
        <path d="M 220 260 L 200 240 A 30 30 0 0 0 215 228" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
        <text x="208" y="255" fill="#F59E0B" fontSize="12" fontWeight="600">118°</text>
        
        <text x="220" y="40" fill="#64748B" fontSize="11" textAnchor="middle">麻花钻钻削示意图</text>
      </svg>
    </div>
  );
};

// 车削参数 SVG 示意图组件
const TurningDiagram: React.FC = () => {
  return (
    <div className="my-6 p-6 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
      <svg viewBox="0 0 440 280" className="w-full max-w-lg mx-auto">
        <defs>
          <marker id="turnArrow" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto">
            <path d="M 0 0 L 8 3 L 0 6 Z" fill="#DC2626" />
          </marker>
          <marker id="turnArrowEnd" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
            <path d="M 8 0 L 0 3 L 8 6 Z" fill="#DC2626" />
          </marker>
        </defs>

        {/* 工件圆柱 */}
        <rect x="80" y="100" width="280" height="80" fill="#DBEAFE" stroke="#165DFF" strokeWidth="2" rx="4" />
        
        {/* 车刀 */}
        <polygon points="320,100 360,90 370,120 340,130" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
        <line x1="320" y1="100" x2="340" y2="130" stroke="#DC2626" strokeWidth="2" />
        
        {/* 切削深度 ap */}
        <line x1="360" y1="100" x2="360" y2="140" stroke="#DC2626" strokeWidth="1.5" markerStart="url(#turnArrow)" markerEnd="url(#turnArrowEnd)" />
        <line x1="340" y1="100" x2="363" y2="100" stroke="#DC2626" strokeWidth="0.5" strokeDasharray="2" />
        <line x1="340" y1="140" x2="363" y2="140" stroke="#DC2626" strokeWidth="0.5" strokeDasharray="2" />
        <text x="375" y="125" fill="#DC2626" fontSize="13" fontWeight="600">ap</text>
        
        {/* 工件直径 D */}
        <line x1="60" y1="100" x2="60" y2="180" stroke="#16A34A" strokeWidth="1.5" markerStart="url(#turnArrow)" markerEnd="url(#turnArrowEnd)" />
        <line x1="60" y1="100" x2="75" y2="100" stroke="#16A34A" strokeWidth="0.5" strokeDasharray="2" />
        <line x1="60" y1="180" x2="75" y2="180" stroke="#16A34A" strokeWidth="0.5" strokeDasharray="2" />
        <text x="45" y="145" fill="#16A34A" fontSize="13" fontWeight="600" textAnchor="middle">D</text>
        
        {/* 进给方向箭头 */}
        <line x1="200" y1="210" x2="280" y2="210" stroke="#7C3AED" strokeWidth="2" markerEnd="url(#turnArrowEnd)" />
        <text x="240" y="230" fill="#7C3AED" fontSize="13" fontWeight="600" textAnchor="middle">进给方向 Vf</text>
        
        {/* 旋转方向 */}
        <path d="M 220 140 A 30 30 0 0 1 190 130" fill="none" stroke="#F59E0B" strokeWidth="1.5" markerEnd="url(#turnArrow)" />
        <text x="205" y="155" fill="#F59E0B" fontSize="12" fontWeight="600">n</text>
        
        <text x="220" y="40" fill="#64748B" fontSize="11" textAnchor="middle">外圆车削加工示意图</text>
      </svg>
    </div>
  );
};

// 过滤 ASCII 示意图内容
const filterAsciiDiagram = (content: string): string => {
  return content
    .replace(/###\s*示意图\s*\n[\s│─┌┐└┘├┤┬┴╱╲┃━┏┓┗┛┣┫┳┻╋┿┼┽┾╀╁╂╃╄╅╆╇╈╉<>/\\|_\-=]*(?:\n|$)/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

// 参考信息内容组件
const ReferenceInfoContent: React.FC<{ content: string }> = ({ content }) => {
  const isChamfer = content.includes('倒角') && content.includes('倒角深度');
  const isTaper = content.includes('锥度') && content.includes('锥度比');
  const isRoughness = content.includes('粗糙度') && content.includes('刀尖');
  const isDrilling = content.includes('钻削') || content.includes('钻头');
  const isTurning = content.includes('车削') && content.includes('外圆');
  
  const filteredContent = filterAsciiDiagram(content);
  
  // 解析内容，按行渲染公式
  const lines = filteredContent.split('\n');
  
  return (
    <div className="prose prose-sm max-w-none text-[#4B5563]">
      {isChamfer && <ChamferDiagram />}
      {isTaper && <TaperDiagram />}
      {isRoughness && <RoughnessDiagram />}
      {isDrilling && <DrillingDiagram />}
      {isTurning && <TurningDiagram />}
      <div className="space-y-2">
        {lines.map((line, index) => {
          if (line.startsWith('#')) {
            const level = line.match(/^#+/)?.[0].length || 1;
            const text = line.replace(/^#+\s*/, '');
            if (level === 1) return <h3 key={index} className="text-lg font-bold mt-6 mb-2">{text}</h3>;
            if (level === 2) return <h4 key={index} className="text-base font-semibold mt-4 mb-2">{text}</h4>;
            return <h5 key={index} className="text-sm font-medium mt-3 mb-1">{text}</h5>;
          }
          if (line.trim() === '') {
            return <div key={index} className="h-2" />;
          }
          return (
            <div key={index} className="leading-relaxed">
              {line.startsWith('- ') ? (
                <li className="ml-4">{renderFormulaContent(line.replace(/^- /, ''))}</li>
              ) : (
                <p>{renderFormulaContent(line)}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CalculatorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [calculator, setCalculator] = useState<Calculator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Record<string, number> | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCalculatorDetail(id);
        setCalculator(data);

        const initialValues: Record<string, string> = {};
        data.inputSchema.forEach((field) => {
          initialValues[field.name] = field.defaultValue?.toString() || '';
        });
        setInputValues(initialValues);

        await createRecentAccess({
          resourceType: 'calculator',
          resourceId: id,
          resourceTitle: data.name,
        });
      } catch (err) {
        logger.error('获取计算器详情失败', err);
        setError('加载失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (name: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [name]: value }));
    setResult(null);
  };

  const handleCalculate = async () => {
    if (!calculator || !id) return;

    const missingFields = calculator.inputSchema
      .filter((field) => field.required && !inputValues[field.name])
      .map((field) => field.label);

    if (missingFields.length > 0) {
      toast.error(`请填写必填项：${missingFields.join('、')}`);
      return;
    }

    setCalculating(true);
    try {
      const numericParams: Record<string, number> = {};
      const textParams: Record<string, string> = {};

      calculator.inputSchema.forEach((field) => {
        const value = inputValues[field.name];
        if (field.type === 'number' || field.type === 'select') {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            numericParams[field.name] = numValue;
          }
        } else {
          textParams[field.name] = value;
        }
      });

      const params = { ...numericParams, ...textParams };
      const res = await calculate({ params }, id);
      setResult(res.result);
    } catch (err) {
      logger.error('计算失败', err);
      toast.error('计算失败，请检查输入参数');
    } finally {
      setCalculating(false);
    }
  };

  const handleCopyResult = () => {
    if (!result) return;
    const text = Object.entries(result)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    try {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('结果已复制');
    } catch (err) {
      toast.error('复制失败');
    }
  };

  const renderInputField = (field: CalculatorInputField) => {
    const value = inputValues[field.name] || '';

    if (field.type === 'select' && field.options) {
      return (
        <Select value={value} onValueChange={(v) => handleInputChange(field.name, v)}>
          <SelectTrigger className="h-12 bg-white border-[#F3F4F6] rounded-xl text-[#1E293B] focus:border-[#FACC15] focus:ring-[#FACC15]/20">
            <SelectValue placeholder={`选择${field.label}`} />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#F3F4F6] rounded-xl">
            {field.options.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="text-[#1E293B] focus:bg-[#F9FAFB]"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <div className="relative">
        <Input
          type={field.type === 'number' ? 'number' : 'text'}
          value={value}
          onChange={(e) => handleInputChange(field.name, e.target.value)}
          placeholder={`输入${field.label}`}
          className="h-12 pr-12 bg-white border-[#F3F4F6] rounded-xl text-[#1E293B] placeholder:text-[#9CA3AF] focus:border-[#FACC15] focus:ring-[#FACC15]/20"
          step="any"
        />
        {field.unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-sm font-medium">
            {field.unit}
          </span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#F3F4F6] border-t-[#FACC15] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !calculator) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Card className="bg-white rounded-[2rem] shadow-sm border border-[#F3F4F6] p-12 text-center">
          <p className="text-[#64748B] mb-6">{error || '未找到该计算器'}</p>
          <Button
            onClick={() => navigate('/calculator')}
            className="bg-[#FACC15] text-[#1E293B] hover:bg-[#EAB308] rounded-full font-bold"
          >
            返回计算器列表
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* 面包屑导航 */}
      <div className="flex items-center gap-2 mb-6 text-sm text-[#64748B]">
        <span className="hover:text-[#FACC15] transition-colors cursor-pointer" onClick={() => navigate('/calculator')}>计算器</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-[#1E293B]">{calculator.name}</span>
      </div>

      {/* 返回按钮 */}
      <Button
        variant="ghost"
        onClick={() => navigate('/calculator')}
        className="mb-4 pl-0 text-[#64748B] hover:text-[#1E293B] hover:bg-transparent"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">返回计算器列表</span>
      </Button>

      {/* 页面标题 */}
      <div className="bg-gradient-to-br from-[#FEF3C7] via-[#FEF9C3] to-[#ECFDF5] rounded-[2rem] p-8 mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <CalcIcon className="w-7 h-7 text-[#FACC15]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1E293B]">{calculator.name}</h1>
              <p className="text-sm text-[#64748B]">{calculator.description}</p>
            </div>
          </div>
        </div>
        <Badge className="absolute top-6 right-6 rounded-full bg-white text-[#64748B] border-0 shadow-sm font-bold text-xs">
          {calculator.category}
        </Badge>
      </div>

      {/* 主内容 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 输入区域 */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white rounded-[2rem] shadow-sm border border-[#F3F4F6] overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-[#F3F4F6]">
              <CardTitle className="text-lg font-bold tracking-tight text-[#1E293B]">
                输入参数
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-5">
                {calculator.inputSchema.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-bold text-[#1E293B] mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                      {field.unit && (
                        <span className="text-[#9CA3AF] ml-1 font-medium">({field.unit})</span>
                      )}
                    </label>
                    {renderInputField(field)}
                  </div>
                ))}
              </div>
              <Button
                onClick={handleCalculate}
                disabled={calculating}
                className="w-full mt-6 h-12 bg-[#FACC15] hover:bg-[#EAB308] text-[#1E293B] rounded-full font-bold text-base"
              >
                {calculating ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <CalcIcon className="w-5 h-5 mr-2" />
                )}
                开始计算
              </Button>
            </CardContent>
          </Card>

          {/* 参考信息 */}
          {calculator.referenceInfo && (
            <Card className="bg-white rounded-[2rem] shadow-sm border border-[#F3F4F6] overflow-hidden">
              <CardHeader className="p-6 pb-4 border-b border-[#F3F4F6]">
                <CardTitle className="text-lg font-bold tracking-tight text-[#1E293B] flex items-center gap-2">
                  <SquareFunction className="w-5 h-5 text-[#165DFF]" />
                  参考信息
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ReferenceInfoContent content={calculator.referenceInfo} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* 结果区域 */}
        <div className="lg:col-span-1">
          <Card className="bg-white rounded-[2rem] shadow-sm border border-[#F3F4F6] overflow-hidden sticky top-4">
            <CardHeader className="p-6 pb-4 border-b border-[#F3F4F6]">
              <CardTitle className="text-lg font-bold tracking-tight text-[#1E293B] flex items-center gap-2">
                <Code className="w-5 h-5 text-[#165DFF]" />
                计算结果
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {result ? (
                <div className="space-y-4">
                  {calculator.outputSchema.map((field) => (
                    <div
                      key={field.name}
                      className="p-4 bg-[#F9FAFB] rounded-xl border border-[#F3F4F6]"
                    >
                      <div className="text-sm text-[#64748B] mb-1">{field.label}</div>
                      <div className="text-2xl font-bold text-[#165DFF]">
                        {result[field.name]?.toFixed(4) || '-'}
                        {field.unit && (
                          <span className="text-sm ml-1 text-[#9CA3AF]">{field.unit}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={handleCopyResult}
                    className="w-full h-12 rounded-full border-[#E5E7EB] text-[#1E293B] hover:bg-[#F9FAFB] font-medium"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 mr-2 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5 mr-2" />
                    )}
                    {copied ? '已复制' : '复制结果'}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 text-[#9CA3AF]">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F9FAFB] flex items-center justify-center">
                    <Code className="w-8 h-8 text-[#E5E7EB]" />
                  </div>
                  <p className="text-sm">输入参数并点击计算</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalculatorDetailPage;
