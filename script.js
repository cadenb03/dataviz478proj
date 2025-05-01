var width = 960,
    height = 500;

var projection = d3.geoMercator()
    .scale(width / 1.3 / Math.PI)
    .translate([width / 2, height / 2])
    .center([100, 13])
    .scale(100)

var svg = d3.select("#chart")
    .attr("width", width)
    .attr("height", height);

var svg2 = d3.select("#chart2")
    .attr("width", width)
    .attr("height", height);

var path = d3.geoPath()
    .projection(projection);

var g = svg.append("g");

var g2 = svg2.append("g");

var selected_country = "None";
var filtered = []

// helper function to count number of occurrences for items in a list
function occurences(arr) {
    const counts = {};

    for (const element of arr) {
        counts[element] = (counts[element] || 0) + 1;
    }

  return counts;
}

function graph2(data, data2) {
    var num_usr = d3.map(filtered, function(d) {
        return parseInt(d["Number of Affected Users"]);
    });

    var res_time = d3.map(filtered, function(d) {
        return parseInt(d["Incident Resolution Time (in Hours)"]);
    });

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var color = d3.scaleOrdinal()
        .range([
            "#3A6A89",  // muted teal
            "#F24C3D",  // bright coral
            "#6B8E23",  // olive green
            "#FFD700",  // gold
            "#8A2BE2",  // blue violet
            "#E6A9A1"   // pale pink
        ]);

    var x = d3.scaleLinear()
        .domain([0, 1000000])
        .range([40, width - 40]);
    var y = d3.scaleLinear()
        .domain([0, 75])
        .range([height - 40, 0]);

    svg2.html("");
    svg2.append("g")
        .call(d3.axisBottom(x))
        .attr("transform", "translate(0," + (height - 40) + ")");
    svg2.append("g")
        .attr("transform", "translate("+ (40) +", 0)")
        .call(d3.axisLeft(y));
    svg2.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
            .attr("cx", function (d) { return x(d["Number of Affected Users"]); } )
            .attr("cy", function (d) { return y(d["Incident Resolution Time (in Hours)"]); } )
            .attr("r", 3)
            .style("fill", function(d) {
                return color(d["Attack Type"]);
            })
            .style("opacity", "0.7")
        .on("mouseover", function(event, d) {
            tooltip.style("opacity", 1);    // show tooltip
        })
        .on("mousemove", function(event, d) {
            //var name = d["properties"]["name"];
            // update tooltip text + position
            tooltip.html(
                "<b>Affected Users:</b> " + d["Number of Affected Users"] + "<br/>" +
                "<b>Resolution Time (hours):</b> " +  d["Incident Resolution Time (in Hours)"] + "<br/>" +
                "<b>Year:</b> " + d["Year"] + "<br/>" +
                "<b>Attack type:</b> " + d["Attack Type"] + "<br/>")
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY + 15) + "px");
        })
        .on("mouseout", function(event, d) {
             tooltip.style("opacity", 0);    // hide tooltip
        });
}

d3.csv("data.csv").then(function(data) {
    var countries = d3.map(data, function(d){return d.Country});
    var occ = occurences(countries);
    var tocc = Object.values(occ).reduce((a, b) => a+b, 0);

    var types = occurences(d3.map(data, function(d){return d["Attack Type"]}));
    const entries = Object.entries(types);
    entries.sort((a, b) => a[1] - b[1]);
    const sortedScores = Object.fromEntries(entries);
    console.log(sortedScores);

    var min_att = Math.min(...Object.values(occ))   // minimum number of attacks
    var max_att = Math.max(...Object.values(occ))   // maximum number of attacks

    // opacity of the red color depending on the number of attacks against a country
    var opacity = d3.scaleLinear()
        .domain([min_att, max_att])
        .range([.2, 1]);
    
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    filtered = d3.filter(data, function(d) {
        if (d["Country"] == selected_country) return d
    });

    total_lbl.innerText = "Total cyber attacks: " + tocc;

    var avg_res = d3.map(data, function(d) {
        return parseInt(d["Incident Resolution Time (in Hours)"]);
    }).reduce((a,b) => a+b, 0) / tocc;
    avg_res_lbl.innerText = "Average response time: " + avg_res.toFixed(2) + " hours";
    
    var avg_loss = d3.map(data, function(d) {
        return parseInt(d["Financial Loss (in Million $)"]);
    }).reduce((a,b) => a+b, 0) / tocc;
    avg_loss_lbl.innerText = "Average financial loss: $" + avg_loss.toFixed(2) + " Million USD";

    var avg_usr = d3.map(data, function(d) {
        return parseInt(d["Number of Affected Users"]);
    }).reduce((a,b) => a+b, 0) / tocc / 1000;
    avg_usr_lbl.innerText = "Average number of affected users: " + avg_usr.toFixed(0) + " thousand users";

    graph2(data);



    // draw world map
    d3.json("world.geojson").then(function(wdata){
        g.selectAll("path")
            .data(wdata.features)
            .enter().append("path")
                .attr("fill", function(d){
                    if (countries.includes(d["properties"]["name"])) {
                        // set color to red if the country is in the data set
                        return "#ff0000";
                    } else {
                        // else gray color
                        return "#b8b8b8";
                    }
                })
                .attr("fill-opacity", function(d) {
                    if (countries.includes(d["properties"]["name"])) {
                        // set opacity based on linear scale
                        return opacity(occ[d["properties"]["name"]]);
                    } else {
                        return 1;
                    }
                })
                .attr("d", path)
                .style("stroke", "#fff")
                .attr("name", function(d) {return d["properties"]["name"]})
                .attr("class", "country")
                // tooltip interactions
                .on("mouseover", function(event, d) {
                    var name = d["properties"]["name"];
                    if (countries.includes(name)) {
                        tooltip.style("opacity", 1);    // show tooltip
                    }
                })
                .on("mousemove", function(event, d) {
                    var name = d["properties"]["name"];
                    // update tooltip text + position
                    tooltip.html("<b>"+name+"</b>"+"<br/>"+occ[name]+" cyber attacks")
                        .style("left", (event.pageX + 15) + "px")
                        .style("top", (event.pageY + 15) + "px");
                })
                .on("mouseout", function(event, d) {
                    tooltip.style("opacity", 0);    // hide tooltip
                })
                .on("click", function(event, d) {
                    var name = d["properties"]["name"];
                    if (countries.includes(name)) {

                        console.log(d);
                        selected_country = name;
                        console.log(selected_country);
                        
                        sel_lbl.innerText = "Selected country: " + selected_country;
                        
                        filtered = d3.filter(data, function(d) {
                            if (d["Country"] == selected_country) return d
                        });
                        console.log(filtered)

                        total_lbl.innerText = "Total cyber attacks: " + occ[selected_country];

                        var avg_res = d3.map(filtered, function(d) {
                            return parseInt(d["Incident Resolution Time (in Hours)"]);
                        }).reduce((a,b) => a+b, 0) / occ[selected_country];
                        avg_res_lbl.innerText = "Average response time: " + avg_res.toFixed(2) + " hours";
                        
                        var avg_loss = d3.map(filtered, function(d) {
                            return parseInt(d["Financial Loss (in Million $)"]);
                        }).reduce((a,b) => a+b, 0) / occ[selected_country];
                        avg_loss_lbl.innerText = "Average financial loss: $" + avg_loss.toFixed(2) + " Million USD";

                        var avg_usr = d3.map(filtered, function(d) {
                            return parseInt(d["Number of Affected Users"]);
                        }).reduce((a,b) => a+b, 0) / occ[selected_country] / 1000;
                        avg_usr_lbl.innerText = "Average number of affected users: " + avg_usr.toFixed(0) + " thousand users";

                        graph2(filtered);
                    }
                    else {
                        selected_country = "None";
                        
                        sel_lbl.innerText = "Selected country: " + selected_country;

                        total_lbl.innerText = "Total cyber attacks: " + tocc;

                        var avg_res = d3.map(data, function(d) {
                            return parseInt(d["Incident Resolution Time (in Hours)"]);
                        }).reduce((a,b) => a+b, 0) / tocc;
                        avg_res_lbl.innerText = "Average response time: " + avg_res.toFixed(2) + " hours";
                        
                        var avg_loss = d3.map(data, function(d) {
                            return parseInt(d["Financial Loss (in Million $)"]);
                        }).reduce((a,b) => a+b, 0) / tocc;
                        avg_loss_lbl.innerText = "Average financial loss: $" + avg_loss.toFixed(2) + " Million USD";

                        var avg_usr = d3.map(data, function(d) {
                            return parseInt(d["Number of Affected Users"]);
                        }).reduce((a,b) => a+b, 0) / tocc / 1000;
                        avg_usr_lbl.innerText = "Average number of affected users: " + avg_usr.toFixed(0) + " thousand users";

                        graph2(data);
                    }
                });
    });
})