---
layout: post
title: d3 in Jekyll Example
category: programming
tags: 
  - github
  - "github-pages"
  - jekyll
published: true
---

<div id='convas'></div>
<script type="text/javascript" src="http://d3js.org/d3.v3.min.js"></script>
<script type="text/javascript">
var width = 960,
    height = 500,
    angle = 2 * Math.PI,
    T=0.0,
    speed = 0.1,
    S=0.0,
    I=0.0001;

var data = d3.range(100).map(function(i) {
  return {xloc: i/10-5, yloc: Math.max(0.0001,I), xvel: 0, yvel: 0};
});

var color = d3.scale.linear()
    .domain([-0.0005, 0, 0.0005])
    .range(["#a50026", "#ffffbf", "#006837"]);
    /*.range(["red", "yellow", "green"]);*/
    /*.range(["#a50026", "#ffffbf", "#006837"])*/

var x = d3.scale.linear()
    .domain([-5, 5])
    .range([0, width]);

var y = d3.scale.linear()
    .domain([-5, 5])
    .range([0, height]);

var time0 = Date.now(),
    time1;

var fps = d3.select("#fps span");

var canvas = d3.select("div#convas").append("canvas")
    .attr("width", width)
    .attr("height", height);

var context = canvas.node().getContext("2d");

context.strokeStyle = "#aaa";
context.strokeWidth = 1.5;

d3.timer(function() {
  context.clearRect(0, 0, width, height); /* clear the canvas (1-Math.pow(2.7,-Math.pow((d.xloc-T),2)/10))*d.yloc*/
 context.fillStyle = "steelblue";
    
  data.forEach(function(d) {
    /*d.xloc += d.xvel;*/
    S =  d3.sum(data, function(d) { return d.yloc; });
    M =  d3.max(data, function(d) { return d.yloc; });
    T += 0.01 * (Math.random() - 0.5)  - 0.000001 * (T+2);
    d.yvel=1*(1-S+I*100/0.05)*(Math.pow(2.7,-Math.pow((d.xloc-T),2)/4))-0.05;
    d.yloc += d.yvel*d.yloc+I;
    context.beginPath();
    context.rect(x(d.xloc), height-10, 10, -y(d.yloc-5)*8/M);
    context.fillStyle = color(d.yvel*d.yloc+I); 
    context.fill();
    context.stroke();
  });
    context.beginPath();
    context.rect(x(T), height-10, 10, 20);
    context.fillStyle = "red";
    context.fill();
    context.stroke(); 
  time1 = Date.now();
  fps.text(T);
  time0 = time1;
});
</script>