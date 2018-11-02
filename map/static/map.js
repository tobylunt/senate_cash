var width = 960,
    height = 750,
    radius = 80,
    active = d3.select(null);
    activesen = d3.select(null);

var projection = d3.geo.albersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

var zoom = d3.behavior.zoom()
    .translate([0, 0])
    .scale(1)
    .scaleExtent([1, 30])
    .on("zoom", zoomed);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id", "mapsvg")
    .on("click", stopped, true);

// background rectangle within the svg, that resets on click
svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);

// append a "g" element (grouping) to the svg
var g = svg.append("g");

// CIRCLE PLAYGROUND
var jsonCircles = [
    { "x_axis": 85, "y_axis": 30, "radius": radius, "color" : "blue" },
    { "x_axis": -85, "y_axis": 100, "radius": radius, "color" : "red"}];

svg
//    .call(zoom) // delete this line to disable free zooming
    .call(zoom.event);

// bring json map into django - N.B. hardcoded location
d3.json("/static/us.json", function(error, us) { 
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

    // add circle pairs on click of states
    g.selectAll("circle")
	.data(jsonCircles)
	.enter()
        .append("circle")
        .attr("cx", function (d) { return d.x_axis/scale + x; })
        .attr("cy", y)
        .attr("r", function (d) { return d.radius / scale; })
	.attr("class", "senate_center")
        .style("fill", function(d) { return d.color; })
    	.on("click", senator_clicked) // click function for circles
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

    // set the scaling and transition on click
    var sen_bounds = d3.select('.active_sen').node().getBBox(),
	sen_diam = sen_bounds.width, // same as sen_bounds.height, bc circle
	sen_rad = sen_bounds.width / 2, 
	sen_x = sen_bounds.x,
    	sen_y = sen_bounds.y,
	center_x = sen_x + sen_rad,
	center_y = sen_y + sen_rad,
	sen_scale = Math.max(1, Math.min(30, 0.5 / Math.max(sen_diam / width, sen_diam / height))),
	sen_translate = [width / 2 - sen_scale * center_x, height / 2 - sen_scale *  center_y];
//        scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
//        translate = [width / 2 - scale * x, height / 2 - scale * y];

    svg.transition()
        .duration(600) 
        .call(zoom.translate(sen_translate).scale(sen_scale).event);


    ///////////////////////////
    // code for the sunburst //
    ///////////////////////////

    createSunburst(root);

    
    
//    // if activating, select the clicked element and make it opaque
//    d3.select(this)
//        .style("opacity", 1);
}

// unclick function for senator circles
function senator_reset() {
    activesen.classed("active_sen", false); // make activesen selection inactive
    activesen = d3.select(null); // remove the activesen selection
    sunburstRemove();
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
        .range([0, sunradius]);

    // set colors
    var color = d3.scale.category20c();

    // Basic setup of page elements.
    initializeBreadcrumbTrail();

    // create the sunburst svg
    var svgSunburst = d3.select("#mapsvg")
        .attr("svg_type", "sunburst") 
        .append("g") // add a g element to our SVG
        .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")"); // translate the "center" of our coordinate system to the middle of the svg

    // add a background transparent rectangle to the SVG for onclick
    var back_rect = svgSunburst.append("rect")
	.attr("x", -width/2)
	.attr("y", -height/2)
        .attr("width", width)
        .attr("height", height)
        .attr("opacity", 0)
    	.attr("id", "bgRect")
        .on("mouseover", mouseleave) // clear opacity and breadcrumbs
        .on("click", sunburstRemove); // clear the SVG entirely on background click

    // helper function for killing sunburst SVG
    function sunburstRemove() {
	d3.selectAll("#sunpath").remove() // remove sunburst paths
	d3.selectAll("#bgRect").remove(); // remove background rectangle

	// zoom back to center of state
	var sen_bounds = d3.select('.feature.active').node().getBBox(),
	    dx = sen_bounds.width, // same as sen_bounds.height, bc circle
	    dy = sen_bounds.height, // same as sen_bounds.height, bc circle
	    x = sen_bounds.x + (dx / 2),
    	    y = sen_bounds.y + (dy / 2),
            scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
            translate = [width / 2 - scale * x, height / 2 - scale * y];

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

    // Keep track of the node that is currently being displayed as the root.
    var node;

    //var root = JSON.parse('{ "name": "flare", "children": [  {   "name": "analytics",   "children": [    {     "name": "cluster",     "children": [      {"name": "AgglomerativeCluster", "size": 3938},      {"name": "CommunityStructure", "size": 3812},      {"name": "HierarchicalCluster", "size": 6714},      {"name": "MergeEdge", "size": 743}     ]    },    {     "name": "graph",     "children": [      {"name": "BetweennessCentrality", "size": 3534},      {"name": "LinkDistance", "size": 5731},      {"name": "MaxFlowMinCut", "size": 7840},      {"name": "ShortestPaths", "size": 5914},      {"name": "SpanningTree", "size": 3416}     ]    },    {     "name": "optimization",     "children": [      {"name": "AspectRatioBanker", "size": 7074}     ]    }   ]  },  {   "name": "animate",   "children": [    {"name": "Easing", "size": 17010},    {"name": "FunctionSequence", "size": 5842},    {     "name": "interpolate",     "children": [      {"name": "ArrayInterpolator", "size": 1983},      {"name": "ColorInterpolator", "size": 2047},      {"name": "DateInterpolator", "size": 1375},      {"name": "Interpolator", "size": 8746},      {"name": "MatrixInterpolator", "size": 2202},      {"name": "NumberInterpolator", "size": 1382},      {"name": "ObjectInterpolator", "size": 1629},      {"name": "PointInterpolator", "size": 1675},      {"name": "RectangleInterpolator", "size": 2042}     ]    },    {"name": "ISchedulable", "size": 1041},    {"name": "Parallel", "size": 5176},    {"name": "Pause", "size": 449},    {"name": "Scheduler", "size": 5593},    {"name": "Sequence", "size": 5534},    {"name": "Transition", "size": 9201},    {"name": "Transitioner", "size": 19975},    {"name": "TransitionEvent", "size": 1116},    {"name": "Tween", "size": 6006}   ]  },  {   "name": "data",   "children": [    {     "name": "converters",     "children": [      {"name": "Converters", "size": 721},      {"name": "DelimitedTextConverter", "size": 4294},      {"name": "GraphMLConverter", "size": 9800},      {"name": "IDataConverter", "size": 1314},      {"name": "JSONConverter", "size": 2220}     ]    },    {"name": "DataField", "size": 1759},    {"name": "DataSchema", "size": 2165},    {"name": "DataSet", "size": 586},    {"name": "DataSource", "size": 3331},    {"name": "DataTable", "size": 772},    {"name": "DataUtil", "size": 3322}   ]  },  {   "name": "display",   "children": [    {"name": "DirtySprite", "size": 8833},    {"name": "LineSprite", "size": 1732},    {"name": "RectSprite", "size": 3623},    {"name": "TextSprite", "size": 10066}   ]  },  {   "name": "flex",   "children": [    {"name": "FlareVis", "size": 4116}   ]  },  {   "name": "physics",   "children": [    {"name": "DragForce", "size": 1082},    {"name": "GravityForce", "size": 1336},    {"name": "IForce", "size": 319},    {"name": "NBodyForce", "size": 10498},    {"name": "Particle", "size": 2822},    {"name": "Simulation", "size": 9983},    {"name": "Spring", "size": 2213},    {"name": "SpringForce", "size": 1681}   ]  },  {   "name": "query",   "children": [    {"name": "AggregateExpression", "size": 1616},    {"name": "And", "size": 1027},    {"name": "Arithmetic", "size": 3891},    {"name": "Average", "size": 891},    {"name": "BinaryExpression", "size": 2893},    {"name": "Comparison", "size": 5103},    {"name": "CompositeExpression", "size": 3677},    {"name": "Count", "size": 781},    {"name": "DateUtil", "size": 4141},    {"name": "Distinct", "size": 933},    {"name": "Expression", "size": 5130},    {"name": "ExpressionIterator", "size": 3617},    {"name": "Fn", "size": 3240},    {"name": "If", "size": 2732},    {"name": "IsA", "size": 2039},    {"name": "Literal", "size": 1214},    {"name": "Match", "size": 3748},    {"name": "Maximum", "size": 843},    {     "name": "methods",     "children": [      {"name": "add", "size": 593},      {"name": "and", "size": 330},      {"name": "average", "size": 287},      {"name": "count", "size": 277},      {"name": "distinct", "size": 292},      {"name": "div", "size": 595},      {"name": "eq", "size": 594},      {"name": "fn", "size": 460},      {"name": "gt", "size": 603},      {"name": "gte", "size": 625},      {"name": "iff", "size": 748},      {"name": "isa", "size": 461},      {"name": "lt", "size": 597},      {"name": "lte", "size": 619},      {"name": "max", "size": 283},      {"name": "min", "size": 283},      {"name": "mod", "size": 591},      {"name": "mul", "size": 603},      {"name": "neq", "size": 599},      {"name": "not", "size": 386},      {"name": "or", "size": 323},      {"name": "orderby", "size": 307},      {"name": "range", "size": 772},      {"name": "select", "size": 296},      {"name": "stddev", "size": 363},      {"name": "sub", "size": 600},      {"name": "sum", "size": 280},      {"name": "update", "size": 307},      {"name": "variance", "size": 335},      {"name": "where", "size": 299},      {"name": "xor", "size": 354},      {"name": "_", "size": 264}     ]    },    {"name": "Minimum", "size": 843},    {"name": "Not", "size": 1554},    {"name": "Or", "size": 970},    {"name": "Query", "size": 13896},    {"name": "Range", "size": 1594},    {"name": "StringUtil", "size": 4130},    {"name": "Sum", "size": 791},    {"name": "Variable", "size": 1124},    {"name": "Variance", "size": 1876},    {"name": "Xor", "size": 1101}   ]  },  {   "name": "scale",   "children": [    {"name": "IScaleMap", "size": 2105},    {"name": "LinearScale", "size": 1316},    {"name": "LogScale", "size": 3151},    {"name": "OrdinalScale", "size": 3770},    {"name": "QuantileScale", "size": 2435},    {"name": "QuantitativeScale", "size": 4839},    {"name": "RootScale", "size": 1756},    {"name": "Scale", "size": 4268},    {"name": "ScaleType", "size": 1821},    {"name": "TimeScale", "size": 5833}   ]  },  {   "name": "util",   "children": [    {"name": "Arrays", "size": 8258},    {"name": "Colors", "size": 10001},    {"name": "Dates", "size": 8217},    {"name": "Displays", "size": 12555},    {"name": "Filter", "size": 2324},    {"name": "Geometry", "size": 10993},    {     "name": "heap",     "children": [      {"name": "FibonacciHeap", "size": 9354},      {"name": "HeapNode", "size": 1233}     ]    },    {"name": "IEvaluable", "size": 335},    {"name": "IPredicate", "size": 383},    {"name": "IValueProxy", "size": 874},    {     "name": "math",     "children": [      {"name": "DenseMatrix", "size": 3165},      {"name": "IMatrix", "size": 2815},      {"name": "SparseMatrix", "size": 3366}     ]    },    {"name": "Maths", "size": 17705},    {"name": "Orientation", "size": 1486},    {     "name": "palette",     "children": [      {"name": "ColorPalette", "size": 6367},      {"name": "Palette", "size": 1229},      {"name": "ShapePalette", "size": 2059},      {"name": "SizePalette", "size": 2291}     ]    },    {"name": "Property", "size": 5559},    {"name": "Shapes", "size": 19118},    {"name": "Sort", "size": 6887},    {"name": "Stats", "size": 6557},    {"name": "Strings", "size": 22026}   ]  },  {   "name": "vis",   "children": [    {     "name": "axis",     "children": [      {"name": "Axes", "size": 1302},      {"name": "Axis", "size": 24593},      {"name": "AxisGridLine", "size": 652},      {"name": "AxisLabel", "size": 636},      {"name": "CartesianAxes", "size": 6703}     ]    },    {     "name": "controls",     "children": [      {"name": "AnchorControl", "size": 2138},      {"name": "ClickControl", "size": 3824},      {"name": "Control", "size": 1353},      {"name": "ControlList", "size": 4665},      {"name": "DragControl", "size": 2649},      {"name": "ExpandControl", "size": 2832},      {"name": "HoverControl", "size": 4896},      {"name": "IControl", "size": 763},      {"name": "PanZoomControl", "size": 5222},      {"name": "SelectionControl", "size": 7862},      {"name": "TooltipControl", "size": 8435}     ]    },    {     "name": "data",     "children": [      {"name": "Data", "size": 20544},      {"name": "DataList", "size": 19788},      {"name": "DataSprite", "size": 10349},      {"name": "EdgeSprite", "size": 3301},      {"name": "NodeSprite", "size": 19382},      {       "name": "render",       "children": [        {"name": "ArrowType", "size": 698},        {"name": "EdgeRenderer", "size": 5569},        {"name": "IRenderer", "size": 353},        {"name": "ShapeRenderer", "size": 2247}       ]      },      {"name": "ScaleBinding", "size": 11275},      {"name": "Tree", "size": 7147},      {"name": "TreeBuilder", "size": 9930}     ]    },    {     "name": "events",     "children": [      {"name": "DataEvent", "size": 2313},      {"name": "SelectionEvent", "size": 1880},      {"name": "TooltipEvent", "size": 1701},      {"name": "VisualizationEvent", "size": 1117}     ]    },    {     "name": "legend",     "children": [      {"name": "Legend", "size": 20859},      {"name": "LegendItem", "size": 4614},      {"name": "LegendRange", "size": 10530}     ]    },    {     "name": "operator",     "children": [      {       "name": "distortion",       "children": [        {"name": "BifocalDistortion", "size": 4461},        {"name": "Distortion", "size": 6314},        {"name": "FisheyeDistortion", "size": 3444}       ]      },      {       "name": "encoder",       "children": [        {"name": "ColorEncoder", "size": 3179},        {"name": "Encoder", "size": 4060},        {"name": "PropertyEncoder", "size": 4138},        {"name": "ShapeEncoder", "size": 1690},        {"name": "SizeEncoder", "size": 1830}       ]      },      {       "name": "filter",       "children": [        {"name": "FisheyeTreeFilter", "size": 5219},        {"name": "GraphDistanceFilter", "size": 3165},        {"name": "VisibilityFilter", "size": 3509}       ]      },      {"name": "IOperator", "size": 1286},      {       "name": "label",       "children": [        {"name": "Labeler", "size": 9956},        {"name": "RadialLabeler", "size": 3899},        {"name": "StackedAreaLabeler", "size": 3202}       ]      },      {       "name": "layout",       "children": [        {"name": "AxisLayout", "size": 6725},        {"name": "BundledEdgeRouter", "size": 3727},        {"name": "CircleLayout", "size": 9317},        {"name": "CirclePackingLayout", "size": 12003},        {"name": "DendrogramLayout", "size": 4853},        {"name": "ForceDirectedLayout", "size": 8411},        {"name": "IcicleTreeLayout", "size": 4864},        {"name": "IndentedTreeLayout", "size": 3174},        {"name": "Layout", "size": 7881},        {"name": "NodeLinkTreeLayout", "size": 12870},        {"name": "PieLayout", "size": 2728},        {"name": "RadialTreeLayout", "size": 12348},        {"name": "RandomLayout", "size": 870},        {"name": "StackedAreaLayout", "size": 9121},        {"name": "TreeMapLayout", "size": 9191}       ]      },      {"name": "Operator", "size": 2490},      {"name": "OperatorList", "size": 5248},      {"name": "OperatorSequence", "size": 4190},      {"name": "OperatorSwitch", "size": 2581},      {"name": "SortOperator", "size": 2023}     ]    },    {"name": "Visualization", "size": 16540}   ]  } ]}');

    node = json;

    // create nodes from full data - filtering out small ones
    var burst_nodes = partition.nodes(json)
        .filter(function(d) {
    	return (d.dx > 0.005); // 0.001 radians = 0.05 degrees
        })
    ;

    // find most basic connected node - for color consistency
    // from https://stackoverflow.com/questions/33371154/how-to-get-corresponding-colors-from-d3-sunburst-parent-to-final-child
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
        .attr("id", "sunpath")
        .attr("node_depth", function(d) { return getNodeDepth(d)}) // assign node depth to path class
        .style("fill", function(d) { return color(getRootmostAncestorByRecursion(d).name); })
//        .style("opacity", 0)
        .style("opacity", function(d) { return getNodeDepth(d) == 0 ? 0 : getNodeDepth(d) / Math.pow(getNodeDepth(d),2); }) // make opacity dependent on node depth
        .on("click", click)
    	.on("mouseover", mouseover) // this creates the breadcrumbs
        .each(stash);

//    var path = d3.selectAll("#sunpath")
//	.transition()
//        .duration(1500)
//        .style("opacity", function(d) { return getNodeDepth(d) == 0 ? 0 : getNodeDepth(d) / Math.pow(getNodeDepth(d),2); }); // make opacity dependent on node depth
    
    
    // Fade all but the current sequence, and show it in the breadcrumb trail.
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

//	if(d3.select(this).style("opacity") == 0) { // make center node deactivite breadcrumbs as well
//	    mouseleave();
//	}

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

    function initializeBreadcrumbTrail() {

	// Add the svg area.
	var trail = d3.select("#introspect").append("svg:svg")
            .attr("width", width)
            .attr("height", 50)
            .on("mouseover", mouseleave) // clear opacity and breadcrumbs
            .attr("id", "trail");
	// Add the label at the end, for the percentage.
	trail.append("svg:text")
            .attr("id", "endlabel")
            .style("fill", "#000");
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

    // Update the breadcrumb trail to show the current sequence and percentage.
    function updateBreadcrumbs(nodeArray, sumString) {

	// Data join; key function combines name and depth (= position in sequence).
	var g = d3.select("#trail")
            .selectAll("g")
            .data(nodeArray, function(d) { return d.name + d.depth; });

	// Add breadcrumb and label for entering nodes.
	var entering = g.enter().append("svg:g");

	entering.append("svg:polygon")
            .attr("points", breadcrumbPoints)
            .style("fill", function(d) { return color(getRootmostAncestorByRecursion(d).name); })
            .style("opacity", function(d) { return getNodeDepth(d) == 0 ? 0 : getNodeDepth(d) / Math.pow(getNodeDepth(d),2); }) // make opacity dependent on node depth

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
    	    .duration(1000)
    	    .attrTween("d", arcTweenZoom(d));
    }

    // Add the mouseleave handler to the background rectangle
    d3.select("#bgRect").on("mouseover", mouseleave);

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

//createSunburst(root);

// add function for the removal of the sunburst
