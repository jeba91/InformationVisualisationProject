data = [[0,1],[2,0]]

var tree = d3.quadtree();
tree.addAll(data);
console.log(tree.data());
