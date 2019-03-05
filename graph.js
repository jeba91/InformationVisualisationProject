let width = 1000;
let height = 500;

let selected1 = false;
let selected2 = false;
let selecturl1 = "";
let selecturl2 = "";

let projection = d3.geoMercator()
.translate([width / 2, height / 2])
.scale((width - 1) / 2 / Math.PI);

let path = d3.geoPath()
.projection(projection)

let zoom = d3.zoom()
.scaleExtent([1, 16])
.on('zoom', zoomed);

let svg = d3.select('body')
.append('svg')
.attr('width', width)
.attr('height', height)
.call(zoom);

let map = svg.append('g');
let dots = svg.append('g');
let image1 = d3.select('body').append('div');
let image2 = d3.select('body').append('div');

d3.json('high.geo.json').then(function(geojson){
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
    if(selected1){
        image2.style("opacity", 1.0);
        selected2 = true;
        selecturl2 = this.dataset.url;
        image1.html('<img src="' + selecturl2 + '">');
    }
    else{
        image1.style("opacity", 1.0);
        selected1 = true;
        selecturl1 = this.dataset.url;
        image1.html('<img src="' + selecturl1 + '">');
    }
}

function dot_mouse_over(){
    if(selected1){
        image2.transition().duration(200).style("opacity", .9);
        image2.html('<img src="' + this.dataset.url + '">');
    }
    else{
        image1.transition().duration(200).style("opacity", .9);
        image1.html('<img src="' + this.dataset.url + '">');
    }
}

function dot_mouse_out(){
    if(selected1){
        image1.html('<img src="' + selecturl1 + '">');
    }
    else{
        image1.transition().duration(200).style("opacity", 0);
    }
    if(selected2){
        image2.html('<img src="' + selecturl2 + '">');
    }
    else{
        image2.transition().duration(200).style("opacity", 0);
    }
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
                .on('click', dot_click)
                .on('mouseover', dot_mouse_over)
                .on('mouseout', dot_mouse_out);
            }
        });
    });
}
