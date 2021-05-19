import { Component, OnInit , Input,AfterViewInit, ViewChild, ElementRef, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import * as d3Scale from 'd3';
import * as d3Array from 'd3';
import * as d3Axis from 'd3';
import { DataService } from '../data.service';
import { roundDecimal } from 'src/tools';
import { DATA } from '../data-interface';

export interface Data {
  label: string;
  values: [number,number][];
  color: string;
  style: "line" | "area" | "both";
  interpolation: "linear" | "step";
}

@Component({
  selector: 'app-booleantimeline',
  templateUrl: './booleantimeline.component.html',
  styleUrls: ['./booleantimeline.component.scss']
})



export class BooleantimelineComponent implements OnInit {

  
  @Input() data!: Data[];
  @ViewChild('root') timeline!: ElementRef;
  @Input() range!: [number,number,number];
  @Output() rangeChange = new EventEmitter<[number,number,number]>();
  @Input() currentTime: number|undefined = undefined;
  @Output() currentTimeChange = new EventEmitter<number|undefined>();

  public title = 'Boolean timeline';

  
  private margin = { top: 20, right: 20, bottom: 30, left: 50 }; //marge interne au svg 
  private dataZoom: Data[] = [];
  private idZoom: number = 0;
  private minTime: number = 0;
  private maxTime: number = 0;
  private lengthTime: number = 0;
  private width: number = 0;
  private height: number = 0;
  private x: any;
  private y: any;
  private svg: any;
  private area: d3.Area<[number, number]>[] = []; // this is line defination
  private line: d3.Line<[number, number]>[] = []; // this is line defination
  private tooltip: any;
  private currentTimeLine: any;
  private lastDatalength:number = 0;
  private currentTimeLocal: number = 0;
  private modeToolTips: string = "normal";
  private currentTimeSelected:boolean = false;

  
  constructor() {   
    if(this.range==undefined){
      this.range=[0,0,0];
    }
  }

  public ngOnInit(): void {
    this.title = 'Boolean timeline';
    this.dataZoom = [...this.data];
    this.lastDatalength=this.dataZoom.length;
    if(this.currentTime==undefined){
      this.currentTimeLocal = this.isMinScaleX(this.data);
    }
  }

  public ngAfterViewInit(): void { //after le render pour recuperer les valeurs transmise au sein de la balise html 
    if (this.timeline != undefined) {
      var w = this.timeline.nativeElement.width.animVal.value;
      var h = this.timeline.nativeElement.height.animVal.value;
      this.width = (w - this.margin.left) - this.margin.right;
      this.height = (h - this.margin.top) - this.margin.bottom;
    }

    this.data.forEach(
      (element,index) => {
        if(element.style=="area" || element.style=="both"){
          if(element.interpolation=="step"){
            this.area[index]=d3.area()
            .x((d: any) => this.x(d[0]))
            .y0(this.height)
            .y1((d: any) => this.y(d[1]))
            .curve(d3.curveStepAfter);
          }else{
            this.area[index]=d3.area()
            .x((d: any) => this.x(d[0]))
            .y0(this.height)
            .y1((d: any) => this.y(d[1]))
          }
        }
        if(element.style=="line" || element.style=="both"){
          if(element.interpolation=="step"){
            this.line[index]=d3.line()
            .x((d: any) => this.x(d[0]))
            .y((d: any) => this.y(d[1]))
            .curve(d3.curveStepAfter);
          }else{
            this.line[index]=d3.line()
            .x((d: any) => this.x(d[0]))
            .y((d: any) => this.y(d[1]))
          }
        }
        
    })
    this.buildZoom(); 
    this.buildFix();
    this.addXandYAxis();
    this.drawLineAndPath();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.data&&!changes.data.firstChange) {
      this.updateChart();
    }
    if (changes.range&&!changes.range.firstChange) {
      this.idZoom=this.range[2];
      this.data.forEach((element,index) => {
        this.dataZoom[index]={
          label: element.label,
          values: element.values.filter((element: any) => this.range[0] <= element[0] && element[0] <=  this.range[1]),
          color:element.color,
          style:element.style,
          interpolation:element.interpolation
      }}) 
      let time: number[];
      this.data.forEach((element,index) => {
        time=[];
        element.values.forEach((element => time.push(element[0])));
        let i = d3.bisectLeft(time, this.range[0])-1;
        if(i>=0&&i<this.data[index].values.length){
          this.dataZoom[index].values.unshift([this.range[0],(this.data[index].values[i][1])]);
        }
        this.dataZoom[index].values.push([this.range[1],this.dataZoom[index].values[this.dataZoom[index].values.length-1][1]]);
      })
      this.updateSvg(this.range[0],this.range[1]);
    }
    if (changes.currentTime&&!changes.currentTime.firstChange&&this.currentTime!=undefined) {
      this.currentTimeLocal=this.currentTime;
      this.updateCurrentTime();
    }
}
  
  private buildFix() { // creer une timeline avec une seul donnée
    this.svg = d3.select(this.timeline.nativeElement)
    .append('g')
    .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
    d3.select(this.timeline.nativeElement).on("mousemove", (event: any) => {
      if(this.currentTimeSelected){
        this.hideInfo();
        this.moveCurrentTime(event);
      }else{
        this.showInfo(event);
      }
    })
    .on("mouseleave", () => { this.currentTimeSelected = false; this.hideInfo() })
    .on("wheel", (event: any) => this.zoom(event))
    .on("mouseup", () => this.currentTimeSelected=false);
    
  }

  private addXandYAxis(){
    let info = this.createRangeDomain(this.data);
    this.x = d3Scale.scaleTime();
    this.x.range([0, this.width]);
    this.x.domain([this.minTime,this.maxTime]);
    this.y = d3Scale.scaleOrdinal();
    this.y.range(info.range);
    this.y.domain(info.domain);
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
      (element,index) => {
        if(element.style=="area" || element.style=="both"){
          this.svg.append('path')
          .datum(this.dataZoom[index].values)
          .attr('class', 'area'+index)
          .attr('d', this.area[index])
          .attr("stroke-width", 0.1)
          .attr('opacity', 0.3)
          .style('fill', element.color)
          .style('stroke', element.color)
          .style('stroke-width', '2px')
        }
        if(element.style=="line" || element.style=="both"){
          this.svg.append('path')
          .datum(element.values)
          .attr('class', 'line'+index)
          .attr('d', this.line[index])
          .style('fill', 'none')
          .style('stroke', element.color)
          .style('stroke-width', '2px')
        }
        
      }
    )

    this.currentTimeLine = this.svg.append('path')
      .datum([[this.currentTimeLocal,this.isMinScaleY(this.data)],[this.currentTimeLocal,this.isMaxScaleY(this.data)]])
      .attr('class', 'currentTimeLine')
      .attr('d', d3.line()
        .x((d: any) => this.x(d[0]))
        .y((d: any) => this.y(d[1])))
      .style('fill', 'none')
      .style('stroke', 'red')
      .style('stroke-width', '3px');


    this.currentTimeLine
    .on("mousedown", () => {
      this.currentTimeSelected=true;
      this.hideInfo();
    });
    this.addToolTips();
  }
  
  private updateChart(){
    this.dataZoom = [...this.data];
    this.data.forEach(
      (element,index) => {
        if(element.style=="area" || element.style=="both"){
          if(element.interpolation=="step"){
            this.area[index]=d3.area()
            .x((d: any) => this.x(d[0]))
            .y0(this.height)
            .y1((d: any) => this.y(d[1]))
            .curve(d3.curveStepAfter);
          }else{
            this.area[index]=d3.area()
            .x((d: any) => this.x(d[0]))
            .y0(this.height)
            .y1((d: any) => this.y(d[1]))
          }
          if(element.style=="area"){
            this.svg.selectAll('.line'+index).remove();
          }
        }
        if(element.style=="line" || element.style=="both"){
          if(element.interpolation=="step"){  
            this.line[index]=d3.line()
            .x((d: any) => this.x(d[0]))
            .y((d: any) => this.y(d[1]))
            .curve(d3.curveStepAfter);
          }else{
            this.line[index]=d3.line()
            .x((d: any) => this.x(d[0]))
            .y((d: any) => this.y(d[1]))
          }

          if(element.style=="line"){
            this.svg.selectAll('.area'+index).remove();
          }
        }
    })
    this.buildZoom();
    let info = this.createRangeDomain(this.data);
    this.x.domain([this.minTime,this.maxTime]);
    this.y.domain(info.domain);
    this.y.range(info.range);
    this.svg.selectAll('.yAxis').call(d3.axisLeft(this.y));
    this.svg.selectAll('.xAxis').call(d3.axisBottom(this.x));
    this.updateLine();
    this.updateToolTips();
    for(let index=this.dataZoom.length; index<this.lastDatalength; index++){
      this.svg.selectAll('.line'+index).remove();
      this.svg.selectAll('.area'+index).remove();
    }
    this.lastDatalength=this.dataZoom.length;
  }

  private updateSvg(min: number, max: number){
    this.x.domain(d3Array.extent([min,max]));
    this.svg.selectAll('.xAxis').call(d3.axisBottom(this.x));
    this.updateLine();
  }

  private updateLine(){
    let lineUpdate;
    let areaUpdate;
    this.dataZoom.forEach((element,index) => {
      if(element.style=="area" || element.style=="both"){
        areaUpdate= this.svg.selectAll('.area'+index).data([this.dataZoom[index].values]);
        areaUpdate
        .enter()
        .append("path")
        .attr('class', 'area'+index)
        .merge(areaUpdate)
        .attr('d', this.area[index])
        .attr("stroke-width", 0.1)
        .attr('opacity', 0.3)
        .style('fill', element.color)
        .style('stroke', element.color)
        .style('stroke-width', '2px');
      }
      if(element.style=="line" || element.style=="both"){
        lineUpdate= this.svg.selectAll('.line'+index).data([this.dataZoom[index].values]);
        lineUpdate
        .enter()
        .append("path")
        .attr('class', 'line'+index)
        .merge(lineUpdate)
        .attr('d', this.line[index])
        .style('fill', 'none')
        .style('stroke', element.color)
        .style('stroke-width', '2px')
      }
    });
    this.updateCurrentTime();
  }

  private updateCurrentTime(){
    let lineUpdate;
      lineUpdate= this.svg.selectAll('.currentTimeLine').datum([[this.currentTimeLocal,this.isMinScaleY(this.data)],[this.currentTimeLocal,this.isMaxScaleY(this.data)]]);
          lineUpdate
          .enter()
          .append("path")
          .attr('class', 'currentTimeLine')
          .merge(lineUpdate)
          .attr('d', d3.line()
            .x((d: any) => this.x(d[0]))
            .y((d: any) => this.y(d[1])))
          .style('fill', 'none')
          .style('stroke', 'red')
          .style('stroke-width', '3px')
    if(this.currentTimeLocal>=this.isMinScaleX(this.dataZoom)&&this.currentTimeLocal<=this.isMaxScaleX(this.dataZoom)){
      this.svg.selectAll('.currentTimeLine').attr('display','block');
    }else{
      this.svg.selectAll('.currentTimeLine').attr('display','none');
    }
  }
  
  private buildZoom(){
    this.minTime = this.isMinScaleX(this.data);
    this.maxTime = this.isMaxScaleX(this.data);
    this.lengthTime = this.maxTime - this.minTime;
    this.idZoom=0;
  }

  private updateToolTips() {
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
    if (this.modeToolTips == "normal") {
      this.tooltip.append("polyline")
      .attr("points", "0,0 0," + (40 * taille)+", 75," + (40 * taille)+", 80," + (45 * taille)+" 85," + (40 * taille)+" 160," + (40 * taille)+" 160,0 0,0")
        .style("fill", "#fafafa")
        .style("stroke","#3498db")
        .style("opacity","0.9")
        .style("stroke-width","1")
        .attr("transform", "translate(-80, " + (-50 * taille) + ")");
      
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
    else {
      this.tooltip.append("polyline")
      .attr("points", "0,"+(95+((taille-1) *40 ))+" , 0,55 , 75,55 , 80,50 , 85,55 , 160,55 , 160,"+(95+((taille-1) *40 ))+" 0,"+(95+((taille-1) *40 ))+"")
        .style("fill", "#fafafa")
        .style("stroke","#3498db")
        .style("opacity","0.9")
        .style("stroke-width","1")
        .attr("transform", "translate(-80, " + (-50 * 1) + ")");
      
        this.dataZoom.forEach((element,index) => {
          // Cet élément contiendra tout notre texte
          let text = this.tooltip.append("text")
            .style("font-size", "13px")
            .style("font-family", "Segoe UI")
            .style("color", element.color)
            .style("fill", element.color)
            .attr("transform", "translate(-80,"+(-30*(index+1))+")");
     
          // Element pour la date avec positionnement spécifique
          text.append("tspan")
            .attr("dx", "7")
            .attr("dy", 50 + 70*index)
            .attr("id", "tooltip-date1" + index);
        
            text.append("tspan")
            .attr("dx", "-80")
            .attr("dy", "20")
            .attr("id", "tooltip-date2"+index);
        });
    }
  }

  private showInfo(event: any) { // fonction qui affiche le tooltips
    let time: number[] = [];
    if (this.dataZoom[0] != undefined) {
      this.dataZoom[0].values.forEach((element) => time.push(element[0]));
      this.tooltip.style("display","block");
      this.tooltip.style("opacity", 100);
      let x0 = this.x.invert(event.clientX - this.margin.left).getTime();
      let x = d3.bisectRight(time, x0);
      if(x>this.dataZoom[0].values.length-1)x=this.dataZoom[0].values.length-1;
      else if (x < 0) x = 0;
      let d: number = this.dataZoom[0].values[x][1];
      let t = this.dataZoom[0].values[x][0];
      if (this.y(d) <= 40*this.dataZoom.length) {
        if (this.modeToolTips != "inverse") {
          this.modeToolTips = "inverse";
          this.updateToolTips();
        }
      
      } else {
        if (this.modeToolTips != "normal") {
          this.modeToolTips = "normal";
          this.updateToolTips();
        }
      };

      this.dataZoom.forEach((element, index) => {
        let i = x;
        if(i>this.dataZoom[index].values.length-1)i=this.dataZoom[index].values.length-1;
        else if (i < 0) i = 0;
        let d: number = this.dataZoom[index].values[i][1];
        let t = this.dataZoom[index].values[i][0];
        let date = new Date(t).toLocaleDateString("fr", { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
        d3.selectAll('#tooltip-date1' + index)
            .text(date);
        d3.selectAll('#tooltip-date2' + index)
            .text(roundDecimal(d,2));
      });
      this.tooltip.attr("transform", "translate(" + this.x(t) + "," + this.y(d) + ")");
    }
    
  }
    
  private hideInfo() { //fonction qui cache le tooltips
    this.tooltip.style("display", "none");
  }

  private zoom(event: WheelEvent){
    event.preventDefault();
    let lastLengthLocalTime = this.lengthTime / Math.pow(1.5,this.idZoom);
    let lastMinLocalTime = this.isMinScaleX(this.dataZoom);
    if((event.deltaY>0&&this.idZoom>0)||event.deltaY<0){
      if(event.deltaY>0&&this.idZoom>0){
        this.idZoom--;
      }else if(event.deltaY<0){
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
          label: element.label,
          values: element.values.filter((element: any) => minLocalTime <= element[0] && element[0] <=  maxLocalTime),
          color: element.color,
          style: element.style,
          interpolation: element.interpolation
      }}) 
      if(lengthLocalTime>10000){
        let time: number[];
        this.dataZoom =dataLocal;
        this.data.forEach((element,index) => {
          time=[];
          element.values.forEach((element => time.push(element[0])));
          let i = d3.bisectLeft(time, minLocalTime)-1;
          if(i>=0&&i<this.data[index].values.length){
            this.dataZoom[index].values.unshift([minLocalTime,(this.data[index].values[i][1])]);
          }
          this.dataZoom[index].values.push([maxLocalTime,this.dataZoom[index].values[this.dataZoom[index].values.length-1][1]]);
        })
        this.updateSvg(minLocalTime,maxLocalTime);
        this.rangeChange.emit([minLocalTime,maxLocalTime,this.idZoom]);
      }else{
        this.idZoom--;
      }
    }
  }

  private moveCurrentTime(event: MouseEvent){
    event.preventDefault();
    let pos = this.x.invert(event.clientX-this.margin.left).getTime();
    if(pos<this.isMinScaleX(this.dataZoom)){
      this.currentTimeLocal=this.isMinScaleX(this.dataZoom);
    }else if(pos>this.isMaxScaleX(this.dataZoom)){
      this.currentTimeLocal=this.isMaxScaleX(this.dataZoom);
    }else{
      this.currentTimeLocal=pos;
    }
    this.updateCurrentTime();
    this.currentTimeChange.emit(this.currentTimeLocal);
    
  }

  private isMaxScaleX(d: Data[]) { 
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
  
  private createRangeDomain(d: Data[]) :{range:number[],domain:number[]}{
    let min: number = this.isMinScaleY(this.data);
    let max: number = this.isMaxScaleY(this.data);
    let domain: number[] = [];
    let range: number[] = [];
    for(let i:number = min;i<=max;i++){
      domain.push(i);
    }
    let step: number = this.height/(domain.length-1);
    domain.forEach((_element, index)=> range.unshift(step*index));
    return {range,domain};
  }
}
