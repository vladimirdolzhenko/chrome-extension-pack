// Color picker class
var colorPicker = Class.extend({
	
	/** constructor
	 * @param colorArray array an array of colorcodes to choose from
	 * @param columns integer the amount of colors per row
	 * @return object
	 */
	init: function(colorArray, columns) {

		// create reference to self
		var ref = this;
		
		// default values
		if (typeof(columns) == 'undefined') columns = 12;
		if (typeof(colorArray) == 'undefined') 
		{
			// create new array
			colorArray = [];
			
			// end points of colors
			var colorSource = [
				[0, 160, 255], [0, 96, 255], [0, 64, 255], [0, 0, 255], [0, 0, 160], [0, 0, 96], [0, 0, 64], [32, 0, 32], [64, 0, 0], [96, 0, 0], [160, 0, 0], [255, 0, 0], [255, 64, 0], [255, 96, 0], [255, 160, 0], [255, 255, 0], [160, 160, 0], [96, 96, 0], [64, 64, 0], [24, 24, 0], [0, 24, 0], [0, 64, 0], [0, 96, 0], [0, 160, 0], [0, 255, 0]
			];
			
			// fill the palette with calculated colors
			$.each(colorSource, function(i, colorSet) {
				
				var diffs = {
					r: Math.round((255 - colorSet[0]) / (columns +2)),
					g: Math.round((255 - colorSet[1]) / (columns +2)),
					b: Math.round((255 - colorSet[2]) / (columns +2))
				};
				
				// calculate colors
				for (var i = 2; i < columns +2; i++)
				{
					// add color to array
					colorArray.push('#'
						+ (255 - diffs.r * i).toString(16)
						+ (255 - diffs.g * i).toString(16)
						+ (255 - diffs.b * i).toString(16)
					);
				}
				
			});
			//colorArray = [ '#FF0000', '#00FF00', '#0000FF' ];
		}
		
		// create colorpicker element
		this.div = $('<div />', { class: 'colorPicker' });
		
		// create color nodes
		$.each(colorArray, function(i, color) {
			
			// create node
			$('<span />', {
				title: color,
				style: 'background-color:' + color + '; border-color:' + color,
				click: function() {
		
					// invoke selection method
					ref.select( $(this).attr('title') )	
					
				}
				
				}).appendTo(ref.div);
			
			// insert a line break after n elements
			if (i < colorArray.length && (i % columns) >= (columns -1) )
			{
				$('<br />').appendTo(ref.div);
			}
		});
		
		// append div to DOM
		this.div.hide();
		this.div.mouseleave( function() { ref.div.hide(); });
		this.div.appendTo('body');

		// other values
		this.targetElement = '';
		this.callback = null;
	},
	
	
	/** fires upon a color is clicked on
	 * @param colorCode string The color that has been selected
	 * @return void
	 */
	select: function (colorCode) {
		
		// hide colorpicker div
		this.div.hide();

		// forward to callback
		if (this.callback != null) this.callback.call(colorCode);
		if (this.targetElement != '') 
		{
			$(this.targetElement).val(colorCode);
			$(this.targetElement).css('background-color', colorCode);
			$(this.targetElement).change();
		}
	},
	
	
	/** show the color picker at the target element
	 * @param sourceElement jQuery selector on which the box is centered
	 * @param callback function (colorCode) to be called when a color is selected.
	 * @return void
	 */
	popup: function(positionElement, callback) {
		
		// position popup
		var pos = $(positionElement).offset();
		pos.left = pos.left - this.div.width() + 18;
		pos.top = pos.top - this.div.height() / 2;
		this.div.css('left', pos.left + 'px');
		this.div.css('top', pos.top + 'px');
		
		// reference callback
		this.callback = null;
		this.targetElement = '';
		if (typeof(callback) == 'string') this.targetElement = callback;
		if (typeof(callback) == 'function') this.callback = callback;
		
		// show colorpicker div
		this.div.show();
	}
	
}); // colorPicker