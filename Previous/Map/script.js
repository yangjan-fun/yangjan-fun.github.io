/*
LOADING DATA FROM MULTIPLE FILES

To load data from multiple files using d3.csv(), d3.json(), etc.,
we create an array, the items of which are defined by what's returned
by those functions. It's like we're calling those functions separately
and then placing their returned values in an array for later use.
*/
var promises = [
    d3.csv("./data/Border_Crossing_Entry_Data2018.csv",parseCSV),
    d3.json("./geojson/gz_2010_us_040_00_20m.json")
];

/*
PROMISE.ALL()

After we have created our array of promises, we can ask the browser
to wait until all file loading functions are complete before doing
anything with them -- using the Promise.all() construction.
*/
Promise.all(promises).then(function(data) {

    /*
    The data from both files loaded above are stored in an array 
    named `data` (at least, that's what we've named it here!).

    We can access the individual files' data by index position 
    inside that array.
    */

    console.log(data);

    /*
    STANFORD: US MASS SHOOTINGS DATABASE 1966 - 2016
    Adapted from:
    https://www.kaggle.com/carlosparadis/stanford-msa
    */
    var entriesData = data[0];

    /*
    GEOJSON: UNITED STATES, STATE OUTLINES
    
    Note that this is in GeoJSON format, a special variety of JSON.
    */

    var usa = data[1];

    /*
    BEGIN BY DEFINING THE DIMENSIONS OF THE SVG and CREATING THE SVG CANVAS
    */
    var width = document.querySelector("#chart").clientWidth;
    var height = document.querySelector("#chart").clientHeight;
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);


    /*
    MAKE THE BASE MAP
    */

    // The projection determines how latitude/longitude are transformed into x- and y-position
    //templates on d3js.org ----API ----Search for Projection

    var projection = d3.geoAlbers()
        .translate([width/2,height/2])
        .scale(1020);



    // The d3.geoPath() generator will convert our GeoJSON into SVG path elements

    var path = d3.geoPath().projection(projection);


    // Draw the paths (outlines for the states)

    svg.selectAll("path")
        .data(usa.features)
        .enter()
        .append("path")
            .attr("class","state")
            .attr("d", path)

    /*
    SORT THE DATA

    We will sort the data by year, earliest to most recent
    */

    entriesData = entriesData.sort(function(a,b) { 
        return a.month - b.month || b.entries - a.entries;
    });




    var monthName = new Array();
        monthName[0] = "January";
        monthName[1] = "February";
        monthName[2] = "March";
        monthName[3] = "April";
        monthName[4] = "May";
        monthName[5] = "June";
        monthName[6] = "July";
        monthName[7] = "August";
        monthName[8] = "September";
        monthName[9] = "October";
        monthName[10] = "November";
        monthName[11] = "December";

    /*
    UPDATE THE SLIDER MIN AND MAX

    The HTML slider will enable us to change the map data by selected year
    */
    var slider = d3.select("#selectMonth");

    slider 
        .property("min", entriesData[0].month)
        .property("max", entriesData[entriesData.length-1].month)
        .property("value", entriesData[0].month);
    var selectedMonth = slider.property("value");

    


    /*
    MAKE A LABEL FOR THE CURRENTLY SELECTED YEAR
    */
    var monthLabel = svg.append("text")
        .attr("class","monthLabel")
        .attr("x",70)
        .attr("y", height - 80)
        .text(selectedMonth);
    


    /* 
    DRAW THE POINTS
    
    */
    var rScale = d3.scaleSqrt()
        .domain([1,1280090])
        .range([2,70]);
    var colorScale = d3.scaleOrdinal(d3.schemeTableau10);
    function updateMap(month) {
        var filtered_data = entriesData.filter(function(d){
            return d.month == month;
        });

        var c = svg.selectAll("circle")
            .data(filtered_data, function(d){return d.id});
        c.enter().append("circle")
            .attr("cx", function(d){
                var proj = projection([d.longitude, d.latitude]); //x position
                return proj[0];
            }).attr("cy",function(d){
                var proj = projection([d.longitude, d.latitude]); //y position
                return proj[1];
            }).attr("r",0)
                .attr("opacity",0.7)
                .attr("fill", function(d) { return colorScale(d.measure); })
            .transition(1000)
            .attr("cx", function(d){
                var proj = projection([d.longitude, d.latitude]); //x position
                return proj[0];
            }).attr("cy",function(d){
                var proj = projection([d.longitude, d.latitude]); //y position
                return proj[1];
            }).attr("r",function(d){return rScale(d.entries)}) //*
            .attr("opacity",0.7)
            .attr("fill", function(d) { return colorScale(d.measure); })
        c.exit()
            .transition()
            .duration(1000)
            .attr("r",0)
            .remove();
        monthLabel.text(monthName[month]);
        svg.selectAll("circle")
            .on("mouseover",function(d){
                var cx = +d3.select(this).attr("cx") + 15;
                var cy = +d3.select(this).attr("cy") - 15;
                tooltip.style("visibility","visible")
                    .style("left", cx + "px")
                    .style("top", cy + "px")
                    .html(d.location + " (" + d.state + ")" + "<br>" + d.measure + ": " + d.entries);//*
                svg.selectAll("circle")
                    .attr("opacity",0.5);
                d3.select(this)
                    .attr("opacity",1);

            }).on("mouseout",function(){
                tooltip.style("visibility","hidden")
                    .attr("opacity",0.4);
            })
        }
    
    
    //initialize map
    updateMap(selectedMonth);
    /*
    LISTEN FOR SLIDER CHANGES AND UPDATE MAP

    What is the difference between 'input' and 'change' events?
    */
    slider.on("input", function(){
        var month = this.value;
        console.log(month);

        selectedMonth = month;
        updateMap(selectedMonth);

    })

    



    /*
    ADD A TOOLTIP

    We will create a reference to the tooltip here,
    but we will bind the tooltip to the circles created in
    the updateMap() function
    */
    var tooltip = d3.select("#chart")
    .append("div")
    .attr("class","tooltip")

});

/* 
CREATE A PARSE FUNCTION

A parse function is simply a function that we can use to clean up our data.
We first pass our data from the CSV file through this function, and then after that
the data get passed into the part of the script that will create the map from those data.

Here, the parse function will only select specific columns of interest
from the CSV file (we don't need all of them!) and also extract the
year from the date column.
*/
function parseCSV(data) {


    var d = {};
    d.id = data.CaseID;
    d.location = data.PortName;
    d.latitude = +data.Latitude;
    d.longitude = +data.Longitude;
    d.entries = +data["Total Number of Entries"]; //if heaader has spacing
    d.date = new Date(data.Date); //take string value of data, converts to format that js undestands as data
    d.month = +d.date.getMonth(); //extract years 
    d.measure = data.Measure;
    d.state = data.State;
    return d;

}




