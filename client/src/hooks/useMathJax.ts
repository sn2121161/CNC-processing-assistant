import { useEffect, useState, useCallback } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export function useMathJax() {
  const [mathJaxReady, setMathJaxReady] = useState(false);

  useEffect(() => {
    // KaTeX 是同步加载的，直接设置为 ready
    setMathJaxReady(true);
  }, []);

  const renderFormula = useCallback((latex: string, displayMode = false): string => {
    if (!mathJaxReady) {
      return displayMode ? `$$${latex}$$` : `$${latex}$`;
    }

    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        strict: false,
      });
    } catch (err) {
      // 渲染失败时返回原始文本
      return displayMode ? `$$${latex}$$` : `$${latex}$`;
    }
  }, [mathJaxReady]);

  return { mathJaxReady, renderFormula };
}
