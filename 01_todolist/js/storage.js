window.DoIt = window.DoIt || {};

(function (D) {
  const STORAGE_KEY = "doit_todos";
  const SETTINGS_KEY = "doit_settings";

  function localDateString(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function addDays(base, days) {
    const date = new Date(base);
    date.setDate(date.getDate() + days);
    return localDateString(date);
  }

  function createId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  function normalizeTodo(raw) {
    const now = new Date().toISOString();
    return {
      id: raw.id || createId(),
      title: String(raw.title || "제목 없음"),
      memo: String(raw.memo || ""),
      dueDate: raw.dueDate || null,
      dueTime: raw.dueTime || null,
      priority: ["high", "normal", "low"].includes(raw.priority) ? raw.priority : "normal",
      category: ["uncategorized", "work", "personal", "study", "exercise", "etc"].includes(raw.category) ? raw.category : "uncategorized",
      completed: Boolean(raw.completed),
      completedAt: raw.completed ? (raw.completedAt || raw.updatedAt || raw.createdAt || now) : null,
      repeat: ["none", "daily", "weekly", "monthly"].includes(raw.repeat) ? raw.repeat : "none",
      reminderEnabled: Boolean(raw.reminderEnabled),
      reminderMinutes: Number.isFinite(Number(raw.reminderMinutes)) ? Number(raw.reminderMinutes) : 10,
      reminderSentAt: raw.reminderSentAt || null,
      recurrenceRootId: raw.recurrenceRootId || null,
      nextOccurrenceId: raw.nextOccurrenceId || null,
      createdAt: raw.createdAt || now,
      updatedAt: raw.updatedAt || raw.createdAt || now
    };
  }

  function seedTodos() {
    const today = localDateString();
    const tomorrow = addDays(new Date(), 1);
    const yesterday = addDays(new Date(), -1);
    const now = new Date().toISOString();

    return [
      normalizeTodo({
        id: createId(),
        title: "보고서 작성",
        memo: "팀장님 검토용 최종본 작성",
        dueDate: today,
        dueTime: "14:00",
        priority: "high",
        category: "work",
        completed: false,
        repeat: "none",
        createdAt: now
      }),
      normalizeTodo({
        id: createId(),
        title: "고객에게 전화",
        dueDate: today,
        dueTime: "16:00",
        priority: "normal",
        category: "work",
        completed: false,
        repeat: "none",
        createdAt: now
      }),
      normalizeTodo({
        id: createId(),
        title: "운동하기",
        dueDate: today,
        dueTime: "19:00",
        priority: "low",
        category: "exercise",
        completed: true,
        completedAt: now,
        repeat: "daily",
        createdAt: now
      }),
      normalizeTodo({
        id: createId(),
        title: "다음 주 발표 자료 구상",
        dueDate: tomorrow,
        priority: "high",
        category: "work",
        createdAt: now
      }),
      normalizeTodo({
        id: createId(),
        title: "읽을 책 정리",
        dueDate: null,
        priority: "low",
        category: "personal",
        createdAt: now
      }),
      normalizeTodo({
        id: createId(),
        title: "지난 일정 확인",
        dueDate: yesterday,
        priority: "normal",
        category: "personal",
        createdAt: now
      })
    ];
  }

  function loadTodos() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      const seeded = seedTodos();
      saveTodos(seeded);
      return seeded;
    }
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      const normalized = parsed.map(normalizeTodo);
      saveTodos(normalized);
      return normalized;
    } catch (error) {
      console.error("Todo 데이터를 불러오지 못했습니다.", error);
      return [];
    }
  }

  function saveTodos(todos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function loadSettings() {
    try {
      return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  D.storage = { loadTodos, saveTodos, loadSettings, saveSettings, normalizeTodo, createId, localDateString };
})(window.DoIt);
