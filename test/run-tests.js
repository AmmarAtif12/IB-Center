// IB Central – Database Unit Tests
// Tests the SQLite database layer without requiring Electron.

const path = require('path');
const fs = require('fs');
const os = require('os');

// Mock Electron's app module so database.js can be required outside Electron
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ib-central-test-'));
const testDbPath = path.join(tmpDir, 'test.db');

// Provide a mock for `require('electron')` before loading the database module
const Module = require('module');
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent) {
  if (request === 'electron') {
    return request;
  }
  return originalResolve.apply(this, arguments);
};

const originalLoad = Module._load;
Module._load = function (request, parent) {
  if (request === 'electron') {
    return {
      app: {
        getPath: () => tmpDir
      }
    };
  }
  return originalLoad.apply(this, arguments);
};

const Database = require('../backend/database');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message} (expected ${expected}, got ${actual})`);
  }
}

let db;

async function setup() {
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  db = new Database(testDbPath);
  await db.ensureReady();
}

function teardown() {
  db.close();
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  try { fs.rmdirSync(tmpDir); } catch (_e) { /* ignore */ }
}

function testSubjects() {
  console.log('\n── Subjects ──');

  const s1 = db.addSubject({ name: 'Mathematics AA', level: 'HL', color: '#3b82f6' });
  assert(s1.id > 0, 'addSubject returns an id');
  assertEqual(s1.name, 'Mathematics AA', 'addSubject returns correct name');
  assertEqual(s1.level, 'HL', 'addSubject returns correct level');

  const s2 = db.addSubject({ name: 'English A', level: 'SL', color: '#8b5cf6' });
  const s3 = db.addSubject({ name: 'Physics', level: 'HL', color: '#22c55e' });

  const all = db.getAllSubjects();
  assertEqual(all.length, 3, 'getAllSubjects returns 3 subjects');

  const updated = db.updateSubject(s1.id, { name: 'Mathematics AI', level: 'SL', color: '#ef4444' });
  assertEqual(updated.name, 'Mathematics AI', 'updateSubject updates name');
  assertEqual(updated.level, 'SL', 'updateSubject updates level');

  db.deleteSubject(s3.id);
  const afterDelete = db.getAllSubjects();
  assertEqual(afterDelete.length, 2, 'deleteSubject removes subject');

  return { s1, s2 };
}

function testGrades(subjects) {
  console.log('\n── Grades ──');

  const g1 = db.addGrade({ subject_id: subjects.s1.id, assessment_name: 'Paper 1', score: 6, date: '2024-03-01' });
  assert(g1.id > 0, 'addGrade returns an id');
  assertEqual(g1.score, 6, 'addGrade returns correct score');

  db.addGrade({ subject_id: subjects.s1.id, assessment_name: 'Paper 2', score: 5, date: '2024-03-15' });
  db.addGrade({ subject_id: subjects.s2.id, assessment_name: 'Essay', score: 7, date: '2024-03-10' });

  const all = db.getAllGrades();
  assertEqual(all.length, 3, 'getAllGrades returns 3 grades');
  assert(all[0].subject_name !== undefined, 'getAllGrades includes subject_name');

  const bySubject = db.getGradesBySubject(subjects.s1.id);
  assertEqual(bySubject.length, 2, 'getGradesBySubject returns correct count');

  let errorCaught = false;
  try {
    db.addGrade({ subject_id: subjects.s1.id, assessment_name: 'Invalid', score: 8, date: '2024-03-01' });
  } catch (_e) {
    errorCaught = true;
  }
  assert(errorCaught, 'addGrade rejects score > 7');

  errorCaught = false;
  try {
    db.addGrade({ subject_id: subjects.s1.id, assessment_name: 'Invalid', score: 0, date: '2024-03-01' });
  } catch (_e) {
    errorCaught = true;
  }
  assert(errorCaught, 'addGrade rejects score < 1');

  const updatedG = db.updateGrade(g1.id, { assessment_name: 'Paper 1 Retake', score: 7, date: '2024-04-01' });
  assertEqual(updatedG.score, 7, 'updateGrade updates score');

  db.deleteGrade(g1.id);
  const afterDelete = db.getGradesBySubject(subjects.s1.id);
  assertEqual(afterDelete.length, 1, 'deleteGrade removes grade');
}

function testAssignments(subjects) {
  console.log('\n── Assignments ──');

  const a1 = db.addAssignment({
    subject_id: subjects.s1.id,
    title: 'Math IA Draft',
    description: 'First draft of internal assessment',
    due_date: '2024-04-15'
  });
  assert(a1.id > 0, 'addAssignment returns an id');
  assertEqual(a1.title, 'Math IA Draft', 'addAssignment returns correct title');
  assertEqual(a1.completed, 0, 'addAssignment defaults to not completed');

  db.addAssignment({
    subject_id: subjects.s2.id,
    title: 'English IOC',
    description: '',
    due_date: '2024-04-20'
  });

  db.addAssignment({
    title: 'CAS Reflection',
    due_date: '2024-05-01'
  });

  const all = db.getAllAssignments();
  assertEqual(all.length, 3, 'getAllAssignments returns 3 assignments');

  const toggled = db.updateAssignment(a1.id, { completed: 1 });
  assertEqual(toggled.completed, 1, 'updateAssignment toggles completion');

  db.deleteAssignment(a1.id);
  const afterDelete = db.getAllAssignments();
  assertEqual(afterDelete.length, 2, 'deleteAssignment removes assignment');
}

function testNotes(subjects) {
  console.log('\n── Notes ──');

  const n1 = db.addNote({
    subject_id: subjects.s1.id,
    title: 'Chapter 1 Summary',
    content: 'Key concepts from chapter 1...'
  });
  assert(n1.id > 0, 'addNote returns an id');
  assertEqual(n1.title, 'Chapter 1 Summary', 'addNote returns correct title');

  db.addNote({
    subject_id: subjects.s1.id,
    title: 'Chapter 2 Summary',
    content: 'Key concepts from chapter 2...'
  });

  db.addNote({
    subject_id: subjects.s2.id,
    title: 'Essay Tips',
    content: 'Important tips for writing...'
  });

  const mathNotes = db.getNotesBySubject(subjects.s1.id);
  assertEqual(mathNotes.length, 2, 'getNotesBySubject returns correct count');

  const updated = db.updateNote(n1.id, { title: 'Ch1 Summary (Updated)', content: 'Updated content...' });
  assertEqual(updated.title, 'Ch1 Summary (Updated)', 'updateNote updates title');

  db.deleteNote(n1.id);
  const afterDelete = db.getNotesBySubject(subjects.s1.id);
  assertEqual(afterDelete.length, 1, 'deleteNote removes note');
}

function testDashboard(subjects) {
  console.log('\n── Dashboard / Predicted Score ──');

  db.addGrade({ subject_id: subjects.s1.id, assessment_name: 'Test A', score: 6, date: '2024-05-01' });
  db.addGrade({ subject_id: subjects.s1.id, assessment_name: 'Test B', score: 4, date: '2024-05-02' });
  db.addGrade({ subject_id: subjects.s2.id, assessment_name: 'Test C', score: 7, date: '2024-05-01' });

  const result = db.getPredictedScore();
  assertEqual(result.maxScore, 45, 'getPredictedScore returns maxScore 45');
  assertEqual(result.subjects.length, 2, 'getPredictedScore returns correct subject count');

  const mathSubject = result.subjects.find((s) => s.id === subjects.s1.id);
  assert(mathSubject !== undefined, 'getPredictedScore includes math subject');
  assert(mathSubject.avgScore >= 1 && mathSubject.avgScore <= 7, 'avgScore is in valid range');

  assert(result.totalPredicted > 0, 'totalPredicted is greater than 0');
  assert(result.totalPredicted <= 45, 'totalPredicted does not exceed 45');
}

function testCascadeDelete() {
  console.log('\n── Cascade Delete ──');

  const sub = db.addSubject({ name: 'History', level: 'SL', color: '#f59e0b' });
  db.addGrade({ subject_id: sub.id, assessment_name: 'Quiz', score: 5, date: '2024-06-01' });
  db.addNote({ subject_id: sub.id, title: 'WW2 Notes', content: 'Important dates...' });

  db.deleteSubject(sub.id);
  const grades = db.getGradesBySubject(sub.id);
  const notes = db.getNotesBySubject(sub.id);
  assertEqual(grades.length, 0, 'Cascade delete removes grades');
  assertEqual(notes.length, 0, 'Cascade delete removes notes');
}

// ── Run Tests ──
async function runTests() {
  console.log('IB Central – Database Tests\n============================');

  try {
    await setup();
    const subjects = testSubjects();
    testGrades(subjects);
    testAssignments(subjects);
    testNotes(subjects);
    testDashboard(subjects);
    testCascadeDelete();
    teardown();
  } catch (err) {
    console.error('\n❌ Unexpected error:', err);
    failed++;
  }

  console.log(`\n============================`);
  console.log(`Results: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('All tests passed! ✓');
    process.exit(0);
  }
}

runTests();
