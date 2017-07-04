 import link from './link'
 import util from './utils'

 class compile {
  // 递归DOM树
  constructor (parent, sjf) {
    this.sjf = sjf
    this.searchNode = []
    this.rootContent = this.sjf._el.innerHTML
    // this.traverseElement(parent, null, true)
    this.circleElement(this.sjf._el, true)
  }

  circleElement (parent, isFirst) {
    let child = Array.from(parent.children)
    // 如果是第一次遍历并且没有子节点就直接跳过compile
    if (isFirst && !child.length) {
      this.compileNode()
      return
    }
    child.reverse()
    child.map(node => {
      if (!!node.children.length) {
        this.circleElement(node, false)
        this.sjf._uncompileNodes.push({
          check: node,
          parent: node.parentNode,
          nodeType: 'elementNode'
        })
      } else {
        this.sjf._uncompileNodes.push({
          check: node, 
          parent: node.parentNode,
          nodeType: 'elementNode'
        })
      }
    })

    if (this.sjf._el.lastElementChild === child[0]) {
      this.compileNode()
    }
  }

  compileNode () {
    let hasUncompile = this.sjf._uncompileNodes.length
    this.sjf._uncompileNodes.reverse()
    if (hasUncompile) {
      this.sjf._uncompileNodes.map(value => {
        this.hasDirective(value)
      })
    }
    this.sjf._uncompileNodes = []
    new link(this.sjf)
  }

  // 检测每个node看是否绑定有指令
  hasDirective (value) {
    let checkReg = /sjf-.+=\".+\"|\{\{.+\}\}/
    if (checkReg.test(value.check.cloneNode().outerHTML)) {
      this.sjf._unlinkNodes.push(value)
    }
    Array.prototype.map.call(value.check.childNodes, node => {
      if (node.nodeType === 3) {
        if (checkReg.test(node.data)) {
          this.sjf._unlinkNodes.push({
            check: node, 
            parent: value.check, 
            nodeType: 'textNode'
          })
        }
      }
    })
  }
}

export default compile
