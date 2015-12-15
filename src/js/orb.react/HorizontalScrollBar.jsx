/* global module, require */
/*jshint eqnull: true*/

"use strict";

var React = require('react'),
    ReactDOM = require('react-dom');
var ScrollBarMixin = require('./ScrollBarMixin');

module.exports = React.createClass({
    mixins: [ScrollBarMixin],
    posProp: 'x',
    mousePosProp: 'pageX',
    sizeProp: 'width',
    offsetCssProp: 'left',
    cssClass: 'orb-h-scrollbar'
});
