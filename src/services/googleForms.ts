import { PreparedQuestion, FormCreationResult } from './types';

/**
 * Creates a Google Form titled "evaluación czech" with:
 * 1. Initial required question: "Write your name"
 * 2. Quiz mode enabled
 * 3. Each Czech question with 4 options and the exact correctAnswer graded with 1 point.
 */
export async function createCzechGoogleForm(
  accessToken: string,
  formTitle: string,
  questions: PreparedQuestion[],
  associatedSheetUrl?: string
): Promise<FormCreationResult> {
  if (!accessToken) {
    throw new Error('No se encontró el token de autenticación de Google.');
  }

  // 1. Create the initial blank form
  const createRes = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      info: {
        title: formTitle,
        documentTitle: formTitle,
      },
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    console.error('Error creating form:', errorText);
    throw new Error(`Error al crear el formulario en Google Forms: ${createRes.status} ${createRes.statusText}`);
  }

  const formData = await createRes.json();
  const formId = formData.formId;
  const responderUri = formData.responderUri || `https://docs.google.com/forms/d/${formId}/viewform`;
  const editUrl = `https://docs.google.com/forms/d/${formId}/edit`;

  // 2. Prepare batchUpdate requests
  const requests: any[] = [];

  // Enable quiz settings
  requests.push({
    updateSettings: {
      settings: {
        quizSettings: {
          isQuiz: true,
        },
      },
      updateMask: 'quizSettings.isQuiz',
    },
  });

  // Update Form Description
  const descriptionText = associatedSheetUrl
    ? `Evaluación de checo. Respuestas registradas en Google Sheets: ${associatedSheetUrl}`
    : `Evaluación de conocimientos del idioma checo. Lee cada pregunta con atención y selecciona la opción correcta.`;

  requests.push({
    updateFormInfo: {
      info: {
        description: descriptionText,
      },
      updateMask: 'description',
    },
  });

  // Question 1 (Mandatory first question as requested): "Write your name"
  requests.push({
    createItem: {
      item: {
        title: 'Write your name',
        description: 'Please write your full name / Escribe tu nombre completo',
        questionItem: {
          question: {
            required: true,
            textQuestion: {
              paragraph: false,
            },
          },
        },
      },
      location: {
        index: 0,
      },
    },
  });

  // Add all Czech questions with 4 choices and exact correctAnswer grading
  questions.forEach((q, idx) => {
    requests.push({
      createItem: {
        item: {
          title: q.question,
          questionItem: {
            question: {
              required: true,
              grading: {
                pointValue: 1,
                correctAnswers: {
                  answers: [
                    {
                      value: q.correctAnswer,
                    },
                  ],
                },
              },
              choiceQuestion: {
                type: 'RADIO',
                options: q.options.map((opt) => ({
                  value: opt,
                })),
                shuffle: false,
              },
            },
          },
        },
        location: {
          index: idx + 1,
        },
      },
    });
  });

  // 3. Execute batchUpdate
  const safeFormId = encodeURIComponent(formId.trim());
  const updateRes = await fetch(`https://forms.googleapis.com/v1/forms/${safeFormId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests,
    }),
  });

  if (!updateRes.ok) {
    const updateError = await updateRes.text();
    console.error('Error updating form items:', updateError);
    throw new Error(`Error al configurar las preguntas del formulario: ${updateRes.status} ${updateRes.statusText}`);
  }

  return {
    formId,
    formTitle,
    editUrl,
    responderUrl: responderUri,
    totalQuestions: questions.length + 1, // +1 for "Write your name"
  };
}
