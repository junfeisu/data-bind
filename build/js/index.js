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
    this.traverseElement(parent, null, true);
  }

  _createClass(compile, [{
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
            console.log(parent);
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
            this.traverseElement(searchNode.parentNode, searchNode, false, this.sjf);
          } else {
            this.sjf._uncompileNodes.push({
              check: node,
              search: node,
              parent: node.parentNode
            });
            this.traverseElement(node.parentNode, node, false, this.sjf);
          }
        }
      } else {
        this.sjf._uncompileNodes.push({
          check: parent,
          search: parent,
          parent: parent.parentNode
        });
        this.traverseElement(parent.parentNode, parent, false, this.sjf);
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
      var _this = this;

      this.sjf._el.innerHTML = this.rootContent;
      var hasUncompile = this.sjf._uncompileNodes.length;
      if (hasUncompile) {
        this.sjf._uncompileNodes.forEach(function (value) {
          _this.hasDirective(value);
        });
      }
      new _link2.default(this.sjf);
    }

    // 检测每个node看是否绑定有指令

  }, {
    key: 'hasDirective',
    value: function hasDirective(value) {
      var checkReg = /sjf-.+=\".+\"|\{\{.+\}\}/;
      console.log(value.check.outerHTML);
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
    if (hasUnlinkNode) {
      (function () {
        var extractReg = /sjf-[a-z]+=\"[^"]+\"|\{\{.+\}\}/g;
        _this.sjf._unlinkNodes.forEach(function (value) {
          var directives = value.check.outerHTML.match(extractReg);
          directives.forEach(function (val) {
            _this.extractDirective(val, value);
          });
        });
        console.log(_this.sjf._unrenderNodes);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2UvamF2YXNjcmlwdC9jb21waWxlLmpzIiwic291cmNlL2phdmFzY3JpcHQvbGluay5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L29wdGlvbi5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3JlbmRlci5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3NqZkRhdGFCaW5kLmpzIiwic291cmNlL2phdmFzY3JpcHQvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FDOzs7O0FBQ0E7Ozs7Ozs7O0lBRU0sTztBQUNMO0FBQ0EsbUJBQWEsTUFBYixFQUFxQixHQUFyQixFQUEwQjtBQUFBOztBQUN4QixTQUFLLEdBQUwsR0FBVyxHQUFYO0FBQ0EsU0FBSyxVQUFMLEdBQWtCLEVBQWxCO0FBQ0EsU0FBSyxXQUFMLEdBQW1CLEtBQUssR0FBTCxDQUFTLEdBQVQsQ0FBYSxTQUFoQztBQUNBLFNBQUssZUFBTCxDQUFxQixNQUFyQixFQUE2QixJQUE3QixFQUFtQyxJQUFuQztBQUNEOzs7O29DQUVnQixNLEVBQVEsUSxFQUFVLE8sRUFBUztBQUMxQyxVQUFJLE9BQUosRUFBYTtBQUNYLFlBQUksQ0FBQyxPQUFPLFFBQVAsQ0FBZ0IsTUFBckIsRUFBNkI7QUFDM0IsZUFBSyxXQUFMO0FBQ0E7QUFDRDtBQUNGLE9BTEQsTUFLTztBQUNMLGVBQU8sV0FBUCxDQUFtQixRQUFuQjtBQUNBLFlBQUksV0FBVyxLQUFLLEdBQUwsQ0FBUyxHQUF4QixFQUE2QjtBQUMzQixjQUFJLENBQUMsT0FBTyxRQUFQLENBQWdCLE1BQXJCLEVBQTZCO0FBQzNCLG9CQUFRLEdBQVIsQ0FBWSxNQUFaO0FBQ0E7QUFDRDtBQUNGO0FBQ0Y7O0FBRUQsVUFBSSxRQUFRLE9BQU8sUUFBbkI7QUFDQSxVQUFJLFdBQVcsTUFBTSxNQUFyQjtBQUNBLFVBQUksUUFBSixFQUFjO0FBQ1osYUFBSyxJQUFJ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QUFPLElBQVAsQ0FBZCxDQUFuQjtBQUNELFNBRkQsTUFFTztBQUNMLHFCQUFXLElBQVgsSUFBbUIsT0FBTyxJQUFQLENBQW5CO0FBQ0Q7QUFDRjtBQUNGOztBQUVELFdBQU8sVUFBUDtBQUNEO0FBNUNVLENBQWI7O2tCQStDZSxJIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiBpbXBvcnQgbGluayBmcm9tICcuL2xpbmsnXG4gaW1wb3J0IHV0aWwgZnJvbSAnLi91dGlscydcblxuIGNsYXNzIGNvbXBpbGUge1xuICAvLyDpgJLlvZJET03moJFcbiAgY29uc3RydWN0b3IgKHBhcmVudCwgc2pmKSB7XG4gICAgdGhpcy5zamYgPSBzamZcbiAgICB0aGlzLnNlYXJjaE5vZGUgPSBbXVxuICAgIHRoaXMucm9vdENvbnRlbnQgPSB0aGlzLnNqZi5fZWwuaW5uZXJIVE1MXG4gICAgdGhpcy50cmF2ZXJzZUVsZW1lbnQocGFyZW50LCBudWxsLCB0cnVlKVxuICB9XG5cbiAgdHJhdmVyc2VFbGVtZW50IChwYXJlbnQsIGxhc3ROb2RlLCBpc0ZpcnN0KSB7XG4gICAgaWYgKGlzRmlyc3QpIHtcbiAgICAgIGlmICghcGFyZW50LmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICB0aGlzLmNvbXBpbGVOb2RlKClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChsYXN0Tm9kZSlcbiAgICAgIGlmIChwYXJlbnQgPT09IHRoaXMuc2pmLl9lbCkge1xuICAgICAgICBpZiAoIXBhcmVudC5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhwYXJlbnQpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgY2hpbGQgPSBwYXJlbnQuY2hpbGRyZW5cbiAgICBsZXQgY2hpbGRMZW4gPSBjaGlsZC5sZW5ndGhcbiAgICBpZiAoY2hpbGRMZW4pIHtcbiAgICAgIGZvciAodmFyIGkgPSBjaGlsZExlbiAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGxldCBub2RlID0gY2hpbGRbaV1cbiAgICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgICAgaWYgKHBhcmVudCA9PT0gdGhpcy5zamYuX2VsICYmIGkgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNvbXBpbGVOb2RlKClcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobm9kZS5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICB2YXIgc2VhcmNoTm9kZSA9IHRoaXMuc2VhcmNoTG9uZUNoaWxkKG5vZGUpWzBdXG4gICAgICAgICAgdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzLnB1c2goe1xuICAgICAgICAgICAgY2hlY2s6IHNlYXJjaE5vZGUsIFxuICAgICAgICAgICAgc2VhcmNoOiBzZWFyY2hOb2RlLCBcbiAgICAgICAgICAgIHBhcmVudDogc2VhcmNoTm9kZS5wYXJlbnROb2RlXG4gICAgICAgICAgfSlcbiAgICAgICAgICB0aGlzLnNlYXJjaE5vZGUgPSBbXVxuICAgICAgICAgIHRoaXMudHJhdmVyc2VFbGVtZW50KHNlYXJjaE5vZGUucGFyZW50Tm9kZSwgc2VhcmNoTm9kZSwgZmFsc2UsIHRoaXMuc2pmKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuc2pmLl91bmNvbXBpbGVOb2Rlcy5wdXNoKHtcbiAgICAgICAgICAgIGNoZWNrOiBub2RlLCBcbiAgICAgICAgICAgIHNlYXJjaDogbm9kZSwgXG4gICAgICAgICAgICBwYXJlbnQ6IG5vZGUucGFyZW50Tm9kZVxuICAgICAgICAgIH0pXG4gICAgICAgICAgdGhpcy50cmF2ZXJzZUVsZW1lbnQobm9kZS5wYXJlbnROb2RlLCBub2RlLCBmYWxzZSwgdGhpcy5zamYpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzLnB1c2goe1xuICAgICAgICBjaGVjazogcGFyZW50LCBcbiAgICAgICAgc2VhcmNoOiBwYXJlbnQsIFxuICAgICAgICBwYXJlbnQ6IHBhcmVudC5wYXJlbnROb2RlXG4gICAgICB9KVxuICAgICAgdGhpcy50cmF2ZXJzZUVsZW1lbnQocGFyZW50LnBhcmVudE5vZGUsIHBhcmVudCwgZmFsc2UsIHRoaXMuc2pmKVxuICAgIH1cbiAgfVxuXG4gIHNlYXJjaExvbmVDaGlsZCAobm9kZSkge1xuICAgIGxldCBjaGlsZExlbiA9IG5vZGUuY2hpbGRyZW4ubGVuZ3RoXG4gICAgaWYgKGNoaWxkTGVuKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkTGVuOyBpKyspIHtcbiAgICAgICAgaWYgKG5vZGUuY2hpbGRyZW5baV0uY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy5zZWFyY2hMb25lQ2hpbGQobm9kZS5jaGlsZHJlbltpXSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5zZWFyY2hOb2RlLnB1c2gobm9kZS5jaGlsZHJlbltjaGlsZExlbiAtIDFdKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zZWFyY2hOb2RlXG4gIH1cblxuICBjb21waWxlTm9kZSAoKSB7XG4gICAgdGhpcy5zamYuX2VsLmlubmVySFRNTCA9IHRoaXMucm9vdENvbnRlbnRcbiAgICBsZXQgaGFzVW5jb21waWxlID0gdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzLmxlbmd0aFxuICAgIGlmIChoYXNVbmNvbXBpbGUpIHtcbiAgICAgIHRoaXMuc2pmLl91bmNvbXBpbGVOb2Rlcy5mb3JFYWNoKHZhbHVlID0+IHtcbiAgICAgICAgdGhpcy5oYXNEaXJlY3RpdmUodmFsdWUpXG4gICAgICB9KVxuICAgIH1cbiAgICBuZXcgbGluayh0aGlzLnNqZilcbiAgfVxuXG4gIC8vIOajgOa1i+avj+S4qm5vZGXnnIvmmK/lkKbnu5HlrprmnInmjIfku6RcbiAgaGFzRGlyZWN0aXZlICh2YWx1ZSkge1xuICAgIGxldCBjaGVja1JlZyA9IC9zamYtLis9XFxcIi4rXFxcInxcXHtcXHsuK1xcfVxcfS9cbiAgICBjb25zb2xlLmxvZyh2YWx1ZS5jaGVjay5vdXRlckhUTUwpXG4gICAgaWYgKGNoZWNrUmVnLnRlc3QodmFsdWUuY2hlY2sub3V0ZXJIVE1MKSkge1xuICAgICAgdGhpcy5zamYuX3VubGlua05vZGVzLnB1c2godmFsdWUpXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvbXBpbGVcbiIsImltcG9ydCBvcHRpb24gZnJvbSAnLi9vcHRpb24nXG5pbXBvcnQgcmVuZGVyIGZyb20gJy4vcmVuZGVyJ1xuXG5jbGFzcyBsaW5rIHtcbiAgY29uc3RydWN0b3IgKHNqZikge1xuICAgIHRoaXMuc2pmID0gc2pmXG4gICAgbGV0IGhhc1VubGlua05vZGUgPSB0aGlzLnNqZi5fdW5saW5rTm9kZXMubGVuZ3RoXG4gICAgaWYgKGhhc1VubGlua05vZGUpIHtcbiAgICAgIGxldCBleHRyYWN0UmVnID0gL3NqZi1bYS16XSs9XFxcIlteXCJdK1xcXCJ8XFx7XFx7LitcXH1cXH0vZ1xuICAgICAgdGhpcy5zamYuX3VubGlua05vZGVzLmZvckVhY2goKHZhbHVlKSA9PiB7XG4gICAgICAgIGxldCBkaXJlY3RpdmVzID0gKHZhbHVlLmNoZWNrLm91dGVySFRNTCkubWF0Y2goZXh0cmFjdFJlZylcbiAgICAgICAgZGlyZWN0aXZlcy5mb3JFYWNoKHZhbCA9PiB7XG4gICAgICAgICAgdGhpcy5leHRyYWN0RGlyZWN0aXZlKHZhbCwgdmFsdWUpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgICAgY29uc29sZS5sb2codGhpcy5zamYuX3VucmVuZGVyTm9kZXMpXG4gICAgICB0aGlzLl91bmxpbmtOb2RlcyA9IFtdXG4gICAgICBuZXcgcmVuZGVyKHRoaXMuc2pmKVxuICAgIH1cbiAgfVxuXG4gIC8vIOaPkOWPluaMh+S7pFxuICBleHRyYWN0RGlyZWN0aXZlIChkaXJlY3RpdmUsIG5vZGUpIHtcbiAgICBsZXQgc2xpY2VzID0gZGlyZWN0aXZlLnNwbGl0KCc9JylcbiAgICAvLyDlpoLmnpzmmK/kuovku7blsLHnm7TmjqXpgJrov4dhZGRFdmVudExpc3RlbmVy6L+b6KGM57uR5a6aXG4gICAgaWYgKG9wdGlvbi5zamZFdmVudHMuaW5kZXhPZihzbGljZXNbMF0pID49IDApIHtcbiAgICAgIGxldCBldmVudE1lcyA9IHtcbiAgICAgICAgdHlwZTogJ2V2ZW50JyxcbiAgICAgICAgdGFyZ2V0OiBub2RlLFxuICAgICAgICBuYW1lOiBzbGljZXNbMF0sXG4gICAgICAgIGZ1bmM6IHNsaWNlc1sxXVxuICAgICAgfVxuICAgICAgdGhpcy5zamYuX3VucmVuZGVyTm9kZXMucHVzaChldmVudE1lcylcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGV4cHJlc3Npb24gPSBzbGljZXNbMF0ucmVwbGFjZSgvW1xce1xcfV0vZywgJycpXG4gICAgICBsZXQgZGlyZWN0aXZlTmFtZSA9ICdzamYtdGV4dCdcbiAgICAgIC8vIOWvuemdnnt7fX3ov5nnp43ooajovr7lvI/ov5vooYzljZXni6zlpITnkIZcbiAgICAgIGlmICghL1xce1xcey4rXFx9XFx9Ly50ZXN0KGRpcmVjdGl2ZSkpIHtcbiAgICAgICAgZXhwcmVzc2lvbiA9IHNsaWNlc1sxXS5yZXBsYWNlKC9cXFwiL2csICcnKVxuICAgICAgICBkaXJlY3RpdmVOYW1lID0gc2xpY2VzWzBdXG4gICAgICB9XG4gICAgICB0aGlzLnNqZi5fdW5yZW5kZXJOb2Rlcy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2RpcmVjdGl2ZScsXG4gICAgICAgIG5vZGU6IG5vZGUsIFxuICAgICAgICBkaXJlY3RpdmU6IGRpcmVjdGl2ZU5hbWUsIFxuICAgICAgICBleHByZXNzaW9uOiBleHByZXNzaW9uXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBsaW5rXG4iLCJjb25zdCBvcHRpb24gPSB7XG4gIHByaW9yaXR5OiB7XG4gICAgJ3NqZi1pZic6IDIwMDAsXG4gICAgJ3NqZi1zaG93JzogMjAwMCxcbiAgICAnc2pmLWZvcic6IDEwMDAsXG4gICAgJ3NqZi1tb2RlbCc6IDEwLFxuICAgICdzamYtdGV4dCc6IDFcbiAgfSxcbiAgc2pmRXZlbnRzOiBbXG4gICAgJ3NqZi1jbGljaycsIFxuICAgICdzamYtbW91c2VvdmVyJywgXG4gICAgJ3NqZi1tb3VzZW91dCcsIFxuICAgICdzamYtbW91c2Vtb3ZlJywgXG4gICAgJ3NqZi1tb3VzZWVudGVyJyxcbiAgICAnc2pmLW1vdXNlbGVhdmUnLFxuICAgICdzamYtbW91c2Vkb3duJyxcbiAgICAnc2pmLW1vdXNldXAnXG4gIF1cbn1cblxuZXhwb3J0IGRlZmF1bHQgb3B0aW9uXG4iLCJpbXBvcnQgdXRpbCBmcm9tICcuL3V0aWxzJ1xuXG5jb25zdCBsaW5rUmVuZGVyID0ge1xuICAnc2pmLWlmJzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFsdWUubm9kZS5zdHlsZS5kaXNwbGF5ID0gKCEhKHZhbHVlLmV4cHJlc3Npb24pID8gJ2Jsb2NrIWltcG9ydGFudCcgOiAnbm9uZSFpbXBvcnRhbnQnKVxuICB9LFxuICAnc2pmLXNob3cnOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YWx1ZS5ub2RlLnN0eWxlLmRpc3BsYXkgPSAoISEodmFsdWUuZXhwcmVzc2lvbikgPyAnYmxvY2shaW1wb3J0YW50JyA6ICdub25lIWltcG9ydGFudCcpXG4gIH0sXG4gICdzamYtZm9yJzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgLy8g5bCG6KGo6L6+5byP6YCa6L+H56m65qC8KOS4jemZkOepuuagvOaVsOebrinnu5nliIflvIBcbiAgICBsZXQgbG9vcE9iamVjdE5hbWUgPSB2YWx1ZS5leHByZXNzaW9uLnNwbGl0KC9cXHMrLylbMl1cbiAgICBsZXQgdG9Mb29wT2JqZWN0ID0gbnVsbFxuICAgIGlmICh0aGlzLl9kYXRhLmhhc093blByb3BlcnR5KGxvb3BPYmplY3ROYW1lKSkge1xuICAgICAgdG9Mb29wT2JqZWN0ID0gdGhpcy5fZGF0YVtsb29wT2JqZWN0TmFtZV1cbiAgICB9XG4gICAgLy8g5Yik5pat5b6F5b6q546v55qE5piv5ZCm6IO96L+b6KGM5b6q546vXG4gICAgbGV0IGlzTG9vcGFibGUgPSB0b0xvb3BPYmplY3QgaW5zdGFuY2VvZiBBcnJheSB8fCAhaXNOYU4odG9Mb29wT2JqZWN0KVxuICAgIGlmICghaXNMb29wYWJsZSkge1xuICAgICAgY29uc29sZS5lcnJvcigndGhlIHRvTG9vcE9iamVjdCBvZiBzamYtZm9yIHNob3VsZCBiZSBhIG51bWJlciBvciBhbiBBcnJheScpXG4gICAgICByZXR1cm4gXG4gICAgfVxuICAgIC8vIOWIpOaWreaYr+aVsOe7hOi/mOaYr+aVsOWtl++8jOS7juiAjOi1i+WAvGxlbmd0aFxuICAgIGxldCBpc0FycmF5ID0gdXRpbC5qdWRnZVR5cGUodG9Mb29wT2JqZWN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICAgIGxldCBsZW4gPSBpc0FycmF5ID8gdG9Mb29wT2JqZWN0Lmxlbmd0aCA6IHRvTG9vcE9iamVjdFxuXG4gICAgLy8gdmFsdWUuc2VhcmNoLnJlbW92ZUF0dHJpYnV0ZSgnc2pmLWZvcicpXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW4gLSAxOyBpKyspIHtcbiAgICAgIGxldCBjbG9uZWROb2RlID0gdmFsdWUubm9kZS5jbG9uZU5vZGUodHJ1ZSlcbiAgICAgIHZhbHVlLm5vZGUucGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUoY2xvbmVkTm9kZSwgdmFsdWUubm9kZSlcbiAgICB9XG5cbiAgICBpZiAodG9Mb29wT2JqZWN0ICYmIGlzQXJyYXkpIHtcbiAgICAgIHRoaXMuX3dhdGNoZXJzLnB1c2godG9Mb29wT2JqZWN0KVxuICAgIH1cbiAgfSxcbiAgJ3NqZi10ZXh0JzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgY29uc29sZS5sb2codmFsdWUpXG4gICAgdmFsdWUubm9kZS5pbm5lclRleHQgPSB0aGlzLl9kYXRhW3ZhbHVlLmV4cHJlc3Npb25dXG4gIH1cbn1cblxuY2xhc3MgcmVuZGVyIHtcbiAgY29uc3RydWN0b3IgKHNqZikge1xuICAgIHRoaXMuc2pmID0gc2pmXG4gICAgdGhpcy51bkJpbmRFdmVudHMgPSBbXVxuICAgIHRoaXMudW5Tb3J0RGlyZWN0aXZlcyA9IFtdXG4gICAgbGV0IGhhc1JlbmRlciA9IHRoaXMuc2pmLl91bnJlbmRlck5vZGVzLmxlbmd0aFxuICAgIGlmIChoYXNSZW5kZXIpIHtcbiAgICAgIHRoaXMuc2pmLl91bnJlbmRlck5vZGVzLmZvckVhY2godmFsID0+IHtcbiAgICAgICAgdmFsLnR5cGUgPT09ICdldmVudCcgPyB0aGlzLnVuQmluZEV2ZW50cy5wdXNoKHZhbCkgOiB0aGlzLnVuU29ydERpcmVjdGl2ZXMucHVzaCh2YWwpXG4gICAgICB9KVxuICAgICAgdGhpcy5zamYuX3VucmVuZGVyTm9kZXMgPSBbXVxuICAgIH1cbiAgICB0aGlzLnNvcnREaXJlY3RpdmUoKVxuICB9XG5cbiAgc29ydERpcmVjdGl2ZSAoKSB7XG4gICAgbGV0IGV4ZWN1dGVRdWV1ZSA9IHV0aWwuc29ydEV4ZXh1dGVRdWV1ZSgnZGlyZWN0aXZlJywgdGhpcy51blNvcnREaXJlY3RpdmVzKVxuICAgIGlmIChleGVjdXRlUXVldWUubGVuZ3RoKSB7XG4gICAgICBleGVjdXRlUXVldWUuZm9yRWFjaCh2YWx1ZSA9PiB7XG4gICAgICAgIGxpbmtSZW5kZXJbdmFsdWUuZGlyZWN0aXZlXS5iaW5kKHRoaXMuc2pmKSh2YWx1ZSlcbiAgICAgIH0pXG4gICAgfVxuICAgIHRoaXMuYmluZEV2ZW50KClcbiAgfVxuXG4gIC8vIOe7keWumuS6i+S7tlxuICBiaW5kRXZlbnQgKCkge1xuICAgIGxldCBldmVudFF1ZW5lID0gdGhpcy51bkJpbmRFdmVudHNcbiAgICBpZiAoZXZlbnRRdWVuZS5sZW5ndGgpIHtcbiAgICAgIGV2ZW50UXVlbmUuZm9yRWFjaCh2YWwgPT4ge1xuICAgICAgICB2YWwudGFyZ2V0LnJlbW92ZUF0dHJpYnV0ZSh2YWwubmFtZSlcbiAgICAgICAgbGV0IGV2ZW50VHlwZSA9IHV0aWwucmVtb3ZlUHJlZml4KHZhbC5uYW1lKVxuICAgICAgICBsZXQgZXZlbnRGdW5jID0gdGhpcy5zamZbJ18nICsgdXRpbC5yZW1vdmVCcmFja2V0cyh2YWwuZnVuYyldXG4gICAgICAgIHZhbC50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGV2ZW50RnVuYywgZmFsc2UpXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCByZW5kZXJcbiIsImltcG9ydCBjb21waWxlIGZyb20gJy4vY29tcGlsZSdcblxuY2xhc3MgU2pmRGF0YUJpbmQge1xuICBjb25zdHJ1Y3RvciAocGFyYW0pIHtcbiAgICBpZiAoIXBhcmFtLmhhc093blByb3BlcnR5KCdlbCcpIHx8ICFwYXJhbS5oYXNPd25Qcm9wZXJ0eSgnZGF0YScpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdzamZbZXJyb3JdOiBUaGVyZSBpcyBuZWVkIGBkYXRhYCBhbmQgYGVsYCBhdHRyaWJ1dGUnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuX2VsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihwYXJhbS5lbClcbiAgICB0aGlzLl9kYXRhID0gcGFyYW0uZGF0YVxuICAgIHRoaXMuX3dhdGNoZXJzID0gW11cbiAgICB0aGlzLl91bmNvbXBpbGVOb2RlcyA9IFtdXG4gICAgdGhpcy5fdW5saW5rTm9kZXMgPSBbXVxuICAgIHRoaXMuX3VucmVuZGVyTm9kZXMgPSBbXVxuICAgIGZvciAobGV0IG1ldGhvZCBpbiBwYXJhbS5tZXRob2RzKSB7XG4gICAgICAvLyDlvLrliLblsIblrprkuYnlnKhtZXRob2Rz5LiK55qE5pa55rOV55u05o6l57uR5a6a5ZyoU2pmRGF0YUJpbmTkuIrvvIzlubbkv67mlLnov5nkupvmlrnms5XnmoR0aGlz5oyH5ZCR5Li6U2pmRGF0YUJpbmRcbiAgICAgIGlmIChwYXJhbS5tZXRob2RzLmhhc093blByb3BlcnR5KG1ldGhvZCkpIHtcbiAgICAgICAgdGhpc1snXycgKyBtZXRob2RdID0gcGFyYW0ubWV0aG9kc1ttZXRob2RdLmJpbmQodGhpcylcbiAgICAgIH1cbiAgICB9XG4gICAgbmV3IGNvbXBpbGUodGhpcy5fZWwsIHRoaXMpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2pmRGF0YUJpbmRcbiIsImltcG9ydCBvcHRpb24gZnJvbSAnLi9vcHRpb24nXG5cbmNvbnN0IHV0aWwgPSB7XG4gIC8vIGp1ZGdlIHRoZSB0eXBlIG9mIG9ialxuICBqdWRnZVR5cGUgKG9iaikge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKVxuICB9LFxuICAvLyByZW1vdmUgdGhlIHByZWZpeCBvZiBzamYtXG4gIHJlbW92ZVByZWZpeCAoc3RyKSB7XG4gICAgcmV0dXJuIHN0ciA9IHN0ci5yZXBsYWNlKC9zamYtLywgJycpXG4gIH0sXG4gIC8vIHJlbW92ZSB0aGUgYnJhY2tldHMgKClcbiAgcmVtb3ZlQnJhY2tldHMgKHN0cikge1xuICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9cXFwiL2csICcnKVxuICAgIHJldHVybiBzdHIgPSBzdHIucmVwbGFjZSgvXFwoXFwpLywgJycpXG4gIH0sXG4gIHNvcnRFeGV4dXRlUXVldWUgKHByb3BlcnR5LCBvYmpBcnIpIHtcbiAgICByZXR1cm4gb2JqQXJyLnNvcnQoKG9iajEsIG9iajIpID0+IHtcbiAgICAgIGxldCB2YWwxID0gb3B0aW9uLnByaW9yaXR5W29iajFbcHJvcGVydHldXVxuICAgICAgbGV0IHZhbDIgPSBvcHRpb24ucHJpb3JpdHlbb2JqMltwcm9wZXJ0eV1dXG4gICAgICByZXR1cm4gdmFsMiAtIHZhbDFcbiAgICB9KVxuICB9LFxuICBpc0FycmF5IChhcnIpIHtcbiAgICByZXR1cm4gdXRpbC5qdWRnZVR5cGUoYXJyKSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICB9LFxuICBpc1N0YWljdE9iamVjdCAob2JqKSB7XG4gICAgcmV0dXJuIHV0aWwuanVkZ2VUeXBlKG9iaikgPT09ICdbb2JqZWN0IE9iamVjdF0nXG4gIH0sXG4gIGRlZXBDb3B5IChzb3VyY2UsIGRlc3QpIHtcbiAgICBpZiAoIXV0aWwuaXNBcnJheShzb3VyY2UpICYmICF1dGlsLmlzU3RhaWN0T2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHRocm93ICd0aGUgc291cmNlIHlvdSBzdXBwb3J0IGNhbiBub3QgYmUgY29waWVkJ1xuICAgIH1cblxuICAgIHZhciBjb3B5U291cmNlID0gdXRpbC5pc0FycmF5KHNvdXJjZSkgPyBbXSA6IHt9XG4gICAgZm9yICh2YXIgcHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgaWYgKHV0aWwuaXNBcnJheShzb3VyY2VbcHJvcF0pIHx8IHV0aWwuaXNTdGFpY3RPYmplY3Qoc291cmNlW3Byb3BdKSkge1xuICAgICAgICAgIGNvcHlTb3VyY2VbcHJvcF0gPSB1dGlsLmRlZXBDb3B5KHNvdXJjZVtwcm9wXSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb3B5U291cmNlW3Byb3BdID0gc291cmNlW3Byb3BdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY29weVNvdXJjZVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHV0aWxcbiJdfQ==
var _r=_m(5);_g.Sjf=_g.SjfDataBind=_r;return _r;})})(typeof window!=='undefined'?window:(typeof global!=='undefined'?global:(typeof self!=='undefined'?self:this)));