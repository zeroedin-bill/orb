

/* global module, require */

"use strict";

var React = require('react'),
    ReactDOM = require('react-dom'),
    axe = require('../orb.axe'),
    PivotRow = require('./PivotRow');

module.exports = React.createClass({
  displayName: 'PivotTable.ColumnHeaders',
  render: function() {
    var self = this;
    var pgridwidget = this.props.pivotTableComp.pgridwidget;
    var cntrClass = pgridwidget.columns.headers.length === 0 ? '' : ' columns-cntr';

    var layoutInfos = { 
      lastLeftMostCellVSpan: 0,
      topMostCells: {}
    };

    var columnHeaders = pgridwidget.columns.headers.map(function(headerRow, index) {
      return <PivotRow key={index}
                       row={headerRow}
                       axetype={axe.Type.COLUMNS}
                       pivotTableComp={self.props.pivotTableComp}
                       layoutInfos={layoutInfos}>
      </PivotRow>;
    });              

    return  <div className={'inner-table-container' + cntrClass} onWheel={this.props.pivotTableComp.onWheel}>
      <table className="inner-table">
        <colgroup>
        </colgroup>
        <tbody>
          {columnHeaders}
        </tbody>
      </table>
    </div>;
  }
});