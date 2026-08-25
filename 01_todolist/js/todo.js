window.DoIt = window.DoIt || {};

(function (D) {
  const categoryLabels = {
    uncategorized: "미분류",
    work: "회사",
    personal: "개인",
    study: "공부",
    exercise: "운동",
    etc: "기타"
  };

  const priorityLabels = {
    high: "높음",
    normal: "보통",
    low: "낮음"
  };

  const repeatLabels = {
    none: "반복 없음",
    daily: "매일",
    weekly: "매주",
    monthly: "매월"
  };

  function parseLocalDate(dateString) {
    if (!dateString) return null;
    const [y, m, d] = dateString.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function formatDateInput(date) {
    return D.storage.localDateString(date);
  }

  function addDays(dateString, days) {
    const date = parseLocalDate(dateString);
    date.setDate(date.getDate() + days);
    return formatDateInput(date);
  }

  function addMonths(dateString, months) {
    const date = parseLocalDate(dateString);
    const originalDay = date.getDate();
    date.setDate(1);
    date.setMonth(date.getMonth() + months);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    date.setDate(Math.min(originalDay, lastDay));
    return formatDateInput(date);
  }

  function nextRepeatDate(todo) {
    if (!todo.dueDate) return null;
    if (todo.repeat === "daily") return addDays(todo.dueDate, 1);
    if (todo.repeat === "weekly") return addDays(todo.dueDate, 7);
    if (todo.repeat === "monthly") return addMonths(todo.dueDate, 1);
    return null;
  }

  function createTodo(title, defaults = {}) {
    const now = new Date().toISOString();
    return D.storage.normalizeTodo({
      id: D.storage.createId(),
      title,
      memo: "",
      dueDate: defaults.dueDate || null,
      dueTime: null,
      priority: "normal",
      category: defaults.category || "uncategorized",
      completed: false,
      completedAt: null,
      repeat: "none",
      reminderEnabled: false,
      reminderMinutes: 10,
      reminderSentAt: null,
      createdAt: now,
      updatedAt: now
    });
  }

  function updateTodo(todo, changes) {
    const reminderChanged =
      changes.dueDate !== undefined && changes.dueDate !== todo.dueDate ||
      changes.dueTime !== undefined && changes.dueTime !== todo.dueTime ||
      changes.reminderEnabled !== undefined && changes.reminderEnabled !== todo.reminderEnabled ||
      changes.reminderMinutes !== undefined && Number(changes.reminderMinutes) !== Number(todo.reminderMinutes);

    Object.assign(todo, changes, { updatedAt: new Date().toISOString() });
    if (reminderChanged) todo.reminderSentAt = null;
    return todo;
  }

  function toggleTodo(todos, todoId) {
    const todo = todos.find(item => item.id === todoId);
    if (!todo) return { todo: null, createdNext: null };

    const wasCompleted = todo.completed;
    todo.completed = !todo.completed;
    todo.completedAt = todo.completed ? new Date().toISOString() : null;
    todo.updatedAt = new Date().toISOString();

    let createdNext = null;

    if (!wasCompleted && todo.completed && todo.repeat !== "none" && todo.dueDate && !todo.nextOccurrenceId) {
      const nextDate = nextRepeatDate(todo);
      if (nextDate) {
        const now = new Date().toISOString();
        createdNext = D.storage.normalizeTodo({
          ...todo,
          id: D.storage.createId(),
          completed: false,
          completedAt: null,
          dueDate: nextDate,
          reminderSentAt: null,
          recurrenceRootId: todo.recurrenceRootId || todo.id,
          nextOccurrenceId: null,
          createdAt: now,
          updatedAt: now
        });
        todo.nextOccurrenceId = createdNext.id;
        todos.unshift(createdNext);
      }
    }

    return { todo, createdNext };
  }

  function getTodayString() {
    return D.storage.localDateString();
  }

  function getTomorrowString() {
    return addDays(getTodayString(), 1);
  }

  function isOverdue(todo) {
    return Boolean(!todo.completed && todo.dueDate && todo.dueDate < getTodayString());
  }

  function getViewTodos(todos, view) {
    const today = getTodayString();

    if (view === "today") {
      return todos.filter(t => t.dueDate === today || isOverdue(t));
    }
    if (view === "inbox") {
      return todos.filter(t => !t.dueDate);
    }
    if (view === "upcoming") {
      return todos.filter(t => t.dueDate && t.dueDate > today);
    }
    if (view === "completed") {
      return todos.filter(t => t.completed);
    }
    return [...todos];
  }

  function applyFilters(todos, filters) {
    const q = (filters.search || "").trim().toLowerCase();

    return todos.filter(todo => {
      if (q && !`${todo.title} ${todo.memo}`.toLowerCase().includes(q)) return false;
      if (filters.status === "active" && todo.completed) return false;
      if (filters.status === "completed" && !todo.completed) return false;
      if (filters.priority !== "all" && todo.priority !== filters.priority) return false;
      if (filters.category !== "all" && todo.category !== filters.category) return false;
      return true;
    });
  }

  function sortTodos(todos, sort) {
    const priorityWeight = { high: 0, normal: 1, low: 2 };
    const dateValue = todo => todo.dueDate ? `${todo.dueDate}T${todo.dueTime || "23:59"}` : "9999-12-31T23:59";

    return [...todos].sort((a, b) => {
      if (sort === "dateAsc") return dateValue(a).localeCompare(dateValue(b));
      if (sort === "dateDesc") return dateValue(b).localeCompare(dateValue(a));
      if (sort === "priority") return priorityWeight[a.priority] - priorityWeight[b.priority] || dateValue(a).localeCompare(dateValue(b));
      if (sort === "newest") return String(b.createdAt).localeCompare(String(a.createdAt));
      if (sort === "oldest") return String(a.createdAt).localeCompare(String(b.createdAt));

      if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
      if (isOverdue(a) !== isOverdue(b)) return Number(isOverdue(b)) - Number(isOverdue(a));
      return dateValue(a).localeCompare(dateValue(b)) || String(b.createdAt).localeCompare(String(a.createdAt));
    });
  }

  function getQuickAddDefaults(view) {
    if (view === "today") return { dueDate: getTodayString() };
    if (view === "inbox") return { dueDate: null };
    if (view === "upcoming") return { dueDate: getTomorrowString() };
    return { dueDate: getTodayString() };
  }

  D.todo = {
    categoryLabels, priorityLabels, repeatLabels,
    createTodo, updateTodo, toggleTodo,
    getTodayString, getTomorrowString, isOverdue,
    getViewTodos, applyFilters, sortTodos, getQuickAddDefaults,
    parseLocalDate
  };
})(window.DoIt);
