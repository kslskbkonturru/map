/******************************************************************************
 * Service Transformation Map (STM)
 * Layout Engine
 *
 * Build 004.01
 *
 * Отвечает только за вычисление координат карточек.
 * Renderer ничего не знает о способе раскладки.
 ******************************************************************************/

"use strict";

window.STM = window.STM || {};

STM.Layout = {

    initialized: false,

    focuses: [],

    projects: [],

    workspace: {},

    positions: {},

    config: {

        startX: 40,

        startY: 40,

        columnWidth: 340,

        rowHeight: 140,

        cardWidth: 260,

        cardHeight: 110

    },

    /* ============================================================= */

    initialize() {

        if (this.initialized) return;

        this.initialized = true;

        console.info("Layout initialized.");

    },

    /* ============================================================= */

    build(focuses = [], projects = [], workspace = {}) {

        if (!this.initialized) {

            this.initialize();

        }

        this.focuses = focuses;

        this.projects = projects;

        this.workspace = workspace || {};

        this.positions = {};

        this.calculate();

    },

    /* ============================================================= */

    calculate() {

        this.positions = {};

        this.focuses.forEach((focus, columnIndex) => {

            const focusProjects = this.projects.filter(

                p => p.focusId === focus.id

            );

            focusProjects.forEach((project, rowIndex) => {

                const saved = this.workspace?.projects?.[project.id];

                if (saved) {

                    this.positions[project.id] = {

                        left: saved.left,

                        top: saved.top

                    };

                    return;

                }

                this.positions[project.id] = {

                    left:

                        this.config.startX +

                        columnIndex * this.config.columnWidth,

                    top:

                        this.config.startY +

                        rowIndex * this.config.rowHeight

                };

            });

        });

    },

    /* ============================================================= */

    getPosition(projectId) {

        return this.positions[projectId] || {

            left: 0,

            top: 0

        };

    },

    /* ============================================================= */

    setPosition(projectId, left, top) {

        this.positions[projectId] = {

            left,

            top

        };

    },

    /* ============================================================= */

    exportWorkspace() {

        const workspace = {

            projects: {}

        };

        Object.keys(this.positions).forEach(id => {

            workspace.projects[id] = {

                left: this.positions[id].left,

                top: this.positions[id].top

            };

        });

        return workspace;

    },

    /* ============================================================= */

    clear() {

        this.positions = {};

    },

    /* ============================================================= */

    debug() {

        console.group("STM Layout");

        console.log("Focuses:", this.focuses.length);

        console.log("Projects:", this.projects.length);

        console.log("Positions:", this.positions);

        console.groupEnd();

    }

};
