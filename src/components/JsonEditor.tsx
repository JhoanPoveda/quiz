import React, { useState } from 'react';
import { AlertCircle, Check, Code, FileJson, RefreshCw, Upload } from 'lucide-react';
import { RawQuestion } from '../services/types';
import { DEFAULT_CZECH_QUESTIONS } from '../data/presetQuestions';

interface JsonEditorProps {
  jsonString: string;
  onChange: (value: string) => void;
  onApplyParsedQuestions: (questions: RawQuestion[]) => void;
  parsedQuestionsCount: number;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  jsonString,
  onChange,
  onApplyParsedQuestions,
  parsedQuestionsCount,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Validate JSON string
  const handleFormatAndValidate = () => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        setError('El JSON debe ser un arreglo (array) de objetos: [ { question: "...", correctAnswer: "..." } ]');
        return;
      }

      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i];
        if (!item.question || typeof item.question !== 'string') {
          setError(`El elemento #${i + 1} no tiene un campo "question" válido.`);
          return;
        }
        if (!item.correctAnswer || typeof item.correctAnswer !== 'string') {
          setError(`El elemento #${i + 1} no tiene un campo "correctAnswer" válido.`);
          return;
        }
      }

      setError(null);
      const formatted = JSON.stringify(parsed, null, 2);
      onChange(formatted);
      onApplyParsedQuestions(parsed);
    } catch (err: any) {
      setError(`Error de sintaxis JSON: ${err.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onChange(content);
        try {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            setError(null);
            onApplyParsedQuestions(parsed);
          } else {
            setError('El archivo JSON cargado no es un arreglo de preguntas.');
          }
        } catch (err: any) {
          setError(`Error al leer archivo JSON: ${err.message}`);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleLoadPresets = () => {
    const formatted = JSON.stringify(DEFAULT_CZECH_QUESTIONS, null, 2);
    onChange(formatted);
    setError(null);
    onApplyParsedQuestions(DEFAULT_CZECH_QUESTIONS);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center space-x-2">
          <FileJson className="w-5 h-5 text-indigo-600" />
          <h2 className="font-semibold text-slate-800 text-sm sm:text-base">
            Editor de Preguntas en formato JSON
          </h2>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
            {parsedQuestionsCount} {parsedQuestionsCount === 1 ? 'pregunta' : 'preguntas'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Subir archivo .json</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={handleLoadPresets}
            type="button"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Cargar Ejemplo Checo</span>
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-3">
        Pega tu archivo <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">.json</code> con las preguntas y la propiedad <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">"correctAnswer"</code>. La respuesta correcta nunca será alterada.
      </p>

      {/* Textarea container */}
      <div className="relative font-mono text-xs">
        <textarea
          value={jsonString}
          onChange={(e) => {
            onChange(e.target.value);
            // reset error until format
            if (error) setError(null);
          }}
          rows={11}
          placeholder={`[
  {
    "correctAnswer": "rádi",
    "question": "Fill in the blank to express a group preference: My _____ sportujeme."
  }
]`}
          className="w-full p-3.5 bg-slate-900 text-sky-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-slate-800 leading-relaxed font-mono resize-y"
        />
      </div>

      {error && (
        <div className="mt-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-3 flex items-center justify-between">
        <div className="text-[11px] text-slate-400">
          Tip: Se generarán automáticamente 3 distractores checos confusos por cada pregunta.
        </div>
        <button
          onClick={handleFormatAndValidate}
          type="button"
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Code className="w-3.5 h-3.5" />
          <span>Validar y Aplicar al Cuestionario</span>
        </button>
      </div>
    </div>
  );
};
