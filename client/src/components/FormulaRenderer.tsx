import React from 'react';
import katex from 'katex';
import { logger } from '@lark-apaas/client-toolkit/logger';

interface FormulaRendererProps {
  latex: string;
  displayMode?: boolean;
}

export const FormulaRenderer: React.FC<FormulaRendererProps> = ({ latex, displayMode = false }) => {
  const formula = latex.trim();

  try {
    const html = katex.renderToString(formula, {
      throwOnError: false,
      displayMode: displayMode,
    });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  } catch (err) {
    logger.error('KaTeX 渲染失败', err);
    return <span className="font-mono text-sm">{formula}</span>;
  }
};
