/******************************************************************************
 * Service Transformation Map (STM)
 * Timeline Engine
 *
 * Build 004.04 (Refactored)
 *
 * Отдельная тестовая версия Timeline.
 * Рабочую Build 004.01 не заменяет.
 *
 * Назначение:
 * - показать проекты на общей шкале программы;
 * - использовать start / finish проекта;
 * - показать текущий квартал;
 * - использовать только фиксированные статусы;
 * - поддерживать фильтрацию проектов;
 * - не менять Renderer / Layout / App.
 *
 * Рефакторинг: устранены дублирующиеся паттерны,
 * добавлены общие методы для построения шкалы и расчёта позиций.
 ******************************************************************************/

"use strict";

window.STM = window.STM || {};

STM.Timeline = {

    initialized: false,

    history: [],
    projects: [],
    visibleProjects: [],

    currentScale: "quarter",

    visibleFrom: null,
    visibleTo: null,

    dom: {},

    /* ------------------------------------------------------------------ */
    /* Fixed status vocabulary                                            */
    /* ------------------------------------------------------------------ */

    statuses: {
        planned: "Планируется",
        active: "В работе",
        paused: "Пауза",
        completed: "Завершен"
    },

    config: {
        monthWidth: 70,
        quarterWidth: 210,
        yearWidth: 840,
        rowHeight: 44,
        labelWidth: 230,
        minYears: 1,
        paddingQuarters: 1
    },

    /* ==================================================================
       INITIALIZE
    ================================================================== */

    initialize() {

        if (this.initialized) return;

        this.cacheDom();
        this.bindEvents();

        this.initialized = true;

        console.info("Timeline initialized (Build 004.04).");
    },

    /* ==================================================================
       DOM
    ================================================================== */

    cacheDom() {

        this.dom = {
            container: document.getElementById("timeline"),
            header: document.getElementById("timeline-header"),
            body: document.getElementById("timeline-body"),
            scale: document.getElementById("timeline-scale"),
            controls: document.getElementById("timeline-controls")
        };
    },

    /* ==================================================================
       EVENTS
    ================================================================== */

    bindEvents() {

        if (!this.dom.scale) return;

        this.dom.scale.addEventListener("click", event => {

            const button = event.target.closest("[data-scale]");

            if (!button) return;

            this.setScale(button.dataset.scale);

        });
    },

    /* ==================================================================
       RENDER
    ================================================================== */

    render(history = []) {

        if (!this.initialized) {
            this.initialize();
        }

        this.history = Array.isArray(history) ? history : [];

        const loadedProjects =
            STM.Loader &&
            typeof STM.Loader.getProjects === "function"
                ? STM.Loader.getProjects()
                : [];

        this.projects = this.normalizeArray(loadedProjects);

        if (
            !this.visibleProjects.length ||
            this.visibleProjects.length > this.projects.length
        ) {

            this.visibleProjects = [...this.projects];

        } else {

            const ids = new Set(
                this.projects.map(project => project.id)
            );

            this.visibleProjects =
                this.visibleProjects.filter(
                    project => ids.has(project.id)
                );

            if (
                !this.visibleProjects.length &&
                this.projects.length
            ) {

                this.visibleProjects = [...this.projects];

            }

        }

        this.refresh();

    },

    /* ==================================================================
       REFRESH
    ================================================================== */

    refresh() {

        this.clear();

        this.renderScaleControls();

        this.calculateRange();

        this.buildTimeline();

    },

    /* ==================================================================
       CLEAR
    ================================================================== */

    clear() {

        [
            "header",
            "body",
            "controls",
            "scale"
        ].forEach(key => {

            if (this.dom[key]) {

                this.dom[key].innerHTML = "";

            }

        });

    },

    /* ==================================================================
       SCALE CONTROLS
    ================================================================== */

    renderScaleControls() {

        if (!this.dom.scale) return;

        const scales = [

            {
                id: "month",
                title: "Месяц"
            },

            {
                id: "quarter",
                title: "Квартал"
            },

            {
                id: "year",
                title: "Год"
            }

        ];

        scales.forEach(scale => {

            const button =
                document.createElement("button");

            button.type = "button";

            button.dataset.scale =
                scale.id;

            button.textContent =
                scale.title;

            button.className =
                this.currentScale === scale.id
                    ? "active"
                    : "";

            this.dom.scale.appendChild(
                button
            );

        });

    },

    /* ==================================================================
       RANGE
    ================================================================== */

    calculateRange() {

        const periods = [];

        this.visibleProjects.forEach(project => {

            if (project.timeline?.start) {

                periods.push(
                    project.timeline.start
                );

            }

            if (project.timeline?.finish) {

                periods.push(
                    project.timeline.finish
                );

            }

        });

        /* Используем период программы, если он доступен. */

        const program =
            STM.Loader &&
            typeof STM.Loader.getProgram === "function"
                ? STM.Loader.getProgram()
                : null;

        const programData =
            program?.data ||
            program ||
            {};

        if (programData.period?.start) {

            periods.push(
                programData.period.start
            );

        }

        if (programData.period?.finish) {

            periods.push(
                programData.period.finish
            );

        }

        const parsed =
            periods
                .map(period =>
                    this.parsePeriod(period)
                )
                .filter(Boolean);

        if (!parsed.length) {

            const now =
                new Date();

            this.visibleFrom = {

                year:
                    now.getFullYear(),

                quarter:
                    Math.ceil(
                        (now.getMonth() + 1) / 3
                    ),

                month:
                    now.getMonth() + 1

            };

            this.visibleTo = {

                year:
                    this.visibleFrom.year + 1,

                quarter: 4,

                month: 12

            };

            return;

        }

        let min = parsed[0];

        let max = parsed[0];

        parsed.forEach(period => {

            if (
                this.comparePeriods(
                    period,
                    min
                ) < 0
            ) {

                min = period;

            }

            if (
                this.comparePeriods(
                    period,
                    max
                ) > 0
            ) {

                max = period;

            }

        });

        /* Небольшой запас по краям шкалы. */

        min =
            this.shiftQuarter(
                min,
                -this.config.paddingQuarters
            );

        max =
            this.shiftQuarter(
                max,
                this.config.paddingQuarters
            );

        if (
            this.quarterDistance(
                min,
                max
            ) <
            this.config.minYears * 4
        ) {

            max =
                this.shiftQuarter(
                    min,
                    this.config.minYears * 4
                );

        }

        this.visibleFrom = min;

        this.visibleTo = max;

    },

    /* ==================================================================
       BUILD TIMELINE
    ================================================================== */

    buildTimeline() {

        this.buildHeader();

        this.buildTimeAxis();

        this.buildProjectRows();

        this.buildTodayMarker();

        this.buildLegend();

    },

    /* ==================================================================
       HEADER
    ================================================================== */

    buildHeader() {

        if (!this.dom.header) return;

        const title =
            document.createElement("div");

        title.className =
            "timeline-title";

        title.textContent =
            "Дорожная карта программы";

        const subtitle =
            document.createElement("div");

        subtitle.className =
            "timeline-subtitle";

        subtitle.textContent =
            `${this.formatPeriod(
                this.visibleFrom
            )} → ${this.formatPeriod(
                this.visibleTo
            )}`;

        this.dom.header.appendChild(
            title
        );

        this.dom.header.appendChild(
            subtitle
        );

    },

    /* ==================================================================
       TIME AXIS (рефакторинг – общий метод построения шкалы)
    ================================================================== */

    buildTimeAxis() {

        if (
            !this.dom.body ||
            !this.visibleFrom ||
            !this.visibleTo
        ) {

            return;

        }

        const axis =
            document.createElement("div");

        axis.className =
            "timeline-axis";

        const label =
            document.createElement("div");

        label.className =
            "timeline-axis-label";

        label.style.width =
            this.config.labelWidth + "px";

        axis.appendChild(
            label
        );

        const track =
            document.createElement("div");

        track.className =
            "timeline-axis-track";

        track.style.position =
            "relative";

        track.style.minWidth =
            this.getTotalWidth() + "px";

        // Построение шкалы в зависимости от текущего масштаба
        this.buildScale(track);

        axis.appendChild(
            track
        );

        this.dom.body.appendChild(
            axis
        );

    },

    /**
     * Универсальный метод построения шкалы.
     * В зависимости от currentScale вызывает соответствующий форматтер.
     */
    buildScale(track) {

        const scaleConfigs = {
            month: {
                stepFn: this.shiftMonth.bind(this),
                formatFn: this.formatMonthCell.bind(this),
                width: this.config.monthWidth,
                compare: this.compareMonths.bind(this),
                getSteps: this.monthDistance.bind(this)
            },
            quarter: {
                stepFn: this.shiftQuarter.bind(this),
                formatFn: this.formatQuarterCell.bind(this),
                width: this.config.quarterWidth,
                compare: this.comparePeriods.bind(this),
                getSteps: this.quarterDistance.bind(this)
            },
            year: {
                stepFn: this.shiftYear.bind(this),
                formatFn: this.formatYearCell.bind(this),
                width: this.config.yearWidth,
                compare: this.compareYears.bind(this),
                getSteps: this.yearDistance.bind(this)
            }
        };

        const cfg = scaleConfigs[this.currentScale];
        if (!cfg) return;

        let cursor = this.clonePeriod(this.visibleFrom);
        // Для года не нужны quarter/month, но clonePeriod вернёт объект с year, quarter, month
        // Мы будем использовать только year для года, остальное не важно.
        let index = 0;

        // Функция сравнения должна корректно работать для выбранного масштаба
        const maxValue = (this.currentScale === 'year') ? this.visibleTo.year : this.visibleTo;

        while (cfg.compare(cursor, maxValue) <= 0) {

            const cell =
                document.createElement("div");

            cell.className =
                `timeline-${this.currentScale}`; // добавляет класс 'timeline-month', 'timeline-quarter', 'timeline-year'

            cell.style.position =
                "absolute";

            cell.style.left =
                (
                    index *
                    cfg.width
                ) + "px";

            cell.style.width =
                cfg.width +
                "px";

            cell.textContent =
                cfg.formatFn(cursor);

            track.appendChild(
                cell
            );

            cursor =
                cfg.stepFn(
                    cursor,
                    1
                );

            index++;

        }

    },

    /* Форматтеры для ячеек шкалы */
    formatMonthCell(period) {
        const formatter =
            new Intl.DateTimeFormat(
                "ru-RU",
                {
                    month: "short"
                }
            );
        const date = new Date(
            period.year,
            period.month - 1,
            1
        );
        return `${formatter.format(date)} ${period.year}`;
    },

    formatQuarterCell(period) {
        return `${period.year} Q${period.quarter}`;
    },

    formatYearCell(period) {
        return String(period.year);
    },

    /* Функции сдвига для каждого масштаба */
    shiftYear(period, amount) {
        return {
            year: period.year + amount,
            quarter: 1,
            month: 1
        };
    },

    compareYears(a, b) {
        return a.year - b.year;
    },

    yearDistance(a, b) {
        return b.year - a.year;
    },

    /* ==================================================================
       PROJECT ROWS
    ================================================================== */

    buildProjectRows() {

        if (!this.dom.body) return;

        const container =
            document.createElement("div");

        container.className =
            "timeline-projects";

        this.visibleProjects.forEach(
            project => {

                container.appendChild(
                    this.buildProjectRow(
                        project
                    )
                );

            }
        );

        this.dom.body.appendChild(
            container
        );

    },

    buildProjectRow(project) {

        const row =
            document.createElement("div");

        row.className =
            "timeline-row";

        row.dataset.id =
            project.id || "";

        const label =
            document.createElement("div");

        label.className =
            "timeline-label";

        label.style.width =
            this.config.labelWidth +
            "px";

        label.textContent =
            project.shortName ||
            project.name ||
            "Без названия";

        label.title =
            project.name || "";

        const area =
            document.createElement("div");

        area.className =
            "timeline-row-area";

        area.style.position =
            "relative";

        area.style.minWidth =
            this.getTotalWidth() +
            "px";

        this.addGrid(
            area
        );

        area.appendChild(
            this.buildProjectBar(
                project
            )
        );

        row.appendChild(
            label
        );

        row.appendChild(
            area
        );

        return row;

    },

    /* ==================================================================
       GRID
    ================================================================== */

    addGrid(area) {

        const count =
            this.getPeriodCount();

        const width =
            this.getCellWidth();

        for (
            let i = 0;
            i <= count;
            i++
        ) {

            const line =
                document.createElement("span");

            line.className =
                "timeline-grid-line";

            line.style.position =
                "absolute";

            line.style.left =
                (
                    i * width
                ) + "px";

            line.style.top =
                "0";

            line.style.bottom =
                "0";

            area.appendChild(
                line
            );

        }

    },

    /* ==================================================================
       PROJECT BAR
    ================================================================== */

    buildProjectBar(project) {

        const bar =
            document.createElement("div");

        bar.className =
            "timeline-bar";

        bar.dataset.id =
            project.id || "";

        const start =
            this.parsePeriod(
                project.timeline?.start
            );

        const finish =
            this.parsePeriod(
                project.timeline?.finish
            );

        if (
            !start ||
            !finish
        ) {

            bar.classList.add(
                "no-date"
            );

            bar.style.left =
                "0px";

            bar.style.width =
                this.getCellWidth() +
                "px";

        } else {

            bar.style.left =
                this.calculateOffset(
                    start
                ) + "px";

            bar.style.width =
                Math.max(
                    this.calculateDuration(
                        start,
                        finish
                    ),
                    this.getCellWidth()
                ) + "px";

        }

        const status =
            this.getStatusCode(
                project
            );

        bar.classList.add(
            status
        );

        bar.textContent =
            project.code ||
            project.shortName ||
            project.name ||
            "Проект";

        bar.title =
            `${project.name || "Проект"} — ${
                this.statuses[status] || ""
            }`;

        bar.addEventListener(
            "click",
            event => {

                event.stopPropagation();

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

            }
        );

        bar.addEventListener(
            "mouseenter",
            () => {

                if (
                    STM.SVG &&
                    typeof STM.SVG.highlight ===
                    "function"
                ) {

                    STM.SVG.highlight(
                        project.id
                    );

                }

            }
        );

        bar.addEventListener(
            "mouseleave",
            () => {

                if (
                    STM.SVG &&
                    typeof STM.SVG.redraw ===
                    "function"
                ) {

                    STM.SVG.redraw();

                }

            }
        );

        return bar;

    },

    /* ==================================================================
       STATUS
    ================================================================== */

    getStatusCode(project) {

        const code =
            project?.status?.code ||
            (
                typeof project?.status ===
                "string"
                    ? project.status
                    : ""
            );

        if (
            Object.prototype.hasOwnProperty.call(
                this.statuses,
                code
            )
        ) {

            return code;

        }

        /* Не создаём новые статусы. Неизвестное значение считаем active. */

        return "active";

    },

    /* ==================================================================
       CURRENT PERIOD MARKER
    ================================================================== */

    buildTodayMarker() {

        if (
            !this.dom.body ||
            !this.visibleFrom ||
            !this.visibleTo
        ) {

            return;

        }

        const today =
            new Date();

        const period = {

            year:
                today.getFullYear(),

            quarter:
                Math.ceil(
                    (today.getMonth() + 1) / 3
                ),

            month:
                today.getMonth() + 1

        };

        if (
            !this.isPeriodVisible(period)
        ) {

            return;

        }

        const marker =
            document.createElement("div");

        marker.className =
            "timeline-today";

        marker.style.position =
            "absolute";

        marker.style.left =
            (
                this.config.labelWidth +
                this.calculateOffset(
                    period
                )
            ) + "px";

        marker.style.top =
            "0";

        marker.style.bottom =
            "0";

        marker.title =
            `Текущий период: ${period.year} Q${period.quarter}`;

        this.dom.body.appendChild(
            marker
        );

    },

    /**
     * Проверяет, входит ли период в видимый диапазон.
     */
    isPeriodVisible(period) {

        if (!period || !this.visibleFrom || !this.visibleTo) return false;

        return (
            this.comparePeriods(period, this.visibleFrom) >= 0 &&
            this.comparePeriods(period, this.visibleTo) <= 0
        );

    },

    /* ==================================================================
       LEGEND
    ================================================================== */

    buildLegend() {

        if (!this.dom.controls) return;

        const title =
            document.createElement("span");

        title.className =
            "timeline-legend-title";

        title.textContent =
            "Статус:";

        this.dom.controls.appendChild(
            title
        );

        Object.entries(
            this.statuses
        ).forEach(
            ([code, titleText]) => {

                const item =
                    document.createElement(
                        "span"
                    );

                item.className =
                    "timeline-legend-item";

                const marker =
                    document.createElement(
                        "span"
                    );

                marker.className =
                    `timeline-color ${code}`;

                item.appendChild(
                    marker
                );

                item.appendChild(
                    document.createTextNode(
                        titleText
                    )
                );

                this.dom.controls.appendChild(
                    item
                );

            }
        );

    },

    /* ==================================================================
       SCALE HELPERS (унифицированные методы)
    ================================================================== */

    getCellWidth() {

        if (
            this.currentScale ===
            "month"
        ) {

            return this.config.monthWidth;

        }

        if (
            this.currentScale ===
            "year"
        ) {

            return this.config.yearWidth;

        }

        return this.config.quarterWidth;

    },

    getPeriodCount() {

        if (
            !this.visibleFrom ||
            !this.visibleTo
        ) {

            return 0;

        }

        // Используем общий метод для получения количества шагов в текущем масштабе
        return this.getStepsCount(this.visibleFrom, this.visibleTo);

    },

    /**
     * Возвращает количество шагов (месяцев, кварталов или лет) между двумя периодами
     * в зависимости от текущего масштаба.
     */
    getStepsCount(from, to) {

        const scale = this.currentScale;

        if (scale === "month") {
            return this.monthDistance(from, to) + 1;
        } else if (scale === "year") {
            return this.yearDistance(from, to) + 1;
        } else { // quarter
            return this.quarterDistance(from, to) + 1;
        }

    },

    getTotalWidth() {

        return (
            this.getPeriodCount() *
            this.getCellWidth()
        );

    },

    setScale(scale) {

        if (
            ![
                "month",
                "quarter",
                "year"
            ].includes(scale)
        ) {

            return;

        }

        this.currentScale =
            scale;

        this.refresh();

    },

    zoomIn() {

        if (
            this.currentScale ===
            "year"
        ) {

            this.setScale(
                "quarter"
            );

        } else if (
            this.currentScale ===
            "quarter"
        ) {

            this.setScale(
                "month"
            );

        }

    },

    zoomOut() {

        if (
            this.currentScale ===
            "month"
        ) {

            this.setScale(
                "quarter"
            );

        } else if (
            this.currentScale ===
            "quarter"
        ) {

            this.setScale(
                "year"
            );

        }

    },

    /* ==================================================================
       POSITION / DURATION (унифицированные расчёты)
    ================================================================== */

    calculateOffset(period) {

        if (
            !period ||
            !this.visibleFrom
        ) {

            return 0;

        }

        const steps = this.getStepsCount(this.visibleFrom, period) - 1; // -1 потому что distance возвращает разницу шагов, а нам нужно количество ячеек до периода
        // Однако getStepsCount возвращает количество шагов от from до to включительно (distance + 1).
        // Чтобы получить смещение, нужно использовать чистую разницу без +1.
        // Для этого используем соответствующий distance напрямую.

        return this.getRawDistance(this.visibleFrom, period) * this.getCellWidth();

    },

    /**
     * Возвращает "сырое" расстояние между периодами (без +1) в единицах текущего масштаба.
     */
    getRawDistance(from, to) {

        const scale = this.currentScale;

        if (scale === "month") {
            return this.monthDistance(from, to);
        } else if (scale === "year") {
            return this.yearDistance(from, to);
        } else {
            return this.quarterDistance(from, to);
        }

    },

    calculateDuration(
        start,
        finish
    ) {

        if (
            !start ||
            !finish
        ) {

            return this.getCellWidth();

        }

        const steps =
            this.getRawDistance(start, finish) + 1; // длительность = количество шагов между start и finish + 1

        return Math.max(
            steps * this.getCellWidth(),
            this.getCellWidth()
        );

    },

    /* ==================================================================
       PERIOD PARSING (без изменений)
    ================================================================== */

    parsePeriod(value) {

        if (
            !value ||
            typeof value !==
            "string"
        ) {

            return null;

        }

        const match =
            value.match(
                /^(\d{4})-Q([1-4])$/i
            );

        if (match) {

            const year =
                Number(match[1]);

            const quarter =
                Number(match[2]);

            return {

                year,

                quarter,

                month:
                    (quarter - 1) * 3 + 1

            };

        }

        const monthMatch =
            value.match(
                /^(\d{4})-(\d{2})$/
            );

        if (monthMatch) {

            const year =
                Number(monthMatch[1]);

            const month =
                Number(monthMatch[2]);

            if (
                month >= 1 &&
                month <= 12
            ) {

                return {

                    year,

                    month,

                    quarter:
                        Math.ceil(
                            month / 3
                        )

                };

            }

        }

        return null;

    },

    formatPeriod(period) {

        if (!period) return "";

        return `${period.year}-Q${period.quarter}`;

    },

    clonePeriod(period) {

        return {

            year:
                period.year,

            quarter:
                period.quarter,

            month:
                period.month

        };

    },

    comparePeriods(a, b) {

        if (
            a.year !==
            b.year
        ) {

            return (
                a.year -
                b.year
            );

        }

        return (
            a.quarter -
            b.quarter
        );

    },

    compareMonths(a, b) {

        const left =
            a.year * 12 +
            (a.month - 1);

        const right =
            b.year * 12 +
            (b.month - 1);

        return (
            left -
            right
        );

    },

    quarterDistance(a, b) {

        return (
            (b.year - a.year) * 4 +
            (b.quarter - a.quarter)
        );

    },

    monthDistance(a, b) {

        return (
            (b.year - a.year) * 12 +
            (b.month - a.month)
        );

    },

    shiftQuarter(
        period,
        amount
    ) {

        const index =
            period.year * 4 +
            (period.quarter - 1) +
            amount;

        const year =
            Math.floor(
                index / 4
            );

        const quarter =
            (index % 4) + 1;

        return {

            year,

            quarter,

            month:
                (quarter - 1) * 3 + 1

        };

    },

    shiftMonth(
        period,
        amount
    ) {

        const index =
            period.year * 12 +
            (period.month - 1) +
            amount;

        const year =
            Math.floor(
                index / 12
            );

        const month =
            (index % 12) + 1;

        return {

            year,

            month,

            quarter:
                Math.ceil(
                    month / 3
                )

        };

    },

    /* ==================================================================
       PROJECTS / FILTERS
    ================================================================== */

    setProjects(projects = []) {

        this.visibleProjects =
            this.normalizeArray(
                projects
            );

        this.refresh();

    },

    getProjects() {

        return [
            ...this.visibleProjects
        ];

    },

    normalizeArray(value) {

        if (
            Array.isArray(value)
        ) {

            return value;

        }

        if (
            Array.isArray(
                value?.data
            )
        ) {

            return value.data;

        }

        return [];

    },

    synchronize() {

        if (
            STM.Renderer &&
            Array.isArray(
                STM.Renderer.filteredProjects
            )
        ) {

            this.visibleProjects =
                [
                    ...STM.Renderer
                        .filteredProjects
                ];

        } else {

            this.visibleProjects =
                [
                    ...this.projects
                ];

        }

        this.refresh();

    },

    /* ==================================================================
       PROJECT INTERACTION
    ================================================================== */

    highlightProject(
        projectId
    ) {

        document
            .querySelectorAll(
                ".timeline-row"
            )
            .forEach(
                row => {

                    row.classList.toggle(

                        "selected",

                        row.dataset.id ===
                        projectId

                    );

                }
            );

    },

    scrollToProject(
        projectId
    ) {

        const row =
            document.querySelector(
                `.timeline-row[data-id="${projectId}"]`
            );

        if (!row) return;

        row.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });

    },

    /* ==================================================================
       RESIZE
    ================================================================== */

    resize() {

        this.refresh();

    },

    /* ==================================================================
       DEBUG
    ================================================================== */

    debug() {

        console.group(
            "STM Timeline Build 004.04 (Refactored)"
        );

        console.log(
            "Scale:",
            this.currentScale
        );

        console.log(
            "Visible from:",
            this.visibleFrom
        );

        console.log(
            "Visible to:",
            this.visibleTo
        );

        console.log(
            "Projects:",
            this.visibleProjects.length
        );

        console.log(
            "Status vocabulary:",
            this.statuses
        );

        console.groupEnd();

    }

};
