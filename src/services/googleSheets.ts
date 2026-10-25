import { PreparedQuestion, SheetCreationResult } from './types';

/**
 * Creates a Google Spreadsheet associated with the Czech Quiz Form.
 * Configures headers for student names, question answers, scoring, and Form links.
 */
export async function createCzechGoogleSheet(
  accessToken: string,
  sheetTitle: string,
  questions: PreparedQuestion[],
  formUrl?: string
): Promise<SheetCreationResult> {
  if (!accessToken) {
    throw new Error('No se encontró el token de autenticación de Google.');
  }

  // 1. Create the spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: sheetTitle,
      },
      sheets: [
        {
          properties: {
            title: 'Respuestas de Estudiantes',
            gridProperties: {
              frozenRowCount: 1,
              frozenColumnCount: 2,
            },
          },
        },
        {
          properties: {
            title: 'Guía y Clave de Respuestas',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    console.error('Error creating spreadsheet:', errorText);
    throw new Error(`Error al crear la hoja de cálculo en Google Sheets: ${createRes.status} ${createRes.statusText}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Populate Headers on 'Respuestas de Estudiantes'
  const headerRow = [
    'Marca temporal (Timestamp)',
    'Nombre del estudiante (Write your name)',
    ...questions.map((q, idx) => `P${idx + 1}: ${q.question}`),
    'Puntaje Final',
    'Enlace al Formulario',
  ];

  const answerKeyRow = [
    'CLAVE CORRECTA',
    'Sistema Evaluador',
    ...questions.map((q) => q.correctAnswer),
    `${questions.length} / ${questions.length} pts`,
    formUrl || spreadsheetUrl,
  ];

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Respuestas de Estudiantes!A1:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: 'Respuestas de Estudiantes!A1',
      majorDimension: 'ROWS',
      values: [headerRow, answerKeyRow],
    }),
  });

  // 3. Populate 'Guía y Clave de Respuestas'
  const guideHeaders = [
    '#',
    'Pregunta',
    'Respuesta Correcta',
    'Opción Distractora 1',
    'Opción Distractora 2',
    'Opción Distractora 3',
  ];

  const guideRows = questions.map((q, idx) => [
    idx + 1,
    q.question,
    q.correctAnswer,
    q.distractors[0] || '',
    q.distractors[1] || '',
    q.distractors[2] || '',
  ]);

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Guía y Clave de Respuestas!A1:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: 'Guía y Clave de Respuestas!A1',
      majorDimension: 'ROWS',
      values: [guideHeaders, ...guideRows],
    }),
  });

  // 4. Polish format with batchUpdate (Styling header colors and bold font)
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: sheetData.sheets[0].properties.sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.08, green: 0.38, blue: 0.74 }, // Deep Czech blue
                  textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
          {
            repeatCell: {
              range: {
                sheetId: sheetData.sheets[0].properties.sheetId,
                startRowIndex: 1,
                endRowIndex: 2,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.9, green: 0.96, blue: 0.9 }, // Soft green for answer key row
                  textFormat: { bold: true, italic: true },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: sheetData.sheets[0].properties.sheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: headerRow.length,
              },
            },
          },
        ],
      }),
    });
  } catch (styleErr) {
    console.warn('Formatting spreadsheet headers succeeded with minor warning:', styleErr);
  }

  return {
    spreadsheetId,
    spreadsheetTitle: sheetTitle,
    spreadsheetUrl,
  };
}
