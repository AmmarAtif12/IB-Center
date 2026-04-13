export const SUBJECT_COLOURS = [
  '#3b82f6','#8b5cf6','#ec4899','#f59e0b',
  '#22c55e','#06b6d4','#ef4444','#6366f1'
];

export const GROUPS = [
  { value: '1', label: 'Group 1 – Studies in Language & Literature' },
  { value: '2', label: 'Group 2 – Language Acquisition' },
  { value: '3', label: 'Group 3 – Individuals & Societies' },
  { value: '4', label: 'Group 4 – Sciences' },
  { value: '5', label: 'Group 5 – Mathematics' },
  { value: '6', label: 'Group 6 – The Arts' },
];

export function gradeFromPct(pct) {
  if (pct >= 80) return 7;
  if (pct >= 70) return 6;
  if (pct >= 60) return 5;
  if (pct >= 50) return 4;
  if (pct >= 40) return 3;
  if (pct >= 30) return 2;
  return 1;
}

export function calcSubjectPct(components) {
  let enteredWeight = 0, weightedSum = 0;
  components.forEach(c => {
    const score = parseFloat(c.score);
    if (c.score !== '' && c.score !== null && !isNaN(score)) {
      weightedSum += (Math.min(score, c.max) / c.max) * c.weight;
      enteredWeight += c.weight;
    }
  });
  if (enteredWeight === 0) return null;
  return (weightedSum / enteredWeight) * 100;
}

export function calcSubjectGrade(components) {
  const pct = calcSubjectPct(components);
  if (pct === null) return null;
  return gradeFromPct(pct);
}

export function tokEeBonus(tok, ee) {
  if (!tok || !ee) return null;
  if (tok === 'E' || ee === 'E') return 0;
  const combo = tok + ee;
  if (['AA','AB','BA'].includes(combo)) return 3;
  if (['BB','AC','CA'].includes(combo)) return 2;
  if (['BC','CB','CC'].includes(combo)) return 1;
  return 0;
}

export function gradeColour(grade) {
  if (grade >= 6) return '#22c55e';
  if (grade >= 4) return '#f59e0b';
  return '#ef4444';
}

export const CAS_LOS = [
  { id: 'LO1', label: 'LO1', desc: 'Identify own strengths and develop areas for growth' },
  { id: 'LO2', label: 'LO2', desc: 'Demonstrate that challenges have been undertaken' },
  { id: 'LO3', label: 'LO3', desc: 'Demonstrate how to initiate and plan a CAS experience' },
  { id: 'LO4', label: 'LO4', desc: 'Show commitment to and perseverance in CAS experiences' },
  { id: 'LO5', label: 'LO5', desc: 'Demonstrate the skills and recognise the benefits of working collaboratively' },
  { id: 'LO6', label: 'LO6', desc: 'Demonstrate engagement with issues of global significance' },
  { id: 'LO7', label: 'LO7', desc: 'Recognise and consider the ethics of choices and actions' },
];
