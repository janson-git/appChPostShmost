var React = require('react');

var KeywordsField = React.createClass({
  onBlur: function(e) {
    console.log(e.target.value);
    window.ee.emit('Keywords.Blur', {'value': e.target.value});
    window.storage.set({keywords: e.target.value}, function() {
      console.log('keywords saved to storage');
    })
  },
  render: function() {
    var val = (this.props.data !== undefined) ? this.props.data : '';
    return (
      <div>
        <label htmlFor="keywords">Keywords:</label><br />
        <textarea name="keywords" onBlur={this.onBlur} defaultValue={val} cols="50" rows="4"/>
      </div>
    );
  }
});

module.exports = KeywordsField;