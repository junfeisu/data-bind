var test = new sjfDataBind({
  el: '#test',
  data: {
    lists: ['test', 'test']
  },
  methods: {
    add: function () {
      this.lists.push('hahha')
    }
  }
})