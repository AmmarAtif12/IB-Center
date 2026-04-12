// ── IB Central – Renderer ──
// Handles all frontend logic: navigation, data display, and modal interactions.

(function () {
  'use strict';

  // ── Navigation ──
  const navLinks = document.querySelectorAll('.nav-link');
  const pages = document.querySelectorAll('.page');

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      navLinks.forEach((l) => l.classList.remove('active'));
      link.classList.add('active');
      pages.forEach((p) => p.classList.remove('active'));
      document.getElementById('page-' + page).classList.add('active');
      loadPage(page);
    });
  });

  function loadPage(page) {
    switch (page) {
      case 'dashboard': loadDashboard(); break;
      case 'grades': loadGrades(); break;
      case 'assignments': loadAssignments(); break;
      case 'subjects': loadSubjectsHub(); break;
    }
  }

  // ── Modal Helpers ──
  const modalOverlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalForm = document.getElementById('modal-form');
  const modalCancel = document.getElementById('modal-cancel');
  const modalSave = document.getElementById('modal-save');

  let currentModalSave = null;

  function openModal(title, fields, onSave) {
    modalTitle.textContent = title;
    modalForm.innerHTML = fields;
    currentModalSave = onSave;
    modalOverlay.classList.remove('hidden');
  }

  function closeModal() {
    modalOverlay.classList.add('hidden');
    currentModalSave = null;
  }

  modalCancel.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  modalSave.addEventListener('click', () => {
    if (currentModalSave) currentModalSave();
  });

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Dashboard ──
  async function loadDashboard() {
    const data = await window.api.getPredictedScore();
    const scoreEl = document.getElementById('predicted-score');
    const ringFg = document.querySelector('.ring-fg');
    const grid = document.getElementById('dashboard-subjects');

    const total = data.totalPredicted;
    scoreEl.textContent = total;

    // Animate ring
    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (total / 45) * circumference;
    ringFg.style.strokeDasharray = circumference;
    ringFg.style.strokeDashoffset = offset;

    if (data.subjects.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1">
          <div class="empty-icon">📚</div>
          <p>No subjects yet. Add subjects in the Subjects Hub to see your predicted score.</p>
        </div>`;
      return;
    }

    grid.innerHTML = data.subjects.map((s) => `
      <div class="dashboard-subject-card">
        <div class="subject-badge" style="background: ${escapeHtml(s.color)}">${escapeHtml(s.name.charAt(0))}</div>
        <div class="dashboard-subject-info">
          <h4>${escapeHtml(s.name)}</h4>
          <p>${escapeHtml(s.level)} · ${s.gradeCount} grade${s.gradeCount !== 1 ? 's' : ''}</p>
        </div>
        <div class="dashboard-subject-score">${s.avgScore || '–'}</div>
      </div>
    `).join('');
  }

  // ── Grade Tracker ──
  document.getElementById('btn-add-grade').addEventListener('click', async () => {
    const subjects = await window.api.getSubjects();
    if (subjects.length === 0) {
      openModal('Add Grade', '<p style="color:var(--text-secondary)">Please add subjects first in the Subjects Hub.</p>', closeModal);
      return;
    }
    const subjectOptions = subjects.map((s) =>
      `<option value="${s.id}">${escapeHtml(s.name)} (${escapeHtml(s.level)})</option>`
    ).join('');

    const scoreOptions = [7, 6, 5, 4, 3, 2, 1].map((n) =>
      `<option value="${n}">${n}</option>`
    ).join('');

    openModal('Add Grade', `
      <div class="form-group">
        <label>Subject</label>
        <select id="field-subject">${subjectOptions}</select>
      </div>
      <div class="form-group">
        <label>Assessment Name</label>
        <input type="text" id="field-name" placeholder="e.g. Paper 1 Mock" required />
      </div>
      <div class="form-group">
        <label>Score (1–7)</label>
        <select id="field-score">${scoreOptions}</select>
      </div>
      <div class="form-group">
        <label>Date</label>
        <input type="date" id="field-date" value="${new Date().toISOString().split('T')[0]}" />
      </div>
    `, async () => {
      const name = document.getElementById('field-name').value.trim();
      if (!name) return;
      await window.api.addGrade({
        subject_id: parseInt(document.getElementById('field-subject').value),
        assessment_name: name,
        score: parseInt(document.getElementById('field-score').value),
        date: document.getElementById('field-date').value
      });
      closeModal();
      loadGrades();
    });
  });

  async function loadGrades() {
    const grades = await window.api.getGrades();
    const container = document.getElementById('grades-list');

    if (grades.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <p>No grades recorded yet. Add your first grade to start tracking!</p>
        </div>`;
      return;
    }

    container.innerHTML = grades.map((g) => `
      <div class="grade-card">
        <div class="grade-subject-badge" style="background: ${escapeHtml(g.subject_color || '#3b82f6')}"></div>
        <div class="grade-info">
          <h4>${escapeHtml(g.assessment_name)}</h4>
          <p>${escapeHtml(g.subject_name || 'Unknown')} · ${escapeHtml(g.date)}</p>
        </div>
        <div class="grade-score" data-score="${g.score}">${g.score}</div>
        <div class="grade-actions">
          <button class="btn-icon" onclick="deleteGrade(${g.id})" title="Delete">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  window.deleteGrade = async function (id) {
    await window.api.deleteGrade(id);
    loadGrades();
  };

  // ── Assignments ──
  document.getElementById('btn-add-assignment').addEventListener('click', async () => {
    const subjects = await window.api.getSubjects();
    const subjectOptions = '<option value="">No subject</option>' +
      subjects.map((s) =>
        `<option value="${s.id}">${escapeHtml(s.name)} (${escapeHtml(s.level)})</option>`
      ).join('');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    openModal('Add Assignment', `
      <div class="form-group">
        <label>Title</label>
        <input type="text" id="field-title" placeholder="e.g. Math IA Draft" required />
      </div>
      <div class="form-group">
        <label>Subject (optional)</label>
        <select id="field-subject">${subjectOptions}</select>
      </div>
      <div class="form-group">
        <label>Due Date</label>
        <input type="date" id="field-due" value="${tomorrow.toISOString().split('T')[0]}" required />
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea id="field-desc" placeholder="Optional details..."></textarea>
      </div>
    `, async () => {
      const title = document.getElementById('field-title').value.trim();
      const due = document.getElementById('field-due').value;
      if (!title || !due) return;
      const subjectVal = document.getElementById('field-subject').value;
      await window.api.addAssignment({
        subject_id: subjectVal ? parseInt(subjectVal) : null,
        title,
        description: document.getElementById('field-desc').value.trim(),
        due_date: due
      });
      closeModal();
      loadAssignments();
    });
  });

  async function loadAssignments() {
    const assignments = await window.api.getAssignments();
    const container = document.getElementById('assignments-list');

    if (assignments.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📅</div>
          <p>No assignments yet. Add your first assignment to stay on track!</p>
        </div>`;
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    container.innerHTML = assignments.map((a) => {
      const due = new Date(a.due_date + 'T00:00:00');
      const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      let dueClass = 'due-later';
      let dueLabel = formatDate(a.due_date);
      if (a.completed) {
        dueClass = 'due-later';
        dueLabel = '✓ Done';
      } else if (diff < 0) {
        dueClass = 'due-overdue';
        dueLabel = 'Overdue';
      } else if (diff <= 3) {
        dueClass = 'due-soon';
        dueLabel = diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : `${diff} days`;
      }

      return `
        <div class="assignment-card ${a.completed ? 'completed' : ''}">
          <button class="assignment-checkbox ${a.completed ? 'checked' : ''}"
            onclick="toggleAssignment(${a.id}, ${a.completed ? 0 : 1})">${a.completed ? '✓' : ''}</button>
          <div class="assignment-info">
            <h4>${escapeHtml(a.title)}</h4>
            <p>${a.subject_name ? escapeHtml(a.subject_name) + ' · ' : ''}${escapeHtml(a.description || '')}</p>
          </div>
          <span class="assignment-due ${dueClass}">${dueLabel}</span>
          <div class="assignment-actions">
            <button class="btn-icon" onclick="deleteAssignment(${a.id})" title="Delete">🗑️</button>
          </div>
        </div>`;
    }).join('');
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  window.toggleAssignment = async function (id, completed) {
    await window.api.updateAssignment(id, { completed });
    loadAssignments();
  };

  window.deleteAssignment = async function (id) {
    await window.api.deleteAssignment(id);
    loadAssignments();
  };

  // ── Subjects Hub ──
  const subjectColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#06b6d4', '#ef4444', '#6366f1'];

  document.getElementById('btn-add-subject').addEventListener('click', () => {
    const colorOptions = subjectColors.map((c, i) =>
      `<label style="display:inline-block;margin:4px;cursor:pointer;">
        <input type="radio" name="color" value="${c}" ${i === 0 ? 'checked' : ''} style="display:none"/>
        <span style="display:inline-block;width:32px;height:32px;border-radius:8px;background:${c};border:3px solid transparent;" 
          onclick="this.parentElement.querySelector('input').checked=true;document.querySelectorAll('#color-picker span').forEach(s=>s.style.borderColor='transparent');this.style.borderColor='#fff'"></span>
      </label>`
    ).join('');

    openModal('Add Subject', `
      <div class="form-group">
        <label>Subject Name</label>
        <input type="text" id="field-name" placeholder="e.g. Mathematics AA" required />
      </div>
      <div class="form-group">
        <label>Level</label>
        <select id="field-level">
          <option value="HL">HL (Higher Level)</option>
          <option value="SL" selected>SL (Standard Level)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Color</label>
        <div id="color-picker">${colorOptions}</div>
      </div>
    `, async () => {
      const name = document.getElementById('field-name').value.trim();
      if (!name) return;
      const color = document.querySelector('#color-picker input[name="color"]:checked').value;
      await window.api.addSubject({
        name,
        level: document.getElementById('field-level').value,
        color
      });
      closeModal();
      loadSubjectsHub();
    });
  });

  let currentSubjectId = null;

  async function loadSubjectsHub() {
    const subjects = await window.api.getSubjects();
    const grid = document.getElementById('subjects-list');
    const notesPanel = document.getElementById('notes-panel');

    notesPanel.classList.add('hidden');
    grid.style.display = '';

    if (subjects.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1">
          <div class="empty-icon">📚</div>
          <p>No subjects added yet. Add your IB subjects to organize notes and resources.</p>
        </div>`;
      return;
    }

    grid.innerHTML = subjects.map((s) => `
      <div class="subject-card" onclick="openSubjectNotes(${s.id}, '${escapeHtml(s.name)}')">
        <div class="subject-card-actions">
          <button class="btn-icon" onclick="event.stopPropagation(); deleteSubject(${s.id})" title="Delete">🗑️</button>
        </div>
        <div class="subject-card-header">
          <div class="subject-card-badge" style="background: ${escapeHtml(s.color)}">${escapeHtml(s.name.charAt(0))}</div>
          <div>
            <h4>${escapeHtml(s.name)}</h4>
            <p>${escapeHtml(s.level)}</p>
          </div>
        </div>
        <p>Click to view notes & resources</p>
      </div>
    `).join('');
  }

  window.deleteSubject = async function (id) {
    await window.api.deleteSubject(id);
    loadSubjectsHub();
  };

  window.openSubjectNotes = async function (subjectId, subjectName) {
    currentSubjectId = subjectId;
    document.getElementById('subjects-list').style.display = 'none';
    document.getElementById('notes-panel').classList.remove('hidden');
    document.getElementById('notes-subject-title').textContent = subjectName + ' – Notes & Resources';
    loadNotes(subjectId);
  };

  document.getElementById('btn-back-subjects').addEventListener('click', () => {
    currentSubjectId = null;
    loadSubjectsHub();
  });

  document.getElementById('btn-add-note').addEventListener('click', () => {
    if (!currentSubjectId) return;
    openModal('Add Note', `
      <div class="form-group">
        <label>Title</label>
        <input type="text" id="field-title" placeholder="e.g. Chapter 5 Summary" required />
      </div>
      <div class="form-group">
        <label>Content</label>
        <textarea id="field-content" placeholder="Your notes here..." rows="8"></textarea>
      </div>
    `, async () => {
      const title = document.getElementById('field-title').value.trim();
      if (!title) return;
      await window.api.addNote({
        subject_id: currentSubjectId,
        title,
        content: document.getElementById('field-content').value
      });
      closeModal();
      loadNotes(currentSubjectId);
    });
  });

  async function loadNotes(subjectId) {
    const notes = await window.api.getNotesBySubject(subjectId);
    const container = document.getElementById('notes-list');

    if (notes.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <p>No notes yet for this subject. Add your first note!</p>
        </div>`;
      return;
    }

    container.innerHTML = notes.map((n) => `
      <div class="note-card">
        <div class="note-card-header">
          <h4>${escapeHtml(n.title)}</h4>
          <div class="note-actions">
            <button class="btn-icon" onclick="editNote(${n.id}, ${JSON.stringify(escapeHtml(n.title)).replace(/"/g, '&quot;')}, ${JSON.stringify(escapeHtml(n.content)).replace(/"/g, '&quot;')})" title="Edit">✏️</button>
            <button class="btn-icon" onclick="deleteNote(${n.id})" title="Delete">🗑️</button>
          </div>
        </div>
        <div class="note-card-content">${escapeHtml(n.content) || '<em style="color:var(--text-secondary)">No content</em>'}</div>
      </div>
    `).join('');
  }

  window.editNote = function (id, title, content) {
    openModal('Edit Note', `
      <div class="form-group">
        <label>Title</label>
        <input type="text" id="field-title" value="${title}" required />
      </div>
      <div class="form-group">
        <label>Content</label>
        <textarea id="field-content" rows="8">${content}</textarea>
      </div>
    `, async () => {
      const newTitle = document.getElementById('field-title').value.trim();
      if (!newTitle) return;
      await window.api.updateNote(id, {
        title: newTitle,
        content: document.getElementById('field-content').value
      });
      closeModal();
      loadNotes(currentSubjectId);
    });
  };

  window.deleteNote = async function (id) {
    await window.api.deleteNote(id);
    loadNotes(currentSubjectId);
  };

  // ── Initial Load ──
  loadDashboard();
})();
