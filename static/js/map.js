const map = d3.select("#map");

const colorScale = d3.scaleThreshold()
    .domain([2, 4, 6, 8, 10, 12, 14, 16, 18, 20])
    .range(["#fff7ec", "#fee9cb", "#fdd8a9", "#fdc28c", "#fca16d", "#f67b52", "#e65339", "#ce2619", "#ab0604", "#7f0000"]);

var globalCities = [];
var globalsortedCities = [];
var globalPath;
const requestData7 = async () => {
    // colombia_data
    const colombiaData = await d3.json("/static/data/colombia_final.geojson");

    var projection = d3.geoMercator().fitSize([500, 500], colombiaData);
    var pathGen = d3.geoPath().projection(projection);
    globalPath = pathGen;
    //console.log(colombiaData.features[0])
    var countries = [];
    Object.keys(colombiaData.features).forEach(key => {
        if (colombiaData.features[key]["geometry"]["type"] === "Point") {
            globalCities.push(colombiaData.features[key]);
        } else {
            countries.push(colombiaData.features[key]);
        }

    });

    const scoreMin = d3.min(colombiaData.features, d => d.properties.norm);
    const scoreMax = d3.max(colombiaData.features, d => d.properties.norm);

    const newColorScale = d3.scaleSequential([scoreMin, scoreMax], d3.interpolateViridis);

    const colorScale = d3.scaleThreshold()
        .domain([2, 4, 6, 8, 10, 12, 14, 16, 18, 20])
        .range(["#fff7ec", "#fee9cb", "#fdd8a9", "#fdc28c", "#fca16d", "#f67b52", "#e65339", "#ce2619", "#ab0604", "#7f0000"])

    var dropdown = document.getElementById("dropdownMetric");

    globalsortedCities = globalCities.sort(comparePopulation);


    map.selectAll("path").data(countries)
        .enter()
        .append("path")
        .attr("class", "district")
        .style("fill", d => newColorScale(d.properties.norm))
        .style("stroke", "none")
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
            d3.select(this).style("stroke", "none");
            d3.select("#hint")
                .select("text").remove();
            d3.select("#dep")
                .select("text").remove();
            d3.select("#metric")
                .select("text").remove();
        })
        .attr("d", pathGen);

    map.append("g")
        .attr("class", "city")
        .style("fill", "orange")
        .selectAll("district")
        .data(globalCities)
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
        .attr("d", pathGen);


}

requestData7();

async function changeData(value) {

    const colombiaData = await d3.json("/static/data/colombia_final.geojson");

    const scoreMin = d3.min(colombiaData.features, d => eval(value));
    const scoreMax = d3.max(colombiaData.features, d => eval(value));

    const newColorScale = d3.scaleSequential([scoreMin, scoreMax], d3.interpolateViridis);

    var dropdown = document.getElementById("dropdownMetric");

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


async function changeCities(value) {
    if (value === "none") {
        map.selectAll(".city").remove();
    } else {
    	map.selectAll(".city").remove();
    	drawCities(parseInt(value));
    }
}


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
