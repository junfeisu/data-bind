import util from './utils'

function renderOldDom (parent, node, nextSbiling) {
  console.log(parent)
}

const directiveDeal = {
  'sjf-if': function (value) {
    let showExpression = util.dealLogicSymbol(value.expression, this._data)
    let clonedNode = value.node.check.cloneNode(true)
    let parentNode = value.node.parent
    let nextSbiling = value.node.nextSibling
    
    showExpression ? renderOldDom(parentNode, clonedNode, nextSbiling) : value.node.parent.removeChild(value.node.check)
    value.node.check.removeAttribute('sjf-show')
  },
  'sjf-show': function (value) {
    let showExpression = util.dealLogicSymbol(value.expression, this._data)
    let displayValue = showExpression ? 'block' : 'none'
    let checkNode = value.node.check

    checkNode.style.setProperty('display', displayValue, 'important')
    checkNode.removeAttribute('sjf-show')
  },
  'sjf-for': function (value) {
    // 将表达式通过空格(不限空格数目)给切开
    let loopObjectName = value.expression.split(/\s+/)[2]
    let representativeName = value.expression.split(/\s+/)[0]
    let toLoopObject = null
    if (this._data.hasOwnProperty(loopObjectName)) {
      toLoopObject = this._data[loopObjectName]
    }
    // 判断待循环的是否能进行循环
    let isLoopable = toLoopObject instanceof Array || !isNaN(toLoopObject)
    if (!isLoopable) {
      console.error('sjf[error]: the toLoopObject of sjf-for should be a number or an Array')
      return 
    }
    // 判断是数组还是数字，从而赋值length
    let isArray = util.isArray(toLoopObject)
    let len = isArray ? toLoopObject.length : toLoopObject
    let clonedCheckNode = value.node.check.cloneNode(true)
    let clonedCheckNodeLength = clonedCheckNode.childNodes.length

    // 对指令按照优先级进行排序
    value.beforeDirectives.sort(util.directiveSortFilter)

    for (let i = 0; i < len; i++) {
      // execute the directives
      value.beforeDirectives.map(directive => {
        if (directive.expression === representativeName) {
          directive['textNodeValue'] = toLoopObject[i]
          directive['representativeName'] = representativeName
          directive['checkNodeChildLength'] = clonedCheckNodeLength
        }
        directiveDeal[directive.directive].bind(this)(directive)
      })

      // bind the events
      value.beforeEvents.map(event => {
        let funcString = util.removeQuotations(event.func)
        let funcName = util.extractFuncName(funcString)
        let funcArgs = util.extractFuncArg(funcString)
        let funcType = util.removePrefix(event.name)
        let func = this['_' + funcName]
        let argInfo = {
          representativeName: representativeName,
          currentVal: toLoopObject[i]
        }
        
        util.parseArg.bind(this, funcArgs, argInfo)
        let bindFn = () => {
          this['_' + funcName].apply(this, funcArgs)
        }

        func ? event.node.check.addEventListener(funcType, bindFn, false) :
          console.error('sjf[error]: the ' + funcName + ' is not declared')
      })

      let clonedNode = value.node.check.cloneNode(true)
      util.removeSjfAttr(clonedNode)
      value.node.parent.insertBefore(clonedNode, value.node.check)
    }
    value.node.parent.removeChild(value.node.check)

    if (toLoopObject && isArray) {
      this._watchers.push(toLoopObject)
    }
  },
  'sjf-text': function (value) {
    let textNodeVlaue = !value.textNodeValue ? this._data[value.expression] : value.textNodeValue
    let checkNode = value.node.check

    if (value.node.nodeType === 'elementNode') {
      let textNode = document.createTextNode(textNodeVlaue)
      let hasChild = checkNode.childNodes.length

      if (checkNode.childNodes.length == value.checkNodeChildLength + 1) {
        checkNode.removeChild(checkNode.firstChild)
      } else {
        checkNode.removeAttribute('sjf-text')
      }
      hasChild ? checkNode.insertBefore(textNode, checkNode.firstChild) : checkNode.appendChild(textNode)
    } else {
      checkNode.data = textNodeVlaue
    }
  }
}

export default directiveDeal
