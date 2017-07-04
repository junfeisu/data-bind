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

},{"./link":3,"./utils":7}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var directiveDeal = {
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
    var clonedCheckNode = value.node.check.cloneNode(true);
    var clonedCheckNodeLength = clonedCheckNode.childNodes.length;
    value.node.check.removeAttribute('sjf-for');

    var _loop = function _loop(i) {
      value.beforeDirectives.map(function (directive) {
        if (directive.expression === representativeName) {
          directive['textNodeValue'] = toLoopObject[i];
          directive['representativeName'] = representativeName;
          directive['checkNodeChildLength'] = clonedCheckNodeLength;
          directiveDeal[directive.directive].bind(_this)(directive);
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
  'sjf-text': function sjfText(value) {
    var textNodeVlaue = !value.textNodeValue ? this._data[value.expression] : value.textNodeValue;
    var checkNode = value.node.check;

    if (value.node.nodeType === 'elementNode') {
      var textNode = document.createTextNode(textNodeVlaue);
      var hasChild = checkNode.childNodes.length;

      if (checkNode.childNodes.length == value.checkNodeChildLength + 1) {
        checkNode.removeChild(checkNode.firstChild);
      }
      hasChild ? checkNode.insertBefore(textNode, checkNode.firstChild) : checkNode.appendChild(textNode);
    } else {
      checkNode.data = textNodeVlaue;
    }
  }
};

exports.default = directiveDeal;

},{"./utils":7}],3:[function(require,module,exports){
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

},{"./option":4,"./render":5,"./utils":7}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _directive = require('./directive');

var _directive2 = _interopRequireDefault(_directive);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
      });
      this.sjf._unrenderNodes = [];
    }

    this.sortDirective();
  }

  _createClass(render, [{
    key: 'sortDirective',
    value: function sortDirective() {
      var _this2 = this;

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
          _directive2.default[value.directive].bind(_this2.sjf)(value);
        });
      }
      // this.bindEvent()
    }

    // 绑定事件

  }, {
    key: 'bindEvent',
    value: function bindEvent() {
      var _this3 = this;

      var eventQuene = this.unBindEvents;
      if (eventQuene.length) {
        eventQuene.map(function (val) {
          var checkNode = val.target.check;
          var eventType = _utils2.default.removePrefix(val.name);
          var eventFunc = _this3.sjf['_' + _utils2.default.removeBrackets(val.func)];
          checkNode.removeAttribute(val.name);

          eventFunc ? checkNode.addEventListener(eventType, eventFunc, false) : console.error('sjf[error]: the ' + val.func + ' is not declared');
        });
      }
    }
  }]);

  return render;
}();

exports.default = render;

},{"./directive":2,"./utils":7}],6:[function(require,module,exports){
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

},{"./compile":1}],7:[function(require,module,exports){
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
    var resultArr = [];
    if (util.isArray(arr)) {
      arr.map(function (value) {
        if (parent.contains(value.node.check)) {
          resultArr.push(value);
        }
      });

      return resultArr;
    } else {
      console.error('sjf[error]: the arr in searchChild ' + arr + ' is not Array');
      return;
    }
  }
};

exports.default = util;

},{"./option":4}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2UvamF2YXNjcmlwdC9jb21waWxlLmpzIiwic291cmNlL2phdmFzY3JpcHQvZGlyZWN0aXZlLmpzIiwic291cmNlL2phdmFzY3JpcHQvbGluay5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L29wdGlvbi5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3JlbmRlci5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3NqZkRhdGFCaW5kLmpzIiwic291cmNlL2phdmFzY3JpcHQvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FDOzs7O0FBQ0E7Ozs7Ozs7O0lBRU0sTztBQUNMO0FBQ0EsbUJBQWEsTUFBYixFQUFxQixHQUFyQixFQUEwQjtBQUFBOztBQUN4QixTQUFLLEdBQUwsR0FBVyxHQUFYO0FBQ0EsU0FBSyxVQUFMLEdBQWtCLEVBQWxCO0FBQ0EsU0FBSyxXQUFMLEdBQW1CLEtBQUssR0FBTCxDQUFTLEdBQVQsQ0FBYSxTQUFoQztBQUNBO0FBQ0EsU0FBSyxhQUFMLENBQW1CLEtBQUssR0FBTCxDQUFTLEdBQTVCLEVBQWlDLElBQWpDO0FBQ0Q7Ozs7a0NBRWMsTSxFQUFRLE8sRUFBUztBQUFBOztBQUM5QixVQUFJLFFBQVEsTUFBTSxJQUFOLENBQVcsT0FBTyxRQUFsQixDQUFaO0FBQ0E7QUFDQSxVQUFJLFdBQVcsQ0FBQyxNQUFNLE1BQXRCLEVBQThCO0FBQzVCLGFBQUssV0FBTDtBQUNBO0FBQ0Q7QUFDRCxZQUFNLE9BQU47QUFDQSxZQUFNLEdBQU4sQ0FBVSxnQkFBUTtBQUNoQixZQUFJLENBQUMsQ0FBQyxLQUFLLFFBQUwsQ0FBYyxNQUFwQixFQUE0QjtBQUMxQixnQkFBSyxhQUFMLENBQW1CLElBQW5CLEVBQXlCLEtBQXpCO0FBQ0EsZ0JBQUssR0FBTCxDQUFTLGVBQVQsQ0FBeUIsSUFBekIsQ0FBOEI7QUFDNUIsbUJBQU8sSUFEcUI7QUFFNUIs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LFVBQUksR0FBSixDQUFRLGlCQUFTO0FBQ2YsWUFBSSxPQUFPLFFBQVAsQ0FBZ0IsTUFBTSxJQUFOLENBQVcsS0FBM0IsQ0FBSixFQUF1QztBQUNyQyxvQkFBVSxJQUFWLENBQWUsS0FBZjtBQUNEO0FBQ0YsT0FKRDs7QUFNQSxhQUFPLFNBQVA7QUFDRCxLQVJELE1BUU87QUFDTCxjQUFRLEtBQVIsQ0FBYyx3Q0FBd0MsR0FBeEMsR0FBOEMsZUFBNUQ7QUFDQTtBQUNEO0FBQ0Y7QUEzRFUsQ0FBYjs7a0JBOERlLEkiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIGltcG9ydCBsaW5rIGZyb20gJy4vbGluaydcbiBpbXBvcnQgdXRpbCBmcm9tICcuL3V0aWxzJ1xuXG4gY2xhc3MgY29tcGlsZSB7XG4gIC8vIOmAkuW9kkRPTeagkVxuICBjb25zdHJ1Y3RvciAocGFyZW50LCBzamYpIHtcbiAgICB0aGlzLnNqZiA9IHNqZlxuICAgIHRoaXMuc2VhcmNoTm9kZSA9IFtdXG4gICAgdGhpcy5yb290Q29udGVudCA9IHRoaXMuc2pmLl9lbC5pbm5lckhUTUxcbiAgICAvLyB0aGlzLnRyYXZlcnNlRWxlbWVudChwYXJlbnQsIG51bGwsIHRydWUpXG4gICAgdGhpcy5jaXJjbGVFbGVtZW50KHRoaXMuc2pmLl9lbCwgdHJ1ZSlcbiAgfVxuXG4gIGNpcmNsZUVsZW1lbnQgKHBhcmVudCwgaXNGaXJzdCkge1xuICAgIGxldCBjaGlsZCA9IEFycmF5LmZyb20ocGFyZW50LmNoaWxkcmVuKVxuICAgIC8vIOWmguaenOaYr+esrOS4gOasoemBjeWOhuW5tuS4lOayoeacieWtkOiKgueCueWwseebtOaOpei3s+i/h2NvbXBpbGVcbiAgICBpZiAoaXNGaXJzdCAmJiAhY2hpbGQubGVuZ3RoKSB7XG4gICAgICB0aGlzLmNvbXBpbGVOb2RlKClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjaGlsZC5yZXZlcnNlKClcbiAgICBjaGlsZC5tYXAobm9kZSA9PiB7XG4gICAgICBpZiAoISFub2RlLmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICB0aGlzLmNpcmNsZUVsZW1lbnQobm9kZSwgZmFsc2UpXG4gICAgICAgIHRoaXMuc2pmLl91bmNvbXBpbGVOb2Rlcy5wdXNoKHtcbiAgICAgICAgICBjaGVjazogbm9kZSxcbiAgICAgICAgICBwYXJlbnQ6IG5vZGUucGFyZW50Tm9kZSxcbiAgICAgICAgICBub2RlVHlwZTogJ2VsZW1lbnROb2RlJ1xuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzLnB1c2goe1xuICAgICAgICAgIGNoZWNrOiBub2RlLCBcbiAgICAgICAgICBwYXJlbnQ6IG5vZGUucGFyZW50Tm9kZSxcbiAgICAgICAgICBub2RlVHlwZTogJ2VsZW1lbnROb2RlJ1xuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBpZiAodGhpcy5zamYuX2VsLmxhc3RFbGVtZW50Q2hpbGQgPT09IGNoaWxkWzBdKSB7XG4gICAgICB0aGlzLmNvbXBpbGVOb2RlKClcbiAgICB9XG4gIH1cblxuICBjb21waWxlTm9kZSAoKSB7XG4gICAgbGV0IGhhc1VuY29tcGlsZSA9IHRoaXMuc2pmLl91bmNvbXBpbGVOb2Rlcy5sZW5ndGhcbiAgICB0aGlzLnNqZi5fdW5jb21waWxlTm9kZXMucmV2ZXJzZSgpXG4gICAgaWYgKGhhc1VuY29tcGlsZSkge1xuICAgICAgdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzLm1hcCh2YWx1ZSA9PiB7XG4gICAgICAgIHRoaXMuaGFzRGlyZWN0aXZlKHZhbHVlKVxuICAgICAgfSlcbiAgICB9XG4gICAgdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzID0gW11cbiAgICBuZXcgbGluayh0aGlzLnNqZilcbiAgfVxuXG4gIC8vIOajgOa1i+avj+S4qm5vZGXnnIvmmK/lkKbnu5HlrprmnInmjIfku6RcbiAgaGFzRGlyZWN0aXZlICh2YWx1ZSkge1xuICAgIGxldCBjaGVja1JlZyA9IC9zamYtLis9XFxcIi4rXFxcInxcXHtcXHsuK1xcfVxcfS9cbiAgICBpZiAoY2hlY2tSZWcudGVzdCh2YWx1ZS5jaGVjay5jbG9uZU5vZGUoKS5vdXRlckhUTUwpKSB7XG4gICAgICB0aGlzLnNqZi5fdW5saW5rTm9kZXMucHVzaCh2YWx1ZSlcbiAgICB9XG4gICAgQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKHZhbHVlLmNoZWNrLmNoaWxkTm9kZXMsIG5vZGUgPT4ge1xuICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDMpIHtcbiAgICAgICAgaWYgKGNoZWNrUmVnLnRlc3Qobm9kZS5kYXRhKSkge1xuICAgICAgICAgIHRoaXMuc2pmLl91bmxpbmtOb2Rlcy5wdXNoKHtcbiAgICAgICAgICAgIGNoZWNrOiBub2RlLCBcbiAgICAgICAgICAgIHBhcmVudDogdmFsdWUuY2hlY2ssIFxuICAgICAgICAgICAgbm9kZVR5cGU6ICd0ZXh0Tm9kZSdcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjb21waWxlXG4iLCJpbXBvcnQgdXRpbCBmcm9tICcuL3V0aWxzJ1xuXG5jb25zdCBkaXJlY3RpdmVEZWFsID0ge1xuICAnc2pmLWlmJzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFsdWUubm9kZS5zdHlsZS5kaXNwbGF5ID0gKCEhKHZhbHVlLmV4cHJlc3Npb24pID8gJ2Jsb2NrIWltcG9ydGFudCcgOiAnbm9uZSFpbXBvcnRhbnQnKVxuICB9LFxuICAnc2pmLXNob3cnOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YWx1ZS5ub2RlLnN0eWxlLmRpc3BsYXkgPSAoISEodmFsdWUuZXhwcmVzc2lvbikgPyAnYmxvY2shaW1wb3J0YW50JyA6ICdub25lIWltcG9ydGFudCcpXG4gIH0sXG4gICdzamYtZm9yJzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgLy8g5bCG6KGo6L6+5byP6YCa6L+H56m65qC8KOS4jemZkOepuuagvOaVsOebrinnu5nliIflvIBcbiAgICBsZXQgbG9vcE9iamVjdE5hbWUgPSB2YWx1ZS5leHByZXNzaW9uLnNwbGl0KC9cXHMrLylbMl1cbiAgICBsZXQgcmVwcmVzZW50YXRpdmVOYW1lID0gdmFsdWUuZXhwcmVzc2lvbi5zcGxpdCgvXFxzKy8pWzBdXG4gICAgbGV0IHRvTG9vcE9iamVjdCA9IG51bGxcbiAgICBpZiAodGhpcy5fZGF0YS5oYXNPd25Qcm9wZXJ0eShsb29wT2JqZWN0TmFtZSkpIHtcbiAgICAgIHRvTG9vcE9iamVjdCA9IHRoaXMuX2RhdGFbbG9vcE9iamVjdE5hbWVdXG4gICAgfVxuICAgIC8vIOWIpOaWreW+heW+queOr+eahOaYr+WQpuiDvei/m+ihjOW+queOr1xuICAgIGxldCBpc0xvb3BhYmxlID0gdG9Mb29wT2JqZWN0IGluc3RhbmNlb2YgQXJyYXkgfHwgIWlzTmFOKHRvTG9vcE9iamVjdClcbiAgICBpZiAoIWlzTG9vcGFibGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ3NqZltlcnJvcl06IHRoZSB0b0xvb3BPYmplY3Qgb2Ygc2pmLWZvciBzaG91bGQgYmUgYSBudW1iZXIgb3IgYW4gQXJyYXknKVxuICAgICAgcmV0dXJuIFxuICAgIH1cbiAgICAvLyDliKTmlq3mmK/mlbDnu4Tov5jmmK/mlbDlrZfvvIzku47ogIzotYvlgLxsZW5ndGhcbiAgICBsZXQgaXNBcnJheSA9IHV0aWwuaXNBcnJheSh0b0xvb3BPYmplY3QpXG4gICAgbGV0IGxlbiA9IGlzQXJyYXkgPyB0b0xvb3BPYmplY3QubGVuZ3RoIDogdG9Mb29wT2JqZWN0XG4gICAgbGV0IGNsb25lZENoZWNrTm9kZSA9IHZhbHVlLm5vZGUuY2hlY2suY2xvbmVOb2RlKHRydWUpXG4gICAgbGV0IGNsb25lZENoZWNrTm9kZUxlbmd0aCA9IGNsb25lZENoZWNrTm9kZS5jaGlsZE5vZGVzLmxlbmd0aFxuICAgIHZhbHVlLm5vZGUuY2hlY2sucmVtb3ZlQXR0cmlidXRlKCdzamYtZm9yJylcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHZhbHVlLmJlZm9yZURpcmVjdGl2ZXMubWFwKGRpcmVjdGl2ZSA9PiB7XG4gICAgICAgIGlmIChkaXJlY3RpdmUuZXhwcmVzc2lvbiA9PT0gcmVwcmVzZW50YXRpdmVOYW1lKSB7XG4gICAgICAgICAgZGlyZWN0aXZlWyd0ZXh0Tm9kZVZhbHVlJ10gPSB0b0xvb3BPYmplY3RbaV1cbiAgICAgICAgICBkaXJlY3RpdmVbJ3JlcHJlc2VudGF0aXZlTmFtZSddID0gcmVwcmVzZW50YXRpdmVOYW1lXG4gICAgICAgICAgZGlyZWN0aXZlWydjaGVja05vZGVDaGlsZExlbmd0aCddID0gY2xvbmVkQ2hlY2tOb2RlTGVuZ3RoXG4gICAgICAgICAgZGlyZWN0aXZlRGVhbFtkaXJlY3RpdmUuZGlyZWN0aXZlXS5iaW5kKHRoaXMpKGRpcmVjdGl2ZSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIGxldCBjbG9uZWROb2RlID0gdmFsdWUubm9kZS5jaGVjay5jbG9uZU5vZGUodHJ1ZSlcbiAgICAgIHZhbHVlLm5vZGUucGFyZW50Lmluc2VydEJlZm9yZShjbG9uZWROb2RlLCB2YWx1ZS5ub2RlLmNoZWNrKVxuICAgIH1cbiAgICB2YWx1ZS5ub2RlLnBhcmVudC5yZW1vdmVDaGlsZCh2YWx1ZS5ub2RlLmNoZWNrKVxuXG4gICAgaWYgKHRvTG9vcE9iamVjdCAmJiBpc0FycmF5KSB7XG4gICAgICB0aGlzLl93YXRjaGVycy5wdXNoKHRvTG9vcE9iamVjdClcbiAgICB9XG4gIH0sXG4gICdzamYtdGV4dCc6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGxldCB0ZXh0Tm9kZVZsYXVlID0gIXZhbHVlLnRleHROb2RlVmFsdWUgPyB0aGlzLl9kYXRhW3ZhbHVlLmV4cHJlc3Npb25dIDogdmFsdWUudGV4dE5vZGVWYWx1ZVxuICAgIGxldCBjaGVja05vZGUgPSB2YWx1ZS5ub2RlLmNoZWNrXG5cbiAgICBpZiAodmFsdWUubm9kZS5ub2RlVHlwZSA9PT0gJ2VsZW1lbnROb2RlJykge1xuICAgICAgbGV0IHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dE5vZGVWbGF1ZSlcbiAgICAgIGxldCBoYXNDaGlsZCA9IGNoZWNrTm9kZS5jaGlsZE5vZGVzLmxlbmd0aFxuXG4gICAgICBpZiAoY2hlY2tOb2RlLmNoaWxkTm9kZXMubGVuZ3RoID09IHZhbHVlLmNoZWNrTm9kZUNoaWxkTGVuZ3RoICsgMSkge1xuICAgICAgICBjaGVja05vZGUucmVtb3ZlQ2hpbGQoY2hlY2tOb2RlLmZpcnN0Q2hpbGQpXG4gICAgICB9XG4gICAgICBoYXNDaGlsZCA/IGNoZWNrTm9kZS5pbnNlcnRCZWZvcmUodGV4dE5vZGUsIGNoZWNrTm9kZS5maXJzdENoaWxkKSA6IGNoZWNrTm9kZS5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSlcbiAgICB9IGVsc2Uge1xuICAgICAgY2hlY2tOb2RlLmRhdGEgPSB0ZXh0Tm9kZVZsYXVlXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRpcmVjdGl2ZURlYWxcbiIsImltcG9ydCBvcHRpb24gZnJvbSAnLi9vcHRpb24nXG5pbXBvcnQgcmVuZGVyIGZyb20gJy4vcmVuZGVyJ1xuaW1wb3J0IHV0aWwgZnJvbSAnLi91dGlscydcblxuY2xhc3MgbGluayB7XG4gIGNvbnN0cnVjdG9yIChzamYpIHtcbiAgICB0aGlzLnNqZiA9IHNqZlxuICAgIGxldCBoYXNVbmxpbmtOb2RlID0gdGhpcy5zamYuX3VubGlua05vZGVzLmxlbmd0aFxuICAgIGlmIChoYXNVbmxpbmtOb2RlKSB7XG4gICAgICBsZXQgZXh0cmFjdFJlZyA9IC9zamYtW2Etel0rPVxcXCJbXlwiXStcXFwifFxce1xcey4rXFx9XFx9L2dcbiAgICAgIHRoaXMuc2pmLl91bmxpbmtOb2Rlcy5tYXAodmFsdWUgPT4ge1xuICAgICAgICBsZXQgZGlyZWN0aXZlcyA9IFtdXG4gICAgICAgIGlmICh2YWx1ZS5ub2RlVHlwZSA9PT0gJ3RleHROb2RlJykge1xuICAgICAgICAgIGRpcmVjdGl2ZXMgPSB2YWx1ZS5jaGVjay5kYXRhLm1hdGNoKGV4dHJhY3RSZWcpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGlyZWN0aXZlcyA9IHZhbHVlLmNoZWNrLmNsb25lTm9kZSgpLm91dGVySFRNTC5tYXRjaChleHRyYWN0UmVnKVxuICAgICAgICB9XG4gICAgICAgIGlmIChkaXJlY3RpdmVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICBsZXQgd2l0aE5hbWVEaXJlY3RpdmVzID0gZGlyZWN0aXZlcy5tYXAoZGlyZWN0aXZlID0+IHRoaXMuYWRkRGlyZWN0aXZlTmFtZShkaXJlY3RpdmUpKVxuICAgICAgICAgIHdpdGhOYW1lRGlyZWN0aXZlcyA9IHV0aWwuc29ydEV4ZXh1dGVRdWV1ZSgnbmFtZScsIHdpdGhOYW1lRGlyZWN0aXZlcylcbiAgICAgICAgICB3aXRoTmFtZURpcmVjdGl2ZXMubWFwKGRpcmVjdGl2ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLmV4dHJhY3REaXJlY3RpdmUoZGlyZWN0aXZlLnZhbHVlLCB2YWx1ZSlcbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRpcmVjdGl2ZXMubWFwKGRpcmVjdGl2ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLmV4dHJhY3REaXJlY3RpdmUoZGlyZWN0aXZlLCB2YWx1ZSlcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgdGhpcy5fdW5saW5rTm9kZXMgPSBbXVxuICAgICAgbmV3IHJlbmRlcih0aGlzLnNqZilcbiAgICB9XG4gIH1cblxuICBhZGREaXJlY3RpdmVOYW1lIChkaXJlY3RpdmUpIHtcbiAgICBsZXQgc2xpY2VzID0gZGlyZWN0aXZlLnNwbGl0KCc9JylcbiAgICBpZiAoc2xpY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZTogJ3NqZi10ZXh0JyxcbiAgICAgICAgdmFsdWU6IGRpcmVjdGl2ZVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOiBzbGljZXNbMF0sXG4gICAgICAgIHZhbHVlOiBkaXJlY3RpdmVcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyDmj5Dlj5bmjIfku6RcbiAgZXh0cmFjdERpcmVjdGl2ZSAoZGlyZWN0aXZlLCBub2RlKSB7XG4gICAgbGV0IHNsaWNlcyA9IGRpcmVjdGl2ZS5zcGxpdCgnPScpXG4gICAgLy8g5aaC5p6c5piv5LqL5Lu25bCx55u05o6l6YCa6L+HYWRkRXZlbnRMaXN0ZW5lcui/m+ihjOe7keWumlxuICAgIGlmIChvcHRpb24uc2pmRXZlbnRzLmluZGV4T2Yoc2xpY2VzWzBdKSA+PSAwKSB7XG4gICAgICBsZXQgZXZlbnRNZXMgPSB7XG4gICAgICAgIHR5cGU6ICdldmVudCcsXG4gICAgICAgIHRhcmdldDogbm9kZSxcbiAgICAgICAgbmFtZTogc2xpY2VzWzBdLFxuICAgICAgICBmdW5jOiBzbGljZXNbMV1cbiAgICAgIH1cbiAgICAgIHRoaXMuc2pmLl91bnJlbmRlck5vZGVzLnB1c2goZXZlbnRNZXMpXG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBleHByZXNzaW9uID0gc2xpY2VzWzBdLnJlcGxhY2UoL1tcXHtcXH1dL2csICcnKVxuICAgICAgbGV0IGRpcmVjdGl2ZU5hbWUgPSAnc2pmLXRleHQnXG4gICAgICAvLyDlr7npnZ57e3196L+Z56eN6KGo6L6+5byP6L+b6KGM5Y2V54us5aSE55CGXG4gICAgICBpZiAoIS9cXHtcXHsuK1xcfVxcfS8udGVzdChkaXJlY3RpdmUpKSB7XG4gICAgICAgIGV4cHJlc3Npb24gPSBzbGljZXNbMV0ucmVwbGFjZSgvXFxcIi9nLCAnJylcbiAgICAgICAgZGlyZWN0aXZlTmFtZSA9IHNsaWNlc1swXVxuICAgICAgfVxuICAgICAgdGhpcy5zamYuX3VucmVuZGVyTm9kZXMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdkaXJlY3RpdmUnLFxuICAgICAgICBub2RlOiBub2RlLCBcbiAgICAgICAgZGlyZWN0aXZlOiBkaXJlY3RpdmVOYW1lLCBcbiAgICAgICAgZXhwcmVzc2lvbjogZXhwcmVzc2lvblxuICAgICAgfSlcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbGlua1xuIiwiY29uc3Qgb3B0aW9uID0ge1xuICBwcmlvcml0eToge1xuICAgICdzamYtaWYnOiAyMDAwLFxuICAgICdzamYtc2hvdyc6IDIwMDAsXG4gICAgJ3NqZi1mb3InOiAxMDAwLFxuICAgICdzamYtbW9kZWwnOiAxMCxcbiAgICAnc2pmLXRleHQnOiAxLFxuICAgICdzamYtY2xpY2snOiAwLFxuICAgICdzamYtbW91c2VvdmVyJzogMCxcbiAgICAnc2pmLW1vdXNlb3V0JzogMCxcbiAgICAnc2pmLW1vdXNlbW92ZSc6IDAsXG4gICAgJ3NqZi1tb3VzZWVudGVyJzogMCxcbiAgICAnc2pmLW1vdXNlbGVhdmUnOiAwLFxuICAgICdzamYtbW91c2Vkb3duJzogMCxcbiAgICAnc2pmLW1vdXNldXAnOiAwXG4gIH0sXG4gIHNqZkV2ZW50czogW1xuICAgICdzamYtY2xpY2snLCBcbiAgICAnc2pmLW1vdXNlb3ZlcicsIFxuICAgICdzamYtbW91c2VvdXQnLCBcbiAgICAnc2pmLW1vdXNlbW92ZScsIFxuICAgICdzamYtbW91c2VlbnRlcicsXG4gICAgJ3NqZi1tb3VzZWxlYXZlJyxcbiAgICAnc2pmLW1vdXNlZG93bicsXG4gICAgJ3NqZi1tb3VzZXVwJ1xuICBdXG59XG5cbmV4cG9ydCBkZWZhdWx0IG9wdGlvblxuIiwiaW1wb3J0IHV0aWwgZnJvbSAnLi91dGlscydcbmltcG9ydCBkaXJlY3RpdmVEZWFsIGZyb20gJy4vZGlyZWN0aXZlJ1xuXG5jbGFzcyByZW5kZXIge1xuICBjb25zdHJ1Y3RvciAoc2pmKSB7XG4gICAgdGhpcy5zamYgPSBzamZcbiAgICB0aGlzLnVuQmluZEV2ZW50cyA9IFtdXG4gICAgdGhpcy51blNvcnREaXJlY3RpdmVzID0gW11cblxuICAgIGxldCBoYXNSZW5kZXIgPSB0aGlzLnNqZi5fdW5yZW5kZXJOb2Rlcy5sZW5ndGhcbiAgICBpZiAoaGFzUmVuZGVyKSB7XG4gICAgICB0aGlzLnNqZi5fdW5yZW5kZXJOb2Rlcy5tYXAodmFsID0+IHtcbiAgICAgICAgdmFsLnR5cGUgPT09ICdldmVudCcgPyB0aGlzLnVuQmluZEV2ZW50cy5wdXNoKHZhbCkgOiB0aGlzLnVuU29ydERpcmVjdGl2ZXMucHVzaCh2YWwpXG4gICAgICB9KVxuICAgICAgdGhpcy5zamYuX3VucmVuZGVyTm9kZXMgPSBbXVxuICAgIH1cblxuICAgIHRoaXMuc29ydERpcmVjdGl2ZSgpXG4gIH1cblxuICBzb3J0RGlyZWN0aXZlICgpIHtcbiAgICBsZXQgaGFzVW5Tb3J0RGlyZWN0aXZlID0gdGhpcy51blNvcnREaXJlY3RpdmVzLmxlbmd0aFxuICAgIGlmIChoYXNVblNvcnREaXJlY3RpdmUpIHtcbiAgICAgIGZvciAobGV0IGkgPSBoYXNVblNvcnREaXJlY3RpdmUgLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBpZiAodGhpcy51blNvcnREaXJlY3RpdmVzW2ldLmRpcmVjdGl2ZSA9PT0gJ3NqZi1mb3InKSB7XG4gICAgICAgICAgbGV0IHNqZkFyciA9IE9iamVjdC5hc3NpZ24oW10sIHRoaXMudW5Tb3J0RGlyZWN0aXZlcylcbiAgICAgICAgICBsZXQgYmVmb3JlRm9yRGlyZWN0aXZlcyA9IHV0aWwuc2VhcmNoQ2hpbGQoc2pmQXJyLnNwbGljZShpICsgMSksIHRoaXMudW5Tb3J0RGlyZWN0aXZlc1tpXS5ub2RlLmNoZWNrKVxuXG4gICAgICAgICAgdGhpcy51blNvcnREaXJlY3RpdmVzW2ldWydiZWZvcmVEaXJlY3RpdmVzJ10gPSBiZWZvcmVGb3JEaXJlY3RpdmVzXG4gICAgICAgICAgdGhpcy51blNvcnREaXJlY3RpdmVzLnNwbGljZShpICsgMSwgYmVmb3JlRm9yRGlyZWN0aXZlcy5sZW5ndGgpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy51blNvcnREaXJlY3RpdmVzLm1hcCh2YWx1ZSA9PiB7XG4gICAgICAgIGRpcmVjdGl2ZURlYWxbdmFsdWUuZGlyZWN0aXZlXS5iaW5kKHRoaXMuc2pmKSh2YWx1ZSlcbiAgICAgIH0pXG4gICAgfVxuICAgIC8vIHRoaXMuYmluZEV2ZW50KClcbiAgfVxuXG4gIC8vIOe7keWumuS6i+S7tlxuICBiaW5kRXZlbnQgKCkge1xuICAgIGxldCBldmVudFF1ZW5lID0gdGhpcy51bkJpbmRFdmVudHNcbiAgICBpZiAoZXZlbnRRdWVuZS5sZW5ndGgpIHtcbiAgICAgIGV2ZW50UXVlbmUubWFwKHZhbCA9PiB7XG4gICAgICAgIGxldCBjaGVja05vZGUgPSB2YWwudGFyZ2V0LmNoZWNrXG4gICAgICAgIGxldCBldmVudFR5cGUgPSB1dGlsLnJlbW92ZVByZWZpeCh2YWwubmFtZSlcbiAgICAgICAgbGV0IGV2ZW50RnVuYyA9IHRoaXMuc2pmWydfJyArIHV0aWwucmVtb3ZlQnJhY2tldHModmFsLmZ1bmMpXVxuICAgICAgICBjaGVja05vZGUucmVtb3ZlQXR0cmlidXRlKHZhbC5uYW1lKVxuXG4gICAgICAgIGV2ZW50RnVuYyA/IGNoZWNrTm9kZS5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgZXZlbnRGdW5jLCBmYWxzZSkgOiBjb25zb2xlLmVycm9yKCdzamZbZXJyb3JdOiB0aGUgJyArIHZhbC5mdW5jICsgJyBpcyBub3QgZGVjbGFyZWQnKVxuICAgICAgfSlcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgcmVuZGVyXG4iLCJpbXBvcnQgY29tcGlsZSBmcm9tICcuL2NvbXBpbGUnXG5cbmNsYXNzIFNqZkRhdGFCaW5kIHtcbiAgY29uc3RydWN0b3IgKHBhcmFtKSB7XG4gICAgaWYgKCFwYXJhbS5oYXNPd25Qcm9wZXJ0eSgnZWwnKSB8fCAhcGFyYW0uaGFzT3duUHJvcGVydHkoJ2RhdGEnKSkge1xuICAgICAgY29uc29sZS5lcnJvcignc2pmW2Vycm9yXTogVGhlcmUgaXMgbmVlZCBgZGF0YWAgYW5kIGBlbGAgYXR0cmlidXRlJylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLl9lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocGFyYW0uZWwpXG4gICAgdGhpcy5fZGF0YSA9IHBhcmFtLmRhdGFcbiAgICB0aGlzLl93YXRjaGVycyA9IFtdXG4gICAgdGhpcy5fdW5jb21waWxlTm9kZXMgPSBbXVxuICAgIHRoaXMuX3VubGlua05vZGVzID0gW11cbiAgICB0aGlzLl91bnJlbmRlck5vZGVzID0gW11cbiAgICBmb3IgKGxldCBtZXRob2QgaW4gcGFyYW0ubWV0aG9kcykge1xuICAgICAgLy8g5by65Yi25bCG5a6a5LmJ5ZyobWV0aG9kc+S4iueahOaWueazleebtOaOpee7keWumuWcqFNqZkRhdGFCaW5k5LiK77yM5bm25L+u5pS56L+Z5Lqb5pa55rOV55qEdGhpc+aMh+WQkeS4ulNqZkRhdGFCaW5kXG4gICAgICBpZiAocGFyYW0ubWV0aG9kcy5oYXNPd25Qcm9wZXJ0eShtZXRob2QpKSB7XG4gICAgICAgIHRoaXNbJ18nICsgbWV0aG9kXSA9IHBhcmFtLm1ldGhvZHNbbWV0aG9kXS5iaW5kKHRoaXMpXG4gICAgICB9XG4gICAgfVxuICAgIG5ldyBjb21waWxlKHRoaXMuX2VsLCB0aGlzKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNqZkRhdGFCaW5kXG4iLCJpbXBvcnQgb3B0aW9uIGZyb20gJy4vb3B0aW9uJ1xuXG5jb25zdCB1dGlsID0ge1xuICAvLyBqdWRnZSB0aGUgdHlwZSBvZiBvYmpcbiAganVkZ2VUeXBlIChvYmopIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iailcbiAgfSxcbiAgLy8gcmVtb3ZlIHRoZSBwcmVmaXggb2Ygc2pmLVxuICByZW1vdmVQcmVmaXggKHN0cikge1xuICAgIHJldHVybiBzdHIgPSBzdHIucmVwbGFjZSgvc2pmLS8sICcnKVxuICB9LFxuICAvLyByZW1vdmUgdGhlIGJyYWNrZXRzICgpXG4gIHJlbW92ZUJyYWNrZXRzIChzdHIpIHtcbiAgICBzdHIgPSBzdHIucmVwbGFjZSgvXFxcIi9nLCAnJylcbiAgICByZXR1cm4gc3RyID0gc3RyLnJlcGxhY2UoL1xcKFxcKS8sICcnKVxuICB9LFxuICBzb3J0RXhleHV0ZVF1ZXVlIChwcm9wZXJ0eSwgb2JqQXJyKSB7XG4gICAgcmV0dXJuIG9iakFyci5zb3J0KChvYmoxLCBvYmoyKSA9PiB7XG4gICAgICBsZXQgdmFsMSA9IG9wdGlvbi5wcmlvcml0eVtvYmoxW3Byb3BlcnR5XV1cbiAgICAgIGxldCB2YWwyID0gb3B0aW9uLnByaW9yaXR5W29iajJbcHJvcGVydHldXVxuICAgICAgcmV0dXJuIHZhbDIgLSB2YWwxXG4gICAgfSlcbiAgfSxcbiAgaXNBcnJheSAoYXJyKSB7XG4gICAgcmV0dXJuIHV0aWwuanVkZ2VUeXBlKGFycikgPT09ICdbb2JqZWN0IEFycmF5XSdcbiAgfSxcbiAgaXNTdGFpY3RPYmplY3QgKG9iaikge1xuICAgIHJldHVybiB1dGlsLmp1ZGdlVHlwZShvYmopID09PSAnW29iamVjdCBPYmplY3RdJ1xuICB9LFxuICBkZWVwQ29weSAoc291cmNlLCBkZXN0KSB7XG4gICAgaWYgKCF1dGlsLmlzQXJyYXkoc291cmNlKSAmJiAhdXRpbC5pc1N0YWljdE9iamVjdChzb3VyY2UpKSB7XG4gICAgICB0aHJvdyAndGhlIHNvdXJjZSB5b3Ugc3VwcG9ydCBjYW4gbm90IGJlIGNvcGllZCdcbiAgICB9XG5cbiAgICB2YXIgY29weVNvdXJjZSA9IHV0aWwuaXNBcnJheShzb3VyY2UpID8gW10gOiB7fVxuICAgIGZvciAodmFyIHByb3AgaW4gc291cmNlKSB7XG4gICAgICBpZiAoc291cmNlLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgIGlmICh1dGlsLmlzQXJyYXkoc291cmNlW3Byb3BdKSB8fCB1dGlsLmlzU3RhaWN0T2JqZWN0KHNvdXJjZVtwcm9wXSkpIHtcbiAgICAgICAgICBjb3B5U291cmNlW3Byb3BdID0gdXRpbC5kZWVwQ29weShzb3VyY2VbcHJvcF0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29weVNvdXJjZVtwcm9wXSA9IHNvdXJjZVtwcm9wXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvcHlTb3VyY2VcbiAgfSxcbiAgc2VhcmNoQ2hpbGQgKGFyciwgcGFyZW50KSB7XG4gICAgbGV0IHJlc3VsdEFyciA9IFtdXG4gICAgaWYgKHV0aWwuaXNBcnJheShhcnIpKSB7XG4gICAgICBhcnIubWFwKHZhbHVlID0+IHtcbiAgICAgICAgaWYgKHBhcmVudC5jb250YWlucyh2YWx1ZS5ub2RlLmNoZWNrKSkge1xuICAgICAgICAgIHJlc3VsdEFyci5wdXNoKHZhbHVlKVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICByZXR1cm4gcmVzdWx0QXJyXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ3NqZltlcnJvcl06IHRoZSBhcnIgaW4gc2VhcmNoQ2hpbGQgJyArIGFyciArICcgaXMgbm90IEFycmF5JylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB1dGlsXG4iXX0=
var _r=_m(6);_g.Sjf=_g.SjfDataBind=_r;return _r;})})(typeof window!=='undefined'?window:(typeof global!=='undefined'?global:(typeof self!=='undefined'?self:this)));