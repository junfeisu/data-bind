(function(_g){(function(f){if(typeof exports==='object'&&typeof module!=='undefined'){module.exports=f()}else if(typeof define==='function'&&define.amd){define([],f.bind(_g))}else{f()}})(function(define,module,exports){var _m =(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var option = {
  priority: {
    'sjf-if': 2000,
    'sjf-show': 2000,
    'sjf-for': 1000,
    'sjf-model': 10,
    'sjf-text': 1
  },
  sjfEvents: ['sjf-click', 'sjf-mouseover', 'sjf-mouseout', 'sjf-mousemove', 'sjf-mouseenter', 'sjf-mouseleave', 'sjf-mousedown', 'sjf-mouseup']
};

module.exports = option;

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _option = require('./option');

var _option2 = _interopRequireDefault(_option);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// traverse the DOM
var circleElement = function circleElement(parent, isFirst) {
  var _this = this;

  var child = parent.children;
  if (isFirst && !child.length) {
    link.call(this);
    return;
  }
  for (var i = 0; i < child.length; i++) {
    var node = child[i];
    if (!!node.children.length) {
      circleElement.call(this, node, false);
      this._uncompileNodes.push(node);
    } else {
      this._uncompileNodes.push(node);
      this._uncompileNodes.forEach(function (value) {
        compileNode.call(_this, value);
      });
      this._uncompileNodes = [];
    }
  }
  if (this._el.lastElementChild === child[child.length - 1]) {
    link.call(this);
  }
};

var compileNode = function compileNode(node) {
  var _this2 = this;

  var matchExpress = /sjf-.+=\".+\"|\{\{.+\}\}/;
  if (matchExpress.test(node.outerHTML || node.innerText)) {
    var directives = matchExpress.exec(node.outerHTML || node.innerText);
    directives.forEach(function (value) {
      var slices = value.split('=');
      if (_option2.default.sjfEvents.indexOf(slices[0]) >= 0) {
        node.removeAttribute(slices[0]);
        var eventType = _utils2.default.removePrefix(slices[0]);
        var eventFunc = _this2['_' + _utils2.default.removeBrackets(slices[1])];
        node.addEventListener(eventType, eventFunc, false);
      } else {
        if (/\{\{.+\}\}/.test(value)) {
          console.log(node.outerHTML);
          node.outerHTML = node.outerHTML.replace(matchExpress, "");
          slices[0] = slices[0].replace(/[\{\}]/g, "");
          _this2._unlinkNodes.push({ node: node, directive: 'sjf-text', expression: slices[0] });
        } else {
          node.removeAttribute(slices[0]);
          slices[1] = slices[1].replace(/\"/g, "");
          _this2._unlinkNodes.push({ node: node, directive: slices[0], expression: slices[1] });
        }
      }
    });
  }
};

// compile the sjf
var compile = function compile() {
  circleElement.bind(this)(this._el, true);
};

var linkRender = {
  'sjf-if': function sjfIf(value) {
    value.node.style.display = !!value.expression ? 'block!important' : 'none!important';
  },
  'sjf-show': function sjfShow(value) {
    value.node.style.display = !!value.expression ? 'block!important' : 'none!important';
  },
  'sjf-for': function sjfFor(value) {
    var expressionSlices = value.expression.split(/\s+/);
    if (typeof expressionSlices[2] !== 'number' && this._data.hasOwnProperty(expressionSlices[2])) {
      this._watchers.push(this._data[expressionSlices[2]]);
    }
    for (var i = 0; i < this._data[expressionSlices[2]].length; i++) {
      var clonedNode = value.node.cloneNode(true);
      value.node.parentElement.insertBefore(clonedNode, value.node);
    }
  },
  'sjf-text': function sjfText(value) {
    this.innerText = this._data[value.expression];
  }
};

var link = function link() {
  var self = this;
  if (!!self._unlinkNodes.length) {
    var executeQueue = _utils2.default.sortExexuteQueue('directive', self._unlinkNodes);
    executeQueue.forEach(function (value) {
      linkRender[value.directive].bind(self)(value);
    });
  }
  console.log(this);
};

function SjfDataBind(param) {
  if (!param.hasOwnProperty('el') || !param.hasOwnProperty('data')) {
    console.error('sjf[error]: There is need `data` and `el` attribute');
    return;
  }
  this._el = document.querySelector(param.el);
  this._data = param.data;
  this._watchers = [];
  this._uncompileNodes = [];
  this._unlinkNodes = [];
  for (var method in param.methods) {
    this['_' + method] = param.methods[method].bind(this);
  }
  compile.call(this);
}

exports.default = SjfDataBind;

},{"./option":1,"./utils":3}],3:[function(require,module,exports){
'use strict';

var _option = require('./option');

var _option2 = _interopRequireDefault(_option);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var util = {
  // judge the type of obj
  judgeType: function judgeType(obj) {
    return Object.prototype.toString.call(obj);
  },

  // remove the prefix of sjf-
  removePrefix: function removePrefix(str) {
    return str = str.replace(/sjf-/, '');
  },

  // remove the brackets ()
  removeBrackets: function removeBrackets(str) {
    str = str.replace(/\"/g, '');
    return str = str.replace(/\(\)/, '');
  },
  sortExexuteQueue: function sortExexuteQueue(property, objArr) {
    return objArr.sort(function (obj1, obj2) {
      var val1 = _option2.default.priority[obj1[property]];
      var val2 = _option2.default.priority[obj2[property]];
      return val2 - val1;
    });
  }
};

module.exports = util;

},{"./option":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2UvamF2YXNjcmlwdC9vcHRpb24uanMiLCJzb3VyY2UvamF2YXNjcmlwdC9zamZEYXRhQmluZC5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFNLFNBQVM7QUFDYixZQUFVO0FBQ1IsY0FBVSxJQURGO0FBRVIsZ0JBQVksSUFGSjtBQUdSLGVBQVcsSUFISDtBQUlSLGlCQUFhLEVBSkw7QUFLUixnQkFBWTtBQUxKLEdBREc7QUFRYixhQUFXLENBQ1QsV0FEUyxFQUVULGVBRlMsRUFHVCxjQUhTLEVBSVQsZUFKUyxFQUtULGdCQUxTLEVBTVQsZ0JBTlMsRUFPVCxlQVBTLEVBUVQsYUFSUztBQVJFLENBQWY7O0FBb0JBLE9BQU8sT0FBUCxHQUFpQixNQUFqQjs7O0FDcEJBOzs7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQTtBQUNBLElBQU0sZ0JBQWdCLFNBQWhCLGFBQWdCLENBQVUsTUFBVixFQUFrQixPQUFsQixFQUEyQjtBQUFBOztBQUMvQyxNQUFJLFFBQVEsT0FBTyxRQUFuQjtBQUNBLE1BQUksV0FBVyxDQUFDLE1BQU0sTUFBdEIsRUFBOEI7QUFDNUIsU0FBSyxJQUFMLENBQVUsSUFBVjtBQUNBO0FBQ0Q7QUFDRCxPQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksTUFBTSxNQUExQixFQUFrQyxHQUFsQyxFQUF1QztBQUNyQyxRQUFJLE9BQU8sTUFBTSxDQUFOLENBQVg7QUFDQSxRQUFJLENBQUMsQ0FBQyxLQUFLLFFBQUwsQ0FBYyxNQUFwQixFQUE0QjtBQUMxQixvQkFBYyxJQUFkLENBQW1CLElBQW5CLEVBQXlCLElBQXpCLEVBQStCLEtBQS9CO0FBQ0EsV0FBSyxlQUFMLENBQXFCLElBQXJCLENBQTBCLElBQTFCO0FBQ0QsS0FIRCxNQUdPO0FBQ0wsV0FBSyxlQUFMLENBQXFCLElB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QUFPLE9BQU8sSUFBUCxDQUFZLFVBQUMsSUFBRCxFQUFPLElBQVAsRUFBZ0I7QUFDakMsVUFBSSxPQUFPLGlCQUFPLFFBQVAsQ0FBZ0IsS0FBSyxRQUFMLENBQWhCLENBQVg7QUFDQSxVQUFJLE9BQU8saUJBQU8sUUFBUCxDQUFnQixLQUFLLFFBQUwsQ0FBaEIsQ0FBWDtBQUNBLGFBQU8sT0FBTyxJQUFkO0FBQ0QsS0FKTSxDQUFQO0FBS0Q7QUFwQlUsQ0FBYjs7QUF1QkEsT0FBTyxPQUFQLEdBQWlCLElBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNvbnN0IG9wdGlvbiA9IHtcbiAgcHJpb3JpdHk6IHtcbiAgICAnc2pmLWlmJzogMjAwMCxcbiAgICAnc2pmLXNob3cnOiAyMDAwLFxuICAgICdzamYtZm9yJzogMTAwMCxcbiAgICAnc2pmLW1vZGVsJzogMTAsXG4gICAgJ3NqZi10ZXh0JzogMVxuICB9LFxuICBzamZFdmVudHM6IFtcbiAgICAnc2pmLWNsaWNrJywgXG4gICAgJ3NqZi1tb3VzZW92ZXInLCBcbiAgICAnc2pmLW1vdXNlb3V0JywgXG4gICAgJ3NqZi1tb3VzZW1vdmUnLCBcbiAgICAnc2pmLW1vdXNlZW50ZXInLFxuICAgICdzamYtbW91c2VsZWF2ZScsXG4gICAgJ3NqZi1tb3VzZWRvd24nLFxuICAgICdzamYtbW91c2V1cCdcbiAgXVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG9wdGlvblxuIiwiJ3VzZSBzdHJpY3QnXG5pbXBvcnQgdXRpbCBmcm9tICcuL3V0aWxzJ1xuaW1wb3J0IG9wdGlvbiBmcm9tICcuL29wdGlvbidcblxuLy8gdHJhdmVyc2UgdGhlIERPTVxuY29uc3QgY2lyY2xlRWxlbWVudCA9IGZ1bmN0aW9uIChwYXJlbnQsIGlzRmlyc3QpIHtcbiAgbGV0IGNoaWxkID0gcGFyZW50LmNoaWxkcmVuXG4gIGlmIChpc0ZpcnN0ICYmICFjaGlsZC5sZW5ndGgpIHtcbiAgICBsaW5rLmNhbGwodGhpcylcbiAgICByZXR1cm5cbiAgfVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IG5vZGUgPSBjaGlsZFtpXVxuICAgIGlmICghIW5vZGUuY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICBjaXJjbGVFbGVtZW50LmNhbGwodGhpcywgbm9kZSwgZmFsc2UpXG4gICAgICB0aGlzLl91bmNvbXBpbGVOb2Rlcy5wdXNoKG5vZGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3VuY29tcGlsZU5vZGVzLnB1c2gobm9kZSlcbiAgICAgIHRoaXMuX3VuY29tcGlsZU5vZGVzLmZvckVhY2godmFsdWUgPT4ge1xuICAgICAgICBjb21waWxlTm9kZS5jYWxsKHRoaXMsIHZhbHVlKVxuICAgICAgfSlcbiAgICAgIHRoaXMuX3VuY29tcGlsZU5vZGVzID0gW11cbiAgICB9XG4gIH1cbiAgaWYgKHRoaXMuX2VsLmxhc3RFbGVtZW50Q2hpbGQgPT09IGNoaWxkW2NoaWxkLmxlbmd0aCAtIDFdKSB7XG4gICAgbGluay5jYWxsKHRoaXMpXG4gIH1cbn1cblxuY29uc3QgY29tcGlsZU5vZGUgPSBmdW5jdGlvbiAobm9kZSkge1xuICBsZXQgbWF0Y2hFeHByZXNzID0gL3NqZi0uKz1cXFwiLitcXFwifFxce1xcey4rXFx9XFx9L1xuICBpZiAobWF0Y2hFeHByZXNzLnRlc3Qobm9kZS5vdXRlckhUTUwgfHwgbm9kZS5pbm5lclRleHQpKSB7XG4gICAgbGV0IGRpcmVjdGl2ZXMgPSBtYXRjaEV4cHJlc3MuZXhlYyhub2RlLm91dGVySFRNTCB8fCBub2RlLmlubmVyVGV4dClcbiAgICBkaXJlY3RpdmVzLmZvckVhY2goKHZhbHVlKSA9PiB7XG4gICAgICBsZXQgc2xpY2VzID0gdmFsdWUuc3BsaXQoJz0nKVxuICAgICAgaWYgKG9wdGlvbi5zamZFdmVudHMuaW5kZXhPZihzbGljZXNbMF0pID49IDApIHtcbiAgICAgICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoc2xpY2VzWzBdKVxuICAgICAgICBsZXQgZXZlbnRUeXBlID0gdXRpbC5yZW1vdmVQcmVmaXgoc2xpY2VzWzBdKVxuICAgICAgICBsZXQgZXZlbnRGdW5jID0gdGhpc1snXycgKyB1dGlsLnJlbW92ZUJyYWNrZXRzKHNsaWNlc1sxXSldXG4gICAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGV2ZW50RnVuYywgZmFsc2UpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoL1xce1xcey4rXFx9XFx9Ly50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKG5vZGUub3V0ZXJIVE1MKVxuICAgICAgICAgIG5vZGUub3V0ZXJIVE1MID0gbm9kZS5vdXRlckhUTUwucmVwbGFjZShtYXRjaEV4cHJlc3MsIFwiXCIpXG4gICAgICAgICAgc2xpY2VzWzBdID0gc2xpY2VzWzBdLnJlcGxhY2UoL1tcXHtcXH1dL2csIFwiXCIpXG4gICAgICAgICAgdGhpcy5fdW5saW5rTm9kZXMucHVzaCh7bm9kZTogbm9kZSwgZGlyZWN0aXZlOiAnc2pmLXRleHQnLCBleHByZXNzaW9uOiBzbGljZXNbMF19KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKHNsaWNlc1swXSlcbiAgICAgICAgICBzbGljZXNbMV0gPSBzbGljZXNbMV0ucmVwbGFjZSgvXFxcIi9nLCBcIlwiKVxuICAgICAgICAgIHRoaXMuX3VubGlua05vZGVzLnB1c2goe25vZGU6IG5vZGUsIGRpcmVjdGl2ZTogc2xpY2VzWzBdLCBleHByZXNzaW9uOiBzbGljZXNbMV19KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuXG4vLyBjb21waWxlIHRoZSBzamZcbmNvbnN0IGNvbXBpbGUgPSBmdW5jdGlvbiAoKSB7XG4gIGNpcmNsZUVsZW1lbnQuYmluZCh0aGlzKSh0aGlzLl9lbCwgdHJ1ZSlcbn1cblxuY29uc3QgbGlua1JlbmRlciA9IHtcbiAgJ3NqZi1pZic6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhbHVlLm5vZGUuc3R5bGUuZGlzcGxheSA9ICghISh2YWx1ZS5leHByZXNzaW9uKSA/ICdibG9jayFpbXBvcnRhbnQnIDogJ25vbmUhaW1wb3J0YW50JylcbiAgfSxcbiAgJ3NqZi1zaG93JzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFsdWUubm9kZS5zdHlsZS5kaXNwbGF5ID0gKCEhKHZhbHVlLmV4cHJlc3Npb24pID8gJ2Jsb2NrIWltcG9ydGFudCcgOiAnbm9uZSFpbXBvcnRhbnQnKVxuICB9LFxuICAnc2pmLWZvcic6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGxldCBleHByZXNzaW9uU2xpY2VzID0gdmFsdWUuZXhwcmVzc2lvbi5zcGxpdCgvXFxzKy8pXG4gICAgaWYgKHR5cGVvZiBleHByZXNzaW9uU2xpY2VzWzJdICE9PSAnbnVtYmVyJyAmJiB0aGlzLl9kYXRhLmhhc093blByb3BlcnR5KGV4cHJlc3Npb25TbGljZXNbMl0pKSB7XG4gICAgICB0aGlzLl93YXRjaGVycy5wdXNoKHRoaXMuX2RhdGFbZXhwcmVzc2lvblNsaWNlc1syXV0pXG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fZGF0YVtleHByZXNzaW9uU2xpY2VzWzJdXS5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IGNsb25lZE5vZGUgPSB2YWx1ZS5ub2RlLmNsb25lTm9kZSh0cnVlKVxuICAgICAgdmFsdWUubm9kZS5wYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShjbG9uZWROb2RlLCB2YWx1ZS5ub2RlKVxuICAgIH1cbiAgfSxcbiAgJ3NqZi10ZXh0JzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdGhpcy5pbm5lclRleHQgPSB0aGlzLl9kYXRhW3ZhbHVlLmV4cHJlc3Npb25dXG4gIH1cbn1cblxuY29uc3QgbGluayA9IGZ1bmN0aW9uICgpIHtcbiAgbGV0IHNlbGYgPSB0aGlzXG4gIGlmICghIXNlbGYuX3VubGlua05vZGVzLmxlbmd0aCkge1xuICAgIGxldCBleGVjdXRlUXVldWUgPSB1dGlsLnNvcnRFeGV4dXRlUXVldWUoJ2RpcmVjdGl2ZScsIHNlbGYuX3VubGlua05vZGVzKVxuICAgIGV4ZWN1dGVRdWV1ZS5mb3JFYWNoKHZhbHVlID0+IHtcbiAgICAgIGxpbmtSZW5kZXJbdmFsdWUuZGlyZWN0aXZlXS5iaW5kKHNlbGYpKHZhbHVlKVxuICAgIH0pXG4gIH1cbiAgY29uc29sZS5sb2codGhpcylcbn1cblxuZnVuY3Rpb24gU2pmRGF0YUJpbmQgKHBhcmFtKSB7XG4gIGlmICghcGFyYW0uaGFzT3duUHJvcGVydHkoJ2VsJykgfHwgIXBhcmFtLmhhc093blByb3BlcnR5KCdkYXRhJykpIHtcbiAgICBjb25zb2xlLmVycm9yKCdzamZbZXJyb3JdOiBUaGVyZSBpcyBuZWVkIGBkYXRhYCBhbmQgYGVsYCBhdHRyaWJ1dGUnKVxuICAgIHJldHVyblxuICB9XG4gIHRoaXMuX2VsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihwYXJhbS5lbClcbiAgdGhpcy5fZGF0YSA9IHBhcmFtLmRhdGFcbiAgdGhpcy5fd2F0Y2hlcnMgPSBbXVxuICB0aGlzLl91bmNvbXBpbGVOb2RlcyA9IFtdXG4gIHRoaXMuX3VubGlua05vZGVzID0gW11cbiAgZm9yICh2YXIgbWV0aG9kIGluIHBhcmFtLm1ldGhvZHMpIHtcbiAgICB0aGlzWydfJyArIG1ldGhvZF0gPSBwYXJhbS5tZXRob2RzW21ldGhvZF0uYmluZCh0aGlzKVxuICB9XG4gIGNvbXBpbGUuY2FsbCh0aGlzKVxufVxuXG5leHBvcnQgZGVmYXVsdCBTamZEYXRhQmluZCIsImltcG9ydCBvcHRpb24gZnJvbSAnLi9vcHRpb24nXG5cbmNvbnN0IHV0aWwgPSB7XG4gIC8vIGp1ZGdlIHRoZSB0eXBlIG9mIG9ialxuICBqdWRnZVR5cGUgKG9iaikge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKVxuICB9LFxuICAvLyByZW1vdmUgdGhlIHByZWZpeCBvZiBzamYtXG4gIHJlbW92ZVByZWZpeCAoc3RyKSB7XG4gICAgcmV0dXJuIHN0ciA9IHN0ci5yZXBsYWNlKC9zamYtLywgJycpXG4gIH0sXG4gIC8vIHJlbW92ZSB0aGUgYnJhY2tldHMgKClcbiAgcmVtb3ZlQnJhY2tldHMgKHN0cikge1xuICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9cXFwiL2csICcnKVxuICAgIHJldHVybiBzdHIgPSBzdHIucmVwbGFjZSgvXFwoXFwpLywgJycpXG4gIH0sXG4gIHNvcnRFeGV4dXRlUXVldWUgKHByb3BlcnR5LCBvYmpBcnIpIHtcbiAgICByZXR1cm4gb2JqQXJyLnNvcnQoKG9iajEsIG9iajIpID0+IHtcbiAgICAgIGxldCB2YWwxID0gb3B0aW9uLnByaW9yaXR5W29iajFbcHJvcGVydHldXVxuICAgICAgbGV0IHZhbDIgPSBvcHRpb24ucHJpb3JpdHlbb2JqMltwcm9wZXJ0eV1dXG4gICAgICByZXR1cm4gdmFsMiAtIHZhbDFcbiAgICB9KVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbFxuIl19
var _r=_m(2);_g.Sjf=_g.SjfDataBind=_r;return _r;})})(typeof window!=='undefined'?window:(typeof global!=='undefined'?global:(typeof self!=='undefined'?self:this)));