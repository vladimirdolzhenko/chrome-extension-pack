
/*

Updater app

*/


// Controller
var bbsUpdater = Class.extend({
	
	// constructor
	init: function() { },
	
	// (re-)install all localstorage values
	install: function() {
		
		// clear existing settings
		localStorage.clear();

		// set default settings
		localStorage['newtabCaption'] = 'true'; 	// display "new tab" heading
		localStorage['bookmarkBar'] = '1';		// folder in the top bar
		localStorage['bookmarkFolder'] = '2';	// folder in bottom bar
		localStorage['showAppNames'] = 'false';	// show text in top bar
		localStorage['version'] = '1.2';
		localStorage['updated'] = '2011-11-03';
		
		// theme data
		localStorage['themeCss'] = '';
		localStorage['themeType'] = 'predefined';
		localStorage['predefinedTheme'] = 'default';		
		
		// for a background gradient
		localStorage['gradientDirection'] = 'center top, right bottom';
		localStorage['gradientColor1'] = '#7895b6';
		localStorage['gradientColor2'] = '#FFFFFF';
		
		// for a solid background color
		localStorage['clrSolidBackground'] = '#7895b6';

		// for a background image, use whitesand image
		localStorage['bgImageUri'] = 'http://www.gvm-it.eu/bbstartpage/themes/img/theme_whitesand.jpg';
		localStorage['bgImageRepeat'] = 'repeat';
		localStorage['bgImagePosition'] = 'center';
		localStorage['bgImageBackground'] = '';
		// solidBackground

		// shared fields, default to default theme
		localStorage['clrFrameBorder'] = '#122260';
		localStorage['clrFrameBackground'] = '#F0F0F0';
		localStorage['clrButtonText'] = '#000000';
		localStorage['clrButtonHover'] = '#d7e0e9';
		localStorage['clrContextBackground'] = '#FFFFFF';
		
		// actual css values
		localStorage['cssFrameBorder'] = '#122260';
		localStorage['cssFrameBackground'] = 'rgba(255, 255, 255, 0.8)';
		localStorage['cssSolidBackground'] = '#FFFFFF';
		localStorage['cssBackground'] = '-webkit-gradient(linear, center top, right bottom, from(#7895b6), to(#FFFFFF))';
		localStorage['cssButtonText'] = '#000000';
		localStorage['cssButtonHover'] = 'rgba(25, 70, 125, 0.10)';
		
		// mark extension as being set up
		localStorage['installed'] = 'true';
	},
	
	
	// build a theme from supplied values
	buildTheme: function(callback)
	{
		// load theme.css and replace template vars
		$.get('theme.css', function (styleCode) {
			
			$.each(['cssFrameBorder', 'cssFrameBackground', 'cssSolidBackground', 'cssBackground', 'cssButtonText', 'cssButtonHover'], function (k, v) {

				// replace values in css template
				var r = new RegExp('\\{\\$' + v + '\\}', 'gi');
				styleCode = styleCode.replace(r, localStorage[v]);
			});
			
			// store style into local storage
			localStorage['themeCss'] = styleCode;
			
			// add css code to page
			if (window.BBS) window.BBS.applyTheme();
			
			// call callback function
			if (typeof(callback) == 'function') callback.call(); 
		});
	},
	
	
	// info popup	
	/*
		'title': 'Test Popup!',
		'close': 'Close',
		'html': '<p>HTML here</p>',
		'text': 'text here'
		'fade' 
	*/
	message: function(data)
	{
		// make sure that preferences is set
		if (typeof(data) != 'object') var data = {};
		if (!data.title) data.title = 'Notification';
		if (!data.close) data.close = 'Okay'; 
		if (!data.fade) data.fade = 0;
		if (!data.width) data.width = 320;
		if (!data.align) data.align = 'left';
		
		// create container
		var popup = $('<div />', { class: 'popup' });
		popup.css('width', data.width + 'px');

		// create heading
		if (data.text || data.html)
		{
			// less prominent heading
			$('<h3 />', { text: data.title }).appendTo(popup);
			
			// text content
			if (data.text) 
			{
				$('<p />', { text: data.text })
					.css('text-align', data.align)
					.appendTo(popup);
			}
			
			// html content
			if (data.html) $(data.html).appendTo(popup);
			
		} else {
			// bigger heading
			$('<h2 />', { text: data.title }).appendTo(popup);
		}
		
		// create 'close' button
		$('<button />', { 
			text: data.close,
			click: function() {
				popup.clearQueue().fadeOut(400, function() { popup.detach(); });
				if (typeof(data.onclose) == 'function') data.onclose.call();
			} 
		}).appendTo(popup);

		
		// shiny effect
		popup.hide().fadeIn(200);
		
		// fade out after data.fade seconds
		if (data.fade > 0) 
			popup.delay(data.fade * 1000)
				.fadeOut(800, function() { popup.detach(); });
		
		// append div to DOM
		popup.appendTo('body');
		
		// center div
		popup.css('left', ( window.innerWidth / 2 -  popup.innerWidth() / 2 ) + 'px');
		popup.css('top', ( pageYOffset + window.innerHeight / 2 - popup.innerHeight() / 2 ) + 'px');

	}
	
});
