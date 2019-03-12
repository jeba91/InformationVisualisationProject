// Height and width of map
let width = 2048;
let height = 1024;

let selectfirst = true;
let selectsecond = false;
let selectednew = false;
let selecturl1 = "";
let selecturl2 = "";

// Type of projection
let projection = d3.geoMercator()
.translate([width / 2, height / 2])
.scale((width - 1) / 2 / Math.PI);

// Set projection of Path of map
let path = d3.geoPath()
.projection(projection)

// Initialise zoom
let zoom = d3.zoom()
.scaleExtent([1, 16])
.on('zoom', zoomed)
.on('end', endZoom);

// Translates map, dots, centers and texts on each move (translate and scale)
function zoomed(){
    map.attr('transform', d3.event.transform);
    dots.attr('transform', d3.event.transform);
    centers.attr('transform', d3.event.transform);
    centerTexts.attr('transform', d3.event.transform);
}

// After zoomed is done this funtion is called
// It finds the current position of each dot and builds a new quad tree.
function endZoom(){
    alt_coord = [];
    alt_info = [];

    dots.selectAll('circle').each(function(d){
        k = d3.event.transform.k
        x = d3.event.transform.x
        y = d3.event.transform.y
        xn = this.cx.baseVal.value*k + x;
        yn = this.cy.baseVal.value*k + y;

        if(xn > 0 && xn < width && yn > 0 && yn <height){
            alt_coord.push([xn, yn, this.dataset.url, parseInt(this.dataset.views), this]);
        }

    });
    coordinates = alt_coord;
    load_tree(d3.event.transform.x, d3.event.transform.y, d3.event.transform.k);
}

// Initialise world map and call zoom on each event
let svg = d3.select('#worldmap')
.append('svg')
.attr('width', width)
.attr('height', height)
.call(zoom);

// Initialise g's, order is important: it determines the z-index
let map = svg.append('g');
let centers = svg.append('g');
let centerTexts = svg.append('g');
let dots = svg.append('g');
let image1 = d3.select('#photo1')
.append('one')
let image2 = d3.select('#photo2')
.append('two');

d3.select("#photo1").on("click", reselect);
d3.select("#photo2").on("click", reselect);

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}

function reselect() {
    if(this.id == "photo1"){
        selectfirst = true;
        selectsecond = false;
    }
    else if (this.id == "photo2"){
        selectfirst = false;
        selectsecond = true;
    }
}

// Initialise coordinates and previous zoom level
let coordinates = [];
let previous_k = 1.0;

// Method for mouseover
function mouseoverDot(d){
    let views = d[2].map(function(d){return d[3]});
    let max_views_index = indexOfMax(views);
    let url_most_views = d[2][max_views_index][2];
    let circle_most_views = d[2][max_views_index][4];

    if(d3.select(circle_most_views).attr('checked') == 'false'){
        d3.select(circle_most_views).attr("r", 30).attr("fill", "orange")
    }

    if(selectfirst){
        image1.transition().duration(200).style("opacity", .9);
        image1.html('<img src="' + url_most_views + '">');
    }

    else if(selectsecond){
        image2.transition().duration(200).style("opacity", .9);
        image2.html('<img src="' + url_most_views + '">');
    }
}

function clickDot(d){
    console.log(this)
    if(selectfirst & !selectsecond & d3.select(this).attr('checked') == 'false'){
        d3.selectAll('circle[fill=blue]')
        .attr("fill", "red")
        .attr('checked','false');

        d3.select(this)
        .attr("fill", "blue")
        .attr('checked','true')

        image1.style("opacity", 1.0);
        selectfirst = false;
        selectsecond = true;
        selecturl1 = this.dataset.url;
        image1.html('<img src="' + this.dataset.url + '">');
    }

    else if(!selectfirst & selectsecond & d3.select(this).attr('checked') == 'false'){
        d3.selectAll('circle[fill=green]')
        .attr("fill", "red")
        .attr('checked','false');
        d3.select(this)
        .attr("fill", "green")
        .attr('checked','true');
        image2.style("opacity", 1.0);
        selectfirst = true;
        selectsecond = false;
        selecturl2 = this.dataset.url;
        image2.html('<img src="' + this.dataset.url + '">');
    }
}

function mouseoutDot(d){
    console.log(this)
    if (d3.select(this).attr('checked') == 'false'){
        d3.select(this).attr("r", 30).attr("fill", "orange")
    }

    if(selectfirst){
        image1.transition().duration(200).style("opacity", .9);
        image1.html('<img src="' + this.dataset.url + '">');
    }
    else if(selectsecond){
        image2.transition().duration(200).style("opacity", .9);
        image2.html('<img src="' + this.dataset.url + '">');
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

// Load json for map. Upon completion load dots
d3.json('high.geo.json').then(function(geojson){
    map.selectAll('path')
    .data(geojson.features)
    .enter()
    .append('path')
    .attr('d', path)
    load_dots();
});

function load_dots(){
    $(function(){
        $.ajax({
            url:"./request.php",
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
                .attr('fill', 'none')
                .attr('checked', 'false')
                .attr('data-url', function(d){
                    return d['url'];
                })
                .attr('data-views', function(d){
                    return parseInt(d['views']);
                })
                .on("click", clickDot)
                .on("mouseout", mouseoutDot);

                dots.selectAll('circle').each(function(d){

                    x = this.cx.baseVal.value;
                    y = this.cy.baseVal.value;


                    if(x > 0 && x < width && y > 0 && y <height){
                        coordinates.push([x, y, this.dataset.url, parseInt(this.dataset.views), this]);
                    }

                });

                load_tree(0.0, 0.0, 1.0);
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

function load_tree(x_offset, y_offset, scale){
    let tree = d3.quadtree();

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
       .rangeRound([1, 30]);

    centers.selectAll('.centerPoint').remove()
    centerTexts.selectAll('.centerText').remove()

    centers.selectAll(".centerPoint")
   .data(clusterPoints)
   .enter().append("circle")
   .attr("class", function(d) {return "centerPoint"})
   .attr("cx", function(d) {return (d[0] - x_offset)/scale;})
   .attr("cy", function(d) {return (d[1] - y_offset)/scale;})
   .attr("fill", '#FFA500')
   .attr("opacity", 0.75)
   .attr("r", function(d, i) {return pointSizeScale((d[2].length/scale)*4);})
   .attr('checked', 'false')
   .on("mouseover", function(d){mouseoverDot(d);})
   // .on("click", function(d){clickDot(d);})
   // .on("mouseout", function(d){mouseoutDot(d)});

   centerTexts.selectAll(".centerText")
   .data(clusterPoints)
      .enter()
      .append('text')
      .text(function(d){if(d[2].length > 25){return d[2].length;}})
      .attr('fill', 'red')
      .attr("class", function(d) {return "centerText"})
      .attr("x", function(d) {return (d[0] - x_offset)/scale;})
      .attr("y", function(d) {return (d[1] - y_offset)/scale;})
      .style("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("fontsize", function(d, i) {return d[2].length/(scale*16) + "em";})
}
