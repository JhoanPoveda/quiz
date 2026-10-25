import React, { useState } from 'react';
import { Check, Edit2, Sparkles, Trash2, User, Shuffle } from 'lucide-react';
import { PreparedQuestion } from '../services/types';
import { generateCzechDistractors, shuffleArray } from '../services/czechGrammar';

interface QuestionCardProps {
  question: PreparedQuestion;
  index: number;
  total: number;
  onUpdateQuestion: (updated: PreparedQuestion) => void;
  onDeleteQuestion: (id: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  total,
  onUpdateQuestion,
  onDeleteQuestion,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempQuestionTitle, setTempQuestionTitle] = useState(question.question);
  const [tempDistractors, setTempDistractors] = useState<string[]>([...question.distractors]);

  // Regenerate distractors using morphological Czech engine
  const handleRegenerateDistractors = () => {
    const newDistractors = generateCzechDistractors(question.correctAnswer, question.question);
    const newOptions = [question.correctAnswer, ...newDistractors];
    onUpdateQuestion({
      ...question,
      distractors: newDistractors,
      options: newOptions,
    });
    setTempDistractors(newDistractors);
  };

  // Shuffle the order of the 4 choices while keeping correctAnswer unchanged
  const handleShuffleOptions = () => {
    const shuffled = shuffleArray(question.options);
    onUpdateQuestion({
      ...question,
      options: shuffled,
    });
  };

  // Save manual edits to question or distractors
  const handleSaveEdits = () => {
    const newOptions = [question.correctAnswer, ...tempDistractors];
    onUpdateQuestion({
      ...question,
      question: tempQuestionTitle,
      distractors: tempDistractors,
      options: newOptions,
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pregunta {index + 1} de {total}
          </span>
          <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
            1 Punto (Quiz)
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handleShuffleOptions}
            type="button"
            title="Mezclar posición de opciones"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-xs flex items-center space-x-1"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mezclar</span>
          </button>
          <button
            onClick={handleRegenerateDistractors}
            type="button"
            title="Regenerar 3 distractores gramaticales"
            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer text-xs flex items-center space-x-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Regenerar distractores</span>
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            type="button"
            title="Editar pregunta"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteQuestion(question.id)}
            type="button"
            title="Eliminar pregunta"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Question Text */}
      {isEditing ? (
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Texto de la pregunta:
            </label>
            <input
              type="text"
              value={tempQuestionTitle}
              onChange={(e) => setTempQuestionTitle(e.target.value)}
              className="w-full text-sm font-medium px-3 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Distractores (opciones falsas similares para confundir):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {tempDistractors.map((d, dIdx) => (
                <input
                  key={dIdx}
                  type="text"
                  value={d}
                  onChange={(e) => {
                    const updated = [...tempDistractors];
                    updated[dIdx] = e.target.value;
                    setTempDistractors(updated);
                  }}
                  className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={`Distractor ${dIdx + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveEdits}
              className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      ) : (
        <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug mb-3">
          {question.question}
        </h3>
      )}

      {/* 4 Choices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {question.options.map((opt, optIdx) => {
          const isCorrect = opt.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
          return (
            <div
              key={optIdx}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                isCorrect
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold shadow-xs ring-1 ring-emerald-400/30'
                  : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100/50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCorrect
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {optIdx + 1}
                </span>
                <span className="text-sm font-medium tracking-wide">
                  {opt}
                </span>
              </div>

              {isCorrect ? (
                <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Correcta (JSON)</span>
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 font-normal">
                  Distractor
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const FirstQuestionCard: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl p-5 shadow-xs mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 rounded-md bg-sky-600 text-white text-xs font-bold flex items-center justify-center">
            0
          </span>
          <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">
            Pregunta #1 Obligatoria del Formulario
          </span>
        </div>
        <span className="text-[11px] bg-sky-100 text-sky-800 border border-sky-300 px-2.5 py-0.5 rounded-full font-semibold">
          Identificación de Estudiante
        </span>
      </div>

      <div className="flex items-start space-x-3 mt-2">
        <div className="w-9 h-9 rounded-xl bg-white border border-sky-200 flex items-center justify-center text-sky-600 shrink-0 shadow-xs">
          <User className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-slate-900 text-sm sm:text-base">
            Write your name
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Tipo: <strong>Respuesta corta de texto obligatoria</strong>. Los estudiantes escribirán su nombre completo antes de iniciar la evaluación.
          </p>
          <div className="mt-2 text-[11px] text-slate-500 bg-white/70 px-3 py-1.5 rounded-lg border border-sky-100 inline-block">
            Esta respuesta se enlazará automáticamente a la primera columna de la hoja de Google Sheets.
          </div>
        </div>
      </div>
    </div>
  );
};
