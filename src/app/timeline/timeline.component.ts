import { Component, OnInit,Input, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import * as d3Scale from 'd3';
import * as d3Array from 'd3';
import * as d3Axis from 'd3';
import { DataService } from '../data.service';
import { roundDecimal } from 'src/tools';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})

  

export class TimelineComponent implements OnInit {
  
  @Input() type: string = "";
  @Input() maxValue: string = "30";
  @Input() color: string = "red";
  @Input() color2: string = "blue";
  @Input() nom: string = "";
  @Input() nom2: string = "";

  public title = 'Line Chart temp cuisine';
  public id: string ="";
  
  /* [{timestamp : 1415365, value : 15}, {timestamp : 1415369, value : 20}]; */
  /*this.DataServ.parse<number>(this.DataServ.str, "Noise_salon", parseFloat)*/
  
  private margin = { top: 20, right: 20, bottom: 30, left: 50 };
  private width: number = 900;
  private height: number = 200;
  private x: any;
  private y: any;
  private svg: any;
  private line: d3.Line<[number, number]>; // this is line defination
  private line2: d3.Line<[number, number]>;
  private data: any[] = [];
  private data2: any[] = [];
  private tooltip: any;
  
  constructor(private DataServ: DataService) {
    this.line = d3.line()
      .x((d: any) => this.x(d.timestamp))
      .y((d: any) => this.y(d.value));
    
      this.line2 = d3.line()
       .x((d: any) => this.x(d.timestamp))
      .y((d: any) => this.y(d.value));
    
  }

 
  public ngOnInit(): void {
    
    this.data = this.DataServ.parse<number>(this.DataServ.str, this.nom, parseFloat);
    if (this.type == "multi" && this.nom2 != "") {
      this.data2 = this.DataServ.parse<number>(this.DataServ.str, this.nom2, parseFloat);
    }
    this.id = this.type + Math.floor(Math.random() * 100).toString();
    console.log(this.id);
  }

  public ngAfterViewInit() {
    var timeline = (<SVGSVGElement><unknown>document.getElementById(this.id));
    console.log(timeline);
    if (timeline != null) {
      var w = timeline.width.animVal.value;
      var h = timeline.height.animVal.value;
      this.width = (w - this.margin.left) - this.margin.right;
      this.height = (h - this.margin.top) - this.margin.bottom;
    }
    this.callType();
  }

  private callType() {
    if (this.type == "fix") {
      this.buildFixe();
    }
    if (this.type == "scaled") {
      this.buildScaled();
    }
    if (this.type == "multi") {
      this.buildMulti();
    }
  }
  
  private buildScaled() {
    console.log('#' + this.id);
    this.svg = d3.select('#'+this.id)
    .append('g')
    .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
    d3.select('#'+this.id).on("mousemove", (event: any, d: any) => this.showInfo(event, d))
      .on("mouseleave", (event: any, d: any) => this.hideInfo(event, d));
     // range of data configuring
     this.x = d3Scale.scaleTime().range([0, this.width]);
     this.y = d3Scale.scaleLinear().range([this.height, 0]);
     this.x.domain(d3Array.extent(this.data, (d) => d.timestamp));
     this.y.domain(d3Array.extent(this.data, (d) => d.value));
     // Configure the X Axis
     this.svg.append('g')
       .attr('transform', 'translate(0,' + this.height + ')')
       .call(d3Axis.axisBottom(this.x));
     // Configure the Y Axis
     this.svg.append('g')
       .attr('class', 'axis axis--y')
       .call(d3Axis.axisLeft(this.y));
       this.svg.append('path')
       .datum(this.data)
       .attr('class', 'line')
       .attr('d', this.line)
       .style('fill', 'none')
       .style('stroke', this.color)
         .style('stroke-width', '2px');
         this.tooltip = this.addToolTips();
  }

  private buildMulti() {
    this.svg = d3.select('#'+this.id)
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
    // range of data configuring
    this.x = d3Scale.scaleTime().range([0, this.width]);
    this.y = d3Scale.scaleLinear().range([this.height, 0]);
    this.x.domain(d3Array.extent(this.isMaxScaleX(), (d) => d.timestamp));
    this.y.domain([this.isMinScaleY(),this.isMaxScaleY()]);
    // Configure the X Axis
    this.svg.append('g')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x));
    // Configure the Y Axis
    this.svg.append('g')
      .attr('class', 'axis axis--y')
      .call(d3Axis.axisLeft(this.y));
     // Configuring line path
     this.svg.append('path')
     .datum(this.data)
     .attr('class', 'line')
     .attr('d', this.line)
     .style('fill', 'none')
     .style('stroke', this.color)
     .style('stroke-width', '2px');
     this.svg.append('path')
     .datum(this.data2)
     .attr('class', 'line')
     .attr('d', this.line2)
     .style('fill', 'none')
     .style('stroke', this.color2)
     .style('stroke-width', '2px');
  }

  private buildFixe() {
    console.log('#' + this.id);
    this.svg = d3.select('#'+this.id)
    .append('g')
    .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
    d3.select('#'+this.id).on("mousemove", (event: any, d: any) => this.showInfo(event, d))
      .on("mouseleave", (event: any, d: any) => this.hideInfo(event, d));
     // range of data configuring
     this.x = d3Scale.scaleTime().range([0, this.width]);
     this.y = d3Scale.scaleLinear().range([this.height, 0]);
     this.x.domain(d3Array.extent(this.data, (d) => d.timestamp));
     this.y.domain(d3Array.extent([parseInt(this.maxValue),0]));
     // Configure the X Axis
     this.svg.append('g')
       .attr('transform', 'translate(0,' + this.height + ')')
       .call(d3Axis.axisBottom(this.x));
     // Configure the Y Axis
     this.svg.append('g')
       .attr('class', 'axis axis--y')
       .call(d3Axis.axisLeft(this.y));
       this.svg.append('path')
       .datum(this.data)
       .attr('class', 'line')
       .attr('d', this.line)
       .style('fill', 'none')
       .style('stroke', this.color)
         .style('stroke-width', '2px');
         this.tooltip = this.addToolTips();
  }

  private addToolTips() {
    var tooltip = this.svg.append("g")
        .attr("id", "tooltip"+this.id)
        .style("display", "none");
    
    // Le cercle extérieur bleu clair
    tooltip.append("circle")
        .attr("fill", "#CCE5F6")
        .attr("r", 10);

    // Le cercle intérieur bleu foncé
    tooltip.append("circle")
        .attr("fill", "#3498db")
        .attr("stroke", "#fff")
        .attr("stroke-width", "1.5px")
        .attr("r", 4);
    
    // Le tooltip en lui-même avec sa pointe vers le bas
    // Il faut le dimensionner en fonction du contenu
    tooltip.append("polyline")
        .attr("points","0,0 0,40, 55,40, 60,45 65,40 120,40 120,0 0,0")
        .style("fill", "#fafafa")
        .style("stroke","#3498db")
        .style("opacity","0.9")
        .style("stroke-width","1")
        .attr("transform", "translate(-60, -55)");
    
    // Cet élément contiendra tout notre texte
    var text = tooltip.append("text")
        .style("font-size", "13px")
        .style("font-family", "Segoe UI")
        .style("color", "#333333")
        .style("fill", "#333333")
        .attr("transform", "translate(-50, -40)");
    
    // Element pour la date avec positionnement spécifique
    text.append("tspan")
        .attr("dx", "-5")
        .attr("id", "tooltip-date"+this.id);
    
    // Positionnement spécifique pour le petit rond	bleu
    text.append("tspan")
        .style("fill", "#3498db")
        .attr("dx", "-60")
        .attr("dy", "15")
        .text("●");
    
    // Le texte "Cours : "
    text.append("tspan")
        .attr("dx", "5")
        .text("Value : ");
    
    // Le texte pour la valeur de l'or à la date sélectionnée
    text.append("tspan")
        .attr("id", "tooltip-value"+this.id)
        .style("font-weight", "bold");
    
    return tooltip;
  }

  private showInfo(event: any, d: any) {
    console.log(this.id);
    var time: number[]=[];
    for (var objet in this.data) {
      time.push(this.data[objet].timestamp);
     }
      this.tooltip.style("display","block");
      this.tooltip.style("opacity",100);
      var x0 = this.x.invert(event.clientX-this.margin.left).getTime();
      var i = d3.bisectRight(time, x0);
      var d = this.data[i].value;
      var t = this.data[i].timestamp;
      this.tooltip.attr("transform", "translate(" + this.x(t) + "," + this.y(d) + ")");
      d3.select('#tooltip-date'+this.id)
        .text(t);
      d3.select('#tooltip-value'+this.id)
        .text(roundDecimal(d,3));
    
    }
    

  private hideInfo(event: any, d: any) {
    this.tooltip.style("opacity", 0);
    this.tooltip.style("display", "none");
  }

  private isMinScaleY() {
    var v1:number[] = [];
    for (var i = 0; i < this.data.length; i++){
      v1.push(this.data[i].value);
    }
    console.log(v1);
    var v2: number[] = [];
    for (var i = 0; i < this.data2.length; i++){
      v2.push(this.data2[i].value);
    }
    console.log(v2);
    var m1 = Math.min(...v1);
    var m2 = Math.min(...v2);
    if (m1 > m2) {
      return m2;
    }
    else {
      return m1;
    }
  }

  private isMaxScaleY() {
    var v1:number[] = [];
    for (var i = 0; i < this.data.length; i++){
      v1.push(this.data[i].value);
    }
    console.log(v1);
    var v2: number[] = [];
    for (var i = 0; i < this.data2.length; i++){
      v2.push(this.data2[i].value);
    }
    console.log(v2);
    var m1 = Math.max(...v1);
    var m2 = Math.max(...v2);
    if (m1 > m2) {
      return m1;
    }
    else {
      return m2;
    }
  }


  private isMaxScaleX() {
    var l1 = this.data.length;
    var l2 = this.data2.length;
    if (l1 > l2) {
      return this.data;
    }
    else {
      return this.data2;
    }
  }
  
  
}

/**    l'ancien code de construction du svg
 * private buildSvg() {
    this.svg = d3.select('svg')
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
      d3.select("svg").on("mousemove", (event: any, d: any) => this.showInfo(event, d))
      .on("mouseleave", (event: any, d: any) => this.hideInfo(event, d));
  }
  private addXandYAxis() {
    // range of data configuring
    this.x = d3Scale.scaleTime().range([0, this.width]);
    this.y = d3Scale.scaleLinear().range([this.height, 0]);
    this.x.domain(d3Array.extent(this.data, (d) => d.timestamp));
    this.y.domain(d3Array.extent(this.data, (d) => d.value));
    // Configure the X Axis
    this.svg.append('g')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x));
    // Configure the Y Axis
    this.svg.append('g')
      .attr('class', 'axis axis--y')
      .call(d3Axis.axisLeft(this.y));
  }

  private drawLineAndPath() {
    this.svg.append('path')
      .datum(this.data)
      .attr('class', 'line')
      .attr('d', this.line)
      .style('fill', 'none')
      .style('stroke', this.color)
      .style('stroke-width', '2px');
  }

 */