/*
 * Root file that handles instances of all the charts and loads the visualization
 */
function myFunction() {
  var popup = document.getElementById("myPopup");
  popup.classList.toggle("show");
}
(function(){
  var instance = null;

  /**
   * Creates instances for every chart (classes created to handle each chart;
   * the classes are defined in the respective javascript files.
   */
  function init() {
    //create pop up for next time
    // var p = d3.select("body")
    //   .append("div")
    //   .attr("class", "popuptext")
    //   .attr("id", "myPopup")

    // p.append("p")
    //   .text("HELLO")

    //initialize graph
    var historyGraph = new HistoryGraph();
   
    
    


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

const modal = document.querySelector("#init-modal")
  //const helpBtn = document.querySelector(".result-help-btn")
  const closeBtn = document.querySelector(".close")
  
  closeBtn.onclick = ((e)=>{
    modal.style.display = "none";
  })
  window.onclick=((e)=>{
    if (e.target == modal){
      modal.style.display = "none";
    }
  })
