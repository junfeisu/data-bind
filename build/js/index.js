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

    // traverseElement (parent, lastNode, isFirst) {
    //   if (isFirst) {
    //     if (!parent.children.length) {
    //       this.compileNode()
    //       return
    //     }
    //   } else {
    //     parent.removeChild(lastNode)
    //     if (parent === this.sjf._el) {
    //       if (!parent.children.length) {
    //         return
    //       }
    //     }
    //   }

    //   let child = parent.children
    //   let childLen = child.length
    //   if (childLen) {
    //     for (var i = childLen - 1; i >= 0; i--) {
    //       let node = child[i]
    //       if (!node) {
    //         if (parent === this.sjf._el && i === 0) {
    //           return
    //         } else {
    //           this.compileNode()
    //           return
    //         }
    //       }
    //       if (node.children.length) {
    //         var searchNode = this.searchLoneChild(node)[0]
    //         this.sjf._uncompileNodes.push({
    //           check: searchNode, 
    //           search: searchNode, 
    //           parent: searchNode.parentNode
    //         })
    //         this.searchNode = []
    //         this.traverseElement(searchNode.parentNode, searchNode, false)
    //       } else {
    //         this.sjf._uncompileNodes.push({
    //           check: node, 
    //           search: node, 
    //           parent: node.parentNode
    //         })
    //         this.traverseElement(node.parentNode, node, false)
    //       }
    //     }
    //   } else {
    //     this.sjf._uncompileNodes.push({
    //       check: parent, 
    //       search: parent, 
    //       parent: parent.parentNode
    //     })
    //     this.traverseElement(parent.parentNode, parent, false)
    //   }
    // }

    // searchLoneChild (node) {
    //   let childLen = node.children.length
    //   if (childLen) {
    //     for (var i = 0; i < childLen; i++) {
    //       if (node.children[i].children.length) {
    //         this.searchLoneChild(node.children[i])
    //       }
    //     }
    //     this.searchNode.push(node.children[childLen - 1])
    //   }
    //   return this.searchNode
    // }

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
        console.log(directives);
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
    // 将表达式通过空格(不限空格数目)给切开
    var loopObjectName = value.expression.split(/\s+/)[2];
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
    for (var i = 0; i < len - 1; i++) {
      var clonedNode = value.node.check.cloneNode(true);
      value.node.parent.insertBefore(clonedNode, value.node.check);
    }

    if (toLoopObject && isArray) {
      this._watchers.push(toLoopObject);
    }
  },
  'sjf-text': function sjfText(value) {
    // value.node.check = this._data[value.expression]
  }
};

var searchParent = function searchParent(root, node) {
  root = root || document;
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
      if (this.unSortDirectives.length) {
        this.unSortDirectives.map(function (value) {
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
        eventQuene.map(function (val) {
          val.target.check.removeAttribute(val.name);
          var eventType = _utils2.default.removePrefix(val.name);
          console.log(val.func);
          var eventFunc = _this3.sjf['_' + _utils2.default.removeBrackets(val.func)];
          if (eventFunc) {
            val.target.check.addEventListener(eventType, eventFunc, false);
          } else {
            console.error('sjf[error]: the ' + val.func + ' is not declared');
          }
        });
      }
    }
  }, {
    key: 'searchParent',
    value: function searchParent() {}
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2UvamF2YXNjcmlwdC9jb21waWxlLmpzIiwic291cmNlL2phdmFzY3JpcHQvbGluay5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L29wdGlvbi5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3JlbmRlci5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3NqZkRhdGFCaW5kLmpzIiwic291cmNlL2phdmFzY3JpcHQvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FDOzs7O0FBQ0E7Ozs7Ozs7O0lBRU0sTztBQUNMO0FBQ0EsbUJBQWEsTUFBYixFQUFxQixHQUFyQixFQUEwQjtBQUFBOztBQUN4QixTQUFLLEdBQUwsR0FBVyxHQUFYO0FBQ0EsU0FBSyxVQUFMLEdBQWtCLEVBQWxCO0FBQ0EsU0FBSyxXQUFMLEdBQW1CLEtBQUssR0FBTCxDQUFTLEdBQVQsQ0FBYSxTQUFoQztBQUNBO0FBQ0EsU0FBSyxhQUFMLENBQW1CLEtBQUssR0FBTCxDQUFTLEdBQTVCLEVBQWlDLElBQWpDO0FBQ0Q7Ozs7a0NBRWMsTSxFQUFRLE8sRUFBUztBQUFBOztBQUM5QixVQUFJLFFBQVEsTUFBTSxJQUFOLENBQVcsT0FBTyxRQUFsQixDQUFaO0FBQ0E7QUFDQSxVQUFJLFdBQVcsQ0FBQyxNQUFNLE1BQXRCLEVBQThCO0FBQzVCLGFBQUssV0FBTDtBQUNBO0FBQ0Q7QUFDRCxZQUFNLE9BQU47QUFDQSxZQUFNLEdBQU4sQ0FBVSxnQkFBUTtBQUNoQixZQUFJLENBQUMsQ0FBQyxLQUFLLFFBQUwsQ0FBYyxNQUFwQixFQUE0QjtBQUMxQixnQkFBSyxhQUFMLENBQW1CLElBQW5CLEVBQXlCLEtBQXpCO0FBQ0EsZ0JBQUssR0FBTCxDQUFTLGVBQVQsQ0FBeUIsSUFBekIsQ0FBOEI7QUFDNUIsbUJBQU8sSUFEcUI7QUFFNUIsb0JBQVEsS0FBSyxVQUZlO0FBRzVCLHNCQUFVO0FBSGtC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LENBQVA7QUFLRCxHQXBCVTtBQXFCWCxTQXJCVyxtQkFxQkYsR0FyQkUsRUFxQkc7QUFDWixXQUFPLEtBQUssU0FBTCxDQUFlLEdBQWYsTUFBd0IsZ0JBQS9CO0FBQ0QsR0F2QlU7QUF3QlgsZ0JBeEJXLDBCQXdCSyxHQXhCTCxFQXdCVTtBQUNuQixXQUFPLEtBQUssU0FBTCxDQUFlLEdBQWYsTUFBd0IsaUJBQS9CO0FBQ0QsR0ExQlU7QUEyQlgsVUEzQlcsb0JBMkJELE1BM0JDLEVBMkJPLElBM0JQLEVBMkJhO0FBQ3RCLFFBQUksQ0FBQyxLQUFLLE9BQUwsQ0FBYSxNQUFiLENBQUQsSUFBeUIsQ0FBQyxLQUFLLGNBQUwsQ0FBb0IsTUFBcEIsQ0FBOUIsRUFBMkQ7QUFDekQsWUFBTSwwQ0FBTjtBQUNEOztBQUVELFFBQUksYUFBYSxLQUFLLE9BQUwsQ0FBYSxNQUFiLElBQXVCLEVBQXZCLEdBQTRCLEVBQTdDO0FBQ0EsU0FBSyxJQUFJLElBQVQsSUFBaUIsTUFBakIsRUFBeUI7QUFDdkIsVUFBSSxPQUFPLGNBQVAsQ0FBc0IsSUFBdEIsQ0FBSixFQUFpQztBQUMvQixZQUFJLEtBQUssT0FBTCxDQUFhLE9BQU8sSUFBUCxDQUFiLEtBQThCLEtBQUssY0FBTCxDQUFvQixPQUFPLElBQVAsQ0FBcEIsQ0FBbEMsRUFBcUU7QUFDbkUscUJBQVcsSUFBWCxJQUFtQixLQUFLLFFBQUwsQ0FBYyxPQUFPLElBQVAsQ0FBZCxDQUFuQjtBQUNELFNBRkQsTUFFTztBQUNMLHFCQUFXLElBQVgsSUFBbUIsT0FBTyxJQUFQLENBQW5CO0FBQ0Q7QUFDRjtBQUNGOztBQUVELFdBQU8sVUFBUDtBQUNEO0FBNUNVLENBQWI7O2tCQStDZSxJIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiBpbXBvcnQgbGluayBmcm9tICcuL2xpbmsnXG4gaW1wb3J0IHV0aWwgZnJvbSAnLi91dGlscydcblxuIGNsYXNzIGNvbXBpbGUge1xuICAvLyDpgJLlvZJET03moJFcbiAgY29uc3RydWN0b3IgKHBhcmVudCwgc2pmKSB7XG4gICAgdGhpcy5zamYgPSBzamZcbiAgICB0aGlzLnNlYXJjaE5vZGUgPSBbXVxuICAgIHRoaXMucm9vdENvbnRlbnQgPSB0aGlzLnNqZi5fZWwuaW5uZXJIVE1MXG4gICAgLy8gdGhpcy50cmF2ZXJzZUVsZW1lbnQocGFyZW50LCBudWxsLCB0cnVlKVxuICAgIHRoaXMuY2lyY2xlRWxlbWVudCh0aGlzLnNqZi5fZWwsIHRydWUpXG4gIH1cblxuICBjaXJjbGVFbGVtZW50IChwYXJlbnQsIGlzRmlyc3QpIHtcbiAgICBsZXQgY2hpbGQgPSBBcnJheS5mcm9tKHBhcmVudC5jaGlsZHJlbilcbiAgICAvLyDlpoLmnpzmmK/nrKzkuIDmrKHpgY3ljoblubbkuJTmsqHmnInlrZDoioLngrnlsLHnm7TmjqXot7Pov4djb21waWxlXG4gICAgaWYgKGlzRmlyc3QgJiYgIWNoaWxkLmxlbmd0aCkge1xuICAgICAgdGhpcy5jb21waWxlTm9kZSgpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY2hpbGQucmV2ZXJzZSgpXG4gICAgY2hpbGQubWFwKG5vZGUgPT4ge1xuICAgICAgaWYgKCEhbm9kZS5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5jaXJjbGVFbGVtZW50KG5vZGUsIGZhbHNlKVxuICAgICAgICB0aGlzLnNqZi5fdW5jb21waWxlTm9kZXMucHVzaCh7XG4gICAgICAgICAgY2hlY2s6IG5vZGUsXG4gICAgICAgICAgcGFyZW50OiBub2RlLnBhcmVudE5vZGUsXG4gICAgICAgICAgbm9kZVR5cGU6ICdlbGVtZW50Tm9kZSdcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2pmLl91bmNvbXBpbGVOb2Rlcy5wdXNoKHtcbiAgICAgICAgICBjaGVjazogbm9kZSwgXG4gICAgICAgICAgcGFyZW50OiBub2RlLnBhcmVudE5vZGUsXG4gICAgICAgICAgbm9kZVR5cGU6ICdlbGVtZW50Tm9kZSdcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgaWYgKHRoaXMuc2pmLl9lbC5sYXN0RWxlbWVudENoaWxkID09PSBjaGlsZFswXSkge1xuICAgICAgdGhpcy5jb21waWxlTm9kZSgpXG4gICAgfVxuICB9XG5cbiAgLy8gdHJhdmVyc2VFbGVtZW50IChwYXJlbnQsIGxhc3ROb2RlLCBpc0ZpcnN0KSB7XG4gIC8vICAgaWYgKGlzRmlyc3QpIHtcbiAgLy8gICAgIGlmICghcGFyZW50LmNoaWxkcmVuLmxlbmd0aCkge1xuICAvLyAgICAgICB0aGlzLmNvbXBpbGVOb2RlKClcbiAgLy8gICAgICAgcmV0dXJuXG4gIC8vICAgICB9XG4gIC8vICAgfSBlbHNlIHtcbiAgLy8gICAgIHBhcmVudC5yZW1vdmVDaGlsZChsYXN0Tm9kZSlcbiAgLy8gICAgIGlmIChwYXJlbnQgPT09IHRoaXMuc2pmLl9lbCkge1xuICAvLyAgICAgICBpZiAoIXBhcmVudC5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgLy8gICAgICAgICByZXR1cm5cbiAgLy8gICAgICAgfVxuICAvLyAgICAgfVxuICAvLyAgIH1cblxuICAvLyAgIGxldCBjaGlsZCA9IHBhcmVudC5jaGlsZHJlblxuICAvLyAgIGxldCBjaGlsZExlbiA9IGNoaWxkLmxlbmd0aFxuICAvLyAgIGlmIChjaGlsZExlbikge1xuICAvLyAgICAgZm9yICh2YXIgaSA9IGNoaWxkTGVuIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgLy8gICAgICAgbGV0IG5vZGUgPSBjaGlsZFtpXVxuICAvLyAgICAgICBpZiAoIW5vZGUpIHtcbiAgLy8gICAgICAgICBpZiAocGFyZW50ID09PSB0aGlzLnNqZi5fZWwgJiYgaSA9PT0gMCkge1xuICAvLyAgICAgICAgICAgcmV0dXJuXG4gIC8vICAgICAgICAgfSBlbHNlIHtcbiAgLy8gICAgICAgICAgIHRoaXMuY29tcGlsZU5vZGUoKVxuICAvLyAgICAgICAgICAgcmV0dXJuXG4gIC8vICAgICAgICAgfVxuICAvLyAgICAgICB9XG4gIC8vICAgICAgIGlmIChub2RlLmNoaWxkcmVuLmxlbmd0aCkge1xuICAvLyAgICAgICAgIHZhciBzZWFyY2hOb2RlID0gdGhpcy5zZWFyY2hMb25lQ2hpbGQobm9kZSlbMF1cbiAgLy8gICAgICAgICB0aGlzLnNqZi5fdW5jb21waWxlTm9kZXMucHVzaCh7XG4gIC8vICAgICAgICAgICBjaGVjazogc2VhcmNoTm9kZSwgXG4gIC8vICAgICAgICAgICBzZWFyY2g6IHNlYXJjaE5vZGUsIFxuICAvLyAgICAgICAgICAgcGFyZW50OiBzZWFyY2hOb2RlLnBhcmVudE5vZGVcbiAgLy8gICAgICAgICB9KVxuICAvLyAgICAgICAgIHRoaXMuc2VhcmNoTm9kZSA9IFtdXG4gIC8vICAgICAgICAgdGhpcy50cmF2ZXJzZUVsZW1lbnQoc2VhcmNoTm9kZS5wYXJlbnROb2RlLCBzZWFyY2hOb2RlLCBmYWxzZSlcbiAgLy8gICAgICAgfSBlbHNlIHtcbiAgLy8gICAgICAgICB0aGlzLnNqZi5fdW5jb21waWxlTm9kZXMucHVzaCh7XG4gIC8vICAgICAgICAgICBjaGVjazogbm9kZSwgXG4gIC8vICAgICAgICAgICBzZWFyY2g6IG5vZGUsIFxuICAvLyAgICAgICAgICAgcGFyZW50OiBub2RlLnBhcmVudE5vZGVcbiAgLy8gICAgICAgICB9KVxuICAvLyAgICAgICAgIHRoaXMudHJhdmVyc2VFbGVtZW50KG5vZGUucGFyZW50Tm9kZSwgbm9kZSwgZmFsc2UpXG4gIC8vICAgICAgIH1cbiAgLy8gICAgIH1cbiAgLy8gICB9IGVsc2Uge1xuICAvLyAgICAgdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzLnB1c2goe1xuICAvLyAgICAgICBjaGVjazogcGFyZW50LCBcbiAgLy8gICAgICAgc2VhcmNoOiBwYXJlbnQsIFxuICAvLyAgICAgICBwYXJlbnQ6IHBhcmVudC5wYXJlbnROb2RlXG4gIC8vICAgICB9KVxuICAvLyAgICAgdGhpcy50cmF2ZXJzZUVsZW1lbnQocGFyZW50LnBhcmVudE5vZGUsIHBhcmVudCwgZmFsc2UpXG4gIC8vICAgfVxuICAvLyB9XG5cbiAgLy8gc2VhcmNoTG9uZUNoaWxkIChub2RlKSB7XG4gIC8vICAgbGV0IGNoaWxkTGVuID0gbm9kZS5jaGlsZHJlbi5sZW5ndGhcbiAgLy8gICBpZiAoY2hpbGRMZW4pIHtcbiAgLy8gICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRMZW47IGkrKykge1xuICAvLyAgICAgICBpZiAobm9kZS5jaGlsZHJlbltpXS5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgLy8gICAgICAgICB0aGlzLnNlYXJjaExvbmVDaGlsZChub2RlLmNoaWxkcmVuW2ldKVxuICAvLyAgICAgICB9XG4gIC8vICAgICB9XG4gIC8vICAgICB0aGlzLnNlYXJjaE5vZGUucHVzaChub2RlLmNoaWxkcmVuW2NoaWxkTGVuIC0gMV0pXG4gIC8vICAgfVxuICAvLyAgIHJldHVybiB0aGlzLnNlYXJjaE5vZGVcbiAgLy8gfVxuXG4gIGNvbXBpbGVOb2RlICgpIHtcbiAgICBsZXQgaGFzVW5jb21waWxlID0gdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzLmxlbmd0aFxuICAgIHRoaXMuc2pmLl91bmNvbXBpbGVOb2Rlcy5yZXZlcnNlKClcbiAgICBpZiAoaGFzVW5jb21waWxlKSB7XG4gICAgICB0aGlzLnNqZi5fdW5jb21waWxlTm9kZXMubWFwKHZhbHVlID0+IHtcbiAgICAgICAgdGhpcy5oYXNEaXJlY3RpdmUodmFsdWUpXG4gICAgICB9KVxuICAgIH1cbiAgICB0aGlzLnNqZi5fdW5jb21waWxlTm9kZXMgPSBbXVxuICAgIG5ldyBsaW5rKHRoaXMuc2pmKVxuICB9XG5cbiAgLy8g5qOA5rWL5q+P5Liqbm9kZeeci+aYr+WQpue7keWumuacieaMh+S7pFxuICBoYXNEaXJlY3RpdmUgKHZhbHVlKSB7XG4gICAgbGV0IGNoZWNrUmVnID0gL3NqZi0uKz1cXFwiLitcXFwifFxce1xcey4rXFx9XFx9L1xuICAgIGlmIChjaGVja1JlZy50ZXN0KHZhbHVlLmNoZWNrLmNsb25lTm9kZSgpLm91dGVySFRNTCkpIHtcbiAgICAgIHRoaXMuc2pmLl91bmxpbmtOb2Rlcy5wdXNoKHZhbHVlKVxuICAgIH1cbiAgICBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwodmFsdWUuY2hlY2suY2hpbGROb2Rlcywgbm9kZSA9PiB7XG4gICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMykge1xuICAgICAgICBpZiAoY2hlY2tSZWcudGVzdChub2RlLmRhdGEpKSB7XG4gICAgICAgICAgdGhpcy5zamYuX3VubGlua05vZGVzLnB1c2goe1xuICAgICAgICAgICAgY2hlY2s6IG5vZGUsIFxuICAgICAgICAgICAgcGFyZW50OiB2YWx1ZS5jaGVjaywgXG4gICAgICAgICAgICBub2RlVHlwZTogJ3RleHROb2RlJ1xuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvbXBpbGVcbiIsImltcG9ydCBvcHRpb24gZnJvbSAnLi9vcHRpb24nXG5pbXBvcnQgcmVuZGVyIGZyb20gJy4vcmVuZGVyJ1xuaW1wb3J0IHV0aWwgZnJvbSAnLi91dGlscydcblxuY2xhc3MgbGluayB7XG4gIGNvbnN0cnVjdG9yIChzamYpIHtcbiAgICB0aGlzLnNqZiA9IHNqZlxuICAgIGxldCBoYXNVbmxpbmtOb2RlID0gdGhpcy5zamYuX3VubGlua05vZGVzLmxlbmd0aFxuICAgIGlmIChoYXNVbmxpbmtOb2RlKSB7XG4gICAgICBsZXQgZXh0cmFjdFJlZyA9IC9zamYtW2Etel0rPVxcXCJbXlwiXStcXFwifFxce1xcey4rXFx9XFx9L2dcbiAgICAgIHRoaXMuc2pmLl91bmxpbmtOb2Rlcy5tYXAodmFsdWUgPT4ge1xuICAgICAgICBsZXQgZGlyZWN0aXZlcyA9IFtdXG4gICAgICAgIGlmICh2YWx1ZS5ub2RlVHlwZSA9PT0gJ3RleHROb2RlJykge1xuICAgICAgICAgIGRpcmVjdGl2ZXMgPSB2YWx1ZS5jaGVjay5kYXRhLm1hdGNoKGV4dHJhY3RSZWcpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGlyZWN0aXZlcyA9IHZhbHVlLmNoZWNrLmNsb25lTm9kZSgpLm91dGVySFRNTC5tYXRjaChleHRyYWN0UmVnKVxuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGRpcmVjdGl2ZXMpXG4gICAgICAgIGlmIChkaXJlY3RpdmVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICBsZXQgd2l0aE5hbWVEaXJlY3RpdmVzID0gZGlyZWN0aXZlcy5tYXAoZGlyZWN0aXZlID0+IHRoaXMuYWRkRGlyZWN0aXZlTmFtZShkaXJlY3RpdmUpKVxuICAgICAgICAgIHdpdGhOYW1lRGlyZWN0aXZlcyA9IHV0aWwuc29ydEV4ZXh1dGVRdWV1ZSgnbmFtZScsIHdpdGhOYW1lRGlyZWN0aXZlcylcbiAgICAgICAgICB3aXRoTmFtZURpcmVjdGl2ZXMubWFwKGRpcmVjdGl2ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLmV4dHJhY3REaXJlY3RpdmUoZGlyZWN0aXZlLnZhbHVlLCB2YWx1ZSlcbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRpcmVjdGl2ZXMubWFwKGRpcmVjdGl2ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLmV4dHJhY3REaXJlY3RpdmUoZGlyZWN0aXZlLCB2YWx1ZSlcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgdGhpcy5fdW5saW5rTm9kZXMgPSBbXVxuICAgICAgbmV3IHJlbmRlcih0aGlzLnNqZilcbiAgICB9XG4gIH1cblxuICBhZGREaXJlY3RpdmVOYW1lIChkaXJlY3RpdmUpIHtcbiAgICBsZXQgc2xpY2VzID0gZGlyZWN0aXZlLnNwbGl0KCc9JylcbiAgICBpZiAoc2xpY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZTogJ3NqZi10ZXh0JyxcbiAgICAgICAgdmFsdWU6IGRpcmVjdGl2ZVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOiBzbGljZXNbMF0sXG4gICAgICAgIHZhbHVlOiBkaXJlY3RpdmVcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyDmj5Dlj5bmjIfku6RcbiAgZXh0cmFjdERpcmVjdGl2ZSAoZGlyZWN0aXZlLCBub2RlKSB7XG4gICAgbGV0IHNsaWNlcyA9IGRpcmVjdGl2ZS5zcGxpdCgnPScpXG4gICAgLy8g5aaC5p6c5piv5LqL5Lu25bCx55u05o6l6YCa6L+HYWRkRXZlbnRMaXN0ZW5lcui/m+ihjOe7keWumlxuICAgIGlmIChvcHRpb24uc2pmRXZlbnRzLmluZGV4T2Yoc2xpY2VzWzBdKSA+PSAwKSB7XG4gICAgICBsZXQgZXZlbnRNZXMgPSB7XG4gICAgICAgIHR5cGU6ICdldmVudCcsXG4gICAgICAgIHRhcmdldDogbm9kZSxcbiAgICAgICAgbmFtZTogc2xpY2VzWzBdLFxuICAgICAgICBmdW5jOiBzbGljZXNbMV1cbiAgICAgIH1cbiAgICAgIHRoaXMuc2pmLl91bnJlbmRlck5vZGVzLnB1c2goZXZlbnRNZXMpXG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBleHByZXNzaW9uID0gc2xpY2VzWzBdLnJlcGxhY2UoL1tcXHtcXH1dL2csICcnKVxuICAgICAgbGV0IGRpcmVjdGl2ZU5hbWUgPSAnc2pmLXRleHQnXG4gICAgICAvLyDlr7npnZ57e3196L+Z56eN6KGo6L6+5byP6L+b6KGM5Y2V54us5aSE55CGXG4gICAgICBpZiAoIS9cXHtcXHsuK1xcfVxcfS8udGVzdChkaXJlY3RpdmUpKSB7XG4gICAgICAgIGV4cHJlc3Npb24gPSBzbGljZXNbMV0ucmVwbGFjZSgvXFxcIi9nLCAnJylcbiAgICAgICAgZGlyZWN0aXZlTmFtZSA9IHNsaWNlc1swXVxuICAgICAgfVxuICAgICAgdGhpcy5zamYuX3VucmVuZGVyTm9kZXMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdkaXJlY3RpdmUnLFxuICAgICAgICBub2RlOiBub2RlLCBcbiAgICAgICAgZGlyZWN0aXZlOiBkaXJlY3RpdmVOYW1lLCBcbiAgICAgICAgZXhwcmVzc2lvbjogZXhwcmVzc2lvblxuICAgICAgfSlcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbGlua1xuIiwiY29uc3Qgb3B0aW9uID0ge1xuICBwcmlvcml0eToge1xuICAgICdzamYtaWYnOiAyMDAwLFxuICAgICdzamYtc2hvdyc6IDIwMDAsXG4gICAgJ3NqZi1mb3InOiAxMDAwLFxuICAgICdzamYtbW9kZWwnOiAxMCxcbiAgICAnc2pmLXRleHQnOiAxLFxuICAgICdzamYtY2xpY2snOiAwLFxuICAgICdzamYtbW91c2VvdmVyJzogMCxcbiAgICAnc2pmLW1vdXNlb3V0JzogMCxcbiAgICAnc2pmLW1vdXNlbW92ZSc6IDAsXG4gICAgJ3NqZi1tb3VzZWVudGVyJzogMCxcbiAgICAnc2pmLW1vdXNlbGVhdmUnOiAwLFxuICAgICdzamYtbW91c2Vkb3duJzogMCxcbiAgICAnc2pmLW1vdXNldXAnOiAwXG4gIH0sXG4gIHNqZkV2ZW50czogW1xuICAgICdzamYtY2xpY2snLCBcbiAgICAnc2pmLW1vdXNlb3ZlcicsIFxuICAgICdzamYtbW91c2VvdXQnLCBcbiAgICAnc2pmLW1vdXNlbW92ZScsIFxuICAgICdzamYtbW91c2VlbnRlcicsXG4gICAgJ3NqZi1tb3VzZWxlYXZlJyxcbiAgICAnc2pmLW1vdXNlZG93bicsXG4gICAgJ3NqZi1tb3VzZXVwJ1xuICBdXG59XG5cbmV4cG9ydCBkZWZhdWx0IG9wdGlvblxuIiwiaW1wb3J0IHV0aWwgZnJvbSAnLi91dGlscydcblxuY29uc3QgbGlua1JlbmRlciA9IHtcbiAgJ3NqZi1pZic6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhbHVlLm5vZGUuc3R5bGUuZGlzcGxheSA9ICghISh2YWx1ZS5leHByZXNzaW9uKSA/ICdibG9jayFpbXBvcnRhbnQnIDogJ25vbmUhaW1wb3J0YW50JylcbiAgfSxcbiAgJ3NqZi1zaG93JzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFsdWUubm9kZS5zdHlsZS5kaXNwbGF5ID0gKCEhKHZhbHVlLmV4cHJlc3Npb24pID8gJ2Jsb2NrIWltcG9ydGFudCcgOiAnbm9uZSFpbXBvcnRhbnQnKVxuICB9LFxuICAnc2pmLWZvcic6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIC8vIOWwhuihqOi+vuW8j+mAmui/h+epuuagvCjkuI3pmZDnqbrmoLzmlbDnm64p57uZ5YiH5byAXG4gICAgbGV0IGxvb3BPYmplY3ROYW1lID0gdmFsdWUuZXhwcmVzc2lvbi5zcGxpdCgvXFxzKy8pWzJdXG4gICAgbGV0IHRvTG9vcE9iamVjdCA9IG51bGxcbiAgICBpZiAodGhpcy5fZGF0YS5oYXNPd25Qcm9wZXJ0eShsb29wT2JqZWN0TmFtZSkpIHtcbiAgICAgIHRvTG9vcE9iamVjdCA9IHRoaXMuX2RhdGFbbG9vcE9iamVjdE5hbWVdXG4gICAgfVxuICAgIC8vIOWIpOaWreW+heW+queOr+eahOaYr+WQpuiDvei/m+ihjOW+queOr1xuICAgIGxldCBpc0xvb3BhYmxlID0gdG9Mb29wT2JqZWN0IGluc3RhbmNlb2YgQXJyYXkgfHwgIWlzTmFOKHRvTG9vcE9iamVjdClcbiAgICBpZiAoIWlzTG9vcGFibGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ3NqZltlcnJvcl06IHRoZSB0b0xvb3BPYmplY3Qgb2Ygc2pmLWZvciBzaG91bGQgYmUgYSBudW1iZXIgb3IgYW4gQXJyYXknKVxuICAgICAgcmV0dXJuIFxuICAgIH1cbiAgICAvLyDliKTmlq3mmK/mlbDnu4Tov5jmmK/mlbDlrZfvvIzku47ogIzotYvlgLxsZW5ndGhcbiAgICBsZXQgaXNBcnJheSA9IHV0aWwuaXNBcnJheSh0b0xvb3BPYmplY3QpXG4gICAgbGV0IGxlbiA9IGlzQXJyYXkgPyB0b0xvb3BPYmplY3QubGVuZ3RoIDogdG9Mb29wT2JqZWN0XG4gICAgdmFsdWUubm9kZS5jaGVjay5yZW1vdmVBdHRyaWJ1dGUoJ3NqZi1mb3InKVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuIC0gMTsgaSsrKSB7XG4gICAgICBsZXQgY2xvbmVkTm9kZSA9IHZhbHVlLm5vZGUuY2hlY2suY2xvbmVOb2RlKHRydWUpXG4gICAgICB2YWx1ZS5ub2RlLnBhcmVudC5pbnNlcnRCZWZvcmUoY2xvbmVkTm9kZSwgdmFsdWUubm9kZS5jaGVjaylcbiAgICB9XG5cbiAgICBpZiAodG9Mb29wT2JqZWN0ICYmIGlzQXJyYXkpIHtcbiAgICAgIHRoaXMuX3dhdGNoZXJzLnB1c2godG9Mb29wT2JqZWN0KVxuICAgIH1cbiAgfSxcbiAgJ3NqZi10ZXh0JzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgLy8gdmFsdWUubm9kZS5jaGVjayA9IHRoaXMuX2RhdGFbdmFsdWUuZXhwcmVzc2lvbl1cbiAgfVxufVxuXG5jb25zdCBzZWFyY2hQYXJlbnQgPSAocm9vdCwgbm9kZSkgPT4ge1xuICByb290ID0gcm9vdCB8fCBkb2N1bWVudFxufVxuXG5jbGFzcyByZW5kZXIge1xuICBjb25zdHJ1Y3RvciAoc2pmKSB7XG4gICAgdGhpcy5zamYgPSBzamZcbiAgICB0aGlzLnVuQmluZEV2ZW50cyA9IFtdXG4gICAgdGhpcy51blNvcnREaXJlY3RpdmVzID0gW11cbiAgICBjb25zb2xlLmxvZyh0aGlzLnNqZi5fdW5yZW5kZXJOb2RlcylcbiAgICBsZXQgaGFzUmVuZGVyID0gdGhpcy5zamYuX3VucmVuZGVyTm9kZXMubGVuZ3RoXG4gICAgaWYgKGhhc1JlbmRlcikge1xuICAgICAgdGhpcy5zamYuX3VucmVuZGVyTm9kZXMubWFwKHZhbCA9PiB7XG4gICAgICAgIHZhbC50eXBlID09PSAnZXZlbnQnID8gdGhpcy51bkJpbmRFdmVudHMucHVzaCh2YWwpIDogdGhpcy51blNvcnREaXJlY3RpdmVzLnB1c2godmFsKVxuICAgICAgfSlcbiAgICAgIHRoaXMuc2pmLl91bnJlbmRlck5vZGVzID0gW11cbiAgICB9XG4gICAgdGhpcy5zb3J0RGlyZWN0aXZlKClcbiAgfVxuXG4gIHNvcnREaXJlY3RpdmUgKCkge1xuICAgIGxldCBoYXNVblNvcnREaXJlY3RpdmUgPSB0aGlzLnVuU29ydERpcmVjdGl2ZXMubGVuZ3RoXG4gICAgaWYgKHRoaXMudW5Tb3J0RGlyZWN0aXZlcy5sZW5ndGgpIHtcbiAgICAgIHRoaXMudW5Tb3J0RGlyZWN0aXZlcy5tYXAodmFsdWUgPT4ge1xuICAgICAgICBsaW5rUmVuZGVyW3ZhbHVlLmRpcmVjdGl2ZV0uYmluZCh0aGlzLnNqZikodmFsdWUpXG4gICAgICB9KVxuICAgIH1cbiAgICB0aGlzLmJpbmRFdmVudCgpXG4gIH1cblxuICAvLyDnu5Hlrprkuovku7ZcbiAgYmluZEV2ZW50ICgpIHtcbiAgICBsZXQgZXZlbnRRdWVuZSA9IHRoaXMudW5CaW5kRXZlbnRzXG4gICAgaWYgKGV2ZW50UXVlbmUubGVuZ3RoKSB7XG4gICAgICBldmVudFF1ZW5lLm1hcCh2YWwgPT4ge1xuICAgICAgICB2YWwudGFyZ2V0LmNoZWNrLnJlbW92ZUF0dHJpYnV0ZSh2YWwubmFtZSlcbiAgICAgICAgbGV0IGV2ZW50VHlwZSA9IHV0aWwucmVtb3ZlUHJlZml4KHZhbC5uYW1lKVxuICAgICAgICBjb25zb2xlLmxvZyh2YWwuZnVuYylcbiAgICAgICAgbGV0IGV2ZW50RnVuYyA9IHRoaXMuc2pmWydfJyArIHV0aWwucmVtb3ZlQnJhY2tldHModmFsLmZ1bmMpXVxuICAgICAgICBpZiAoZXZlbnRGdW5jKSB7XG4gICAgICAgICAgdmFsLnRhcmdldC5jaGVjay5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgZXZlbnRGdW5jLCBmYWxzZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdzamZbZXJyb3JdOiB0aGUgJyArIHZhbC5mdW5jICsgJyBpcyBub3QgZGVjbGFyZWQnKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHNlYXJjaFBhcmVudCAoKSB7XG5cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCByZW5kZXJcbiIsImltcG9ydCBjb21waWxlIGZyb20gJy4vY29tcGlsZSdcblxuY2xhc3MgU2pmRGF0YUJpbmQge1xuICBjb25zdHJ1Y3RvciAocGFyYW0pIHtcbiAgICBpZiAoIXBhcmFtLmhhc093blByb3BlcnR5KCdlbCcpIHx8ICFwYXJhbS5oYXNPd25Qcm9wZXJ0eSgnZGF0YScpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdzamZbZXJyb3JdOiBUaGVyZSBpcyBuZWVkIGBkYXRhYCBhbmQgYGVsYCBhdHRyaWJ1dGUnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuX2VsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihwYXJhbS5lbClcbiAgICB0aGlzLl9kYXRhID0gcGFyYW0uZGF0YVxuICAgIHRoaXMuX3dhdGNoZXJzID0gW11cbiAgICB0aGlzLl91bmNvbXBpbGVOb2RlcyA9IFtdXG4gICAgdGhpcy5fdW5saW5rTm9kZXMgPSBbXVxuICAgIHRoaXMuX3VucmVuZGVyTm9kZXMgPSBbXVxuICAgIGZvciAobGV0IG1ldGhvZCBpbiBwYXJhbS5tZXRob2RzKSB7XG4gICAgICAvLyDlvLrliLblsIblrprkuYnlnKhtZXRob2Rz5LiK55qE5pa55rOV55u05o6l57uR5a6a5ZyoU2pmRGF0YUJpbmTkuIrvvIzlubbkv67mlLnov5nkupvmlrnms5XnmoR0aGlz5oyH5ZCR5Li6U2pmRGF0YUJpbmRcbiAgICAgIGlmIChwYXJhbS5tZXRob2RzLmhhc093blByb3BlcnR5KG1ldGhvZCkpIHtcbiAgICAgICAgdGhpc1snXycgKyBtZXRob2RdID0gcGFyYW0ubWV0aG9kc1ttZXRob2RdLmJpbmQodGhpcylcbiAgICAgIH1cbiAgICB9XG4gICAgbmV3IGNvbXBpbGUodGhpcy5fZWwsIHRoaXMpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2pmRGF0YUJpbmRcbiIsImltcG9ydCBvcHRpb24gZnJvbSAnLi9vcHRpb24nXG5cbmNvbnN0IHV0aWwgPSB7XG4gIC8vIGp1ZGdlIHRoZSB0eXBlIG9mIG9ialxuICBqdWRnZVR5cGUgKG9iaikge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKVxuICB9LFxuICAvLyByZW1vdmUgdGhlIHByZWZpeCBvZiBzamYtXG4gIHJlbW92ZVByZWZpeCAoc3RyKSB7XG4gICAgcmV0dXJuIHN0ciA9IHN0ci5yZXBsYWNlKC9zamYtLywgJycpXG4gIH0sXG4gIC8vIHJlbW92ZSB0aGUgYnJhY2tldHMgKClcbiAgcmVtb3ZlQnJhY2tldHMgKHN0cikge1xuICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9cXFwiL2csICcnKVxuICAgIHJldHVybiBzdHIgPSBzdHIucmVwbGFjZSgvXFwoXFwpLywgJycpXG4gIH0sXG4gIHNvcnRFeGV4dXRlUXVldWUgKHByb3BlcnR5LCBvYmpBcnIpIHtcbiAgICByZXR1cm4gb2JqQXJyLnNvcnQoKG9iajEsIG9iajIpID0+IHtcbiAgICAgIGxldCB2YWwxID0gb3B0aW9uLnByaW9yaXR5W29iajFbcHJvcGVydHldXVxuICAgICAgbGV0IHZhbDIgPSBvcHRpb24ucHJpb3JpdHlbb2JqMltwcm9wZXJ0eV1dXG4gICAgICByZXR1cm4gdmFsMiAtIHZhbDFcbiAgICB9KVxuICB9LFxuICBpc0FycmF5IChhcnIpIHtcbiAgICByZXR1cm4gdXRpbC5qdWRnZVR5cGUoYXJyKSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICB9LFxuICBpc1N0YWljdE9iamVjdCAob2JqKSB7XG4gICAgcmV0dXJuIHV0aWwuanVkZ2VUeXBlKG9iaikgPT09ICdbb2JqZWN0IE9iamVjdF0nXG4gIH0sXG4gIGRlZXBDb3B5IChzb3VyY2UsIGRlc3QpIHtcbiAgICBpZiAoIXV0aWwuaXNBcnJheShzb3VyY2UpICYmICF1dGlsLmlzU3RhaWN0T2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHRocm93ICd0aGUgc291cmNlIHlvdSBzdXBwb3J0IGNhbiBub3QgYmUgY29waWVkJ1xuICAgIH1cblxuICAgIHZhciBjb3B5U291cmNlID0gdXRpbC5pc0FycmF5KHNvdXJjZSkgPyBbXSA6IHt9XG4gICAgZm9yICh2YXIgcHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgaWYgKHV0aWwuaXNBcnJheShzb3VyY2VbcHJvcF0pIHx8IHV0aWwuaXNTdGFpY3RPYmplY3Qoc291cmNlW3Byb3BdKSkge1xuICAgICAgICAgIGNvcHlTb3VyY2VbcHJvcF0gPSB1dGlsLmRlZXBDb3B5KHNvdXJjZVtwcm9wXSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb3B5U291cmNlW3Byb3BdID0gc291cmNlW3Byb3BdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY29weVNvdXJjZVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHV0aWxcbiJdfQ==
var _r=_m(5);_g.Sjf=_g.SjfDataBind=_r;return _r;})})(typeof window!=='undefined'?window:(typeof global!=='undefined'?global:(typeof self!=='undefined'?self:this)));