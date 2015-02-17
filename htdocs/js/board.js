/*
 * 
 */

var Card = React.createClass({
 	getInitialState: function() {
 		  var s = {};
 		  if(typeof(this.props.value) !== "undefined") {
 		  	s.value = this.props.value;
 		  } else {
 		  	s.value = 99;
 		  }
          return s;
        },
 	render: function() {
          return (
            <div className="card">
              <span className="cardContents">
                {this.state.value}
              </span>
            </div>
          );
    }
});

var Board = React.createClass({
 	getInitialState: function() {
          return {
          	values: [1,2,3,5,8,13,20,40,100,'∞','?']
          };
        },
    render: function() {
    	var cards = {};
    	var i = 0;
    	this.state.values.forEach(function(cardValue){
    		cards[i] = <Card value={cardValue} />
    		++i;
    	});
    	return (
    		<div className="board">
    			{cards}
    		</div>
    	);

    }
});

