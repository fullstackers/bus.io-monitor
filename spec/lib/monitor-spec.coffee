events = require 'events'

describe 'Monitor', ->

  Given ->
    @Report = class Report
      constructor: ->
        if not (@ instanceof Report)
          return new Report
      data: -> in: 1
      populate: ->
        @_data =
          in: 1
  Given -> @app = listen: ->

  Given -> @Monitor = requireSubject 'lib/monitor', {
    './report': @Report
    './../app': @app
  }

  Then -> expect(@Monitor.Report).toEqual @Report

  describe '#', ->

    When -> @res = @Monitor()
    Then -> expect(@res instanceof @Monitor).toBe true
    And -> expect(@res instanceof events.EventEmitter).toBe true

  describe '# (options:Object)', ->

    Given -> @options = actor: 'me', target: 'you', action:'report', interval:1000
    When -> @res = @Monitor @options
    Then -> expect(@res instanceof @Monitor).toBe true
    And -> expect(@res instanceof events.EventEmitter).toBe true
    And -> expect(@res.options).toEqual @options

  describe 'prototype', ->

    Given -> @monitor = @Monitor()
    Given -> spyOn(@monitor,'emit').andCallThrough()
    Given -> @bus = require('bus.io')()
    Given -> @message = require('bus.io-common').Message()
    Given -> @socket = new events.EventEmitter
    Given -> @next = jasmine.createSpy('next')

    describe '# (bus:Bus)', ->

      Given -> spyOn @monitor, 'middleware'
      When -> @monitor @bus
      Then -> expect(@monitor.middleware).toHaveBeenCalledWith @bus

    describe '#middleware (bus:Bus)', ->

      Given -> spyOn(@monitor,'setInterval')
      Given -> spyOn(@bus.incomming(), 'use').andCallThrough()
      Given -> spyOn(@bus.incomming(), 'addListener').andCallThrough()
      Given -> spyOn(@bus.processing(), 'use').andCallThrough()
      Given -> spyOn(@bus.processing(), 'addListener').andCallThrough()
      Given -> spyOn(@bus.outgoing(), 'use').andCallThrough()
      Given -> spyOn(@bus.outgoing(), 'addListener').andCallThrough()
      When -> @monitor.middleware @bus
      Then -> expect(@bus.incomming().use).toHaveBeenCalledWith @monitor.onIncomming
      And -> expect(@bus.incomming().addListener).toHaveBeenCalledWith 'consumed', @monitor.onIncommingConsumed
      And -> expect(@bus.processing().use).toHaveBeenCalledWith @monitor.onProcessing
      And -> expect(@bus.processing().addListener).toHaveBeenCalledWith 'consumed', @monitor.onProcessingConsumed
      And -> expect(@bus.outgoing().use).toHaveBeenCalledWith @monitor.onOutgoing
      And -> expect(@bus.outgoing().addListener).toHaveBeenCalledWith 'consumed', @monitor.onOutgoingConsumed
      And -> expect(@monitor.setInterval).toHaveBeenCalled()

    describe '#onIncomming (message:Message, socket:EventEmitter, next:Function)', ->

      When -> @monitor.onIncomming @message, @socket, @next
      Then -> expect(@monitor.emit).toHaveBeenCalledWith 'data', ['in', @message.actor(), @message.action(), @message.target()]
      And -> expect(@next).toHaveBeenCalled()

    describe '#onProcessing (message:Message, socket:EventEmitter, next:Function)', ->

      When -> @monitor.onProcessing @message, @next
      Then -> expect(@monitor.emit).toHaveBeenCalledWith 'data', ['on', @message.actor(), @message.action(), @message.target()]
      And -> expect(@next).toHaveBeenCalled()

    describe '#onOutgoing (message:Message, socket:EventEmitter, next:Function)', ->

      When -> @monitor.onOutgoing @message, @socket, @next
      Then -> expect(@monitor.emit).toHaveBeenCalledWith 'data', ['out', @message.actor(), @message.action(), @message.target()]
      And -> expect(@next).toHaveBeenCalled()

    describe '#onIncommingConsumed (message:Message)', ->

      When -> @monitor.onIncommingConsumed @message
      Then -> expect(@monitor.emit).toHaveBeenCalledWith 'data', ['inc', @message.actor(), @message.action(), @message.target()]

    describe '#onProcessingConsumed (message:Message)', ->

      When -> @monitor.onProcessingConsumed @message
      Then -> expect(@monitor.emit).toHaveBeenCalledWith 'data', ['onc', @message.actor(), @message.action(), @message.target()]

    describe '#onOutgoingConsumed (message:Message)', ->

      When -> @monitor.onOutgoingConsumed @message
      Then -> expect(@monitor.emit).toHaveBeenCalledWith 'data', ['outc', @message.actor(), @message.action(), @message.target()]

    describe '#onData (data:Array)', ->

      Given -> @data = ['in', @message.actor(), @message.action(), @message.target()]
      Given -> spyOn(@monitor.report(),'populate')
      When -> @monitor.onData @data
      Then -> expect(@monitor.report().populate).toHaveBeenCalledWith @data

    describe '#report (report:Report)', ->

      Given -> @report = @Report()
      When -> @res = @monitor.report @report
      Then -> expect(@res).toEqual @monitor

    describe '#report (report:Report)', ->

      Given -> @report = @Report()
      When -> @res = @monitor.report(@report).report()
      Then -> expect(@res).toEqual @report

    describe '#tick', ->

      Given -> @monitor @bus
      Given -> @builder = require('bus.io-common').Builder()
      Given -> spyOn(@builder,'deliver')
      Given -> spyOn(@bus,'message').andReturn(@builder)
      Given -> @monitor.onIncomming @message, @socket, @next
      Given -> @monitor.onIncommingConsumed @message
      Given -> @monitor.onProcessing @message, @next
      Given -> @monitor.onProcessingConsumed @message
      Given -> @monitor.onOutgoing @message, @socket, @next
      Given -> @monitor.onOutgoingConsumed @message
      Given -> @report = @monitor.report()
      When -> @res = @monitor.tick()
      Then -> expect(@monitor.emit).toHaveBeenCalledWith 'report', @report
      And -> expect(@monitor.report()).not.toEqual @report
      And -> expect(@res).toEqual @monitor
      And -> expect(@bus.message).toHaveBeenCalled()
      And -> expect(@builder.deliver).toHaveBeenCalled()

    describe '#app', ->

      When -> @res = @monitor.app()
      Then -> expect(typeof @res.listen).toBe 'function'

    describe '#setInterval', ->

      Given -> @a = @monitor.setInterval()
      When -> @b = @monitor.setInterval()
      Then -> expect(@a).toEqual @b

    describe '#clearInterval', ->

      Given -> @a = @monitor.setInterval()
      When -> @monitor.clearInterval()
      Then -> expect(@a._repeat).toBe false
