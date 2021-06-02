import { Component, OnInit } from '@angular/core';
import { Data } from './timeline/timeline.component';
import { DATA } from './data-interface';
import { DataService } from './data.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  [x: string]: any;
  
  
  public datatest: Data[] = [];

  public dat1: Data[] = []; 
  public dat2: Data[] = [];
  public dat3: Data[] = [];
  public dat4: Data[] = [];
  public dat5: Data[] = [];
  public dat6: Data[] = [];
  public dat7: Data[] = [];
  public range: [number,number]= [0,0];
  public currentTime: number =0;
  constructor(private DataServ: DataService) {
    this.generateData();
  }

  private parseBool(s: string) {
    if(s=="ON") return 1;
    else if (s=="OFF") return 0;
    else return -1;
  }
 
  public ngOnInit(): void {
  }
  
  private generateData(){
    let d1: DATA<number>[] = this.DataServ.parse<number>(this.DataServ.str,"PC6", this.parseBool);
    let v1: [number,number][] = [];
    d1.forEach(element =>v1.push([element.timestamp,element.value]));
    let da1: Data = {
      label: "PC6",
      values: v1,
      color: "#123568",
      style: "both",
      interpolation: "step"
    }
    let d2: DATA<number>[] = this.DataServ.parse<number>(this.DataServ.str,"PC5", this.parseBool);
    let v2: [number,number][] = [];
    d2.forEach(element =>v2.push([element.timestamp,element.value]));
    let x:number = 0;
    v2.forEach(element=> {
      element[1]=x;
      x=this.getRandomInt(x);
    }
      );
    let da2: Data = {
      label: "PC5",
      values: v2,
      color: "pur",
      style: "line",
      interpolation: "step"
    }
    let d3: DATA<number>[] = this.DataServ.parse<number>(this.DataServ.str,"PC5", this.parseBool);
    let v3: [number,number][] = [];
    d3.forEach(element =>v3.push([element.timestamp,element.value]));
    let da3: Data = {
      label: "Presence_Salon",
      values: v3,
      color: "pink",
      style: "line",
      interpolation: "step"
    }

    let d4: DATA<number>[] = this.DataServ.parse<number>(this.DataServ.str,"Temperature_Salon",  parseFloat);
    let v4: [number,number][] = [];
    d4.forEach(element =>v4.push([element.timestamp,element.value]));
    let da4: Data = {
      label: "Temperature_Salon",
      values: v4,
      color: "purple",
      style: "line",
      interpolation: "linear"
    }

    let d5: DATA<number>[] = this.DataServ.parse<number>(this.DataServ.str,"Temperature_Cuisine",  parseFloat);
    let v5: [number,number][] = [];
    d5.forEach(element =>v5.push([element.timestamp,element.value]));
    let da5: Data = {
      label: "Temperature_Cuisine",
      values: v5,
      color: "gold",
      style: "line",
      interpolation: "step"
    }

    let d6: DATA<number>[] = this.DataServ.parse<number>(this.DataServ.str,"Presence_Cuisine",  this.parseBool);
    let v6: [number,number][] = [];
    d6.forEach(element =>v6.push([element.timestamp,element.value]));
    let da6: Data = {
      label: "Presence_Cuisine",
      values: v6,
      color: "purple",
      style: "both",
      interpolation: "step"
    }

    let d7: DATA<number>[] = this.DataServ.parse<number>(this.DataServ.str,"Presence_SDB",  this.parseBool);
    let v7: [number,number][] = [];
    d7.forEach(element =>v7.push([element.timestamp,element.value]));
    let da7: Data = {
      label: "Presence_SDB",
      values: v7,
      color: "black",
      style: "area",
      interpolation: "step"
    }
    
    
    this.dat2.push(da1);
    this.dat1.push(da2);
    this.dat4.push(da4);
    this.dat3.push(da3);
    this.dat3.push(da1);
    this.dat5.push(da5);
    this.dat6.push(da6);
    this.dat7.push(da7);
  }

  public updateRange(rangeChange: [number,number]){
    this.range=rangeChange;
  }

  public updateCurrentTime(currentTimeChange: number ){
    this.currentTime=currentTimeChange;
  }
  
  public change(i: number){
    if(i==1) this.datatest = this.dat5;
    if(i==2) this.datatest = this.dat6;
    if(i==3) this.datatest = this.dat7;
  }

  private getRandomInt(x:number){
    let alea: number;
    if(x==0){
      return 1;
    }else{
      alea=Math.round(Math.random());
      if(alea==0){
        return x-1;
      }else{
        return x+1;
      }
    }
  }
}
