/**
 * Placed clock canvas into html element with parameter id
 * uses settings stored it localStorage
 *
 * @param divid
 */

 var lastId = 0;
 var radius = 120;
 var defaultName = chrome.i18n.getMessage("current_time");
 var settings = "clock_list";
 var defaultClocks = [{id : 0, title: defaultName, gmt: (new Date().getTimezoneOffset() / 60 * -1)}];
 var maxAllowed = 6;

 function findPosX(obj) {
    var curleft = 0;
    if (obj.offsetParent) {
        while (1) {
            curleft+=obj.offsetLeft;
            if (!obj.offsetParent) {
                break;
            }
            obj=obj.offsetParent;
        }
    } else if (obj.x) {
        curleft+=obj.x;
    }
    return curleft;
}

function findPosY(obj) {
    var curtop = 0;
    if (obj.offsetParent) {
        while (1) {
            curtop+=obj.offsetTop;
            if (!obj.offsetParent) {
                break;
            }
            obj=obj.offsetParent;
        }
    } else if (obj.y) {
        curtop+=obj.y;
    }
    return curtop;
}

var timeZones = [
        {value:"-12",label:"(GMT -12:00) Eniwetok, Kwajalein"},
        {value:"-11",label:"(GMT -11:00) Midway Island, Samoa"},
        {value:"-10",label:"(GMT -10:00) Hawaii"},
        {value:"-9",label:"(GMT -9:00) Alaska"},
        {value:"-8",label:"(GMT -8:00) Pacific Time (US &amp; Canada)"},
        {value:"-7",label:"(GMT -7:00) Mountain Time (US &amp; Canada)"},
        {value:"-6",label:"(GMT -6:00) Central Time (US &amp; Canada), Mexico City"},
        {value:"-5",label:"(GMT -5:00) Eastern Time (US &amp; Canada), Bogota, Lima"},
        {value:"-4.5",label:"(GMT -4:30) Caracas"},
        {value:"-4",label:"(GMT -4:00) Atlantic Time (Canada), La Paz"},
        {value:"-3.5",label:"(GMT -3:30) Newfoundland"},
        {value:"-3",label:"(GMT -3:00) Brazil, Buenos Aires, Georgetown"},
        {value:"-2",label:"(GMT -2:00) Mid-Atlantic"},
        {value:"-1",label:"(GMT -1:00) Azores, Cape Verde Islands"},
        {value:"0",label:"(GMT) Western Europe Time, London, Lisbon, Casablanca"},
        {value:"1",label:"(GMT +1:00) Brussels, Copenhagen, Madrid, Paris"},
        {value:"2",label:"(GMT +2:00) Kaliningrad, South Africa"},
        {value:"3",label:"(GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg"},
        {value:"3.5",label:"(GMT +3:30) Tehran"},
        {value:"4",label:"(GMT +4:00) Abu Dhabi, Muscat, Baku, Tbilisi"},
        {value:"4.5",label:"(GMT +4:30) Kabul"},
        {value:"5",label:"(GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent"},
        {value:"5.5",label:"(GMT +5:30) Bombay, Calcutta, Madras, New Delhi"},
        {value:"5.75",label:"(GMT +5:45) Kathmandu"},
        {value:"6",label:"(GMT +6:00) Almaty, Dhaka, Colombo"},
        {value:"6.5",label:"(GMT +6:30) Rangoon"},
        {value:"7",label:"(GMT +7:00) Bangkok, Hanoi, Jakarta"},
        {value:"8",label:"(GMT +8:00) Beijing, Perth, Singapore, Hong Kong"},
        {value:"9",label:"(GMT +9:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk"},
        {value:"9.5",label:"(GMT +9:30) Adelaide, Darwin"},
        {value:"10",label:"(GMT +10:00) Eastern Australia, Guam, Vladivostok"},
        {value:"11",label:"(GMT +11:00) Magadan, Solomon Islands, New Caledonia"},
        {value:"12",label:"(GMT +12:00) Auckland, Wellington, Fiji, Kamchatka"},
        {value:"13",label:"(GMT +13:00) Nuku'alofa"}
    ];

function getIndexByOffset(val) {
	for(var i in timeZones) {
		if( timeZones[i].value == val) {
			return i;
		}
	}
	return -1;
}

function getOffsetById(id) {
	var clocks = loadClocks();
	for(var i in clocks) {
		if(clocks[i].id == id) {
			return clocks[i].gmt;
		}
	}
	return 0;
}

function selectGmtOffset() {
	var wrappers = document.querySelectorAll("div.clock_wrapper");
	for(var i in wrappers) {
		if(typeof wrappers[i]  != "object") {
			continue;
		}

		var select = wrappers[i].querySelectorAll("select")[0];
		var id  =  wrappers[i].getAttribute("clockid");
		var offset = getOffsetById(id);

		for(var j in select.options) {
			if(typeof select.options[j] != "object") {
				continue;
			}

			if( select.options[j].getAttribute("val") == offset) {
				select.selectedIndex = j;
			}
		}
	}
}

document.addEventListener('DOMContentLoaded', function () {
    var clockPlace = document.getElementById('worldclock');
	clockPlace.setAttribute("class", "worldclock_less");

	clockPlace.innerHTML = "";

	var clocks = loadClocks();
	if( localStorage[settings] == undefined) {
		clocks = defaultClocks;
		saveClocks(clocks);
	}

	if(clocks.length > 3) {
		clockPlace.setAttribute("class", "worldclock_more");
	}

	for(var i in clocks) {
			var clockSettings = {
				'Skin': localStorage.getItem('Skin') || 'swissRail',
				'Radius': radius,
				'noSeconds': localStorage.getItem('noSeconds') || '', //'noSeconds',
				'GMTOffset': clocks[i].gmt,
				'showDigital' : 'showDigital'
			}

			var clockCanvas = '<div class="clock_wrapper" clockid="'+clocks[i].id+'">'
				+ '<span class="city_name">'+ clocks[i].title +'</span><canvas id="c'+ (lastId++) +'" class="CoolClock:'
				+ clockSettings.Skin + ':'
				+ clockSettings.Radius + ':'
				+ (clockSettings.noSeconds.length > 0 ? clockSettings.noSeconds : '') + ':'
				+ clockSettings.GMTOffset + ':'
				+ clockSettings.showDigital
				+ '"></canvas>'
				+ '<div id="select_div" class="invisible"><select>';

				for(var j in timeZones) {
					clockCanvas += '<option val="'+ timeZones[j].value +'">' + timeZones[j].label + "</option>";
				}

				clockCanvas +='</select></div><div class="cont"></div>';
				clockCanvas += '</div>';
			clockPlace.innerHTML += clockCanvas;
	}

    CoolClock.findAndCreateClocks();
	addEventListeners();
	localize();
	selectGmtOffset();
});

function localize() {
	var elm = document.getElementById("btn_settings");
	elm.title= chrome.i18n.getMessage("settings");

	var elm = document.getElementById("btn_add");
	elm.title= chrome.i18n.getMessage("add_clock");

	var elm = document.getElementById("btn_apply");
	elm.title= chrome.i18n.getMessage("close_edit");
}

function addClock() {
	var clocks = loadClocks();
	if( clocks.length >= maxAllowed ) {
		alert(chrome.i18n.getMessage("max_warning"));
		return false;
	}

	var gmtOffset = new Date().getTimezoneOffset() / 60 * -1;
	var clockPlace = document.getElementById('worldclock');
	if(clocks.length == 3) {
		clockPlace.setAttribute("class", "worldclock_more");
	}

	var clockSettings = {
        'Skin': 'chunkySwissOnBlack',
        'Radius': radius,
        'noSeconds': '', //'noSeconds',
        'GMTOffset': gmtOffset
    }

	var id_ = Math.random();
	var clockCanvas = '<div class="clock_wrapper" clockid="'+(id_)+'"><span class="city_name"><input type="text" value="'+ defaultName +'"/></span><canvas id="c'+ (lastId++) +'" class="CoolClock:'
            + clockSettings.Skin + ':'
            + clockSettings.Radius + ':'
            + (clockSettings.noSeconds.length > 0 ? clockSettings.noSeconds : '') + ':'
            + clockSettings.GMTOffset
            + '"></canvas>';

	clockCanvas += '<div id="select_div"><select>';
	for(var i in timeZones) {
		clockCanvas += '<option val="'+ timeZones[i].value +'">' + timeZones[i].label + "</option>";
	}

	clockCanvas +='</select></div><div class="cont"></div>';

	clockPlace.innerHTML += clockCanvas;
	CoolClock.findAndCreateClocks();

	clocks.push({id: id_, 'title': defaultName, gmt: gmtOffset});
	saveClocks(clocks);
	addListenersToSelects();
	selectGmtOffset();
	return true;
}

function changeClockInWrapper(id_, name, offset, target) {
	var clockSettings = {
        'Skin': localStorage.getItem('Skin') || 'chunkySwissOnBlack',
        'Radius': radius,
        'noSeconds': localStorage.getItem('noSeconds') || '', //'noSeconds',
        'GMTOffset': offset
    }
	target.setAttribute("clockid", id_);
	var clockCanvas = '<span class="city_name"><input type="text" value="'+ name +'"/></span><canvas id="c'+ (lastId++) +'" class="CoolClock:'
            + clockSettings.Skin + ':'
            + clockSettings.Radius + ':'
            + (clockSettings.noSeconds.length > 0 ? clockSettings.noSeconds : '') + ':'
            + clockSettings.GMTOffset
            + '"></canvas>';

	clockCanvas += '<div id="select_div"><select>';
	for(var i in timeZones) {
		clockCanvas += '<option val="'+ timeZones[i].value +'">' + timeZones[i].label + "</option>";
	}

	clockCanvas +='</select></div><div class="cont">';
	target.innerHTML = clockCanvas;

	var elmSelect = target.querySelectorAll("select")[0];
	elmSelect.selectedIndex = getIndexByOffset(offset);

	CoolClock.findAndCreateClocks();
	addListenersToSelects();
}

function saveClocks(list) {
	localStorage[settings] = JSON.stringify(list);
}

function addRemoveButtons() {
	var wrappers = document.querySelectorAll("div.clock_wrapper .cont");
	for( var i in wrappers ) {
		if( typeof wrappers[i] != "object" ) {
			continue;
		}

		var x = findPosX(wrappers[i]);
		var y = findPosY(wrappers[i]);
		var id = wrappers[i].parentNode.getAttribute("clockid");
		var title = chrome.i18n.getMessage("remove");

		var template = '<a href="#" class="remove_btn" style="position:absolute;top:{top}px;left:{left}px;" title="{title}">'
			+ '<img src="images/remove.png"'
			+ ' width="13px" height="13px" clockid="{clockid}"/></a>';

		var readyHtml = template.replace(/\{top\}/, y-radius).replace(/\{left\}/, x + radius*2).replace(/\{clockid\}/, id).replace(/\{title\}/, title);
		wrappers[i].innerHTML += readyHtml;

		wrappers[i].querySelectorAll(".remove_btn")[0].addEventListener("click", function(event) {
			event.preventDefault();
			removeClock(event.target.parentNode.parentNode);
			return false;
		});
	}
}

function removeClock(wrapperNode) {
	if(wrapperNode.getAttribute("clockid") == null) {
		wrapperNode = wrapperNode.parentNode;
	}


	var id = wrapperNode.getAttribute("clockid");
	try {
		var clocks = loadClocks();
		var pos = -1;
		for(var i in clocks) {
			if( clocks[i].id == id ){
				pos = i;
				break;
			}
		}

		if(pos >=0 ) {
			clocks.splice(pos, 1);
		}

		if(clocks.length == 3) {
			var clockPlace = document.getElementById('worldclock');
			clockPlace.setAttribute("class", "worldclock_less");
		}

		saveClocks(clocks);

		wrapperNode.parentNode.removeChild(wrapperNode);
		removeRemoveButtons();
		addRemoveButtons();
	}catch(ex) {
	}
}

function removeRemoveButtons() {
	var wrappers = document.querySelectorAll("div.clock_wrapper .cont");
	for( var i in wrappers ) {
		if( typeof wrappers[i] != "object" ) {
			continue;
		}

		wrappers[i].innerHTML = '';
	}
}

function saveInfoClocks() {
	try {
		var clocks = loadClocks();
		var wrappers = document.querySelectorAll("div.clock_wrapper");
		for( var i in wrappers ) {
			if( typeof wrappers[i] != "object" ) {
				continue;
			}

			var clockId = wrappers[i].getAttribute("clockid");
			var clockName = wrappers[i].querySelectorAll("input")[0].value;
			updateClockInfo(clocks, clockId, clockName);
		}
		saveClocks(clocks);
	}catch(ex)
	{}
}

function updateClockInfo(list, id, name) {
	for(var i in list) {
		if(list[i].id == id) {
			list[i].title = name;
		}
	}
	return list;
}

function loadClocks() {
	var clocks = [];

	if( localStorage[settings] ) {
		clocks = eval('(' + localStorage[settings]+ ')');
	}
	return clocks;
}

function enableEdit() {
	try {
		var wrappers = document.querySelectorAll("div.clock_wrapper");
		for( var i in wrappers ) {
			if( typeof wrappers[i] != "object" ) {
				continue;
			}

			var spanName = wrappers[i].querySelectorAll("span")[0];
			spanName.innerHTML = '<input type="text" value="'+ spanName.innerHTML +'"/>';
			var selectDiv = wrappers[i].querySelectorAll("div#select_div")[0];
			selectDiv.removeAttribute("class");
		}
		addRemoveButtons();
	}catch(ex)
	{}
}

function showControlls() {
	var btnApply = document.getElementById('btn_apply');
	btnApply.removeAttribute("class");

	var btnAdd = document.getElementById('btn_add');
	btnAdd.removeAttribute("class");
}

function hideControlls() {
	//hide apply button
	var btnApply = document.getElementById('btn_apply');
	btnApply.setAttribute("class", "invisible");

	var btnAdd = document.getElementById('btn_add');
	btnAdd.setAttribute("class", "invisible");

	try {
		var wrappers = document.querySelectorAll("div.clock_wrapper");
		for( var i in wrappers ) {
			var spanName = wrappers[i].querySelectorAll("input")[0];
			var newClockName = spanName.value;
			spanName.parentNode.innerHTML = newClockName;

			var selectDiv = wrappers[i].querySelectorAll("div#select_div")[0];
			selectDiv.setAttribute("class", "invisible");
		}
	}catch(ex)
	{
	}
}

function isEditMode() {
	var btnApply = document.getElementById('btn_apply');
	var attr = btnApply.getAttribute("class");
	return attr != "invisible";
}

function addListenersToSelects() {
	var wrappers = document.querySelectorAll("div.clock_wrapper select");
	for( var i in wrappers ) {
		if( typeof wrappers[i] != "object" ) {
			continue;
		}

		wrappers[i].addEventListener("change", function(event){
			try {
				var clockid = event.target.parentNode.parentNode.getAttribute("clockid");
				var gsmOffset = this.options[this.options.selectedIndex].getAttribute("val");
				changeGsmOffset(clockid, gsmOffset);
			}catch(ex)
			{
			}
			return true;
		});
	}
}

function changeGsmOffset(id, offset) {
	var clocks = loadClocks();
	var name = "";
	for(var i in clocks) {
		if(clocks[i].id == id) {
			clocks[i].gmt = offset;
			name = clocks[i].title;
			break;
		}
	}
	saveClocks(clocks);
	var wrappers = document.querySelectorAll("div.clock_wrapper");
	for(var i in wrappers) {
		if( typeof wrappers[i] != "object" ) {
			continue;
		}

		if(wrappers[i].getAttribute("clockid") == id) {
			changeClockInWrapper(id, name, offset, wrappers[i]);
		}
	}
 }

function addEventListeners() {
	var btnSettings = document.getElementById('btn_settings');
	btnSettings.addEventListener('click', function(event){
		if( !isEditMode() ) {
			enableEdit();
			showControlls();
		}
	});

	var btnApply = document.getElementById('btn_apply');
	btnApply.addEventListener('click', function(event){
		saveInfoClocks();
		hideControlls();
		removeRemoveButtons();
	});

	var btnAdd = document.getElementById('btn_add');
	btnAdd.addEventListener('click', function(event){
		var res = addClock();
		if(res) {
			removeRemoveButtons();
			addRemoveButtons();
		}
	});

	addListenersToSelects();
}

