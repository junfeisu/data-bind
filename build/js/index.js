(function(_g){(function(f){if(typeof exports==='object'&&typeof module!=='undefined'){module.exports=f()}else if(typeof define==='function'&&define.amd){define([],f.bind(_g))}else{f()}})(function(define,module,exports){var _m =(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
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

exports.default = option;

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

// 递归DOM树
var circleElement = function circleElement(parent, isFirst) {
  var child = parent.children;
  var self = this;
  // 如果是第一次遍历并且没有子节点就直接跳过compile
  if (isFirst && !child.length) {
    link.bind(this)();
    return;
  }

  Array.prototype.forEach.call(child, function (node) {
    if (!!node.children.length) {
      circleElement.bind(self)(node, false);
      self._uncompileNodes.push(node);
    } else {
      self._uncompileNodes.push(node);
      self._uncompileNodes.forEach(function (value) {
        compileNode.bind(self)(value);
      });
      self._uncompileNodes = [];
    }
  });
  // 如果当前节点是这个Sjf实例的根节点的最后一个子节点就跳出递归
  if (this._el.lastElementChild === child[child.length - 1]) {
    link.bind(this)();
  }
};

// 对具有sjf-的进行初步解析
var compileNode = function compileNode(node) {
  var _this = this;

  var matchExpress = /sjf-.+=\".+\"|\{\{.+\}\}/;
  if (matchExpress.test(node.outerHTML || node.innerText)) {
    var directives = matchExpress.exec(node.outerHTML || node.innerText);
    directives.forEach(function (value) {
      var slices = value.split('=');
      // 如果是事件就直接通过addEventListener进行绑定
      if (_option2.default.sjfEvents.indexOf(slices[0]) >= 0) {
        node.removeAttribute(slices[0]);
        var eventType = _utils2.default.removePrefix(slices[0]);
        var eventFunc = _this['_' + _utils2.default.removeBrackets(slices[1])];
        node.addEventListener(eventType, eventFunc, false);
      } else {
        // 对{{}}这种表达式进行单独处理
        if (/\{\{.+\}\}/.test(value)) {
          // node.outerHTML = node.outerHTML.replace(matchExpress, '')
          var expression = slices[0].replace(/[\{\}]/g, '');
          _this._unlinkNodes.push({ node: node, directive: 'sjf-text', expression: expression });
        } else {
          // node.removeAttribute(slices[0])
          slices[1] = slices[1].replace(/\"/g, '');
          _this._unlinkNodes.push({ node: node, directive: slices[0], expression: slices[1] });
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
    // 将表达式通过空格(不限空格数目)给切开
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
    // 强制将定义在methods上的方法直接绑定在SjfDataBind上，并修改这些方法的this指向为SjfDataBind
    this['_' + method] = param.methods[method].bind(this);
  }
  compile.bind(this)();
}

exports.default = SjfDataBind;

},{"./option":1,"./utils":3}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

exports.default = util;

},{"./option":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2UvamF2YXNjcmlwdC9vcHRpb24uanMiLCJzb3VyY2UvamF2YXNjcmlwdC9zamZEYXRhQmluZC5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUNBQSxJQUFNLFNBQVM7QUFDYixZQUFVO0FBQ1IsY0FBVSxJQURGO0FBRVIsZ0JBQVksSUFGSjtBQUdSLGVBQVcsSUFISDtBQUlSLGlCQUFhLEVBSkw7QUFLUixnQkFBWTtBQUxKLEdBREc7QUFRYixhQUFXLENBQ1QsV0FEUyxFQUVULGVBRlMsRUFHVCxjQUhTLEVBSVQsZUFKUyxFQUtULGdCQUxTLEVBTVQsZ0JBTlMsRUFPVCxlQVBTLEVBUVQsYUFSUztBQVJFLENBQWY7O2tCQW9CZSxNOzs7Ozs7Ozs7QUNwQmY7Ozs7QUFDQTs7Ozs7O0FBRUE7QUFDQSxJQUFNLGdCQUFnQixTQUFoQixhQUFnQixDQUFVLE1BQVYsRUFBa0IsT0FBbEIsRUFBMkI7QUFDL0MsTUFBSSxRQUFRLE9BQU8sUUFBbkI7QUFDQSxNQUFJLE9BQU8sSUFBWDtBQUNBO0FBQ0EsTUFBSSxXQUFXLENBQUMsTUFBTSxNQUF0QixFQUE4QjtBQUM1QixTQUFLLElBQUwsQ0FBVSxJQUFWO0FBQ0E7QUFDRDs7QUFFRCxRQUFNLFNBQU4sQ0FBZ0IsT0FBaEIsQ0FBd0IsSUFBeEIsQ0FBNkIsS0FBN0IsRUFBb0MsZ0JBQVE7QUFDMUMsUUFBSSxDQUFDLENBQUMsS0FBSyxRQUFMLENBQWMsTUFBcEIsRUFBNEI7QUFDMUIsb0JBQWMsSUFBZCxDQUFtQixJQUFuQixFQUF5QixJQUF6QixFQUErQixLQUEvQjtBQUNBLFdBQUssZUFBTCxDQUFxQixJQUFyQixDQUEwQixJQUExQjtBQUNELEtBSEQsTUFHTztBQUNMLFdBQUssZUFBTCxDQUFxQixJQUFyQixDQUEwQixJQUExQjtBQUNBLFdBQUssZUFBTCxD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QUFnQixLQUFLLFFBQUwsQ0FBaEIsQ0FBWDtBQUNBLGFBQU8sT0FBTyxJQUFkO0FBQ0QsS0FKTSxDQUFQO0FBS0Q7QUFwQlUsQ0FBYjs7a0JBdUJlLEkiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY29uc3Qgb3B0aW9uID0ge1xuICBwcmlvcml0eToge1xuICAgICdzamYtaWYnOiAyMDAwLFxuICAgICdzamYtc2hvdyc6IDIwMDAsXG4gICAgJ3NqZi1mb3InOiAxMDAwLFxuICAgICdzamYtbW9kZWwnOiAxMCxcbiAgICAnc2pmLXRleHQnOiAxXG4gIH0sXG4gIHNqZkV2ZW50czogW1xuICAgICdzamYtY2xpY2snLCBcbiAgICAnc2pmLW1vdXNlb3ZlcicsIFxuICAgICdzamYtbW91c2VvdXQnLCBcbiAgICAnc2pmLW1vdXNlbW92ZScsIFxuICAgICdzamYtbW91c2VlbnRlcicsXG4gICAgJ3NqZi1tb3VzZWxlYXZlJyxcbiAgICAnc2pmLW1vdXNlZG93bicsXG4gICAgJ3NqZi1tb3VzZXVwJ1xuICBdXG59XG5cbmV4cG9ydCBkZWZhdWx0IG9wdGlvblxuIiwiaW1wb3J0IHV0aWwgZnJvbSAnLi91dGlscydcbmltcG9ydCBvcHRpb24gZnJvbSAnLi9vcHRpb24nXG5cbi8vIOmAkuW9kkRPTeagkVxuY29uc3QgY2lyY2xlRWxlbWVudCA9IGZ1bmN0aW9uIChwYXJlbnQsIGlzRmlyc3QpIHtcbiAgbGV0IGNoaWxkID0gcGFyZW50LmNoaWxkcmVuXG4gIGxldCBzZWxmID0gdGhpc1xuICAvLyDlpoLmnpzmmK/nrKzkuIDmrKHpgY3ljoblubbkuJTmsqHmnInlrZDoioLngrnlsLHnm7TmjqXot7Pov4djb21waWxlXG4gIGlmIChpc0ZpcnN0ICYmICFjaGlsZC5sZW5ndGgpIHtcbiAgICBsaW5rLmJpbmQodGhpcykoKVxuICAgIHJldHVyblxuICB9XG5cbiAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChjaGlsZCwgbm9kZSA9PiB7XG4gICAgaWYgKCEhbm9kZS5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgIGNpcmNsZUVsZW1lbnQuYmluZChzZWxmKShub2RlLCBmYWxzZSlcbiAgICAgIHNlbGYuX3VuY29tcGlsZU5vZGVzLnB1c2gobm9kZSlcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi5fdW5jb21waWxlTm9kZXMucHVzaChub2RlKVxuICAgICAgc2VsZi5fdW5jb21waWxlTm9kZXMuZm9yRWFjaCh2YWx1ZSA9PiB7XG4gICAgICAgIGNvbXBpbGVOb2RlLmJpbmQoc2VsZikodmFsdWUpXG4gICAgICB9KVxuICAgICAgc2VsZi5fdW5jb21waWxlTm9kZXMgPSBbXVxuICAgIH1cbiAgfSlcbiAgLy8g5aaC5p6c5b2T5YmN6IqC54K55piv6L+Z5LiqU2pm5a6e5L6L55qE5qC56IqC54K555qE5pyA5ZCO5LiA5Liq5a2Q6IqC54K55bCx6Lez5Ye66YCS5b2SXG4gIGlmICh0aGlzLl9lbC5sYXN0RWxlbWVudENoaWxkID09PSBjaGlsZFtjaGlsZC5sZW5ndGggLSAxXSkge1xuICAgIGxpbmsuYmluZCh0aGlzKSgpXG4gIH1cbn1cblxuLy8g5a+55YW35pyJc2pmLeeahOi/m+ihjOWIneatpeino+aekFxuY29uc3QgY29tcGlsZU5vZGUgPSBmdW5jdGlvbiAobm9kZSkge1xuICBsZXQgbWF0Y2hFeHByZXNzID0gL3NqZi0uKz1cXFwiLitcXFwifFxce1xcey4rXFx9XFx9L1xuICBpZiAobWF0Y2hFeHByZXNzLnRlc3Qobm9kZS5vdXRlckhUTUwgfHwgbm9kZS5pbm5lclRleHQpKSB7XG4gICAgbGV0IGRpcmVjdGl2ZXMgPSBtYXRjaEV4cHJlc3MuZXhlYyhub2RlLm91dGVySFRNTCB8fCBub2RlLmlubmVyVGV4dClcbiAgICBkaXJlY3RpdmVzLmZvckVhY2goKHZhbHVlKSA9PiB7XG4gICAgICBsZXQgc2xpY2VzID0gdmFsdWUuc3BsaXQoJz0nKVxuICAgICAgLy8g5aaC5p6c5piv5LqL5Lu25bCx55u05o6l6YCa6L+HYWRkRXZlbnRMaXN0ZW5lcui/m+ihjOe7keWumlxuICAgICAgaWYgKG9wdGlvbi5zamZFdmVudHMuaW5kZXhPZihzbGljZXNbMF0pID49IDApIHtcbiAgICAgICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoc2xpY2VzWzBdKVxuICAgICAgICBsZXQgZXZlbnRUeXBlID0gdXRpbC5yZW1vdmVQcmVmaXgoc2xpY2VzWzBdKVxuICAgICAgICBsZXQgZXZlbnRGdW5jID0gdGhpc1snXycgKyB1dGlsLnJlbW92ZUJyYWNrZXRzKHNsaWNlc1sxXSldXG4gICAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGV2ZW50RnVuYywgZmFsc2UpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyDlr7l7e3196L+Z56eN6KGo6L6+5byP6L+b6KGM5Y2V54us5aSE55CGXG4gICAgICAgIGlmICgvXFx7XFx7LitcXH1cXH0vLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgLy8gbm9kZS5vdXRlckhUTUwgPSBub2RlLm91dGVySFRNTC5yZXBsYWNlKG1hdGNoRXhwcmVzcywgJycpXG4gICAgICAgICAgbGV0IGV4cHJlc3Npb24gPSBzbGljZXNbMF0ucmVwbGFjZSgvW1xce1xcfV0vZywgJycpXG4gICAgICAgICAgdGhpcy5fdW5saW5rTm9kZXMucHVzaCh7bm9kZTogbm9kZSwgZGlyZWN0aXZlOiAnc2pmLXRleHQnLCBleHByZXNzaW9uOiBleHByZXNzaW9ufSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBub2RlLnJlbW92ZUF0dHJpYnV0ZShzbGljZXNbMF0pXG4gICAgICAgICAgc2xpY2VzWzFdID0gc2xpY2VzWzFdLnJlcGxhY2UoL1xcXCIvZywgJycpXG4gICAgICAgICAgdGhpcy5fdW5saW5rTm9kZXMucHVzaCh7bm9kZTogbm9kZSwgZGlyZWN0aXZlOiBzbGljZXNbMF0sIGV4cHJlc3Npb246IHNsaWNlc1sxXX0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5cbi8vIGNvbXBpbGUgdGhlIHNqZlxuY29uc3QgY29tcGlsZSA9IGZ1bmN0aW9uICgpIHtcbiAgY2lyY2xlRWxlbWVudC5iaW5kKHRoaXMpKHRoaXMuX2VsLCB0cnVlKVxufVxuXG5jb25zdCBsaW5rUmVuZGVyID0ge1xuICAnc2pmLWlmJzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFsdWUubm9kZS5zdHlsZS5kaXNwbGF5ID0gKCEhKHZhbHVlLmV4cHJlc3Npb24pID8gJ2Jsb2NrIWltcG9ydGFudCcgOiAnbm9uZSFpbXBvcnRhbnQnKVxuICB9LFxuICAnc2pmLXNob3cnOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YWx1ZS5ub2RlLnN0eWxlLmRpc3BsYXkgPSAoISEodmFsdWUuZXhwcmVzc2lvbikgPyAnYmxvY2shaW1wb3J0YW50JyA6ICdub25lIWltcG9ydGFudCcpXG4gIH0sXG4gICdzamYtZm9yJzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgLy8g5bCG6KGo6L6+5byP6YCa6L+H56m65qC8KOS4jemZkOepuuagvOaVsOebrinnu5nliIflvIBcbiAgICBsZXQgZXhwcmVzc2lvblNsaWNlcyA9IHZhbHVlLmV4cHJlc3Npb24uc3BsaXQoL1xccysvKVxuICAgIGlmICh0eXBlb2YgZXhwcmVzc2lvblNsaWNlc1syXSAhPT0gJ251bWJlcicgJiYgdGhpcy5fZGF0YS5oYXNPd25Qcm9wZXJ0eShleHByZXNzaW9uU2xpY2VzWzJdKSkge1xuICAgICAgdGhpcy5fd2F0Y2hlcnMucHVzaCh0aGlzLl9kYXRhW2V4cHJlc3Npb25TbGljZXNbMl1dKVxuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2RhdGFbZXhwcmVzc2lvblNsaWNlc1syXV0ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBjbG9uZWROb2RlID0gdmFsdWUubm9kZS5jbG9uZU5vZGUodHJ1ZSlcbiAgICAgIHZhbHVlLm5vZGUucGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUoY2xvbmVkTm9kZSwgdmFsdWUubm9kZSlcbiAgICB9XG4gIH0sXG4gICdzamYtdGV4dCc6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHRoaXMuaW5uZXJUZXh0ID0gdGhpcy5fZGF0YVt2YWx1ZS5leHByZXNzaW9uXVxuICB9XG59XG5cbmNvbnN0IGxpbmsgPSBmdW5jdGlvbiAoKSB7XG4gIGxldCBzZWxmID0gdGhpc1xuICBpZiAoISFzZWxmLl91bmxpbmtOb2Rlcy5sZW5ndGgpIHtcbiAgICBsZXQgZXhlY3V0ZVF1ZXVlID0gdXRpbC5zb3J0RXhleHV0ZVF1ZXVlKCdkaXJlY3RpdmUnLCBzZWxmLl91bmxpbmtOb2RlcylcbiAgICBleGVjdXRlUXVldWUuZm9yRWFjaCh2YWx1ZSA9PiB7XG4gICAgICBsaW5rUmVuZGVyW3ZhbHVlLmRpcmVjdGl2ZV0uYmluZChzZWxmKSh2YWx1ZSlcbiAgICB9KVxuICB9XG4gIGNvbnNvbGUubG9nKHRoaXMpXG59XG5cbmZ1bmN0aW9uIFNqZkRhdGFCaW5kIChwYXJhbSkge1xuICBpZiAoIXBhcmFtLmhhc093blByb3BlcnR5KCdlbCcpIHx8ICFwYXJhbS5oYXNPd25Qcm9wZXJ0eSgnZGF0YScpKSB7XG4gICAgY29uc29sZS5lcnJvcignc2pmW2Vycm9yXTogVGhlcmUgaXMgbmVlZCBgZGF0YWAgYW5kIGBlbGAgYXR0cmlidXRlJylcbiAgICByZXR1cm5cbiAgfVxuICB0aGlzLl9lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocGFyYW0uZWwpXG4gIHRoaXMuX2RhdGEgPSBwYXJhbS5kYXRhXG4gIHRoaXMuX3dhdGNoZXJzID0gW11cbiAgdGhpcy5fdW5jb21waWxlTm9kZXMgPSBbXVxuICB0aGlzLl91bmxpbmtOb2RlcyA9IFtdXG4gIGZvciAodmFyIG1ldGhvZCBpbiBwYXJhbS5tZXRob2RzKSB7XG4gICAgLy8g5by65Yi25bCG5a6a5LmJ5ZyobWV0aG9kc+S4iueahOaWueazleebtOaOpee7keWumuWcqFNqZkRhdGFCaW5k5LiK77yM5bm25L+u5pS56L+Z5Lqb5pa55rOV55qEdGhpc+aMh+WQkeS4ulNqZkRhdGFCaW5kXG4gICAgdGhpc1snXycgKyBtZXRob2RdID0gcGFyYW0ubWV0aG9kc1ttZXRob2RdLmJpbmQodGhpcylcbiAgfVxuICBjb21waWxlLmJpbmQodGhpcykoKVxufVxuXG5leHBvcnQgZGVmYXVsdCBTamZEYXRhQmluZFxuIiwiaW1wb3J0IG9wdGlvbiBmcm9tICcuL29wdGlvbidcblxuY29uc3QgdXRpbCA9IHtcbiAgLy8ganVkZ2UgdGhlIHR5cGUgb2Ygb2JqXG4gIGp1ZGdlVHlwZSAob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopXG4gIH0sXG4gIC8vIHJlbW92ZSB0aGUgcHJlZml4IG9mIHNqZi1cbiAgcmVtb3ZlUHJlZml4IChzdHIpIHtcbiAgICByZXR1cm4gc3RyID0gc3RyLnJlcGxhY2UoL3NqZi0vLCAnJylcbiAgfSxcbiAgLy8gcmVtb3ZlIHRoZSBicmFja2V0cyAoKVxuICByZW1vdmVCcmFja2V0cyAoc3RyKSB7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UoL1xcXCIvZywgJycpXG4gICAgcmV0dXJuIHN0ciA9IHN0ci5yZXBsYWNlKC9cXChcXCkvLCAnJylcbiAgfSxcbiAgc29ydEV4ZXh1dGVRdWV1ZSAocHJvcGVydHksIG9iakFycikge1xuICAgIHJldHVybiBvYmpBcnIuc29ydCgob2JqMSwgb2JqMikgPT4ge1xuICAgICAgbGV0IHZhbDEgPSBvcHRpb24ucHJpb3JpdHlbb2JqMVtwcm9wZXJ0eV1dXG4gICAgICBsZXQgdmFsMiA9IG9wdGlvbi5wcmlvcml0eVtvYmoyW3Byb3BlcnR5XV1cbiAgICAgIHJldHVybiB2YWwyIC0gdmFsMVxuICAgIH0pXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgdXRpbFxuIl19
var _r=_m(2);_g.Sjf=_g.SjfDataBind=_r;return _r;})})(typeof window!=='undefined'?window:(typeof global!=='undefined'?global:(typeof self!=='undefined'?self:this)));