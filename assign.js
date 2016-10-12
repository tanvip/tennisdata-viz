window.addEventListener('message', function(e) {
    var opts = e.data.opts,
        data = e.data.data;

    return main(opts, data);
});

var defaults = {
    margin: {top: 24, right: 0, bottom: 0, left: 0},
    rootname: "TOP",
    format: ",d",
    title: "",
    width: 900,
    height: 400
};

function main(o, data) {
  var root,
      opts = $.extend(true, {}, defaults, o),
      formatNumber = d3.format(opts.format),
      rname = opts.rootname,
      margin = opts.margin,
      theight = 36 + 16;

  $('#chart').width(opts.width).height(opts.height);
  var width = opts.width - margin.left - margin.right,
      height = opts.height - margin.top - margin.bottom - theight,
      transitioning;

  var color = d3.scale.category20c();

  var x = d3.scale.linear()
      .domain([0, width])
      .range([0, width]);

  var y = d3.scale.linear()
      .domain([0, height])
      .range([0, height]);

  var treemap = d3.layout.treemap()
      .children(function(d, depth) { return depth ? null : d._children; })
      .sort(function(a, b) { return a.value - b.value; })
      .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
      .round(false);

  var svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.bottom + margin.top)
      .style("margin-left", -margin.left + "px")
      .style("margin.right", -margin.right + "px")
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .style("shape-rendering", "crispEdges");

  var grandparent = svg.append("g")
      .attr("class", "grandparent");

  grandparent.append("rect")
      .attr("y", -margin.top)
      .attr("width", width)
      .attr("height", margin.top);

  grandparent.append("text")
      .attr("x", 6)
      .attr("y", 6 - margin.top)
      .attr("dy", ".75em");

  if (opts.title) {
    $("#chart").prepend("<p class='title'>" + opts.title + "</p>");
  }
  if (data instanceof Array) {
    root = { key: rname, values: data };
  } else {
    root = data;
  }

  initialize(root);
  accumulate(root);
  layout(root);
  display(root);

  if (window.parent !== window) {
    var myheight = document.documentElement.scrollHeight || document.body.scrollHeight;
    window.parent.postMessage({height: myheight}, '*');
  }

  function initialize(root) {
    root.x = root.y = 0;
    root.dx = width;
    root.dy = height;
    root.depth = 0;
  }

  // Aggregate the values for internal nodes. This is normally done by the
  // treemap layout, but not here because of our custom implementation.
  // We also take a snapshot of the original children (_children) to avoid
  // the children being overwritten when when layout is computed.
  function accumulate(d) {
    return (d._children = d.values)
        ? d.value = d.values.reduce(function(p, v) { return p + accumulate(v); }, 0)
        : d.value;
  }

  // Compute the treemap layout recursively such that each group of siblings
  // uses the same size (1×1) rather than the dimensions of the parent cell.
  // This optimizes the layout for the current zoom state. Note that a wrapper
  // object is created for the parent node for each group of siblings so that
  // the parent’s dimensions are not discarded as we recurse. Since each group
  // of sibling was laid out in 1×1, we must rescale to fit using absolute
  // coordinates. This lets us use a viewport to zoom.
  function layout(d) {
    if (d._children) {
      treemap.nodes({_children: d._children});
      d._children.forEach(function(c) {
        c.x = d.x + c.x * d.dx;
        c.y = d.y + c.y * d.dy;
        c.dx *= d.dx;
        c.dy *= d.dy;
        c.parent = d;
        layout(c);
      });
    }
  }

  function display(d) {
    grandparent
        .datum(d.parent)
        .on("click", transition)
      .select("text")
        .text(name(d));

    var g1 = svg.insert("g", ".grandparent")
        .datum(d)
        .attr("class", "depth");

    var g = g1.selectAll("g")
        .data(d._children)
      .enter().append("g");

    g.filter(function(d) { return d._children; })
        .classed("children", true)
        .on("click", transition);

    var children = g.selectAll(".child")
        .data(function(d) { return d._children || [d]; })
      .enter().append("g");

    children.append("rect")
        .attr("class", "child")
        .call(rect)
      .append("title")
        .text(function(d) { return d.key + " (" + formatNumber(d.value) + ")"; });
    children.append("text")
        .attr("class", "ctext")
        .text(function(d) { return d.key; })
        .call(text2);

    g.append("rect")
        .attr("class", "parent")
        .call(rect);

    var t = g.append("text")
        .attr("class", "ptext")
        .attr("dy", ".5em")

    t.append("tspan")
        .text(function(d) {
          return d.key;
        });
    /*t.append("tspan")
        .attr("dy", "1.0em")
        .text(function(d) { return formatNumber(d.value); });*/
    t.call(text);

    g.selectAll("rect")
        .style("fill", function(d) { return color(d.key); });

    function transition(d) {
      if (transitioning || !d) return;
      transitioning = true;

      var g2 = display(d),
          t1 = g1.transition().duration(750),
          t2 = g2.transition().duration(750);

      // Update the domain only after entering new elements.
      x.domain([d.x, d.x + d.dx]);
      y.domain([d.y, d.y + d.dy]);

      // Enable anti-aliasing during the transition.
      svg.style("shape-rendering", null);

      // Draw child nodes on top of parent nodes.
      svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

      // Fade-in entering text.
      g2.selectAll("text").style("fill-opacity", 0);

      // Transition to the new view.
      t1.selectAll(".ptext").call(text).style("fill-opacity", 0);
      t1.selectAll(".ctext").call(text2).style("fill-opacity", 0);
      t2.selectAll(".ptext").call(text).style("fill-opacity", 1);
      t2.selectAll(".ctext").call(text2).style("fill-opacity", 1);
      t1.selectAll("rect").call(rect);
      t2.selectAll("rect").call(rect);

      // Remove the old node when the transition is finished.
      t1.remove().each("end", function() {
        svg.style("shape-rendering", "crispEdges");
        transitioning = false;
      });
    }
    detailedGraph(d);
    return g;
  }

  function detailedGraph(d) {
    d3.select("#graph")[0][0].innerHTML = ("");
    var data1y1, data1y2, data2y1, data2y2;
    switch(d.key) {
      case "Total Matches Played":
      //level 1
      var totald = 0, winnerd = 0, error = 0, fpd = 0, spd = 0, returnd = 0, breakd = 0;
      for(var x = 0; x < treedata.length; x++) {
        var str1 = treedata[x].matchlist.split(" vs ")[0].trim();
        var str2 = treedata[x].matchlist.split(" vs ")[1].trim();
        if(str1 === "Novak Djokovic" || str2 === "Novak Djokovic") {
        var opp = str1 === "Novak Djokovic" ? str2 : str1;

            totald = totald + playerCards[opp].tTotal / playerCards[opp].totalMatches;
            winnerd = winnerd + playerCards[opp].tWinner/ playerCards[opp].totalMatches;
            error = error + playerCards[opp].tError/ playerCards[opp].totalMatches;
            fpd = fpd + playerCards[opp].tFirstPtWon/ playerCards[opp].totalMatches;
            spd = spd + playerCards[opp].tSecondPtWon/ playerCards[opp].totalMatches;
            returnd = returnd + playerCards[opp].totalReturn/ playerCards[opp].totalMatches;
            breakd = breakd + playerCards[opp].tbreak/ playerCards[opp].totalMatches;
      }
    }
      data1y1 = [0, 0, 113, 35, 0, 0, 34];
      data1y2 = [74, 57, 0, 0, 43, 50, 0];
      data2y1 = [0, 0, totald / treedata.length, winnerd / treedata.length, 0, 0, error / treedata.length];
      data2y2 = [fpd / treedata.length, spd / treedata.length, 0, 0, returnd / treedata.length, breakd / treedata.length, 0];
      console.log(data2y1, data2y2);
      break;
      default:
        if(d.key.indexOf(' ') > 0) {
          data1y1 = [0, 0, 113, 35, 0, 0, 34];
          data1y2 = [74, 57, 0, 0, 43, 50, 0];
          data2y1 = [0, 0, 113, 35, 0, 0, 34];
          data2y2 = [74, 57, 0, 0, 43, 50, 0];
          // level 3
        } else {
          var totald = 0, winnerd = 0, error = 0, fpd = 0, spd = 0, returnd = 0, breakd = 0;
          var totaldN = 0, winnerdN = 0, errorN = 0, fpdN = 0, spdN = 0, returndN = 0, breakdN = 0;
          var N = "Novak Djokovic";
          var counter=0;
          //console.log('year');
          //level 2
          for(var x = 0; x < treedata.length; x++) {
            var year = treedata[x].year;
            if(year == Number(d.key)) {
              var str1 = treedata[x].matchlist.split(" vs ")[0].trim();
              var str2 = treedata[x].matchlist.split(" vs ")[1].trim();
              if(str1 === "Novak Djokovic" || str2 === "Novak Djokovic") {
              var opp = str1 === "Novak Djokovic" ? str2 : str1;
               totald = totald + playerCards[opp].tTotal / playerCards[opp].totalMatches;
               winnerd = winnerd + playerCards[opp].tWinner/ playerCards[opp].totalMatches;
               error = error + playerCards[opp].tError/ playerCards[opp].totalMatches;
               fpd = fpd + playerCards[opp].tFirstPtWon/ playerCards[opp].totalMatches;
               spd = spd + playerCards[opp].tSecondPtWon/ playerCards[opp].totalMatches;
               returnd = returnd + playerCards[opp].totalReturn/ playerCards[opp].totalMatches;
               breakd = breakd + playerCards[opp].tbreak/ playerCards[opp].totalMatches;

               totaldN = totaldN + playerCards[N].tTotal / playerCards[N].totalMatches;
               winnerdN = winnerdN + playerCards[N].tWinner/ playerCards[N].totalMatches;
               errorN = errorN + playerCards[N].tError/ playerCards[N].totalMatches;
               fpdN = fpdN + playerCards[N].tFirstPtWon/ playerCards[N].totalMatches;
               spdN = spdN + playerCards[N].tSecondPtWon/ playerCards[N].totalMatches;
               returndN = returndN + playerCards[N].totalReturn/ playerCards[N].totalMatches;
               breakdN = breakdN + playerCards[N].tbreak/ playerCards[N].totalMatches;
               counter++;
            }
          }
          }
          data1y1 = [0, 0, totaldN / counter, winnerdN / counter, 0, 0, errorN / counter];
          data1y2 = [fpdN / counter, spdN / counter, 0, 0, returndN / counter, breakdN / counter, 0];
          data2y1 = [0, 0, totald / counter, winnerd / counter, 0, 0, error / counter];
          data2y2 = [fpd / counter, spd / counter, 0, 0, returnd / counter, breakd / counter, 0];
        }
      break;
    }
    var m = [80, 80, 80, 80]; // margins
		var w = 900 - m[1] + m[3];	// width
		var h = 400 - m[0] - m[2]; // height

		// create a simple data array that we'll plot with a line (this array represents only the Y values, X will just be the index location)

    var x = d3.scale.ordinal()
    .domain(["First Point Won", "Second Point Won", "Total", "Winner", "Return", "Break", "Error"])
    .rangePoints([0, width]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");
		// X scale will fit all values from data[] within pixels 0-w
		//var x = d3.scale.tickFormat(function(d) { return xAxx[d].keyword; });
		// Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
		var y1 = d3.scale.linear().domain([0, 300]).range([h, 0]); // in real world the domain would be dynamically calculated from the data
		var y2 = d3.scale.linear().domain([0, 100]).range([h, 0]);  // in real world the domain would be dynamically calculated from the data
			// automatically determining max range can work something like this
			// var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);
      var x1 = d3.scale.linear().domain([0, 6]).range([0, w]);

		// create a line function that can convert data[] into x and y points
		var line1 = d3.svg.line()
			// assign the X function to plot our line as we wish
			.x(function(d,i) {
				// verbose logging to show what's actually being done
			//	console.log('Plotting X1 value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
				// return the X coordinate where we want to plot this datapoint
				return x1(i);
			})
			.y(function(d) {
				// verbose ly1ogging to show what's actually being done
				//console.log('Plotting Y1 value for data point: ' + d + ' to be at: ' + y1(d) + " using our y1Scale.");
				// return the Y coordinate where we want to plot this datapoint
				return y1(d);
			})

		// create a line function that can convert data[] into x and y points
		var line2 = d3.svg.line()
			// assign the X function to plot our line as we wish
			.x(function(d,i) {
				// verbose logging to show what's actually being done
			//	console.log('Plotting X2 value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
				// return the X coordinate where we want to plot this datapoint
				return x1(i);
			})
			.y(function(d) {
				// verbose logging to show what's actually being done
			//	console.log('Plotting Y2 value for data point: ' + d + ' to be at: ' + y2(d) + " using our y2Scale.");
				// return the Y coordinate where we want to plot this datapoint
				return y2(d);
			})


			// Add an SVG element with the desired dimensions and margin.
			var graph = d3.select("#graph").append("svg:svg")
			      .attr("width", w + m[1] + m[3])
			      .attr("height", h + m[0] + m[2])
			    .append("svg:g")
			      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

			// create yAxis
		    //var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true);
			// Add the x-axis.
			graph.append("svg:g")
			      .attr("class", "x axis")
			      .attr("transform", "translate(0," + h + ")")
			      .call(xAxis);


			// create left yAxis
			var yAxisLeft = d3.svg.axis().scale(y1).ticks(4).orient("left");
			// Add the y-axis to the left
			graph.append("svg:g")
			      .attr("class", "y axis axisLeft")
			      .attr("transform", "translate(-15,0)")
			      .call(yAxisLeft);

	  		// create right yAxis
	  		var yAxisRight = d3.svg.axis().scale(y2).ticks(6).orient("right");
  			// Add the y-axis to the right
  			graph.append("svg:g")
  			      .attr("class", "y axis axisRight")
  			      .attr("transform", "translate(" + (w+15) + ",0)")
  			      .call(yAxisRight);

			// add lines
			// do this AFTER the axes above so that the line is above the tick-lines
  			graph.append("svg:path").attr("d", line1(data1y1)).attr("class", "data1y1");
  			graph.append("svg:path").attr("d", line2(data1y2)).attr("class", "data1y2");
        graph.append("svg:path").attr("d", line1(data2y1)).attr("class", "data2y1");
  			graph.append("svg:path").attr("d", line2(data2y2)).attr("class", "data2y2");
  }

  function text(text) {
    text.selectAll("tspan")
        .attr("x", function(d) { return x(d.x) + 6; })
    text.attr("x", function(d) { return x(d.x) + 6; })
        .attr("y", function(d) { return y(d.y) + 6; })
        .style("opacity", function(d) { return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 1; })
  }

  function text2(text) {
    text.attr("x", function(d) { return x(d.x + d.dx) - this.getComputedTextLength() - 6; })
        .attr("y", function(d) { return y(d.y + d.dy) - 6; })
        .style("opacity", function(d) { return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 0 : 0; });
  }

  function rect(rect) {
    rect.attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y); })
        .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
        .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
  }

  function name(d) {
    return d.parent
        ? name(d.parent) + " / " + d.key + " (" + formatNumber(d.value) + ")"
        : d.key + " (" + formatNumber(d.value) + ")";
  }
}

if (window.location.hash === "") {
            var data = d3.nest().key(function(d) { return d.year; }).key(function(d) { return d.matchlist; }).entries(treedata);
            main({title: "Everything about Novak Djokovic you want to know"}, {key: "Total Matches Played", values: data});
}
