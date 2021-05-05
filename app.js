const express= require('express');

const app= express();

var items=[];

app.use(express.urlencoded({extended:true}));

app.set('view engine', 'ejs');

const date= require(__dirname + '/date.js');

console.log(date);
app.use(express.static("assets"));

app.get('/', function(req, res){

   let day= date.getDate();

    res.render('list', {
        kindofDay: day,
        newListItems: items                
    });

    // res.send('Hello');
});


app.post('/', function(req, res){
    var item= req.body.newItem;
    console.log(item);
    items.push(item);
    return res.redirect('back');
     
});

app.get('/about', function(req, res){
    res.render("about");
})
app.listen(8000, function(){
    console.log('app is running on port 8000');
});