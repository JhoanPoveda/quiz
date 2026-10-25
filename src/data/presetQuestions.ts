import { RawQuestion } from '../services/types';

export const DEFAULT_CZECH_QUESTIONS: RawQuestion[] = [
  {
    correctAnswer: 'rádi',
    question: "Fill in the blank to express a group preference: 'My _____ sportujeme.'",
  },
  {
    correctAnswer: 'černou',
    question: "Objednávka v kavárně: 'Dám si jednu _____ kávu, prosím.' (káva je rodu ženského)",
  },
  {
    correctAnswer: 'dělali',
    question: "Minulý čas: 'Co jste včera _____ vy dva?' (Petr a Tomáš)",
  },
  {
    correctAnswer: 'v Praze',
    question: "Lokál: 'Moje sestra studuje na univerzitě _____ už tři roky.' (Praha)",
  },
  {
    correctAnswer: 'rozumím',
    question: "Konjugace slovesa: 'Promiňte, ještě moc dobře česky _____.' (já - rozumět)",
  },
  {
    correctAnswer: 'studenou',
    question: "Akuzativ: 'V restauraci si objednám _____ minerálku.' (studená minerálka)",
  },
];
