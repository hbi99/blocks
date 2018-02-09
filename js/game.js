
/* jshint ignore:start */
@@include('sizzle.min.js')
@@include('box2d.min.js')
/* jshint ignore:start */

(function() {
	'use strict';

	var b2Vec2 = Box2D.Common.Math.b2Vec2,
		b2AABB = Box2D.Collision.b2AABB,
		b2WeldJointDef = Box2D.Dynamics.Joints.b2WeldJointDef,
		b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef,
		b2BodyDef = Box2D.Dynamics.b2BodyDef,
		b2Body = Box2D.Dynamics.b2Body,
		b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
		b2Fixture = Box2D.Dynamics.b2Fixture,
		b2World = Box2D.Dynamics.b2World,
		b2MassData = Box2D.Collision.Shapes.b2MassData,
		b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
		b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
		b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

	var game = {
		init: function() {
			// fast DOM references
			this.win = jr(window);
			this.doc = jr(document);
			this.body = jr('body');
			this.canvas = this.body.find('#canvas');
			this.context = this.canvas[0].getContext('2d');
			this.WIDTH  = this.canvas[0].width = 700;
			this.HEIGHT = this.canvas[0].height = 450;
			this.MARGIN = 10;

			this.FR = 1/60;
			this.SCALE = 30;
			this.WORLD = new b2World(new b2Vec2(0, 10), false);

			// init sub-objects
			for (var name in this) {
				if (typeof(this[name].init) === 'function') {
					this[name].init(this);
				}
			}

			// bind event handlers
			this.canvas.on('click', this.doEvent);

			var fixDef = new b2FixtureDef(),
				bodyDef = new b2BodyDef();

			// add ground
			bodyDef.type = b2Body.b2_staticBody;
			shapes.add_ground(fixDef, bodyDef);

			// add box
			bodyDef.type = b2Body.b2_dynamicBody;
			shapes.add_box(fixDef, bodyDef, 4, 14, 0.5, 0.5);
		//	shapes.add_box(fixDef, bodyDef, 5.6, 11, 0.5, 0.5);
			shapes.add_box(fixDef, bodyDef, 6.5, 14, 0.5, 0.5);
			// add circle
			shapes.add_circle(fixDef, bodyDef, 7, 3, 1);

			// add octagon
			shapes.add_octagon(fixDef, bodyDef, 3, 3, 0.75);



			// joint start
			fixDef.shape = new b2PolygonShape();
			fixDef.shape.SetAsBox(0.5, 0.5);
			bodyDef.position.x = 7;
			bodyDef.position.y = 10;

			var body1 = this.WORLD.CreateBody(bodyDef);
			body1.CreateFixture(fixDef);


			fixDef.shape = new b2PolygonShape();
			fixDef.shape.SetAsBox(0.5, 0.5);
			bodyDef.position.x = 8;
			bodyDef.position.y = 10;

			var body2 = this.WORLD.CreateBody(bodyDef);
			body2.CreateFixture(fixDef);

			var jointDef = new b2WeldJointDef();
			jointDef.bodyA = body1;
			jointDef.bodyB = body2;
			jointDef.localAnchorA = new b2Vec2(1, 0);
			jointDef.localAnchorB = body1.GetLocalCenter();
		//	jointDef.collideConnected = true;

			this.WORLD.CreateJoint(jointDef);
			// joint end

		//	var joint = new b2RevoluteJointDef();
		//	joint.Initialize(body1, body2, body1.GetWorldCenter());
		//	this.WORLD.CreateJoint(joint);

			// start
			this.animationFrame = requestAnimationFrame(this.update);
		},
		doEvent: function(event, el, orgEvent) {
			var self = game,
				cmd = (typeof event === 'string') ? event : event.type,
				mx, my, body,
				args;
			switch (cmd) {
				// native events
				case 'click':
					mx = event.clientX / self.SCALE;
					my = event.clientY / self.SCALE;
					body = self.getBodyAt(mx, my);
					
					self.WORLD.DestroyBody(body);
					break;
			}
		},
		getBodyAt: function(x, y) {
			var mouse_p = new b2Vec2(x, y),
				aabb = new b2AABB(),
				body = null;
			aabb.lowerBound.Set(x - 0.001, y - 0.001);
			aabb.upperBound.Set(x + 0.001, y + 0.001);
			
			// Query the world for overlapping shapes.
			function GetBodyCallback(fixture) {
				var shape = fixture.GetShape();

				if (fixture.GetBody().GetType() != b2Body.b2_staticBody || includeStatic) {
					var inside = shape.TestPoint(fixture.GetBody().GetTransform(), mouse_p);
					
					if (inside) {
						body = fixture.GetBody();
						return false;
					}
				}
				return true;
			}
			
			this.WORLD.QueryAABB(GetBodyCallback, aabb);

			return body;
		},
		update: function() {
			var self = game;

			self.WORLD.Step(self.FR, 10, 10);
			self.WORLD.DrawDebugData();
			self.WORLD.ClearForces();

			self.render();

			if (!self.animationFrame) return;
			self.animationFrame = requestAnimationFrame(self.update);
		},
		render: function() {
			//setup debug draw
			var debugDraw = new b2DebugDraw();
			debugDraw.SetSprite(this.context);
			debugDraw.SetDrawScale(this.SCALE);
			debugDraw.SetFillAlpha(0.3);
			debugDraw.SetLineThickness(1.0);
			debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
			this.WORLD.SetDebugDraw(debugDraw);
		}
	};

	@@include('raf.js')
	@@include('junior.js')
	@@include('shapes.js')

	window.game = game;
	window.onload = game.init.bind(game);

})();
