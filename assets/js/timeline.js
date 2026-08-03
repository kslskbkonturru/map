/******************************************************************************
 * Service Transformation Map (STM)
 * Build 003.1
 *
 * timeline.js
 *
 * Part 1
 *  - Namespace
 *  - State
 *  - DOM
 *  - Initialize
 ******************************************************************************/

'use strict';

window.STM = window.STM || {};

STM.Timeline = {

    /* =======================================================================
       State
    ======================================================================= */

    initialized: false,

    history: [],

    projects: [],

    visibleProjects: [],

    currentScale: "quarter",

    visibleFrom: null,

    visibleTo: null,

    dom: {},

    /* =======================================================================
       Configuration
    ======================================================================= */

    config: {

        scaleWidth: {

            month: 140,

            quarter: 260,

            year: 1040

        },

        minYear: 2025,

        maxYear: 2035

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

        this.projects =
            STM.Loader.getProjects() || [];

        this.visibleProjects =
            [...this.projects];

        this.refresh();

    },

    /* =======================================================================
       Refresh
    ======================================================================= */

    refresh() {

        this.clear();

        this.buildTimeline();

    },

    /* =======================================================================
       Clear
    ======================================================================= */

    clear() {

        if (this.dom.header) {

            this.dom.header.innerHTML = "";

        }

        if (this.dom.body) {

            this.dom.body.innerHTML = "";

        }

    },
        /* =======================================================================
       Build Timeline
    ======================================================================= */

    buildTimeline() {

        this.calculateRange();

        this.buildHeader();

        this.buildTimeAxis();

        this.buildProjectRows();

    },

    /* =======================================================================
       Calculate Visible Range
    ======================================================================= */

    calculateRange() {

        let minYear = this.config.maxYear;
        let maxYear = this.config.minYear;

        this.visibleProjects.forEach(project => {

            const start = project.timeline?.start;
            const finish = project.timeline?.finish;

            if (start) {

                const year = parseInt(start.substring(0, 4));

                if (year < minYear) {

                    minYear = year;

                }

            }

            if (finish) {

                const year = parseInt(finish.substring(0, 4));

                if (year > maxYear) {

                    maxYear = year;

                }

            }

        });

        if (minYear > maxYear) {

            minYear = new Date().getFullYear();

            maxYear = minYear + 1;

        }

        this.visibleFrom = minYear;

        this.visibleTo = maxYear;

    },

    /* =======================================================================
       Header
    ======================================================================= */

    buildHeader() {

        if (!this.dom.header) {

            return;

        }

        const title = document.createElement("div");

        title.className = "timeline-title";

        title.textContent = "Дорожная карта программы";

        this.dom.header.appendChild(title);

    },

    /* =======================================================================
       Time Axis
    ======================================================================= */

    buildTimeAxis() {

        if (!this.dom.body) {

            return;

        }

        const axis = document.createElement("div");

        axis.className = "timeline-axis";

        for (

            let year = this.visibleFrom;

            year <= this.visibleTo;

            year++

        ) {

            const yearBlock = document.createElement("div");

            yearBlock.className = "timeline-year";

            yearBlock.style.width =
                this.config.scaleWidth.year + "px";

            const title = document.createElement("div");

            title.className = "timeline-year-title";

            title.textContent = year;

            yearBlock.appendChild(title);

            const quarters = document.createElement("div");

            quarters.className = "timeline-quarters";

            for (let q = 1; q <= 4; q++) {

                const quarter = document.createElement("div");

                quarter.className = "timeline-quarter";

                quarter.style.width =
                    this.config.scaleWidth.quarter + "px";

                quarter.textContent = "Q" + q;

                quarters.appendChild(quarter);

            }

            yearBlock.appendChild(quarters);

            axis.appendChild(yearBlock);

        }

        this.dom.body.appendChild(axis);

    },
        /* =======================================================================
       Project Rows
    ======================================================================= */

    buildProjectRows() {

        if (!this.dom.body) {

            return;

        }

        const container = document.createElement("div");

        container.className = "timeline-projects";

        this.visibleProjects.forEach(project => {

            container.appendChild(

                this.buildProjectRow(project)

            );

        });

        this.dom.body.appendChild(container);

    },

    /* =======================================================================
       Build Project Row
    ======================================================================= */

    buildProjectRow(project) {

        const row = document.createElement("div");

        row.className = "timeline-row";

        row.dataset.id = project.id;

        /* ---------- Project Name ---------- */

        const label = document.createElement("div");

        label.className = "timeline-label";

        label.textContent =
            project.shortName || project.name;

        row.appendChild(label);

        /* ---------- Timeline Area ---------- */

        const area = document.createElement("div");

        area.className = "timeline-row-area";

        area.appendChild(

            this.buildProjectBar(project)

        );

        row.appendChild(area);

        return row;

    },

    /* =======================================================================
       Build Project Bar
    ======================================================================= */

    buildProjectBar(project) {

        const bar = document.createElement("div");

        bar.className = "timeline-bar";

        bar.dataset.id = project.id;

        const start = project.timeline?.start;

        const finish = project.timeline?.finish;

        const left = this.calculateOffset(start);

        const width = this.calculateDuration(

            start,

            finish

        );

        bar.style.left = left + "px";

        bar.style.width = width + "px";

        bar.textContent =

            project.code ||

            project.shortName ||

            project.name;

        bar.addEventListener(

            "click",

            () => {

                STM.Modal.openProject(project.id);

            }

        );

        return bar;

    },

    /* =======================================================================
       Timeline Offset
    ======================================================================= */

    calculateOffset(period) {

        if (!period) {

            return 0;

        }

        const year = parseInt(

            period.substring(0, 4)

        );

        const quarter = parseInt(

            period.substring(6)

        );

        const years =

            year - this.visibleFrom;

        return (

            years *

            this.config.scaleWidth.year +

            (quarter - 1) *

            this.config.scaleWidth.quarter

        );

    },

    /* =======================================================================
       Timeline Width
    ======================================================================= */

    calculateDuration(

        start,

        finish

    ) {

        if (!start || !finish) {

            return this.config.scaleWidth.quarter;

        }

        const startYear = parseInt(

            start.substring(0, 4)

        );

        const startQuarter = parseInt(

            start.substring(6)

        );

        const finishYear = parseInt(

            finish.substring(0, 4)

        );

        const finishQuarter = parseInt(

            finish.substring(6)

        );

        const quarters =

            (finishYear - startYear) * 4 +

            (finishQuarter - startQuarter) + 1;

        return (

            quarters *

            this.config.scaleWidth.quarter

        );

    },
        /* =======================================================================
       Today Marker
    ======================================================================= */

    buildTodayMarker() {

        if (!this.dom.body) {

            return;

        }

        const today = new Date();

        const year = today.getFullYear();

        const month = today.getMonth() + 1;

        const quarter = Math.ceil(month / 3);

        if (

            year < this.visibleFrom ||

            year > this.visibleTo

        ) {

            return;

        }

        const marker = document.createElement("div");

        marker.className = "timeline-today";

        marker.style.left =

            this.calculateOffset(

                `${year}-Q${quarter}`

            ) + "px";

        this.dom.body.appendChild(marker);

    },

    /* =======================================================================
       Milestones
    ======================================================================= */

    buildMilestones() {

        if (!this.dom.body) {

            return;

        }

        this.visibleProjects.forEach(project => {

            if (!project.milestones) {

                return;

            }

            project.milestones.forEach(milestone => {

                const point = document.createElement("div");

                point.className = "timeline-milestone";

                point.style.left =

                    this.calculateOffset(

                        milestone.period

                    ) + "px";

                point.title = milestone.name;

                this.dom.body.appendChild(point);

            });

        });

    },

    /* =======================================================================
       Highlight Project Status
    ======================================================================= */

    updateProjectStyles() {

        document

            .querySelectorAll(".timeline-bar")

            .forEach(bar => {

                const project =

                    this.visibleProjects.find(

                        p => p.id === bar.dataset.id

                    );

                if (!project) {

                    return;

                }

                bar.classList.remove(

                    "planned",

                    "active",

                    "completed",

                    "delayed"

                );

                switch (

                    project.status?.code

                ) {

                    case "planned":

                        bar.classList.add(

                            "planned"

                        );

                        break;

                    case "completed":

                        bar.classList.add(

                            "completed"

                        );

                        break;

                    case "delayed":

                        bar.classList.add(

                            "delayed"

                        );

                        break;

                    default:

                        bar.classList.add(

                            "active"

                        );

                }

            });

    },

    /* =======================================================================
       Legend
    ======================================================================= */

    buildLegend() {

        if (!this.dom.controls) {

            return;

        }

        this.dom.controls.innerHTML = "";

        const legend = [

            {

                cls: "planned",

                text: "Планируется"

            },

            {

                cls: "active",

                text: "В реализации"

            },

            {

                cls: "completed",

                text: "Завершено"

            },

            {

                cls: "delayed",

                text: "Есть риск"

            }

        ];

        legend.forEach(item => {

            const block = document.createElement("div");

            block.className =

                "timeline-legend-item";

            block.innerHTML =

                `<span class="timeline-color ${item.cls}"></span>${item.text}`;

            this.dom.controls.appendChild(

                block

            );

        });

    },

    /* =======================================================================
       Refresh Decorations
    ======================================================================= */

    decorateTimeline() {

        this.buildTodayMarker();

        this.buildMilestones();

        this.updateProjectStyles();

        this.buildLegend();

    },
        /* =======================================================================
       Set Scale
    ======================================================================= */

    setScale(scale) {

        if (!this.config.scaleWidth[scale]) {

            return;

        }

        this.currentScale = scale;

        this.refresh();

    },

    /* =======================================================================
       Get Scale Width
    ======================================================================= */

    getScaleWidth() {

        return this.config.scaleWidth[
            this.currentScale
        ];

    },

    /* =======================================================================
       Zoom In
    ======================================================================= */

    zoomIn() {

        switch (this.currentScale) {

            case "year":

                this.currentScale = "quarter";

                break;

            case "quarter":

                this.currentScale = "month";

                break;

        }

        this.refresh();

    },

    /* =======================================================================
       Zoom Out
    ======================================================================= */

    zoomOut() {

        switch (this.currentScale) {

            case "month":

                this.currentScale = "quarter";

                break;

            case "quarter":

                this.currentScale = "year";

                break;

        }

        this.refresh();

    },

    /* =======================================================================
       Scroll To Project
    ======================================================================= */

    scrollToProject(projectId) {

        const row = document.querySelector(

            `.timeline-row[data-id="${projectId}"]`

        );

        if (!row) {

            return;

        }

        row.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });

    },

    /* =======================================================================
       Highlight Project
    ======================================================================= */

    highlightProject(projectId) {

        document

            .querySelectorAll(".timeline-row")

            .forEach(row => {

                row.classList.toggle(

                    "selected",

                    row.dataset.id === projectId

                );

            });

    },

    /* =======================================================================
       Apply Filtered Projects
    ======================================================================= */

    setProjects(projects = []) {

        this.visibleProjects = [...projects];

        this.refresh();

    },

    /* =======================================================================
       Synchronize With Renderer
    ======================================================================= */

    synchronize() {

        if (

            STM.Renderer &&

            typeof STM.Renderer.getVisibleProjects === "function"

        ) {

            this.visibleProjects =

                STM.Renderer.getVisibleProjects();

        }

        this.refresh();

    },

    /* =======================================================================
       Resize
    ======================================================================= */

    resize() {

        this.refresh();

    },

    /* =======================================================================
       Events
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
       Statistics
    ======================================================================= */

    statistics() {

        return {

            initialized: this.initialized,

            scale: this.currentScale,

            totalProjects: this.projects.length,

            visibleProjects: this.visibleProjects.length,

            visibleFrom: this.visibleFrom,

            visibleTo: this.visibleTo

        };

    },

    /* =======================================================================
       Get Visible Projects
    ======================================================================= */

    getVisibleProjects() {

        return this.visibleProjects;

    },

    /* =======================================================================
       Get Timeline Range
    ======================================================================= */

    getRange() {

        return {

            from: this.visibleFrom,

            to: this.visibleTo

        };

    },

    /* =======================================================================
       Get Current Scale
    ======================================================================= */

    getScale() {

        return this.currentScale;

    },

    /* =======================================================================
       Set Visible Projects
    ======================================================================= */

    updateProjects(projects = []) {

        this.visibleProjects = [...projects];

        this.refresh();

    },

    /* =======================================================================
       Reset
    ======================================================================= */

    reset() {

        this.visibleProjects = [...this.projects];

        this.currentScale = "quarter";

        this.refresh();

    },

    /* =======================================================================
       Destroy
    ======================================================================= */

    destroy() {

        this.initialized = false;

        this.projects = [];

        this.visibleProjects = [];

        this.history = [];

        this.visibleFrom = null;

        this.visibleTo = null;

        this.dom = {};

    }

};
