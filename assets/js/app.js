/******************************************************************************
 * Service Transformation Map (STM)
 * Alpha 0.2 / Build 002.0
 *
 * app.js
 *
 * Главный контроллер приложения
 ******************************************************************************/

'use strict';

const STM = {

    /* =======================================================================
       Application State
    ======================================================================= */

    version: '0.2.0',

    data: {

        program: null,

        focuses: [],

        projects: [],

        links: [],

        metrics: [],

        risks: [],

        history: [],

        workspace: null,

        dictionaries: null
    },

    ui: {

        currentView: 'roadmap',

        selectedProject: null,

        selectedFocus: null,

        zoom: 1,

        initialized: false
    },

    /* =======================================================================
       Startup
    ======================================================================= */

    async initialize() {

        console.log('');
        console.log('========================================');
        console.log(' Service Transformation Map');
        console.log(' Build 002.0');
        console.log('========================================');

        try {

            this.setStatus('Загрузка данных...');

            await Loader.loadAll();

            this.data = Loader.data;

            this.setStatus('Построение интерфейса...');

            Renderer.renderProgram(this.data.program);

            Renderer.renderFocuses(this.data.focuses);

            Renderer.renderProjects(this.data.projects);

            Renderer.renderLinks(this.data.links);

            Timeline.render(this.data.history);

            this.bindEvents();

            this.ui.initialized = true;

            this.setStatus('Готово');

            console.log('STM initialized');

        }

        catch (error) {

            console.error(error);

            this.setStatus('Ошибка загрузки');

        }

    },

    /* =======================================================================
       Events
    ======================================================================= */

    bindEvents() {

        window.addEventListener('resize', () => {

            Renderer.refresh();

        });

        document
            .getElementById('modal-close')
            ?.addEventListener('click', () => {

                Modal.close();

            });

        document
            .querySelectorAll('#map-toolbar button')
            .forEach(button => {

                button.addEventListener('click', () => {

                    this.changeView(button.dataset.view);

                });

            });

    },

    /* =======================================================================
       Views
    ======================================================================= */

    changeView(view) {

        this.ui.currentView = view;

        document
            .getElementById('map-container')
            ?.setAttribute('data-view', view);

        Renderer.refresh();

    },

    /* =======================================================================
       Selection
    ======================================================================= */

    openProject(projectId) {

        this.ui.selectedProject = projectId;

        Modal.open(projectId);

    },

    selectFocus(focusId) {

        this.ui.selectedFocus = focusId;

        Renderer.highlightFocus(focusId);

    },

    /* =======================================================================
       Status Bar
    ======================================================================= */

    setStatus(text) {

        const status = document.getElementById('status-text');

        if (status) {

            status.textContent = text;

        }

    }

};

/* ===========================================================================
   Application Entry Point
=========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    STM.initialize();

});
