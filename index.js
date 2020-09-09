const express      =require('express'),
      app          =express(),
      bodyParser   =require('body-parser'),
      mongoose     =require('mongoose'),
      mongodb      =require('mongodb'),
      cron         =require('node-cron'),
      fs           =require('fs'),
      reject       =require('reject'),
      port         =process.env.PORT||5500;
/*------------------------------------------------------------------------------------------------------------ */  
               
const url=process.env.MONGO_URL||"mongodb+srv://swarnimanand445:gupta8800@test-vqkmj.mongodb.net/Time-Duration?retryWrites=true&w=majority";
mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true,ignoreUndefined:true,useCreateIndex:true},function(err,db)
{
    if(err)
    {
        console.log("Error connecting database");
        console.log(err);
    }
    else
    {
        console.log("Database connecting successfull..");
    }
});

/*------------------------------------------------------------------------------------------------------------ */   
app.set("view engine","ejs");
app.set("views","./view");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));    

/*------------------------------------------------------------------------------------------------------------ */   
let time_schema=new mongoose.Schema({
    pid:String,
    name:String,
    description:String,
    creator:String,
    duration:String,
    createdAt:{type:Date,default:Date.now},
   
})
// time_schema.index({"createdAt":1},{expireAfterSeconds:10});
let Time=mongoose.model("Time",time_schema);

/*------------------------------------------------------------------------------------------------------------ */ 

app.get("/",function(req,res)
{
    res.redirect("/home");
})
app.get("/home",function(req,res)
{
    res.render("index");
})
app.get("/show_data",function(req,res)
{
    Time.find({},function(err,record)
    {
        if(err)
        {
            console.log("error showing records");
            console.log(err);
            res.redirect("/home");
        }
        else{
           
            res.render("show",{record:record});
            
        }
    })
})
app.post("/show_data",function(req,res)
{
    let id1=req.body.id1;
    let name=req.body.name;
    let description=req.body.description;
    let creator=req.body.creator;
    let duration=req.body.duration;
   
    let Record={pid:id1,name:name,description:description,creator:creator,duration:duration};
    Time.create(Record,function(err,record)
    {
        if(err)
        {
            console.log("error inserting record");
            res.redirect("/home");
        }
        else
        {
            console.log("Data inserted in Time database");
            try{
                let d=new Date();
                let hour=d.getHours();
                let min=d.getMinutes();
                let sec=d.getSeconds();
                cron.schedule(
                    `${Record.duration} * * * * *`,
                () => {
                   
                    fs.unlink(`${record}`, err => {
                      if (err){
                        reject(err);
                      }
                      
                      console.log(`Task deleted at ${hour}:${min}:${sec} duration of ${Record.duration}`);
                    });
                  },{
                      scheduled:true,
                      timezone:'Asia/Kolkata',
                  });
                
            }
            catch(err){
                res.status(500).send("Server Error");
            }
            
            res.redirect("/home");
        }
    })
})

/*------------------------------------------------------------------------------------------------------------ */ 
app.listen(port,function()
{
    console.log("User server is started");
})