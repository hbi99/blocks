
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

	var level = [];
	level.push('ccbbb');
	level.push('aaaaa');
	level.push('ddbba');
	level.push('cccee');
	level.push('bbbba');
	level.push('ccaaa');
	level.push('aabbb');
	level.push('cccee');
	level.push('bbbba');
	level.push('ccaaa');
	level.push('ccbbb');
	level.push('aaaab');

	var game = {
		blocks: [],
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

			// defaults
			this.fixDef = new b2FixtureDef(),
			this.bodyDef = new b2BodyDef();

			this.doEvent('draw-ground');
			this.doEvent('draw-level');

			// start
			this.animationFrame = requestAnimationFrame(this.update);
		},
		doEvent: function(event, el, orgEvent) {
			var self = game,
				cmd = (typeof event === 'string') ? event : event.type,
				mx, my, body,
				i, il,
				j, jl,
				joins,
				args;
			switch (cmd) {
				// native events
				case 'click':
					mx = event.clientX / self.SCALE;
					my = event.clientY / self.SCALE;
					body = self.getBodyAt(mx, my);
					
					if (!body) return;

					joins = [];
					
					var fn = function(box) {
						joins.push(box);
						if (box.m_jointList) {
							if (joins.indexOf(box.m_jointList.other) < 0) {
								fn(box.m_jointList.other);
							}
							if (box.m_jointList.next && joins.indexOf(box.m_jointList.next.other) < 0) {
								fn(box.m_jointList.next.other);
							}
						}
					};
					fn(body);

					while (joins.length) {
						self.WORLD.DestroyBody( joins.pop() );
					}
					break;
				// custom events
				case 'draw-ground':
					var width = self.WIDTH / 2 / self.SCALE,
						top = (self.HEIGHT - 3) / self.SCALE;

					self.fixDef.density = 1.0;
					self.fixDef.friction = 0.5;
					self.fixDef.restitution = 0.2;
					self.fixDef.shape = new b2PolygonShape();
					self.fixDef.shape.SetAsBox(width, 3 / self.SCALE);

					self.bodyDef.position.x = width;
					self.bodyDef.position.y = top;
					self.bodyDef.type = b2Body.b2_staticBody;

					// half width, half height. eg actual height here is 1 unit
					self.WORLD.CreateBody(self.bodyDef).CreateFixture(self.fixDef);
					break;
				case 'draw-level':
					self.boxW = 0.5;
					self.boxH = 0.5;

					var jointDef,
						lvl = level,
						offset = {
							x: 10,
							y: 15.25 - lvl.length
						},
						box,
						c;
					il = lvl.length;
					jl = 5;
					for (i=0; i<il; i++) {
						self.blocks.push([]);
						for (j=0; j<jl; j++) {
							box = (lvl[i].charAt(j) === '0') ? false : b2Proxy.addBox(offset.x + j, offset.y + i);
							self.blocks[i].push(box);
						}
					}
					for (i=0; i<il; i++) {
						for (j=0; j<jl; j++) {
							c = lvl[i].charAt(j);
							if (c === '0') continue;

							if (j > 0 && c === lvl[i].charAt(j-1)) {
								jointDef = new b2WeldJointDef();
								jointDef.bodyA = self.blocks[i][j-1];
								jointDef.bodyB = self.blocks[i][j];
								jointDef.localAnchorA = new b2Vec2(1, 0);
								jointDef.localAnchorB = jointDef.bodyA.GetLocalCenter();
								self.WORLD.CreateJoint(jointDef);
							}
							if (i > 0 && c === lvl[i-1].charAt(j)) {
								jointDef = new b2WeldJointDef();
								jointDef.bodyA = self.blocks[i-1][j];
								jointDef.bodyB = self.blocks[i][j];
								jointDef.localAnchorA = new b2Vec2(0, 1);
								jointDef.localAnchorB = jointDef.bodyA.GetLocalCenter();
								self.WORLD.CreateJoint(jointDef);
							}
						}
					}
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
				if (fixture.GetBody().GetType() != b2Body.b2_staticBody || includeStatic) {
					var shape = fixture.GetShape();
					if (shape.TestPoint(fixture.GetBody().GetTransform(), mouse_p)) {
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
