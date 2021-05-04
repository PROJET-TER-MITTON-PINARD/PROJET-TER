import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as d3Scale from 'd3';
import * as d3Array from 'd3';
import * as d3Axis from 'd3';
import { DataService } from '../data.service';
import { roundDecimal } from 'src/tools';

@Component({
  selector: 'app-booleantimeline',
  templateUrl: './booleantimeline.component.html',
  styleUrls: ['./booleantimeline.component.scss']
})
export class BooleantimelineComponent implements OnInit {

  public title = 'Boolean timeline';
  data: any[] = this.DataServ.parse<number>(this.DataServ.str, "PC6", this.parseBool);
  parseBool(s: string){
    if(s=="ON") return 1;
    else if (s=="OFF") return 0;
    else return -1;
  }
  private margin = { top: 20, right: 20, bottom: 30, left: 50 };
  private width: number = 0;
  private height: number = 0;
  private x: any;
  private y: any;
  private svg: any;
  private line: d3.Line<[number, number]>; // this is line defination

  private tooltip: any;
  constructor(private DataServ: DataService) {
    this.line = d3.line()
      .x((d: any) => this.x(d.timestamp))
      .y((d: any) => this.y(d.value));
  }
  public ngOnInit(): void {
    var timeline = (<SVGSVGElement><unknown>document.getElementById("booleantimeline"));
    if (timeline != null) {
      var w = timeline.width.animVal.value;
      var h = timeline.height.animVal.value;
      this.width = (w - this.margin.left) - this.margin.right;
      this.height = (h - this.margin.top) - this.margin.bottom;
    }
    this.buildData();
    this.buildSvg();
    this.addXandYAxis();
    this.drawLineAndPath();
    this.tooltip = this.addToolTips();
    
  }
  private buildData(){
    this.data.forEach((element, index) =>
      this.data.push({

        timestamp: element.timestamp -1,

        value: (1+element.value)%2,

        sensorId: element.sensorId

    }))
    this.data.sort(function(a: any, b: any){
      return a.timestamp-b.timestamp;
    });
    console.log(this.data);
  }
  private buildSvg() {
    this.svg = d3.select('#booleantimeline')
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
      d3.select("#booleantimeline").on("mousemove", (event: any, d: any) => this.showInfo(event, d))
      .on("mouseleave", (event: any, d: any) => this.hideInfo(event, d));
  }
  private addXandYAxis() {
    // range of data configuring
    this.x = d3Scale.scaleTime().range([0, this.width]);
    this.y = d3Scale.scaleOrdinal().range([this.height, 0]);
    this.x.domain(d3Array.extent(this.data, (d) => d.timestamp));
    this.y.domain(d3Array.extent([0,1]));
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
      .style('stroke', 'red')
      .style('stroke-width', '2px');
  }

  private addToolTips() {
    console.log(this.svg);
    var tooltip = this.svg.append("g")
        .attr("id", "tooltip2")
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
        .attr("points","0,0 0,40 55,40 60,45 65,40 120,40 120,0 0,0")
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
        .attr("id", "tooltip-date2");
    
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
        .attr("id", "tooltip-value2")
        .style("font-weight", "bold");
    
    return tooltip;
  }

  private showInfo(event: any, d: any) {
    var time: number[]=[];
    for (var objet in this.data) {
      time.push(this.data[objet].timestamp);
     }
      this.tooltip.style("display","block");
      this.tooltip.style("opacity",100);
      var x0 = this.x.invert(event.clientX).getTime();
      var i = d3.bisectRight(time, x0);
      var d = this.data[i].value;
      var t = this.data[i].timestamp;
      this.tooltip.attr("transform", "translate(" + this.x(t) + "," + this.y(d) + ")");
      d3.select('#tooltip-date2')
        .text(t);
      d3.select('#tooltip-value2')
        .text(roundDecimal(d,3));
    
    }
    

  private hideInfo(event: any, d: any) {
    this.tooltip.style("opacity", 0);
    this.tooltip.style("display", "none");
  }

}
