
/* jshint ignore:start */
@@include('sizzle.min.js')
/* jshint ignore:start */

(function() {
	'use strict';

	var main = {
		init: function() {
			// fast DOM references
			this.win = jr(window);
			this.doc = jr(document);
			this.body = jr('body');
			this.tower = this.body.find('.tower');

			// init sub-objects
			for (var name in this) {
				if (typeof(this[name].init) === 'function') {
					this[name].init(this);
				}
			}

			// bind event handlers
			this.tower.on('mousedown mousemove mouseup', '.box', this.doEvent);
			this.body.on('click', '.nolink, [data-cmd]', this.doEvent);

			this.body.find('.palette > div:nth(0)').trigger('click');

			this.doEvent('add-rows', 15);
		},
		doEvent: function(event, el, orgEvent) {
			var self = main,
				cmd = (typeof event === 'string') ? event : event.type,
				srcEl,
				args,
				str,
				i, il;
			switch (cmd) {
				// native events
				case 'click':
					srcEl = this;	//event.target;
					event.preventDefault();

					srcEl = (this.nodeName === 'A')? this : srcEl;
					cmd = {
						type: this.getAttribute('href') || this.getAttribute('data-cmd'),
						arg: this.getAttribute('data-arg')
					};
					return self.doEvent(cmd, jr(this), event);
				case 'mousedown':
					self.color = '#c99';
					self.mDown = true;
					event.preventDefault();
				case 'mousemove':
					if (!self.mDown) return;
					jr(event.target).css({
						'background': self.active_color
					});
					break;
				case 'mouseup':
					self.mDown = false;

					self.doEvent('update-output');
					break;
				// custom events
				case 'add-rows':
					args = arguments[1];
					str = '';
					while (args--) {
						str += '<div class="row"><div class="box"></div><div class="box"></div><div class="box"></div><div class="box"></div><div class="box"></div></div>';
					}
					self.tower.prepend(str);
					break;
				case 'set-active-color':
					el.parent().find('.active').removeClass('active');
					el.addClass('active');
					self.active_color = el.css('background-color');
					break;
				case 'update-output':
					args = self.tower.find('.row > .box');
					i = 0;
					il = args.length;
					for (; i<il; i++) {
						console.log( jr(args[i]).css('background-color') );
					}
					break;
			}
		}
	};

	@@include('junior.js')

	window.main = main;
	window.onload = main.init.bind(main);

})();
