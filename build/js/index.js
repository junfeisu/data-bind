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
      // execute the directives
      value.beforeDirectives.map(function (directive) {
        if (directive.expression === representativeName) {
          directive['textNodeValue'] = toLoopObject[i];
          directive['representativeName'] = representativeName;
          directive['checkNodeChildLength'] = clonedCheckNodeLength;
        }
        directiveDeal[directive.directive].bind(_this)(directive);
      });

      // bind the events
      value.beforeEvents.map(function (event) {
        var funcString = _utils2.default.removeBrackets(event.func);
        var funcName = _utils2.default.extractFuncName(funcString);
        var funcArgs = _utils2.default.extractFuncArg(funcString);
        var funcType = _utils2.default.removePrefix(event.name);
        var func = _this['_' + funcName];

        funcArgs.map(function (arg) {
          if (arg === representativeName) {
            return toLoopObject[i];
          } else if (/^'.*'$|^".*"$/.test(arg)) {
            return arg;
          } else if (_this._data.hasOwnProperty(arg)) {
            return _this._data[arg];
          } else {
            console.error('sjf[error]: the argument ' + arg + ' is unValid');
          }
        });

        if (func) {
          event.node.check.addEventListener(funcType, function () {
            this['_' + funcName].apply(this, funcArgs);
          }, false);
        } else {
          console.error('sjf[error]: the ' + funcName + ' is not declared');
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
    str = str.replace(/\([\w|,|'|"|\s]+\)/, '');
    return str;
  },
  extractFuncArg: function extractFuncArg(str) {
    str = str.replace(/\w+\(|\)/g, '');
    return str.split(/,\s*/);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2UvamF2YXNjcmlwdC9jb21waWxlLmpzIiwic291cmNlL2phdmFzY3JpcHQvZGlyZWN0aXZlLmpzIiwic291cmNlL2phdmFzY3JpcHQvbGluay5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L29wdGlvbi5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3JlbmRlci5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3NqZkRhdGFCaW5kLmpzIiwic291cmNlL2phdmFzY3JpcHQvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FDOzs7O0FBQ0E7Ozs7Ozs7O0lBRU0sTztBQUNMO0FBQ0EsbUJBQWEsTUFBYixFQUFxQixHQUFyQixFQUEwQjtBQUFBOztBQUN4QixTQUFLLEdBQUwsR0FBVyxHQUFYO0FBQ0EsU0FBSyxVQUFMLEdBQWtCLEVBQWxCO0FBQ0EsU0FBSyxXQUFMLEdBQW1CLEtBQUssR0FBTCxDQUFTLEdBQVQsQ0FBYSxTQUFoQztBQUNBO0FBQ0EsU0FBSyxhQUFMLENBQW1CLEtBQUssR0FBTCxDQUFTLEdBQTVCLEVBQWlDLElBQWpDO0FBQ0Q7Ozs7a0NBRWMsTSxFQUFRLE8sRUFBUztBQUFBOztBQUM5QixVQUFJLFFBQVEsTUFBTSxJQUFOLENBQVcsT0FBTyxRQUFsQixDQUFaO0FBQ0E7QUFDQSxVQUFJLFdBQVcsQ0FBQyxNQUFNLE1BQXRCLEVBQThCO0FBQzVCLGFBQUssV0FBTDtBQUNBO0FBQ0Q7QUFDRCxZQUFNLE9BQU47QUFDQSxZQUFNLEdBQU4sQ0FBVSxnQkFBUTtBQUNoQixZQUFJLENBQUMsQ0FBQyxLQUFLLFFBQUwsQ0FBYyxNQUFwQixFQUE0QjtBQUMxQixnQkFBSyxhQUFMLENBQW1CLElBQW5CLEVBQXlCLEtBQXpCO0FBQ0EsZ0JBQUssR0FBTCxDQUFTLGVBQVQsQ0FBeUIsSUFBekIsQ0FBOEI7QUFDNUIsbUJBQU8sSUFEcUI7QUFFNUIs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RUF1RXdCO0FBQ2pDLFFBQUksZ0JBQWdCLGlCQUFPLFFBQVAsQ0FBZ0IsTUFBTSxTQUF0QixDQUFwQjtBQUNBLFFBQUksZ0JBQWdCLGlCQUFPLFFBQVAsQ0FBZ0IsTUFBTSxTQUF0QixDQUFwQjs7QUFFQSxXQUFPLGdCQUFnQixhQUF2QjtBQUNELEdBNUVVO0FBNkVYLFNBN0VXLG1CQTZFRixHQTdFRSxFQTZFRyxVQTdFSCxFQTZFZTtBQUN4QixXQUFPLElBQUksSUFBSixDQUFTLFVBQVQsQ0FBUDtBQUNEO0FBL0VVLENBQWI7O2tCQWtGZSxJIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiBpbXBvcnQgbGluayBmcm9tICcuL2xpbmsnXG4gaW1wb3J0IHV0aWwgZnJvbSAnLi91dGlscydcblxuIGNsYXNzIGNvbXBpbGUge1xuICAvLyDpgJLlvZJET03moJFcbiAgY29uc3RydWN0b3IgKHBhcmVudCwgc2pmKSB7XG4gICAgdGhpcy5zamYgPSBzamZcbiAgICB0aGlzLnNlYXJjaE5vZGUgPSBbXVxuICAgIHRoaXMucm9vdENvbnRlbnQgPSB0aGlzLnNqZi5fZWwuaW5uZXJIVE1MXG4gICAgLy8gdGhpcy50cmF2ZXJzZUVsZW1lbnQocGFyZW50LCBudWxsLCB0cnVlKVxuICAgIHRoaXMuY2lyY2xlRWxlbWVudCh0aGlzLnNqZi5fZWwsIHRydWUpXG4gIH1cblxuICBjaXJjbGVFbGVtZW50IChwYXJlbnQsIGlzRmlyc3QpIHtcbiAgICBsZXQgY2hpbGQgPSBBcnJheS5mcm9tKHBhcmVudC5jaGlsZHJlbilcbiAgICAvLyDlpoLmnpzmmK/nrKzkuIDmrKHpgY3ljoblubbkuJTmsqHmnInlrZDoioLngrnlsLHnm7TmjqXot7Pov4djb21waWxlXG4gICAgaWYgKGlzRmlyc3QgJiYgIWNoaWxkLmxlbmd0aCkge1xuICAgICAgdGhpcy5jb21waWxlTm9kZSgpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY2hpbGQucmV2ZXJzZSgpXG4gICAgY2hpbGQubWFwKG5vZGUgPT4ge1xuICAgICAgaWYgKCEhbm9kZS5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5jaXJjbGVFbGVtZW50KG5vZGUsIGZhbHNlKVxuICAgICAgICB0aGlzLnNqZi5fdW5jb21waWxlTm9kZXMucHVzaCh7XG4gICAgICAgICAgY2hlY2s6IG5vZGUsXG4gICAgICAgICAgcGFyZW50OiBub2RlLnBhcmVudE5vZGUsXG4gICAgICAgICAgbm9kZVR5cGU6ICdlbGVtZW50Tm9kZSdcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2pmLl91bmNvbXBpbGVOb2Rlcy5wdXNoKHtcbiAgICAgICAgICBjaGVjazogbm9kZSwgXG4gICAgICAgICAgcGFyZW50OiBub2RlLnBhcmVudE5vZGUsXG4gICAgICAgICAgbm9kZVR5cGU6ICdlbGVtZW50Tm9kZSdcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgaWYgKHRoaXMuc2pmLl9lbC5sYXN0RWxlbWVudENoaWxkID09PSBjaGlsZFswXSkge1xuICAgICAgdGhpcy5jb21waWxlTm9kZSgpXG4gICAgfVxuICB9XG5cbiAgY29tcGlsZU5vZGUgKCkge1xuICAgIGxldCBoYXNVbmNvbXBpbGUgPSB0aGlzLnNqZi5fdW5jb21waWxlTm9kZXMubGVuZ3RoXG4gICAgdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzLnJldmVyc2UoKVxuICAgIGlmIChoYXNVbmNvbXBpbGUpIHtcbiAgICAgIHRoaXMuc2pmLl91bmNvbXBpbGVOb2Rlcy5tYXAodmFsdWUgPT4ge1xuICAgICAgICB0aGlzLmhhc0RpcmVjdGl2ZSh2YWx1ZSlcbiAgICAgIH0pXG4gICAgfVxuICAgIHRoaXMuc2pmLl91bmNvbXBpbGVOb2RlcyA9IFtdXG4gICAgbmV3IGxpbmsodGhpcy5zamYpXG4gIH1cblxuICAvLyDmo4DmtYvmr4/kuKpub2Rl55yL5piv5ZCm57uR5a6a5pyJ5oyH5LukXG4gIGhhc0RpcmVjdGl2ZSAodmFsdWUpIHtcbiAgICBsZXQgY2hlY2tSZWcgPSAvc2pmLS4rPVxcXCIuK1xcXCJ8XFx7XFx7LitcXH1cXH0vXG4gICAgaWYgKGNoZWNrUmVnLnRlc3QodmFsdWUuY2hlY2suY2xvbmVOb2RlKCkub3V0ZXJIVE1MKSkge1xuICAgICAgdGhpcy5zamYuX3VubGlua05vZGVzLnB1c2godmFsdWUpXG4gICAgfVxuICAgIEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbCh2YWx1ZS5jaGVjay5jaGlsZE5vZGVzLCBub2RlID0+IHtcbiAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSAzKSB7XG4gICAgICAgIGlmIChjaGVja1JlZy50ZXN0KG5vZGUuZGF0YSkpIHtcbiAgICAgICAgICB0aGlzLnNqZi5fdW5saW5rTm9kZXMucHVzaCh7XG4gICAgICAgICAgICBjaGVjazogbm9kZSwgXG4gICAgICAgICAgICBwYXJlbnQ6IHZhbHVlLmNoZWNrLCBcbiAgICAgICAgICAgIG5vZGVUeXBlOiAndGV4dE5vZGUnXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY29tcGlsZVxuIiwiaW1wb3J0IHV0aWwgZnJvbSAnLi91dGlscydcblxuY29uc3QgZGlyZWN0aXZlRGVhbCA9IHtcbiAgJ3NqZi1pZic6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhbHVlLm5vZGUuc3R5bGUuZGlzcGxheSA9ICghISh2YWx1ZS5leHByZXNzaW9uKSA/ICdibG9jayFpbXBvcnRhbnQnIDogJ25vbmUhaW1wb3J0YW50JylcbiAgfSxcbiAgJ3NqZi1zaG93JzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgbGV0IGRpc3BsYXlWYWx1ZSA9IHRoaXMuX2RhdGFbdmFsdWUuZXhwcmVzc2lvbl0gPyAnYmxvY2snIDogJ25vbmUnXG4gICAgLy8gdmFsdWUubm9kZS5jaGVjay5zdHlsZS5kaXNwbGF5ID0gXG4gICAgdmFsdWUubm9kZS5jaGVjay5zdHlsZS5zZXRQcm9wZXJ0eSgnZGlzcGxheScsIGRpc3BsYXlWYWx1ZSwgJ2ltcG9ydGFudCcpXG4gIH0sXG4gICdzamYtZm9yJzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgLy8g5bCG6KGo6L6+5byP6YCa6L+H56m65qC8KOS4jemZkOepuuagvOaVsOebrinnu5nliIflvIBcbiAgICBsZXQgbG9vcE9iamVjdE5hbWUgPSB2YWx1ZS5leHByZXNzaW9uLnNwbGl0KC9cXHMrLylbMl1cbiAgICBsZXQgcmVwcmVzZW50YXRpdmVOYW1lID0gdmFsdWUuZXhwcmVzc2lvbi5zcGxpdCgvXFxzKy8pWzBdXG4gICAgbGV0IHRvTG9vcE9iamVjdCA9IG51bGxcbiAgICBpZiAodGhpcy5fZGF0YS5oYXNPd25Qcm9wZXJ0eShsb29wT2JqZWN0TmFtZSkpIHtcbiAgICAgIHRvTG9vcE9iamVjdCA9IHRoaXMuX2RhdGFbbG9vcE9iamVjdE5hbWVdXG4gICAgfVxuICAgIC8vIOWIpOaWreW+heW+queOr+eahOaYr+WQpuiDvei/m+ihjOW+queOr1xuICAgIGxldCBpc0xvb3BhYmxlID0gdG9Mb29wT2JqZWN0IGluc3RhbmNlb2YgQXJyYXkgfHwgIWlzTmFOKHRvTG9vcE9iamVjdClcbiAgICBpZiAoIWlzTG9vcGFibGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ3NqZltlcnJvcl06IHRoZSB0b0xvb3BPYmplY3Qgb2Ygc2pmLWZvciBzaG91bGQgYmUgYSBudW1iZXIgb3IgYW4gQXJyYXknKVxuICAgICAgcmV0dXJuIFxuICAgIH1cbiAgICAvLyDliKTmlq3mmK/mlbDnu4Tov5jmmK/mlbDlrZfvvIzku47ogIzotYvlgLxsZW5ndGhcbiAgICBsZXQgaXNBcnJheSA9IHV0aWwuaXNBcnJheSh0b0xvb3BPYmplY3QpXG4gICAgbGV0IGxlbiA9IGlzQXJyYXkgPyB0b0xvb3BPYmplY3QubGVuZ3RoIDogdG9Mb29wT2JqZWN0XG4gICAgbGV0IGNsb25lZENoZWNrTm9kZSA9IHZhbHVlLm5vZGUuY2hlY2suY2xvbmVOb2RlKHRydWUpXG4gICAgbGV0IGNsb25lZENoZWNrTm9kZUxlbmd0aCA9IGNsb25lZENoZWNrTm9kZS5jaGlsZE5vZGVzLmxlbmd0aFxuXG4gICAgdmFsdWUubm9kZS5jaGVjay5yZW1vdmVBdHRyaWJ1dGUoJ3NqZi1mb3InKVxuICAgIC8vIOWvueaMh+S7pOaMieeFp+S8mOWFiOe6p+i/m+ihjOaOkuW6j1xuICAgIHV0aWwuc29ydEFycih2YWx1ZS5iZWZvcmVEaXJlY3RpdmVzLCB1dGlsLmRpcmVjdGl2ZVNvcnRGaWx0ZXIpXG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAvLyBleGVjdXRlIHRoZSBkaXJlY3RpdmVzXG4gICAgICB2YWx1ZS5iZWZvcmVEaXJlY3RpdmVzLm1hcChkaXJlY3RpdmUgPT4ge1xuICAgICAgICBpZiAoZGlyZWN0aXZlLmV4cHJlc3Npb24gPT09IHJlcHJlc2VudGF0aXZlTmFtZSkge1xuICAgICAgICAgIGRpcmVjdGl2ZVsndGV4dE5vZGVWYWx1ZSddID0gdG9Mb29wT2JqZWN0W2ldXG4gICAgICAgICAgZGlyZWN0aXZlWydyZXByZXNlbnRhdGl2ZU5hbWUnXSA9IHJlcHJlc2VudGF0aXZlTmFtZVxuICAgICAgICAgIGRpcmVjdGl2ZVsnY2hlY2tOb2RlQ2hpbGRMZW5ndGgnXSA9IGNsb25lZENoZWNrTm9kZUxlbmd0aFxuICAgICAgICB9XG4gICAgICAgIGRpcmVjdGl2ZURlYWxbZGlyZWN0aXZlLmRpcmVjdGl2ZV0uYmluZCh0aGlzKShkaXJlY3RpdmUpXG4gICAgICB9KVxuXG4gICAgICAvLyBiaW5kIHRoZSBldmVudHNcbiAgICAgIHZhbHVlLmJlZm9yZUV2ZW50cy5tYXAoZXZlbnQgPT4ge1xuICAgICAgICBsZXQgZnVuY1N0cmluZyA9IHV0aWwucmVtb3ZlQnJhY2tldHMoZXZlbnQuZnVuYylcbiAgICAgICAgbGV0IGZ1bmNOYW1lID0gdXRpbC5leHRyYWN0RnVuY05hbWUoZnVuY1N0cmluZylcbiAgICAgICAgbGV0IGZ1bmNBcmdzID0gdXRpbC5leHRyYWN0RnVuY0FyZyhmdW5jU3RyaW5nKVxuICAgICAgICBsZXQgZnVuY1R5cGUgPSB1dGlsLnJlbW92ZVByZWZpeChldmVudC5uYW1lKVxuICAgICAgICBsZXQgZnVuYyA9IHRoaXNbJ18nICsgZnVuY05hbWVdXG4gICAgICAgIFxuICAgICAgICBmdW5jQXJncy5tYXAoYXJnID0+IHtcbiAgICAgICAgICBpZiAoYXJnID09PSByZXByZXNlbnRhdGl2ZU5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0b0xvb3BPYmplY3RbaV1cbiAgICAgICAgICB9IGVsc2UgaWYgKC9eJy4qJyR8XlwiLipcIiQvLnRlc3QoYXJnKSkge1xuICAgICAgICAgICAgcmV0dXJuIGFyZ1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fZGF0YS5oYXNPd25Qcm9wZXJ0eShhcmcpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZGF0YVthcmddXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ3NqZltlcnJvcl06IHRoZSBhcmd1bWVudCAnICsgYXJnICsgJyBpcyB1blZhbGlkJylcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgaWYgKGZ1bmMpIHtcbiAgICAgICAgICBldmVudC5ub2RlLmNoZWNrLmFkZEV2ZW50TGlzdGVuZXIoZnVuY1R5cGUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXNbJ18nICsgZnVuY05hbWVdLmFwcGx5KHRoaXMsIGZ1bmNBcmdzKVxuICAgICAgICAgIH0sIGZhbHNlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ3NqZltlcnJvcl06IHRoZSAnICsgZnVuY05hbWUgKyAnIGlzIG5vdCBkZWNsYXJlZCcpXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIGxldCBjbG9uZWROb2RlID0gdmFsdWUubm9kZS5jaGVjay5jbG9uZU5vZGUodHJ1ZSlcbiAgICAgIHZhbHVlLm5vZGUucGFyZW50Lmluc2VydEJlZm9yZShjbG9uZWROb2RlLCB2YWx1ZS5ub2RlLmNoZWNrKVxuICAgIH1cbiAgICB2YWx1ZS5ub2RlLnBhcmVudC5yZW1vdmVDaGlsZCh2YWx1ZS5ub2RlLmNoZWNrKVxuXG4gICAgaWYgKHRvTG9vcE9iamVjdCAmJiBpc0FycmF5KSB7XG4gICAgICB0aGlzLl93YXRjaGVycy5wdXNoKHRvTG9vcE9iamVjdClcbiAgICB9XG4gIH0sXG4gICdzamYtdGV4dCc6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGxldCB0ZXh0Tm9kZVZsYXVlID0gIXZhbHVlLnRleHROb2RlVmFsdWUgPyB0aGlzLl9kYXRhW3ZhbHVlLmV4cHJlc3Npb25dIDogdmFsdWUudGV4dE5vZGVWYWx1ZVxuICAgIGxldCBjaGVja05vZGUgPSB2YWx1ZS5ub2RlLmNoZWNrXG5cbiAgICBpZiAodmFsdWUubm9kZS5ub2RlVHlwZSA9PT0gJ2VsZW1lbnROb2RlJykge1xuICAgICAgbGV0IHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dE5vZGVWbGF1ZSlcbiAgICAgIGxldCBoYXNDaGlsZCA9IGNoZWNrTm9kZS5jaGlsZE5vZGVzLmxlbmd0aFxuXG4gICAgICBpZiAoY2hlY2tOb2RlLmNoaWxkTm9kZXMubGVuZ3RoID09IHZhbHVlLmNoZWNrTm9kZUNoaWxkTGVuZ3RoICsgMSkge1xuICAgICAgICBjaGVja05vZGUucmVtb3ZlQ2hpbGQoY2hlY2tOb2RlLmZpcnN0Q2hpbGQpXG4gICAgICB9XG4gICAgICBoYXNDaGlsZCA/IGNoZWNrTm9kZS5pbnNlcnRCZWZvcmUodGV4dE5vZGUsIGNoZWNrTm9kZS5maXJzdENoaWxkKSA6IGNoZWNrTm9kZS5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSlcbiAgICB9IGVsc2Uge1xuICAgICAgY2hlY2tOb2RlLmRhdGEgPSB0ZXh0Tm9kZVZsYXVlXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRpcmVjdGl2ZURlYWxcbiIsImltcG9ydCBvcHRpb24gZnJvbSAnLi9vcHRpb24nXG5pbXBvcnQgcmVuZGVyIGZyb20gJy4vcmVuZGVyJ1xuaW1wb3J0IHV0aWwgZnJvbSAnLi91dGlscydcblxuY2xhc3MgbGluayB7XG4gIGNvbnN0cnVjdG9yIChzamYpIHtcbiAgICB0aGlzLnNqZiA9IHNqZlxuICAgIGxldCBoYXNVbmxpbmtOb2RlID0gdGhpcy5zamYuX3VubGlua05vZGVzLmxlbmd0aFxuICAgIGlmIChoYXNVbmxpbmtOb2RlKSB7XG4gICAgICBsZXQgZXh0cmFjdFJlZyA9IC9zamYtW2Etel0rPVxcXCJbXlwiXStcXFwifFxce1xcey4rXFx9XFx9L2dcbiAgICAgIHRoaXMuc2pmLl91bmxpbmtOb2Rlcy5tYXAodmFsdWUgPT4ge1xuICAgICAgICBsZXQgZGlyZWN0aXZlcyA9IFtdXG4gICAgICAgIGlmICh2YWx1ZS5ub2RlVHlwZSA9PT0gJ3RleHROb2RlJykge1xuICAgICAgICAgIGRpcmVjdGl2ZXMgPSB2YWx1ZS5jaGVjay5kYXRhLm1hdGNoKGV4dHJhY3RSZWcpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGlyZWN0aXZlcyA9IHZhbHVlLmNoZWNrLmNsb25lTm9kZSgpLm91dGVySFRNTC5tYXRjaChleHRyYWN0UmVnKVxuICAgICAgICB9XG4gICAgICAgIGlmIChkaXJlY3RpdmVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICBsZXQgd2l0aE5hbWVEaXJlY3RpdmVzID0gZGlyZWN0aXZlcy5tYXAoZGlyZWN0aXZlID0+IHRoaXMuYWRkRGlyZWN0aXZlTmFtZShkaXJlY3RpdmUpKVxuICAgICAgICAgIHdpdGhOYW1lRGlyZWN0aXZlcyA9IHV0aWwuc29ydEV4ZXh1dGVRdWV1ZSgnbmFtZScsIHdpdGhOYW1lRGlyZWN0aXZlcylcbiAgICAgICAgICB3aXRoTmFtZURpcmVjdGl2ZXMubWFwKGRpcmVjdGl2ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLmV4dHJhY3REaXJlY3RpdmUoZGlyZWN0aXZlLnZhbHVlLCB2YWx1ZSlcbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRpcmVjdGl2ZXMubWFwKGRpcmVjdGl2ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLmV4dHJhY3REaXJlY3RpdmUoZGlyZWN0aXZlLCB2YWx1ZSlcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgdGhpcy5fdW5saW5rTm9kZXMgPSBbXVxuICAgICAgbmV3IHJlbmRlcih0aGlzLnNqZilcbiAgICB9XG4gIH1cblxuICBhZGREaXJlY3RpdmVOYW1lIChkaXJlY3RpdmUpIHtcbiAgICBsZXQgc2xpY2VzID0gZGlyZWN0aXZlLnNwbGl0KCc9JylcbiAgICBpZiAoc2xpY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZTogJ3NqZi10ZXh0JyxcbiAgICAgICAgdmFsdWU6IGRpcmVjdGl2ZVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOiBzbGljZXNbMF0sXG4gICAgICAgIHZhbHVlOiBkaXJlY3RpdmVcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyDmj5Dlj5bmjIfku6RcbiAgZXh0cmFjdERpcmVjdGl2ZSAoZGlyZWN0aXZlLCBub2RlKSB7XG4gICAgbGV0IHNsaWNlcyA9IGRpcmVjdGl2ZS5zcGxpdCgnPScpXG4gICAgLy8g5aaC5p6c5piv5LqL5Lu25bCx55u05o6l6YCa6L+HYWRkRXZlbnRMaXN0ZW5lcui/m+ihjOe7keWumlxuICAgIGlmIChvcHRpb24uc2pmRXZlbnRzLmluZGV4T2Yoc2xpY2VzWzBdKSA+PSAwKSB7XG4gICAgICBsZXQgZXZlbnRNZXMgPSB7XG4gICAgICAgIHR5cGU6ICdldmVudCcsXG4gICAgICAgIG5vZGU6IG5vZGUsXG4gICAgICAgIG5hbWU6IHNsaWNlc1swXSxcbiAgICAgICAgZnVuYzogc2xpY2VzWzFdXG4gICAgICB9XG4gICAgICB0aGlzLnNqZi5fdW5yZW5kZXJOb2Rlcy5wdXNoKGV2ZW50TWVzKVxuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgZXhwcmVzc2lvbiA9IHNsaWNlc1swXS5yZXBsYWNlKC9bXFx7XFx9XS9nLCAnJylcbiAgICAgIGxldCBkaXJlY3RpdmVOYW1lID0gJ3NqZi10ZXh0J1xuICAgICAgLy8g5a+56Z2ee3t9fei/meenjeihqOi+vuW8j+i/m+ihjOWNleeLrOWkhOeQhlxuICAgICAgaWYgKCEvXFx7XFx7LitcXH1cXH0vLnRlc3QoZGlyZWN0aXZlKSkge1xuICAgICAgICBleHByZXNzaW9uID0gc2xpY2VzWzFdLnJlcGxhY2UoL1xcXCIvZywgJycpXG4gICAgICAgIGRpcmVjdGl2ZU5hbWUgPSBzbGljZXNbMF1cbiAgICAgIH1cbiAgICAgIHRoaXMuc2pmLl91bnJlbmRlck5vZGVzLnB1c2goe1xuICAgICAgICB0eXBlOiAnZGlyZWN0aXZlJyxcbiAgICAgICAgbm9kZTogbm9kZSwgXG4gICAgICAgIGRpcmVjdGl2ZTogZGlyZWN0aXZlTmFtZSwgXG4gICAgICAgIGV4cHJlc3Npb246IGV4cHJlc3Npb25cbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGxpbmtcbiIsImNvbnN0IG9wdGlvbiA9IHtcbiAgcHJpb3JpdHk6IHtcbiAgICAnc2pmLWlmJzogMjAwMCxcbiAgICAnc2pmLXNob3cnOiAyMDAwLFxuICAgICdzamYtZm9yJzogMTAwMCxcbiAgICAnc2pmLW1vZGVsJzogMTAsXG4gICAgJ3NqZi10ZXh0JzogMSxcbiAgICAnc2pmLWNsaWNrJzogMCxcbiAgICAnc2pmLW1vdXNlb3Zlcic6IDAsXG4gICAgJ3NqZi1tb3VzZW91dCc6IDAsXG4gICAgJ3NqZi1tb3VzZW1vdmUnOiAwLFxuICAgICdzamYtbW91c2VlbnRlcic6IDAsXG4gICAgJ3NqZi1tb3VzZWxlYXZlJzogMCxcbiAgICAnc2pmLW1vdXNlZG93bic6IDAsXG4gICAgJ3NqZi1tb3VzZXVwJzogMFxuICB9LFxuICBzamZFdmVudHM6IFtcbiAgICAnc2pmLWNsaWNrJywgXG4gICAgJ3NqZi1tb3VzZW92ZXInLCBcbiAgICAnc2pmLW1vdXNlb3V0JywgXG4gICAgJ3NqZi1tb3VzZW1vdmUnLCBcbiAgICAnc2pmLW1vdXNlZW50ZXInLFxuICAgICdzamYtbW91c2VsZWF2ZScsXG4gICAgJ3NqZi1tb3VzZWRvd24nLFxuICAgICdzamYtbW91c2V1cCdcbiAgXVxufVxuXG5leHBvcnQgZGVmYXVsdCBvcHRpb25cbiIsImltcG9ydCB1dGlsIGZyb20gJy4vdXRpbHMnXG5pbXBvcnQgZGlyZWN0aXZlRGVhbCBmcm9tICcuL2RpcmVjdGl2ZSdcblxuY2xhc3MgcmVuZGVyIHtcbiAgY29uc3RydWN0b3IgKHNqZikge1xuICAgIHRoaXMuc2pmID0gc2pmXG4gICAgdGhpcy51bkJpbmRFdmVudHMgPSBbXVxuICAgIHRoaXMudW5Tb3J0RGlyZWN0aXZlcyA9IFtdXG5cbiAgICBsZXQgaGFzUmVuZGVyID0gdGhpcy5zamYuX3VucmVuZGVyTm9kZXMubGVuZ3RoXG4gICAgaWYgKGhhc1JlbmRlcikge1xuICAgICAgdGhpcy5zamYuX3VucmVuZGVyTm9kZXMubWFwKHZhbCA9PiB7XG4gICAgICAgIHZhbC50eXBlID09PSAnZXZlbnQnID8gdGhpcy51bkJpbmRFdmVudHMucHVzaCh2YWwpIDogdGhpcy51blNvcnREaXJlY3RpdmVzLnB1c2godmFsKVxuICAgICAgfSlcbiAgICAgIHRoaXMuc2pmLl91bnJlbmRlck5vZGVzID0gW11cbiAgICB9XG5cbiAgICB0aGlzLnNvcnREaXJlY3RpdmUoKVxuICB9XG5cbiAgc29ydERpcmVjdGl2ZSAoKSB7XG4gICAgbGV0IHVuU29ydERpcmVjdGl2ZUxlbiA9IHRoaXMudW5Tb3J0RGlyZWN0aXZlcy5sZW5ndGhcbiAgICBpZiAodW5Tb3J0RGlyZWN0aXZlTGVuKSB7XG4gICAgICBmb3IgKGxldCBpID0gdW5Tb3J0RGlyZWN0aXZlTGVuIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgaWYgKHRoaXMudW5Tb3J0RGlyZWN0aXZlc1tpXS5kaXJlY3RpdmUgPT09ICdzamYtZm9yJykge1xuICAgICAgICAgIGxldCBjb3B5RGlyZWN0aXZlcyA9IE9iamVjdC5hc3NpZ24oW10sIHRoaXMudW5Tb3J0RGlyZWN0aXZlcylcbiAgICAgICAgICBsZXQgY29weUV2ZW50cyA9IE9iamVjdC5hc3NpZ24oW10sIHRoaXMudW5CaW5kRXZlbnRzKVxuICAgICAgICAgIGxldCBiZWZvcmVGb3JEaXJlY3RpdmVzID0gdXRpbC5zZWFyY2hDaGlsZChjb3B5RGlyZWN0aXZlcy5zcGxpY2UoaSArIDEpLCB0aGlzLnVuU29ydERpcmVjdGl2ZXNbaV0ubm9kZS5jaGVjaylcbiAgICAgICAgICBsZXQgYmVmb3JlRm9yRXZlbnRzID0gdXRpbC5zZWFyY2hDaGlsZChjb3B5RXZlbnRzLCB0aGlzLnVuU29ydERpcmVjdGl2ZXNbaV0ubm9kZS5jaGVjaylcblxuICAgICAgICAgIHRoaXMudW5Tb3J0RGlyZWN0aXZlc1tpXVsnYmVmb3JlRGlyZWN0aXZlcyddID0gYmVmb3JlRm9yRGlyZWN0aXZlc1xuICAgICAgICAgIHRoaXMudW5Tb3J0RGlyZWN0aXZlcy5zcGxpY2UoaSArIDEsIGJlZm9yZUZvckRpcmVjdGl2ZXMubGVuZ3RoKVxuXG4gICAgICAgICAgdGhpcy51blNvcnREaXJlY3RpdmVzW2ldWydiZWZvcmVFdmVudHMnXSA9IGJlZm9yZUZvckV2ZW50c1xuICAgICAgICAgIHRoaXMudW5CaW5kRXZlbnRzLnNwbGljZShjb3B5RXZlbnRzLmluZGV4T2YoYmVmb3JlRm9yRXZlbnRzWzBdKSwgYmVmb3JlRm9yRXZlbnRzLmxlbmd0aClcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnVuU29ydERpcmVjdGl2ZXMubWFwKHZhbHVlID0+IHtcbiAgICAgICAgZGlyZWN0aXZlRGVhbFt2YWx1ZS5kaXJlY3RpdmVdLmJpbmQodGhpcy5zamYpKHZhbHVlKVxuICAgICAgfSlcbiAgICB9XG4gICAgXG4gICAgdGhpcy5iaW5kRXZlbnQoKVxuICB9XG5cbiAgLy8g57uR5a6a5LqL5Lu2XG4gIGJpbmRFdmVudCAoKSB7XG4gICAgbGV0IGV2ZW50UXVlbmUgPSB0aGlzLnVuQmluZEV2ZW50c1xuICAgIGlmIChldmVudFF1ZW5lLmxlbmd0aCkge1xuICAgICAgZXZlbnRRdWVuZS5tYXAodmFsID0+IHtcbiAgICAgICAgbGV0IGNoZWNrTm9kZSA9IHZhbC5ub2RlLmNoZWNrXG4gICAgICAgIGxldCBldmVudFR5cGUgPSB1dGlsLnJlbW92ZVByZWZpeCh2YWwubmFtZSlcbiAgICAgICAgbGV0IGV2ZW50RnVuYyA9IHRoaXMuc2pmWydfJyArIHV0aWwucmVtb3ZlQnJhY2tldHModmFsLmZ1bmMpXVxuICAgICAgICBjaGVja05vZGUucmVtb3ZlQXR0cmlidXRlKHZhbC5uYW1lKVxuXG4gICAgICAgIGV2ZW50RnVuYyA/IGNoZWNrTm9kZS5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgZXZlbnRGdW5jLCBmYWxzZSkgOiBjb25zb2xlLmVycm9yKCdzamZbZXJyb3JdOiB0aGUgJyArIHZhbC5mdW5jICsgJyBpcyBub3QgZGVjbGFyZWQnKVxuICAgICAgfSlcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgcmVuZGVyXG4iLCJpbXBvcnQgY29tcGlsZSBmcm9tICcuL2NvbXBpbGUnXG5cbmNsYXNzIFNqZkRhdGFCaW5kIHtcbiAgY29uc3RydWN0b3IgKHBhcmFtKSB7XG4gICAgaWYgKCFwYXJhbS5oYXNPd25Qcm9wZXJ0eSgnZWwnKSB8fCAhcGFyYW0uaGFzT3duUHJvcGVydHkoJ2RhdGEnKSkge1xuICAgICAgY29uc29sZS5lcnJvcignc2pmW2Vycm9yXTogVGhlcmUgaXMgbmVlZCBgZGF0YWAgYW5kIGBlbGAgYXR0cmlidXRlJylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLl9lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocGFyYW0uZWwpXG4gICAgdGhpcy5fZGF0YSA9IHBhcmFtLmRhdGFcbiAgICB0aGlzLl93YXRjaGVycyA9IFtdXG4gICAgdGhpcy5fdW5jb21waWxlTm9kZXMgPSBbXVxuICAgIHRoaXMuX3VubGlua05vZGVzID0gW11cbiAgICB0aGlzLl91bnJlbmRlck5vZGVzID0gW11cbiAgICBmb3IgKGxldCBtZXRob2QgaW4gcGFyYW0ubWV0aG9kcykge1xuICAgICAgLy8g5by65Yi25bCG5a6a5LmJ5ZyobWV0aG9kc+S4iueahOaWueazleebtOaOpee7keWumuWcqFNqZkRhdGFCaW5k5LiK77yM5bm25L+u5pS56L+Z5Lqb5pa55rOV55qEdGhpc+aMh+WQkeS4ulNqZkRhdGFCaW5kXG4gICAgICBpZiAocGFyYW0ubWV0aG9kcy5oYXNPd25Qcm9wZXJ0eShtZXRob2QpKSB7XG4gICAgICAgIHRoaXNbJ18nICsgbWV0aG9kXSA9IHBhcmFtLm1ldGhvZHNbbWV0aG9kXS5iaW5kKHRoaXMpXG4gICAgICB9XG4gICAgfVxuICAgIG5ldyBjb21waWxlKHRoaXMuX2VsLCB0aGlzKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNqZkRhdGFCaW5kXG4iLCJpbXBvcnQgb3B0aW9uIGZyb20gJy4vb3B0aW9uJ1xuXG5jb25zdCB1dGlsID0ge1xuICAvLyBqdWRnZSB0aGUgdHlwZSBvZiBvYmpcbiAganVkZ2VUeXBlIChvYmopIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iailcbiAgfSxcbiAgLy8gcmVtb3ZlIHRoZSBwcmVmaXggb2Ygc2pmLVxuICByZW1vdmVQcmVmaXggKHN0cikge1xuICAgIHJldHVybiBzdHIgPSBzdHIucmVwbGFjZSgvc2pmLS8sICcnKVxuICB9LFxuICAvLyByZW1vdmUgdGhlIGJyYWNrZXRzICgpXG4gIHJlbW92ZUJyYWNrZXRzIChzdHIpIHtcbiAgICBzdHIgPSBzdHIucmVwbGFjZSgvXFxcIi9nLCAnJylcbiAgICByZXR1cm4gc3RyID0gc3RyLnJlcGxhY2UoL1xcKFxcKS8sICcnKVxuICB9LFxuICBleHRyYWN0RnVuY05hbWUgKHN0cikge1xuICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9cXChbXFx3fCx8J3xcInxcXHNdK1xcKS8sICcnKVxuICAgIHJldHVybiBzdHJcbiAgfSxcbiAgZXh0cmFjdEZ1bmNBcmcgKHN0cikge1xuICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9cXHcrXFwofFxcKS9nLCAnJylcbiAgICByZXR1cm4gc3RyLnNwbGl0KC8sXFxzKi8pXG4gIH0sXG4gIHNvcnRFeGV4dXRlUXVldWUgKHByb3BlcnR5LCBvYmpBcnIpIHtcbiAgICByZXR1cm4gb2JqQXJyLnNvcnQoKG9iajEsIG9iajIpID0+IHtcbiAgICAgIGxldCB2YWwxID0gb3B0aW9uLnByaW9yaXR5W29iajFbcHJvcGVydHldXVxuICAgICAgbGV0IHZhbDIgPSBvcHRpb24ucHJpb3JpdHlbb2JqMltwcm9wZXJ0eV1dXG4gICAgICByZXR1cm4gdmFsMiAtIHZhbDFcbiAgICB9KVxuICB9LFxuICBpc0FycmF5IChhcnIpIHtcbiAgICByZXR1cm4gdXRpbC5qdWRnZVR5cGUoYXJyKSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICB9LFxuICBpc1N0YWljdE9iamVjdCAob2JqKSB7XG4gICAgcmV0dXJuIHV0aWwuanVkZ2VUeXBlKG9iaikgPT09ICdbb2JqZWN0IE9iamVjdF0nXG4gIH0sXG4gIC8vIGRlZXAgY29weSBvZiBPYmplY3Qgb3IgQXJyXG4gIGRlZXBDb3B5IChzb3VyY2UsIGRlc3QpIHtcbiAgICBpZiAoIXV0aWwuaXNBcnJheShzb3VyY2UpICYmICF1dGlsLmlzU3RhaWN0T2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHRocm93ICd0aGUgc291cmNlIHlvdSBzdXBwb3J0IGNhbiBub3QgYmUgY29waWVkJ1xuICAgIH1cblxuICAgIHZhciBjb3B5U291cmNlID0gdXRpbC5pc0FycmF5KHNvdXJjZSkgPyBbXSA6IHt9XG4gICAgZm9yICh2YXIgcHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgaWYgKHV0aWwuaXNBcnJheShzb3VyY2VbcHJvcF0pIHx8IHV0aWwuaXNTdGFpY3RPYmplY3Qoc291cmNlW3Byb3BdKSkge1xuICAgICAgICAgIGNvcHlTb3VyY2VbcHJvcF0gPSB1dGlsLmRlZXBDb3B5KHNvdXJjZVtwcm9wXSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb3B5U291cmNlW3Byb3BdID0gc291cmNlW3Byb3BdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY29weVNvdXJjZVxuICB9LFxuICAvLyBzZWFyY2ggdGhlIHdob2xlIGNoaWxkIE5vZGUgb2YgcGFyZW50IE5vZGVcbiAgc2VhcmNoQ2hpbGQgKGFyciwgcGFyZW50KSB7XG4gICAgbGV0IHJlc3VsdEFyciA9IFtdXG4gICAgaWYgKHV0aWwuaXNBcnJheShhcnIpKSB7XG4gICAgICBhcnIubWFwKHZhbHVlID0+IHtcbiAgICAgICAgaWYgKHBhcmVudC5jb250YWlucyh2YWx1ZS5ub2RlLmNoZWNrKSkge1xuICAgICAgICAgIHJlc3VsdEFyci5wdXNoKHZhbHVlKVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICByZXR1cm4gcmVzdWx0QXJyXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ3NqZltlcnJvcl06IHRoZSBhcnIgaW4gc2VhcmNoQ2hpbGQgJyArIGFyciArICcgaXMgbm90IEFycmF5JylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgfSxcbiAgLy8gdGhlIGZpbHRlciB0byBzb3J0IHRoZSBkaXJlY3RpdmVzXG4gIGRpcmVjdGl2ZVNvcnRGaWx0ZXIgKGFoZWFkLCBhZnRlcikge1xuICAgIGxldCBhaGVhZFByaW9yaXR5ID0gb3B0aW9uLnByaW9yaXR5W2FoZWFkLmRpcmVjdGl2ZV1cbiAgICBsZXQgYWZ0ZXJQcmlvcml0eSA9IG9wdGlvbi5wcmlvcml0eVthZnRlci5kaXJlY3RpdmVdXG5cbiAgICByZXR1cm4gYWZ0ZXJQcmlvcml0eSAtIGFoZWFkUHJpb3JpdHlcbiAgfSxcbiAgc29ydEFyciAoYXJyLCBzb3J0RmlsdGVyKSB7XG4gICAgcmV0dXJuIGFyci5zb3J0KHNvcnRGaWx0ZXIpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgdXRpbFxuIl19
var _r=_m(6);_g.Sjf=_g.SjfDataBind=_r;return _r;})})(typeof window!=='undefined'?window:(typeof global!=='undefined'?global:(typeof self!=='undefined'?self:this)));