

/* global module, require */
/*jshint eqnull: true*/

"use strict";

var React = require('react'),
	ReactDOM = require('react-dom'),
	utils = require('../orb.utils');

module.exports = React.createClass({
	displayName: 'Dropdown',
	openOrClose: function(e) {
		var valueNode = this.refs.valueElement;
		var valuesListNode = this.refs.valuesList;
		var target = e.target || e.srcElement;

		if(target === valueNode && valuesListNode.style.display === 'none') {
			valuesListNode.style.display = 'block';
		} else {
			valuesListNode.style.display = 'none';
		}
	},
	onMouseEnter: function() {
		var valueNode = this.refs.valueElement;
		valueNode.className = "orb-tgl-btn-down";
		valueNode.style.backgroundPosition = 'right center';
	},
	onMouseLeave: function() {
		this.refs.valueElement.className = "";
	},
	componentDidMount: function() {
		utils.addEventListener(document, 'click', this.openOrClose);
	},
	componentWillUnmount : function() {
		utils.removeEventListener(document, 'click', this.openOrClose);
	},
	selectValue: function(e) {
		var listNode = this.refs.valuesList;
		var target = e.target || e.srcElement;
		var isli = false;
		while(!isli && target != null) {
			if(target.parentNode == listNode) {
				isli = true;
				break;
			}
			target = target.parentNode;
		}

		if(isli) {
			var value = target.textContent;
			var valueElement = this.refs.valueElement;
			if(valueElement.textContent != value) {
				valueElement.textContent = value;
				if(this.props.onValueChanged) {
					this.props.onValueChanged(value);
				}
			}
		}
	},
	render: function() {
		function createSelectValueFunc(value) {
			return function() {
				this.selectValue(value);
			};
		}

		var values = [];
		for(var i=0; i < this.props.values.length; i++) {
			values.push(<li key={'item' + i} dangerouslySetInnerHTML={{__html: this.props.values[i]}}></li>);
		}

		return <div className="orb-select">
				<div ref="valueElement" dangerouslySetInnerHTML={{__html: this.props.selectedValue}} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}></div>
				<ul ref="valuesList" style={{ display: 'none' }} onClick={ this.selectValue }>
					{values}
				</ul>
			</div>;
	}
});