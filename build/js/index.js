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
      // new link(this.sjf)
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2UvamF2YXNjcmlwdC9jb21waWxlLmpzIiwic291cmNlL2phdmFzY3JpcHQvbGluay5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L29wdGlvbi5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3JlbmRlci5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3NqZkRhdGFCaW5kLmpzIiwic291cmNlL2phdmFzY3JpcHQvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FDOzs7O0FBQ0E7Ozs7Ozs7O0lBRU0sTztBQUNMO0FBQ0EsbUJBQWEsTUFBYixFQUFxQixHQUFyQixFQUEwQjtBQUFBOztBQUN4QixTQUFLLEdBQUwsR0FBVyxHQUFYO0FBQ0EsU0FBSyxVQUFMLEdBQWtCLEVBQWxCO0FBQ0EsU0FBSyxXQUFMLEdBQW1CLEtBQUssR0FBTCxDQUFTLEdBQVQsQ0FBYSxTQUFoQztBQUNBLFNBQUssZUFBTCxDQUFxQixNQUFyQixFQUE2QixJQUE3QixFQUFtQyxJQUFuQztBQUNEOzs7O29DQUVnQixNLEVBQVEsUSxFQUFVLE8sRUFBUztBQUMxQyxVQUFJLE9BQUosRUFBYTtBQUNYLFlBQUksQ0FBQyxPQUFPLFFBQVAsQ0FBZ0IsTUFBckIsRUFBNkI7QUFDM0IsZUFBSyxXQUFMO0FBQ0E7QUFDRDtBQUNGLE9BTEQsTUFLTztBQUNMLGVBQU8sV0FBUCxDQUFtQixRQUFuQjtBQUNBLFlBQUksV0FBVyxLQUFLLEdBQUwsQ0FBUyxHQUF4QixFQUE2QjtBQUMzQixjQUFJLENBQUMsT0FBTyxRQUFQLENBQWdCLE1BQXJCLEVBQTZCO0FBQzNCLG9CQUFRLEdBQVIsQ0FBWSxNQUFaO0FBQ0E7QUFDRDtBQUNGO0FBQ0Y7O0FBRUQsVUFBSSxRQUFRLE9BQU8sUUFBbkI7QUFDQSxVQUFJLFdBQVcsTUFBTSxNQUFyQjtBQUNBLFVBQUksUUFBSixFQUFjO0FBQ1osYUFBSyxJQUFJ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QUwsQ0FBYyxPQUFPLElBQVAsQ0FBZCxDQUFuQjtBQUNELFNBRkQsTUFFTztBQUNMLHFCQUFXLElBQVgsSUFBbUIsT0FBTyxJQUFQLENBQW5CO0FBQ0Q7QUFDRjtBQUNGOztBQUVELFdBQU8sVUFBUDtBQUNEO0FBNUNVLENBQWI7O2tCQStDZSxJIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiBpbXBvcnQgbGluayBmcm9tICcuL2xpbmsnXG4gaW1wb3J0IHV0aWwgZnJvbSAnLi91dGlscydcblxuIGNsYXNzIGNvbXBpbGUge1xuICAvLyDpgJLlvZJET03moJFcbiAgY29uc3RydWN0b3IgKHBhcmVudCwgc2pmKSB7XG4gICAgdGhpcy5zamYgPSBzamZcbiAgICB0aGlzLnNlYXJjaE5vZGUgPSBbXVxuICAgIHRoaXMucm9vdENvbnRlbnQgPSB0aGlzLnNqZi5fZWwuaW5uZXJIVE1MXG4gICAgdGhpcy50cmF2ZXJzZUVsZW1lbnQocGFyZW50LCBudWxsLCB0cnVlKVxuICB9XG5cbiAgdHJhdmVyc2VFbGVtZW50IChwYXJlbnQsIGxhc3ROb2RlLCBpc0ZpcnN0KSB7XG4gICAgaWYgKGlzRmlyc3QpIHtcbiAgICAgIGlmICghcGFyZW50LmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICB0aGlzLmNvbXBpbGVOb2RlKClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChsYXN0Tm9kZSlcbiAgICAgIGlmIChwYXJlbnQgPT09IHRoaXMuc2pmLl9lbCkge1xuICAgICAgICBpZiAoIXBhcmVudC5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhwYXJlbnQpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgY2hpbGQgPSBwYXJlbnQuY2hpbGRyZW5cbiAgICBsZXQgY2hpbGRMZW4gPSBjaGlsZC5sZW5ndGhcbiAgICBpZiAoY2hpbGRMZW4pIHtcbiAgICAgIGZvciAodmFyIGkgPSBjaGlsZExlbiAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGxldCBub2RlID0gY2hpbGRbaV1cbiAgICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgICAgaWYgKHBhcmVudCA9PT0gdGhpcy5zamYuX2VsICYmIGkgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNvbXBpbGVOb2RlKClcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobm9kZS5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICB2YXIgc2VhcmNoTm9kZSA9IHRoaXMuc2VhcmNoTG9uZUNoaWxkKG5vZGUpWzBdXG4gICAgICAgICAgdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzLnB1c2goe1xuICAgICAgICAgICAgY2hlY2s6IHNlYXJjaE5vZGUsIFxuICAgICAgICAgICAgc2VhcmNoOiBzZWFyY2hOb2RlLCBcbiAgICAgICAgICAgIHBhcmVudDogc2VhcmNoTm9kZS5wYXJlbnROb2RlXG4gICAgICAgICAgfSlcbiAgICAgICAgICB0aGlzLnNlYXJjaE5vZGUgPSBbXVxuICAgICAgICAgIHRoaXMudHJhdmVyc2VFbGVtZW50KHNlYXJjaE5vZGUucGFyZW50Tm9kZSwgc2VhcmNoTm9kZSwgZmFsc2UsIHRoaXMuc2pmKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuc2pmLl91bmNvbXBpbGVOb2Rlcy5wdXNoKHtcbiAgICAgICAgICAgIGNoZWNrOiBub2RlLCBcbiAgICAgICAgICAgIHNlYXJjaDogbm9kZSwgXG4gICAgICAgICAgICBwYXJlbnQ6IG5vZGUucGFyZW50Tm9kZVxuICAgICAgICAgIH0pXG4gICAgICAgICAgdGhpcy50cmF2ZXJzZUVsZW1lbnQobm9kZS5wYXJlbnROb2RlLCBub2RlLCBmYWxzZSwgdGhpcy5zamYpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzLnB1c2goe1xuICAgICAgICBjaGVjazogcGFyZW50LCBcbiAgICAgICAgc2VhcmNoOiBwYXJlbnQsIFxuICAgICAgICBwYXJlbnQ6IHBhcmVudC5wYXJlbnROb2RlXG4gICAgICB9KVxuICAgICAgdGhpcy50cmF2ZXJzZUVsZW1lbnQocGFyZW50LnBhcmVudE5vZGUsIHBhcmVudCwgZmFsc2UsIHRoaXMuc2pmKVxuICAgIH1cbiAgfVxuXG4gIHNlYXJjaExvbmVDaGlsZCAobm9kZSkge1xuICAgIGxldCBjaGlsZExlbiA9IG5vZGUuY2hpbGRyZW4ubGVuZ3RoXG4gICAgaWYgKGNoaWxkTGVuKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkTGVuOyBpKyspIHtcbiAgICAgICAgaWYgKG5vZGUuY2hpbGRyZW5baV0uY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy5zZWFyY2hMb25lQ2hpbGQobm9kZS5jaGlsZHJlbltpXSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5zZWFyY2hOb2RlLnB1c2gobm9kZS5jaGlsZHJlbltjaGlsZExlbiAtIDFdKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zZWFyY2hOb2RlXG4gIH1cblxuICBjb21waWxlTm9kZSAoKSB7XG4gICAgdGhpcy5zamYuX2VsLmlubmVySFRNTCA9IHRoaXMucm9vdENvbnRlbnRcbiAgICBsZXQgaGFzVW5jb21waWxlID0gdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzLmxlbmd0aFxuICAgIGlmIChoYXNVbmNvbXBpbGUpIHtcbiAgICAgIHRoaXMuc2pmLl91bmNvbXBpbGVOb2Rlcy5mb3JFYWNoKHZhbHVlID0+IHtcbiAgICAgICAgdGhpcy5oYXNEaXJlY3RpdmUodmFsdWUpXG4gICAgICB9KVxuICAgIH1cbiAgICAvLyBuZXcgbGluayh0aGlzLnNqZilcbiAgfVxuXG4gIC8vIOajgOa1i+avj+S4qm5vZGXnnIvmmK/lkKbnu5HlrprmnInmjIfku6RcbiAgaGFzRGlyZWN0aXZlICh2YWx1ZSkge1xuICAgIGxldCBjaGVja1JlZyA9IC9zamYtLis9XFxcIi4rXFxcInxcXHtcXHsuK1xcfVxcfS9cbiAgICBjb25zb2xlLmxvZyh2YWx1ZS5jaGVjay5vdXRlckhUTUwpXG4gICAgaWYgKGNoZWNrUmVnLnRlc3QodmFsdWUuY2hlY2sub3V0ZXJIVE1MKSkge1xuICAgICAgdGhpcy5zamYuX3VubGlua05vZGVzLnB1c2godmFsdWUpXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvbXBpbGVcbiIsImltcG9ydCBvcHRpb24gZnJvbSAnLi9vcHRpb24nXG5pbXBvcnQgcmVuZGVyIGZyb20gJy4vcmVuZGVyJ1xuXG5jbGFzcyBsaW5rIHtcbiAgY29uc3RydWN0b3IgKHNqZikge1xuICAgIHRoaXMuc2pmID0gc2pmXG4gICAgbGV0IGhhc1VubGlua05vZGUgPSB0aGlzLnNqZi5fdW5saW5rTm9kZXMubGVuZ3RoXG4gICAgY29uc29sZS5sb2codGhpcy5zamYuX3VubGlua05vZGVzKVxuICAgIGlmIChoYXNVbmxpbmtOb2RlKSB7XG4gICAgICBsZXQgZXh0cmFjdFJlZyA9IC9zamYtW2Etel0rPVxcXCJbXlwiXStcXFwifFxce1xcey4rXFx9XFx9L2dcbiAgICAgIHRoaXMuc2pmLl91bmxpbmtOb2Rlcy5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgICAgICBsZXQgZGlyZWN0aXZlcyA9ICh2YWx1ZS5jaGVjay5vdXRlckhUTUwpLm1hdGNoKGV4dHJhY3RSZWcpXG4gICAgICAgIGNvbnNvbGUubG9nKGRpcmVjdGl2ZXMpXG4gICAgICAgIGRpcmVjdGl2ZXMuZm9yRWFjaCh2YWwgPT4ge1xuICAgICAgICAgIHRoaXMuZXh0cmFjdERpcmVjdGl2ZSh2YWwsIHZhbHVlKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICAgIHRoaXMuX3VubGlua05vZGVzID0gW11cbiAgICAgIG5ldyByZW5kZXIodGhpcy5zamYpXG4gICAgfVxuICB9XG5cbiAgLy8g5o+Q5Y+W5oyH5LukXG4gIGV4dHJhY3REaXJlY3RpdmUgKGRpcmVjdGl2ZSwgbm9kZSkge1xuICAgIGxldCBzbGljZXMgPSBkaXJlY3RpdmUuc3BsaXQoJz0nKVxuICAgIC8vIOWmguaenOaYr+S6i+S7tuWwseebtOaOpemAmui/h2FkZEV2ZW50TGlzdGVuZXLov5vooYznu5HlrppcbiAgICBpZiAob3B0aW9uLnNqZkV2ZW50cy5pbmRleE9mKHNsaWNlc1swXSkgPj0gMCkge1xuICAgICAgbGV0IGV2ZW50TWVzID0ge1xuICAgICAgICB0eXBlOiAnZXZlbnQnLFxuICAgICAgICB0YXJnZXQ6IG5vZGUsXG4gICAgICAgIG5hbWU6IHNsaWNlc1swXSxcbiAgICAgICAgZnVuYzogc2xpY2VzWzFdXG4gICAgICB9XG4gICAgICB0aGlzLnNqZi5fdW5yZW5kZXJOb2Rlcy5wdXNoKGV2ZW50TWVzKVxuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgZXhwcmVzc2lvbiA9IHNsaWNlc1swXS5yZXBsYWNlKC9bXFx7XFx9XS9nLCAnJylcbiAgICAgIGxldCBkaXJlY3RpdmVOYW1lID0gJ3NqZi10ZXh0J1xuICAgICAgLy8g5a+56Z2ee3t9fei/meenjeihqOi+vuW8j+i/m+ihjOWNleeLrOWkhOeQhlxuICAgICAgaWYgKCEvXFx7XFx7LitcXH1cXH0vLnRlc3QoZGlyZWN0aXZlKSkge1xuICAgICAgICBleHByZXNzaW9uID0gc2xpY2VzWzFdLnJlcGxhY2UoL1xcXCIvZywgJycpXG4gICAgICAgIGRpcmVjdGl2ZU5hbWUgPSBzbGljZXNbMF1cbiAgICAgIH1cbiAgICAgIHRoaXMuc2pmLl91bnJlbmRlck5vZGVzLnB1c2goe1xuICAgICAgICB0eXBlOiAnZGlyZWN0aXZlJyxcbiAgICAgICAgbm9kZTogbm9kZSwgXG4gICAgICAgIGRpcmVjdGl2ZTogZGlyZWN0aXZlTmFtZSwgXG4gICAgICAgIGV4cHJlc3Npb246IGV4cHJlc3Npb25cbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGxpbmtcbiIsImNvbnN0IG9wdGlvbiA9IHtcbiAgcHJpb3JpdHk6IHtcbiAgICAnc2pmLWlmJzogMjAwMCxcbiAgICAnc2pmLXNob3cnOiAyMDAwLFxuICAgICdzamYtZm9yJzogMTAwMCxcbiAgICAnc2pmLW1vZGVsJzogMTAsXG4gICAgJ3NqZi10ZXh0JzogMVxuICB9LFxuICBzamZFdmVudHM6IFtcbiAgICAnc2pmLWNsaWNrJywgXG4gICAgJ3NqZi1tb3VzZW92ZXInLCBcbiAgICAnc2pmLW1vdXNlb3V0JywgXG4gICAgJ3NqZi1tb3VzZW1vdmUnLCBcbiAgICAnc2pmLW1vdXNlZW50ZXInLFxuICAgICdzamYtbW91c2VsZWF2ZScsXG4gICAgJ3NqZi1tb3VzZWRvd24nLFxuICAgICdzamYtbW91c2V1cCdcbiAgXVxufVxuXG5leHBvcnQgZGVmYXVsdCBvcHRpb25cbiIsImltcG9ydCB1dGlsIGZyb20gJy4vdXRpbHMnXG5cbmNvbnN0IGxpbmtSZW5kZXIgPSB7XG4gICdzamYtaWYnOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YWx1ZS5ub2RlLnN0eWxlLmRpc3BsYXkgPSAoISEodmFsdWUuZXhwcmVzc2lvbikgPyAnYmxvY2shaW1wb3J0YW50JyA6ICdub25lIWltcG9ydGFudCcpXG4gIH0sXG4gICdzamYtc2hvdyc6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhbHVlLm5vZGUuc3R5bGUuZGlzcGxheSA9ICghISh2YWx1ZS5leHByZXNzaW9uKSA/ICdibG9jayFpbXBvcnRhbnQnIDogJ25vbmUhaW1wb3J0YW50JylcbiAgfSxcbiAgJ3NqZi1mb3InOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAvLyDlsIbooajovr7lvI/pgJrov4fnqbrmoLwo5LiN6ZmQ56m65qC85pWw55uuKee7meWIh+W8gFxuICAgIGxldCBsb29wT2JqZWN0TmFtZSA9IHZhbHVlLmV4cHJlc3Npb24uc3BsaXQoL1xccysvKVsyXVxuICAgIGxldCB0b0xvb3BPYmplY3QgPSBudWxsXG4gICAgaWYgKHRoaXMuX2RhdGEuaGFzT3duUHJvcGVydHkobG9vcE9iamVjdE5hbWUpKSB7XG4gICAgICB0b0xvb3BPYmplY3QgPSB0aGlzLl9kYXRhW2xvb3BPYmplY3ROYW1lXVxuICAgIH1cbiAgICAvLyDliKTmlq3lvoXlvqrnjq/nmoTmmK/lkKbog73ov5vooYzlvqrnjq9cbiAgICBsZXQgaXNMb29wYWJsZSA9IHRvTG9vcE9iamVjdCBpbnN0YW5jZW9mIEFycmF5IHx8ICFpc05hTih0b0xvb3BPYmplY3QpXG4gICAgaWYgKCFpc0xvb3BhYmxlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCd0aGUgdG9Mb29wT2JqZWN0IG9mIHNqZi1mb3Igc2hvdWxkIGJlIGEgbnVtYmVyIG9yIGFuIEFycmF5JylcbiAgICAgIHJldHVybiBcbiAgICB9XG4gICAgLy8g5Yik5pat5piv5pWw57uE6L+Y5piv5pWw5a2X77yM5LuO6ICM6LWL5YC8bGVuZ3RoXG4gICAgbGV0IGlzQXJyYXkgPSB1dGlsLmp1ZGdlVHlwZSh0b0xvb3BPYmplY3QpID09PSAnW29iamVjdCBBcnJheV0nXG4gICAgbGV0IGxlbiA9IGlzQXJyYXkgPyB0b0xvb3BPYmplY3QubGVuZ3RoIDogdG9Mb29wT2JqZWN0XG5cbiAgICAvLyB2YWx1ZS5zZWFyY2gucmVtb3ZlQXR0cmlidXRlKCdzamYtZm9yJylcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbiAtIDE7IGkrKykge1xuICAgICAgbGV0IGNsb25lZE5vZGUgPSB2YWx1ZS5ub2RlLmNsb25lTm9kZSh0cnVlKVxuICAgICAgdmFsdWUubm9kZS5wYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShjbG9uZWROb2RlLCB2YWx1ZS5ub2RlKVxuICAgIH1cblxuICAgIGlmICh0b0xvb3BPYmplY3QgJiYgaXNBcnJheSkge1xuICAgICAgdGhpcy5fd2F0Y2hlcnMucHVzaCh0b0xvb3BPYmplY3QpXG4gICAgfVxuICB9LFxuICAnc2pmLXRleHQnOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBjb25zb2xlLmxvZyh2YWx1ZSlcbiAgICB2YWx1ZS5ub2RlLmlubmVyVGV4dCA9IHRoaXMuX2RhdGFbdmFsdWUuZXhwcmVzc2lvbl1cbiAgfVxufVxuXG5jbGFzcyByZW5kZXIge1xuICBjb25zdHJ1Y3RvciAoc2pmKSB7XG4gICAgdGhpcy5zamYgPSBzamZcbiAgICB0aGlzLnVuQmluZEV2ZW50cyA9IFtdXG4gICAgdGhpcy51blNvcnREaXJlY3RpdmVzID0gW11cbiAgICBsZXQgaGFzUmVuZGVyID0gdGhpcy5zamYuX3VucmVuZGVyTm9kZXMubGVuZ3RoXG4gICAgaWYgKGhhc1JlbmRlcikge1xuICAgICAgdGhpcy5zamYuX3VucmVuZGVyTm9kZXMuZm9yRWFjaCh2YWwgPT4ge1xuICAgICAgICB2YWwudHlwZSA9PT0gJ2V2ZW50JyA/IHRoaXMudW5CaW5kRXZlbnRzLnB1c2godmFsKSA6IHRoaXMudW5Tb3J0RGlyZWN0aXZlcy5wdXNoKHZhbClcbiAgICAgIH0pXG4gICAgICB0aGlzLnNqZi5fdW5yZW5kZXJOb2RlcyA9IFtdXG4gICAgfVxuICAgIHRoaXMuc29ydERpcmVjdGl2ZSgpXG4gIH1cblxuICBzb3J0RGlyZWN0aXZlICgpIHtcbiAgICBsZXQgZXhlY3V0ZVF1ZXVlID0gdXRpbC5zb3J0RXhleHV0ZVF1ZXVlKCdkaXJlY3RpdmUnLCB0aGlzLnVuU29ydERpcmVjdGl2ZXMpXG4gICAgaWYgKGV4ZWN1dGVRdWV1ZS5sZW5ndGgpIHtcbiAgICAgIGV4ZWN1dGVRdWV1ZS5mb3JFYWNoKHZhbHVlID0+IHtcbiAgICAgICAgbGlua1JlbmRlclt2YWx1ZS5kaXJlY3RpdmVdLmJpbmQodGhpcy5zamYpKHZhbHVlKVxuICAgICAgfSlcbiAgICB9XG4gICAgdGhpcy5iaW5kRXZlbnQoKVxuICB9XG5cbiAgLy8g57uR5a6a5LqL5Lu2XG4gIGJpbmRFdmVudCAoKSB7XG4gICAgbGV0IGV2ZW50UXVlbmUgPSB0aGlzLnVuQmluZEV2ZW50c1xuICAgIGlmIChldmVudFF1ZW5lLmxlbmd0aCkge1xuICAgICAgZXZlbnRRdWVuZS5mb3JFYWNoKHZhbCA9PiB7XG4gICAgICAgIHZhbC50YXJnZXQucmVtb3ZlQXR0cmlidXRlKHZhbC5uYW1lKVxuICAgICAgICBsZXQgZXZlbnRUeXBlID0gdXRpbC5yZW1vdmVQcmVmaXgodmFsLm5hbWUpXG4gICAgICAgIGxldCBldmVudEZ1bmMgPSB0aGlzLnNqZlsnXycgKyB1dGlsLnJlbW92ZUJyYWNrZXRzKHZhbC5mdW5jKV1cbiAgICAgICAgdmFsLnRhcmdldC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgZXZlbnRGdW5jLCBmYWxzZSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHJlbmRlclxuIiwiaW1wb3J0IGNvbXBpbGUgZnJvbSAnLi9jb21waWxlJ1xuXG5jbGFzcyBTamZEYXRhQmluZCB7XG4gIGNvbnN0cnVjdG9yIChwYXJhbSkge1xuICAgIGlmICghcGFyYW0uaGFzT3duUHJvcGVydHkoJ2VsJykgfHwgIXBhcmFtLmhhc093blByb3BlcnR5KCdkYXRhJykpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ3NqZltlcnJvcl06IFRoZXJlIGlzIG5lZWQgYGRhdGFgIGFuZCBgZWxgIGF0dHJpYnV0ZScpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5fZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHBhcmFtLmVsKVxuICAgIHRoaXMuX2RhdGEgPSBwYXJhbS5kYXRhXG4gICAgdGhpcy5fd2F0Y2hlcnMgPSBbXVxuICAgIHRoaXMuX3VuY29tcGlsZU5vZGVzID0gW11cbiAgICB0aGlzLl91bmxpbmtOb2RlcyA9IFtdXG4gICAgdGhpcy5fdW5yZW5kZXJOb2RlcyA9IFtdXG4gICAgZm9yIChsZXQgbWV0aG9kIGluIHBhcmFtLm1ldGhvZHMpIHtcbiAgICAgIC8vIOW8uuWItuWwhuWumuS5ieWcqG1ldGhvZHPkuIrnmoTmlrnms5Xnm7TmjqXnu5HlrprlnKhTamZEYXRhQmluZOS4iu+8jOW5tuS/ruaUuei/meS6m+aWueazleeahHRoaXPmjIflkJHkuLpTamZEYXRhQmluZFxuICAgICAgaWYgKHBhcmFtLm1ldGhvZHMuaGFzT3duUHJvcGVydHkobWV0aG9kKSkge1xuICAgICAgICB0aGlzWydfJyArIG1ldGhvZF0gPSBwYXJhbS5tZXRob2RzW21ldGhvZF0uYmluZCh0aGlzKVxuICAgICAgfVxuICAgIH1cbiAgICBuZXcgY29tcGlsZSh0aGlzLl9lbCwgdGhpcylcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTamZEYXRhQmluZFxuIiwiaW1wb3J0IG9wdGlvbiBmcm9tICcuL29wdGlvbidcblxuY29uc3QgdXRpbCA9IHtcbiAgLy8ganVkZ2UgdGhlIHR5cGUgb2Ygb2JqXG4gIGp1ZGdlVHlwZSAob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopXG4gIH0sXG4gIC8vIHJlbW92ZSB0aGUgcHJlZml4IG9mIHNqZi1cbiAgcmVtb3ZlUHJlZml4IChzdHIpIHtcbiAgICByZXR1cm4gc3RyID0gc3RyLnJlcGxhY2UoL3NqZi0vLCAnJylcbiAgfSxcbiAgLy8gcmVtb3ZlIHRoZSBicmFja2V0cyAoKVxuICByZW1vdmVCcmFja2V0cyAoc3RyKSB7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UoL1xcXCIvZywgJycpXG4gICAgcmV0dXJuIHN0ciA9IHN0ci5yZXBsYWNlKC9cXChcXCkvLCAnJylcbiAgfSxcbiAgc29ydEV4ZXh1dGVRdWV1ZSAocHJvcGVydHksIG9iakFycikge1xuICAgIHJldHVybiBvYmpBcnIuc29ydCgob2JqMSwgb2JqMikgPT4ge1xuICAgICAgbGV0IHZhbDEgPSBvcHRpb24ucHJpb3JpdHlbb2JqMVtwcm9wZXJ0eV1dXG4gICAgICBsZXQgdmFsMiA9IG9wdGlvbi5wcmlvcml0eVtvYmoyW3Byb3BlcnR5XV1cbiAgICAgIHJldHVybiB2YWwyIC0gdmFsMVxuICAgIH0pXG4gIH0sXG4gIGlzQXJyYXkgKGFycikge1xuICAgIHJldHVybiB1dGlsLmp1ZGdlVHlwZShhcnIpID09PSAnW29iamVjdCBBcnJheV0nXG4gIH0sXG4gIGlzU3RhaWN0T2JqZWN0IChvYmopIHtcbiAgICByZXR1cm4gdXRpbC5qdWRnZVR5cGUob2JqKSA9PT0gJ1tvYmplY3QgT2JqZWN0XSdcbiAgfSxcbiAgZGVlcENvcHkgKHNvdXJjZSwgZGVzdCkge1xuICAgIGlmICghdXRpbC5pc0FycmF5KHNvdXJjZSkgJiYgIXV0aWwuaXNTdGFpY3RPYmplY3Qoc291cmNlKSkge1xuICAgICAgdGhyb3cgJ3RoZSBzb3VyY2UgeW91IHN1cHBvcnQgY2FuIG5vdCBiZSBjb3BpZWQnXG4gICAgfVxuXG4gICAgdmFyIGNvcHlTb3VyY2UgPSB1dGlsLmlzQXJyYXkoc291cmNlKSA/IFtdIDoge31cbiAgICBmb3IgKHZhciBwcm9wIGluIHNvdXJjZSkge1xuICAgICAgaWYgKHNvdXJjZS5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICBpZiAodXRpbC5pc0FycmF5KHNvdXJjZVtwcm9wXSkgfHwgdXRpbC5pc1N0YWljdE9iamVjdChzb3VyY2VbcHJvcF0pKSB7XG4gICAgICAgICAgY29weVNvdXJjZVtwcm9wXSA9IHV0aWwuZGVlcENvcHkoc291cmNlW3Byb3BdKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvcHlTb3VyY2VbcHJvcF0gPSBzb3VyY2VbcHJvcF1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjb3B5U291cmNlXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgdXRpbFxuIl19
var _r=_m(5);_g.Sjf=_g.SjfDataBind=_r;return _r;})})(typeof window!=='undefined'?window:(typeof global!=='undefined'?global:(typeof self!=='undefined'?self:this)));