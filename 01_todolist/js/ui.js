(function () {
  const priorityLabels = {
    high: "높음",
    normal: "보통",
    low: "낮음"
  };

  const categoryLabels = {
    none: "미분류",
    work: "회사",
    personal: "개인",
    study: "공부",
    exercise: "운동",
    etc: "기타"
  };

  const viewText = {
    today: {
      title: "오늘",
      listTitle: "오늘 할 일",
      description: "오늘 일정과 아직 끝내지 못한 지난 할 일을 확인합니다.",
      emptyTitle: "조건에 맞는 오늘 할 일이 없습니다.",
      emptyDescription: "새 할 일을 추가하거나 필터 조건을 바꿔보세요.",
      quickHelp: "여기서 추가한 할 일은 오늘 일정으로 등록됩니다."
    },
    inbox: {
      title: "받은 할 일",
      listTitle: "날짜 없는 할 일",
      description: "아직 날짜를 정하지 않은 할 일을 모아봅니다.",
      emptyTitle: "조건에 맞는 받은 할 일이 없습니다.",
      emptyDescription: "새 할 일을 기록하거나 필터 조건을 바꿔보세요.",
      quickHelp: "여기서 추가한 할 일은 날짜 없이 받은 할 일에 저장됩니다."
    },
    upcoming: {
      title: "예정",
      listTitle: "예정된 할 일",
      description: "내일부터 예정된 할 일을 확인합니다.",
      emptyTitle: "조건에 맞는 예정된 할 일이 없습니다.",
      emptyDescription: "새 일정을 추가하거나 필터 조건을 바꿔보세요.",
      quickHelp: "여기서 빠르게 추가하면 내일 일정으로 등록됩니다. 상세 수정에서 날짜를 바꿀 수 있습니다."
    }
  };

  function formatTodayHeading() {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long"
    }).format(new Date());
  }

  function toLocalDateValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function getTomorrowValue() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return toLocalDateValue(tomorrow);
  }

  function formatDueDate(value) {
    if (!value) return "날짜 없음";

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (value === toLocalDateValue(today)) return "오늘";
    if (value === toLocalDateValue(tomorrow)) return "내일";

    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return value;

    return `${month}월 ${day}일`;
  }

  function createMetaChip(text, className = "") {
    const chip = document.createElement("span");
    chip.className = `todo-meta-chip ${className}`.trim();
    chip.textContent = text;
    return chip;
  }

  function smartSort(todos) {
    const todayValue = window.StorageService.getTodayValue();

    return [...todos].sort((a, b) => {
      if (a.completed !== b.completed) {
        return Number(a.completed) - Number(b.completed);
      }

      const aOverdue = Boolean(a.dueDate && a.dueDate < todayValue && !a.completed);
      const bOverdue = Boolean(b.dueDate && b.dueDate < todayValue && !b.completed);
      if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;

      const aDate = a.dueDate || "9999-12-31";
      const bDate = b.dueDate || "9999-12-31";
      if (aDate !== bDate) return aDate.localeCompare(bDate);

      const aTime = a.dueTime || "99:99";
      const bTime = b.dueTime || "99:99";
      return aTime.localeCompare(bTime);
    });
  }

  function sortTodos(todos, sortBy = "smart") {
    if (sortBy === "smart") return smartSort(todos);

    const priorityOrder = { high: 0, normal: 1, low: 2 };

    return [...todos].sort((a, b) => {
      if (sortBy === "priority") {
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;

        const aDate = a.dueDate || "9999-12-31";
        const bDate = b.dueDate || "9999-12-31";
        if (aDate !== bDate) return aDate.localeCompare(bDate);

        return (a.dueTime || "99:99").localeCompare(b.dueTime || "99:99");
      }

      if (sortBy === "newest" || sortBy === "oldest") {
        const aTime = new Date(a.createdAt).getTime() || 0;
        const bTime = new Date(b.createdAt).getTime() || 0;
        return sortBy === "newest" ? bTime - aTime : aTime - bTime;
      }

      if (sortBy === "dateAsc" || sortBy === "dateDesc") {
        const aHasDate = Boolean(a.dueDate);
        const bHasDate = Boolean(b.dueDate);

        if (aHasDate !== bHasDate) return aHasDate ? -1 : 1;
        if (!aHasDate && !bHasDate) return 0;

        const dateDiff = a.dueDate.localeCompare(b.dueDate);
        if (dateDiff !== 0) return sortBy === "dateAsc" ? dateDiff : -dateDiff;

        const timeDiff = (a.dueTime || "99:99").localeCompare(b.dueTime || "99:99");
        return sortBy === "dateAsc" ? timeDiff : -timeDiff;
      }

      return 0;
    });
  }

  function applyFilters(todos, filters) {
    const search = (filters.search || "").trim().toLocaleLowerCase("ko-KR");

    return todos.filter((todo) => {
      if (search) {
        const haystack = `${todo.title} ${todo.memo || ""}`.toLocaleLowerCase("ko-KR");
        if (!haystack.includes(search)) return false;
      }

      if (filters.status === "active" && todo.completed) return false;
      if (filters.status === "completed" && !todo.completed) return false;

      if (filters.priority !== "all" && todo.priority !== filters.priority) {
        return false;
      }

      if (filters.category !== "all" && todo.category !== filters.category) {
        return false;
      }

      return true;
    });
  }

  function renderTodos(todoList, todos, sortBy = "smart") {
    todoList.replaceChildren();
    const todayValue = window.StorageService.getTodayValue();

    sortTodos(todos, sortBy).forEach((todo) => {
      const item = document.createElement("article");
      item.className = "todo-item";
      if (todo.completed) item.classList.add("completed");

      const checkButton = document.createElement("button");
      checkButton.type = "button";
      checkButton.className = "todo-check";
      checkButton.dataset.action = "toggle";
      checkButton.dataset.id = todo.id;
      checkButton.setAttribute("aria-label", todo.completed ? "완료 취소" : "완료");

      const main = document.createElement("div");
      main.className = "todo-main";

      const titleButton = document.createElement("button");
      titleButton.type = "button";
      titleButton.className = "todo-title-button";
      titleButton.dataset.action = "edit";
      titleButton.dataset.id = todo.id;
      titleButton.textContent = todo.title;
      titleButton.setAttribute("aria-label", `${todo.title} 상세 수정`);

      const meta = document.createElement("div");
      meta.className = "todo-meta";

      if (todo.dueDate && todo.dueDate < todayValue && !todo.completed) {
        meta.appendChild(createMetaChip("기한 지남", "overdue-chip"));
      }

      if (todo.dueDate) meta.appendChild(createMetaChip(formatDueDate(todo.dueDate)));
      if (todo.dueTime) meta.appendChild(createMetaChip(todo.dueTime));
      if (todo.category !== "none") {
        meta.appendChild(createMetaChip(categoryLabels[todo.category], "category-chip"));
      }
      meta.appendChild(createMetaChip(priorityLabels[todo.priority], `priority-${todo.priority}`));

      if (todo.memo) {
        const memo = document.createElement("p");
        memo.className = "todo-memo-preview";
        memo.textContent = todo.memo;
        main.append(titleButton, meta, memo);
      } else {
        main.append(titleButton, meta);
      }

      const actions = document.createElement("div");
      actions.className = "todo-actions";

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "todo-action-button";
      editButton.dataset.action = "edit";
      editButton.dataset.id = todo.id;
      editButton.textContent = "수정";

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "todo-action-button delete";
      deleteButton.dataset.action = "delete";
      deleteButton.dataset.id = todo.id;
      deleteButton.textContent = "삭제";

      actions.append(editButton, deleteButton);
      item.append(checkButton, main, actions);
      todoList.appendChild(item);
    });
  }

  function getViewTodos(todos, view, selectedCategory = "") {
    const today = window.StorageService.getTodayValue();

    if (view === "inbox") {
      return todos.filter((todo) => !todo.dueDate);
    }

    if (view === "upcoming") {
      return todos.filter((todo) => todo.dueDate && todo.dueDate > today);
    }

    if (view === "category") {
      return todos.filter((todo) => todo.category === selectedCategory);
    }

    return todos.filter((todo) => {
      if (todo.dueDate === today) return true;
      return Boolean(todo.dueDate && todo.dueDate < today && !todo.completed);
    });
  }

  function getViewCounts(todos) {
    const today = window.StorageService.getTodayValue();

    return {
      today: todos.filter((todo) => {
        if (todo.dueDate === today && !todo.completed) return true;
        return Boolean(todo.dueDate && todo.dueDate < today && !todo.completed);
      }).length,
      inbox: todos.filter((todo) => !todo.dueDate && !todo.completed).length,
      upcoming: todos.filter((todo) => todo.dueDate && todo.dueDate > today && !todo.completed).length
    };
  }

  function updateGlobalCounts(todos, refs) {
    const counts = getViewCounts(todos);

    refs.todayCount.textContent = counts.today;
    refs.inboxCount.textContent = counts.inbox;
    refs.upcomingCount.textContent = counts.upcoming;
    refs.mobileTodayCount.textContent = counts.today;
    refs.mobileInboxCount.textContent = counts.inbox;
    refs.mobileUpcomingCount.textContent = counts.upcoming;

    const categoryCounts = {
      work: 0,
      personal: 0,
      study: 0,
      exercise: 0,
      etc: 0
    };

    todos.forEach((todo) => {
      if (Object.prototype.hasOwnProperty.call(categoryCounts, todo.category)) {
        categoryCounts[todo.category] += 1;
      }
    });

    Object.entries(categoryCounts).forEach(([key, value]) => {
      const el = document.querySelector(`[data-category-count="${key}"]`);
      if (el) el.textContent = `${value}개`;
    });
  }

  function updateView(viewTodos, view, selectedCategory, refs) {
    const incompleteCount = viewTodos.filter((todo) => !todo.completed).length;
    const currentText = view === "category" ? null : viewText[view];

    if (view === "category") {
      const categoryName = categoryLabels[selectedCategory] || "카테고리";
      refs.pageTitle.textContent = categoryName;
      refs.pageDescription.textContent = selectedCategory
        ? "선택한 카테고리의 할 일을 모아서 보고 있습니다."
        : "카테고리를 선택해서 할 일을 모아보세요.";
      refs.listTitle.textContent = `${categoryName} 할 일`;
      refs.listDescription.textContent = "날짜와 상관없이 이 카테고리에 속한 할 일을 표시합니다.";
      refs.emptyTitle.textContent = `${categoryName} 카테고리에 조건에 맞는 할 일이 없습니다.`;
      refs.emptyDescription.textContent = "새 할 일을 추가하거나 필터 조건을 바꿔보세요.";
      refs.quickAddHelp.textContent = `여기서 추가한 할 일은 ${categoryName} 카테고리로 등록됩니다.`;
    } else {
      refs.pageTitle.textContent = currentText.title;
      refs.pageDescription.textContent = view === "today" ? formatTodayHeading() : currentText.description;
      refs.listTitle.textContent = currentText.listTitle;
      refs.listDescription.textContent = currentText.description;
      refs.emptyTitle.textContent = currentText.emptyTitle;
      refs.emptyDescription.textContent = currentText.emptyDescription;
      refs.quickAddHelp.textContent = currentText.quickHelp;
    }

    const categoryOverview = view === "category" && !selectedCategory;

    refs.quickAddSection.classList.toggle("is-hidden", categoryOverview);
    refs.filterSection.classList.toggle("is-hidden", categoryOverview);
    refs.todoSection.classList.toggle("is-hidden", categoryOverview);
    refs.headingCount.textContent = incompleteCount;
    refs.todoSummary.textContent = `${incompleteCount}개 남음`;
    refs.emptyState.classList.toggle("show", !categoryOverview && viewTodos.length === 0);
    refs.categoryPanel.classList.toggle("view-focus", view === "category");
  }

  function setActiveNavigation(view, selectedCategory = "") {
    document.querySelectorAll("[data-view]").forEach((element) => {
      element.classList.toggle("active", element.dataset.view === view);
    });

    document.querySelectorAll("[data-category]").forEach((element) => {
      element.classList.toggle("active", element.dataset.category === selectedCategory && view === "category");
    });

    document.querySelectorAll("[data-category-filter]").forEach((element) => {
      element.classList.toggle(
        "active",
        element.dataset.categoryFilter === selectedCategory && view === "category"
      );
    });
  }

  function openDetail(todo, refs) {
    refs.detailTodoId.value = todo.id;
    refs.detailTitle.value = todo.title;
    refs.detailMemo.value = todo.memo;
    refs.detailDate.value = todo.dueDate;
    refs.detailTime.value = todo.dueTime;
    refs.detailPriority.value = todo.priority;
    refs.detailCategory.value = todo.category;

    refs.detailBackdrop.classList.add("open");
    refs.detailPanel.classList.add("open");
    refs.detailPanel.setAttribute("aria-hidden", "false");
    document.body.classList.add("detail-open");

    setTimeout(() => refs.detailTitle.focus(), 100);
  }

  function closeDetail(refs) {
    refs.detailBackdrop.classList.remove("open");
    refs.detailPanel.classList.remove("open");
    refs.detailPanel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("detail-open");
  }

  window.UIService = {
    formatTodayHeading,
    getTomorrowValue,
    renderTodos,
    getViewTodos,
    applyFilters,
    updateGlobalCounts,
    updateView,
    setActiveNavigation,
    openDetail,
    closeDetail,
    categoryLabels,
    priorityLabels
  };
})();
