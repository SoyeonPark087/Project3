(function () {
  function createId() {
    if (window.crypto && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  }

  function createTodo(title, options = {}) {
    const now = new Date().toISOString();

    return {
      id: createId(),
      title: title.trim(),
      memo: "",
      dueDate:
        typeof options.dueDate === "string"
          ? options.dueDate
          : window.StorageService.getTodayValue(),
      dueTime: "",
      priority: "normal",
      category: options.category || "none",
      completed: false,
      createdAt: now,
      updatedAt: now
    };
  }

  function toggleTodo(todos, id) {
    const todo = todos.find((item) => item.id === id);
    if (!todo) return null;

    todo.completed = !todo.completed;
    todo.updatedAt = new Date().toISOString();
    return todo;
  }

  function updateTodo(todos, id, patch) {
    const todo = todos.find((item) => item.id === id);
    if (!todo) return null;

    todo.title = patch.title.trim();
    todo.memo = patch.memo.trim();
    todo.dueDate = patch.dueDate || "";
    todo.dueTime = patch.dueTime || "";
    todo.priority = patch.priority;
    todo.category = patch.category;
    todo.updatedAt = new Date().toISOString();

    return todo;
  }

  function removeTodo(todos, id) {
    const index = todos.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const [todo] = todos.splice(index, 1);
    return { todo, index };
  }

  function restoreTodo(todos, deleted) {
    if (!deleted) return;
    const index = Math.min(deleted.index, todos.length);
    todos.splice(index, 0, deleted.todo);
  }

  window.TodoService = {
    createTodo,
    toggleTodo,
    updateTodo,
    removeTodo,
    restoreTodo
  };
})();
