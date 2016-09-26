// application starts here

var EventEmitter = require('modules/EventEmitter');
window.ee = new EventEmitter();

var React = require('react');
var ReactDOM = require('react-dom');

var Parsers = require('modules/Parsers');
var ParsersList = require('components/ParsersList');
var KeywordsField = require('components/KeywordsField');
var ParseStartButton = require('components/ParseStartButton');
var ParsedItemsList = require('components/ParsedItemsList');

window.storage = chrome.storage.local;



var PageContent = React.createClass({
  backButtonClicked: function(e) {
    window.ee.emit('Nav.Back', {'value': e.target.value});
  },
  render: function() {
    var self = this;
    var pageToRender = this.props.pageNum;
    console.log('PageContent will render for page #' + pageToRender);

    var pageTemplate;
    switch (pageToRender) {
      case 1:
        pageTemplate = <div>
          {/*Parsers:<br />*/}
          {/*<ParsersList data={Parsers.list} />*/}
          <KeywordsField data={this.props.keywordsData}/>
          <ParseStartButton />
        </div>;
        break;
      case 2:
        pageTemplate = <div>
          <button onClick={this.backButtonClicked}>Back</button>
          <ParsedItemsList items={this.props.parsedItems}/>
        </div>
    }

    return(
      <div id="content" className="content">
        <h2>Page content!</h2>
        {pageTemplate}
      </div>
    );
  }
});

var App = React.createClass({
  getInitialState: function() {
    return {
      page: 1,
      keywords: undefined,
      parsedItems: undefined
    };
  },
  componentDidMount: function() {
    var self = this;
    window.ee.addListener('Action.Parse', function(data) {
      console.log('data: ', data);

      chrome.runtime.sendMessage('Parse.Start', function(parsedItems) {
        console.log(parsedItems);
        self.setState({parsedItems: parsedItems});
      });

      self.setState({page: 2});
      console.log('event Action.Parse catched!', self.state.page);
    });

    window.ee.addListener('Nav.Back', function(data) {
      console.log('Back button pressed');
      self.setState({page: self.state.page - 1});
    });

    window.ee.addListener('Keywords.Blur', function(data) {
      console.log('data: ', data);
      self.setState({keywords: data.value});
    });
  },
  componentWillUnmount: function() {
    window.ee.removeListener('Action.Parse');
  },
  render: function() {
    return(
      <div>
        <PageContent pageNum={this.state.page}
                     keywordsData={this.state.keywords}
                     parsedItems={this.state.parsedItems}
        />
      </div>
    )
  }
});


setTimeout(function() {
  $('body.splash').removeClass('splash').addClass('app');

  ReactDOM.render(
  <App />,
    document.getElementById('page')
  )},
  1000);