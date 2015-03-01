events = require 'events'

describe 'Timeline', ->

  Given ->
    @Report = class Report
      constructor: ->
        if not (@ instanceof Report)
          return new Report
      data: -> in: 1
      populate: ->
        @_data =
          in: 1

  Given -> @Timeline = requireSubject 'lib/timeline', {
    './report': @report
  }

  Then -> expect(@Timeline.Report).toEqual @Report

  describe '#', ->

    When -> @res = @Timeline()
    Then -> expect(@res instanceof @Timeline).toBe true
    And -> expect(@res instanceof events.EventEmitter).toBe true

  describe 'prototype', ->
