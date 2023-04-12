
/**
 * Constructor for the TemperatureGraph
 *
 * @param data
 */
 function TemperatureGraph(data, id, title, bigGraph){
  var self = this;
  self.bigGraph = bigGraph;
  self.id = id;
  self.title = title;
  self.data = data
  
  self.init();
};

/**
* Initializes the svg elements required for this chart
*/
TemperatureGraph.prototype.init = function(){
  var self = this;
  console.log("TEMPERATURE GRAPH")
  console.log(self.data)
  self.margin = {top: 10, right: 40, bottom: 40, left: 50};

  //Gets access to the div element created for this chart from HTML
  var myDiv = d3.select("#history-graph").append("div").attr("class", "flex").classed("content", true);
  self.svgBounds = myDiv.node().getBoundingClientRect();
  self.width = self.svgBounds.width - self.margin.left - self.margin.right;
  self.height = self.bigGraph.height/1.7;
  self.myDiv = myDiv
  
  //creates title div
  self.titleSvg = myDiv.append("div").attr("class", "titles")
  
  //title of graph
  /*self.titleSvg.append("h1")
      .text("Global temperature")
      .attr("class","title")*/

  //creates svg element within the div
  self.svg = myDiv.append("svg")
      .attr("width",self.width + self.margin.left + self.margin.right)
      .attr("height",self.height + self.margin.top + self.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

  self.rect = self.svg.append("rect")
      .attr("width", 0)
      .attr("height", self.height)
      .attr("fill", "#e5e5e5")
      .attr("stroke", "black")
      //.style("opacity", "0.1")
      .attr("x", 0)
      .attr("y", 0)
      //.attr("clip-path", "url(#clip)");

  self.initVis();
};

TemperatureGraph.prototype.initVis = function(){
  var self = this;

  //scale to all negative values for log graph
  var m = d3.extent(self.data["0"], function(d) { return d.year; });
  var mi = m["0"]
  var ma = m["1"] + 1
  self.ToNeg = d3.scaleLinear()
      .range([mi - ma, -1])
      .domain(d3.extent(self.data["0"], function(d) { return d.year; }))

  //log scale
  self.x = d3.scaleLog()
      .range([0, self.width])
      .domain(d3.extent(self.data["0"], function(d) { return self.ToNeg(d.year); }))
      .base(10)

  self.xAxis = d3.axisBottom()
      .scale(self.x);

  //temperature y axis
  self.tempY = d3.scaleLinear()
      .range([self.height, 0])
      .domain(d3.extent(self.data["0"], function(d) { return d.y; }));

  self.tempYAxis = d3.axisLeft()
      .scale(self.tempY);

  self.svg.append("g")
      .attr("class", "x-axis axis")
      .attr("transform", "translate(0," + self.height + ")");
  self.svg.append("g")
    .attr("class", "y-axis axis temp");

  //create the line
  var tempLineGen = d3.line()
      .x(function (d, i) {
          return self.x(self.ToNeg(d.year));
      })
      .y(function (d) {
          return self.tempY(d.y);
      })
      .curve(d3.curveBasis);
  self.tempLineGen = tempLineGen

  //temp
  self.svg
    .selectAll("path.temp")
    .data(self.data)
    .enter()
    .append("path")
    .attr("d", tempLineGen)
    .attr("class", "line-small temp")
    .attr("fill", "none")
    //.attr("stroke", gradient)
    .attr("stroke", "url(#" + self.id + "_gradient" + ")")
console.log("pathed")
  // Call x-axis, add label
	self.svg.select(".x-axis").call(self.xAxis)
    .append("text")
      .text("Years from present")
      .attr("fill", "black")
      .style("font-size", 20)
      .attr("class", "xAxis-label")
      .attr("x", self.width/2)
      .attr("y", self.margin.bottom/1.1)

  //call temp y-axis, add label
  self.svg.select(".y-axis.temp").call(self.tempYAxis)
    .append("text")
      .text(self.title)
      .attr("fill", "black")
      .style("font-size", 20)
      .attr("class", "yAxis-label")
      .attr("x", self.margin.right/3)
      .attr("y", self.margin.left/2)

    //initialized, now update
    self.updateVis();
};

/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

TemperatureGraph.prototype.updateVis = function(){
	var self = this;

  let minX = self.bigGraph.minX;
  let maxX = self.bigGraph.maxX;

  if (minX != Infinity && maxX != -Infinity) {
    var x = self.x(self.ToNeg(minX));
    var w = self.x(self.ToNeg(maxX)) - self.x(self.ToNeg(minX));
    self.rect
      .attr("x", x)
      .attr("width", w)
  }


}
