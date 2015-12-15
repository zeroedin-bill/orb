/**
 * Created by William Schaller on 12/15/2015.
 */
var domUtils = require('../orb.utils.dom'),
    utils = require('../orb.utils'),
    React = require('react'),
    ReactDOM = require('react-dom');

module.exports = {
    scrollEvent: null,
    scrollClient: null,
    getInitialState: function () {
        // initial state, all zero.
        return {
            size: 16,
            mousedown: false,
            thumbOffset: 0
        };
    },
    componentDidMount: function () {
        this.scrollEvent = new ScrollEvent(this);
    },
    componentDidUpdate: function () {
        if (!this.state.mousedown) {
            // mouse not down, don't care about mouse up/move events.
            utils.removeEventListener(document, 'mousemove', this.onMouseMove);
            utils.removeEventListener(document, 'mouseup', this.onMouseUp);
        } else if (this.state.mousedown) {
            // mouse down, interested by mouse up/move events.
            utils.addEventListener(document, 'mousemove', this.onMouseMove);
            utils.addEventListener(document, 'mouseup', this.onMouseUp);
        }
    },
    componentWillUnmount: function () {
        utils.removeEventListener(document, 'mousemove', this.onMouseMove);
        utils.removeEventListener(document, 'mouseup', this.onMouseUp);
    },
    onMouseDown: function (e) {
        // drag with left mouse button
        if (e.button !== 0) return;

        var thumbElem = this.refs.scrollThumb;
        var thumbposInParent = domUtils.getParentOffset(thumbElem);
        var mousePageXY = utils.getMousePageXY(e);

        domUtils.addClass(thumbElem, 'orb-scrollthumb-hover');

        // inform mousedown, save start pos
        this.setState({
            mousedown: true,
            mouseoffset: mousePageXY[this.mousePosProp],
            thumbOffset: thumbposInParent[this.posProp]
        });

        // prevent event bubbling (to prevent text selection while dragging for example)
        utils.stopPropagation(e);
        utils.preventDefault(e);
    },
    onMouseUp: function () {

        if (this.state.mousedown) {
            var thumbElem = this.refs.scrollThumb;
            domUtils.removeClass(thumbElem, 'orb-scrollthumb-hover');
        }

        this.setState({
            mousedown: false
        });
    },
    onMouseMove: function (e) {

        // if the mouse is not down while moving, return (no drag)
        if (!this.state.mousedown) return;

        utils.stopPropagation(e);
        utils.preventDefault(e);

        var mousePageXY = utils.getMousePageXY(e);
        var amount = mousePageXY[this.mousePosProp] - this.state.mouseoffset;
        this.state.mouseoffset = mousePageXY[this.mousePosProp];

        this.scroll(amount);
    },
    getScrollSize: function () {
        if (this.scrollClient != null) {
            return domUtils.getSize(this.scrollClient)[this.sizeProp];
        } else {
            return domUtils.getSize(ReactDOM.findDOMNode(this))[this.sizeProp];
        }
    },
    setScrollClient: function (scrollClient, scrollCallback) {
        this.scrollClient = scrollClient;
        this.scrollEvent.callback = scrollCallback;
    },
    getScrollPercent: function () {
        var maxOffset = this.getScrollSize() - this.state.size;
        return maxOffset <= 0 ? 0 : this.state.thumbOffset / maxOffset;
    },
    refresh: function () {
        if (this.scrollClient) {
            var scrolledElement = this.scrollClient.children[0];

            var clientSize = domUtils.getSize(this.scrollClient);
            var elementSize = domUtils.getSize(scrolledElement);

            var scrollBarContainerSize = this.getScrollSize();
            var newSize = clientSize[this.sizeProp] >= elementSize[this.sizeProp] ? 0 : (clientSize[this.sizeProp] / elementSize[this.sizeProp]) * scrollBarContainerSize;

            this.setState(
                {
                    containerSize: scrollBarContainerSize,
                    size: newSize,
                    thumbOffset: Math.min(this.state.thumbOffset, scrollBarContainerSize - newSize)
                },
                this.scrollEvent.raise
            );

        }
    },
    scroll: function (amount, mode) {
        if (this.state.size > 0) {
            if (mode == 1) amount *= 8;

            var maxOffset = this.getScrollSize() - this.state.size;
            var newOffset = this.state.thumbOffset + amount;
            if (newOffset < 0) newOffset = 0;
            if (newOffset > maxOffset) newOffset = maxOffset;

            if (this.state.thumbOffset != newOffset) {
                this.setState(
                    {thumbOffset: newOffset},
                    this.scrollEvent.raise
                );
                return true;
            }
        }
        return false;
    },
    onWheel: function (e) {
        this.scroll(e.deltaY, e.deltaMode);
        utils.stopPropagation(e);
        utils.preventDefault(e);
    },
    render: function () {
        var self = this;

        var thumbStyle = {padding: 0};
        thumbStyle[this.sizeProp] = this.state.size;
        thumbStyle[this.offsetCssProp] = this.state.thumbOffset;

        var thisStyle = {};
        thisStyle[this.sizeProp] = this.state.containerSize;

        var thumbClass = "orb-scrollthumb " + this.props.pivotTableComp.pgrid.config.theme.getButtonClasses().scrollBar;

        var scrollThumb = this.state.size <= 0 ?
            null :
            <div className={thumbClass} style={thumbStyle}
                 ref="scrollThumb"
                 onMouseDown={this.onMouseDown}>
            </div>;

        return <div className={this.cssClass} style={thisStyle} onWheel={this.onWheel}>
            { scrollThumb }
        </div>;
    }
};

function ScrollEvent(scrollBarComp) {
    var self = this;
    this.scrollBarComp = scrollBarComp;
    this.callback = null;
    this.raise = function () {
        if (self.callback) {
            self.callback(self.scrollBarComp.getScrollPercent());
        }
    };
}