 import link from './link'
 import util from './utils'

 class compile {
  // 递归DOM树
  constructor (parent, sjf) {
    this.sjf = sjf
    this.searchNode = []
    this.rootContent = this.sjf._el.innerHTML
    this.traverseElement(parent, null, true)
  }

  traverseElement (parent, lastNode, isFirst) {
    if (isFirst) {
      if (!parent.children.length) {
        this.compileNode()
        return
      }
    } else {
      parent.removeChild(lastNode)
      if (parent === this.sjf._el) {
        if (!parent.children.length) {
          return
        }
      }
    }

    let child = parent.children
    let childLen = child.length
    if (childLen) {
      for (var i = childLen - 1; i >= 0; i--) {
        let node = child[i]
        if (!node) {
          if (parent === this.sjf._el && i === 0) {
            return
          } else {
            this.compileNode()
            return
          }
        }
        if (node.children.length) {
          var searchNode = this.searchLoneChild(node)[0]
          this.sjf._uncompileNodes.push({
            check: searchNode, 
            search: searchNode, 
            parent: searchNode.parentNode
          })
          this.searchNode = []
          this.traverseElement(searchNode.parentNode, searchNode, false)
        } else {
          this.sjf._uncompileNodes.push({
            check: node, 
            search: node, 
            parent: node.parentNode
          })
          this.traverseElement(node.parentNode, node, false)
        }
      }
    } else {
      this.sjf._uncompileNodes.push({
        check: parent, 
        search: parent, 
        parent: parent.parentNode
      })
      this.traverseElement(parent.parentNode, parent, false)
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
    // this.sjf._el.innerHTML = this.rootContent
    let hasUncompile = this.sjf._uncompileNodes.length
    if (hasUncompile) {
      this.sjf._uncompileNodes.forEach(value => {
        this.hasDirective(value)
      })
    }
    console.log(this.sjf._uncompileNodes)
    new link(this.sjf)
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
