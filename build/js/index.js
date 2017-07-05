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
    // 对指令按照优先级进行排序
    _utils2.default.sortArr(value.beforeDirectives, _utils2.default.directiveSortFilter);

    var _loop = function _loop(i) {
      value.beforeDirectives.map(function (directive) {
        if (directive.expression === representativeName) {
          directive['textNodeValue'] = toLoopObject[i];
          directive['representativeName'] = representativeName;
          directive['checkNodeChildLength'] = clonedCheckNodeLength;
        }
        directiveDeal[directive.directive].bind(_this)(directive);
      });
      value.beforeEvents.map(function (event) {
        var funcString = _utils2.default.removeBrackets(event.func);
        var funcName = _utils2.default.extractFuncName(funcString);
        var funcArg = _utils2.default.extractFuncArg(funcString);
        console.log('funcName', funcName);
        console.log('funcArg', funcArg);
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
          node: node,
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

      var unSortDirectiveLen = this.unSortDirectives.length;
      if (unSortDirectiveLen) {
        for (var i = unSortDirectiveLen - 1; i >= 0; i--) {
          if (this.unSortDirectives[i].directive === 'sjf-for') {
            var copyDirectives = Object.assign([], this.unSortDirectives);
            var copyEvents = Object.assign([], this.unBindEvents);
            var beforeForDirectives = _utils2.default.searchChild(copyDirectives.splice(i + 1), this.unSortDirectives[i].node.check);
            var beforeForEvents = _utils2.default.searchChild(copyEvents, this.unSortDirectives[i].node.check);

            this.unSortDirectives[i]['beforeDirectives'] = beforeForDirectives;
            this.unSortDirectives.splice(i + 1, beforeForDirectives.length);

            this.unSortDirectives[i]['beforeEvents'] = beforeForEvents;
            this.unBindEvents.splice(copyEvents.indexOf(beforeForEvents[0]), beforeForEvents.length);
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
          var checkNode = val.node.check;
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
  extractFuncName: function extractFuncName(str) {
    str = str.replace(/\([\w|,|\s]+\)/, '');
    return str;
  },
  extractFuncArg: function extractFuncArg(str) {
    str = str.replace(/\w+\(|\)/g, '');
    return str;
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

  // deep copy of Object or Arr
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

  // search the whole child Node of parent Node
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
  },

  // the filter to sort the directives
  directiveSortFilter: function directiveSortFilter(ahead, after) {
    var aheadPriority = _option2.default.priority[ahead.directive];
    var afterPriority = _option2.default.priority[after.directive];

    return afterPriority - aheadPriority;
  },
  sortArr: function sortArr(arr, sortFilter) {
    return arr.sort(sortFilter);
  }
};

exports.default = util;

},{"./option":4}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2UvamF2YXNjcmlwdC9jb21waWxlLmpzIiwic291cmNlL2phdmFzY3JpcHQvZGlyZWN0aXZlLmpzIiwic291cmNlL2phdmFzY3JpcHQvbGluay5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L29wdGlvbi5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3JlbmRlci5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3NqZkRhdGFCaW5kLmpzIiwic291cmNlL2phdmFzY3JpcHQvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FDOzs7O0FBQ0E7Ozs7Ozs7O0lBRU0sTztBQUNMO0FBQ0EsbUJBQWEsTUFBYixFQUFxQixHQUFyQixFQUEwQjtBQUFBOztBQUN4QixTQUFLLEdBQUwsR0FBVyxHQUFYO0FBQ0EsU0FBSyxVQUFMLEdBQWtCLEVBQWxCO0FBQ0EsU0FBSyxXQUFMLEdBQW1CLEtBQUssR0FBTCxDQUFTLEdBQVQsQ0FBYSxTQUFoQztBQUNBO0FBQ0EsU0FBSyxhQUFMLENBQW1CLEtBQUssR0FBTCxDQUFTLEdBQTVCLEVBQWlDLElBQWpDO0FBQ0Q7Ozs7a0NBRWMsTSxFQUFRLE8sRUFBUztBQUFBOztBQUM5QixVQUFJLFFBQVEsTUFBTSxJQUFOLENBQVcsT0FBTyxRQUFsQixDQUFaO0FBQ0E7QUFDQSxVQUFJLFdBQVcsQ0FBQyxNQUFNLE1BQXRCLEVBQThCO0FBQzVCLGFBQUssV0FBTDtBQUNBO0FBQ0Q7QUFDRCxZQUFNLE9BQU47QUFDQSxZQUFNLEdBQU4sQ0FBVSxnQkFBUTtBQUNoQixZQUFJLENBQUMsQ0FBQyxLQUFLLFFBQUwsQ0FBYyxNQUFwQixFQUE0QjtBQUMxQixnQkFBSyxhQUFMLENBQW1CLElBQW5CLEVBQXlCLEtBQXpCO0FBQ0EsZ0JBQUssR0FBTCxDQUFTLGVBQVQsQ0FBeUIsSUFBekIsQ0FBOEI7QUFDNUIsbUJBQU8sSUFEcUI7QUFFNUIs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QWEsR0FBYixDQUFKLEVBQXVCO0FBQ3JCLFVBQUksR0FBSixDQUFRLGlCQUFTO0FBQ2YsWUFBSSxPQUFPLFFBQVAsQ0FBZ0IsTUFBTSxJQUFOLENBQVcsS0FBM0IsQ0FBSixFQUF1QztBQUNyQyxvQkFBVSxJQUFWLENBQWUsS0FBZjtBQUNEO0FBQ0YsT0FKRDs7QUFNQSxhQUFPLFNBQVA7QUFDRCxLQVJELE1BUU87QUFDTCxjQUFRLEtBQVIsQ0FBYyx3Q0FBd0MsR0FBeEMsR0FBOEMsZUFBNUQ7QUFDQTtBQUNEO0FBQ0YsR0FyRVU7O0FBc0VYO0FBQ0EscUJBdkVXLCtCQXVFVSxLQXZFVixFQXVFaUIsS0F2RWpCLEVBdUV3QjtBQUNqQyxRQUFJLGdCQUFnQixpQkFBTyxRQUFQLENBQWdCLE1BQU0sU0FBdEIsQ0FBcEI7QUFDQSxRQUFJLGdCQUFnQixpQkFBTyxRQUFQLENBQWdCLE1BQU0sU0FBdEIsQ0FBcEI7O0FBRUEsV0FBTyxnQkFBZ0IsYUFBdkI7QUFDRCxHQTVFVTtBQTZFWCxTQTdFVyxtQkE2RUYsR0E3RUUsRUE2RUcsVUE3RUgsRUE2RWU7QUFDeEIsV0FBTyxJQUFJLElBQUosQ0FBUyxVQUFULENBQVA7QUFDRDtBQS9FVSxDQUFiOztrQkFrRmUsSSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIgaW1wb3J0IGxpbmsgZnJvbSAnLi9saW5rJ1xuIGltcG9ydCB1dGlsIGZyb20gJy4vdXRpbHMnXG5cbiBjbGFzcyBjb21waWxlIHtcbiAgLy8g6YCS5b2SRE9N5qCRXG4gIGNvbnN0cnVjdG9yIChwYXJlbnQsIHNqZikge1xuICAgIHRoaXMuc2pmID0gc2pmXG4gICAgdGhpcy5zZWFyY2hOb2RlID0gW11cbiAgICB0aGlzLnJvb3RDb250ZW50ID0gdGhpcy5zamYuX2VsLmlubmVySFRNTFxuICAgIC8vIHRoaXMudHJhdmVyc2VFbGVtZW50KHBhcmVudCwgbnVsbCwgdHJ1ZSlcbiAgICB0aGlzLmNpcmNsZUVsZW1lbnQodGhpcy5zamYuX2VsLCB0cnVlKVxuICB9XG5cbiAgY2lyY2xlRWxlbWVudCAocGFyZW50LCBpc0ZpcnN0KSB7XG4gICAgbGV0IGNoaWxkID0gQXJyYXkuZnJvbShwYXJlbnQuY2hpbGRyZW4pXG4gICAgLy8g5aaC5p6c5piv56ys5LiA5qyh6YGN5Y6G5bm25LiU5rKh5pyJ5a2Q6IqC54K55bCx55u05o6l6Lez6L+HY29tcGlsZVxuICAgIGlmIChpc0ZpcnN0ICYmICFjaGlsZC5sZW5ndGgpIHtcbiAgICAgIHRoaXMuY29tcGlsZU5vZGUoKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNoaWxkLnJldmVyc2UoKVxuICAgIGNoaWxkLm1hcChub2RlID0+IHtcbiAgICAgIGlmICghIW5vZGUuY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuY2lyY2xlRWxlbWVudChub2RlLCBmYWxzZSlcbiAgICAgICAgdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzLnB1c2goe1xuICAgICAgICAgIGNoZWNrOiBub2RlLFxuICAgICAgICAgIHBhcmVudDogbm9kZS5wYXJlbnROb2RlLFxuICAgICAgICAgIG5vZGVUeXBlOiAnZWxlbWVudE5vZGUnXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNqZi5fdW5jb21waWxlTm9kZXMucHVzaCh7XG4gICAgICAgICAgY2hlY2s6IG5vZGUsIFxuICAgICAgICAgIHBhcmVudDogbm9kZS5wYXJlbnROb2RlLFxuICAgICAgICAgIG5vZGVUeXBlOiAnZWxlbWVudE5vZGUnXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSlcblxuICAgIGlmICh0aGlzLnNqZi5fZWwubGFzdEVsZW1lbnRDaGlsZCA9PT0gY2hpbGRbMF0pIHtcbiAgICAgIHRoaXMuY29tcGlsZU5vZGUoKVxuICAgIH1cbiAgfVxuXG4gIGNvbXBpbGVOb2RlICgpIHtcbiAgICBsZXQgaGFzVW5jb21waWxlID0gdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzLmxlbmd0aFxuICAgIHRoaXMuc2pmLl91bmNvbXBpbGVOb2Rlcy5yZXZlcnNlKClcbiAgICBpZiAoaGFzVW5jb21waWxlKSB7XG4gICAgICB0aGlzLnNqZi5fdW5jb21waWxlTm9kZXMubWFwKHZhbHVlID0+IHtcbiAgICAgICAgdGhpcy5oYXNEaXJlY3RpdmUodmFsdWUpXG4gICAgICB9KVxuICAgIH1cbiAgICB0aGlzLnNqZi5fdW5jb21waWxlTm9kZXMgPSBbXVxuICAgIG5ldyBsaW5rKHRoaXMuc2pmKVxuICB9XG5cbiAgLy8g5qOA5rWL5q+P5Liqbm9kZeeci+aYr+WQpue7keWumuacieaMh+S7pFxuICBoYXNEaXJlY3RpdmUgKHZhbHVlKSB7XG4gICAgbGV0IGNoZWNrUmVnID0gL3NqZi0uKz1cXFwiLitcXFwifFxce1xcey4rXFx9XFx9L1xuICAgIGlmIChjaGVja1JlZy50ZXN0KHZhbHVlLmNoZWNrLmNsb25lTm9kZSgpLm91dGVySFRNTCkpIHtcbiAgICAgIHRoaXMuc2pmLl91bmxpbmtOb2Rlcy5wdXNoKHZhbHVlKVxuICAgIH1cbiAgICBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwodmFsdWUuY2hlY2suY2hpbGROb2Rlcywgbm9kZSA9PiB7XG4gICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMykge1xuICAgICAgICBpZiAoY2hlY2tSZWcudGVzdChub2RlLmRhdGEpKSB7XG4gICAgICAgICAgdGhpcy5zamYuX3VubGlua05vZGVzLnB1c2goe1xuICAgICAgICAgICAgY2hlY2s6IG5vZGUsIFxuICAgICAgICAgICAgcGFyZW50OiB2YWx1ZS5jaGVjaywgXG4gICAgICAgICAgICBub2RlVHlwZTogJ3RleHROb2RlJ1xuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvbXBpbGVcbiIsImltcG9ydCB1dGlsIGZyb20gJy4vdXRpbHMnXG5cbmNvbnN0IGRpcmVjdGl2ZURlYWwgPSB7XG4gICdzamYtaWYnOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YWx1ZS5ub2RlLnN0eWxlLmRpc3BsYXkgPSAoISEodmFsdWUuZXhwcmVzc2lvbikgPyAnYmxvY2shaW1wb3J0YW50JyA6ICdub25lIWltcG9ydGFudCcpXG4gIH0sXG4gICdzamYtc2hvdyc6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGxldCBkaXNwbGF5VmFsdWUgPSB0aGlzLl9kYXRhW3ZhbHVlLmV4cHJlc3Npb25dID8gJ2Jsb2NrJyA6ICdub25lJ1xuICAgIC8vIHZhbHVlLm5vZGUuY2hlY2suc3R5bGUuZGlzcGxheSA9IFxuICAgIHZhbHVlLm5vZGUuY2hlY2suc3R5bGUuc2V0UHJvcGVydHkoJ2Rpc3BsYXknLCBkaXNwbGF5VmFsdWUsICdpbXBvcnRhbnQnKVxuICB9LFxuICAnc2pmLWZvcic6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIC8vIOWwhuihqOi+vuW8j+mAmui/h+epuuagvCjkuI3pmZDnqbrmoLzmlbDnm64p57uZ5YiH5byAXG4gICAgbGV0IGxvb3BPYmplY3ROYW1lID0gdmFsdWUuZXhwcmVzc2lvbi5zcGxpdCgvXFxzKy8pWzJdXG4gICAgbGV0IHJlcHJlc2VudGF0aXZlTmFtZSA9IHZhbHVlLmV4cHJlc3Npb24uc3BsaXQoL1xccysvKVswXVxuICAgIGxldCB0b0xvb3BPYmplY3QgPSBudWxsXG4gICAgaWYgKHRoaXMuX2RhdGEuaGFzT3duUHJvcGVydHkobG9vcE9iamVjdE5hbWUpKSB7XG4gICAgICB0b0xvb3BPYmplY3QgPSB0aGlzLl9kYXRhW2xvb3BPYmplY3ROYW1lXVxuICAgIH1cbiAgICAvLyDliKTmlq3lvoXlvqrnjq/nmoTmmK/lkKbog73ov5vooYzlvqrnjq9cbiAgICBsZXQgaXNMb29wYWJsZSA9IHRvTG9vcE9iamVjdCBpbnN0YW5jZW9mIEFycmF5IHx8ICFpc05hTih0b0xvb3BPYmplY3QpXG4gICAgaWYgKCFpc0xvb3BhYmxlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdzamZbZXJyb3JdOiB0aGUgdG9Mb29wT2JqZWN0IG9mIHNqZi1mb3Igc2hvdWxkIGJlIGEgbnVtYmVyIG9yIGFuIEFycmF5JylcbiAgICAgIHJldHVybiBcbiAgICB9XG4gICAgLy8g5Yik5pat5piv5pWw57uE6L+Y5piv5pWw5a2X77yM5LuO6ICM6LWL5YC8bGVuZ3RoXG4gICAgbGV0IGlzQXJyYXkgPSB1dGlsLmlzQXJyYXkodG9Mb29wT2JqZWN0KVxuICAgIGxldCBsZW4gPSBpc0FycmF5ID8gdG9Mb29wT2JqZWN0Lmxlbmd0aCA6IHRvTG9vcE9iamVjdFxuICAgIGxldCBjbG9uZWRDaGVja05vZGUgPSB2YWx1ZS5ub2RlLmNoZWNrLmNsb25lTm9kZSh0cnVlKVxuICAgIGxldCBjbG9uZWRDaGVja05vZGVMZW5ndGggPSBjbG9uZWRDaGVja05vZGUuY2hpbGROb2Rlcy5sZW5ndGhcblxuICAgIHZhbHVlLm5vZGUuY2hlY2sucmVtb3ZlQXR0cmlidXRlKCdzamYtZm9yJylcbiAgICAvLyDlr7nmjIfku6TmjInnhafkvJjlhYjnuqfov5vooYzmjpLluo9cbiAgICB1dGlsLnNvcnRBcnIodmFsdWUuYmVmb3JlRGlyZWN0aXZlcywgdXRpbC5kaXJlY3RpdmVTb3J0RmlsdGVyKVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgdmFsdWUuYmVmb3JlRGlyZWN0aXZlcy5tYXAoZGlyZWN0aXZlID0+IHtcbiAgICAgICAgaWYgKGRpcmVjdGl2ZS5leHByZXNzaW9uID09PSByZXByZXNlbnRhdGl2ZU5hbWUpIHtcbiAgICAgICAgICBkaXJlY3RpdmVbJ3RleHROb2RlVmFsdWUnXSA9IHRvTG9vcE9iamVjdFtpXVxuICAgICAgICAgIGRpcmVjdGl2ZVsncmVwcmVzZW50YXRpdmVOYW1lJ10gPSByZXByZXNlbnRhdGl2ZU5hbWVcbiAgICAgICAgICBkaXJlY3RpdmVbJ2NoZWNrTm9kZUNoaWxkTGVuZ3RoJ10gPSBjbG9uZWRDaGVja05vZGVMZW5ndGhcbiAgICAgICAgfVxuICAgICAgICBkaXJlY3RpdmVEZWFsW2RpcmVjdGl2ZS5kaXJlY3RpdmVdLmJpbmQodGhpcykoZGlyZWN0aXZlKVxuICAgICAgfSlcbiAgICAgIHZhbHVlLmJlZm9yZUV2ZW50cy5tYXAoZXZlbnQgPT4ge1xuICAgICAgICBsZXQgZnVuY1N0cmluZyA9IHV0aWwucmVtb3ZlQnJhY2tldHMoZXZlbnQuZnVuYylcbiAgICAgICAgbGV0IGZ1bmNOYW1lID0gdXRpbC5leHRyYWN0RnVuY05hbWUoZnVuY1N0cmluZylcbiAgICAgICAgbGV0IGZ1bmNBcmcgPSB1dGlsLmV4dHJhY3RGdW5jQXJnKGZ1bmNTdHJpbmcpXG4gICAgICAgIGNvbnNvbGUubG9nKCdmdW5jTmFtZScsIGZ1bmNOYW1lKVxuICAgICAgICBjb25zb2xlLmxvZygnZnVuY0FyZycsIGZ1bmNBcmcpXG4gICAgICB9KVxuICAgICAgbGV0IGNsb25lZE5vZGUgPSB2YWx1ZS5ub2RlLmNoZWNrLmNsb25lTm9kZSh0cnVlKVxuICAgICAgdmFsdWUubm9kZS5wYXJlbnQuaW5zZXJ0QmVmb3JlKGNsb25lZE5vZGUsIHZhbHVlLm5vZGUuY2hlY2spXG4gICAgfVxuICAgIHZhbHVlLm5vZGUucGFyZW50LnJlbW92ZUNoaWxkKHZhbHVlLm5vZGUuY2hlY2spXG5cbiAgICBpZiAodG9Mb29wT2JqZWN0ICYmIGlzQXJyYXkpIHtcbiAgICAgIHRoaXMuX3dhdGNoZXJzLnB1c2godG9Mb29wT2JqZWN0KVxuICAgIH1cbiAgfSxcbiAgJ3NqZi10ZXh0JzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgbGV0IHRleHROb2RlVmxhdWUgPSAhdmFsdWUudGV4dE5vZGVWYWx1ZSA/IHRoaXMuX2RhdGFbdmFsdWUuZXhwcmVzc2lvbl0gOiB2YWx1ZS50ZXh0Tm9kZVZhbHVlXG4gICAgbGV0IGNoZWNrTm9kZSA9IHZhbHVlLm5vZGUuY2hlY2tcblxuICAgIGlmICh2YWx1ZS5ub2RlLm5vZGVUeXBlID09PSAnZWxlbWVudE5vZGUnKSB7XG4gICAgICBsZXQgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0Tm9kZVZsYXVlKVxuICAgICAgbGV0IGhhc0NoaWxkID0gY2hlY2tOb2RlLmNoaWxkTm9kZXMubGVuZ3RoXG5cbiAgICAgIGlmIChjaGVja05vZGUuY2hpbGROb2Rlcy5sZW5ndGggPT0gdmFsdWUuY2hlY2tOb2RlQ2hpbGRMZW5ndGggKyAxKSB7XG4gICAgICAgIGNoZWNrTm9kZS5yZW1vdmVDaGlsZChjaGVja05vZGUuZmlyc3RDaGlsZClcbiAgICAgIH1cbiAgICAgIGhhc0NoaWxkID8gY2hlY2tOb2RlLmluc2VydEJlZm9yZSh0ZXh0Tm9kZSwgY2hlY2tOb2RlLmZpcnN0Q2hpbGQpIDogY2hlY2tOb2RlLmFwcGVuZENoaWxkKHRleHROb2RlKVxuICAgIH0gZWxzZSB7XG4gICAgICBjaGVja05vZGUuZGF0YSA9IHRleHROb2RlVmxhdWVcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZGlyZWN0aXZlRGVhbFxuIiwiaW1wb3J0IG9wdGlvbiBmcm9tICcuL29wdGlvbidcbmltcG9ydCByZW5kZXIgZnJvbSAnLi9yZW5kZXInXG5pbXBvcnQgdXRpbCBmcm9tICcuL3V0aWxzJ1xuXG5jbGFzcyBsaW5rIHtcbiAgY29uc3RydWN0b3IgKHNqZikge1xuICAgIHRoaXMuc2pmID0gc2pmXG4gICAgbGV0IGhhc1VubGlua05vZGUgPSB0aGlzLnNqZi5fdW5saW5rTm9kZXMubGVuZ3RoXG4gICAgaWYgKGhhc1VubGlua05vZGUpIHtcbiAgICAgIGxldCBleHRyYWN0UmVnID0gL3NqZi1bYS16XSs9XFxcIlteXCJdK1xcXCJ8XFx7XFx7LitcXH1cXH0vZ1xuICAgICAgdGhpcy5zamYuX3VubGlua05vZGVzLm1hcCh2YWx1ZSA9PiB7XG4gICAgICAgIGxldCBkaXJlY3RpdmVzID0gW11cbiAgICAgICAgaWYgKHZhbHVlLm5vZGVUeXBlID09PSAndGV4dE5vZGUnKSB7XG4gICAgICAgICAgZGlyZWN0aXZlcyA9IHZhbHVlLmNoZWNrLmRhdGEubWF0Y2goZXh0cmFjdFJlZylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkaXJlY3RpdmVzID0gdmFsdWUuY2hlY2suY2xvbmVOb2RlKCkub3V0ZXJIVE1MLm1hdGNoKGV4dHJhY3RSZWcpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRpcmVjdGl2ZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgIGxldCB3aXRoTmFtZURpcmVjdGl2ZXMgPSBkaXJlY3RpdmVzLm1hcChkaXJlY3RpdmUgPT4gdGhpcy5hZGREaXJlY3RpdmVOYW1lKGRpcmVjdGl2ZSkpXG4gICAgICAgICAgd2l0aE5hbWVEaXJlY3RpdmVzID0gdXRpbC5zb3J0RXhleHV0ZVF1ZXVlKCduYW1lJywgd2l0aE5hbWVEaXJlY3RpdmVzKVxuICAgICAgICAgIHdpdGhOYW1lRGlyZWN0aXZlcy5tYXAoZGlyZWN0aXZlID0+IHtcbiAgICAgICAgICAgIHRoaXMuZXh0cmFjdERpcmVjdGl2ZShkaXJlY3RpdmUudmFsdWUsIHZhbHVlKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGlyZWN0aXZlcy5tYXAoZGlyZWN0aXZlID0+IHtcbiAgICAgICAgICAgIHRoaXMuZXh0cmFjdERpcmVjdGl2ZShkaXJlY3RpdmUsIHZhbHVlKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICB0aGlzLl91bmxpbmtOb2RlcyA9IFtdXG4gICAgICBuZXcgcmVuZGVyKHRoaXMuc2pmKVxuICAgIH1cbiAgfVxuXG4gIGFkZERpcmVjdGl2ZU5hbWUgKGRpcmVjdGl2ZSkge1xuICAgIGxldCBzbGljZXMgPSBkaXJlY3RpdmUuc3BsaXQoJz0nKVxuICAgIGlmIChzbGljZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOiAnc2pmLXRleHQnLFxuICAgICAgICB2YWx1ZTogZGlyZWN0aXZlXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5hbWU6IHNsaWNlc1swXSxcbiAgICAgICAgdmFsdWU6IGRpcmVjdGl2ZVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIOaPkOWPluaMh+S7pFxuICBleHRyYWN0RGlyZWN0aXZlIChkaXJlY3RpdmUsIG5vZGUpIHtcbiAgICBsZXQgc2xpY2VzID0gZGlyZWN0aXZlLnNwbGl0KCc9JylcbiAgICAvLyDlpoLmnpzmmK/kuovku7blsLHnm7TmjqXpgJrov4dhZGRFdmVudExpc3RlbmVy6L+b6KGM57uR5a6aXG4gICAgaWYgKG9wdGlvbi5zamZFdmVudHMuaW5kZXhPZihzbGljZXNbMF0pID49IDApIHtcbiAgICAgIGxldCBldmVudE1lcyA9IHtcbiAgICAgICAgdHlwZTogJ2V2ZW50JyxcbiAgICAgICAgbm9kZTogbm9kZSxcbiAgICAgICAgbmFtZTogc2xpY2VzWzBdLFxuICAgICAgICBmdW5jOiBzbGljZXNbMV1cbiAgICAgIH1cbiAgICAgIHRoaXMuc2pmLl91bnJlbmRlck5vZGVzLnB1c2goZXZlbnRNZXMpXG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBleHByZXNzaW9uID0gc2xpY2VzWzBdLnJlcGxhY2UoL1tcXHtcXH1dL2csICcnKVxuICAgICAgbGV0IGRpcmVjdGl2ZU5hbWUgPSAnc2pmLXRleHQnXG4gICAgICAvLyDlr7npnZ57e3196L+Z56eN6KGo6L6+5byP6L+b6KGM5Y2V54us5aSE55CGXG4gICAgICBpZiAoIS9cXHtcXHsuK1xcfVxcfS8udGVzdChkaXJlY3RpdmUpKSB7XG4gICAgICAgIGV4cHJlc3Npb24gPSBzbGljZXNbMV0ucmVwbGFjZSgvXFxcIi9nLCAnJylcbiAgICAgICAgZGlyZWN0aXZlTmFtZSA9IHNsaWNlc1swXVxuICAgICAgfVxuICAgICAgdGhpcy5zamYuX3VucmVuZGVyTm9kZXMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdkaXJlY3RpdmUnLFxuICAgICAgICBub2RlOiBub2RlLCBcbiAgICAgICAgZGlyZWN0aXZlOiBkaXJlY3RpdmVOYW1lLCBcbiAgICAgICAgZXhwcmVzc2lvbjogZXhwcmVzc2lvblxuICAgICAgfSlcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbGlua1xuIiwiY29uc3Qgb3B0aW9uID0ge1xuICBwcmlvcml0eToge1xuICAgICdzamYtaWYnOiAyMDAwLFxuICAgICdzamYtc2hvdyc6IDIwMDAsXG4gICAgJ3NqZi1mb3InOiAxMDAwLFxuICAgICdzamYtbW9kZWwnOiAxMCxcbiAgICAnc2pmLXRleHQnOiAxLFxuICAgICdzamYtY2xpY2snOiAwLFxuICAgICdzamYtbW91c2VvdmVyJzogMCxcbiAgICAnc2pmLW1vdXNlb3V0JzogMCxcbiAgICAnc2pmLW1vdXNlbW92ZSc6IDAsXG4gICAgJ3NqZi1tb3VzZWVudGVyJzogMCxcbiAgICAnc2pmLW1vdXNlbGVhdmUnOiAwLFxuICAgICdzamYtbW91c2Vkb3duJzogMCxcbiAgICAnc2pmLW1vdXNldXAnOiAwXG4gIH0sXG4gIHNqZkV2ZW50czogW1xuICAgICdzamYtY2xpY2snLCBcbiAgICAnc2pmLW1vdXNlb3ZlcicsIFxuICAgICdzamYtbW91c2VvdXQnLCBcbiAgICAnc2pmLW1vdXNlbW92ZScsIFxuICAgICdzamYtbW91c2VlbnRlcicsXG4gICAgJ3NqZi1tb3VzZWxlYXZlJyxcbiAgICAnc2pmLW1vdXNlZG93bicsXG4gICAgJ3NqZi1tb3VzZXVwJ1xuICBdXG59XG5cbmV4cG9ydCBkZWZhdWx0IG9wdGlvblxuIiwiaW1wb3J0IHV0aWwgZnJvbSAnLi91dGlscydcbmltcG9ydCBkaXJlY3RpdmVEZWFsIGZyb20gJy4vZGlyZWN0aXZlJ1xuXG5jbGFzcyByZW5kZXIge1xuICBjb25zdHJ1Y3RvciAoc2pmKSB7XG4gICAgdGhpcy5zamYgPSBzamZcbiAgICB0aGlzLnVuQmluZEV2ZW50cyA9IFtdXG4gICAgdGhpcy51blNvcnREaXJlY3RpdmVzID0gW11cblxuICAgIGxldCBoYXNSZW5kZXIgPSB0aGlzLnNqZi5fdW5yZW5kZXJOb2Rlcy5sZW5ndGhcbiAgICBpZiAoaGFzUmVuZGVyKSB7XG4gICAgICB0aGlzLnNqZi5fdW5yZW5kZXJOb2Rlcy5tYXAodmFsID0+IHtcbiAgICAgICAgdmFsLnR5cGUgPT09ICdldmVudCcgPyB0aGlzLnVuQmluZEV2ZW50cy5wdXNoKHZhbCkgOiB0aGlzLnVuU29ydERpcmVjdGl2ZXMucHVzaCh2YWwpXG4gICAgICB9KVxuICAgICAgdGhpcy5zamYuX3VucmVuZGVyTm9kZXMgPSBbXVxuICAgIH1cblxuICAgIHRoaXMuc29ydERpcmVjdGl2ZSgpXG4gIH1cblxuICBzb3J0RGlyZWN0aXZlICgpIHtcbiAgICBsZXQgdW5Tb3J0RGlyZWN0aXZlTGVuID0gdGhpcy51blNvcnREaXJlY3RpdmVzLmxlbmd0aFxuICAgIGlmICh1blNvcnREaXJlY3RpdmVMZW4pIHtcbiAgICAgIGZvciAobGV0IGkgPSB1blNvcnREaXJlY3RpdmVMZW4gLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBpZiAodGhpcy51blNvcnREaXJlY3RpdmVzW2ldLmRpcmVjdGl2ZSA9PT0gJ3NqZi1mb3InKSB7XG4gICAgICAgICAgbGV0IGNvcHlEaXJlY3RpdmVzID0gT2JqZWN0LmFzc2lnbihbXSwgdGhpcy51blNvcnREaXJlY3RpdmVzKVxuICAgICAgICAgIGxldCBjb3B5RXZlbnRzID0gT2JqZWN0LmFzc2lnbihbXSwgdGhpcy51bkJpbmRFdmVudHMpXG4gICAgICAgICAgbGV0IGJlZm9yZUZvckRpcmVjdGl2ZXMgPSB1dGlsLnNlYXJjaENoaWxkKGNvcHlEaXJlY3RpdmVzLnNwbGljZShpICsgMSksIHRoaXMudW5Tb3J0RGlyZWN0aXZlc1tpXS5ub2RlLmNoZWNrKVxuICAgICAgICAgIGxldCBiZWZvcmVGb3JFdmVudHMgPSB1dGlsLnNlYXJjaENoaWxkKGNvcHlFdmVudHMsIHRoaXMudW5Tb3J0RGlyZWN0aXZlc1tpXS5ub2RlLmNoZWNrKVxuXG4gICAgICAgICAgdGhpcy51blNvcnREaXJlY3RpdmVzW2ldWydiZWZvcmVEaXJlY3RpdmVzJ10gPSBiZWZvcmVGb3JEaXJlY3RpdmVzXG4gICAgICAgICAgdGhpcy51blNvcnREaXJlY3RpdmVzLnNwbGljZShpICsgMSwgYmVmb3JlRm9yRGlyZWN0aXZlcy5sZW5ndGgpXG5cbiAgICAgICAgICB0aGlzLnVuU29ydERpcmVjdGl2ZXNbaV1bJ2JlZm9yZUV2ZW50cyddID0gYmVmb3JlRm9yRXZlbnRzXG4gICAgICAgICAgdGhpcy51bkJpbmRFdmVudHMuc3BsaWNlKGNvcHlFdmVudHMuaW5kZXhPZihiZWZvcmVGb3JFdmVudHNbMF0pLCBiZWZvcmVGb3JFdmVudHMubGVuZ3RoKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMudW5Tb3J0RGlyZWN0aXZlcy5tYXAodmFsdWUgPT4ge1xuICAgICAgICBkaXJlY3RpdmVEZWFsW3ZhbHVlLmRpcmVjdGl2ZV0uYmluZCh0aGlzLnNqZikodmFsdWUpXG4gICAgICB9KVxuICAgIH1cbiAgICAvLyB0aGlzLmJpbmRFdmVudCgpXG4gIH1cblxuICAvLyDnu5Hlrprkuovku7ZcbiAgYmluZEV2ZW50ICgpIHtcbiAgICBsZXQgZXZlbnRRdWVuZSA9IHRoaXMudW5CaW5kRXZlbnRzXG4gICAgaWYgKGV2ZW50UXVlbmUubGVuZ3RoKSB7XG4gICAgICBldmVudFF1ZW5lLm1hcCh2YWwgPT4ge1xuICAgICAgICBsZXQgY2hlY2tOb2RlID0gdmFsLm5vZGUuY2hlY2tcbiAgICAgICAgbGV0IGV2ZW50VHlwZSA9IHV0aWwucmVtb3ZlUHJlZml4KHZhbC5uYW1lKVxuICAgICAgICBsZXQgZXZlbnRGdW5jID0gdGhpcy5zamZbJ18nICsgdXRpbC5yZW1vdmVCcmFja2V0cyh2YWwuZnVuYyldXG4gICAgICAgIGNoZWNrTm9kZS5yZW1vdmVBdHRyaWJ1dGUodmFsLm5hbWUpXG5cbiAgICAgICAgZXZlbnRGdW5jID8gY2hlY2tOb2RlLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBldmVudEZ1bmMsIGZhbHNlKSA6IGNvbnNvbGUuZXJyb3IoJ3NqZltlcnJvcl06IHRoZSAnICsgdmFsLmZ1bmMgKyAnIGlzIG5vdCBkZWNsYXJlZCcpXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCByZW5kZXJcbiIsImltcG9ydCBjb21waWxlIGZyb20gJy4vY29tcGlsZSdcblxuY2xhc3MgU2pmRGF0YUJpbmQge1xuICBjb25zdHJ1Y3RvciAocGFyYW0pIHtcbiAgICBpZiAoIXBhcmFtLmhhc093blByb3BlcnR5KCdlbCcpIHx8ICFwYXJhbS5oYXNPd25Qcm9wZXJ0eSgnZGF0YScpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdzamZbZXJyb3JdOiBUaGVyZSBpcyBuZWVkIGBkYXRhYCBhbmQgYGVsYCBhdHRyaWJ1dGUnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuX2VsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihwYXJhbS5lbClcbiAgICB0aGlzLl9kYXRhID0gcGFyYW0uZGF0YVxuICAgIHRoaXMuX3dhdGNoZXJzID0gW11cbiAgICB0aGlzLl91bmNvbXBpbGVOb2RlcyA9IFtdXG4gICAgdGhpcy5fdW5saW5rTm9kZXMgPSBbXVxuICAgIHRoaXMuX3VucmVuZGVyTm9kZXMgPSBbXVxuICAgIGZvciAobGV0IG1ldGhvZCBpbiBwYXJhbS5tZXRob2RzKSB7XG4gICAgICAvLyDlvLrliLblsIblrprkuYnlnKhtZXRob2Rz5LiK55qE5pa55rOV55u05o6l57uR5a6a5ZyoU2pmRGF0YUJpbmTkuIrvvIzlubbkv67mlLnov5nkupvmlrnms5XnmoR0aGlz5oyH5ZCR5Li6U2pmRGF0YUJpbmRcbiAgICAgIGlmIChwYXJhbS5tZXRob2RzLmhhc093blByb3BlcnR5KG1ldGhvZCkpIHtcbiAgICAgICAgdGhpc1snXycgKyBtZXRob2RdID0gcGFyYW0ubWV0aG9kc1ttZXRob2RdLmJpbmQodGhpcylcbiAgICAgIH1cbiAgICB9XG4gICAgbmV3IGNvbXBpbGUodGhpcy5fZWwsIHRoaXMpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2pmRGF0YUJpbmRcbiIsImltcG9ydCBvcHRpb24gZnJvbSAnLi9vcHRpb24nXG5cbmNvbnN0IHV0aWwgPSB7XG4gIC8vIGp1ZGdlIHRoZSB0eXBlIG9mIG9ialxuICBqdWRnZVR5cGUgKG9iaikge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKVxuICB9LFxuICAvLyByZW1vdmUgdGhlIHByZWZpeCBvZiBzamYtXG4gIHJlbW92ZVByZWZpeCAoc3RyKSB7XG4gICAgcmV0dXJuIHN0ciA9IHN0ci5yZXBsYWNlKC9zamYtLywgJycpXG4gIH0sXG4gIC8vIHJlbW92ZSB0aGUgYnJhY2tldHMgKClcbiAgcmVtb3ZlQnJhY2tldHMgKHN0cikge1xuICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9cXFwiL2csICcnKVxuICAgIHJldHVybiBzdHIgPSBzdHIucmVwbGFjZSgvXFwoXFwpLywgJycpXG4gIH0sXG4gIGV4dHJhY3RGdW5jTmFtZSAoc3RyKSB7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UoL1xcKFtcXHd8LHxcXHNdK1xcKS8sICcnKVxuICAgIHJldHVybiBzdHJcbiAgfSxcbiAgZXh0cmFjdEZ1bmNBcmcgKHN0cikge1xuICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9cXHcrXFwofFxcKS9nLCAnJylcbiAgICByZXR1cm4gc3RyXG4gIH0sXG4gIHNvcnRFeGV4dXRlUXVldWUgKHByb3BlcnR5LCBvYmpBcnIpIHtcbiAgICByZXR1cm4gb2JqQXJyLnNvcnQoKG9iajEsIG9iajIpID0+IHtcbiAgICAgIGxldCB2YWwxID0gb3B0aW9uLnByaW9yaXR5W29iajFbcHJvcGVydHldXVxuICAgICAgbGV0IHZhbDIgPSBvcHRpb24ucHJpb3JpdHlbb2JqMltwcm9wZXJ0eV1dXG4gICAgICByZXR1cm4gdmFsMiAtIHZhbDFcbiAgICB9KVxuICB9LFxuICBpc0FycmF5IChhcnIpIHtcbiAgICByZXR1cm4gdXRpbC5qdWRnZVR5cGUoYXJyKSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICB9LFxuICBpc1N0YWljdE9iamVjdCAob2JqKSB7XG4gICAgcmV0dXJuIHV0aWwuanVkZ2VUeXBlKG9iaikgPT09ICdbb2JqZWN0IE9iamVjdF0nXG4gIH0sXG4gIC8vIGRlZXAgY29weSBvZiBPYmplY3Qgb3IgQXJyXG4gIGRlZXBDb3B5IChzb3VyY2UsIGRlc3QpIHtcbiAgICBpZiAoIXV0aWwuaXNBcnJheShzb3VyY2UpICYmICF1dGlsLmlzU3RhaWN0T2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHRocm93ICd0aGUgc291cmNlIHlvdSBzdXBwb3J0IGNhbiBub3QgYmUgY29waWVkJ1xuICAgIH1cblxuICAgIHZhciBjb3B5U291cmNlID0gdXRpbC5pc0FycmF5KHNvdXJjZSkgPyBbXSA6IHt9XG4gICAgZm9yICh2YXIgcHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgaWYgKHV0aWwuaXNBcnJheShzb3VyY2VbcHJvcF0pIHx8IHV0aWwuaXNTdGFpY3RPYmplY3Qoc291cmNlW3Byb3BdKSkge1xuICAgICAgICAgIGNvcHlTb3VyY2VbcHJvcF0gPSB1dGlsLmRlZXBDb3B5KHNvdXJjZVtwcm9wXSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb3B5U291cmNlW3Byb3BdID0gc291cmNlW3Byb3BdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY29weVNvdXJjZVxuICB9LFxuICAvLyBzZWFyY2ggdGhlIHdob2xlIGNoaWxkIE5vZGUgb2YgcGFyZW50IE5vZGVcbiAgc2VhcmNoQ2hpbGQgKGFyciwgcGFyZW50KSB7XG4gICAgbGV0IHJlc3VsdEFyciA9IFtdXG4gICAgaWYgKHV0aWwuaXNBcnJheShhcnIpKSB7XG4gICAgICBhcnIubWFwKHZhbHVlID0+IHtcbiAgICAgICAgaWYgKHBhcmVudC5jb250YWlucyh2YWx1ZS5ub2RlLmNoZWNrKSkge1xuICAgICAgICAgIHJlc3VsdEFyci5wdXNoKHZhbHVlKVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICByZXR1cm4gcmVzdWx0QXJyXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ3NqZltlcnJvcl06IHRoZSBhcnIgaW4gc2VhcmNoQ2hpbGQgJyArIGFyciArICcgaXMgbm90IEFycmF5JylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgfSxcbiAgLy8gdGhlIGZpbHRlciB0byBzb3J0IHRoZSBkaXJlY3RpdmVzXG4gIGRpcmVjdGl2ZVNvcnRGaWx0ZXIgKGFoZWFkLCBhZnRlcikge1xuICAgIGxldCBhaGVhZFByaW9yaXR5ID0gb3B0aW9uLnByaW9yaXR5W2FoZWFkLmRpcmVjdGl2ZV1cbiAgICBsZXQgYWZ0ZXJQcmlvcml0eSA9IG9wdGlvbi5wcmlvcml0eVthZnRlci5kaXJlY3RpdmVdXG5cbiAgICByZXR1cm4gYWZ0ZXJQcmlvcml0eSAtIGFoZWFkUHJpb3JpdHlcbiAgfSxcbiAgc29ydEFyciAoYXJyLCBzb3J0RmlsdGVyKSB7XG4gICAgcmV0dXJuIGFyci5zb3J0KHNvcnRGaWx0ZXIpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgdXRpbFxuIl19
var _r=_m(6);_g.Sjf=_g.SjfDataBind=_r;return _r;})})(typeof window!=='undefined'?window:(typeof global!=='undefined'?global:(typeof self!=='undefined'?self:this)));