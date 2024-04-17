var express = require("express");
var app = express();
var redis = require("redis");
var client = redis.createClient();

// serve static files from public directory
app.use(express.static("public"));

// Initialize values for header, left, right, article, and footer using the redis client
client.mset("header", 0, "left", 0, "article", 0, "right", 0, "footer", 0);

// Get values for holy grail layout
function data() {
  return new Promise((resolve, reject) => {
    client.mget("header", "left", "article", "right", "footer", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          header: data[0],
          left: data[1],
          article: data[2],
          right: data[3],
          footer: data[4]
        });
      }
    });
  });
}

// Update key-value pair
app.get("/update/:key/:value", function (req, res) {
  const key = req.params.key;
  let value = Number(req.params.value);

  // Use the redis client to update the value associated with the given key
  client.set(key, value, (err, reply) => {
    if (err) {
      res.status(500).send("Error updating value in Redis");
    } else {
      res.send("Value updated successfully");
    }
  });
});

// Get key data
app.get("/data", function (req, res) {
  data().then((data) => {
    console.log(data);
    res.send(data);
  }).catch((err) => {
    console.error("Error fetching data:", err);
    res.status(500).send("Error fetching data from Redis");
  });
});

app.listen(3000, () => {
  console.log("Running on 3000");
});

process.on("exit", function () {
  client.quit();
});
