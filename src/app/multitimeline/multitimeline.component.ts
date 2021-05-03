import { Component, OnInit ,Input} from '@angular/core';
import * as d3 from 'd3';
import * as d3Scale from 'd3';
import * as d3Array from 'd3';
import * as d3Axis from 'd3';
import { DataService } from '../data.service';
import { roundDecimal } from 'src/tools';

/**type inputdata = number[][] | boolean[][];**/

@Component({
  selector: 'app-multitimeline',
  templateUrl: './multitimeline.component.html',
  styleUrls: ['./multitimeline.component.scss']
})
export class MultitimelineComponent implements OnInit {
  public title = 'Multi Line Chart Temp cuisine & salon';

  /**@Input() data: inputdata = [];**/
  /** ajouter un output la nouvelle plage de donnée observer [tempsdepart,tempsdarrivée] */

  data: any[] = this.DataServ.parse<number>(this.DataServ.str, "Temperature_Cuisine", parseFloat);
  data2: any[] = this.DataServ.parse<number>(this.DataServ.str, "Temperature_Salon", parseFloat);
  

  private margin = { top: 20, right: 20, bottom: 30, left: 50 };
  private width: number = 0;
  private height: number = 0;
  private x: any;
  private y: any;
  private svg: any;
  private line: d3.Line<[number, number]>; // this is line defination

  private line2: d3.Line<[number, number]>;
 

  constructor(private DataServ: DataService) {
    this.line = d3.line()
      .x((d: any) => this.x(d.timestamp))
      .y((d: any) => this.y(d.value));
    
    this.line2 = d3.line()
       .x((d: any) => this.x(d.timestamp))
      .y((d: any) => this.y(d.value));
    
  }

 
  public ngOnInit(): void {
    var timeline = (<SVGSVGElement><unknown>document.getElementById("multitimeline"));
    if (timeline != null) {
      var w = timeline.width.animVal.value;
      var h = timeline.height.animVal.value;
      this.width = (w - this.margin.left) - this.margin.right;
      this.height = (h - this.margin.top) - this.margin.bottom;
    }
    this.buildSvg();
    this.addXandYAxis();
    this.drawLineAndPath();
  
    
  }
  
  private buildSvg() {
    this.svg = d3.select('#multitimeline')
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
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
    // Configuring line path
    this.svg.append('path')
      .datum(this.data)
      .attr('class', 'line')
      .attr('d', this.line)
      .style('fill', 'none')
      .style('stroke', 'red')
      .style('stroke-width', '2px');
      this.svg.append('path')
      .datum(this.data2)
      .attr('class', 'line')
      .attr('d', this.line2)
      .style('fill', 'none')
      .style('stroke', 'blue')
      .style('stroke-width', '2px');
  }


}
