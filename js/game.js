
/* jshint ignore:start */
@@include('sizzle.min.js')
@@include('box2d.js')
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
//	level.push('00b00');
//	level.push('00b00');
//	level.push('00b00');
//	level.push('00b00');
//	level.push('00000');
//	level.push('aaaaa');
//	level.push('a000a');
//	level.push('bbcbb');
//	level.push('aaaaa');
//	level.push('aeeaa');
//	level.push('aecac');
//	level.push('addbb');
	level.push('dd000');
//	level.push('00000');
//	level.push('00000');

	var game = {
		boxes: [],
		blocks: [],
		init: function() {
			// fast DOM references
			this.win = jr(window);
			this.doc = jr(document);
			this.body = jr('body');
			this.canvas = this.body.find('#canvas');
			this.context = this.canvas[0].getContext('2d');
			this.WIDTH  = this.canvas[0].width = 400;
			this.HEIGHT = this.canvas[0].height = 550;
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
					body = box2Proxy.getBodyAt(mx, my);
					
					if (body) {
						joins = box2Proxy.getBodyGroup(body);
						while (joins.length) {
							self.WORLD.DestroyBody( joins.pop() );
						}
					}
					break;
				// custom events
				case 'draw-ground':
					self.ground = {
						width: 2.5 * self.SCALE,
						height: 1 * self.SCALE
					};
					self.ground.top = (self.HEIGHT - self.ground.height) / self.SCALE;
					self.ground.left = self.WIDTH / 2 / self.SCALE;

					self.fixDef.density = 1.0;
					self.fixDef.friction = 0.5;
					self.fixDef.restitution = 0.2;
					self.fixDef.shape = new b2PolygonShape();
					self.fixDef.shape.SetAsBox(self.ground.width / self.SCALE, self.ground.height / self.SCALE);

					self.bodyDef.position.x = self.ground.left;
					self.bodyDef.position.y = self.ground.top;
					self.bodyDef.type = b2Body.b2_staticBody;

					// half width, half height. eg actual height here is 1 unit
					self.WORLD.CreateBody(self.bodyDef).CreateFixture(self.fixDef);
					break;
				case 'draw-level':
					self.boxW = 0.5;
					self.boxH = 0.5;

					var jointDef,
						lvl = level,
						box, char,
						offset = {
							x: (self.WIDTH / 2 / self.SCALE) - 2,
							y: self.ground.top - lvl.length - 0.5
						};
					il = lvl.length;
					for (i=0; i<il; i++) {
						self.boxes.push([]);
						for (j=0; j<5; j++) {
							box = (lvl[i].charAt(j) === '0') ? false : box2Proxy.addBox(offset.x + j, offset.y + i);
							self.boxes[i].push(box);
						}
					}
					for (i=0; i<il; i++) {
						for (j=0; j<5; j++) {
							char = lvl[i].charAt(j);
							if (char === '0') continue;

							if (j > 0 && char === lvl[i].charAt(j-1)) {
								jointDef = new b2WeldJointDef();
								jointDef.bodyA = self.boxes[i][j-1];
								jointDef.bodyB = self.boxes[i][j];
								jointDef.localAnchorA = new b2Vec2(1, 0);
								jointDef.localAnchorB = jointDef.bodyA.GetLocalCenter();
								self.WORLD.CreateJoint(jointDef);
							}
							if (i > 0 && char === lvl[i-1].charAt(j)) {
								jointDef = new b2WeldJointDef();
								jointDef.bodyA = self.boxes[i-1][j];
								jointDef.bodyB = self.boxes[i][j];
								jointDef.localAnchorA = new b2Vec2(0, 1);
								jointDef.localAnchorB = jointDef.bodyA.GetLocalCenter();
								self.WORLD.CreateJoint(jointDef);
							}
						}
					}
					/*
					console.log( self.boxes[0][0]GetWorldPoint );
					for (var key in self.boxes[0][0]) console.log( key );
					var pos,
						poly;
					for (i=0; i<il; i++) {
						for (j=0; j<5; j++) {
							pos = self.boxes[0][0].GetPosition();
							poly = [];
						}
					}
					*/
				//	box2Proxy.addBox(offset.x, 1.5);
				//	box2Proxy.addHexagon(5.7, -2.5, 0.75);
					break;
			}
		},
		update: function() {
			var self = game,
				world = self.WORLD;

			world.Step(self.FR, 10, 10);
			world.DrawDebugData();
			world.ClearForces();

			self.render();

			if (!self.animationFrame) return;
			self.animationFrame = requestAnimationFrame(self.update);
		},
		debug: function() {
			//setup debug draw
			var debugDraw = new b2DebugDraw();
			debugDraw.SetSprite(this.context);
			debugDraw.SetDrawScale(this.SCALE);
			debugDraw.SetFillAlpha(0.3);
			debugDraw.SetLineThickness(1.0);
			debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
			this.WORLD.SetDebugDraw(debugDraw);
		},
		render: function() {
			var ctx = this.context,
				scale = this.SCALE,
				boxes = this.boxes,
				lvl = level,
				j, i, il = lvl.length,
				spec;

			// clear view
		//	ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
			this.debug();

			ctx.lineWidth = 1.5;
			ctx.strokeStyle = '#369';
			ctx.fillStyle = 'rgba(0,100,200,0.5)';

		//	for (i=0; i<il; i++) {
		//		for (j=0; j<5; j++) {
		//			this.boxes[i][j];
		//		}
		//	}

		//	for (; i<il; i++) {
		//		spec = boxes[i];
		//		ctx.beginPath();
		//		ctx.rect(10, 100, 100, 100);
		//		ctx.closePath();
		//		ctx.stroke();
		//		ctx.fill();
		//	}
		}
	};

	// includes
	@@include('raf.js')
	@@include('junior.js')
	@@include('box2Proxy.js')

	window.game = game;
	window.onload = game.init.bind(game);

})();
