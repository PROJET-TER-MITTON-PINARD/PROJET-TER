import { Component, OnInit } from '@angular/core';
import { Data } from './booleantimeline/booleantimeline.component';
import { DATA } from './data-interface';
import { DataService } from './data.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  
  
  public datatest: Data[] = [];
  private dat1: Data[] = []; 
  private dat2: Data[] = [];
  private dat3: Data[] = [];
  constructor(private DataServ: DataService) {
    this.generateData();
    this.datatest=this.dat1;
  }

  private parseBool(s: string) {
    if(s=="ON") return 1;
    else if (s=="OFF") return 0;
    else return -1;
  }
 
  public ngOnInit(): void {
  }
  private generateData(){
    let d1: DATA<number>[] = this.DataServ.parse<number>(this.DataServ.str,"Temperature_Cuisine", parseFloat);
    let v1: [number,number][] = [];
    d1.forEach(element =>v1.push([element.timestamp,element.value]));
    let da1: Data = {
      label: "PC6",
      values: v1,
      color: "green",
      interpolation: "step"
    }
    this.dat1.push(da1);
    let d2: DATA<number>[] = this.DataServ.parse<number>(this.DataServ.str,"Temperature_Salon", parseFloat);
    let v2: [number,number][] = [];
    d2.forEach(element =>v2.push([element.timestamp,element.value]));
    let da2: Data = {
      label: "PC5",
      values: v2,
      color: "blue",
      interpolation: "step"
    }
    this.dat2.push(da2);
    let d3: DATA<number>[] = this.DataServ.parse<number>(this.DataServ.str,"Temperature_Salon", parseFloat);
    let v3: [number,number][] = [];
    d3.forEach(element =>v3.push([element.timestamp,element.value]));
    let da3: Data = {
      label: "Presence_Salon",
      values: v3,
      color: "red",
      interpolation: "step"
    }
    this.dat3.push(da3);
    this.dat3.push(da1);
  }
  
  public change(i: number){
    if(i==1) this.datatest = this.dat1;
    if(i==2) this.datatest = this.dat2;
    if(i==3) this.datatest = this.dat3;
  }
}
