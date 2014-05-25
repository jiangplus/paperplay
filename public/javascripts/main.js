
var values = {
  friction: 0.8,
  timeStep: 0.01,
  amount: 15,
  mass: 2,
  count: 0
};
values.invMass = 1 / values.mass;

var default_color = new Color(0, 0, 0);

var shapes = []
var origins = []
var destinations = []




var path, springs, sun;
var size = view.size * [1.2, 1];

var Spring = function(a, b, strength, restLength) {
  this.a = a;
  this.b = b;
  this.restLength = restLength || 80;
  this.strength = strength ? strength : 0.55;
  this.mamb = values.invMass * values.invMass;
};

Spring.prototype.update = function() {
  var delta = this.b - this.a;
  var dist = delta.length;
  var normDistStrength = (dist - this.restLength) /
      (dist * this.mamb) * this.strength;
  delta.y *= normDistStrength * values.invMass * 0.2;
  if (!this.a.fixed)
    this.a.y += delta.y;
  if (!this.b.fixed)
    this.b.y -= delta.y;
};


function createPath(strength) {
  var path = new Path({
    fillColor: default_color
  });
  springs = [];
  for (var i = 0; i <= values.amount; i++) {
    var segment = path.add(new Point(i / values.amount, 0.5) * size);
    var point = segment.point;
    if (i == 0 || i == values.amount)
      point.y += size.height;
    point.px = point.x;
    point.py = point.y;
    // The first two and last two points are fixed:
    point.fixed = i < 2 || i > values.amount - 2;
    if (i > 0) {
      var spring = new Spring(segment.previous.point, point, strength);
      springs.push(spring);
    }
  }
  path.position.x -= size.width / 4;
  return path;
}

function onResize() {
  if (path)
    path.remove();
  size = view.bounds.size * [2, 1];
  path = createPath(0.1);

  // shapes.push(new Path.Circle({
  //   center: [850, 150],
  //   radius: 55,
  //   fillColor: 'red',
  //   strokeWidth: 10,
  //   strokeColor: 'pink'
  // }))

  for (var i = 0; i < shapes.length; i++) {
    var dest = Point.random() * view.size * [1,0.5];
    destinations.push(dest);
  }

  // console.log($.get('/a.json', function(data){
  //   console.log(data)
  // }))

}


function onMouseMove(event) {

  // if (sun.hitTest(event.point)) {
  //   // console.log(event.point)
  //   default_color.red += 0.02;
  //   if (default_color.red > 1) default_color.red -= 1;
  //   path.fillColor = default_color;
  // }

  var location = path.getNearestLocation(event.point);
  var segment = location.segment;
  var point = segment.point;

  if (!point.fixed && location.distance < size.height / 4) {
    var y = event.point.y;
    point.y += (y - point.y) / 6;
    if (segment.previous && !segment.previous.fixed) {
      var previous = segment.previous.point;
      previous.y += (y - previous.y) / 24;
    }
    if (segment.next && !segment.next.fixed) {
      var next = segment.next.point;
      next.y += (y - next.y) / 24;
    }
  }
}




function onFrame(event) {
  updateWave(path);

  for(var i = 0; i < shapes.length; i++) {
    var dxdy = destinations[i] - shapes[i].position;
    var shape = shapes[i];
    shape.fillColor.hue += 0.2;
    shape.strokeColor.hue += 0.2;

    if (dxdy.length > 10) {
      shape.position += dxdy / 20;
    } else {
      destinations[i] = Point.random() * view.size * [1,0.5]
    }

    if (path.hitTest(shape.position)) {
      // console.log('000')
      shape.opacity = 0.3;
    } else {
      shape.opacity = 1;
    }
  }
}

function updateWave(path) {
  var force = 1 - values.friction * values.timeStep * values.timeStep;
  for (var i = 0, l = path.segments.length; i < l; i++) {
    var point = path.segments[i].point;
    var dy = (point.y - point.py) * force;
    point.py = point.y;
    point.y = Math.max(point.y + dy, 0);
  }

  for (var j = 0, l = springs.length; j < l; j++) {
    springs[j].update();
  }
  path.smooth();
}

function onKeyDown(event) {
  // console.log(event.key)

  if (event.key == 'v') {
    destinations = [];
    for (var i = 0; i < shapes.length; i++) {
      shapes[i].remove()
    }
  }

  if (event.key == 'v') {
    destinations = [];
    for (var i = 0; i < shapes.length; i++) {
      shapes[i].remove()
    }

  }

  if (event.key == 'left') {
    for (var i = 0; i < destinations.length; i++) {
      destinations[i].x = 20
    }
  }

  if (event.key == 'right') {
    for (var i = 0; i < destinations.length; i++) {
      destinations[i].x = view.size.width - 20
    }
  }


  if (event.key == 'up') {
    for (var i = 0; i < destinations.length; i++) {
      destinations[i].y = 20
    }

    // console.log(default_color)
    // default_color.red += 0.02;
    // if (default_color.red > 1) default_color.red -= 1;
    // if (default_color.red < 0) default_color.red += 1;
    // path.fillColor = default_color;
  }

  if (event.key == 'down') {
    for (var i = 0; i < destinations.length; i++) {
      destinations[i].y = view.size.height - 20
    }


    // default_color.red -= 0.02;
    // if (default_color.red > 1) default_color.red -= 1;
    // if (default_color.red < 0) default_color.red += 1;
    // path.fillColor = default_color;  
  }


  if (event.key == 'space') {
    path.fullySelected = !path.fullySelected;
    path.fillColor = path.fullySelected ? null : 'black';
  }

  if (event.key == 'x' && shapes.length < 20) {

     var origin = Point.random() * view.size;
      shapes.push(new Path.Circle({
        center: origin,
        radius: 35,
        fillColor: 'red',
        strokeWidth: 10,
        strokeColor: 'pink'
      }))

      var dest = Point.random() * view.size * [1,0.5];
      destinations.push(dest)

  }
}



// var socket = io.connect('http://localhost');
// sock = socket;
// socket.on('connect', function(){
//   console.log('logged in')

//   socket.on('receive', function(data){
//     console.log(data);
//   });

//   socket.on('disconnect', function(){});

// });




