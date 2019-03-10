let width = 2048;
let height = 1024;

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

let svg = d3.select('#worldmap')
.append('svg')
.attr('width', width)
.attr('height', height)
.call(zoom);

let map = svg.append('g');
let dots = svg.append('g');
let centers = svg.append('g');
let cells = svg.append('g');
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

    centers.attr('transform', d3.event.transform);
    dots.selectAll('circle').attr('r', -1/20*d3.event.transform.k + 1 + (1/20));
    load_tree();
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

let grid = [];
initialise_grid(64);

function initialise_grid(granularity){
    grid = [];
    for(let i = 0; i < height; i += granularity){
        for(let j = 0; j < width; j += granularity){
            x0 = j;
            x1 = j + granularity;
            y0 = i;
            y1 = i + granularity;
            // Format upperleft corner, lowerright corner
            grid.push([x0, y0, x1, y1]);
        }
    }
}

let coordinates = [];
let tree = d3.quadtree();

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
                .attr('r', 1)
                .attr('fill', 'red')
                .attr('data-url', function(d){
                    return d['url'];
                })
                .on('click', dot_click)
                .on('mouseover', dot_mouse_over)
                .on('mouseout', dot_mouse_out);

                load_tree();
            }
        });
    });
}



function search(quadtree, x0, y0, x3, y3){
    let in_cell = [];
    quadtree.visit(function(node, x1, y1, x2, y2){
        let d = node.data;

        if(d){
            d.selected = (d[0] >= x0) && (d[0] < x3) && (d[1] >= y0) && (d[1] < y3);
            if(d.selected) {
                in_cell.push(d);
            }
        }

        return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
    });
    return in_cell;
}

function nodes(quadtree) {
  var nodes = [];
  quadtree.visit(function(node, x0, y0, x1, y1) {
    node.x0 = x0, node.y0 = y0;
    node.x1 = x1, node.y1 = y1;
    nodes.push(node);
  });
  return nodes;
}

function load_tree(){
    console.log(dots.transform);
    let tree = d3.quadtree();

    coordinates = [];
    dots.selectAll('circle').each(function(d){
        // console.log(this)
        x = this.cx.baseVal.value;
        y = this.cy.baseVal.value;

        if(x > 0 && x < width && y > 0 && y <height){
            coordinates.push([this.cx.baseVal.value, this.cy.baseVal.value]);
        }
    });

    // console.log(coordinates);

    tree.addAll(coordinates);

    let clusterPoints = [];

    grid.forEach(function(cell){
        let searched = search(tree, cell[0], cell[1], cell[2], cell[3]);

        var centerPoint = searched.reduce(function(prev, current) {
            return [prev[0] + current[0], prev[1] + current[1]];
        }, [0, 0]);

        centerPoint[0] = centerPoint[0] / searched.length;
        centerPoint[1] = centerPoint[1] / searched.length;
        centerPoint.push(searched);

        if (centerPoint[0] && centerPoint[1]) {
            clusterPoints.push(centerPoint);
        }
    });

    let pointSizeScale = d3.scaleLinear()
       .domain([
         d3.min(clusterPoints, function(d) {return d[2].length;}),
         d3.max(clusterPoints, function(d) {return d[2].length;})
       ])
       .rangeRound([3, 30]);


    cells.selectAll('.cell')
    .data(grid)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("x", function(d) { return d[0]; })
    .attr("y", function(d) { return d[1]; })
    .attr("width", function(d) { return d[3] - d[1]; })
    .attr("height", function(d) { return d[2] - d[0]; });
    centers.selectAll(".node").remove()
    centers.selectAll('.centerPoint').remove()

    centers.selectAll(".node")
  .data(nodes(tree))
  .enter().append("rect")
    .attr("class", "node")
    .attr("x", function(d) { return d.x0; })
    .attr("y", function(d) { return d.y0; })
    .attr("width", function(d) { return d.y1 - d.y0; })
    .attr("height", function(d) { return d.x1 - d.x0; });

    centers.selectAll(".centerPoint")
   .data(clusterPoints)
   .enter().append("circle")
   .attr("class", function(d) {return "centerPoint"})
   .attr("cx", function(d) {return d[0];})
   .attr("cy", function(d) {return d[1];})
   .attr("fill", '#FFA500')
   .attr("r", function(d, i) {return pointSizeScale(d[2].length);})
   .on("click", function(d, i) {
     console.log(d);
   })
}
