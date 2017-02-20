 import link from './link'

 class compile {
  // 递归DOM树
  constructor (parent, isFirst, sjf) {
    this.sjf = sjf
    let child = parent.children
    // 如果是第一次遍历并且没有子节点就直接跳过compile
    if (isFirst && !child.length) {
      this.hasDirective(parent)
      new link(this.sjf)
    }

    for (let i = 0; i < child.length; i++) {
      let node = child[i]
      if (node.children.length) {
        this.constructor(node, false, this.sjf)
        // node.parentElement.removeChild(node)
      } else {

      }
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
      new link(this.sjf)
    }
  }

  // 检测每个node看是否绑定有指令
  hasDirective (node) {
    let checkReg = /sjf-.+=\".+\"|\{\{.+\}\}/
    if (checkReg.test(node.outerHTML || node.innerText)) {
      this.sjf._unlinkNodes.push(node)
    }
  }
}

export default compile
