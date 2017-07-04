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
    var clonedNode = value.node.check.cloneNode(true);
    value.node.check.removeAttribute('sjf-for');

    var _loop = function _loop(i) {
      value.beforeDirectives.map(function (directive) {
        if (directive.expression === representativeName) {
          linkRender[directive.directive].bind(_this)(directive, toLoopObject[i]);
        }
      });
      value.node.parent.insertBefore(clonedNode, value.node.check);
    };

    for (var i = 0; i < len - 1; i++) {
      _loop(i);
    }

    if (toLoopObject && isArray) {
      this._watchers.push(toLoopObject);
    }
  },
  'sjf-text': function sjfText(value, textValue) {
    var textNodeVlaue = !textValue ? this._data[value.expression] : textValue;
    console.log('checkNode', value.node.check);
    if (value.node.nodeType === 'elementNode') {
      value.node.check.innerText = textNodeVlaue;
    } else {
      value.node.check = textNodeVlaue;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2UvamF2YXNjcmlwdC9jb21waWxlLmpzIiwic291cmNlL2phdmFzY3JpcHQvbGluay5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L29wdGlvbi5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3JlbmRlci5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3NqZkRhdGFCaW5kLmpzIiwic291cmNlL2phdmFzY3JpcHQvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FDOzs7O0FBQ0E7Ozs7Ozs7O0lBRU0sTztBQUNMO0FBQ0EsbUJBQWEsTUFBYixFQUFxQixHQUFyQixFQUEwQjtBQUFBOztBQUN4QixTQUFLLEdBQUwsR0FBVyxHQUFYO0FBQ0EsU0FBSyxVQUFMLEdBQWtCLEVBQWxCO0FBQ0EsU0FBSyxXQUFMLEdBQW1CLEtBQUssR0FBTCxDQUFTLEdBQVQsQ0FBYSxTQUFoQztBQUNBO0FBQ0EsU0FBSyxhQUFMLENBQW1CLEtBQUssR0FBTCxDQUFTLEdBQTVCLEVBQWlDLElBQWpDO0FBQ0Q7Ozs7a0NBRWMsTSxFQUFRLE8sRUFBUztBQUFBOztBQUM5QixVQUFJLFFBQVEsTUFBTSxJQUFOLENBQVcsT0FBTyxRQUFsQixDQUFaO0FBQ0E7QUFDQSxVQUFJLFdBQVcsQ0FBQyxNQUFNLE1BQXRCLEVBQThCO0FBQzVCLGFBQUssV0FBTDtBQUNBO0FBQ0Q7QUFDRCxZQUFNLE9BQU47QUFDQSxZQUFNLEdBQU4sQ0FBVSxnQkFBUTtBQUNoQixZQUFJLENBQUMsQ0FBQyxLQUFLLFFBQUwsQ0FBYyxNQUFwQixFQUE0QjtBQUMxQixnQkFBSyxhQUFMLENBQW1CLElBQW5CLEVBQXlCLEtBQXpCO0FBQ0EsZ0JBQUssR0FBTCxDQUFTLGVBQVQsQ0FBeUIsSUFBekIsQ0FBOEI7QUFDNUIsbUJBQU8sSUFEcUI7QUFFNUIsb0JBQVEsS0FBSyxVQUZlO0FBRzVCLHNCQUFVO0FBSGtCLFdBQTlCO0FBS0QsU0FQRCxNQU9PO0FBQ0wsZ0JBQUssR0FBTCxDQUFTLGVBQVQsQ0FBeUIsSUFBekIsQ0FBOEI7QUFDNUIsbUJBQU8sSUFEcUI7QUFFNUIsb0JBQVEsS0FBSyxVQUZlO0FBRzVCLHNCQUFVO0FBSGtCLFdBQTlCO0FBS0Q7QUFDRixPQWZEOztBQWlCQSxVQUFJLEtBQUssR0FBTCxDQUFTLEdBQVQsQ0FBYSxnQkFBYixLQUFrQyxNQUFNLENBQU4sQ0FBdEMsRUFBZ0Q7QUFDOUMsYUFBSyxXQUFMO0FBQ0Q7QUFDRjs7O2tDQUVjO0FBQUE7O0FBQ2IsVUFBSSxlQUFlLEtBQUssR0FBTCxDQUFTLGVBQVQsQ0FBeUIsTUFBNUM7QUFDQSxXQUFLLEdBQUwsQ0FBUyxlQUFULENBQXlCLE9BQXpCO0FBQ0EsVUFBSSxZQUFKLEVBQWtCO0FBQ2hCLGFBQUssR0FBTCxDQUFTLGVBQVQsQ0FBeUIsR0FBekIsQ0FBNkIsaUJBQVM7QUFDcEMsaUJBQUssWUFBTCxDQUFrQixLQUFsQjtBQUNELFNBRkQ7QUFHRDtBQUNELFdBQUssR0FBTCxDQUFTLGVBQVQsR0FBMkIsRUFBM0I7QUFDQSx5QkFBUyxLQUFLLEdBQWQ7QUFDRDs7QUFFRDs7OztpQ0FDYyxLLEVBQU87QUFBQTs7QUFDbkIsVUFBSSxXQUFXLDBCQUFmO0FBQ0EsVUFBSSxTQUFTLElBQVQsQ0FBYyxNQUFNLEtBQU4sQ0FBWSxTQUFaLEdBQXdCLFNBQXRDLENBQUosRUFBc0Q7QUFDcEQsYUFBSyxHQUFMLENBQVMsWUFBVCxDQUFzQixJQUF0QixDQUEyQixLQUEzQjtBQUNEO0FBQ0QsWUFBTSxTQUFOLENBQWdCLEdBQWhCLENBQW9CLElBQXBCLENBQXlCLE1BQU0sS0FBTixDQUFZLFVBQXJDLEVBQWlELGdCQUFRO0FBQ3ZELFlBQUksS0FBSyxRQUFMLEtBQWtCLENBQXRCLEVBQXlCO0FBQ3ZCLGNBQUksU0FBUyxJQUFULENBQWMsS0FBSyxJQUFuQixDQUFKLEVBQThCO0FBQzVCLG1CQUFLLEdBQUwsQ0FBUyxZQUFULENBQXNCLElBQXRCLENBQTJCO0FBQ3pCLHFCQUFPLElBRGtCO0FBRXpCLHNCQUFRLE1BQU0sS0FGVztBQUd6Qix3QkFBVTtBQUhlLGFBQTNCO0FBS0Q7QUFDRjtBQUNGLE9BVkQ7QUFXRDs7Ozs7O2tCQUdZLE87Ozs7Ozs7Ozs7O0FDM0VmOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7SUFFTSxJO0FBQ0osZ0JBQWEsR0FBYixFQUFrQjtBQUFBOztBQUFBOztBQUNoQixTQUFLLEdBQUwsR0FBVyxHQUFYO0FBQ0EsUUFBSSxnQkFBZ0IsS0FBSyxHQUFMLENBQVMsWUFBVCxDQUFzQixNQUExQztBQUNBLFFBQUksYUFBSixFQUFtQjtBQUNqQixVQUFJLGFBQWEsa0NBQWpCO0FBQ0EsV0FBSyxHQUFMLENBQVMsWUFBVCxDQUFzQixHQUF0QixDQUEwQixpQkFBUztBQUNqQyxZQUFJLGFBQWEsRUFBakI7QUFDQSxZQUFJLE1BQU0sUUFBTixLQUFtQixVQUF2QixFQUFtQztBQUNqQyx1QkFBYSxNQUFNLEtBQU4sQ0FBWSxJQUFaLENBQWlCLEtBQWpCLENBQXVCLFVBQXZCLENBQWI7QUFDRCxTQUZELE1BRU87QUFDTCx1QkFBYSxNQUFNLEtBQU4sQ0FBWSxTQUFaLEdBQXdCLFNBQXhCLENBQWtDLEtBQWxDLENBQXdDLFVBQXhDLENBQWI7QUFDRDtBQUNELFlBQUksV0FBVyxNQUFYLEdBQW9CLENBQXhCLEVBQTJCO0FBQ3pCLGNBQUkscUJBQXFCLFdBQVcsR0FBWCxDQUFlO0FBQUEsbUJBQWEsTUFBSyxnQkFBTCxDQUFzQixTQUF0QixDQUFiO0FBQUEsV0FBZixDQUF6QjtBQUNBLCtCQUFxQixnQkFBSyxnQkFBTCxDQUFzQixNQUF0QixFQUE4QixrQkFBOUIsQ0FBckI7QUFDQSw2QkFBbUIsR0FBbkIsQ0FBdUIscUJBQWE7QUFDbEMsa0JBQUssZ0JBQUwsQ0FBc0IsVUFBVSxLQUFoQyxFQUF1QyxLQUF2QztBQUNELFdBRkQ7QUFHRCxTQU5ELE1BTU87QUFDTCxxQkFBVyxHQUFYLENBQWUscUJBQWE7QUFDMUIsa0JBQUssZ0JBQUwsQ0FBc0IsU0FBdEIsRUFBaUMsS0FBakM7QUFDRCxXQUZEO0FBR0Q7QUFDRixPQWxCRDtBQW1CQSxXQUFLLFlBQUwsR0FBb0IsRUFBcEI7QUFDQSwyQkFBVyxLQUFLLEdBQWhCO0FBQ0Q7QUFDRjs7OztxQ0FFaUIsUyxFQUFXO0FBQzNCLFVBQUksU0FBUyxVQUFVLEtBQVYsQ0FBZ0IsR0FBaEIsQ0FBYjtBQUNBLFVBQUksT0FBTyxNQUFQLEtBQWtCLENBQXRCLEVBQXlCO0FBQ3ZCLGVBQU87QUFDTCxnQkFBTSxVQUREO0FBRUwsaUJBQU87QUFGRixTQUFQO0FBSUQsT0FMRCxNQUtPO0FBQ0wsZUFBTztBQUNMLGdCQUFNLE9BQU8sQ0FBUCxDQUREO0FBRUwsaUJBQU87QUFGRixTQUFQO0FBSUQ7QUFDRjs7QUFFRDs7OztxQ0FDa0IsUyxFQUFXLEksRUFBTTtBQUNqQyxVQUFJLFNBQVMsVUFBVSxLQUFWLENBQWdCLEdBQWhCLENBQWI7QUFDQTtBQUNBLFVBQUksaUJBQU8sU0FBUCxDQUFpQixPQUFqQixDQUF5QixPQUFPLENBQVAsQ0FBekIsS0FBdUMsQ0FBM0MsRUFBOEM7QUFDNUMsWUFBSSxXQUFXO0FBQ2IsZ0JBQU0sT0FETztBQUViLGtCQUFRLElBRks7QUFHYixnQkFBTSxPQUFPLENBQVAsQ0FITztBQUliLGdCQUFNLE9BQU8sQ0FBUDtBQUpPLFNBQWY7QUFNQSxhQUFLLEdBQUwsQ0FBUyxjQUFULENBQXdCLElBQXhCLENBQTZCLFFBQTdCO0FBQ0QsT0FSRCxNQVFPO0FBQ0wsWUFBSSxhQUFhLE9BQU8sQ0FBUCxFQUFVLE9BQVYsQ0FBa0IsU0FBbEIsRUFBNkIsRUFBN0IsQ0FBakI7QUFDQSxZQUFJLGdCQUFnQixVQUFwQjtBQUNBO0FBQ0EsWUFBSSxDQUFDLGFBQWEsSUFBYixDQUFrQixTQUFsQixDQUFMLEVBQW1DO0FBQ2pDLHVCQUFhLE9BQU8sQ0FBUCxFQUFVLE9BQVYsQ0FBa0IsS0FBbEIsRUFBeUIsRUFBekIsQ0FBYjtBQUNBLDBCQUFnQixPQUFPLENBQVAsQ0FBaEI7QUFDRDtBQUNELGFBQUssR0FBTCxDQUFTLGNBQVQsQ0FBd0IsSUFBeEIsQ0FBNkI7QUFDM0IsZ0JBQU0sV0FEcUI7QUFFM0IsZ0JBQU0sSUFGcUI7QUFHM0IscUJBQVcsYUFIZ0I7QUFJM0Isc0JBQVk7QUFKZSxTQUE3QjtBQU1EO0FBQ0Y7Ozs7OztrQkFHWSxJOzs7Ozs7OztBQy9FZixJQUFNLFNBQVM7QUFDYixZQUFVO0FBQ1IsY0FBVSxJQURGO0FBRVIsZ0JBQVksSUFGSjtBQUdSLGVBQVcsSUFISDtBQUlSLGlCQUFhLEVBSkw7QUFLUixnQkFBWSxDQUxKO0FBTVIsaUJBQWEsQ0FOTDtBQU9SLHFCQUFpQixDQVBUO0FBUVIsb0JBQWdCLENBUlI7QUFTUixxQkFBaUIsQ0FUVDtBQVVSLHNCQUFrQixDQVZWO0FBV1Isc0JBQWtCLENBWFY7QUFZUixxQkFBaUIsQ0FaVDtBQWFSLG1CQUFlO0FBYlAsR0FERztBQWdCYixhQUFXLENBQ1QsV0FEUyxFQUVULGVBRlMsRUFHVCxjQUhTLEVBSVQsZUFKUyxFQUtULGdCQUxTLEVBTVQsZ0JBTlMsRUFPVCxlQVBTLEVBUVQsYUFSUztBQWhCRSxDQUFmOztrQkE0QmUsTTs7Ozs7Ozs7Ozs7QUM1QmY7Ozs7Ozs7O0FBRUEsSUFBTSxhQUFhO0FBQ2pCLFlBQVUsZUFBVSxLQUFWLEVBQWlCO0FBQ3pCLFVBQU0sSUFBTixDQUFXLEtBQVgsQ0FBaUIsT0FBakIsR0FBNEIsQ0FBQyxDQUFFLE1BQU0sVUFBVCxHQUF1QixpQkFBdkIsR0FBMkMsZ0JBQXZFO0FBQ0QsR0FIZ0I7QUFJakIsY0FBWSxpQkFBVSxLQUFWLEVBQWlCO0FBQzNCLFVBQU0sSUFBTixDQUFXLEtBQVgsQ0FBaUIsT0FBakIsR0FBNEIsQ0FBQyxDQUFFLE1BQU0sVUFBVCxHQUF1QixpQkFBdkIsR0FBMkMsZ0JBQXZFO0FBQ0QsR0FOZ0I7QUFPakIsYUFBVyxnQkFBVSxLQUFWLEVBQWlCO0FBQUE7O0FBQzFCO0FBQ0EsUUFBSSxpQkFBaUIsTUFBTSxVQUFOLENBQWlCLEtBQWpCLENBQXVCLEtBQXZCLEVBQThCLENBQTlCLENBQXJCO0FBQ0EsUUFBSSxxQkFBcUIsTUFBTSxVQUFOLENBQWlCLEtBQWpCLENBQXVCLEtBQXZCLEVBQThCLENBQTlCLENBQXpCO0FBQ0EsUUFBSSxlQUFlLElBQW5CO0FBQ0EsUUFBSSxLQUFLLEtBQUwsQ0FBVyxjQUFYLENBQTBCLGNBQTFCLENBQUosRUFBK0M7QUFDN0MscUJBQWUsS0FBSyxLQUFMLENBQVcsY0FBWCxDQUFmO0FBQ0Q7QUFDRDtBQUNBLFFBQUksYUFBYSx3QkFBd0IsS0FBeEIsSUFBaUMsQ0FBQyxNQUFNLFlBQU4sQ0FBbkQ7QUFDQSxRQUFJLENBQUMsVUFBTCxFQUFpQjtBQUNmLGNBQVEsS0FBUixDQUFjLHdFQUFkO0FBQ0E7QUFDRDtBQUNEO0FBQ0EsUUFBSSxVQUFVLGdCQUFLLE9BQUwsQ0FBYSxZQUFiLENBQWQ7QUFDQSxRQUFJLE1BQU0sVUFBVSxhQUFhLE1BQXZCLEdBQWdDLFlBQTFDO0FBQ0EsUUFBSSxhQUFhLE1BQU0sSUFBTixDQUFXLEtBQVgsQ0FBaUIsU0FBakIsQ0FBMkIsSUFBM0IsQ0FBakI7QUFDQSxVQUFNLElBQU4sQ0FBVyxLQUFYLENBQWlCLGVBQWpCLENBQWlDLFNBQWpDOztBQWxCMEIsK0JBb0JqQixDQXBCaUI7QUFxQnhCLFlBQU0sZ0JBQU4sQ0FBdUIsR0FBdkIsQ0FBMkIscUJBQWE7QUFDdEMsWUFBSSxVQUFVLFVBQVYsS0FBeUIsa0JBQTdCLEVBQWlEO0FBQy9DLHFCQUFXLFVBQVUsU0FBckIsRUFBZ0MsSUFBaEMsUUFBMkMsU0FBM0MsRUFBc0QsYUFBYSxDQUFiLENBQXREO0FBQ0Q7QUFDRixPQUpEO0FBS0EsWUFBTSxJQUFOLENBQVcsTUFBWCxDQUFrQixZQUFsQixDQUErQixVQUEvQixFQUEyQyxNQUFNLElBQU4sQ0FBVyxLQUF0RDtBQTFCd0I7O0FBb0IxQixTQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksTUFBTSxDQUExQixFQUE2QixHQUE3QixFQUFrQztBQUFBLFlBQXpCLENBQXlCO0FBT2pDOztBQUVELFFBQUksZ0JBQWdCLE9BQXBCLEVBQTZCO0FBQzNCLFdBQUssU0FBTCxDQUFlLElBQWYsQ0FBb0IsWUFBcEI7QUFDRDtBQUNGLEdBdkNnQjtBQXdDakIsY0FBWSxpQkFBVSxLQUFWLEVBQWlCLFNBQWpCLEVBQTRCO0FBQ3RDLFFBQUksZ0JBQWdCLENBQUMsU0FBRCxHQUFhLEtBQUssS0FBTCxDQUFXLE1BQU0sVUFBakIsQ0FBYixHQUE0QyxTQUFoRTtBQUNBLFlBQVEsR0FBUixDQUFZLFdBQVosRUFBeUIsTUFBTSxJQUFOLENBQVcsS0FBcEM7QUFDQSxRQUFJLE1BQU0sSUFBTixDQUFXLFFBQVgsS0FBd0IsYUFBNUIsRUFBMkM7QUFDekMsWUFBTSxJQUFOLENBQVcsS0FBWCxDQUFpQixTQUFqQixHQUE2QixhQUE3QjtBQUNELEtBRkQsTUFFTztBQUNMLFlBQU0sSUFBTixDQUFXLEtBQVgsR0FBbUIsYUFBbkI7QUFDRDtBQUNGO0FBaERnQixDQUFuQjs7SUFtRE0sTTtBQUNKLGtCQUFhLEdBQWIsRUFBa0I7QUFBQTs7QUFBQTs7QUFDaEIsU0FBSyxHQUFMLEdBQVcsR0FBWDtBQUNBLFNBQUssWUFBTCxHQUFvQixFQUFwQjtBQUNBLFNBQUssZ0JBQUwsR0FBd0IsRUFBeEI7QUFDQSxRQUFJLFlBQVksS0FBSyxHQUFMLENBQVMsY0FBVCxDQUF3QixNQUF4QztBQUNBLFFBQUksU0FBSixFQUFlO0FBQ2IsV0FBSyxHQUFMLENBQVMsY0FBVCxDQUF3QixHQUF4QixDQUE0QixlQUFPO0FBQ2pDLFlBQUksSUFBSixLQUFhLE9BQWIsR0FBdUIsT0FBSyxZQUFMLENBQWtCLElBQWxCLENBQXVCLEdBQXZCLENBQXZCLEdBQXFELE9BQUssZ0JBQUwsQ0FBc0IsSUFBdEIsQ0FBMkIsR0FBM0IsQ0FBckQ7QUFDRCxPQUZEO0FBR0EsV0FBSyxHQUFMLENBQVMsY0FBVCxHQUEwQixFQUExQjtBQUNEO0FBQ0QsU0FBSyxhQUFMO0FBQ0Q7Ozs7b0NBRWdCO0FBQUE7O0FBQ2YsVUFBSSxxQkFBcUIsS0FBSyxnQkFBTCxDQUFzQixNQUEvQztBQUNBLFVBQUksa0JBQUosRUFBd0I7QUFDdEIsYUFBSyxJQUFJLElBQUkscUJBQXFCLENBQWxDLEVBQXFDLEtBQUssQ0FBMUMsRUFBNkMsR0FBN0MsRUFBa0Q7QUFDaEQsY0FBSSxLQUFLLGdCQUFMLENBQXNCLENBQXRCLEVBQXlCLFNBQXpCLEtBQXVDLFNBQTNDLEVBQXNEO0FBQ3BELGdCQUFJLFNBQVMsT0FBTyxNQUFQLENBQWMsRUFBZCxFQUFrQixLQUFLLGdCQUF2QixDQUFiO0FBQ0EsZ0JBQUksc0JBQXNCLGdCQUFLLFdBQUwsQ0FBaUIsT0FBTyxNQUFQLENBQWMsSUFBSSxDQUFsQixDQUFqQixFQUF1QyxLQUFLLGdCQUFMLENBQXNCLENBQXRCLEVBQXlCLElBQXpCLENBQThCLEtBQXJFLENBQTFCO0FBQ0EsaUJBQUssZ0JBQUwsQ0FBc0IsQ0FBdEIsRUFBeUIsa0JBQXpCLElBQStDLG1CQUEvQztBQUNBLGlCQUFLLGdCQUFMLENBQXNCLE1BQXRCLENBQTZCLElBQUksQ0FBakMsRUFBb0Msb0JBQW9CLE1BQXhEO0FBQ0Q7QUFDRjs7QUFFRCxhQUFLLGdCQUFMLENBQXNCLEdBQXRCLENBQTBCLGlCQUFTO0FBQ2pDLHFCQUFXLE1BQU0sU0FBakIsRUFBNEIsSUFBNUIsQ0FBaUMsT0FBSyxHQUF0QyxFQUEyQyxLQUEzQztBQUNELFNBRkQ7QUFHRDtBQUNEO0FBQ0Q7O0FBRUQ7Ozs7Z0NBQ2E7QUFBQTs7QUFDWCxVQUFJLGFBQWEsS0FBSyxZQUF0QjtBQUNBLFVBQUksV0FBVyxNQUFmLEVBQXVCO0FBQ3JCLG1CQUFXLEdBQVgsQ0FBZSxlQUFPO0FBQ3BCLGtCQUFRLEdBQVIsQ0FBWSxLQUFaLEVBQW1CLEdBQW5CO0FBQ0EsY0FBSSxNQUFKLENBQVcsS0FBWCxDQUFpQixlQUFqQixDQUFpQyxJQUFJLElBQXJDO0FBQ0EsY0FBSSxZQUFZLGdCQUFLLFlBQUwsQ0FBa0IsSUFBSSxJQUF0QixDQUFoQjtBQUNBLGtCQUFRLEdBQVIsQ0FBWSxJQUFJLElBQWhCO0FBQ0EsY0FBSSxZQUFZLE9BQUssR0FBTCxDQUFTLE1BQU0sZ0JBQUssY0FBTCxDQUFvQixJQUFJLElBQXhCLENBQWYsQ0FBaEI7QUFDQSxrQkFBUSxHQUFSLENBQVksVUFBVSxTQUF0QjtBQUNBLGNBQUksU0FBSixFQUFlO0FBQ2IsZ0JBQUksTUFBSixDQUFXLEtBQVgsQ0FBaUIsZ0JBQWpCLENBQWtDLFNBQWxDLEVBQTZDLFNBQTdDLEVBQXdELEtBQXhEO0FBQ0QsV0FGRCxNQUVPO0FBQ0wsb0JBQVEsS0FBUixDQUFjLHFCQUFxQixJQUFJLElBQXpCLEdBQWdDLGtCQUE5QztBQUNEO0FBQ0YsU0FaRDtBQWFEO0FBQ0Y7Ozs7OztrQkFHWSxNOzs7Ozs7Ozs7QUM1R2Y7Ozs7Ozs7O0lBRU0sVyxHQUNKLHFCQUFhLEtBQWIsRUFBb0I7QUFBQTs7QUFDbEIsTUFBSSxDQUFDLE1BQU0sY0FBTixDQUFxQixJQUFyQixDQUFELElBQStCLENBQUMsTUFBTSxjQUFOLENBQXFCLE1BQXJCLENBQXBDLEVBQWtFO0FBQ2hFLFlBQVEsS0FBUixDQUFjLHFEQUFkO0FBQ0E7QUFDRDtBQUNELE9BQUssR0FBTCxHQUFXLFNBQVMsYUFBVCxDQUF1QixNQUFNLEVBQTdCLENBQVg7QUFDQSxPQUFLLEtBQUwsR0FBYSxNQUFNLElBQW5CO0FBQ0EsT0FBSyxTQUFMLEdBQWlCLEVBQWpCO0FBQ0EsT0FBSyxlQUFMLEdBQXVCLEVBQXZCO0FBQ0EsT0FBSyxZQUFMLEdBQW9CLEVBQXBCO0FBQ0EsT0FBSyxjQUFMLEdBQXNCLEVBQXRCO0FBQ0EsT0FBSyxJQUFJLE1BQVQsSUFBbUIsTUFBTSxPQUF6QixFQUFrQztBQUNoQztBQUNBLFFBQUksTUFBTSxPQUFOLENBQWMsY0FBZCxDQUE2QixNQUE3QixDQUFKLEVBQTBDO0FBQ3hDLFdBQUssTUFBTSxNQUFYLElBQXFCLE1BQU0sT0FBTixDQUFjLE1BQWQsRUFBc0IsSUFBdEIsQ0FBMkIsSUFBM0IsQ0FBckI7QUFDRDtBQUNGO0FBQ0Qsd0JBQVksS0FBSyxHQUFqQixFQUFzQixJQUF0QjtBQUNELEM7O2tCQUdZLFc7Ozs7Ozs7OztBQ3hCZjs7Ozs7O0FBRUEsSUFBTSxPQUFPO0FBQ1g7QUFDQSxXQUZXLHFCQUVBLEdBRkEsRUFFSztBQUNkLFdBQU8sT0FBTyxTQUFQLENBQWlCLFFBQWpCLENBQTBCLElBQTFCLENBQStCLEdBQS9CLENBQVA7QUFDRCxHQUpVOztBQUtYO0FBQ0EsY0FOVyx3QkFNRyxHQU5ILEVBTVE7QUFDakIsV0FBTyxNQUFNLElBQUksT0FBSixDQUFZLE1BQVosRUFBb0IsRUFBcEIsQ0FBYjtBQUNELEdBUlU7O0FBU1g7QUFDQSxnQkFWVywwQkFVSyxHQVZMLEVBVVU7QUFDbkIsVUFBTSxJQUFJLE9BQUosQ0FBWSxLQUFaLEVBQW1CLEVBQW5CLENBQU47QUFDQSxXQUFPLE1BQU0sSUFBSSxPQUFKLENBQVksTUFBWixFQUFvQixFQUFwQixDQUFiO0FBQ0QsR0FiVTtBQWNYLGtCQWRXLDRCQWNPLFFBZFAsRUFjaUIsTUFkakIsRUFjeUI7QUFDbEMsV0FBTyxPQUFPLElBQVAsQ0FBWSxVQUFDLElBQUQsRUFBTyxJQUFQLEVBQWdCO0FBQ2pDLFVBQUksT0FBTyxpQkFBTyxRQUFQLENBQWdCLEtBQUssUUFBTCxDQUFoQixDQUFYO0FBQ0EsVUFBSSxPQUFPLGlCQUFPLFFBQVAsQ0FBZ0IsS0FBSyxRQUFMLENBQWhCLENBQVg7QUFDQSxhQUFPLE9BQU8sSUFBZDtBQUNELEtBSk0sQ0FBUDtBQUtELEdBcEJVO0FBcUJYLFNBckJXLG1CQXFCRixHQXJCRSxFQXFCRztBQUNaLFdBQU8sS0FBSyxTQUFMLENBQWUsR0FBZixNQUF3QixnQkFBL0I7QUFDRCxHQXZCVTtBQXdCWCxnQkF4QlcsMEJBd0JLLEdBeEJMLEVBd0JVO0FBQ25CLFdBQU8sS0FBSyxTQUFMLENBQWUsR0FBZixNQUF3QixpQkFBL0I7QUFDRCxHQTFCVTtBQTJCWCxVQTNCVyxvQkEyQkQsTUEzQkMsRUEyQk8sSUEzQlAsRUEyQmE7QUFDdEIsUUFBSSxDQUFDLEtBQUssT0FBTCxDQUFhLE1BQWIsQ0FBRCxJQUF5QixDQUFDLEtBQUssY0FBTCxDQUFvQixNQUFwQixDQUE5QixFQUEyRDtBQUN6RCxZQUFNLDBDQUFOO0FBQ0Q7O0FBRUQsUUFBSSxhQUFhLEtBQUssT0FBTCxDQUFhLE1BQWIsSUFBdUIsRUFBdkIsR0FBNEIsRUFBN0M7QUFDQSxTQUFLLElBQUksSUFBVCxJQUFpQixNQUFqQixFQUF5QjtBQUN2QixVQUFJLE9BQU8sY0FBUCxDQUFzQixJQUF0QixDQUFKLEVBQWlDO0FBQy9CLFlBQUksS0FBSyxPQUFMLENBQWEsT0FBTyxJQUFQLENBQWIsS0FBOEIsS0FBSyxjQUFMLENBQW9CLE9BQU8sSUFBUCxDQUFwQixDQUFsQyxFQUFxRTtBQUNuRSxxQkFBVyxJQUFYLElBQW1CLEtBQUssUUFBTCxDQUFjLE9BQU8sSUFBUCxDQUFkLENBQW5CO0FBQ0QsU0FGRCxNQUVPO0FBQ0wscUJBQVcsSUFBWCxJQUFtQixPQUFPLElBQVAsQ0FBbkI7QUFDRDtBQUNGO0FBQ0Y7O0FBRUQsV0FBTyxVQUFQO0FBQ0QsR0E1Q1U7QUE2Q1gsYUE3Q1csdUJBNkNFLEdBN0NGLEVBNkNPLE1BN0NQLEVBNkNlO0FBQ3hCLFFBQUksS0FBSyxPQUFMLENBQWEsR0FBYixDQUFKLEVBQXVCO0FBQ3JCLFVBQUksR0FBSixDQUFRLGlCQUFTO0FBQ2YsZUFBTyxPQUFPLFFBQVAsQ0FBZ0IsTUFBTSxJQUFOLENBQVcsS0FBM0IsQ0FBUDtBQUNELE9BRkQ7O0FBSUEsYUFBTyxHQUFQO0FBQ0QsS0FORCxNQU1PO0FBQ0wsY0FBUSxLQUFSLENBQWMsd0NBQXdDLEdBQXhDLEdBQThDLGVBQTVEO0FBQ0E7QUFDRDtBQUNGO0FBeERVLENBQWI7O2tCQTJEZSxJIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiBpbXBvcnQgbGluayBmcm9tICcuL2xpbmsnXG4gaW1wb3J0IHV0aWwgZnJvbSAnLi91dGlscydcblxuIGNsYXNzIGNvbXBpbGUge1xuICAvLyDpgJLlvZJET03moJFcbiAgY29uc3RydWN0b3IgKHBhcmVudCwgc2pmKSB7XG4gICAgdGhpcy5zamYgPSBzamZcbiAgICB0aGlzLnNlYXJjaE5vZGUgPSBbXVxuICAgIHRoaXMucm9vdENvbnRlbnQgPSB0aGlzLnNqZi5fZWwuaW5uZXJIVE1MXG4gICAgLy8gdGhpcy50cmF2ZXJzZUVsZW1lbnQocGFyZW50LCBudWxsLCB0cnVlKVxuICAgIHRoaXMuY2lyY2xlRWxlbWVudCh0aGlzLnNqZi5fZWwsIHRydWUpXG4gIH1cblxuICBjaXJjbGVFbGVtZW50IChwYXJlbnQsIGlzRmlyc3QpIHtcbiAgICBsZXQgY2hpbGQgPSBBcnJheS5mcm9tKHBhcmVudC5jaGlsZHJlbilcbiAgICAvLyDlpoLmnpzmmK/nrKzkuIDmrKHpgY3ljoblubbkuJTmsqHmnInlrZDoioLngrnlsLHnm7TmjqXot7Pov4djb21waWxlXG4gICAgaWYgKGlzRmlyc3QgJiYgIWNoaWxkLmxlbmd0aCkge1xuICAgICAgdGhpcy5jb21waWxlTm9kZSgpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY2hpbGQucmV2ZXJzZSgpXG4gICAgY2hpbGQubWFwKG5vZGUgPT4ge1xuICAgICAgaWYgKCEhbm9kZS5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5jaXJjbGVFbGVtZW50KG5vZGUsIGZhbHNlKVxuICAgICAgICB0aGlzLnNqZi5fdW5jb21waWxlTm9kZXMucHVzaCh7XG4gICAgICAgICAgY2hlY2s6IG5vZGUsXG4gICAgICAgICAgcGFyZW50OiBub2RlLnBhcmVudE5vZGUsXG4gICAgICAgICAgbm9kZVR5cGU6ICdlbGVtZW50Tm9kZSdcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2pmLl91bmNvbXBpbGVOb2Rlcy5wdXNoKHtcbiAgICAgICAgICBjaGVjazogbm9kZSwgXG4gICAgICAgICAgcGFyZW50OiBub2RlLnBhcmVudE5vZGUsXG4gICAgICAgICAgbm9kZVR5cGU6ICdlbGVtZW50Tm9kZSdcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgaWYgKHRoaXMuc2pmLl9lbC5sYXN0RWxlbWVudENoaWxkID09PSBjaGlsZFswXSkge1xuICAgICAgdGhpcy5jb21waWxlTm9kZSgpXG4gICAgfVxuICB9XG5cbiAgY29tcGlsZU5vZGUgKCkge1xuICAgIGxldCBoYXNVbmNvbXBpbGUgPSB0aGlzLnNqZi5fdW5jb21waWxlTm9kZXMubGVuZ3RoXG4gICAgdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzLnJldmVyc2UoKVxuICAgIGlmIChoYXNVbmNvbXBpbGUpIHtcbiAgICAgIHRoaXMuc2pmLl91bmNvbXBpbGVOb2Rlcy5tYXAodmFsdWUgPT4ge1xuICAgICAgICB0aGlzLmhhc0RpcmVjdGl2ZSh2YWx1ZSlcbiAgICAgIH0pXG4gICAgfVxuICAgIHRoaXMuc2pmLl91bmNvbXBpbGVOb2RlcyA9IFtdXG4gICAgbmV3IGxpbmsodGhpcy5zamYpXG4gIH1cblxuICAvLyDmo4DmtYvmr4/kuKpub2Rl55yL5piv5ZCm57uR5a6a5pyJ5oyH5LukXG4gIGhhc0RpcmVjdGl2ZSAodmFsdWUpIHtcbiAgICBsZXQgY2hlY2tSZWcgPSAvc2pmLS4rPVxcXCIuK1xcXCJ8XFx7XFx7LitcXH1cXH0vXG4gICAgaWYgKGNoZWNrUmVnLnRlc3QodmFsdWUuY2hlY2suY2xvbmVOb2RlKCkub3V0ZXJIVE1MKSkge1xuICAgICAgdGhpcy5zamYuX3VubGlua05vZGVzLnB1c2godmFsdWUpXG4gICAgfVxuICAgIEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbCh2YWx1ZS5jaGVjay5jaGlsZE5vZGVzLCBub2RlID0+IHtcbiAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSAzKSB7XG4gICAgICAgIGlmIChjaGVja1JlZy50ZXN0KG5vZGUuZGF0YSkpIHtcbiAgICAgICAgICB0aGlzLnNqZi5fdW5saW5rTm9kZXMucHVzaCh7XG4gICAgICAgICAgICBjaGVjazogbm9kZSwgXG4gICAgICAgICAgICBwYXJlbnQ6IHZhbHVlLmNoZWNrLCBcbiAgICAgICAgICAgIG5vZGVUeXBlOiAndGV4dE5vZGUnXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY29tcGlsZVxuIiwiaW1wb3J0IG9wdGlvbiBmcm9tICcuL29wdGlvbidcbmltcG9ydCByZW5kZXIgZnJvbSAnLi9yZW5kZXInXG5pbXBvcnQgdXRpbCBmcm9tICcuL3V0aWxzJ1xuXG5jbGFzcyBsaW5rIHtcbiAgY29uc3RydWN0b3IgKHNqZikge1xuICAgIHRoaXMuc2pmID0gc2pmXG4gICAgbGV0IGhhc1VubGlua05vZGUgPSB0aGlzLnNqZi5fdW5saW5rTm9kZXMubGVuZ3RoXG4gICAgaWYgKGhhc1VubGlua05vZGUpIHtcbiAgICAgIGxldCBleHRyYWN0UmVnID0gL3NqZi1bYS16XSs9XFxcIlteXCJdK1xcXCJ8XFx7XFx7LitcXH1cXH0vZ1xuICAgICAgdGhpcy5zamYuX3VubGlua05vZGVzLm1hcCh2YWx1ZSA9PiB7XG4gICAgICAgIGxldCBkaXJlY3RpdmVzID0gW11cbiAgICAgICAgaWYgKHZhbHVlLm5vZGVUeXBlID09PSAndGV4dE5vZGUnKSB7XG4gICAgICAgICAgZGlyZWN0aXZlcyA9IHZhbHVlLmNoZWNrLmRhdGEubWF0Y2goZXh0cmFjdFJlZylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkaXJlY3RpdmVzID0gdmFsdWUuY2hlY2suY2xvbmVOb2RlKCkub3V0ZXJIVE1MLm1hdGNoKGV4dHJhY3RSZWcpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRpcmVjdGl2ZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgIGxldCB3aXRoTmFtZURpcmVjdGl2ZXMgPSBkaXJlY3RpdmVzLm1hcChkaXJlY3RpdmUgPT4gdGhpcy5hZGREaXJlY3RpdmVOYW1lKGRpcmVjdGl2ZSkpXG4gICAgICAgICAgd2l0aE5hbWVEaXJlY3RpdmVzID0gdXRpbC5zb3J0RXhleHV0ZVF1ZXVlKCduYW1lJywgd2l0aE5hbWVEaXJlY3RpdmVzKVxuICAgICAgICAgIHdpdGhOYW1lRGlyZWN0aXZlcy5tYXAoZGlyZWN0aXZlID0+IHtcbiAgICAgICAgICAgIHRoaXMuZXh0cmFjdERpcmVjdGl2ZShkaXJlY3RpdmUudmFsdWUsIHZhbHVlKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGlyZWN0aXZlcy5tYXAoZGlyZWN0aXZlID0+IHtcbiAgICAgICAgICAgIHRoaXMuZXh0cmFjdERpcmVjdGl2ZShkaXJlY3RpdmUsIHZhbHVlKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICB0aGlzLl91bmxpbmtOb2RlcyA9IFtdXG4gICAgICBuZXcgcmVuZGVyKHRoaXMuc2pmKVxuICAgIH1cbiAgfVxuXG4gIGFkZERpcmVjdGl2ZU5hbWUgKGRpcmVjdGl2ZSkge1xuICAgIGxldCBzbGljZXMgPSBkaXJlY3RpdmUuc3BsaXQoJz0nKVxuICAgIGlmIChzbGljZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOiAnc2pmLXRleHQnLFxuICAgICAgICB2YWx1ZTogZGlyZWN0aXZlXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5hbWU6IHNsaWNlc1swXSxcbiAgICAgICAgdmFsdWU6IGRpcmVjdGl2ZVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIOaPkOWPluaMh+S7pFxuICBleHRyYWN0RGlyZWN0aXZlIChkaXJlY3RpdmUsIG5vZGUpIHtcbiAgICBsZXQgc2xpY2VzID0gZGlyZWN0aXZlLnNwbGl0KCc9JylcbiAgICAvLyDlpoLmnpzmmK/kuovku7blsLHnm7TmjqXpgJrov4dhZGRFdmVudExpc3RlbmVy6L+b6KGM57uR5a6aXG4gICAgaWYgKG9wdGlvbi5zamZFdmVudHMuaW5kZXhPZihzbGljZXNbMF0pID49IDApIHtcbiAgICAgIGxldCBldmVudE1lcyA9IHtcbiAgICAgICAgdHlwZTogJ2V2ZW50JyxcbiAgICAgICAgdGFyZ2V0OiBub2RlLFxuICAgICAgICBuYW1lOiBzbGljZXNbMF0sXG4gICAgICAgIGZ1bmM6IHNsaWNlc1sxXVxuICAgICAgfVxuICAgICAgdGhpcy5zamYuX3VucmVuZGVyTm9kZXMucHVzaChldmVudE1lcylcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGV4cHJlc3Npb24gPSBzbGljZXNbMF0ucmVwbGFjZSgvW1xce1xcfV0vZywgJycpXG4gICAgICBsZXQgZGlyZWN0aXZlTmFtZSA9ICdzamYtdGV4dCdcbiAgICAgIC8vIOWvuemdnnt7fX3ov5nnp43ooajovr7lvI/ov5vooYzljZXni6zlpITnkIZcbiAgICAgIGlmICghL1xce1xcey4rXFx9XFx9Ly50ZXN0KGRpcmVjdGl2ZSkpIHtcbiAgICAgICAgZXhwcmVzc2lvbiA9IHNsaWNlc1sxXS5yZXBsYWNlKC9cXFwiL2csICcnKVxuICAgICAgICBkaXJlY3RpdmVOYW1lID0gc2xpY2VzWzBdXG4gICAgICB9XG4gICAgICB0aGlzLnNqZi5fdW5yZW5kZXJOb2Rlcy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2RpcmVjdGl2ZScsXG4gICAgICAgIG5vZGU6IG5vZGUsIFxuICAgICAgICBkaXJlY3RpdmU6IGRpcmVjdGl2ZU5hbWUsIFxuICAgICAgICBleHByZXNzaW9uOiBleHByZXNzaW9uXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBsaW5rXG4iLCJjb25zdCBvcHRpb24gPSB7XG4gIHByaW9yaXR5OiB7XG4gICAgJ3NqZi1pZic6IDIwMDAsXG4gICAgJ3NqZi1zaG93JzogMjAwMCxcbiAgICAnc2pmLWZvcic6IDEwMDAsXG4gICAgJ3NqZi1tb2RlbCc6IDEwLFxuICAgICdzamYtdGV4dCc6IDEsXG4gICAgJ3NqZi1jbGljayc6IDAsXG4gICAgJ3NqZi1tb3VzZW92ZXInOiAwLFxuICAgICdzamYtbW91c2VvdXQnOiAwLFxuICAgICdzamYtbW91c2Vtb3ZlJzogMCxcbiAgICAnc2pmLW1vdXNlZW50ZXInOiAwLFxuICAgICdzamYtbW91c2VsZWF2ZSc6IDAsXG4gICAgJ3NqZi1tb3VzZWRvd24nOiAwLFxuICAgICdzamYtbW91c2V1cCc6IDBcbiAgfSxcbiAgc2pmRXZlbnRzOiBbXG4gICAgJ3NqZi1jbGljaycsIFxuICAgICdzamYtbW91c2VvdmVyJywgXG4gICAgJ3NqZi1tb3VzZW91dCcsIFxuICAgICdzamYtbW91c2Vtb3ZlJywgXG4gICAgJ3NqZi1tb3VzZWVudGVyJyxcbiAgICAnc2pmLW1vdXNlbGVhdmUnLFxuICAgICdzamYtbW91c2Vkb3duJyxcbiAgICAnc2pmLW1vdXNldXAnXG4gIF1cbn1cblxuZXhwb3J0IGRlZmF1bHQgb3B0aW9uXG4iLCJpbXBvcnQgdXRpbCBmcm9tICcuL3V0aWxzJ1xuXG5jb25zdCBsaW5rUmVuZGVyID0ge1xuICAnc2pmLWlmJzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFsdWUubm9kZS5zdHlsZS5kaXNwbGF5ID0gKCEhKHZhbHVlLmV4cHJlc3Npb24pID8gJ2Jsb2NrIWltcG9ydGFudCcgOiAnbm9uZSFpbXBvcnRhbnQnKVxuICB9LFxuICAnc2pmLXNob3cnOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YWx1ZS5ub2RlLnN0eWxlLmRpc3BsYXkgPSAoISEodmFsdWUuZXhwcmVzc2lvbikgPyAnYmxvY2shaW1wb3J0YW50JyA6ICdub25lIWltcG9ydGFudCcpXG4gIH0sXG4gICdzamYtZm9yJzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgLy8g5bCG6KGo6L6+5byP6YCa6L+H56m65qC8KOS4jemZkOepuuagvOaVsOebrinnu5nliIflvIBcbiAgICBsZXQgbG9vcE9iamVjdE5hbWUgPSB2YWx1ZS5leHByZXNzaW9uLnNwbGl0KC9cXHMrLylbMl1cbiAgICBsZXQgcmVwcmVzZW50YXRpdmVOYW1lID0gdmFsdWUuZXhwcmVzc2lvbi5zcGxpdCgvXFxzKy8pWzBdXG4gICAgbGV0IHRvTG9vcE9iamVjdCA9IG51bGxcbiAgICBpZiAodGhpcy5fZGF0YS5oYXNPd25Qcm9wZXJ0eShsb29wT2JqZWN0TmFtZSkpIHtcbiAgICAgIHRvTG9vcE9iamVjdCA9IHRoaXMuX2RhdGFbbG9vcE9iamVjdE5hbWVdXG4gICAgfVxuICAgIC8vIOWIpOaWreW+heW+queOr+eahOaYr+WQpuiDvei/m+ihjOW+queOr1xuICAgIGxldCBpc0xvb3BhYmxlID0gdG9Mb29wT2JqZWN0IGluc3RhbmNlb2YgQXJyYXkgfHwgIWlzTmFOKHRvTG9vcE9iamVjdClcbiAgICBpZiAoIWlzTG9vcGFibGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ3NqZltlcnJvcl06IHRoZSB0b0xvb3BPYmplY3Qgb2Ygc2pmLWZvciBzaG91bGQgYmUgYSBudW1iZXIgb3IgYW4gQXJyYXknKVxuICAgICAgcmV0dXJuIFxuICAgIH1cbiAgICAvLyDliKTmlq3mmK/mlbDnu4Tov5jmmK/mlbDlrZfvvIzku47ogIzotYvlgLxsZW5ndGhcbiAgICBsZXQgaXNBcnJheSA9IHV0aWwuaXNBcnJheSh0b0xvb3BPYmplY3QpXG4gICAgbGV0IGxlbiA9IGlzQXJyYXkgPyB0b0xvb3BPYmplY3QubGVuZ3RoIDogdG9Mb29wT2JqZWN0XG4gICAgbGV0IGNsb25lZE5vZGUgPSB2YWx1ZS5ub2RlLmNoZWNrLmNsb25lTm9kZSh0cnVlKVxuICAgIHZhbHVlLm5vZGUuY2hlY2sucmVtb3ZlQXR0cmlidXRlKCdzamYtZm9yJylcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuIC0gMTsgaSsrKSB7XG4gICAgICB2YWx1ZS5iZWZvcmVEaXJlY3RpdmVzLm1hcChkaXJlY3RpdmUgPT4ge1xuICAgICAgICBpZiAoZGlyZWN0aXZlLmV4cHJlc3Npb24gPT09IHJlcHJlc2VudGF0aXZlTmFtZSkge1xuICAgICAgICAgIGxpbmtSZW5kZXJbZGlyZWN0aXZlLmRpcmVjdGl2ZV0uYmluZCh0aGlzKShkaXJlY3RpdmUsIHRvTG9vcE9iamVjdFtpXSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIHZhbHVlLm5vZGUucGFyZW50Lmluc2VydEJlZm9yZShjbG9uZWROb2RlLCB2YWx1ZS5ub2RlLmNoZWNrKVxuICAgIH1cblxuICAgIGlmICh0b0xvb3BPYmplY3QgJiYgaXNBcnJheSkge1xuICAgICAgdGhpcy5fd2F0Y2hlcnMucHVzaCh0b0xvb3BPYmplY3QpXG4gICAgfVxuICB9LFxuICAnc2pmLXRleHQnOiBmdW5jdGlvbiAodmFsdWUsIHRleHRWYWx1ZSkge1xuICAgIGxldCB0ZXh0Tm9kZVZsYXVlID0gIXRleHRWYWx1ZSA/IHRoaXMuX2RhdGFbdmFsdWUuZXhwcmVzc2lvbl0gOiB0ZXh0VmFsdWVcbiAgICBjb25zb2xlLmxvZygnY2hlY2tOb2RlJywgdmFsdWUubm9kZS5jaGVjaylcbiAgICBpZiAodmFsdWUubm9kZS5ub2RlVHlwZSA9PT0gJ2VsZW1lbnROb2RlJykge1xuICAgICAgdmFsdWUubm9kZS5jaGVjay5pbm5lclRleHQgPSB0ZXh0Tm9kZVZsYXVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlLm5vZGUuY2hlY2sgPSB0ZXh0Tm9kZVZsYXVlXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIHJlbmRlciB7XG4gIGNvbnN0cnVjdG9yIChzamYpIHtcbiAgICB0aGlzLnNqZiA9IHNqZlxuICAgIHRoaXMudW5CaW5kRXZlbnRzID0gW11cbiAgICB0aGlzLnVuU29ydERpcmVjdGl2ZXMgPSBbXVxuICAgIGxldCBoYXNSZW5kZXIgPSB0aGlzLnNqZi5fdW5yZW5kZXJOb2Rlcy5sZW5ndGhcbiAgICBpZiAoaGFzUmVuZGVyKSB7XG4gICAgICB0aGlzLnNqZi5fdW5yZW5kZXJOb2Rlcy5tYXAodmFsID0+IHtcbiAgICAgICAgdmFsLnR5cGUgPT09ICdldmVudCcgPyB0aGlzLnVuQmluZEV2ZW50cy5wdXNoKHZhbCkgOiB0aGlzLnVuU29ydERpcmVjdGl2ZXMucHVzaCh2YWwpXG4gICAgICB9KVxuICAgICAgdGhpcy5zamYuX3VucmVuZGVyTm9kZXMgPSBbXVxuICAgIH1cbiAgICB0aGlzLnNvcnREaXJlY3RpdmUoKVxuICB9XG5cbiAgc29ydERpcmVjdGl2ZSAoKSB7XG4gICAgbGV0IGhhc1VuU29ydERpcmVjdGl2ZSA9IHRoaXMudW5Tb3J0RGlyZWN0aXZlcy5sZW5ndGhcbiAgICBpZiAoaGFzVW5Tb3J0RGlyZWN0aXZlKSB7XG4gICAgICBmb3IgKGxldCBpID0gaGFzVW5Tb3J0RGlyZWN0aXZlIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgaWYgKHRoaXMudW5Tb3J0RGlyZWN0aXZlc1tpXS5kaXJlY3RpdmUgPT09ICdzamYtZm9yJykge1xuICAgICAgICAgIGxldCBzamZBcnIgPSBPYmplY3QuYXNzaWduKFtdLCB0aGlzLnVuU29ydERpcmVjdGl2ZXMpXG4gICAgICAgICAgbGV0IGJlZm9yZUZvckRpcmVjdGl2ZXMgPSB1dGlsLnNlYXJjaENoaWxkKHNqZkFyci5zcGxpY2UoaSArIDEpLCB0aGlzLnVuU29ydERpcmVjdGl2ZXNbaV0ubm9kZS5jaGVjaylcbiAgICAgICAgICB0aGlzLnVuU29ydERpcmVjdGl2ZXNbaV1bJ2JlZm9yZURpcmVjdGl2ZXMnXSA9IGJlZm9yZUZvckRpcmVjdGl2ZXNcbiAgICAgICAgICB0aGlzLnVuU29ydERpcmVjdGl2ZXMuc3BsaWNlKGkgKyAxLCBiZWZvcmVGb3JEaXJlY3RpdmVzLmxlbmd0aClcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnVuU29ydERpcmVjdGl2ZXMubWFwKHZhbHVlID0+IHtcbiAgICAgICAgbGlua1JlbmRlclt2YWx1ZS5kaXJlY3RpdmVdLmJpbmQodGhpcy5zamYpKHZhbHVlKVxuICAgICAgfSlcbiAgICB9XG4gICAgLy8gdGhpcy5iaW5kRXZlbnQoKVxuICB9XG5cbiAgLy8g57uR5a6a5LqL5Lu2XG4gIGJpbmRFdmVudCAoKSB7XG4gICAgbGV0IGV2ZW50UXVlbmUgPSB0aGlzLnVuQmluZEV2ZW50c1xuICAgIGlmIChldmVudFF1ZW5lLmxlbmd0aCkge1xuICAgICAgZXZlbnRRdWVuZS5tYXAodmFsID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ3ZhbCcsIHZhbClcbiAgICAgICAgdmFsLnRhcmdldC5jaGVjay5yZW1vdmVBdHRyaWJ1dGUodmFsLm5hbWUpXG4gICAgICAgIGxldCBldmVudFR5cGUgPSB1dGlsLnJlbW92ZVByZWZpeCh2YWwubmFtZSlcbiAgICAgICAgY29uc29sZS5sb2codmFsLmZ1bmMpXG4gICAgICAgIGxldCBldmVudEZ1bmMgPSB0aGlzLnNqZlsnXycgKyB1dGlsLnJlbW92ZUJyYWNrZXRzKHZhbC5mdW5jKV1cbiAgICAgICAgY29uc29sZS5sb2coZXZlbnRGdW5jLmFyZ3VtZW50cylcbiAgICAgICAgaWYgKGV2ZW50RnVuYykge1xuICAgICAgICAgIHZhbC50YXJnZXQuY2hlY2suYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGV2ZW50RnVuYywgZmFsc2UpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignc2pmW2Vycm9yXTogdGhlICcgKyB2YWwuZnVuYyArICcgaXMgbm90IGRlY2xhcmVkJylcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgcmVuZGVyXG4iLCJpbXBvcnQgY29tcGlsZSBmcm9tICcuL2NvbXBpbGUnXG5cbmNsYXNzIFNqZkRhdGFCaW5kIHtcbiAgY29uc3RydWN0b3IgKHBhcmFtKSB7XG4gICAgaWYgKCFwYXJhbS5oYXNPd25Qcm9wZXJ0eSgnZWwnKSB8fCAhcGFyYW0uaGFzT3duUHJvcGVydHkoJ2RhdGEnKSkge1xuICAgICAgY29uc29sZS5lcnJvcignc2pmW2Vycm9yXTogVGhlcmUgaXMgbmVlZCBgZGF0YWAgYW5kIGBlbGAgYXR0cmlidXRlJylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLl9lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocGFyYW0uZWwpXG4gICAgdGhpcy5fZGF0YSA9IHBhcmFtLmRhdGFcbiAgICB0aGlzLl93YXRjaGVycyA9IFtdXG4gICAgdGhpcy5fdW5jb21waWxlTm9kZXMgPSBbXVxuICAgIHRoaXMuX3VubGlua05vZGVzID0gW11cbiAgICB0aGlzLl91bnJlbmRlck5vZGVzID0gW11cbiAgICBmb3IgKGxldCBtZXRob2QgaW4gcGFyYW0ubWV0aG9kcykge1xuICAgICAgLy8g5by65Yi25bCG5a6a5LmJ5ZyobWV0aG9kc+S4iueahOaWueazleebtOaOpee7keWumuWcqFNqZkRhdGFCaW5k5LiK77yM5bm25L+u5pS56L+Z5Lqb5pa55rOV55qEdGhpc+aMh+WQkeS4ulNqZkRhdGFCaW5kXG4gICAgICBpZiAocGFyYW0ubWV0aG9kcy5oYXNPd25Qcm9wZXJ0eShtZXRob2QpKSB7XG4gICAgICAgIHRoaXNbJ18nICsgbWV0aG9kXSA9IHBhcmFtLm1ldGhvZHNbbWV0aG9kXS5iaW5kKHRoaXMpXG4gICAgICB9XG4gICAgfVxuICAgIG5ldyBjb21waWxlKHRoaXMuX2VsLCB0aGlzKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNqZkRhdGFCaW5kXG4iLCJpbXBvcnQgb3B0aW9uIGZyb20gJy4vb3B0aW9uJ1xuXG5jb25zdCB1dGlsID0ge1xuICAvLyBqdWRnZSB0aGUgdHlwZSBvZiBvYmpcbiAganVkZ2VUeXBlIChvYmopIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iailcbiAgfSxcbiAgLy8gcmVtb3ZlIHRoZSBwcmVmaXggb2Ygc2pmLVxuICByZW1vdmVQcmVmaXggKHN0cikge1xuICAgIHJldHVybiBzdHIgPSBzdHIucmVwbGFjZSgvc2pmLS8sICcnKVxuICB9LFxuICAvLyByZW1vdmUgdGhlIGJyYWNrZXRzICgpXG4gIHJlbW92ZUJyYWNrZXRzIChzdHIpIHtcbiAgICBzdHIgPSBzdHIucmVwbGFjZSgvXFxcIi9nLCAnJylcbiAgICByZXR1cm4gc3RyID0gc3RyLnJlcGxhY2UoL1xcKFxcKS8sICcnKVxuICB9LFxuICBzb3J0RXhleHV0ZVF1ZXVlIChwcm9wZXJ0eSwgb2JqQXJyKSB7XG4gICAgcmV0dXJuIG9iakFyci5zb3J0KChvYmoxLCBvYmoyKSA9PiB7XG4gICAgICBsZXQgdmFsMSA9IG9wdGlvbi5wcmlvcml0eVtvYmoxW3Byb3BlcnR5XV1cbiAgICAgIGxldCB2YWwyID0gb3B0aW9uLnByaW9yaXR5W29iajJbcHJvcGVydHldXVxuICAgICAgcmV0dXJuIHZhbDIgLSB2YWwxXG4gICAgfSlcbiAgfSxcbiAgaXNBcnJheSAoYXJyKSB7XG4gICAgcmV0dXJuIHV0aWwuanVkZ2VUeXBlKGFycikgPT09ICdbb2JqZWN0IEFycmF5XSdcbiAgfSxcbiAgaXNTdGFpY3RPYmplY3QgKG9iaikge1xuICAgIHJldHVybiB1dGlsLmp1ZGdlVHlwZShvYmopID09PSAnW29iamVjdCBPYmplY3RdJ1xuICB9LFxuICBkZWVwQ29weSAoc291cmNlLCBkZXN0KSB7XG4gICAgaWYgKCF1dGlsLmlzQXJyYXkoc291cmNlKSAmJiAhdXRpbC5pc1N0YWljdE9iamVjdChzb3VyY2UpKSB7XG4gICAgICB0aHJvdyAndGhlIHNvdXJjZSB5b3Ugc3VwcG9ydCBjYW4gbm90IGJlIGNvcGllZCdcbiAgICB9XG5cbiAgICB2YXIgY29weVNvdXJjZSA9IHV0aWwuaXNBcnJheShzb3VyY2UpID8gW10gOiB7fVxuICAgIGZvciAodmFyIHByb3AgaW4gc291cmNlKSB7XG4gICAgICBpZiAoc291cmNlLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgIGlmICh1dGlsLmlzQXJyYXkoc291cmNlW3Byb3BdKSB8fCB1dGlsLmlzU3RhaWN0T2JqZWN0KHNvdXJjZVtwcm9wXSkpIHtcbiAgICAgICAgICBjb3B5U291cmNlW3Byb3BdID0gdXRpbC5kZWVwQ29weShzb3VyY2VbcHJvcF0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29weVNvdXJjZVtwcm9wXSA9IHNvdXJjZVtwcm9wXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvcHlTb3VyY2VcbiAgfSxcbiAgc2VhcmNoQ2hpbGQgKGFyciwgcGFyZW50KSB7XG4gICAgaWYgKHV0aWwuaXNBcnJheShhcnIpKSB7XG4gICAgICBhcnIubWFwKHZhbHVlID0+IHtcbiAgICAgICAgcmV0dXJuIHBhcmVudC5jb250YWlucyh2YWx1ZS5ub2RlLmNoZWNrKVxuICAgICAgfSlcblxuICAgICAgcmV0dXJuIGFyclxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdzamZbZXJyb3JdOiB0aGUgYXJyIGluIHNlYXJjaENoaWxkICcgKyBhcnIgKyAnIGlzIG5vdCBBcnJheScpXG4gICAgICByZXR1cm5cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgdXRpbFxuIl19
var _r=_m(5);_g.Sjf=_g.SjfDataBind=_r;return _r;})})(typeof window!=='undefined'?window:(typeof global!=='undefined'?global:(typeof self!=='undefined'?self:this)));