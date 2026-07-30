/******************************************************************************
 * Service Transformation Map (STM)
 * Alpha 0.2 / Build 002.0
 *
 * filters.js
 *
 * Part 1
 *  - Filter Controller
 *  - Initialization
 *  - DOM Cache
 *  - State
 ******************************************************************************/

'use strict';

STM.Filters = {

    /* =======================================================================
       DOM Cache
    ======================================================================= */

    dom: {},

    /* =======================================================================
       State
    ======================================================================= */

    initialized: false,

    state: {

        search: "",

        focus: null,

        status: null,

        owner: null,

        risk: null,

        period: null

    },

    /* =======================================================================
       Configuration
    ======================================================================= */

    config: {

        debounce: 300,

        autoApply: true

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

        console.info("Filters initialized.");

    },

    /* =======================================================================
       Cache DOM
    ======================================================================= */

    cacheDom() {

        this.dom = {

            panel:

                document.getElementById("filters"),

            search:

                document.getElementById("filter-search"),

            focus:

                document.getElementById("filter-focus"),

            status:

                document.getElementById("filter-status"),

            owner:

                document.getElementById("filter-owner"),

            risk:

                document.getElementById("filter-risk"),

            period:

                document.getElementById("filter-period"),

            reset:

                document.getElementById("filter-reset")

        };

    },

    /* =======================================================================
       Event Binding
    ======================================================================= */

    bindEvents() {

        this.bindSearch();

        this.bindSelect(this.dom.focus, "focus");

        this.bindSelect(this.dom.status, "status");

        this.bindSelect(this.dom.owner, "owner");

        this.bindSelect(this.dom.risk, "risk");

        this.bindSelect(this.dom.period, "period");

        this.dom.reset?.addEventListener(

            "click",

            () => this.reset()

        );

    },

    /* =======================================================================
       Search
    ======================================================================= */

    bindSearch() {

        if (!this.dom.search) {

            return;

        }

        let timer = null;

        this.dom.search.addEventListener(

            "input",

            event => {

                clearTimeout(timer);

                timer = setTimeout(() => {

                    this.state.search =

                        event.target.value.trim();

                    this.apply();

                },

                this.config.debounce);

            }

        );

    },

    /* =======================================================================
       Select Binding
    ======================================================================= */

    bindSelect(control, property) {

        if (!control) {

            return;

        }

        control.addEventListener(

            "change",

            event => {

                this.state[property] =

                    event.target.value || null;

                if (this.config.autoApply) {

                    this.apply();

                }

            }

        );

    },

    /* =======================================================================
       Set Filter
    ======================================================================= */

    set(name, value) {

        if (!(name in this.state)) {

            return;

        }

        this.state[name] = value;

        if (this.config.autoApply) {

            this.apply();

        }

    },

    /* =======================================================================
       Get Filter
    ======================================================================= */

    get(name) {

        return this.state[name];

    },

    /* =======================================================================
       Get State
    ======================================================================= */

    getState() {

        return {

            ...this.state

        };

    },

    /* =======================================================================
       Reset
    ======================================================================= */

    reset() {

        this.state = {

            search: "",

            focus: null,

            status: null,

            owner: null,

            risk: null,

            period: null

        };

        if (this.dom.search) {

            this.dom.search.value = "";

        }

        [

            this.dom.focus,

            this.dom.status,

            this.dom.owner,

            this.dom.risk,

            this.dom.period

        ].forEach(control => {

            if (control) {

                control.value = "";

            }

        });

        this.apply();

    },

    /* =======================================================================
       Apply
    ======================================================================= */

    apply() {

        console.info(

            "Applying filters:",

            this.state

        );

        // Реализация фильтрации будет добавлена в Part 2

    },
      /* =======================================================================
       Apply Filters
    ======================================================================= */

    apply() {

        const projects = STM.Loader.getProjects?.() || [];

        const filtered = projects.filter(project =>

            this.matchesSearch(project) &&
            this.matchesFocus(project) &&
            this.matchesStatus(project) &&
            this.matchesOwner(project) &&
            this.matchesRisk(project) &&
            this.matchesPeriod(project)

        );

        if (STM.Renderer) {

            STM.Renderer.renderProjects(filtered);

        }

        if (STM.Timeline) {

            STM.Timeline.renderProjects(filtered);

        }

        if (STM.SVG) {

            STM.SVG.renderFiltered(filtered);

        }

        console.info(
            `Filters applied: ${filtered.length} of ${projects.length}`
        );

    },

    /* =======================================================================
       Search Filter
    ======================================================================= */

    matchesSearch(project) {

        if (!this.state.search) {

            return true;

        }

        const text = this.state.search.toLowerCase();

        return (

            (project.name || "")
                .toLowerCase()
                .includes(text)

            ||

            (project.description || "")
                .toLowerCase()
                .includes(text)

        );

    },

    /* =======================================================================
       Focus Filter
    ======================================================================= */

    matchesFocus(project) {

        if (!this.state.focus) {

            return true;

        }

        return project.focus === this.state.focus;

    },

    /* =======================================================================
       Status Filter
    ======================================================================= */

    matchesStatus(project) {

        if (!this.state.status) {

            return true;

        }

        return project.status === this.state.status;

    },

    /* =======================================================================
       Owner Filter
    ======================================================================= */

    matchesOwner(project) {

        if (!this.state.owner) {

            return true;

        }

        return project.owner === this.state.owner;

    },

    /* =======================================================================
       Risk Filter
    ======================================================================= */

    matchesRisk(project) {

        if (!this.state.risk) {

            return true;

        }

        return (project.risk || "") === this.state.risk;

    },

    /* =======================================================================
       Period Filter
    ======================================================================= */

    matchesPeriod(project) {

        if (!this.state.period) {

            return true;

        }

        if (!project.start || !project.finish) {

            return false;

        }

        const start = new Date(project.start);
        const finish = new Date(project.finish);
        const today = new Date();

        switch (this.state.period) {

            case "active":

                return start <= today && finish >= today;

            case "future":

                return start > today;

            case "completed":

                return finish < today;

            default:

                return true;

        }

    },

    /* =======================================================================
       Get Filtered Projects
    ======================================================================= */

    getFilteredProjects() {

        const projects = STM.Loader.getProjects?.() || [];

        return projects.filter(project =>

            this.matchesSearch(project) &&
            this.matchesFocus(project) &&
            this.matchesStatus(project) &&
            this.matchesOwner(project) &&
            this.matchesRisk(project) &&
            this.matchesPeriod(project)

        );

    },

    /* =======================================================================
       Has Active Filters
    ======================================================================= */

    hasFilters() {

        return (

            this.state.search !== "" ||

            this.state.focus !== null ||

            this.state.status !== null ||

            this.state.owner !== null ||

            this.state.risk !== null ||

            this.state.period !== null

        );

    },
    /* =======================================================================
       Custom Predicate
    ======================================================================= */

    applyPredicate(predicate) {

        if (typeof predicate !== "function") {

            return;

        }

        const projects = STM.Loader.getProjects?.() || [];

        const filtered = projects.filter(predicate);

        this.updateModules(filtered);

    },

    /* =======================================================================
       Update All Modules
    ======================================================================= */

    updateModules(projects) {

        if (STM.Renderer) {

            STM.Renderer.renderProjects(projects);

        }

        if (STM.Timeline) {

            STM.Timeline.renderProjects(projects);

        }

        if (STM.SVG) {

            STM.SVG.renderFiltered(projects);

        }

        this.updateCounters(projects);

    },

    /* =======================================================================
       Update Counters
    ======================================================================= */

    updateCounters(projects) {

        const totalProjects =

            STM.Loader.getProjects?.().length || 0;

        const filteredProjects =

            projects.length;

        const counter =

            document.getElementById("filter-counter");

        if (!counter) {

            return;

        }

        counter.textContent =

            `${filteredProjects} из ${totalProjects}`;

    },

    /* =======================================================================
       Populate Filters
    ======================================================================= */

    populate() {

        this.populateFocuses();

        this.populateStatuses();

        this.populateOwners();

    },

    /* =======================================================================
       Populate Focuses
    ======================================================================= */

    populateFocuses() {

        if (!this.dom.focus) {

            return;

        }

        this.dom.focus.innerHTML =

            '<option value="">Все фокусы</option>';

        const focuses =

            STM.Loader.getFocuses?.() || [];

        focuses.forEach(focus => {

            const option =

                document.createElement("option");

            option.value = focus.id;

            option.textContent = focus.name;

            this.dom.focus.appendChild(option);

        });

    },

    /* =======================================================================
       Populate Statuses
    ======================================================================= */

    populateStatuses() {

        if (!this.dom.status) {

            return;

        }

        this.dom.status.innerHTML =

            '<option value="">Все статусы</option>';

        const statuses = [

            ["planned", "Запланирован"],

            ["active", "В работе"],

            ["paused", "Приостановлен"],

            ["completed", "Завершён"],

            ["risk", "Под риском"]

        ];

        statuses.forEach(item => {

            const option =

                document.createElement("option");

            option.value = item[0];

            option.textContent = item[1];

            this.dom.status.appendChild(option);

        });

    },

    /* =======================================================================
       Populate Owners
    ======================================================================= */

    populateOwners() {

        if (!this.dom.owner) {

            return;

        }

        this.dom.owner.innerHTML =

            '<option value="">Все владельцы</option>';

        const projects =

            STM.Loader.getProjects?.() || [];

        const owners =

            [...new Set(

                projects

                    .map(project => project.owner)

                    .filter(Boolean)

            )].sort();

        owners.forEach(owner => {

            const option =

                document.createElement("option");

            option.value = owner;

            option.textContent = owner;

            this.dom.owner.appendChild(option);

        });

    },

    /* =======================================================================
       Export State
    ======================================================================= */

    exportState() {

        return JSON.stringify(this.state);

    },

    /* =======================================================================
       Import State
    ======================================================================= */

    importState(state) {

        if (!state) {

            return;

        }

        try {

            this.state =

                typeof state === "string"

                    ? JSON.parse(state)

                    : state;

            this.syncControls();

            this.apply();

        }

        catch (error) {

            console.error(

                "Unable to import filter state.",

                error

            );

        }

    },

    /* =======================================================================
       Synchronize Controls
    ======================================================================= */

    syncControls() {

        if (this.dom.search) {

            this.dom.search.value =

                this.state.search || "";

        }

        if (this.dom.focus) {

            this.dom.focus.value =

                this.state.focus || "";

        }

        if (this.dom.status) {

            this.dom.status.value =

                this.state.status || "";

        }

        if (this.dom.owner) {

            this.dom.owner.value =

                this.state.owner || "";

        }

        if (this.dom.risk) {

            this.dom.risk.value =

                this.state.risk || "";

        }

        if (this.dom.period) {

            this.dom.period.value =

                this.state.period || "";

        }

    },    /* =======================================================================
       Save State
    ======================================================================= */

    save() {

        try {

            localStorage.setItem(

                "stm.filters",

                JSON.stringify(this.state)

            );

        }

        catch (error) {

            console.warn(

                "Unable to save filter state.",

                error

            );

        }

    },

    /* =======================================================================
       Load State
    ======================================================================= */

    load() {

        try {

            const data =

                localStorage.getItem("stm.filters");

            if (!data) {

                return;

            }

            this.importState(

                JSON.parse(data)

            );

        }

        catch (error) {

            console.warn(

                "Unable to load filter state.",

                error

            );

        }

    },

    /* =======================================================================
       Toggle Auto Apply
    ======================================================================= */

    enableAutoApply() {

        this.config.autoApply = true;

    },

    disableAutoApply() {

        this.config.autoApply = false;

    },

    /* =======================================================================
       Clear One Filter
    ======================================================================= */

    clear(name) {

        if (!(name in this.state)) {

            return;

        }

        this.state[name] = null;

        if (name === "search") {

            this.state.search = "";

        }

        this.syncControls();

        this.apply();

    },

    /* =======================================================================
       Statistics
    ======================================================================= */

    statistics() {

        const projects =

            STM.Loader.getProjects?.() || [];

        const filtered =

            this.getFilteredProjects();

        return {

            total: projects.length,

            visible: filtered.length,

            hidden:

                projects.length -

                filtered.length,

            activeFilters:

                Object.values(this.state)

                    .filter(value =>

                        value !== null &&

                        value !== ""

                    ).length

        };

    },

    /* =======================================================================
       Refresh
    ======================================================================= */

    refresh() {

        this.populate();

        this.syncControls();

        this.apply();

    },

    /* =======================================================================
       Destroy
    ======================================================================= */

    destroy() {

        this.dom = {};

        this.state = {

            search: "",

            focus: null,

            status: null,

            owner: null,

            risk: null,

            period: null

        };

        this.initialized = false;

    },

    /* =======================================================================
       Debug
    ======================================================================= */

    debug() {

        console.table(this.state);

        console.info(

            this.statistics()

        );

    }

};
