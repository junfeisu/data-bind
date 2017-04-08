(function(_g){(function(f){if(typeof exports==='object'&&typeof module!=='undefined'){module.exports=f()}else if(typeof define==='function'&&define.amd){define([],f.bind(_g))}else{f()}})(function(define,module,exports){var _m =(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _link = require('./link');

var _link2 = _interopRequireDefault(_link);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var compile = function () {
  // 递归DOM树
  function compile(parent, lastNode, isFirst, sjf) {
    _classCallCheck(this, compile);

    var rootContent = void 0;
    this.sjf = sjf;
    this.searchNode = [];
    if (isFirst) {
      rootContent = sjf._el.innerHTML;
      if (!parent.children) {
        this.compileNode();
        return;
      }
    } else {
      parent.removeChild(lastNode);
      if (parent === sjf._el) {
        if (!parent.children.length) {
          this.compileNode();
          return;
        }
      }
    }

    var child = parent.children;
    var childLen = child.length;
    if (childLen) {
      for (var i = 0; i < childLen; i++) {
        var node = child[i];
        if (node.children.length) {
          var searchNode = this.searchLoneChild(node)[0];
          this.sjf._uncompileNodes.push({
            check: searchNode,
            search: searchNode,
            parent: searchNode.parentNode
          });
          this.searchNode = [];
          this.constructor(searchNode.parentNode, searchNode, false, this.sjf);
        } else {
          this.sjf._uncompileNodes.push({
            check: node,
            search: node,
            parent: node.parentNode
          });
          if (i === childLen - 1) {
            this.constructor(node.parentNode, node, false, this.sjf);
          }
        }
      }
    } else {
      this.sjf._uncompileNodes.push({
        check: parent,
        search: parent,
        parent: parent.parentNode
      });
      this.constructor(parent.parentNode, parent, false, this.sjf);
    }
  }

  _createClass(compile, [{
    key: 'searchLoneChild',
    value: function searchLoneChild(node) {
      var childLen = node.children.length;
      if (childLen) {
        for (var i = 0; i < childLen; i++) {
          if (node.children[i].children.length) {
            this.searchLoneChild(node.children[i]);
          }
        }
        this.searchNode.push(node.children[childLen - 1]);
      }
      return this.searchNode;
    }
  }, {
    key: 'compileNode',
    value: function compileNode() {
      var _this = this;

      console.log(this.sjf._uncompileNodes);
      var hasUncompile = this.sjf._uncompileNodes.length;
      if (hasUncompile) {
        this.sjf._uncompileNodes.forEach(function (value) {
          _this.hasDirective(value);
        });
      }
      // new link(this.sjf)
    }

    // 检测每个node看是否绑定有指令

  }, {
    key: 'hasDirective',
    value: function hasDirective(value) {
      var checkReg = /sjf-.+=\".+\"|\{\{.+\}\}/;
      if (checkReg.test(value.check.outerHTML)) {
        this.sjf._unlinkNodes.push(value);
      }
    }
  }]);

  return compile;
}();

exports.default = compile;

},{"./link":2,"./utils":6}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _option = require('./option');

var _option2 = _interopRequireDefault(_option);

var _render = require('./render');

var _render2 = _interopRequireDefault(_render);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var link = function () {
  function link(sjf) {
    var _this = this;

    _classCallCheck(this, link);

    this.sjf = sjf;
    var hasUnlinkNode = this.sjf._unlinkNodes.length;
    console.log(this.sjf._unlinkNodes);
    if (hasUnlinkNode) {
      (function () {
        var extractReg = /sjf-[a-z]+=\"[^"]+\"|\{\{.+\}\}/g;
        _this.sjf._unlinkNodes.forEach(function (value) {
          var directives = value.check.outerHTML.match(extractReg);
          console.log(directives);
          directives.forEach(function (val) {
            _this.extractDirective(val, value);
          });
        });
        _this._unlinkNodes = [];
        new _render2.default(_this.sjf);
      })();
    }
  }

  // 提取指令


  _createClass(link, [{
    key: 'extractDirective',
    value: function extractDirective(directive, node) {
      var slices = directive.split('=');
      // 如果是事件就直接通过addEventListener进行绑定
      if (_option2.default.sjfEvents.indexOf(slices[0]) >= 0) {
        var eventMes = {
          type: 'event',
          target: node,
          name: slices[0],
          func: slices[1]
        };
        this.sjf._unrenderNodes.push(eventMes);
      } else {
        var expression = slices[0].replace(/[\{\}]/g, '');
        var directiveName = 'sjf-text';
        // 对非{{}}这种表达式进行单独处理
        if (!/\{\{.+\}\}/.test(directive)) {
          expression = slices[1].replace(/\"/g, '');
          directiveName = slices[0];
        }
        this.sjf._unrenderNodes.push({
          type: 'directive',
          node: node,
          directive: directiveName,
          expression: expression
        });
      }
    }
  }]);

  return link;
}();

exports.default = link;

},{"./option":3,"./render":4}],3:[function(require,module,exports){
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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
    var loopObjectName = value.expression.split(/\s+/)[2];
    var toLoopObject = null;
    if (this._data.hasOwnProperty(loopObjectName)) {
      toLoopObject = this._data[loopObjectName];
    }
    // 判断待循环的是否能进行循环
    var isLoopable = toLoopObject instanceof Array || !isNaN(toLoopObject);
    if (!isLoopable) {
      console.error('the toLoopObject of sjf-for should be a number or an Array');
      return;
    }
    // 判断是数组还是数字，从而赋值length
    var isArray = _utils2.default.judgeType(toLoopObject) === '[object Array]';
    var len = isArray ? toLoopObject.length : toLoopObject;

    // value.search.removeAttribute('sjf-for')
    for (var i = 0; i < len - 1; i++) {
      var clonedNode = value.node.cloneNode(true);
      value.node.parentElement.insertBefore(clonedNode, value.node);
    }

    if (toLoopObject && isArray) {
      this._watchers.push(toLoopObject);
    }
  },
  'sjf-text': function sjfText(value) {
    console.log(value);
    value.node.innerText = this._data[value.expression];
  }
};

var render = function () {
  function render(sjf) {
    var _this = this;

    _classCallCheck(this, render);

    this.sjf = sjf;
    this.unBindEvents = [];
    this.unSortDirectives = [];
    var hasRender = this.sjf._unrenderNodes.length;
    if (hasRender) {
      this.sjf._unrenderNodes.forEach(function (val) {
        val.type === 'event' ? _this.unBindEvents.push(val) : _this.unSortDirectives.push(val);
      });
      this.sjf._unrenderNodes = [];
    }
    this.sortDirective();
  }

  _createClass(render, [{
    key: 'sortDirective',
    value: function sortDirective() {
      var _this2 = this;

      var executeQueue = _utils2.default.sortExexuteQueue('directive', this.unSortDirectives);
      if (executeQueue.length) {
        executeQueue.forEach(function (value) {
          linkRender[value.directive].bind(_this2.sjf)(value);
        });
      }
      this.bindEvent();
    }

    // 绑定事件

  }, {
    key: 'bindEvent',
    value: function bindEvent() {
      var _this3 = this;

      var eventQuene = this.unBindEvents;
      if (eventQuene.length) {
        eventQuene.forEach(function (val) {
          val.target.removeAttribute(val.name);
          var eventType = _utils2.default.removePrefix(val.name);
          var eventFunc = _this3.sjf['_' + _utils2.default.removeBrackets(val.func)];
          val.target.addEventListener(eventType, eventFunc, false);
        });
      }
    }
  }]);

  return render;
}();

exports.default = render;

},{"./utils":6}],5:[function(require,module,exports){
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
  this._unrenderNodes = [];
  for (var method in param.methods) {
    // 强制将定义在methods上的方法直接绑定在SjfDataBind上，并修改这些方法的this指向为SjfDataBind
    if (param.methods.hasOwnProperty(method)) {
      this['_' + method] = param.methods[method].bind(this);
    }
  }
  new _compile2.default(this._el, null, true, this);
};

exports.default = SjfDataBind;

},{"./compile":1}],6:[function(require,module,exports){
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
  },
  isArray: function isArray(arr) {
    return util.judgeType(arr) === '[object Array]';
  },
  isStaictObject: function isStaictObject(obj) {
    return util.judgeType(obj) === '[object Object]';
  },
  deepCopy: function deepCopy(source, dest) {
    if (!util.isArray(source) && !util.isStaictObject(source)) {
      throw 'the source you support can not be copied';
    }

    var copySource = util.isArray(source) ? [] : {};
    for (var prop in source) {
      if (source.hasOwnProperty(prop)) {
        if (util.isArray(source[prop]) || util.isStaictObject(source[prop])) {
          copySource[prop] = util.deepCopy(source[prop]);
        } else {
          copySource[prop] = source[prop];
        }
      }
    }

    return copySource;
  }
};

exports.default = util;

},{"./option":3}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2UvamF2YXNjcmlwdC9jb21waWxlLmpzIiwic291cmNlL2phdmFzY3JpcHQvbGluay5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L29wdGlvbi5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3JlbmRlci5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3NqZkRhdGFCaW5kLmpzIiwic291cmNlL2phdmFzY3JpcHQvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FDOzs7O0FBQ0E7Ozs7Ozs7O0lBRU0sTztBQUNMO0FBQ0EsbUJBQWEsTUFBYixFQUFxQixRQUFyQixFQUErQixPQUEvQixFQUF3QyxHQUF4QyxFQUE2QztBQUFBOztBQUMzQyxRQUFJLG9CQUFKO0FBQ0EsU0FBSyxHQUFMLEdBQVcsR0FBWDtBQUNBLFNBQUssVUFBTCxHQUFrQixFQUFsQjtBQUNBLFFBQUksT0FBSixFQUFhO0FBQ1gsb0JBQWMsSUFBSSxHQUFKLENBQVEsU0FBdEI7QUFDQSxVQUFJLENBQUMsT0FBTyxRQUFaLEVBQXNCO0FBQ3BCLGFBQUssV0FBTDtBQUNBO0FBQ0Q7QUFDRixLQU5ELE1BTU87QUFDTCxhQUFPLFdBQVAsQ0FBbUIsUUFBbkI7QUFDQSxVQUFJLFdBQVcsSUFBSSxHQUFuQixFQUF3QjtBQUN0QixZQUFJLENBQUMsT0FBTyxRQUFQLENBQWdCLE1BQXJCLEVBQTZCO0FBQzNCLGVBQUssV0FBTDtBQUNBO0FBQ0Q7QUFDRjtBQUNGOztBQUVELFFBQUksUUFBUSxPQUFPLFFBQW5CO0FBQ0EsUUFBSSxXQUFXLE1BQU0sTUFBckI7QUFDQSxRQUFJLFFBQUosRUFBYztBQUNaLFdBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxRQUFwQixFQUE4QixHQUE5QixFQUFtQztBQUNqQyxZQUFJLE9BQU8sTUFBTSxDQUFOLENBQVg7QUFDQSxZQUFJLEtBQUssUUFBTCxDQUFj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UCxDQUFnQixLQUFLLFFBQUwsQ0FBaEIsQ0FBWDtBQUNBLGFBQU8sT0FBTyxJQUFkO0FBQ0QsS0FKTSxDQUFQO0FBS0QsR0FwQlU7QUFxQlgsU0FyQlcsbUJBcUJGLEdBckJFLEVBcUJHO0FBQ1osV0FBTyxLQUFLLFNBQUwsQ0FBZSxHQUFmLE1BQXdCLGdCQUEvQjtBQUNELEdBdkJVO0FBd0JYLGdCQXhCVywwQkF3QkssR0F4QkwsRUF3QlU7QUFDbkIsV0FBTyxLQUFLLFNBQUwsQ0FBZSxHQUFmLE1BQXdCLGlCQUEvQjtBQUNELEdBMUJVO0FBMkJYLFVBM0JXLG9CQTJCRCxNQTNCQyxFQTJCTyxJQTNCUCxFQTJCYTtBQUN0QixRQUFJLENBQUMsS0FBSyxPQUFMLENBQWEsTUFBYixDQUFELElBQXlCLENBQUMsS0FBSyxjQUFMLENBQW9CLE1BQXBCLENBQTlCLEVBQTJEO0FBQ3pELFlBQU0sMENBQU47QUFDRDs7QUFFRCxRQUFJLGFBQWEsS0FBSyxPQUFMLENBQWEsTUFBYixJQUF1QixFQUF2QixHQUE0QixFQUE3QztBQUNBLFNBQUssSUFBSSxJQUFULElBQWlCLE1BQWpCLEVBQXlCO0FBQ3ZCLFVBQUksT0FBTyxjQUFQLENBQXNCLElBQXRCLENBQUosRUFBaUM7QUFDL0IsWUFBSSxLQUFLLE9BQUwsQ0FBYSxPQUFPLElBQVAsQ0FBYixLQUE4QixLQUFLLGNBQUwsQ0FBb0IsT0FBTyxJQUFQLENBQXBCLENBQWxDLEVBQXFFO0FBQ25FLHFCQUFXLElBQVgsSUFBbUIsS0FBSyxRQUFMLENBQWMsT0FBTyxJQUFQLENBQWQsQ0FBbkI7QUFDRCxTQUZELE1BRU87QUFDTCxxQkFBVyxJQUFYLElBQW1CLE9BQU8sSUFBUCxDQUFuQjtBQUNEO0FBQ0Y7QUFDRjs7QUFFRCxXQUFPLFVBQVA7QUFDRDtBQTVDVSxDQUFiOztrQkErQ2UsSSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIgaW1wb3J0IGxpbmsgZnJvbSAnLi9saW5rJ1xuIGltcG9ydCB1dGlsIGZyb20gJy4vdXRpbHMnXG5cbiBjbGFzcyBjb21waWxlIHtcbiAgLy8g6YCS5b2SRE9N5qCRXG4gIGNvbnN0cnVjdG9yIChwYXJlbnQsIGxhc3ROb2RlLCBpc0ZpcnN0LCBzamYpIHtcbiAgICBsZXQgcm9vdENvbnRlbnRcbiAgICB0aGlzLnNqZiA9IHNqZlxuICAgIHRoaXMuc2VhcmNoTm9kZSA9IFtdXG4gICAgaWYgKGlzRmlyc3QpIHtcbiAgICAgIHJvb3RDb250ZW50ID0gc2pmLl9lbC5pbm5lckhUTUxcbiAgICAgIGlmICghcGFyZW50LmNoaWxkcmVuKSB7XG4gICAgICAgIHRoaXMuY29tcGlsZU5vZGUoKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKGxhc3ROb2RlKVxuICAgICAgaWYgKHBhcmVudCA9PT0gc2pmLl9lbCkge1xuICAgICAgICBpZiAoIXBhcmVudC5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICB0aGlzLmNvbXBpbGVOb2RlKClcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBsZXQgY2hpbGQgPSBwYXJlbnQuY2hpbGRyZW5cbiAgICBsZXQgY2hpbGRMZW4gPSBjaGlsZC5sZW5ndGhcbiAgICBpZiAoY2hpbGRMZW4pIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRMZW47IGkrKykge1xuICAgICAgICBsZXQgbm9kZSA9IGNoaWxkW2ldXG4gICAgICAgIGlmIChub2RlLmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICAgIHZhciBzZWFyY2hOb2RlID0gdGhpcy5zZWFyY2hMb25lQ2hpbGQobm9kZSlbMF1cbiAgICAgICAgICB0aGlzLnNqZi5fdW5jb21waWxlTm9kZXMucHVzaCh7XG4gICAgICAgICAgICBjaGVjazogc2VhcmNoTm9kZSwgXG4gICAgICAgICAgICBzZWFyY2g6IHNlYXJjaE5vZGUsIFxuICAgICAgICAgICAgcGFyZW50OiBzZWFyY2hOb2RlLnBhcmVudE5vZGVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHRoaXMuc2VhcmNoTm9kZSA9IFtdXG4gICAgICAgICAgdGhpcy5jb25zdHJ1Y3RvcihzZWFyY2hOb2RlLnBhcmVudE5vZGUsIHNlYXJjaE5vZGUsIGZhbHNlLCB0aGlzLnNqZilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnNqZi5fdW5jb21waWxlTm9kZXMucHVzaCh7XG4gICAgICAgICAgICBjaGVjazogbm9kZSwgXG4gICAgICAgICAgICBzZWFyY2g6IG5vZGUsIFxuICAgICAgICAgICAgcGFyZW50OiBub2RlLnBhcmVudE5vZGVcbiAgICAgICAgICB9KVxuICAgICAgICAgIGlmIChpID09PSBjaGlsZExlbiAtIDEpIHtcbiAgICAgICAgICAgIHRoaXMuY29uc3RydWN0b3Iobm9kZS5wYXJlbnROb2RlLCBub2RlLCBmYWxzZSwgdGhpcy5zamYpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2pmLl91bmNvbXBpbGVOb2Rlcy5wdXNoKHtcbiAgICAgICAgY2hlY2s6IHBhcmVudCwgXG4gICAgICAgIHNlYXJjaDogcGFyZW50LCBcbiAgICAgICAgcGFyZW50OiBwYXJlbnQucGFyZW50Tm9kZVxuICAgICAgfSlcbiAgICAgIHRoaXMuY29uc3RydWN0b3IocGFyZW50LnBhcmVudE5vZGUsIHBhcmVudCwgZmFsc2UsIHRoaXMuc2pmKVxuICAgIH1cblxuICB9XG5cbiAgc2VhcmNoTG9uZUNoaWxkIChub2RlKSB7XG4gICAgbGV0IGNoaWxkTGVuID0gbm9kZS5jaGlsZHJlbi5sZW5ndGhcbiAgICBpZiAoY2hpbGRMZW4pIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRMZW47IGkrKykge1xuICAgICAgICBpZiAobm9kZS5jaGlsZHJlbltpXS5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICB0aGlzLnNlYXJjaExvbmVDaGlsZChub2RlLmNoaWxkcmVuW2ldKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLnNlYXJjaE5vZGUucHVzaChub2RlLmNoaWxkcmVuW2NoaWxkTGVuIC0gMV0pXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnNlYXJjaE5vZGVcbiAgfVxuXG4gIGNvbXBpbGVOb2RlICgpIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzLnNqZi5fdW5jb21waWxlTm9kZXMpXG4gICAgbGV0IGhhc1VuY29tcGlsZSA9IHRoaXMuc2pmLl91bmNvbXBpbGVOb2Rlcy5sZW5ndGhcbiAgICBpZiAoaGFzVW5jb21waWxlKSB7XG4gICAgICB0aGlzLnNqZi5fdW5jb21waWxlTm9kZXMuZm9yRWFjaCh2YWx1ZSA9PiB7XG4gICAgICAgIHRoaXMuaGFzRGlyZWN0aXZlKHZhbHVlKVxuICAgICAgfSlcbiAgICB9XG4gICAgLy8gbmV3IGxpbmsodGhpcy5zamYpXG4gIH1cblxuICAvLyDmo4DmtYvmr4/kuKpub2Rl55yL5piv5ZCm57uR5a6a5pyJ5oyH5LukXG4gIGhhc0RpcmVjdGl2ZSAodmFsdWUpIHtcbiAgICBsZXQgY2hlY2tSZWcgPSAvc2pmLS4rPVxcXCIuK1xcXCJ8XFx7XFx7LitcXH1cXH0vXG4gICAgaWYgKGNoZWNrUmVnLnRlc3QodmFsdWUuY2hlY2sub3V0ZXJIVE1MKSkge1xuICAgICAgdGhpcy5zamYuX3VubGlua05vZGVzLnB1c2godmFsdWUpXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvbXBpbGVcbiIsImltcG9ydCBvcHRpb24gZnJvbSAnLi9vcHRpb24nXG5pbXBvcnQgcmVuZGVyIGZyb20gJy4vcmVuZGVyJ1xuXG5jbGFzcyBsaW5rIHtcbiAgY29uc3RydWN0b3IgKHNqZikge1xuICAgIHRoaXMuc2pmID0gc2pmXG4gICAgbGV0IGhhc1VubGlua05vZGUgPSB0aGlzLnNqZi5fdW5saW5rTm9kZXMubGVuZ3RoXG4gICAgY29uc29sZS5sb2codGhpcy5zamYuX3VubGlua05vZGVzKVxuICAgIGlmIChoYXNVbmxpbmtOb2RlKSB7XG4gICAgICBsZXQgZXh0cmFjdFJlZyA9IC9zamYtW2Etel0rPVxcXCJbXlwiXStcXFwifFxce1xcey4rXFx9XFx9L2dcbiAgICAgIHRoaXMuc2pmLl91bmxpbmtOb2Rlcy5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgICAgICBsZXQgZGlyZWN0aXZlcyA9ICh2YWx1ZS5jaGVjay5vdXRlckhUTUwpLm1hdGNoKGV4dHJhY3RSZWcpXG4gICAgICAgIGNvbnNvbGUubG9nKGRpcmVjdGl2ZXMpXG4gICAgICAgIGRpcmVjdGl2ZXMuZm9yRWFjaCh2YWwgPT4ge1xuICAgICAgICAgIHRoaXMuZXh0cmFjdERpcmVjdGl2ZSh2YWwsIHZhbHVlKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICAgIHRoaXMuX3VubGlua05vZGVzID0gW11cbiAgICAgIG5ldyByZW5kZXIodGhpcy5zamYpXG4gICAgfVxuICB9XG5cbiAgLy8g5o+Q5Y+W5oyH5LukXG4gIGV4dHJhY3REaXJlY3RpdmUgKGRpcmVjdGl2ZSwgbm9kZSkge1xuICAgIGxldCBzbGljZXMgPSBkaXJlY3RpdmUuc3BsaXQoJz0nKVxuICAgIC8vIOWmguaenOaYr+S6i+S7tuWwseebtOaOpemAmui/h2FkZEV2ZW50TGlzdGVuZXLov5vooYznu5HlrppcbiAgICBpZiAob3B0aW9uLnNqZkV2ZW50cy5pbmRleE9mKHNsaWNlc1swXSkgPj0gMCkge1xuICAgICAgbGV0IGV2ZW50TWVzID0ge1xuICAgICAgICB0eXBlOiAnZXZlbnQnLFxuICAgICAgICB0YXJnZXQ6IG5vZGUsXG4gICAgICAgIG5hbWU6IHNsaWNlc1swXSxcbiAgICAgICAgZnVuYzogc2xpY2VzWzFdXG4gICAgICB9XG4gICAgICB0aGlzLnNqZi5fdW5yZW5kZXJOb2Rlcy5wdXNoKGV2ZW50TWVzKVxuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgZXhwcmVzc2lvbiA9IHNsaWNlc1swXS5yZXBsYWNlKC9bXFx7XFx9XS9nLCAnJylcbiAgICAgIGxldCBkaXJlY3RpdmVOYW1lID0gJ3NqZi10ZXh0J1xuICAgICAgLy8g5a+56Z2ee3t9fei/meenjeihqOi+vuW8j+i/m+ihjOWNleeLrOWkhOeQhlxuICAgICAgaWYgKCEvXFx7XFx7LitcXH1cXH0vLnRlc3QoZGlyZWN0aXZlKSkge1xuICAgICAgICBleHByZXNzaW9uID0gc2xpY2VzWzFdLnJlcGxhY2UoL1xcXCIvZywgJycpXG4gICAgICAgIGRpcmVjdGl2ZU5hbWUgPSBzbGljZXNbMF1cbiAgICAgIH1cbiAgICAgIHRoaXMuc2pmLl91bnJlbmRlck5vZGVzLnB1c2goe1xuICAgICAgICB0eXBlOiAnZGlyZWN0aXZlJyxcbiAgICAgICAgbm9kZTogbm9kZSwgXG4gICAgICAgIGRpcmVjdGl2ZTogZGlyZWN0aXZlTmFtZSwgXG4gICAgICAgIGV4cHJlc3Npb246IGV4cHJlc3Npb25cbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGxpbmtcbiIsImNvbnN0IG9wdGlvbiA9IHtcbiAgcHJpb3JpdHk6IHtcbiAgICAnc2pmLWlmJzogMjAwMCxcbiAgICAnc2pmLXNob3cnOiAyMDAwLFxuICAgICdzamYtZm9yJzogMTAwMCxcbiAgICAnc2pmLW1vZGVsJzogMTAsXG4gICAgJ3NqZi10ZXh0JzogMVxuICB9LFxuICBzamZFdmVudHM6IFtcbiAgICAnc2pmLWNsaWNrJywgXG4gICAgJ3NqZi1tb3VzZW92ZXInLCBcbiAgICAnc2pmLW1vdXNlb3V0JywgXG4gICAgJ3NqZi1tb3VzZW1vdmUnLCBcbiAgICAnc2pmLW1vdXNlZW50ZXInLFxuICAgICdzamYtbW91c2VsZWF2ZScsXG4gICAgJ3NqZi1tb3VzZWRvd24nLFxuICAgICdzamYtbW91c2V1cCdcbiAgXVxufVxuXG5leHBvcnQgZGVmYXVsdCBvcHRpb25cbiIsImltcG9ydCB1dGlsIGZyb20gJy4vdXRpbHMnXG5cbmNvbnN0IGxpbmtSZW5kZXIgPSB7XG4gICdzamYtaWYnOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YWx1ZS5ub2RlLnN0eWxlLmRpc3BsYXkgPSAoISEodmFsdWUuZXhwcmVzc2lvbikgPyAnYmxvY2shaW1wb3J0YW50JyA6ICdub25lIWltcG9ydGFudCcpXG4gIH0sXG4gICdzamYtc2hvdyc6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhbHVlLm5vZGUuc3R5bGUuZGlzcGxheSA9ICghISh2YWx1ZS5leHByZXNzaW9uKSA/ICdibG9jayFpbXBvcnRhbnQnIDogJ25vbmUhaW1wb3J0YW50JylcbiAgfSxcbiAgJ3NqZi1mb3InOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAvLyDlsIbooajovr7lvI/pgJrov4fnqbrmoLwo5LiN6ZmQ56m65qC85pWw55uuKee7meWIh+W8gFxuICAgIGxldCBsb29wT2JqZWN0TmFtZSA9IHZhbHVlLmV4cHJlc3Npb24uc3BsaXQoL1xccysvKVsyXVxuICAgIGxldCB0b0xvb3BPYmplY3QgPSBudWxsXG4gICAgaWYgKHRoaXMuX2RhdGEuaGFzT3duUHJvcGVydHkobG9vcE9iamVjdE5hbWUpKSB7XG4gICAgICB0b0xvb3BPYmplY3QgPSB0aGlzLl9kYXRhW2xvb3BPYmplY3ROYW1lXVxuICAgIH1cbiAgICAvLyDliKTmlq3lvoXlvqrnjq/nmoTmmK/lkKbog73ov5vooYzlvqrnjq9cbiAgICBsZXQgaXNMb29wYWJsZSA9IHRvTG9vcE9iamVjdCBpbnN0YW5jZW9mIEFycmF5IHx8ICFpc05hTih0b0xvb3BPYmplY3QpXG4gICAgaWYgKCFpc0xvb3BhYmxlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCd0aGUgdG9Mb29wT2JqZWN0IG9mIHNqZi1mb3Igc2hvdWxkIGJlIGEgbnVtYmVyIG9yIGFuIEFycmF5JylcbiAgICAgIHJldHVybiBcbiAgICB9XG4gICAgLy8g5Yik5pat5piv5pWw57uE6L+Y5piv5pWw5a2X77yM5LuO6ICM6LWL5YC8bGVuZ3RoXG4gICAgbGV0IGlzQXJyYXkgPSB1dGlsLmp1ZGdlVHlwZSh0b0xvb3BPYmplY3QpID09PSAnW29iamVjdCBBcnJheV0nXG4gICAgbGV0IGxlbiA9IGlzQXJyYXkgPyB0b0xvb3BPYmplY3QubGVuZ3RoIDogdG9Mb29wT2JqZWN0XG5cbiAgICAvLyB2YWx1ZS5zZWFyY2gucmVtb3ZlQXR0cmlidXRlKCdzamYtZm9yJylcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbiAtIDE7IGkrKykge1xuICAgICAgbGV0IGNsb25lZE5vZGUgPSB2YWx1ZS5ub2RlLmNsb25lTm9kZSh0cnVlKVxuICAgICAgdmFsdWUubm9kZS5wYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShjbG9uZWROb2RlLCB2YWx1ZS5ub2RlKVxuICAgIH1cblxuICAgIGlmICh0b0xvb3BPYmplY3QgJiYgaXNBcnJheSkge1xuICAgICAgdGhpcy5fd2F0Y2hlcnMucHVzaCh0b0xvb3BPYmplY3QpXG4gICAgfVxuICB9LFxuICAnc2pmLXRleHQnOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBjb25zb2xlLmxvZyh2YWx1ZSlcbiAgICB2YWx1ZS5ub2RlLmlubmVyVGV4dCA9IHRoaXMuX2RhdGFbdmFsdWUuZXhwcmVzc2lvbl1cbiAgfVxufVxuXG5jbGFzcyByZW5kZXIge1xuICBjb25zdHJ1Y3RvciAoc2pmKSB7XG4gICAgdGhpcy5zamYgPSBzamZcbiAgICB0aGlzLnVuQmluZEV2ZW50cyA9IFtdXG4gICAgdGhpcy51blNvcnREaXJlY3RpdmVzID0gW11cbiAgICBsZXQgaGFzUmVuZGVyID0gdGhpcy5zamYuX3VucmVuZGVyTm9kZXMubGVuZ3RoXG4gICAgaWYgKGhhc1JlbmRlcikge1xuICAgICAgdGhpcy5zamYuX3VucmVuZGVyTm9kZXMuZm9yRWFjaCh2YWwgPT4ge1xuICAgICAgICB2YWwudHlwZSA9PT0gJ2V2ZW50JyA/IHRoaXMudW5CaW5kRXZlbnRzLnB1c2godmFsKSA6IHRoaXMudW5Tb3J0RGlyZWN0aXZlcy5wdXNoKHZhbClcbiAgICAgIH0pXG4gICAgICB0aGlzLnNqZi5fdW5yZW5kZXJOb2RlcyA9IFtdXG4gICAgfVxuICAgIHRoaXMuc29ydERpcmVjdGl2ZSgpXG4gIH1cblxuICBzb3J0RGlyZWN0aXZlICgpIHtcbiAgICBsZXQgZXhlY3V0ZVF1ZXVlID0gdXRpbC5zb3J0RXhleHV0ZVF1ZXVlKCdkaXJlY3RpdmUnLCB0aGlzLnVuU29ydERpcmVjdGl2ZXMpXG4gICAgaWYgKGV4ZWN1dGVRdWV1ZS5sZW5ndGgpIHtcbiAgICAgIGV4ZWN1dGVRdWV1ZS5mb3JFYWNoKHZhbHVlID0+IHtcbiAgICAgICAgbGlua1JlbmRlclt2YWx1ZS5kaXJlY3RpdmVdLmJpbmQodGhpcy5zamYpKHZhbHVlKVxuICAgICAgfSlcbiAgICB9XG4gICAgdGhpcy5iaW5kRXZlbnQoKVxuICB9XG5cbiAgLy8g57uR5a6a5LqL5Lu2XG4gIGJpbmRFdmVudCAoKSB7XG4gICAgbGV0IGV2ZW50UXVlbmUgPSB0aGlzLnVuQmluZEV2ZW50c1xuICAgIGlmIChldmVudFF1ZW5lLmxlbmd0aCkge1xuICAgICAgZXZlbnRRdWVuZS5mb3JFYWNoKHZhbCA9PiB7XG4gICAgICAgIHZhbC50YXJnZXQucmVtb3ZlQXR0cmlidXRlKHZhbC5uYW1lKVxuICAgICAgICBsZXQgZXZlbnRUeXBlID0gdXRpbC5yZW1vdmVQcmVmaXgodmFsLm5hbWUpXG4gICAgICAgIGxldCBldmVudEZ1bmMgPSB0aGlzLnNqZlsnXycgKyB1dGlsLnJlbW92ZUJyYWNrZXRzKHZhbC5mdW5jKV1cbiAgICAgICAgdmFsLnRhcmdldC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgZXZlbnRGdW5jLCBmYWxzZSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHJlbmRlclxuIiwiaW1wb3J0IGNvbXBpbGUgZnJvbSAnLi9jb21waWxlJ1xuXG5jbGFzcyBTamZEYXRhQmluZCB7XG4gIGNvbnN0cnVjdG9yIChwYXJhbSkge1xuICAgIGlmICghcGFyYW0uaGFzT3duUHJvcGVydHkoJ2VsJykgfHwgIXBhcmFtLmhhc093blByb3BlcnR5KCdkYXRhJykpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ3NqZltlcnJvcl06IFRoZXJlIGlzIG5lZWQgYGRhdGFgIGFuZCBgZWxgIGF0dHJpYnV0ZScpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5fZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHBhcmFtLmVsKVxuICAgIHRoaXMuX2RhdGEgPSBwYXJhbS5kYXRhXG4gICAgdGhpcy5fd2F0Y2hlcnMgPSBbXVxuICAgIHRoaXMuX3VuY29tcGlsZU5vZGVzID0gW11cbiAgICB0aGlzLl91bmxpbmtOb2RlcyA9IFtdXG4gICAgdGhpcy5fdW5yZW5kZXJOb2RlcyA9IFtdXG4gICAgZm9yIChsZXQgbWV0aG9kIGluIHBhcmFtLm1ldGhvZHMpIHtcbiAgICAgIC8vIOW8uuWItuWwhuWumuS5ieWcqG1ldGhvZHPkuIrnmoTmlrnms5Xnm7TmjqXnu5HlrprlnKhTamZEYXRhQmluZOS4iu+8jOW5tuS/ruaUuei/meS6m+aWueazleeahHRoaXPmjIflkJHkuLpTamZEYXRhQmluZFxuICAgICAgaWYgKHBhcmFtLm1ldGhvZHMuaGFzT3duUHJvcGVydHkobWV0aG9kKSkge1xuICAgICAgICB0aGlzWydfJyArIG1ldGhvZF0gPSBwYXJhbS5tZXRob2RzW21ldGhvZF0uYmluZCh0aGlzKVxuICAgICAgfVxuICAgIH1cbiAgICBuZXcgY29tcGlsZSh0aGlzLl9lbCwgbnVsbCwgdHJ1ZSwgdGhpcylcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTamZEYXRhQmluZFxuIiwiaW1wb3J0IG9wdGlvbiBmcm9tICcuL29wdGlvbidcblxuY29uc3QgdXRpbCA9IHtcbiAgLy8ganVkZ2UgdGhlIHR5cGUgb2Ygb2JqXG4gIGp1ZGdlVHlwZSAob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopXG4gIH0sXG4gIC8vIHJlbW92ZSB0aGUgcHJlZml4IG9mIHNqZi1cbiAgcmVtb3ZlUHJlZml4IChzdHIpIHtcbiAgICByZXR1cm4gc3RyID0gc3RyLnJlcGxhY2UoL3NqZi0vLCAnJylcbiAgfSxcbiAgLy8gcmVtb3ZlIHRoZSBicmFja2V0cyAoKVxuICByZW1vdmVCcmFja2V0cyAoc3RyKSB7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UoL1xcXCIvZywgJycpXG4gICAgcmV0dXJuIHN0ciA9IHN0ci5yZXBsYWNlKC9cXChcXCkvLCAnJylcbiAgfSxcbiAgc29ydEV4ZXh1dGVRdWV1ZSAocHJvcGVydHksIG9iakFycikge1xuICAgIHJldHVybiBvYmpBcnIuc29ydCgob2JqMSwgb2JqMikgPT4ge1xuICAgICAgbGV0IHZhbDEgPSBvcHRpb24ucHJpb3JpdHlbb2JqMVtwcm9wZXJ0eV1dXG4gICAgICBsZXQgdmFsMiA9IG9wdGlvbi5wcmlvcml0eVtvYmoyW3Byb3BlcnR5XV1cbiAgICAgIHJldHVybiB2YWwyIC0gdmFsMVxuICAgIH0pXG4gIH0sXG4gIGlzQXJyYXkgKGFycikge1xuICAgIHJldHVybiB1dGlsLmp1ZGdlVHlwZShhcnIpID09PSAnW29iamVjdCBBcnJheV0nXG4gIH0sXG4gIGlzU3RhaWN0T2JqZWN0IChvYmopIHtcbiAgICByZXR1cm4gdXRpbC5qdWRnZVR5cGUob2JqKSA9PT0gJ1tvYmplY3QgT2JqZWN0XSdcbiAgfSxcbiAgZGVlcENvcHkgKHNvdXJjZSwgZGVzdCkge1xuICAgIGlmICghdXRpbC5pc0FycmF5KHNvdXJjZSkgJiYgIXV0aWwuaXNTdGFpY3RPYmplY3Qoc291cmNlKSkge1xuICAgICAgdGhyb3cgJ3RoZSBzb3VyY2UgeW91IHN1cHBvcnQgY2FuIG5vdCBiZSBjb3BpZWQnXG4gICAgfVxuXG4gICAgdmFyIGNvcHlTb3VyY2UgPSB1dGlsLmlzQXJyYXkoc291cmNlKSA/IFtdIDoge31cbiAgICBmb3IgKHZhciBwcm9wIGluIHNvdXJjZSkge1xuICAgICAgaWYgKHNvdXJjZS5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICBpZiAodXRpbC5pc0FycmF5KHNvdXJjZVtwcm9wXSkgfHwgdXRpbC5pc1N0YWljdE9iamVjdChzb3VyY2VbcHJvcF0pKSB7XG4gICAgICAgICAgY29weVNvdXJjZVtwcm9wXSA9IHV0aWwuZGVlcENvcHkoc291cmNlW3Byb3BdKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvcHlTb3VyY2VbcHJvcF0gPSBzb3VyY2VbcHJvcF1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjb3B5U291cmNlXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgdXRpbFxuIl19
var _r=_m(5);_g.Sjf=_g.SjfDataBind=_r;return _r;})})(typeof window!=='undefined'?window:(typeof global!=='undefined'?global:(typeof self!=='undefined'?self:this)));