

/* global module, require */

"use strict";

var React = require('react'),
    ReactDOM = require('react-dom'),
    axe = require('../orb.axe'),
    PivotButton = require('./PivotButton'),
    DropTarget = require('./DropTarget'),
    DropTargetVertical = require('./DropTargetVertical');

module.exports = React.createClass({
  render: function() {
    var self = this;

    var config = this.props.pivotTableComp.pgridwidget.pgrid.config;

    var rowButtons = config.rowFields.map(function(field, index) {
      return <PivotButton key={field.name}
                          field={field}
                          axetype={axe.Type.ROWS}
                          position={index}
                          pivotTableComp={self.props.pivotTableComp}>
             </PivotButton>;
    });

    if(config.chartMode.enabled) {
      return  <DropTargetVertical buttons={rowButtons} axetype={axe.Type.ROWS}>
              </DropTargetVertical>;
    } else {
      return  <DropTarget buttons={rowButtons} axetype={axe.Type.ROWS}>
              </DropTarget>;
    }
  }
});