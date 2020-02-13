function ShowBAR(id, Indata){
    var ColSow = "#377eb8";
    function segColor(c){ return {"≤ 15":"#deebf7", "15 - 65":"#9ecae1", "≥ 65":"#3182bd"}[c]; }
    Indata.forEach(function(ind){ind.total=ind.freq.low+ind.freq.mid+ind.freq.high;});
   
    function histoGram(ListDepic){
        var RectG={}, 
        ColList = {parameter1: 50, parameter2: 0, parameter3: 40, parameter4: 0};
            ColList.w = 500 - ColList.parameter4 - ColList.parameter2, 
            ColList.h = 300 - ColList.parameter1 - ColList.parameter3;
        
        var ShowSVG = d3.select(id)
            .append("svg")
                .attr("width", ColList.w + ColList.parameter4 + ColList.parameter2)
                .attr("height", ColList.h + ColList.parameter1 + ColList.parameter3)
            .append("g")
                .attr("transform", "translate(" + ColList.parameter4 + "," + ColList.parameter1 + ")");
 
        var xaxis = d3.scale.ordinal()
            .rangeRoundBands([0, ColList.w], 0.1)
            .domain(ListDepic.map(function(d) { return d[0]; }));
        
        ShowSVG.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + ColList.h + ")")
            .call(d3.svg.axis().scale(xaxis).orient("bottom"));
 
        var yaxis = d3.scale.linear()
            .range([ColList.h, 0])
            .domain([0, d3.max(ListDepic, function(d) { return d[1]; })]);
        
        var ListBar = ShowSVG.selectAll(".bar")
            .data(ListDepic)
            .enter().append("g")
            .attr("class", "bar");
            
        ListBar.append("rect")
            .attr("x", function(d) { return xaxis(d[0]); })
            .attr("y", function(d) { return yaxis(d[1]); })
            .attr("width", xaxis.rangeBand())
            .attr("height", function(d) { return ColList.h - yaxis(d[1]); })
            .attr('fill',ColSow)
            .on("mouseover",mouseover)
            .on("mouseout",mouseout); 
        
        ListBar.append("text")
            .text(function(d){ return d3.format(",")(d[1])})
            .attr("x", function(d) { return xaxis(d[0])+xaxis.rangeBand()/2; })
            .attr("y", function(d) { return yaxis(d[1])-5; })
            .attr("text-anchor", "middle");
        
        function mouseover(d){   
            var cont = Indata.filter(function(s){ return s.Continent == d[0];})[0],
            ind = d3.keys(cont.freq).map(function(s){ 
                return {type:s, freq:cont.freq[s]};
            });           
            DrawGram.update(ind);
            leg.update(ind);
        }
        
        function mouseout(d){
            DrawGram.update(tF);
            leg.update(tF);
        }

        RectG.update = function(ind, color){
            yaxis.domain([0, d3.max(ind, function(d) { return d[1]; })]);
        
            var MoutBar = ShowSVG.selectAll(".bar").data(ind);         
            
            MoutBar.select("rect")
                .transition()
                .duration(400)
                .attr("y", function(d) {return yaxis(d[1]); })
                .attr("height", function(d) { return ColList.h - yaxis(d[1]); })
                .attr("fill", color);
            
            MoutBar.select("text")
                .transition()
                .duration(400)
                .text(function(d){ return d3.format(",")(d[1])})
                .attr("y", function(d) {return yaxis(d[1])-5; });            
        }        
        return RectG;
    }
   
    function ShowChart(pD){
        var DrawGram ={},
        ShowChartpD ={w:230, h: 280};
        ShowChartpD.r = Math.min(ShowChartpD.w, ShowChartpD.h) / 2;
         
        var ShowSVGSC = d3.select(id)
            .append("svg")
                .attr("width", ShowChartpD.w)
                .attr("height", ShowChartpD.h)
            .append("g")
                .attr("transform", "translate("+ShowChartpD.w/2+","+ShowChartpD.h/2+")");
         
        var arc = d3.svg.arc()
            .outerRadius(ShowChartpD.r - 30)
            .innerRadius(0);
        
        var pie = d3.layout.pie()
            .sort(null)
            .value(function(d) { return d.freq; });
 
        ShowSVGSC.selectAll("path")
            .data(pie(pD))
            .enter()
            .append("path")
            .attr("d", arc).each(function(d) { this._current = d; })
            .style("fill", function(d) { return segColor(d.data.type); })
 
        DrawGram.update = function(inD){
            ShowSVGSC.selectAll("path")
                .data(pie(inD)).transition().duration(500)
                .attrTween("d", arcTween);
        }        
        
        /*
        function mouseover(ind){ 
            RectG.update(Indata.map(function(v){ return [v.Continent,v.freq[ind.data.type]];}), segColor(ind.data.type));
        }
                
        function mouseout(ind){
            RectG.update(Indata.map(function(v){ return [v.Continent,v.total];}), ColSow);
        }
        */
                
        function arcTween(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(parameter1) { return arc(i(parameter1));};
        }    
        return DrawGram;
    }
     
    function legend(inld){
        var leg = {};
        var legend = d3.select(id)
            .append("table")
            .attr('class','legend');
        var Settr = legend.append("tbody")
            .selectAll("tr")
            .data(inld)
            .enter()
            .append("tr");
         
        Settr.append("td")
            .append("svg")
                .attr("width", '16')
                .attr("height", '16')
            .append("rect")
                .attr("width", '16')
                .attr("height", '16')
                .attr("fill",function(d){ return segColor(d.type); });

        Settr.append("td")
            .text("Age"); 

        Settr.append("td")
            .text(function(d){ return d.type;});

        Settr.append("td")
            .attr("class",'legendFreq')
            .text(function(d){ return d3.format(",")(d.freq) + " million";});

        Settr.append("td")
            .attr("class",'legendPerc')
            .text(function(d){ return getLegend(d,inld);});

        leg.update = function(ind){
            var LEND = legend.select("tbody")
                .selectAll("tr")
                .data(ind);
            LEND.select(".legendFreq")
                .text(function(d){ return d3.format(",")(d.freq) + " million";});
            LEND.select(".legendPerc")
                .text(function(d){ return getLegend(d,ind);});        
        }
        
        function getLegend(ind,inD){  
            return d3.format("%")(ind.freq/d3.sum(inD.map(function(v){ return v.freq; })));
        }
        return leg;
    }
    
    var tF = ['≤ 15','15 - 65','≥ 65'].map(function(ind){ 
        return {type:ind, freq: d3.sum(Indata.map(function(parameter1){ 
            return parameter1.freq[ind];
        }))}; 
    });    
     
    var OverS = Indata.map(function(ind){return [ind.Continent,ind.total];});
    var RectG2 = histoGram(OverS),DrawGram = ShowChart(tF),leg= legend(tF);  
}