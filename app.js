//npm install express express-sanitizer method-override body-parser mongoose ejs --save

// ======================================================
// SET VARIABLES AND APP USES
// ======================================================
var express          = require("express"),
	app              = express(),
	expressSanitizer = require("express-sanitizer"),
	methodOverride   = require("method-override"),
	bodyParser       = require("body-parser"),
	mongoose         = require("mongoose");

app.set("view engine", "ejs");
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer()); // MUST ALWAYS BE AFTER BODY-PARSER
app.use(express.static("public")); //tell express to use the public folder (for custom css and js)

mongoose.connect("mongodb://localhost:27017/restful_blog_app", //this creates the database if it doesn't exist
				{ useNewUrlParser: true,
				  useUnifiedTopology: true,
				  useFindAndModify: false });


// ======================================================
// MONGOOSE SCHEMA SETUP / MODEL CONFIG
// ======================================================
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);


// ======================================================
// RESTFUL ROUTES
// ======================================================

// HOME / REDIRECTS TO BLOGS INDEX
app.get("/", function(req, res){
	res.redirect("/blogs");
});


// INDEX ROUTE
app.get("/blogs", function(req, res){
	Blog.find({}, function(err, blogs){
		if(err){
			console.log(err);
		} else
			res.render("index", { blogs: blogs });
	});
});


// NEW ROUTE
app.get("/blogs/new", function(req, res){
	res.render("new");
});


// CREATE ROUTE
app.post("/blogs", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body) //this prevents the user from using script tags
	// this Blog.create() creates the blog immediately
	Blog.create(req.body.blog, function(err, newBlog){ //req.body.blog is in the name="" on the HTML. since it has blog[WHATEVER], it fetches all the info into an object
		if(err){
			console.log(err);
		} else {
			res.redirect("/blogs");
		}
	});
	 //redirects as a GET request
});


// SHOW ROUTE
app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			console.log(err);
		} else {
			res.render("show", {blog: foundBlog});
		}
	});
});


// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			console.log(err);
		} else
			res.render("edit", {blog: foundBlog});
	});
});


// UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body) //this prevents the user from using script tags
	
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err){
			console.log(err);
		} else {
			res.redirect("/blogs/" + req.params.id);
		}
	});
});


// DESTROY ROUTE
app.delete("/blogs/:id", function(req, res){
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.log(err);
		} else
			res.redirect("/blogs");
	});
});


// * ROUTE
app.get("*", function(req,res) {
	res.redirect("/blogs");
});


// ======================================================
// TELL EXPRESS TO LISTEN FOR REQUESTS (START THE SERVER)
// ======================================================
app.listen(3000, function() { 
  console.log('The RestfulBlogApp Server has started. Port: 3000'); 
});