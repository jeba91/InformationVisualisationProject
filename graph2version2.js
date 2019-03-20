let graph_svg = d3.select("#chart").append('svg')
.attr('width', "100%")
.attr('height', 500)
.append("g")


let category_dict = ["Animal", "Sports", "Nature", "Cultural", "Object", "Landscape", "Urban", "Vehicle", "Emotions", "People", "Sky", "Architecture", "Weather/Seasons"];
let label_to_category;
$.getJSON('./label_to_category.json', function(data) {
    label_to_category = data;
});

function clean_text(txt){
    if(txt.substring(txt.length - 1)=='1' || txt.substring(txt.length - 1)=='2'){
        txt = txt.substring(0, txt.length - 1);
    }
    txt = txt.split('_');
    for(var i = 0; i<txt.length; i++){
        txt[i] = txt[i].charAt(0).toUpperCase() + txt[i].substring(1);
    }
    txt = txt.join(' ');
    return txt;
}

function build_graph2(photo1, photo2){

    let data = {
        nodes: [{id: "Photo1", type: "photo1"}, {id: "Photo2", type:"photo2"}],
        links: []
    }

    let categories1 = JSON.parse(photo1.dataset.categories);
    let labels1 = JSON.parse(photo1.dataset.labels);
    let label_indices = labels1.map(d => label_to_category[d]);

    let labels_per_category = [];

    for(var i = 0; i< categories1.length; i++){
        var category_index = categories1[i];
        var numOccurences = $.grep(label_indices, function (elem) {
            return elem === category_index;
        }).length;
        labels_per_category.push(numOccurences);
    }

    if(categories1.length == 0){
        data.nodes.push({id: "No Category1", type: "category1"});
        data.links.push({source: "Photo1", target: "No Category1", value: 1});
    }

    categories1.forEach(function(d, i){
        data.nodes.push({id: category_dict[d]+"1", type: "category1"});
        data.links.push({source: "Photo1", target: category_dict[d]+"1", value: labels_per_category[i]});
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
        let label_indices2 = labels2.map(d => label_to_category[d]);

        let labels_per_category2 = [];

        for(var i = 0; i< categories2.length; i++){
            var category_index2 = categories2[i];
            var numOccurences2 = $.grep(label_indices2, function (elem) {
                return elem === category_index2;
            }).length;
            labels_per_category2.push(numOccurences2);
        }

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

        categories2.forEach(function(d, i){
            data.nodes.push({id: category_dict[d]+"2", type: "category2"})
            data.links.push({source: category_dict[d]+"2", target: "Photo2", value: labels_per_category2[i]});
        });
    }
    console.log(data.links)

    build_from_data(data);

}




function build_graph(photo1, photo2){
    let data = {
        nodes: [{id: "Photo1", type: "photo1"}, {id: "Photo2", type:"photo2"}],
        links: []
    }

    // when one foto is selected
    let categories1 = JSON.parse(photo1.dataset.categories);
    let labels1 = JSON.parse(photo1.dataset.labels);
    let label_indices = labels1.map(d => label_to_category[d]);
    let labels_per_category = [];
    let category = []

    for(var i = 0; i< categories1.length; i++){
        var category_index = categories1[i];
        var numOccurences = $.grep(label_indices, function (elem) {
            return elem === category_index;
        }).length;
        labels_per_category.push(numOccurences);
    }

    console.log("labels per category", labels_per_category)

    // check whether there is a label
    if (labels1.length == 0){
        data.nodes.push({id:"No Label1", type:"label1"});
        data.links.push({source: "Photo1", target: "No Label1", value: 1})
    }

    // for every label make connection to photo:
    labels1.forEach(function(d){
        console.log(label_to_category[d])
        data.nodes.push({id: d + "1", type: "label1"});
        data.links.push({source: "Photo1", target: d+"1", value: 1});

        // make link to categorie for every label
        data.links.push({source:d + "1", target:category_dict[label_to_category[d]], value:1 })
        category.push(category_dict[label_to_category[d]])
    });
    if(category.length == 0){
        data.nodes.push({id: "No Category", type: "category"});
        data.links.push({source:"No Label1" , target: "No Category", value: 1});
    }else{
        category.forEach(function(d){
            data.nodes.push({id:d, type:'category'})
        });
    };

    if (photo2){


        let categories2 = JSON.parse(photo2.dataset.categories);
        let labels2 = JSON.parse(photo2.dataset.labels);
        let label_indices2 = labels2.map(d => label_to_category[d]);
        let labels_per_category2 = [];

        for(var i = 0; i< categories2.length; i++){
            var category_index2 = categories2[i];
            var numOccurences2 = $.grep(label_indices2, function (elem) {
                return elem === category_index2;
            }).length;
            labels_per_category2.push(numOccurences2);
        }

        if (labels2.length == 0){
            data.nodes.push({id:"No Label2", type:"label2"});
            data.links.push({source: "No Label2", target: "Photo2", value: 1})

            if (labels1.length > 0){
                data.nodes.push({id: "No Category", type: "category"});
                data.links.push({source:"No Category" , target: "No Label2", value: 1});
            }else{
                console.log("both dont have labels")
                data.links.push({source: "No Category", target:"No Label2" , value: 1});
            }
        }

        labels2.forEach(function(d){
            data.nodes.push({id: d+"2", type: "label2"} )
            data.links.push({source: d+"2", target:"Photo2", value:1})

            // make link to categorie for every label
            let current_cat = category_dict[label_to_category[d]]
            if (typeof category[current_cat] === 'undefined'){
                data.nodes.push({id: current_cat, type:"category"})
            }
            data.links.push({source:category_dict[label_to_category[d]], target: d + "2", value:1} )
            category.push(category_dict[label_to_category[d]])
        });



    }
    build_from_data(data)
}



function build_from_data(data){
    console.log(data)

    let diagram_width = parseInt(d3.select("#chart svg").style('width').replace("px", ""))
    let sankey = d3.sankey().size([diagram_width, 490])
    .nodeId(d => d.id)
    .nodeWidth(20)
    .nodePadding(10)
    .nodeAlign(d3.sankeyCenter);

    let graph = sankey(data);

    graph.nodes.forEach(function(d){
        if(d.type == "label1"){
            d.x0 = diagram_width*0.25;
            d.x1 = diagram_width*0.25 + 20;

        }
        if(d.type == "label2"){
            d.x0 = diagram_width*0.75;
            d.x1= diagram_width*0.75 + 20;
        }
        if(d.type == "category"){
            d.x0 = diagram_width*0.5;
            d.x1 = diagram_width*0.5 + 20;
        }
        // if(d.type == "photo1" || d.type=="photo2"){
        //     d.y0 = 0;
        //     d.y1 = 500;
        // }
    });

    graph_svg.selectAll('*').remove();

    let defs = graph_svg.append('defs')

    let links = graph_svg.append("g")
        .selectAll("path")
        .data(graph.links)
        .enter()
        .append("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("fill", "none")
        .attr("stroke", "#606060")
        .attr("stroke-width", function(d) {
        return d.width - 10})
        .attr("stroke-opacity", 0.4)
        .on("mouseover", function() {
                d3.select(this).style("stroke-opacity", "0.7")
                })
        .on("mouseout", function() {
                d3.select(this).style("stroke-opacity", "0.4")
        });


    let nodes = graph_svg.append("g")
        .selectAll("rect")
        .data(graph.nodes)
        .enter()
        .append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", d => d.color = color(clean_text(d.id)))
        .style("stroke", function(d){
            return d3.rgb(d.color).darker(2)
        })
        .attr("opacity", 0.8);


        links.style('stroke', (d, i) => {
           const gradientID = i;
           const startColor = d.source.color
           const stopColor = d.target.color
           const linearGradient = defs.append('linearGradient')
               .attr('id', gradientID)
               .attr("gradientUnits", "userSpaceOnUse");

           linearGradient.selectAll('stop')
             .data([
                 {offset: '0%', color: startColor },
                 {offset: '100%', color:stopColor}
                 // {offset: '50%', color: stopColor },
                 // {offset: '20%', color: startColor },
                 // {offset: '50%', color: stopColor },
                 // {offset: '30%', color: startColor },
                 // {offset: '90%', color: stopColor }
               ])
             .enter().append('stop')
             .attr('offset', d => {
               return d.offset;
             })
             .attr('stop-color', d => {
               return d.color;
             });
           return `url(#${gradientID})`;
         })


    let text = graph_svg.append("g")
        .style("font", "12px sans-serif")
        .selectAll("text")
        .data(graph.nodes)
        .join("text")
        .attr("x", d => d.x0 < 500 / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        // .attr("text-anchor", d => d.x0 < 500 / 2 ? "start" : "end")
        .text(d => clean_text(d.id));


}
