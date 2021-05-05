


module.exports.getDate = function (){
    var today= new Date();
    var currentDay= today.getDay();
    var day= "";

   // if(today.getDay()==6|| today.getDay()==0){
   //     res.send('yay !!  its Weekend ');
   // }else{
   //     res.send('Boo,  I have to work ');
   // }


   var options= {
       weekday: 'long',
       day: 'numeric',
       month: 'long'
   };

   var day= today.toLocaleTimeString("en-us", options);
   return day;
}

module.exports.getDay= function (){
    var today= new Date();
    var currentDay= today.getDay();
    var day= "";

   // if(today.getDay()==6|| today.getDay()==0){
   //     res.send('yay !!  its Weekend ');
   // }else{
   //     res.send('Boo,  I have to work ');
   // }


   var options= {
       weekday: 'long',
   };

   var day= today.toLocaleTimeString("en-us", options);
   return day;
}
