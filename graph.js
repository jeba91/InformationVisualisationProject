// let width = 1000;
// let height = 500;
//
// let initX;
//
// let projection = d3.geoEquirectangular()
// .center([0.0, 0.0])
//
// let geoGenerator = d3.geoPath()
// .projection(projection);
//
// let zoom = d3.zoom()
// .scaleExtent([1, 8])
// .on("zoom", zoomed)
// .on("end", zoomended);
//
// var svg = d3.select("body")
// .append("svg")
// .attr("height", height)
// .attr("width", width)
// .on("wheel", function(){
//
// })
//
// function zoomed(){
//     d3.select('#content g.map').attr("transform", d3.event.transform)
// }
//
// function update(geojson) {
//     let u = d3.select('#content g.map')
//     .selectAll('path')
//     .data(geojson.features);
//
//     u.enter()
//     .append('path')
//     .attr('d', geoGenerator)
//     .call(zoom)
// }
//
// d3.json('low.geo.json').then(function(geojson){
//     update(geojson);
// });
