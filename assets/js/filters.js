/******************************************************************************
 * Service Transformation Map (STM)
 * Build 003.1
 *
 * filters.js
 *
 * Part 1
 *  - Namespace
 *  - DOM Cache
 *  - State
 *  - Initialization
 ******************************************************************************/

'use strict';

window.STM = window.STM || {};

STM.Filters = {

    /* =======================================================================
       DOM
    ======================================================================= */

    dom: {},

    /* =======================================================================
       State
    ======================================================================= */

    initialized: false,

    filteredProjects: [],

    state: {

        search: "",

        focus: "",

        status: "",

        owner: "",

        risk: "",

        period: ""

    },

    /* =======================================================================
       Configuration
    ======================================================================= */

    config: {

        debounce: 250,

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

                document.getElementById("filter-reset"),

            counter:

                document.getElementById("filter-counter")

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

                    if (this.config.autoApply) {

                        this.apply();

                    }

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
                    event.target.value;

                if (this.config.autoApply) {

                    this.apply();

                }

            }

        );

    },

    /* =======================================================================
       State
    ======================================================================= */

    getState() {

        return {

            ...this.state

        };

    },

    set(name, value) {

        if (!(name in this.state)) {

            return;

        }

        this.state[name] = value;

        if (this.config.autoApply) {

            this.apply();

        }

    },

    get(name) {

        return this.state[name];

    },
        /* =======================================================================
       Populate All Filters
    ======================================================================= */

    populate() {

        this.populateFocuses();

        this.populateStatuses();

        this.populateOwners();

        this.populateRisks();

        this.populatePeriods();

    },

    /* =======================================================================
       Focuses
    ======================================================================= */

    populateFocuses() {

        if (!this.dom.focus) return;

        this.dom.focus.innerHTML = "";

        this.addOption(

            this.dom.focus,

            "",

            "Все фокусы"

        );

        (STM.Loader.getFocuses() || []).forEach(focus => {

            this.addOption(

                this.dom.focus,

                focus.id,

                focus.shortName || focus.name

            );

        });

    },

    /* =======================================================================
       Statuses
    ======================================================================= */

    populateStatuses() {

        if (!this.dom.status) return;

        this.dom.status.innerHTML = "";

        this.addOption(

            this.dom.status,

            "",

            "Все статусы"

        );

        const statuses = [

            ...new Map(

                (STM.Loader.getProjects() || []).map(project => [

                    project.status?.code,

                    project.status

                ])

            ).values()

        ];

        statuses.forEach(status => {

            if (!status) return;

            this.addOption(

                this.dom.status,

                status.code,

                status.title

            );

        });

    },

    /* =======================================================================
       Owners
    ======================================================================= */

    populateOwners() {

        if (!this.dom.owner) return;

        this.dom.owner.innerHTML = "";

        this.addOption(

            this.dom.owner,

            "",

            "Все владельцы"

        );

        const owners = [

            ...new Set(

                (STM.Loader.getProjects() || [])

                    .map(project => project.owner?.name)

                    .filter(Boolean)

            )

        ];

        owners.sort();

        owners.forEach(owner => {

            this.addOption(

                this.dom.owner,

                owner,

                owner

            );

        });

    },

    /* =======================================================================
       Risks
    ======================================================================= */

    populateRisks() {

        if (!this.dom.risk) return;

        this.dom.risk.innerHTML = "";

        this.addOption(

            this.dom.risk,

            "",

            "Все риски"

        );

        (STM.Loader.getRisks() || []).forEach(risk => {

            this.addOption(

                this.dom.risk,

                risk.id,

                risk.title || risk.name

            );

        });

    },

    /* =======================================================================
       Timeline Periods
    ======================================================================= */

    populatePeriods() {

        if (!this.dom.period) return;

        this.dom.period.innerHTML = "";

        this.addOption(

            this.dom.period,

            "",

            "Все периоды"

        );

        const periods = [

            ...new Set(

                (STM.Loader.getProjects() || [])

                    .flatMap(project => [

                        project.timeline?.start,

                        project.timeline?.finish

                    ])

                    .filter(Boolean)

            )

        ];

        periods.sort();

        periods.forEach(period => {

            this.addOption(

                this.dom.period,

                period,

                period

            );

        });

    },

    /* =======================================================================
       Helper
    ======================================================================= */

    addOption(select, value, text) {

        const option = document.createElement("option");

        option.value = value;

        option.textContent = text;

        select.appendChild(option);

    },
        /* =======================================================================
       Apply Filters
    ======================================================================= */

    apply() {

        const projects = STM.Loader.getProjects() || [];

        this.filteredProjects = projects.filter(project =>
            this.matchesSearch(project) &&
            this.matchesFocus(project) &&
            this.matchesStatus(project) &&
            this.matchesOwner(project) &&
            this.matchesRisk(project) &&
            this.matchesPeriod(project)
        );

        if (STM.Renderer) {

            STM.Renderer.setFilteredProjects(
                this.filteredProjects
            );

        }

        this.updateCounter();

        console.info(
            `Filters applied: ${this.filteredProjects.length} of ${projects.length}`
        );

    },

    /* =======================================================================
       Search
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

            (project.shortName || "")
                .toLowerCase()
                .includes(text)

            ||

            (project.code || "")
                .toLowerCase()
                .includes(text)

            ||

            (project.description || "")
                .toLowerCase()
                .includes(text)

        );

    },

    /* =======================================================================
       Focus
    ======================================================================= */

    matchesFocus(project) {

        if (!this.state.focus) {

            return true;

        }

        return project.focusId === this.state.focus;

    },

    /* =======================================================================
       Status
    ======================================================================= */

    matchesStatus(project) {

        if (!this.state.status) {

            return true;

        }

        return project.status?.code === this.state.status;

    },

    /* =======================================================================
       Owner
    ======================================================================= */

    matchesOwner(project) {

        if (!this.state.owner) {

            return true;

        }

        return project.owner?.name === this.state.owner;

    },

    /* =======================================================================
       Risk
    ======================================================================= */

    matchesRisk(project) {

        if (!this.state.risk) {

            return true;

        }

        if (!project.risks) {

            return false;

        }

        return project.risks.includes(
            this.state.risk
        );

    },

    /* =======================================================================
       Timeline
    ======================================================================= */

    matchesPeriod(project) {

        if (!this.state.period) {

            return true;

        }

        return (

            project.timeline?.start === this.state.period ||

            project.timeline?.finish === this.state.period

        );

    },
        /* =======================================================================
       Reset Filters
    ======================================================================= */

    reset() {

        this.state = {

            search: "",

            focus: "",

            status: "",

            owner: "",

            risk: "",

            period: ""

        };

        if (this.dom.search) {

            this.dom.search.value = "";

        }

        if (this.dom.focus) {

            this.dom.focus.value = "";

        }

        if (this.dom.status) {

            this.dom.status.value = "";

        }

        if (this.dom.owner) {

            this.dom.owner.value = "";

        }

        if (this.dom.risk) {

            this.dom.risk.value = "";

        }

        if (this.dom.period) {

            this.dom.period.value = "";

        }

        this.apply();

        this.saveState();

    },

    /* =======================================================================
       Counter
    ======================================================================= */

    updateCounter() {

        if (!this.dom.counter) {

            return;

        }

        const total = STM.Loader.getProjects()?.length || 0;

        this.dom.counter.textContent =
            `${this.filteredProjects.length} / ${total}`;

    },

    /* =======================================================================
       Save State
    ======================================================================= */

    saveState() {

        try {

            localStorage.setItem(

                "stm-filters",

                JSON.stringify(this.state)

            );

        }

        catch (error) {

            console.warn(

                "Cannot save filters.",

                error

            );

        }

    },

    /* =======================================================================
       Restore State
    ======================================================================= */

    restoreState() {

        try {

            const state = JSON.parse(

                localStorage.getItem(

                    "stm-filters"

                )

            );

            if (!state) {

                return;

            }

            Object.assign(

                this.state,

                state

            );

            if (this.dom.search) {

                this.dom.search.value =
                    this.state.search;

            }

            if (this.dom.focus) {

                this.dom.focus.value =
                    this.state.focus;

            }

            if (this.dom.status) {

                this.dom.status.value =
                    this.state.status;

            }

            if (this.dom.owner) {

                this.dom.owner.value =
                    this.state.owner;

            }

            if (this.dom.risk) {

                this.dom.risk.value =
                    this.state.risk;

            }

            if (this.dom.period) {

                this.dom.period.value =
                    this.state.period;

            }

        }

        catch (error) {

            console.warn(

                "Cannot restore filters.",

                error

            );

        }

    },

    /* =======================================================================
       Export State
    ======================================================================= */

    exportState() {

        return {

            ...this.state

        };

    },

    /* =======================================================================
       Import State
    ======================================================================= */

    importState(state = {}) {

        Object.assign(

            this.state,

            state

        );

        this.restoreState();

        this.apply();

    },
        /* =======================================================================
       Statistics
    ======================================================================= */

    statistics() {

        const total =
            STM.Loader.getProjects()?.length || 0;

        return {

            totalProjects: total,

            filteredProjects:
                this.filteredProjects.length,

            activeFilters:

                Object.values(this.state)
                    .filter(value => value !== "")
                    .length,

            state: {

                ...this.state

            }

        };

    },

    /* =======================================================================
       Has Active Filters
    ======================================================================= */

    hasActiveFilters() {

        return Object.values(this.state)

            .some(value => value !== "");

    },

    /* =======================================================================
       Get Filtered Projects
    ======================================================================= */

    getFilteredProjects() {

        return this.filteredProjects;

    },

    /* =======================================================================
       Refresh
    ======================================================================= */

    refresh() {

        this.populate();

        this.restoreState();

        this.apply();

    },

    /* =======================================================================
       Destroy
    ======================================================================= */

    destroy() {

        this.filteredProjects = [];

        this.state = {

            search: "",

            focus: "",

            status: "",

            owner: "",

            risk: "",

            period: ""

        };

        this.initialized = false;

    }

};
