const refs = {
  todoForm: document.querySelector("#todoForm"),
  todoInput: document.querySelector("#todoInput"),
  todoList: document.querySelector("#todoList"),
  todayCount: document.querySelector("#todayCount"),
  inboxCount: document.querySelector("#inboxCount"),
  upcomingCount: document.querySelector("#upcomingCount"),
  mobileTodayCount: document.querySelector("#mobileTodayCount"),
  mobileInboxCount: document.querySelector("#mobileInboxCount"),
  mobileUpcomingCount: document.querySelector("#mobileUpcomingCount"),
  pageTitle: document.querySelector("#pageTitle"),
  pageDescription: document.querySelector("#pageDescription"),
  quickAddSection: document.querySelector("#quickAddSection"),
  filterSection: document.querySelector("#filterSection"),
  filterSearch: document.querySelector("#filterSearch"),
  filterStatus: document.querySelector("#filterStatus"),
  filterPriority: document.querySelector("#filterPriority"),
  filterCategory: document.querySelector("#filterCategory"),
  filterSort: document.querySelector("#filterSort"),
  filterResetButton: document.querySelector("#filterResetButton"),
  filterResultText: document.querySelector("#filterResultText"),
  filterActiveBadge: document.querySelector("#filterActiveBadge"),
  searchButton: document.querySelector("#searchButton"),
  todoSection: document.querySelector("#todoSection"),
  headingCount: document.querySelector("#headingCount"),
  headingCountLabel: document.querySelector("#headingCountLabel"),
  listTitle: document.querySelector("#listTitle"),
  listDescription: document.querySelector("#listDescription"),
  todoSummary: document.querySelector("#todoSummary"),
  emptyState: document.querySelector("#emptyState"),
  emptyTitle: document.querySelector("#emptyTitle"),
  emptyDescription: document.querySelector("#emptyDescription"),
  quickAddHelp: document.querySelector("#quickAddHelp"),
  categoryPanel: document.querySelector("#categoryPanel"),
  undoToast: document.querySelector("#undoToast"),
  undoButton: document.querySelector("#undoButton"),
  menuButton: document.querySelector("#menuButton"),
  mobileMenu: document.querySelector("#mobileMenu"),
  detailBackdrop: document.querySelector("#detailBackdrop"),
  detailPanel: document.querySelector("#detailPanel"),
  detailCloseButton: document.querySelector("#detailCloseButton"),
  detailForm: document.querySelector("#detailForm"),
  detailTodoId: document.querySelector("#detailTodoId"),
  detailTitle: document.querySelector("#detailTitle"),
  detailMemo: document.querySelector("#detailMemo"),
  detailDate: document.querySelector("#detailDate"),
  detailTime: document.querySelector("#detailTime"),
  detailPriority: document.querySelector("#detailPriority"),
  detailCategory: document.querySelector("#detailCategory"),
  clearScheduleButton: document.querySelector("#clearScheduleButton"),
  detailDeleteButton: document.querySelector("#detailDeleteButton")
};

let todos = [];
let currentView = "today";
let selectedCategory = "";
let lastDeletedTodo = null;
let undoTimer = null;

const filters = {
  search: "",
  status: "all",
  priority: "all",
  category: "all",
  sort: "smart"
};

function getBaseTodos() {
  return window.UIService.getViewTodos(todos, currentView, selectedCategory);
}

function getVisibleTodos() {
  return window.UIService.applyFilters(getBaseTodos(), filters);
}

function hasActiveFilter() {
  return (
    filters.search !== "" ||
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.category !== "all" ||
    filters.sort !== "smart"
  );
}

function updateFilterSummary(baseTodos, visibleTodos) {
  const incomplete = visibleTodos.filter((todo) => !todo.completed).length;

  if (baseTodos.length === visibleTodos.length && !hasActiveFilter()) {
    refs.filterResultText.textContent = `전체 ${baseTodos.length}개의 할 일을 표시하고 있습니다.`;
  } else {
    refs.filterResultText.textContent = `전체 ${baseTodos.length}개 중 ${visibleTodos.length}개 표시 · 미완료 ${incomplete}개`;
  }

  refs.filterActiveBadge.classList.toggle("is-hidden", !hasActiveFilter());
}

function persistAndRender() {
  window.StorageService.saveTodos(todos);

  const baseTodos = getBaseTodos();
  const visibleTodos = window.UIService.applyFilters(baseTodos, filters);

  window.UIService.renderTodos(refs.todoList, visibleTodos, filters.sort);
  window.UIService.updateGlobalCounts(todos, refs);
  window.UIService.updateView(visibleTodos, currentView, selectedCategory, refs);
  window.UIService.setActiveNavigation(currentView, selectedCategory);
  updateFilterSummary(baseTodos, visibleTodos);
}

function getQuickAddOptions() {
  if (currentView === "inbox") {
    return { dueDate: "" };
  }

  if (currentView === "upcoming") {
    return { dueDate: window.UIService.getTomorrowValue() };
  }

  if (currentView === "category") {
    return {
      dueDate: window.StorageService.getTodayValue(),
      category: selectedCategory || "none"
    };
  }

  return { dueDate: window.StorageService.getTodayValue() };
}

function addTodo(title) {
  const todo = window.TodoService.createTodo(title, getQuickAddOptions());
  todos.unshift(todo);
  persistAndRender();
}

function toggleTodo(id) {
  window.TodoService.toggleTodo(todos, id);
  persistAndRender();
}

function openTodoDetail(id) {
  const todo = todos.find((item) => item.id === id);
  if (!todo) return;
  window.UIService.openDetail(todo, refs);
}

function deleteTodo(id) {
  const deleted = window.TodoService.removeTodo(todos, id);
  if (!deleted) return;

  lastDeletedTodo = deleted;
  persistAndRender();
  showUndoToast(deleted.todo.title);
}

function restoreDeletedTodo() {
  if (!lastDeletedTodo) return;

  window.TodoService.restoreTodo(todos, lastDeletedTodo);
  lastDeletedTodo = null;
  persistAndRender();
  hideUndoToast();
}

function showUndoToast(title) {
  clearTimeout(undoTimer);

  const message = refs.undoToast.querySelector("span");
  const shortTitle = title.length > 20 ? `${title.slice(0, 20)}…` : title;
  message.textContent = `"${shortTitle}" 삭제됨`;
  refs.undoToast.classList.add("show");

  undoTimer = setTimeout(() => {
    refs.undoToast.classList.remove("show");
    lastDeletedTodo = null;
  }, 5000);
}

function hideUndoToast() {
  refs.undoToast.classList.remove("show");
  clearTimeout(undoTimer);
  undoTimer = null;
}

function toggleMobileMenu() {
  const isOpen = refs.mobileMenu.classList.toggle("open");
  refs.menuButton.setAttribute("aria-expanded", String(isOpen));
}

function closeMobileMenu() {
  refs.mobileMenu.classList.remove("open");
  refs.menuButton.setAttribute("aria-expanded", "false");
}

function changeView(view) {
  if (!["today", "inbox", "upcoming", "category"].includes(view)) return;

  currentView = view;
  if (view !== "category") selectedCategory = "";

  persistAndRender();
  closeMobileMenu();

  window.scrollTo({ top: 0, behavior: "smooth" });
  refs.todoInput.focus();
}

function changeCategory(category) {
  if (!window.UIService.categoryLabels[category] || category === "none") return;

  currentView = "category";
  selectedCategory = category;
  persistAndRender();
  closeMobileMenu();

  window.scrollTo({ top: 0, behavior: "smooth" });
  refs.todoInput.focus();
}

function syncFiltersFromControls() {
  filters.search = refs.filterSearch.value.trim();
  filters.status = refs.filterStatus.value;
  filters.priority = refs.filterPriority.value;
  filters.category = refs.filterCategory.value;
  filters.sort = refs.filterSort.value;
  persistAndRender();
}

function resetFilters() {
  filters.search = "";
  filters.status = "all";
  filters.priority = "all";
  filters.category = "all";
  filters.sort = "smart";

  refs.filterSearch.value = "";
  refs.filterStatus.value = "all";
  refs.filterPriority.value = "all";
  refs.filterCategory.value = "all";
  refs.filterSort.value = "smart";

  persistAndRender();
}

function focusSearch() {
  if (currentView === "category" && !selectedCategory) {
    changeView("today");
  }

  refs.filterSection.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => refs.filterSearch.focus(), 250);
}

refs.todoForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = refs.todoInput.value.trim();
  if (!title) {
    refs.todoInput.focus();
    return;
  }

  addTodo(title);
  refs.todoInput.value = "";
  refs.todoInput.focus();
});

refs.todoList.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;

  const { action, id } = actionButton.dataset;

  if (action === "toggle") toggleTodo(id);
  if (action === "edit") openTodoDetail(id);
  if (action === "delete") deleteTodo(id);
});

refs.detailForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const id = refs.detailTodoId.value;
  const title = refs.detailTitle.value.trim();

  if (!title) {
    refs.detailTitle.focus();
    return;
  }

  let dueDate = refs.detailDate.value;
  const dueTime = refs.detailTime.value;

  if (dueTime && !dueDate) {
    dueDate = window.StorageService.getTodayValue();
  }

  window.TodoService.updateTodo(todos, id, {
    title,
    memo: refs.detailMemo.value,
    dueDate,
    dueTime,
    priority: refs.detailPriority.value,
    category: refs.detailCategory.value
  });

  persistAndRender();
  window.UIService.closeDetail(refs);
});

refs.detailDeleteButton.addEventListener("click", () => {
  const id = refs.detailTodoId.value;
  window.UIService.closeDetail(refs);
  deleteTodo(id);
});

refs.clearScheduleButton.addEventListener("click", () => {
  refs.detailDate.value = "";
  refs.detailTime.value = "";
});

refs.detailCloseButton.addEventListener("click", () => {
  window.UIService.closeDetail(refs);
});

refs.detailBackdrop.addEventListener("click", () => {
  window.UIService.closeDetail(refs);
});

refs.filterSearch.addEventListener("input", syncFiltersFromControls);
refs.filterStatus.addEventListener("change", syncFiltersFromControls);
refs.filterPriority.addEventListener("change", syncFiltersFromControls);
refs.filterCategory.addEventListener("change", syncFiltersFromControls);
refs.filterSort.addEventListener("change", syncFiltersFromControls);
refs.filterResetButton.addEventListener("click", resetFilters);
refs.searchButton.addEventListener("click", focusSearch);

refs.undoButton.addEventListener("click", restoreDeletedTodo);
refs.menuButton.addEventListener("click", toggleMobileMenu);

document.addEventListener("click", (event) => {
  const viewButton = event.target.closest("[data-view]");
  if (viewButton) {
    event.preventDefault();
    changeView(viewButton.dataset.view);
    return;
  }

  const mobileCategory = event.target.closest("[data-category]");
  if (mobileCategory) {
    changeCategory(mobileCategory.dataset.category);
    return;
  }

  const categoryCard = event.target.closest("[data-category-filter]");
  if (categoryCard) {
    changeCategory(categoryCard.dataset.categoryFilter);
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 760) closeMobileMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMobileMenu();
    window.UIService.closeDetail(refs);
  }

  const isUndo =
    (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z";

  if (isUndo && lastDeletedTodo) {
    event.preventDefault();
    restoreDeletedTodo();
  }

  const isSearchShortcut =
    (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";

  if (isSearchShortcut) {
    event.preventDefault();
    focusSearch();
  }
});

function init() {
  todos = window.StorageService.loadTodos();
  persistAndRender();
  refs.todoInput.focus();
}

init();
