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
  function compile(parent, sjf) {
    _classCallCheck(this, compile);

    this.sjf = sjf;
    this.searchNode = [];
    this.rootContent = this.sjf._el.innerHTML;
    // this.traverseElement(parent, null, true)
    this.circleElement(this.sjf._el, true);
  }

  _createClass(compile, [{
    key: 'circleElement',
    value: function circleElement(parent, isFirst) {
      var _this = this;

      var child = parent.children;
      // 如果是第一次遍历并且没有子节点就直接跳过compile
      if (isFirst && !child.length) {
        this.compileNode();
        return;
      }

      Array.prototype.forEach.call(child, function (node) {
        if (!!node.children.length) {
          _this.circleElement(node, false);
          _this.sjf._uncompileNodes.push({
            check: node,
            parent: node.parentNode,
            nodeType: 'elementNode'
          });
        } else {
          _this.sjf._uncompileNodes.push({
            check: node,
            parent: node.parentNode,
            nodeType: 'elementNode'
          });
        }
      });

      if (this.sjf._el.lastElementChild === child[child.length - 1]) {
        this.compileNode();
      }
    }
  }, {
    key: 'traverseElement',
    value: function traverseElement(parent, lastNode, isFirst) {
      if (isFirst) {
        if (!parent.children.length) {
          this.compileNode();
          return;
        }
      } else {
        parent.removeChild(lastNode);
        if (parent === this.sjf._el) {
          if (!parent.children.length) {
            return;
          }
        }
      }

      var child = parent.children;
      var childLen = child.length;
      if (childLen) {
        for (var i = childLen - 1; i >= 0; i--) {
          var node = child[i];
          if (!node) {
            if (parent === this.sjf._el && i === 0) {
              return;
            } else {
              this.compileNode();
              return;
            }
          }
          if (node.children.length) {
            var searchNode = this.searchLoneChild(node)[0];
            this.sjf._uncompileNodes.push({
              check: searchNode,
              search: searchNode,
              parent: searchNode.parentNode
            });
            this.searchNode = [];
            this.traverseElement(searchNode.parentNode, searchNode, false);
          } else {
            this.sjf._uncompileNodes.push({
              check: node,
              search: node,
              parent: node.parentNode
            });
            this.traverseElement(node.parentNode, node, false);
          }
        }
      } else {
        this.sjf._uncompileNodes.push({
          check: parent,
          search: parent,
          parent: parent.parentNode
        });
        this.traverseElement(parent.parentNode, parent, false);
      }
    }
  }, {
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
      var _this2 = this;

      var hasUncompile = this.sjf._uncompileNodes.length;
      if (hasUncompile) {
        this.sjf._uncompileNodes.map(function (value) {
          _this2.hasDirective(value);
        });
      }
      this.sjf._uncompileNodes = [];
      new _link2.default(this.sjf);
    }

    // 检测每个node看是否绑定有指令

  }, {
    key: 'hasDirective',
    value: function hasDirective(value) {
      var _this3 = this;

      var checkReg = /sjf-.+=\".+\"|\{\{.+\}\}/;
      Array.prototype.map.call(value.check.childNodes, function (node) {
        if (node.nodeType === 3) {
          if (checkReg.test(node.data)) {
            _this3.sjf._unlinkNodes.push({
              check: node,
              parent: value.check,
              nodeType: 'textNode'
            });
          }
        }
      });
      if (checkReg.test(value.check.cloneNode().outerHTML)) {
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
    if (hasUnlinkNode) {
      (function () {
        var extractReg = /sjf-[a-z]+=\"[^"]+\"|\{\{.+\}\}/g;
        _this.sjf._unlinkNodes.map(function (value) {
          var directives = [];
          if (value.nodeType === 'textNode') {
            directives = value.check.data.match(extractReg);
          } else {
            directives = value.check.cloneNode().outerHTML.match(extractReg);
          }
          directives.map(function (directive) {
            _this.extractDirective(directive, value);
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
      console.error('sjf[error]: the toLoopObject of sjf-for should be a number or an Array');
      return;
    }
    // 判断是数组还是数字，从而赋值length
    var isArray = _utils2.default.isArray(toLoopObject);
    var len = isArray ? toLoopObject.length : toLoopObject;
    value.node.check.removeAttribute('sjf-for');
    for (var i = 1; i < len; i++) {
      var clonedNode = value.node.check.cloneNode(true);
      value.node.parent.insertBefore(clonedNode, value.node.check);
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
      this.sjf._unrenderNodes.map(function (val) {
        val.type === 'event' ? _this.unBindEvents.push(val) : _this.unSortDirectives.push(val);
        _this.sjf._unrenderNodes = [];
      });
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
        eventQuene.map(function (val) {
          val.target.check.removeAttribute(val.name);
          var eventType = _utils2.default.removePrefix(val.name);
          var eventFunc = _this3.sjf['_' + _utils2.default.removeBrackets(val.func)];
          if (eventFunc) {
            val.target.check.addEventListener(eventType, eventFunc, false);
          } else {
            console.error('sjf[error]: the ' + val.func + ' is not declared');
          }
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
  new _compile2.default(this._el, this);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2UvamF2YXNjcmlwdC9jb21waWxlLmpzIiwic291cmNlL2phdmFzY3JpcHQvbGluay5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L29wdGlvbi5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3JlbmRlci5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3NqZkRhdGFCaW5kLmpzIiwic291cmNlL2phdmFzY3JpcHQvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FDOzs7O0FBQ0E7Ozs7Ozs7O0lBRU0sTztBQUNMO0FBQ0EsbUJBQWEsTUFBYixFQUFxQixHQUFyQixFQUEwQjtBQUFBOztBQUN4QixTQUFLLEdBQUwsR0FBVyxHQUFYO0FBQ0EsU0FBSyxVQUFMLEdBQWtCLEVBQWxCO0FBQ0EsU0FBSyxXQUFMLEdBQW1CLEtBQUssR0FBTCxDQUFTLEdBQVQsQ0FBYSxTQUFoQztBQUNBO0FBQ0EsU0FBSyxhQUFMLENBQW1CLEtBQUssR0FBTCxDQUFTLEdBQTVCLEVBQWlDLElBQWpDO0FBQ0Q7Ozs7a0NBRWMsTSxFQUFRLE8sRUFBUztBQUFBOztBQUM5QixVQUFJLFFBQVEsT0FBTyxRQUFuQjtBQUNBO0FBQ0EsVUFBSSxXQUFXLENBQUMsTUFBTSxNQUF0QixFQUE4QjtBQUM1QixhQUFLLFdBQUw7QUFDQTtBQUNEOztBQUVELFlBQU0sU0FBTixDQUFnQixPQUFoQixDQUF3QixJQUF4QixDQUE2QixLQUE3QixFQUFvQyxnQkFBUTtBQUMxQyxZQUFJLENBQUMsQ0FBQyxLQUFLLFFBQUwsQ0FBYyxNQUFwQixFQUE0QjtBQUMxQixnQkFBSyxhQUFMLENBQW1CLElBQW5CLEVBQXlCLEtBQXpCO0FBQ0EsZ0JBQUssR0FBTCxDQUFTLGVBQVQsQ0FBeUIsSUFBekIsQ0FBOEI7QUFDNUIsbUJBQU8sSUFEcUI7QUFFNUIsb0JBQVEsS0FBSyxVQUZlO0FBRzVCLHNCQUFVO0FB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LElBQWlCLE1BQWpCLEVBQXlCO0FBQ3ZCLFVBQUksT0FBTyxjQUFQLENBQXNCLElBQXRCLENBQUosRUFBaUM7QUFDL0IsWUFBSSxLQUFLLE9BQUwsQ0FBYSxPQUFPLElBQVAsQ0FBYixLQUE4QixLQUFLLGNBQUwsQ0FBb0IsT0FBTyxJQUFQLENBQXBCLENBQWxDLEVBQXFFO0FBQ25FLHFCQUFXLElBQVgsSUFBbUIsS0FBSyxRQUFMLENBQWMsT0FBTyxJQUFQLENBQWQsQ0FBbkI7QUFDRCxTQUZELE1BRU87QUFDTCxxQkFBVyxJQUFYLElBQW1CLE9BQU8sSUFBUCxDQUFuQjtBQUNEO0FBQ0Y7QUFDRjs7QUFFRCxXQUFPLFVBQVA7QUFDRDtBQTVDVSxDQUFiOztrQkErQ2UsSSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIgaW1wb3J0IGxpbmsgZnJvbSAnLi9saW5rJ1xuIGltcG9ydCB1dGlsIGZyb20gJy4vdXRpbHMnXG5cbiBjbGFzcyBjb21waWxlIHtcbiAgLy8g6YCS5b2SRE9N5qCRXG4gIGNvbnN0cnVjdG9yIChwYXJlbnQsIHNqZikge1xuICAgIHRoaXMuc2pmID0gc2pmXG4gICAgdGhpcy5zZWFyY2hOb2RlID0gW11cbiAgICB0aGlzLnJvb3RDb250ZW50ID0gdGhpcy5zamYuX2VsLmlubmVySFRNTFxuICAgIC8vIHRoaXMudHJhdmVyc2VFbGVtZW50KHBhcmVudCwgbnVsbCwgdHJ1ZSlcbiAgICB0aGlzLmNpcmNsZUVsZW1lbnQodGhpcy5zamYuX2VsLCB0cnVlKVxuICB9XG5cbiAgY2lyY2xlRWxlbWVudCAocGFyZW50LCBpc0ZpcnN0KSB7XG4gICAgbGV0IGNoaWxkID0gcGFyZW50LmNoaWxkcmVuXG4gICAgLy8g5aaC5p6c5piv56ys5LiA5qyh6YGN5Y6G5bm25LiU5rKh5pyJ5a2Q6IqC54K55bCx55u05o6l6Lez6L+HY29tcGlsZVxuICAgIGlmIChpc0ZpcnN0ICYmICFjaGlsZC5sZW5ndGgpIHtcbiAgICAgIHRoaXMuY29tcGlsZU5vZGUoKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChjaGlsZCwgbm9kZSA9PiB7XG4gICAgICBpZiAoISFub2RlLmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICB0aGlzLmNpcmNsZUVsZW1lbnQobm9kZSwgZmFsc2UpXG4gICAgICAgIHRoaXMuc2pmLl91bmNvbXBpbGVOb2Rlcy5wdXNoKHtcbiAgICAgICAgICBjaGVjazogbm9kZSwgXG4gICAgICAgICAgcGFyZW50OiBub2RlLnBhcmVudE5vZGUsXG4gICAgICAgICAgbm9kZVR5cGU6ICdlbGVtZW50Tm9kZSdcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2pmLl91bmNvbXBpbGVOb2Rlcy5wdXNoKHtcbiAgICAgICAgICBjaGVjazogbm9kZSwgXG4gICAgICAgICAgcGFyZW50OiBub2RlLnBhcmVudE5vZGUsXG4gICAgICAgICAgbm9kZVR5cGU6ICdlbGVtZW50Tm9kZSdcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgaWYgKHRoaXMuc2pmLl9lbC5sYXN0RWxlbWVudENoaWxkID09PSBjaGlsZFtjaGlsZC5sZW5ndGggLSAxXSkge1xuICAgICAgdGhpcy5jb21waWxlTm9kZSgpXG4gICAgfVxuICB9XG5cbiAgdHJhdmVyc2VFbGVtZW50IChwYXJlbnQsIGxhc3ROb2RlLCBpc0ZpcnN0KSB7XG4gICAgaWYgKGlzRmlyc3QpIHtcbiAgICAgIGlmICghcGFyZW50LmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICB0aGlzLmNvbXBpbGVOb2RlKClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChsYXN0Tm9kZSlcbiAgICAgIGlmIChwYXJlbnQgPT09IHRoaXMuc2pmLl9lbCkge1xuICAgICAgICBpZiAoIXBhcmVudC5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBjaGlsZCA9IHBhcmVudC5jaGlsZHJlblxuICAgIGxldCBjaGlsZExlbiA9IGNoaWxkLmxlbmd0aFxuICAgIGlmIChjaGlsZExlbikge1xuICAgICAgZm9yICh2YXIgaSA9IGNoaWxkTGVuIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgbGV0IG5vZGUgPSBjaGlsZFtpXVxuICAgICAgICBpZiAoIW5vZGUpIHtcbiAgICAgICAgICBpZiAocGFyZW50ID09PSB0aGlzLnNqZi5fZWwgJiYgaSA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY29tcGlsZU5vZGUoKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlLmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICAgIHZhciBzZWFyY2hOb2RlID0gdGhpcy5zZWFyY2hMb25lQ2hpbGQobm9kZSlbMF1cbiAgICAgICAgICB0aGlzLnNqZi5fdW5jb21waWxlTm9kZXMucHVzaCh7XG4gICAgICAgICAgICBjaGVjazogc2VhcmNoTm9kZSwgXG4gICAgICAgICAgICBzZWFyY2g6IHNlYXJjaE5vZGUsIFxuICAgICAgICAgICAgcGFyZW50OiBzZWFyY2hOb2RlLnBhcmVudE5vZGVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHRoaXMuc2VhcmNoTm9kZSA9IFtdXG4gICAgICAgICAgdGhpcy50cmF2ZXJzZUVsZW1lbnQoc2VhcmNoTm9kZS5wYXJlbnROb2RlLCBzZWFyY2hOb2RlLCBmYWxzZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnNqZi5fdW5jb21waWxlTm9kZXMucHVzaCh7XG4gICAgICAgICAgICBjaGVjazogbm9kZSwgXG4gICAgICAgICAgICBzZWFyY2g6IG5vZGUsIFxuICAgICAgICAgICAgcGFyZW50OiBub2RlLnBhcmVudE5vZGVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHRoaXMudHJhdmVyc2VFbGVtZW50KG5vZGUucGFyZW50Tm9kZSwgbm9kZSwgZmFsc2UpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzLnB1c2goe1xuICAgICAgICBjaGVjazogcGFyZW50LCBcbiAgICAgICAgc2VhcmNoOiBwYXJlbnQsIFxuICAgICAgICBwYXJlbnQ6IHBhcmVudC5wYXJlbnROb2RlXG4gICAgICB9KVxuICAgICAgdGhpcy50cmF2ZXJzZUVsZW1lbnQocGFyZW50LnBhcmVudE5vZGUsIHBhcmVudCwgZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgc2VhcmNoTG9uZUNoaWxkIChub2RlKSB7XG4gICAgbGV0IGNoaWxkTGVuID0gbm9kZS5jaGlsZHJlbi5sZW5ndGhcbiAgICBpZiAoY2hpbGRMZW4pIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRMZW47IGkrKykge1xuICAgICAgICBpZiAobm9kZS5jaGlsZHJlbltpXS5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICB0aGlzLnNlYXJjaExvbmVDaGlsZChub2RlLmNoaWxkcmVuW2ldKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLnNlYXJjaE5vZGUucHVzaChub2RlLmNoaWxkcmVuW2NoaWxkTGVuIC0gMV0pXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnNlYXJjaE5vZGVcbiAgfVxuXG4gIGNvbXBpbGVOb2RlICgpIHtcbiAgICBsZXQgaGFzVW5jb21waWxlID0gdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzLmxlbmd0aFxuICAgIGlmIChoYXNVbmNvbXBpbGUpIHtcbiAgICAgIHRoaXMuc2pmLl91bmNvbXBpbGVOb2Rlcy5tYXAodmFsdWUgPT4ge1xuICAgICAgICB0aGlzLmhhc0RpcmVjdGl2ZSh2YWx1ZSlcbiAgICAgIH0pXG4gICAgfVxuICAgIHRoaXMuc2pmLl91bmNvbXBpbGVOb2RlcyA9IFtdXG4gICAgbmV3IGxpbmsodGhpcy5zamYpXG4gIH1cblxuICAvLyDmo4DmtYvmr4/kuKpub2Rl55yL5piv5ZCm57uR5a6a5pyJ5oyH5LukXG4gIGhhc0RpcmVjdGl2ZSAodmFsdWUpIHtcbiAgICBsZXQgY2hlY2tSZWcgPSAvc2pmLS4rPVxcXCIuK1xcXCJ8XFx7XFx7LitcXH1cXH0vXG4gICAgQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKHZhbHVlLmNoZWNrLmNoaWxkTm9kZXMsIG5vZGUgPT4ge1xuICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDMpIHtcbiAgICAgICAgaWYgKGNoZWNrUmVnLnRlc3Qobm9kZS5kYXRhKSkge1xuICAgICAgICAgIHRoaXMuc2pmLl91bmxpbmtOb2Rlcy5wdXNoKHtcbiAgICAgICAgICAgIGNoZWNrOiBub2RlLCBcbiAgICAgICAgICAgIHBhcmVudDogdmFsdWUuY2hlY2ssIFxuICAgICAgICAgICAgbm9kZVR5cGU6ICd0ZXh0Tm9kZSdcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICBpZiAoY2hlY2tSZWcudGVzdCh2YWx1ZS5jaGVjay5jbG9uZU5vZGUoKS5vdXRlckhUTUwpKSB7XG4gICAgICB0aGlzLnNqZi5fdW5saW5rTm9kZXMucHVzaCh2YWx1ZSlcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY29tcGlsZVxuIiwiaW1wb3J0IG9wdGlvbiBmcm9tICcuL29wdGlvbidcbmltcG9ydCByZW5kZXIgZnJvbSAnLi9yZW5kZXInXG5cbmNsYXNzIGxpbmsge1xuICBjb25zdHJ1Y3RvciAoc2pmKSB7XG4gICAgdGhpcy5zamYgPSBzamZcbiAgICBsZXQgaGFzVW5saW5rTm9kZSA9IHRoaXMuc2pmLl91bmxpbmtOb2Rlcy5sZW5ndGhcbiAgICBpZiAoaGFzVW5saW5rTm9kZSkge1xuICAgICAgbGV0IGV4dHJhY3RSZWcgPSAvc2pmLVthLXpdKz1cXFwiW15cIl0rXFxcInxcXHtcXHsuK1xcfVxcfS9nXG4gICAgICB0aGlzLnNqZi5fdW5saW5rTm9kZXMubWFwKCh2YWx1ZSkgPT4ge1xuICAgICAgICBsZXQgZGlyZWN0aXZlcyA9IFtdXG4gICAgICAgIGlmICh2YWx1ZS5ub2RlVHlwZSA9PT0gJ3RleHROb2RlJykge1xuICAgICAgICAgIGRpcmVjdGl2ZXMgPSB2YWx1ZS5jaGVjay5kYXRhLm1hdGNoKGV4dHJhY3RSZWcpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGlyZWN0aXZlcyA9IHZhbHVlLmNoZWNrLmNsb25lTm9kZSgpLm91dGVySFRNTC5tYXRjaChleHRyYWN0UmVnKVxuICAgICAgICB9XG4gICAgICAgIGRpcmVjdGl2ZXMubWFwKGRpcmVjdGl2ZSA9PiB7XG4gICAgICAgICAgdGhpcy5leHRyYWN0RGlyZWN0aXZlKGRpcmVjdGl2ZSwgdmFsdWUpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgICAgdGhpcy5fdW5saW5rTm9kZXMgPSBbXVxuICAgICAgbmV3IHJlbmRlcih0aGlzLnNqZilcbiAgICB9XG4gIH1cblxuICAvLyDmj5Dlj5bmjIfku6RcbiAgZXh0cmFjdERpcmVjdGl2ZSAoZGlyZWN0aXZlLCBub2RlKSB7XG4gICAgbGV0IHNsaWNlcyA9IGRpcmVjdGl2ZS5zcGxpdCgnPScpXG4gICAgLy8g5aaC5p6c5piv5LqL5Lu25bCx55u05o6l6YCa6L+HYWRkRXZlbnRMaXN0ZW5lcui/m+ihjOe7keWumlxuICAgIGlmIChvcHRpb24uc2pmRXZlbnRzLmluZGV4T2Yoc2xpY2VzWzBdKSA+PSAwKSB7XG4gICAgICBsZXQgZXZlbnRNZXMgPSB7XG4gICAgICAgIHR5cGU6ICdldmVudCcsXG4gICAgICAgIHRhcmdldDogbm9kZSxcbiAgICAgICAgbmFtZTogc2xpY2VzWzBdLFxuICAgICAgICBmdW5jOiBzbGljZXNbMV1cbiAgICAgIH1cbiAgICAgIHRoaXMuc2pmLl91bnJlbmRlck5vZGVzLnB1c2goZXZlbnRNZXMpXG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBleHByZXNzaW9uID0gc2xpY2VzWzBdLnJlcGxhY2UoL1tcXHtcXH1dL2csICcnKVxuICAgICAgbGV0IGRpcmVjdGl2ZU5hbWUgPSAnc2pmLXRleHQnXG4gICAgICAvLyDlr7npnZ57e3196L+Z56eN6KGo6L6+5byP6L+b6KGM5Y2V54us5aSE55CGXG4gICAgICBpZiAoIS9cXHtcXHsuK1xcfVxcfS8udGVzdChkaXJlY3RpdmUpKSB7XG4gICAgICAgIGV4cHJlc3Npb24gPSBzbGljZXNbMV0ucmVwbGFjZSgvXFxcIi9nLCAnJylcbiAgICAgICAgZGlyZWN0aXZlTmFtZSA9IHNsaWNlc1swXVxuICAgICAgfVxuICAgICAgdGhpcy5zamYuX3VucmVuZGVyTm9kZXMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdkaXJlY3RpdmUnLFxuICAgICAgICBub2RlOiBub2RlLCBcbiAgICAgICAgZGlyZWN0aXZlOiBkaXJlY3RpdmVOYW1lLCBcbiAgICAgICAgZXhwcmVzc2lvbjogZXhwcmVzc2lvblxuICAgICAgfSlcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbGlua1xuIiwiY29uc3Qgb3B0aW9uID0ge1xuICBwcmlvcml0eToge1xuICAgICdzamYtaWYnOiAyMDAwLFxuICAgICdzamYtc2hvdyc6IDIwMDAsXG4gICAgJ3NqZi1mb3InOiAxMDAwLFxuICAgICdzamYtbW9kZWwnOiAxMCxcbiAgICAnc2pmLXRleHQnOiAxXG4gIH0sXG4gIHNqZkV2ZW50czogW1xuICAgICdzamYtY2xpY2snLCBcbiAgICAnc2pmLW1vdXNlb3ZlcicsIFxuICAgICdzamYtbW91c2VvdXQnLCBcbiAgICAnc2pmLW1vdXNlbW92ZScsIFxuICAgICdzamYtbW91c2VlbnRlcicsXG4gICAgJ3NqZi1tb3VzZWxlYXZlJyxcbiAgICAnc2pmLW1vdXNlZG93bicsXG4gICAgJ3NqZi1tb3VzZXVwJ1xuICBdXG59XG5cbmV4cG9ydCBkZWZhdWx0IG9wdGlvblxuIiwiaW1wb3J0IHV0aWwgZnJvbSAnLi91dGlscydcblxuY29uc3QgbGlua1JlbmRlciA9IHtcbiAgJ3NqZi1pZic6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhbHVlLm5vZGUuc3R5bGUuZGlzcGxheSA9ICghISh2YWx1ZS5leHByZXNzaW9uKSA/ICdibG9jayFpbXBvcnRhbnQnIDogJ25vbmUhaW1wb3J0YW50JylcbiAgfSxcbiAgJ3NqZi1zaG93JzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFsdWUubm9kZS5zdHlsZS5kaXNwbGF5ID0gKCEhKHZhbHVlLmV4cHJlc3Npb24pID8gJ2Jsb2NrIWltcG9ydGFudCcgOiAnbm9uZSFpbXBvcnRhbnQnKVxuICB9LFxuICAnc2pmLWZvcic6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIC8vIOWwhuihqOi+vuW8j+mAmui/h+epuuagvCjkuI3pmZDnqbrmoLzmlbDnm64p57uZ5YiH5byAXG4gICAgbGV0IGxvb3BPYmplY3ROYW1lID0gdmFsdWUuZXhwcmVzc2lvbi5zcGxpdCgvXFxzKy8pWzJdXG4gICAgbGV0IHRvTG9vcE9iamVjdCA9IG51bGxcbiAgICBpZiAodGhpcy5fZGF0YS5oYXNPd25Qcm9wZXJ0eShsb29wT2JqZWN0TmFtZSkpIHtcbiAgICAgIHRvTG9vcE9iamVjdCA9IHRoaXMuX2RhdGFbbG9vcE9iamVjdE5hbWVdXG4gICAgfVxuICAgIC8vIOWIpOaWreW+heW+queOr+eahOaYr+WQpuiDvei/m+ihjOW+queOr1xuICAgIGxldCBpc0xvb3BhYmxlID0gdG9Mb29wT2JqZWN0IGluc3RhbmNlb2YgQXJyYXkgfHwgIWlzTmFOKHRvTG9vcE9iamVjdClcbiAgICBpZiAoIWlzTG9vcGFibGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ3NqZltlcnJvcl06IHRoZSB0b0xvb3BPYmplY3Qgb2Ygc2pmLWZvciBzaG91bGQgYmUgYSBudW1iZXIgb3IgYW4gQXJyYXknKVxuICAgICAgcmV0dXJuIFxuICAgIH1cbiAgICAvLyDliKTmlq3mmK/mlbDnu4Tov5jmmK/mlbDlrZfvvIzku47ogIzotYvlgLxsZW5ndGhcbiAgICBsZXQgaXNBcnJheSA9IHV0aWwuaXNBcnJheSh0b0xvb3BPYmplY3QpXG4gICAgbGV0IGxlbiA9IGlzQXJyYXkgPyB0b0xvb3BPYmplY3QubGVuZ3RoIDogdG9Mb29wT2JqZWN0XG4gICAgdmFsdWUubm9kZS5jaGVjay5yZW1vdmVBdHRyaWJ1dGUoJ3NqZi1mb3InKVxuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGxldCBjbG9uZWROb2RlID0gdmFsdWUubm9kZS5jaGVjay5jbG9uZU5vZGUodHJ1ZSlcbiAgICAgIHZhbHVlLm5vZGUucGFyZW50Lmluc2VydEJlZm9yZShjbG9uZWROb2RlLCB2YWx1ZS5ub2RlLmNoZWNrKVxuICAgIH1cblxuICAgIGlmICh0b0xvb3BPYmplY3QgJiYgaXNBcnJheSkge1xuICAgICAgdGhpcy5fd2F0Y2hlcnMucHVzaCh0b0xvb3BPYmplY3QpXG4gICAgfVxuICB9LFxuICAnc2pmLXRleHQnOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBjb25zb2xlLmxvZyh2YWx1ZSlcbiAgICB2YWx1ZS5ub2RlLmlubmVyVGV4dCA9IHRoaXMuX2RhdGFbdmFsdWUuZXhwcmVzc2lvbl1cbiAgfVxufVxuXG5jbGFzcyByZW5kZXIge1xuICBjb25zdHJ1Y3RvciAoc2pmKSB7XG4gICAgdGhpcy5zamYgPSBzamZcbiAgICB0aGlzLnVuQmluZEV2ZW50cyA9IFtdXG4gICAgdGhpcy51blNvcnREaXJlY3RpdmVzID0gW11cbiAgICBsZXQgaGFzUmVuZGVyID0gdGhpcy5zamYuX3VucmVuZGVyTm9kZXMubGVuZ3RoXG4gICAgaWYgKGhhc1JlbmRlcikge1xuICAgICAgdGhpcy5zamYuX3VucmVuZGVyTm9kZXMubWFwKHZhbCA9PiB7XG4gICAgICAgIHZhbC50eXBlID09PSAnZXZlbnQnID8gdGhpcy51bkJpbmRFdmVudHMucHVzaCh2YWwpIDogdGhpcy51blNvcnREaXJlY3RpdmVzLnB1c2godmFsKVxuICAgICAgdGhpcy5zamYuX3VucmVuZGVyTm9kZXMgPSBbXVxuICAgICAgfSlcbiAgICB9XG4gICAgdGhpcy5zb3J0RGlyZWN0aXZlKClcbiAgfVxuXG4gIHNvcnREaXJlY3RpdmUgKCkge1xuICAgIGxldCBleGVjdXRlUXVldWUgPSB1dGlsLnNvcnRFeGV4dXRlUXVldWUoJ2RpcmVjdGl2ZScsIHRoaXMudW5Tb3J0RGlyZWN0aXZlcylcbiAgICBpZiAoZXhlY3V0ZVF1ZXVlLmxlbmd0aCkge1xuICAgICAgZXhlY3V0ZVF1ZXVlLmZvckVhY2godmFsdWUgPT4ge1xuICAgICAgICBsaW5rUmVuZGVyW3ZhbHVlLmRpcmVjdGl2ZV0uYmluZCh0aGlzLnNqZikodmFsdWUpXG4gICAgICB9KVxuICAgIH1cbiAgICB0aGlzLmJpbmRFdmVudCgpXG4gIH1cblxuICAvLyDnu5Hlrprkuovku7ZcbiAgYmluZEV2ZW50ICgpIHtcbiAgICBsZXQgZXZlbnRRdWVuZSA9IHRoaXMudW5CaW5kRXZlbnRzXG4gICAgaWYgKGV2ZW50UXVlbmUubGVuZ3RoKSB7XG4gICAgICBldmVudFF1ZW5lLm1hcCh2YWwgPT4ge1xuICAgICAgICB2YWwudGFyZ2V0LmNoZWNrLnJlbW92ZUF0dHJpYnV0ZSh2YWwubmFtZSlcbiAgICAgICAgbGV0IGV2ZW50VHlwZSA9IHV0aWwucmVtb3ZlUHJlZml4KHZhbC5uYW1lKVxuICAgICAgICBsZXQgZXZlbnRGdW5jID0gdGhpcy5zamZbJ18nICsgdXRpbC5yZW1vdmVCcmFja2V0cyh2YWwuZnVuYyldXG4gICAgICAgIGlmIChldmVudEZ1bmMpIHtcbiAgICAgICAgICB2YWwudGFyZ2V0LmNoZWNrLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBldmVudEZ1bmMsIGZhbHNlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ3NqZltlcnJvcl06IHRoZSAnICsgdmFsLmZ1bmMgKyAnIGlzIG5vdCBkZWNsYXJlZCcpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHJlbmRlclxuIiwiaW1wb3J0IGNvbXBpbGUgZnJvbSAnLi9jb21waWxlJ1xuXG5jbGFzcyBTamZEYXRhQmluZCB7XG4gIGNvbnN0cnVjdG9yIChwYXJhbSkge1xuICAgIGlmICghcGFyYW0uaGFzT3duUHJvcGVydHkoJ2VsJykgfHwgIXBhcmFtLmhhc093blByb3BlcnR5KCdkYXRhJykpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ3NqZltlcnJvcl06IFRoZXJlIGlzIG5lZWQgYGRhdGFgIGFuZCBgZWxgIGF0dHJpYnV0ZScpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5fZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHBhcmFtLmVsKVxuICAgIHRoaXMuX2RhdGEgPSBwYXJhbS5kYXRhXG4gICAgdGhpcy5fd2F0Y2hlcnMgPSBbXVxuICAgIHRoaXMuX3VuY29tcGlsZU5vZGVzID0gW11cbiAgICB0aGlzLl91bmxpbmtOb2RlcyA9IFtdXG4gICAgdGhpcy5fdW5yZW5kZXJOb2RlcyA9IFtdXG4gICAgZm9yIChsZXQgbWV0aG9kIGluIHBhcmFtLm1ldGhvZHMpIHtcbiAgICAgIC8vIOW8uuWItuWwhuWumuS5ieWcqG1ldGhvZHPkuIrnmoTmlrnms5Xnm7TmjqXnu5HlrprlnKhTamZEYXRhQmluZOS4iu+8jOW5tuS/ruaUuei/meS6m+aWueazleeahHRoaXPmjIflkJHkuLpTamZEYXRhQmluZFxuICAgICAgaWYgKHBhcmFtLm1ldGhvZHMuaGFzT3duUHJvcGVydHkobWV0aG9kKSkge1xuICAgICAgICB0aGlzWydfJyArIG1ldGhvZF0gPSBwYXJhbS5tZXRob2RzW21ldGhvZF0uYmluZCh0aGlzKVxuICAgICAgfVxuICAgIH1cbiAgICBuZXcgY29tcGlsZSh0aGlzLl9lbCwgdGhpcylcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTamZEYXRhQmluZFxuIiwiaW1wb3J0IG9wdGlvbiBmcm9tICcuL29wdGlvbidcblxuY29uc3QgdXRpbCA9IHtcbiAgLy8ganVkZ2UgdGhlIHR5cGUgb2Ygb2JqXG4gIGp1ZGdlVHlwZSAob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopXG4gIH0sXG4gIC8vIHJlbW92ZSB0aGUgcHJlZml4IG9mIHNqZi1cbiAgcmVtb3ZlUHJlZml4IChzdHIpIHtcbiAgICByZXR1cm4gc3RyID0gc3RyLnJlcGxhY2UoL3NqZi0vLCAnJylcbiAgfSxcbiAgLy8gcmVtb3ZlIHRoZSBicmFja2V0cyAoKVxuICByZW1vdmVCcmFja2V0cyAoc3RyKSB7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UoL1xcXCIvZywgJycpXG4gICAgcmV0dXJuIHN0ciA9IHN0ci5yZXBsYWNlKC9cXChcXCkvLCAnJylcbiAgfSxcbiAgc29ydEV4ZXh1dGVRdWV1ZSAocHJvcGVydHksIG9iakFycikge1xuICAgIHJldHVybiBvYmpBcnIuc29ydCgob2JqMSwgb2JqMikgPT4ge1xuICAgICAgbGV0IHZhbDEgPSBvcHRpb24ucHJpb3JpdHlbb2JqMVtwcm9wZXJ0eV1dXG4gICAgICBsZXQgdmFsMiA9IG9wdGlvbi5wcmlvcml0eVtvYmoyW3Byb3BlcnR5XV1cbiAgICAgIHJldHVybiB2YWwyIC0gdmFsMVxuICAgIH0pXG4gIH0sXG4gIGlzQXJyYXkgKGFycikge1xuICAgIHJldHVybiB1dGlsLmp1ZGdlVHlwZShhcnIpID09PSAnW29iamVjdCBBcnJheV0nXG4gIH0sXG4gIGlzU3RhaWN0T2JqZWN0IChvYmopIHtcbiAgICByZXR1cm4gdXRpbC5qdWRnZVR5cGUob2JqKSA9PT0gJ1tvYmplY3QgT2JqZWN0XSdcbiAgfSxcbiAgZGVlcENvcHkgKHNvdXJjZSwgZGVzdCkge1xuICAgIGlmICghdXRpbC5pc0FycmF5KHNvdXJjZSkgJiYgIXV0aWwuaXNTdGFpY3RPYmplY3Qoc291cmNlKSkge1xuICAgICAgdGhyb3cgJ3RoZSBzb3VyY2UgeW91IHN1cHBvcnQgY2FuIG5vdCBiZSBjb3BpZWQnXG4gICAgfVxuXG4gICAgdmFyIGNvcHlTb3VyY2UgPSB1dGlsLmlzQXJyYXkoc291cmNlKSA/IFtdIDoge31cbiAgICBmb3IgKHZhciBwcm9wIGluIHNvdXJjZSkge1xuICAgICAgaWYgKHNvdXJjZS5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICBpZiAodXRpbC5pc0FycmF5KHNvdXJjZVtwcm9wXSkgfHwgdXRpbC5pc1N0YWljdE9iamVjdChzb3VyY2VbcHJvcF0pKSB7XG4gICAgICAgICAgY29weVNvdXJjZVtwcm9wXSA9IHV0aWwuZGVlcENvcHkoc291cmNlW3Byb3BdKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvcHlTb3VyY2VbcHJvcF0gPSBzb3VyY2VbcHJvcF1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjb3B5U291cmNlXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgdXRpbFxuIl19
var _r=_m(5);_g.Sjf=_g.SjfDataBind=_r;return _r;})})(typeof window!=='undefined'?window:(typeof global!=='undefined'?global:(typeof self!=='undefined'?self:this)));