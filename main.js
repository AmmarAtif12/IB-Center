const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('./backend/database');

let mainWindow;
let db;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'IB Central',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#0a1628'
  });

  mainWindow.loadFile(path.join(__dirname, 'frontend', 'index.html'));
}

app.whenReady().then(async () => {
  db = new Database();
  await db.ensureReady();
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (db) db.close();
  if (process.platform !== 'darwin') app.quit();
});

function registerIpcHandlers() {
  // ── Subjects ──
  ipcMain.handle('subjects:getAll', () => db.getAllSubjects());
  ipcMain.handle('subjects:add', (_e, subject) => db.addSubject(subject));
  ipcMain.handle('subjects:update', (_e, id, data) => db.updateSubject(id, data));
  ipcMain.handle('subjects:delete', (_e, id) => db.deleteSubject(id));

  // ── Grades ──
  ipcMain.handle('grades:getAll', () => db.getAllGrades());
  ipcMain.handle('grades:getBySubject', (_e, subjectId) => db.getGradesBySubject(subjectId));
  ipcMain.handle('grades:add', (_e, grade) => db.addGrade(grade));
  ipcMain.handle('grades:update', (_e, id, data) => db.updateGrade(id, data));
  ipcMain.handle('grades:delete', (_e, id) => db.deleteGrade(id));

  // ── Assignments ──
  ipcMain.handle('assignments:getAll', () => db.getAllAssignments());
  ipcMain.handle('assignments:add', (_e, assignment) => db.addAssignment(assignment));
  ipcMain.handle('assignments:update', (_e, id, data) => db.updateAssignment(id, data));
  ipcMain.handle('assignments:delete', (_e, id) => db.deleteAssignment(id));

  // ── Notes ──
  ipcMain.handle('notes:getBySubject', (_e, subjectId) => db.getNotesBySubject(subjectId));
  ipcMain.handle('notes:add', (_e, note) => db.addNote(note));
  ipcMain.handle('notes:update', (_e, id, data) => db.updateNote(id, data));
  ipcMain.handle('notes:delete', (_e, id) => db.deleteNote(id));

  // ── Dashboard ──
  ipcMain.handle('dashboard:getPredictedScore', () => db.getPredictedScore());
}
