/******************************************************************************
 * Service Transformation Map (STM)
 * Build 002.0
 *
 * svg.js
 ******************************************************************************/

'use strict';

STM.SVG = {

    svg: null,

    initialize() {

        this.svg = document.getElementById("connection-layer");

        if (!this.svg) {
            console.error("SVG layer not found.");
        }

        this.createArrowMarker();

    },

    render(links = []) {

        if (!this.svg) {

            this.initialize();

        }

        this.clear();

        links.forEach(link => {

            this.drawConnection(link);

        });

    },

    clear() {

        if (!this.svg) return;

        this.svg.innerHTML = "";

        this.createArrowMarker();

    },

    drawConnection(link) {

        const from = document.querySelector(
            `.project-card[data-id="${link.from}"]`
        );

        const to = document.querySelector(
            `.project-card[data-id="${link.to}"]`
        );

        if (!from || !to) return;

        const p1 = this.getCardCenter(from);

        const p2 = this.getCardCenter(to);

        const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );

        line.setAttribute("x1", p1.x);

        line.setAttribute("y1", p1.y);

        line.setAttribute("x2", p2.x);

        line.setAttribute("y2", p2.y);

        line.setAttribute("stroke", "#8aa4c5");

        line.setAttribute("stroke-width", "2");

        line.setAttribute("marker-end", "url(#arrow)");

        line.dataset.type = link.type || "depends";

        this.svg.appendChild(line);

    },

    getCardCenter(card) {

        const map = document
            .getElementById("map-container")
            .getBoundingClientRect();

        const rect = card.getBoundingClientRect();

        return {

            x: rect.left - map.left + rect.width / 2,

            y: rect.top - map.top + rect.height / 2

        };

    },

    createArrowMarker() {

        const defs = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "defs"
        );

        const marker = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "marker"
        );

        marker.setAttribute("id", "arrow");

        marker.setAttribute("markerWidth", "10");

        marker.setAttribute("markerHeight", "10");

        marker.setAttribute("refX", "9");

        marker.setAttribute("refY", "3");

        marker.setAttribute("orient", "auto");

        const path = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );

        path.setAttribute("d", "M0,0 L10,3 L0,6 Z");

        path.setAttribute("fill", "#8aa4c5");

        marker.appendChild(path);

        defs.appendChild(marker);

        this.svg.appendChild(defs);

    },

    redraw() {

        if (!STM.Loader) return;

        this.render(

            STM.Loader.getLinks()

        );

    },

    highlight(projectId) {

        this.svg
            .querySelectorAll("line")
            .forEach(line => {

                if (

                    line.dataset.from === projectId ||

                    line.dataset.to === projectId

                ) {

                    line.setAttribute("stroke", "#0057B8");

                    line.setAttribute("stroke-width", "3");

                }

            });

    }

};
