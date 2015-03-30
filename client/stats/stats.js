// var Points = new Mongo.Collection(null);

// if(Points.find({}).count() === 0){
//   for(i = 0; i < 20; i++)
//     Points.insert({
//       date:moment().startOf('day').subtract(Math.floor(Math.random() * 1000), 'days').toDate(),
//       value:Math.floor(Math.random() * 100)+500
//     });
// }

// Template.stats.events({
//   'click #add':function(){
//     Points.insert({
//       date:moment().startOf('day').subtract(Math.floor(Math.random() * 1000), 'days').toDate(),
//       value:Math.floor(Math.random() * 100)+500
//     });
//   },
//   'click #remove':function(){
//     var toRemove = Random.choice(Points.find().fetch());
//     Points.remove({_id:toRemove._id});
//   },
//   'click #randomize':function(){
//     //loop through bars
//     Points.find({}).forEach(function(point){
//       Points.update({_id:point._id},{$set:{value:Math.floor(Math.random() * 100)+500}});
//     });
//   }
// });


Template.stats.onRendered(function() {
  var formatInteger = d3.format("0f");

  // Width and height
  var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  // Define scales and axes
  var x = d3.time.scale()
    .range([0, width-10]);

  var y = d3.scale.linear()
    .range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(7)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .ticks(7)
    .tickFormat(formatInteger)
    .orient("left");

  // Define key function to bind elements to documents
  var line = d3.svg.line()
    .x(function(d) {
      return x(d.date);
    })
    .y(function(d) {
      return y(d.totalSessions);
    });

  // Define 'div' for tooltips
  var div = d3.select(".tipHolder")
    .append("div")  // declare the tooltip div 
    .attr("class", "tooltip")              // apply the 'tooltip' class
    .style("opacity", 0);                  // set the opacity to nil

  // Define svg element  
  var svg = d3.select("#lineChart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    // .attr("width", '100%')
    // .attr("height", '100%')
    // .attr('viewBox','0 0 '+Math.min(width,height)+' '+Math.min(width,height))
    // .attr('preserveAspectRatio','xMinYMin')
    // .append("g")
    // .attr("transform", "translate(" + Math.min(width,height) / 2 + "," + Math.min(width,height) / 2 + ")");

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");

  svg.append("g")
    .attr("class", "y axis")
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Completed");

  Tracker.autorun(function() {
    //perform a reactive query on the collection to get an array
    // var dataset = Points.find({},{sort:{date:-1}}).fetch();

    var dataset = sessionsCount.find().fetch();

    var paths = svg.selectAll("path.line")
      .data([dataset]); //todo - odd syntax here - should use a key function, but can't seem to get that working

    var xDomain = d3.extent(dataset, function(d) { return d.date; });
    var yDomain = d3.extent(dataset, function(d) { return d.totalSessions; });

    var xScale = x.domain(xDomain);
    var yScale = y.domain(yDomain);

    //Update X axis
    svg.select(".x.axis")
      .transition()
      .duration(1000)
      .call(xAxis);
      
    //Update Y axis
    svg.select(".y.axis")
      .transition()
      .duration(1000)
      .call(yAxis);

    svg
     .selectAll('dot')
     .data(dataset)
     .enter()
     .append('circle')
       .attr('class', 'circle')
       .attr('cx', function (d) { return xScale(d.date); })
       .attr('cy', function (d) { return yScale(d.totalSessions); })
       .attr('r', 5)
       .on("mouseover", function(d) {   
          var xPos = parseFloat(d3.select(this).attr("cx"));
          var yPos = parseFloat(d3.select(this).attr("cy"));

          d3.select(this).style("fill", "#de4f4f")
            .style("cursor", "pointer"); 

          div.transition()
            .duration(500)  
            .style("opacity", 0);
          div.transition()
            .duration(200)  
            .style("opacity", .9);  
          div.html(
            "<div style='display: table-cell; vertical-align: middle'>" + 
            "Completed " +
            "<strong>" + d.totalSessions + "</strong>" +
            " pomodoros " +
            "<br/>" +
            "on " +
            "<strong>" + moment(d.date).format("MMMM Do") + "</strong>" +
            "</div>")   
            .style("left", xPos - 25 + "px")      
            .style("top", yPos + 5 + "px");
        })
       .on("mouseout", function() {
         div.style("opacity", 0);
         d3.select(this).style("fill", "white");                   
      });

    // handle new documents via enter(), updates via transition(), and
    // removed documents via exit()
    paths
      .enter()
      .append("path")
      .attr("class", "line")
      .attr('d', line);

    paths
      .attr('d', line); //todo - should be a transisition, but removed it due to absence of key

    paths
      .exit()
      .remove();
  });
});