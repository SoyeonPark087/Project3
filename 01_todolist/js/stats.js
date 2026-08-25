window.DoIt = window.DoIt || {};

(function (D) {
  function startOfDay(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function dateKey(date) {
    return D.storage.localDateString(date);
  }

  function completionRate(todos) {
    if (!todos.length) return 0;
    return Math.round(todos.filter(t => t.completed).length / todos.length * 100);
  }

  function getProgress(todos) {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    return {
      total,
      completed,
      remaining: total - completed,
      percent: total ? Math.round(completed / total * 100) : 0
    };
  }

  function getWeekRange() {
    const now = startOfDay();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const start = new Date(now);
    start.setDate(now.getDate() + diffToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start: dateKey(start), end: dateKey(end) };
  }

  function getWeeklyProgress(todos) {
    const { start, end } = getWeekRange();
    const weekly = todos.filter(t => t.dueDate && t.dueDate >= start && t.dueDate <= end);
    return getProgress(weekly);
  }

  function getSevenDayCompleted(todos) {
    const result = [];
    const formatter = new Intl.DateTimeFormat("ko-KR", { weekday: "short" });

    for (let i = 6; i >= 0; i--) {
      const date = startOfDay();
      date.setDate(date.getDate() - i);
      const key = dateKey(date);
      const count = todos.filter(t => t.completedAt && t.completedAt.slice(0, 10) === key).length;
      result.push({ key, label: formatter.format(date), count });
    }
    return result;
  }

  function getCategoryStats(todos) {
    return Object.entries(D.todo.categoryLabels).map(([key, label]) => {
      const items = todos.filter(t => t.category === key);
      return { key, label, ...getProgress(items) };
    }).filter(x => x.total > 0);
  }

  function getPriorityStats(todos) {
    return ["high", "normal", "low"].map(key => {
      const items = todos.filter(t => t.priority === key);
      return { key, label: D.todo.priorityLabels[key], ...getProgress(items) };
    });
  }

  function getStreak(todos) {
    const completedDates = new Set(
      todos.filter(t => t.completedAt).map(t => t.completedAt.slice(0, 10))
    );

    let streak = 0;
    const cursor = startOfDay();

    while (completedDates.has(dateKey(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  function buildStats(todos) {
    return {
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      completionRate: completionRate(todos),
      overdue: todos.filter(D.todo.isOverdue).length,
      streak: getStreak(todos),
      week: getWeeklyProgress(todos),
      sevenDays: getSevenDayCompleted(todos),
      categories: getCategoryStats(todos),
      priorities: getPriorityStats(todos)
    };
  }

  D.stats = { getProgress, buildStats };
})(window.DoIt);
