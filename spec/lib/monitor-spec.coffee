describe 'Monitor', ->

  Given -> @Monitor = requireSubject 'lib/monitor', {}

  describe '#', ->

    When -> @res = @Monitor()
    Then -> expect(@res instanceof @Monitor).toBe true

  describe 'prototype', ->

    Given -> @monitor = @Monitor()
    Given -> @bus = require('bus.io')()

    describe '# (bus:Bus)', ->

      Given -> spyOn @monitor, 'middleware'
      When -> @monitor @bus
      Then -> expect(@monitor.middleware).toHaveBeenCalledWith @bus

    describe '#middleware (bus:Bus)', ->


