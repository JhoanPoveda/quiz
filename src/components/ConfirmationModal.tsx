import React from 'react';
import { AlertTriangle, CheckCircle2, FileSpreadsheet, FormInput, HardDrive, X } from 'lucide-react';
import { PreparedQuestion } from '../services/types';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userEmail?: string | null;
  formTitle: string;
  sheetTitle: string;
  questions: PreparedQuestion[];
  isSubmitting: boolean;
  stepMessage: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userEmail,
  formTitle,
  sheetTitle,
  questions,
  isSubmitting,
  stepMessage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <FormInput className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Confirmar creación en Google Workspace
              </h3>
              <p className="text-xs text-slate-500">
                Cuenta: <strong>{userEmail || 'Conectada'}</strong>
              </p>
            </div>
          </div>
          {!isSubmitting && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="py-4 space-y-3.5">
          <p className="text-xs text-slate-600">
            Se van a crear y configurar dos archivos vinculados en tu cuenta de Google Drive con las siguientes especificaciones:
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            {/* Form item */}
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-700 shrink-0">
                <FormInput className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-slate-900">
                  Google Form: <span className="font-mono text-purple-700">"{formTitle}"</span>
                </div>
                <div className="text-slate-500 mt-0.5">
                  • 1ª pregunta obligatoria: <strong>"Write your name"</strong> (texto corto)
                  <br />
                  • {questions.length} preguntas de checo con modo <strong>Quiz de calificación automática</strong> y 4 opciones cada una.
                </div>
              </div>
            </div>

            {/* Sheet item */}
            <div className="flex items-start space-x-3 pt-2 border-t border-slate-200/60">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-slate-900">
                  Google Sheet: <span className="font-mono text-emerald-700">"{sheetTitle}"</span>
                </div>
                <div className="text-slate-500 mt-0.5">
                  • Hoja de respuestas vinculada con columnas para nombres, respuestas de estudiantes y clave de respuestas correctas.
                </div>
              </div>
            </div>
          </div>

          {/* List of questions brief */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900">
            <div className="font-semibold mb-1 flex items-center space-x-1">
              <span>Preguntas a publicar ({questions.length}):</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-amber-800 max-h-24 overflow-y-auto">
              {questions.map((q, idx) => (
                <li key={idx} className="truncate">
                  {q.question} <strong className="text-emerald-700">✓ [{q.correctAnswer}]</strong>
                </li>
              ))}
            </ul>
          </div>

          {/* Submitting progress message */}
          {isSubmitting && (
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-center space-x-2 animate-pulse">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />
              <span className="font-medium">{stepMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all disabled:opacity-50 cursor-pointer flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creando en Google...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar y Crear en Google</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
