var width = 960,
    height = 500,
    active = d3.select(null);
    activesen = d3.select(null);

var projection = d3.geo.albersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

var zoom = d3.behavior.zoom()
    .translate([0, 0])
    .scale(1)
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("click", stopped, true);

// background rectangle within the svg, that resets on click
svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);

var g = svg.append("g");


// CIRCLE PLAYGROUND
var jsonCircles = [
    { "x_axis": 85, "y_axis": 30, "radius": 80, "color" : "blue" },
    { "x_axis": -85, "y_axis": 100, "radius": 80, "color" : "red"}];
// END CIRCLE PLAYGROUND

svg
    .call(zoom) // delete this line to disable free zooming
    .call(zoom.event);

d3.json("/static/us.json", function(error, us) { // bring json map into django - N.B. hardcoded location
    if (error) throw error;

    g.selectAll("path")
	.data(topojson.feature(us, us.objects.states).features)
	.enter().append("path")
	.attr("d", path)
	.attr("class", "feature")
	.on("click", clicked);

    g.append("path")
	.datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
	.attr("class", "mesh")
	.attr("d", path);
});

// clicked is the click engagement function for state features
function clicked(d) {
    if (active.node() === this) return reset(); // resets when you click on an active state
    g.selectAll("circle") // this makes the circles over a previously active state disappear when a new state is clicked
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

    svg.transition()
        .duration(1250) // duration from "off" to "on"
        .call(zoom.translate(translate).scale(scale).event);

    // NEW - add circle pairs on click of states
    g.selectAll("circle")
	.data(jsonCircles)
	.enter()
        .append("circle")
        .attr("cx", function (d) { return d.x_axis/scale + x; })
        .attr("cy", y)
        .attr("r", function (d) { return d.radius / scale; })
	.attr("class", "senate_center")
        .style("fill", function(d) { return d.color; })
    	.on("click", senator_clicked) // click function for circles - not working yet
}

// unclick function for states
function reset() {
    active.classed("active", false); // makes "active" selection inactive
    active = d3.select(null); // remove "active" selection

    svg.transition()
	.duration(1250) // duration from "on" to "off"
	.call(zoom.translate([0, 0]).scale(1).event);

    g.selectAll("circle")
	.remove();
}

// zooming function
function zoomed() {
    g.style("stroke-width", 1.5 / d3.event.scale + "px"); // keeps stroke width constant
    g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); // zooms
}

// If the drag behavior prevents the default click,
// also stop propagation so we don’t click-to-zoom.
function stopped() {
    if (d3.event.defaultPrevented) d3.event.stopPropagation();
}

// click function for senators (circles)
function senator_clicked(d) {
    if (activesen.node() === this) return senator_reset(); // if this circle is already active and is clicked again, inactivate
    activesen.classed("active_sen", false); // make "activesen" selection inactive - i.e. if you click between two senators in the same state
    activesen = d3.select(this).classed("active_sen", true); // make this selection have "active_sen" class and store selection

    // here we want to include the code for the sunburst
    
//    // if activating, select the clicked element and make it opaque
//    d3.select(this)
//        .style("opacity", 1);
}

// unclick function for senator circles
function senator_reset() {
    activesen.classed("active_sen", false); // make activesen selection inactive
    activesen = d3.select(null); // remove the activesen selection

//    // if deactivating, select the clicked element and make it translucent
//    d3.select(this)
//        .style("opacity", .5);
}


