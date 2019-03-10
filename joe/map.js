let width = 2048;
let height = 1024;

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

let coordinates = [];
let previous_k = 1.0;
let done = true;

d3.json('high.geo.json').then(function(geojson){
    map.selectAll('path')
    .data(geojson.features)
    .enter()
    .append('path')
    .attr('d', path)
    load_dots();
});

function zoomed(){
    if(done){

    map.attr('transform', d3.event.transform);
    dots.attr('transform', d3.event.transform);

    if(!((previous_k - d3.event.transform.k)**2 > 0.0)){
        done = false;
        console.log('if');
        centers.attr('transform', d3.event.transform);
        done = true;
    }
    else{
        done = false;
        // centers.attr('transform', previous_transform);
        // previous_transform = d3.event.transform;
        previous_k = d3.event.transform.k
        alt_coord = [];

        dots.selectAll('circle').each(function(d){
            k = d3.event.transform.k
            x = d3.event.transform.x
            y = d3.event.transform.y
            xn = this.cx.baseVal.value*k + x;
            yn = this.cy.baseVal.value*k + y;

            if(xn > 0 && xn < width && yn > 0 && yn <height){
                alt_coord.push([xn,yn]);
            }

        });

        coordinates = alt_coord;
        load_tree();

        centers.attr('transform', 'translate(0,0) scale(1)')
        // t.x = 0;
        // t.y = 0;
        // console.log(t);
        done = true;
    }


    // centers.attr('transform', d3.event.transform);
    // dots.selectAll('circle').attr('r', -1/20*d3.event.transform.k + 1 + (1/20));
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


function load_dots(){
    $(function(){
        $.ajax({
            url:"./request.php",
            type:"post",
            data:"",
            success: function(response){
                dots.append('circle').attr('cx', projection([0.0,0.0])[0]).attr('cy',projection([0.0,0.0])[1]).attr('r', 20).attr('fill', 'red')
                // dots.selectAll('circle')
                // .data(response)
                // .enter()
                // .append('circle')
                // .attr('cx', function (d){
                //     return projection([parseFloat(d['longitude']), parseFloat(d['latitude'])])[0];
                // })
                // .attr('cy', function (d){
                //     return projection([parseFloat(d['longitude']), parseFloat(d['latitude'])])[1];
                // })
                // .attr('r', 1)
                // .attr('fill', 'red')
                // .attr('data-url', function(d){
                //     return d['url'];
                // });
                //
                dots.selectAll('circle').each(function(d){

                    x = this.cx.baseVal.value;
                    y = this.cy.baseVal.value;


                    if(x > 0 && x < width && y > 0 && y <height){
                        coordinates.push([x, y]);
                    }

                });

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

function load_tree(){
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
       .rangeRound([3, 30]);

    centers.selectAll(".node").remove()
    centers.selectAll('.centerPoint').remove()


    // original cx and cy needed
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
