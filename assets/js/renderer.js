/******************************************************************************
 * Service Transformation Map (STM)
 * Renderer
 *
 * Build 003.1
 * Part 1 / 7
 *
 * Initialization
 * State
 * Data
 * Main render()
 ******************************************************************************/

'use strict';

window.STM = window.STM || {};

STM.Renderer = {

    /* =======================================================================
       STATE
    ======================================================================= */

    initialized: false,

    dom: {},

    program: null,

    focuses: [],

    projects: [],

    links: [],

    risks: [],

    metrics: [],

    workspace: {},

    dictionaries: {},

    history: [],

    currentFocus: null,

    currentProject: null,

    filteredProjects: [],

    /* =======================================================================
       INITIALIZE
    ======================================================================= */

    initialize() {

        if (this.initialized) {
            return;
        }

        this.cacheDom();

        this.initialized = true;

        console.info("Renderer initialized.");

    },

    /* =======================================================================
       CACHE DOM
    ======================================================================= */

    cacheDom() {

        this.dom = {

            programTitle:
                document.getElementById("program-title"),

            programGoal:
                document.getElementById("program-goal"),

            progress:
                document.getElementById("program-progress"),

            progressValue:
                document.getElementById("program-progress-value"),

            focusList:
                document.getElementById("focus-list"),

            projectLayer:
                document.getElementById("project-layer"),

            riskList:
                document.getElementById("risk-list"),

            status:
                document.getElementById("status-text")

        };

    },

    /* =======================================================================
       MAIN RENDER
    ======================================================================= */

    render(data = {}) {

        if (!this.initialized) {
            this.initialize();
        }

        this.setData(data);

        this.clear();

        this.renderProgram();

        this.renderFocuses();

        this.renderProjects();

        this.renderRisks();

        this.renderMetrics();

        if (STM.SVG) {

            STM.SVG.render(
                this.links,
                this.projects
            );

        }

        if (STM.Timeline) {

            STM.Timeline.render(
                this.history
            );

        }

        this.updateStatus();

        console.info("Renderer completed.");

    },

    /* =======================================================================
       SET DATA
    ======================================================================= */

    setData(data) {

        const unwrap = value => {

            if (!value) return [];

            if (Array.isArray(value))
                return value;

            if (Array.isArray(value.data))
                return value.data;

            return value;

        };

        this.program =
            data.program?.data || data.program || {};

        this.focuses =
            unwrap(data.focuses);

        this.projects =
            unwrap(data.projects);

        this.links =
            unwrap(data.links);

        this.risks =
            unwrap(data.risks);

        this.metrics =
            unwrap(data.metrics);

        this.history =
            unwrap(data.history);

        this.workspace =
            data.workspace?.data ||
            data.workspace ||
            {};

        this.dictionaries =
            data.dictionaries?.data ||
            data.dictionaries ||
            {};

        this.filteredProjects =
            [...this.projects];

    },

    /* =======================================================================
       CLEAR
    ======================================================================= */

    clear() {

        if (this.dom.focusList)
            this.dom.focusList.innerHTML = "";

        if (this.dom.projectLayer)
            this.dom.projectLayer.innerHTML = "";

        if (this.dom.riskList)
            this.dom.riskList.innerHTML = "";

    },
        /* =======================================================================
       PROGRAM
    ======================================================================= */

    renderProgram() {

        if (!this.program) return;

        /* -------------------------------------------------------------- */
        /* Название программы */

        if (this.dom.programTitle) {

            this.dom.programTitle.textContent =
                this.program.name || "";

        }

        /* -------------------------------------------------------------- */
/* Цель программы */

if (this.dom.programGoal) {

    this.dom.programGoal.textContent =
        this.program.goal?.title || "";

}

        /* -------------------------------------------------------------- */
        /* Заголовок страницы */

        if (this.program.name) {

            document.title = this.program.name;

        }

        /* -------------------------------------------------------------- */

        this.renderProgramProgress();

        this.renderProgramStatistics();

    },

    /* =======================================================================
       PROGRAM PROGRESS
    ======================================================================= */

 renderProgramProgress() {

    if (!this.dom.progress) return;

    let value = Number(this.program.goal?.progress);

    if (Number.isNaN(value)) {

        value = 0;

    }

    value = Math.max(0, Math.min(100, value));

    this.dom.progress.max = 100;

    this.dom.progress.value = value;

    if (this.dom.progressValue) {

        this.dom.progressValue.textContent =
            `${value}%`;

    }

},

    /* =======================================================================
       PROGRAM STATISTICS
    ======================================================================= */

    renderProgramStatistics() {

        this.statistics = {

            focuses:

                this.focuses.length,

            projects:

                this.projects.length,

            activeProjects:

                this.projects.filter(project => {

                    const status =
                        project.status?.code ||
                        project.status;

                    return status === "active";

                }).length,

            completedProjects:

                this.projects.filter(project => {

                    const status =
                        project.status?.code ||
                        project.status;

                    return status === "completed";

                }).length,

            risks:

                this.risks.length

        };

    },

    /* =======================================================================
       APPLICATION STATUS
    ======================================================================= */

    updateStatus(text = null) {

        if (!this.dom.status) return;

        if (text) {

            this.dom.status.textContent = text;

            return;

        }

        this.dom.status.textContent =

            `Фокусов: ${this.statistics.focuses} · ` +

            `Проектов: ${this.statistics.projects} · ` +

            `Активных: ${this.statistics.activeProjects} · ` +

            `Рисков: ${this.statistics.risks}`;

    },

    /* =======================================================================
       HELPERS
    ======================================================================= */

    setText(element, value) {

        if (!element) return;

        element.textContent = value ?? "";

    },

    clearElement(element) {

        if (!element) return;

        element.innerHTML = "";

    },

    append(parent, child) {

        if (!parent || !child) return;

        parent.appendChild(child);

    },

    create(tag, className = "") {

        const element = document.createElement(tag);

        if (className) {

            element.className = className;

        }

        return element;

    },
        /* =======================================================================
       RENDER FOCUSES
    ======================================================================= */

    renderFocuses() {

        if (!this.dom.focusList) return;

        this.dom.focusList.innerHTML = "";

        if (!this.focuses.length) {

            const empty = this.create(
                "div",
                "focus-empty"
            );

            empty.textContent =
                "Фокусные проекты отсутствуют";

            this.dom.focusList.appendChild(empty);

            return;

        }

        this.focuses.forEach(focus => {

            const card =
                this.createFocusCard(focus);

            this.dom.focusList.appendChild(card);

        });

    },

    /* =======================================================================
       CREATE FOCUS CARD
    ======================================================================= */

    createFocusCard(focus) {

        const card = this.create(
            "div",
            "focus-card"
        );

        card.dataset.id = focus.id;

        /* -------------------------------------------------- */

        const title =
            this.create(
                "div",
                "focus-title"
            );

        title.textContent =
            focus.shortName ||
            focus.name ||
            "Без названия";

        /* -------------------------------------------------- */

        const description =
            this.create(
                "div",
                "focus-description"
            );

        description.textContent =
            focus.description || "";

        /* -------------------------------------------------- */

        const progress =
            this.calculateFocusProgress(
                focus.id
            );

        const progressBlock =
            this.create(
                "div",
                "focus-progress"
            );

        const progressBar =
            document.createElement(
                "progress"
            );

        progressBar.max = 100;

        progressBar.value = progress;

        const progressText =
            this.create(
                "span",
                "focus-progress-value"
            );

        progressText.textContent =
            progress + "%";

        progressBlock.appendChild(
            progressBar
        );

        progressBlock.appendChild(
            progressText
        );

        /* -------------------------------------------------- */

        const statistics =
            this.create(
                "div",
                "focus-statistics"
            );

        const projects =
            this.projects.filter(

                project =>

                    project.focusId ===
                    focus.id

            );

        statistics.innerHTML =

            "<strong>" +

            projects.length +

            "</strong> проектов";

        /* -------------------------------------------------- */

        const status =
            this.create(
                "div",
                "focus-status"
            );

        status.textContent =
            focus.status?.title ||

            focus.status ||

            "";

        /* -------------------------------------------------- */

        card.appendChild(title);

        card.appendChild(description);

        card.appendChild(progressBlock);

        card.appendChild(statistics);

        card.appendChild(status);

        /* -------------------------------------------------- */

        card.addEventListener(

            "click",

            () => {

                this.selectFocus(
                    focus.id
                );

            }

        );

        return card;

    },

    /* =======================================================================
       SELECT FOCUS
    ======================================================================= */

    selectFocus(focusId) {

        this.currentFocus = focusId;

        document

            .querySelectorAll(
                ".focus-card"
            )

            .forEach(card => {

                card.classList.remove(
                    "selected"
                );

            });

        const current =

            document.querySelector(

                `.focus-card[data-id="${focusId}"]`

            );

        if (current) {

            current.classList.add(
                "selected"
            );

        }

        this.filteredProjects =

            this.projects.filter(

                project =>

                    project.focusId ===
                    focusId

            );

        this.;

        if (STM.SVG) {

            STM.SVG.render(

                this.links,

                this.filteredProjects

            );

        }

        if (STM.Filters) {

            STM.Filters.refresh?.();

        }

        this.updateStatus(

            "Выбран фокус: " +

            (

                this.focuses.find(

                    f => f.id === focusId

                )?.name ||

                ""

            )

        );

    },

    /* =======================================================================
       CALCULATE FOCUS PROGRESS
    ======================================================================= */

    calculateFocusProgress(focusId) {

        const projects =

            this.projects.filter(

                project =>

                    project.focusId ===
                    focusId

            );

        if (!projects.length) {

            return 0;

        }

        let total = 0;

        projects.forEach(project => {

            total +=

                Number(

                    project.progress || 0

                );

        });

        return Math.round(

            total /

            projects.length

        );

    },
        /* =======================================================================
       RENDER PROJECTS
    ======================================================================= */

   renderProjects() {

    if (!this.dom.projectLayer) return;

    this.dom.projectLayer.innerHTML = "";

    const projects =

        this.currentFocus

            ? this.filteredProjects

            : this.projects;

    if (!projects.length) {

        const empty = this.create(

            "div",

            "project-empty"

        );

        empty.textContent =

            "Проекты отсутствуют.";

        this.dom.projectLayer.appendChild(empty);

        return;

    }

    /* Подготовка контейнера */

    this.dom.projectLayer.style.display = "flex";
    this.dom.projectLayer.style.flexWrap = "wrap";
    this.dom.projectLayer.style.alignItems = "flex-start";
    this.dom.projectLayer.style.gap = "20px";

    projects.forEach(project => {

        const card = this.createProjectCard(project);

        this.dom.projectLayer.appendChild(card);

    });

},

    /* =======================================================================
       CREATE PROJECT CARD
    ======================================================================= */

    createProjectCard(project) {

        const card = this.create(

            "div",

            "project-card"

        );

        card.dataset.id = project.id;

        card.dataset.focus = project.focusId;

        card.dataset.status =

            project.status?.code ||

            project.status ||

            "";

        /* ------------------------------------------------------------ */

        const header =

            this.create(

                "div",

                "project-header"

            );

        const title =

            this.create(

                "div",

                "project-title"

            );

        title.textContent =

            project.shortName ||

            project.name ||

            "Без названия";

        header.appendChild(title);

        /* ------------------------------------------------------------ */

        const code =

            this.create(

                "div",

                "project-code"

            );

        code.textContent =

            project.code ||

            "";

        /* ------------------------------------------------------------ */

        const description =

            this.create(

                "div",

                "project-description"

            );

        description.textContent =

            project.description ||

            "";

        /* ------------------------------------------------------------ */

        const progressBlock =

            this.create(

                "div",

                "project-progress"

            );

        const progress =

            document.createElement(

                "progress"

            );

        progress.max = 100;

        progress.value =

            Number(project.progress || 0);

        const progressValue =

            this.create(

                "span",

                "project-progress-value"

            );

        progressValue.textContent =

            progress.value + "%";

        progressBlock.appendChild(progress);

        progressBlock.appendChild(progressValue);

        /* ------------------------------------------------------------ */

        const footer =

            this.create(

                "div",

                "project-footer"

            );

        const status =

            this.create(

                "span",

                "project-status"

            );

        status.textContent =

            project.status?.title ||

            project.status ||

            "";

        footer.appendChild(status);

        if (

            project.timeline &&

            project.timeline.start &&

            project.timeline.finish

        ) {

            const timeline =

                this.create(

                    "span",

                    "project-dates"

                );

            timeline.textContent =

                project.timeline.start +

                " → " +

                project.timeline.finish;

            footer.appendChild(timeline);

        }

        /* ------------------------------------------------------------ */

        card.appendChild(header);

        card.appendChild(code);

        card.appendChild(description);

        card.appendChild(progressBlock);

        card.appendChild(footer);

        /* ------------------------------------------------------------ */

        card.addEventListener(

            "mouseenter",

            () => {

                STM.SVG?.highlight(

                    project.id

                );

            }

        );

        card.addEventListener(

            "mouseleave",

            () => {

                STM.SVG?.redraw();

            }

        );

        card.addEventListener(

            "click",

            () => {

                this.openProject(

                    project.id

                );

            }

        );

        return card;

    },

    /* =======================================================================
       OPEN PROJECT
    ======================================================================= */

    openProject(projectId) {

        const project =

            this.projects.find(

                p =>

                    p.id === projectId

            );

        if (!project) {

            return;

        }

        this.currentProject =

            project;

        if (

            STM.Modal &&

            typeof STM.Modal.open ===

            "function"

        ) {

            STM.Modal.open(

                "project",

                project

            );

        }

        this.updateStatus(

            "Открыт проект: " +

            project.name

        );

    },
        /* =======================================================================
       RENDER RISKS
    ======================================================================= */

    renderRisks() {

        if (!this.dom.riskList) return;

        this.dom.riskList.innerHTML = "";

        if (!this.risks.length) {

            const empty = this.create(
                "div",
                "risk-empty"
            );

            empty.textContent =
                "Активных рисков нет";

            this.dom.riskList.appendChild(empty);

            return;

        }

        this.risks.forEach(risk => {

            const card = this.create(
                "div",
                "risk-card"
            );

            card.dataset.id = risk.id || "";

            const title = this.create(
                "div",
                "risk-title"
            );

            title.textContent =
                risk.name ||
                risk.title ||
                "Без названия";

            const description = this.create(
                "div",
                "risk-description"
            );

            description.textContent =
                risk.description || "";

            const footer = this.create(
                "div",
                "risk-footer"
            );

            const level = this.create(
                "span",
                "risk-level"
            );

            level.textContent =
                risk.level ||
                risk.priority ||
                "";

            footer.appendChild(level);

            card.appendChild(title);
            card.appendChild(description);
            card.appendChild(footer);

            this.dom.riskList.appendChild(card);

        });

    },

    /* =======================================================================
       RENDER METRICS
    ======================================================================= */

    renderMetrics() {

        if (!this.metrics.length) {

            return;

        }

        this.metricSummary = {};

        this.metrics.forEach(metric => {

            const key =
                metric.code ||
                metric.id;

            this.metricSummary[key] =
                metric.value;

        });

    },

    /* =======================================================================
       RENDER DEPENDENCIES
    ======================================================================= */

    renderDependencies(projectId = null) {

        if (!STM.SVG) {

            return;

        }

        let links =
            this.links;

        if (projectId) {

            links = links.filter(link =>

                link.from === projectId ||

                link.to === projectId

            );

        }

        STM.SVG.render(

            links,

            this.projects

        );

    },

    /* =======================================================================
       GET PROJECT
    ======================================================================= */

    getProject(projectId) {

        return this.projects.find(

            project =>

                project.id === projectId

        );

    },

    /* =======================================================================
       GET FOCUS
    ======================================================================= */

    getFocus(focusId) {

        return this.focuses.find(

            focus =>

                focus.id === focusId

        );

    },

    /* =======================================================================
       GET RISK
    ======================================================================= */

    getRisk(riskId) {

        return this.risks.find(

            risk =>

                risk.id === riskId

        );

    },

    /* =======================================================================
       PROJECT LINKS
    ======================================================================= */

    getProjectLinks(projectId) {

        return this.links.filter(link =>

            link.from === projectId ||

            link.to === projectId

        );

    },

    /* =======================================================================
       EXTERNAL DEPENDENCIES
    ======================================================================= */

    getExternalDependencies(project) {

        if (!project) {

            return [];

        }

        return project.externalDependencies || [];

    },

    /* =======================================================================
       HAS RISKS
    ======================================================================= */

    hasProjectRisk(projectId) {

        return this.risks.some(risk =>

            risk.projectId === projectId

        );

    },
        /* =======================================================================
       REDRAW SVG
    ======================================================================= */

    redrawConnections() {

        if (!STM.SVG) return;

        STM.SVG.render(

            this.links,

            this.filteredProjects.length
                ? this.filteredProjects
                : this.projects

        );

    },

    /* =======================================================================
       REFRESH TIMELINE
    ======================================================================= */

    refreshTimeline() {

        if (!STM.Timeline) return;

        STM.Timeline.render(

            this.history

        );

    },

    /* =======================================================================
       REFRESH FILTERS
    ======================================================================= */

    refreshFilters() {

        if (!STM.Filters) return;

        if (typeof STM.Filters.populate === "function") {

            STM.Filters.populate();

        }

        if (typeof STM.Filters.apply === "function") {

            STM.Filters.apply();

        }

    },

    /* =======================================================================
       FULL REFRESH
    ======================================================================= */

    refresh() {

        this.render({

            program: this.program,

            focuses: this.focuses,

            projects: this.projects,

            links: this.links,

            risks: this.risks,

            metrics: this.metrics,

            workspace: this.workspace,

            dictionaries: this.dictionaries,

            history: this.history

        });

    },

    /* =======================================================================
       RELOAD DATA FROM LOADER
    ======================================================================= */

    reload() {

        if (!STM.Loader) return;

        this.render({

            program: STM.Loader.getProgram(),

            focuses: STM.Loader.getFocuses(),

            projects: STM.Loader.getProjects(),

            links: STM.Loader.getLinks(),

            risks: STM.Loader.getRisks(),

            metrics: STM.Loader.getMetrics(),

            workspace: STM.Loader.getWorkspace(),

            dictionaries: STM.Loader.getDictionary(),

            history: STM.Loader.getHistory()

        });

    },

    /* =======================================================================
       APPLY FILTERED PROJECTS
    ======================================================================= */

    setFilteredProjects(projects = []) {

        this.filteredProjects = projects;

        this.renderProjects();

        this.redrawConnections();

    },

    /* =======================================================================
       CLEAR FILTERS
    ======================================================================= */

    clearFilters() {

        this.filteredProjects = [

            ...this.projects

        ];

        this.renderProjects();

        this.redrawConnections();

    },

    /* =======================================================================
       SELECT PROJECT
    ======================================================================= */

    selectProject(projectId) {

        this.currentProject =

            this.getProject(projectId);

        if (!this.currentProject) {

            return;

        }

        document

            .querySelectorAll(".project-card")

            .forEach(card => {

                card.classList.remove(

                    "selected"

                );

            });

        const card =

            document.querySelector(

                `.project-card[data-id="${projectId}"]`

            );

        if (card) {

            card.classList.add(

                "selected"

            );

        }

        this.renderDependencies(projectId);

    },

    /* =======================================================================
       CLEAR SELECTION
    ======================================================================= */

    clearSelection() {

        this.currentProject = null;

        this.currentFocus = null;

        document

            .querySelectorAll(

                ".selected"

            )

            .forEach(item => {

                item.classList.remove(

                    "selected"

                );

            });

        this.clearFilters();

    },

    /* =======================================================================
       RESIZE
    ======================================================================= */

    resize() {

        this.redrawConnections();

        this.refreshTimeline();

    },

    /* =======================================================================
       WINDOW EVENTS
    ======================================================================= */

    bindEvents() {

        window.addEventListener(

            "resize",

            () => {

                this.resize();

            }

        );

    },
        /* =======================================================================
       SEARCH PROJECT
    ======================================================================= */

    searchProjects(text = "") {

        text = text.toLowerCase();

        return this.projects.filter(project =>

            (project.name || "")
                .toLowerCase()
                .includes(text)

            ||

            (project.shortName || "")
                .toLowerCase()
                .includes(text)

            ||

            (project.code || "")
                .toLowerCase()
                .includes(text)

        );

    },

    /* =======================================================================
       SEARCH FOCUS
    ======================================================================= */

    searchFocuses(text = "") {

        text = text.toLowerCase();

        return this.focuses.filter(focus =>

            (focus.name || "")
                .toLowerCase()
                .includes(text)

            ||

            (focus.shortName || "")
                .toLowerCase()
                .includes(text)

        );

    },

    /* =======================================================================
       SORT PROJECTS
    ======================================================================= */

    sortProjects(by = "name") {

        this.projects.sort((a, b) => {

            switch (by) {

                case "progress":

                    return (b.progress || 0) - (a.progress || 0);

                case "status":

                    return (a.status?.title || "")
                        .localeCompare(
                            b.status?.title || ""
                        );

                case "code":

                    return (a.code || "")
                        .localeCompare(
                            b.code || ""
                        );

                default:

                    return (a.name || "")
                        .localeCompare(
                            b.name || ""
                        );

            }

        });

    },

    /* =======================================================================
   AUTO LAYOUT
======================================================================= */

calculateProjectLayout() {

    const layout = {};

    const columnWidth = 340;
    const rowHeight = 140;

    this.focuses.forEach((focus, column) => {

        const projects = this.filteredProjects.filter(

            p => p.focusId === focus.id

        );

        projects.forEach((project, row) => {

            layout[project.id] = {

                left: 40 + column * columnWidth,

                top: 40 + row * rowHeight

            };

        });

    });

    return layout;

},
    /* =======================================================================
       UPDATE STATUS BAR
    ======================================================================= */

    updateStatus(text = "") {

        if (!this.dom.status) return;

        this.dom.status.textContent = text;

    },

    /* =======================================================================
       CREATE ELEMENT
    ======================================================================= */

    create(tag, className = "") {

        const element = document.createElement(tag);

        if (className) {

            element.className = className;

        }

        return element;

    },

    /* =======================================================================
       CLEAR ELEMENT
    ======================================================================= */

    clear(element) {

        if (!element) return;

        element.innerHTML = "";

    },

    /* =======================================================================
       DESTROY
    ======================================================================= */

    destroy() {

        this.currentFocus = null;

        this.currentProject = null;

        this.filteredProjects = [];

        this.clear(this.dom.focusList);

        this.clear(this.dom.projectLayer);

        this.clear(this.dom.riskList);

    },

    /* =======================================================================
       STATISTICS
    ======================================================================= */

    statistics() {

        return {

            program:
                this.program?.name || "",

            focuses:
                this.focuses.length,

            projects:
                this.projects.length,

            filtered:
                this.filteredProjects.length,

            links:
                this.links.length,

            risks:
                this.risks.length,

            metrics:
                this.metrics.length

        };

    }

};
