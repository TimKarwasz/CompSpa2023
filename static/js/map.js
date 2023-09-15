const map = d3.select("#map");

// placeholder for the cities
var globalCities = [];

// placeholder for the sorted cities
var globalsortedCities = [];

// the following code is the default when the site is loaded
// is reads the data and then draws the basic map
var globalPath;
const requestData = async () => {
    // colombia_data
    const colombiaData = await d3.json("/static/data/colombia_final.geojson");

    // define projection
    var projection = d3.geoMercator().fitSize([500, 500], colombiaData);
    var pathGen = d3.geoPath().projection(projection);
    globalPath = pathGen;
    //console.log(colombiaData.features[0])
    var countries = [];
    // differentiate between countries and cities
    Object.keys(colombiaData.features).forEach(key => {
        if (colombiaData.features[key]["geometry"]["type"] === "Point") {
            globalCities.push(colombiaData.features[key]);
        } else {
            countries.push(colombiaData.features[key]);
        }

    });

    // define a color scale based on min and max values for the metric
    var scoreMin = d3.min(colombiaData.features, d => d.properties.norm);
    var scoreMax = d3.max(colombiaData.features, d => d.properties.norm);

    var newColorScale = d3.scaleSequential([scoreMin, scoreMax], d3.interpolateOrRd);

    var dropdown = document.getElementById("dropdownMetric");

    globalsortedCities = globalCities.sort(comparePopulation);

    // draw countries
    map.selectAll("path").data(countries)
        .enter()
        .append("path")
        .attr("class", "district")
        .style("fill", d => newColorScale(d.properties.norm))
        .style("stroke", "black")
        .on("mouseover", function(d) {
            d3.select(this).style("stroke", "red");
            d3.select("#hint")
                .append("text")
                .text(d.properties.norm);
            d3.select("#dep")
                .append("text")
                .text(d.properties.NOMBRE_DPT + ": ")
            d3.select("#metric")
                .append("text")
                .text(dropdown.options[dropdown.selectedIndex].text + " in ")
        })
        .on("mouseout", function(d) {
            d3.select(this).style("stroke", "black");
            d3.select("#hint")
                .select("text").remove();
            d3.select("#dep")
                .select("text").remove();
            d3.select("#metric")
                .select("text").remove();
        })
        .attr("d", pathGen);

}

requestData();


// this function gets triggered when the user changes the metric via the dropdown menu
// it then changes the data and recolors the departments of colombia according to the value for that metric
async function changeData(value) {

    // read data
    const colombiaData = await d3.json("/static/data/colombia_final.geojson");

    // define new color scale
    var scoreMin = d3.min(colombiaData.features, d => eval(value));
    var scoreMax = d3.max(colombiaData.features, d => eval(value));

    var dropdownColor = document.getElementById("dropdownMetric4");
    var newColorScale = d3.scaleSequential([scoreMin, scoreMax], eval(dropdownColor.options[dropdownColor.selectedIndex].value));

    var dropdown = document.getElementById("dropdownMetric");

    // redraw the map with new values
    map.selectAll(".district")
        .style("fill", d => newColorScale(eval(value)))
        .on("mouseover", function(d) {
            d3.select(this).style("stroke", "red");
            d3.select("#hint")
                .append("text")
                .text(eval(value));
            d3.select("#dep")
                .append("text")
                .text(d.properties.NOMBRE_DPT + ": ")
            d3.select("#metric")
                .append("text")
                .text(dropdown.options[dropdown.selectedIndex].text + " in ")
        });

}

// this function changes the projection used to display the map
async function changeProjection(value) {

    const colombiaData = await d3.json("/static/data/colombia_final.geojson");

    if (value === "geoAzimuthalEqualArea") {
        var projection = d3.geoAzimuthalEqualArea().fitSize([500, 500], colombiaData);
        var pathGen = d3.geoPath().projection(projection);
    } else if (value === "geoTransverseMercator") {
        var projection = d3.geoTransverseMercator().fitSize([500, 500], colombiaData);
        var pathGen = d3.geoPath().projection(projection);
    } else if (value === "geoAlbers") {
        var projection = d3.geoAlbers().fitSize([500, 500], colombiaData);
        var pathGen = d3.geoPath().projection(projection);
    } else {
        var projection = d3.geoMercator().fitSize([500, 500], colombiaData);
        var pathGen = d3.geoPath().projection(projection);
    }

    map.selectAll("path")
        .attr("d", pathGen);

    globalPath = pathGen;
}


// this function either deletes the cities from the map if the user selects "None"
// or draws the selected amount of cities
async function changeCities(value) {
    if (value === "none") {
        map.selectAll(".city").remove();
    } else {
    	map.selectAll(".city").remove();
    	drawCities(parseInt(value));
    }
}

// this function redraws the map with the from the user selected colorScale
async function changeColorScale(value) {

    const colombiaData = await d3.json("/static/data/colombia_final.geojson");

    var dropdown = document.getElementById("dropdownMetric");

    var scoreMin = d3.min(colombiaData.features, d => eval(dropdown.options[dropdown.selectedIndex].value));
    var scoreMax = d3.max(colombiaData.features, d => eval(dropdown.options[dropdown.selectedIndex].value));

    var newColorScale = d3.scaleSequential([scoreMin, scoreMax], eval(value));

    map.selectAll(".district")
        .style("fill", d => newColorScale(eval(dropdown.options[dropdown.selectedIndex].value)))
        .on("mouseover", function(d) {
            d3.select(this).style("stroke", "red");
            d3.select("#hint")
                .append("text")
                .text(eval(dropdown.options[dropdown.selectedIndex].value));
            d3.select("#dep")
                .append("text")
                .text(d.properties.NOMBRE_DPT + ": ")
            d3.select("#metric")
                .append("text")
                .text(dropdown.options[dropdown.selectedIndex].text + " in ")
        });


}

// this is a sorting function used to sort the cities by population
function comparePopulation(cityA, cityB) {

    let comparison = 0;
    if (cityA["properties"]["cityPopulation"] > cityB["properties"]["cityPopulation"]) {
        comparison = 1;
    } else if (cityA["properties"]["cityPopulation"] < cityB["properties"]["cityPopulation"]) {
        comparison = -1;
    } else {
        return 0;
    }
    return comparison * -1;
}

// this function draws the selected amount of cities on the map
function drawCities(value) {

    map.append("g")
            .attr("class", "city")
            .style("fill", "orange")
            .selectAll("district")
            .data(globalsortedCities.slice(0, value))
            .enter().append("path")
            .on("mouseover", function(d) {
                d3.select(this).style("stroke", "black");
                d3.select("#cityName")
                    .append("text")
                    .text(d.properties.cityName + ": ");
                d3.select("#cityPopulation")
                    .append("text")
                    .text(d.properties.cityPopulation + " people")
            })
            .on("mouseout", function(d) {
                d3.select(this).style("stroke", "none");
                d3.select("#cityName")
                    .select("text").remove();
                d3.select("#cityPopulation")
                    .select("text").remove();
            })
            .attr("d", globalPath);

}
