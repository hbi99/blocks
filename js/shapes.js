
var shapes = {
	add_ground: function(fixDef, bodyDef) {
		var root = game;

		fixDef.density = 1.0;
		fixDef.friction = 0.5;
		fixDef.restitution = 0.2;
		fixDef.shape = new b2PolygonShape();

		// positions the center of the object (not upper left!)
		bodyDef.position.x = root.WIDTH / 2 / root.SCALE;
		bodyDef.position.y = 14.75;

		// half width, half height. eg actual height here is 1 unit
		fixDef.shape.SetAsBox(10, 0.1);
		root.WORLD.CreateBody(bodyDef).CreateFixture(fixDef);
	},
	add_box: function(fixDef, bodyDef, x, y, w, h) {
		var root = game;

		fixDef.shape = new b2PolygonShape();
		fixDef.shape.SetAsBox(w, h);

		bodyDef.position.x = x;
		bodyDef.position.y = y;
		
		root.WORLD.CreateBody(bodyDef).CreateFixture(fixDef);
	},
	add_circle: function(fixDef, bodyDef, x, y, r) {
		var root = game;
		
		fixDef.shape = new b2CircleShape(r);

		bodyDef.position.x = x;
		bodyDef.position.y = y;

		root.WORLD.CreateBody(bodyDef).CreateFixture(fixDef);
	},
	add_octagon: function(fixDef, bodyDef, x, y, sideLength) {
		var root = game;

		var vec = [],
			hexagonAngle = Math.PI / 6,
			hexHeight = Math.sin(hexagonAngle) * sideLength,
			hexRadius = Math.cos(hexagonAngle) * sideLength,
			hexRectangleHeight = sideLength + 2 * hexHeight,
			hexRectangleWidth = 2 * hexRadius;
		
		vec.push( new b2Vec2( x + hexRadius, y ) );
		vec.push( new b2Vec2( x + hexRectangleWidth, y + hexHeight ) );
		vec.push( new b2Vec2( x + hexRectangleWidth, y + hexHeight + sideLength ) );
		vec.push( new b2Vec2( x + hexRadius, y + hexRectangleHeight ) );
		vec.push( new b2Vec2( x, y + sideLength + hexHeight ) );
		vec.push( new b2Vec2( x, y + hexHeight ) );

		bodyDef.position.x = x;
		bodyDef.position.y = y;

		fixDef.shape = new b2PolygonShape();
		fixDef.shape.SetAsArray(vec, vec.length);
		
		root.WORLD.CreateBody(bodyDef).CreateFixture(fixDef);
	}
};
