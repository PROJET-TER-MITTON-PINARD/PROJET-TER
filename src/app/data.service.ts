import { Injectable } from '@angular/core';
import { str } from 'src/data';
import { DATA } from 'src/app/data-interface';

@Injectable({
  providedIn: 'root'
})
  
  

export class DataService {

  str: string = str;

  constructor() {
  }


  parse<T>(str: string, sensorId: string, f: (s: string) => T): DATA<T>[] {

    const L: DATA < T > [] = str.trim().split("\n").map(s => s.trim()).filter(s => s!=="")

                 .map( s => s.split(";").map( s => s.slice(1, -1) ) )

                 .filter( tab => tab[1] === sensorId )

                 .map( ([t, id, v]) => ({

                     timestamp: (new Date((t.replace(",", "."))).getTime()),

                     value: f(v),

                     sensorId: id

                 }));

    return L;

  }


}





