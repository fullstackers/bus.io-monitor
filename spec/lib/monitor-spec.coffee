events = require 'events'

describe 'Monitor', ->

  Given -> @Monitor = requireSubject 'lib/monitor', {}

  describe '#', ->

    When -> @res = @Monitor()
    Then -> expect(@res instanceof @Monitor).toBe true
    And -> expect(@res instanceof events.EventEmitter).toBe true

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
