import option from './option'
import render from './render'
import util from './utils'

class link {
  constructor (sjf) {
    let extractReg = /sjf-[a-z]+=\"[^"]+\"|\{\{.+\}\}/g

    this.sjf = sjf
    this.sjf._unlinkNodes.map(value => {
      let directives = []

      value.nodeType === 'textNode' ? directives = value.check.data.match(extractReg) 
        : directives = value.check.cloneNode().outerHTML.match(extractReg)
      if (directives.length > 1) {
        let withNameDirectives = directives.map(directive => this.addDirectiveName(directive))

        util.sortExexuteQueue('name', withNameDirectives)
        withNameDirectives.map(directive => {
          this.extractDirective(directive.value, value)
        })
      } else {
        directives.map(directive => {
          this.extractDirective(directive, value)
        })
      }
    })

    this.sjf._unlinkNodes = []
    new render(this.sjf)
  }

  addDirectiveName (directive) {
    let slices = directive.split('=')
    let slicesLen = slices.length

    return slicesLen ? {name: slices[0], value: directive} : {name: 'sjf-text', value: directive}
  }

  // 提取指令
  extractDirective (directive, node) {
    let slices = directive.split('=')
    // 如果是事件就直接通过addEventListener进行绑定
    if (option.sjfEvents.indexOf(slices[0]) >= 0) {
      let eventMes = {
        type: 'event',
        node: node,
        name: slices[0],
        func: slices[1]
      }
      this.sjf._unrenderNodes.push(eventMes)
    } else {
      let expression = slices[0].replace(/[\{\}]/g, '')
      let directiveName = 'sjf-text'
      // 对非{{}}这种表达式进行单独处理
      if (!/\{\{.+\}\}/.test(directive)) {
        expression = slices[1].replace(/\"/g, '')
        directiveName = slices[0]
      }
      this.sjf._unrenderNodes.push({
        type: 'directive',
        node: node, 
        directive: directiveName, 
        expression: expression
      })
    }
  }
}

export default link
