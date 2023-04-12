
/**
 * Constructor for the BubbleChart
 * 
 *
 *
 * @param data
 */
 function BubbleChart(data){

    var self = this;
    self.data = data;
  
    self.init();
  };
  
  /**
  * Initializes the svg elements required for this chart
  */
  BubbleChart.prototype.init = function(){
    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};
  
    //Gets access to the div element created for this chart from HTML
    self.myDiv = d3.select("#bubble-chart").classed('fullView', true)
    self.svgBounds = self.myDiv.node().getBoundingClientRect();
    self.svgWidth = 1200;
    self.svgHeight = 800;
    
  };
 
  
  
  BubbleChart.prototype.update = function(){
    
    var self = this;
    
    self.svg2 = self.myDiv.append("svg")
    .attr("width", self.svgWidth - 50)
    .attr("height", self.svgHeight)
    .attr("class", "bubble-svg");

      
       /**
     * https://github.com/jeffreymorganio/d3-country-bubble-chart(filling bubble chart circles with flags)
     author: Jeffrey Morganio year: 2020 title: d3-country-bubble-chart time accessed: November 2022
     I used country flag images and the code to fill bubbles with flags. 
     */
      var defs = self.svg2.append("defs");
      defs.selectAll(".flag")
        .data(self.data)
        .enter()
          .append("pattern")
          .attr("id", function(d) { return d.CountryCode; })
          .attr("class", "flag")
          .attr("width", "100%")
          .attr("height", "100%")
          .attr("patternContentUnits", "objectBoundingBox")
            .append("image")
            .attr("width", 1)
            .attr("height", 1)
          
            .attr("xlink:href", function(d) {
              return "./assets/images/flags/" + d.CountryCode + ".svg";
            });
    //some handy objects to store colors and x,y position of each continent
    var xCenter = {
        "Asia": 600,
       
        "Europe": 400,
        "Africa": 400,
        "North America": 150,
        "South America": 150,
        "Oceania": 750,
        "You": 800,
      }
      var yCenter = {
        "Asia": 400,
       
        "Europe": 300,
        "Africa": 450,
        "North America": 200,
        "South America": 400,
        "Oceania": 600,
        "You": 100,
      }
      var xColor = {
        "Asia": "#005b6e",
       
        "Europe": "#3c6ca7",
        "Africa": "#726eb7",
        "North America": "#a86bba",
        "South America": "#da66ac",
        "Oceania": "#ff6792",
        "You": "red",
      }
   
    self.data.forEach((i) => {
		i.co2PerCapita2020 = + i.co2PerCapita2020
		}
		);
    //give simulation to the bubble
    let simulation = d3.forceSimulation(self.data)
    .force("charge", d3.forceManyBody().strength(-250))
    .force('x', d3.forceX().x(function(d) {
        return xCenter[d.continent];
    }))
    .force('y', d3.forceY().y(function(d) {
        return yCenter[d.continent];
    }))
    .force("center", d3.forceCenter().x(self.svgWidth).y(self.svgHeight));
    let radiusScale = d3.scaleLinear()
    .domain([0,30])
    .range([7, 20]);
    self.nodes = self.svg2.selectAll(".node")
  .data(self.data)
  .enter()
  .append("circle")
  .attr("class", "node")
  .attr("r", d=>radiusScale(d.co2PerCapita2020))
  .style("stroke", d=>xColor[d.continent])
  .style("stroke-width", 3)
  .attr("fill", function(d, i) {
      return (typeof d.CountryCode !== "undefined") ? "url(#" + d.CountryCode + ")" : xColor[d.continent]
  })
  .on("mouseover",function(d){
  
    document.querySelector("#hoverText-country").innerHTML = d.target.__data__.country 
    document.querySelector("#hoverText-pop").innerHTML = "Population: " + d.target.__data__.pop2022 
    document.querySelector("#hoverText-co2").innerHTML = "CO2 Emission per Capita: " + d.target.__data__.co2PerCapita2020 + "tons"
  })
  
  
  simulation.on("tick", function() {


    self.nodes.attr("cx", function(d) { return d.x/2; })
         .attr("cy", function(d) { return d.y/2; });

});
function dragstart(d) {
  if (!d.active) simulation.alphaTarget(0.3).restart();
  d.subject.fx = d.subject.x;
  d.subject.fy = d.subject.y;
}

function drag(d) {
  d.subject.fx = d.x;
  d.subject.fy = d.y;
}

function dragend(d) {
  if (!d.active) simulation.alphaTarget(0);
  d.subject.fx = null;
  d.subject.fy = null;
}
self.nodes.call(d3.drag()
  .on("start", dragstart)
  .on("drag", drag)
  .on("end", dragend));
  //legends to help user to figure out which color belongs to which continent
  self.svg2.selectAll(".legendSquare2")
    .data(Object.entries(xColor))
    .enter()
    .append("rect")
    .attr("class", "legendSquare2")
    .attr("x", "10")
    .attr("y", (d,i)=>{ return (130+(i*20))})
    .attr("height", "10")
    .attr("width", "10")
    .style("fill", (d,i)=>{return d[1]})
    self.svg2.selectAll(".legend-text2")
    .data(Object.entries(xColor))
    .enter()
    .append("text")
    .attr("class","legend-text2")
    .attr("x", "25")
    .attr("y", (d,i)=>{ return (140+(i*20))})
    .text((d, i)=>{return (d[0])})
    
        
   
  };
  