d3.csv("./data/happyscore.csv").then(function(data) {
    console.log(data);

    var width = document.querySelector("#chart").clientWidth;
    var height = document.querySelector("#chart").clientHeight;
    var margin = {top: 50, left: 100, right: 50, bottom: 100};

    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)

    var filtered_data2016 = data.filter(function(d) {
        return d.year == 2016;
    });
    var filtered_data2017 = data.filter(function(d) {
        return d.year == 2017;
    });

    var lifeExp = {
        min2016: d3.min(filtered_data2016, function(d) { return +d.lifeExp; }),
        max2016: d3.max(filtered_data2016, function(d) { return +d.lifeExp; }),
        min2017: d3.min(filtered_data2017, function(d) { return +d.lifeExp; }),
        max2017: d3.max(filtered_data2017, function(d) { return +d.lifeExp; })
    };
  
    var gdpPercap = {
        min2016: d3.min(filtered_data2016, function(d) { return +d.gdpPercap; }),
        max2016: d3.max(filtered_data2016, function(d) { return +d.gdpPercap; }),
        min2017: d3.min(filtered_data2017, function(d) { return +d.gdpPercap; }),
        max2017: d3.max(filtered_data2017, function(d) { return +d.gdpPercap; })
    };

    var happyScore = {
        min2016: d3.min(filtered_data2016, function(d) { return +d.happyScore; }),
        max2016: d3.max(filtered_data2016, function(d) { return +d.happyScore; }),
        min2017: d3.min(filtered_data2017, function(d) { return +d.happyScore; }),
        max2017: d3.max(filtered_data2017, function(d) { return +d.happyScore; })
    };

    var xScale = d3.scaleLinear()
        .domain([lifeExp.min2016, lifeExp.max2016])
        .range([margin.left, width-margin.right]);

    var yScale = d3.scaleLinear()
        .domain([gdpPercap.min2016, gdpPercap.max2016])
        .range([height-margin.bottom, margin.top]);

    var rScale = d3.scaleSqrt()
        .domain([happyScore.min2016, happyScore.max2016])
        .range([2, 10]);

    var colorScale = d3.scaleOrdinal(d3.schemeSet3);

    var xAxis = svg.append("g")
        .attr("transform", `translate(0,${height-margin.bottom})`)
        .call(d3.axisBottom().scale(xScale));

    var yAxis = svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft().scale(yScale));
    
    var xAxisLabel = svg.append("text")
        .attr("class", "axisLabel")
        .attr("x", width/2)
        .attr("y", height - margin.bottom/2)
        .text("Life Expectancy");

    var yAxisLabel = svg.append("text")
        .attr("class","axisLabel")
        .attr("transform","rotate(-90)")
        .attr("x", -height/2)
        .attr("y", margin.left/2)
        .text("GDP Per Capita");
    

    var points = svg.selectAll("circle")
        .data(filtered_data2016, function(d){return d.country;})
        .enter()
        .append("circle")
            .attr("cx", function(d) { return xScale(d.lifeExp); })
            .attr("cy", function(d) { return yScale(d.gdpPercap); })
            .attr("r", function(d) { return rScale(d.happyScore); })
            .attr("fill", function(d) { return colorScale(d.region); });
    
        
    var tooltip = d3.select("#chart")
        .append("div")
        .attr("class","tooltip");

    points.on("mouseover", function(d) {
        var cx = +d3.select(this).attr("cx")+10;
        var cy = +d3.select(this).attr("cy")+130;
    
    tooltip.style("visibility","visible")
        .style("left", cx+"px")
        .style("top", cy+"px")
        .text(d.country+": "+d.happyScore);

    d3.select(this)
        .attr("stroke","#F6C900")
        .attr("stroke-width",2);

    }).on("mouseout", function() {

    tooltip.style("visibility","hidden");

    d3.select(this)
        .attr("stroke","none")
        .attr("stroke-width",0);
    });

    // the data update
d3.select("#Score2017").on("click", function() {
    xAxis.transition()
        .duration(1000)
        .delay(250)
        .call(d3.axisBottom().scale(xScale));
    yAxis.transition()
        .duration(1000)
        .delay(250)
        .call(d3.axisLeft().scale(yScale));
    var newPoints = svg.selectAll("circle")
        .data(filtered_data2017, function(d){return d.country;}); 
    var allNewPoints = newPoints.enter().append("circle") 
        .attr("cx", function(d) { return xScale(d.lifeExp); })
        .attr("cy", function(d) { return yScale(d.gdpPercap); })
        .attr("r", 0)
        .attr("fill", function(d) { return colorScale(d.region); })
      
    .merge(newPoints);
    allNewPoints.transition()
        .duration(1000)
        .delay(250)
        .attr("cx", function(d) { return xScale(d.lifeExp); }) 
        .attr("cy", function(d) { return yScale(d.gdpPercap); })
        .attr("r", function(d) { return rScale(d.happyScore); })
        .attr("fill", function(d) { return colorScale(d.region); })   
    newPoints.exit()
        .transition()
        .duration(1000)
        .delay(250)
        .attr("r",0)
        .remove();

    allNewPoints.on("mouseover", function(d) {

    var cx = +d3.select(this).attr("cx")+10;
    var cy = +d3.select(this).attr("cy")+130;

    tooltip.style("visibility","visible")
        .style("left", cx+"px")
        .style("top", cy+"px")
        .text(d.country+": "+d.happyScore);

    d3.select(this)
        .attr("stroke","#F6C900")
        .attr("stroke-width",2);
    }).on("mouseout", function() {
    tooltip.style("visibility","hidden");

    d3.select(this)
        .attr("stroke","none")
        .attr("stroke-width",0);
    })
    });

d3.select("#Score2016").on("click", function() {
    xAxis.transition() 
        .duration(1000)
        .delay(250)
        .call(d3.axisBottom().scale(xScale));
    yAxis.transition() 
        .duration(1000)
        .delay(250)
        .call(d3.axisLeft().scale(yScale));
    var oldPoints = svg.selectAll("circle")
        .data(filtered_data2016, function(d){return d.country;}); 
    allOldPoints = oldPoints.enter().append("circle") 
        .attr("cx", function(d) { return xScale(d.lifeExp); })
        .attr("cy", function(d) { return yScale(d.gdpPercap); })
        .attr("r", 0)
        .attr("fill", function(d) { return colorScale(d.region); })
     
    .merge(oldPoints)
    allOldPoints.transition()
        .duration(1000)
        .delay(250)
        .attr("cx", function(d) { return xScale(d.lifeExp); }) 
        .attr("cy", function(d) { return yScale(d.gdpPercap); })
        .attr("r", function(d) { return rScale(d.happyScore); })
        .attr("fill", function(d) { return colorScale(d.region); })   
    oldPoints.exit()
        .transition()
        .duration(1000)
        .delay(250)
        .attr("r",0)
        .remove();

    allOldPoints.on("mouseover", function(d) {
        var cx = +d3.select(this).attr("cx")+10;
        var cy = +d3.select(this).attr("cy")+130;

    tooltip.style("visibility","visible")
        .style("left", cx+"px")
        .style("top", cy+"px")
        .text(d.country+": "+d.happyScore);

    d3.select(this)
        .attr("stroke","#F6C900")
        .attr("stroke-width",2);

    }).on("mouseout", function() {

    tooltip.style("visibility","hidden");

    d3.select(this)
        .attr("stroke","none")
        .attr("stroke-width",0);
    })
    });
    var addLegend = d3.select("#my_dataviz2")
        .attr("class","mydots")
        .attr("class","mylabels");
    var keys = ["Southern Asia", "Central and Eastern Europe", "Middle East and Northern Africa", "Sub-Saharan Africa", "Latin America and Caribbean", "Australia and New Zealand", "Western Europe", "Southeastern Asia", "North America", "Eastern Asia"]
    var color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeSet3);
    addLegend.selectAll(".mydots")
        .data(keys)
        .enter()
        .append("circle")
          .attr("cx", 100)
          .attr("cy", function(d,i){ return 20 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
          .attr("r", 7)
          .style("fill", function(d){ return color(d)})
      
      // Add one dot in the legend for each name.
    addLegend.selectAll(".mylabels")
        .data(keys)
        .enter()
        .append("text")
          .attr("x", 120)
          .attr("y", function(d,i){ return 20 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
          .style("fill", function(d){ return color(d)})
          .text(function(d){ return d})
          .attr("text-anchor", "left")
          .style("alignment-baseline", "middle")
});