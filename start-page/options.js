
/*

Extension: Bookmark Buttons Startpage
Author: Geerten van Meel
Mailto: klovadis@gmail.com
Version: 1.2.0
All rights reserved.

*/


// Controller
var bbsOptions = Class.extend({
	
	// constructor
	init: function() {
		
		// info box
		$('#version').text(localStorage['version']);
		$('#updated').text(localStorage['updated']);

		// bookmarks
		this.folders = [];
		var ref = this;
		this.getFolders(ref, '0', -1);
		this.predefinedUri = 'http://www.gvm-it.eu/bbstartpage/themes/themes.js';
		
		$('#bookmarkFolder').val(localStorage['bookmarkFolder']);
		$('#bookmarkFolder').change(function() {
			localStorage['bookmarkFolder'] = $('#bookmarkFolder').val();
		});
		
		$('#bookmarkBar').val(localStorage['bookmarkBar']);
		$('#bookmarkBar').change(function() {
			localStorage['bookmarkBar'] = $('#bookmarkBar').val();
		});
		
		// other / show big icons
		if (localStorage['showAppNames'] == 'false') 
			$('#showAppNames').attr('checked', true);

		$('#showAppNames').change( function() {
			if ($('#showAppNames').attr('checked') == true)
				localStorage['showAppNames'] = 'false';
				else localStorage['showAppNames'] = 'true';
		});


		// predefined themes
		// add onchange event handler
		$('#predefinedThemes').change( function() {
			
			// fetch data
			var themeData = window.Options.predefinedThemes[$('#predefinedThemes').val()];
			
			// set description fields
			$('#predefinedImage').attr('src', themeData.preview);
			$('#predefinedTitle').text(themeData.title);
			$('#predefinedAuthor').text(themeData.author);
			$('#predefinedAuthor').attr('href', themeData.website);
			$('#predefinedDate').text(themeData.date);
			
		});	


		// background image themes
		
		// check image repeat radio button
		if (localStorage['bgImageRepeat'] == 'repeat')
			$('#bgImageRepeatYes').attr('checked', true);
			else $('#bgImageRepeatNo').attr('checked', true);

		// onchange events on radio buttons
		$('#bgImageRepeatYes, #bgImageRepeatNo').change( function () {
			if ($('#bgImageRepeatYes').attr('checked') == true)
				localStorage['bgImageRepeat'] = 'repeat';
				else localStorage['bgImageRepeat'] = 'no-repeat';
		});


		// custom css code
		// set values and attach event handlers


		// select all elements that match a localstorage entry
		// .. to set their value to what's stored in localstorage
		// .. and to update the localstorage data on change
		$('.localStorage').each( function (i, el) {
			$(el).val(localStorage[el.id]);
			$(el).change( function() {
				localStorage[this.id] = $(this).val();
			});
		});

		// change color input boxes background colors
		$('.color').each( function (i, el) {
			$(el).css('background-color', $(el).val() );
		});

		// theme type selector
		$('#themeType').val(localStorage['themeType']);
		$('#themeType').change(function () { ref.changeThemeType(); });
		$('#themeType').change();
	},
	
	// get folders recursively
	getFolders: function (ref, folderId, level) {
		
		level++;
		var ll = '';
		for (var i = 0; i < level; i++) ll = ll + '-- ';
		if (level != 0) ll = ll + ' ';
		
		// get childnodes
		chrome.bookmarks.getChildren(folderId, function(treeNodes) {

			// parse through childnodes
			$.each(treeNodes, function (i, bm) {
				
				// only parse folders
				if (!bm.url)
				{
					// add entries to select box one
					var d = $('<option />', { value: bm.id, text: ll + bm.title }).appendTo('#bookmarkBar');
					if (localStorage['bookmarkBar'] == bm.id) d.attr('selected', '1');
					
					// second box	
					var d = $('<option />', { value: bm.id, text: ll + bm.title }).appendTo('#bookmarkFolder');				
					if (localStorage['bookmarkFolder'] == bm.id) d.attr('selected', '1');
					
					// get children
					//if (bm.children.length) 
					ref.getFolders(ref, bm.id, level);
				}
				
			});
		});
	},
	
	
	// change the theme type
	changeThemeType: function()
	{
		// hide all div's
		$('#themeFieldset div').css('display', 'none');
		
		// predefined theme
		if ($('#themeType').val() == 'predefined') 
			$('#divPredefinedTheme').css('display', 'block');

		// solid background
		if ($('#themeType').val() == 'solid') 
			$('#divSolidBackground').css('display', 'block');

		// gradient background
		if ($('#themeType').val() == 'gradient') 
			$('#divGradientBackground').css('display', 'block');

		// image background
		if ($('#themeType').val() == 'image') 
			$('#divImageBackground').css('display', 'block');

		// entirely custom theme
		if ($('#themeType').val() == 'custom') 
			$('#divCustomTheme').css('display', 'block');
		
		// show shared fields on certain options
		if (   $('#themeType').val() == 'solid'
			|| $('#themeType').val() == 'gradient'
			|| $('#themeType').val() == 'image')
		{
			$('#divSharedColors').css('display', 'block');
		}	
		
	},
	
	
	// apply the selected theme
	applyTheme: function()
	{
		// predefined theme
		if ($('#themeType').val() == 'predefined')
		{
			// fetch data
			var themeData = window.Options.predefinedThemes[$('#predefinedThemes').val()];
			localStorage['predefinedTheme'] = $('#predefinedThemes').val();
		}
		
		// single color background theme
		if ($('#themeType').val() == 'solid') 
		{
			// generate theme data
			var themeData = {
				'cssBackground': 		localStorage['clrSolidBackground'],
				'cssFrameBorder': 		localStorage['clrFrameBorder'], 
				'cssFrameBackground': 	localStorage['clrFrameBackground'],
				'cssSolidBackground': 	localStorage['clrContextBackground'],
				'cssButtonText': 		localStorage['clrButtonText'],
				'cssButtonHover': 		localStorage['clrButtonHover']
			};
		}
		
		// color gradient background theme
		if ($('#themeType').val() == 'gradient') 
		{
			// generate css property
			var bg = '-webkit-gradient(linear, ' 
				+ localStorage['gradientDirection'] 
				+ ', from(' + localStorage['gradientColor1'] 
				+ '), to(' + localStorage['gradientColor2'] + '))';
			
			// generate theme data
			var themeData = {
				'cssBackground': 		bg, 
				'cssFrameBorder': 		localStorage['clrFrameBorder'], 
				'cssFrameBackground': 	localStorage['clrFrameBackground'],
				'cssSolidBackground': 	localStorage['clrContextBackground'],
				'cssButtonText': 		localStorage['clrButtonText'],
				'cssButtonHover': 		localStorage['clrButtonHover']
			};
		}
		
		// image background theme
		if ($('#themeType').val() == 'image') 
		{
			// generate css property
			var bg = 'url(' + localStorage['bgImageUri'] + ') ' + localStorage['bgImageRepeat'] + ' ' + localStorage['bgImagePosition'] + ' ' + localStorage['bgImageBackground'];
			
			// generate theme data
			var themeData = {
				'cssBackground': 		bg, 
				'cssFrameBorder': 		localStorage['clrFrameBorder'], 
				'cssFrameBackground': 	localStorage['clrFrameBackground'],
				'cssSolidBackground': 	localStorage['clrContextBackground'],
				'cssButtonText': 		localStorage['clrButtonText'],
				'cssButtonHover': 		localStorage['clrButtonHover']
			};
		}
		localStorage['bgImageRepeat']
		
		// custom theme code
		// if ($('#themeType').val() == 'custom')  {}
		
		// set css fields
		$.each(['cssFrameBorder', 'cssFrameBackground', 'cssSolidBackground', 'cssBackground', 'cssButtonText', 'cssButtonHover'], function (k, v) {
			
			// validate css code
			
			// assign css values if custom css code is not chosen
			if ($('#themeType').val() != 'custom')
			{ 
				// assign computed values to input fields
				$('#' + v).val(themeData[v]);
				localStorage[v] = themeData[v];
			} else {
				// fetch value from input fields
				localStorage[v] = $('#' + v).val();
			}
		});
		
		// load updater to apply theme
		window.Options.updater(function() {	
			localStorage['themeType'] = $('#themeType').val();
			window.Updater.buildTheme( function() {
				// show message
				window.Updater.message({ 'title': 'Theme has been applied.', 'fade': 1 });
			});
		});
	},
	
	
	// load themes from gvm-it.eu
	fetchPredefined: function()
	{
		// fetch themes
		$.getScript(this.predefinedUri, function() {

			// empty container
			$('#predefinedThemes').empty();
		
			// store data
			window.Options.predefinedThemes = window.themeList;

			// add themes to select-element
			$.each(window.themeList, function(themeName, themeData) {
			
				// create element
				var d = $('<option />', { value: themeName, text: themeData.title }).appendTo('#predefinedThemes');
				
			});
			
			// fire 'change' event
			$('#predefinedThemes').val(localStorage['predefinedTheme']);
			$('#predefinedThemes').change();
		});
	},
	
	// load updater class
	updater: function(callback)
	{
		// load updater only once
		if (!window.Updater) 
		{
			// load updater script
			$.getScript('updater.js', function() {
	
				// create updater class and 'reinstall' extension
				window.Updater = new bbsUpdater();
				if (typeof(callback) == 'function') callback.call(window.Options);
	
			});
		} else {
			// call callback function directly
			if (typeof(callback) == 'function') callback.call(window.Options);
		}
	},
	
	// reset to default settings
	defaultSettings: function()
	{
		if (!confirm('Are you sure that you want to reset all settings to their defaults?')) return;
		
		// load updater script
		window.Options.updater(function() {

			// 'reinstall' extension
			window.Updater.install();			
			
			// load default theme
			window.Updater.buildTheme( function() {
				// reload page
				location.reload();
			});
		});
	},
	
});


// load the extension, in order to avoid that crome is not ready
function bbsLoader()
{
	try {
		
		// try to access chrome API
		var d = chrome;
		var d = chrome.tabs;
		var d = chrome.i18n;
		var d = chrome.bookmarks;
		var d = chrome.management;
		
		// clear timeout
		if (window.loaderTimeout)
			window.clearTimeout(window.loaderTimeout);	
		
		
	} catch (err) {
		
		// retry loading the extension
		window.loaderTimeout = window.setTimeout('bbsLoader()', 100);
		return;
	}
	
	// load options controller
	window.Options = new bbsOptions();
	
	// fetch themes
	window.Options.fetchPredefined();
	
	// create color picker
	window.Colors = new colorPicker();
	
	// add tooltips to buttons
	$('button.colorPicker').attr('title', 'Pick a color');
}


// on domready, load loader
$(document).ready( bbsLoader );
