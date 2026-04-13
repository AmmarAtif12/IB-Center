import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { loadState, saveState } from '../utils/storage';

const defaultState = {
  onboarded: false,
  profile: { name: '', school: '', programme: 'DP', year: 'Year 1', examSession: '' },
  subjects: [],
  gradeComponents: {},
  tokGrade: '',
  eeGrade: '',
  assignments: [],
  notes: {},
  resources: {},
  checklist: {},
  casEntries: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STATE': return { ...action.payload };
    case 'COMPLETE_ONBOARDING': return { ...state, onboarded: true, profile: action.profile, subjects: action.subjects };
    case 'UPDATE_PROFILE': return { ...state, profile: { ...state.profile, ...action.payload } };
    case 'ADD_SUBJECT': return { ...state, subjects: [...state.subjects, action.subject] };
    case 'UPDATE_SUBJECT': return { ...state, subjects: state.subjects.map(s => s.id === action.subject.id ? action.subject : s) };
    case 'DELETE_SUBJECT': {
      const { [action.id]: _gc, ...restGC } = state.gradeComponents;
      const { [action.id]: _n, ...restN } = state.notes;
      const { [action.id]: _r, ...restR } = state.resources;
      const { [action.id]: _c, ...restC } = state.checklist;
      return {
        ...state,
        subjects: state.subjects.filter(s => s.id !== action.id),
        gradeComponents: restGC,
        notes: restN,
        resources: restR,
        checklist: restC,
        assignments: state.assignments.filter(a => a.subjectId !== action.id),
      };
    }
    case 'SET_GRADE_COMPONENTS': return { ...state, gradeComponents: { ...state.gradeComponents, [action.subjectId]: action.components } };
    case 'SET_TOK_GRADE': return { ...state, tokGrade: action.value };
    case 'SET_EE_GRADE': return { ...state, eeGrade: action.value };
    case 'ADD_ASSIGNMENT': return { ...state, assignments: [...state.assignments, action.assignment] };
    case 'UPDATE_ASSIGNMENT': return { ...state, assignments: state.assignments.map(a => a.id === action.assignment.id ? action.assignment : a) };
    case 'DELETE_ASSIGNMENT': return { ...state, assignments: state.assignments.filter(a => a.id !== action.id) };
    case 'SET_NOTES': return { ...state, notes: { ...state.notes, [action.subjectId]: action.notes } };
    case 'SET_RESOURCES': return { ...state, resources: { ...state.resources, [action.subjectId]: action.resources } };
    case 'SET_CHECKLIST': return { ...state, checklist: { ...state.checklist, [action.subjectId]: action.checklist } };
    case 'ADD_CAS_ENTRY': return { ...state, casEntries: [...state.casEntries, action.entry] };
    case 'DELETE_CAS_ENTRY': return { ...state, casEntries: state.casEntries.filter(e => e.id !== action.id) };
    case 'RESET': return { ...defaultState };
    default: return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const saved = loadState();
  const [state, dispatch] = useReducer(reducer, saved || defaultState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
