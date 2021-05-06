const express= require('express');

const app= express();

const mongoose= require('mongoose');

app.use(express.urlencoded({extended:true}));

app.set('view engine', 'ejs');

// const date= require(__dirname + '/date.js');

mongoose.connect("mongodb+srv://admin-nitesh:Test@123@cluster0.af934.mongodb.net/todolistDB", { useNewUrlParser: true ,useUnifiedTopology: true });


const itemSchema= mongoose.Schema({
    name: String
});

const Item= mongoose.model("Item", itemSchema);

// console.log(date);

const item1= new Item({
    name: "Nitesh"
});

const item2= new Item({
    name: "Kumar"
});

// Item.insertMany([item1, item2], function(err){
//     if(err){
//         console.log(err);
//     }
//     else{
//         console.log("Sucessfully Connected to DB");
//     }
// });


app.use(express.static("assets"));

app.get('/', function(req, res){

     Item.find(function(err, items){
        if(err){
            console.log(err);
        }
        else{
            console.log(items);
            res.render('list', {
                kindofDay: "Today",
                newListItems: items                
            });
        }
    });

    

    // res.send('Hello');
});


app.post('/', function(req, res){
    var newItem= req.body.newItem;
    const itemSave = new Item({
        name: newItem
    });
    
    itemSave.save();
    res.redirect('back');
});

app.get('/about', function(req, res){
    res.render("about");
});

app.post('/delete', function(req, res){
     console.log(req.body);
     //method 1
    //  Item.deleteOne({_id: req.body.checkbox}, function(err){
    //      if(err){
    //          console.log(err);
    //      }
    //      else{
    //          console.log("Sucessfully deleted");
    //      }
    //      res.redirect('/');
    //  });
    Item.findByIdAndRemove( req.body.checkbox, function(err){
             if(err){
                 console.log(err);
             }
             else{
                 console.log("Sucessfully deleted");
             }
             res.redirect('/');
         });
});
app.listen(8000, function(){
    console.log('app is running on port 8000');
});