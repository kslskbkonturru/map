/******************************************************************************
 * Service Transformation Map (STM)
 * Alpha 0.2 / Build 002.0
 *
 * timeline.js
 *
 * Part 1
 *  - Timeline Controller
 *  - Initialization
 *  - DOM Cache
 *  - Configuration
 ******************************************************************************/

'use strict';

STM.Timeline = {

    /* =======================================================================
       DOM Cache
    ======================================================================= */

    dom: {},

    /* =======================================================================
       State
    ======================================================================= */

    initialized: false,

    currentScale: "quarter",

    currentPeriod: null,

    visibleFrom: null,

    visibleTo: null,

    projects: [],

    milestones: [],

    /* =======================================================================
       Configuration
    ======================================================================= */

    config: {

        scales: {

            month: {

                pixels: 140,

                label: "Месяц"

            },

            quarter: {

                pixels: 240,

                label: "Квартал"

            },

            year: {

                pixels: 720,

                label: "Год"

            }

        }

    },

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

        console.info("Timeline initialized.");

    },

    /* =======================================================================
       Cache DOM
    ======================================================================= */

    cacheDom() {

        this.dom = {

            container:

                document.getElementById("timeline"),

            header:

                document.getElementById("timeline-header"),

            body:

                document.getElementById("timeline-body"),

            scale:

                document.getElementById("timeline-scale"),

            controls:

                document.getElementById("timeline-controls")

        };

    },

    /* =======================================================================
       Render
    ======================================================================= */

    render(history = []) {

        if (!this.initialized) {

            this.initialize();

        }

        this.history = history;

        this.clear();

        this.buildTimeline();

    },

    /* =======================================================================
       Build Timeline
    ======================================================================= */

    buildTimeline() {

        this.buildHeader();

        this.buildBody();

    },

    /* =======================================================================
       Build Header
    ======================================================================= */

    buildHeader() {

        if (!this.dom.header) return;

        this.dom.header.innerHTML = "";

        const title = document.createElement("div");

        title.className = "timeline-title";

        title.textContent = "Дорожная карта";

        this.dom.header.appendChild(title);

    },

    /* =======================================================================
       Build Body
    ======================================================================= */

    buildBody() {

        if (!this.dom.body) return;

        this.dom.body.innerHTML = "";

        const placeholder = document.createElement("div");

        placeholder.className = "timeline-placeholder";

        placeholder.textContent =
            "Шкала времени будет построена на следующем этапе.";

        this.dom.body.appendChild(placeholder);

    },

    /* =======================================================================
       Scale
    ======================================================================= */

    setScale(scale) {

        if (!this.config.scales[scale]) {

            return;

        }

        this.currentScale = scale;

        this.refresh();

    },

    getScale() {

        return this.currentScale;

    },

    /* =======================================================================
       Refresh
    ======================================================================= */

    refresh() {

        this.render(this.history);

    },

    /* =======================================================================
       Events
    ======================================================================= */

    bindEvents() {

        window.addEventListener("resize", () => {

            this.refresh();

        });

    },

    /* =======================================================================
       Helpers
    ======================================================================= */

    clear() {

        if (this.dom.header) {

            this.dom.header.innerHTML = "";

        }

        if (this.dom.body) {

            this.dom.body.innerHTML = "";

        }
    /* =======================================================================
       Build Time Axis
    ======================================================================= */

    buildTimeAxis() {

        const range = this.calculateRange();

        this.visibleFrom = range.from;
        this.visibleTo = range.to;

        this.buildYears(range);
        this.buildQuarters(range);
        this.buildMonths(range);

    },

    /* =======================================================================
       Calculate Timeline Range
    ======================================================================= */

    calculateRange() {

        const projects = STM.Loader.getProjects?.() || [];

        let minDate = null;
        let maxDate = null;

        projects.forEach(project => {

            if (project.start) {

                const start = new Date(project.start);

                if (!minDate || start < minDate) {

                    minDate = start;

                }

            }

            if (project.finish) {

                const finish = new Date(project.finish);

                if (!maxDate || finish > maxDate) {

                    maxDate = finish;

                }

            }

        });

        if (!minDate) {

            minDate = new Date();

        }

        if (!maxDate) {

            maxDate = new Date(minDate);

            maxDate.setFullYear(maxDate.getFullYear() + 1);

        }

        minDate = new Date(minDate.getFullYear(), 0, 1);
        maxDate = new Date(maxDate.getFullYear(), 11, 31);

        return {

            from: minDate,
            to: maxDate

        };

    },

    /* =======================================================================
       Build Years
    ======================================================================= */

    buildYears(range) {

        const row = document.createElement("div");

        row.className = "timeline-years";

        let year = range.from.getFullYear();

        while (year <= range.to.getFullYear()) {

            const cell = document.createElement("div");

            cell.className = "timeline-year";

            cell.textContent = year;

            cell.style.width =
                this.config.scales.year.pixels + "px";

            row.appendChild(cell);

            year++;

        }

        this.dom.body.appendChild(row);

    },

    /* =======================================================================
       Build Quarters
    ======================================================================= */

    buildQuarters(range) {

        const row = document.createElement("div");

        row.className = "timeline-quarters";

        let year = range.from.getFullYear();

        while (year <= range.to.getFullYear()) {

            for (let q = 1; q <= 4; q++) {

                const cell =
                    document.createElement("div");

                cell.className =
                    "timeline-quarter";

                cell.dataset.year = year;

                cell.dataset.quarter = q;

                cell.textContent =
                    "Q" + q;

                cell.style.width =
                    this.config.scales.quarter.pixels + "px";

                row.appendChild(cell);

            }

            year++;

        }

        this.dom.body.appendChild(row);

    },

    /* =======================================================================
       Build Months
    ======================================================================= */

    buildMonths(range) {

        const row = document.createElement("div");

        row.className = "timeline-months";

        const monthNames = [

            "Янв",
            "Фев",
            "Мар",
            "Апр",
            "Май",
            "Июн",
            "Июл",
            "Авг",
            "Сен",
            "Окт",
            "Ноя",
            "Дек"

        ];

        let date = new Date(range.from);

        while (date <= range.to) {

            const cell =
                document.createElement("div");

            cell.className =
                "timeline-month";

            cell.dataset.year =
                date.getFullYear();

            cell.dataset.month =
                date.getMonth() + 1;

            cell.textContent =
                monthNames[date.getMonth()];

            cell.style.width =
                this.config.scales.month.pixels + "px";

            if (this.isCurrentMonth(date)) {

                cell.classList.add("current");

            }

            row.appendChild(cell);

            date.setMonth(date.getMonth() + 1);

        }

        this.dom.body.appendChild(row);

    },

    /* =======================================================================
       Current Month
    ======================================================================= */

    isCurrentMonth(date) {

        const today = new Date();

        return (

            today.getFullYear() === date.getFullYear()

            &&

            today.getMonth() === date.getMonth()

        );

    },

    /* =======================================================================
       Date → X Coordinate
    ======================================================================= */

    getX(dateString) {

        const date = new Date(dateString);

        const months =

            (date.getFullYear() - this.visibleFrom.getFullYear()) * 12 +

            (date.getMonth() - this.visibleFrom.getMonth());

        return months *

            this.config.scales.month.pixels;

    },

    /* =======================================================================
       X → Date
    ======================================================================= */

    getDateByX(x) {

        const months =

            Math.floor(

                x /

                this.config.scales.month.pixels

            );

        const date =

            new Date(this.visibleFrom);

        date.setMonth(

            date.getMonth() + months

        );

        return date;

    },

    /* =======================================================================
       Build Timeline
    ======================================================================= */

    buildTimeline() {

        this.buildHeader();

        this.buildBody();

        this.buildTimeAxis();

    },
      /* =======================================================================
       Render Projects
    ======================================================================= */

    renderProjects() {

        const projects = STM.Loader.getProjects?.() || [];

        this.projects = projects;

        const layer = document.createElement("div");

        layer.className = "timeline-project-layer";

        projects.forEach(project => {

            const item = this.createProjectItem(project);

            layer.appendChild(item);

        });

        this.dom.body.appendChild(layer);

    },

    /* =======================================================================
       Create Timeline Project
    ======================================================================= */

    createProjectItem(project) {

        const item = document.createElement("div");

        item.className = "timeline-project";

        item.dataset.id = project.id;

        item.dataset.status = project.status || "planned";

        const startX = this.getX(project.start);
        const finishX = this.getX(project.finish);

        const width = Math.max(

            finishX - startX,

            this.config.scales.month.pixels / 2

        );

        item.style.left = `${startX}px`;
        item.style.width = `${width}px`;

        const row = this.calculateRow(project);

        item.style.top = `${row * 42}px`;

        item.innerHTML = `

            <div class="timeline-project-bar"></div>

            <span class="timeline-project-title">

                ${project.name}

            </span>

        `;

        item.addEventListener("mouseenter", () => {

            STM.Renderer.highlightProject(project.id);

        });

        item.addEventListener("mouseleave", () => {

            STM.Renderer.clearProjectHighlight();

        });

        item.addEventListener("click", () => {

            STM.Modal.open(project.id);

        });

        return item;

    },

    /* =======================================================================
       Calculate Row
    ======================================================================= */

    calculateRow(project) {

        if (!project.focus) {

            return 0;

        }

        const focuses = STM.Loader.getFocuses?.() || [];

        const index = focuses.findIndex(

            focus => focus.id === project.focus

        );

        return Math.max(index, 0);

    },

    /* =======================================================================
       Render Milestones
    ======================================================================= */

    renderMilestones() {

        const history = STM.Loader.getHistory?.() || [];

        const milestones = history.filter(item =>

            item.type === "milestone"

        );

        this.milestones = milestones;

        const layer = document.createElement("div");

        layer.className = "timeline-milestone-layer";

        milestones.forEach(item => {

            layer.appendChild(

                this.createMilestone(item)

            );

        });

        this.dom.body.appendChild(layer);

    },

    /* =======================================================================
       Create Milestone
    ======================================================================= */

    createMilestone(item) {

        const marker = document.createElement("div");

        marker.className = "timeline-milestone";

        marker.style.left =

            `${this.getX(item.date)}px`;

        marker.title = item.event;

        marker.innerHTML = `

            <div class="timeline-milestone-icon">◆</div>

            <div class="timeline-milestone-label">

                ${item.event}

            </div>

        `;

        return marker;

    },

    /* =======================================================================
       Today Marker
    ======================================================================= */

    renderToday() {

        const today = document.createElement("div");

        today.className = "timeline-today";

        today.style.left =

            `${this.getX(new Date().toISOString())}px`;

        this.dom.body.appendChild(today);

    },

    /* =======================================================================
       Synchronization
    ======================================================================= */

    syncSelection(projectId) {

        this.dom.body

            ?.querySelectorAll(".timeline-project")

            .forEach(item => {

                item.classList.toggle(

                    "selected",

                    item.dataset.id === projectId

                );

            });

    },

    /* =======================================================================
       Build Timeline
    ======================================================================= */

    buildTimeline() {

        this.buildHeader();

        this.buildBody();

        this.buildTimeAxis();

        this.renderProjects();

        this.renderMilestones();

        this.renderToday();

    },
      /* =======================================================================
       Navigate
    ======================================================================= */

    moveTo(date) {

        if (!this.dom.body) return;

        const x = this.getX(date);

        this.dom.body.scrollTo({

            left: Math.max(x - 300, 0),

            behavior: "smooth"

        });

    },

    moveToday() {

        this.moveTo(new Date().toISOString());

    },

    moveToProject(projectId) {

        const project =

            STM.Loader
                .getProjects()
                .find(item => item.id === projectId);

        if (!project) return;

        this.moveTo(project.start);

        this.syncSelection(project.id);

    },

    /* =======================================================================
       Filter
    ======================================================================= */

    filterProjects(predicate) {

        this.dom.body

            ?.querySelectorAll(".timeline-project")

            .forEach(item => {

                const project =

                    this.projects.find(

                        p => p.id === item.dataset.id

                    );

                if (!project) return;

                item.style.display =

                    predicate(project)

                        ? ""

                        : "none";

            });

    },

    clearFilter() {

        this.dom.body

            ?.querySelectorAll(".timeline-project")

            .forEach(item => {

                item.style.display = "";

            });

    },

    /* =======================================================================
       Scale
    ======================================================================= */

    zoomIn() {

        const order = [

            "month",

            "quarter",

            "year"

        ];

        const index =

            order.indexOf(this.currentScale);

        if (index === 0) return;

        this.setScale(

            order[index - 1]

        );

    },

    zoomOut() {

        const order = [

            "month",

            "quarter",

            "year"

        ];

        const index =

            order.indexOf(this.currentScale);

        if (index === order.length - 1) return;

        this.setScale(

            order[index + 1]

        );

    },

    /* =======================================================================
       Export State
    ======================================================================= */

    getState() {

        return {

            scale: this.currentScale,

            visibleFrom: this.visibleFrom,

            visibleTo: this.visibleTo,

            projects: this.projects.length,

            milestones: this.milestones.length

        };

    },

    /* =======================================================================
       Destroy
    ======================================================================= */

    destroy() {

        this.clear();

        this.projects = [];

        this.milestones = [];

        this.visibleFrom = null;

        this.visibleTo = null;

        this.currentPeriod = null;

        this.initialized = false;

    },

    /* =======================================================================
       Complete
    ======================================================================= */

    complete() {

        console.info("Timeline completed.");

    }
    };
