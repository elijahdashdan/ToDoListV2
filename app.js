//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true
});


const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);


const item1 = new Item({
  name: "Welcome to me1"
});

const item2 = new Item({
  name: "Welcome to me2"
});

const item3 = new Item({
  name: "Welcome to me3"
});

// const day = date.getDate();
const defaultItems = [item1, item2, item3];
console.log("test")

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Success");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });

});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if (listName === "Today"){
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName)
    })
  }
});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkboxCheck;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err){
        console.log("Successfully deleted Item!");
        res.redirect("/");
      }
    });
  } else {
    
  }

});

app.get("/:customListName", function(req,res){
  const customListName = req.params.customListName
  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" +customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });


});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
