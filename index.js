var boid_group =[];
var color = d3.scale.category20();

function rdata2tabr(index,rdata) {
	var b = $("<tr>")
        .attr("bgcolor",color(parseInt(index,10)));
	b.append($("<th>")
		.attr("bgcolor",color(parseInt(index,10))).text(index));
	b.append($("<td>").append(
		$("<input>").attr("type","text")
			.attr("value",rdata.gname)));
	var l=["num","vision","minsepr","maxsepd","maxalid","maxcohd"];
	for (var i=0;i<l.length;i++) {
		b.append($("<td>").append(
			$("<input>").attr("type","text")
				.attr("size","3").attr("value",rdata[l[i]])));
	}
	b.append($("<td>").append(
		$("<input>").attr("type","button")
			.attr("value","DELETE")
			.attr("class","delrows")));
	return b;
}

function row2rdata(row){
	var rdata = {};
	rdata.gname=row.cells[1].firstChild.value;
	rdata.num=parseInt(row.cells[2].firstChild.value,10);
	rdata.vision=parseFloat(row.cells[3].firstChild.value,10);
	rdata.minsepr=parseFloat(row.cells[4].firstChild.value);
	rdata.maxsepd=parseFloat(row.cells[5].firstChild.value);
	rdata.maxalid=parseFloat(row.cells[6].firstChild.value);
	rdata.maxcohd=parseFloat(row.cells[7].firstChild.value);
	return rdata;
}

function sync2rdata(){
	boid_group=[];
	$("#id20140613 tbody tr").each(function(i,x) {
		boid_group.push(row2rdata(x));
	});
}

function initialize(ev) {
	boid_group =[ 
		{gname:"a",num:50,vision:24,minsepr:8,maxsepd:2,maxalid:5,maxcohd:3},
		{gname:"b",num:50,vision:24,minsepr:12,maxsepd:2,maxalid:5,maxcohd:3},
		{gname:"c",num:50,vision:24,minsepr:16,maxsepd:2,maxalid:5,maxcohd:3}];
	var divarea = $("#id20140613");
	$("tbody",divarea).remove();
	var x = $("<tbody>");
	for (var i=0;i<boid_group.length;i++) 
		x.append( rdata2tabr(i,boid_group[i]) );
	divarea.append(x);
	divarea.on("click",".delrows",function () {
		$(this).parent().parent().remove();
		$("tbody tr th",divarea)
			.attr("bgcolor",function(i) {return color(i);})
			.text(function(i,d) {return i;});
		sync2rdata();
	});
}

function group_add(ev) {
	var defrdata={gname:" ",num:10,vision:40,minsepr:4,maxsepd:2,maxalid:5,maxcohd:3};
	$("#id20140613 tbody").append(rdata2tabr($("#id20140613 tbody tr").length,defrdata));
	sync2rdata();
}

var width = 600, height = 600;
var degrees = 180 / Math.PI;
var nd,cir;
var timer_ret_val = true;

function initialize_sim() {
	sync2rdata();
	nd =[];
	function create_ndone(id,n) {
		return d3.range(n).map(function() {
			return {grp:id,
			x:Math.random() * width,y:Math.random() * height,
			nb:[],
			deg:Math.random() * 360};
		});
	}
	for(i=0;i<boid_group.length;i++) {
		subg =create_ndone(i,boid_group[i].num);
		nd = nd.concat(subg);
	}
}

function start_simulate(ev) {
	timer_ret_val = true;
	d3.timer.flush();

	initialize_sim();
	$("#id20140614 svg").remove();

	var svg = d3.select("#id20140614").append("svg")
		.attr("width", width).attr("height", height);

	var g = svg.selectAll("g").data(nd).enter().append("g");

	cir = g.append("ellipse")
		.attr("fill",function(d) {return color(d.grp);})
		.attr("rx",8).attr("ry",4);

	continue_simulate(ev);
}

function continue_simulate(ev) {
	if ( timer_ret_val ) {
		timer_ret_val = false;
		d3.timer(function() {
			for (i=0;i<nd.length;i++) {
				for (j = i+1;j<nd.length;j++) {
					d = Math.sqrt(Math.pow(diffCyclic(nd[i].x,nd[j].x,width),2) + Math.pow(diffCyclic(nd[i].y,nd[j].y,height),2));
					if (d < boid_group[nd[i].grp].vision )
						nd[i].nb.push({dist:d,deg:nd[j].deg,x:nd[j].x, y:nd[j].y});
					if (d < boid_group[nd[j].grp].vision )
						nd[j].nb.push({dist:d,deg:nd[i].deg,x:nd[i].x, y:nd[i].y});
				}
			}
			function sort_func(a,b){
				return a.dist - b.dist;
			}
			for (i=0;i<nd.length;i++) {
				var a = nd[i];
				a.nb.sort(sort_func);
				var dd = 0,da = 0,dc = 0;
				if ( a.nb.length > 0 ) {
					if ( a.nb[0].dist < boid_group[a.grp].minsepr ) {  // separate rule
						dd = diffCyclic(180+a.nb[0].deg,a.deg,360);
						dd = compDegree(boid_group[a.grp].maxsepd,dd);
					} else {
						var ax = 0,ay = 0,cx = 0,cy = 0;
						for (j=0;j<a.nb.length;j++) {
							ax += Math.cos(a.nb[j].deg/degrees);
							ay += Math.sin(a.nb[j].deg/degrees);
							cx += diffCyclic(a.nb[j].x,a.x,width);
							cy += diffCyclic(a.nb[j].y,a.y,height);
						}
						da = diffCyclic(Math.atan2(ay,ax)*degrees,a.deg,360);  // align rule
						da = compDegree(boid_group[a.grp].maxalid,da);

						dc = diffCyclic(Math.atan2(cy,cx)*degrees,a.deg,360);  // cohere rule
						dc = compDegree(boid_group[a.grp].maxcohd,dc);
						dd = ( da + dc ) % 360;
					}
				} 
				nodeMove(nd[i],2,dd);
				a.nb=[];
			}
			cir.attr("transform",function(d) {
				return "translate(" + d.x + "," + d.y + ")rotate(" + d.deg + ")"; 
			});
			return timer_ret_val;
		});
	} else timer_ret_val = true;
}

function nodeMove(n,speed,dd) {
	n.deg = (n.deg + dd ) % 360;
	n.x += speed * Math.cos(n.deg/degrees);
	n.y += speed * Math.sin(n.deg/degrees);
	if (n.x < 0 || n.x > width) n.x = (width + n.x) % width;
	if (n.y < 0 || n.y > height) n.y = (height + n.y) % height;
}

function diffCyclic(deg1,deg2,period) {
	var deg = (deg1 - deg2) % period;
	if ( Math.abs(deg) <= period/2 ) return deg;
	else {
		if ( deg > 0 ) return -period + deg;
		else return period + deg;
	}
}

function compDegree(maxd,deg) {
	if (Math.abs(deg) < maxd) return deg;
	else {
		if (deg > 0 ) return maxd;
		else return -maxd;
	}
}
