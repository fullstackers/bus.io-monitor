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
  var key, i;
  for (i=0; i<data.length; i++) {
    key = this.key(data.slice(0,i+1));
    this.data(key, (this.data(key) || 0) + 1);
  }
  return this;
};

/**
 * Generates a key into the report
 *
 * @param {Array} data
 * @return String
 */

Report.prototype.key = function (data) {
  if ('object' !== typeof data || !(data instanceof Array)) {
    throw new Error('data must be an Array');
  }
  var key = '', i;
  for (i=0; i<data.length; i++) {
    if (key.length) key = key + '.';
    key = key + String(data[i]).replace(/[^\w]+/g,'_');
  }
  return key;
};

/**
 * Creates a diff between the reports, which will be another Report
 *
 * @param {Report} report
 * @return Report
 */

Report.prototype.diff = function (report) {
  var diff = {}, a = this.data(), b = report.data()
    , keys = Object.getOwnPropertyNames(a).concat(Object.getOwnPropertyNames(b)), k, i;
 for (i=0; i<keys.length; i++) {
    k = keys[i];
    if (k in a && k in b) {
      diff[k] = a[k] - b[k];
    }
    else {
      diff[k] = a[k] || b[k];
    }
  }
  return Report(diff);
};
