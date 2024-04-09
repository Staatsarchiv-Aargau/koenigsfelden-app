////////////////////////////////////////////////////////////
//////////////////////// Set-up ////////////////////////////
////////////////////////////////////////////////////////////

//Quick fix for resizing some things for mobile-ish viewers
var mobileScreen = ($( window ).innerWidth() < 500 ? true : false);

//Scatterplot
//var margin = {left: 60, top: 20, right: 20, bottom: 60},
var margin = {left: 0, top: 1, right: 0, bottom: 0},
	width = Math.min($("#chart").width(), 840) - margin.left - margin.right,
	height = width*2/3;

var svg = d3.select("#chart").append("svg")
			.attr('id', 'svg')
			.attr("width", (width + margin.left + margin.right))
			.attr("height", (height + margin.top + margin.bottom));
			
var wrapper = svg.append("g").attr("class", "chordWrapper")
			//.attr("id", "blueLine")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// used to store the last two hovered/clicked sheets, for side-by-side weblink generation.
var sheet_queue = [];
sheet_queue.push("");

var sheets = [];
var links = [];

var boxWidth = 15;

// base url
var baseUrl = "https://www.koenigsfelden.uzh.ch/exist/apps/ssrq/docs/"

// initial highlight

//var initialHighlight = "urk_0020a"

d3.select(window).on('load', function(d) {
	var highlightData = d3.select("circle.sheets." + initialHighlight).data()
	//highlight(initialHighlight, 2);
	//console.log(d3.select("circle.sheets." + initialHighlight).data());
	//console.log(highlightData);
	var highlight_x = d3.select("circle.sheets." + initialHighlight).attr( 'cx' );
	//console.log(highlight_x);
	var highlight_y = d3.select("circle.sheets." + initialHighlight).attr( 'cy' );
	//console.log(highlight_y);
	if (!svg._voronoi) {
    console.log('computing the voronoi for initial highlightâ€¦');
    svg._voronoi = d3.voronoi()
	  .x(function(d) { return xScale(d.pos_x); })
	  .y(function(d) { return yScale(d.pos_y); })
    (data.sheets);
    console.log('â€¦done.');
  }
  	// create site for initial selection
	site = svg._voronoi.find(highlight_x, highlight_y, maxDistanceFromPoint);
	//console.log(site);
	//highlight(site.data, 2);
	//console.log("site: " + site);
	//console.log("site.data: " + site.data.LB_ID);
	//mouse_action(site.data, false, "root");
	mouse_action(site.data, true, "root");
	tooltip(site.data);
	//var p = d3.select("circle.sheets." + initialHighlight), site;
	//console.log(p);
	//site = p.datum;
	//console.log(highlightData.LB_ID);
	//var LB_ID = highlightData.map(function(a) {return a.LB_ID;});
	//console.log(LB_ID);
//	site = svg._voronoi.find(d3.select("circle.sheets." + initialHighlight));
//	console.log(site);
	//mouse_action(highlightData, true, "root");
	//voronoi(d);
	
	//console.log("mouse action done");
    //mouse_action(d3.select(this).datum(), true, "root");
    // setTimeout(function() { 
    // 	d3.select('#checkPretexts').node().checked = false;//.property('checked', false);
    //  }, 1000);
});


//////////////////////////////////////////////////////
///////////// Initialize Axes & Scales ///////////////
//////////////////////////////////////////////////////

var opacityCircles = 0.7,
	maxDistanceFromPoint = 50,
	bubbleSize = 3;

//Set the color for each category
var colorMacro = d3.scaleOrdinal()
	.range([
		"#2074A0",
		"#ffff00", 
		"#E58903", 
		"#996600"
		])
	.domain([
		"Urkunde",
		"Kopialbuch I",
		"Kopialbuch Ia",
		"Kopialbuch II",
		]);

var colorPretexts = d3.scaleOrdinal()
	.range([
		"#a2a8ab",
		"#dc42e5",
		"#2074A1", 
		"#38e312",
		"#d712e3",
		"#1addd8",
		"#d66331",
		"#a9359f",
		"#c2c950",
		"#52df3c",
		"#7EB853", 
		"#10A66F",
		"#E18903",
		"#7aea82",
		])
	.domain([
		"dors_1",
		"dors_2",
		"dors_4",
		"dors_5",
		"dors_6",
		"dors_7",
		"dors_8",
		"dors_9",
		"dors_10",
		"dors_11",
		"dors_12",
		"dors_13",
		"dors_14",
		"dors_16",
		 ]);

var colorContexts = d3.scaleOrdinal()
	.range([
		"#2074A1", 
			])
	.domain([
		"Lokalbericht", // "Lokalbericht (novel)", 
		]);

var colorBiography = d3.scaleOrdinal()
	.range([
		"#2074A1", 
		"brown",
		"#66489F"
			])
	.domain([
		"Habsburg", // "Hapsburg", 
		"Bern", // "Berne",
		"Weltgeschehen"
		]);	
							 
//Set the new x axis range
//var xScale = d3.scaleLog()
var xScale = d3.scaleLinear()
	.range([0, width])
	//.domain([100,2e5]); //I prefer this exact scale over the true range and then using "nice"
	.domain(d3.extent(data.sheets, function(d) { return d.pos_x; }))
	.nice();
//Set new x-axis
var xAxis = d3.axisBottom()
	.ticks(2)
	// .tickFormat(function (d) {
	// 	return xScale.tickFormat((mobileScreen ? 4 : 8),function(d) { 
	// 		return d3.format('$.2s')(d);
	// 	})(d)
	//})	
	.scale(xScale);	
//Append the x-axis
// wrapper.append("g")
var gX = svg.append("g")
	//.attr('id', 'g')
	.attr("class", "x axis")
	.attr("transform", "translate(" + 0 + "," + height + ")")
	.call(xAxis);
		
//Set the new y axis range
var yScale = d3.scaleLinear()
	.range([0,height])
	.domain(d3.extent(data.sheets, function(d) { return d.pos_y; }))
	.nice();	
var yAxis = d3.axisRight()
	.ticks(6)  //Set rough # of ticks
	.scale(yScale);	

yAxis.tickFormat(d3.format('.4r'));	
//Append the y-axis
//wrapper.append("g")
var gY = svg.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(" + 0 + "," + 0 + ")")
		.call(yAxis);
		
//Scale for the bubble size
var rScale = d3.scaleSqrt()
			.range([mobileScreen ? 1 : 2, mobileScreen ? 10 : 16])
			//.domain(d3.extent(countries, function(d) { return d.GDP; }));
			.domain(d3.extent(bubbleSize));

//////////////////////////////////////////////////////
///////////////// Initialize Labels //////////////////
//////////////////////////////////////////////////////

//Set up X axis label
// wrapper.append("g")
svg.append("g")
	.append("text")
	.attr("class", "x title")
	.attr("text-anchor", "end")
	.style("font-size", (mobileScreen ? 8 : 12) + "px")
	.attr("transform", "translate(" + width + "," + (height - 10) + ")")
	.text("Für Urkunden: Datum (ohne Jahr). Für Kopialbücher: Folio/Seite");

//Set up y axis label
// wrapper.append("g")
svg.append("g")
	.append("text")
	.attr("class", "y title")
	.attr("text-anchor", "end")
	.style("font-size", (mobileScreen ? 8 : 12) + "px")
	.attr("transform", "translate(50, 0) rotate(-90)")
	.text("Zeitachse");


////////////////////////////////////////////////////////////	
///// Capture mouse events and voronoi.find() the site /////
////////////////////////////////////////////////////////////	

// Use the same variables of the data in the .x and .y as used in the cx and cy of the circle call
svg._tooltipped = svg._voronoi = null;
svg._linked = svg._voronoi = null;
svg.on('mousemove', voronoi);
svg.on('click', voronoiClick);


function voronoi(d) {
  if (!svg._voronoi) {
    console.log('computing the voronoiâ€¦');
    svg._voronoi = d3.voronoi()
	  .x(function(d) { return xScale(d.pos_x); })
	  .y(function(d) { return yScale(d.pos_y); })
    (data.sheets);
    console.log('â€¦done.');
  }
  // using d3.mouse on the g node instead of the svg node so we don't have to worry about margin and transforms
  var p = d3.mouse(g.node()), site;
  //var p = d3.mouse(this), site;
  //p[0] -= margin.left;
  //p[1] -= margin.top;
  // don't react if the mouse is close to one of the axis
  if (p[0] < 5 || p[1] < 5) {
    site = null;
  } else {
    site = svg._voronoi.find(p[0], p[1], maxDistanceFromPoint);
  }
  //console.log("site: " + site);
  //console.log("p0: " + p[0]);
  //console.log("p1: " + p[1]);
  if (site !== svg._tooltipped) {
    //if (svg._tooltipped) removeTooltip(svg._tooltipped.data)
    if (svg._linked) mouse_action(svg._linked.data, false, "root");
    //if (site) showTooltip(site.data);
    //if (site) getQueue(site.data);
    //if (site) mouse_action(site.data, false, "root");
    if (site) mouse_action(site.data, true, "root");
    //if (site) highlight(site.data);
    //if (site) mouse_action(d3.select(this).datum(), true, "root");
    //if (site) mouse_action(d3.select(site.data), true, "root");
    //if (site) unvisit_links();
	if (site) tooltip(site.data);
    if (site) console.log("voronoi on " + site.data.LB_ID);
    //if (site) mouse_action(d3.select(this).datum(), false, "root");
    
    svg._tooltipped = site;
    svg._linked = site;
  }
};	

function voronoiClick(d) {
	
if (document.getElementById("checkMacro").checked) {
	console.log("checkMacro is checked")
    console.log('re-computing the voronoiâ€¦');
    svg._voronoi = d3.voronoi()
	  .x(function(d) { return xScale(d.pos_x); })
	  .y(function(d) { return yScale(d.pos_y); })
    (data.sheets);
    console.log('â€¦done.');
	} //
if (document.getElementById("checkPretexts").checked) {
    console.log('re-computing the voronoiâ€¦');
    svg._voronoi = d3.voronoi()
	  .x(function(d) { return xScale(d.pos_x); })
	  .y(function(d) { return yScale(d.pos_y); })
    (data.pretexts);
    console.log('â€¦done.');
	}
/*
<!-- if (document.getElementById("checkContexts").checked) {
    console.log('re-computing the voronoiâ€¦');
    svg._voronoi = d3.voronoi()
	  .x(function(d) { return xScale(d.pos_x); })
	  .y(function(d) { return yScale(d.pos_y); })
    (data.contexts);
    console.log('â€¦done.');
	}
	-->
	
*/
// if (document.getElementById("checkBio").checked) {
//     console.log('re-computing the voronoiâ€¦');
//     svg._voronoi = d3.voronoi()
// 	  .x(function(d) { return xScale(d.pos_x); })
// 	  .y(function(d) { return yScale(d.pos_y); })
//     (data.biography);
//     console.log('â€¦done.');
// 	}	

  //if (!svg._voronoi) {
 //  	if (!d3.select("#checkMacro").checked) { // fix for content filtering
 //    console.log('re-computing the voronoiâ€¦');
 //    svg._voronoi = d3.voronoi()
	//   .x(function(d) { return xScale(d.pos_x); })
	//   .y(function(d) { return yScale(d.pos_y); })
 //    (data.sheets);
 //    console.log('â€¦done.');
	// } // fix for content filtering
  //}
  // using d3.mouse on the g node instead of the svg node so we don't have to worry about margin and transforms
  var p = d3.mouse(g.node()), site;
  //var p = d3.mouse(this), site;
  //p[0] -= margin.left;
  //p[1] -= margin.top;
  // don't react if the mouse is close to one of the axis
  if (p[0] < 5 || p[1] < 5) {
    site = null;
  } else {
    site = svg._voronoi.find(p[0], p[1], maxDistanceFromPoint);
  }
  console.log(site)
  if (site !== svg._tooltipped) {
    if (svg._tooltipped) removeTooltip(svg._tooltipped.data)
    //if (site) showTooltip(site.data);
	if (site) offcanvas(site.data);
    if (site) getQueue(site.data);
    console.log("voronoiClick on " + site.data.ref);
    console.log("site: " + site);
    
    // open document of the voronoi that was clicked
    var toURL = baseUrl + site.data.ref + '?odd=ssrq-norm.odd';
    if (site) window.open(toURL, "_blank");
    
    // transfrom site.data.short to U-17_XYZA

    //function(){ d3.select(site.data).attr("data-open")};


    //if (site) tooltip(site.data);
    //if (site) mouse_action(d3.select(this).datum(), true, "root");
    //if (site) mouse_action(site.data, true, "root");
    svg._tooltipped = site;
  }
};	



////////////////////////////////////////////////////////////	
/////////////////// Zoom implementation ////////////////////
////////////////////////////////////////////////////////////	

var g = d3.select("g");
//var svg = d3.select('#svg');
    
var zoom = d3.zoom()
    .scaleExtent([1/2, 8])
    .on("zoom", zoomed);
    
svg.call(zoom);

function zoomed() {
	var transform = d3.event.transform;
  	gX.call(xAxis.scale(d3.event.transform.rescaleX(xScale)));
	gY.call(yAxis.scale(d3.event.transform.rescaleY(yScale)));
  	g.attr('transform', `translate(${transform.x}, ${transform.y}) scale(${transform.k})`);
};

function transition(zoomLevel) {
  svg.transition()
      .delay(100)
      .duration(700)
      .call(zoom.scaleBy, zoomLevel);
}

d3.selectAll('.button').on('click', function() {
  if (this.id === 'zoom_in') {
    console.log('zooming in')
    transition(1.2); // increase on 0.2 each time
  }
  if (this.id === 'zoom_out') {
    console.log('zooming out')
    transition(0.8); // deacrease on 0.2 each time
  }
  if (this.id === 'zoom_init') {
    console.log('reset zoom')
    svg.transition()
        .delay(100)
        .duration(700)
    		.call(zoom.transform, d3.zoomIdentity); // return to initial state
  }
});

// zoom.filter(function() { return !event.button && event.type !== 'wheel'; }) // allow scrolling by disallowing 'wheel'



////////////////////////////////////////////////////////////	
/////////////////// Scatterplot Circles ////////////////////
////////////////////////////////////////////////////////////	

//Initiate a group element for the circles	
var sheetGroup = wrapper.append("g")
	.attr("class", "circleWrapper"); 
	
//Place the circles representing sheets
//sheetGroup.selectAll("data.sheets")
sheetGroup.selectAll("sheets")
	//.data(countries.sort(function(a,b) { return b.GDP > a.GDP; })) //Sort so the biggest circles are below
	.data(data.sheets) 
	.enter().append("circle")
		.attr("class", function(d,i) { return "sheets " + d.LB_ID; })
		.attr("cx", function(d) {return xScale(d.pos_x);})
		.attr("cy", function(d) {return yScale(d.pos_y);})
		//.attr("r", function(d) {return rScale(d.GDP);})
		.attr("r", bubbleSize)
		//.attr("data-open", "exampleModal1")
		.attr("data-toggle", "offCanvas")
		.style("opacity", opacityCircles)
		.style("fill", function(d) {return colorMacro(d.category);});

		// .on("mouseover", function (d) {
		// 	// Tooltip
		// 	div.transition()
		// 		.duration(500)	
		// 		.style("opacity", 0);
		// 	div.transition()
		// 		.duration(200)	
		// 		.style("opacity", .9);	
		// 		console.log("mouseover div");
		// 	div	.html(
		// 		'<a href= "http://google.com">' + // The first <a> tag
		// 		// "TEST " + 
		// 		"ID: " + d.LB_ID + "<br/>" + 
		// 		"Text: " + d.text +
		// 		"</a>" +                          // closing </a> tag
		// 		"<br/>"  )//+ d.close)	 
		// 		// x+y ev. parametrisieren
		// 		.style("left", 0 + "px")			 //.style("left", (d3.event.pageX) + "px")			 
		// 		.style("top", 0 + "px")		//.style("top", (d3.event.pageY - 28) + "px")
		// 	// end Tooltip

  //           mouse_action(d3.select(this).datum(), true, "root");
  //           //unvisit_links();
  //           //console.log("unvisit " + d.LB_ID);
  //       })
  //       .on("mouseout", function () {
  //       	// hier Tooltip wieder entfernen
  //       	// 	//Hide tooltip - funktioniert nur beim ersten Mal
		// 	// $('.tooltip').each(function() {
		// 	// 	$(this).remove();
		// 	// });

  //           mouse_action(d3.select(this).datum(), false, "root");
  //           unvisit_links();
  //       })
        //;

sheetGroup.selectAll("pretexts")
	//.data(countries.sort(function(a,b) { return b.GDP > a.GDP; })) //Sort so the biggest circles are below
	.data(data.pretexts) 
	.enter().append("rect")
		.attr("class", function(d,i) { return "pretexts " + d.LB_ID; })
		.attr("x", function(d) {return xScale(d.pos_x);})
		.attr("y", function(d) {return yScale(d.pos_y);})
		.attr('width', 5) 
		  .attr('height', 5) 
		//.attr("r", function(d) {return rScale(d.GDP);})
		.attr("r", bubbleSize)
		//.attr("data-open", "exampleModal1")
		.attr("data-toggle", "offCanvas")
		.style("opacity", opacityCircles)
		.style("fill", function(d) {return colorPretexts(d.category);})
		//.style("display", "none")
		;

/*
sheetGroup.selectAll("contexts")
	//.data(countries.sort(function(a,b) { return b.GDP > a.GDP; })) //Sort so the biggest circles are below
	.data(data.contexts) 
	.enter().append("rect")
		.attr("class", function(d,i) { return "contexts " + d.LB_ID; })
		.attr("x", function(d) {return xScale(d.pos_x);})
		.attr("y", function(d) {return yScale(d.pos_y);})
		.attr('width', bubbleSize) 
		  .attr('height', bubbleSize) 
		//.attr("r", function(d) {return rScale(d.GDP);})
		//.attr("r", bubbleSize)
		//.attr("data-open", "exampleModal1")
		.attr("data-toggle", "offCanvas")
		.style("opacity", opacityCircles)
		.style("fill", function(d) {return colorContexts(d.category);})
		//.style("display", "none")
		;

var bio = sheetGroup.selectAll("biography")
	//.data(countries.sort(function(a,b) { return b.GDP > a.GDP; })) //Sort so the biggest circles are below
	.data(data.biography) 
	.enter().append("g")
	
	bio.append("rect")
		.attr("class", function(d,i) { return "biography " + d.LB_ID; })
		.attr("x", function(d) {return xScale(d.pos_x);})
		.attr("y", function(d) {return yScale(d.pos_y);})
		.attr('width', bubbleSize) 
		.attr('height', function(d) {
			if (d.pos_y2) {
			return yScale(d.pos_y2) - yScale(d.pos_y);
			}
			if (!d.pos_y2) {
			return bubbleSize;
			}
		}) 
		//.attr("r", function(d) {return rScale(d.GDP);})
		//.attr("r", bubbleSize)
		//.attr("data-open", "exampleModal1")
		.attr("data-toggle", "offCanvas")
		.style("opacity", opacityCircles)
		.style("fill", function(d) {return colorBiography(d.category);})
	
	bio.append('text')
		.attr("class", function(d,i) { return "biography " + d.LB_ID; })
		.attr("x", function(d) {return xScale(d.pos_x + 3);})
		.attr("y", function(d) {return yScale(d.pos_y);})                                     
		  //.attr('transform', 'translate(' + 22 + ',' + (rectSize/2) + ')')
		  //.attr("class", "legendText")
		  .style("font-size", "10px")
		  .attr("dy", ".35em")
		  .text(function(d) {return d.short })
		//.style("display", "none")
		;		
*/

//var tooltipDiv = d3.select("div.tooltip")
var tooltipDiv = d3.select("div#infobox")
	//.append("div")  // declare the tooltip div 
	//.attr("class", "tooltip")              // apply the 'tooltip' class
	.attr("id", "tooltip")
	.style("opacity", 1);                  // set the opacity to nil

var offcanvasDiv = d3.select("#off-canvas")


function offcanvas(d) {
	lookupID = d.ref

	var html = function() {

	// case: not PDF
	if (!d.LB_ID.includes("PT-") && !d.LB_ID.includes("TA-")) {
		return '<span class="secondary label small">Auswahl</span><br/><br/>' + 
			'<button class="close-button" aria-label="Close menu" type="button" data-close>' +
				'<span aria-hidden="true">&#215;</span>' +
			'</button>' +
			'<a class="listedLink" href= "' + baseUrl + d.LB_ID.replace(/-/g, '.') + '-d" target="_blank">' +
			d.text + "<br/>" +
			"</a><br/>"
	;}
	// case: PDF
		else { return '<br/><span class="secondary label small">Auswahl</span><br/><br/>' + '<button class="close-button" aria-label="Close menu" type="button" data-close>' +
				'<span aria-hidden="true">&#215;</span>' +
			'</button>' +
			'<a class="listedLink" href= "' + baseUrl + d.LB_ID.replace(/-/g, '.') + '/pdf" target="_blank">' +
			d.text + "<br/>" +
			"</a><br/>"
			; };
	}	

	offcanvasDiv.transition()
		.duration(500)	
		.style("opacity", 0);
	offcanvasDiv.transition()
		.duration(200)	
		.style("opacity", .9);	
	offcanvasDiv.html(html

		// '<br/><span class="secondary label small">Auswahl</span><br/><br/> ' +

		// '<button class="close-button" aria-label="Close menu" type="button" data-close>' +
		//   '<span aria-hidden="true">&times;</span>' +
		// '</button>' +

		// '<a href= "' + baseUrl + d.LB_ID.replace(/-/g, '.') + '" target="_blank">' +// The first <a> tag

		// // "TEST " + 
		// //"Text: " + 
		// d.text + "<br/>" + 
		// "</a><br/>" //+ 
		//"ID: " + d.LB_ID + "<br/>" + 
		//"Text: " + d.text +
		//"Test: " + sheet_queue + "<br/>" +
		// "source: " + d.source + "<br/>" +
		// "target: " + d.target + "<br/>" +
		// "linkGroup: " + d.group + "<br/>" +

		//"test: " + test.forEach(function(d){return d.source}) +

		

		// '<svg width="5" height="5">' +
		// '<rect x="0" y="0" width="5" height="5" fill="green" />' +
		// '</svg>' 
		)
	.on("mouseover", function(d) {offCanvasHighlight(lookupID)})


	
	// ancestors

	// Filter funktioniert, SVG-Ebene
	var ancestorArray = linkGroup.selectAll("path")
						.filter(function(d){return lookupID === d.target;})
						//.data()
						//.nodes()

	// console.log("ancestorArray.data()")
	// console.log(ancestorArray.data())						

	// wiping the slate clean
	d3.select("#ancestors").selectAll("*").remove();

	d3.select("#ancestors")
		// append title
		.append('ul').html(function(d) {
			if(ancestorArray.data().length === 0) {
				return '<span class="secondary label small">Keine Textvorstufen</span><br/>';
			}
			if(ancestorArray.data().length > 0) {
				return '<span class="secondary label small">Textvorstufen</span><br/><br/>';
			}
		})
		//.append('ul').html('<strong>Textvorstufen</strong><br/>')
  		// append links to ancestors
  		.selectAll('li').data(ancestorArray.data()).enter()
	  		.append('li').html(function(d) { 
	  			return '<a class="listedLink" href="' + baseUrl + 'synopsis/' + 
	  			d.source.replace(/-/g, '.') + "-d/" + 
	  			d.target.replace(/-/g, '.') + '-d" target="_blank">' + 
	  			//d.source.replace(/-/g, '.') + 
	  			data.sheets.find(function (d2) {return d2.LB_ID === d.source;}).short +
	  			'</a>'
	  			;})
	  			.on("mouseover", function(d) {offCanvasHighlight(d.source)})  		

	var descendantArray = linkGroup.selectAll("path")
						.filter(function(d){return lookupID == d.source;})
						//.data()
						//.nodes()

	//console.log(descendantArray)						

	// wiping the slate clean
	d3.select("#descendants").selectAll("*").remove();

	d3.select("#descendants")
		// append title
		.append('ul').html(function(d) {
			if(descendantArray.data().length == 0) {
				return '<span class="secondary label small">Keine Textnachfolgestufen</span><br/>';
			}
			if(descendantArray.data().length > 0) {
				return '<span class="secondary label small">Textnachfolgestufen</span><br/><br/>';
			}
		})
  		// append links to descendants
  		.selectAll('li').data(descendantArray.data()).enter()
  		.append('li').html(function(d) { 
  			return '<a class="listedLink" href="' + baseUrl + 'synopsis/' + 
  			d.source.replace(/-/g, '.') + "-d/" + 
  			d.target.replace(/-/g, '.') + '-d" target="_blank">' + 
  			//d.target.replace(/-/g, '.') + 
  			data.sheets.find(function (d2) {return d2.LB_ID === d.target;}).short +
  			'</a>'
  			;})
  		.on("mouseover", function(d) {offCanvasHighlight(d.target)})
// Filter funktioniert, allerdings auf Datenebene; wäre SVG-Ebene besser (um Punkte zu verbinden/hervorzuheben?)
	//var test = linkGroup.selectAll("path").data().filter(function(d){return lookupID == d.source;})
	// benÃ¶tige eine Methode, um alle Objekte einzeln anzusprechen (kann auch im .html-Teil sein)
	//console.log("test: " + d3.merge(test) )
	//console.log(test.forEach(function(d){return this}))
	//console.log("--> " + test[1].target + " â€“ " + test[0].target)
	//var test = linkGroup.selectAll("path").filter(function(d){return d.id.includes("ls" + lookupID + "t")})


	//console.log(ancestorArray)


//.text(JSON.stringify(test2));
//.selectAll('li').data(test2.nodes()).enter()
		//.html(getLinks(test2))
	// .html(
	// 	"<strong>Textvorstufen</strong><br/>" +
	// 	"<p>Ein Test</p>" +
	// 	test2
		
	// 	//test2.length
	// 	)

// 	( function(d, i){
// 		// console.log("val.id: " + val.id);

// // Steuerung Ã¼ber die includes-Statements (IDs haben die Form "ls[source.id]t[target.id]l" )

// 		// "Gruppe (Nachfolger)"
// 		console.log("id: " + d3.select(this).attr("id"))
// 		console.log("d.LB_ID: " + lookupID)
//   		if(d3.select(this).attr("id").includes("ls" + lookupID + "t")) {
// 	  		var groupIdAx = d3.select(this).attr("group")
	  		
// 	  		console.log("groupIdAx: " + groupIdAx)
// 	    	// console.log( d3.select(this).attr("id") );
// 	    	// console.log( "currId: " + currId);
// 	    	// console.log("groupIdA: " + groupIdA);
	    	
// 	    	//d3.selectAll("[group='" + groupIdAx + "']").classed("activelink indirect", stat);
// 	     	//d3.selectAll("[group='" + groupIdAx + "']").classed("link", !stat);
//     	// else { console.log(d3.select(this).attr("id").includes(val.id))};
//     	}
// 	})

	//console.log(test[0].target)
	

	
};

// function getLinks(d) {
// 	d3.select(this).append('ul')
// 	  .selectAll('li').data(d).enter()
// 	  .append('li').text(function(d) { return d; })

// 	// d.forEach( function(d) {
// 	// 	console.log(d.length)
// 	//     return '<a href="' + d.id + '">test</a>'
// 	// 	})

// 	// for-loop funktioniert nicht, läuft nur einmal
// 	// for (var i = 0; i < d.length ; i++) {
// 	//     //alert(d[i].id);
// 	//     console.log(d.length)
// 	//     return '<a href="' + d[i].id + '">test</a>'
// 	//     //+ '<a href="' + d[0].id + '">test</a>'
// 	//     //+ '<a href="' + d[1].id + '">test</a>'
// 	//     //+ '<a href="' + d[2].id + '">test</a>'
	    
// 	//     //Do something
// 	// }

// };

function offCanvasHighlight(d) {
  			unhighlight(d);
    		console.log("unhighlight")
			
			var test = d3.select("circle.sheets." + d).data()[0]
			highlight(test,"1.5");
			console.log("highlight " + test)
			//mouse_action(test, true, "root");
			//console.log(test)
			//tooltip(d.target);
			//mouse_action(site.data, true, "root");
			//tooltip(site.data);
		}

function tooltip(d) {
    console.log(d);
		//console.log("tooltip-test")
			// Tooltip
			tooltipDiv.transition()
				.duration(500)	
				.style("opacity", 0);
			tooltipDiv.transition()
				.duration(200)	
				.style("opacity", .9);	
			tooltipDiv.html(
				'<div class="float-left">' +
				'<span class="secondary label small">Auswahl:</span> ' +
				'<a href= "' + baseUrl + d.ref + '?odd=ssrq-norm.odd" target="_blank">' + // The first <a> tag
				// "TEST " + 
				//"Text: " + 
				d.text + //" â€“â€“ " + 
				//"Text: " + d.text +
				"</a>" +                          // closing </a> tag
				'</div>' +
				'<div class="float-right" style="opacity: 0.1;">' +
				"ID: " + d.LB_ID + 
				" â€“ x: " + d.pos_x +
				" â€“ y: " + d.pos_y ) +//+ d.close)
				'</div>'
				
				// x+y ev. parametrisieren
				//.style("left", 0 + "px")			 //.style("left", (d3.event.pageX) + "px")			 
				//.style("top", 0 + "px")		//.style("top", (d3.event.pageY - 28) + "px")
			// end Tooltip

            //mouse_action(d3.select(this).datum(), true, "root");
            //unvisit_links();
            //console.log("unvisit " + d.LB_ID);
        };

//Initiate a group element for the links
var linkGroup = wrapper.append("g")
	.attr("class", "linksWrapper"); 

function unvisit_links() {
    "use strict";
    data.links.forEach(function (d) {
        d.visited = false;
    });
};

function highlight(d, scale) {
	//var id = d
	//console.log("highlight " + d.LB_ID);
	d3.select("circle.sheets." + d.LB_ID)
	.transition()
	.delay(function(d, i) { return i * 50; })
	.on("start", function repeat() {
		d3.active(this)
			.duration(1250)
			.ease(d3.easeLinear)
          //   .style("opacity", "0.5")
          // .transition()
          //   .style("opacity", "1")
            .attr("r", 1 * bubbleSize * scale)
          .transition()
            .attr("r", 2 * bubbleSize * scale)
//             .styleTween("fill", function() {
//   return d3.interpolateRgb("red", "blue");
// })
          .transition()
            .on("start", repeat);
      })
	//.duration(750)
    //.ease(d3.easeLinear)
	//.transition()
    //.on("start", repeat)
	.attr("r", bubbleSize * scale)
	;
	//console.log("d: " + d);


	//mouse_action(d, true, "root")
	//console.log("mouse action done");
    //mouse_action(d3.select(this).datum(), true, "root");

<!--
    d3.select("rect.contexts." + d.LB_ID)
	.transition()
	.delay(function(d, i) { return i * 50; })
	.on("start", function repeat() {
		d3.active(this)
			.duration(1250)
			.ease(d3.easeLinear)
            .attr("width", 1 * bubbleSize * scale)
            .attr("height", 1 * bubbleSize * scale)
          .transition()
            .attr("width", 2 * bubbleSize * scale)
            .attr("height", 2 * bubbleSize * scale)
          .transition()
            .on("start", repeat);
      })
	.attr("width", bubbleSize * scale)
	;
-->
	d3.select("rect.pretexts." + d.LB_ID)
	.transition()
	.delay(function(d, i) { return i * 50; })
	.on("start", function repeat() {
		d3.active(this)
			.duration(1250)
			.ease(d3.easeLinear)
            .attr("width", 1 * bubbleSize * scale)
            .attr("height", 1 * bubbleSize * scale)
          .transition()
            .attr("width", 2 * bubbleSize * scale)
            .attr("height", 2 * bubbleSize * scale)
          .transition()
            .on("start", repeat);
      })
	.attr("width", bubbleSize * scale)
	;

	d3.select("rect.biography." + d.LB_ID)
	.transition()
	.delay(function(d, i) { return i * 50; })
	.on("start", function repeat() {
		d3.active(this)
			.duration(1250)
			.ease(d3.easeLinear)
            .attr("width", 1 * bubbleSize * scale)
            //.attr("height", 1 * bubbleSize * scale)
          .transition()
            .attr("width", 2 * bubbleSize * scale)
            //.attr("height", 2 * bubbleSize * scale)
          .transition()
            .on("start", repeat);
      })
	.attr("width", bubbleSize * scale)
	;

};

function unhighlight(d) {
	//console.log("unhighlight " + d.LB_ID);
	d3.selectAll("circle.sheets").interrupt()
	.attr("r", bubbleSize);
	//.style("opacity", "0");
	//.style("fill", "");
	d3.selectAll("rect.contexts").interrupt()
		.attr("width", bubbleSize)
		.attr("height", bubbleSize);
	d3.selectAll("rect.pretexts").interrupt()
		.attr("width", bubbleSize)
		.attr("height", bubbleSize);
	d3.selectAll("rect.biography").interrupt()
		.attr("width", bubbleSize)
		//.attr("height", bubbleSize);	
};


function mouse_action(val, stat, direction) {
    "use strict";
    //if(freeze_links == true) return;

    //workaround to hide initially active link
    d3.selectAll("path.activelink").classed("inactivelink", stat);
    //d3.selectAll("path.activelink").style("display","none");

    d3.select("#" + val.LB_ID).classed("active", stat);
    unhighlight(val);
    //console.log("unhighlight")
    highlight(val,"1.5");
    //console.log("highlight")

    // console.log(d3.select(val))
// console.log("val: " + val);
// console.log("stat: " + stat);
// console.log("direction: " + direction);


	linkGroup.selectAll("path").each( function(d, i){
		// console.log("val.id: " + val.id);

// Steuerung Ã¼ber die includes-Statements (IDs haben die Form "ls[source.id]t[target.id]l" )

		// "Gruppe (Nachfolger)"
  		if(d3.select(this).attr("id").includes("ls" + val.LB_ID + "t")) {
	  		var groupIdA = d3.select(this).attr("group")
	  		
	    	// console.log( d3.select(this).attr("id") );
	    	// console.log( "currId: " + currId);
	    	// console.log("groupIdA: " + groupIdA);
	    	
	    	d3.selectAll("[group='" + groupIdA + "']").classed("activelink indirect", stat);
	     	d3.selectAll("[group='" + groupIdA + "']").classed("link", !stat);
    	// else { console.log(d3.select(this).attr("id").includes(val.id))};
    }
    // var groupAmembers = d3.selectAll("[group='" + groupIdA + "']")
    // console.log(groupAmembers);

    	// "Gruppe (Vorgänger)"
  		if(d3.select(this).attr("id").includes("t" + val.LB_ID + "l")) {
	  		var groupIdB = d3.select(this).attr("group")
	    	// console.log( d3.select(this).attr("id") );
	    	// console.log( "currId: " + currId);
	    	// console.log("groupIdB: " + groupIdB)

	    	d3.selectAll("[group='" + groupIdB + "']").classed("activelink indirect", stat);
	     	d3.selectAll("[group='" + groupIdB + "']").classed("link", !stat);
	    	// d3.select("#" + currId).classed("activelink", stat);
	     // 	d3.select("#" + currId).classed("link", !stat);
    	// else { console.log(d3.select(this).attr("id").includes(val.id))};
    }

	// "hat Nachfolger"
  		if(d3.select(this).attr("id").includes("ls" + val.LB_ID + "t")) {
	  		var currId = d3.select(this).attr("id")
	    	// console.log( d3.select(this).attr("id") );
	    	// console.log( "currId: " + currId);
	    	d3.select("#" + currId).classed("activelink direct", stat);
	     	d3.select("#" + currId).classed("link", !stat);
    	// else { console.log(d3.select(this).attr("id").includes(val.id))};
    }

    // "hat Vorgänger"
    	if(d3.select(this).attr("id").includes("t" + val.LB_ID + "l")) {
	  		var currId = d3.select(this).attr("id")
	    	// console.log( d3.select(this).attr("id") );
	    	// console.log( "currId: " + currId);
	    	
	    	
	    	d3.select("#" + currId).classed("activelink direct", stat)
	    	// d3.select(this).style("stroke-dasharray", "5,5", stat);
	     	d3.select("#" + currId).classed("link", !stat)
	     	// d3.select(this).attr("stroke-dasharray", "0", !stat);
    	// else { console.log(d3.select(this).attr("id").includes(val.id))};
  	}

	}) //each

} // function mouse_action

        


////////////////////////////////////////////////////////////	
////////////////////////// Links ///////////////////////////
////////////////////////////////////////////////////////////	


function linkHorizontal(d) {
  return "M" + d.source.x + "," + d.source.y
      + "C" + d.source.x +  "," + (d.source.y + d.target.y) / 2
      + " " + d.target.x + "," + (d.source.y + d.target.y) / 2
      + " " + d.target.x + "," + d.target.y;
}

function linkVertical(d) {
  return "M" + d.source.x + "," + d.source.y
      + "C" + (d.source.x + d.target.x) / 2 + "," + d.source.y
      + " " + (d.source.x + d.target.x) / 2 + "," + d.target.y
      + " " + d.target.x + "," + d.target.y;
}


linkGroup.selectAll("links")
	.data(data.links)
	.enter().append("path")
        .attr("class", function(d) {return "link " + d.group;})
        .attr("id", function(l) {
        	var sourceNode = data.sheets.filter(function(d, i) {
		       return d.LB_ID === l.source
		     })[0];
        	var targetNode = data.sheets.filter(function(d, i) {
		       return d.LB_ID === l.target
		     })[0];
        	return "ls" + sourceNode.LB_ID + "t" + targetNode.LB_ID + "l";})
        .attr("name", function(d) {return "g" + d.group + "l" + d.link;})
        .attr("group", function(d) {return "g" + d.group;})
        .attr("link", function(d) {return "l" + d.link;})
        // SVG path
        .attr("d", function (l) { 
        	var sourceNode = data.sheets.filter(function(d, i) {
		       return d.LB_ID === l.source
		     })[0];
        	var targetNode = data.sheets.filter(function(d, i) {
		       return d.LB_ID === l.target
		     })[0];
        	var oSource = {x: xScale(sourceNode.pos_x),// - 1 * boxWidth,
        					y: yScale(sourceNode.pos_y)
        				};
        	var oTarget = {x: xScale(targetNode.pos_x),// - 1 * boxWidth, 
        					y: yScale(targetNode.pos_y)
        				};
	                
	                if (oSource.x < oTarget.x) {
	                    oSource.x += boxWidth - 1 * boxWidth;
	                } else {
	                    oTarget.x += boxWidth - 1 * boxWidth;
	                }
	                return linkHorizontal({
	                    source: oSource,
	                    target: oTarget
	                });
	            })
        .attr("source", function(l) {
        	var sourceNode = data.sheets.filter(function(d, i) {
		       return d.LB_ID === l.source
		     })[0];
        	return sourceNode.LB_ID;})
        .attr("target", function(l) {
        	var targetNode = data.sheets.filter(function(d, i) {
		       return d.LB_ID === l.target
		     })[0];
        	return targetNode.LB_ID;})
        //.attr("data-toggle", "offCanvas");
		// .on("mouseover", function () {
		// 	console.log(this + "touched")
		// })
		// .on("click", function () {
		// 	console.log(this + "clicked")
		// })
        ;

////////////////////////////////////////////////////////////	
////////////////////////// Years ///////////////////////////
////////////////////////////////////////////////////////////	


			
///////////////////////////////////////////////////////////////////////////
///////////////////////// Create the Legend////////////////////////////////
///////////////////////////////////////////////////////////////////////////

if (!mobileScreen) {
	//Legend			
	var	legendMargin = {left: 5, top: 10, right: 5, bottom: 10},
		legendWidth = 145//,
		legendHeightMacro = 100;
		legendHeightPretexts = 280;
		legendHeightContexts = 10;
		legendHeightBio = 10;
		
	var svgLegendMacro = d3.select("#legendMacro").append("svg")
		.attr("id", "svg_macro")		
		.attr("width", (legendWidth + legendMargin.left + legendMargin.right))
		//.attr("height", (legendHeight + legendMargin.top + legendMargin.bottom))
		;

var svgLegendMacroR = d3.select("#legendMacroR").append("svg")
	.attr("id", "svg_macroR")		
	.attr("width", (legendWidth + legendMargin.left + legendMargin.right))
	//.attr("height", (legendHeight + legendMargin.top + legendMargin.bottom))
	;	

	var svgLegendPretexts = d3.select("#legendPretexts").append("svg")
		.attr("id", "svg_pretexts")		
		.attr("width", (legendWidth + legendMargin.left + legendMargin.right))
		//.attr("height", (legendHeight + legendMargin.top + legendMargin.bottom))
		;

	var svgLegendContexts = d3.select("#legendContexts").append("svg")
		.attr("id", "svg_contexts")		
		.attr("width", (legendWidth + legendMargin.left + legendMargin.right))
		//.attr("height", (legendHeight + legendMargin.top + legendMargin.bottom))
		;		

	var svgLegendBio = d3.select("#legendBio").append("svg")
		.attr("id", "svg_bio")		
		.attr("width", (legendWidth + legendMargin.left + legendMargin.right))
		//.attr("height", (legendHeight + legendMargin.top + legendMargin.bottom))
		;				

	var legendWrapperMacro = svgLegendMacro.append("g").attr("class", "legendWrapper")
					.attr("transform", "translate(" + legendMargin.left + "," + legendMargin.top +")");

var legendWrapperMacroR = svgLegendMacroR.append("g").attr("class", "legendWrapper")
				.attr("transform", "translate(" + legendMargin.left + "," + legendMargin.top +")");


	var legendWrapperPretexts = svgLegendPretexts.append("g").attr("class", "legendWrapper")
					.attr("transform", "translate(" + legendMargin.left + "," + legendMargin.top +")");				

	var legendWrapperContexts = svgLegendContexts.append("g").attr("class", "legendWrapper")
					.attr("transform", "translate(" + legendMargin.left + "," + legendMargin.top +")");								

	var legendWrapperBio = svgLegendBio.append("g").attr("class", "legendWrapper")
					.attr("transform", "translate(" + legendMargin.left + "," + legendMargin.top +")");													
		
	var rectSize = 15, //dimensions of the colored square
		rowHeight = 20, //height of a row in the legend
		maxWidth = 144; //widht of each row
		  
	//Create container per rect/text pair  
	var legendMacro = legendWrapperMacro.selectAll('.legendSquare')  	
			  .data(colorMacro.range())                              
			  .enter().append('g')   
			  .attr('class', 'legendSquare') 
			  .attr("transform", function(d,i) { return "translate(" + 0 + "," + (i * rowHeight) + ")"; })
			  .style("cursor", "pointer")
			  .on("mouseover", selectLegend(0.02, colorMacro, ".sheets"))
			  .on("mouseout", selectLegend(opacityCircles, colorMacro, ".sheets"));
	 
	hoverRect(legendMacro);
	legendSquares(legendMacro, colorMacro);
	legendText(legendMacro, colorMacro);

var legendMacroR = legendWrapperMacroR.selectAll('.legendSquare')  	
		  .data(colorMacro.range())                              
		  .enter().append('g')   
		  .attr('class', 'legendSquare') 
		  .attr("transform", function(d,i) { return "translate(" + 0 + "," + (i * rowHeight) + ")"; })
		  .style("cursor", "pointer")
		  .on("mouseover", selectLegend(0.02, colorMacro, ".sheets"))
		  .on("mouseout", selectLegend(opacityCircles, colorMacro, ".sheets"));
 
hoverRect(legendMacroR);
legendSquares(legendMacroR, colorMacro);
legendText(legendMacroR, colorMacro);

	//Create container per rect/text pair  
	var legendPretexts = legendWrapperPretexts.selectAll('.legendSquare')  	
			  .data(colorPretexts.range())                              
			  .enter().append('g')   
			  .attr('class', 'legendSquare') 
			  .attr("transform", function(d,i) { return "translate(" + 0 + "," + (i * rowHeight) + ")"; })
			  .style("cursor", "pointer")
			  .on("mouseover", selectLegend(0.02, colorPretexts, ".pretexts"))
			  .on("mouseout", selectLegend(opacityCircles, colorPretexts, ".pretexts"));

	hoverRect(legendPretexts);
	legendSquares(legendPretexts, colorPretexts);
	legendText(legendPretexts, colorPretexts);

	//Create container per rect/text pair  
	var legendContexts = legendWrapperContexts.selectAll('.legendSquare')  	
			  .data(colorContexts.range())                              
			  .enter().append('g')   
			  .attr('class', 'legendSquare') 
			  .attr("transform", function(d,i) { return "translate(" + 0 + "," + (i * rowHeight) + ")"; })
			  .style("cursor", "pointer")
			  //.on("mouseover", selectLegend(0.02, colorContexts))
			  //.on("mouseout", selectLegend(opacityCircles, colorContexts));

	//hoverRect(legendContexts);
	//legendSquares(legendContexts, colorContexts);
	//legendText(legendContexts, colorContexts);

	//Create container per rect/text pair  
	var legendBio = legendWrapperBio.selectAll('.legendSquare')  	
			  .data(colorBiography.range())                              
			  .enter().append('g')   
			  .attr('class', 'legendSquare') 
			  .attr("transform", function(d,i) { return "translate(" + 0 + "," + (i * rowHeight) + ")"; })
			  .style("cursor", "pointer")
			  //.on("mouseover", selectLegend(0.02, colorBiography))
			  //.on("mouseout", selectLegend(opacityCircles, colorBiography));

	hoverRect(legendBio);
	legendSquares(legendBio, colorBiography);
	legendText(legendBio, colorBiography);

	//Non visible white rectangle behind square and text for better hover
	function hoverRect(d) {
		var legend = d

		legend.append('rect')                                     
		  .attr('width', maxWidth) 
		  .attr('height', rowHeight) 			  		  
		  .style('fill', "white");
	};

	
	//Append small squares to Legend
	function legendSquares(d, color) {
		var legend = d

		legend.append('rect')                                     
			  .attr('width', rectSize) 
			  .attr('height', rectSize) 			  		  
			  .style('fill', function(d,i) {return color.range()[i]; });
	};
	
	//Append text to Legend
	function legendText(d, color) {
		var legend = d
		legend.append('text')                                     
		  .attr('transform', 'translate(' + 22 + ',' + (rectSize/2) + ')')
		  .attr("class", "legendText")
		  .style("font-size", "10px")
		  .attr("dy", ".35em")
		  .text(function(d,i) { return color.domain()[i]; });  
	};


// checkbox functions

// macro
// initial setup: checked
d3.select('#checkMacro').property('checked', true)

// pretexts
// initial setup: unchecked
d3.select('#checkPretexts').property('checked', false);
d3.select("#svg_pretexts")
	.attr("height", ("0"))
svg.selectAll(".pretexts")
    //.filter(function(d) { return d.properties.type === type; })
    	.attr("display", "none");

// contexts
// initial setup: unchecked
d3.select('#checkContexts').property('checked', false);
d3.select("#svg_contexts")
	.attr("height", ("0"))
svg.selectAll(".contexts")
    //.filter(function(d) { return d.properties.type === type; })
    	.attr("display", "none");

// bio
// initial setup: unchecked
d3.select('#checkBio').property('checked', false);
d3.select("#svg_bio")
	.attr("height", ("0"))

svg.selectAll(".biography")
    //.filter(function(d) { return d.properties.type === type; })
    	.attr("display", "none");	    	

function modifyState(checkbox){
  if(checkbox.checked){
    // uncheck all checkboxes
    if (document.getElementsByName("catDisplay")[0].value === "separated"){
		var catCheckbox = document.getElementsByName("catCheckbox");
	  	Array.prototype.forEach.call(catCheckbox, function(d) {
	  		window["un" + d.id]();
	  		d3.select('#' + d.id).property('checked', false);
	  		//console.log("un" + d.id);
	  	});
  	}else{}
 
 	// check selected checkbox
  	window[checkbox.id]();
  	d3.select('#' + checkbox.id).property('checked', true);
  	//console.log(checkbox.id + " checked")

  }else{
  	var toUncheck = checkbox.id
  	//uncheckMacro();
  	window["un" + toUncheck]();
  	d3.select('#' + toUncheck).property('checked', false);
    //console.log(checkbox.id + " unchecked") 
  }

}

function checkMacro(d) {
	var display = "flex"
	
	console.log("checkMacro (function)");
	// d3.selectAll("circle")
	// 	.attr("visibility", "hidden"); // "visible"
	// 
	svg.selectAll(".sheets")
    //.filter(function(d) { return d.properties.type === type; })
    	.attr("display", display);
 	// svg.selectAll("circle[class^='sheets AT-']")
		// 	.attr("display", display);
    //d3.selectAll(".legendWrapper")
    d3.selectAll("#svg_macro")
    //.filter(function(d) { return d.properties.type === type; })
    	.attr("display", display);	
	svg.selectAll(".link")
    //.filter(function(d) { return d.properties.type === type; })
    	.attr("display", display);
    svg.selectAll(".activelink")
    //.filter(function(d) { return d.properties.type === type; })
    	.attr("display", display);	

    
    // remove voronoi
    //svg._voronoi.remove();	
    
    	d3.select("#svg_macro")
		//.attr("width", (legendWidth + legendMargin.left + legendMargin.right))
		.attr("height", (legendHeightMacro + legendMargin.top + legendMargin.bottom))
    	console.log('resetting the voronoi: Macro');
    	svg._voronoi = d3.voronoi()
	  		.x(function(d) { return xScale(d.pos_x); })
	  		.y(function(d) { return yScale(d.pos_y); })
    		(data.sheets);
    		//(data.pretexts);
    	console.log('â€¦done.');
}

function uncheckMacro(d) {
	var display = "none"
	//console.log(type)
	//console.log("unchecking Macro!");
	// d3.selectAll("circle")
	// 	.attr("visibility", "hidden"); // "visible"
	// 
	svg.selectAll(".sheets")
    //.filter(function(d) { return d.properties.type === type; })
    	.attr("display", display);
 	// svg.selectAll("circle[class^='sheets AT-']")
		// 	.attr("display", display);
    //d3.selectAll(".legendWrapper")
    d3.selectAll("#svg_macro")
    //.filter(function(d) { return d.properties.type === type; })
    	.attr("display", display);	
	svg.selectAll(".link")
    //.filter(function(d) { return d.properties.type === type; })
    	.attr("display", display);
    svg.selectAll(".activelink")
    //.filter(function(d) { return d.properties.type === type; })
    	.attr("display", display);	

    	d3.select("#svg_macro")
		//.attr("width", (legendWidth + legendMargin.left + legendMargin.right))
			.attr("height", ("0"))

    	console.log('resetting the voronoi: Links ');
    	svg._voronoi = d3.voronoi()
	  		.x(function(d) { return xScale(d.pos_x); })
	  		.y(function(d) { return yScale(d.pos_y); })
	    	(data.links); // just a workaround; no voronoi on links needed
	    	// bug: after zooming the wrong voronoi is back (due to voronoiClick); how to make that context sensitive
	    	// fixed with a condition in voronoiClick()
    	console.log('â€¦done.');
}

function checkPretexts() {
	var display = "flex"

	//console.log("checkPretexts (function)");
	svg.selectAll(".pretexts")
    	.attr("display", display);

    	d3.select("#svg_pretexts")
		//.attr("width", (legendWidth + legendMargin.left + legendMargin.right))
		.attr("height", (legendHeightPretexts + legendMargin.top + legendMargin.bottom))
		svg.selectAll("circle[class^='sheets LB-']")
			.attr("display", display);
    	console.log('resetting the voronoi: Pretexts');
    	svg._voronoi = d3.voronoi()
	  		.x(function(d) { return xScale(d.pos_x); })
	  		.y(function(d) { return yScale(d.pos_y); })
    		(data.pretexts);//&& data.sheets
    	console.log('â€¦done.');
}

function uncheckPretexts() {
	
	var display = this.checked ? "flex" : "none";

	//console.log("unchecking Pretexts!");
	svg.selectAll(".pretexts")
    	.attr("display", display);
    	d3.select("#svg_pretexts")
		//.attr("width", (legendWidth + legendMargin.left + legendMargin.right))
		.attr("height", ("0"))
    	console.log('resetting the voronoi: Links');
    	svg._voronoi = d3.voronoi()
	  		.x(function(d) { return xScale(d.pos_x); })
	  		.y(function(d) { return yScale(d.pos_y); })
	    	(data.links); // just a workaround; no voronoi on links needed
	    	// bug: after zooming the wrong voronoi is back (due to voronoiClick); how to make that context sensitive
	    	// fixed with a condition in voronoiClick()
    	console.log('â€¦done.');
}


function checkContexts() {
	
	var display = "flex"

	svg.selectAll(".contexts")
    	.attr("display", display);

    	d3.select("#svg_contexts")
		//.attr("width", (legendWidth + legendMargin.left + legendMargin.right))
		.attr("height", (legendHeightContexts + legendMargin.top + legendMargin.bottom))
		svg.selectAll("circle[class^='sheets LB-']")
			.attr("display", display);
    	console.log('resetting the voronoi: Contexts');
    	svg._voronoi = d3.voronoi()
	  		.x(function(d) { return xScale(d.pos_x); })
	  		.y(function(d) { return yScale(d.pos_y); })
    		(data.contexts);
    	console.log('â€¦done.');
}

function uncheckContexts() {
	
	var display = "none";

	//console.log("unchecking Contexts!");

	svg.selectAll(".contexts")
    	.attr("display", display);

    	d3.select("#svg_contexts")
		//.attr("width", (legendWidth + legendMargin.left + legendMargin.right))
		.attr("height", ("0"))
    	console.log('resetting the voronoi: Links');
    	svg._voronoi = d3.voronoi()
	  		.x(function(d) { return xScale(d.pos_x); })
	  		.y(function(d) { return yScale(d.pos_y); })
	    	(data.links); // just a workaround; no voronoi on links needed
	    // 	// bug: after zooming the wrong voronoi is back (due to voronoiClick); how to make that context sensitive
	    // 	// fixed with a condition in voronoiClick()
    	console.log('â€¦done.');
}	

function checkBio() {
	var display = "flex"

	svg.selectAll(".biography")
    	.attr("display", display);

    	d3.select("#svg_bio")
		//.attr("width", (legendWidth + legendMargin.left + legendMargin.right))
		.attr("height", (legendHeightBio + legendMargin.top + legendMargin.bottom))
    	console.log('resetting the voronoi: Biogrpahy');
    	svg._voronoi = d3.voronoi()
	  		.x(function(d) { return xScale(d.pos_x); })
	  		.y(function(d) { return yScale(d.pos_y); })
    		(data.biography);
    	console.log('â€¦done.');
}	

function uncheckBio() {
	//d3.select("#checkBio").on("change", function() {
	
	console.log("unchecking Bio!");

	svg.selectAll(".biography")
    	.attr("display", "none");

    	d3.select("#svg_bio")
		//.attr("width", (legendWidth + legendMargin.left + legendMargin.right))
		.attr("height", ("0"))
    	console.log('resetting the voronoi: Links');
    	svg._voronoi = d3.voronoi()
	  		.x(function(d) { return xScale(d.pos_x); })
	  		.y(function(d) { return yScale(d.pos_y); })
	    	(data.links); // just a workaround; no voronoi on links needed
	    	// bug: after zooming the wrong voronoi is back (due to voronoiClick); how to make that context sensitive
	    	// fixed with a condition in voronoiClick()
    	console.log('â€¦done.');
}	


	// legend.append("xhtml:input")
	// 	  .attr("type", "checkbox")
	// 	  .attr("id", "check");

// legend.append("text")
// 	// .attr("x", "0")             
// 	// .attr("y", "1975")    
// 	.attr("class", "legend")
// 	.style("fill", "steelblue")   
// 	.attr("dy", ".35em")  
// 	.attr("dx", "12em")      
// 	.on("click", function(){
// 		var chosen = color.domain();
// 		var category = wrapper.selectAll(".sheets")
// 		// Determine if current line is visible
// 		var active   = category.active ? false : true,
// 		  newOpacity = active ? 0 : 1;
// 		// Hide or show the elements
// 		wrapper.selectAll(".sheets")
// 			//.filter(function(d) { return d.category != chosen; })
// 			.style("opacity", newOpacity);

// 		// Update whether or not the elements are active
// 		category.active = active;
// 	})
// 	.text("...");		  

	//Create g element for bubble size legend
	//var bubbleSizeLegend = legendWrapper.append("g")
	//						.attr("transform", "translate(" + (legendWidth/2 - 30) + "," + (color.domain().length*rowHeight + 20) +")");
	//Draw the bubble size legend
	//bubbleLegend(bubbleSizeLegend, rScale, legendSizes = [1e11,3e12,1e13], legendName = "GDP (Billion $)");		
}//if !mobileScreen
else {
	d3.select("#legend").style("display","none");
}

///////////////////////////////////////////////////////////////////////////
//////////////////// Hover function for the legend ////////////////////////
///////////////////////////////////////////////////////////////////////////
	
//Decrease opacity of non selected circles when hovering in the legend	
function selectLegend(opacity, colorChooser, typus) {
	return function(d, i) {
		var chosen = colorChooser.domain()[i];
			
		wrapper.selectAll(".pretexts")
			.filter(function(d) { return d.category != chosen; })
			.transition()
			.style("opacity", opacity);
		wrapper.selectAll(".sheets")
			.filter(function(d) { return d.category != chosen; })
			.transition()
			.style("opacity", opacity);
	  };
}//function selectLegend

///////////////////////////////////////////////////////////////////////////
/////////////////// Hover functions of the circles ////////////////////////
///////////////////////////////////////////////////////////////////////////

//Hide the tooltip when the mouse moves away
function removeTooltip (d, i) {

	//Save the chosen circle (so not the voronoi)
	var element = d3.selectAll(".sheets."+d.LB_ID);
		
	//Fade out the bubble again
	element.style("opacity", opacityCircles);
	
	//Hide tooltip
	$('.popover').each(function() {
		$(this).remove();
	}); 
  
	//Fade out guide lines, then remove them
	// d3.selectAll(".guide")
	// 	.transition().duration(200)
	// 	.style("opacity",  0)
	// 	.remove();
		
}//function removeTooltip

//Show the tooltip on the hovered over slice
function showTooltip (d, i) {
	
	//Save the chosen circle (so not the voronoi)
	var element = d3.select(".sheets."+d.LB_ID),
      el = element._groups[0];
	//Define and show the tooltip
	$(el).popover({
		placement: 'auto top',
		container: '#chart',
		trigger: 'manual',
		html : true,
		content: function() { 
			return "<span style='font-size: 11px; text-align: center;'>" + d.short + "</span>" + "<br/><span style='font-size: 11px; text-align: center;'>" + "X: " + d.pos_x + " â€“ Y: " + d.pos_y + "</span>"; }
	});	
	$(el).popover('show');

	//Make chosen circle more visible
	element.style("opacity", 1);

	//Place and show tooltip
	var x = +element.attr("cx"),
		y = +element.attr("cy"),
		colorMacro = element.style("fill");

	//Append lines to bubbles that will be used to show the precise data points
	
	//vertical line
	// wrapper
	// 	.append("line")
	// 	.attr("class", "guide")
	// 	.attr("x1", x)
	// 	.attr("x2", x)
	// 	.attr("y1", y)
	// 	.attr("y2", height + 2000) // TO DO: zoom transform height
	// 	.style("stroke", color)
	// 	.style("opacity",  0)
	// 	.transition().duration(200)
	// 	.style("opacity", 0.5);
	// //Value on the axis
	// svg
	// 	.append("text")
	// 	.attr("class", "guide")
	// 	.attr("x", x) // TO DO: zoom transform x
	// 	.attr("y", height + 38)
	// 	.style("fill", color)
	// 	.style("opacity",  0)
	// 	.style("text-anchor", "middle")
	// 	.text( d.pos_x )
	// 	.transition().duration(200)
	// 	.style("opacity", 0.5);

	//horizontal line
	// wrapper
	// 	.append("line")
	// 	.attr("class", "guide")
	// 	.attr("x1", x)
	// 	.attr("x2", -2000)
	// 	.attr("y1", y)
	// 	.attr("y2", y)
	// 	.style("stroke", color)
	// 	.style("opacity",  0)
	// 	.transition().duration(200)
	// 	.style("opacity", 0.5);
	// //Value on the axis
	// svg
	// 	.append("text")
	// 	.attr("class", "guide")
	// 	.attr("x", -25)
	// 	.attr("y", y) // TO DO: zoom transform y
	// 	.attr("dy", "0.35em")
	// 	.style("fill", color)
	// 	.style("opacity",  0)
	// 	.style("text-anchor", "end")
	// 	.text( d.pos_y )
	// 	.transition().duration(200)
	// 	.style("opacity", 0.5);	
					
}//function showTooltip


function getQueue (d, i) {
	console.log("getting queue...")
	sheet_queue.push(d.LB_ID)
	if(sheet_queue.length > 2) {
		sheet_queue.shift();
		$.each(data.links, function(d){
	  if(this.source === sheet_queue[0] || this.source === sheet_queue[1]){
	  	if(this.target === sheet_queue[0] || this.target === sheet_queue[1]){
	  		$("#side_by_side_link").attr("style", "display: unset;");
	  		side_by_side_link_div.html(
		     '<a href= "/synopsis/' + sheet_queue[0] + '-d/' + sheet_queue[1] + '-d' + '">' +
		     "ID: " + sheet_queue[0] + '<br/>' + '<->' + '<br/>' + sheet_queue[1] + "<br/>" + 
		     "</a>" )
		     .style("left", 300 + "px")			 //.style("left", (d3.event.pageX) + "px")			 
		     .style("top", 200 + "px");		//.style("top", (d3.event.pageY - 28) + "px")
		     return false;
	    } else {
	    	side_by_side_link_div.html('<div style="height: 0px; width: 0px;"></div>');
	    	$("#side_by_side_link").attr("style", "display: none");
	    }
	  }
		});
	}
	console.log("sheet_queue: " + sheet_queue)
	}

// Define side by side link div and append it to the tooltip.
var side_by_side_link_div = d3.select("body")   
							.append("div")
							.attr("class", "side_by_side_link")
							.attr("id", "side_by_side_link")
							.style("opacity", 100);


//////////////////////////////////////////////////////
/////////////////// Bubble Legend ////////////////////
//////////////////////////////////////////////////////

// function bubbleLegend(wrapperVar, scale, sizes, titleName) {

// 	var legendSize1 = sizes[0],
// 		legendSize2 = sizes[1],
// 		legendSize3 = sizes[2],
// 		legendCenter = 0,
// 		legendBottom = 50,
// 		legendLineLength = 25,
// 		textPadding = 5,
// 		numFormat = d3.format(",");
	
// 	wrapperVar.append("text")
// 		.attr("class","legendTitle")
// 		.attr("transform", "translate(" + legendCenter + "," + 0 + ")")
// 		.attr("x", 0 + "px")
// 		.attr("y", 0 + "px")
// 		.attr("dy", "1em")
// 		.text(titleName);
		
// 	wrapperVar.append("circle")
//         .attr('r', scale(legendSize1))
//         .attr('class',"legendCircle")
//         .attr('cx', legendCenter)
//         .attr('cy', (legendBottom-scale(legendSize1)));
//     wrapperVar.append("circle")
//         .attr('r', scale(legendSize2))
//         .attr('class',"legendCircle")
//         .attr('cx', legendCenter)
//         .attr('cy', (legendBottom-scale(legendSize2)));
//     wrapperVar.append("circle")
//         .attr('r', scale(legendSize3))
//         .attr('class',"legendCircle")
//         .attr('cx', legendCenter)
//         .attr('cy', (legendBottom-scale(legendSize3)));
		
// 	wrapperVar.append("line")
//         .attr('class',"legendLine")
//         .attr('x1', legendCenter)
//         .attr('y1', (legendBottom-2*scale(legendSize1)))
// 		.attr('x2', (legendCenter + legendLineLength))
//         .attr('y2', (legendBottom-2*scale(legendSize1)));	
// 	wrapperVar.append("line")
//         .attr('class',"legendLine")
//         .attr('x1', legendCenter)
//         .attr('y1', (legendBottom-2*scale(legendSize2)))
// 		.attr('x2', (legendCenter + legendLineLength))
//         .attr('y2', (legendBottom-2*scale(legendSize2)));
// 	wrapperVar.append("line")
//         .attr('class',"legendLine")
//         .attr('x1', legendCenter)
//         .attr('y1', (legendBottom-2*scale(legendSize3)))
// 		.attr('x2', (legendCenter + legendLineLength))
//         .attr('y2', (legendBottom-2*scale(legendSize3)));
		
// 	wrapperVar.append("text")
//         .attr('class',"legendText")
//         .attr('x', (legendCenter + legendLineLength + textPadding))
//         .attr('y', (legendBottom-2*scale(legendSize1)))
// 		.attr('dy', '0.25em')
// 		.text("$ " + numFormat(Math.round(legendSize1/1e9)) + " B");
// 	wrapperVar.append("text")
//         .attr('class',"legendText")
//         .attr('x', (legendCenter + legendLineLength + textPadding))
//         .attr('y', (legendBottom-2*scale(legendSize2)))
// 		.attr('dy', '0.25em')
// 		.text("$ " + numFormat(Math.round(legendSize2/1e9)) + " B");
// 	wrapperVar.append("text")
//         .attr('class',"legendText")
//         .attr('x', (legendCenter + legendLineLength + textPadding))
//         .attr('y', (legendBottom-2*scale(legendSize3)))
// 		.attr('dy', '0.25em')
// 		.text("$ " + numFormat(Math.round(legendSize3/1e9)) + " B");
		
// }//bubbleLegend
///////////////////////////////////////////////////////
/////////////// Networkvisualisation //////////////////
//////////////////////////////////////////////////////




































