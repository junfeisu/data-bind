var test = new sjfDataBind({
  el: '#test',
  data: {
    lists: ['test', 'hhh']
  },
  methods: {
    add: function () {
      this.lists.push(['31231'])
    }
  }
})

var abc = new sjfDataBind({
  el: '#sjf',
  data: {
    sjfs: ['123', '234']
  }
})