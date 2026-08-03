/******************************************************************************
 * Service Transformation Map (STM)
 * Alpha 0.2 / Build 002.0
 *
 * loader.js
 *
 * Data Layer
 ******************************************************************************/

'use strict';

window.STM = window.STM || {};

STM.Loader = {

    /* =======================================================================
       Loaded data
    ======================================================================= */

    data: {
        program: null,
        focuses: [],
        projects: [],
        links: [],
        workspace: null,
        dictionaries: null,
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
       Load everything
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
       Load one file
    ======================================================================= */

  async load(url) {

    try {

        const response = await fetch(url);

        const text = await response.text();

        try {

            const json = JSON.parse(text);

            console.log("Loaded", url);

            return json;

        } catch (e) {

            console.error("JSON ERROR IN:", url);

            console.error(text.substring(0,300));

            throw e;

        }

    } catch (error) {

        console.error(error);

        return null;

    }

},
    /* =======================================================================
       Getters
    ======================================================================= */

    get(name) {

        return this.data[name];

    },

    getProgram() {

        return this.data.program;

    },

    getProjects() {

        return this.data.projects;

    },

    getFocuses() {

        return this.data.focuses;

    },

    getLinks() {

        return this.data.links;

    },

    getMetrics() {

        return this.data.metrics;

    },

    getRisks() {

        return this.data.risks;

    },

    getHistory() {

        return this.data.history;

    },

    getWorkspace() {

        return this.data.workspace;

    },

   getDictionary() {

    return this.data.dictionaries;

},

/* =======================================================================
   Initialize
======================================================================= */

async initialize() {

    return await this.loadAll();

}

};
