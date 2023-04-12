


/**
 * Constructor for the HistoryGraph
 *
 * @param data
 */
 function HistoryGraph(){

  var self = this;
  self.tColorScale = ["#ff2e21", "#ff68ee", "#597dff"];
  self.cColorScale =  ["#0f7317", "black", "#713109"];


  self.init();
};

/**
 * Renders the HTML content for tool tip.
 *
 * @param tooltip_data information that needs to be populated in the tool tip
 * @return text HTML content for tool tip
 */
 HistoryGraph.prototype.tooltip_render = function (name) {
  var self = this;
  //var text = "<h2>asdf</h2>";
  var text = "<p>" + name + "</p>";
  return text;
}

/**
* Initializes the svg elements required for this chart
*/
HistoryGraph.prototype.init = function(){
  var self = this;
  self.margin = {top: 10, right: 40, bottom: 40, left: 50};

  //Gets access to the div element created for this chart from HTML
  var myDiv = d3.select("#history-graph").append("div").attr("class", "flex").classed("content", true);
  self.svgBounds = myDiv.node().getBoundingClientRect();
  self.width = self.svgBounds.width - self.margin.left - self.margin.right;
  self.height = screen.height/4;
  self.myDiv = myDiv
  
  //creates title div
  self.titleSvg = myDiv.append("div").attr("class", "titles")
  
  //title of graph
  self.titleSvg.append("h1")
      .text("History of CO2 and temperature")
      .attr("class","title")

  //text description
  var t = myDiv.append("div")
      t.append("h2")
      .text("Worried about climate change? Not sure how temperature and Carbon Dioxide (CO2) are related? Look no further")
  t.append("h4")
    .text("The graphs below show 450 million years of temperature and CO2 data. The data is shown to visually"
    + " represent variations over time, and is not meant as a quantitative resource. The methods of data collection vary, involving everything "
    + "from ice cores to oxygen istope levels to regular surface temperature.")
  t.append("h5")
    .text("Click on the buttons to view different time scales! Then zoom and pan around on the graph below to see anything you like.")
  
  //buttons to set different views
  self.buttons = myDiv.append("div")
                      .style("display", "flex")
                      .attr("id", "buttonHolder")
  self.v1 = self.buttons.append("button").text("Millions of years")
  self.v2 = self.buttons.append("button").text("Thousands of years").attr("id", "b2")
  self.v3 = self.buttons.append("button").text("Present")
  self.buttons.selectAll("button")
              .attr("class", "buttons")

  //creates svg element within the div
  self.svg = myDiv.append("svg")
      .attr("width",self.width + self.margin.left + self.margin.right)
      .attr("height",self.height + self.margin.top + self.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

  //text description of other graphs
  var t2 = myDiv.append("div").style("margin-left", "20px").style("margin-right", "20px")
  t2.append("h4")
    .text("View the graphs below to see the whole time scale, visualized with a logarithmic scale. As you interact with the "
    + "above graph, you will see the area you are looking at in perspective with the entirety of the data.")

  //clipping definition
  self.svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", self.width)
    .attr("height", self.height)

  
  self.minX = Infinity;
  self.maxX = -Infinity;

  //load files sequentially
  var files = ["data/edc3deuttemp2007.txt", "data/t-present.txt", "data/t-millions.csv", 
               "data/edc3-composite-co2-2008-noaa.tsv", "data/c-present.txt", "data/c-millions.csv"];
  var promises = [];

  files.forEach(function(url) {
    var a = url.split(".");
    var ext = a[a.length-1];
    var d;
    if (ext == "csv")
      d = d3.csv(url)
    else
      d = d3.tsv(url)
    promises.push(d)
  });

  Promise.all(promises).then(function(values) {
      //wrangle data once all loaded
      self.wrangleData(values);
  });
};

HistoryGraph.prototype.initVis = function(){
  var self = this;
  //data is wrangled
  console.log("Temperature data: ")
  console.log(self.data)
  console.log("CO2 data: ")
  console.log(self.cData)
  self.svg.append("rect")
    .attr("class", "mybrush")
    .attr("width", self.width)
    .attr("height", self.height)
    .attr("fill", "none")
    .attr("x", 0)
    .attr("y", 0);

  //create line graph
  // Scales and axes
  minX = Infinity;
  maxX = -Infinity; 
  self.tempMinY = Infinity; 
  self.tempMaxY = -Infinity;
  Object.entries(self.data).forEach(([key, dArray]) => {
    for (var j = 0; j < dArray.length; j++) {
      var d = dArray[j]
      var y = d.year
      var t = d.temp
      if (y < minX)
        minX = y;
      else if (y > maxX)
        maxX = y;
      if (t < self.tempMinY)
        self.tempMinY = t;
      else if (t > self.tempMaxY)
        self.tempMaxY = t;      
    }
  })
  var out = d3.extent(self.data["0"], function(d) { return d.temp; })
  self.tempMinY = out["0"]
  self.tempMaxY = out["1"]

  // Get co2 max and min values, keep x scale
  self.co2MinY = Infinity;
  self.co2MaxY = -Infinity;
  Object.entries(self.cData).forEach(([key, dArray]) => {
    for (var j = 0; j < dArray.length; j++) {
      var d = dArray[j]
      var c = d.co2
      var y = d.year
      if (y < minX)
        minX = y;
      else if (y > maxX)
        maxX = y;
      if (c < self.co2MinY)
        self.co2MinY = c;
      else if (c > self.co2MaxY)
        self.co2MaxY = c;      
    }
  })
  var out = d3.extent(self.cData["0"], function(d) { return d.co2; })
  self.co2MinY = out["0"]
  self.co2MaxY = out["1"]

  //console.log(minX + " " + maxX + " " + minY + " " + maxY)
  self.x = d3.scaleLinear()
      .range([0, self.width])
      .domain([minX, maxX]);

  self.xAxis = d3.axisBottom()
      .scale(self.x);

  //temperature y axis
  self.tempY = d3.scaleLinear()
      .range([self.height, 0])
      .domain([self.tempMinY, self.tempMaxY]);

  self.tempYAxis = d3.axisLeft()
      .scale(self.tempY);
  
  //co2 y axis
  self.co2Y = d3.scaleLinear()
      .range([self.height, 0])
      .domain([self.co2MinY, self.co2MaxY]);

  self.co2YAxis = d3.axisRight()
      .scale(self.co2Y)

  self.svg.append("g")
      .attr("class", "x-axis axis")
      .attr("transform", "translate(0," + self.height + ")");

  //two y axes
  self.svg.append("g")
    .attr("class", "y-axis axis temp");
  self.svg.append("g")
      .attr("class", "y-axis axis co2")
      .attr("transform", "translate(" + self.width + ",0)");

  //create the line
  var tempLineGen = d3.line()
      .x(function (d, i) {
          return self.x(d.year);
      })
      .y(function (d) {
          return self.tempY(d.temp);
      })
      .curve(d3.curveBasis);
  self.tempLineGen = tempLineGen

  var co2LineGen = d3.line()
      .x(function (d, i) {
          return self.x(d.year);
      })
      .y(function (d) {
          return self.co2Y(d.co2);
      })
      .curve(d3.curveBasis);
  self.co2LineGen = co2LineGen

  //create gradients
  var defs = self.svg.append("defs");
  //temperature gradient
  var gradient = defs.append("linearGradient")
  .attr("id", "t_gradient")
  .attr("x1", "0%")
  .attr("x2", "0%")
  .attr("y1", "0%")
  .attr("y2", "100%");

  gradient.append("stop")
  .attr("offset", "10%")
  .attr("stop-color", "#ff2e21");
  
  gradient.append("stop")
  .attr("offset", "70%")
  .attr("stop-color", "#ff68ee");

  gradient.append("stop")
  .attr("offset", "90%")
  .attr("stop-color", "#597dff");
  
  //co2 gradient
  var gradient = defs.append("linearGradient")
  .attr("id", "c_gradient")
  .attr("x1", "0%")
  .attr("x2", "0%")
  .attr("y1", "0%")
  .attr("y2", "100%");

  gradient.append("stop")
  .attr("offset", "70%")
  .attr("stop-color", "#713109");
  
  // gradient.append("stop")
  // .attr("offset", "60%")
  // .attr("stop-color", "black");
  
  gradient.append("stop")
  .attr("offset", "100%")
  .attr("stop-color", "#0f7317");

  //temp
  self.svg
    .selectAll("path.temp")
    .data(self.data)
    .enter()
    .append("path")
    .attr("d", tempLineGen)
    .attr("class", "line temp")
    .attr("fill", "none")
    .attr("stroke", "url(#t_gradient)")
    .on("mouseover", function(e, d) {
      //d3.select("#tooltip")
      var tTip = d3.select("body").select("#history-graph").append("div").attr("id", "tooltip")
           .style("left", e.pageX + "px")
           .style("top", e.pageY + "px")
          .style("opacity", 1)
          .attr("class", "tempLabel")
      var tSvg = tTip.append("svg")
                      .attr("width", 200)
                      .attr("height", 100)
      
      tTip.html(() => { return self.tooltip_render("Temperature") })
    })
    .on("mousemove", function(e,d) {
      d3.select("#tooltip")
          .style("left", e.pageX + "px")
           .style("top", e.pageY + "px")
    })
    .on("mouseout", function(e,d) {
      //d3.select("#tooltip").transition().style("opacity", 0);
      d3.select("#tooltip").remove()
    })

  //co2
  self.svg
    .selectAll("path.co2")
    .data(self.cData)
    .enter()
    .append("path")
    .attr("d", co2LineGen)
    .attr("class", "line co2")
    .attr("fill", "none")
    .attr("stroke", "url(#c_gradient)")
    .on("mouseover", function(e, d) {
      //d3.select("#tooltip")
      var tTip = d3.select("body").select("#history-graph").append("div").attr("id", "tooltip")
           .style("left", e.pageX + "px")
           .style("top", e.pageY + "px")
          .style("opacity", 1)
          .attr("class", "co2Label")
      var tSvg = tTip.append("svg")
                      .attr("width", 200)
                      .attr("height", 100)
      
      tTip.html(() => { return self.tooltip_render("Carbon Dioxide") })
    })
    .on("mousemove", function(e,d) {
      d3.select("#tooltip")
          .style("left", e.pageX + "px")
           .style("top", e.pageY + "px")
    })
    .on("mouseout", function(e,d) {
      //d3.select("#tooltip").transition().style("opacity", 0);
      d3.select("#tooltip").remove()
    })

  // Call x-axis, add label
	self.svg.select(".x-axis").call(self.xAxis)
    .append("text")
      .text("Year")
      .attr("fill", "black")
      .style("font-size", 20)
      .attr("class", "xAxis-label")
      .attr("x", self.width/2)
      .attr("y", self.margin.bottom)

  //call temp y-axis, add label
  self.svg.select(".y-axis.temp").call(self.tempYAxis)
    .append("text")
      .text("Temperature (C), deviation from 1951 - 1980 average")
      .attr("fill", "black")
      .style("font-size", 15)
      .attr("class", "yAxis-label")
      .attr("x", self.margin.right/3)
      .attr("y", self.margin.left/2)

  //call co2 y-axis, add label
  self.svg.select(".y-axis.co2").call(self.co2YAxis)
    .append("text")
      .text("CO2 (ppm)")
      .attr("fill", "black")
      .style("font-size", 15)
      .attr("class", "yAxis-label")
      .attr("x", -3*self.margin.right)
      .attr("y", self.margin.left/2)

    //initialize view to middle button


    // Define zoom
    self.zoom = d3.zoom()
    // Subsequently, you can listen to all zooming events
    .on("zoom", function(event, d){
        // Do something
        var transform = event.transform;
        // console.log("new:")
        // console.log(transform.x/self.width)
        // console.log(transform.y/self.width)
        // console.log(transform.k/self.width)

        //create new scale object based on event
        var new_xScale = transform.rescaleX(self.x);
        self.svg.select('.x-axis')
        .call(self.xAxis.scale(new_xScale));
        
        //get max and min for new y temp domain
        self.tempMinY = Infinity;
        self.tempMaxY = -Infinity;
        self.minX = Infinity;
        self.maxX = -Infinity;
        self.tempLineGen.x(function(d,i) {
          return new_xScale(d.year) 
        });
        for (var i = 0; i < self.data["0"].length; i++) {
          var d = self.data["0"][i]
          var y = d.temp
            if (new_xScale(d.year) > 0 && new_xScale(d.year) < self.width){
              if (y < self.tempMinY) {
                self.tempMinY = y
              }
              else if (y > self.tempMaxY) {
                self.tempMaxY = y
              }
              //save max and min year for smaller graph
              if (d.year < self.minX) {
                self.minX = d.year;
              }
              else if (d.year > self.maxX) {
                self.maxX = d.year;
              }
            }
        }
        temperatureGraph.updateVis();

        //get max and min for new y co2 domain
        self.co2MinY = Infinity;
        self.co2MaxY = -Infinity;
        self.co2LineGen.x(function(d,i) {
          return new_xScale(d.year) 
        });
        for (var i = 0; i < self.cData["0"].length; i++) {
          var d = self.cData["0"][i]
          var y = d.co2
          if (new_xScale(d.year) > 0 && new_xScale(d.year) < self.width){
            if (y < self.co2MinY) {
              self.co2MinY = y
            }
            else if (y > self.co2MaxY) {
              self.co2MaxY = y
            }
            //save max and min year for smaller graph
            if (d.year < self.minX) {
              self.minX = d.year;
            }
            else if (d.year > self.maxX) {
              self.maxX = d.year;
            }
          }
        }
        co2Graph.updateVis();


        self.updateVis()
    })
    // Specify the zoom scale's allowed range
    .scaleExtent([1,Infinity]);

    //attach call to view buttons
    self.v1
      .on("click", (e,d) => {
        self.svg.select(".mybrush")
          .transition()
          .ease(d3.easeExpInOut)
          .duration(1000)
          .call(self.zoom.transform, d3.zoomIdentity)
      });
    self.v2
      .on("click", (e,d) => {
        self.svg.select(".mybrush")
          .transition()
          .ease(d3.easeExpInOut)
          .duration(1000)
          //experimentally found values
          .call(self.zoom.transform, d3.zoomIdentity.translate(-511.0545528038439*self.width, 
                                                               -88.55678101575747*self.width)
                                                              .scale(512))
      });
    self.v3
    .on("click", (e,d) => {
      self.svg.select(".mybrush")
        .transition()
        .ease(d3.easeExpInOut)
        .duration(1000)
        //experimentally found values
        .call(self.zoom.transform, d3.zoomIdentity.translate(-691801.3728687196*self.width, 
                                                             -119895.4586154075*self.width)
                                                            .scale(691802.1635233006))
    });

  //simulate click to thousands of year scale
  document.getElementById("b2").click();

  //initialize temperature graph
  var temperatureGraph = new TemperatureGraph(self.data, "t", "Temperature (C)", self);
  var co2Graph = new TemperatureGraph(self.cData, "c", "CO2 (ppm)", self);
    //initialized, now update
    self.updateVis();
};

HistoryGraph.prototype.wrangleData = function(allData) {
    console.log(allData)
    var self = this;
    var data800k = allData[0];
    var dataPres = allData[1];
    var dataMillions = allData[2];
    var co2800k = allData[3];
    var co2Pres = allData[4];
    var co2Millions = allData[5];

/****temp data going back 800k years****/

    //data headers are at line 90, data starts at line 91
    data800k = data800k.filter((d,i) => {
      //trim takes out extra whitespace
      var stringData = d["EPICA Dome C Ice Core 800KYr Deuterium Data and Temperature Estimates"].trim();
      //split into array
      var arrayData = stringData.split(/(\s+)/);
      //take out empty elements
      arrayData = arrayData.filter((d) => {
          return d.trim() != ""
      })
      //add to data structure
      d.year = 1950 - arrayData[2]
      d.temp = +arrayData[4]
      d.y = d.temp
      d.source = "EPICA Temp"
      delete d["EPICA Dome C Ice Core 800KYr Deuterium Data and Temperature Estimates"];
      return i > 90;
    })
    //first couple of values are NaN
    data800k = data800k.filter((d) => {
      return !isNaN(d.temp)
    })
    //sort reverse
    data800k.sort((a,b) => {
      return a.year - b.year;
    });

/****temp data from 1880 to present****/

    dataPres = dataPres.filter((d,i) => {
      var stringData = d["Land-Ocean Temperature Index (C)"].trim();
      //split into array
      var arrayData = stringData.split(/(\s+)/);
      //take out empty elements
      arrayData = arrayData.filter((d) => {
          return d.trim() != ""
      })
      d.year = +arrayData[0]
      d.temp = +arrayData[1]
      d.y = d.temp
      d.source = "NASA Temp"
      delete d["Land-Ocean Temperature Index (C)"]
      return i > 3;
    });

/****temp data over 420 millions of years****/
    for (var i = 0; i < dataMillions.length; i++) {
      var d = dataMillions[i];
      d.year = -d.year * 1e6;
      d.temp = +d.temp;
      d.y = d.temp;
    }
    dataMillions.sort( (a,b) => {
      return a.year - b.year;
    })

/****c02 data over 800k years****/

    co2800k = co2800k.filter((d,i) => {
      d.year = 1950 - d["# EPICA Dome C - 800KYr CO2 Data"]
      d.co2 = +d.co2 //ppm
      d.y = d.co2
      d.source = "EPICA CO2"
      delete d["# EPICA Dome C - 800KYr CO2 Data"]
      return i > 274;
    });

/****temp data from 1880 to present****/

    co2Pres = co2Pres.filter((d,i) => {
      var stringData = d["# --------------------------------------------------------------------"].trim();
      //split into array
      var arrayData = stringData.split(/(\s+)/);
      //take out empty elements
      arrayData = arrayData.filter((d) => {
          return d.trim() != ""
      })
      d.year = +arrayData[2]
      d.co2 = +arrayData[3]
      d.y = d.co2
      d.source = "NASA CO2"
      delete d["# --------------------------------------------------------------------"]
      return i > 52;
    });

    co2Pres.sort( (a,b) => {
      return b.year - a.year;
    })


/****c02 data over 4000 mya****/
    var lastSource = co2Millions[0].Reference;
    co2Millions = co2Millions.filter((d,i) => {
      d.year = -d.year*1e6 //convert to millions
      d.co2 = +d.co2 //ppm
      d.y = d.co2
      if (d.Reference != '')
        lastSource = d.Reference
      d.source = lastSource
      delete d["# EPICA Dome C - 800KYr CO2 Data"]
      return i > 0;
    });

    //order
    co2Millions.sort( function(a,b) {
      return b.year - a.year
    })

/****combine data!*****/
     self.data = [];
    // self.data[0] = dataPres;
    // self.data[1] = data800k;
    //self.data = [dataPres, data800k];
    tempData = dataMillions.concat(data800k)
    tempData = tempData.concat(dataPres);
    //tempData = tempData.concat(dataPres)
    self.data.push(tempData)
    //self.data = dataPres;


    self.cData = [];
    cData = co2Pres.concat(co2800k);
    cData = cData.concat(co2Millions)
    self.cData.push(cData)
    // self.cData[0] = co2800k;
    // self.cData[1] = co2Pres;
    // self.cData[2] = co2Millions;

    //further edit data
    self.data = self.interpolateData(self.data, 4);
    self.cData = self.interpolateData(self.cData, 1);


    self.initVis();
}

HistoryGraph.prototype.interpolateData = function(data, num) {
  data["0"] = data["0"].filter(function(d, i) {
    return (i % num) == 0;
  });
  return data
}

HistoryGraph.prototype.update = function(){
  var self = this;

};

/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

HistoryGraph.prototype.updateVis = function(){
	var self = this;	
  // self.svg.select(".mybrush").call(self.brush)
	// .selectAll('rect')
	// 	.attr("height", self.height)
	// *** TO-DO ***
	// Call zoom component here
	var brushGroup = self.svg.select(".mybrush")
	brushGroup.call(self.zoom)
		//.on("mousedown.zoom", null)
		//.on("touchstart.zoom", null)
		


	// Call the area function and update the path
	// D3 uses each data point and passes it to the area function.
	// The area function translates the data into positions on the path in the SVG.

	d3.selectAll(".line.temp")
    .data(self.data)
    .transition()
    .duration(500)
    .ease(d3.easeSinOut)
    .attr("d", self.tempLineGen)
    .attr("clip-path", "url(#clip)");
  
	d3.selectAll(".line.co2")
    .data(self.cData)
    .transition()
    .duration(500)
    .ease(d3.easeSinOut)
    .attr("d", self.co2LineGen)
    .attr("clip-path", "url(#clip)");

  //update domains due to zooming
  if (self.tempMinY != Infinity && self.tempMaxY != -Infinity)
    self.tempY.domain([self.tempMinY, self.tempMaxY])//.clamp(true);
  if (self.co2MinY != Infinity && self.co2MaxY != -Infinity)
    self.co2Y.domain([self.co2MinY, self.co2MaxY])//.clamp(true);

	// Call axis functions with the new domain 
	self.svg.select(".x-axis").call(self.xAxis);
	self.svg.select(".y-axis.temp").call(self.tempYAxis);
	self.svg.select(".y-axis.co2").call(self.co2YAxis);


}
