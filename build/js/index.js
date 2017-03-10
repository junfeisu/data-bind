(function(_g){(function(f){if(typeof exports==='object'&&typeof module!=='undefined'){module.exports=f()}else if(typeof define==='function'&&define.amd){define([],f.bind(_g))}else{f()}})(function(define,module,exports){var _m =(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _link = require('./link');

var _link2 = _interopRequireDefault(_link);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var compile = function () {
  // 递归DOM树
  function compile(parent, isFirst, sjf) {
    _classCallCheck(this, compile);

    this.sjf = sjf;
    var child = parent.children;
    var childLen = child.length;
    var rootContent = parent.innerHTML;
    // 如果是第一次遍历并且没有子节点就直接跳过compile
    if (isFirst && !childLen) {
      this.compileNode();
    }
    // console.log('parent:' + parent + ' child length is ' + childLen)
    for (var i = childLen - 1; i >= 0; i--) {
      var node = child[i];
      if (node.children.length) {
        var parentNode = node.parentNode ? node.parentNode : parent;
        this.constructor(node, false, this.sjf);
        this.sjf._uncompileNodes.push({ check: node, search: node, parent: parentNode });
      } else {
        this.sjf._uncompileNodes.push({ check: node, search: node, parent: node.parentNode });
        node.parentNode.removeChild(node);
      }
    }

    this.sjf._el.innerHTML = rootContent;

    // 如果当前节点是这个Sjf实例的根节点的最后一个子节点就跳出递归
    if (this.sjf._el.lastElementChild === child[childLen - 1]) {
      this.compileNode();
    }
  }

  _createClass(compile, [{
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
      console.log(value.search.outerHTML);
      if (checkReg.test(value.check.outerHTML)) {
        this.sjf._unlinkNodes.push(value);
      }
    }
  }]);

  return compile;
}();

exports.default = compile;

},{"./link":2}],2:[function(require,module,exports){
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
          var directives = value.node.outerHTML.match(extractReg);
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

    value.node.removeAttribute('sjf-for');
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
  new _compile2.default(this._el, true, this);
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
  }
};

exports.default = util;

},{"./option":3}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2UvamF2YXNjcmlwdC9jb21waWxlLmpzIiwic291cmNlL2phdmFzY3JpcHQvbGluay5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L29wdGlvbi5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3JlbmRlci5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3NqZkRhdGFCaW5kLmpzIiwic291cmNlL2phdmFzY3JpcHQvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FDOzs7Ozs7OztJQUVNLE87QUFDTDtBQUNBLG1CQUFhLE1BQWIsRUFBcUIsT0FBckIsRUFBOEIsR0FBOUIsRUFBbUM7QUFBQTs7QUFDakMsU0FBSyxHQUFMLEdBQVcsR0FBWDtBQUNBLFFBQUksUUFBUSxPQUFPLFFBQW5CO0FBQ0EsUUFBSSxXQUFXLE1BQU0sTUFBckI7QUFDQSxRQUFJLGNBQWMsT0FBTyxTQUF6QjtBQUNBO0FBQ0EsUUFBSSxXQUFXLENBQUMsUUFBaEIsRUFBMEI7QUFDeEIsV0FBSyxXQUFMO0FBQ0Q7QUFDRDtBQUNBLFNBQUssSUFBSSxJQUFJLFdBQVcsQ0FBeEIsRUFBMkIsS0FBSyxDQUFoQyxFQUFvQyxHQUFwQyxFQUF5QztBQUN2QyxVQUFJLE9BQU8sTUFBTSxDQUFOLENBQVg7QUFDQSxVQUFJLEtBQUssUUFBTCxDQUFjLE1BQWxCLEVBQTBCO0FBQ3hCLFlBQUksYUFBYSxLQUFLLFVBQUwsR0FBa0IsS0FBSyxVQUF2QixHQUFvQyxNQUFyRDtBQUNBLGFBQUssV0FBTCxDQUFpQixJQUFqQixFQUF1QixLQUF2QixFQUE4QixLQUFLLEdBQW5DO0FBQ0EsYUFBSyxHQUFMLENBQVMsZUFBVCxDQUF5QixJQUF6QixDQUE4QixFQUFDLE9BQU8sSUFBUixFQUFjLFFBQVEsSUFBdEIsRUFBNEIsUUFBUSxVQUFwQyxFQUE5QjtBQUNELE9BSkQsTUFJTztBQUNMLGFBQUssR0FBTCxD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RCxHQWJVO0FBY1gsa0JBZFcsNEJBY08sUUFkUCxFQWNpQixNQWRqQixFQWN5QjtBQUNsQyxXQUFPLE9BQU8sSUFBUCxDQUFZLFVBQUMsSUFBRCxFQUFPLElBQVAsRUFBZ0I7QUFDakMsVUFBSSxPQUFPLGlCQUFPLFFBQVAsQ0FBZ0IsS0FBSyxRQUFMLENBQWhCLENBQVg7QUFDQSxVQUFJLE9BQU8saUJBQU8sUUFBUCxDQUFnQixLQUFLLFFBQUwsQ0FBaEIsQ0FBWDtBQUNBLGFBQU8sT0FBTyxJQUFkO0FBQ0QsS0FKTSxDQUFQO0FBS0Q7QUFwQlUsQ0FBYjs7a0JBdUJlLEkiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIGltcG9ydCBsaW5rIGZyb20gJy4vbGluaydcblxuIGNsYXNzIGNvbXBpbGUge1xuICAvLyDpgJLlvZJET03moJFcbiAgY29uc3RydWN0b3IgKHBhcmVudCwgaXNGaXJzdCwgc2pmKSB7XG4gICAgdGhpcy5zamYgPSBzamZcbiAgICBsZXQgY2hpbGQgPSBwYXJlbnQuY2hpbGRyZW5cbiAgICBsZXQgY2hpbGRMZW4gPSBjaGlsZC5sZW5ndGhcbiAgICBsZXQgcm9vdENvbnRlbnQgPSBwYXJlbnQuaW5uZXJIVE1MXG4gICAgLy8g5aaC5p6c5piv56ys5LiA5qyh6YGN5Y6G5bm25LiU5rKh5pyJ5a2Q6IqC54K55bCx55u05o6l6Lez6L+HY29tcGlsZVxuICAgIGlmIChpc0ZpcnN0ICYmICFjaGlsZExlbikge1xuICAgICAgdGhpcy5jb21waWxlTm9kZSgpXG4gICAgfVxuICAgIC8vIGNvbnNvbGUubG9nKCdwYXJlbnQ6JyArIHBhcmVudCArICcgY2hpbGQgbGVuZ3RoIGlzICcgKyBjaGlsZExlbilcbiAgICBmb3IgKGxldCBpID0gY2hpbGRMZW4gLSAxOyBpID49IDAgOyBpLS0pIHtcbiAgICAgIGxldCBub2RlID0gY2hpbGRbaV1cbiAgICAgIGlmIChub2RlLmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICBsZXQgcGFyZW50Tm9kZSA9IG5vZGUucGFyZW50Tm9kZSA/IG5vZGUucGFyZW50Tm9kZSA6IHBhcmVudFxuICAgICAgICB0aGlzLmNvbnN0cnVjdG9yKG5vZGUsIGZhbHNlLCB0aGlzLnNqZilcbiAgICAgICAgdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzLnB1c2goe2NoZWNrOiBub2RlLCBzZWFyY2g6IG5vZGUsIHBhcmVudDogcGFyZW50Tm9kZX0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNqZi5fdW5jb21waWxlTm9kZXMucHVzaCh7Y2hlY2s6IG5vZGUsIHNlYXJjaDogbm9kZSwgcGFyZW50OiBub2RlLnBhcmVudE5vZGV9KVxuICAgICAgICBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNqZi5fZWwuaW5uZXJIVE1MID0gcm9vdENvbnRlbnRcblxuICAgIC8vIOWmguaenOW9k+WJjeiKgueCueaYr+i/meS4qlNqZuWunuS+i+eahOagueiKgueCueeahOacgOWQjuS4gOS4quWtkOiKgueCueWwsei3s+WHuumAkuW9klxuICAgIGlmICh0aGlzLnNqZi5fZWwubGFzdEVsZW1lbnRDaGlsZCA9PT0gY2hpbGRbY2hpbGRMZW4gLSAxXSkge1xuICAgICAgdGhpcy5jb21waWxlTm9kZSgpXG4gICAgfVxuICB9XG5cbiAgY29tcGlsZU5vZGUgKCkge1xuICAgIGNvbnNvbGUubG9nKHRoaXMuc2pmLl91bmNvbXBpbGVOb2RlcylcbiAgICBsZXQgaGFzVW5jb21waWxlID0gdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzLmxlbmd0aFxuICAgIGlmIChoYXNVbmNvbXBpbGUpIHtcbiAgICAgIHRoaXMuc2pmLl91bmNvbXBpbGVOb2Rlcy5mb3JFYWNoKHZhbHVlID0+IHtcbiAgICAgICAgdGhpcy5oYXNEaXJlY3RpdmUodmFsdWUpXG4gICAgICB9KVxuICAgIH1cbiAgICAvLyBuZXcgbGluayh0aGlzLnNqZilcbiAgfVxuXG4gIC8vIOajgOa1i+avj+S4qm5vZGXnnIvmmK/lkKbnu5HlrprmnInmjIfku6RcbiAgaGFzRGlyZWN0aXZlICh2YWx1ZSkge1xuICAgIGxldCBjaGVja1JlZyA9IC9zamYtLis9XFxcIi4rXFxcInxcXHtcXHsuK1xcfVxcfS9cbiAgICBjb25zb2xlLmxvZyh2YWx1ZS5zZWFyY2gub3V0ZXJIVE1MKVxuICAgIGlmIChjaGVja1JlZy50ZXN0KHZhbHVlLmNoZWNrLm91dGVySFRNTCkpIHtcbiAgICAgIHRoaXMuc2pmLl91bmxpbmtOb2Rlcy5wdXNoKHZhbHVlKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjb21waWxlXG4iLCJpbXBvcnQgb3B0aW9uIGZyb20gJy4vb3B0aW9uJ1xuaW1wb3J0IHJlbmRlciBmcm9tICcuL3JlbmRlcidcblxuY2xhc3MgbGluayB7XG4gIGNvbnN0cnVjdG9yIChzamYpIHtcbiAgICB0aGlzLnNqZiA9IHNqZlxuICAgIGxldCBoYXNVbmxpbmtOb2RlID0gdGhpcy5zamYuX3VubGlua05vZGVzLmxlbmd0aFxuICAgIGNvbnNvbGUubG9nKHRoaXMuc2pmLl91bmxpbmtOb2RlcylcbiAgICBpZiAoaGFzVW5saW5rTm9kZSkge1xuICAgICAgbGV0IGV4dHJhY3RSZWcgPSAvc2pmLVthLXpdKz1cXFwiW15cIl0rXFxcInxcXHtcXHsuK1xcfVxcfS9nXG4gICAgICB0aGlzLnNqZi5fdW5saW5rTm9kZXMuZm9yRWFjaCgodmFsdWUpID0+IHtcbiAgICAgICAgbGV0IGRpcmVjdGl2ZXMgPSAodmFsdWUubm9kZS5vdXRlckhUTUwpLm1hdGNoKGV4dHJhY3RSZWcpXG4gICAgICAgIGNvbnNvbGUubG9nKGRpcmVjdGl2ZXMpXG4gICAgICAgIGRpcmVjdGl2ZXMuZm9yRWFjaCh2YWwgPT4ge1xuICAgICAgICAgIHRoaXMuZXh0cmFjdERpcmVjdGl2ZSh2YWwsIHZhbHVlKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICAgIHRoaXMuX3VubGlua05vZGVzID0gW11cbiAgICAgIG5ldyByZW5kZXIodGhpcy5zamYpXG4gICAgfVxuICB9XG5cbiAgLy8g5o+Q5Y+W5oyH5LukXG4gIGV4dHJhY3REaXJlY3RpdmUgKGRpcmVjdGl2ZSwgbm9kZSkge1xuICAgIGxldCBzbGljZXMgPSBkaXJlY3RpdmUuc3BsaXQoJz0nKVxuICAgIC8vIOWmguaenOaYr+S6i+S7tuWwseebtOaOpemAmui/h2FkZEV2ZW50TGlzdGVuZXLov5vooYznu5HlrppcbiAgICBpZiAob3B0aW9uLnNqZkV2ZW50cy5pbmRleE9mKHNsaWNlc1swXSkgPj0gMCkge1xuICAgICAgbGV0IGV2ZW50TWVzID0ge1xuICAgICAgICB0eXBlOiAnZXZlbnQnLFxuICAgICAgICB0YXJnZXQ6IG5vZGUsXG4gICAgICAgIG5hbWU6IHNsaWNlc1swXSxcbiAgICAgICAgZnVuYzogc2xpY2VzWzFdXG4gICAgICB9XG4gICAgICB0aGlzLnNqZi5fdW5yZW5kZXJOb2Rlcy5wdXNoKGV2ZW50TWVzKVxuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgZXhwcmVzc2lvbiA9IHNsaWNlc1swXS5yZXBsYWNlKC9bXFx7XFx9XS9nLCAnJylcbiAgICAgIGxldCBkaXJlY3RpdmVOYW1lID0gJ3NqZi10ZXh0J1xuICAgICAgLy8g5a+56Z2ee3t9fei/meenjeihqOi+vuW8j+i/m+ihjOWNleeLrOWkhOeQhlxuICAgICAgaWYgKCEvXFx7XFx7LitcXH1cXH0vLnRlc3QoZGlyZWN0aXZlKSkge1xuICAgICAgICBleHByZXNzaW9uID0gc2xpY2VzWzFdLnJlcGxhY2UoL1xcXCIvZywgJycpXG4gICAgICAgIGRpcmVjdGl2ZU5hbWUgPSBzbGljZXNbMF1cbiAgICAgIH1cbiAgICAgIHRoaXMuc2pmLl91bnJlbmRlck5vZGVzLnB1c2goe1xuICAgICAgICB0eXBlOiAnZGlyZWN0aXZlJyxcbiAgICAgICAgbm9kZTogbm9kZSwgXG4gICAgICAgIGRpcmVjdGl2ZTogZGlyZWN0aXZlTmFtZSwgXG4gICAgICAgIGV4cHJlc3Npb246IGV4cHJlc3Npb25cbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGxpbmtcbiIsImNvbnN0IG9wdGlvbiA9IHtcbiAgcHJpb3JpdHk6IHtcbiAgICAnc2pmLWlmJzogMjAwMCxcbiAgICAnc2pmLXNob3cnOiAyMDAwLFxuICAgICdzamYtZm9yJzogMTAwMCxcbiAgICAnc2pmLW1vZGVsJzogMTAsXG4gICAgJ3NqZi10ZXh0JzogMVxuICB9LFxuICBzamZFdmVudHM6IFtcbiAgICAnc2pmLWNsaWNrJywgXG4gICAgJ3NqZi1tb3VzZW92ZXInLCBcbiAgICAnc2pmLW1vdXNlb3V0JywgXG4gICAgJ3NqZi1tb3VzZW1vdmUnLCBcbiAgICAnc2pmLW1vdXNlZW50ZXInLFxuICAgICdzamYtbW91c2VsZWF2ZScsXG4gICAgJ3NqZi1tb3VzZWRvd24nLFxuICAgICdzamYtbW91c2V1cCdcbiAgXVxufVxuXG5leHBvcnQgZGVmYXVsdCBvcHRpb25cbiIsImltcG9ydCB1dGlsIGZyb20gJy4vdXRpbHMnXG5cbmNvbnN0IGxpbmtSZW5kZXIgPSB7XG4gICdzamYtaWYnOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YWx1ZS5ub2RlLnN0eWxlLmRpc3BsYXkgPSAoISEodmFsdWUuZXhwcmVzc2lvbikgPyAnYmxvY2shaW1wb3J0YW50JyA6ICdub25lIWltcG9ydGFudCcpXG4gIH0sXG4gICdzamYtc2hvdyc6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhbHVlLm5vZGUuc3R5bGUuZGlzcGxheSA9ICghISh2YWx1ZS5leHByZXNzaW9uKSA/ICdibG9jayFpbXBvcnRhbnQnIDogJ25vbmUhaW1wb3J0YW50JylcbiAgfSxcbiAgJ3NqZi1mb3InOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAvLyDlsIbooajovr7lvI/pgJrov4fnqbrmoLwo5LiN6ZmQ56m65qC85pWw55uuKee7meWIh+W8gFxuICAgIGxldCBsb29wT2JqZWN0TmFtZSA9IHZhbHVlLmV4cHJlc3Npb24uc3BsaXQoL1xccysvKVsyXVxuICAgIGxldCB0b0xvb3BPYmplY3QgPSBudWxsXG4gICAgaWYgKHRoaXMuX2RhdGEuaGFzT3duUHJvcGVydHkobG9vcE9iamVjdE5hbWUpKSB7XG4gICAgICB0b0xvb3BPYmplY3QgPSB0aGlzLl9kYXRhW2xvb3BPYmplY3ROYW1lXVxuICAgIH1cbiAgICAvLyDliKTmlq3lvoXlvqrnjq/nmoTmmK/lkKbog73ov5vooYzlvqrnjq9cbiAgICBsZXQgaXNMb29wYWJsZSA9IHRvTG9vcE9iamVjdCBpbnN0YW5jZW9mIEFycmF5IHx8ICFpc05hTih0b0xvb3BPYmplY3QpXG4gICAgaWYgKCFpc0xvb3BhYmxlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCd0aGUgdG9Mb29wT2JqZWN0IG9mIHNqZi1mb3Igc2hvdWxkIGJlIGEgbnVtYmVyIG9yIGFuIEFycmF5JylcbiAgICAgIHJldHVybiBcbiAgICB9XG4gICAgLy8g5Yik5pat5piv5pWw57uE6L+Y5piv5pWw5a2X77yM5LuO6ICM6LWL5YC8bGVuZ3RoXG4gICAgbGV0IGlzQXJyYXkgPSB1dGlsLmp1ZGdlVHlwZSh0b0xvb3BPYmplY3QpID09PSAnW29iamVjdCBBcnJheV0nXG4gICAgbGV0IGxlbiA9IGlzQXJyYXkgPyB0b0xvb3BPYmplY3QubGVuZ3RoIDogdG9Mb29wT2JqZWN0XG5cbiAgICB2YWx1ZS5ub2RlLnJlbW92ZUF0dHJpYnV0ZSgnc2pmLWZvcicpXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW4gLSAxOyBpKyspIHtcbiAgICAgIGxldCBjbG9uZWROb2RlID0gdmFsdWUubm9kZS5jbG9uZU5vZGUodHJ1ZSlcbiAgICAgIHZhbHVlLm5vZGUucGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUoY2xvbmVkTm9kZSwgdmFsdWUubm9kZSlcbiAgICB9XG5cbiAgICBpZiAodG9Mb29wT2JqZWN0ICYmIGlzQXJyYXkpIHtcbiAgICAgIHRoaXMuX3dhdGNoZXJzLnB1c2godG9Mb29wT2JqZWN0KVxuICAgIH1cbiAgfSxcbiAgJ3NqZi10ZXh0JzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgY29uc29sZS5sb2codmFsdWUpXG4gICAgdmFsdWUubm9kZS5pbm5lclRleHQgPSB0aGlzLl9kYXRhW3ZhbHVlLmV4cHJlc3Npb25dXG4gIH1cbn1cblxuY2xhc3MgcmVuZGVyIHtcbiAgY29uc3RydWN0b3IgKHNqZikge1xuICAgIHRoaXMuc2pmID0gc2pmXG4gICAgdGhpcy51bkJpbmRFdmVudHMgPSBbXVxuICAgIHRoaXMudW5Tb3J0RGlyZWN0aXZlcyA9IFtdXG4gICAgbGV0IGhhc1JlbmRlciA9IHRoaXMuc2pmLl91bnJlbmRlck5vZGVzLmxlbmd0aFxuICAgIGlmIChoYXNSZW5kZXIpIHtcbiAgICAgIHRoaXMuc2pmLl91bnJlbmRlck5vZGVzLmZvckVhY2godmFsID0+IHtcbiAgICAgICAgdmFsLnR5cGUgPT09ICdldmVudCcgPyB0aGlzLnVuQmluZEV2ZW50cy5wdXNoKHZhbCkgOiB0aGlzLnVuU29ydERpcmVjdGl2ZXMucHVzaCh2YWwpXG4gICAgICB9KVxuICAgICAgdGhpcy5zamYuX3VucmVuZGVyTm9kZXMgPSBbXVxuICAgIH1cbiAgICB0aGlzLnNvcnREaXJlY3RpdmUoKVxuICB9XG5cbiAgc29ydERpcmVjdGl2ZSAoKSB7XG4gICAgbGV0IGV4ZWN1dGVRdWV1ZSA9IHV0aWwuc29ydEV4ZXh1dGVRdWV1ZSgnZGlyZWN0aXZlJywgdGhpcy51blNvcnREaXJlY3RpdmVzKVxuICAgIGlmIChleGVjdXRlUXVldWUubGVuZ3RoKSB7XG4gICAgICBleGVjdXRlUXVldWUuZm9yRWFjaCh2YWx1ZSA9PiB7XG4gICAgICAgIGxpbmtSZW5kZXJbdmFsdWUuZGlyZWN0aXZlXS5iaW5kKHRoaXMuc2pmKSh2YWx1ZSlcbiAgICAgIH0pXG4gICAgfVxuICAgIHRoaXMuYmluZEV2ZW50KClcbiAgfVxuXG4gIC8vIOe7keWumuS6i+S7tlxuICBiaW5kRXZlbnQgKCkge1xuICAgIGxldCBldmVudFF1ZW5lID0gdGhpcy51bkJpbmRFdmVudHNcbiAgICBpZiAoZXZlbnRRdWVuZS5sZW5ndGgpIHtcbiAgICAgIGV2ZW50UXVlbmUuZm9yRWFjaCh2YWwgPT4ge1xuICAgICAgICB2YWwudGFyZ2V0LnJlbW92ZUF0dHJpYnV0ZSh2YWwubmFtZSlcbiAgICAgICAgbGV0IGV2ZW50VHlwZSA9IHV0aWwucmVtb3ZlUHJlZml4KHZhbC5uYW1lKVxuICAgICAgICBsZXQgZXZlbnRGdW5jID0gdGhpcy5zamZbJ18nICsgdXRpbC5yZW1vdmVCcmFja2V0cyh2YWwuZnVuYyldXG4gICAgICAgIHZhbC50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGV2ZW50RnVuYywgZmFsc2UpXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCByZW5kZXJcbiIsImltcG9ydCBjb21waWxlIGZyb20gJy4vY29tcGlsZSdcblxuY2xhc3MgU2pmRGF0YUJpbmQge1xuICBjb25zdHJ1Y3RvciAocGFyYW0pIHtcbiAgICBpZiAoIXBhcmFtLmhhc093blByb3BlcnR5KCdlbCcpIHx8ICFwYXJhbS5oYXNPd25Qcm9wZXJ0eSgnZGF0YScpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdzamZbZXJyb3JdOiBUaGVyZSBpcyBuZWVkIGBkYXRhYCBhbmQgYGVsYCBhdHRyaWJ1dGUnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuX2VsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihwYXJhbS5lbClcbiAgICB0aGlzLl9kYXRhID0gcGFyYW0uZGF0YVxuICAgIHRoaXMuX3dhdGNoZXJzID0gW11cbiAgICB0aGlzLl91bmNvbXBpbGVOb2RlcyA9IFtdXG4gICAgdGhpcy5fdW5saW5rTm9kZXMgPSBbXVxuICAgIHRoaXMuX3VucmVuZGVyTm9kZXMgPSBbXVxuICAgIGZvciAobGV0IG1ldGhvZCBpbiBwYXJhbS5tZXRob2RzKSB7XG4gICAgICAvLyDlvLrliLblsIblrprkuYnlnKhtZXRob2Rz5LiK55qE5pa55rOV55u05o6l57uR5a6a5ZyoU2pmRGF0YUJpbmTkuIrvvIzlubbkv67mlLnov5nkupvmlrnms5XnmoR0aGlz5oyH5ZCR5Li6U2pmRGF0YUJpbmRcbiAgICAgIGlmIChwYXJhbS5tZXRob2RzLmhhc093blByb3BlcnR5KG1ldGhvZCkpIHtcbiAgICAgICAgdGhpc1snXycgKyBtZXRob2RdID0gcGFyYW0ubWV0aG9kc1ttZXRob2RdLmJpbmQodGhpcylcbiAgICAgIH1cbiAgICB9XG4gICAgbmV3IGNvbXBpbGUodGhpcy5fZWwsIHRydWUsIHRoaXMpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2pmRGF0YUJpbmRcbiIsImltcG9ydCBvcHRpb24gZnJvbSAnLi9vcHRpb24nXG5cbmNvbnN0IHV0aWwgPSB7XG4gIC8vIGp1ZGdlIHRoZSB0eXBlIG9mIG9ialxuICBqdWRnZVR5cGUgKG9iaikge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKVxuICB9LFxuICAvLyByZW1vdmUgdGhlIHByZWZpeCBvZiBzamYtXG4gIHJlbW92ZVByZWZpeCAoc3RyKSB7XG4gICAgcmV0dXJuIHN0ciA9IHN0ci5yZXBsYWNlKC9zamYtLywgJycpXG4gIH0sXG4gIC8vIHJlbW92ZSB0aGUgYnJhY2tldHMgKClcbiAgcmVtb3ZlQnJhY2tldHMgKHN0cikge1xuICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9cXFwiL2csICcnKVxuICAgIHJldHVybiBzdHIgPSBzdHIucmVwbGFjZSgvXFwoXFwpLywgJycpXG4gIH0sXG4gIHNvcnRFeGV4dXRlUXVldWUgKHByb3BlcnR5LCBvYmpBcnIpIHtcbiAgICByZXR1cm4gb2JqQXJyLnNvcnQoKG9iajEsIG9iajIpID0+IHtcbiAgICAgIGxldCB2YWwxID0gb3B0aW9uLnByaW9yaXR5W29iajFbcHJvcGVydHldXVxuICAgICAgbGV0IHZhbDIgPSBvcHRpb24ucHJpb3JpdHlbb2JqMltwcm9wZXJ0eV1dXG4gICAgICByZXR1cm4gdmFsMiAtIHZhbDFcbiAgICB9KVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHV0aWxcbiJdfQ==
var _r=_m(5);_g.Sjf=_g.SjfDataBind=_r;return _r;})})(typeof window!=='undefined'?window:(typeof global!=='undefined'?global:(typeof self!=='undefined'?self:this)));