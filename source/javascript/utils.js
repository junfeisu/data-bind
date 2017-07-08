import option from './option'

const util = {
  // judge the type of obj
  judgeType (obj) {
    return Object.prototype.toString.call(obj)
  },
  // judge the arr is the array
  isArray (arr) {
    return util.judgeType(arr) === '[object Array]'
  },
  // judge is the object not Array, Date
  isStaictObject (obj) {
    return util.judgeType(obj) === '[object Object]'
  },
  // remove the prefix of sjf-
  removePrefix (str) {
    return str = str.replace(/sjf-/, '')
  },
  // remove the outermost layer "
  removeQuotations (str) {
    return str = str.replace(/^\"|\"$/g, '')
  },
  removeSjfAttr (node) {
    let attrs = Array.from(node.attributes)
    let removeAttrs = []
    // extract the attributes want to remove
    attrs.map(attr => {
      if (/^sjf-/.test(attr.localName)) {
        removeAttrs.push(attr)
      }
    })
    // remove the attributes want to remove
    removeAttrs.map(removeAttr => {
      node.removeAttribute(removeAttr.localName)
    })

    return node
  },
  // extract the function name of event function
  extractFuncName (str) {
    str = str.replace(/\([\w,'"|\s]*\)/, '')
    return str
  },
  // extract the arg name of event function
  extractFuncArg (str) {
    let args = []

    str = str.replace(/\w+\(|\)/g, '')
    if (str) {
      args = str.split(/,\s*/)
    }
    return args
  },
  sortExexuteQueue (property, objArr) {
    return objArr.sort((obj1, obj2) => {
      let val1 = option.priority[obj1[property]]
      let val2 = option.priority[obj2[property]]
      return val2 - val1
    })
  },
  // deep copy of Object or Arr
  deepCopy (source, dest) {
    if (!util.isArray(source) && !util.isStaictObject(source)) {
      throw 'the source you support can not be copied'
    }

    let copySource = util.isArray(source) ? [] : {}
    for (let prop in source) {
      if (source.hasOwnProperty(prop)) {
        if (util.isArray(source[prop]) || util.isStaictObject(source[prop])) {
          copySource[prop] = util.deepCopy(source[prop])
        } else {
          copySource[prop] = source[prop]
        }
      }
    }

    return copySource
  },
  // search the whole child Node of parent Node
  searchChild (arr, parent) {
    let resultArr = []
    if (util.isArray(arr)) {
      arr.map(value => {
        if (parent.contains(value.node.check)) {
          resultArr.push(value)
        }
      })
      return resultArr
    } else {
      console.error('sjf[error]: the arr in searchChild ' + arr + ' is not Array')
      return
    }
  },
  // the filter to sort the directives
  directiveSortFilter (ahead, after) {
    let aheadPriority = option.priority[ahead.directive]
    let afterPriority = option.priority[after.directive]

    return afterPriority - aheadPriority
  },
  // parse the args extract from the event function
  parseArg (args, loopInfo) {
    let parsedArgs = args.map(arg => {
      if (loopInfo && arg === loopInfo.representativeName) {
        return loopInfo.currentVal
      } else if (/^'.*'$|^".*"$/.test(arg)) {
        return arg
      } else if (this._data.hasOwnProperty(arg)) {
        return this._data[arg]
      } else {
        console.error('sjf[error]: the argument ' + arg + ' is unValid')
      }
    })

    return parsedArgs
  },
  dealLogicSymbol (expression) {
    let result = {
      symbol: '',
      expression: expression
    }
    let logicSymbolReg = /^!{1,2}/

    if (logicSymbolReg.test(expression)) {
      result.symbol = expression.match(logicSymbolReg)[0]
      result.expression = expression.replace(logicSymbolReg, '')
    }

    return result
  }
}

export default util
