let graph_svg = d3.select("#chart").append('svg')
.attr('width', 500)
.attr('height', 500)
.append("g")

let category_dict = ["Animal", "Sports", "Nature", "Cultural", "Object", "Landscape", "Urban", "Vehicle", "Emotions", "People", "Sky", "Architecture", "Weather/Seasons"];
let label_to_category;
$.getJSON('./label_to_category.json', function(data) {
    label_to_category = data;
});

function clean_text(txt){
    txt = txt.split('_');
    txt = txt.join(' ');
    return txt;
}

console.log(clean_text("pope_poep1"))

function build_graph(photo1, photo2){

    let data = {
        nodes: [{id: "Photo1", type: "photo1"}, {id: "Photo2", type:"photo2"}],
        links: []
    }

    let categories1 = JSON.parse(photo1.dataset.categories);
    let labels1 = JSON.parse(photo1.dataset.labels);

    if(categories1.length == 0){
        data.nodes.push({id: "No Category1", type: "category1"});
        data.links.push({source: "Photo1", target: "No Category1", value: 1});
    }

    categories1.forEach(function(d){
        data.nodes.push({id: category_dict[d]+"1", type: "category1"});
        data.links.push({source: "Photo1", target: category_dict[d]+"1", value: 1});
    });

    if(labels1.length == 0){
        data.nodes.push({id: "No Label", type: "label"});
        data.links.push({source: "No Category1", target: "No Label", value: 1})
    }

    labels1.forEach(function(d){
        data.nodes.push({id: d, type: "label"});
        data.links.push({source: category_dict[label_to_category[d]]+"1", target: d, value: 1});
    });

    if(photo2){
        let categories2 = JSON.parse(photo2.dataset.categories);
        let labels2 = JSON.parse(photo2.dataset.labels);

        if(labels2.length == 0 && labels1.length>0){
            data.nodes.push({id: "No Label", type: "label"});
        }
        if(labels2.length == 0){
            data.links.push({source: "No Label", target: "No Category2", value: 1})
        }

        labels2.forEach(function(d){
            data.nodes.push({id: d, type: "label"});
            data.links.push({source: d, target: category_dict[label_to_category[d]]+"2", value: 1});
        });

        if(categories2.length == 0){
            data.nodes.push({id: "No Category2", type: "category2"})
            data.links.push({source: "No Category2", target: "Photo2", value: 1});
        }

        categories2.forEach(function(d){
            data.nodes.push({id: category_dict[d]+"2", type: "category2"})
            data.links.push({source: category_dict[d]+"2", target: "Photo2", value: 1});
        });
    }

    build_from_data(data);
}

function build_from_data(data){
    let sankey = d3.sankey().size([490, 490])
    .nodeId(d => d.id)
    .nodeWidth(20)
    .nodePadding(10)
    .nodeAlign(d3.sankeyCenter);

    let graph = sankey(data);

    graph.nodes.forEach(function(d){
        if(d.type == "category1"){
            d.x0 = 100;
            d.x1 = 120;
        }
        if(d.type == "category2"){
            d.x0 = 300;
            d.x1 = 320;
        }
        if(d.type == "label"){
            d.x0 = 200;
            d.x1 = 220;
        }
        // if(d.type == "photo1" || d.type=="photo2"){
        //     d.y0 = 0;
        //     d.y1 = 500;
        // }
    });

    graph_svg.selectAll('*').remove();

    let links = graph_svg.append("g")
        .classed("links", true)
        .selectAll("path")
        .data(graph.links)
        .enter()
        .append("path")
        .classed("link", true)
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("fill", "none")
        .attr("stroke", "#606060")
        .attr("poep", function(d){console.log(d.width)})
        .attr("stroke-width", d => d.width)
        .attr("stoke-opacity", 0.5);

    let nodes = graph_svg.append("g")
        .classed("nodes", true)
        .selectAll("rect")
        .data(graph.nodes)
        .enter()
        .append("rect")
        .classed("node", true)
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", "blue")
        .attr("opacity", 0.8);

    let text = graph_svg.append("g")
        .style("font", "10px sans-serif")
        .selectAll("text")
        .data(graph.nodes)
        .join("text")
        .attr("x", d => d.x0 < 500 / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < 500 / 2 ? "start" : "end")
        .text(d => d.id);
}
