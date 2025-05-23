var width = 960,
    height = 600;

var projection = d3.geoMercator()
    .scale(width / 1.3 / Math.PI)
    .translate([width / 2, height / 2])
    .scale(120)

var svg = d3.select("#chart")
    .attr("width", width)
    .attr("height", height);

var svg2 = d3.select("#chart2")
    .attr("width", 1080)
    .attr("height", 600);

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

// draw graph 2
function graph2(data) {
    var num_usr = d3.map(data, function(d) {
        return parseInt(d["Number of Affected Users"]);
    });

    var res_time = d3.map(data, function(d) {
        return parseInt(d["Incident Resolution Time (in Hours)"]);
    });

    var fin_loss = d3.map(data, function(d) {
        return parseInt(d["Financial Loss (in Million $)"]);
    });

    var years = d3.map(data, function(d) {
        return parseInt(d["Year"]);
    });

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var color = d3.scaleOrdinal()
        .domain([
            "DDoS",
            "Ransomware",
            "SQL Injection",
            "Man-in-the-Middle",
            "Phishing",
            "Malware"
        ])
        .range([
            "#FF0900",
            "#1EC4FF",
            "#F06E00",
            "#4C62F0",
            "#842A9E",
            "#FFCF17"
        ]);

    
    var num_usr_scale = d3.scaleLinear()
        .domain([0, 1000000]);

    var res_time_scale = d3.scaleLinear()
        .domain([0, 75]);
    
    var fin_loss_scale = d3.scaleLinear()
        .domain([0, 100]);

    var year_scale = d3.scalePoint()
        .domain(["", ...new Set(d3.map(data, function(d) {
            return d["Year"];
        }))]);
    
    var target_scale = d3.scalePoint()
        .domain(["", ...new Set(d3.map(data, function(d) {
            return d["Target Industry"];
        }))]);
    
    var type_scale = d3.scalePoint()
        .domain(["", ...new Set(d3.map(data, function(d) {
            return d["Attack Type"];
        }))]);
    
    var source_scale = d3.scalePoint()
        .domain(["", ...new Set(d3.map(data, function(d) {
            return d["Attack Source"];
        }))]);

    var vuln_scale = d3.scalePoint()
        .domain(["", ...new Set(d3.map(data, function(d) {
            return d["Security Vulnerability Type"];
        }))]);

    var def_scale = d3.scalePoint()
        .domain(["", ...new Set(d3.map(data, function(d) {
            return d["Defense Mechanism Used"];
        }))]);

    const xvar = document.querySelector("#xvar").value;
    const yvar = document.querySelector("#yvar").value;

    var x,y;

    switch (xvar) {
        case "Number of Affected Users":
            x = num_usr_scale.range([80, width - 80]);
            break;
        case "Financial Loss (in Million $)":
            x = fin_loss_scale.range([80, width - 80]);
            break;
        case "Incident Resolution Time (in Hours)":
            x = res_time_scale.range([80, width - 80]);
            break;
        case "Year":
            x = year_scale.range([80, width - 80]);
            break;
        case "Attack Type":
            x = type_scale.range([80, width - 80]);
            break;
        case "Attack Source":
            x = source_scale.range([80, width - 80]);
            break;
        case "Target Industry":
            x = target_scale.range([80, width - 80]);
            break;
        case "Security Vulnerability Type":
            x = vuln_scale.range([80, width - 80]);
            break;
        case "Defense Mechanism Used":
            x = def_scale.range([80, width - 80]);
            break;
        default:
            x = num_usr_scale.range([80, width - 80]);
            break;
    }

    switch (yvar) {
        case "Number of Affected Users":
            y = num_usr_scale.range([height - 80, 40]);
            break;
        case "Financial Loss (in Million $)":
            y = fin_loss_scale.range([height - 80, 40]);
            break;
        case "Incident Resolution Time (in Hours)":
            y = res_time_scale.range([height - 80, 40]);
            break;
        case "Year":
            y = year_scale.range([height - 80, 40]);
            break;
        case "Attack Type":
            y = type_scale.range([height - 80, 40]);
            break;
        case "Attack Source":
            y = source_scale.range([height - 80, 40]);
            break;
        case "Target Industry":
            y = target_scale.range([height - 80, 40]);
            break;
        case "Security Vulnerability Type":
            y = vuln_scale.range([height - 80, 40]);
            break;
        case "Defense Mechanism Used":
            y = def_scale.range([height - 80, 40]);
            break;
        default:
            y = num_usr_scale.range([height - 80, 40]);
            break;
    }

    svg2.html("");
    svg2.append("g")    // x axis
        .call(d3.axisBottom(x))
        .attr("transform", "translate(0," + (height - 80) + ")")
    svg2.append("g")    // y axis
        .attr("transform", "translate(80, 0)")
        .call(d3.axisLeft(y));
    svg2.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
            .attr("cx", function (d) { return x(d[xvar]); } )
            .attr("cy", function (d) { return y(d[yvar]); } )
            .attr("r", 3)
            .style("fill", function(d) {
                return color(d["Attack Type"]);
            })
            .style("opacity", "0.7")
        .on("mouseover", function(event, d) {
            tooltip.style("opacity", 1);    // show tooltip
        })
        .on("mousemove", function(event, d) {
            // update tooltip text + position
            tooltip.html(
                "<b>"+xvar+":</b> " + d[xvar] + "<br/>" +
                "<b>"+yvar+":</b> " +  d[yvar] + "<br/>")
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY + 15) + "px");
        })
        .on("mouseout", function(event, d) {
             tooltip.style("opacity", 0);    // hide tooltip
        });
    
    // legend
    svg2.selectAll("dots")
        .data([...new Set(d3.map(data, function(d) {
            return d["Attack Type"];
        }))])
        .enter()
        .append("circle")
            .attr("cx", 900)
            .attr("cy", (d, i) => 25 + i*25)
            .attr("r", 7)
            .style("fill", d => color(d))
    
    svg2.selectAll("llabels")
        .data([...new Set(d3.map(data, function(d) {
            return d["Attack Type"];
        }))])
        .enter()
        .append("text")
            .attr("x", 910)
            .attr("y", (d, i) => 31+i*25)
            .text(d => d)
            .style('fill', '#ccc');
    svg2.selectAll("axisl")
        .data([0])
        .enter()
        .append("text")
            .attr("x", "50%")
            .attr("y", height-32)
            .text(xvar)
            .style('fill', '#ccc')
            .style("text-anchor", "middle");
}

d3.csv("data.csv").then(function(data) {
    var countries = d3.map(data, function(d){return d.Country});
    var occ = occurences(countries);
    var tocc = Object.values(occ).reduce((a, b) => a+b, 0);

    var filtered_countries = d3.map(data, function(d){return d.Country});
    var occf = occurences(filtered_countries);

    var types = occurences(d3.map(data, function(d){return d["Attack Type"]}));
    const entries = Object.entries(types);
    entries.sort((a, b) => a[1] - b[1]);
    const sortedScores = Object.fromEntries(entries);

    var min_att = Math.min(...Object.values(occf))   // minimum number of attacks
    var max_att = Math.max(...Object.values(occf))   // maximum number of attacks

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

    total_lbl.innerHTML = "<b>Total cyber attacks:</b> " + tocc;

    var avg_res = d3.map(data, function(d) {
        return parseInt(d["Incident Resolution Time (in Hours)"]);
    }).reduce((a,b) => a+b, 0) / tocc;
    avg_res_lbl.innerHTML = "<b>Average response time:</b> " + avg_res.toFixed(2) + " hours";
    
    var avg_loss = d3.map(data, function(d) {
        return parseInt(d["Financial Loss (in Million $)"]);
    }).reduce((a,b) => a+b, 0) / tocc;
    avg_loss_lbl.innerHTML = "<b>Average financial loss:</b> $" + avg_loss.toFixed(2) + " Million USD";

    var avg_usr = d3.map(data, function(d) {
        return parseInt(d["Number of Affected Users"]);
    }).reduce((a,b) => a+b, 0) / tocc / 1000;
    avg_usr_lbl.innerHTML = "<b>Average number of affected users:</b> " + avg_usr.toFixed(0) + " thousand users";

    graph2(data);

    function filter_data(cname) {
        if (countries.includes(cname)) {

            // select country as filter
            selected_country = cname;
            
            sel_lbl.innerHTML = "Selected country: " + selected_country;
            
            filtered = d3.filter(data, function(d) {
                if (d["Country"] == selected_country) return d;
            });

            const mindate = parseInt(document.querySelector('#mindate').value);
            const maxdate = parseInt(document.querySelector('#maxdate').value);
            
            filtered = d3.filter(filtered, function(d) {
                if (parseInt(d["Year"]) >= mindate && parseInt(d["Year"]) <= maxdate) return d;
            });

            filtered_countries = d3.map(d3.filter(data, function(d) {
                if (parseInt(d["Year"]) >= mindate && parseInt(d["Year"]) <= maxdate) return d;
            }), function(d) {
                return d.Country;
            });

            occf = occurences(filtered_countries);

            min_att = Math.min(...Object.values(occf));
            max_att = Math.max(...Object.values(occf));
            opacity = d3.scaleLinear().domain([min_att, max_att]).range([.2, 1]);

            total_lbl.innerHTML = "<b>Total cyber attacks:</b> " + filtered.length + " (" + (100*filtered.length/tocc).toFixed(2)+"%)";

            var avg_res = d3.map(filtered, function(d) {
                return parseInt(d["Incident Resolution Time (in Hours)"]);
            }).reduce((a,b) => a+b, 0) / filtered.length;
            avg_res_lbl.innerHTML = "<b>Average response time:</b> " + avg_res.toFixed(2) + " hours";
            
            var avg_loss = d3.map(filtered, function(d) {
                return parseInt(d["Financial Loss (in Million $)"]);
            }).reduce((a,b) => a+b, 0) / filtered.length;
            avg_loss_lbl.innerHTML = "<b>Average financial loss:</b> $" + avg_loss.toFixed(2) + " Million USD";

            var avg_usr = d3.map(filtered, function(d) {
                return parseInt(d["Number of Affected Users"]);
            }).reduce((a,b) => a+b, 0) / filtered.length / 1000;
            avg_usr_lbl.innerHTML = "<b>Average number of affected users:</b> " + avg_usr.toFixed(0) + " thousand users";

            graph2(filtered);
            drawMap();
        }
        else {
            // clear filtered country
            
            selected_country = "None";
            
            sel_lbl.innerHTML = "Selected country: " + selected_country;

            const mindate = parseInt(document.querySelector('#mindate').value);
            const maxdate = parseInt(document.querySelector('#maxdate').value);

            filtered = d3.filter(data, function(d) {
                if (parseInt(d["Year"]) >= mindate && parseInt(d["Year"]) <= maxdate) return d;
            });

            filtered_countries = d3.map(d3.filter(data, function(d) {
                if (parseInt(d["Year"]) >= mindate && parseInt(d["Year"]) <= maxdate) return d;
            }), function(d) {
                return d.Country;
            });

            occf = occurences(filtered_countries);

            min_att = Math.min(...Object.values(occf));
            max_att = Math.max(...Object.values(occf));
            opacity = d3.scaleLinear().domain([min_att, max_att]).range([.2, 1]);

            total_lbl.innerHTML = "<b>Total cyber attacks:</b> " + filtered.length;

            var avg_res = d3.map(filtered, function(d) {
                return parseInt(d["Incident Resolution Time (in Hours)"]);
            }).reduce((a,b) => a+b, 0) / filtered.length;
            avg_res_lbl.innerHTML = "<b>Average response time:</b> " + avg_res.toFixed(2) + " hours";
            
            var avg_loss = d3.map(filtered, function(d) {
                return parseInt(d["Financial Loss (in Million $)"]);
            }).reduce((a,b) => a+b, 0) / filtered.length;
            avg_loss_lbl.innerHTML = "<b>Average financial loss:</b> $" + avg_loss.toFixed(2) + " Million USD";

            var avg_usr = d3.map(filtered, function(d) {
                return parseInt(d["Number of Affected Users"]);
            }).reduce((a,b) => a+b, 0) / filtered.length / 1000;
            avg_usr_lbl.innerHTML = "<b>Average number of affected users:</b> " + avg_usr.toFixed(0) + " thousand users";

            graph2(filtered);
            drawMap();
        }
    }

    document.querySelector("#xvar").onchange = function() {
        filter_data(selected_country);
    }
    document.querySelector("#yvar").onchange = function() {
        filter_data(selected_country);
    }

    const minslider = document.querySelector("#mindate");
    const maxslider = document.querySelector("#maxdate");

    minslider.oninput = function() {
        if (minslider.value > maxslider.value) {
            maxslider.value = minslider.value;
        }
        document.querySelector("#mind_lbl").innerHTML = minslider.value;
        filter_data(selected_country);
    };
    maxslider.oninput = function() { 
        if (maxslider.value < minslider.value) {
            minslider.value = maxslider.value;
        }
        document.querySelector("#maxd_lbl").innerHTML = maxslider.value;
        filter_data(selected_country);
    };

    // reset button
    document.querySelector("#reset").onclick = function() {
        minslider.value = 2015;
        document.querySelector("#mind_lbl").innerHTML = minslider.value;
        maxslider.value = 2024;
        document.querySelector("#maxd_lbl").innerHTML = maxslider.value;
        document.querySelector("#xvar").value = "Number of Affected Users";
        document.querySelector("#yvar").value = "Incident Resolution Time (in Hours)";
        filter_data("None");
    }

    drawMap();

    // draw world map
    function drawMap() {
        d3.json("world.geojson").then(function(wdata){
            g.html("");
            g
            g.selectAll("path")
                .data(wdata.features)
                .enter().append("path")
                    .attr("fill", function(d){
                        if (countries.includes(d["properties"]["name"])) {
                            // set color to red if the country is in the data set
                            return "#ff0000";
                        } else {
                            // else gray color
                            return "#1a1a1a";
                        }
                    })
                    .attr("fill-opacity", function(d) {
                        if (countries.includes(d["properties"]["name"])) {
                            // set opacity based on linear scale
                            return opacity(occf[d["properties"]["name"]]);
                        } else {
                            return 1;
                        }
                    })
                    .attr("d", path)
                    .style("stroke", function(d) {
                        if (countries.includes(d["properties"]["name"])) {
                            console.log(selected_country);
                            if (selected_country == d["properties"]["name"]) {
                                return "#fff"
                            }
                            return "#00000000";
                        } else {
                            return "#00000000"  // no outline
                        }
                    })
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

                        //console.log(filtered_countries);
                        
                        // update tooltip text + position
                        tooltip.html("<b>"+name+"</b>"+"<br/>"+occf[name]+" cyber attacks"+"<br/>-<br/>"+"click to filter by country")
                            .style("left", (event.pageX + 15) + "px")
                            .style("top", (event.pageY + 15) + "px");
                    })
                    .on("mouseout", function(event, d) {
                        tooltip.style("opacity", 0);    // hide tooltip
                    })
                    .on("click", function(event, d) {
                        var name = d["properties"]["name"];
                        filter_data(name);
                        drawMap();
                        //console.log(filtered);
                    });
        });
    }
})