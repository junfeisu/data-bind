 import link from './link'

 class compile {
  // 递归DOM树
  constructor (parent, isFirst, sjf) {
    this.sjf = sjf
    let child = parent.children
    let childLen = child.length
    let rootContent = parent.innerHTML
    // 如果是第一次遍历并且没有子节点就直接跳过compile
    if (isFirst && !childLen) {
      this.compileNode()
    }
    // console.log('parent:' + parent + ' child length is ' + childLen)
    for (let i = childLen - 1; i >= 0 ; i--) {
      let node = child[i]
      if (node.children.length) {
        let parentNode = node.parentNode ? node.parentNode : parent
        this.constructor(node, false, this.sjf)
        this.sjf._uncompileNodes.push({check: node, search: node, parent: parentNode})
      } else {
        this.sjf._uncompileNodes.push({check: node, search: node, parent: node.parentNode})
        node.parentNode.removeChild(node)
      }
    }

    this.sjf._el.innerHTML = rootContent

    // 如果当前节点是这个Sjf实例的根节点的最后一个子节点就跳出递归
    if (this.sjf._el.lastElementChild === child[childLen - 1]) {
      this.compileNode()
    }
  }

  compileNode () {
    console.log(this.sjf._uncompileNodes)
    let hasUncompile = this.sjf._uncompileNodes.length
    if (hasUncompile) {
      this.sjf._uncompileNodes.forEach(value => {
        this.hasDirective(value)
      })
    }
    // new link(this.sjf)
  }

  // 检测每个node看是否绑定有指令
  hasDirective (value) {
    let checkReg = /sjf-.+=\".+\"|\{\{.+\}\}/
    console.log(value.search.outerHTML)
    if (checkReg.test(value.check.outerHTML)) {
      this.sjf._unlinkNodes.push(value)
    }
  }
}

export default compile
