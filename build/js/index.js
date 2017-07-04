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
    var displayValue = this._data[value.expression] ? 'block' : 'none';
    // value.node.check.style.display = 
    value.node.check.style.setProperty('display', displayValue, 'important');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2UvamF2YXNjcmlwdC9jb21waWxlLmpzIiwic291cmNlL2phdmFzY3JpcHQvZGlyZWN0aXZlLmpzIiwic291cmNlL2phdmFzY3JpcHQvbGluay5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L29wdGlvbi5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3JlbmRlci5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3NqZkRhdGFCaW5kLmpzIiwic291cmNlL2phdmFzY3JpcHQvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FDOzs7O0FBQ0E7Ozs7Ozs7O0lBRU0sTztBQUNMO0FBQ0EsbUJBQWEsTUFBYixFQUFxQixHQUFyQixFQUEwQjtBQUFBOztBQUN4QixTQUFLLEdBQUwsR0FBVyxHQUFYO0FBQ0EsU0FBSyxVQUFMLEdBQWtCLEVBQWxCO0FBQ0EsU0FBSyxXQUFMLEdBQW1CLEtBQUssR0FBTCxDQUFTLEdBQVQsQ0FBYSxTQUFoQztBQUNBO0FBQ0EsU0FBSyxhQUFMLENBQW1CLEtBQUssR0FBTCxDQUFTLEdBQTVCLEVBQWlDLElBQWpDO0FBQ0Q7Ozs7a0NBRWMsTSxFQUFRLE8sRUFBUztBQUFBOztBQUM5QixVQUFJLFFBQVEsTUFBTSxJQUFOLENBQVcsT0FBTyxRQUFsQixDQUFaO0FBQ0E7QUFDQSxVQUFJLFdBQVcsQ0FBQyxNQUFNLE1BQXRCLEVBQThCO0FBQzVCLGFBQUssV0FBTDtBQUNBO0FBQ0Q7QUFDRCxZQUFNLE9BQU47QUFDQSxZQUFNLEdBQU4sQ0FBVSxnQkFBUTtBQUNoQixZQUFJLENBQUMsQ0FBQyxLQUFLLFFBQUwsQ0FBYyxNQUFwQixFQUE0QjtBQUMxQixnQkFBSyxhQUFMLENBQW1CLElBQW5CLEVBQXlCLEtBQXpCO0FBQ0EsZ0JBQUssR0FBTCxDQUFTLGVBQVQsQ0FBeUIsSUFBekIsQ0FBOEI7QUFDNUIsbUJBQU8sSUFEcUI7QUFFNUIs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Q3hCLFFBQUksWUFBWSxFQUFoQjtBQUNBLFFBQUksS0FBSyxPQUFMLENBQWEsR0FBYixDQUFKLEVBQXVCO0FBQ3JCLFVBQUksR0FBSixDQUFRLGlCQUFTO0FBQ2YsWUFBSSxPQUFPLFFBQVAsQ0FBZ0IsTUFBTSxJQUFOLENBQVcsS0FBM0IsQ0FBSixFQUF1QztBQUNyQyxvQkFBVSxJQUFWLENBQWUsS0FBZjtBQUNEO0FBQ0YsT0FKRDs7QUFNQSxhQUFPLFNBQVA7QUFDRCxLQVJELE1BUU87QUFDTCxjQUFRLEtBQVIsQ0FBYyx3Q0FBd0MsR0FBeEMsR0FBOEMsZUFBNUQ7QUFDQTtBQUNEO0FBQ0Y7QUEzRFUsQ0FBYjs7a0JBOERlLEkiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIGltcG9ydCBsaW5rIGZyb20gJy4vbGluaydcbiBpbXBvcnQgdXRpbCBmcm9tICcuL3V0aWxzJ1xuXG4gY2xhc3MgY29tcGlsZSB7XG4gIC8vIOmAkuW9kkRPTeagkVxuICBjb25zdHJ1Y3RvciAocGFyZW50LCBzamYpIHtcbiAgICB0aGlzLnNqZiA9IHNqZlxuICAgIHRoaXMuc2VhcmNoTm9kZSA9IFtdXG4gICAgdGhpcy5yb290Q29udGVudCA9IHRoaXMuc2pmLl9lbC5pbm5lckhUTUxcbiAgICAvLyB0aGlzLnRyYXZlcnNlRWxlbWVudChwYXJlbnQsIG51bGwsIHRydWUpXG4gICAgdGhpcy5jaXJjbGVFbGVtZW50KHRoaXMuc2pmLl9lbCwgdHJ1ZSlcbiAgfVxuXG4gIGNpcmNsZUVsZW1lbnQgKHBhcmVudCwgaXNGaXJzdCkge1xuICAgIGxldCBjaGlsZCA9IEFycmF5LmZyb20ocGFyZW50LmNoaWxkcmVuKVxuICAgIC8vIOWmguaenOaYr+esrOS4gOasoemBjeWOhuW5tuS4lOayoeacieWtkOiKgueCueWwseebtOaOpei3s+i/h2NvbXBpbGVcbiAgICBpZiAoaXNGaXJzdCAmJiAhY2hpbGQubGVuZ3RoKSB7XG4gICAgICB0aGlzLmNvbXBpbGVOb2RlKClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjaGlsZC5yZXZlcnNlKClcbiAgICBjaGlsZC5tYXAobm9kZSA9PiB7XG4gICAgICBpZiAoISFub2RlLmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICB0aGlzLmNpcmNsZUVsZW1lbnQobm9kZSwgZmFsc2UpXG4gICAgICAgIHRoaXMuc2pmLl91bmNvbXBpbGVOb2Rlcy5wdXNoKHtcbiAgICAgICAgICBjaGVjazogbm9kZSxcbiAgICAgICAgICBwYXJlbnQ6IG5vZGUucGFyZW50Tm9kZSxcbiAgICAgICAgICBub2RlVHlwZTogJ2VsZW1lbnROb2RlJ1xuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzLnB1c2goe1xuICAgICAgICAgIGNoZWNrOiBub2RlLCBcbiAgICAgICAgICBwYXJlbnQ6IG5vZGUucGFyZW50Tm9kZSxcbiAgICAgICAgICBub2RlVHlwZTogJ2VsZW1lbnROb2RlJ1xuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBpZiAodGhpcy5zamYuX2VsLmxhc3RFbGVtZW50Q2hpbGQgPT09IGNoaWxkWzBdKSB7XG4gICAgICB0aGlzLmNvbXBpbGVOb2RlKClcbiAgICB9XG4gIH1cblxuICBjb21waWxlTm9kZSAoKSB7XG4gICAgbGV0IGhhc1VuY29tcGlsZSA9IHRoaXMuc2pmLl91bmNvbXBpbGVOb2Rlcy5sZW5ndGhcbiAgICB0aGlzLnNqZi5fdW5jb21waWxlTm9kZXMucmV2ZXJzZSgpXG4gICAgaWYgKGhhc1VuY29tcGlsZSkge1xuICAgICAgdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzLm1hcCh2YWx1ZSA9PiB7XG4gICAgICAgIHRoaXMuaGFzRGlyZWN0aXZlKHZhbHVlKVxuICAgICAgfSlcbiAgICB9XG4gICAgdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzID0gW11cbiAgICBuZXcgbGluayh0aGlzLnNqZilcbiAgfVxuXG4gIC8vIOajgOa1i+avj+S4qm5vZGXnnIvmmK/lkKbnu5HlrprmnInmjIfku6RcbiAgaGFzRGlyZWN0aXZlICh2YWx1ZSkge1xuICAgIGxldCBjaGVja1JlZyA9IC9zamYtLis9XFxcIi4rXFxcInxcXHtcXHsuK1xcfVxcfS9cbiAgICBpZiAoY2hlY2tSZWcudGVzdCh2YWx1ZS5jaGVjay5jbG9uZU5vZGUoKS5vdXRlckhUTUwpKSB7XG4gICAgICB0aGlzLnNqZi5fdW5saW5rTm9kZXMucHVzaCh2YWx1ZSlcbiAgICB9XG4gICAgQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKHZhbHVlLmNoZWNrLmNoaWxkTm9kZXMsIG5vZGUgPT4ge1xuICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDMpIHtcbiAgICAgICAgaWYgKGNoZWNrUmVnLnRlc3Qobm9kZS5kYXRhKSkge1xuICAgICAgICAgIHRoaXMuc2pmLl91bmxpbmtOb2Rlcy5wdXNoKHtcbiAgICAgICAgICAgIGNoZWNrOiBub2RlLCBcbiAgICAgICAgICAgIHBhcmVudDogdmFsdWUuY2hlY2ssIFxuICAgICAgICAgICAgbm9kZVR5cGU6ICd0ZXh0Tm9kZSdcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjb21waWxlXG4iLCJpbXBvcnQgdXRpbCBmcm9tICcuL3V0aWxzJ1xuXG5jb25zdCBkaXJlY3RpdmVEZWFsID0ge1xuICAnc2pmLWlmJzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFsdWUubm9kZS5zdHlsZS5kaXNwbGF5ID0gKCEhKHZhbHVlLmV4cHJlc3Npb24pID8gJ2Jsb2NrIWltcG9ydGFudCcgOiAnbm9uZSFpbXBvcnRhbnQnKVxuICB9LFxuICAnc2pmLXNob3cnOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBsZXQgZGlzcGxheVZhbHVlID0gdGhpcy5fZGF0YVt2YWx1ZS5leHByZXNzaW9uXSA/ICdibG9jaycgOiAnbm9uZSdcbiAgICAvLyB2YWx1ZS5ub2RlLmNoZWNrLnN0eWxlLmRpc3BsYXkgPSBcbiAgICB2YWx1ZS5ub2RlLmNoZWNrLnN0eWxlLnNldFByb3BlcnR5KCdkaXNwbGF5JywgZGlzcGxheVZhbHVlLCAnaW1wb3J0YW50JylcbiAgfSxcbiAgJ3NqZi1mb3InOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAvLyDlsIbooajovr7lvI/pgJrov4fnqbrmoLwo5LiN6ZmQ56m65qC85pWw55uuKee7meWIh+W8gFxuICAgIGxldCBsb29wT2JqZWN0TmFtZSA9IHZhbHVlLmV4cHJlc3Npb24uc3BsaXQoL1xccysvKVsyXVxuICAgIGxldCByZXByZXNlbnRhdGl2ZU5hbWUgPSB2YWx1ZS5leHByZXNzaW9uLnNwbGl0KC9cXHMrLylbMF1cbiAgICBsZXQgdG9Mb29wT2JqZWN0ID0gbnVsbFxuICAgIGlmICh0aGlzLl9kYXRhLmhhc093blByb3BlcnR5KGxvb3BPYmplY3ROYW1lKSkge1xuICAgICAgdG9Mb29wT2JqZWN0ID0gdGhpcy5fZGF0YVtsb29wT2JqZWN0TmFtZV1cbiAgICB9XG4gICAgLy8g5Yik5pat5b6F5b6q546v55qE5piv5ZCm6IO96L+b6KGM5b6q546vXG4gICAgbGV0IGlzTG9vcGFibGUgPSB0b0xvb3BPYmplY3QgaW5zdGFuY2VvZiBBcnJheSB8fCAhaXNOYU4odG9Mb29wT2JqZWN0KVxuICAgIGlmICghaXNMb29wYWJsZSkge1xuICAgICAgY29uc29sZS5lcnJvcignc2pmW2Vycm9yXTogdGhlIHRvTG9vcE9iamVjdCBvZiBzamYtZm9yIHNob3VsZCBiZSBhIG51bWJlciBvciBhbiBBcnJheScpXG4gICAgICByZXR1cm4gXG4gICAgfVxuICAgIC8vIOWIpOaWreaYr+aVsOe7hOi/mOaYr+aVsOWtl++8jOS7juiAjOi1i+WAvGxlbmd0aFxuICAgIGxldCBpc0FycmF5ID0gdXRpbC5pc0FycmF5KHRvTG9vcE9iamVjdClcbiAgICBsZXQgbGVuID0gaXNBcnJheSA/IHRvTG9vcE9iamVjdC5sZW5ndGggOiB0b0xvb3BPYmplY3RcbiAgICBsZXQgY2xvbmVkQ2hlY2tOb2RlID0gdmFsdWUubm9kZS5jaGVjay5jbG9uZU5vZGUodHJ1ZSlcbiAgICBsZXQgY2xvbmVkQ2hlY2tOb2RlTGVuZ3RoID0gY2xvbmVkQ2hlY2tOb2RlLmNoaWxkTm9kZXMubGVuZ3RoXG4gICAgdmFsdWUubm9kZS5jaGVjay5yZW1vdmVBdHRyaWJ1dGUoJ3NqZi1mb3InKVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgdmFsdWUuYmVmb3JlRGlyZWN0aXZlcy5tYXAoZGlyZWN0aXZlID0+IHtcbiAgICAgICAgaWYgKGRpcmVjdGl2ZS5leHByZXNzaW9uID09PSByZXByZXNlbnRhdGl2ZU5hbWUpIHtcbiAgICAgICAgICBkaXJlY3RpdmVbJ3RleHROb2RlVmFsdWUnXSA9IHRvTG9vcE9iamVjdFtpXVxuICAgICAgICAgIGRpcmVjdGl2ZVsncmVwcmVzZW50YXRpdmVOYW1lJ10gPSByZXByZXNlbnRhdGl2ZU5hbWVcbiAgICAgICAgICBkaXJlY3RpdmVbJ2NoZWNrTm9kZUNoaWxkTGVuZ3RoJ10gPSBjbG9uZWRDaGVja05vZGVMZW5ndGhcbiAgICAgICAgICBkaXJlY3RpdmVEZWFsW2RpcmVjdGl2ZS5kaXJlY3RpdmVdLmJpbmQodGhpcykoZGlyZWN0aXZlKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgbGV0IGNsb25lZE5vZGUgPSB2YWx1ZS5ub2RlLmNoZWNrLmNsb25lTm9kZSh0cnVlKVxuICAgICAgdmFsdWUubm9kZS5wYXJlbnQuaW5zZXJ0QmVmb3JlKGNsb25lZE5vZGUsIHZhbHVlLm5vZGUuY2hlY2spXG4gICAgfVxuICAgIHZhbHVlLm5vZGUucGFyZW50LnJlbW92ZUNoaWxkKHZhbHVlLm5vZGUuY2hlY2spXG5cbiAgICBpZiAodG9Mb29wT2JqZWN0ICYmIGlzQXJyYXkpIHtcbiAgICAgIHRoaXMuX3dhdGNoZXJzLnB1c2godG9Mb29wT2JqZWN0KVxuICAgIH1cbiAgfSxcbiAgJ3NqZi10ZXh0JzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgbGV0IHRleHROb2RlVmxhdWUgPSAhdmFsdWUudGV4dE5vZGVWYWx1ZSA/IHRoaXMuX2RhdGFbdmFsdWUuZXhwcmVzc2lvbl0gOiB2YWx1ZS50ZXh0Tm9kZVZhbHVlXG4gICAgbGV0IGNoZWNrTm9kZSA9IHZhbHVlLm5vZGUuY2hlY2tcblxuICAgIGlmICh2YWx1ZS5ub2RlLm5vZGVUeXBlID09PSAnZWxlbWVudE5vZGUnKSB7XG4gICAgICBsZXQgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0Tm9kZVZsYXVlKVxuICAgICAgbGV0IGhhc0NoaWxkID0gY2hlY2tOb2RlLmNoaWxkTm9kZXMubGVuZ3RoXG5cbiAgICAgIGlmIChjaGVja05vZGUuY2hpbGROb2Rlcy5sZW5ndGggPT0gdmFsdWUuY2hlY2tOb2RlQ2hpbGRMZW5ndGggKyAxKSB7XG4gICAgICAgIGNoZWNrTm9kZS5yZW1vdmVDaGlsZChjaGVja05vZGUuZmlyc3RDaGlsZClcbiAgICAgIH1cbiAgICAgIGhhc0NoaWxkID8gY2hlY2tOb2RlLmluc2VydEJlZm9yZSh0ZXh0Tm9kZSwgY2hlY2tOb2RlLmZpcnN0Q2hpbGQpIDogY2hlY2tOb2RlLmFwcGVuZENoaWxkKHRleHROb2RlKVxuICAgIH0gZWxzZSB7XG4gICAgICBjaGVja05vZGUuZGF0YSA9IHRleHROb2RlVmxhdWVcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZGlyZWN0aXZlRGVhbFxuIiwiaW1wb3J0IG9wdGlvbiBmcm9tICcuL29wdGlvbidcbmltcG9ydCByZW5kZXIgZnJvbSAnLi9yZW5kZXInXG5pbXBvcnQgdXRpbCBmcm9tICcuL3V0aWxzJ1xuXG5jbGFzcyBsaW5rIHtcbiAgY29uc3RydWN0b3IgKHNqZikge1xuICAgIHRoaXMuc2pmID0gc2pmXG4gICAgbGV0IGhhc1VubGlua05vZGUgPSB0aGlzLnNqZi5fdW5saW5rTm9kZXMubGVuZ3RoXG4gICAgaWYgKGhhc1VubGlua05vZGUpIHtcbiAgICAgIGxldCBleHRyYWN0UmVnID0gL3NqZi1bYS16XSs9XFxcIlteXCJdK1xcXCJ8XFx7XFx7LitcXH1cXH0vZ1xuICAgICAgdGhpcy5zamYuX3VubGlua05vZGVzLm1hcCh2YWx1ZSA9PiB7XG4gICAgICAgIGxldCBkaXJlY3RpdmVzID0gW11cbiAgICAgICAgaWYgKHZhbHVlLm5vZGVUeXBlID09PSAndGV4dE5vZGUnKSB7XG4gICAgICAgICAgZGlyZWN0aXZlcyA9IHZhbHVlLmNoZWNrLmRhdGEubWF0Y2goZXh0cmFjdFJlZylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkaXJlY3RpdmVzID0gdmFsdWUuY2hlY2suY2xvbmVOb2RlKCkub3V0ZXJIVE1MLm1hdGNoKGV4dHJhY3RSZWcpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRpcmVjdGl2ZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgIGxldCB3aXRoTmFtZURpcmVjdGl2ZXMgPSBkaXJlY3RpdmVzLm1hcChkaXJlY3RpdmUgPT4gdGhpcy5hZGREaXJlY3RpdmVOYW1lKGRpcmVjdGl2ZSkpXG4gICAgICAgICAgd2l0aE5hbWVEaXJlY3RpdmVzID0gdXRpbC5zb3J0RXhleHV0ZVF1ZXVlKCduYW1lJywgd2l0aE5hbWVEaXJlY3RpdmVzKVxuICAgICAgICAgIHdpdGhOYW1lRGlyZWN0aXZlcy5tYXAoZGlyZWN0aXZlID0+IHtcbiAgICAgICAgICAgIHRoaXMuZXh0cmFjdERpcmVjdGl2ZShkaXJlY3RpdmUudmFsdWUsIHZhbHVlKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGlyZWN0aXZlcy5tYXAoZGlyZWN0aXZlID0+IHtcbiAgICAgICAgICAgIHRoaXMuZXh0cmFjdERpcmVjdGl2ZShkaXJlY3RpdmUsIHZhbHVlKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICB0aGlzLl91bmxpbmtOb2RlcyA9IFtdXG4gICAgICBuZXcgcmVuZGVyKHRoaXMuc2pmKVxuICAgIH1cbiAgfVxuXG4gIGFkZERpcmVjdGl2ZU5hbWUgKGRpcmVjdGl2ZSkge1xuICAgIGxldCBzbGljZXMgPSBkaXJlY3RpdmUuc3BsaXQoJz0nKVxuICAgIGlmIChzbGljZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOiAnc2pmLXRleHQnLFxuICAgICAgICB2YWx1ZTogZGlyZWN0aXZlXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5hbWU6IHNsaWNlc1swXSxcbiAgICAgICAgdmFsdWU6IGRpcmVjdGl2ZVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIOaPkOWPluaMh+S7pFxuICBleHRyYWN0RGlyZWN0aXZlIChkaXJlY3RpdmUsIG5vZGUpIHtcbiAgICBsZXQgc2xpY2VzID0gZGlyZWN0aXZlLnNwbGl0KCc9JylcbiAgICAvLyDlpoLmnpzmmK/kuovku7blsLHnm7TmjqXpgJrov4dhZGRFdmVudExpc3RlbmVy6L+b6KGM57uR5a6aXG4gICAgaWYgKG9wdGlvbi5zamZFdmVudHMuaW5kZXhPZihzbGljZXNbMF0pID49IDApIHtcbiAgICAgIGxldCBldmVudE1lcyA9IHtcbiAgICAgICAgdHlwZTogJ2V2ZW50JyxcbiAgICAgICAgdGFyZ2V0OiBub2RlLFxuICAgICAgICBuYW1lOiBzbGljZXNbMF0sXG4gICAgICAgIGZ1bmM6IHNsaWNlc1sxXVxuICAgICAgfVxuICAgICAgdGhpcy5zamYuX3VucmVuZGVyTm9kZXMucHVzaChldmVudE1lcylcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGV4cHJlc3Npb24gPSBzbGljZXNbMF0ucmVwbGFjZSgvW1xce1xcfV0vZywgJycpXG4gICAgICBsZXQgZGlyZWN0aXZlTmFtZSA9ICdzamYtdGV4dCdcbiAgICAgIC8vIOWvuemdnnt7fX3ov5nnp43ooajovr7lvI/ov5vooYzljZXni6zlpITnkIZcbiAgICAgIGlmICghL1xce1xcey4rXFx9XFx9Ly50ZXN0KGRpcmVjdGl2ZSkpIHtcbiAgICAgICAgZXhwcmVzc2lvbiA9IHNsaWNlc1sxXS5yZXBsYWNlKC9cXFwiL2csICcnKVxuICAgICAgICBkaXJlY3RpdmVOYW1lID0gc2xpY2VzWzBdXG4gICAgICB9XG4gICAgICB0aGlzLnNqZi5fdW5yZW5kZXJOb2Rlcy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2RpcmVjdGl2ZScsXG4gICAgICAgIG5vZGU6IG5vZGUsIFxuICAgICAgICBkaXJlY3RpdmU6IGRpcmVjdGl2ZU5hbWUsIFxuICAgICAgICBleHByZXNzaW9uOiBleHByZXNzaW9uXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBsaW5rXG4iLCJjb25zdCBvcHRpb24gPSB7XG4gIHByaW9yaXR5OiB7XG4gICAgJ3NqZi1pZic6IDIwMDAsXG4gICAgJ3NqZi1zaG93JzogMjAwMCxcbiAgICAnc2pmLWZvcic6IDEwMDAsXG4gICAgJ3NqZi1tb2RlbCc6IDEwLFxuICAgICdzamYtdGV4dCc6IDEsXG4gICAgJ3NqZi1jbGljayc6IDAsXG4gICAgJ3NqZi1tb3VzZW92ZXInOiAwLFxuICAgICdzamYtbW91c2VvdXQnOiAwLFxuICAgICdzamYtbW91c2Vtb3ZlJzogMCxcbiAgICAnc2pmLW1vdXNlZW50ZXInOiAwLFxuICAgICdzamYtbW91c2VsZWF2ZSc6IDAsXG4gICAgJ3NqZi1tb3VzZWRvd24nOiAwLFxuICAgICdzamYtbW91c2V1cCc6IDBcbiAgfSxcbiAgc2pmRXZlbnRzOiBbXG4gICAgJ3NqZi1jbGljaycsIFxuICAgICdzamYtbW91c2VvdmVyJywgXG4gICAgJ3NqZi1tb3VzZW91dCcsIFxuICAgICdzamYtbW91c2Vtb3ZlJywgXG4gICAgJ3NqZi1tb3VzZWVudGVyJyxcbiAgICAnc2pmLW1vdXNlbGVhdmUnLFxuICAgICdzamYtbW91c2Vkb3duJyxcbiAgICAnc2pmLW1vdXNldXAnXG4gIF1cbn1cblxuZXhwb3J0IGRlZmF1bHQgb3B0aW9uXG4iLCJpbXBvcnQgdXRpbCBmcm9tICcuL3V0aWxzJ1xuaW1wb3J0IGRpcmVjdGl2ZURlYWwgZnJvbSAnLi9kaXJlY3RpdmUnXG5cbmNsYXNzIHJlbmRlciB7XG4gIGNvbnN0cnVjdG9yIChzamYpIHtcbiAgICB0aGlzLnNqZiA9IHNqZlxuICAgIHRoaXMudW5CaW5kRXZlbnRzID0gW11cbiAgICB0aGlzLnVuU29ydERpcmVjdGl2ZXMgPSBbXVxuXG4gICAgbGV0IGhhc1JlbmRlciA9IHRoaXMuc2pmLl91bnJlbmRlck5vZGVzLmxlbmd0aFxuICAgIGlmIChoYXNSZW5kZXIpIHtcbiAgICAgIHRoaXMuc2pmLl91bnJlbmRlck5vZGVzLm1hcCh2YWwgPT4ge1xuICAgICAgICB2YWwudHlwZSA9PT0gJ2V2ZW50JyA/IHRoaXMudW5CaW5kRXZlbnRzLnB1c2godmFsKSA6IHRoaXMudW5Tb3J0RGlyZWN0aXZlcy5wdXNoKHZhbClcbiAgICAgIH0pXG4gICAgICB0aGlzLnNqZi5fdW5yZW5kZXJOb2RlcyA9IFtdXG4gICAgfVxuXG4gICAgdGhpcy5zb3J0RGlyZWN0aXZlKClcbiAgfVxuXG4gIHNvcnREaXJlY3RpdmUgKCkge1xuICAgIGxldCBoYXNVblNvcnREaXJlY3RpdmUgPSB0aGlzLnVuU29ydERpcmVjdGl2ZXMubGVuZ3RoXG4gICAgaWYgKGhhc1VuU29ydERpcmVjdGl2ZSkge1xuICAgICAgZm9yIChsZXQgaSA9IGhhc1VuU29ydERpcmVjdGl2ZSAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGlmICh0aGlzLnVuU29ydERpcmVjdGl2ZXNbaV0uZGlyZWN0aXZlID09PSAnc2pmLWZvcicpIHtcbiAgICAgICAgICBsZXQgc2pmQXJyID0gT2JqZWN0LmFzc2lnbihbXSwgdGhpcy51blNvcnREaXJlY3RpdmVzKVxuICAgICAgICAgIGxldCBiZWZvcmVGb3JEaXJlY3RpdmVzID0gdXRpbC5zZWFyY2hDaGlsZChzamZBcnIuc3BsaWNlKGkgKyAxKSwgdGhpcy51blNvcnREaXJlY3RpdmVzW2ldLm5vZGUuY2hlY2spXG5cbiAgICAgICAgICB0aGlzLnVuU29ydERpcmVjdGl2ZXNbaV1bJ2JlZm9yZURpcmVjdGl2ZXMnXSA9IGJlZm9yZUZvckRpcmVjdGl2ZXNcbiAgICAgICAgICB0aGlzLnVuU29ydERpcmVjdGl2ZXMuc3BsaWNlKGkgKyAxLCBiZWZvcmVGb3JEaXJlY3RpdmVzLmxlbmd0aClcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnVuU29ydERpcmVjdGl2ZXMubWFwKHZhbHVlID0+IHtcbiAgICAgICAgZGlyZWN0aXZlRGVhbFt2YWx1ZS5kaXJlY3RpdmVdLmJpbmQodGhpcy5zamYpKHZhbHVlKVxuICAgICAgfSlcbiAgICB9XG4gICAgLy8gdGhpcy5iaW5kRXZlbnQoKVxuICB9XG5cbiAgLy8g57uR5a6a5LqL5Lu2XG4gIGJpbmRFdmVudCAoKSB7XG4gICAgbGV0IGV2ZW50UXVlbmUgPSB0aGlzLnVuQmluZEV2ZW50c1xuICAgIGlmIChldmVudFF1ZW5lLmxlbmd0aCkge1xuICAgICAgZXZlbnRRdWVuZS5tYXAodmFsID0+IHtcbiAgICAgICAgbGV0IGNoZWNrTm9kZSA9IHZhbC50YXJnZXQuY2hlY2tcbiAgICAgICAgbGV0IGV2ZW50VHlwZSA9IHV0aWwucmVtb3ZlUHJlZml4KHZhbC5uYW1lKVxuICAgICAgICBsZXQgZXZlbnRGdW5jID0gdGhpcy5zamZbJ18nICsgdXRpbC5yZW1vdmVCcmFja2V0cyh2YWwuZnVuYyldXG4gICAgICAgIGNoZWNrTm9kZS5yZW1vdmVBdHRyaWJ1dGUodmFsLm5hbWUpXG5cbiAgICAgICAgZXZlbnRGdW5jID8gY2hlY2tOb2RlLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBldmVudEZ1bmMsIGZhbHNlKSA6IGNvbnNvbGUuZXJyb3IoJ3NqZltlcnJvcl06IHRoZSAnICsgdmFsLmZ1bmMgKyAnIGlzIG5vdCBkZWNsYXJlZCcpXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCByZW5kZXJcbiIsImltcG9ydCBjb21waWxlIGZyb20gJy4vY29tcGlsZSdcblxuY2xhc3MgU2pmRGF0YUJpbmQge1xuICBjb25zdHJ1Y3RvciAocGFyYW0pIHtcbiAgICBpZiAoIXBhcmFtLmhhc093blByb3BlcnR5KCdlbCcpIHx8ICFwYXJhbS5oYXNPd25Qcm9wZXJ0eSgnZGF0YScpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdzamZbZXJyb3JdOiBUaGVyZSBpcyBuZWVkIGBkYXRhYCBhbmQgYGVsYCBhdHRyaWJ1dGUnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuX2VsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihwYXJhbS5lbClcbiAgICB0aGlzLl9kYXRhID0gcGFyYW0uZGF0YVxuICAgIHRoaXMuX3dhdGNoZXJzID0gW11cbiAgICB0aGlzLl91bmNvbXBpbGVOb2RlcyA9IFtdXG4gICAgdGhpcy5fdW5saW5rTm9kZXMgPSBbXVxuICAgIHRoaXMuX3VucmVuZGVyTm9kZXMgPSBbXVxuICAgIGZvciAobGV0IG1ldGhvZCBpbiBwYXJhbS5tZXRob2RzKSB7XG4gICAgICAvLyDlvLrliLblsIblrprkuYnlnKhtZXRob2Rz5LiK55qE5pa55rOV55u05o6l57uR5a6a5ZyoU2pmRGF0YUJpbmTkuIrvvIzlubbkv67mlLnov5nkupvmlrnms5XnmoR0aGlz5oyH5ZCR5Li6U2pmRGF0YUJpbmRcbiAgICAgIGlmIChwYXJhbS5tZXRob2RzLmhhc093blByb3BlcnR5KG1ldGhvZCkpIHtcbiAgICAgICAgdGhpc1snXycgKyBtZXRob2RdID0gcGFyYW0ubWV0aG9kc1ttZXRob2RdLmJpbmQodGhpcylcbiAgICAgIH1cbiAgICB9XG4gICAgbmV3IGNvbXBpbGUodGhpcy5fZWwsIHRoaXMpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2pmRGF0YUJpbmRcbiIsImltcG9ydCBvcHRpb24gZnJvbSAnLi9vcHRpb24nXG5cbmNvbnN0IHV0aWwgPSB7XG4gIC8vIGp1ZGdlIHRoZSB0eXBlIG9mIG9ialxuICBqdWRnZVR5cGUgKG9iaikge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKVxuICB9LFxuICAvLyByZW1vdmUgdGhlIHByZWZpeCBvZiBzamYtXG4gIHJlbW92ZVByZWZpeCAoc3RyKSB7XG4gICAgcmV0dXJuIHN0ciA9IHN0ci5yZXBsYWNlKC9zamYtLywgJycpXG4gIH0sXG4gIC8vIHJlbW92ZSB0aGUgYnJhY2tldHMgKClcbiAgcmVtb3ZlQnJhY2tldHMgKHN0cikge1xuICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9cXFwiL2csICcnKVxuICAgIHJldHVybiBzdHIgPSBzdHIucmVwbGFjZSgvXFwoXFwpLywgJycpXG4gIH0sXG4gIHNvcnRFeGV4dXRlUXVldWUgKHByb3BlcnR5LCBvYmpBcnIpIHtcbiAgICByZXR1cm4gb2JqQXJyLnNvcnQoKG9iajEsIG9iajIpID0+IHtcbiAgICAgIGxldCB2YWwxID0gb3B0aW9uLnByaW9yaXR5W29iajFbcHJvcGVydHldXVxuICAgICAgbGV0IHZhbDIgPSBvcHRpb24ucHJpb3JpdHlbb2JqMltwcm9wZXJ0eV1dXG4gICAgICByZXR1cm4gdmFsMiAtIHZhbDFcbiAgICB9KVxuICB9LFxuICBpc0FycmF5IChhcnIpIHtcbiAgICByZXR1cm4gdXRpbC5qdWRnZVR5cGUoYXJyKSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICB9LFxuICBpc1N0YWljdE9iamVjdCAob2JqKSB7XG4gICAgcmV0dXJuIHV0aWwuanVkZ2VUeXBlKG9iaikgPT09ICdbb2JqZWN0IE9iamVjdF0nXG4gIH0sXG4gIGRlZXBDb3B5IChzb3VyY2UsIGRlc3QpIHtcbiAgICBpZiAoIXV0aWwuaXNBcnJheShzb3VyY2UpICYmICF1dGlsLmlzU3RhaWN0T2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHRocm93ICd0aGUgc291cmNlIHlvdSBzdXBwb3J0IGNhbiBub3QgYmUgY29waWVkJ1xuICAgIH1cblxuICAgIHZhciBjb3B5U291cmNlID0gdXRpbC5pc0FycmF5KHNvdXJjZSkgPyBbXSA6IHt9XG4gICAgZm9yICh2YXIgcHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgaWYgKHV0aWwuaXNBcnJheShzb3VyY2VbcHJvcF0pIHx8IHV0aWwuaXNTdGFpY3RPYmplY3Qoc291cmNlW3Byb3BdKSkge1xuICAgICAgICAgIGNvcHlTb3VyY2VbcHJvcF0gPSB1dGlsLmRlZXBDb3B5KHNvdXJjZVtwcm9wXSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb3B5U291cmNlW3Byb3BdID0gc291cmNlW3Byb3BdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY29weVNvdXJjZVxuICB9LFxuICBzZWFyY2hDaGlsZCAoYXJyLCBwYXJlbnQpIHtcbiAgICBsZXQgcmVzdWx0QXJyID0gW11cbiAgICBpZiAodXRpbC5pc0FycmF5KGFycikpIHtcbiAgICAgIGFyci5tYXAodmFsdWUgPT4ge1xuICAgICAgICBpZiAocGFyZW50LmNvbnRhaW5zKHZhbHVlLm5vZGUuY2hlY2spKSB7XG4gICAgICAgICAgcmVzdWx0QXJyLnB1c2godmFsdWUpXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiByZXN1bHRBcnJcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5lcnJvcignc2pmW2Vycm9yXTogdGhlIGFyciBpbiBzZWFyY2hDaGlsZCAnICsgYXJyICsgJyBpcyBub3QgQXJyYXknKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHV0aWxcbiJdfQ==
var _r=_m(6);_g.Sjf=_g.SjfDataBind=_r;return _r;})})(typeof window!=='undefined'?window:(typeof global!=='undefined'?global:(typeof self!=='undefined'?self:this)));