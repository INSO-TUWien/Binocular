'use strict';

import React from 'react';
import * as d3 from 'd3';


// set the dimensions and margins of the graph
var margin = { top: 20, right: 30, bottom: 0, left: 10 },
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.csv("../../../../assets/mockdata.csv", function (data) {

    // List of groups = header of the csv files
    var keys = Object.keys(data).slice(1)

    // Add X axis
    var x = d3.scaleLinear()
        .domain(d3.extent(Object.values(data), function (d) { return d.date; }))
        .range([100, width - 100]);
    svg.append("g")
        .attr("transform", "translate(0," + height * 0.8 + ")")
        .call(d3.axisBottom(x).tickSize(-height * .7).tickValues([2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010,
            2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018]))
        .select(".domain").remove()
    // Customization
    svg.selectAll(".tick line").attr("stroke", "#b8b8b8")

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height - 30)
        .text("Time (year)");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([-500, 400])
        .range([height, 0]);

    // color palette
    var color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeSpectral[10]); //Color Change here

    //LEGEND AQUI
    // Add one dot in the legend for each name.
    svg.selectAll("mydots")
        .data(keys)
        .enter()
        .append("circle")
        .attr("cx", 10)
        .attr("cy", function (d, i) { return 100 + i * 25 }) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", function (d) { return color(d) })

    // Add names for the legend.
    svg.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
        .attr("x", 30)
        .attr("y", function (d, i) { return 100 + i * 25 }) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function (d) { return color(d) })
        .text(function (d) { return d })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")

    //stack the data?
    var stackedData = d3.stack()
        .offset(d3.stackOffsetSilhouette)
        .keys(keys)
        (Object.values(data))

    // create a tooltip
    var Tooltip = svg
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .style("opacity", 0)
        .style("font-size", 17)

    // Three functions that change the tooltip when user hover / move / leave a cell
    var mouseover = function (d) {
        Tooltip.style("opacity", 1)
        d3.selectAll(".myArea").style("opacity", .2)
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)
    }

    var mousemove = function (d, i) {
        mousex = d3.mouse(this);
        mousex = mousex[0];
        var invertedx = x.invert(mousex);
        year = Math.floor(invertedx)
        result = recursiveFunction(Object.values(data), year, 0, data.length)
        //dmp = data[(year - 2000)] //CHANGE ME ---- I AM CHEATING HERE
        //var result = Object.keys(dmp).map((key) => [String(key), dmp[key]]);
        for (let index = 0; index < result.length; index++) {
            if (result[index][0] === keys[i]) {
                yVal = parseInt(result[index][1], 10)
            }
        }
        Tooltip.text("Value of " + keys[i] + " in " + year + " is: " + yVal)

        /* --------------------------- White Vertical Line Here --------------
        svg.append("line")
          .attr("x1", mousex)
          .attr("y1", 0)
          .attr("x2", mousex)
          .attr("y2", height - margin.top - margin.bottom)
          .style("stroke-width", 2)
          .style("stroke", "white")
          .style("fill", "none");
          */
    }

    //Binary Search Here
    let recursiveFunction = function (arr, x, start, end) {

        // Base Condition
        if (start > end) return false;

        // Find the middle index
        let mid = Math.floor((start + end) / 2);

        //Make Data accessible
        dmp = arr[mid]
        objectArray = Object.keys(dmp).map((key) => [String(key), dmp[key]]);
        value = parseInt(objectArray[0][1], 10);

        // Compare value at mid with given key x
        if (value === x) return objectArray;

        // If element at mid is greater than x,
        // search in the left half of mid
        if (value > x)
            return recursiveFunction(arr, x, start, mid - 1);
        else

            // If element at mid is smaller than x,
            // search in the right half of mid
            return recursiveFunction(arr, x, mid + 1, end);
    }

    var mouseleave = function (d) {
        Tooltip.style("opacity", 0)
        d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
        //d3.selectAll("line").style("opacity", 1).style("stroke", "none")
    }

    var mouseclick = function (d, i) {
        mousex = d3.mouse(this);
        mousex = mousex[0];
        var invertedx = x.invert(mousex);
        year = Math.floor(invertedx)
        dmp = data[(year - 2000)] //CHANGE ME ---- I AM CHEATING HERE
        var result = Object.keys(dmp).map((key) => [String(key), dmp[key]]);
        for (let index = 0; index < result.length; index++) {
            if (result[index][0] === keys[i]) {
                yVal = parseInt(result[index][1], 10)
            }
        }
        Tooltip.text("Value of " + keys[i] + " in " + year + " is: " + yVal)
    }

    // Area generator
    var area = d3.area()
        .x(function (d) { return x(d.data.date); })
        .y0(function (d) { return y(d[0]); })
        .y1(function (d) { return y(d[1]); })

    // Show the areas
    svg
        .selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
        .attr("class", "myArea")
        .style("fill", function (d) { return color(d.key); })
        .attr("d", area)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .on("click", mouseclick)

})