import option from './option'

const util = {
  // judge the type of obj
  judgeType (obj) {
    return Object.prototype.toString.call(obj)
  },
  // remove the prefix of sjf-
  removePrefix (str) {
    return str = str.replace(/sjf-/, '')
  },
  // remove the brackets ()
  removeBrackets (str) {
    str = str.replace(/\"/g, '')
    return str = str.replace(/\(\)/, '')
  },
  sortExexuteQueue (property, objArr) {
    return objArr.sort((obj1, obj2) => {
      let val1 = option.priority[obj1[property]]
      let val2 = option.priority[obj2[property]]
      return val2 - val1
    })
  },
  isArray (arr) {
    return util.judgeType(arr) === '[object Array]'
  },
  isStaictObject (obj) {
    return util.judgeType(obj) === '[object Object]'
  },
  // deep copy of Object or Arr
  deepCopy (source, dest) {
    if (!util.isArray(source) && !util.isStaictObject(source)) {
      throw 'the source you support can not be copied'
    }

    var copySource = util.isArray(source) ? [] : {}
    for (var prop in source) {
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
    let aheadPriority = option[ahead.directive]
    let afterPriority = option[after.directive]

    return afterPriority - aheadPriority
  },
  sortArr (arr, sortFilter) {
    return arr.sort(sortFilter)
  }
}

export default util
