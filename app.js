require('dotenv').config();

const express= require('express');

const app= express();

const session= require('cookie-session');

const passport= require('passport');

const passportLocalMongoose= require('passport-local-mongoose');

const GoogleStrategy = require('passport-google-oauth20').Strategy;

const findOrCreate= require('mongoose-findorcreate');

const mongoose= require('mongoose');

app.use(express.urlencoded({extended:true}));
const flash= require('connect-flash');                     //import for flash messages
const nodemailer = require("nodemailer");
const ejs = require('ejs');
const path = require('path');
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
    username: {
        type: String,
        unique: false
        }
        ,
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
    User.findOrCreate({googleId: profile.id}, function (err, user) {
    //     if(err){
    //         console.log(err);
    //         res.redirect('back');
    //     }
    //     else{
    //   return cb(err, user);
    //     }
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

//mailer


const forgotSchema= new mongoose.Schema({
    user: mongoose.Schema.Types.ObjectId,
    acess_token: String,
    is_valid: Boolean
});

const Forgot= mongoose.model('Forgot', forgotSchema);

let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'niteshkumartg78@gmail.com',
        pass: 'Kumar@123'
    }
});


function renderTemplate(data, relativePath){
    let mailHTML;
    ejs.renderFile(
        path.join(__dirname, './views/mailer', relativePath),
        data,
        function(err, template){
         if (err){console.log('error in rendering template', err); return}
         
         mailHTML = template;
        }
    )

    return mailHTML;
}

function newPassword(token, user){
    let htmlString= renderTemplate({token: token, user :user[0]}, 'forgot_password/forgot_password.ejs');

    console.log('username', user[0].name);
    console.log(token); 
    transporter.sendMail({
        from:'niteshkumartg78@gmail.com',
        to: user[0].username,
        subject: "Forgot Password Link",
        html: htmlString
    }, (err, info)=> {
        if(err){
            console.log(`Error occured: ${err}`);
            return;
        }
        console.log(`Message sent`, info);
        return;

    });
}
app.use(flash());                                    //use flash below session declared
app.use(setFlash= function(req,res, next){                 //middleware to store flash message into locals
    res.locals.flash= {
        'success': req.flash('success'),
        'error': req.flash('error')
    }
    next();
}); 



app.use(express.static("assets"));


app.get('/', function(req, res){
    if(req.isAuthenticated()){
        res.redirect('/list');
    } else{
        res.render('home');
    }

    // res.render('home');
    
});

//copy paste from passport documentation
 
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));


//copy paste from passport documentation

  app.get('/auth/google/todolist', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect secrets page.
    req.flash('success', 'logged in sucessfully');

    res.redirect('/list');
  });

app.get('/login', function(req, res){
    if(req.isAuthenticated()){
        res.redirect('/list');
    } else{
        res.render('login');
    }
    // res.render('login');
   
});


app.get('/register', function(req, res){
    if(req.isAuthenticated()){
        res.redirect('/list');
    } else{
        res.render('register');
    }
    // res.render('register');
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
            req.flash('error', 'Error in login');

            res.redirect('login');
        } else{
            passport.authenticate("local")(req, res, function(){
                req.flash('success', 'logged in sucessfully');

                res.redirect('list');
            });
        }
    });
   
});


app.get('/logout', function(req, res){
    req.logOut();

    req.flash('success', 'Password Reset Sucessfully!!, Please Login to Continue');

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
    });
    req.flash('success', 'Item Added sucessfully');
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
             req.flash('success', 'Item deleted sucessfully');
             res.redirect('/list');
         });
});


function makeid(length) {
    var result           = [];
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result.push(characters.charAt(Math.floor(Math.random() * 
 charactersLength)));
   }
   return result.join('');
}

app.get('/forgotPassword', function(req, res){
    return res.render('forgot_password_send', {
        title: "Codeal Forgot Password"
    });
});

app.post('/forgotPassword',function(req, res){
    
        User.find({username: req.body.email},function(err, user){
            
        if(err){
            console.log(err);
            return; 
        }
            console.log("user", user);
            if(user.length>0){
            console.log('user', user);
             let randomString = makeid(20);
             Forgot.create({
                 user: user[0]._id,
                 acess_token: randomString,
                 is_Valid: true
             });
            newPassword(randomString, user);
            req.flash('success', 'Password reset link send sucessfully');
            console.log('sucessfully Sent mail');

            }
            else{
                console.log('Invalid Email Id');

                req.flash('error', 'Invalid Email Id !!');
            }
          
        //   req.flash('success', 'Password reset link send sucessfully');
          return res.redirect('back');
        });
        
});

app.get('/forgotPassword/reset',async function(req, res){
    let token= req.query.acess_token;
    let forgot= await Forgot.find({acess_token: token});
    console.log("git new ", forgot[0])
    if(forgot.length>0){
    
        return res.render('password_render', {
            title: "password Reset Page",
            user_id: forgot[0].user
        });
    }

    else{
        res.send('<h1>Invalid Link</h1>');
    }
});

app.post('/forgotPassword/reset',async function(req, res){
    try{
        if(req.body.password==req.body.confirm_password){
            console.log("hi ", req.body.user_id);
        
         User.findById(req.body.user_id,async function (err, user){
           if(user){
            user.setPassword( req.body.password, function(err, users){
                if(err){
                    console.log(err);
                    return;
                }
                user= users;
                user.save();
                console.log(' password sucessfully changed', users);
            });
            
    
              
                 await  Forgot.findOneAndRemove({user: user._id});
                }


                else{
                    console.log('user not found');

                }
                
        // req.flash('success', 'Password Reset Sucessfully!!, Please Login to Continue');
                 return res.render('login', {
                    title: "Codeial | Sign In"
                });
            });
           
            } else {
            // req.flash('error', 'Password and Confirm password not match!!!!');
            return res.redirect('back');
         }
        
        } catch(err){
            console.log("error while reseting password", err);
            return;
        }
});

// connecting to HEROKU
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port || 8000, function(){
    console.log(`Server started on Port ${port}` );
});




// app.listen(8000, function(){
//     console.log('app is running on port 8000');
// });