// Height and width of map
let width = 0.8*(d3.select('#worldmap').node().getBoundingClientRect().width);
let height = 0.5*(window.innerHeight);

let selectfirst = true;
let selectsecond = false;

let selecturl1 = "";
let selecturl2 = "";

let inCenterpoint  = false;
let outCenterpoint = true;

let translation_x = 0;
let translation_y = 0;
let scale_overall = 1;

let label1 = "";
let label2 = "";

let labels_select = false;
let lab1 = "[]";
let lab2 = "[]";

let graph1;
let graph2;


let radius = 0;


function intersect(a, b) {
    var t;
    if (b.length > a.length) t = b, b = a, a = t;
    return a.filter(function (e) {
        return b.indexOf(e) > -1;
    });
}

function filtersunburstlabels(name){
    alt_coord = [];

    dots.selectAll('circle').each(function(d){
        if(JSON.parse(this.dataset.labels).indexOf(name.toLowerCase()) != -1){

            this.dataset.appear_in_filter = true;


        }
        else{
            this.dataset.appear_in_filter = false;
        }
        xn = this.cx.baseVal.value*scale_overall + translation_x;
        yn = this.cy.baseVal.value*scale_overall + translation_y;

        if(xn > 0 && xn < width && yn > 0 && yn <height){
            if(this.dataset.appear_in_filter=='true'){
                alt_coord.push([xn, yn, this.dataset.url, parseInt(this.dataset.views), this]);
            }
        }
    });

    coordinates = alt_coord;

    load_tree(translation_x, translation_y, scale_overall);
}

function filtersunburstcategories(name){
    categorydict = {"Animal": 0, "Sports": 1, "Nature": 2, "Cultural": 3, "Object": 4, "Landscape": 5, "Urban": 6, "Vehicle": 7, "Emotions": 8, "People": 9, "Sky": 10, "Architecture": 11, "Weather/Seasons": 12};

    categories_present = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    if(name != 'main'){
        categories_present = []
        categories_present.push(categorydict[name]);
    }

    alt_coord = [];

    dots.selectAll('circle').each(function(d){
        if(categories_present.length == 14){
            this.dataset.appear_in_filter = true;
        }
        else if(intersect(JSON.parse(this.dataset.categories), categories_present).length>0){
            this.dataset.appear_in_filter = true;
        }
        else{
            this.dataset.appear_in_filter = false;
        }

        xn = this.cx.baseVal.value*scale_overall + translation_x;
        yn = this.cy.baseVal.value*scale_overall + translation_y;

        if(xn > 0 && xn < width && yn > 0 && yn <height){
            if(this.dataset.appear_in_filter=='true'){
                alt_coord.push([xn, yn, this.dataset.url, parseInt(this.dataset.views), this]);
            }
        }
    });

    coordinates = alt_coord;


    load_tree(translation_x, translation_y, scale_overall);
}




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
    radius = (-1/20*d3.event.transform.k + 1 + (1/20));

    map.attr('transform', d3.event.transform);
    dots.attr('transform', d3.event.transform);
    centers.attr('transform', d3.event.transform);
    centerTexts.attr('transform', d3.event.transform);

    translation_x = d3.event.transform.x;
    translation_y = d3.event.transform.y;
    scale_overall = d3.event.transform.k;
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
            if(this.dataset.appear_in_filter=='true'){
                alt_coord.push([xn, yn, this.dataset.url, parseInt(this.dataset.views), this]);
            }
        }

    });
    coordinates = alt_coord;

    translation_x = d3.event.transform.x;
    translation_y = d3.event.transform.y;
    scale_overall = d3.event.transform.k;

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
let dots = svg.append('g');
let centerTexts = svg.append('g');
let centers = svg.append('g');
let image1 = d3.select('#photo1')
    .append('one')
    .attr("class", "img-fluid");
let image2 = d3.select('#photo2')
    .append('two')
    .attr("class", "img-fluid")

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
function mouseoverCenter(d){
    let views = d[2].map(function(d){return d[3]});
    let max_views_index = indexOfMax(views);
    let url_most_views = d[2][max_views_index][2];
    let circle_most_views = d[2][max_views_index][4];
    let title = d3.select(circle_most_views).attr("data-categories");


    if(!inCenterpoint & outCenterpoint){
        if(d3.select(circle_most_views).attr('checked') == 'false'){
            d3.select(circle_most_views)
                .attr("r", radius)
                .attr("fill", "red")
        }

        if(selectfirst){
            image1.transition().duration(200).style("opacity", .9);
            image1.html('<img src="' + url_most_views + '">');
            image1.append("title").text(title).style("display", "block") 
        }

        else if(selectsecond){
            image2.transition().duration(200).style("opacity", .9);
            image2.html('<img src="' + url_most_views + '">');
            image2.append("title").text(title).style("display", "block") 
        }

    }else if(inCenterpoint & !outCenterpoint){
        if(selectfirst & !selectsecond & d3.select(circle_most_views).attr('checked') == 'false'){
            d3.selectAll('circle[fill=blue]')
                .attr("fill", "none")
                .attr('checked','false');
            d3.select(circle_most_views)
                .attr("fill", "blue")
                .attr('checked','true')
                .attr("r", radius);
            image1.style("opacity", 1.0);
            selectfirst = false;
            selectsecond = true;
            selecturl1 = url_most_views;
            image1.html('<img src="' + selecturl1 + '">')
            image1.append("title").text(title).style("display", "block") 
            lab1 = circle_most_views.dataset.labels;
            graph1 = circle_most_views;
        }else if(!selectfirst & selectsecond & d3.select(circle_most_views).attr('checked') == 'false'){
            d3.selectAll('circle[fill=green]')
                .attr("fill", "none")
                .attr('checked','false');
            d3.select(circle_most_views)
                .attr("fill", "green")
                .attr('checked','true')
                .attr("r", radius);
            image2.style("opacity", 1.0);
            selectfirst = true;
            selectsecond = false;
            selecturl2 = url_most_views;
            image2.html('<img src="' + url_most_views + '">')
            image2.append("title").text(title).style("display", "block")   
            lab2 = circle_most_views.dataset.labels;
            graph2 = circle_most_views;
        }
        // to make the graph
        if (labels_select == false){
            build_graph(graph1, graph2)
            labels_select = true;
        }else{
            build_graph(graph1, graph2)
        }
    }

    if(!inCenterpoint & outCenterpoint){
        inCenterpoint = true;
        outCenterpoint =  false;
    }
}


function mouseoutCenter(d){
    let views = d[2].map(function(d){return d[3]});
    let max_views_index = indexOfMax(views);
    let url_most_views = d[2][max_views_index][2];
    let circle_most_views = d[2][max_views_index][4];
    let title = d3.select(circle_most_views).attr("data-categories");

    inCenterpoint = false;
    outCenterpoint =  true;

    if(d3.select(circle_most_views).attr('checked') == 'false'){
        d3.select(circle_most_views).attr("fill", "none")
    }

    if(selectfirst){
        image1.transition().duration(200).style("opacity", .9);
        image1.html('<img src="' + selecturl1 + '">');
        image1.append("title").text(title).style("display", "block");
    }
    else if(selectsecond){
        image2.transition().duration(200).style("opacity", .9);
        image2.html('<img src="' + selecturl2 + '">');
        image2.append("title").text(title).style("display", "block");  
    }

    d3.selectAll('circle[fill=red]')
        .attr("fill", "none")
        .attr('checked','false');
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
                .attr('data-appear_in_filter', function(d){
                    return true;
                })
                .attr('data-labels', function(d){
                    return d['labels'];
                })
                .attr('data-categories', function(d){
                    return d['categories'];
                })
                .attr('data-url', function(d){
                    return d['url'];
                })
                .attr('data-views', function(d){
                    return parseInt(d['views']);
                })

                dots.selectAll('circle').each(function(d){

                    x = this.cx.baseVal.value;
                    y = this.cy.baseVal.value;


                    if(x > 0 && x < width && y > 0 && y <height){
                        if(this.dataset.appear_in_filter=='true'){
                            coordinates.push([x, y, this.dataset.url, parseInt(this.dataset.views), this]);
                        }
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

    // Investigate behaviour
    let pointSizeScale = d3.scaleLinear()
       .domain([
         1,
         d3.max(clusterPoints, function(d) {return d[2].length;})
       ])
       .rangeRound([1, 15]);

    centers.selectAll('.centerPoint').remove()
    centerTexts.selectAll('.centerText').remove()

    centers.selectAll(".centerPoint")
       .data(clusterPoints)
       .enter().append("circle")
       .attr("class", function(d) {return "centerPoint"})
       .attr("cx", function(d) {return (d[0] - x_offset)/scale;})
       .attr("cy", function(d) {return (d[1] - y_offset)/scale;})
       .attr("fill", '#FFA500')
       .attr("opacity", 0.4)
       .attr("r", function(d, i) {return pointSizeScale((d[2].length/scale)*3);})
       .attr('checked', 'false')
       .on("mouseover", function(d){mouseoverCenter(d)})
       .on("mouseout", function(d){mouseoutCenter(d)});

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
        // .attr("font-size", function(d) { return Math.min(2 * d.r, (2 * d.r - 8) / this.getComputedTextLength() * 24) + "em"; })
        // .attr("dominant-baseline", "central")
        // .attr("font-size",  "0.5em");
        .attr("font-size", function(d){
            return fontLetters(d, scale);
        })
}

function fontLetters(d, scale) {
    let font_size = d[2].length/(scale*64);
    let smallest = 0.2;
    let biggest = 1;

    if(font_size < smallest){
        return smallest + "em";
    }else if(font_size > biggest){
        return biggest + "em";
    }
    else{
        return font_size + "em";
    }
}
