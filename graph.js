//  ------------------ SECOND GRAPH --------------------------------------------

var units = "widget";
var margin = {top: 5, right: 5, bottom: 5, left: 5},
    width_graph = 700 - margin.left - margin.right,
    height_graph = 300 - margin.top - margin.bottom;

    // format variables
var formatNumber = d3.format(",.0f"),    // zero decimal places
    format = function(d) { return formatNumber(d) + " " + units; },
    color = d3.scaleOrdinal(d3.schemeCategory10);


var diagram = d3.select("#chart").append("svg")
        .attr("width", width_graph + margin.left + margin.right)
        .attr("height", height_graph + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

var sankey = d3.sankey()
    .nodeWidth(30)
    .nodePadding(30)
    .size([width_graph, height_graph]);

var path_graph = sankey.link();





//  function to make the right format
function make_json(labels1, labels2){




    var nodes = [{node: 0, name:"photo 1"}, {node:1 , name:"photo 2"}];
    var links = [];
    var index = 2;
    console.log("label1")
    console.log(labels1)
    console.log("labels2")
    console.log(labels2)
    labels1 = JSON.parse(labels1)
    labels2 = JSON.parse(labels2)
    if (labels1.length < 2){
        console.log("hij was te klein");
        labels1 = [100];
    }
    if (labels2.length < 2){
        console.log("ook te klein");
        labels2 = [100];
    }
    for (i = 0; i < labels1.length; i++){
        let item = labels1[i];
        item = item.toString()
        nodes.push({"node": index, "name" :item});
        links.push({"source": 0 ,"target": index, "value": 5 });
        index+= 1
    }
    for (i = 0; i < labels2.length; i++){
        console.log("labels2:")
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
    var dictstring = {nodes,links};
    return(dictstring)
}



//  function that makes the graph
function make_graph(lab1, lab2){

    let graph = make_json(lab1, lab2)

    sankey
       .nodes(graph.nodes)
       .links(graph.links)
       .layout(30);

       // add in the links
         var link = diagram.append("g").selectAll(".link")
             .data(graph.links)
           .enter().append("path")
             .attr("class", "link")
             .attr("d", path_graph)
             .style("stroke-width", function(d) { return Math.max(0.5, d.dy); })
             .sort(function(a, b) { return b.dy - a.dy; });

       // add the link titles
         link.append("title")
               .text(function(d) {
           		return d.source.name + " → " +
                       d.target.name + "\n" + format(d.value); });


  var node = diagram.append("g").selectAll(".node")
        .data(graph.nodes)
    .enter().append('g')
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")"; })
        .call(d3.drag()
          .subject(function(d) {
            return d;
          })
          .on("start", function() {
            this.parentNode.appendChild(this);
          })
          .on("drag", dragmove));


  node.append("rect")
      .attr("height", function(d) {  return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d){
          console.log(d)
          console.log(d.name)
          return d.color = color(d.name.replace(/ .*/, "")); })
      .style("stroke", function(d) {
          return d3.rgb(d.color).darker(2); })
    .append("title")
      .text(function(d) {
            return d.name + "\n" + format(d.value); });

        // add in the title for the nodes
    node.append("text")
           .attr("x", -6)
           .attr("y", function(d) { return d.dy / 2; })
           .attr("dy", ".35em")
           .attr("text-anchor", "end")
           .attr("transform", null)
           .text(function(d) { return d.name; })
         .filter(function(d) { return d.x < width_graph / 2; })
           .attr("x", 6 + sankey.nodeWidth())
           .attr("text-anchor", "start");

    function dragmove(d) {
           d3.select(this)
             .attr("transform",
                   "translate("
                      + d.x + ","
                      + (d.y = Math.max(
                         0, Math.min(height_graph - d.dy, d3.event.y))
                        ) + ")");
           sankey.relayout();
           link.attr("d", path_graph);
         }
};




function update_graph(new_labels, new_labels2){
    alert("ARE YOU SURE?")

    // makes the new data format
    new_json = make_json(new_labels, new_labels2);

    // this function we need to update the graph for taking in new data
    sankey
        .nodes(new_json.nodes)
        .links(new_json.links)
        .layout(32);

    sankey.relayout();

    diagram.selectAll(".link")
        .data(new_json.links)
        .transition()
        .duration(1300)
        .attr("d", path_graph)
        .style("stroke-width", function(d) { return Math.max(0.5, d.dy); })

    diagram.selectAll(".node")
        .data(new_json.nodes, function(d) { return d.name; })
        .transition()
        .duration(1300)
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
         });

    diagram.selectAll(".node rect")
         .transition()
         .duration(1300)
         .attr("height", function(d) {
            return d.dy;
         });

    diagram.selectAll(".node text")
         .transition()
         .duration(1300)
         .attr("y", function(d) {
            return d.dy / 2;
        });
}
