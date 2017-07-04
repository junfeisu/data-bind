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

      var child = Array.from(parent.children);
      // 如果是第一次遍历并且没有子节点就直接跳过compile
      if (isFirst && !child.length) {
        this.compileNode();
        return;
      }
      child.reverse();
      child.map(function (node) {
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

      if (this.sjf._el.lastElementChild === child[0]) {
        this.compileNode();
      }
    }
  }, {
    key: 'compileNode',
    value: function compileNode() {
      var _this2 = this;

      var hasUncompile = this.sjf._uncompileNodes.length;
      this.sjf._uncompileNodes.reverse();
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
      if (checkReg.test(value.check.cloneNode().outerHTML)) {
        this.sjf._unlinkNodes.push(value);
      }
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

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var link = function () {
  function link(sjf) {
    var _this = this;

    _classCallCheck(this, link);

    this.sjf = sjf;
    var hasUnlinkNode = this.sjf._unlinkNodes.length;
    if (hasUnlinkNode) {
      var extractReg = /sjf-[a-z]+=\"[^"]+\"|\{\{.+\}\}/g;
      this.sjf._unlinkNodes.map(function (value) {
        var directives = [];
        if (value.nodeType === 'textNode') {
          directives = value.check.data.match(extractReg);
        } else {
          directives = value.check.cloneNode().outerHTML.match(extractReg);
        }
        if (directives.length > 1) {
          var withNameDirectives = directives.map(function (directive) {
            return _this.addDirectiveName(directive);
          });
          withNameDirectives = _utils2.default.sortExexuteQueue('name', withNameDirectives);
          withNameDirectives.map(function (directive) {
            _this.extractDirective(directive.value, value);
          });
        } else {
          directives.map(function (directive) {
            _this.extractDirective(directive, value);
          });
        }
      });
      this._unlinkNodes = [];
      new _render2.default(this.sjf);
    }
  }

  _createClass(link, [{
    key: 'addDirectiveName',
    value: function addDirectiveName(directive) {
      var slices = directive.split('=');
      if (slices.length === 0) {
        return {
          name: 'sjf-text',
          value: directive
        };
      } else {
        return {
          name: slices[0],
          value: directive
        };
      }
    }

    // 提取指令

  }, {
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

},{"./option":3,"./render":4,"./utils":6}],3:[function(require,module,exports){
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
    'sjf-text': 1,
    'sjf-click': 0,
    'sjf-mouseover': 0,
    'sjf-mouseout': 0,
    'sjf-mousemove': 0,
    'sjf-mouseenter': 0,
    'sjf-mouseleave': 0,
    'sjf-mousedown': 0,
    'sjf-mouseup': 0
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
    var _this = this;

    // 将表达式通过空格(不限空格数目)给切开
    var loopObjectName = value.expression.split(/\s+/)[2];
    var representativeName = value.expression.split(/\s+/)[0];
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

    var _loop = function _loop(i) {
      value.beforeDirectives.map(function (directive) {
        if (directive.expression === representativeName) {
          linkRender[directive.directive].bind(_this)(directive, toLoopObject[i], representativeName);
        }
      });
      var clonedNode = value.node.check.cloneNode(true);
      value.node.parent.insertBefore(clonedNode, value.node.check);
    };

    for (var i = 0; i < len; i++) {
      _loop(i);
    }
    value.node.parent.removeChild(value.node.check);

    if (toLoopObject && isArray) {
      this._watchers.push(toLoopObject);
    }
  },
  'sjf-text': function sjfText(value, textValue, representativeName) {
    var textNodeVlaue = !textValue ? this._data[value.expression] : textValue;
    var checkNode = value.node.check;

    if (value.node.nodeType === 'elementNode') {
      var textNode = document.createTextNode(textNodeVlaue);
      var hasChild = checkNode.childNodes.length;

      hasChild ? checkNode.insertBefore(textNode, checkNode.firstChild) : checkNode.appendChild(textNode);
    } else {
      checkNode.data = checkNode.data.replace('{{' + representativeName + '}}', textNodeVlaue);
    }
  }
};

var render = function () {
  function render(sjf) {
    var _this2 = this;

    _classCallCheck(this, render);

    this.sjf = sjf;
    this.unBindEvents = [];
    this.unSortDirectives = [];

    var hasRender = this.sjf._unrenderNodes.length;
    if (hasRender) {
      this.sjf._unrenderNodes.map(function (val) {
        val.type === 'event' ? _this2.unBindEvents.push(val) : _this2.unSortDirectives.push(val);
      });
      this.sjf._unrenderNodes = [];
    }

    this.sortDirective();
  }

  _createClass(render, [{
    key: 'sortDirective',
    value: function sortDirective() {
      var _this3 = this;

      var hasUnSortDirective = this.unSortDirectives.length;
      if (hasUnSortDirective) {
        for (var i = hasUnSortDirective - 1; i >= 0; i--) {
          if (this.unSortDirectives[i].directive === 'sjf-for') {
            var sjfArr = Object.assign([], this.unSortDirectives);
            var beforeForDirectives = _utils2.default.searchChild(sjfArr.splice(i + 1), this.unSortDirectives[i].node.check);

            this.unSortDirectives[i]['beforeDirectives'] = beforeForDirectives;
            this.unSortDirectives.splice(i + 1, beforeForDirectives.length);
          }
        }

        this.unSortDirectives.map(function (value) {
          linkRender[value.directive].bind(_this3.sjf)(value);
        });
      }
      // this.bindEvent()
    }

    // 绑定事件

  }, {
    key: 'bindEvent',
    value: function bindEvent() {
      var _this4 = this;

      var eventQuene = this.unBindEvents;
      if (eventQuene.length) {
        eventQuene.map(function (val) {
          console.log('val', val);
          val.target.check.removeAttribute(val.name);
          var eventType = _utils2.default.removePrefix(val.name);
          console.log(val.func);
          var eventFunc = _this4.sjf['_' + _utils2.default.removeBrackets(val.func)];
          console.log(eventFunc.arguments);
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
  },
  searchChild: function searchChild(arr, parent) {
    if (util.isArray(arr)) {
      arr.map(function (value) {
        return parent.contains(value.node.check);
      });

      return arr;
    } else {
      console.error('sjf[error]: the arr in searchChild ' + arr + ' is not Array');
      return;
    }
  }
};

exports.default = util;

},{"./option":3}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2UvamF2YXNjcmlwdC9jb21waWxlLmpzIiwic291cmNlL2phdmFzY3JpcHQvbGluay5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L29wdGlvbi5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3JlbmRlci5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3NqZkRhdGFCaW5kLmpzIiwic291cmNlL2phdmFzY3JpcHQvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FDOzs7O0FBQ0E7Ozs7Ozs7O0lBRU0sTztBQUNMO0FBQ0EsbUJBQWEsTUFBYixFQUFxQixHQUFyQixFQUEwQjtBQUFBOztBQUN4QixTQUFLLEdBQUwsR0FBVyxHQUFYO0FBQ0EsU0FBSyxVQUFMLEdBQWtCLEVBQWxCO0FBQ0EsU0FBSyxXQUFMLEdBQW1CLEtBQUssR0FBTCxDQUFTLEdBQVQsQ0FBYSxTQUFoQztBQUNBO0FBQ0EsU0FBSyxhQUFMLENBQW1CLEtBQUssR0FBTCxDQUFTLEdBQTVCLEVBQWlDLElBQWpDO0FBQ0Q7Ozs7a0NBRWMsTSxFQUFRLE8sRUFBUztBQUFBOztBQUM5QixVQUFJLFFBQVEsTUFBTSxJQUFOLENBQVcsT0FBTyxRQUFsQixDQUFaO0FBQ0E7QUFDQSxVQUFJLFdBQVcsQ0FBQyxNQUFNLE1BQXRCLEVBQThCO0FBQzVCLGFBQUssV0FBTDtBQUNBO0FBQ0Q7QUFDRCxZQUFNLE9BQU47QUFDQSxZQUFNLEdBQU4sQ0FBVSxnQkFBUTtBQUNoQixZQUFJLENBQUMsQ0FBQyxLQUFLLFFBQUwsQ0FBYyxNQUFwQixFQUE0QjtBQUMxQixnQkFBSyxhQUFMLENBQW1CLElBQW5CLEVBQXlCLEtBQXpCO0FBQ0EsZ0JBQUssR0FBTCxDQUFTLGVBQVQsQ0FBeUIsSUFBekIsQ0FBOEI7QUFDNUIsbUJBQU8sSUFEcUI7QUFFNUIsb0JBQVEsS0FBSyxVQUZlO0FBRzVCLHNCQUFVO0FBSGtC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QTtBQUNEO0FBQ0Y7QUF4RFUsQ0FBYjs7a0JBMkRlLEkiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIGltcG9ydCBsaW5rIGZyb20gJy4vbGluaydcbiBpbXBvcnQgdXRpbCBmcm9tICcuL3V0aWxzJ1xuXG4gY2xhc3MgY29tcGlsZSB7XG4gIC8vIOmAkuW9kkRPTeagkVxuICBjb25zdHJ1Y3RvciAocGFyZW50LCBzamYpIHtcbiAgICB0aGlzLnNqZiA9IHNqZlxuICAgIHRoaXMuc2VhcmNoTm9kZSA9IFtdXG4gICAgdGhpcy5yb290Q29udGVudCA9IHRoaXMuc2pmLl9lbC5pbm5lckhUTUxcbiAgICAvLyB0aGlzLnRyYXZlcnNlRWxlbWVudChwYXJlbnQsIG51bGwsIHRydWUpXG4gICAgdGhpcy5jaXJjbGVFbGVtZW50KHRoaXMuc2pmLl9lbCwgdHJ1ZSlcbiAgfVxuXG4gIGNpcmNsZUVsZW1lbnQgKHBhcmVudCwgaXNGaXJzdCkge1xuICAgIGxldCBjaGlsZCA9IEFycmF5LmZyb20ocGFyZW50LmNoaWxkcmVuKVxuICAgIC8vIOWmguaenOaYr+esrOS4gOasoemBjeWOhuW5tuS4lOayoeacieWtkOiKgueCueWwseebtOaOpei3s+i/h2NvbXBpbGVcbiAgICBpZiAoaXNGaXJzdCAmJiAhY2hpbGQubGVuZ3RoKSB7XG4gICAgICB0aGlzLmNvbXBpbGVOb2RlKClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjaGlsZC5yZXZlcnNlKClcbiAgICBjaGlsZC5tYXAobm9kZSA9PiB7XG4gICAgICBpZiAoISFub2RlLmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICB0aGlzLmNpcmNsZUVsZW1lbnQobm9kZSwgZmFsc2UpXG4gICAgICAgIHRoaXMuc2pmLl91bmNvbXBpbGVOb2Rlcy5wdXNoKHtcbiAgICAgICAgICBjaGVjazogbm9kZSxcbiAgICAgICAgICBwYXJlbnQ6IG5vZGUucGFyZW50Tm9kZSxcbiAgICAgICAgICBub2RlVHlwZTogJ2VsZW1lbnROb2RlJ1xuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzLnB1c2goe1xuICAgICAgICAgIGNoZWNrOiBub2RlLCBcbiAgICAgICAgICBwYXJlbnQ6IG5vZGUucGFyZW50Tm9kZSxcbiAgICAgICAgICBub2RlVHlwZTogJ2VsZW1lbnROb2RlJ1xuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBpZiAodGhpcy5zamYuX2VsLmxhc3RFbGVtZW50Q2hpbGQgPT09IGNoaWxkWzBdKSB7XG4gICAgICB0aGlzLmNvbXBpbGVOb2RlKClcbiAgICB9XG4gIH1cblxuICBjb21waWxlTm9kZSAoKSB7XG4gICAgbGV0IGhhc1VuY29tcGlsZSA9IHRoaXMuc2pmLl91bmNvbXBpbGVOb2Rlcy5sZW5ndGhcbiAgICB0aGlzLnNqZi5fdW5jb21waWxlTm9kZXMucmV2ZXJzZSgpXG4gICAgaWYgKGhhc1VuY29tcGlsZSkge1xuICAgICAgdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzLm1hcCh2YWx1ZSA9PiB7XG4gICAgICAgIHRoaXMuaGFzRGlyZWN0aXZlKHZhbHVlKVxuICAgICAgfSlcbiAgICB9XG4gICAgdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzID0gW11cbiAgICBuZXcgbGluayh0aGlzLnNqZilcbiAgfVxuXG4gIC8vIOajgOa1i+avj+S4qm5vZGXnnIvmmK/lkKbnu5HlrprmnInmjIfku6RcbiAgaGFzRGlyZWN0aXZlICh2YWx1ZSkge1xuICAgIGxldCBjaGVja1JlZyA9IC9zamYtLis9XFxcIi4rXFxcInxcXHtcXHsuK1xcfVxcfS9cbiAgICBpZiAoY2hlY2tSZWcudGVzdCh2YWx1ZS5jaGVjay5jbG9uZU5vZGUoKS5vdXRlckhUTUwpKSB7XG4gICAgICB0aGlzLnNqZi5fdW5saW5rTm9kZXMucHVzaCh2YWx1ZSlcbiAgICB9XG4gICAgQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKHZhbHVlLmNoZWNrLmNoaWxkTm9kZXMsIG5vZGUgPT4ge1xuICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDMpIHtcbiAgICAgICAgaWYgKGNoZWNrUmVnLnRlc3Qobm9kZS5kYXRhKSkge1xuICAgICAgICAgIHRoaXMuc2pmLl91bmxpbmtOb2Rlcy5wdXNoKHtcbiAgICAgICAgICAgIGNoZWNrOiBub2RlLCBcbiAgICAgICAgICAgIHBhcmVudDogdmFsdWUuY2hlY2ssIFxuICAgICAgICAgICAgbm9kZVR5cGU6ICd0ZXh0Tm9kZSdcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjb21waWxlXG4iLCJpbXBvcnQgb3B0aW9uIGZyb20gJy4vb3B0aW9uJ1xuaW1wb3J0IHJlbmRlciBmcm9tICcuL3JlbmRlcidcbmltcG9ydCB1dGlsIGZyb20gJy4vdXRpbHMnXG5cbmNsYXNzIGxpbmsge1xuICBjb25zdHJ1Y3RvciAoc2pmKSB7XG4gICAgdGhpcy5zamYgPSBzamZcbiAgICBsZXQgaGFzVW5saW5rTm9kZSA9IHRoaXMuc2pmLl91bmxpbmtOb2Rlcy5sZW5ndGhcbiAgICBpZiAoaGFzVW5saW5rTm9kZSkge1xuICAgICAgbGV0IGV4dHJhY3RSZWcgPSAvc2pmLVthLXpdKz1cXFwiW15cIl0rXFxcInxcXHtcXHsuK1xcfVxcfS9nXG4gICAgICB0aGlzLnNqZi5fdW5saW5rTm9kZXMubWFwKHZhbHVlID0+IHtcbiAgICAgICAgbGV0IGRpcmVjdGl2ZXMgPSBbXVxuICAgICAgICBpZiAodmFsdWUubm9kZVR5cGUgPT09ICd0ZXh0Tm9kZScpIHtcbiAgICAgICAgICBkaXJlY3RpdmVzID0gdmFsdWUuY2hlY2suZGF0YS5tYXRjaChleHRyYWN0UmVnKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRpcmVjdGl2ZXMgPSB2YWx1ZS5jaGVjay5jbG9uZU5vZGUoKS5vdXRlckhUTUwubWF0Y2goZXh0cmFjdFJlZylcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGlyZWN0aXZlcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgbGV0IHdpdGhOYW1lRGlyZWN0aXZlcyA9IGRpcmVjdGl2ZXMubWFwKGRpcmVjdGl2ZSA9PiB0aGlzLmFkZERpcmVjdGl2ZU5hbWUoZGlyZWN0aXZlKSlcbiAgICAgICAgICB3aXRoTmFtZURpcmVjdGl2ZXMgPSB1dGlsLnNvcnRFeGV4dXRlUXVldWUoJ25hbWUnLCB3aXRoTmFtZURpcmVjdGl2ZXMpXG4gICAgICAgICAgd2l0aE5hbWVEaXJlY3RpdmVzLm1hcChkaXJlY3RpdmUgPT4ge1xuICAgICAgICAgICAgdGhpcy5leHRyYWN0RGlyZWN0aXZlKGRpcmVjdGl2ZS52YWx1ZSwgdmFsdWUpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkaXJlY3RpdmVzLm1hcChkaXJlY3RpdmUgPT4ge1xuICAgICAgICAgICAgdGhpcy5leHRyYWN0RGlyZWN0aXZlKGRpcmVjdGl2ZSwgdmFsdWUpXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIHRoaXMuX3VubGlua05vZGVzID0gW11cbiAgICAgIG5ldyByZW5kZXIodGhpcy5zamYpXG4gICAgfVxuICB9XG5cbiAgYWRkRGlyZWN0aXZlTmFtZSAoZGlyZWN0aXZlKSB7XG4gICAgbGV0IHNsaWNlcyA9IGRpcmVjdGl2ZS5zcGxpdCgnPScpXG4gICAgaWYgKHNsaWNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5hbWU6ICdzamYtdGV4dCcsXG4gICAgICAgIHZhbHVlOiBkaXJlY3RpdmVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZTogc2xpY2VzWzBdLFxuICAgICAgICB2YWx1ZTogZGlyZWN0aXZlXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8g5o+Q5Y+W5oyH5LukXG4gIGV4dHJhY3REaXJlY3RpdmUgKGRpcmVjdGl2ZSwgbm9kZSkge1xuICAgIGxldCBzbGljZXMgPSBkaXJlY3RpdmUuc3BsaXQoJz0nKVxuICAgIC8vIOWmguaenOaYr+S6i+S7tuWwseebtOaOpemAmui/h2FkZEV2ZW50TGlzdGVuZXLov5vooYznu5HlrppcbiAgICBpZiAob3B0aW9uLnNqZkV2ZW50cy5pbmRleE9mKHNsaWNlc1swXSkgPj0gMCkge1xuICAgICAgbGV0IGV2ZW50TWVzID0ge1xuICAgICAgICB0eXBlOiAnZXZlbnQnLFxuICAgICAgICB0YXJnZXQ6IG5vZGUsXG4gICAgICAgIG5hbWU6IHNsaWNlc1swXSxcbiAgICAgICAgZnVuYzogc2xpY2VzWzFdXG4gICAgICB9XG4gICAgICB0aGlzLnNqZi5fdW5yZW5kZXJOb2Rlcy5wdXNoKGV2ZW50TWVzKVxuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgZXhwcmVzc2lvbiA9IHNsaWNlc1swXS5yZXBsYWNlKC9bXFx7XFx9XS9nLCAnJylcbiAgICAgIGxldCBkaXJlY3RpdmVOYW1lID0gJ3NqZi10ZXh0J1xuICAgICAgLy8g5a+56Z2ee3t9fei/meenjeihqOi+vuW8j+i/m+ihjOWNleeLrOWkhOeQhlxuICAgICAgaWYgKCEvXFx7XFx7LitcXH1cXH0vLnRlc3QoZGlyZWN0aXZlKSkge1xuICAgICAgICBleHByZXNzaW9uID0gc2xpY2VzWzFdLnJlcGxhY2UoL1xcXCIvZywgJycpXG4gICAgICAgIGRpcmVjdGl2ZU5hbWUgPSBzbGljZXNbMF1cbiAgICAgIH1cbiAgICAgIHRoaXMuc2pmLl91bnJlbmRlck5vZGVzLnB1c2goe1xuICAgICAgICB0eXBlOiAnZGlyZWN0aXZlJyxcbiAgICAgICAgbm9kZTogbm9kZSwgXG4gICAgICAgIGRpcmVjdGl2ZTogZGlyZWN0aXZlTmFtZSwgXG4gICAgICAgIGV4cHJlc3Npb246IGV4cHJlc3Npb25cbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGxpbmtcbiIsImNvbnN0IG9wdGlvbiA9IHtcbiAgcHJpb3JpdHk6IHtcbiAgICAnc2pmLWlmJzogMjAwMCxcbiAgICAnc2pmLXNob3cnOiAyMDAwLFxuICAgICdzamYtZm9yJzogMTAwMCxcbiAgICAnc2pmLW1vZGVsJzogMTAsXG4gICAgJ3NqZi10ZXh0JzogMSxcbiAgICAnc2pmLWNsaWNrJzogMCxcbiAgICAnc2pmLW1vdXNlb3Zlcic6IDAsXG4gICAgJ3NqZi1tb3VzZW91dCc6IDAsXG4gICAgJ3NqZi1tb3VzZW1vdmUnOiAwLFxuICAgICdzamYtbW91c2VlbnRlcic6IDAsXG4gICAgJ3NqZi1tb3VzZWxlYXZlJzogMCxcbiAgICAnc2pmLW1vdXNlZG93bic6IDAsXG4gICAgJ3NqZi1tb3VzZXVwJzogMFxuICB9LFxuICBzamZFdmVudHM6IFtcbiAgICAnc2pmLWNsaWNrJywgXG4gICAgJ3NqZi1tb3VzZW92ZXInLCBcbiAgICAnc2pmLW1vdXNlb3V0JywgXG4gICAgJ3NqZi1tb3VzZW1vdmUnLCBcbiAgICAnc2pmLW1vdXNlZW50ZXInLFxuICAgICdzamYtbW91c2VsZWF2ZScsXG4gICAgJ3NqZi1tb3VzZWRvd24nLFxuICAgICdzamYtbW91c2V1cCdcbiAgXVxufVxuXG5leHBvcnQgZGVmYXVsdCBvcHRpb25cbiIsImltcG9ydCB1dGlsIGZyb20gJy4vdXRpbHMnXG5cbmNvbnN0IGxpbmtSZW5kZXIgPSB7XG4gICdzamYtaWYnOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YWx1ZS5ub2RlLnN0eWxlLmRpc3BsYXkgPSAoISEodmFsdWUuZXhwcmVzc2lvbikgPyAnYmxvY2shaW1wb3J0YW50JyA6ICdub25lIWltcG9ydGFudCcpXG4gIH0sXG4gICdzamYtc2hvdyc6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhbHVlLm5vZGUuc3R5bGUuZGlzcGxheSA9ICghISh2YWx1ZS5leHByZXNzaW9uKSA/ICdibG9jayFpbXBvcnRhbnQnIDogJ25vbmUhaW1wb3J0YW50JylcbiAgfSxcbiAgJ3NqZi1mb3InOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAvLyDlsIbooajovr7lvI/pgJrov4fnqbrmoLwo5LiN6ZmQ56m65qC85pWw55uuKee7meWIh+W8gFxuICAgIGxldCBsb29wT2JqZWN0TmFtZSA9IHZhbHVlLmV4cHJlc3Npb24uc3BsaXQoL1xccysvKVsyXVxuICAgIGxldCByZXByZXNlbnRhdGl2ZU5hbWUgPSB2YWx1ZS5leHByZXNzaW9uLnNwbGl0KC9cXHMrLylbMF1cbiAgICBsZXQgdG9Mb29wT2JqZWN0ID0gbnVsbFxuICAgIGlmICh0aGlzLl9kYXRhLmhhc093blByb3BlcnR5KGxvb3BPYmplY3ROYW1lKSkge1xuICAgICAgdG9Mb29wT2JqZWN0ID0gdGhpcy5fZGF0YVtsb29wT2JqZWN0TmFtZV1cbiAgICB9XG4gICAgLy8g5Yik5pat5b6F5b6q546v55qE5piv5ZCm6IO96L+b6KGM5b6q546vXG4gICAgbGV0IGlzTG9vcGFibGUgPSB0b0xvb3BPYmplY3QgaW5zdGFuY2VvZiBBcnJheSB8fCAhaXNOYU4odG9Mb29wT2JqZWN0KVxuICAgIGlmICghaXNMb29wYWJsZSkge1xuICAgICAgY29uc29sZS5lcnJvcignc2pmW2Vycm9yXTogdGhlIHRvTG9vcE9iamVjdCBvZiBzamYtZm9yIHNob3VsZCBiZSBhIG51bWJlciBvciBhbiBBcnJheScpXG4gICAgICByZXR1cm4gXG4gICAgfVxuICAgIC8vIOWIpOaWreaYr+aVsOe7hOi/mOaYr+aVsOWtl++8jOS7juiAjOi1i+WAvGxlbmd0aFxuICAgIGxldCBpc0FycmF5ID0gdXRpbC5pc0FycmF5KHRvTG9vcE9iamVjdClcbiAgICBsZXQgbGVuID0gaXNBcnJheSA/IHRvTG9vcE9iamVjdC5sZW5ndGggOiB0b0xvb3BPYmplY3RcbiAgICB2YWx1ZS5ub2RlLmNoZWNrLnJlbW92ZUF0dHJpYnV0ZSgnc2pmLWZvcicpXG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB2YWx1ZS5iZWZvcmVEaXJlY3RpdmVzLm1hcChkaXJlY3RpdmUgPT4ge1xuICAgICAgICBpZiAoZGlyZWN0aXZlLmV4cHJlc3Npb24gPT09IHJlcHJlc2VudGF0aXZlTmFtZSkge1xuICAgICAgICAgIGxpbmtSZW5kZXJbZGlyZWN0aXZlLmRpcmVjdGl2ZV0uYmluZCh0aGlzKShkaXJlY3RpdmUsIHRvTG9vcE9iamVjdFtpXSwgcmVwcmVzZW50YXRpdmVOYW1lKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgbGV0IGNsb25lZE5vZGUgPSB2YWx1ZS5ub2RlLmNoZWNrLmNsb25lTm9kZSh0cnVlKVxuICAgICAgdmFsdWUubm9kZS5wYXJlbnQuaW5zZXJ0QmVmb3JlKGNsb25lZE5vZGUsIHZhbHVlLm5vZGUuY2hlY2spXG4gICAgfVxuICAgIHZhbHVlLm5vZGUucGFyZW50LnJlbW92ZUNoaWxkKHZhbHVlLm5vZGUuY2hlY2spXG5cbiAgICBpZiAodG9Mb29wT2JqZWN0ICYmIGlzQXJyYXkpIHtcbiAgICAgIHRoaXMuX3dhdGNoZXJzLnB1c2godG9Mb29wT2JqZWN0KVxuICAgIH1cbiAgfSxcbiAgJ3NqZi10ZXh0JzogZnVuY3Rpb24gKHZhbHVlLCB0ZXh0VmFsdWUsIHJlcHJlc2VudGF0aXZlTmFtZSkge1xuICAgIGxldCB0ZXh0Tm9kZVZsYXVlID0gIXRleHRWYWx1ZSA/IHRoaXMuX2RhdGFbdmFsdWUuZXhwcmVzc2lvbl0gOiB0ZXh0VmFsdWVcbiAgICBsZXQgY2hlY2tOb2RlID0gdmFsdWUubm9kZS5jaGVja1xuXG4gICAgaWYgKHZhbHVlLm5vZGUubm9kZVR5cGUgPT09ICdlbGVtZW50Tm9kZScpIHtcbiAgICAgIGxldCB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHROb2RlVmxhdWUpXG4gICAgICBsZXQgaGFzQ2hpbGQgPSBjaGVja05vZGUuY2hpbGROb2Rlcy5sZW5ndGhcblxuICAgICAgaGFzQ2hpbGQgPyBjaGVja05vZGUuaW5zZXJ0QmVmb3JlKHRleHROb2RlLCBjaGVja05vZGUuZmlyc3RDaGlsZCkgOiBjaGVja05vZGUuYXBwZW5kQ2hpbGQodGV4dE5vZGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNoZWNrTm9kZS5kYXRhID0gY2hlY2tOb2RlLmRhdGEucmVwbGFjZSgne3snICsgcmVwcmVzZW50YXRpdmVOYW1lICsgJ319JywgdGV4dE5vZGVWbGF1ZSlcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgcmVuZGVyIHtcbiAgY29uc3RydWN0b3IgKHNqZikge1xuXG4gICAgdGhpcy5zamYgPSBzamZcbiAgICB0aGlzLnVuQmluZEV2ZW50cyA9IFtdXG4gICAgdGhpcy51blNvcnREaXJlY3RpdmVzID0gW11cblxuICAgIGxldCBoYXNSZW5kZXIgPSB0aGlzLnNqZi5fdW5yZW5kZXJOb2Rlcy5sZW5ndGhcbiAgICBpZiAoaGFzUmVuZGVyKSB7XG4gICAgICB0aGlzLnNqZi5fdW5yZW5kZXJOb2Rlcy5tYXAodmFsID0+IHtcbiAgICAgICAgdmFsLnR5cGUgPT09ICdldmVudCcgPyB0aGlzLnVuQmluZEV2ZW50cy5wdXNoKHZhbCkgOiB0aGlzLnVuU29ydERpcmVjdGl2ZXMucHVzaCh2YWwpXG4gICAgICB9KVxuICAgICAgdGhpcy5zamYuX3VucmVuZGVyTm9kZXMgPSBbXVxuICAgIH1cblxuICAgIHRoaXMuc29ydERpcmVjdGl2ZSgpXG4gIH1cblxuICBzb3J0RGlyZWN0aXZlICgpIHtcbiAgICBsZXQgaGFzVW5Tb3J0RGlyZWN0aXZlID0gdGhpcy51blNvcnREaXJlY3RpdmVzLmxlbmd0aFxuICAgIGlmIChoYXNVblNvcnREaXJlY3RpdmUpIHtcbiAgICAgIGZvciAobGV0IGkgPSBoYXNVblNvcnREaXJlY3RpdmUgLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBpZiAodGhpcy51blNvcnREaXJlY3RpdmVzW2ldLmRpcmVjdGl2ZSA9PT0gJ3NqZi1mb3InKSB7XG4gICAgICAgICAgbGV0IHNqZkFyciA9IE9iamVjdC5hc3NpZ24oW10sIHRoaXMudW5Tb3J0RGlyZWN0aXZlcylcbiAgICAgICAgICBsZXQgYmVmb3JlRm9yRGlyZWN0aXZlcyA9IHV0aWwuc2VhcmNoQ2hpbGQoc2pmQXJyLnNwbGljZShpICsgMSksIHRoaXMudW5Tb3J0RGlyZWN0aXZlc1tpXS5ub2RlLmNoZWNrKVxuXG4gICAgICAgICAgdGhpcy51blNvcnREaXJlY3RpdmVzW2ldWydiZWZvcmVEaXJlY3RpdmVzJ10gPSBiZWZvcmVGb3JEaXJlY3RpdmVzXG4gICAgICAgICAgdGhpcy51blNvcnREaXJlY3RpdmVzLnNwbGljZShpICsgMSwgYmVmb3JlRm9yRGlyZWN0aXZlcy5sZW5ndGgpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy51blNvcnREaXJlY3RpdmVzLm1hcCh2YWx1ZSA9PiB7XG4gICAgICAgIGxpbmtSZW5kZXJbdmFsdWUuZGlyZWN0aXZlXS5iaW5kKHRoaXMuc2pmKSh2YWx1ZSlcbiAgICAgIH0pXG4gICAgfVxuICAgIC8vIHRoaXMuYmluZEV2ZW50KClcbiAgfVxuXG4gIC8vIOe7keWumuS6i+S7tlxuICBiaW5kRXZlbnQgKCkge1xuICAgIGxldCBldmVudFF1ZW5lID0gdGhpcy51bkJpbmRFdmVudHNcbiAgICBpZiAoZXZlbnRRdWVuZS5sZW5ndGgpIHtcbiAgICAgIGV2ZW50UXVlbmUubWFwKHZhbCA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCd2YWwnLCB2YWwpXG4gICAgICAgIHZhbC50YXJnZXQuY2hlY2sucmVtb3ZlQXR0cmlidXRlKHZhbC5uYW1lKVxuICAgICAgICBsZXQgZXZlbnRUeXBlID0gdXRpbC5yZW1vdmVQcmVmaXgodmFsLm5hbWUpXG4gICAgICAgIGNvbnNvbGUubG9nKHZhbC5mdW5jKVxuICAgICAgICBsZXQgZXZlbnRGdW5jID0gdGhpcy5zamZbJ18nICsgdXRpbC5yZW1vdmVCcmFja2V0cyh2YWwuZnVuYyldXG4gICAgICAgIGNvbnNvbGUubG9nKGV2ZW50RnVuYy5hcmd1bWVudHMpXG4gICAgICAgIGlmIChldmVudEZ1bmMpIHtcbiAgICAgICAgICB2YWwudGFyZ2V0LmNoZWNrLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBldmVudEZ1bmMsIGZhbHNlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ3NqZltlcnJvcl06IHRoZSAnICsgdmFsLmZ1bmMgKyAnIGlzIG5vdCBkZWNsYXJlZCcpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHJlbmRlclxuIiwiaW1wb3J0IGNvbXBpbGUgZnJvbSAnLi9jb21waWxlJ1xuXG5jbGFzcyBTamZEYXRhQmluZCB7XG4gIGNvbnN0cnVjdG9yIChwYXJhbSkge1xuICAgIGlmICghcGFyYW0uaGFzT3duUHJvcGVydHkoJ2VsJykgfHwgIXBhcmFtLmhhc093blByb3BlcnR5KCdkYXRhJykpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ3NqZltlcnJvcl06IFRoZXJlIGlzIG5lZWQgYGRhdGFgIGFuZCBgZWxgIGF0dHJpYnV0ZScpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5fZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHBhcmFtLmVsKVxuICAgIHRoaXMuX2RhdGEgPSBwYXJhbS5kYXRhXG4gICAgdGhpcy5fd2F0Y2hlcnMgPSBbXVxuICAgIHRoaXMuX3VuY29tcGlsZU5vZGVzID0gW11cbiAgICB0aGlzLl91bmxpbmtOb2RlcyA9IFtdXG4gICAgdGhpcy5fdW5yZW5kZXJOb2RlcyA9IFtdXG4gICAgZm9yIChsZXQgbWV0aG9kIGluIHBhcmFtLm1ldGhvZHMpIHtcbiAgICAgIC8vIOW8uuWItuWwhuWumuS5ieWcqG1ldGhvZHPkuIrnmoTmlrnms5Xnm7TmjqXnu5HlrprlnKhTamZEYXRhQmluZOS4iu+8jOW5tuS/ruaUuei/meS6m+aWueazleeahHRoaXPmjIflkJHkuLpTamZEYXRhQmluZFxuICAgICAgaWYgKHBhcmFtLm1ldGhvZHMuaGFzT3duUHJvcGVydHkobWV0aG9kKSkge1xuICAgICAgICB0aGlzWydfJyArIG1ldGhvZF0gPSBwYXJhbS5tZXRob2RzW21ldGhvZF0uYmluZCh0aGlzKVxuICAgICAgfVxuICAgIH1cbiAgICBuZXcgY29tcGlsZSh0aGlzLl9lbCwgdGhpcylcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTamZEYXRhQmluZFxuIiwiaW1wb3J0IG9wdGlvbiBmcm9tICcuL29wdGlvbidcblxuY29uc3QgdXRpbCA9IHtcbiAgLy8ganVkZ2UgdGhlIHR5cGUgb2Ygb2JqXG4gIGp1ZGdlVHlwZSAob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopXG4gIH0sXG4gIC8vIHJlbW92ZSB0aGUgcHJlZml4IG9mIHNqZi1cbiAgcmVtb3ZlUHJlZml4IChzdHIpIHtcbiAgICByZXR1cm4gc3RyID0gc3RyLnJlcGxhY2UoL3NqZi0vLCAnJylcbiAgfSxcbiAgLy8gcmVtb3ZlIHRoZSBicmFja2V0cyAoKVxuICByZW1vdmVCcmFja2V0cyAoc3RyKSB7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UoL1xcXCIvZywgJycpXG4gICAgcmV0dXJuIHN0ciA9IHN0ci5yZXBsYWNlKC9cXChcXCkvLCAnJylcbiAgfSxcbiAgc29ydEV4ZXh1dGVRdWV1ZSAocHJvcGVydHksIG9iakFycikge1xuICAgIHJldHVybiBvYmpBcnIuc29ydCgob2JqMSwgb2JqMikgPT4ge1xuICAgICAgbGV0IHZhbDEgPSBvcHRpb24ucHJpb3JpdHlbb2JqMVtwcm9wZXJ0eV1dXG4gICAgICBsZXQgdmFsMiA9IG9wdGlvbi5wcmlvcml0eVtvYmoyW3Byb3BlcnR5XV1cbiAgICAgIHJldHVybiB2YWwyIC0gdmFsMVxuICAgIH0pXG4gIH0sXG4gIGlzQXJyYXkgKGFycikge1xuICAgIHJldHVybiB1dGlsLmp1ZGdlVHlwZShhcnIpID09PSAnW29iamVjdCBBcnJheV0nXG4gIH0sXG4gIGlzU3RhaWN0T2JqZWN0IChvYmopIHtcbiAgICByZXR1cm4gdXRpbC5qdWRnZVR5cGUob2JqKSA9PT0gJ1tvYmplY3QgT2JqZWN0XSdcbiAgfSxcbiAgZGVlcENvcHkgKHNvdXJjZSwgZGVzdCkge1xuICAgIGlmICghdXRpbC5pc0FycmF5KHNvdXJjZSkgJiYgIXV0aWwuaXNTdGFpY3RPYmplY3Qoc291cmNlKSkge1xuICAgICAgdGhyb3cgJ3RoZSBzb3VyY2UgeW91IHN1cHBvcnQgY2FuIG5vdCBiZSBjb3BpZWQnXG4gICAgfVxuXG4gICAgdmFyIGNvcHlTb3VyY2UgPSB1dGlsLmlzQXJyYXkoc291cmNlKSA/IFtdIDoge31cbiAgICBmb3IgKHZhciBwcm9wIGluIHNvdXJjZSkge1xuICAgICAgaWYgKHNvdXJjZS5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICBpZiAodXRpbC5pc0FycmF5KHNvdXJjZVtwcm9wXSkgfHwgdXRpbC5pc1N0YWljdE9iamVjdChzb3VyY2VbcHJvcF0pKSB7XG4gICAgICAgICAgY29weVNvdXJjZVtwcm9wXSA9IHV0aWwuZGVlcENvcHkoc291cmNlW3Byb3BdKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvcHlTb3VyY2VbcHJvcF0gPSBzb3VyY2VbcHJvcF1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjb3B5U291cmNlXG4gIH0sXG4gIHNlYXJjaENoaWxkIChhcnIsIHBhcmVudCkge1xuICAgIGlmICh1dGlsLmlzQXJyYXkoYXJyKSkge1xuICAgICAgYXJyLm1hcCh2YWx1ZSA9PiB7XG4gICAgICAgIHJldHVybiBwYXJlbnQuY29udGFpbnModmFsdWUubm9kZS5jaGVjaylcbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiBhcnJcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5lcnJvcignc2pmW2Vycm9yXTogdGhlIGFyciBpbiBzZWFyY2hDaGlsZCAnICsgYXJyICsgJyBpcyBub3QgQXJyYXknKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHV0aWxcbiJdfQ==
var _r=_m(5);_g.Sjf=_g.SjfDataBind=_r;return _r;})})(typeof window!=='undefined'?window:(typeof global!=='undefined'?global:(typeof self!=='undefined'?self:this)));