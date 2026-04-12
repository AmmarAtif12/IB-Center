const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

class Database {
  constructor(dbPath) {
    this._dbPath = dbPath || path.join(app.getPath('userData'), 'ib-central.db');
    this._db = null;
    this._ready = this._init();
  }

  async _init() {
    const SQL = await initSqlJs();

    if (fs.existsSync(this._dbPath)) {
      const buffer = fs.readFileSync(this._dbPath);
      this._db = new SQL.Database(buffer);
    } else {
      this._db = new SQL.Database();
    }

    this._db.run('PRAGMA foreign_keys = ON');
    this._db.run(`CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT 'SL',
      color TEXT NOT NULL DEFAULT '#3b82f6',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`);
    this._db.run(`CREATE TABLE IF NOT EXISTS grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER NOT NULL,
      assessment_name TEXT NOT NULL,
      score INTEGER NOT NULL CHECK(score >= 1 AND score <= 7),
      date TEXT NOT NULL DEFAULT (date('now')),
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    )`);
    this._db.run(`CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      due_date TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
    )`);
    this._db.run(`CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    )`);

    this._save();
  }

  /** Wait until the database is ready (call from IPC handlers). */
  async ensureReady() {
    await this._ready;
  }

  _save() {
    if (!this._db) return;
    const data = this._db.export();
    const buffer = Buffer.from(data);
    const dir = path.dirname(this._dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this._dbPath, buffer);
    // Re-apply PRAGMA after export (export can reset session-level settings)
    this._db.run('PRAGMA foreign_keys = ON');
  }

  _queryAll(sql, params) {
    const stmt = this._db.prepare(sql);
    if (params) stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  _queryOne(sql, params) {
    const results = this._queryAll(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  _run(sql, params) {
    this._db.run(sql, params);
    this._save();
  }

  _insert(sql, params) {
    this._db.run(sql, params);
    const id = this._db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
    this._save();
    return id;
  }

  // ── Subjects ──
  getAllSubjects() {
    return this._queryAll('SELECT * FROM subjects ORDER BY name');
  }

  addSubject({ name, level, color }) {
    const id = this._insert(
      'INSERT INTO subjects (name, level, color) VALUES (?, ?, ?)',
      [name, level || 'SL', color || '#3b82f6']
    );
    return { id, name, level: level || 'SL', color: color || '#3b82f6' };
  }

  updateSubject(id, { name, level, color }) {
    this._run('UPDATE subjects SET name = ?, level = ?, color = ? WHERE id = ?', [name, level, color, id]);
    return this._queryOne('SELECT * FROM subjects WHERE id = ?', [id]);
  }

  deleteSubject(id) {
    this._run('DELETE FROM subjects WHERE id = ?', [id]);
    return { success: true };
  }

  // ── Grades ──
  getAllGrades() {
    return this._queryAll(`
      SELECT g.*, s.name as subject_name, s.color as subject_color
      FROM grades g
      LEFT JOIN subjects s ON g.subject_id = s.id
      ORDER BY g.date DESC
    `);
  }

  getGradesBySubject(subjectId) {
    return this._queryAll('SELECT * FROM grades WHERE subject_id = ? ORDER BY date DESC', [subjectId]);
  }

  addGrade({ subject_id, assessment_name, score, date }) {
    const d = date || new Date().toISOString().split('T')[0];
    const id = this._insert(
      'INSERT INTO grades (subject_id, assessment_name, score, date) VALUES (?, ?, ?, ?)',
      [subject_id, assessment_name, score, d]
    );
    return { id, subject_id, assessment_name, score, date: d };
  }

  updateGrade(id, { assessment_name, score, date }) {
    this._run('UPDATE grades SET assessment_name = ?, score = ?, date = ? WHERE id = ?',
      [assessment_name, score, date, id]);
    return this._queryOne('SELECT * FROM grades WHERE id = ?', [id]);
  }

  deleteGrade(id) {
    this._run('DELETE FROM grades WHERE id = ?', [id]);
    return { success: true };
  }

  // ── Assignments ──
  getAllAssignments() {
    return this._queryAll(`
      SELECT a.*, s.name as subject_name, s.color as subject_color
      FROM assignments a
      LEFT JOIN subjects s ON a.subject_id = s.id
      ORDER BY a.due_date ASC
    `);
  }

  addAssignment({ subject_id, title, description, due_date }) {
    const id = this._insert(
      'INSERT INTO assignments (subject_id, title, description, due_date) VALUES (?, ?, ?, ?)',
      [subject_id || null, title, description || '', due_date]
    );
    return { id, subject_id, title, description, due_date, completed: 0 };
  }

  updateAssignment(id, data) {
    const current = this._queryOne('SELECT * FROM assignments WHERE id = ?', [id]);
    if (!current) return null;
    const merged = { ...current, ...data };
    this._run(
      'UPDATE assignments SET subject_id = ?, title = ?, description = ?, due_date = ?, completed = ? WHERE id = ?',
      [merged.subject_id, merged.title, merged.description, merged.due_date, merged.completed, id]
    );
    return this._queryOne('SELECT * FROM assignments WHERE id = ?', [id]);
  }

  deleteAssignment(id) {
    this._run('DELETE FROM assignments WHERE id = ?', [id]);
    return { success: true };
  }

  // ── Notes ──
  getNotesBySubject(subjectId) {
    return this._queryAll('SELECT * FROM notes WHERE subject_id = ? ORDER BY updated_at DESC', [subjectId]);
  }

  addNote({ subject_id, title, content }) {
    const id = this._insert(
      'INSERT INTO notes (subject_id, title, content) VALUES (?, ?, ?)',
      [subject_id, title, content || '']
    );
    return { id, subject_id, title, content: content || '' };
  }

  updateNote(id, { title, content }) {
    this._run(
      "UPDATE notes SET title = ?, content = ?, updated_at = datetime('now') WHERE id = ?",
      [title, content, id]
    );
    return this._queryOne('SELECT * FROM notes WHERE id = ?', [id]);
  }

  deleteNote(id) {
    this._run('DELETE FROM notes WHERE id = ?', [id]);
    return { success: true };
  }

  // ── Dashboard ──
  getPredictedScore() {
    const subjects = this.getAllSubjects();
    const result = { subjects: [], totalPredicted: 0, maxScore: 45 };

    for (const subject of subjects) {
      const grades = this.getGradesBySubject(subject.id);
      let avgScore = 0;
      if (grades.length > 0) {
        const sum = grades.reduce((acc, g) => acc + g.score, 0);
        avgScore = Math.round(sum / grades.length);
      }
      result.subjects.push({
        id: subject.id,
        name: subject.name,
        level: subject.level,
        color: subject.color,
        avgScore,
        gradeCount: grades.length
      });
      result.totalPredicted += avgScore;
    }

    return result;
  }

  close() {
    if (this._db) {
      this._save();
      this._db.close();
      this._db = null;
    }
  }
}

module.exports = Database;
