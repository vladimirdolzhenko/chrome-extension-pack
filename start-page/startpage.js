/*

Extension: Bookmark Buttons Startpage
Author: Geerten van Meel
Mailto: klovadis@gmail.com
Version: 1.2.1
All rights reserved.

*/


// Controller
var bbsExtension = Class.extend({
	
	// constructor
	init: function() {

		this.top = {
			'x': 8,
			'y': -1,
			'n': 0,
			'rows': 10,
			'cols': 10,
			'offsetX': 18,
			'offsetY': 32,
			'buttonWidth': 95,
			'buttonHeight': 95,
			'div': $('#divFavs')
		};
		
		this.bottom = {
			'x': 8,
			'y': -1,
			'n': 0,
			'rows': 10,
			'cols': 10,
			'offsetX': 35,
			'offsetY': 22,
			'buttonWidth': 95,
			'buttonHeight': 95,
			'div': $('#divBookmarks')
		};

		// start off with checking the hash
		if (history.length == 1) this.hashCheck();

		// check whether this extension has been installed
		if (localStorage.installed != 'true')
		{
			// load updater script
			this.updater(function() {

				// 'reinstall' extension
				window.Updater.install();	

				
				// load default theme
				window.Updater.buildTheme( function() {

					// add css code to page
					window.BBS.applyTheme();

					// call constructor again
					//window.BBS.init();
					$('#divFavs, #divBookmarks').hide();

					// show info popup
					window.Updater.message({ 
						'title': window.BBS.msg('popup_installed_caption'), 
						'text': window.BBS.msg('popup_installed_text'),
						'close': window.BBS.msg('popup_button_continue'),
						'width': 420,
						'onclose': function() { location.reload(); }
					});
					
					
				});
			});
		
			// stop execution of constructor
			return;
		}
		
		// which folder to show in top bar?
		if (typeof(localStorage['bookmarkBar']) == 'undefined')
			localStorage['bookmarkBar'] = '1';
		
		// which folder to start from in the bottom container
		if (!this.currentFolder) 
			this.currentFolder = localStorage['bookmarkFolder'];
		if (!this.currentFavorites) 
			this.currentFavorites = localStorage['bookmarkBar'];		
		
		// change page title
		document.title = this.msg('title_new_tab');

		// remove "loading" notice
		$('#divBookmarks p.notice').detach();

		// add empty bookmarks notice
		$('<p />', { class: 'notice', text: this.msg('msg_empty_folder') })
			.appendTo('#divBookmarks');

		// add empty favorites notice
		$('<p />', { class: 'notice', text: this.msg('msg_empty_favs') })
			.appendTo('#divFavs');
			
		// add a notice about apps and bookmarks bar
		$('<span />', { 'text': '?', 'title': this.msg('apps_tooltip') }).appendTo('#divFavs');
		
		// add event listener
		$(window).bind( 'hashchange', this.hashCheck );
		
	},


	// checks if the hash changes
	hashCheck: function(e)
	{
		// #!url: open a (bookmark) url
		if (location.hash.substr(0, 6) == '#!url:') 
		{
			// extract url from hash
			var newUrl = unescape(location.hash.substr(6));
			
			// enable back button
			history.replaceState({}, 'New Tab', '#');
			
			// update tab location
			chrome.tabs.getCurrent(function (t) {
				chrome.tabs.update(t.id, {url: newUrl })
			});
			return; 
		}
		
		// #!topFolder: open a favorites folder
		if (location.hash.substr(0, 12) == '#!topFolder:') 
		{
			// extract url from hash
			var newFolder = unescape(location.hash.substr(12));
			
			// go to specified folder
			if (window.BBS) return window.BBS.favorites(newFolder);
			this.currentFavorites = newFolder;
			return;
		}
		
		// #!folder: open a bookmark folder
		if (location.hash.substr(0, 9) == '#!folder:') 
		{
			// extract url from hash
			var newFolder = unescape(location.hash.substr(9));

			// go to specified folder
			if (window.BBS)	return window.BBS.folder(newFolder);
			this.currentFolder = newFolder;
			return;
		}
		
		if (window.BBS && (location.hash == '#' || location.hash == ''))
		{
			// display favorites and other folders
			window.BBS.favorites(localStorage['bookmarkBar']);
			window.BBS.folder(localStorage['bookmarkFolder']);
			return;
		}
	},


	// create a new icon 
	createButton: function(properties)
	{
		
		var buttonImage = properties.icon;
		var buttonHref = properties.href;
		var buttonTooltip = properties.tooltip;
		var buttonCaption = properties.caption;
		
		if (properties.container == 'top') 
		{
			// top container
			var container = BBS.top;
		} else {
			// bottom container
			var container = BBS.bottom;
		}
		
		// get icon coordinates
		container.x++;
		container.n++;
		if (container.x >= container.cols)
		{
			container.x = 0;
			container.y++;
			container.div.css('height', (container.offsetY + container.buttonHeight * (container.y +1)) + 'px');
			// if container.y >= container.rows) ..
		}
		
		// create button
		var button = $('<a class="icon"><table><tr><td><img /></tr></td><tr><td></tr></td></table></a>');
		
		// set button properties
		$('img', button).attr('src', buttonImage );
		$('img', button).attr('alt', buttonTooltip);
		button.css('left', (container.offsetX + container.x * container.buttonWidth) + 'px');
		button.css('top', (container.offsetY + container.y * container.buttonHeight) + 'px');
		button.attr('title', buttonTooltip);
		button.attr('href', buttonHref);
		//icon.attr('tabindex', BBS.favN);
		
		// add caption or enlarge icons for buttons without caption
		if (buttonCaption != '') 
			$('td', button)[1].innerHTML = buttonCaption;
			else $('img', button).addClass('large');		

		// right click context menu
		if (properties.context)
		{
			// set context info
			$.data(button, 'context', properties.context);
			
			// add event handler
			button.bind('contextmenu', function(event) {
				
				// prevent default context menu
				event.preventDefault();
				
				// another context menu is open
				if (typeof(BBS.context) != 'undefined') 
				{
					BBS.context.remove();
					delete BBS.popup;
				}
				
				// create new popup
				BBS.context = new bbsContextMenu(button, event.pageX, event.pageY);
			});
		}

		// append element to container
		container.div.append(button);
		
		// return element reference
		return button;
	},

	
	// show the favorites bar
	favorites: function(folderId)
	{
		// remove existing buttons
		$('#divFavs a.icon').detach();
		BBS.top.x = BBS.top.rows;
		BBS.top.y = -1;
		BBS.top.n = 0;
		
		// defaults to bookmarkBar folder
		if (typeof(folderId) == 'undefined') 
			folderId = BBS.currentFavorites;
		
		// only show apps when we're in the bookmark bar folder
		if (folderId == localStorage['bookmarkBar'])
		{
			// get installed extensions
			chrome.management.getAll(function (extensions) {
				
				// parse through extensions and apps
				$.each(extensions, function (index, app) {
					
					// do not parse extensions, webstore apps only
					if (app.isApp)
					{
						
						var properties = {
							'container': 'top',
							'icon': app.icons[app.icons.length -1].url,
							'href': '#!url:' + escape(app.appLaunchUrl),
							'tooltip': app.name,
							'caption': app.name,
							'context': 'app'
						};
						
						// optionally hide app names
						if (localStorage['showAppNames'] == 'false') properties.caption = '';
						
						// create button
						var button = BBS.createButton(properties);
						
						// add context menu info
						$.data(button, 'id', app.id);
						$.data(button, 'title', app.name);
						$.data(button, 'href', app.appLaunchUrl);
					}
				});

			});		
		}
		
		// add back button
		if (folderId != localStorage['bookmarkBar'])
		{
			// create back button
			chrome.bookmarks.get(folderId, function(bm) {
				if (localStorage['showAppNames'] == 'false') 
					var dCaption = ''; else var dCaption = 'back';
					
				var backButton = BBS.createButton({
					'container': 'top',
					'icon': 'img/btnback2.png',
					'href': '#!topFolder:' + bm[0].parentId,
					'tooltip': 'Go to parent folder',
					'caption': dCaption
					});
					
				// prohibit right click
				backButton.bind('contextmenu', function(event) { event.preventDefault(); });
			});
		}
		
		// load "bookmark bar" bookmarks in the top container
		if (folderId != '-1')
		{
			// load favorites
			chrome.bookmarks.getChildren(folderId, function (treeNodes) {
		
				// parse through nodes
				$.each(treeNodes, function (index, bookmark) {
					
					if (bookmark.url)
					{
						// we have an actual bookmark
						// create button dom
						var button = BBS.createButton({
							'container': 'top',
							'icon': 'chrome://favicon/' + bookmark.url,
							'href': '#!url:' + escape(bookmark.url),
							'tooltip': bookmark.url,
							'caption': bookmark.title,
							'context': 'bookmark'
						});
						
						// add context menu info
						$.data(button, 'id', bookmark.id);
						$.data(button, 'title', bookmark.title);
						$.data(button, 'href', bookmark.url);
						
					} else {
						// we have a bookmark folder
						// create button dom
						var button = BBS.createButton({
							'container': 'top',
							'icon': 'img/btnfolder.png',
							'href': '#!topFolder:' + bookmark.id,
							'tooltip': bookmark.title,
							'caption': bookmark.title,
							'context': 'folder'
						});
						
						// add context menu info
						$.data(button, 'id', bookmark.id);
						$.data(button, 'title', bookmark.title);
					}
					
				});
				
			});
		}
	},
	
	
	// create the chrome links bars
	links: function()
	{
		// create links only when they are currently not present
		if (!$('#pOther a').length)
		{			
			// empty container
			$('<p />', { id: 'pOther' }).appendTo('#divFavs');
		
			// links for history, downloads, bookmarks, extensions
			$.each(['history', 'downloads', 'bookmarks', 'extensions'], function (i, v) {
				$('<a />', {
					'href': "#!url:" + escape("chrome://" + v),
					'title': BBS.msg('link_' + v + '_tooltip'),
					'text': BBS.msg('link_' + v),
					'click': /*window.BBS.hashCheck*/ function () {}
				}).appendTo('#pOther');
			});
			
			// webstore
			$('<a />', {
				'href': "#!url:https://chrome.google.com/webstore",
				'title': BBS.msg('link_webstore_tooltip'),
				'text': BBS.msg('link_webstore')
			}).appendTo('#pOther');
			
			// options
			$('<a />', {
				'href': "options.html",
				'title': BBS.msg('link_options_tooltip'),
				'text': BBS.msg('link_options')
			}).appendTo('#pOther');
		}
	},	
	

	// display a bookmarks folder
	folder: function(folderId)
	{		
		// default folder is 'other bookmarks'
		if (!folderId) folderId = BBS.currentFolder;
			else BBS.currentFolder = folderId;
			
		// don't show folder at all
		if (folderId == '-1') 
		{
			$('#divBookmarks').hide();
			$('#divFavs').addClass('noBookmarks');
			return;
		}

		// remomve bookmark nodes
		$('#divBookmarks a.icon').detach();
		$('#divBookmarks a.btnBack').detach();

		// show empty notice
		$('#divBookmarks p.notice').css('display', 'block');
		$('#divBookmarks').css('height', (BBS.bottom.offsetY + BBS.bottom.buttonHeight) + 'px');
		
		// reset coordinates
		BBS.bottom.x = BBS.bottom.cols;
		BBS.bottom.y = -1;	
		BBS.bottom.n = 0;

		// create back button
		if (BBS.currentFolder != '0')
		{
			// create back button
			chrome.bookmarks.get(BBS.currentFolder, function(bm) {
				
				// create and label back button
				$('<a />', {
					href: '#!folder:' + bm[0].parentId,
					class: 'btnBack',
					title: BBS.msg('backbutton_tooltip')
					}).appendTo('#divBookmarks');
				
				// label caption
				$('#h2Bookmarks').text(bm[0].title);
			});
			
		} else {
			// .. or apply top folder title
			$('#h2Bookmarks').text(BBS.msg('title_all_bookmarks'));
		}
		
		// fetch bookmark node children
		chrome.bookmarks.getChildren(folderId, function (treeNodes) {
			
			// parse through nodes
			$.each(treeNodes, function (index, bookmark) {
	
				if (bookmark.url)
				{
					// create button dom
					var button = BBS.createButton({
						'container': 'bottom',
						'icon': 'chrome://favicon/' + bookmark.url,
						'href': '#!url:' + escape(bookmark.url),
						'tooltip': bookmark.url,
						'caption': bookmark.title,
						'context': 'bookmark'
					});
					
					// add context menu info
					$.data(button, 'id', bookmark.id);
					$.data(button, 'title', bookmark.title);
					$.data(button, 'href', bookmark.url);
				
				} else {
					// we have a bookmark folder
					// create button dom
					var button = BBS.createButton({
						'container': 'bottom',
						'icon': 'img/btnfolder.png',
						'href': '#!folder:' + bookmark.id,
						'tooltip': bookmark.title,
						'caption': bookmark.title,
						'context': 'folder'
					});
					
					// add context menu info
					$.data(button, 'id', bookmark.id);
					$.data(button, 'title', bookmark.title);
				}
			});
			// change size of the back button
			$('#divBookmarks a.btnBack').css('height', ($('#divBookmarks').innerHeight() - 90) + 'px'); 
			if (BBS.bottom.n > 0) $('#divBookmarks p.notice').css('display', 'none');
			$(document.body).css('display', 'block');
		});
	},
	
	
	// load the current theme
	applyTheme: function()
	{
		// check if theme code exists
		if (!localStorage['themeCss'] || localStorage['themeCss'] == '') 
		{
			// load theme via updater and apply it
			this.updater(function() {
				return window.Updater.buildTheme();
			});
		}
		
		// remove old <style> instance, if it exists
		if (document.getElementById('themeCss'))
		{
			// remove it
			var el = document.getElementById('themeCss');
			el.parentNode.removeChild(el);
		}
		
		// append css code to dom
		var el = document.createElement('style');
		el.setAttribute('id', 'themeCss');
		el.innerHTML = localStorage.themeCss;
		document.head.appendChild(el);
	},
	
	
	// get a message from the chrome.i18n module
	msg: function(message_id)
	{
		// one argument
		if (arguments.length == 1)	
			return chrome.i18n.getMessage(message_id);
		
		// more arguments
		message_id = arguments.shift();
		return chrome.i18n.getMessage(message_id, arguments);
	},
	
	
	// load updater class
	updater: function(callback)
	{
		// load updater only once
		if (window.Updater) return;

		// load updater script
		$.getScript('updater.js', function() {

			// create updater class and 'reinstall' extension
			window.Updater = new bbsUpdater();
			if (typeof(callback) == 'function') callback.call();
		});
	}
	
});



var bbsContextMenu = Class.extend({
	
	init: function(element, mx, my)
	{
		// fetch info
		this.context = $.data(element, 'context');
		this.id = $.data(element, 'id');
		this.title = $.data(element, 'title');
		this.div = $('<div />', { class: 'context' });
		this.div.css('left', (mx - 80) + 'px');
		this.div.css('top', (my - 24) + 'px');
		this.el = element;
		
		// create according context menus
		if (this.context == 'app') this.application();
		if (this.context == 'bookmark') this.bookmark();
		if (this.context == 'folder') this.folder();
		
		// remove context menu when the mouse leaves it
		this.div.mouseleave(function() {
			BBS.context.remove();
		});

		// append context menu to dom
		this.div.appendTo('body');
	},
	
	
	// create a web app context menu
	application: function()
	{
		$('<h3 />', { text: this.title }).appendTo(this.div);

		// launch app
		$('<a />', { 
			text: 'Launch App', 
			href: '#!url:' + escape($.data(this.el, 'href'))
		}).appendTo(this.div);

// https://chrome.google.com/webstore/search?q=test

		// search in webstore
		$('<span />', { 
			text: 'Search in webstore', 
			click: function () { 
				location.href = 'https://chrome.google.com/webstore/search?q=' + escape(BBS.context.title);
			}
		}).appendTo(this.div);
		// uninstall app
		$('<span />', { 
			text: 'Uninstall App', 
			click: function () { 
				// uninstall the app
				BBS.context.remove();
				if (!confirm('Are you sure that you want to uninstall the app "' + BBS.context.title + '"?')) return;	
				chrome.management.uninstall(BBS.context.id);
				BBS.favorites();
			}
		}).appendTo(this.div);
	},
	
	
	// create a bookmark context menu
	bookmark: function ()
	{
		// caption
		$('<h3 />', { text: 'Bookmark' }).appendTo(this.div);

		// open bookmark in current tab
		$('<a />', { 
			text: 'Open in current tab', 
			href: '#!url:' + escape($.data(this.el, 'href'))
		}).appendTo(this.div);

		// open bookmark in new tab
		$('<a />', { 
			text: 'Open in new tab', 
			href: $.data(this.el, 'href'),
			target: '_BLANK'
		}).appendTo(this.div);
		
		// spacer
		$('<hr />').appendTo(this.div);
		
		// manage bookmarks
		$('<a />', { 
			text: 'Manage Bookmarks', 
			href: '#!url:chrome://bookmarks'
		}).appendTo(this.div);
		
		// rename a bookmark
		$('<span />', { 
			text: 'Edit bookmark title', 
			click: function () { 	
				// rename the bookmark
				var newTitle = prompt('Enter a new name for this bookmark:', BBS.context.title); 
				if (newTitle == null || newTitle == '') return;
				chrome.bookmarks.update( BBS.context.id, { title: newTitle }, function () { BBS.folder(); });
			}
		}).appendTo(this.div);
		
		// edit the bookmarks url
		$('<span />', { 
			text: 'Edit bookmark url', 
			click: function () {
				// rename the bookmark
				var newHref = prompt('Edit the location of this bookmark:' + BBS.context.title, $.data(BBS.context.el, 'href')); 
				if (newHref == null || newHref == '') return;
				chrome.bookmarks.update( BBS.context.id, { url: newHref }, function () { BBS.folder(); });		
			}
		}).appendTo(this.div);
		
		// delete this bookmark
		$('<span />', { 
			text: 'Delete bookmark', 
			click: function () { 	
				// delete the folder
				var choice = confirm(BBS.context.title + '\n\n Are you sure that you want to delete this bookmark?'); 
				if (choice != true) return;
				chrome.bookmarks.remove( BBS.context.id, function () { BBS.folder(); });
			}
		}).appendTo(this.div);
	},
	
	
	// create a bookmark folder context menu
	folder: function()
	{
		// caption
		$('<h3 />', { text: this.title }).appendTo(this.div);
	
		// rename folder
		$('<span />', { 
			text: 'Open all bookmarks in this folder', 
			click: function () {
				
				// load bookmarks in current folder
				// does not include childnodes
				chrome.bookmarks.getChildren(BBS.context.id, function (treeNodes) {
		
					// parse through nodes
					$.each(treeNodes, function (index, bookmark) {
						
						// create a new tab per bookmark
						if (bookmark.url != '')	chrome.tabs.create({ url: bookmark.url});
					});
					
					// close current tab
					chrome.tabs.getCurrent( function (currentTab) {
						chrome.tabs.remove(currentTab.id);
					});
				});
			}
		}).appendTo(this.div);

		// spacer
		$('<hr />').appendTo(this.div);

		// manage bookmarks
		$('<a />', { 
			text: 'Manage Bookmarks', 
			href: '#!url:chrome://bookmarks'
		}).appendTo(this.div);

		// rename folder
		$('<span />', { 
			text: 'Rename folder', 
			click: function () {
				// rename the folder
				var newTitle = prompt('Enter a new name for this folder:', BBS.context.title); 
				if (newTitle == null || newTitle == '') return;
				chrome.bookmarks.update( BBS.context.id, { title: newTitle }, function () { BBS.folder(); });
			}
		}).appendTo(this.div);

		// delete folder
		$('<span />', { 
			text: 'Delete folder', 
			click: function () {
				// delete the folder
				var choice = confirm('Folder: ' + BBS.context.title + '\n\n Are you sure that you want to delete this folder and all of its contents? This action cannot be undone.'); 
				if (choice != true) return;
				chrome.bookmarks.removeTree( BBS.context.id, function () { BBS.folder(); });
			}
		}).appendTo(this.div);
		
	},
	
	
	// remove the popup
	remove: function()
	{
		this.div.detach();
	}
	
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
	
	// load controller out of try/catch statement
	window.BBS = new bbsExtension();
	
	// apply theme css
	window.BBS.applyTheme();
	
	// create links
	window.BBS.links();

	// display favorites
	window.BBS.favorites();
		
	// display other folder
	window.BBS.folder();
}


// on domready, load loader
$(document).ready( bbsLoader );


