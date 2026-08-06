/******************************************************************************
 * Service Transformation Map (STM)
 *
 * renderer.js
 *
 * Build 004
 * Part 1 / 8
 *
 * Core
 * Initialization
 * DOM
 * Data
 * Main Render
 ******************************************************************************/

"use strict";

window.STM = window.STM || {};

STM.Renderer = {

    /* ======================================================================
       STATE
    ====================================================================== */

    initialized: false,

    dom: {},

    program: {},

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

    projectLayout: {},

    /* ======================================================================
       INITIALIZE
    ====================================================================== */

    initialize() {

        if (this.initialized) {

            return;

        }

        this.cacheDom();

        this.bindEvents();

        this.initialized = true;

        console.info("Renderer initialized.");

    },

    /* ======================================================================
       CACHE DOM
    ====================================================================== */

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

    /* ======================================================================
       LOAD DATA
    ====================================================================== */

    setData(data = {}) {

        const unwrap = (value) => {

            if (!value) return [];

            if (Array.isArray(value))
                return value;

            if (Array.isArray(value.data))
                return value.data;

            return value;

        };

        this.program =
            data.program?.data ||
            data.program ||
            {};

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

        this.filteredProjects = [

            ...this.projects

        ];

    },

    /* ======================================================================
       MAIN RENDER
    ====================================================================== */

    render(data = {}) {

        if (!this.initialized) {

            this.initialize();

        }

        this.setData(data);

        this.clear();

        this.renderProgram();

        this.renderFocusList();

        this.renderProjects();

        this.renderRisks();

        this.refreshConnections();

        this.refreshTimeline();

        this.updateStatus();

        console.info("Renderer completed.");

    },

    /* ======================================================================
       CLEAR
    ====================================================================== */

    clear() {

        if (this.dom.focusList) {

            this.dom.focusList.innerHTML = "";

        }

        if (this.dom.projectLayer) {

            this.dom.projectLayer.innerHTML = "";

        }

        if (this.dom.riskList) {

            this.dom.riskList.innerHTML = "";

        }

    },
        /* ======================================================================
       PROGRAM
    ====================================================================== */

    renderProgram() {

        if (!this.program) return;

        /* ---------- Program title ---------- */

        if (this.dom.programTitle) {

            this.dom.programTitle.textContent =

                this.program.name || "";

        }

        /* ---------- Goal ---------- */

        if (this.dom.programGoal) {

            this.dom.programGoal.textContent =

                this.program.goal?.title ||

                this.program.goal ||

                "";

        }

        /* ---------- Browser title ---------- */

        if (this.program.name) {

            document.title = this.program.name;

        }

        this.renderProgramProgress();

        this.renderProgramStatistics();

    },

    /* ======================================================================
       PROGRAM PROGRESS
    ====================================================================== */

    renderProgramProgress() {

        if (!this.dom.progress) return;

        let value = Number(

            this.program.goal?.progress ??

            this.program.progress ??

            0

        );

        if (Number.isNaN(value)) {

            value = 0;

        }

        value = Math.max(

            0,

            Math.min(100, value)

        );

        this.dom.progress.max = 100;

        this.dom.progress.value = value;

        if (this.dom.progressValue) {

            this.dom.progressValue.textContent =

                value + "%";

        }

    },

    /* ======================================================================
       PROGRAM STATISTICS
    ====================================================================== */

    renderProgramStatistics() {

        this.statistics = {

            focuses:

                this.focuses.length,

            projects:

                this.projects.length,

            activeProjects:

                this.projects.filter(project =>

                    (project.status?.code ||

                     project.status) === "active"

                ).length,

            completedProjects:

                this.projects.filter(project =>

                    (project.status?.code ||

                     project.status) === "completed"

                ).length,

            risks:

                this.risks.length

        };

    },

    /* ======================================================================
       RENDER FOCUS LIST
    ====================================================================== */

    renderFocusList() {

        if (!this.dom.focusList) return;

        this.dom.focusList.innerHTML = "";

        if (!this.focuses.length) {

            const empty = this.create(

                "div",

                "focus-empty"

            );

            empty.textContent =

                "Фокусные проекты отсутствуют.";

            this.dom.focusList.appendChild(

                empty

            );

            return;

        }

        this.focuses.forEach(focus => {

            this.dom.focusList.appendChild(

                this.createFocusCard(focus)

            );

        });

    },

    /* ======================================================================
       CREATE FOCUS CARD
    ====================================================================== */

    createFocusCard(focus) {

        const card = this.create(

            "div",

            "focus-card card"

        );

        card.dataset.id = focus.id;

        /* ---------- Title ---------- */

        const title = this.create(

            "h3"

        );

        title.textContent =

            focus.shortName ||

            focus.name ||

            "";

        /* ---------- Description ---------- */

        const description = this.create(

            "div",

            "focus-description"

        );

        description.textContent =

            focus.description ||

            "";

        /* ---------- Progress ---------- */

        const progress = this.create(

            "div",

            "focus-progress"

        );

        const progressBar = document.createElement(

            "span"

        );

        progressBar.style.width =

            this.calculateFocusProgress(

                focus.id

            ) + "%";

        progress.appendChild(

            progressBar

        );

        /* ---------- Statistics ---------- */

        const stat = this.create(

            "div",

            "focus-statistics"

        );

        const count = this.projects.filter(

            project =>

                project.focusId === focus.id

        ).length;

        stat.textContent =

            count +

            " проектов";

        /* ---------- Status ---------- */

        const status = this.create(

            "div",

            "focus-status"

        );

        status.textContent =

            focus.status?.title ||

            focus.status ||

            "";

        card.appendChild(title);

        card.appendChild(description);

        card.appendChild(progress);

        card.appendChild(stat);

        card.appendChild(status);

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

    /* ======================================================================
       CALCULATE FOCUS PROGRESS
    ====================================================================== */

    calculateFocusProgress(focusId) {

        const projects = this.projects.filter(

            project =>

                project.focusId === focusId

        );

        if (!projects.length) {

            return 0;

        }

        const total = projects.reduce(

            (sum, project) =>

                sum +

                Number(

                    project.progress || 0

                ),

            0

        );

        return Math.round(

            total /

            projects.length

        );

    },
        /* ======================================================================
       RENDER PROJECTS
    ====================================================================== */

    renderProjects() {

        if (!this.dom.projectLayer) return;

        this.dom.projectLayer.innerHTML = "";

        const projects =

            this.currentFocus

                ? this.filteredProjects

                : this.projects;
/* ==========================================================
   Build Layout
========================================================== */

if (STM.Layout) {

    STM.Layout.build(

        this.focuses,
        projects,
        this.workspace

    );

}
        if (!projects.length) {

            const empty = this.create(

                "div",

                "project-empty"

            );

            empty.textContent =

                "Проекты отсутствуют.";

            this.dom.projectLayer.appendChild(

                empty

            );

            return;

        }

        /* ---------- Container ---------- */

        this.dom.projectLayer.className =

            "project-workspace";

        /* ---------- Auto Layout ---------- */

        this.projectLayout =

            this.calculateProjectLayout(

                projects

            );

        this.projectLayout.forEach(column => {

            this.dom.projectLayer.appendChild(column);

        });

    },

    /* ======================================================================
       AUTO LAYOUT
    ====================================================================== */

    calculateProjectLayout(projects) {

        const columns = [];

        this.focuses.forEach(focus => {

            const focusProjects =

                projects.filter(

                    project =>

                        project.focusId ===

                        focus.id

                );

            if (!focusProjects.length) {

                return;

            }

            const column = this.create(

                "div",

                "project-column"

            );

            column.dataset.focus =

                focus.id;

            const header = this.create(

                "div",

                "project-column-title"

            );

            header.textContent =

                focus.shortName ||

                focus.name;

            column.appendChild(header);

            focusProjects.forEach(project => {

                column.appendChild(

                    this.createProjectCard(

                        project

                    )

                );

            });

            columns.push(column);

        });

        return columns;

    },

    /* ======================================================================
       CREATE PROJECT CARD
    ====================================================================== */

    createProjectCard(project) {

        const card = this.create(

            "div",

            "project-card card"

        );

        card.dataset.id =

            project.id;

        card.dataset.focus =

            project.focusId;

        card.dataset.status =

            project.status?.code ||

            project.status ||

            "";
/* ==========================================================
   Position
========================================================== */

const position =

    STM.Layout
        ? STM.Layout.getPosition(project.id)
        : { left: 0, top: 0 };

card.style.left = position.left + "px";
card.style.top  = position.top + "px";
        const title = this.create(

            "div",

            "project-title"

        );

        title.textContent =

            project.shortName ||

            project.name ||

            "";

        const description =

            this.create(

                "div",

                "project-description"

            );

        description.textContent =

            project.description ||

            "";

        const progress = this.create(

            "div",

            "progress"

        );

        const bar = this.create(

            "div",

            "progress-bar"

        );

        bar.style.width =

            Number(

                project.progress || 0

            ) + "%";

        progress.appendChild(bar);

        const footer = this.create(

            "div",

            "project-footer"

        );

        footer.textContent =

            project.status?.title ||

            project.status ||

            "";

        card.appendChild(title);

        card.appendChild(description);

        card.appendChild(progress);

        card.appendChild(footer);

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
        /* ======================================================================
       SELECT FOCUS
    ====================================================================== */

    selectFocus(focusId) {

        this.currentFocus = focusId;

        this.currentProject = null;

        this.filteredProjects = this.projects.filter(

            project =>

                project.focusId === focusId

        );

        document

            .querySelectorAll(".focus-card")

            .forEach(card => {

                card.classList.remove("selected");

            });

        const selected = document.querySelector(

            `.focus-card[data-id="${focusId}"]`

        );

        if (selected) {

            selected.classList.add("selected");

        }

        this.renderProjects();

        this.refreshConnections();

        this.refreshTimeline();

        const focus = this.focuses.find(

            item => item.id === focusId

        );

        this.updateStatus(

            focus

                ? `Выбран фокус: ${focus.name}`

                : "Фокус выбран"

        );

    },

    /* ======================================================================
       OPEN PROJECT
    ====================================================================== */

    openProject(projectId) {

        const project = this.projects.find(

            p => p.id === projectId

        );

        if (!project) {

            console.warn(

                "Project not found:",

                projectId

            );

            return;

        }

        this.currentProject = project;

        document

            .querySelectorAll(".project-card")

            .forEach(card => {

                card.classList.remove("selected");

            });

        const selected = document.querySelector(

            `.project-card[data-id="${projectId}"]`

        );

        if (selected) {

            selected.classList.add("selected");

        }

        if (

            STM.Modal &&

            typeof STM.Modal.open === "function"

        ) {

            STM.Modal.open(projectId);

        }

        this.refreshConnections(projectId);

        this.updateStatus(

            `Открыт проект: ${project.name}`

        );

    },

    /* ======================================================================
       CLEAR SELECTION
    ====================================================================== */

    clearSelection() {

        this.currentFocus = null;

        this.currentProject = null;

        this.filteredProjects = [

            ...this.projects

        ];

        document

            .querySelectorAll(".selected")

            .forEach(item => {

                item.classList.remove("selected");

            });

        this.renderProjects();

        this.refreshConnections();

        this.refreshTimeline();

        this.updateStatus();

    },

    /* ======================================================================
       PROJECT LOOKUP
    ====================================================================== */

    getProject(projectId) {

        return this.projects.find(

            project =>

                project.id === projectId

        );

    },

    /* ======================================================================
       FOCUS LOOKUP
    ====================================================================== */

    getFocus(focusId) {

        return this.focuses.find(

            focus =>

                focus.id === focusId

        );

    },
        /* ======================================================================
       RENDER RISKS
    ====================================================================== */

    renderRisks() {

        if (!this.dom.riskList) return;

        this.dom.riskList.innerHTML = "";

        if (!this.risks.length) {

            const empty = this.create(

                "div",

                "risk-empty"

            );

            empty.textContent =

                "Активных рисков нет.";

            this.dom.riskList.appendChild(empty);

            return;

        }

        this.risks.forEach(risk => {

            const card = this.create(

                "div",

                "attention-item"

            );

            card.dataset.id =

                risk.id || "";

            const title = this.create(

                "strong"

            );

            title.textContent =

                risk.title ||

                risk.name ||

                "Без названия";

            const description = this.create(

                "p"

            );

            description.textContent =

                risk.description ||

                "";

            card.appendChild(title);

            card.appendChild(description);

            this.dom.riskList.appendChild(card);

        });

    },

    /* ======================================================================
       RENDER METRICS
    ====================================================================== */

    renderMetrics() {

        this.metricSummary = {};

        if (!this.metrics.length) {

            return;

        }

        this.metrics.forEach(metric => {

            const key =

                metric.code ||

                metric.id;

            this.metricSummary[key] =

                metric.value;

        });

    },

    /* ======================================================================
       SVG CONNECTIONS
    ====================================================================== */

    refreshConnections(projectId = null) {

        if (

            !STM.SVG ||

            typeof STM.SVG.render !== "function"

        ) {

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

        const projects =

            this.currentFocus

                ? this.filteredProjects

                : this.projects;

        STM.SVG.render(

            links,

            projects

        );

    },

    /* ======================================================================
       TIMELINE
    ====================================================================== */

    refreshTimeline() {

        if (

            !STM.Timeline ||

            typeof STM.Timeline.render !== "function"

        ) {

            return;

        }

        STM.Timeline.render(

            this.history

        );

    },

    /* ======================================================================
       STATUS BAR
    ====================================================================== */

    updateStatus(text = null) {

        if (!this.dom.status) {

            return;

        }

        if (text) {

            this.dom.status.textContent =

                text;

            return;

        }

        const focusCount =

            this.focuses.length;

        const projectCount =

            this.projects.length;

        const riskCount =

            this.risks.length;

        this.dom.status.textContent =

            `Фокусов: ${focusCount} · ` +

            `Проектов: ${projectCount} · ` +

            `Рисков: ${riskCount}`;

    },

    /* ======================================================================
       PROJECT DEPENDENCIES
    ====================================================================== */

    getProjectLinks(projectId) {

        return this.links.filter(link =>

            link.from === projectId ||

            link.to === projectId

        );

    },

    /* ======================================================================
       HAS RISK
    ====================================================================== */

    hasProjectRisk(projectId) {

        return this.risks.some(risk =>

            risk.projectId === projectId

        );

    },
        /* ======================================================================
       SEARCH PROJECTS
    ====================================================================== */

    searchProjects(text = "") {

        const query = text.toLowerCase().trim();

        if (!query) {

            this.filteredProjects = [

                ...this.projects

            ];

            this.renderProjects();

            return;

        }

        this.filteredProjects = this.projects.filter(project => {

            return (

                (project.name || "")

                    .toLowerCase()

                    .includes(query)

                ||

                (project.shortName || "")

                    .toLowerCase()

                    .includes(query)

                ||

                (project.code || "")

                    .toLowerCase()

                    .includes(query)

            );

        });

        this.renderProjects();

        this.refreshConnections();

    },

    /* ======================================================================
       SORT PROJECTS
    ====================================================================== */

    sortProjects(field = "name") {

        this.filteredProjects.sort((a, b) => {

            switch (field) {

                case "progress":

                    return (b.progress || 0) -

                           (a.progress || 0);

                case "status":

                    return (

                        a.status?.title ||

                        a.status ||

                        ""

                    ).localeCompare(

                        b.status?.title ||

                        b.status ||

                        ""

                    );

                case "code":

                    return (

                        a.code ||

                        ""

                    ).localeCompare(

                        b.code ||

                        ""

                    );

                default:

                    return (

                        a.name ||

                        ""

                    ).localeCompare(

                        b.name ||

                        ""

                    );

            }

        });

        this.renderProjects();

    },

    /* ======================================================================
       FULL REFRESH
    ====================================================================== */

    refresh() {

        this.render({

            program:

                this.program,

            focuses:

                this.focuses,

            projects:

                this.projects,

            links:

                this.links,

            risks:

                this.risks,

            metrics:

                this.metrics,

            workspace:

                this.workspace,

            dictionaries:

                this.dictionaries,

            history:

                this.history

        });

    },

    /* ======================================================================
       RELOAD FROM LOADER
    ====================================================================== */

    reload() {

        if (!STM.Loader) {

            return;

        }

        this.render({

            program:

                STM.Loader.getProgram(),

            focuses:

                STM.Loader.getFocuses(),

            projects:

                STM.Loader.getProjects(),

            links:

                STM.Loader.getLinks(),

            risks:

                STM.Loader.getRisks(),

            metrics:

                STM.Loader.getMetrics(),

            workspace:

                STM.Loader.getWorkspace(),

            dictionaries:

                STM.Loader.getDictionary(),

            history:

                STM.Loader.getHistory()

        });

    },

    /* ======================================================================
       WINDOW RESIZE
    ====================================================================== */

    resize() {

        this.refreshConnections();

        this.refreshTimeline();

    },

    /* ======================================================================
       EVENTS
    ====================================================================== */

    bindEvents() {

        window.addEventListener(

            "resize",

            () => {

                this.resize();

            }

        );

    },

    /* ======================================================================
       DESTROY
    ====================================================================== */

    destroy() {

        this.currentFocus = null;

        this.currentProject = null;

        this.filteredProjects = [];

        this.projectLayout = {};

        this.clear();

    },

    /* ======================================================================
       HELPERS
    ====================================================================== */

    create(tag, className = "") {

        const element = document.createElement(tag);

        if (className) {

            element.className = className;

        }

        return element;

    },

    clearElement(element) {

        if (!element) return;

        element.innerHTML = "";

    },

    append(parent, child) {

        if (!parent || !child) return;

        parent.appendChild(child);

    },
    
     /* ======================================================================
       EXPORT STATE
    ====================================================================== */

    exportState() {

        return {

            currentFocus: this.currentFocus,

            currentProject: this.currentProject?.id || null,

            filteredProjects: this.filteredProjects.map(

                project => project.id

            )

        };

    },

    /* ======================================================================
       IMPORT STATE
    ====================================================================== */

    restoreState(state = {}) {

        if (!state) return;

        if (state.currentFocus) {

            this.selectFocus(

                state.currentFocus

            );

        }

        if (state.currentProject) {

            this.openProject(

                state.currentProject

            );

        }

    },

    /* ======================================================================
       ADD PROJECT
    ====================================================================== */

    addProject(project) {

        if (!project) return;

        this.projects.push(project);

        this.filteredProjects = [

            ...this.projects

        ];

        this.renderProjects();

        this.refreshConnections();

        this.refreshTimeline();

    },

    /* ======================================================================
       UPDATE PROJECT
    ====================================================================== */

    updateProject(project) {

        const index = this.projects.findIndex(

            p => p.id === project.id

        );

        if (index < 0) return;

        this.projects[index] = project;

        this.filteredProjects = [

            ...this.projects

        ];

        this.renderProjects();

        this.refreshConnections();

    },

    /* ======================================================================
       REMOVE PROJECT
    ====================================================================== */

    removeProject(projectId) {

        this.projects = this.projects.filter(

            project =>

                project.id !== projectId

        );

        this.filteredProjects = [

            ...this.projects

        ];

        this.renderProjects();

        this.refreshConnections();

    },

    /* ======================================================================
       ADD LINK
    ====================================================================== */

    addLink(link) {

        if (!link) return;

        this.links.push(link);

        this.refreshConnections();

    },

    /* ======================================================================
       REMOVE LINK
    ====================================================================== */

    removeLink(linkId) {

        this.links = this.links.filter(

            link =>

                link.id !== linkId

        );

        this.refreshConnections();

    },

    /* ======================================================================
       SAVE WORKSPACE
    ====================================================================== */

    saveWorkspace() {

        console.info(

            "Workspace changed."

        );

        /*
            Build 005

            POST /workspace

            или

            download workspace.json

        */

    },
/* ======================================================================
   SET FILTERED PROJECTS
====================================================================== */

setFilteredProjects(projects = []) {

    this.filteredProjects = Array.isArray(projects)
        ? projects
        : [];

    this.renderProjects();

    if (STM.SVG) {

        STM.SVG.render(
            this.links,
            this.filteredProjects
        );

    }

},
    /* ======================================================================
       DEBUG
    ====================================================================== */

    debug() {

        console.group(

            "STM Renderer"

        );

        console.log(

            "Program:",

            this.program

        );

        console.log(

            "Focuses:",

            this.focuses.length

        );

        console.log(

            "Projects:",

            this.projects.length

        );

        console.log(

            "Links:",

            this.links.length

        );

        console.log(

            "Risks:",

            this.risks.length

        );

        console.log(

            "Current Focus:",

            this.currentFocus

        );

        console.log(

            "Current Project:",

            this.currentProject

        );

        console.groupEnd();

    }

};
