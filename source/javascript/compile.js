 import option from './option'
 import util from './utils'
 import link from './link'

 class compile {
  // 递归DOM树
  constructor (parent, isFirst, sjf) {
    let child = parent.children
    let self = this
    // 如果是第一次遍历并且没有子节点就直接跳过compile
    if (isFirst && !child.length) {
      new link(sjf)
      return
    }

    Array.prototype.forEach.call(child, node => {
      if (!!node.children.length) {
        self.constructor(node, false, sjf)
        sjf._uncompileNodes.push(node)
      } else {
        sjf._uncompileNodes.push(node)
        sjf._uncompileNodes.forEach(value => {
          self.compileNode(value, sjf)
        })
        sjf._uncompileNodes = []
      }
    })
    // 如果当前节点是这个Sjf实例的根节点的最后一个子节点就跳出递归
    if (sjf._el.lastElementChild === child[child.length - 1]) {
      new link(sjf)
    }
  }

  // 对具有sjf-的进行初步解析
  compileNode (node, sjf) {
    let matchExpress = /sjf-.+=\".+\"|\{\{.+\}\}/
    if (matchExpress.test(node.outerHTML || node.innerText)) {
      let directives = matchExpress.exec(node.outerHTML || node.innerText)
      directives.forEach((value) => {
        let slices = value.split('=')
        // 如果是事件就直接通过addEventListener进行绑定
        if (option.sjfEvents.indexOf(slices[0]) >= 0) {
          node.removeAttribute(slices[0])
          let eventType = util.removePrefix(slices[0])
          let eventFunc = sjf['_' + util.removeBrackets(slices[1])]
          node.addEventListener(eventType, eventFunc, false)
        } else {
          // 对{{}}这种表达式进行单独处理
          if (/\{\{.+\}\}/.test(value)) {
            // node.outerHTML = node.outerHTML.replace(matchExpress, '')
            let expression = slices[0].replace(/[\{\}]/g, '')
            sjf._unlinkNodes.push({node: node, directive: 'sjf-text', expression: expression})
          } else {
            // node.removeAttribute(slices[0])
            slices[1] = slices[1].replace(/\"/g, '')
            sjf._unlinkNodes.push({node: node, directive: slices[0], expression: slices[1]})
          }
        }
      })
    }
  }
}

export default compile
