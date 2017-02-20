(function(_g){(function(f){if(typeof exports==='object'&&typeof module!=='undefined'){module.exports=f()}else if(typeof define==='function'&&define.amd){define([],f.bind(_g))}else{f()}})(function(define,module,exports){var _m =(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _link = require('./link');

var _link2 = _interopRequireDefault(_link);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var compile = function () {
  // 递归DOM树
  function compile(parent, isFirst, sjf) {
    _classCallCheck(this, compile);

    this.sjf = sjf;
    var child = parent.children;
    // 如果是第一次遍历并且没有子节点就直接跳过compile
    if (isFirst && !child.length) {
      this.hasDirective(parent);
      new _link2.default(this.sjf);
    }

    for (var i = 0; i < child.length; i++) {
      var node = child[i];
      if (node.children.length) {
        this.constructor(node, false, this.sjf);
        // node.parentElement.removeChild(node)
      } else {}
    }

    // Array.prototype.forEach.call(child, node => {
    //   if (!!node.children.length) {
    //     this.constructor(node, false, this.sjf)
    //   } else {
    //     this.sjf._uncompileNodes.push(node)
    //     this.sjf._uncompileNodes.forEach(value => {
    //       this.hasDirective(value)
    //     })
    //     this.sjf._uncompileNodes = []
    //   }
    // })
    // 如果当前节点是这个Sjf实例的根节点的最后一个子节点就跳出递归
    if (this.sjf._el.lastElementChild === child[child.length - 1]) {
      new _link2.default(this.sjf);
    }
  }

  // 检测每个node看是否绑定有指令


  _createClass(compile, [{
    key: 'hasDirective',
    value: function hasDirective(node) {
      var checkReg = /sjf-.+=\".+\"|\{\{.+\}\}/;
      if (checkReg.test(node.outerHTML || node.innerText)) {
        this.sjf._unlinkNodes.push(node);
      }
    }
  }]);

  return compile;
}();

exports.default = compile;

},{"./link":2}],2:[function(require,module,exports){
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
          var directives = value.outerHTML.match(extractReg);
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
      console.error('the toLoopObject of sjf-for should be a number or Array');
      return;
    }
    // 判断是数组还是数字，从而赋值length
    var isArray = _utils2.default.judgeType(toLoopObject) === '[object Array]';
    var len = isArray ? toLoopObject.length : toLoopObject;

    value.node.removeAttribute('sjf-for');
    for (var i = 0; i < len - 1; i++) {
      var clonedNode = value.node.cloneNode(true);
      value.node.parentElement.insertBefore(clonedNode, value.node);
    }

    if (toLoopObject && isArray) {
      this._watchers.push(this._data[toLoopObject]);
    }
  },
  'sjf-text': function sjfText(value) {
    this.innerText = this._data[value.expression];
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
    this['_' + method] = param.methods[method].bind(this);
  }
  new _compile2.default(this._el, true, this);
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
  }
};

exports.default = util;

},{"./option":3}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2UvamF2YXNjcmlwdC9jb21waWxlLmpzIiwic291cmNlL2phdmFzY3JpcHQvbGluay5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L29wdGlvbi5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3JlbmRlci5qcyIsInNvdXJjZS9qYXZhc2NyaXB0L3NqZkRhdGFCaW5kLmpzIiwic291cmNlL2phdmFzY3JpcHQvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FDOzs7Ozs7OztJQUVNLE87QUFDTDtBQUNBLG1CQUFhLE1BQWIsRUFBcUIsT0FBckIsRUFBOEIsR0FBOUIsRUFBbUM7QUFBQTs7QUFDakMsU0FBSyxHQUFMLEdBQVcsR0FBWDtBQUNBLFFBQUksUUFBUSxPQUFPLFFBQW5CO0FBQ0E7QUFDQSxRQUFJLFdBQVcsQ0FBQyxNQUFNLE1BQXRCLEVBQThCO0FBQzVCLFdBQUssWUFBTCxDQUFrQixNQUFsQjtBQUNBLHlCQUFTLEtBQUssR0FBZDtBQUNEOztBQUVELFNBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxNQUFNLE1BQTFCLEVBQWtDLEdBQWxDLEVBQXVDO0FBQ3JDLFVBQUksT0FBTyxNQUFNLENBQU4sQ0FBWDtBQUNBLFVBQUksS0FBSyxRQUFMLENBQWMsTUFBbEIsRUFBMEI7QUFDeEIsYUFBSyxXQUFMLENBQWlCLElBQWpCLEVBQXVCLEtBQXZCLEVBQThCLEtBQUssR0FBbkM7QUFDQTtBQUNELE9BSEQsTUFHTyxDQUVOO0FBQ0Y7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBSSxLQUFLLEdBQUwsQ0FBUyxHQUFULENBQWEsZ0JBQWIsS0FBa0MsTUFBTSxNQUFNLE1BQU4sR0FBZSxDQUFyQixDQUF0QyxFQUErRDtBQUM3RCx5QkFBUyxLQUFLLEdBQWQ7QUFDRDtBQUNGOztBQUVEOzs7OztpQ0FDYyxJLEVBQU07QUFDbEIsVUFBSSxXQUFXLDBCQUFmO0FBQ0EsVUFBSSxTQUFTLElBQVQsQ0FBYyxLQUFLLFNBQUwsSUFBa0IsS0FBSyxTQUFyQyxDQUFKLEVBQXFEO0FBQ25ELGFBQUssR0FBTCxDQUFTLFlBQVQsQ0FBc0IsSUFBdEIsQ0FBMkIsSUFBM0I7QUFDRDtBQUNGOzs7Ozs7a0JBR1ksTzs7Ozs7Ozs7Ozs7QUNqRGY7Ozs7QUFDQTs7Ozs7Ozs7SUFFTSxJO0FBQ0osZ0JBQWEsR0FBYixFQUFrQjtBQUFBOztBQUFBOztBQUNoQixTQUFLLEdBQUwsR0FBVyxHQUFYO0FBQ0EsUUFBSSxnQkFBZ0IsS0FBSyxHQUFMLENBQVMsWUFBVCxDQUFzQixNQUExQztBQUNBLFFBQUksYUFBSixFQUFtQjtBQUFBO0FBQ2pCLFlBQUksYUFBYSxrQ0FBakI7QUFDQSxjQUFLLEdBQUwsQ0FBUyxZQUFULENBQXNCLE9BQXRCLENBQThCLFVBQUMsS0FBRCxFQUFXO0FBQ3ZDLGNBQUksYUFBYyxNQUFNLFNBQVAsQ0FBa0IsS0FBbEIsQ0FBd0IsVUFBeEIsQ0FBakI7QUFDQSxxQkFBVyxPQUFYLENBQW1CLGVBQU87QUFDeEIsa0JBQUssZ0JBQUwsQ0FBc0IsR0FBdEIsRUFBMkIsS0FBM0I7QUFDRCxXQUZEO0FBR0QsU0FMRDtBQU1BLGNBQUssWUFBTCxHQUFvQixFQUFwQjtBQUNBLDZCQUFXLE1BQUssR0FBaEI7QUFUaUI7QUFVbEI7QUFDRjs7QUFFRDs7Ozs7cUNBQ2tCLFMsRUFBVyxJLEVBQU07QUFDakMsVUFBSSxTQUFTLFVBQVUsS0FBVixDQUFnQixHQUFoQixDQUFiO0FBQ0E7QUFDQSxVQUFJLGlCQUFPLFNBQVAsQ0FBaUIsT0FBakIsQ0FBeUIsT0FBTyxDQUFQLENBQXpCLEtBQXVDLENBQTNDLEVBQThDO0FBQzVDLFlBQUksV0FBVztBQUNiLGdCQUFNLE9BRE87QUFFYixrQkFBUSxJQUZLO0FBR2IsZ0JBQU0sT0FBTyxDQUFQLENBSE87QUFJYixnQkFBTSxPQUFPLENBQVA7QUFKTyxTQUFmO0FBTUEsYUFBSyxHQUFMLENBQVMsY0FBVCxDQUF3QixJQUF4QixDQUE2QixRQUE3QjtBQUNELE9BUkQsTUFRTztBQUNMLFlBQUksYUFBYSxPQUFPLENBQVAsRUFBVSxPQUFWLENBQWtCLFNBQWxCLEVBQTZCLEVBQTdCLENBQWpCO0FBQ0EsWUFBSSxnQkFBZ0IsVUFBcEI7QUFDQTtBQUNBLFlBQUksQ0FBQyxhQUFhLElBQWIsQ0FBa0IsU0FBbEIsQ0FBTCxFQUFtQztBQUNqQyx1QkFBYSxPQUFPLENBQVAsRUFBVSxPQUFWLENBQWtCLEtBQWxCLEVBQXlCLEVBQXpCLENBQWI7QUFDQSwwQkFBZ0IsT0FBTyxDQUFQLENBQWhCO0FBQ0Q7QUFDRCxhQUFLLEdBQUwsQ0FBUyxjQUFULENBQXdCLElBQXhCLENBQTZCO0FBQzNCLGdCQUFNLFdBRHFCO0FBRTNCLGdCQUFNLElBRnFCO0FBRzNCLHFCQUFXLGFBSGdCO0FBSTNCLHNCQUFZO0FBSmUsU0FBN0I7QUFNRDtBQUNGOzs7Ozs7a0JBR1ksSTs7Ozs7Ozs7QUNsRGYsSUFBTSxTQUFTO0FBQ2IsWUFBVTtBQUNSLGNBQVUsSUFERjtBQUVSLGdCQUFZLElBRko7QUFHUixlQUFXLElBSEg7QUFJUixpQkFBYSxFQUpMO0FBS1IsZ0JBQVk7QUFMSixHQURHO0FBUWIsYUFBVyxDQUNULFdBRFMsRUFFVCxlQUZTLEVBR1QsY0FIUyxFQUlULGVBSlMsRUFLVCxnQkFMUyxFQU1ULGdCQU5TLEVBT1QsZUFQUyxFQVFULGFBUlM7QUFSRSxDQUFmOztrQkFvQmUsTTs7Ozs7Ozs7Ozs7QUNwQmY7Ozs7Ozs7O0FBRUEsSUFBTSxhQUFhO0FBQ2pCLFlBQVUsZUFBVSxLQUFWLEVBQWlCO0FBQ3pCLFVBQU0sSUFBTixDQUFXLEtBQVgsQ0FBaUIsT0FBakIsR0FBNEIsQ0FBQyxDQUFFLE1BQU0sVUFBVCxHQUF1QixpQkFBdkIsR0FBMkMsZ0JBQXZFO0FBQ0QsR0FIZ0I7QUFJakIsY0FBWSxpQkFBVSxLQUFWLEVBQWlCO0FBQzNCLFVBQU0sSUFBTixDQUFXLEtBQVgsQ0FBaUIsT0FBakIsR0FBNEIsQ0FBQyxDQUFFLE1BQU0sVUFBVCxHQUF1QixpQkFBdkIsR0FBMkMsZ0JBQXZFO0FBQ0QsR0FOZ0I7QUFPakIsYUFBVyxnQkFBVSxLQUFWLEVBQWlCO0FBQzFCO0FBQ0EsUUFBSSxpQkFBaUIsTUFBTSxVQUFOLENBQWlCLEtBQWpCLENBQXVCLEtBQXZCLEVBQThCLENBQTlCLENBQXJCO0FBQ0EsUUFBSSxlQUFlLElBQW5CO0FBQ0EsUUFBSSxLQUFLLEtBQUwsQ0FBVyxjQUFYLENBQTBCLGNBQTFCLENBQUosRUFBK0M7QUFDN0MscUJBQWUsS0FBSyxLQUFMLENBQVcsY0FBWCxDQUFmO0FBQ0Q7QUFDRDtBQUNBLFFBQUksYUFBYSx3QkFBd0IsS0FBeEIsSUFBaUMsQ0FBQyxNQUFNLFlBQU4sQ0FBbkQ7QUFDQSxRQUFJLENBQUMsVUFBTCxFQUFpQjtBQUNmLGNBQVEsS0FBUixDQUFjLHlEQUFkO0FBQ0E7QUFDRDtBQUNEO0FBQ0EsUUFBSSxVQUFVLGdCQUFLLFNBQUwsQ0FBZSxZQUFmLE1BQWlDLGdCQUEvQztBQUNBLFFBQUksTUFBTSxVQUFVLGFBQWEsTUFBdkIsR0FBZ0MsWUFBMUM7O0FBRUEsVUFBTSxJQUFOLENBQVcsZUFBWCxDQUEyQixTQUEzQjtBQUNBLFNBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxNQUFNLENBQTFCLEVBQTZCLEdBQTdCLEVBQWtDO0FBQ2hDLFVBQUksYUFBYSxNQUFNLElBQU4sQ0FBVyxTQUFYLENBQXFCLElBQXJCLENBQWpCO0FBQ0EsWUFBTSxJQUFOLENBQVcsYUFBWCxDQUF5QixZQUF6QixDQUFzQyxVQUF0QyxFQUFrRCxNQUFNLElBQXhEO0FBQ0Q7O0FBRUQsUUFBSSxnQkFBZ0IsT0FBcEIsRUFBNkI7QUFDM0IsV0FBSyxTQUFMLENBQWUsSUFBZixDQUFvQixLQUFLLEtBQUwsQ0FBVyxZQUFYLENBQXBCO0FBQ0Q7QUFDRixHQWpDZ0I7QUFrQ2pCLGNBQVksaUJBQVUsS0FBVixFQUFpQjtBQUMzQixTQUFLLFNBQUwsR0FBaUIsS0FBSyxLQUFMLENBQVcsTUFBTSxVQUFqQixDQUFqQjtBQUNEO0FBcENnQixDQUFuQjs7SUF1Q00sTTtBQUNKLGtCQUFhLEdBQWIsRUFBa0I7QUFBQTs7QUFBQTs7QUFDaEIsU0FBSyxHQUFMLEdBQVcsR0FBWDtBQUNBLFNBQUssWUFBTCxHQUFvQixFQUFwQjtBQUNBLFNBQUssZ0JBQUwsR0FBd0IsRUFBeEI7QUFDQSxRQUFJLFlBQVksS0FBSyxHQUFMLENBQVMsY0FBVCxDQUF3QixNQUF4QztBQUNBLFFBQUksU0FBSixFQUFlO0FBQ2IsV0FBSyxHQUFMLENBQVMsY0FBVCxDQUF3QixPQUF4QixDQUFnQyxlQUFPO0FBQ3JDLFlBQUksSUFBSixLQUFhLE9BQWIsR0FBdUIsTUFBSyxZQUFMLENBQWtCLElBQWxCLENBQXVCLEdBQXZCLENBQXZCLEdBQXFELE1BQUssZ0JBQUwsQ0FBc0IsSUFBdEIsQ0FBMkIsR0FBM0IsQ0FBckQ7QUFDRCxPQUZEO0FBR0EsV0FBSyxHQUFMLENBQVMsY0FBVCxHQUEwQixFQUExQjtBQUNEO0FBQ0QsU0FBSyxhQUFMO0FBQ0Q7Ozs7b0NBRWdCO0FBQUE7O0FBQ2YsVUFBSSxlQUFlLGdCQUFLLGdCQUFMLENBQXNCLFdBQXRCLEVBQW1DLEtBQUssZ0JBQXhDLENBQW5CO0FBQ0EsVUFBSSxhQUFhLE1BQWpCLEVBQXlCO0FBQ3ZCLHFCQUFhLE9BQWIsQ0FBcUIsaUJBQVM7QUFDNUIscUJBQVcsTUFBTSxTQUFqQixFQUE0QixJQUE1QixDQUFpQyxPQUFLLEdBQXRDLEVBQTJDLEtBQTNDO0FBQ0QsU0FGRDtBQUdEO0FBQ0QsV0FBSyxTQUFMO0FBQ0Q7O0FBRUQ7Ozs7Z0NBQ2E7QUFBQTs7QUFDWCxVQUFJLGFBQWEsS0FBSyxZQUF0QjtBQUNBLFVBQUksV0FBVyxNQUFmLEVBQXVCO0FBQ3JCLG1CQUFXLE9BQVgsQ0FBbUIsZUFBTztBQUN4QixjQUFJLE1BQUosQ0FBVyxlQUFYLENBQTJCLElBQUksSUFBL0I7QUFDQSxjQUFJLFlBQVksZ0JBQUssWUFBTCxDQUFrQixJQUFJLElBQXRCLENBQWhCO0FBQ0EsY0FBSSxZQUFZLE9BQUssR0FBTCxDQUFTLE1BQU0sZ0JBQUssY0FBTCxDQUFvQixJQUFJLElBQXhCLENBQWYsQ0FBaEI7QUFDQSxjQUFJLE1BQUosQ0FBVyxnQkFBWCxDQUE0QixTQUE1QixFQUF1QyxTQUF2QyxFQUFrRCxLQUFsRDtBQUNELFNBTEQ7QUFNRDtBQUNGOzs7Ozs7a0JBR1ksTTs7Ozs7Ozs7O0FDaEZmOzs7Ozs7OztJQUVNLFcsR0FDSixxQkFBYSxLQUFiLEVBQW9CO0FBQUE7O0FBQ2xCLE1BQUksQ0FBQyxNQUFNLGNBQU4sQ0FBcUIsSUFBckIsQ0FBRCxJQUErQixDQUFDLE1BQU0sY0FBTixDQUFxQixNQUFyQixDQUFwQyxFQUFrRTtBQUNoRSxZQUFRLEtBQVIsQ0FBYyxxREFBZDtBQUNBO0FBQ0Q7QUFDRCxPQUFLLEdBQUwsR0FBVyxTQUFTLGFBQVQsQ0FBdUIsTUFBTSxFQUE3QixDQUFYO0FBQ0EsT0FBSyxLQUFMLEdBQWEsTUFBTSxJQUFuQjtBQUNBLE9BQUssU0FBTCxHQUFpQixFQUFqQjtBQUNBLE9BQUssZUFBTCxHQUF1QixFQUF2QjtBQUNBLE9BQUssWUFBTCxHQUFvQixFQUFwQjtBQUNBLE9BQUssY0FBTCxHQUFzQixFQUF0QjtBQUNBLE9BQUssSUFBSSxNQUFULElBQW1CLE1BQU0sT0FBekIsRUFBa0M7QUFDaEM7QUFDQSxTQUFLLE1BQU0sTUFBWCxJQUFxQixNQUFNLE9BQU4sQ0FBYyxNQUFkLEVBQXNCLElBQXRCLENBQTJCLElBQTNCLENBQXJCO0FBQ0Q7QUFDRCx3QkFBWSxLQUFLLEdBQWpCLEVBQXNCLElBQXRCLEVBQTRCLElBQTVCO0FBQ0QsQzs7a0JBR1ksVzs7Ozs7Ozs7O0FDdEJmOzs7Ozs7QUFFQSxJQUFNLE9BQU87QUFDWDtBQUNBLFdBRlcscUJBRUEsR0FGQSxFQUVLO0FBQ2QsV0FBTyxPQUFPLFNBQVAsQ0FBaUIsUUFBakIsQ0FBMEIsSUFBMUIsQ0FBK0IsR0FBL0IsQ0FBUDtBQUNELEdBSlU7O0FBS1g7QUFDQSxjQU5XLHdCQU1HLEdBTkgsRUFNUTtBQUNqQixXQUFPLE1BQU0sSUFBSSxPQUFKLENBQVksTUFBWixFQUFvQixFQUFwQixDQUFiO0FBQ0QsR0FSVTs7QUFTWDtBQUNBLGdCQVZXLDBCQVVLLEdBVkwsRUFVVTtBQUNuQixVQUFNLElBQUksT0FBSixDQUFZLEtBQVosRUFBbUIsRUFBbkIsQ0FBTjtBQUNBLFdBQU8sTUFBTSxJQUFJLE9BQUosQ0FBWSxNQUFaLEVBQW9CLEVBQXBCLENBQWI7QUFDRCxHQWJVO0FBY1gsa0JBZFcsNEJBY08sUUFkUCxFQWNpQixNQWRqQixFQWN5QjtBQUNsQyxXQUFPLE9BQU8sSUFBUCxDQUFZLFVBQUMsSUFBRCxFQUFPLElBQVAsRUFBZ0I7QUFDakMsVUFBSSxPQUFPLGlCQUFPLFFBQVAsQ0FBZ0IsS0FBSyxRQUFMLENBQWhCLENBQVg7QUFDQSxVQUFJLE9BQU8saUJBQU8sUUFBUCxDQUFnQixLQUFLLFFBQUwsQ0FBaEIsQ0FBWDtBQUNBLGFBQU8sT0FBTyxJQUFkO0FBQ0QsS0FKTSxDQUFQO0FBS0Q7QUFwQlUsQ0FBYjs7a0JBdUJlLEkiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIGltcG9ydCBsaW5rIGZyb20gJy4vbGluaydcblxuIGNsYXNzIGNvbXBpbGUge1xuICAvLyDpgJLlvZJET03moJFcbiAgY29uc3RydWN0b3IgKHBhcmVudCwgaXNGaXJzdCwgc2pmKSB7XG4gICAgdGhpcy5zamYgPSBzamZcbiAgICBsZXQgY2hpbGQgPSBwYXJlbnQuY2hpbGRyZW5cbiAgICAvLyDlpoLmnpzmmK/nrKzkuIDmrKHpgY3ljoblubbkuJTmsqHmnInlrZDoioLngrnlsLHnm7TmjqXot7Pov4djb21waWxlXG4gICAgaWYgKGlzRmlyc3QgJiYgIWNoaWxkLmxlbmd0aCkge1xuICAgICAgdGhpcy5oYXNEaXJlY3RpdmUocGFyZW50KVxuICAgICAgbmV3IGxpbmsodGhpcy5zamYpXG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZC5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IG5vZGUgPSBjaGlsZFtpXVxuICAgICAgaWYgKG5vZGUuY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuY29uc3RydWN0b3Iobm9kZSwgZmFsc2UsIHRoaXMuc2pmKVxuICAgICAgICAvLyBub2RlLnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQobm9kZSlcbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGNoaWxkLCBub2RlID0+IHtcbiAgICAvLyAgIGlmICghIW5vZGUuY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgLy8gICAgIHRoaXMuY29uc3RydWN0b3Iobm9kZSwgZmFsc2UsIHRoaXMuc2pmKVxuICAgIC8vICAgfSBlbHNlIHtcbiAgICAvLyAgICAgdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzLnB1c2gobm9kZSlcbiAgICAvLyAgICAgdGhpcy5zamYuX3VuY29tcGlsZU5vZGVzLmZvckVhY2godmFsdWUgPT4ge1xuICAgIC8vICAgICAgIHRoaXMuaGFzRGlyZWN0aXZlKHZhbHVlKVxuICAgIC8vICAgICB9KVxuICAgIC8vICAgICB0aGlzLnNqZi5fdW5jb21waWxlTm9kZXMgPSBbXVxuICAgIC8vICAgfVxuICAgIC8vIH0pXG4gICAgLy8g5aaC5p6c5b2T5YmN6IqC54K55piv6L+Z5LiqU2pm5a6e5L6L55qE5qC56IqC54K555qE5pyA5ZCO5LiA5Liq5a2Q6IqC54K55bCx6Lez5Ye66YCS5b2SXG4gICAgaWYgKHRoaXMuc2pmLl9lbC5sYXN0RWxlbWVudENoaWxkID09PSBjaGlsZFtjaGlsZC5sZW5ndGggLSAxXSkge1xuICAgICAgbmV3IGxpbmsodGhpcy5zamYpXG4gICAgfVxuICB9XG5cbiAgLy8g5qOA5rWL5q+P5Liqbm9kZeeci+aYr+WQpue7keWumuacieaMh+S7pFxuICBoYXNEaXJlY3RpdmUgKG5vZGUpIHtcbiAgICBsZXQgY2hlY2tSZWcgPSAvc2pmLS4rPVxcXCIuK1xcXCJ8XFx7XFx7LitcXH1cXH0vXG4gICAgaWYgKGNoZWNrUmVnLnRlc3Qobm9kZS5vdXRlckhUTUwgfHwgbm9kZS5pbm5lclRleHQpKSB7XG4gICAgICB0aGlzLnNqZi5fdW5saW5rTm9kZXMucHVzaChub2RlKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjb21waWxlXG4iLCJpbXBvcnQgb3B0aW9uIGZyb20gJy4vb3B0aW9uJ1xuaW1wb3J0IHJlbmRlciBmcm9tICcuL3JlbmRlcidcblxuY2xhc3MgbGluayB7XG4gIGNvbnN0cnVjdG9yIChzamYpIHtcbiAgICB0aGlzLnNqZiA9IHNqZlxuICAgIGxldCBoYXNVbmxpbmtOb2RlID0gdGhpcy5zamYuX3VubGlua05vZGVzLmxlbmd0aFxuICAgIGlmIChoYXNVbmxpbmtOb2RlKSB7XG4gICAgICBsZXQgZXh0cmFjdFJlZyA9IC9zamYtW2Etel0rPVxcXCJbXlwiXStcXFwifFxce1xcey4rXFx9XFx9L2dcbiAgICAgIHRoaXMuc2pmLl91bmxpbmtOb2Rlcy5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgICAgICBsZXQgZGlyZWN0aXZlcyA9ICh2YWx1ZS5vdXRlckhUTUwpLm1hdGNoKGV4dHJhY3RSZWcpXG4gICAgICAgIGRpcmVjdGl2ZXMuZm9yRWFjaCh2YWwgPT4ge1xuICAgICAgICAgIHRoaXMuZXh0cmFjdERpcmVjdGl2ZSh2YWwsIHZhbHVlKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICAgIHRoaXMuX3VubGlua05vZGVzID0gW11cbiAgICAgIG5ldyByZW5kZXIodGhpcy5zamYpXG4gICAgfVxuICB9XG5cbiAgLy8g5o+Q5Y+W5oyH5LukXG4gIGV4dHJhY3REaXJlY3RpdmUgKGRpcmVjdGl2ZSwgbm9kZSkge1xuICAgIGxldCBzbGljZXMgPSBkaXJlY3RpdmUuc3BsaXQoJz0nKVxuICAgIC8vIOWmguaenOaYr+S6i+S7tuWwseebtOaOpemAmui/h2FkZEV2ZW50TGlzdGVuZXLov5vooYznu5HlrppcbiAgICBpZiAob3B0aW9uLnNqZkV2ZW50cy5pbmRleE9mKHNsaWNlc1swXSkgPj0gMCkge1xuICAgICAgbGV0IGV2ZW50TWVzID0ge1xuICAgICAgICB0eXBlOiAnZXZlbnQnLFxuICAgICAgICB0YXJnZXQ6IG5vZGUsXG4gICAgICAgIG5hbWU6IHNsaWNlc1swXSxcbiAgICAgICAgZnVuYzogc2xpY2VzWzFdXG4gICAgICB9XG4gICAgICB0aGlzLnNqZi5fdW5yZW5kZXJOb2Rlcy5wdXNoKGV2ZW50TWVzKVxuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgZXhwcmVzc2lvbiA9IHNsaWNlc1swXS5yZXBsYWNlKC9bXFx7XFx9XS9nLCAnJylcbiAgICAgIGxldCBkaXJlY3RpdmVOYW1lID0gJ3NqZi10ZXh0J1xuICAgICAgLy8g5a+56Z2ee3t9fei/meenjeihqOi+vuW8j+i/m+ihjOWNleeLrOWkhOeQhlxuICAgICAgaWYgKCEvXFx7XFx7LitcXH1cXH0vLnRlc3QoZGlyZWN0aXZlKSkge1xuICAgICAgICBleHByZXNzaW9uID0gc2xpY2VzWzFdLnJlcGxhY2UoL1xcXCIvZywgJycpXG4gICAgICAgIGRpcmVjdGl2ZU5hbWUgPSBzbGljZXNbMF1cbiAgICAgIH1cbiAgICAgIHRoaXMuc2pmLl91bnJlbmRlck5vZGVzLnB1c2goe1xuICAgICAgICB0eXBlOiAnZGlyZWN0aXZlJyxcbiAgICAgICAgbm9kZTogbm9kZSwgXG4gICAgICAgIGRpcmVjdGl2ZTogZGlyZWN0aXZlTmFtZSwgXG4gICAgICAgIGV4cHJlc3Npb246IGV4cHJlc3Npb25cbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGxpbmtcbiIsImNvbnN0IG9wdGlvbiA9IHtcbiAgcHJpb3JpdHk6IHtcbiAgICAnc2pmLWlmJzogMjAwMCxcbiAgICAnc2pmLXNob3cnOiAyMDAwLFxuICAgICdzamYtZm9yJzogMTAwMCxcbiAgICAnc2pmLW1vZGVsJzogMTAsXG4gICAgJ3NqZi10ZXh0JzogMVxuICB9LFxuICBzamZFdmVudHM6IFtcbiAgICAnc2pmLWNsaWNrJywgXG4gICAgJ3NqZi1tb3VzZW92ZXInLCBcbiAgICAnc2pmLW1vdXNlb3V0JywgXG4gICAgJ3NqZi1tb3VzZW1vdmUnLCBcbiAgICAnc2pmLW1vdXNlZW50ZXInLFxuICAgICdzamYtbW91c2VsZWF2ZScsXG4gICAgJ3NqZi1tb3VzZWRvd24nLFxuICAgICdzamYtbW91c2V1cCdcbiAgXVxufVxuXG5leHBvcnQgZGVmYXVsdCBvcHRpb25cbiIsImltcG9ydCB1dGlsIGZyb20gJy4vdXRpbHMnXG5cbmNvbnN0IGxpbmtSZW5kZXIgPSB7XG4gICdzamYtaWYnOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YWx1ZS5ub2RlLnN0eWxlLmRpc3BsYXkgPSAoISEodmFsdWUuZXhwcmVzc2lvbikgPyAnYmxvY2shaW1wb3J0YW50JyA6ICdub25lIWltcG9ydGFudCcpXG4gIH0sXG4gICdzamYtc2hvdyc6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhbHVlLm5vZGUuc3R5bGUuZGlzcGxheSA9ICghISh2YWx1ZS5leHByZXNzaW9uKSA/ICdibG9jayFpbXBvcnRhbnQnIDogJ25vbmUhaW1wb3J0YW50JylcbiAgfSxcbiAgJ3NqZi1mb3InOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAvLyDlsIbooajovr7lvI/pgJrov4fnqbrmoLwo5LiN6ZmQ56m65qC85pWw55uuKee7meWIh+W8gFxuICAgIGxldCBsb29wT2JqZWN0TmFtZSA9IHZhbHVlLmV4cHJlc3Npb24uc3BsaXQoL1xccysvKVsyXVxuICAgIGxldCB0b0xvb3BPYmplY3QgPSBudWxsXG4gICAgaWYgKHRoaXMuX2RhdGEuaGFzT3duUHJvcGVydHkobG9vcE9iamVjdE5hbWUpKSB7XG4gICAgICB0b0xvb3BPYmplY3QgPSB0aGlzLl9kYXRhW2xvb3BPYmplY3ROYW1lXVxuICAgIH1cbiAgICAvLyDliKTmlq3lvoXlvqrnjq/nmoTmmK/lkKbog73ov5vooYzlvqrnjq9cbiAgICBsZXQgaXNMb29wYWJsZSA9IHRvTG9vcE9iamVjdCBpbnN0YW5jZW9mIEFycmF5IHx8ICFpc05hTih0b0xvb3BPYmplY3QpXG4gICAgaWYgKCFpc0xvb3BhYmxlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCd0aGUgdG9Mb29wT2JqZWN0IG9mIHNqZi1mb3Igc2hvdWxkIGJlIGEgbnVtYmVyIG9yIEFycmF5JylcbiAgICAgIHJldHVybiBcbiAgICB9XG4gICAgLy8g5Yik5pat5piv5pWw57uE6L+Y5piv5pWw5a2X77yM5LuO6ICM6LWL5YC8bGVuZ3RoXG4gICAgbGV0IGlzQXJyYXkgPSB1dGlsLmp1ZGdlVHlwZSh0b0xvb3BPYmplY3QpID09PSAnW29iamVjdCBBcnJheV0nXG4gICAgbGV0IGxlbiA9IGlzQXJyYXkgPyB0b0xvb3BPYmplY3QubGVuZ3RoIDogdG9Mb29wT2JqZWN0XG5cbiAgICB2YWx1ZS5ub2RlLnJlbW92ZUF0dHJpYnV0ZSgnc2pmLWZvcicpXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW4gLSAxOyBpKyspIHtcbiAgICAgIGxldCBjbG9uZWROb2RlID0gdmFsdWUubm9kZS5jbG9uZU5vZGUodHJ1ZSlcbiAgICAgIHZhbHVlLm5vZGUucGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUoY2xvbmVkTm9kZSwgdmFsdWUubm9kZSlcbiAgICB9XG5cbiAgICBpZiAodG9Mb29wT2JqZWN0ICYmIGlzQXJyYXkpIHtcbiAgICAgIHRoaXMuX3dhdGNoZXJzLnB1c2godGhpcy5fZGF0YVt0b0xvb3BPYmplY3RdKVxuICAgIH1cbiAgfSxcbiAgJ3NqZi10ZXh0JzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdGhpcy5pbm5lclRleHQgPSB0aGlzLl9kYXRhW3ZhbHVlLmV4cHJlc3Npb25dXG4gIH1cbn1cblxuY2xhc3MgcmVuZGVyIHtcbiAgY29uc3RydWN0b3IgKHNqZikge1xuICAgIHRoaXMuc2pmID0gc2pmXG4gICAgdGhpcy51bkJpbmRFdmVudHMgPSBbXVxuICAgIHRoaXMudW5Tb3J0RGlyZWN0aXZlcyA9IFtdXG4gICAgbGV0IGhhc1JlbmRlciA9IHRoaXMuc2pmLl91bnJlbmRlck5vZGVzLmxlbmd0aFxuICAgIGlmIChoYXNSZW5kZXIpIHtcbiAgICAgIHRoaXMuc2pmLl91bnJlbmRlck5vZGVzLmZvckVhY2godmFsID0+IHtcbiAgICAgICAgdmFsLnR5cGUgPT09ICdldmVudCcgPyB0aGlzLnVuQmluZEV2ZW50cy5wdXNoKHZhbCkgOiB0aGlzLnVuU29ydERpcmVjdGl2ZXMucHVzaCh2YWwpXG4gICAgICB9KVxuICAgICAgdGhpcy5zamYuX3VucmVuZGVyTm9kZXMgPSBbXVxuICAgIH1cbiAgICB0aGlzLnNvcnREaXJlY3RpdmUoKVxuICB9XG5cbiAgc29ydERpcmVjdGl2ZSAoKSB7XG4gICAgbGV0IGV4ZWN1dGVRdWV1ZSA9IHV0aWwuc29ydEV4ZXh1dGVRdWV1ZSgnZGlyZWN0aXZlJywgdGhpcy51blNvcnREaXJlY3RpdmVzKVxuICAgIGlmIChleGVjdXRlUXVldWUubGVuZ3RoKSB7XG4gICAgICBleGVjdXRlUXVldWUuZm9yRWFjaCh2YWx1ZSA9PiB7XG4gICAgICAgIGxpbmtSZW5kZXJbdmFsdWUuZGlyZWN0aXZlXS5iaW5kKHRoaXMuc2pmKSh2YWx1ZSlcbiAgICAgIH0pXG4gICAgfVxuICAgIHRoaXMuYmluZEV2ZW50KClcbiAgfVxuXG4gIC8vIOe7keWumuS6i+S7tlxuICBiaW5kRXZlbnQgKCkge1xuICAgIGxldCBldmVudFF1ZW5lID0gdGhpcy51bkJpbmRFdmVudHNcbiAgICBpZiAoZXZlbnRRdWVuZS5sZW5ndGgpIHtcbiAgICAgIGV2ZW50UXVlbmUuZm9yRWFjaCh2YWwgPT4ge1xuICAgICAgICB2YWwudGFyZ2V0LnJlbW92ZUF0dHJpYnV0ZSh2YWwubmFtZSlcbiAgICAgICAgbGV0IGV2ZW50VHlwZSA9IHV0aWwucmVtb3ZlUHJlZml4KHZhbC5uYW1lKVxuICAgICAgICBsZXQgZXZlbnRGdW5jID0gdGhpcy5zamZbJ18nICsgdXRpbC5yZW1vdmVCcmFja2V0cyh2YWwuZnVuYyldXG4gICAgICAgIHZhbC50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGV2ZW50RnVuYywgZmFsc2UpXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCByZW5kZXJcbiIsImltcG9ydCBjb21waWxlIGZyb20gJy4vY29tcGlsZSdcblxuY2xhc3MgU2pmRGF0YUJpbmQge1xuICBjb25zdHJ1Y3RvciAocGFyYW0pIHtcbiAgICBpZiAoIXBhcmFtLmhhc093blByb3BlcnR5KCdlbCcpIHx8ICFwYXJhbS5oYXNPd25Qcm9wZXJ0eSgnZGF0YScpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdzamZbZXJyb3JdOiBUaGVyZSBpcyBuZWVkIGBkYXRhYCBhbmQgYGVsYCBhdHRyaWJ1dGUnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuX2VsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihwYXJhbS5lbClcbiAgICB0aGlzLl9kYXRhID0gcGFyYW0uZGF0YVxuICAgIHRoaXMuX3dhdGNoZXJzID0gW11cbiAgICB0aGlzLl91bmNvbXBpbGVOb2RlcyA9IFtdXG4gICAgdGhpcy5fdW5saW5rTm9kZXMgPSBbXVxuICAgIHRoaXMuX3VucmVuZGVyTm9kZXMgPSBbXVxuICAgIGZvciAobGV0IG1ldGhvZCBpbiBwYXJhbS5tZXRob2RzKSB7XG4gICAgICAvLyDlvLrliLblsIblrprkuYnlnKhtZXRob2Rz5LiK55qE5pa55rOV55u05o6l57uR5a6a5ZyoU2pmRGF0YUJpbmTkuIrvvIzlubbkv67mlLnov5nkupvmlrnms5XnmoR0aGlz5oyH5ZCR5Li6U2pmRGF0YUJpbmRcbiAgICAgIHRoaXNbJ18nICsgbWV0aG9kXSA9IHBhcmFtLm1ldGhvZHNbbWV0aG9kXS5iaW5kKHRoaXMpXG4gICAgfVxuICAgIG5ldyBjb21waWxlKHRoaXMuX2VsLCB0cnVlLCB0aGlzKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNqZkRhdGFCaW5kXG4iLCJpbXBvcnQgb3B0aW9uIGZyb20gJy4vb3B0aW9uJ1xuXG5jb25zdCB1dGlsID0ge1xuICAvLyBqdWRnZSB0aGUgdHlwZSBvZiBvYmpcbiAganVkZ2VUeXBlIChvYmopIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iailcbiAgfSxcbiAgLy8gcmVtb3ZlIHRoZSBwcmVmaXggb2Ygc2pmLVxuICByZW1vdmVQcmVmaXggKHN0cikge1xuICAgIHJldHVybiBzdHIgPSBzdHIucmVwbGFjZSgvc2pmLS8sICcnKVxuICB9LFxuICAvLyByZW1vdmUgdGhlIGJyYWNrZXRzICgpXG4gIHJlbW92ZUJyYWNrZXRzIChzdHIpIHtcbiAgICBzdHIgPSBzdHIucmVwbGFjZSgvXFxcIi9nLCAnJylcbiAgICByZXR1cm4gc3RyID0gc3RyLnJlcGxhY2UoL1xcKFxcKS8sICcnKVxuICB9LFxuICBzb3J0RXhleHV0ZVF1ZXVlIChwcm9wZXJ0eSwgb2JqQXJyKSB7XG4gICAgcmV0dXJuIG9iakFyci5zb3J0KChvYmoxLCBvYmoyKSA9PiB7XG4gICAgICBsZXQgdmFsMSA9IG9wdGlvbi5wcmlvcml0eVtvYmoxW3Byb3BlcnR5XV1cbiAgICAgIGxldCB2YWwyID0gb3B0aW9uLnByaW9yaXR5W29iajJbcHJvcGVydHldXVxuICAgICAgcmV0dXJuIHZhbDIgLSB2YWwxXG4gICAgfSlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB1dGlsXG4iXX0=
var _r=_m(5);_g.Sjf=_g.SjfDataBind=_r;return _r;})})(typeof window!=='undefined'?window:(typeof global!=='undefined'?global:(typeof self!=='undefined'?self:this)));