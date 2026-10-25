import React, { useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  FileSpreadsheet,
  FormInput,
  Sparkles,
  Share2,
} from 'lucide-react';
import { DeploymentSummary } from '../services/types';

interface SuccessBannerProps {
  summary: DeploymentSummary;
  onDismiss: () => void;
}

export const SuccessBanner: React.FC<SuccessBannerProps> = ({ summary, onDismiss }) => {
  const [copiedLink, setCopiedLink] = useState<'form' | 'responder' | 'sheet' | null>(null);

  const copyToClipboard = (text: string, type: 'form' | 'responder' | 'sheet') => {
    navigator.clipboard.writeText(text);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  return (
    <div className="bg-gradient-to-br from-emerald-500/10 via-sky-500/10 to-indigo-500/10 border-2 border-emerald-500/40 rounded-3xl p-6 shadow-xl mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl flex items-center space-x-2">
              <span>¡Formulario y Hoja de Cálculo Creados con Éxito!</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Tu evaluación <strong>"{summary.form.formTitle}"</strong> está lista y vinculada a <strong>"{summary.sheet.spreadsheetTitle}"</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 bg-white/80 hover:bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs cursor-pointer transition-colors"
        >
          Cerrar panel
        </button>
      </div>

      {/* Main Action Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {/* Google Forms Card */}
        <div className="bg-white rounded-2xl p-4 border border-purple-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                <FormInput className="w-4 h-4" />
                <span>Google Forms ({summary.form.totalQuestions} preguntas)</span>
              </span>
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Modo Quiz Activo
              </span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">
              {summary.form.formTitle}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Incluye "Write your name" como primera pregunta y calificación automática de 1 punto por cada acierto en checo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4 pt-3 border-t border-slate-100">
            <a
              href={summary.form.editUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <span>Editar en Google Forms</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href={summary.form.responderUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-semibold border border-purple-200 transition-colors"
            >
              <span>Ver como Estudiante</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => copyToClipboard(summary.form.responderUrl, 'responder')}
              className="p-2 text-slate-600 hover:text-purple-700 bg-slate-50 hover:bg-purple-50 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              title="Copiar enlace para enviar a los alumnos"
            >
              {copiedLink === 'responder' ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Google Sheets Card */}
        <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Google Sheets Asociado</span>
              </span>
              <span className="text-[11px] font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                Hoja de Respuestas
              </span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">
              {summary.sheet.spreadsheetTitle}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Contiene las columnas preparadas para nombres de estudiantes, marcas temporales, respuestas registradas y la clave de respuestas correctas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4 pt-3 border-t border-slate-100">
            <a
              href={summary.sheet.spreadsheetUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <span>Abrir Hoja de Google Sheets</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => copyToClipboard(summary.sheet.spreadsheetUrl, 'sheet')}
              className="inline-flex items-center justify-center space-x-1 px-3 py-2 text-slate-600 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              {copiedLink === 'sheet' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar enlace</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
