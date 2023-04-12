
/**
 * Constructor for the CalculatorGraph
 *
 * @param data
 */
 function CalculatorGraph(data){

    var self = this;
    self.data = data;
  
    self.init();
  };
  
  /**
  * Initializes the svg elements required for this chart
  */
  CalculatorGraph.prototype.init = function(){
    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};
  
    //Gets access to the div element created for this chart from HTML
    self.myDiv = d3.select("#calculator-graph").classed('fullView', true)
    self.svgBounds = self.myDiv.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 300;
   
   
        
  };
  
 CalculatorGraph.prototype.stat = function(){
    //console.log(userstat)
    return userstat
 }
  
  /**
     * update graph upon submit btn being pressed
     */
  CalculatorGraph.prototype.update = function(){
    let userstat = 0
    
    var self = this;

    d3.select("#calculator-graph").selectAll("svg").remove()
    svg = self.myDiv.append("svg")
    .attr("width",self.svgWidth)
    .attr("height",self.svgHeight)
    .attr("class","calculator-svg")

    let stats = {
        "You": 0,
        "Average CO2 Emission in the U.S.": 0,
    }
    //get the data
    d3.csv("data/calculator-data.csv")
    .then((data)=> {
        d3.csv("data/electricity-region.csv").then((e_data)=>{

        
      
        data.forEach(d=>{
          d.Value = parseFloat(d.Value)
        })
        

        let comparisonData = {
            'user-co2-per-gallon': {
                'value':0,
                'x':0,
            },
            'user-co2-per-electricity': {
                'value':0,
                'x':0,
            },
            'user-co2-per-waste': {
                'value':0,
                'x':0,
            },
            'average-co2-per-gallon': {
                'value':0,
                'x':0,
            },
            'average-co2-per-electricity': {
                'value':0,
                'x':0,
            },
            'average-co2-per-waste': {
                'value':0,
                'x':0,
            },
        }
        
        //utilize the equation we got from the source to modifiy and calculate the result
        let rate = parseFloat(e_data.filter((entry)=>entry.Zip === self.data["zipcode"])[0]['Subregion annual CO2e output emission rate (lb/MWh)'])
       
        let metal = self.data['metal'] ? 89.38 : 0
        let glass = self.data['metal'] ? 25.39 : 0
        let plastic = self.data['metal'] ? 35.56 : 0
        let paper =  self.data['metal'] ? 113.14 : 0
        let bicycle = (self.data['bicycle'] * 365 / 21.6) * 19.6
        let ac = self.data['ac'] ? 0.0014 : 0
        let sleepFeatureComputer = self.data['sleepFeatureComputer'] ? 107.1 : 0
        let electricity = (self.data['electricity'] * 12) / 0.1188 
        let lamp = self.data['lamp'] * 33
        electricity = electricity - sleepFeatureComputer
        electricity = electricity - lamp
        electricity = electricity - (electricity * ac)
      

        comparisonData['user-co2-per-gallon']['value'] = ((self.data['gallon'] * 365) / 21.6 * 19.6) - bicycle
        comparisonData['user-co2-per-electricity']['value'] = (electricity * rate * 0.001) 
        comparisonData['user-co2-per-waste']['value'] = data[35]['Value'] - metal - glass - plastic - paper

        comparisonData['average-co2-per-gallon']['value'] = data[4]['Value']
        comparisonData['average-co2-per-electricity']['value'] = 5455
        comparisonData['average-co2-per-waste']['value'] = data[35]['Value']
        let comment = document.querySelector("#comment")
        let userCarbonStat = comparisonData['user-co2-per-gallon']['value'] + comparisonData['user-co2-per-electricity']['value'] + comparisonData['user-co2-per-waste']['value']
        let globalCarbonStat = comparisonData['average-co2-per-gallon']['value'] + comparisonData['average-co2-per-electricity']['value'] + comparisonData['average-co2-per-waste']['value']
        userstat = userCarbonStat
        stats["You"] = Math.round(userCarbonStat,2)
        stats["Average CO2 Emission in the U.S."] = globalCarbonStat


    let radiusScale = d3.scaleLinear()
    .domain([0,30])
    .range([7, 20]);

    let scaled = Math.round(userstat*0.0005)
    console.log(scaled)
    d3.select(".bubble-svg").selectAll(".node1").remove()
    //intialize the user's bubble for the bubble chart
    d3.select(".bubble-svg")
    .selectAll(".node1")
    .data([scaled])
    .enter()
    .append("circle")
    .attr("class", "node1")
    .attr("r", d=>d <= 0 ? 0 : radiusScale(d))
    .attr("cx", "90%")
    .attr("cy", "10%")
    .style("stroke", d=>"red")
    .style("stroke-width", 2)
    .attr("fill", "red")
    .on("mouseover",function(){
  
        document.querySelector("#hoverText-country").innerHTML = "You"
        document.querySelector("#hoverText-pop").innerHTML = ""
        document.querySelector("#hoverText-co2").innerHTML = "CO2 Emission per Capita: " + Math.round(userstat*0.0005) + "tons"
    })
        // show how much the user is emitting in numbers
        svg.selectAll(".marker")
            .data(Object.entries(stats))
            .enter()
            .append("text")
            .attr("class", "marker")
            .attr("x", self.svgWidth / 2)
            .attr("y",(d,i)=>{return (60 + (i*120))})
            .text((d,i)=>{return d[0] + ": " +  d[1] + "lbs"})
        
            
        //comments get changed depending on the value of co2 emission of the user
        if (userCarbonStat > globalCarbonStat){
            if (userCarbonStat > 100000){
                comment.innerHTML = "This is simply impossible. Please put down a correct number next time. "
            }else{
                comment.innerHTML = "You may want to consider few options on the right to reduce co2 emission..."
            }
            
        }
        else if (userCarbonStat < 0){
            comment.innerHTML = "This is simply impossible. Please put down a correct number next time. "
        }
        else{
            comment.innerHTML = "Amazing job! But we can still try to reduce more co2!"
        }
        let xScale = d3.scaleLinear()
        .domain([0,20000])
        .range([0,600])
       
        let x = 0
        Object.entries(comparisonData).forEach((key,i)=>{
        
            key[1].x = x
            if (i === 2){
                x = 0
            }else{
                x += xScale(key[1].value > 0 ? key[1].value : 0)
            }
            
            

        })
       
        //show individual value for gas, electricity and waste emission
        svg.selectAll(".marker2")
            .data(Object.entries(comparisonData))
            .enter()
            .append("text")
            .attr("class", "marker2")
            .attr("x", (d,i)=> {return i === 1 || i === 4 ? d[1].x + 40 : d[1].x})
            .attr("y", (d,i)=> {
                if (i < 3){
                    return 40
                }
                else{
                    return 160
                }
                
            })
            .attr("font-size", 12)
            .text((d,i)=>{return d[1].value <= 0 ? "" : Math.round(d[1].value,2) + "lbs"})
            .attr("transform", "translate(" 
            + 100 + "," + 50 
            + ") scale(" + 1.0 + ")")
            
        //intialize bar chart from the result
        svg.selectAll(".calculated-bar")
        .exit()
        .remove()
        .data(Object.values(comparisonData))
        .enter()
        .append("rect")
        .attr("class", "calculated-bar")
        .attr("fill", (d,i)=> {
            if (i === 0 || i === 3){
                return "#0049B7"
            }
            if (i === 1 || i === 4){
                return "#fff685"
            }
            else{
                return "#ff1d58"
            }
        })
        .attr("rx", "15")
        .attr("height", (d,i)=>40)
        .attr("y", (d,i)=> {
            if (i < 3){
                return 40
            }
            else{
                return 160
            }
            
        })
        svg.selectAll(".calculated-bar")
    
        .attr("x", (d,i)=> d.x)
       
        .attr("opacity",(d,i)=>{
            if (i < 3){
                return 1
            }
            else{
                return 0.5
            }
        })
        
        .attr("width", (d)=> xScale(d.value > 0 ? d.value : 0))
        .attr("transform", "translate(" 
                    + 100 + "," + 50 
                    + ") scale(" + 1.0 + ")")

        })
        

        
        
    })
   

    var xColor = {
        "Gas": "#0049B7",
        "Electricity": "#fff685",
        "Waste": "#ff1d58",
        
      }
    //create legends for the bar chart
    svg.selectAll(".legendSquare")
    .data(Object.entries(xColor))
    .enter()
    .append("rect")
    .attr("class", "legendSquare")
    .attr("x", "10")
    .attr("y", (d,i)=>{ return (130+(i*20))})
    .attr("height", "10")
    .attr("width", "10")
    .style("fill", (d,i)=>{return d[1]})
  
    svg.selectAll(".legend-text")
    .data(Object.entries(xColor))
    .enter()
    .append("text")
    .attr("class","legend-text")
    .attr("x", "25")
    .attr("y", (d,i)=>{ return (140+(i*20))})
    .text((d, i)=>{return (d[0])})

    //upon update, show the bubble chart as well
    document.querySelector("#bubble-chart-info-container").style.display = "block"
    document.querySelector("#bubble-chart").style.display = "block"
    document.querySelector("#bubble-chart-title").style.display = "block"
    

  
    
  
  };
  