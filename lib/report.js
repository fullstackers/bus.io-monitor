module.exports = Report;

/**
 * A report contains the data from the monitoring
 *
 * @return Report
 */

function Report (data) {
  if (!(this instanceof Report)) return new Report(data);
  if (typeof data === 'object') {
    if (data instanceof Report)
      return data;
    this._data = data;
  }
}

/**
 * Sets / Gets the data
 *
 * @param {String} k
 * @param {Number} v
 * @return mixed
 */

Report.prototype.data = function (k, v) {
  this._data = this._data || {};
  if (typeof k === 'string') {
    if (typeof v === 'number') {
      this._data[k] = v || 1;
      return this;
    }
    return this._data[k];
  }
  return this._data;
};

/**
 * Combines a report into this one
 *
 * @param {Report} report
 * @return Report
 */

Report.prototype.combine = function (report) {
  var data = report.data();
  for (var k in data) this.data(k, (this.data(k) || 0) + data[k]);
  return this;
};

/**
 * Populates the data
 *
 * @param {Array} data
 * @return Report
 */

Report.prototype.populate = function (data) {
  var key = '';
  data = data || [];
  for (var i=0; i<data.length; i++) {
    if (key.length) {
      key += '.';
    }
    key += data[i];
    this.data(key, (this.data(key) || 0) + 1);
  }
  return this;
};
