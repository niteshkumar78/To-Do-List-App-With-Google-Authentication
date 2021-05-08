require('dotenv').config();

const express= require('express');

const app= express();

const session= require('express-session');

const passport= require('passport');

const passportLocalMongoose= require('passport-local-mongoose');

const GoogleStrategy = require('passport-google-oauth20').Strategy;

const findOrCreate= require('mongoose-findorcreate');

const mongoose= require('mongoose');

app.use(express.urlencoded({extended:true}));

app.set('view engine', 'ejs');

app.use(session({
    secret: "This is our little secret",
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());

// const date= require(__dirname + '/date.js');

mongoose.connect("mongodb+srv://admin-nitesh:Test@123@cluster0.af934.mongodb.net/todolistDB", { useNewUrlParser: true ,useUnifiedTopology: true });

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
// const itemSchema= mongoose.Schema({
//     name: String
// });

// const Item= mongoose.model("Item", itemSchema);

const userSchema= new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    list: Array
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User= mongoose.model('User', userSchema);
passport.use(User.createStrategy());     //creating local strategy

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });


  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://todolistnitesh.herokuapp.com/auth/google/todolist",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
      console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
// console.log(date);

// const item1= new Item({
//     name: "Nitesh"
// });

// const item2= new Item({
//     name: "Kumar"
// });

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
    res.render('home');
});

//copy paste from passport documentation
 
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));


//copy paste from passport documentation

  app.get('/auth/google/todolist', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect secrets page.
    res.redirect('/list');
  });

app.get('/login', function(req, res){
    res.render('login');
});


app.get('/register', function(req, res){
    res.render('register');
});

app.post('/register', function(req, res){

    User.register({username: req.body.username}, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect('register');
        } else{
            passport.authenticate("local")(req, res, function(){
                res.redirect('list');
            });
        }
    });
 
});

app.post('/login', function(req, res){

    const user= new User({
        username: req.body.username,
        password: req.body.password
    });

    req.logIn(user, function(err){
        if(err){
            console.log(err);
            res.redirect('login');
        } else{
            passport.authenticate("local")(req, res, function(){
                res.redirect('list');
            });
        }
    });
   
});


app.get('/logout', function(req, res){
    req.logOut();
    res.redirect('/');
});






app.get('/list', function(req, res){

    if(req.isAuthenticated()){
     User.findById(req.user.id, function(err, items){
        if(err){
            console.log(err);
        }
        else if(items){
            console.log(items);
            res.render('list', {
                kindofDay: "Today",
                newListItems: items               
            });
        }
    });
} else{
    res.redirect('/login');
}
   // res.send('Hello');
});


app.post('/list', function(req, res){
    var newItem= req.body.newItem;
    // const itemSave = new Item({
    //     name: newItem
    // });
    
    // itemSave.save();
    User.findById(req.user.id, function(err, foundUser){
        if(err){
            console.log(err);
        } else  if(foundUser){
               foundUser.list.push(newItem);
               foundUser.save();
        }
    })
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
    // console.log('hi');
    // console.log(req.user);
    User.findById( req.user.id , function(err, foundUser){
             if(err){
                 console.log(err);
             }
             else if(foundUser){
                const index = foundUser.list.indexOf(req.body.checkbox);
                if (index > -1) {
                    foundUser.list.splice(index, 1);
                }
                 
                 foundUser.save();
             }
             res.redirect('/list');
         });
});

// connecting to HEROKU
// let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 8000;
// }
app.listen(process.env.PORT || 8000, function(){
    console.log(`Server started on Port ${port}` );
});




// app.listen(8000, function(){
//     console.log('app is running on port 8000');
// });