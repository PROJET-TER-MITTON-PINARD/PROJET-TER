import { Component, OnInit , Input,AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import * as d3Scale from 'd3';
import * as d3Array from 'd3';
import * as d3Axis from 'd3';
import { DataService } from '../data.service';
import { roundDecimal } from 'src/tools';
import { DATA } from '../data-interface';
import { scaleDiverging } from 'd3';

@Component({
  selector: 'app-booleantimeline',
  templateUrl: './booleantimeline.component.html',
  styleUrls: ['./booleantimeline.component.scss']
})
export class BooleantimelineComponent implements OnInit {

  @Input() type: string = "";
  @Input() color: string = "red";
  @Input() color2: string = "blue";
  @Input() nom: string = "";
  @Input() nom2: string = "";

  public title = 'Boolean timeline';

  
  private margin = { top: 20, right: 20, bottom: 30, left: 50 }; //marge interne au svg 

  private dataZoom: DATA<number>[] = [];
  private idZoom: number = 0;
  private minTime: number = 0;
  private maxTime: number = 0;
  private lengthTime: number = 0;
  
  private width: number = 0;
  private height: number = 0;
  private x: any;
  private y: any;
  private svg: any;
  private line: d3.Line<[number, number]>; // this is line defination
  private line2: d3.Line<[number, number]>;
  private data: DATA<number>[] = [];
  private data2: DATA<number>[] = [];
  private tooltip: any;

  public id: string ="";

  constructor(private DataServ: DataService) {
    this.line = d3.line()
      .x((d: any) => this.x(d.timestamp))
      .y((d: any) => this.y(d.value));
       
      this.line2 = d3.line()
       .x((d: any) => this.x(d.timestamp))
      .y((d: any) => this.y(d.value));
  }

  public ngOnInit(): void {
    this.title = 'Boolean timeline ' +this.nom;
    this.data = this.DataServ.parse<number>(this.DataServ.str,this.nom, this.parseBool);
    this.dataZoom = [...this.data];
    if (this.type == "multi" && this.nom2 != "") {
      this.data2 = this.DataServ.parse<number>(this.DataServ.str, this.nom2, this.parseBool);
      this.title = 'Boolean timeline ' +this.nom + " et " + this.nom2;
    }
    this.id = this.type + Math.floor(Math.random() * 100).toString();
  }

  public ngAfterViewInit() { //after le render pour recuperer les valeurs transmise au sein de la balise html 
    var timeline = (<SVGSVGElement><unknown>document.getElementById(this.id));
    if (timeline != null) {
      var w = timeline.width.animVal.value;
      var h = timeline.height.animVal.value;
      this.width = (w - this.margin.left) - this.margin.right;
      this.height = (h - this.margin.top) - this.margin.bottom;
    }
    this.callType();
  }

  private callType() { //on appelle la bonne fonction 
    if (this.type == "fix") {
      this.buildData();
      this.buildZoom();
      this.buildFix(this.data[0].timestamp,this.data[this.data.length-1].timestamp);
    }
    if (this.type == "multi") {
      this.buildData();
      this.buildData2();
      this.buildMulti();
    }
  }

  private parseBool(s: string) {
    if(s=="ON") return 1;
    else if (s=="OFF") return 0;
    else return -1;
  }
  
  private buildData(){
    this.dataZoom.forEach((element) =>
      {
          this.dataZoom.push({

            timestamp: element.timestamp -1,
    
            value: (1+element.value)%2,
    
            sensorId: element.sensorId
          
          })
      }
    )
    this.dataZoom.sort(function(a: any, b: any){
      return a.timestamp-b.timestamp;
    });

  }

  private buildData2(){
    this.data2.forEach((element, index) =>
      this.data2.push({

        timestamp: element.timestamp -1,

        value: (1+element.value)%2,

        sensorId: element.sensorId

    }))
    this.data2.sort(function(a: any, b: any){
      return a.timestamp-b.timestamp;
    });
  }


  private buildFix(min: number, max:number) { // creer une timeline avec une seul donnée
    this.svg = d3.select('#'+this.id)
    .append('g')
    .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
    
    d3.select('#'+this.id).on("mousemove", (event: any) => this.showInfo(event))
    .on("mouseleave", () => this.hideInfo())
    .on("mousewheel", (event: any) => this.zoom(event));
    
    // range of data configuring
    this.x = d3Scale.scaleTime().range([0, this.width]);
    this.y = d3Scale.scaleOrdinal().range([this.height, 0]);
    this.x.domain(d3Array.extent([min,max]));
    this.y.domain(d3Array.extent(this.dataZoom, (d) => d.value));
    // Configure the X Axis
    this.svg.append('g')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x));
    // Configure the Y Axis
    this.svg.append('g')
      .attr('class', 'axis axis--y')
      .call(d3Axis.axisLeft(this.y));
      this.svg.append('path')
      .datum(this.dataZoom)
      .attr('class', 'line')
      .attr('d', this.line)
      .style('fill', 'none')
      .style('stroke', this.color)
      .style('stroke-width', '2px');
      this.addToolTips();
  }
  
  private deleteSvg(){
    this.svg.remove();
  }
  
  private buildZoom(){
    this.minTime = this.data[0].timestamp;
    this.maxTime = this.data[this.data.length-1].timestamp;
    this.lengthTime = this.maxTime - this.minTime;
  }

  private buildMulti() { // creer une multitimeline 
    this.svg = d3.select('#'+this.id)
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
    // range of data configuring
    this.x = d3Scale.scaleTime().range([0, this.width]);
    this.y = d3Scale.scaleLinear().range([this.height, 0]);
    this.x.domain(d3Array.extent(this.isMaxScaleX(), (d) => d.timestamp));
    this.y.domain([0,1]);
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
     .datum(this.dataZoom)
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


  private addToolTips() { //creer le tooltips
    this.tooltip = this.svg.append("g")
        .attr("id", "tooltip"+this.id)
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
    this.tooltip.append("polyline")
        .attr("points","0,0 0,40, 55,40, 60,45 65,40 160,40 160,0 0,0")
        .style("fill", "#fafafa")
        .style("stroke","#3498db")
        .style("opacity","0.9")
        .style("stroke-width","1")
        .attr("transform", "translate(-60, -55)");
    
    
    // Cet élément contiendra tout notre texte
    let text = this.tooltip.append("text")
        .style("font-size", "13px")
        .style("font-family", "Segoe UI")
        .style("color", "#333333")
        .style("fill", "#333333")
        .attr("transform", "translate(-50, -40)");
    
    // Element pour la date avec positionnement spécifique
    text.append("tspan")
      .attr("dx", "7")
      .attr("dy", "10")
      .attr("id", "tooltip-date"+this.id);
  }

  private showInfo(event: any) { // fonction qui affiche le tooltips
    let time: number[]=[];
    this.dataZoom.forEach((element) => time.push(element.timestamp));
    this.tooltip.style("display","block");
    this.tooltip.style("opacity",100);
    let x0 = this.x.invert(event.clientX-this.margin.left).getTime();
    let i = d3.bisectRight(time, x0);
    if(i>this.dataZoom.length-1)i=this.dataZoom.length-1;
    else if(i<0) i=0;
    let d :number = this.dataZoom[i].value;
    let t = this.dataZoom[i].timestamp;
    this.tooltip.attr("transform", "translate(" + this.x(t) + "," + this.y(d) + ")");
    let date = new Date(t).toLocaleDateString("fr", {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute : 'numeric' , second: 'numeric' } );
    d3.select('#tooltip-date'+this.id)
      .text(date );
    }
    

  private hideInfo() { //fonction qui cache le tooltips
    this.tooltip.style("display", "none");
  }

  private zoom(event: any){
    let lastLengthLocalTime = this.lengthTime / Math.pow(1.5,this.idZoom);
    let lastMinLocalTime = this.dataZoom[0].timestamp;
    if((event.wheelDeltaY<0&&this.idZoom>0)||event.wheelDeltaY>0){
      if(event.wheelDeltaY<0&&this.idZoom>0){
        this.idZoom--;
      }else if(event.wheelDeltaY>0){
        this.idZoom++;
      }
      let pos = this.x.invert(event.clientX-this.margin.left).getTime();
      let lengthLocalTime = this.lengthTime / Math.pow(1.5,this.idZoom);
      let minLocalTime = lastMinLocalTime + (pos-lastMinLocalTime)* (lastLengthLocalTime - lengthLocalTime)/lastLengthLocalTime;
      let maxLocalTime = minLocalTime + lengthLocalTime;
      if(this.minTime>minLocalTime){
        minLocalTime=this.minTime;
        maxLocalTime=minLocalTime + lengthLocalTime;
      }
      if(this.maxTime<maxLocalTime){
        maxLocalTime=this.maxTime;
        minLocalTime=maxLocalTime - lengthLocalTime;
      }
      let dataLocal = this.data.filter((element: any) => minLocalTime <= element.timestamp && element.timestamp <=  maxLocalTime);
      if(dataLocal.length>0&&lengthLocalTime>4000){
        this.dataZoom =dataLocal;
        this.buildData();
        this.dataZoom.unshift({
          timestamp: minLocalTime,
          value: this.dataZoom[0].value,
          sensorId: this.dataZoom[0].sensorId
        });
        this.dataZoom.push({
          timestamp: maxLocalTime,
          value: this.dataZoom[this.dataZoom.length-1].value,
          sensorId: this.dataZoom[0].sensorId
        });
        this.deleteSvg();
        this.buildFix(minLocalTime,maxLocalTime);
      }else{
        this.idZoom--;
      }
    }
  }

  private isMaxScaleX() { //renvoie les data avec le plus grand nombre de données 
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
