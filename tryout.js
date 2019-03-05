var width1 = 449;
var height1 = 249;
var word = "gongoozler";
var holder = d3.select("#chart").append("svg")
    .attr("width", width1)
    .attr("height", height1);
// draw a rectangle

holder.append("rect")
    .attr("x", 100)
    .attr("y", 50)
    .attr("height", 100)
    .attr("width", 200)
    .style("fill", "lightgreen")
    .attr("rx", 10)
    .attr("ry", 10);
// draw text on the screen

holder.append("text")
    .attr("x", 200)
    .attr("y", 100)
    .style("fill", "black")
    .style("font-size", "20px")
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .text(word);
