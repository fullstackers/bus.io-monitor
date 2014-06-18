xdescribe 'Report', ->

  Given -> @Report = requireSubject 'lib/report', {}

  describe '#', ->

    Given -> @res = @Report()
    Then -> expect(@res instanceof @Report).toBe true

  describe 'prototoype', ->

    Given -> @report = @Report()

    describe '#data', ->

      When -> @res = @report.data()
      Then -> expect(@res).toEqual {}

    describe '#data (key:String, value:Number)', ->

      When -> @report.data 'key', 1
      Then -> expect(@report.data()).toEqual key: 1

    describe '#data (key:String)', ->

      Given -> @report.data 'key', 1
      When -> @res = @report.data 'key'
      Then -> expect(@res).toEqual 1

    describe '#combine (report:Report)', ->

      Given -> @report.data 'total', 1
      Given -> @another = @Report()
      Given -> @another.data 'total', 2
      When -> @report.combine @another
      Then -> expect(@report.data('total')).toBe 2

    describe '#populate (data:Array)', ->

      Given -> @data = ['a', 'b', 'c']
      When -> @report.populate @data
      Then -> expect(@report.data('a')).toBe 1
      Then -> expect(@report.data('a.b')).toBe 1
      Then -> expect(@report.data('a.b.c')).toBe 1
