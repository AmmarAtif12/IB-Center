const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Subjects
  getSubjects: () => ipcRenderer.invoke('subjects:getAll'),
  addSubject: (subject) => ipcRenderer.invoke('subjects:add', subject),
  updateSubject: (id, data) => ipcRenderer.invoke('subjects:update', id, data),
  deleteSubject: (id) => ipcRenderer.invoke('subjects:delete', id),

  // Grades
  getGrades: () => ipcRenderer.invoke('grades:getAll'),
  getGradesBySubject: (subjectId) => ipcRenderer.invoke('grades:getBySubject', subjectId),
  addGrade: (grade) => ipcRenderer.invoke('grades:add', grade),
  updateGrade: (id, data) => ipcRenderer.invoke('grades:update', id, data),
  deleteGrade: (id) => ipcRenderer.invoke('grades:delete', id),

  // Assignments
  getAssignments: () => ipcRenderer.invoke('assignments:getAll'),
  addAssignment: (assignment) => ipcRenderer.invoke('assignments:add', assignment),
  updateAssignment: (id, data) => ipcRenderer.invoke('assignments:update', id, data),
  deleteAssignment: (id) => ipcRenderer.invoke('assignments:delete', id),

  // Notes
  getNotesBySubject: (subjectId) => ipcRenderer.invoke('notes:getBySubject', subjectId),
  addNote: (note) => ipcRenderer.invoke('notes:add', note),
  updateNote: (id, data) => ipcRenderer.invoke('notes:update', id, data),
  deleteNote: (id) => ipcRenderer.invoke('notes:delete', id),

  // Dashboard
  getPredictedScore: () => ipcRenderer.invoke('dashboard:getPredictedScore')
});
