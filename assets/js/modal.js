/******************************************************************************
 * Service Transformation Map (STM)
 * Alpha 0.2 / Build 002.0
 *
 * modal.js
 *
 * Part 1
 *  - Modal Controller
 *  - Initialization
 *  - Open / Close
 *  - Event Binding
 ******************************************************************************/
'use strict';

window.STM = window.STM || {};
STM.Modal = {

    /* =======================================================================
       DOM Cache
    ======================================================================= */

    dom: {},

    /* =======================================================================
       State
    ======================================================================= */

    currentEntity: null,

    currentType: null,

    currentTab: "overview",

    initialized: false,

    /* =======================================================================
       Initialize
    ======================================================================= */

    initialize() {

        this.cacheDom();

        this.bindEvents();

        this.initialized = true;

        console.info("Modal initialized.");

    },

    /* =======================================================================
       Cache DOM
    ======================================================================= */

    cacheDom() {

        this.dom = {

            overlay:

                document.getElementById("modal-overlay"),

            window:

                document.getElementById("modal"),

            header:

                document.getElementById("modal-header"),

            title:

                document.getElementById("modal-title"),

            subtitle:

                document.getElementById("modal-subtitle"),

            tabs:

                document.getElementById("modal-tabs"),

            body:

                document.getElementById("modal-body"),

            footer:

                document.getElementById("modal-footer"),

            close:

                document.getElementById("modal-close")

        };

    },

    /* =======================================================================
       Open
    ======================================================================= */

    open(entityId) {

        if (!this.initialized) {

            this.initialize();

        }

        const project = STM.Loader
            .getProjects()
            .find(p => p.id === entityId);

        if (!project) {

            console.warn(
                `Project ${entityId} not found.`
            );

            return;

        }

        this.currentEntity = project;

        this.currentType = "project";

        this.currentTab = "overview";

        this.render();

        this.show();

    },

    /* =======================================================================
       Close
    ======================================================================= */

    close() {

        this.hide();

        this.currentEntity = null;

        this.currentType = null;

        this.currentTab = "overview";

    },

    /* =======================================================================
       Show
    ======================================================================= */

    show() {

        if (!this.dom.overlay) return;

        this.dom.overlay.hidden = false;

        document.body.classList.add("modal-open");

    },

    /* =======================================================================
       Hide
    ======================================================================= */

    hide() {

        if (!this.dom.overlay) return;

        this.dom.overlay.hidden = true;

        document.body.classList.remove("modal-open");

    },

    /* =======================================================================
       Events
    ======================================================================= */

    bindEvents() {

        this.dom.close

            ?.addEventListener("click", () => {

                this.close();

            });

        this.dom.overlay

            ?.addEventListener("click", event => {

                if (event.target === this.dom.overlay) {

                    this.close();

                }

            });

        document.addEventListener("keydown", event => {

            if (event.key === "Escape") {

                this.close();

            }

        });

    },

    /* =======================================================================
       Render Dispatcher
    ======================================================================= */

    render() {

        switch (this.currentType) {

            case "project":

                this.renderProject(this.currentEntity);

                break;

            case "focus":

                this.renderFocus(this.currentEntity);

                break;

            case "program":

                this.renderProgram(this.currentEntity);

                break;

            case "risk":

                this.renderRisk(this.currentEntity);

                break;

        default:

            console.warn("Unknown entity.");

        }

    },

        /* =======================================================================
       Render Project
    ======================================================================= */

    renderProject(project) {

        if (!project) return;

        this.buildHeader(project);

        this.buildTabs();

        this.buildBody(project);

        this.buildFooter(project);

        this.switchTab("overview");

    },

    /* =======================================================================
       Header
    ======================================================================= */

    buildHeader(project) {

        this.clear(this.dom.header);

        this.dom.title.textContent =
            project.name;

        this.dom.subtitle.textContent =
            project.description || "";

        const status = this.createBadge(

            this.getStatusName(project.status),

            project.status

        );

        this.dom.header.appendChild(status);

    },

    /* =======================================================================
       Tabs
    ======================================================================= */

    buildTabs() {

        this.clear(this.dom.tabs);

        const tabs = [

            {
                id: "overview",
                title: "Обзор"
            },

            {
                id: "metrics",
                title: "Метрики"
            },

            {
                id: "links",
                title: "Связи"
            },

            {
                id: "history",
                title: "История"
            }

        ];

        tabs.forEach(tab => {

            const button =
                document.createElement("button");

            button.className = "modal-tab";

            button.dataset.tab = tab.id;

            button.textContent = tab.title;

            button.addEventListener("click", () => {

                this.switchTab(tab.id);

            });

            this.dom.tabs.appendChild(button);

        });

    },

    /* =======================================================================
       Body
    ======================================================================= */

    buildBody(project) {

        this.clear(this.dom.body);

        this.dom.body.appendChild(

            this.createOverviewSection(project)

        );

        this.dom.body.appendChild(

            this.createMetricsSection(project)

        );

        this.dom.body.appendChild(

            this.createLinksSection(project)

        );

        this.dom.body.appendChild(

            this.createHistorySection(project)

        );

    },

    /* =======================================================================
       Footer
    ======================================================================= */

    buildFooter(project) {

        this.clear(this.dom.footer);

        const owner =

            this.createChip(

                project.owner || "Не назначен"

            );

        const progress =

            this.createChip(

                `Готовность: ${project.progress || 0}%`

            );

        const closeButton =

            document.createElement("button");

        closeButton.className =

            "button-primary";

        closeButton.textContent =

            "Закрыть";

        closeButton.addEventListener("click", () => {

            this.close();

        });

        this.dom.footer.appendChild(owner);

        this.dom.footer.appendChild(progress);

        this.dom.footer.appendChild(closeButton);

    },

    /* =======================================================================
       Overview
    ======================================================================= */

    createOverviewSection(project) {

        const section =

            document.createElement("section");

        section.className =

            "modal-section";

        section.dataset.tab =

            "overview";

        section.innerHTML =

            `
            <h3>Описание проекта</h3>

            <p>${project.description || ""}</p>

            <table class="property-table">

                <tr>

                    <td>Статус</td>

                    <td>${this.getStatusName(project.status)}</td>

                </tr>

                <tr>

                    <td>Прогресс</td>

                    <td>${project.progress || 0}%</td>

                </tr>

                <tr>

                    <td>Ответственный</td>

                    <td>${project.owner || "-"}</td>

                </tr>

                <tr>

                    <td>Завершение</td>

                    <td>${project.finish || "-"}</td>

                </tr>

            </table>
            `;

        return section;

    },

    /* =======================================================================
       Metrics
    ======================================================================= */

    createMetricsSection(project) {

        const section =

            document.createElement("section");

        section.className =

            "modal-section";

        section.dataset.tab =

            "metrics";

        section.hidden = true;

        section.innerHTML =

            `
            <h3>Метрики</h3>

            <div id="modal-metrics"></div>
            `;

        return section;

    },

    /* =======================================================================
       Links
    ======================================================================= */

    createLinksSection(project) {

        const section =

            document.createElement("section");

        section.className =

            "modal-section";

        section.dataset.tab =

            "links";

        section.hidden = true;

        section.innerHTML =

            `
            <h3>Связи</h3>

            <div id="modal-links"></div>
            `;

        return section;

    },

    /* =======================================================================
       History
    ======================================================================= */

    createHistorySection(project) {

        const section =

            document.createElement("section");

        section.className =

            "modal-section";

        section.dataset.tab =

            "history";

        section.hidden = true;

        section.innerHTML =

            `
            <h3>История изменений</h3>

            <div id="modal-history"></div>
            `;

        return section;

    }, 
      /* =======================================================================
       Switch Tab
    ======================================================================= */

    switchTab(tabId) {

        this.currentTab = tabId;

        this.dom.tabs
            ?.querySelectorAll(".modal-tab")
            .forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.tab === tabId
                );

            });

        this.dom.body
            ?.querySelectorAll(".modal-section")
            .forEach(section => {

                section.hidden =
                    section.dataset.tab !== tabId;

            });

        switch (tabId) {

            case "metrics":
                this.renderMetrics();
                break;

            case "links":
                this.renderLinks();
                break;

            case "history":
                this.renderHistory();
                break;

        }

    },

    /* =======================================================================
       Render Metrics
    ======================================================================= */

    renderMetrics() {

        const container =
            document.getElementById("modal-metrics");

        if (!container) return;

        container.innerHTML = "";

        const metrics =
            STM.Loader
                .getMetrics()
                .filter(metric =>
                    metric.projectId === this.currentEntity.id
                );

        if (metrics.length === 0) {

            container.innerHTML =
                "<p class='muted'>Метрики отсутствуют.</p>";

            return;

        }

        metrics.forEach(metric => {

            const row =
                document.createElement("div");

            row.className = "metric-row";

            row.innerHTML =

                `
                <span>${metric.name}</span>
                <strong>${metric.value}</strong>
                `;

            container.appendChild(row);

        });

    },

    /* =======================================================================
       Render Links
    ======================================================================= */

    renderLinks() {

        const container =
            document.getElementById("modal-links");

        if (!container) return;

        container.innerHTML = "";

        const links =
            STM.Loader
                .getLinks()
                .filter(link =>
                    link.from === this.currentEntity.id ||
                    link.to === this.currentEntity.id
                );

        if (links.length === 0) {

            container.innerHTML =
                "<p class='muted'>Связи отсутствуют.</p>";

            return;

        }

        links.forEach(link => {

            const projectId =
                link.from === this.currentEntity.id
                    ? link.to
                    : link.from;

            const project =
                STM.Loader
                    .getProjects()
                    .find(p => p.id === projectId);

            const row =
                document.createElement("div");

            row.className = "link-row";

            row.innerHTML =

                `
                <span>${link.type}</span>
                <strong>${project ? project.name : projectId}</strong>
                `;

            row.addEventListener("click", () => {

                this.open(projectId);

            });

            container.appendChild(row);

        });

    },

    /* =======================================================================
       Render History
    ======================================================================= */

    renderHistory() {

        const container =
            document.getElementById("modal-history");

        if (!container) return;

        container.innerHTML = "";

        const history =
            STM.Loader
                .getHistory()
                .filter(item =>
                    item.projectId === this.currentEntity.id
                );

        if (history.length === 0) {

            container.innerHTML =
                "<p class='muted'>История отсутствует.</p>";

            return;

        }

        history.forEach(item => {

            const row =
                document.createElement("div");

            row.className = "history-row";

            row.innerHTML =

                `
                <div class="history-date">

                    ${item.date}

                </div>

                <div class="history-event">

                    ${item.event}

                </div>
                `;

            container.appendChild(row);

        });

    },

    /* =======================================================================
       Status Dictionary
    ======================================================================= */

    getStatusName(status) {

        const dictionary = {

            planned: "Запланирован",

            active: "В работе",

            completed: "Завершён",

            paused: "Приостановлен",

            cancelled: "Отменён",

            risk: "Под риском"

        };

        return dictionary[status] || status;

    },

    /* =======================================================================
       Helpers
    ======================================================================= */

    createBadge(text, modifier = "") {

        const badge =
            document.createElement("span");

        badge.className =
            `badge badge-${modifier}`;

        badge.textContent = text;

        return badge;

    },

    createChip(text) {

        const chip =
            document.createElement("span");

        chip.className = "chip";

        chip.textContent = text;

        return chip;

    },

    clear(element) {

        if (!element) return;

        element.innerHTML = "";

    },
      /* =======================================================================
       Render Focus
    ======================================================================= */

    renderFocus(focus) {

        if (!focus) return;

        this.buildHeader({

            name: focus.name,

            description: focus.description,

            status: "active"

        });

        this.buildTabs();

        this.clear(this.dom.body);

        const section = document.createElement("section");

        section.className = "modal-section";
        section.dataset.tab = "overview";

        section.innerHTML = `
            <h3>Описание фокуса</h3>

            <p>${focus.description || ""}</p>

            <table class="property-table">

                <tr>

                    <td>Проектов</td>

                    <td>${focus.projects ?? "-"}</td>

                </tr>

                <tr>

                    <td>Активных</td>

                    <td>${focus.active ?? "-"}</td>

                </tr>

                <tr>

                    <td>Прогресс</td>

                    <td>${focus.progress ?? 0}%</td>

                </tr>

            </table>
        `;

        this.dom.body.appendChild(section);

        this.clear(this.dom.footer);

    },

    /* =======================================================================
       Render Program
    ======================================================================= */

    renderProgram(program) {

        if (!program) return;

        this.buildHeader({

            name: program.name,

            description: program.goal,

            status: "active"

        });

        this.buildTabs();

        this.clear(this.dom.body);

        const section = document.createElement("section");

        section.className = "modal-section";
        section.dataset.tab = "overview";

        section.innerHTML = `
            <h3>Цель программы</h3>

            <p>${program.goal}</p>

            <table class="property-table">

                <tr>

                    <td>Прогресс</td>

                    <td>${program.progress ?? 0}%</td>

                </tr>

                <tr>

                    <td>Период</td>

                    <td>${program.period || "-"}</td>

                </tr>

            </table>
        `;

        this.dom.body.appendChild(section);

        this.clear(this.dom.footer);

    },

    /* =======================================================================
       Render Risk
    ======================================================================= */

    renderRisk(risk) {

        if (!risk) return;

        this.buildHeader({

            name: risk.title,

            description: risk.description,

            status: risk.level

        });

        this.buildTabs();

        this.clear(this.dom.body);

        const section = document.createElement("section");

        section.className = "modal-section";
        section.dataset.tab = "overview";

        section.innerHTML = `
            <h3>Карточка риска</h3>

            <table class="property-table">

                <tr>

                    <td>Уровень</td>

                    <td>${risk.level}</td>

                </tr>

                <tr>

                    <td>Ответственный</td>

                    <td>${risk.owner || "-"}</td>

                </tr>

                <tr>

                    <td>Описание</td>

                    <td>${risk.description || "-"}</td>

                </tr>

            </table>
        `;

        this.dom.body.appendChild(section);

        this.clear(this.dom.footer);

    },

    /* =======================================================================
       Refresh
    ======================================================================= */

    refresh() {

        if (!this.currentEntity) return;

        this.render();

    },

    /* =======================================================================
       Destroy
    ======================================================================= */

    destroy() {

        this.close();

        this.dom = {};

        this.currentEntity = null;

        this.currentType = null;

        this.currentTab = "overview";

        this.initialized = false;

    }

};

