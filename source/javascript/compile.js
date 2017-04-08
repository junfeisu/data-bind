 import link from './link'
 import util from './utils'

 class compile {
  // 递归DOM树
  constructor (parent, lastNode, isFirst, sjf) {
    let rootContent
    this.sjf = sjf
    this.searchNode = []
    if (isFirst) {
      rootContent = sjf._el.innerHTML
      if (!parent.children) {
        this.compileNode()
        return
      }
    } else {
      parent.removeChild(lastNode)
      if (parent === sjf._el) {
        if (!parent.children.length) {
          this.compileNode()
          return
        }
      }
    }
    
    let child = parent.children
    let childLen = child.length
    if (childLen) {
      for (var i = 0; i < childLen; i++) {
        let node = child[i]
        if (node.children.length) {
          var searchNode = this.searchLoneChild(node)[0]
          this.sjf._uncompileNodes.push({
            check: searchNode, 
            search: searchNode, 
            parent: searchNode.parentNode
          })
          this.searchNode = []
          this.constructor(searchNode.parentNode, searchNode, false, this.sjf)
        } else {
          this.sjf._uncompileNodes.push({
            check: node, 
            search: node, 
            parent: node.parentNode
          })
          if (i === childLen - 1) {
            this.constructor(node.parentNode, node, false, this.sjf)
          }
        }
      }
    } else {
      this.sjf._uncompileNodes.push({
        check: parent, 
        search: parent, 
        parent: parent.parentNode
      })
      this.constructor(parent.parentNode, parent, false, this.sjf)
    }

  }

  searchLoneChild (node) {
    let childLen = node.children.length
    if (childLen) {
      for (var i = 0; i < childLen; i++) {
        if (node.children[i].children.length) {
          this.searchLoneChild(node.children[i])
        }
      }
      this.searchNode.push(node.children[childLen - 1])
    }
    return this.searchNode
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
    if (checkReg.test(value.check.outerHTML)) {
      this.sjf._unlinkNodes.push(value)
    }
  }
}

export default compile
