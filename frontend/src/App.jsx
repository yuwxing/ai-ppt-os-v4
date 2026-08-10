import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SmartLayout from './components/SmartLayout';
import AuthPage from './pages/AuthPage';
import PrepPage from './pages/PrepPage';
import TeachPage from './pages/TeachPage';
import HomeworkPage from './pages/HomeworkPage';
import TestPage from './pages/TestPage';
import EvaluatePage from './pages/EvaluatePage';
import GradingPage from './pages/GradingPage';
import LessonLibrary from './pages/LessonLibrary';
import LessonEditor from './pages/LessonEditor';
import LessonPlay from './pages/LessonPlay';
import GeneratePage from './pages/GeneratePage';
import LessonViewer from './pages/LessonViewer';
import HomePage from './pages/HomePage';
import TemplatesPage from './pages/TemplatesPage';

function SmartPage({ children }) {
  return <SmartLayout>{children}</SmartLayout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />

      {/* 备课 */}
      <Route path="/prep" element={<SmartPage><PrepPage /></SmartPage>} />
      <Route path="/prep/generate" element={<SmartPage><GeneratePage /></SmartPage>} />
      <Route path="/prep/templates" element={<SmartPage><TemplatesPage /></SmartPage>} />
      <Route path="/lessons" element={<SmartPage><LessonLibrary /></SmartPage>} />
      <Route path="/lessons/new" element={<SmartPage><LessonEditor /></SmartPage>} />
      <Route path="/lessons/edit/:id" element={<SmartPage><LessonEditor /></SmartPage>} />
      <Route path="/lessons/play/:id" element={<LessonPlay />} />

      {/* 上课 */}
      <Route path="/teach" element={<SmartPage><TeachPage /></SmartPage>} />

      {/* 作业 */}
      <Route path="/homework" element={<SmartPage><HomeworkPage /></SmartPage>} />

      {/* 检测 */}
      <Route path="/test" element={<SmartPage><TestPage /></SmartPage>} />

      {/* 阅卷 */}
      <Route path="/grading" element={<SmartPage><GradingPage /></SmartPage>} />

      {/* 评价 */}
      <Route path="/evaluate" element={<SmartPage><EvaluatePage /></SmartPage>} />

      {/* 课件预览（全屏沉浸式，无导航栏） */}
      <Route path="/lessons/view/:id" element={<LessonViewer />} />

      {/* Redirects */}
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/prep" replace />} />
    </Routes>
  );
}
