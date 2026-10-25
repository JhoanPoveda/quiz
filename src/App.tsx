import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import confetti from 'canvas-confetti';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FormInput,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Zap,
} from 'lucide-react';

import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './services/auth';
import {
  RawQuestion,
  PreparedQuestion,
  DeploymentSummary,
} from './services/types';
import { DEFAULT_CZECH_QUESTIONS } from './data/presetQuestions';
import { generateCzechDistractors, shuffleArray } from './services/czechGrammar';
import { createCzechGoogleForm } from './services/googleForms';
import { createCzechGoogleSheet } from './services/googleSheets';

import { Navbar } from './components/Navbar';
import { JsonEditor } from './components/JsonEditor';
import { QuestionCard, FirstQuestionCard } from './components/QuestionCard';
import { ConfirmationModal } from './components/ConfirmationModal';
import { SuccessBanner } from './components/SuccessBanner';
import { StudentQuizPreview } from './components/StudentQuizPreview';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Form & Sheet configuration titles
  const [formTitle, setFormTitle] = useState('evaluación czech');
  const [sheetTitle, setSheetTitle] = useState('evaluación czech (Respuestas)');

  // JSON string & Parsed questions
  const [jsonText, setJsonText] = useState(
    JSON.stringify(DEFAULT_CZECH_QUESTIONS, null, 2)
  );
  const [preparedQuestions, setPreparedQuestions] = useState<PreparedQuestion[]>([]);
  const [shuffleChoicesOnCreation, setShuffleChoicesOnCreation] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState('');
  const [deploymentSummary, setDeploymentSummary] = useState<DeploymentSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper to convert RawQuestion array into PreparedQuestion array with 3 distractors
  const processRawQuestions = (raws: RawQuestion[]): PreparedQuestion[] => {
    return raws.map((rq, idx) => {
      const distractors = generateCzechDistractors(rq.correctAnswer, rq.question);
      const options = shuffleChoicesOnCreation
        ? shuffleArray([rq.correctAnswer, ...distractors])
        : [rq.correctAnswer, ...distractors];

      return {
        id: `q_${Date.now()}_${idx}`,
        question: rq.question,
        correctAnswer: rq.correctAnswer,
        distractors,
        options,
      };
    });
  };

  // Initialize Auth & default questions
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );

    // Initial preparation of default questions
    setPreparedQuestions(processRawQuestions(DEFAULT_CZECH_QUESTIONS));

    return () => unsubscribe();
  }, []);

  // Update questions when user formats / applies new JSON
  const handleApplyParsedQuestions = (raws: RawQuestion[]) => {
    setPreparedQuestions(processRawQuestions(raws));
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(
        err.message || 'Error al iniciar sesión con Google. Por favor intenta de nuevo.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
  };

  // Update a single question
  const handleUpdateQuestion = (updated: PreparedQuestion) => {
    setPreparedQuestions((prev) =>
      prev.map((q) => (q.id === updated.id ? updated : q))
    );
  };

  // Delete a question
  const handleDeleteQuestion = (id: string) => {
    setPreparedQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // Add a new question manually
  const handleAddNewQuestion = () => {
    const newRaw: RawQuestion = {
      question: "Nová otázka: 'Vyberte správné slovo: _____'",
      correctAnswer: 'dobře',
    };
    const newPrepared = processRawQuestions([newRaw])[0];
    setPreparedQuestions((prev) => [...prev, newPrepared]);
  };

  // Toggle option shuffling
  const handleToggleShuffle = () => {
    const nextVal = !shuffleChoicesOnCreation;
    setShuffleChoicesOnCreation(nextVal);
    setPreparedQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        options: nextVal
          ? shuffleArray([q.correctAnswer, ...q.distractors])
          : [q.correctAnswer, ...q.distractors],
      }))
    );
  };

  // Open confirmation modal or trigger login
  const handleStartExport = () => {
    if (!user || !token) {
      handleLogin();
      return;
    }
    if (preparedQuestions.length === 0) {
      setErrorMessage('Debes tener al menos 1 pregunta de checo para crear el formulario.');
      return;
    }
    setErrorMessage(null);
    setIsConfirmModalOpen(true);
  };

  // Execute actual Google Workspace Creation
  const handleConfirmCreation = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let activeToken = token;
      if (!activeToken) {
        activeToken = await getAccessToken();
      }

      if (!activeToken) {
        throw new Error('Sesión de Google expirada. Por favor vuelve a conectar tu cuenta.');
      }

      // 1. Create Google Sheet
      setSubmissionStep('Creando hoja de cálculo en Google Sheets...');
      const sheetResult = await createCzechGoogleSheet(
        activeToken,
        sheetTitle,
        preparedQuestions
      );

      // 2. Create Google Form
      setSubmissionStep('Creando Google Form "evaluación czech" con modo Quiz...');
      const formResult = await createCzechGoogleForm(
        activeToken,
        formTitle,
        preparedQuestions,
        sheetResult.spreadsheetUrl
      );

      // 3. Success!
      setSubmissionStep('¡Completado con éxito!');
      setIsConfirmModalOpen(false);

      const summary: DeploymentSummary = {
        form: formResult,
        sheet: sheetResult,
        createdAt: new Date().toLocaleTimeString(),
        questionsCount: preparedQuestions.length,
      };
      setDeploymentSummary(summary);

      // Confetti celebration
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }
    } catch (err: any) {
      console.error('Error during Workspace export:', err);
      setErrorMessage(
        err.message || 'Ocurrió un error inesperado al crear el formulario u hoja de cálculo.'
      );
      setIsConfirmModalOpen(false);
    } finally {
      setIsSubmitting(false);
      setSubmissionStep('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error message banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start justify-between shadow-xs">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-800 font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}

        {/* Success deployment banner if ready */}
        {deploymentSummary && (
          <SuccessBanner
            summary={deploymentSummary}
            onDismiss={() => setDeploymentSummary(null)}
          />
        )}

        {/* Hero Section & Requirements Checklist */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 border border-slate-800 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-sky-300 mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Creador de Evaluaciones de Idioma Checo</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Diseñador de Formulario & Hoja de Respuestas
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Convierte tus preguntas en formato JSON en una evaluación completa en Google Forms con distractores similares que confunden al estudiante, manteniendo la respuesta correcta intacta y generando automáticamente su Google Sheet asociado.
            </p>

            {/* Checklist of user requirements */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/10 text-xs">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  <strong>"evaluación czech"</strong> en Google Forms con <strong>"Write your name"</strong> como primera pregunta.
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  <strong>3 distractores similares</strong> generados por pregunta (ej. <em>rádi</em> ➔ <em>rád</em>, <em>ráda</em>, <em>Neráda</em>).
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  <strong>Google Sheets</strong> generado y asociado para registrar respuestas y calificaciones.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs & Global Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2 bg-slate-200/70 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Preguntas & Distractores ({preparedQuestions.length})
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'preview'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Simulador del Estudiante</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleToggleShuffle}
              type="button"
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer flex items-center space-x-1.5 ${
                shuffleChoicesOnCreation
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                  : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
              title="Aleatoriza la posición de la respuesta correcta entre las 4 opciones"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{shuffleChoicesOnCreation ? 'Opciones: Posición Mezclada' : 'Opciones: Correcta en 1ª posición'}</span>
            </button>

            {/* Main Export Button */}
            <button
              onClick={handleStartExport}
              disabled={isSubmitting}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>
                {!user ? 'Conectar y Publicar en Google' : 'Crear Formulario & Sheet'}
              </span>
            </button>
          </div>
        </div>

        {/* Tab 1: Editor & Config */}
        {activeTab === 'editor' && (
          <div className="space-y-6">
            {/* Top Config Row */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
                  <FormInput className="w-3.5 h-3.5 text-purple-600" />
                  <span>Nombre del Formulario en Google Forms:</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full text-sm font-medium px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Requerido: se guardará con el nombre <strong>"evaluación czech"</strong>.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Nombre del Archivo en Google Sheets:</span>
                </label>
                <input
                  type="text"
                  value={sheetTitle}
                  onChange={(e) => setSheetTitle(e.target.value)}
                  className="w-full text-sm font-medium px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Hoja de cálculo asociada que guardará las respuestas de los estudiantes.
                </span>
              </div>
            </div>

            {/* JSON Input Component */}
            <JsonEditor
              jsonString={jsonText}
              onChange={setJsonText}
              onApplyParsedQuestions={handleApplyParsedQuestions}
              parsedQuestionsCount={preparedQuestions.length}
            />

            {/* Questions List & Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Estructura del Formulario ({preparedQuestions.length + 1} preguntas en total)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Revisa las preguntas y las 3 opciones distractoras calculadas para cada una.
                  </p>
                </div>

                <button
                  onClick={handleAddNewQuestion}
                  type="button"
                  className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Pregunta</span>
                </button>
              </div>

              {/* Mandatory Item 0: "Write your name" */}
              <FirstQuestionCard />

              {/* Questions 1..N */}
              <div className="space-y-4">
                {preparedQuestions.map((q, idx) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    index={idx}
                    total={preparedQuestions.length}
                    onUpdateQuestion={handleUpdateQuestion}
                    onDeleteQuestion={handleDeleteQuestion}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Student Simulation */}
        {activeTab === 'preview' && (
          <StudentQuizPreview questions={preparedQuestions} />
        )}
      </main>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmCreation}
        userEmail={user?.email}
        formTitle={formTitle}
        sheetTitle={sheetTitle}
        questions={preparedQuestions}
        isSubmitting={isSubmitting}
        stepMessage={submissionStep}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Czech Quiz Creator • Integrado con Google Forms API, Google Sheets API & Google Drive
          </span>
          <span className="font-mono text-slate-400 text-[11px]">
            gen-lang-client-0585541795
          </span>
        </div>
      </footer>
    </div>
  );
}
