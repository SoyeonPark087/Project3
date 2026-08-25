window.DoIt = window.DoIt || {};

(function (D) {
  const viewMeta = {
    today: { title: "오늘", description: "오늘 해야 할 일과 기한이 지난 미완료 항목입니다.", progress: "오늘의 진행률" },
    inbox: { title: "받은 할 일", description: "아직 날짜를 정하지 않은 할 일입니다.", progress: "받은 할 일 진행률" },
    upcoming: { title: "예정", description: "내일 이후 예정된 할 일입니다.", progress: "예정된 할 일 진행률" },
    all: { title: "전체 할 일", description: "저장된 모든 Todo를 확인합니다.", progress: "전체 진행률" },
    completed: { title: "완료한 할 일", description: "완료 처리한 Todo를 모아봅니다.", progress: "완료 항목" }
  };

  function formatDisplayDate(dateString) {
    if (!dateString) return "";
    const date = D.todo.parseLocalDate(dateString);
    return new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric", weekday: "short" }).format(date);
  }

  function formatTodayHeading() {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric", month: "long", day: "numeric", weekday: "long"
    }).format(new Date());
  }

  function renderNav(view, counts) {
    document.querySelectorAll("[data-view]").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.view === view);
    });
    document.querySelectorAll("[data-count='today']").forEach(el => el.textContent = counts.today);
    document.querySelectorAll("[data-count='inbox']").forEach(el => el.textContent = counts.inbox);
    document.querySelectorAll("[data-count='upcoming']").forEach(el => el.textContent = counts.upcoming);
  }

  function renderViewHeader(view, baseTodos) {
    const meta = viewMeta[view] || viewMeta.all;
    document.querySelector("#pageTitle").textContent = meta.title;
    document.querySelector("#pageDescription").textContent =
      view === "today" ? formatTodayHeading() : meta.description;

    const remaining = baseTodos.filter(t => !t.completed).length;
    document.querySelector("#headingCount").textContent = remaining;
    document.querySelector("#listTitle").textContent = meta.title;
    document.querySelector("#listDescription").textContent = meta.description;
    document.querySelector("#progressLabel").textContent = meta.progress;
  }

  function renderProgress(baseTodos) {
    const p = D.stats.getProgress(baseTodos);
    document.querySelector("#progressPercent").textContent = `${p.percent}%`;
    document.querySelector("#progressCompleted").textContent = p.completed;
    document.querySelector("#progressRemaining").textContent = p.remaining;
    document.querySelector("#progressTotal").textContent = p.total;
    document.querySelector("#progressBar").style.width = `${p.percent}%`;
  }

  function renderTodoList(todos, baseCount, filtersActive) {
    const list = document.querySelector("#todoList");
    const empty = document.querySelector("#emptyState");
    list.replaceChildren();

    todos.forEach(todo => {
      const item = document.createElement("article");
      item.className = `todo-item${todo.completed ? " completed" : ""}`;

      const check = document.createElement("button");
      check.type = "button";
      check.className = "todo-check";
      check.dataset.action = "toggle";
      check.dataset.id = todo.id;
      check.setAttribute("aria-label", todo.completed ? "완료 취소" : "완료");

      const main = document.createElement("div");
      main.className = "todo-main";
      main.dataset.action = "edit";
      main.dataset.id = todo.id;
      main.tabIndex = 0;

      const titleRow = document.createElement("div");
      titleRow.className = "todo-title-row";

      const title = document.createElement("span");
      title.className = "todo-title";
      title.textContent = todo.title;

      const priority = document.createElement("span");
      priority.className = `priority-badge priority-${todo.priority}`;
      priority.textContent = D.todo.priorityLabels[todo.priority];

      titleRow.append(title, priority);
      main.appendChild(titleRow);

      if (todo.memo) {
        const memo = document.createElement("span");
        memo.className = "todo-memo";
        memo.textContent = todo.memo;
        main.appendChild(memo);
      }

      const meta = document.createElement("div");
      meta.className = "todo-meta";

      const parts = [];
      if (D.todo.isOverdue(todo)) parts.push(["기한 지남", "overdue-text"]);
      if (todo.dueDate) parts.push([formatDisplayDate(todo.dueDate), ""]);
      if (todo.dueTime) parts.push([todo.dueTime, ""]);
      if (todo.category !== "uncategorized") parts.push([D.todo.categoryLabels[todo.category], ""]);
      if (todo.repeat !== "none") parts.push([D.todo.repeatLabels[todo.repeat], ""]);
      if (todo.reminderEnabled) parts.push(["알림", ""]);

      parts.forEach(([text, className]) => {
        const span = document.createElement("span");
        span.textContent = text;
        if (className) span.className = className;
        meta.appendChild(span);
      });
      main.appendChild(meta);

      const actions = document.createElement("div");
      actions.className = "todo-actions";

      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "todo-edit";
      edit.dataset.action = "edit";
      edit.dataset.id = todo.id;
      edit.textContent = "수정";

      const del = document.createElement("button");
      del.type = "button";
      del.className = "todo-delete";
      del.dataset.action = "delete";
      del.dataset.id = todo.id;
      del.textContent = "삭제";

      actions.append(edit, del);
      item.append(check, main, actions);
      list.appendChild(item);
    });

    empty.classList.toggle("show", todos.length === 0);
    document.querySelector("#todoSummary").textContent =
      `${todos.filter(t => !t.completed).length}개 남음`;
    document.querySelector("#filterSummaryText").textContent =
      `전체 ${baseCount}개 중 ${todos.length}개 표시`;
    document.querySelector("#filterBadge").hidden = !filtersActive;
  }

  function renderStats(stats) {
    document.querySelector("#statTotal").textContent = stats.total;
    document.querySelector("#statCompleted").textContent = stats.completed;
    document.querySelector("#statCompletionRate").textContent = `완료율 ${stats.completionRate}%`;
    document.querySelector("#statOverdue").textContent = stats.overdue;
    document.querySelector("#statStreak").textContent = `${stats.streak}일`;

    document.querySelector("#weekPercent").textContent = `${stats.week.percent}%`;
    document.querySelector("#weekProgressBar").style.width = `${stats.week.percent}%`;
    document.querySelector("#weekSummary").textContent = `완료 ${stats.week.completed} / 전체 ${stats.week.total}`;

    const maxCount = Math.max(1, ...stats.sevenDays.map(x => x.count));
    const chart = document.querySelector("#sevenDayChart");
    chart.replaceChildren();
    stats.sevenDays.forEach(day => {
      const item = document.createElement("div");
      item.className = "bar-item";
      const value = document.createElement("span");
      value.className = "bar-value";
      value.textContent = day.count;
      const wrap = document.createElement("div");
      wrap.className = "bar-stick-wrap";
      const bar = document.createElement("div");
      bar.className = "bar-stick";
      bar.style.height = `${Math.max(day.count ? 8 : 2, Math.round(day.count / maxCount * 100))}%`;
      const label = document.createElement("span");
      label.className = "bar-label";
      label.textContent = day.label;
      wrap.appendChild(bar);
      item.append(value, wrap, label);
      chart.appendChild(item);
    });

    const priorityBox = document.querySelector("#priorityStats");
    priorityBox.replaceChildren();
    stats.priorities.forEach(row => {
      priorityBox.appendChild(rateRow(row.label, row.percent));
    });

    const categoryBox = document.querySelector("#categoryStats");
    categoryBox.replaceChildren();
    if (!stats.categories.length) {
      const p = document.createElement("p");
      p.className = "panel-note";
      p.textContent = "아직 카테고리 통계가 없습니다.";
      categoryBox.appendChild(p);
    } else {
      stats.categories.forEach(row => {
        const wrap = rateRow(row.label, row.percent, true);
        categoryBox.appendChild(wrap);
      });
    }
  }

  function rateRow(label, percent, category = false) {
    const row = document.createElement("div");
    row.className = category ? "category-row" : "rate-row";
    const name = document.createElement("span");
    name.className = category ? "category-name" : "rate-name";
    name.textContent = label;
    const track = document.createElement("div");
    track.className = "mini-track";
    const bar = document.createElement("div");
    bar.className = "mini-bar";
    bar.style.width = `${percent}%`;
    const value = document.createElement("span");
    value.className = category ? "category-value" : "rate-value";
    value.textContent = `${percent}%`;
    track.appendChild(bar);
    row.append(name, track, value);
    return row;
  }

  function openDrawer(todo) {
    document.querySelector("#detailId").value = todo.id;
    document.querySelector("#detailTitle").value = todo.title;
    document.querySelector("#detailMemo").value = todo.memo;
    document.querySelector("#detailDate").value = todo.dueDate || "";
    document.querySelector("#detailTime").value = todo.dueTime || "";
    document.querySelector("#detailPriority").value = todo.priority;
    document.querySelector("#detailCategory").value = todo.category;
    document.querySelector("#detailRepeat").value = todo.repeat;
    document.querySelector("#detailReminderEnabled").checked = todo.reminderEnabled;
    document.querySelector("#detailReminderMinutes").value = String(todo.reminderMinutes);

    const drawer = document.querySelector("#todoDrawer");
    const backdrop = document.querySelector("#drawerBackdrop");
    backdrop.hidden = false;
    requestAnimationFrame(() => drawer.classList.add("open"));
    drawer.setAttribute("aria-hidden", "false");
    document.querySelector("#detailTitle").focus();
  }

  function closeDrawer() {
    const drawer = document.querySelector("#todoDrawer");
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    setTimeout(() => { document.querySelector("#drawerBackdrop").hidden = true; }, 220);
  }

  D.ui = {
    renderNav, renderViewHeader, renderProgress, renderTodoList,
    renderStats, openDrawer, closeDrawer
  };
})(window.DoIt);
