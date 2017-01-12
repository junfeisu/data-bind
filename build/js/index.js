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
  var _this = this;

  var child = parent.children;
  // 如果是第一次遍历并且没有子节点就直接跳过compile
  if (isFirst && !child.length) {
    link.bind(this)();
    return;
  }
  for (var i = 0; i < child.length; i++) {
    var node = child[i];
    if (!!node.children.length) {
      circleElement.bind(this)(node, false);
      this._uncompileNodes.push(node);
    } else {
      this._uncompileNodes.push(node);
      this._uncompileNodes.forEach(function (value) {
        compileNode.bind(_this)(value);
      });
      this._uncompileNodes = [];
    }
  }
  // 如果当前节点是这个Sjf实例的根节点的最后一个子节点就跳出递归
  if (this._el.lastElementChild === child[child.length - 1]) {
    link.bind(this)();
  }
};

// 对具有sjf-的进行初步解析
var compileNode = function compileNode(node) {
  var _this2 = this;

  var matchExpress = /sjf-.+=\".+\"|\{\{.+\}\}/;
  if (matchExpress.test(node.outerHTML || node.innerText)) {
    var directives = matchExpress.exec(node.outerHTML || node.innerText);
    directives.forEach(function (value) {
      var slices = value.split('=');
      // 如果是事件就直接通过addEventListener进行绑定
      if (_option2.default.sjfEvents.indexOf(slices[0]) >= 0) {
        node.removeAttribute(slices[0]);
        var eventType = _utils2.default.removePrefix(slices[0]);
        var eventFunc = _this2['_' + _utils2.default.removeBrackets(slices[1])];
        node.addEventListener(eventType, eventFunc, false);
      } else {
        // 对{{}}这种表达式进行单独处理
        if (/\{\{.+\}\}/.test(value)) {
          node.outerHTML = node.outerHTML.replace(matchExpress, '');
          slices[0] = slices[0].replace(/[\{\}]/g, '');
          _this2._unlinkNodes.push({ node: node, directive: 'sjf-text', expression: slices[0] });
        } else {
          node.removeAttribute(slices[0]);
          slices[1] = slices[1].replace(/\"/g, '');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2UvamF2YXNjcmlwdC9vcHRpb24uanMiLCJzb3VyY2UvamF2YXNjcmlwdC9zamZEYXRhQmluZC5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUNBQSxJQUFNLFNBQVM7QUFDYixZQUFVO0FBQ1IsY0FBVSxJQURGO0FBRVIsZ0JBQVksSUFGSjtBQUdSLGVBQVcsSUFISDtBQUlSLGlCQUFhLEVBSkw7QUFLUixnQkFBWTtBQUxKLEdBREc7QUFRYixhQUFXLENBQ1QsV0FEUyxFQUVULGVBRlMsRUFHVCxjQUhTLEVBSVQsZUFKUyxFQUtULGdCQUxTLEVBTVQsZ0JBTlMsRUFPVCxlQVBTLEVBUVQsYUFSUztBQVJFLENBQWY7O2tCQW9CZSxNOzs7Ozs7Ozs7QUNwQmY7Ozs7QUFDQTs7Ozs7O0FBRUE7QUFDQSxJQUFNLGdCQUFnQixTQUFoQixhQUFnQixDQUFVLE1BQVYsRUFBa0IsT0FBbEIsRUFBMkI7QUFBQTs7QUFDL0MsTUFBSSxRQUFRLE9BQU8sUUFBbkI7QUFDQTtBQUNBLE1BQUksV0FBVyxDQUFDLE1BQU0sTUFBdEIsRUFBOEI7QUFDNUIsU0FBSyxJQUFMLENBQVUsSUFBVjtBQUNBO0FBQ0Q7QUFDRCxPQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksTUFBTSxNQUExQixFQUFrQyxHQUFsQyxFQUF1QztBQUNyQyxRQUFJLE9BQU8sTUFBTSxDQUFOLENBQVg7QUFDQSxRQUFJLENBQUMsQ0FBQyxLQUFLLFFBQUwsQ0FBYyxNQUFwQixFQUE0QjtBQUMxQixvQkFBYyxJQUFkLENBQW1CLElBQW5CLEVBQXlCLElBQXpCLEVBQStCLEtBQS9CO0FBQ0EsV0FBSyxlQUFMLENBQXFCLElBQXJCLENBQTBCLElBQTFCO0FBQ0QsS0FIRCxNQUdPO0FBQ0wsV0FBSyxlQUFMLENBQXFCLElBQXJCLENBQTBCLElBQTFC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LENBQVksVUFBQyxJQUFELEVBQU8sSUFBUCxFQUFnQjtBQUNqQyxVQUFJLE9BQU8saUJBQU8sUUFBUCxDQUFnQixLQUFLLFFBQUwsQ0FBaEIsQ0FBWDtBQUNBLFVBQUksT0FBTyxpQkFBTyxRQUFQLENBQWdCLEtBQUssUUFBTCxDQUFoQixDQUFYO0FBQ0EsYUFBTyxPQUFPLElBQWQ7QUFDRCxLQUpNLENBQVA7QUFLRDtBQXBCVSxDQUFiOztrQkF1QmUsSSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjb25zdCBvcHRpb24gPSB7XG4gIHByaW9yaXR5OiB7XG4gICAgJ3NqZi1pZic6IDIwMDAsXG4gICAgJ3NqZi1zaG93JzogMjAwMCxcbiAgICAnc2pmLWZvcic6IDEwMDAsXG4gICAgJ3NqZi1tb2RlbCc6IDEwLFxuICAgICdzamYtdGV4dCc6IDFcbiAgfSxcbiAgc2pmRXZlbnRzOiBbXG4gICAgJ3NqZi1jbGljaycsIFxuICAgICdzamYtbW91c2VvdmVyJywgXG4gICAgJ3NqZi1tb3VzZW91dCcsIFxuICAgICdzamYtbW91c2Vtb3ZlJywgXG4gICAgJ3NqZi1tb3VzZWVudGVyJyxcbiAgICAnc2pmLW1vdXNlbGVhdmUnLFxuICAgICdzamYtbW91c2Vkb3duJyxcbiAgICAnc2pmLW1vdXNldXAnXG4gIF1cbn1cblxuZXhwb3J0IGRlZmF1bHQgb3B0aW9uXG4iLCJpbXBvcnQgdXRpbCBmcm9tICcuL3V0aWxzJ1xuaW1wb3J0IG9wdGlvbiBmcm9tICcuL29wdGlvbidcblxuLy8g6YCS5b2SRE9N5qCRXG5jb25zdCBjaXJjbGVFbGVtZW50ID0gZnVuY3Rpb24gKHBhcmVudCwgaXNGaXJzdCkge1xuICBsZXQgY2hpbGQgPSBwYXJlbnQuY2hpbGRyZW5cbiAgLy8g5aaC5p6c5piv56ys5LiA5qyh6YGN5Y6G5bm25LiU5rKh5pyJ5a2Q6IqC54K55bCx55u05o6l6Lez6L+HY29tcGlsZVxuICBpZiAoaXNGaXJzdCAmJiAhY2hpbGQubGVuZ3RoKSB7XG4gICAgbGluay5iaW5kKHRoaXMpKClcbiAgICByZXR1cm5cbiAgfVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IG5vZGUgPSBjaGlsZFtpXVxuICAgIGlmICghIW5vZGUuY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICBjaXJjbGVFbGVtZW50LmJpbmQodGhpcykobm9kZSwgZmFsc2UpXG4gICAgICB0aGlzLl91bmNvbXBpbGVOb2Rlcy5wdXNoKG5vZGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3VuY29tcGlsZU5vZGVzLnB1c2gobm9kZSlcbiAgICAgIHRoaXMuX3VuY29tcGlsZU5vZGVzLmZvckVhY2godmFsdWUgPT4ge1xuICAgICAgICBjb21waWxlTm9kZS5iaW5kKHRoaXMpKHZhbHVlKVxuICAgICAgfSlcbiAgICAgIHRoaXMuX3VuY29tcGlsZU5vZGVzID0gW11cbiAgICB9XG4gIH1cbiAgLy8g5aaC5p6c5b2T5YmN6IqC54K55piv6L+Z5LiqU2pm5a6e5L6L55qE5qC56IqC54K555qE5pyA5ZCO5LiA5Liq5a2Q6IqC54K55bCx6Lez5Ye66YCS5b2SXG4gIGlmICh0aGlzLl9lbC5sYXN0RWxlbWVudENoaWxkID09PSBjaGlsZFtjaGlsZC5sZW5ndGggLSAxXSkge1xuICAgIGxpbmsuYmluZCh0aGlzKSgpXG4gIH1cbn1cblxuLy8g5a+55YW35pyJc2pmLeeahOi/m+ihjOWIneatpeino+aekFxuY29uc3QgY29tcGlsZU5vZGUgPSBmdW5jdGlvbiAobm9kZSkge1xuICBsZXQgbWF0Y2hFeHByZXNzID0gL3NqZi0uKz1cXFwiLitcXFwifFxce1xcey4rXFx9XFx9L1xuICBpZiAobWF0Y2hFeHByZXNzLnRlc3Qobm9kZS5vdXRlckhUTUwgfHwgbm9kZS5pbm5lclRleHQpKSB7XG4gICAgbGV0IGRpcmVjdGl2ZXMgPSBtYXRjaEV4cHJlc3MuZXhlYyhub2RlLm91dGVySFRNTCB8fCBub2RlLmlubmVyVGV4dClcbiAgICBkaXJlY3RpdmVzLmZvckVhY2goKHZhbHVlKSA9PiB7XG4gICAgICBsZXQgc2xpY2VzID0gdmFsdWUuc3BsaXQoJz0nKVxuICAgICAgLy8g5aaC5p6c5piv5LqL5Lu25bCx55u05o6l6YCa6L+HYWRkRXZlbnRMaXN0ZW5lcui/m+ihjOe7keWumlxuICAgICAgaWYgKG9wdGlvbi5zamZFdmVudHMuaW5kZXhPZihzbGljZXNbMF0pID49IDApIHtcbiAgICAgICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoc2xpY2VzWzBdKVxuICAgICAgICBsZXQgZXZlbnRUeXBlID0gdXRpbC5yZW1vdmVQcmVmaXgoc2xpY2VzWzBdKVxuICAgICAgICBsZXQgZXZlbnRGdW5jID0gdGhpc1snXycgKyB1dGlsLnJlbW92ZUJyYWNrZXRzKHNsaWNlc1sxXSldXG4gICAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGV2ZW50RnVuYywgZmFsc2UpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyDlr7l7e3196L+Z56eN6KGo6L6+5byP6L+b6KGM5Y2V54us5aSE55CGXG4gICAgICAgIGlmICgvXFx7XFx7LitcXH1cXH0vLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgbm9kZS5vdXRlckhUTUwgPSBub2RlLm91dGVySFRNTC5yZXBsYWNlKG1hdGNoRXhwcmVzcywgJycpXG4gICAgICAgICAgc2xpY2VzWzBdID0gc2xpY2VzWzBdLnJlcGxhY2UoL1tcXHtcXH1dL2csICcnKVxuICAgICAgICAgIHRoaXMuX3VubGlua05vZGVzLnB1c2goe25vZGU6IG5vZGUsIGRpcmVjdGl2ZTogJ3NqZi10ZXh0JywgZXhwcmVzc2lvbjogc2xpY2VzWzBdfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZShzbGljZXNbMF0pXG4gICAgICAgICAgc2xpY2VzWzFdID0gc2xpY2VzWzFdLnJlcGxhY2UoL1xcXCIvZywgJycpXG4gICAgICAgICAgdGhpcy5fdW5saW5rTm9kZXMucHVzaCh7bm9kZTogbm9kZSwgZGlyZWN0aXZlOiBzbGljZXNbMF0sIGV4cHJlc3Npb246IHNsaWNlc1sxXX0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5cbi8vIGNvbXBpbGUgdGhlIHNqZlxuY29uc3QgY29tcGlsZSA9IGZ1bmN0aW9uICgpIHtcbiAgY2lyY2xlRWxlbWVudC5iaW5kKHRoaXMpKHRoaXMuX2VsLCB0cnVlKVxufVxuXG5jb25zdCBsaW5rUmVuZGVyID0ge1xuICAnc2pmLWlmJzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFsdWUubm9kZS5zdHlsZS5kaXNwbGF5ID0gKCEhKHZhbHVlLmV4cHJlc3Npb24pID8gJ2Jsb2NrIWltcG9ydGFudCcgOiAnbm9uZSFpbXBvcnRhbnQnKVxuICB9LFxuICAnc2pmLXNob3cnOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YWx1ZS5ub2RlLnN0eWxlLmRpc3BsYXkgPSAoISEodmFsdWUuZXhwcmVzc2lvbikgPyAnYmxvY2shaW1wb3J0YW50JyA6ICdub25lIWltcG9ydGFudCcpXG4gIH0sXG4gICdzamYtZm9yJzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgLy8g5bCG6KGo6L6+5byP6YCa6L+H56m65qC8KOS4jemZkOepuuagvOaVsOebrinnu5nliIflvIBcbiAgICBsZXQgZXhwcmVzc2lvblNsaWNlcyA9IHZhbHVlLmV4cHJlc3Npb24uc3BsaXQoL1xccysvKVxuICAgIGlmICh0eXBlb2YgZXhwcmVzc2lvblNsaWNlc1syXSAhPT0gJ251bWJlcicgJiYgdGhpcy5fZGF0YS5oYXNPd25Qcm9wZXJ0eShleHByZXNzaW9uU2xpY2VzWzJdKSkge1xuICAgICAgdGhpcy5fd2F0Y2hlcnMucHVzaCh0aGlzLl9kYXRhW2V4cHJlc3Npb25TbGljZXNbMl1dKVxuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2RhdGFbZXhwcmVzc2lvblNsaWNlc1syXV0ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBjbG9uZWROb2RlID0gdmFsdWUubm9kZS5jbG9uZU5vZGUodHJ1ZSlcbiAgICAgIHZhbHVlLm5vZGUucGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUoY2xvbmVkTm9kZSwgdmFsdWUubm9kZSlcbiAgICB9XG4gIH0sXG4gICdzamYtdGV4dCc6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHRoaXMuaW5uZXJUZXh0ID0gdGhpcy5fZGF0YVt2YWx1ZS5leHByZXNzaW9uXVxuICB9XG59XG5cbmNvbnN0IGxpbmsgPSBmdW5jdGlvbiAoKSB7XG4gIGxldCBzZWxmID0gdGhpc1xuICBpZiAoISFzZWxmLl91bmxpbmtOb2Rlcy5sZW5ndGgpIHtcbiAgICBsZXQgZXhlY3V0ZVF1ZXVlID0gdXRpbC5zb3J0RXhleHV0ZVF1ZXVlKCdkaXJlY3RpdmUnLCBzZWxmLl91bmxpbmtOb2RlcylcbiAgICBleGVjdXRlUXVldWUuZm9yRWFjaCh2YWx1ZSA9PiB7XG4gICAgICBsaW5rUmVuZGVyW3ZhbHVlLmRpcmVjdGl2ZV0uYmluZChzZWxmKSh2YWx1ZSlcbiAgICB9KVxuICB9XG4gIGNvbnNvbGUubG9nKHRoaXMpXG59XG5cbmZ1bmN0aW9uIFNqZkRhdGFCaW5kIChwYXJhbSkge1xuICBpZiAoIXBhcmFtLmhhc093blByb3BlcnR5KCdlbCcpIHx8ICFwYXJhbS5oYXNPd25Qcm9wZXJ0eSgnZGF0YScpKSB7XG4gICAgY29uc29sZS5lcnJvcignc2pmW2Vycm9yXTogVGhlcmUgaXMgbmVlZCBgZGF0YWAgYW5kIGBlbGAgYXR0cmlidXRlJylcbiAgICByZXR1cm5cbiAgfVxuICB0aGlzLl9lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocGFyYW0uZWwpXG4gIHRoaXMuX2RhdGEgPSBwYXJhbS5kYXRhXG4gIHRoaXMuX3dhdGNoZXJzID0gW11cbiAgdGhpcy5fdW5jb21waWxlTm9kZXMgPSBbXVxuICB0aGlzLl91bmxpbmtOb2RlcyA9IFtdXG4gIGZvciAodmFyIG1ldGhvZCBpbiBwYXJhbS5tZXRob2RzKSB7XG4gICAgLy8g5by65Yi25bCG5a6a5LmJ5ZyobWV0aG9kc+S4iueahOaWueazleebtOaOpee7keWumuWcqFNqZkRhdGFCaW5k5LiK77yM5bm25L+u5pS56L+Z5Lqb5pa55rOV55qEdGhpc+aMh+WQkeS4ulNqZkRhdGFCaW5kXG4gICAgdGhpc1snXycgKyBtZXRob2RdID0gcGFyYW0ubWV0aG9kc1ttZXRob2RdLmJpbmQodGhpcylcbiAgfVxuICBjb21waWxlLmJpbmQodGhpcykoKVxufVxuXG5leHBvcnQgZGVmYXVsdCBTamZEYXRhQmluZFxuIiwiaW1wb3J0IG9wdGlvbiBmcm9tICcuL29wdGlvbidcblxuY29uc3QgdXRpbCA9IHtcbiAgLy8ganVkZ2UgdGhlIHR5cGUgb2Ygb2JqXG4gIGp1ZGdlVHlwZSAob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopXG4gIH0sXG4gIC8vIHJlbW92ZSB0aGUgcHJlZml4IG9mIHNqZi1cbiAgcmVtb3ZlUHJlZml4IChzdHIpIHtcbiAgICByZXR1cm4gc3RyID0gc3RyLnJlcGxhY2UoL3NqZi0vLCAnJylcbiAgfSxcbiAgLy8gcmVtb3ZlIHRoZSBicmFja2V0cyAoKVxuICByZW1vdmVCcmFja2V0cyAoc3RyKSB7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UoL1xcXCIvZywgJycpXG4gICAgcmV0dXJuIHN0ciA9IHN0ci5yZXBsYWNlKC9cXChcXCkvLCAnJylcbiAgfSxcbiAgc29ydEV4ZXh1dGVRdWV1ZSAocHJvcGVydHksIG9iakFycikge1xuICAgIHJldHVybiBvYmpBcnIuc29ydCgob2JqMSwgb2JqMikgPT4ge1xuICAgICAgbGV0IHZhbDEgPSBvcHRpb24ucHJpb3JpdHlbb2JqMVtwcm9wZXJ0eV1dXG4gICAgICBsZXQgdmFsMiA9IG9wdGlvbi5wcmlvcml0eVtvYmoyW3Byb3BlcnR5XV1cbiAgICAgIHJldHVybiB2YWwyIC0gdmFsMVxuICAgIH0pXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgdXRpbFxuIl19
var _r=_m(2);_g.Sjf=_g.SjfDataBind=_r;return _r;})})(typeof window!=='undefined'?window:(typeof global!=='undefined'?global:(typeof self!=='undefined'?self:this)));