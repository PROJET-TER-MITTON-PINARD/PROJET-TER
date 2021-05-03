

export function roundDecimal(nombre : number, precision:number){
  var precision = precision || 2;
  var tmp = Math.pow(10, precision);
  return Math.round( nombre*tmp )/tmp;
}