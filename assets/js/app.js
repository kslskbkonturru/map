/******************************************************************************
 * Service Transformation Map (STM)
 * Build 004.01
 *
 * app.js
 *
 * Application Bootstrap
 ******************************************************************************/

'use strict';

window.STM = window.STM || {};

STM.App = {

    version: "0.4.0",

    build: "004.01",

    initialized: false,

    started: false,

    loading: false,

    modules: [

        "Loader",
        "Renderer",
        "Layout",
        "SVG",
        "Timeline",
        "Filters",
        "Modal"

    ],

    /* =======================================================================
       Initialize
    ======================================================================= */

    async initialize() {

        if (this.initialized) {
            return;
        }

        console.group(

            `STM ${this.version} Build ${this.build}`

        );

        try {

            this.loading = true;

            await this.initializeLoader();

            this.initializeModules();

            await this.firstRender();

            this.initialized = true;
            this.started = true;
            this.loading = false;

            console.info("STM successfully started.");

        }

        catch (error) {

            this.loading = false;

            console.error(error);

        }

        console.groupEnd();

    },

    /* =======================================================================
       Loader
    ======================================================================= */

    async initializeLoader() {

        if (!STM.Loader) {

            throw new Error("Loader module missing.");

        }

        await STM.Loader.initialize();

    },

    /* =======================================================================
       Modules
    ======================================================================= */

    initializeModules() {

        this.modules.forEach(name => {

            const module = STM[name];

            if (!module) {

                console.warn(`${name} module missing.`);

                return;

            }

            if (typeof module.initialize === "function") {

                module.initialize();

            }

        });

    },

    /* =======================================================================
       First Render
    ======================================================================= */

    async firstRender() {

        const program =
            STM.Loader.getProgram();

        const focuses =
            STM.Loader.getFocuses();

        const projects =
            STM.Loader.getProjects();

        const links =
            STM.Loader.getLinks();

        const risks =
            STM.Loader.getRisks();

        const metrics =
            STM.Loader.getMetrics();

        const workspace =
            STM.Loader.getWorkspace();

        const dictionaries =
            STM.Loader.getDictionaries();

        const history =
            STM.Loader.getHistory();

        /* ==========================================================
           BUILD LAYOUT
        ========================================================== */

        if (
            STM.Layout &&
            typeof STM.Layout.build === "function"
        ) {

            STM.Layout.build(

                focuses,
                projects,
                workspace

            );

        }

        /* ==========================================================
           RENDER
        ========================================================== */

        if (
            STM.Renderer &&
            typeof STM.Renderer.render === "function"
        ) {

            STM.Renderer.render({

                program,
                focuses,
                projects,
                links,
                risks,
                metrics,
                workspace,
                dictionaries,
                history

            });

        }

        /* ==========================================================
           FILTERS
        ========================================================== */

        if (
            STM.Filters &&
            typeof STM.Filters.populate === "function"
        ) {

            STM.Filters.populate();

        }

        if (
            STM.Filters &&
            typeof STM.Filters.apply === "function"
        ) {

            STM.Filters.apply();

        }

    },

    /* =======================================================================
       Refresh
    ======================================================================= */

    refresh() {

        if (!this.initialized) {

            return;

        }

        this.firstRender();

    },

    /* =======================================================================
       Reload
    ======================================================================= */

    async reload() {

        await STM.Loader.initialize();

        this.refresh();

    },

    /* =======================================================================
       Statistics
    ======================================================================= */

    statistics() {

        return {

            version: this.version,

            build: this.build,

            initialized: this.initialized,

            loading: this.loading,

            modules: this.modules,

            projects:

                STM.Loader.getProjects()?.data?.length || 0,

            focuses:

                STM.Loader.getFocuses()?.data?.length || 0,

            links:

                STM.Loader.getLinks()?.data?.length || 0

        };

    },

    /* =======================================================================
       Debug
    ======================================================================= */

    debug() {

        console.table(

            this.statistics()

        );

    }

};

/* ==========================================================================
   Bootstrap
========================================================================== */

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        await STM.App.initialize();

    }

);
