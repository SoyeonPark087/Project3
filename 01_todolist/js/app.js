window.DoIt = window.DoIt || {};

(function (D) {
  let todos = D.storage.loadTodos();
  let currentView = "today";
  let filters = {
    search: "",
    status: "all",
    priority: "all",
    category: "all",
    sort: "default"
  };

  let lastDeleted = null;
  let undoTimer = null;
  let deferredInstallPrompt = null;
  let reminderTimer = null;

  const $ = selector => document.querySelector(selector);

  function counts() {
    const today = D.todo.getViewTodos(todos, "today").filter(t => !t.completed).length;
    const inbox = D.todo.getViewTodos(todos, "inbox").filter(t => !t.completed).length;
    const upcoming = D.todo.getViewTodos(todos, "upcoming").filter(t => !t.completed).length;
    return { today, inbox, upcoming };
  }

  function filtersActive() {
    return filters.search ||
      filters.status !== "all" ||
      filters.priority !== "all" ||
      filters.category !== "all" ||
      filters.sort !== "default";
  }

  function render() {
    D.ui.renderNav(currentView, counts());

    const isStats = currentView === "stats";
    $("#taskPage").hidden = isStats;
    $("#statsPage").hidden = !isStats;

    if (isStats) {
      D.ui.renderStats(D.stats.buildStats(todos));
      return;
    }

    const base = D.todo.getViewTodos(todos, currentView);
    const filtered = D.todo.sortTodos(
      D.todo.applyFilters(base, filters),
      filters.sort
    );

    D.ui.renderViewHeader(currentView, base);
    D.ui.renderProgress(base);
    D.ui.renderTodoList(filtered, base.length, Boolean(filtersActive()));

    $("#quickAddSection").hidden = currentView === "completed";
    $("#headingCount").parentElement.style.visibility =
      currentView === "completed" ? "hidden" : "visible";
  }

  function saveAndRender() {
    D.storage.saveTodos(todos);
    render();
  }

  function switchView(view) {
    currentView = view;
    closeMobileMenu();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function createTodo(title) {
    const defaults = D.todo.getQuickAddDefaults(currentView);
    const todo = D.todo.createTodo(title, defaults);
    todos.unshift(todo);
    saveAndRender();
  }

  function deleteTodo(id) {
    const index = todos.findIndex(t => t.id === id);
    if (index < 0) return;
    const [todo] = todos.splice(index, 1);
    lastDeleted = { todo, index };
    saveAndRender();
    showUndo(todo.title);
  }

  function restoreDeleted() {
    if (!lastDeleted) return;
    const index = Math.min(lastDeleted.index, todos.length);
    todos.splice(index, 0, lastDeleted.todo);
    lastDeleted = null;
    hideUndo();
    saveAndRender();
  }

  function showUndo(title) {
    clearTimeout(undoTimer);
    $("#undoToast span").textContent = `"${title.length > 20 ? title.slice(0, 20) + "…" : title}" 삭제됨`;
    $("#undoToast").classList.add("show");
    undoTimer = setTimeout(() => {
      lastDeleted = null;
      hideUndo();
    }, 5000);
  }

  function hideUndo() {
    clearTimeout(undoTimer);
    $("#undoToast").classList.remove("show");
  }

  function openTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) D.ui.openDrawer(todo);
  }

  function saveDetail() {
    const id = $("#detailId").value;
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const title = $("#detailTitle").value.trim();
    const dueDate = $("#detailDate").value || null;
    const dueTime = $("#detailTime").value || null;
    const reminderEnabled = $("#detailReminderEnabled").checked;

    if (!title) {
      $("#detailTitle").focus();
      return;
    }

    if (reminderEnabled && (!dueDate || !dueTime)) {
      alert("알림을 사용하려면 날짜와 시간을 모두 지정해주세요.");
      return;
    }

    D.todo.updateTodo(todo, {
      title,
      memo: $("#detailMemo").value.trim(),
      dueDate,
      dueTime,
      priority: $("#detailPriority").value,
      category: $("#detailCategory").value,
      repeat: $("#detailRepeat").value,
      reminderEnabled,
      reminderMinutes: Number($("#detailReminderMinutes").value)
    });

    saveAndRender();
    D.ui.closeDrawer();
  }

  function toggleTodo(id) {
    const result = D.todo.toggleTodo(todos, id);
    if (result.createdNext) {
      showToastMessage(`다음 반복 일정이 ${result.createdNext.dueDate}로 생성되었습니다.`);
    }
    saveAndRender();
  }

  function showToastMessage(text) {
    clearTimeout(undoTimer);
    lastDeleted = null;
    $("#undoToast span").textContent = text;
    $("#undoButton").style.display = "none";
    $("#undoToast").classList.add("show");
    undoTimer = setTimeout(() => {
      $("#undoToast").classList.remove("show");
      $("#undoButton").style.display = "";
    }, 3500);
  }

  function openMobileMenu() {
    const menu = $("#mobileMenu");
    const open = menu.classList.toggle("open");
    $("#menuButton").setAttribute("aria-expanded", String(open));
  }

  function closeMobileMenu() {
    $("#mobileMenu").classList.remove("open");
    $("#menuButton").setAttribute("aria-expanded", "false");
  }

  function openSettings() {
    closeMobileMenu();
    updateNotificationStatus();
    $("#settingsBackdrop").hidden = false;
    $("#settingsModal").classList.add("open");
    $("#settingsModal").setAttribute("aria-hidden", "false");
  }

  function closeSettings() {
    $("#settingsModal").classList.remove("open");
    $("#settingsModal").setAttribute("aria-hidden", "true");
    setTimeout(() => { $("#settingsBackdrop").hidden = true; }, 180);
  }

  function updateNotificationStatus() {
    const el = $("#notificationStatus");
    if (!("Notification" in window)) {
      el.textContent = "이 브라우저는 알림을 지원하지 않습니다.";
      $("#requestNotificationButton").disabled = true;
      return;
    }
    const map = {
      granted: "알림 권한이 허용되어 있습니다.",
      denied: "알림 권한이 차단되어 있습니다.",
      default: "아직 알림 권한을 요청하지 않았습니다."
    };
    el.textContent = map[Notification.permission] || Notification.permission;
  }

  async function requestNotification() {
    if (!("Notification" in window)) return;
    try {
      await Notification.requestPermission();
    } finally {
      updateNotificationStatus();
    }
  }

  function reminderTimestamp(todo) {
    if (!todo.dueDate || !todo.dueTime) return null;
    const due = new Date(`${todo.dueDate}T${todo.dueTime}:00`);
    return due.getTime() - Number(todo.reminderMinutes || 0) * 60_000;
  }

  async function showNotification(todo) {
    const title = `DOIT · ${todo.title}`;
    const options = {
      body: `${todo.dueDate} ${todo.dueTime}${todo.category !== "uncategorized" ? " · " + D.todo.categoryLabels[todo.category] : ""}`,
      icon: "./assets/icon-192.png",
      badge: "./assets/icon-192.png"
    };

    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, options);
        return;
      } catch {}
    }

    try {
      new Notification(title, options);
    } catch {}
  }

  function checkReminders() {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const now = Date.now();

    let changed = false;
    todos.forEach(todo => {
      if (todo.completed || !todo.reminderEnabled || todo.reminderSentAt) return;
      const remindAt = reminderTimestamp(todo);
      if (!remindAt) return;
      const dueAt = new Date(`${todo.dueDate}T${todo.dueTime}:00`).getTime();

      if (now >= remindAt && now <= dueAt + 5 * 60_000) {
        showNotification(todo);
        todo.reminderSentAt = new Date().toISOString();
        changed = true;
      }
    });

    if (changed) D.storage.saveTodos(todos);
  }

  function startReminderLoop() {
    clearInterval(reminderTimer);
    checkReminders();
    reminderTimer = setInterval(checkReminders, 30_000);
  }

  function exportData() {
    const payload = {
      exportedAt: new Date().toISOString(),
      version: 1,
      todos
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `doit-backup-${D.todo.getTodayString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearCompleted() {
    const count = todos.filter(t => t.completed).length;
    if (!count) {
      alert("삭제할 완료 항목이 없습니다.");
      return;
    }
    if (!confirm(`완료한 ${count}개 Todo를 모두 삭제할까요?`)) return;
    todos = todos.filter(t => !t.completed);
    saveAndRender();
    closeSettings();
  }

  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    if (!location.protocol.startsWith("http")) return;
    try {
      await navigator.serviceWorker.register("./service-worker.js");
    } catch (error) {
      console.warn("Service Worker 등록 실패:", error);
    }
  }

  function bindEvents() {
    document.querySelectorAll("[data-view]").forEach(btn => {
      btn.addEventListener("click", () => switchView(btn.dataset.view));
    });

    document.querySelectorAll("[data-view-link]").forEach(link => {
      link.addEventListener("click", event => {
        event.preventDefault();
        switchView(link.dataset.viewLink);
      });
    });

    $("#todoForm").addEventListener("submit", event => {
      event.preventDefault();
      const title = $("#todoInput").value.trim();
      if (!title) return $("#todoInput").focus();
      createTodo(title);
      $("#todoInput").value = "";
      $("#todoInput").focus();
    });

    $("#todoList").addEventListener("click", event => {
      const target = event.target.closest("[data-action]");
      if (!target) return;
      const { action, id } = target.dataset;
      if (action === "toggle") toggleTodo(id);
      if (action === "edit") openTodo(id);
      if (action === "delete") deleteTodo(id);
    });

    $("#todoList").addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const target = event.target.closest("[data-action='edit']");
      if (!target) return;
      event.preventDefault();
      openTodo(target.dataset.id);
    });

    $("#detailForm").addEventListener("submit", event => {
      event.preventDefault();
      saveDetail();
    });

    $("#detailDeleteButton").addEventListener("click", () => {
      const id = $("#detailId").value;
      D.ui.closeDrawer();
      deleteTodo(id);
    });

    $("#closeDrawerButton").addEventListener("click", D.ui.closeDrawer);
    $("#drawerBackdrop").addEventListener("click", D.ui.closeDrawer);
    $("#undoButton").addEventListener("click", restoreDeleted);

    $("#searchInput").addEventListener("input", event => {
      filters.search = event.target.value;
      render();
    });

    [
      ["#statusFilter", "status"],
      ["#priorityFilter", "priority"],
      ["#categoryFilter", "category"],
      ["#sortFilter", "sort"]
    ].forEach(([selector, key]) => {
      $(selector).addEventListener("change", event => {
        filters[key] = event.target.value;
        render();
      });
    });

    $("#resetFiltersButton").addEventListener("click", () => {
      filters = { search: "", status: "all", priority: "all", category: "all", sort: "default" };
      $("#searchInput").value = "";
      $("#statusFilter").value = "all";
      $("#priorityFilter").value = "all";
      $("#categoryFilter").value = "all";
      $("#sortFilter").value = "default";
      render();
    });

    $("#headerSearchButton").addEventListener("click", () => {
      if (currentView === "stats") switchView("all");
      setTimeout(() => $("#searchInput").focus(), 50);
    });

    $("#menuButton").addEventListener("click", openMobileMenu);
    $("#settingsButton").addEventListener("click", openSettings);
    $("#mobileSettingsButton").addEventListener("click", openSettings);
    $("#closeSettingsButton").addEventListener("click", closeSettings);
    $("#settingsBackdrop").addEventListener("click", closeSettings);
    $("#requestNotificationButton").addEventListener("click", requestNotification);
    $("#exportButton").addEventListener("click", exportData);
    $("#clearCompletedButton").addEventListener("click", clearCompleted);

    $("#installButton").addEventListener("click", async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      $("#installButton").disabled = true;
    });

    window.addEventListener("beforeinstallprompt", event => {
      event.preventDefault();
      deferredInstallPrompt = event;
      $("#installButton").disabled = false;
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) closeMobileMenu();
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeMobileMenu();
        D.ui.closeDrawer();
        closeSettings();
      }

      const isUndo = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z";
      if (isUndo && lastDeleted) {
        event.preventDefault();
        restoreDeleted();
      }

      const isSearch = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
      if (isSearch) {
        event.preventDefault();
        if (currentView === "stats") switchView("all");
        setTimeout(() => $("#searchInput").focus(), 50);
      }
    });
  }

  function init() {
    bindEvents();
    render();
    updateNotificationStatus();
    registerServiceWorker();
    startReminderLoop();
  }

  init();
})(window.DoIt);
