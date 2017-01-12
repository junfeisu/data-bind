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
  }
}

module.exports = util
