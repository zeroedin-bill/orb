var orb = require('orb');
var data = require('demo/demo.data');

var refreshButton = document.getElementById('refresh-button');
refreshButton.addEventListener('click', refreshData);
var changeThemeButton = document.getElementById('change-theme-button');
changeThemeButton.addEventListener('click', changeTheme);
var exportToExcelButton = document.getElementById('export-to-excel-button');
exportToExcelButton.addEventListener('click', exportToExcel);

function refreshData(event) {
    pgridwidget.refreshData(window.demo.data);
}

function changeTheme(event) {
    pgridwidget.changeTheme('bootstrap');
}

function exportToExcel(event) {
    var anchor = event.currentTarget;
    anchor.href = orb.export(pgridwidget);
    return true;
}

var config = {
    dataSource: data,
    canMoveFields: true,
    dataHeadersLocation: 'columns',
    width: 1099,
    height: 611,
    theme: 'blue',
    toolbar: {
        visible: true
    },
    grandTotal: {
        rowsvisible: true,
        columnsvisible: true
    },
    subTotal: {
        visible: true,
        collapsed: true,
        collapsible: true
    },
    fields: [
        {
            name: '6',
            caption: 'Amount',
            dataSettings: {
                aggregateFunc: 'avg',
                formatFunc: function(value) {
                    return value ? Number(value).toFixed(0) + ' $' : '';
                }
            }
        },
        {
            name: '0',
            caption: 'Entity'
        },
        {
            name: '1',
            caption: 'Product'
        },
        {
            name: '2',
            caption: 'Manufacturer',
            sort: {
                order: 'asc'
            }
        },
        {
            name: '3',
            caption: 'Class'
        },
        {
            name: '4',
            caption: 'Category',
            sort: {
                customfunc: function(a, b) {
                    if(a.trim() == 'Touch Screen Phones'){
                        return -1;
                    }
                    if(a < b) return -1;
                    if(a > b) return 1;
                    return 0;
                }
            }
        },
        {
            name: '5',
            caption: 'Quantity',
            aggregateFunc: 'sum'
        }
    ],
    rows    : [ 'Manufacturer', 'Category' ],
    columns : [ 'Class' ],
    data    : [ 'Quantity', 'Amount' ]
    /*preFilters : {
     'Class': { 'Matches': 'Regular' },
     'Manufacturer': { 'Matches': /^a|^c/ },
     'Category'    : { 'Does Not Match': 'D' },
     // 'Amount'      : { '>':  40 },
     //   'Quantity'    : [4, 8, 12]
     }*/
};

var elem = document.getElementById('rr');

var pgridwidget = new orb.pgridwidget(config);
pgridwidget.render(elem);

var croot = pgridwidget.pgrid.columns.root;
var jsn = getSubVals(croot, {});
function getSubVals(dim, obj) {
    for(var i=0;i < dim.values.length; i++) {
        obj[dim.values[i]] = obj[dim.values[i]] || {};
        if(dim.subdimvals[dim.values[i]]) {
            getSubVals(dim.subdimvals[dim.values[i]], obj[dim.values[i]]);
        }
    }
    return obj;
}

function extractValues(dim, currval, arr) {
    if(dim.depth > 1) {
        for(var i=0;i < dim.values.length; i++) {
            var subdim = dim.subdimvals[dim.values[i]];
            extractValues(subdim, currval + '-' + subdim.value, arr);
        }
    } else {
        arr.push({dim: dim, val: currval});
    }
    return arr;
}