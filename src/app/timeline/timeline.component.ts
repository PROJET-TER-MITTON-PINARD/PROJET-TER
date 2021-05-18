import { Component, OnInit,Input, AfterViewInit, ViewChild, ElementRef, SimpleChanges, } from '@angular/core';
import * as d3 from 'd3';
import * as d3Scale from 'd3';
import * as d3Array from 'd3';
import * as d3Axis from 'd3';
import { DataService } from '../data.service';
import { roundDecimal } from 'src/tools';

export interface Data {
  label: string;
  values: [number,number][];
  color: string;
  interpolation: "linear" | "step";
}

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})

  

export class TimelineComponent implements OnInit {
  
  @Input() data!: Data[];
  @ViewChild('root') timeline!: ElementRef;


  public title = 'Line Chart';
  public id: string ="";
  
  private margin = { top: 20, right: 20, bottom: 30, left: 50 }; //marge interne au svg 
  private dataZoom: Data[] = [];
  private idZoom: number = 0;
  private minTime: number = 0;
  private maxTime: number = 0;
  private lengthTime: number = 0;
  private width: number = 0;
  private height: number = 0;
  private x:any;
  private y: any;
  private svg: any;
  private line: d3.Line<[number, number]>[] = []; // this is line defination
  private tooltip: any;
  private first:boolean = true;
  private lastDatalength:number = 0;

  
  constructor(private DataServ: DataService) {
    
  }

 
  public ngOnInit(): void {
    this.dataZoom = [...this.data];
    this.lastDatalength=this.dataZoom.length;
  }

  public ngAfterViewInit() {
    if (this.timeline != undefined) {
      var w = this.timeline.nativeElement.width.animVal.value;
      var h = this.timeline.nativeElement.height.animVal.value;
      this.width = (w - this.margin.left) - this.margin.right;
      this.height = (h - this.margin.top) - this.margin.bottom;
    }
    this.data.forEach(
      (_element, index) => {
        if (this.data[index].interpolation == "step") {
          this.line[index]=d3.area()
          .x((d: any) => this.x(d[0]))
          .y0(this.height)
          .y1((d: any) => this.y(d[1]))
          .curve(d3.curveStepAfter);
        }else{
          this.line[index]=d3.area()
          .x((d: any) => this.x(d[0]))
          .y0(this.height)
          .y1((d: any) => this.y(d[1]))
        }
    })
    this.buildZoom();
    this.buildFix();
    this.addXandYAxis(this.minTime,this.maxTime);
    this.drawLineAndPath();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.data) {
      this.updateChart();
    }
  }
  private buildFix() { // creer une timeline avec une seul donnée
    this.svg = d3.select(this.timeline.nativeElement)
    .append('g')
    .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
    
    d3.select(this.timeline.nativeElement).on("mousemove", (event: any) => this.showInfo(event))
      .on("mouseleave", () => this.hideInfo())
    .on("DOMMouseScroll", (event: any) => this.zoom(event));
  }

  private addXandYAxis(min: number, max: number) {
    this.x = d3Scale.scaleTime().range([0, this.width]);
    this.y = d3Scale.scaleLinear().range([this.height, 0]);
    this.x.domain(d3Array.extent([min,max]));
    this.y.domain(d3Array.extent([this.isMinScaleY(this.data),this.isMaxScaleY(this.data)]));
    // Configure the X Axis
    this.svg.append('g')
      .attr('transform', 'translate(0,' + this.height + ')')
      .attr('class', 'xAxis')
      .call(d3Axis.axisBottom(this.x));
    // Configure the Y Axis
    this.svg.append('g')
      .attr('class', 'yAxis')
      .call(d3Axis.axisLeft(this.y));
  }

  private drawLineAndPath(){

    this.dataZoom.forEach(
      (element,index) => this.svg.append('path')
        .datum(this.dataZoom[index].values)
        .attr('class', 'line'+index)
        .attr('d', this.line[index])
        .attr("stroke-width", 0.1)
        .attr('opacity', 0.5)
        .style('fill', element.color)
        .style('stroke', element.color)
        .style('stroke-width', '2px')
    )
    this.addToolTips();
  }
  
  private updateChart(){
    if(this.first==false){
      this.dataZoom = [...this.data];
      this.data.forEach(
        (_element,index) => {
          if(this.data[index].interpolation=="step"){
            this.line[index]=d3.area()
            .x((d: any) => this.x(d[0]))
            .y0(this.height)
            .y1((d: any) => this.y(d[1]))
            .curve(d3.curveStepAfter);
          }else{
            this.line[index]=d3.area()
            .x((d: any) => this.x(d[0]))
            .y0(this.height)
            .y1((d: any) => this.y(d[1]))
          }
      })
      this.buildZoom();
      this.x.domain(d3Array.extent([this.minTime,this.maxTime]));
      this.y.domain(d3Array.extent([this.isMinScaleY(this.data),this.isMaxScaleY(this.data)]));
      this.svg.selectAll('.yAxis').call(d3.axisLeft(this.y));
      this.svg.selectAll('.xAxis').call(d3.axisBottom(this.x));
      let lineUpdate;
      this.dataZoom.forEach((_element,index) => {
        lineUpdate= this.svg.selectAll('.line'+index).data([this.dataZoom[index].values]);
        lineUpdate
        .enter()
        .append("path")
        .attr('class', 'line'+index)
        .merge(lineUpdate)
        .attr('d', this.line[index])
        .attr("stroke-width", 0.1)
          .attr('opacity', 0.5)
        .style('fill', _element.color)
        .style('stroke', _element.color)
        .style('stroke-width', '2px')
      });
      for(let index=this.dataZoom.length; index<this.lastDatalength; index++){
        this.svg.selectAll('.line'+index).remove();
      }
      this.idZoom=0;
      this.lastDatalength=this.dataZoom.length;
    }else{
      this.first=false;
    }
    
    this.updateToolTips();
  }

  private updateSvg(min: number, max: number){
    this.x.domain(d3Array.extent([min,max]));
    this.y.domain(d3Array.extent([this.isMinScaleY(this.dataZoom),this.isMaxScaleY(this.dataZoom)]));
    this.svg.selectAll('.yAxis').call(d3.axisLeft(this.y));
    this.svg.selectAll('.xAxis').call(d3.axisBottom(this.x));
    let lineUpdate;
    this.dataZoom.forEach((_element,index) => {
      lineUpdate= this.svg.selectAll('.line'+index).data([this.dataZoom[index].values]);
      lineUpdate
      .enter()
      .append("path")
      .attr('class', 'line'+index)
      .merge(lineUpdate)
      .attr('d', this.line[index])
      .attr("stroke-width", 0.1)
      .attr('opacity', 0.5)
      .style('fill', _element.color)
      .style('stroke', _element.color)
      .style('stroke-width', '2px')
    });
  }
  
  private buildZoom(){
    this.minTime = this.isMinScaleX(this.data);
    this.maxTime = this.isMaxScaleX(this.data);
    this.lengthTime = this.maxTime - this.minTime;
  }


  private updateToolTips() {
    let taille = this.dataZoom.length;
    this.tooltip.remove("polyline");
    this.addToolTips();
  }

  private addToolTips() { //creer le tooltips
    this.tooltip = this.svg.append("g")
        .attr("id", "tooltip")
        .style("display", "none");
    
    // Le cercle extérieur bleu clair
    this.tooltip.append("circle")
        .attr("fill", "#CCE5F6")
        .attr("r", 10);

    // Le cercle intérieur bleu foncé
    this.tooltip.append("circle")
        .attr("fill", "#3498db")
        .attr("stroke", "#fff")
        .attr("stroke-width", "1.5px")
        .attr("r", 4);
    
    // Le tooltip en lui-même avec sa pointe vers le bas
    // Il faut le dimensionner en fonction du contenu
    let taille = this.dataZoom.length;
    this.tooltip.append("polyline")
      .attr("points", "0,0 0," + (40 * taille)+", 75," + (40 * taille)+", 80," + (45 * taille)+" 85," + (40 * taille)+" 160," + (40 * taille)+" 160,0 0,0")
        .style("fill", "#fafafa")
        .style("stroke","#3498db")
        .style("opacity","0.9")
        .style("stroke-width","1")
        .attr("transform", "translate(-80, "+(-50*taille)+")");
  
    this.dataZoom.forEach((element,index) => {
      // Cet élément contiendra tout notre texte
      let text = this.tooltip.append("text")
        .style("font-size", "13px")
        .style("font-family", "Segoe UI")
        .style("color", element.color)
        .style("fill", element.color)
        .attr("transform", "translate(-80,"+(-42*(index+1))+")");
    
      // Element pour la date avec positionnement spécifique
      text.append("tspan")
        .attr("dx", "7")
        .attr("dy", "5")
        .attr("id", "tooltip-date1" + index);
    
        text.append("tspan")
        .attr("dx", "-90")
        .attr("dy", "15")
        .attr("id", "tooltip-date2"+index);
    });
  }

  private showInfo(event: any) { // fonction qui affiche le tooltips
    let time: number[] = [];
    this.dataZoom[0].values.forEach((element) => time.push(element[0]));
    this.tooltip.style("display","block");
    this.tooltip.style("opacity", 100);
    let x0 = this.x.invert(event.clientX - this.margin.left).getTime();
    let i = d3.bisectRight(time, x0);
    if(i>this.dataZoom[0].values.length-1)i=this.dataZoom[0].values.length-1;
    else if (i < 0) i = 0;
    this.dataZoom.forEach((element,index) => {
      let d: number = this.dataZoom[index].values[i][1];
      let t = this.dataZoom[index].values[i][0];
      let date = new Date(t).toLocaleDateString("fr", { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
      let txt = date + "\n" + t;
      d3.select('#tooltip-date1' + index)
          .text(date);
      d3.select('#tooltip-date2' + index)
          .text(roundDecimal(d,2));
    });
    let d: number = this.dataZoom[0].values[i][1];
    let t = this.dataZoom[0].values[i][0];
    this.tooltip.attr("transform", "translate(" + this.x(t) + "," + this.y(d) + ")");
  }
    
  private hideInfo() { //fonction qui cache le tooltips
    this.tooltip.style("display", "none");
  }

  private zoom(event: any) {
    let lastLengthLocalTime = this.lengthTime / Math.pow(1.5,this.idZoom);
    let lastMinLocalTime = this.isMinScaleX(this.dataZoom);
    if((event.detail<0&&this.idZoom>0)||event.detail>0){
      if(event.detail<0&&this.idZoom>0){
        this.idZoom--;
      }else if(event.detail>0){
        this.idZoom++; 
      }
      let pos = this.x.invert(event.clientX-this.margin.left).getTime();
      let lengthLocalTime = this.lengthTime / Math.pow(1.5,this.idZoom);
      let minLocalTime = (lastMinLocalTime-pos)*(lengthLocalTime/lastLengthLocalTime) + pos;
      if(this.minTime>minLocalTime){
        minLocalTime=this.minTime;
      }
      let maxLocalTime = minLocalTime + lengthLocalTime;
      if(this.maxTime<maxLocalTime){
        maxLocalTime=this.maxTime;
        minLocalTime=maxLocalTime - lengthLocalTime;
      }
      let dataLocal: Data[]= [];
      this.data.forEach((element,index) => {
        dataLocal[index]={
          label: this.data[index].label,
          values: element.values.filter((element: any) => minLocalTime <= element[0] && element[0] <=  maxLocalTime),
          color:this.data[index].color,
          interpolation:this.data[index].interpolation
      }}) 
      
      if(dataLocal[0].values.length>0&&lengthLocalTime>4000){
        this.dataZoom =dataLocal;
        this.dataZoom.forEach((element,index) => {
          this.dataZoom[index].values.unshift([minLocalTime,(this.dataZoom[index].values[0][1])]);
          this.dataZoom[index].values.push([maxLocalTime,this.dataZoom[index].values[this.dataZoom[index].values.length-1][1]]);
        })
        this.updateSvg(minLocalTime,maxLocalTime);
      }else{
        this.idZoom--;
      }
    }
  }

  private isMaxScaleX(d: Data[]) { //renvoie les data avec le plus grand nombre de données 
    let max!: number;
    d.forEach(
      element => element.values.forEach
      (element => {
        if(max==undefined||element[0]>max) max=element[0];
      })
    )
    return max;
  }
  private isMinScaleX(d: Data[]) {
    let min!: number;
    d.forEach(
      element => element.values.forEach
      (element => {
        if(min==undefined||element[0]<min) min=element[0];
      }
      )
    )
    return min;
  }
  private isMaxScaleY(d: Data[]) {
    let max!: number;
    d.forEach(
      element => element.values.forEach
      (element => {
        if(max==undefined||element[1]>max) max=element[1];
      }
      )
    )
    return max;
  }
  private isMinScaleY(d: Data[]) {
    let min!: number;
    d.forEach(
      element => element.values.forEach
        (element => {
        if(min==undefined||element[1]<min) min=element[1];
      }
      )
    )
    return min;
  }

}
