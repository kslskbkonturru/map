/******************************************************************************
 * Service Transformation Map (STM)
 * modal.js
 *
 * Build 003.1
 * Part 1
 *
 * Namespace
 * State
 * Initialize
 * Cache DOM
 ******************************************************************************/

'use strict';

window.STM = window.STM || {};

STM.Modal = {

    /* =======================================================================
       DOM
    ======================================================================= */

    dom: {},

    /* =======================================================================
       State
    ======================================================================= */

    initialized: false,

    currentEntity: null,

    currentType: null,

    currentTab: "overview",

    /* =======================================================================
       Initialize
    ======================================================================= */

    initialize() {

        if (this.initialized) {
            return;
        }

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
       Compatibility
    ======================================================================= */

    openProject(projectId) {

        this.open(projectId);

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

        this.dom.close?.addEventListener(

            "click",

            () => {

                this.close();

            }

        );

        this.dom.overlay?.addEventListener(

            "click",

            event => {

                if (event.target === this.dom.overlay) {

                    this.close();

                }

            }

        );

        document.addEventListener(

            "keydown",

            event => {

                if (event.key === "Escape") {

                    this.close();

                }

            }

        );

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

                console.warn("Unknown modal entity.");

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

        if (!this.dom.title) return;

        this.dom.title.textContent =
            project.name || "";

        if (this.dom.subtitle) {

            this.dom.subtitle.textContent =
                project.description || "";

        }

        if (this.dom.header) {

            const oldBadge =
                this.dom.header.querySelector(".badge");

            if (oldBadge) {

                oldBadge.remove();

            }

            const badge = this.createBadge(

                this.getStatusName(

                    project.status?.code || project.status

                ),

                project.status?.code || project.status || "active"

            );

            this.dom.header.appendChild(badge);

        }

    },

    /* =======================================================================
       Tabs
    ======================================================================= */

    buildTabs() {

        if (!this.dom.tabs) return;

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

            button.addEventListener(

                "click",

                () => {

                    this.switchTab(tab.id);

                }

            );

            this.dom.tabs.appendChild(button);

        });

    },
        /* =======================================================================
       Body
    ======================================================================= */

    buildBody(project) {

        if (!this.dom.body) return;

        this.clear(this.dom.body);

        this.renderOverview(project);

    },

    /* =======================================================================
       Footer
    ======================================================================= */

    buildFooter(project) {

        if (!this.dom.footer) return;

        this.clear(this.dom.footer);

        const closeButton = document.createElement("button");

        closeButton.className = "btn btn-secondary";

        closeButton.textContent = "Закрыть";

        closeButton.addEventListener(

            "click",

            () => this.close()

        );

        this.dom.footer.appendChild(closeButton);

    },

    /* =======================================================================
       Switch Tab
    ======================================================================= */

    switchTab(tab) {

        this.currentTab = tab;

        this.dom.tabs

            ?.querySelectorAll(".modal-tab")

            .forEach(button => {

                button.classList.toggle(

                    "active",

                    button.dataset.tab === tab

                );

            });

        switch (tab) {

            case "overview":

                this.renderOverview(this.currentEntity);

                break;

            case "metrics":

                this.renderMetrics(this.currentEntity);

                break;

            case "links":

                this.renderLinks(this.currentEntity);

                break;

            case "history":

                this.renderHistory(this.currentEntity);

                break;

        }

    },

    /* =======================================================================
       Overview
    ======================================================================= */

    renderOverview(project) {

        if (!this.dom.body) return;

        this.clear(this.dom.body);

        const wrapper = this.create(

            "div",

            "modal-section"

        );

        wrapper.innerHTML = `

            <div class="modal-field">

                <strong>Код</strong>

                <div>${project.code || "-"}</div>

            </div>

            <div class="modal-field">

                <strong>Название</strong>

                <div>${project.name || "-"}</div>

            </div>

            <div class="modal-field">

                <strong>Описание</strong>

                <div>${project.description || "-"}</div>

            </div>

            <div class="modal-field">

                <strong>Цель</strong>

                <div>${project.goal || "-"}</div>

            </div>

            <div class="modal-field">

                <strong>Статус</strong>

                <div>${this.getStatusName(

                    project.status?.code ||

                    project.status

                )}</div>

            </div>

            <div class="modal-field">

                <strong>Прогресс</strong>

                <div>${project.progress ?? 0}%</div>

            </div>

            <div class="modal-field">

                <strong>Период</strong>

                <div>

                    ${project.timeline?.start || "-"}

                    →

                    ${project.timeline?.finish || "-"}

                </div>

            </div>

        `;

        this.dom.body.appendChild(wrapper);

    },
        /* =======================================================================
       Metrics
    ======================================================================= */

    renderMetrics(project) {

        if (!this.dom.body) return;

        this.clear(this.dom.body);

        const metrics = STM.Loader.getMetrics()

            .filter(metric =>

                metric.projectId === project.id

            );

        if (!metrics.length) {

            this.dom.body.innerHTML =

                "<p>Метрики отсутствуют.</p>";

            return;

        }

        metrics.forEach(metric => {

            const row = this.create(

                "div",

                "modal-row"

            );

            row.innerHTML = `

                <strong>${metric.name}</strong>

                <span>${metric.value}</span>

            `;

            this.dom.body.appendChild(row);

        });

    },

    /* =======================================================================
       Links
    ======================================================================= */

    renderLinks(project) {

        if (!this.dom.body) return;

        this.clear(this.dom.body);

        const links = STM.Loader.getLinks()

            .filter(link =>

                link.from === project.id ||

                link.to === project.id

            );

        if (!links.length) {

            this.dom.body.innerHTML =

                "<p>Связи отсутствуют.</p>";

            return;

        }

        links.forEach(link => {

            const projectId =

                link.from === project.id

                    ? link.to

                    : link.from;

            const target = STM.Loader

                .getProjects()

                .find(p => p.id === projectId);

            const row = this.create(

                "div",

                "modal-row modal-link"

            );

            row.innerHTML = `

                <strong>

                    ${target?.code || ""}

                </strong>

                <span>

                    ${target?.name || projectId}

                </span>

            `;

            row.addEventListener(

                "click",

                () => {

                    this.open(projectId);

                }

            );

            this.dom.body.appendChild(row);

        });

    },

    /* =======================================================================
       History
    ======================================================================= */

    renderHistory(project) {

        if (!this.dom.body) return;

        this.clear(this.dom.body);

        const history = STM.Loader

            .getHistory()

            .filter(item =>

                item.projectId === project.id

            );

        if (!history.length) {

            this.dom.body.innerHTML =

                "<p>История отсутствует.</p>";

            return;

        }

        history.forEach(item => {

            const row = this.create(

                "div",

                "modal-history-row"

            );

            row.innerHTML = `

                <div>

                    <strong>

                        ${item.date || ""}

                    </strong>

                </div>

                <div>

                    ${item.description || ""}

                </div>

            `;

            this.dom.body.appendChild(row);

        });

    },
        /* =======================================================================
       Create Element
    ======================================================================= */

    create(tag, className = "") {

        const element = document.createElement(tag);

        if (className) {

            element.className = className;

        }

        return element;

    },

    /* =======================================================================
       Clear Element
    ======================================================================= */

    clear(element) {

        if (!element) return;

        element.innerHTML = "";

    },

    /* =======================================================================
       Status Dictionary
    ======================================================================= */

    getStatusName(code) {

        const dictionary = {

            active: "В реализации",

            planned: "Планируется",

            completed: "Завершен",

            paused: "Приостановлен",

            cancelled: "Отменен"

        };

        return dictionary[code] || code || "";

    },

    /* =======================================================================
       Status Badge
    ======================================================================= */

    createBadge(title, status) {

        const badge = this.create(

            "span",

            `badge badge-${status}`

        );

        badge.textContent = title;

        return badge;

    },

    /* =======================================================================
       Refresh
    ======================================================================= */

    refresh() {

        if (

            !this.currentEntity ||

            !this.currentType

        ) {

            return;

        }

        this.render();

    },

    /* =======================================================================
       Destroy
    ======================================================================= */

    destroy() {

        this.hide();

        this.currentEntity = null;

        this.currentType = null;

        this.currentTab = "overview";

        if (this.dom.body) {

            this.clear(this.dom.body);

        }

        if (this.dom.tabs) {

            this.clear(this.dom.tabs);

        }

        if (this.dom.footer) {

            this.clear(this.dom.footer);

        }

    }

};
