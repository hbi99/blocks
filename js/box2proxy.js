
var box2Proxy = {
	addBox: function(x, y, w, h) {
		var root = game,
			body;

		root.fixDef.shape = new b2PolygonShape();
		root.fixDef.shape.SetAsBox(w || root.boxW, h || root.boxH);
		root.bodyDef.type = b2Body.b2_dynamicBody;
		root.bodyDef.position.x = x;
		root.bodyDef.position.y = y;
		
		body = root.WORLD.CreateBody(root.bodyDef);
		body.CreateFixture(root.fixDef);

		return body;
	},
	addHexagon: function(x, y, sideLength) {
		var root = game,
			body;

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

		root.bodyDef.position.x = x;
		root.bodyDef.position.y = y;
		root.bodyDef.angle = Math.PI / 6;

		root.fixDef.shape = new b2PolygonShape();
		root.fixDef.shape.SetAsArray(vec, vec.length);
		
		body = root.WORLD.CreateBody(root.bodyDef);
		body.CreateFixture(root.fixDef);

		return body;
	},
	getBodyAt: function(x, y) {
		var root = game,
			mouse_p = new b2Vec2(x, y),
			aabb = new b2AABB(),
			body = null;
		aabb.lowerBound.Set(x - 0.001, y - 0.001);
		aabb.upperBound.Set(x + 0.001, y + 0.001);
		
		// Query the world for overlapping shapes.
		function GetBodyCallback(fixture) {
			if (fixture.GetBody().GetType() != b2Body.b2_staticBody || includeStatic) {
				var shape = fixture.GetShape();
				if (shape.TestPoint(fixture.GetBody().GetTransform(), mouse_p)) {
					body = fixture.GetBody();
					return false;
				}
			}
			return true;
		}
		root.WORLD.QueryAABB(GetBodyCallback, aabb);

		return body;
	},
	getBodyGroup: function(body) {
		var joins = [],
			func = function(box) {
				joins.push(box);
				if (box.m_jointList) {
					if (joins.indexOf(box.m_jointList.other) < 0) {
						func(box.m_jointList.other);
					}
					if (box.m_jointList.next && joins.indexOf(box.m_jointList.next.other) < 0) {
						func(box.m_jointList.next.other);
					}
				}
			};
		// search recursively
		func(body);
		return joins;
	}
};
