var test = new Sjf.default({
  el: '#test',
  data: {
    lists: ['test', 'hhh']
  },
  methods: {
    add: function () {
      console.log(this)
      this._data.lists.push('jjj is a sb')
    }
  }
})

// var abc = new sjfDataBind({
//   el: '#sjf',
//   data: {
//     sjfs: ['123', '234']
//   }
// })
