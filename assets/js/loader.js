/******************************************************************************
 * Service Transformation Map (STM)
 * Loader
 *
 * Build 003.1
 ******************************************************************************/

'use strict';

window.STM = window.STM || {};

STM.Loader = {

    /* =======================================================================
       Data Storage
    ======================================================================= */

    data: {

        program: {},

        focuses: [],

        projects: [],

        links: [],

        workspace: {},

        dictionaries: {},

        metrics: [],

        risks: [],

        history: []

    },

    /* =======================================================================
       Sources
    ======================================================================= */

    sources: {

        program: "data/program.json",

        focuses: "data/focuses.json",

        projects: "data/projects.json",

        links: "data/links.json",

        workspace: "data/workspace.json",

        dictionaries: "data/dictionaries.json",

        metrics: "data/metrics.json",

        risks: "data/risks.json",

        history: "data/history.json"

    },

    /* =======================================================================
       Initialize
    ======================================================================= */

    async initialize() {

        return await this.loadAll();

    },

    /* =======================================================================
       Load all files
    ======================================================================= */

    async loadAll() {

        console.group("STM Loader");

        const entries = Object.entries(this.sources);

        await Promise.all(

            entries.map(async ([key, url]) => {

                this.data[key] = await this.load(url);

            })

        );

        console.groupEnd();

        return this.data;

    },

    /* =======================================================================
       Load single file
    ======================================================================= */

    async load(url) {

        try {

            const response = await fetch(url);

            if (!response.ok) {

                throw new Error(`${url} : ${response.status}`);

            }

            const json = await response.json();

            console.log("Loaded", url);

            /*
             * Все JSON Build 003 имеют структуру
             *
             * {
             *    meta:{},
             *    data: ...
             * }
             *
             * Возвращаем только data.
             */

            if (

                json &&

                typeof json === "object" &&

                json.hasOwnProperty("data")

            ) {

                return json.data;

            }

            return json;

        }

        catch (error) {

            console.error(error);

            return null;

        }

    },

    /* =======================================================================
       Generic Getter
    ======================================================================= */

    get(name) {

        return this.data[name];

    },

    /* =======================================================================
       Program
    ======================================================================= */

    getProgram() {

        return this.data.program || {};

    },

    /* =======================================================================
       Focuses
    ======================================================================= */

    getFocuses() {

        return this.data.focuses || [];

    },

    /* =======================================================================
       Projects
    ======================================================================= */

    getProjects() {

        return this.data.projects || [];

    },

    /* =======================================================================
       Links
    ======================================================================= */

    getLinks() {

        return this.data.links || [];

    },

    /* =======================================================================
       Workspace
    ======================================================================= */

    getWorkspace() {

        return this.data.workspace || {};

    },

    /* =======================================================================
       Dictionaries
    ======================================================================= */

    getDictionary() {

        return this.data.dictionaries || {};

    },

    getDictionaries() {

        return this.data.dictionaries || {};

    },

    /* =======================================================================
       Metrics
    ======================================================================= */

    getMetrics() {

        return this.data.metrics || [];

    },

    /* =======================================================================
       Risks
    ======================================================================= */

    getRisks() {

        return this.data.risks || [];

    },

    /* =======================================================================
       History
    ======================================================================= */

    getHistory() {

        return this.data.history || [];

    }

};
