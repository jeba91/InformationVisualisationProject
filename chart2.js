var units = "widget";
let title1 = "title1";
let title2 = "title2";
let title3 = "title3";
let categorie = ["jes", 'hello']
let labels1 = ["animal", "pet", "human"];
let labels2 = ["brigge","something" , "human"];
let labels3 = ["lois" ];
let order = [[['1'],[]], [['3'],['4'],['5']], [['2'],[]]]

function make_graph(lab1, lab2){

    let graph = make_json(lab1, lab2, title1, title2)

    var svg = d3.select("#chart").append("svg"),
        width = 300
        height=100

    var formatNumber = d3.format(",.0f"),
        format = function(d) { return formatNumber(d) + " TWh"; },
        color = d3.scaleOrdinal(d3.schemeCategory10);

    var sankey = d3.sankey()
        .nodeWidth(20)
        .nodePadding(10)
        .extent([[1, 1], [width - 1, height - 6]])

    var link = svg.append("g")
        .attr("class", "links")
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-opacity", 0.2)
      .selectAll("path");

    var node = svg.append("g")
        .attr("class", "nodes")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
      .selectAll("g");

      sankey(graph)

  link = link
    .data(graph.links)
    .enter().append("path")
      .attr("d", d3.sankeyLinkHorizontal())
      .attr("stroke-width", function(d) { console.log (d);return Math.max(1, d.width); });

  link.append("title")
      .text(function(d) { return d.source.name + " → " + d.target.name + "\n" + format(d.value); });

  node = node
    .data(graph.nodes)
    .enter().append("g")
  	.call(d3.drag()
            .subject(function(d){return d})
            .on('start', function () { this.parentNode.appendChild(this); })
            .on('drag', dragmove));

  node.append("rect")
      .attr("x", function(d) {if (d.node == 1){return 280 }; return d.x0; })
      .attr("y", function(d) {   return d.y0; })
      .attr("height", function(d) {if (d.node == 1 || d.node == 0){ return height}; return d.y1 - d.y0; })
      .attr("width", function(d) { return d.x1 - d.x0; })
      .attr("fill", function(d) { ;return color(d.name.replace(/ .*/, ""));  })
      .attr("stroke", "#000");

  node.append("text")
      .attr("x", function(d) { return d.x0 - 6; })
      .attr("y", function(d) { return (d.y1 + d.y0) / 2; })
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .text(function(d) { return d.name; })
    .filter(function(d) { return d.x0 < width / 2; })
      .attr("x", function(d) {return d.x1 + 6; })
      .attr("text-anchor", "start");

  node.append("title")
      .text(function(d) { return d.name + "\n" + format(d.value); });

sankey.relayout
};


        // the function for moving the nodes
  function dragmove(d) {

      var rectY = d3.select(this).select("rect").attr("y");

      d.y0 = d.y0 + d3.event.dy;

      var yTranslate = d.y0 - rectY;

      d3.select(this).attr("transform",
                "translate(0" + "," + (yTranslate) + ")");

      sankey.update(graph);
      link.attr("d",d3.sankeyLinkHorizontal());
    }

    function make_json(labels1, labels2, title1, title2){

        var nodes = [{node: 0, name:"photo 1"}, {node:1 , name:"photo 2"}];
        var links = [];
        var index = 2;
        console.log(labels1, labels2)

        if (labels1.length < 2){
            labels1 = [100];
        }
        if (labels2.length < 2){
            labels2 = [100];
        }
        // labels1 = JSON.parse(labels1)
        // labels2 = JSON.parse(labels2)

        console.log("labels1:", labels1)
        console.log("labels2:", labels2)


        for (i = 0; i < labels1.length; i++){
            let item = labels1[i];
            item = item.toString()
            nodes.push({"node": index, "name" :item});
            links.push({"source": 0 ,"target": index, "value": 5 });
            index+= 1
        }
        for (i = 0; i < labels2.length; i++){
            let item = labels2[i];
            if (labels1.indexOf(item) == -1){
                item = item.toString()
                nodes.push({"node": index, "name" :item});
                links.push({"source": 1 ,"target": index, "value": 2 });
                index+=1
            }else {
                links.push({"source": 1 ,"target": labels1.indexOf(item) + 2 , "value": 2 })
            }
        }
        for (i = 0; i < categorie.length; i++){
            let item = categorie[i];
            nodes.push({"node":index, "name":item})
            links.push({"source": 3 , "target": index, "value": 5})
            links.push({"source":4, "target":index, "value":5})
            index+=1
        }

        var dictstring = {nodes,links};
        console.log(dictstring)
        return(dictstring)
    }











function update_graph(){
    console.log("remove")
    d3.select("#chart2").remove(".nodes");

    // make a new graph
    make()
}

function make(){
    console.log('make')
    new_json = make_json(labels1, labels3, title1, title3)
    make_graph(new_json)
}


// new_json = make_json(labels1, labels2 , title1, title2)
make_graph(labels1, labels2 , title1, title2)
