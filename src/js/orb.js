/**
 * Root namespace.
 * @namespace orb
 */

/**
 * Utility functions namespace.
 * @namespace utils
 * @memberOf orb
 */

/**
 * Reactjs components namespace.
 * @namespace react
 * @memberOf orb
 */

/**
 * UI namespace.
 * @namespace ui
 * @memberOf orb
 */

/* global module, require */
/*jshint eqnull: true*/

"use strict";

module.exports = {
    utils: require('./orb.utils'),
    pgrid: require('./orb.pgrid'),
    pgridwidget: require('./orb.ui.pgridwidget'),
    query: require('./orb.query'),
    "export": require('./orb.export.excel')
};