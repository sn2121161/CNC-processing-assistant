import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import NotFound from './pages/NotFound/NotFound';
import HomePage from './pages/HomePage/HomePage';
import KnowledgeBasePage from './pages/KnowledgeBasePage/KnowledgeBasePage';
import KnowledgeDetailPage from './pages/KnowledgeDetailPage/KnowledgeDetailPage';
import AIChatPage from './pages/AIChatPage/AIChatPage';
import GCodeGeneratePage from './pages/GCodeGeneratePage/GCodeGeneratePage';
import CalculatorPage from './pages/CalculatorPage/CalculatorPage';
import CalculatorDetailPage from './pages/CalculatorDetailPage/CalculatorDetailPage';

const RoutesComponent = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="knowledge" element={<KnowledgeBasePage />} />
        <Route path="knowledge/:id" element={<KnowledgeDetailPage />} />
        <Route path="ai-chat" element={<AIChatPage />} />
        <Route path="gcode-generate" element={<GCodeGeneratePage />} />
        <Route path="calculator" element={<CalculatorPage />} />
        <Route path="calculator/:id" element={<CalculatorDetailPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesComponent;
