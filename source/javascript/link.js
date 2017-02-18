import util from './utils'

const linkRender = {
  'sjf-if': function (value) {
    value.node.style.display = (!!(value.expression) ? 'block!important' : 'none!important')
  },
  'sjf-show': function (value) {
    value.node.style.display = (!!(value.expression) ? 'block!important' : 'none!important')
  },
  'sjf-for': function (value) {
    // 将表达式通过空格(不限空格数目)给切开
    let expressionSlices = value.expression.split(/\s+/)
    if (!isNaN(expressionSlices[2]) && this._data.hasOwnProperty(expressionSlices[2])) {
      this._watchers.push(this._data[expressionSlices[2]])
    }
    for (let i = 0; i < this._data[expressionSlices[2]].length; i++) {
      let clonedNode = value.node.cloneNode(true)
      value.node.parentElement.insertBefore(clonedNode, value.node)
    }
  },
  'sjf-text': function (value) {
    this.innerText = this._data[value.expression]
  }
}

class link {
   constructor (sjfDataBind) {
    if (!!sjfDataBind._unlinkNodes.length) {
      let executeQueue = util.sortExexuteQueue('directive', sjfDataBind._unlinkNodes)
      executeQueue.forEach(value => {
        linkRender[value.directive].bind(sjfDataBind)(value)
      })
    }
  }
}

export default link
