/******************************************************************************
 * Service Transformation Map (STM)
 * Alpha 0.2 / Build 002.1
 *
 * app.js
 *
 * Application Bootstrap
 ******************************************************************************/

'use strict';

/* ==========================================================================
   Namespace
========================================================================== */

window.STM = window.STM || {};

/* ==========================================================================
   Application
========================================================================== */

STM.App = {

    version: "0.2.1",

    build: "002.1",

    initialized: false,

    started: false,

    loading: false,

    modules: [

        "Loader",

        "Renderer",

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

            console.info(

                "STM successfully started."

            );

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

            throw new Error(

                "Loader module missing."

            );

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

                console.warn(

                    `${name} module missing.`

                );

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

        const history =

            STM.Loader.getHistory();

        if (STM.Renderer) {

            STM.Renderer.render({

                program,

                focuses,

                projects,

                links

            });

        }

        if (STM.SVG) {

            STM.SVG.render(

                links,

                projects

            );

        }

        if (STM.Timeline) {

            STM.Timeline.render(

                history

            );

        }

        if (STM.Filters) {

            STM.Filters.populate();

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
       Reload Data
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

                STM.Loader.getProjects()?.length || 0,

            focuses:

                STM.Loader.getFocuses()?.length || 0,

            links:

                STM.Loader.getLinks()?.length || 0

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
