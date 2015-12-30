/* global module, require */
/*jshint eqnull: true*/

"use strict";

var React = require('react'),
    ReactDOM = require('react-dom');
var ScrollBarMixin = require('./ScrollBarMixin');

module.exports = React.createClass({
    displayName: 'VerticalScrollBar',
    mixins: [ScrollBarMixin],
    posProp: 'y',
    mousePosProp: 'pageY',
    sizeProp: 'height',
    offsetCssProp: 'top',
    cssClass: 'orb-v-scrollbar'
});