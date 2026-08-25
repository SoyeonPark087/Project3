(function () {
  const STORAGE_KEY = "doit_todos";

  function getTodayValue() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function normalizeTodo(todo) {
    const createdAt = todo.createdAt || new Date().toISOString();

    return {
      id: todo.id || `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      title: typeof todo.title === "string" ? todo.title : "",
      memo: typeof todo.memo === "string" ? todo.memo : "",
      dueDate: typeof todo.dueDate === "string" ? todo.dueDate : getTodayValue(),
      dueTime: typeof todo.dueTime === "string" ? todo.dueTime : "",
      priority: ["high", "normal", "low"].includes(todo.priority) ? todo.priority : "normal",
      category: ["none", "work", "personal", "study", "exercise", "etc"].includes(todo.category)
        ? todo.category
        : "none",
      completed: Boolean(todo.completed),
      createdAt,
      updatedAt: todo.updatedAt || createdAt
    };
  }

  function getSeedTodos() {
    const today = getTodayValue();
    const now = new Date().toISOString();

    return [
      {
        id: "seed-report",
        title: "보고서 작성",
        memo: "팀장님 검토용 최종본 작성",
        dueDate: today,
        dueTime: "14:00",
        priority: "high",
        category: "work",
        completed: false,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "seed-call",
        title: "고객에게 전화",
        memo: "계약 일정 확인",
        dueDate: today,
        dueTime: "16:00",
        priority: "normal",
        category: "work",
        completed: false,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "seed-exercise",
        title: "운동하기",
        memo: "가볍게 40분",
        dueDate: today,
        dueTime: "19:00",
        priority: "low",
        category: "exercise",
        completed: true,
        createdAt: now,
        updatedAt: now
      }
    ];
  }

  function loadTodos() {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (!savedData) {
      return getSeedTodos();
    }

    try {
      const parsed = JSON.parse(savedData);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(normalizeTodo);
    } catch (error) {
      console.error("Todo 데이터를 불러오지 못했습니다.", error);
      return [];
    }
  }

  function saveTodos(todos) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error("Todo 데이터를 저장하지 못했습니다.", error);
    }
  }

  window.StorageService = {
    loadTodos,
    saveTodos,
    getTodayValue
  };
})();
