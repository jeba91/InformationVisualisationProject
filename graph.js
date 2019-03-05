let width = 1000;
let height = 500;

let projection = d3.geoMercator()
.translate([width / 2, height / 2])
.scale((width - 1) / 2 / Math.PI);

let path = d3.geoPath()
.projection(projection)

let zoom = d3.zoom()
.scaleExtent([1, 8])
.on('zoom', zoomed);

let svg = d3.select('body')
.append('svg')
.attr('width', width)
.attr('height', height)
.call(zoom);

let map = svg.append('g')
let dots = svg.append('g')

d3.json('low.geo.json').then(function(geojson){
    map.selectAll('path')
    .data(geojson.features)
    .enter()
    .append('path')
    .attr('d', path)

    load_dots();
});

function zoomed(){
    map.attr('transform', d3.event.transform);
    dots.attr('transform', d3.event.transform);
}

function dot_click(){
    console.log(this.dataset.url);
}

function load_dots(){
    $(function(){
        $.ajax({
            url:"request.php",
            type:"post",
            data:"",
            success: function(response){
                dots.selectAll('circle')
                .data(response)
                .enter()
                .append('circle')
                .attr('cx', function (d){
                    return projection([parseFloat(d['longitude']), parseFloat(d['latitude'])])[0];
                })
                .attr('cy', function (d){
                    return projection([parseFloat(d['longitude']), parseFloat(d['latitude'])])[1];
                })
                .attr('r', '1px')
                .attr('fill', 'red')
                .attr('data-url', function(d){
                    return d['url'];
                })
                .on('click', dot_click);
            }
        });
    });
}
