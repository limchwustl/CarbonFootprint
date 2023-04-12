/*
 * Root file that handles instances of all the charts and loads the visualization
 */
(function(){
    var instance = null;
  
    /**
     * Creates instances for every chart (classes created to handle each chart;
     * the classes are defined in the respective javascript files.
     * parse and modifiy data and create a bubble chart on initialization
     */
    function init() {
      
      d3.json("data/co2-emission-per-capita.json")
      .then((data)=> {
  
          d3.json("data/country-continent.json")
          .then((data2)=> {
              data.forEach((i) => {
               
                  let continent = data2.filter((d)=> d.country === i.country)
                
                  
                  i.continent = continent[0].continent
                  }
                  );
              

              d3.csv("data/country-code.csv").then((data3)=>{
                  data.forEach((i)=>{
                      let country = data3.filter((d)=> d.CountryName === i.country)
              
                      if (country.length){
           
                          i.CountryCode = country[0].CountryCode
                      }
                  })
                  //new bubble chart
                  let bubbleChart = new BubbleChart(data)
                  bubbleChart.update()
        
                 
                 
              })
              
             
          
       
         
      })
})

       
        
      
      
  
  
    }
  
    /**
     *
     * @constructor
     */
    function Main(){
        if(instance  !== null){
            throw new Error("Cannot instantiate more than one Class");
        }
    }
  
    /**
     *
     * @returns {Main singleton class |*}
     */
    Main.getInstance = function(){
        var self = this
        if(self.instance == null){
            self.instance = new Main();
  
            //called only once when the class is initialized
            init();
        }
        return instance;
    }
  
    Main.getInstance();
  })();

   /**
     * 
     * intialize local data objects and queryselector variables to manipulate HTML
     */
  
  let data = {
    zipcode: "63108",
    gallon: 10000,
    electricity:10000,
    metal:true,
    glass:true,
    plastic:true,
    paper:true,
    bicycle:0,
    ac:false,
    sleepFeatureComputer:false,
  
    lamp:0,
  }
  
  const modal = document.querySelector("#help-modal")
  const helpBtn = document.querySelector(".result-help-btn")
  const closeBtn = document.querySelector(".close")
  //make help modal responsive
  helpBtn.onclick = ((e)=>{
    modal.style.display = "block";
  })
  closeBtn.onclick = ((e)=>{
    modal.style.display = "none";
  })
  window.onclick=((e)=>{
    if (e.target == modal){
      modal.style.display = "none";
    }
  })
  //on windowload, bind onclick functions with corresponding html objects
  window.onload = (e)=>{
    const form = document.querySelector("form")
      form.onsubmit = submit.bind()
      document.querySelector("#bicycle").onclick = bicycleSelect
      document.querySelector("#lamp").onclick = lampSelect
      document.querySelector("#ac").onclick = acSelect
      document.querySelector("#sleepFeatureComputer").onclick = sFCSelect
      document.querySelector("#work-distance").onchange = bikeDistanceChange
      document.querySelector("#zipcode-submit-button").onclick = zipcodeSelect
      document.querySelector("#number-of-lamps").onchange = lampChange
  }
   /**
    * onclick functions initizalization
     */
  const zipcodeSelect = ((e)=>{
    let zipcode = document.querySelector("#zipcode").value
    data.zipcode = zipcode
    document.querySelector("#calculator-container").style.display = "block"
    document.querySelector("#initial-questions").style.display = "none"

  })
  const bikeDistanceChange = ((e)=>{
    let bicycle = document.querySelector("#work-distance").value !== 0 ? document.querySelector("#work-distance").value : 0
        data.bicycle = bicycle
        submit()
  })
  const bicycleSelect = ((e)=>{
    if(document.getElementById('bicycle').checked){
     
        let bicycle = document.querySelector("#work-distance").value !== 0 ? document.querySelector("#work-distance").value : 0
        data.bicycle = bicycle
        submit()
    }
  })
  const lampChange = ((e)=>{
    let lamp = document.querySelector("#number-of-lamps").value !== 0 ? document.querySelector("#number-of-lamps").value : 0
        data.lamp = lamp
        submit()
  })
  const lampSelect = ((e)=>{
    if(document.getElementById('lamp').checked){
     
        let lamp = document.querySelector("#number-of-lamps").value !== 0 ? document.querySelector("#number-of-lamps").value : 0
        data.lamp = lamp
        submit()
    }
  })
  const acSelect = ((e)=>{
    if(document.getElementById('ac').checked){
        console.log("clicked")
       // let ac = document.querySelector("#work-distance").value !== 0 ? document.querySelector("#work-distance").value : 0
        data.ac = true
        submit()
    }else{
        data.ac = false
        submit()
    }
  })
  const sFCSelect = ((e)=>{
    if(document.getElementById('sleepFeatureComputer').checked){
        
       // let ac = document.querySelector("#work-distance").value !== 0 ? document.querySelector("#work-distance").value : 0
        data.sleepFeatureComputer = true
        submit()
    }else{
        data.sleepFeatureComputer = false
        submit()
    }
  })

   /**
     * submit btn function implemented
     */
  const submit = ((e)=>{
  
    let zipcode = document.querySelector("#zipcode").value
    let gallon = document.querySelector("#gallon-per-year").value
    let electricity = document.querySelector("#electricity-per-year").value
    let metal = false
    let glass = false
    let plastic = false
    let paper = false
    
    if(document.getElementById('metal').checked) {
      metal = true
    }
    if(document.getElementById('glass').checked) {
      glass = true
    }
    if(document.getElementById('plastic').checked) {
      plastic = true
    }
    if(document.getElementById('paper').checked) {
      paper = true
    }
    data.gallon = gallon
    data.electricity = electricity
    data.metal = metal
    data.glass = glass
    data.plastic = plastic
    data.paper = paper
   
    //when submit btn is pressed, hide calcualtor and show the result and recommendation form on the screen
    if(e){
        e.preventDefault()
    }
    document.querySelector("#calculator-graph-container").style.display = "block"
    document.querySelector("#calculator-container").style.display = "none"
    document.querySelector("#recommendation-form-container").style.display = "block"
    //intiialize new calculated result and update
    var calculatorGraph = new CalculatorGraph(data)
    calculatorGraph.update()
    
    
    
    
  })