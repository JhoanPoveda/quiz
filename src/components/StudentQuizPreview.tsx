import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, RotateCcw, User, XCircle } from 'lucide-react';
import { PreparedQuestion } from '../services/types';

interface StudentQuizPreviewProps {
  questions: PreparedQuestion[];
}

export const StudentQuizPreview: React.FC<StudentQuizPreviewProps> = ({ questions }) => {
  const [studentName, setStudentName] = useState('');
  const [answers, setAnswers] = useState<{ [qId: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelectOption = (qId: string, opt: string) => {
    if (submitted) return;
    setAnswers((prev) => ({
      ...prev,
      [qId]: opt,
    }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q) => {
      if (answers[q.id]?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        score += 1;
      }
    });
    return score;
  };

  const handleReset = () => {
    setStudentName('');
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-2xl mx-auto">
      {/* Header Form styling like Google Forms */}
      <div className="border-t-8 border-purple-600 rounded-xl bg-purple-50/50 p-5 mb-5 border border-purple-100">
        <h3 className="text-xl font-bold text-slate-900">evaluación czech</h3>
        <p className="text-xs text-slate-600 mt-1">
          Vista previa interactiva del formulario para estudiantes. Pon a prueba tus preguntas antes o después de exportar.
        </p>
        <div className="mt-3 text-[11px] text-red-500 font-medium">
          * Indica que la pregunta es obligatoria
        </div>
      </div>

      {submitted ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">
              ¡Evaluación Enviada con Éxito!
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              Estudiante: <strong>{studentName || 'Anónimo'}</strong>
            </p>
            <div className="mt-3 inline-block px-4 py-2 bg-emerald-100 text-emerald-900 font-extrabold rounded-xl text-lg">
              Puntuación: {calculateScore()} / {questions.length} ({Math.round((calculateScore() / questions.length) * 100)}%)
            </div>
          </div>

          {/* Detailed results per question */}
          <div className="text-left space-y-3 pt-3 border-t border-emerald-200 text-xs">
            {questions.map((q, idx) => {
              const studentChoice = answers[q.id];
              const isCorrect = studentChoice?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

              return (
                <div
                  key={q.id}
                  className={`p-3 rounded-xl border ${
                    isCorrect
                      ? 'bg-white border-emerald-300 text-emerald-900'
                      : 'bg-white border-red-300 text-red-900'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span>
                      {idx + 1}. {q.question}
                    </span>
                    <span className="flex items-center space-x-1">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">+1 pt</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-red-600 font-bold">0 pts</span>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Tu respuesta: <span className="font-medium">{studentChoice || '(Sin responder)'}</span>
                    {!isCorrect && (
                      <span className="text-emerald-700 font-semibold ml-2">
                        Respuesta correcta: {q.correctAnswer}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleReset}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl hover:bg-slate-900 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar Simulador</span>
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!studentName.trim()) {
              alert('Por favor escribe tu nombre en la primera pregunta.');
              return;
            }
            setSubmitted(true);
          }}
          className="space-y-4"
        >
          {/* Question 1: Write your name */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <label className="block text-sm font-semibold text-slate-900 mb-1">
              Write your name <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Ingresa tu nombre completo
            </p>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Tu nombre aquí..."
              className="w-full text-xs sm:text-sm px-3 py-2 border-b-2 border-slate-300 focus:border-purple-600 bg-transparent focus:outline-none transition-colors"
            />
          </div>

          {/* Czech Questions */}
          {questions.map((q, idx) => (
            <div key={q.id} className="border border-slate-200 rounded-xl p-4 bg-white">
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-900">
                  {idx + 1}. {q.question} <span className="text-red-500">*</span>
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">1 punto</span>
              </div>

              <div className="space-y-2">
                {q.options.map((opt, optIdx) => (
                  <label
                    key={optIdx}
                    className={`flex items-center space-x-3 p-2.5 rounded-lg border text-xs sm:text-sm cursor-pointer transition-colors ${
                      answers[q.id] === opt
                        ? 'border-purple-500 bg-purple-50/50 text-purple-950 font-medium'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q_${q.id}`}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => handleSelectOption(q.id, opt)}
                      className="text-purple-600 focus:ring-purple-500 h-4 w-4"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-purple-200 cursor-pointer"
            >
              Enviar Respuestas
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
