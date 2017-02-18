(function(_g){(function(f){if(typeof exports==='object'&&typeof module!=='undefined'){module.exports=f()}else if(typeof define==='function'&&define.amd){define([],f.bind(_g))}else{f()}})(function(define,module,exports){var _m =(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _option = require('./option');

var _option2 = _interopRequireDefault(_option);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _link = require('./link');

var _link2 = _interopRequireDefault(_link);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var compile = function () {
  // 递归DOM树
  function compile(parent, isFirst, sjf) {
    _classCallCheck(this, compile);

    var child = parent.children;
    var self = this;
    // 如果是第一次遍历并且没有子节点就直接跳过compile
    if (isFirst && !child.length) {
      new _link2.default(sjf);
      return;
    }

    Array.prototype.forEach.call(child, function (node) {
      if (!!node.children.length) {
        self.constructor(node, false, sjf);
        sjf._uncompileNodes.push(node);
      } else {
        sjf._uncompileNodes.push(node);
        sjf._uncompileNodes.forEach(function (value) {
          self.compileNode(value, sjf);
        });
        sjf._uncompileNodes = [];
      }
    });
    // 如果当前节点是这个Sjf实例的根节点的最后一个子节点就跳出递归
    if (sjf._el.lastElementChild === child[child.length - 1]) {
      new _link2.default(sjf);
    }
  }

  // 对具有sjf-的进行初步解析


  _createClass(compile, [{
    key: 'compileNode',
    value: function compileNode(node, sjf) {
      var matchExpress = /sjf-.+=\".+\"|\{\{.+\}\}/;
      if (matchExpress.test(node.outerHTML || node.innerText)) {
        var directives = matchExpress.exec(node.outerHTML || node.innerText);
        directives.forEach(function (value) {
          var slices = value.split('=');
          // 如果是事件就直接通过addEventListener进行绑定
          if (_option2.default.sjfEvents.indexOf(slices[0]) >= 0) {
            node.removeAttribute(slices[0]);
            var eventType = _utils2.default.removePrefix(slices[0]);
            var eventFunc = sjf['_' + _utils2.default.removeBrackets(slices[1])];
            node.addEventListener(eventType, eventFunc, false);
          } else {
            // 对{{}}这种表达式进行单独处理
            if (/\{\{.+\}\}/.test(value)) {
              // node.outerHTML = node.outerHTML.replace(matchExpress, '')
              var expression = slices[0].replace(/[\{\}]/g, '');
              sjf._unlinkNodes.push({ node: node, directive: 'sjf-text', expression: expression });
            } else {
              // node.removeAttribute(slices[0])
              slices[1] = slices[1].replace(/\"/g, '');
              sjf._unlinkNodes.push({ node: node, directive: slices[0], expression: slices[1] });
            }
          }
        });
      }
    }
  }]);

  return compile;
}();

exports.default = compile;

},{"./link":2,"./option":3,"./utils":5}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
    if (!isNaN(expressionSlices[2]) && this._data.hasOwnProperty(expressionSlices[2])) {
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

var link = function link(sjfDataBind) {
  _classCallCheck(this, link);

  if (!!sjfDataBind._unlinkNodes.length) {
    var executeQueue = _utils2.default.sortExexuteQueue('directive', sjfDataBind._unlinkNodes);
    executeQueue.forEach(function (value) {
      linkRender[value.directive].bind(sjfDataBind)(value);
    });
  }
};

exports.default = link;

},{"./utils":5}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _compile = require('./compile');

var _compile2 = _interopRequireDefault(_compile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SjfDataBind = function SjfDataBind(param) {
  _classCallCheck(this, SjfDataBind);

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
  new _compile2.default(this._el, true, this);
};

exports.default = SjfDataBind;

},{"./compile":1}],5:[function(require,module,exports){
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

},{"./option":3}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2UvamF2YXNjcmlwdC9jb21waWxlLmpzIiwic291cmNlL2phdmFzY3JpcHQvbGluay5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L29wdGlvbi5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3NqZkRhdGFCaW5kLmpzIiwic291cmNlL2phdmFzY3JpcHQvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FDOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7SUFFTSxPO0FBQ0w7QUFDQSxtQkFBYSxNQUFiLEVBQXFCLE9BQXJCLEVBQThCLEdBQTlCLEVBQW1DO0FBQUE7O0FBQ2pDLFFBQUksUUFBUSxPQUFPLFFBQW5CO0FBQ0EsUUFBSSxPQUFPLElBQVg7QUFDQTtBQUNBLFFBQUksV0FBVyxDQUFDLE1BQU0sTUFBdEIsRUFBOEI7QUFDNUIseUJBQVMsR0FBVDtBQUNBO0FBQ0Q7O0FBRUQsVUFBTSxTQUFOLENBQWdCLE9BQWhCLENBQXdCLElBQXhCLENBQTZCLEtBQTdCLEVBQW9DLGdCQUFRO0FBQzFDLFVBQUksQ0FBQyxDQUFDLEtBQUssUUFBTCxDQUFjLE1BQXBCLEVBQTRCO0FBQzFCLGFBQUssV0FBTCxDQUFpQixJQUFqQixFQUF1QixLQUF2QixFQUE4QixHQUE5QjtBQUNBLFlBQUksZUFBSixDQUFvQixJQUFwQixDQUF5QixJQUF6QjtBQUNELE9BSEQsTUFHTztBQUNMLFlBQUksZUFBSixDQUFvQixJQUFwQixDQUF5QixJQUF6QjtBQUNBLFlBQUksZUFBSixDQUFvQixPQUFwQixDQUE0QixpQkFBUztBQUNuQyxlQUFLLFdBQUwsQ0FBaUIsS0FBakIsRUFBd0IsR0FBeEI7QUFDRCxTQUZEO0FBR0EsWUFBSSxlQUFKLEdBQXNCLEVBQXRCO0FBQ0Q7QUFDRixLQVhEO0FBWUE7QUFDQSxRQUFJLElBQUksR0FBSixDQUFRLGdCQUFSLEtBQTZCLE1BQU0sTUFB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LElBQWQ7QUFDRCxLQUpNLENBQVA7QUFLRDtBQXBCVSxDQUFiOztrQkF1QmUsSSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIgaW1wb3J0IG9wdGlvbiBmcm9tICcuL29wdGlvbidcbiBpbXBvcnQgdXRpbCBmcm9tICcuL3V0aWxzJ1xuIGltcG9ydCBsaW5rIGZyb20gJy4vbGluaydcblxuIGNsYXNzIGNvbXBpbGUge1xuICAvLyDpgJLlvZJET03moJFcbiAgY29uc3RydWN0b3IgKHBhcmVudCwgaXNGaXJzdCwgc2pmKSB7XG4gICAgbGV0IGNoaWxkID0gcGFyZW50LmNoaWxkcmVuXG4gICAgbGV0IHNlbGYgPSB0aGlzXG4gICAgLy8g5aaC5p6c5piv56ys5LiA5qyh6YGN5Y6G5bm25LiU5rKh5pyJ5a2Q6IqC54K55bCx55u05o6l6Lez6L+HY29tcGlsZVxuICAgIGlmIChpc0ZpcnN0ICYmICFjaGlsZC5sZW5ndGgpIHtcbiAgICAgIG5ldyBsaW5rKHNqZilcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoY2hpbGQsIG5vZGUgPT4ge1xuICAgICAgaWYgKCEhbm9kZS5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgc2VsZi5jb25zdHJ1Y3Rvcihub2RlLCBmYWxzZSwgc2pmKVxuICAgICAgICBzamYuX3VuY29tcGlsZU5vZGVzLnB1c2gobm9kZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNqZi5fdW5jb21waWxlTm9kZXMucHVzaChub2RlKVxuICAgICAgICBzamYuX3VuY29tcGlsZU5vZGVzLmZvckVhY2godmFsdWUgPT4ge1xuICAgICAgICAgIHNlbGYuY29tcGlsZU5vZGUodmFsdWUsIHNqZilcbiAgICAgICAgfSlcbiAgICAgICAgc2pmLl91bmNvbXBpbGVOb2RlcyA9IFtdXG4gICAgICB9XG4gICAgfSlcbiAgICAvLyDlpoLmnpzlvZPliY3oioLngrnmmK/ov5nkuKpTamblrp7kvovnmoTmoLnoioLngrnnmoTmnIDlkI7kuIDkuKrlrZDoioLngrnlsLHot7Plh7rpgJLlvZJcbiAgICBpZiAoc2pmLl9lbC5sYXN0RWxlbWVudENoaWxkID09PSBjaGlsZFtjaGlsZC5sZW5ndGggLSAxXSkge1xuICAgICAgbmV3IGxpbmsoc2pmKVxuICAgIH1cbiAgfVxuXG4gIC8vIOWvueWFt+aciXNqZi3nmoTov5vooYzliJ3mraXop6PmnpBcbiAgY29tcGlsZU5vZGUgKG5vZGUsIHNqZikge1xuICAgIGxldCBtYXRjaEV4cHJlc3MgPSAvc2pmLS4rPVxcXCIuK1xcXCJ8XFx7XFx7LitcXH1cXH0vXG4gICAgaWYgKG1hdGNoRXhwcmVzcy50ZXN0KG5vZGUub3V0ZXJIVE1MIHx8IG5vZGUuaW5uZXJUZXh0KSkge1xuICAgICAgbGV0IGRpcmVjdGl2ZXMgPSBtYXRjaEV4cHJlc3MuZXhlYyhub2RlLm91dGVySFRNTCB8fCBub2RlLmlubmVyVGV4dClcbiAgICAgIGRpcmVjdGl2ZXMuZm9yRWFjaCgodmFsdWUpID0+IHtcbiAgICAgICAgbGV0IHNsaWNlcyA9IHZhbHVlLnNwbGl0KCc9JylcbiAgICAgICAgLy8g5aaC5p6c5piv5LqL5Lu25bCx55u05o6l6YCa6L+HYWRkRXZlbnRMaXN0ZW5lcui/m+ihjOe7keWumlxuICAgICAgICBpZiAob3B0aW9uLnNqZkV2ZW50cy5pbmRleE9mKHNsaWNlc1swXSkgPj0gMCkge1xuICAgICAgICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKHNsaWNlc1swXSlcbiAgICAgICAgICBsZXQgZXZlbnRUeXBlID0gdXRpbC5yZW1vdmVQcmVmaXgoc2xpY2VzWzBdKVxuICAgICAgICAgIGxldCBldmVudEZ1bmMgPSBzamZbJ18nICsgdXRpbC5yZW1vdmVCcmFja2V0cyhzbGljZXNbMV0pXVxuICAgICAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGV2ZW50RnVuYywgZmFsc2UpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8g5a+5e3t9fei/meenjeihqOi+vuW8j+i/m+ihjOWNleeLrOWkhOeQhlxuICAgICAgICAgIGlmICgvXFx7XFx7LitcXH1cXH0vLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICAvLyBub2RlLm91dGVySFRNTCA9IG5vZGUub3V0ZXJIVE1MLnJlcGxhY2UobWF0Y2hFeHByZXNzLCAnJylcbiAgICAgICAgICAgIGxldCBleHByZXNzaW9uID0gc2xpY2VzWzBdLnJlcGxhY2UoL1tcXHtcXH1dL2csICcnKVxuICAgICAgICAgICAgc2pmLl91bmxpbmtOb2Rlcy5wdXNoKHtub2RlOiBub2RlLCBkaXJlY3RpdmU6ICdzamYtdGV4dCcsIGV4cHJlc3Npb246IGV4cHJlc3Npb259KVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBub2RlLnJlbW92ZUF0dHJpYnV0ZShzbGljZXNbMF0pXG4gICAgICAgICAgICBzbGljZXNbMV0gPSBzbGljZXNbMV0ucmVwbGFjZSgvXFxcIi9nLCAnJylcbiAgICAgICAgICAgIHNqZi5fdW5saW5rTm9kZXMucHVzaCh7bm9kZTogbm9kZSwgZGlyZWN0aXZlOiBzbGljZXNbMF0sIGV4cHJlc3Npb246IHNsaWNlc1sxXX0pXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjb21waWxlXG4iLCJpbXBvcnQgdXRpbCBmcm9tICcuL3V0aWxzJ1xuXG5jb25zdCBsaW5rUmVuZGVyID0ge1xuICAnc2pmLWlmJzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFsdWUubm9kZS5zdHlsZS5kaXNwbGF5ID0gKCEhKHZhbHVlLmV4cHJlc3Npb24pID8gJ2Jsb2NrIWltcG9ydGFudCcgOiAnbm9uZSFpbXBvcnRhbnQnKVxuICB9LFxuICAnc2pmLXNob3cnOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YWx1ZS5ub2RlLnN0eWxlLmRpc3BsYXkgPSAoISEodmFsdWUuZXhwcmVzc2lvbikgPyAnYmxvY2shaW1wb3J0YW50JyA6ICdub25lIWltcG9ydGFudCcpXG4gIH0sXG4gICdzamYtZm9yJzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgLy8g5bCG6KGo6L6+5byP6YCa6L+H56m65qC8KOS4jemZkOepuuagvOaVsOebrinnu5nliIflvIBcbiAgICBsZXQgZXhwcmVzc2lvblNsaWNlcyA9IHZhbHVlLmV4cHJlc3Npb24uc3BsaXQoL1xccysvKVxuICAgIGlmICghaXNOYU4oZXhwcmVzc2lvblNsaWNlc1syXSkgJiYgdGhpcy5fZGF0YS5oYXNPd25Qcm9wZXJ0eShleHByZXNzaW9uU2xpY2VzWzJdKSkge1xuICAgICAgdGhpcy5fd2F0Y2hlcnMucHVzaCh0aGlzLl9kYXRhW2V4cHJlc3Npb25TbGljZXNbMl1dKVxuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2RhdGFbZXhwcmVzc2lvblNsaWNlc1syXV0ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBjbG9uZWROb2RlID0gdmFsdWUubm9kZS5jbG9uZU5vZGUodHJ1ZSlcbiAgICAgIHZhbHVlLm5vZGUucGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUoY2xvbmVkTm9kZSwgdmFsdWUubm9kZSlcbiAgICB9XG4gIH0sXG4gICdzamYtdGV4dCc6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHRoaXMuaW5uZXJUZXh0ID0gdGhpcy5fZGF0YVt2YWx1ZS5leHByZXNzaW9uXVxuICB9XG59XG5cbmNsYXNzIGxpbmsge1xuICAgY29uc3RydWN0b3IgKHNqZkRhdGFCaW5kKSB7XG4gICAgaWYgKCEhc2pmRGF0YUJpbmQuX3VubGlua05vZGVzLmxlbmd0aCkge1xuICAgICAgbGV0IGV4ZWN1dGVRdWV1ZSA9IHV0aWwuc29ydEV4ZXh1dGVRdWV1ZSgnZGlyZWN0aXZlJywgc2pmRGF0YUJpbmQuX3VubGlua05vZGVzKVxuICAgICAgZXhlY3V0ZVF1ZXVlLmZvckVhY2godmFsdWUgPT4ge1xuICAgICAgICBsaW5rUmVuZGVyW3ZhbHVlLmRpcmVjdGl2ZV0uYmluZChzamZEYXRhQmluZCkodmFsdWUpXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBsaW5rXG4iLCJjb25zdCBvcHRpb24gPSB7XG4gIHByaW9yaXR5OiB7XG4gICAgJ3NqZi1pZic6IDIwMDAsXG4gICAgJ3NqZi1zaG93JzogMjAwMCxcbiAgICAnc2pmLWZvcic6IDEwMDAsXG4gICAgJ3NqZi1tb2RlbCc6IDEwLFxuICAgICdzamYtdGV4dCc6IDFcbiAgfSxcbiAgc2pmRXZlbnRzOiBbXG4gICAgJ3NqZi1jbGljaycsIFxuICAgICdzamYtbW91c2VvdmVyJywgXG4gICAgJ3NqZi1tb3VzZW91dCcsIFxuICAgICdzamYtbW91c2Vtb3ZlJywgXG4gICAgJ3NqZi1tb3VzZWVudGVyJyxcbiAgICAnc2pmLW1vdXNlbGVhdmUnLFxuICAgICdzamYtbW91c2Vkb3duJyxcbiAgICAnc2pmLW1vdXNldXAnXG4gIF1cbn1cblxuZXhwb3J0IGRlZmF1bHQgb3B0aW9uXG4iLCJpbXBvcnQgY29tcGlsZSBmcm9tICcuL2NvbXBpbGUnXG5cbmNsYXNzIFNqZkRhdGFCaW5kIHtcbiAgY29uc3RydWN0b3IgKHBhcmFtKSB7XG4gICAgaWYgKCFwYXJhbS5oYXNPd25Qcm9wZXJ0eSgnZWwnKSB8fCAhcGFyYW0uaGFzT3duUHJvcGVydHkoJ2RhdGEnKSkge1xuICAgICAgY29uc29sZS5lcnJvcignc2pmW2Vycm9yXTogVGhlcmUgaXMgbmVlZCBgZGF0YWAgYW5kIGBlbGAgYXR0cmlidXRlJylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLl9lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocGFyYW0uZWwpXG4gICAgdGhpcy5fZGF0YSA9IHBhcmFtLmRhdGFcbiAgICB0aGlzLl93YXRjaGVycyA9IFtdXG4gICAgdGhpcy5fdW5jb21waWxlTm9kZXMgPSBbXVxuICAgIHRoaXMuX3VubGlua05vZGVzID0gW11cbiAgICBmb3IgKGxldCBtZXRob2QgaW4gcGFyYW0ubWV0aG9kcykge1xuICAgICAgLy8g5by65Yi25bCG5a6a5LmJ5ZyobWV0aG9kc+S4iueahOaWueazleebtOaOpee7keWumuWcqFNqZkRhdGFCaW5k5LiK77yM5bm25L+u5pS56L+Z5Lqb5pa55rOV55qEdGhpc+aMh+WQkeS4ulNqZkRhdGFCaW5kXG4gICAgICB0aGlzWydfJyArIG1ldGhvZF0gPSBwYXJhbS5tZXRob2RzW21ldGhvZF0uYmluZCh0aGlzKVxuICAgIH1cbiAgICBuZXcgY29tcGlsZSh0aGlzLl9lbCwgdHJ1ZSwgdGhpcylcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTamZEYXRhQmluZFxuIiwiaW1wb3J0IG9wdGlvbiBmcm9tICcuL29wdGlvbidcblxuY29uc3QgdXRpbCA9IHtcbiAgLy8ganVkZ2UgdGhlIHR5cGUgb2Ygb2JqXG4gIGp1ZGdlVHlwZSAob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopXG4gIH0sXG4gIC8vIHJlbW92ZSB0aGUgcHJlZml4IG9mIHNqZi1cbiAgcmVtb3ZlUHJlZml4IChzdHIpIHtcbiAgICByZXR1cm4gc3RyID0gc3RyLnJlcGxhY2UoL3NqZi0vLCAnJylcbiAgfSxcbiAgLy8gcmVtb3ZlIHRoZSBicmFja2V0cyAoKVxuICByZW1vdmVCcmFja2V0cyAoc3RyKSB7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UoL1xcXCIvZywgJycpXG4gICAgcmV0dXJuIHN0ciA9IHN0ci5yZXBsYWNlKC9cXChcXCkvLCAnJylcbiAgfSxcbiAgc29ydEV4ZXh1dGVRdWV1ZSAocHJvcGVydHksIG9iakFycikge1xuICAgIHJldHVybiBvYmpBcnIuc29ydCgob2JqMSwgb2JqMikgPT4ge1xuICAgICAgbGV0IHZhbDEgPSBvcHRpb24ucHJpb3JpdHlbb2JqMVtwcm9wZXJ0eV1dXG4gICAgICBsZXQgdmFsMiA9IG9wdGlvbi5wcmlvcml0eVtvYmoyW3Byb3BlcnR5XV1cbiAgICAgIHJldHVybiB2YWwyIC0gdmFsMVxuICAgIH0pXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgdXRpbFxuIl19
var _r=_m(4);_g.Sjf=_g.SjfDataBind=_r;return _r;})})(typeof window!=='undefined'?window:(typeof global!=='undefined'?global:(typeof self!=='undefined'?self:this)));