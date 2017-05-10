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
      var _this = this;

      // this.sjf._el.innerHTML = this.rootContent
      var hasUncompile = this.sjf._uncompileNodes.length;
      if (hasUncompile) {
        this.sjf._uncompileNodes.forEach(function (value) {
          _this.hasDirective(value);
        });
      }
      console.log(this.sjf._uncompileNodes);
      new _link2.default(this.sjf);
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
    if (hasUnlinkNode) {
      (function () {
        var extractReg = /sjf-[a-z]+=\"[^"]+\"|\{\{.+\}\}/g;
        _this.sjf._unlinkNodes.forEach(function (value) {
          var directives = value.check.outerHTML.match(extractReg);
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
    var isArray = _utils2.default.isArray(toLoopObject);
    var len = isArray ? toLoopObject.length : toLoopObject;

    // value.search.removeAttribute('sjf-for')
    console.log(value.node.parentNode);
    console.log(value.node.check.parentNode === value.node.parent);
    // for (let i = 0; i < len; i++) {
    //   let clonedNode = value.node.check.cloneNode(true)
    //   console.log(value.node.parent)
    //   value.node.parent.appendChild(clonedNode)
    // }

    if (toLoopObject && isArray) {
      this._watchers.push(toLoopObject);
    }
  },
  'sjf-text': function sjfText(value) {
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
    console.log(this.sjf._unrenderNodes);
    var hasRender = this.sjf._unrenderNodes.length;
    if (hasRender) {
      this.sjf._unrenderNodes.forEach(function (val) {
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
        eventQuene.forEach(function (val) {
          val.target.search.removeAttribute(val.name);
          var eventType = _utils2.default.removePrefix(val.name);
          var eventFunc = _this3.sjf['_' + _utils2.default.removeBrackets(val.func)];
          val.target.check.addEventListener(eventType, eventFunc, false);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2UvamF2YXNjcmlwdC9jb21waWxlLmpzIiwic291cmNlL2phdmFzY3JpcHQvbGluay5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L29wdGlvbi5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3JlbmRlci5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3NqZkRhdGFCaW5kLmpzIiwic291cmNlL2phdmFzY3JpcHQvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FDOzs7O0FBQ0E7Ozs7Ozs7O0lBRU0sTztBQUNMO0FBQ0EsbUJBQWEsTUFBYixFQUFxQixHQUFyQixFQUEwQjtBQUFBOztBQUN4QixTQUFLLEdBQUwsR0FBVyxHQUFYO0FBQ0EsU0FBSyxVQUFMLEdBQWtCLEVBQWxCO0FBQ0EsU0FBSyxXQUFMLEdBQW1CLEtBQUssR0FBTCxDQUFTLEdBQVQsQ0FBYSxTQUFoQztBQUNBLFNBQUssZUFBTCxDQUFxQixNQUFyQixFQUE2QixJQUE3QixFQUFtQyxJQUFuQztBQUNEOzs7O29DQUVnQixNLEVBQVEsUSxFQUFVLE8sRUFBUztBQUMxQyxVQUFJLE9BQUosRUFBYTtBQUNYLFlBQUksQ0FBQyxPQUFPLFFBQVAsQ0FBZ0IsTUFBckIsRUFBNkI7QUFDM0IsZUFBSyxXQUFMO0FBQ0E7QUFDRDtBQUNGLE9BTEQsTUFLTztBQUNMLGVBQU8sV0FBUCxDQUFtQixRQUFuQjtBQUNBLFlBQUksV0FBVyxLQUFLLEdBQUwsQ0FBUyxHQUF4QixFQUE2QjtBQUMzQixjQUFJLENBQUMsT0FBTyxRQUFQLENBQWdCLE1BQXJCLEVBQTZCO0FBQzNCO0FBQ0Q7QUFDRjtBQUNGOztBQUVELFVBQUksUUFBUSxPQUFPLFFBQW5CO0FBQ0EsVUFBSSxXQUFXLE1BQU0sTUFBckI7QUFDQSxVQUFJLFFBQUosRUFBYztBQUNaLGFBQUssSUFBSSxJQUFJLFdBQVcsQ0FBeEIsRUFBMkIsS0FB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bnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIgaW1wb3J0IGxpbmsgZnJvbSAnLi9saW5rJ1xuIGltcG9ydCB1dGlsIGZyb20gJy4vdXRpbHMnXG5cbiBjbGFzcyBjb21waWxlIHtcbiAgLy8g6YCS5b2SRE9N5qCRXG4gIGNvbnN0cnVjdG9yIChwYXJlbnQsIHNqZikge1xuICAgIHRoaXMuc2pmID0gc2pmXG4gICAgdGhpcy5zZWFyY2hOb2RlID0gW11cbiAgICB0aGlzLnJvb3RDb250ZW50ID0gdGhpcy5zamYuX2VsLmlubmVySFRNTFxuICAgIHRoaXMudHJhdmVyc2VFbGVtZW50KHBhcmVudCwgbnVsbCwgdHJ1ZSlcbiAgfVxuXG4gIHRyYXZlcnNlRWxlbWVudCAocGFyZW50LCBsYXN0Tm9kZSwgaXNGaXJzdCkge1xuICAgIGlmIChpc0ZpcnN0KSB7XG4gICAgICBpZiAoIXBhcmVudC5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5jb21waWxlTm9kZSgpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQobGFzdE5vZGUpXG4gICAgICBpZiAocGFyZW50ID09PSB0aGlzLnNqZi5fZWwpIHtcbiAgICAgICAgaWYgKCFwYXJlbnQuY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgY2hpbGQgPSBwYXJlbnQuY2hpbGRyZW5cbiAgICBsZXQgY2hpbGRMZW4gPSBjaGlsZC5sZW5ndGhcbiAgICBpZiAoY2hpbGRMZW4pIHtcbiAgICAgIGZvciAodmFyIGkgPSBjaGlsZExlbiAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGxldCBub2RlID0gY2hpbGRbaV1cbiAgICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgICAgaWYgKHBhcmVudCA9PT0gdGhpcy5zamYuX2VsICYmIGkgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNvbXBpbGVOb2RlKClcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobm9kZS5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICB2YXIgc2VhcmNoTm9kZSA9IHRoaXMuc2VhcmNoTG9uZUNoaWxkKG5vZGUpWzBdXG4gICAgICAgICAgdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzLnB1c2goe1xuICAgICAgICAgICAgY2hlY2s6IHNlYXJjaE5vZGUsIFxuICAgICAgICAgICAgc2VhcmNoOiBzZWFyY2hOb2RlLCBcbiAgICAgICAgICAgIHBhcmVudDogc2VhcmNoTm9kZS5wYXJlbnROb2RlXG4gICAgICAgICAgfSlcbiAgICAgICAgICB0aGlzLnNlYXJjaE5vZGUgPSBbXVxuICAgICAgICAgIHRoaXMudHJhdmVyc2VFbGVtZW50KHNlYXJjaE5vZGUucGFyZW50Tm9kZSwgc2VhcmNoTm9kZSwgZmFsc2UpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzLnB1c2goe1xuICAgICAgICAgICAgY2hlY2s6IG5vZGUsIFxuICAgICAgICAgICAgc2VhcmNoOiBub2RlLCBcbiAgICAgICAgICAgIHBhcmVudDogbm9kZS5wYXJlbnROb2RlXG4gICAgICAgICAgfSlcbiAgICAgICAgICB0aGlzLnRyYXZlcnNlRWxlbWVudChub2RlLnBhcmVudE5vZGUsIG5vZGUsIGZhbHNlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2pmLl91bmNvbXBpbGVOb2Rlcy5wdXNoKHtcbiAgICAgICAgY2hlY2s6IHBhcmVudCwgXG4gICAgICAgIHNlYXJjaDogcGFyZW50LCBcbiAgICAgICAgcGFyZW50OiBwYXJlbnQucGFyZW50Tm9kZVxuICAgICAgfSlcbiAgICAgIHRoaXMudHJhdmVyc2VFbGVtZW50KHBhcmVudC5wYXJlbnROb2RlLCBwYXJlbnQsIGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIHNlYXJjaExvbmVDaGlsZCAobm9kZSkge1xuICAgIGxldCBjaGlsZExlbiA9IG5vZGUuY2hpbGRyZW4ubGVuZ3RoXG4gICAgaWYgKGNoaWxkTGVuKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkTGVuOyBpKyspIHtcbiAgICAgICAgaWYgKG5vZGUuY2hpbGRyZW5baV0uY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy5zZWFyY2hMb25lQ2hpbGQobm9kZS5jaGlsZHJlbltpXSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5zZWFyY2hOb2RlLnB1c2gobm9kZS5jaGlsZHJlbltjaGlsZExlbiAtIDFdKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zZWFyY2hOb2RlXG4gIH1cblxuICBjb21waWxlTm9kZSAoKSB7XG4gICAgLy8gdGhpcy5zamYuX2VsLmlubmVySFRNTCA9IHRoaXMucm9vdENvbnRlbnRcbiAgICBsZXQgaGFzVW5jb21waWxlID0gdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzLmxlbmd0aFxuICAgIGlmIChoYXNVbmNvbXBpbGUpIHtcbiAgICAgIHRoaXMuc2pmLl91bmNvbXBpbGVOb2Rlcy5mb3JFYWNoKHZhbHVlID0+IHtcbiAgICAgICAgdGhpcy5oYXNEaXJlY3RpdmUodmFsdWUpXG4gICAgICB9KVxuICAgIH1cbiAgICBjb25zb2xlLmxvZyh0aGlzLnNqZi5fdW5jb21waWxlTm9kZXMpXG4gICAgbmV3IGxpbmsodGhpcy5zamYpXG4gIH1cblxuICAvLyDmo4DmtYvmr4/kuKpub2Rl55yL5piv5ZCm57uR5a6a5pyJ5oyH5LukXG4gIGhhc0RpcmVjdGl2ZSAodmFsdWUpIHtcbiAgICBsZXQgY2hlY2tSZWcgPSAvc2pmLS4rPVxcXCIuK1xcXCJ8XFx7XFx7LitcXH1cXH0vXG4gICAgaWYgKGNoZWNrUmVnLnRlc3QodmFsdWUuY2hlY2sub3V0ZXJIVE1MKSkge1xuICAgICAgdGhpcy5zamYuX3VubGlua05vZGVzLnB1c2godmFsdWUpXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvbXBpbGVcbiIsImltcG9ydCBvcHRpb24gZnJvbSAnLi9vcHRpb24nXG5pbXBvcnQgcmVuZGVyIGZyb20gJy4vcmVuZGVyJ1xuXG5jbGFzcyBsaW5rIHtcbiAgY29uc3RydWN0b3IgKHNqZikge1xuICAgIHRoaXMuc2pmID0gc2pmXG4gICAgbGV0IGhhc1VubGlua05vZGUgPSB0aGlzLnNqZi5fdW5saW5rTm9kZXMubGVuZ3RoXG4gICAgaWYgKGhhc1VubGlua05vZGUpIHtcbiAgICAgIGxldCBleHRyYWN0UmVnID0gL3NqZi1bYS16XSs9XFxcIlteXCJdK1xcXCJ8XFx7XFx7LitcXH1cXH0vZ1xuICAgICAgdGhpcy5zamYuX3VubGlua05vZGVzLmZvckVhY2goKHZhbHVlKSA9PiB7XG4gICAgICAgIGxldCBkaXJlY3RpdmVzID0gKHZhbHVlLmNoZWNrLm91dGVySFRNTCkubWF0Y2goZXh0cmFjdFJlZylcbiAgICAgICAgZGlyZWN0aXZlcy5mb3JFYWNoKHZhbCA9PiB7XG4gICAgICAgICAgdGhpcy5leHRyYWN0RGlyZWN0aXZlKHZhbCwgdmFsdWUpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgICAgdGhpcy5fdW5saW5rTm9kZXMgPSBbXVxuICAgICAgbmV3IHJlbmRlcih0aGlzLnNqZilcbiAgICB9XG4gIH1cblxuICAvLyDmj5Dlj5bmjIfku6RcbiAgZXh0cmFjdERpcmVjdGl2ZSAoZGlyZWN0aXZlLCBub2RlKSB7XG4gICAgbGV0IHNsaWNlcyA9IGRpcmVjdGl2ZS5zcGxpdCgnPScpXG4gICAgLy8g5aaC5p6c5piv5LqL5Lu25bCx55u05o6l6YCa6L+HYWRkRXZlbnRMaXN0ZW5lcui/m+ihjOe7keWumlxuICAgIGlmIChvcHRpb24uc2pmRXZlbnRzLmluZGV4T2Yoc2xpY2VzWzBdKSA+PSAwKSB7XG4gICAgICBsZXQgZXZlbnRNZXMgPSB7XG4gICAgICAgIHR5cGU6ICdldmVudCcsXG4gICAgICAgIHRhcmdldDogbm9kZSxcbiAgICAgICAgbmFtZTogc2xpY2VzWzBdLFxuICAgICAgICBmdW5jOiBzbGljZXNbMV1cbiAgICAgIH1cbiAgICAgIHRoaXMuc2pmLl91bnJlbmRlck5vZGVzLnB1c2goZXZlbnRNZXMpXG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBleHByZXNzaW9uID0gc2xpY2VzWzBdLnJlcGxhY2UoL1tcXHtcXH1dL2csICcnKVxuICAgICAgbGV0IGRpcmVjdGl2ZU5hbWUgPSAnc2pmLXRleHQnXG4gICAgICAvLyDlr7npnZ57e3196L+Z56eN6KGo6L6+5byP6L+b6KGM5Y2V54us5aSE55CGXG4gICAgICBpZiAoIS9cXHtcXHsuK1xcfVxcfS8udGVzdChkaXJlY3RpdmUpKSB7XG4gICAgICAgIGV4cHJlc3Npb24gPSBzbGljZXNbMV0ucmVwbGFjZSgvXFxcIi9nLCAnJylcbiAgICAgICAgZGlyZWN0aXZlTmFtZSA9IHNsaWNlc1swXVxuICAgICAgfVxuICAgICAgdGhpcy5zamYuX3VucmVuZGVyTm9kZXMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdkaXJlY3RpdmUnLFxuICAgICAgICBub2RlOiBub2RlLCBcbiAgICAgICAgZGlyZWN0aXZlOiBkaXJlY3RpdmVOYW1lLCBcbiAgICAgICAgZXhwcmVzc2lvbjogZXhwcmVzc2lvblxuICAgICAgfSlcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbGlua1xuIiwiY29uc3Qgb3B0aW9uID0ge1xuICBwcmlvcml0eToge1xuICAgICdzamYtaWYnOiAyMDAwLFxuICAgICdzamYtc2hvdyc6IDIwMDAsXG4gICAgJ3NqZi1mb3InOiAxMDAwLFxuICAgICdzamYtbW9kZWwnOiAxMCxcbiAgICAnc2pmLXRleHQnOiAxXG4gIH0sXG4gIHNqZkV2ZW50czogW1xuICAgICdzamYtY2xpY2snLCBcbiAgICAnc2pmLW1vdXNlb3ZlcicsIFxuICAgICdzamYtbW91c2VvdXQnLCBcbiAgICAnc2pmLW1vdXNlbW92ZScsIFxuICAgICdzamYtbW91c2VlbnRlcicsXG4gICAgJ3NqZi1tb3VzZWxlYXZlJyxcbiAgICAnc2pmLW1vdXNlZG93bicsXG4gICAgJ3NqZi1tb3VzZXVwJ1xuICBdXG59XG5cbmV4cG9ydCBkZWZhdWx0IG9wdGlvblxuIiwiaW1wb3J0IHV0aWwgZnJvbSAnLi91dGlscydcblxuY29uc3QgbGlua1JlbmRlciA9IHtcbiAgJ3NqZi1pZic6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhbHVlLm5vZGUuc3R5bGUuZGlzcGxheSA9ICghISh2YWx1ZS5leHByZXNzaW9uKSA/ICdibG9jayFpbXBvcnRhbnQnIDogJ25vbmUhaW1wb3J0YW50JylcbiAgfSxcbiAgJ3NqZi1zaG93JzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFsdWUubm9kZS5zdHlsZS5kaXNwbGF5ID0gKCEhKHZhbHVlLmV4cHJlc3Npb24pID8gJ2Jsb2NrIWltcG9ydGFudCcgOiAnbm9uZSFpbXBvcnRhbnQnKVxuICB9LFxuICAnc2pmLWZvcic6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIC8vIOWwhuihqOi+vuW8j+mAmui/h+epuuagvCjkuI3pmZDnqbrmoLzmlbDnm64p57uZ5YiH5byAXG4gICAgbGV0IGxvb3BPYmplY3ROYW1lID0gdmFsdWUuZXhwcmVzc2lvbi5zcGxpdCgvXFxzKy8pWzJdXG4gICAgbGV0IHRvTG9vcE9iamVjdCA9IG51bGxcbiAgICBpZiAodGhpcy5fZGF0YS5oYXNPd25Qcm9wZXJ0eShsb29wT2JqZWN0TmFtZSkpIHtcbiAgICAgIHRvTG9vcE9iamVjdCA9IHRoaXMuX2RhdGFbbG9vcE9iamVjdE5hbWVdXG4gICAgfVxuICAgIC8vIOWIpOaWreW+heW+queOr+eahOaYr+WQpuiDvei/m+ihjOW+queOr1xuICAgIGxldCBpc0xvb3BhYmxlID0gdG9Mb29wT2JqZWN0IGluc3RhbmNlb2YgQXJyYXkgfHwgIWlzTmFOKHRvTG9vcE9iamVjdClcbiAgICBpZiAoIWlzTG9vcGFibGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ3RoZSB0b0xvb3BPYmplY3Qgb2Ygc2pmLWZvciBzaG91bGQgYmUgYSBudW1iZXIgb3IgYW4gQXJyYXknKVxuICAgICAgcmV0dXJuIFxuICAgIH1cbiAgICAvLyDliKTmlq3mmK/mlbDnu4Tov5jmmK/mlbDlrZfvvIzku47ogIzotYvlgLxsZW5ndGhcbiAgICBsZXQgaXNBcnJheSA9IHV0aWwuaXNBcnJheSh0b0xvb3BPYmplY3QpXG4gICAgbGV0IGxlbiA9IGlzQXJyYXkgPyB0b0xvb3BPYmplY3QubGVuZ3RoIDogdG9Mb29wT2JqZWN0XG5cbiAgICAvLyB2YWx1ZS5zZWFyY2gucmVtb3ZlQXR0cmlidXRlKCdzamYtZm9yJylcbiAgICBjb25zb2xlLmxvZyh2YWx1ZS5ub2RlLnBhcmVudE5vZGUpXG4gICAgY29uc29sZS5sb2codmFsdWUubm9kZS5jaGVjay5wYXJlbnROb2RlID09PSB2YWx1ZS5ub2RlLnBhcmVudClcbiAgICAvLyBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgLy8gICBsZXQgY2xvbmVkTm9kZSA9IHZhbHVlLm5vZGUuY2hlY2suY2xvbmVOb2RlKHRydWUpXG4gICAgLy8gICBjb25zb2xlLmxvZyh2YWx1ZS5ub2RlLnBhcmVudClcbiAgICAvLyAgIHZhbHVlLm5vZGUucGFyZW50LmFwcGVuZENoaWxkKGNsb25lZE5vZGUpXG4gICAgLy8gfVxuXG4gICAgaWYgKHRvTG9vcE9iamVjdCAmJiBpc0FycmF5KSB7XG4gICAgICB0aGlzLl93YXRjaGVycy5wdXNoKHRvTG9vcE9iamVjdClcbiAgICB9XG4gIH0sXG4gICdzamYtdGV4dCc6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhbHVlLm5vZGUuaW5uZXJUZXh0ID0gdGhpcy5fZGF0YVt2YWx1ZS5leHByZXNzaW9uXVxuICB9XG59XG5cbmNsYXNzIHJlbmRlciB7XG4gIGNvbnN0cnVjdG9yIChzamYpIHtcbiAgICB0aGlzLnNqZiA9IHNqZlxuICAgIHRoaXMudW5CaW5kRXZlbnRzID0gW11cbiAgICB0aGlzLnVuU29ydERpcmVjdGl2ZXMgPSBbXVxuICAgIGNvbnNvbGUubG9nKHRoaXMuc2pmLl91bnJlbmRlck5vZGVzKVxuICAgIGxldCBoYXNSZW5kZXIgPSB0aGlzLnNqZi5fdW5yZW5kZXJOb2Rlcy5sZW5ndGhcbiAgICBpZiAoaGFzUmVuZGVyKSB7XG4gICAgICB0aGlzLnNqZi5fdW5yZW5kZXJOb2Rlcy5mb3JFYWNoKHZhbCA9PiB7XG4gICAgICAgIHZhbC50eXBlID09PSAnZXZlbnQnID8gdGhpcy51bkJpbmRFdmVudHMucHVzaCh2YWwpIDogdGhpcy51blNvcnREaXJlY3RpdmVzLnB1c2godmFsKVxuICAgICAgdGhpcy5zamYuX3VucmVuZGVyTm9kZXMgPSBbXVxuICAgICAgfSlcbiAgICB9XG4gICAgdGhpcy5zb3J0RGlyZWN0aXZlKClcbiAgfVxuXG4gIHNvcnREaXJlY3RpdmUgKCkge1xuICAgIGxldCBleGVjdXRlUXVldWUgPSB1dGlsLnNvcnRFeGV4dXRlUXVldWUoJ2RpcmVjdGl2ZScsIHRoaXMudW5Tb3J0RGlyZWN0aXZlcylcbiAgICBpZiAoZXhlY3V0ZVF1ZXVlLmxlbmd0aCkge1xuICAgICAgZXhlY3V0ZVF1ZXVlLmZvckVhY2godmFsdWUgPT4ge1xuICAgICAgICBsaW5rUmVuZGVyW3ZhbHVlLmRpcmVjdGl2ZV0uYmluZCh0aGlzLnNqZikodmFsdWUpXG4gICAgICB9KVxuICAgIH1cbiAgICB0aGlzLmJpbmRFdmVudCgpXG4gIH1cblxuICAvLyDnu5Hlrprkuovku7ZcbiAgYmluZEV2ZW50ICgpIHtcbiAgICBsZXQgZXZlbnRRdWVuZSA9IHRoaXMudW5CaW5kRXZlbnRzXG4gICAgaWYgKGV2ZW50UXVlbmUubGVuZ3RoKSB7XG4gICAgICBldmVudFF1ZW5lLmZvckVhY2godmFsID0+IHtcbiAgICAgICAgdmFsLnRhcmdldC5zZWFyY2gucmVtb3ZlQXR0cmlidXRlKHZhbC5uYW1lKVxuICAgICAgICBsZXQgZXZlbnRUeXBlID0gdXRpbC5yZW1vdmVQcmVmaXgodmFsLm5hbWUpXG4gICAgICAgIGxldCBldmVudEZ1bmMgPSB0aGlzLnNqZlsnXycgKyB1dGlsLnJlbW92ZUJyYWNrZXRzKHZhbC5mdW5jKV1cbiAgICAgICAgdmFsLnRhcmdldC5jaGVjay5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgZXZlbnRGdW5jLCBmYWxzZSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHJlbmRlclxuIiwiaW1wb3J0IGNvbXBpbGUgZnJvbSAnLi9jb21waWxlJ1xuXG5jbGFzcyBTamZEYXRhQmluZCB7XG4gIGNvbnN0cnVjdG9yIChwYXJhbSkge1xuICAgIGlmICghcGFyYW0uaGFzT3duUHJvcGVydHkoJ2VsJykgfHwgIXBhcmFtLmhhc093blByb3BlcnR5KCdkYXRhJykpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ3NqZltlcnJvcl06IFRoZXJlIGlzIG5lZWQgYGRhdGFgIGFuZCBgZWxgIGF0dHJpYnV0ZScpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5fZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHBhcmFtLmVsKVxuICAgIHRoaXMuX2RhdGEgPSBwYXJhbS5kYXRhXG4gICAgdGhpcy5fd2F0Y2hlcnMgPSBbXVxuICAgIHRoaXMuX3VuY29tcGlsZU5vZGVzID0gW11cbiAgICB0aGlzLl91bmxpbmtOb2RlcyA9IFtdXG4gICAgdGhpcy5fdW5yZW5kZXJOb2RlcyA9IFtdXG4gICAgZm9yIChsZXQgbWV0aG9kIGluIHBhcmFtLm1ldGhvZHMpIHtcbiAgICAgIC8vIOW8uuWItuWwhuWumuS5ieWcqG1ldGhvZHPkuIrnmoTmlrnms5Xnm7TmjqXnu5HlrprlnKhTamZEYXRhQmluZOS4iu+8jOW5tuS/ruaUuei/meS6m+aWueazleeahHRoaXPmjIflkJHkuLpTamZEYXRhQmluZFxuICAgICAgaWYgKHBhcmFtLm1ldGhvZHMuaGFzT3duUHJvcGVydHkobWV0aG9kKSkge1xuICAgICAgICB0aGlzWydfJyArIG1ldGhvZF0gPSBwYXJhbS5tZXRob2RzW21ldGhvZF0uYmluZCh0aGlzKVxuICAgICAgfVxuICAgIH1cbiAgICBuZXcgY29tcGlsZSh0aGlzLl9lbCwgdGhpcylcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTamZEYXRhQmluZFxuIiwiaW1wb3J0IG9wdGlvbiBmcm9tICcuL29wdGlvbidcblxuY29uc3QgdXRpbCA9IHtcbiAgLy8ganVkZ2UgdGhlIHR5cGUgb2Ygb2JqXG4gIGp1ZGdlVHlwZSAob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopXG4gIH0sXG4gIC8vIHJlbW92ZSB0aGUgcHJlZml4IG9mIHNqZi1cbiAgcmVtb3ZlUHJlZml4IChzdHIpIHtcbiAgICByZXR1cm4gc3RyID0gc3RyLnJlcGxhY2UoL3NqZi0vLCAnJylcbiAgfSxcbiAgLy8gcmVtb3ZlIHRoZSBicmFja2V0cyAoKVxuICByZW1vdmVCcmFja2V0cyAoc3RyKSB7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UoL1xcXCIvZywgJycpXG4gICAgcmV0dXJuIHN0ciA9IHN0ci5yZXBsYWNlKC9cXChcXCkvLCAnJylcbiAgfSxcbiAgc29ydEV4ZXh1dGVRdWV1ZSAocHJvcGVydHksIG9iakFycikge1xuICAgIHJldHVybiBvYmpBcnIuc29ydCgob2JqMSwgb2JqMikgPT4ge1xuICAgICAgbGV0IHZhbDEgPSBvcHRpb24ucHJpb3JpdHlbb2JqMVtwcm9wZXJ0eV1dXG4gICAgICBsZXQgdmFsMiA9IG9wdGlvbi5wcmlvcml0eVtvYmoyW3Byb3BlcnR5XV1cbiAgICAgIHJldHVybiB2YWwyIC0gdmFsMVxuICAgIH0pXG4gIH0sXG4gIGlzQXJyYXkgKGFycikge1xuICAgIHJldHVybiB1dGlsLmp1ZGdlVHlwZShhcnIpID09PSAnW29iamVjdCBBcnJheV0nXG4gIH0sXG4gIGlzU3RhaWN0T2JqZWN0IChvYmopIHtcbiAgICByZXR1cm4gdXRpbC5qdWRnZVR5cGUob2JqKSA9PT0gJ1tvYmplY3QgT2JqZWN0XSdcbiAgfSxcbiAgZGVlcENvcHkgKHNvdXJjZSwgZGVzdCkge1xuICAgIGlmICghdXRpbC5pc0FycmF5KHNvdXJjZSkgJiYgIXV0aWwuaXNTdGFpY3RPYmplY3Qoc291cmNlKSkge1xuICAgICAgdGhyb3cgJ3RoZSBzb3VyY2UgeW91IHN1cHBvcnQgY2FuIG5vdCBiZSBjb3BpZWQnXG4gICAgfVxuXG4gICAgdmFyIGNvcHlTb3VyY2UgPSB1dGlsLmlzQXJyYXkoc291cmNlKSA/IFtdIDoge31cbiAgICBmb3IgKHZhciBwcm9wIGluIHNvdXJjZSkge1xuICAgICAgaWYgKHNvdXJjZS5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICBpZiAodXRpbC5pc0FycmF5KHNvdXJjZVtwcm9wXSkgfHwgdXRpbC5pc1N0YWljdE9iamVjdChzb3VyY2VbcHJvcF0pKSB7XG4gICAgICAgICAgY29weVNvdXJjZVtwcm9wXSA9IHV0aWwuZGVlcENvcHkoc291cmNlW3Byb3BdKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvcHlTb3VyY2VbcHJvcF0gPSBzb3VyY2VbcHJvcF1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjb3B5U291cmNlXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgdXRpbFxuIl19
var _r=_m(5);_g.Sjf=_g.SjfDataBind=_r;return _r;})})(typeof window!=='undefined'?window:(typeof global!=='undefined'?global:(typeof self!=='undefined'?self:this)));