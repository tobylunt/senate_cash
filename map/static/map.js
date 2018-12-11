// set primary dimensions
var width = 1200,
    height = 750,
    radius = 80,
    active = d3.select(null);
    activesen = d3.select(null);

// define projection
var projection = d3.geo.albersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

// define primary zoom behavior
var zoom = d3.behavior.zoom()
    .translate([0, 0])
    .scale(1)
    .scaleExtent([1, 30])
    .on("zoom", zoomed);

// get map paths into a var
var path = d3.geo.path()
    .projection(projection);

// add the primary SVG box
var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id", "mapsvg")
    .on("click", stopped, true);

// set stroke width for senator avatar circles
var circle_stroke = 1.5

// g for holding header text
var titleHeader = svg.append("g")
    .attr("class","textHeader");

// add primary title bar
titleHeader.append("rect")
    .attr("class", "textHeader")
    .attr("width", width)
    .attr("height", 20)
    .style("fill", "none");

// amend the title bar with the heading
titleHeader.append("text")
    .attr("class", "textHeader_title")
    .attr("x", function(d){
	return width / 2})
    .attr("y", function(d){
	return 40})
    .text(function(d) {
	return "Senate Finance in the United States";
    })
    .style("fill", "#e5e1d8")
    .style("font-size", "50px")
    .style("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .style("font-family", "'Slabo 27px', serif");

// background rectangle within the svg, which resets on click
svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);

// append a "g" element (grouping) to the svg
var g = svg.append("g")
    .attr("id", "mapG");

// circle data (TMP)
//var jsonCircles = [
//    { "x_axis": 100, "y_axis": 30, "radius": radius, "color" : "blue", "img" : "https://cdn.civil.services/senate/headshots/512x512/tammy-baldwin.jpg" },
//    { "x_axis": -100, "y_axis": 100, "radius": radius, "color" : "red", "img" : "https://cdn.civil.services/senate/headshots/512x512/ron-johnson.jpg"}];

// arrange primary zooming function
svg
//    .call(zoom) // uncomment this line to enable free zooming
    .call(zoom.event);

// bring in json map - N.B.: hardcoded location
d3.json("/static/us.json", function(error, us) { 
    if (error) throw error;

    g.selectAll("path")
	.data(topojson.feature(us, us.objects.states).features)
	.enter().append("path")
	.attr("d", path)
	.attr("class", "feature")
    	.attr("id", function (d) { return d.id; })
	.on("click", clicked);

    g.append("path")
	.datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
	.attr("class", "mesh")
	.attr("d", path);
});

// clicked is the click engagement function for state features
function clicked(d) {

    // clean up any previously active states (i.e. clicking from one state to another)
    if (active.node() === this) return reset(); // resets when you click on an active state
    g.selectAll(".nodes_box") // this makes the circles over a previously active state disappear when a new state is clicked
        .remove()
    active.classed("active", false); // this makes any other clicked state inactive when a new state is clicked
    active = d3.select(this).classed("active", true); // add "active" class to this selection, and store in reference named "active"

    // set the scaling and transition on click
    var bounds = path.bounds(d),
	dx = bounds[1][0] - bounds[0][0],
	dy = bounds[1][1] - bounds[0][1],
	x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
        translate = [width / 2 - scale * x, height / 2 - scale * y];

    // duraton and call translation
    svg.transition()
        .duration(1250) // duration from "off" to "on"
        .call(zoom.translate(translate).scale(scale).event);

    // add grouped objects for all of the nodes (two per state, one per senator)
    var node = d3.select("#mapG").append("g")
	.attr("class", "nodes_box")
	.selectAll(".node")
	.data(jsonCircles)
	.enter().append("g")
	.attr("class", "node")
	.attr("cx", function(d) {
            return d.x_axis/scale + x;
	})
	.attr("cy", function(d) {
	    return d.y;
	})
        .style("opacity", 0)
      	.on("click", senator_clicked); // click function for senator sunburst

    // add the circle with outside stroke
    node.append("circle")
        .attr("cx", function (d) { return d.x_axis/scale + x; })
        .attr("cy", y)
        .attr("r", function (d) { return d.radius / scale; })
	.attr("class", "senate_center")
        .style("stroke", function(d) { return d.color; })
    	.style("fill", "none")

    // add the clipping circle- slightly smaller than the above to keep the full stroke width
    node.append("clipPath")
	.attr('id', function(d, i) {
	    return "clip" + i
	})
	.append("circle")
	.attr("class", "clip-path")
        .attr("cx", function (d) { return d.x_axis/scale + x; })
        .attr("cy", y)
        .attr("r", function (d) { return (d.radius - circle_stroke) / scale; });

    // add the image link from the json and clip it
    node.append("svg:image")
	.attr("class", "circle")
	.attr("xlink:href", d => d.img)
	.attr("clip-path", function(d, i) {
	    return "url(#clip" + i + ")"
	})
	.attr("x", function(d) {
            return d.x_axis/scale + x - 2 * (d.radius / scale / 2);
	})
	.attr("y", function(d) {
	    return y - 2 * (d.radius / scale / 2);
	})
	.attr("width", function(d) {
	    return d.radius / scale * 2;
	})
	.attr("height", function(d) {
	    return d.radius / scale * 2;
	});

    // fade in the senator circles
    g.selectAll(".node")
	.transition()
	.delay(function(d){ return 400; })
        .duration(600)
        .style("opacity", 1); 

    // fade out the text header on click
    svg.selectAll(".textHeader_title")
	.transition()
	.delay(function(d){ return 400; })
        .duration(600)
        .style("opacity", 0); 
}

// unclick function for states
function reset() {
    active.classed("active", false); // makes "active" selection inactive
    active = d3.select(null); // remove "active" selection

    // duration from "on" to "off"; translation back
    svg.transition()
	.duration(1250) 
	.call(zoom.translate([0, 0]).scale(1).event);

//    g.selectAll("circle")
    g.selectAll(".nodes_box")
	.remove();

    // make title card readable again
    svg.selectAll(".textHeader_title")
	.transition()
	.delay(function(d){ return 400; })
        .duration(600)
        .style("opacity", 1); 
}

// zooming function
function zoomed() {
    g.style("stroke-width", circle_stroke / d3.event.scale + "px"); // keeps stroke width constant
    g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); // zooms
}

// If the drag behavior prevents the default click,
// also stop propagation so we don’t click-to-zoom.
function stopped() {
    if (d3.event.defaultPrevented) d3.event.stopPropagation();
}

// click function for senators (circles)
function senator_clicked(d) {
    activesen.classed("active_sen", false); // make "activesen" selection inactive - i.e. if you click between two senators in the same state
    inactive_sen = d3.selectAll(".node")
	.classed("inactive_sen", true)
	.style("opacity", .1)
    activesen = d3.select(this)
	.classed("active_sen", true) // make this selection have "active_sen" class and store selection
	.classed("inactive_sen", false) // make this selection have "active_sen" class and store selection
    	.style("opacity", 1);
    
    // set the scaling and transition on click
    var sen_bounds = d3.select('.active_sen').node().getBBox(),
	sen_diam = sen_bounds.width, // same as sen_bounds.height, bc circle
	sen_rad = sen_bounds.width / 2, 
	sen_x = sen_bounds.x,
    	sen_y = sen_bounds.y,
	center_x = sen_x + sen_rad,
	center_y = sen_y + sen_rad,
	sen_scale = Math.max(1, Math.min(30, 0.49 / Math.max(sen_diam / width, sen_diam / height))),
	sen_translate = [width / 2 - sen_scale * center_x, height / 2 - sen_scale *  center_y];

    svg.transition()
        .duration(600) 
        .call(zoom.translate(sen_translate).scale(sen_scale).event);

    // activate the sunburst
    createSunburst(root);
}

// Breadcrumb dimension settings
var b = {
  w: 200, h: 30, s: 3, t: 10
};

// Main function to draw and set up sunburst visualization, passing in json data.
function createSunburst(json) {

    // set SVG size params - we use 'width' and 'height' from primary SVG defined at top
    var sunradius = Math.min(width, height) / 2;

    // set x and y scales
    var x = d3.scale.linear()
        .range([0, 2 * Math.PI]);
    var y = d3.scale.sqrt()
//    var y = d3.scale.linear() // linear scale to y makes the paths all equal thickness
        .range([0, sunradius]);

    // set color category
//    var color = d3.scale.category20c(); // old color scale
    var brewer = d3.entries(colorbrewer);
    var palette = brewer[34]; // select the colorbrewer scale we wish - see http://bl.ocks.org/emmasaunders/52fa83767df27f1fc8b3ee2c6d372c74
    
    // Basic setup of page elements.
    initializeBreadcrumbTrail();

    // create the sunburst svg
    var svgSunburst = d3.select("#mapsvg")
        .attr("svg_type", "sunburst") 
        .append("g") // add a g element to our SVG
        .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")"); // translate the "center" of our coordinate system to the middle of the svg

    // retrieve the specs of the active group containing our senator avatar
    var active_avatar = d3.select(".active_sen .senate_center")

    // add a background transparent rectangle to the SVG for onclick
    svgSunburst.append("rect")
	.attr("x", -width/2)
	.attr("y", -height/2)
        .attr("width", width)
        .attr("height", height)
        .attr("opacity", 0)
    	.attr("id", "bgRect")
        .on("mouseover", mouseleave) // clear opacity and breadcrumbs
        .on("click", sunburstRemove); // clear the SVG entirely on background click

    // add a background transparent circle to the SVG for onclick but WITHOUT mouseleave
    svgSunburst.append("circle")
	.attr("cy", active_avatar.cy)
	.attr("cx", active_avatar.cx)
    //    	.attr("r", active_avatar.r + Math.sqrt(active_avatar.r) + Math.sqrt(Math.sqrt(active_avatar.r)))
//        .attr("r", active_avatar.r)
    	.attr("r", 20) 
        .attr("opacity", 0)
    	.attr("id", "bgCirc")
        .on("click", sunburstRemove); // clear the SVG entirely on background click

    // helper function for killing sunburst SVG
    function sunburstRemove() {
	d3.selectAll("#sunpath").remove() // remove sunburst paths
	d3.selectAll("#bgRect").remove(); // remove background rectangle
	d3.selectAll(".node").classed("active_sen",false); // remove senate activity classes
	d3.selectAll(".node").classed("inactive_sen",false); // remove senate activity classes
	activesen = d3.select(null); // remove the activesen selection
	d3.selectAll(".node").style("opacity", 1); // reset avatars to full opacity

	// zoom back to center of state
	var sen_bounds = d3.select('.feature.active').node().getBBox(),
	    dx = sen_bounds.width, // same as sen_bounds.height, bc circle
	    dy = sen_bounds.height, // same as sen_bounds.height, bc circle
	    x = sen_bounds.x + (dx / 2),
    	    y = sen_bounds.y + (dy / 2),
            scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
            translate = [width / 2 - scale * x, height / 2 - scale * y];

	// transition the zoom back out
	svg.transition()
            .duration(600) 
            .call(zoom.translate(translate).scale(scale).event);
    }

    // partition the data
    var partition = d3.layout.partition()
        .sort(null)
        .value(function(d) { return 1; });

    // set how arcs will be calculated for paths
    var arc = d3.svg.arc()
        .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
        .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
        .innerRadius(function(d) { return Math.max(0, y(d.y)); })
        .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });
//        .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)) - 2; }); // separate the layer bands

    // Initialize and keep track of the node that is currently being displayed as the root.
    var node;
    node = json;

    // create nodes from full data - filtering out small ones
    var burst_nodes = partition.nodes(json)
        .filter(function(d) {
    	return (d.dx > 0.005); // 0.001 radians = 0.05 degrees
        })
    ;

    // find most basic connected node - for color consistency
    function getRootmostAncestorByRecursion(node) {
        return node.depth > 1 ? getRootmostAncestorByRecursion(node.parent) : node;
    }	 

    // helper function for assigning node_depth class to paths
    function getNodeDepth(node) {
        return node.depth;
    }	 

    // create and select paths
    var sunpath = svgSunburst.datum(json).selectAll("path")
        .data(burst_nodes)
        .enter().append("path")
        .attr("d", arc)
	.each(function(d, i) { d.index = i; })
        .attr("id", "sunpath")
        .attr("node_depth", function(d) { return getNodeDepth(d)}) // assign node depth to path class
        .style("stroke", "#232325")
        .style("stroke-width", .2)
        .style("stroke-alignment", "inner")
//        .style("fill", function(d) { return color(getRootmostAncestorByRecursion(d).name); }) // old colors - using d3 scale
        .style("fill", function(d,i) { return palette.value[12][getRootmostAncestorByRecursion(d).index] }) // selects colorbrewer colors in order for primary nodes, then gives those colors to all child nodes
        .style("opacity", 0)
        .on("click", click)
    	.on("mouseover", mouseover) // this creates the breadcrumbs
        .each(stash);

    // add paths from all of the input json data, on delay
    svgSunburst.datum(json).selectAll("path")    
	.transition()
	.delay(function(d){ return 400; })
        .duration(600)
        .style("opacity", function(d) { return getNodeDepth(d) == 0 ? 0 : getNodeDepth(d) / Math.pow(getNodeDepth(d),2); }); // make opacity dependent on node depth

    // On mouseover, fade all but the current sequence, and show it in the breadcrumb trail.
    function mouseover(d) {

	if(d3.select(this).style("opacity") != 0) {

	    // add up all child node sizes with present node for total value at this point in the tree
    	    var totSum = d.value; 

    	    var sequenceArray = getAncestors(d);
	    updateBreadcrumbs(sequenceArray, totSum);

	    // Fade all the segments by half
	    d3.selectAll("path")
	        .style("opacity", function(d) { return (getNodeDepth(d) / Math.pow(getNodeDepth(d),2)) / 2; })

	    // Then highlight only those that are an ancestor of the current segment.
	    svgSunburst.selectAll("path")
	        .filter(function(node) {
	            return (sequenceArray.indexOf(node) >= 0);
	        })
	        .style("opacity", 1);
	}
    }
    
    // Restore everything to full opacity when moving off the visualization.
    function mouseleave(d) {

	// Hide the breadcrumb trail
	d3.select("#trail")
            .style("visibility", "hidden");

	// Deactivate all segments during transition.
	d3.selectAll("path").on("mouseover", null);

	// Transition each segment to full opacity and then reactivate it.
	d3.selectAll("path")
            .transition()
            .duration(250)
	    .style("opacity", function(d) { return getNodeDepth(d) / Math.pow(getNodeDepth(d),2); })
            .each("end", function() {
                d3.select(this).on("mouseover", mouseover);
            });
    }

    // Given a node in a partition layout, return an array of all of its ancestor
    // nodes, highest first, but excluding the root.
    function getAncestors(node) {
	var sunpath = [];
	var current = node;
	while (current.parent) {
            sunpath.unshift(current);
            current = current.parent;
	}
	return sunpath;
    }

    // set up the top box for summary stats
    function initializeBreadcrumbTrail() {

	// Add the svg area.
	var trail = d3.select("#introspect").append("svg:svg")
            .attr("width", width)
            .attr("height", 50)
            .on("mouseover", mouseleave) // clear opacity and breadcrumbs
            .attr("id", "trail");

	// Add the label at the end, for the dollar total
	trail.append("svg:text")
            .attr("id", "endlabel")
    }

    // Generate a string that describes the points of a breadcrumb polygon.
    function breadcrumbPoints(d, i) {
	var points = [];
	points.push("0,0");
	points.push(b.w + ",0");
	points.push(b.w + b.t + "," + (b.h / 2));
	points.push(b.w + "," + b.h);
	points.push("0," + b.h);
	if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
            points.push(b.t + "," + (b.h / 2));
	}
	return points.join(" ");
    }

    // Update the breadcrumb trail to show the current sequence and dollar amount
    function updateBreadcrumbs(nodeArray, sumString) {

	// Data join; key function combines name and depth (= position in sequence).
	var g = d3.select("#trail")
            .selectAll("g")
            .data(nodeArray, function(d) { return d.name + d.depth; });

	// Add breadcrumb and label for entering nodes.
	var entering = g.enter().append("svg:g");

	// color and opacity of the breadcrumbs matches the sunburst
	entering.append("svg:polygon")
            .attr("points", breadcrumbPoints)
//            .style("fill", function(d) { return color(getRootmostAncestorByRecursion(d).name); })
	    .style("fill", function(d) { return palette.value[12][getRootmostAncestorByRecursion(d).index] })
            .style("opacity", function(d) { return getNodeDepth(d) == 0 ? 0 : getNodeDepth(d) / Math.pow(getNodeDepth(d),2); }) // make opacity dependent on node depth

	// position the text centered within each box
	entering.append("svg:text")
            .attr("x", (b.w + b.t) / 2)
            .attr("y", b.h / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .text(function(d) { return d.name; });

	// Set position for entering and updating nodes.
	g.attr("transform", function(d, i) {
            return "translate(" + i * (b.w + b.s) + ", 0)";
	});

	// Remove exiting nodes.
	g.exit().remove();

	// Now move and update the sum total at the end.
	d3.select("#trail").select("#endlabel")
            .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
            .attr("y", b.h / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .text(sumString);

	// Make the breadcrumb trail visible, if it's hidden.
	d3.select("#trail")
            .style("visibility", "");
    }

    // using radio buttons to swap between data attributes?
    d3.selectAll("input").on("change", function change() {
        var value = this.value === "count"
            ? function() { return 1; } 
            : function(d) { return d.size; };
        
        sunpath
            .data(partition.value(value).nodes)
    	.transition()
            .duration(1000) 
            .attrTween("d", arcTweenData);
    });

    // calls sunburst click transition - center node removes and recenters
    function click(d) {
        node = d;
        sunpath.transition()
    	    .duration(500)
    	    .attrTween("d", arcTweenZoom(d));
    }

    d3.select(self.frameElement).style("height", height + "px");

    // Setup for switching data: stash the old values for transition.
    function stash(d) {
      d.x0 = d.x;
      d.dx0 = d.dx;
    }

    // When switching data: interpolate the arcs in data space.
    function arcTweenData(a, i) {
	var oi = d3.interpolate({x: a.x0, dx: a.dx0}, a);
	function tween(t) {
            var b = oi(t);
            a.x0 = b.x;
            a.dx0 = b.dx;
            return arc(b);
	}

	// If we are on the first arc, adjust the x domain to match the root node
	// at the current zoom level. (We only need to do this once.)
	if (i == 0) {
            var xd = d3.interpolate(x.domain(), [node.x, node.x + node.dx]);
            return function(t) {
		x.domain(xd(t));
		return tween(t);
            };
	} else {
            return tween;
	}
    }

    // When zooming: interpolate the scales.
    function arcTweenZoom(d) {

	// test to see if we're moving from initialization to first level zoom.
	if (d.y) {
	    d3.selectAll(".active_sen").style("opacity", 0); // remove avatar if so
	} else {
	    d3.selectAll(".active_sen") // if not, transition it back
		.transition()
		.delay(function(d){ return 200; })
    		.duration(900)
		.style("opacity", 1);
	}

	// interpolate the coordinates for the paths and zoom
	var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
            yd = d3.interpolate(y.domain(), [d.y, 1]),
            yr = d3.interpolate(y.range(), [d.y ? 20 : 0, sunradius]);
	return function(d, i) {
            return i
		? function(t) { return arc(d); }
            : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
	};
    }
};

// bring in data
function getData() {
    return {
        "name": "ref",
        "children": [
            { "name": "EPIC",
              "children": [
                  { "name": "EPIC-a1", "size": 3 },
                  { "name": "EPIC-a2", "size": 3 }
              ]
            },
	    
            { "name": "AD",
              "children": [
                  { "name": "AD-a1", "size": 3 },
                  { "name": "AD-a2", "size": 3 }
              ]
            },

            { "name": "SAP",
              "children": [
                  { "name": "SAP-a1", "size": 3 },
                  { "name": "SAP-a2", "size": 3 }
              ]
            },

            { "name": "Oracle",
              "children": [

		  { "name": "Oracle-a1", "size": 3 },
                  { "name": "Oracle-a2", "size": 3,
                    "children": [
                        { "name": "EPIC-b1", "size": 3 },
                        { "name": "EPIC-b2", "size": 3 }
                    ]
                  }
              ]
            }
        ]
    };
};

// bring in json data from above
root = getData();

