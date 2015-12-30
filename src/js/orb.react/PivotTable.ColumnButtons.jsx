

/* global module, require */

"use strict";

var React = require('react'),
    ReactDOM = require('react-dom'),
    axe = require('../orb.axe'),
    PivotButton = require('./PivotButton'),
    DropTarget = require('./DropTarget');

module.exports = React.createClass({
    displayName: 'PivotTable.ColumnButtons',
  render: function() {
    var self = this;

    var config = this.props.pivotTableComp.pgridwidget.pgrid.config;

    var columnButtons = config.columnFields.map(function(field, index) {
      return <PivotButton key={field.name}
                          field={field}
                          axetype={axe.Type.COLUMNS}
                          position={index}
                          pivotTableComp={self.props.pivotTableComp}>
             </PivotButton>;
    });

    return  <DropTarget buttons={columnButtons} axetype={axe.Type.COLUMNS}>
            </DropTarget>;
  }
});