

/* global module, react */
/*jshint eqnull: true*/

"use strict";

var React = require('react'),
	ReactDOM = require('react-dom'),
	utils = require('../orb.utils'),
	Dropdown = require('./Dropdown'),
	filtering = require('../orb.filtering'),
	domUtils = require('../orb.utils.dom');

module.exports = React.createClass({
	pgridwidget: null,
	values: null,
	filterManager: null,
	getInitialState: function() {
		this.pgridwidget = this.props.pivotTableComp.pgridwidget;
		return {};
	},
	destroy: function() {
		var container = ReactDOM.findDOMNode(this).parentNode;
		React.unmountComponentAtNode(container);
		container.parentNode.removeChild(container);
	},
	onFilter: function(operator, term, staticValue, excludeStatic) {
		this.props.pivotTableComp.applyFilter(this.props.field, operator, term, staticValue, excludeStatic);
		this.destroy();
	},
	onMouseDown: function(e) {
		var container = ReactDOM.findDOMNode(this).parentNode;
		var target = e.target || e.srcElement;
		while(target != null) {
			if(target == container) {
				return true;
			}
			target = target.parentNode;
		}

		this.destroy();
	},
	onMouseWheel: function(e) {
		var valuesTable = this.refs.valuesTable;
		var target = e.target || e.srcElement;
		while(target != null) {
			if(target == valuesTable) {
				if(valuesTable.scrollHeight <= valuesTable.clientHeight) {
					utils.stopPropagation(e);
					utils.preventDefault(e);
				}
				return;
			}
			target = target.parentNode;
		}

		this.destroy();
	},
	componentWillMount : function() {
		utils.addEventListener(document, 'mousedown', this.onMouseDown);
		utils.addEventListener(document, 'wheel', this.onMouseWheel);
		utils.addEventListener(window, 'resize', this.destroy);
	},
	componentDidMount: function() {
		this.filterManager.init(ReactDOM.findDOMNode(this));
	},
	componentWillUnmount : function() {
		utils.removeEventListener(document, 'mousedown', this.onMouseDown);
		utils.removeEventListener(document, 'wheel', this.onMouseWheel);
		utils.removeEventListener(window, 'resize', this.destroy);
	},
	render: function () {
		var checkboxes = [];

		this.filterManager = new FilterManager(this, this.pgridwidget.pgrid.getFieldFilter(this.props.field));
		this.values = this.pgridwidget.pgrid.getFieldValues(this.props.field);

		function addCheckboxRow(value, text) {
			return checkboxes.push(<tr key={value}>
				<td className="fltr-chkbox">
					<input type="checkbox" value={value} defaultChecked="checked"/>
				</td>
				<td className="fltr-val" title={text || value}>{text || value}</td>
				</tr>);
		}

		addCheckboxRow(filtering.ALL, '(Show All)');

		for(var i = 0; i < this.values.length; i++) {
			if(this.values[i] != null) {
				addCheckboxRow(this.values[i]);
			} else {
				addCheckboxRow(filtering.BLANK, '(Blank)');
			}
		}

		var buttonClass = this.props.pivotTableComp.pgrid.config.theme.getButtonClasses().orbButton;
		var style = this.props.pivotTableComp.fontStyle;

        var currentFilter = this.pgridwidget.pgrid.getFieldFilter(this.props.field);

		return <table className="fltr-scntnr" style={style}>
		<tbody>
			<tr>
				<td className="srchop-col">
					<Dropdown values={[
								filtering.Operators.MATCH.name,
								filtering.Operators.NOTMATCH.name,
								filtering.Operators.EQ.name,
								filtering.Operators.NEQ.name,
								filtering.Operators.GT.name,
								filtering.Operators.GTE.name,
								filtering.Operators.LT.name,
								filtering.Operators.LTE.name
						]} selectedValue={currentFilter && currentFilter.operator ? currentFilter.operator.name : filtering.Operators.MATCH.name} onValueChanged={ this.filterManager.onOperatorChanged }>
					</Dropdown>
				</td>
				<td className="srchtyp-col" title="Enable/disable Regular expressions">.*</td>
				<td className="srchbox-col">
					<table style={{width: '100%'}}>
						<tbody>
							<tr>
								<td><input type="text" placeholder="search"/></td>
								<td><div className="srchclear-btn" onClick={this.clearFilter}>x</div></td>
							</tr>
						</tbody>
					</table>					
				</td>
			</tr>
			<tr>
				<td colSpan="3" className="fltr-vals-col">
					<table className="fltr-vals-tbl" ref="valuesTable">
					<tbody>
						{checkboxes}
					</tbody>
					</table>
				</td>
			</tr>
			<tr className="bottom-row">
				<td className="cnfrm-btn-col" colSpan="2">
					<input type="button" className={buttonClass} value="Ok" style={{ float: 'left' }}/>
					<input type="button" className={buttonClass} value="Cancel" style={{ float: 'left' }}/>
				</td>
				<td className="resize-col">
					<div></div>
				</td>
			</tr>
		</tbody>
		</table>;
	}
});

function FilterManager(reactComp, initialFilterObject) {

	var self = this;
	var INDETERMINATE = 'indeterminate';

	var savedCheckedValues;
	var isSearchMode = false;
	var isRegexMode = false;
	var operator = filtering.Operators.MATCH;
	var lastSearchTerm = '';

	var elems = {
		filterContainer: null,
		checkboxes: {},
		searchBox: null,
		operatorBox: null,
		allCheckbox: null,
		addCheckbox: null,
		enableRegexButton: null,
		clearSearchButton: null,
		okButton: null,
		cancelButton: null,
		resizeGrip: null
	};

	var resizeManager;

	this.init = function(filterContainerElement) {

		elems.filterContainer = filterContainerElement;
		elems.checkboxes = {};
		elems.searchBox = elems.filterContainer.rows[0].cells[2].children[0].rows[0].cells[0].children[0];
		elems.clearSearchButton = elems.filterContainer.rows[0].cells[2].children[0].rows[0].cells[1].children[0];
		elems.operatorBox = elems.filterContainer.rows[0].cells[0].children[0];
		elems.okButton = elems.filterContainer.rows[2].cells[0].children[0];
		elems.cancelButton = elems.filterContainer.rows[2].cells[0].children[1];
		elems.resizeGrip = elems.filterContainer.rows[2].cells[1].children[0];

		var rows = elems.filterContainer.rows[1].cells[0].children[0].rows;
		for(var i = 0; i < rows.length; i++) {
			var checkbox = rows[i].cells[0].children[0];
			elems.checkboxes[checkbox.value] = checkbox;
		}

		elems.allCheckbox = elems.checkboxes[filtering.ALL];
		elems.blanckCheckbox = elems.checkboxes[filtering.BLANK];
		elems.addCheckbox = null;
		elems.enableRegexButton = elems.filterContainer.rows[0].cells[1];

		resizeManager = new ResizeManager(elems.filterContainer.parentNode, elems.filterContainer.rows[1].cells[0].children[0], elems.resizeGrip);

		applyInitialFilterObject();
		addEventListeners();
	};

	this.onOperatorChanged = function(newOperator) {
		if(operator.name !== newOperator) {
			operator = filtering.Operators.get(newOperator);
			self.toggleRegexpButtonVisibility();
			self.searchChanged('operatorChanged');
		}
	};

	function checkboxVisible(checkbox, isVisible) {
		if(isVisible != null) {
			checkbox.parentNode.parentNode.style.display = isVisible ? '' : 'none';
		} else {
			return checkbox.parentNode.parentNode.style.display != 'none';
		}
	}

	function applyInitialFilterObject() {
		if(initialFilterObject) {
			var staticInfos = {
				values: initialFilterObject.staticValue,
				toExclude: initialFilterObject.excludeStatic
			};

			if(initialFilterObject.term) {				
				isSearchMode = true;
				
				operator = initialFilterObject.operator;
				self.toggleRegexpButtonVisibility();

				if(initialFilterObject.regexpMode) {
					isRegexMode = true;
					self.toggleRegexpButtonState();
					lastSearchTerm = initialFilterObject.term.source;
				} else {
					lastSearchTerm = initialFilterObject.term;
				}

				elems.searchBox.value = lastSearchTerm;

				self.applyFilterTerm(initialFilterObject.operator, initialFilterObject.term);
			} else {
				savedCheckedValues = staticInfos;
			}

			self.updateCheckboxes(staticInfos);
			self.updateAllCheckbox();
		}
	}

	function addEventListeners() {
		self.toggleRegexpButtonVisibility();

		utils.addEventListener(elems.filterContainer, 'click', self.valueChecked);
		utils.addEventListener(elems.searchBox, 'keyup', self.searchChanged);

		utils.addEventListener(elems.clearSearchButton, 'click', self.clearSearchBox);
		
		utils.addEventListener(elems.okButton, 'click', function() { 
			var checkedObj = self.getCheckedValues();
			reactComp.onFilter(operator.name, operator.regexpSupported && isSearchMode && isRegexMode ? new RegExp(lastSearchTerm, 'i') : lastSearchTerm, checkedObj.values, checkedObj.toExclude); 
		});
		utils.addEventListener(elems.cancelButton, 'click', function() { reactComp.destroy(); });		
	}

	function ResizeManager(outerContainerElem, valuesTableElem, resizeGripElem) {

		var minContainerWidth = 301;
		var minContainerHeight = 223;

		var mousedownpos = {
			x: 0, y: 0
		};
		var isMouseDown = false;

		this.resizeMouseDown = function(e) {
			// drag/sort with left mouse button
			if (utils.getEventButton(e) !== 0) return;

			var mousePageXY = utils.getMousePageXY(e);

			isMouseDown = true;
			document.body.style.cursor = 'se-resize';

			mousedownpos.x = mousePageXY.pageX;
			mousedownpos.y = mousePageXY.pageY;

			// prevent event bubbling (to prevent text selection while dragging for example)
			utils.stopPropagation(e);
			utils.preventDefault(e);
		};

		this.resizeMouseUp = function() {
			isMouseDown = false;
			document.body.style.cursor = 'auto';
			return true;
		};

		this.resizeMouseMove = function(e) {
			// if the mouse is not down while moving, return (no drag)
			if (!isMouseDown) return;

			var mousePageXY = utils.getMousePageXY(e);

			var resizeGripSize = resizeGripElem.getBoundingClientRect();
			var outerContainerSize = outerContainerElem.getBoundingClientRect();
		    var valuesTableSize = valuesTableElem.tBodies[0].getBoundingClientRect();

		    var outerContainerWidth = outerContainerSize.right - outerContainerSize.left;
		    var outerContainerHeight = outerContainerSize.bottom - outerContainerSize.top;

			var offset = {
				x: outerContainerWidth <= minContainerWidth && mousePageXY.pageX < resizeGripSize.left ? 0 : mousePageXY.pageX - mousedownpos.x,
				y: outerContainerHeight <= minContainerHeight && mousePageXY.pageY < resizeGripSize.top ? 0 : mousePageXY.pageY - mousedownpos.y
			};

			var newContainerWidth = outerContainerWidth  + offset.x;
		    var newContainerHeight = outerContainerHeight  + offset.y;

			mousedownpos.x = mousePageXY.pageX;
			mousedownpos.y = mousePageXY.pageY;

			if(newContainerWidth >= minContainerWidth) {
				outerContainerElem.style.width = newContainerWidth + 'px';
			}

			if(newContainerHeight >= minContainerHeight) {
				outerContainerElem.style.height = newContainerHeight + 'px';
				valuesTableElem.tBodies[0].style.height = (valuesTableSize.bottom - valuesTableSize.top + offset.y) + 'px';
			}

			utils.stopPropagation(e);
			utils.preventDefault(e);
		};

		utils.addEventListener(resizeGripElem, 'mousedown', this.resizeMouseDown);
		utils.addEventListener(document, 'mouseup', this.resizeMouseUp);
		utils.addEventListener(document, 'mousemove', this.resizeMouseMove);
	}

	this.clearSearchBox = function() {
		elems.searchBox.value = '';
		self.searchChanged();
	};

	this.toggleRegexpButtonVisibility = function() {
		if(operator.regexpSupported) {
			utils.addEventListener(elems.enableRegexButton, 'click', self.regexpActiveChanged);
			domUtils.removeClass(elems.enableRegexButton, 'srchtyp-col-hidden');
			
		} else {
			utils.removeEventListener(elems.enableRegexButton, 'click', self.regexpActiveChanged);
			domUtils.addClass(elems.enableRegexButton, 'srchtyp-col-hidden');
		}
	};

	this.toggleRegexpButtonState = function() {
		elems.enableRegexButton.className = elems.enableRegexButton.className.replace('srchtyp-col-active', '');
		if(isRegexMode) {
			domUtils.addClass(elems.enableRegexButton, 'srchtyp-col-active');
		} else {
			domUtils.removeClass(elems.enableRegexButton, 'srchtyp-col-active');
		}
	};

	this.regexpActiveChanged = function() { 
		isRegexMode = !isRegexMode;
		self.toggleRegexpButtonState();
		self.searchChanged('regexModeChanged');
	};

	this.valueChecked = function(e) {
		var target = e.target || e.srcElement;
		if(target && target.type && target.type === 'checkbox') {
			if(target == elems.allCheckbox) {
				self.updateCheckboxes({ values: elems.allCheckbox.checked });
			} else {
				self.updateAllCheckbox();
			}
		}
	};

	this.applyFilterTerm = function(operator, term) {		
		var defaultVisible = term ? false : true;
		var opterm = operator.regexpSupported && isSearchMode ? (isRegexMode ? term : utils.escapeRegex(term)) : term;
		checkboxVisible(elems.allCheckbox, defaultVisible);
		for(var i = 0; i < reactComp.values.length; i++) {
			var val = reactComp.values[i];
			var checkbox = val != null ? elems.checkboxes[val] : elems.blanckCheckbox;
			var visible = !isSearchMode || operator.func(val, opterm);
			checkboxVisible(checkbox, visible);
			checkbox.checked = visible;
		}
	};

	this.searchChanged = function(e) {
		var search = (elems.searchBox.value || '').trim();
		if(e === 'operatorChanged' || (e === 'regexModeChanged' && search) || search != lastSearchTerm) {
			lastSearchTerm = search;
			
			var previousIsSearchMode = isSearchMode;
			isSearchMode = search !== '';

			if(isSearchMode && !previousIsSearchMode) {
				savedCheckedValues = self.getCheckedValues();
			}

			//var searchTerm = operator.regexpSupported && isSearchMode ? new RegExp(isRegexMode ? search : utils.escapeRegex(search), 'i') : search;
			if(e !== 'operatorChanged' || isSearchMode) {
				self.applyFilterTerm(operator, search);
			}

			if(!isSearchMode && previousIsSearchMode) {
				self.updateCheckboxes(savedCheckedValues);
			}

			self.updateAllCheckbox();
		}
	};

	this.getCheckedValues = function() {
		if(!isSearchMode && !elems.allCheckbox.indeterminate) {
			return {
				values: elems.allCheckbox.checked ? filtering.ALL : filtering.NONE,
				toExclude: false
			};
		} else {
			var staticValue;
			var i,
				val,
				checkbox;				
			var valuesCount = 0,
				checkedCount = 0;

			for(i = 0; i < reactComp.values.length; i++) {
				val = reactComp.values[i];
				checkbox = val != null ? elems.checkboxes[val] : elems.blanckCheckbox;
				if(checkboxVisible(checkbox)) {
					valuesCount++;
					if(checkbox.checked) {
						checkedCount++;
					}
				}
			}

			var excludeUnchecked = false;

			if(checkedCount === 0) {
				staticValue = filtering.NONE;
			} else if(checkedCount == valuesCount) {
				staticValue = filtering.ALL;
			} else {
				staticValue = [];
				excludeUnchecked = checkedCount > (valuesCount/2 + 1);

				for(i = 0; i < reactComp.values.length; i++) {
					val = reactComp.values[i];
					checkbox = val != null ? elems.checkboxes[val] : elems.blanckCheckbox;
					if(checkboxVisible(checkbox)) {
						if((!excludeUnchecked && checkbox.checked) || (excludeUnchecked && !checkbox.checked))  {
							staticValue.push(val);
						}
					}
				}
			}
			return {
				values: staticValue,
				toExclude: excludeUnchecked
			};
		}
	};

	this.updateCheckboxes = function(checkedList) {
		var values = checkedList ? checkedList.values : null;
		var allchecked = utils.isArray(values) ?
			null :
			(values == null || values === filtering.ALL ?
				true :
				(values === filtering.NONE ? 
					false :
					!!values
				)
			);
		for(var i = 0; i < reactComp.values.length; i++) {
			var val = reactComp.values[i];
			var checkbox = val != null ? elems.checkboxes[val] : elems.blanckCheckbox;
			if(checkboxVisible(checkbox)) {
				if(allchecked != null) {
					checkbox.checked = allchecked;
				} else {
					var valInList = values.indexOf(val) >= 0;
					checkbox.checked =  checkedList.toExclude ? !valInList : valInList;
				}
			}
		}
	};

	this.updateAllCheckbox = function() {
		if(!isSearchMode) {
			var allchecked = null;
			for(var i = 0; i < reactComp.values.length; i++) {
				var val = reactComp.values[i];
				var checkbox = val != null ? elems.checkboxes[val] : elems.blanckCheckbox;
				if(allchecked == null) {
					allchecked = checkbox.checked;
				} else {
					if(allchecked !== checkbox.checked) {
						allchecked = INDETERMINATE;
						break;
					}
				}
			}

			if(allchecked === INDETERMINATE) {
				elems.allCheckbox.indeterminate = true;
				elems.allCheckbox.checked = false;
			} else {
				elems.allCheckbox.indeterminate = false;
				elems.allCheckbox.checked = allchecked;
			}
		}
	};
}
