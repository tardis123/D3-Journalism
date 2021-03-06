var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
//var circleGroup = svg.append("g")
//  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare"

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.9,
      d3.max(data, d => d[chosenXAxis]) * 1.1
    ])
    .range([0, width]);

  return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.9,
      d3.max(data, d => d[chosenYAxis]) * 1.1
    ])
    .range([height,0]);

  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderxAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderyAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// functions used for updating circles group with a transition to
// new circles
function render_x_Circles(circles, newXScale) {

  circles.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
        
  return circles;
}

function render_y_Circles(circles, newYScale) {

  circles.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));
        
  return circles;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circles) {

  if (chosenXAxis === "poverty") {
    var xlabel = "In poverty (%)";
  }
  else if (chosenXAxis === "income") {
    var xlabel = "Household income (median)";
  }
  else {
    var xlabel = "Age (median)"
  }

  if (chosenYAxis === "healthcare") {
    var ylabel = "Lacks healthcare (%)";
  }
  else if (chosenXAxis === "smokes") {
    var ylabel = "Smokes (%)";
  }
  else {
    var ylabel = "Obesity (%)"
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
    });

    circles.call(toolTip);

    circles.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circles;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("source_data.csv", function(err, data) {
  if (err) throw err;

  // parse data
  data.forEach(function(data) {
    data.poverty = +data.poverty;
    data.income = +data.income;
    data.age = +data.age;
    data.healthcare = +data.healthcare;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis);
  var yLinearScale = yScale(data, chosenYAxis);

/*   // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d.healthcare)*0.8, d3.max(data, d => d.healthcare)*1.1])
    .range([height, 0]); */

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

// append initial circles

  // Define circles data
  var elem = svg.selectAll("g")
    .data(data)

  // Create and place the groups containing circle and circle text
  var circleGroup = elem.enter().append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
  // Create the circle per group
  var circles = circleGroup.append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", 10)
    .attr("fill", "blue")
    .attr("opacity", ".5");

  // Create the circle text per group
  circleGroup
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("dy", ".35em")           // set offset y position
    .attr("text-anchor", "middle") // set anchor y justification 
    .text(function(d) {return d.abbr})
    .attr("font-family", "sans-serif")
    .attr("font-size", "10px")
    .attr("fill", "white")
    .attr("class","state_code");

  // append x axis
  var xAxis = circleGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = circleGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // Create group for x axis labels
    var xlabelsGroup = circleGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In poverty (%)");

    var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household income (median)");

    var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (median)");

   // Create group for y axes labels
    var ylabelsGroup = circleGroup.append("g")
    .attr("transform", "rotate(-90)");

    var healthcareLabel = ylabelsGroup.append("text")
    .attr("y", 60 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("value","healthcare")
    .classed("active", true)
    .text("Lacks healthcare (%)");

    var smokesLabel = ylabelsGroup.append("text")
    .attr("y", 40 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("value","smokes")
    .classed("active", true)
    .text("Smokes (%)");

    var obesityLabel = ylabelsGroup.append("text")
    .attr("y", 20 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("value","obesity")
    .classed("active", true)
    .text("Obesity (%)");

  // updateToolTip function above csv import
  var circles = updateToolTip(chosenXAxis, chosenYAxis, circles);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderxAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circles = render_x_Circles(circles, xLinearScale, chosenXAxis);

        d3.selectAll(".state_code")
                    .transition()
                    .duration(1000)
                    .attr("x", d => xLinearScale(d[chosenXAxis]))
                    .attr("y", d => yLinearScale(d[chosenYAxis]));

        // updates tooltips with new info
        circles = updateToolTip(chosenXAxis, chosenYAxis, circles);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
            povertyLabel
            .classed("active", true)
            .classed("inactive", false);
            incomeLabel
            .classed("active", false)
            .classed("inactive", true);
            ageLabel
            .classed("active", false)
            .classed("inactive", true);            
        }
        else if (chosenXAxis === "income") {
            povertyLabel
            .classed("active", false)
            .classed("inactive", true);
            incomeLabel
            .classed("active", true)
            .classed("inactive", false);
            ageLabel
            .classed("active", false)
            .classed("inactive", true); 
        }
        else {
            povertyLabel
            .classed("active", false)
            .classed("inactive", true);
            incomeLabel
            .classed("active", false)
            .classed("inactive", true);
            ageLabel
            .classed("active", true)
            .classed("inactive", false); 
        }
      }
    });

  // y axis labels event listener
  ylabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

      // replaces chosenYAxis with value
      chosenYAxis = value;

      console.log(chosenYAxis)

      // functions here found above csv import
      // updates y scale for new data
      yLinearScale = yScale(data, chosenYAxis);

      // updates y axis with transition
      yAxis = renderyAxes(yLinearScale, yAxis);

      // updates circles with new y values
      circles = render_y_Circles(circles, yLinearScale, chosenYAxis);

      d3.selectAll(".state_code")
                  .transition()
                  .duration(1000)
                  .attr("x", d => xLinearScale(d[chosenXAxis]))
                  .attr("y", d => yLinearScale(d[chosenYAxis]));

      // updates tooltips with new info
      circles = updateToolTip(chosenXAxis, chosenYAxis, circles);

      // changes classes to change bold text
      if (chosenYAxis === "healthcare") {
          healthcareLabel
          .classed("active", true)
          .classed("inactive", false);
          smokesLabel
          .classed("active", false)
          .classed("inactive", true);
          obesityLabel
          .classed("active", false)
          .classed("inactive", true);            
      }
      else if (chosenYAxis === "smokes") {
        healthcareLabel
        .classed("active", false)
        .classed("inactive", true);
        smokesLabel
        .classed("active", true)
        .classed("inactive", false);
        obesityLabel
        .classed("active", false)
        .classed("inactive", true); 
      }
      else {
        healthcareLabel
        .classed("active", false)
        .classed("inactive", true);
        smokesLabel
        .classed("active", false)
        .classed("inactive", true);
        obesityLabel
        .classed("active", true)
        .classed("inactive", false); 
      }
    }
  });
});