/******************************************************************************
 * Service Transformation Map (STM)
 * Alpha 0.2 / Build 002.0
 *
 * renderer.js
 *
 * Part 1
 *  - Renderer initialization
 *  - DOM cache
 *  - Program rendering
 *  - Workspace rendering
 ******************************************************************************/
'use strict';

window.STM = window.STM || {};
STM.Renderer = {

    /* =======================================================================
       DOM Cache
    ======================================================================= */

    dom: {},

    /* =======================================================================
       Initialization
    ======================================================================= */

    initialize() {

        this.cacheDom();

        console.info("Renderer initialized.");

    },

    /* =======================================================================
       Cache DOM Elements
    ======================================================================= */

    cacheDom() {

        this.dom = {

            app: document.getElementById("app"),

            title: document.getElementById("program-title"),

            goal: document.getElementById("program-goal"),

            progress: document.getElementById("program-progress"),

            focusPanel: document.getElementById("focus-panel"),

            projectLayer: document.getElementById("project-layer"),

            attentionPanel: document.getElementById("attention-panel"),

            timeline: document.getElementById("timeline"),

            status: document.getElementById("status-text"),

            mapContainer: document.getElementById("map-container"),

            connectionLayer: document.getElementById("connection-layer")

        };

    },

    /* =======================================================================
       Render Program
    ======================================================================= */

    renderProgram(program) {

        if (!program) return;

        this.setText(this.dom.title, program.name);

        this.setText(this.dom.goal, program.goal);

        this.renderProgramProgress(program);

        document.title = program.name;

    },

    /* =======================================================================
       Program Progress
    ======================================================================= */

    renderProgramProgress(program) {

        if (!this.dom.progress) return;

        const value = program.progress ?? 0;

        this.dom.progress.value = value;

        this.dom.progress.max = 100;

    },

    /* =======================================================================
       Workspace
    ======================================================================= */

    renderWorkspace(workspace) {

        if (!workspace) return;

        if (workspace.zoom) {

            this.dom.projectLayer.style.transform =
                `scale(${workspace.zoom})`;

        }

        if (workspace.view) {

            this.dom.mapContainer.dataset.view =
                workspace.view;

        }

    },

    /* =======================================================================
       Application Status
    ======================================================================= */

    setStatus(text) {

        this.setText(this.dom.status, text);

    },

    /* =======================================================================
       Refresh Layout
    ======================================================================= */

    refreshLayout() {

        if (STM.SVG) {

            STM.SVG.redraw();

        }

    },

    /* =======================================================================
       Window Resize
    ======================================================================= */

    onResize() {

        this.refreshLayout();

    },

    /* =======================================================================
       Generic DOM Helpers
    ======================================================================= */

    setText(element, text) {

        if (!element) return;

        element.textContent = text ?? "";

    },

    clear(element) {

        if (!element) return;

        element.innerHTML = "";

    },

    append(parent, child) {

        if (!parent || !child) return;

        parent.appendChild(child);

    }

       /* =======================================================================
       Render Focuses
    ======================================================================= */

    renderFocuses(focuses = []) {

        if (!this.dom.focusPanel) return;

        this.clear(this.dom.focusPanel);

        const title = document.createElement("h2");
        title.textContent = "Фокусные проекты";

        this.append(this.dom.focusPanel, title);

        focuses.forEach(focus => {

            const card = this.createFocusCard(focus);

            this.append(this.dom.focusPanel, card);

        });

    },

    /* =======================================================================
       Create Focus Card
    ======================================================================= */

    createFocusCard(focus) {

        const card = document.createElement("article");

        card.className = "card focus-card";

        card.dataset.id = focus.id;

        card.dataset.code = focus.code || "";

        card.dataset.type = "focus";

        /* -------------------------------------------------------------- */

        const title = document.createElement("h3");

        title.textContent = focus.name;

        /* -------------------------------------------------------------- */

        const description = document.createElement("p");

        description.textContent =
            focus.description || "";

        /* -------------------------------------------------------------- */

        const counters = this.createFocusCounters(focus);

        /* -------------------------------------------------------------- */

        const progress = this.createFocusProgress(focus);

        /* -------------------------------------------------------------- */

        card.appendChild(title);

        card.appendChild(description);

        card.appendChild(counters);

        card.appendChild(progress);

        /* -------------------------------------------------------------- */

        if (focus.color) {

            card.style.borderLeft =
                `6px solid ${focus.color}`;

        }

        /* -------------------------------------------------------------- */

        card.addEventListener("click", () => {

            STM.selectFocus(focus.id);

        });

        return card;

    },

    /* =======================================================================
       Focus Counters
    ======================================================================= */

    createFocusCounters(focus) {

        const wrapper = document.createElement("div");

        wrapper.className = "focus-counters";

        const projects =
            focus.projects ?? 0;

        const active =
            focus.active ?? 0;

        wrapper.innerHTML =

            `
            <div class="chip">

                Проектов: <strong>${projects}</strong>

            </div>

            <div class="chip">

                Активных: <strong>${active}</strong>

            </div>
            `;

        return wrapper;

    },

    /* =======================================================================
       Focus Progress
    ======================================================================= */

    createFocusProgress(focus) {

        const wrapper = document.createElement("div");

        wrapper.className = "focus-progress";

        const bar = document.createElement("span");

        const value = focus.progress ?? 0;

        bar.style.width = value + "%";

        wrapper.appendChild(bar);

        return wrapper;

    },

    /* =======================================================================
       Highlight Focus
    ======================================================================= */

    highlightFocus(focusId) {

        this.dom.focusPanel

            ?.querySelectorAll(".focus-card")

            .forEach(card => {

                card.classList.toggle(

                    "selected",

                    card.dataset.id === focusId

                );

            });

        this.filterProjectsByFocus(focusId);

        if (STM.SVG) {

            STM.SVG.redraw();

        }

    },

    /* =======================================================================
       Filter Projects
    ======================================================================= */

    filterProjectsByFocus(focusId) {

        this.dom.projectLayer

            ?.querySelectorAll(".project-card")

            .forEach(card => {

                if (!focusId) {

                    card.style.display = "";

                    return;

                }

                const visible =

                    card.dataset.focus === focusId;

                card.style.display =

                    visible ? "" : "none";

            });

    },
    /* =======================================================================
       Render Projects
    ======================================================================= */

    renderProjects(projects = []) {

        if (!this.dom.projectLayer) return;

        this.clear(this.dom.projectLayer);

        if (!Array.isArray(projects)) return;

        projects.forEach(project => {

            const card = this.createProjectCard(project);

            this.append(this.dom.projectLayer, card);

        });

        if (STM.SVG) {

            STM.SVG.redraw();

        }

    },

    /* =======================================================================
       Create Project Card
    ======================================================================= */

    createProjectCard(project) {

        const card = document.createElement("article");

        card.className = "project-card fade-in";

        card.dataset.id = project.id;

        card.dataset.focus = project.focus;

        card.dataset.status = project.status;

        card.dataset.type = "project";

        /* -------------------------------------------------------------- */
        /* Position */

        const x = Number(project.x ?? 0);
        const y = Number(project.y ?? 0);

        card.style.left = `${x}px`;
        card.style.top = `${y}px`;

        /* -------------------------------------------------------------- */
        /* Header */

        const header = document.createElement("header");
        header.className = "project-header";

        const title = document.createElement("h3");
        title.className = "project-title";
        title.textContent = project.name;

        header.appendChild(title);

        /* -------------------------------------------------------------- */
        /* Status */

        const badge = this.createStatusBadge(project.status);

        /* -------------------------------------------------------------- */
        /* Description */

        const description = document.createElement("p");

        description.className = "project-description";

        description.textContent =
            project.description || "";

        /* -------------------------------------------------------------- */
        /* Progress */

        const progress =
            this.createProjectProgress(project.progress);

        /* -------------------------------------------------------------- */
        /* Footer */

        const footer =
            this.createProjectFooter(project);

        /* -------------------------------------------------------------- */

        card.appendChild(header);

        card.appendChild(badge);

        card.appendChild(description);

        card.appendChild(progress);

        card.appendChild(footer);

        /* -------------------------------------------------------------- */

        card.addEventListener("click", () => {

            STM.openProject(project.id);

        });

        return card;

    },

    /* =======================================================================
       Status Badge
    ======================================================================= */

    createStatusBadge(status = "planned") {

        const badge = document.createElement("div");

        badge.className =
            `badge badge-${status}`;

        const dictionary = {

            planned: "Запланирован",

            active: "В работе",

            completed: "Завершён",

            paused: "Приостановлен",

            risk: "Риск"

        };

        badge.textContent =
            dictionary[status] || status;

        return badge;

    },

    /* =======================================================================
       Progress Bar
    ======================================================================= */

    createProjectProgress(value = 0) {

        const wrapper = document.createElement("div");

        wrapper.className = "progress";

        const bar = document.createElement("div");

        bar.className = "progress-bar";

        bar.style.width = `${value}%`;

        wrapper.appendChild(bar);

        return wrapper;

    },

    /* =======================================================================
       Footer
    ======================================================================= */

    createProjectFooter(project) {

        const footer = document.createElement("footer");

        footer.className = "project-footer";

        /* -------------------------------------------------------------- */

        if (project.owner) {

            const owner = document.createElement("span");

            owner.className = "chip";

            owner.textContent = project.owner;

            footer.appendChild(owner);

        }

        /* -------------------------------------------------------------- */

        if (project.finish) {

            const finish = document.createElement("span");

            finish.className = "chip";

            finish.textContent = project.finish;

            footer.appendChild(finish);

        }

        return footer;

    },

    /* =======================================================================
       Update Project
    ======================================================================= */

    updateProject(project) {

        const card = this.dom.projectLayer
            ?.querySelector(
                `.project-card[data-id="${project.id}"]`
            );

        if (!card) return;

        const progress =
            card.querySelector(".progress-bar");

        if (progress) {

            progress.style.width =
                `${project.progress || 0}%`;

        }

        const badge =
            card.querySelector(".badge");

        if (badge) {

            badge.className =
                `badge badge-${project.status}`;

            badge.textContent =
                this.createStatusBadge(project.status).textContent;

        }

    },
    /* =======================================================================
       Render Risks
    ======================================================================= */

    renderRisks(risks = []) {

        if (!this.dom.attentionPanel) return;

        this.clear(this.dom.attentionPanel);

        const title = document.createElement("h2");
        title.textContent = "Требует внимания";

        this.append(this.dom.attentionPanel, title);

        if (!Array.isArray(risks) || risks.length === 0) {

            const empty = document.createElement("p");
            empty.className = "muted";
            empty.textContent = "Активных рисков нет.";

            this.append(this.dom.attentionPanel, empty);

            return;
        }

        risks.forEach(risk => {

            const card = this.createRiskCard(risk);

            this.append(this.dom.attentionPanel, card);

        });

    },

    /* =======================================================================
       Create Risk Card
    ======================================================================= */

    createRiskCard(risk) {

        const card = document.createElement("article");

        card.className = `risk-card level-${risk.level}`;

        const title = document.createElement("h4");
        title.textContent = risk.title;

        const description = document.createElement("p");
        description.textContent = risk.description || "";

        const footer = document.createElement("div");
        footer.className = "risk-footer";

        const owner = document.createElement("span");
        owner.className = "chip";
        owner.textContent = risk.owner || "Не назначен";

        const level = document.createElement("span");
        level.className = `badge badge-${risk.level}`;
        level.textContent = this.getRiskLevelName(risk.level);

        footer.appendChild(owner);
        footer.appendChild(level);

        card.appendChild(title);
        card.appendChild(description);
        card.appendChild(footer);

        return card;

    },

    /* =======================================================================
       Risk Dictionary
    ======================================================================= */

    getRiskLevelName(level) {

        const dictionary = {

            low: "Низкий",

            medium: "Средний",

            high: "Высокий",

            critical: "Критический"

        };

        return dictionary[level] || level;

    },

    /* =======================================================================
       Refresh Renderer
    ======================================================================= */

    refresh() {

        const data = STM.Loader.data;

        this.renderProgram(data.program);

        this.renderWorkspace(data.workspace);

        this.renderFocuses(data.focuses);

        this.renderProjects(data.projects);

        this.renderRisks(data.risks);

        if (STM.Timeline) {

            STM.Timeline.render(data.history);

        }

        if (STM.SVG) {

            STM.SVG.render(data.links);

        }

    },

    /* =======================================================================
       Refresh Connections Only
    ======================================================================= */

    refreshConnections() {

        if (STM.SVG) {

            STM.SVG.redraw();

        }

    },

    /* =======================================================================
       Reset Focus Filter
    ======================================================================= */

    clearFocusSelection() {

        this.dom.focusPanel

            ?.querySelectorAll(".focus-card")

            .forEach(card => {

                card.classList.remove("selected");

            });

        this.dom.projectLayer

            ?.querySelectorAll(".project-card")

            .forEach(card => {

                card.style.display = "";

                card.classList.remove("dimmed");

            });

        if (STM.SVG) {

            STM.SVG.redraw();

        }

    },

    /* =======================================================================
       Highlight Project
    ======================================================================= */

    highlightProject(projectId) {

        this.dom.projectLayer

            ?.querySelectorAll(".project-card")

            .forEach(card => {

                const active = card.dataset.id === projectId;

                card.classList.toggle("selected", active);

                card.classList.toggle("dimmed", !active);

            });

        if (STM.SVG) {

            STM.SVG.highlight(projectId);

        }

    },

    /* =======================================================================
       Remove Highlight
    ======================================================================= */

    clearProjectHighlight() {

        this.dom.projectLayer

            ?.querySelectorAll(".project-card")

            .forEach(card => {

                card.classList.remove("selected");

                card.classList.remove("dimmed");

            });

        if (STM.SVG) {

            STM.SVG.redraw();

        }

    },
    /* =======================================================================
       Generic Element Factory
    ======================================================================= */

    create(tag, className = "", text = "") {

        const element = document.createElement(tag);

        if (className) {

            element.className = className;

        }

        if (text !== "") {

            element.textContent = text;

        }

        return element;

    },

    /* =======================================================================
       Create Chip
    ======================================================================= */

    createChip(text) {

        return this.create("span", "chip", text);

    },

    /* =======================================================================
       Create Badge
    ======================================================================= */

    createBadge(text, modifier = "") {

        const badge = this.create("span", "badge");

        if (modifier) {

            badge.classList.add(`badge-${modifier}`);

        }

        badge.textContent = text;

        return badge;

    },

    /* =======================================================================
       Show Element
    ======================================================================= */

    show(element) {

        if (!element) return;

        element.hidden = false;

    },

    /* =======================================================================
       Hide Element
    ======================================================================= */

    hide(element) {

        if (!element) return;

        element.hidden = true;

    },

    /* =======================================================================
       Remove Element
    ======================================================================= */

    remove(element) {

        if (!element) return;

        element.remove();

    },

    /* =======================================================================
       Empty Check
    ======================================================================= */

    isEmpty(value) {

        return value === null ||
               value === undefined ||
               value === "";

    },

    /* =======================================================================
       Render Complete
    ======================================================================= */

    complete() {

        this.setStatus("Готово");

        console.info("Renderer completed.");

    },

    /* =======================================================================
       Initial Render
    ======================================================================= */

    render() {

        this.initialize();

        const data = STM.Loader.data;

        this.renderProgram(data.program);

        this.renderWorkspace(data.workspace);

        this.renderFocuses(data.focuses);

        this.renderProjects(data.projects);

        this.renderRisks(data.risks);

        if (STM.Timeline) {

            STM.Timeline.render(data.history);

        }

        if (STM.SVG) {

            STM.SVG.render(data.links);

        }

        this.complete();

    }
};
