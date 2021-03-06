(function() {
	
	'use strict';

	var PROJECTS_PREFIX = './projects/';
	var PROJECT_ID_PREFIX = 'project-';
	var PROJECTS_JSON_SUFFIX = '.json';
	var PROJECTS_TXT_SUFFIX = '.html';
	var PROJECT_LIST_URL = PROJECTS_PREFIX + 'projects.json';
	// var PROJECT_TEMPLATE = "\
	// 	<article class='6u 12u$(xsmall) work-item'>\
	// 		<a href='{link}' data-poptrox='{poptroxData}' class='image fit thumb' id='{id}'><img src='images/thumbs/{id}.jpg' alt='' /></a>\
	// 		<h3>{title}</h3>\
	// 		<p>{short_description}</p>\
	// 	</article>\
	// 	";
	var PROJECT_TEMPLATE = "\
		<article class='6u 12u$(xsmall) work-item'>\
			<a href='{link}' class='project-show image fit thumb' id='a-{id}'><img src='images/thumbs/{id}.jpg' alt='' /></a>\
			<h3>{title}</h3>\
			<p>{short_description}</p>\
		</article>\
		";
	var CAPTION_DEFAULT_IMAGE = "<img src='images/fulls/{id}.jpg' alt='' class='caption-picture'/>";
	var CAPTION_CUSTOM_IMAGE = "<img src='images/content/{image}.jpg' alt='' class='caption-picture'/>";
	var CAPTION_TEMPLATE = "\
		<h3>{title}</h3>\
		<div class='tags'>{tags}</div>\
		<p>{long_description}</p>\
		";
	var CAPTION_BOX = "\
		<div class='caption-container' id='{project-name}' >\
			<div class='caption-arrow' />\
			<div class='caption-box'>\
				{CAPTION_TEMPLATE}\
			</div>\
		</div>\
		";
	var LOCATION_TEMPLATE = "<div class='tags'><span class='meta-icons fa fa-map-marker' />{location}</div>";
	var LOCATION_WITH_URL_TEMPLATE = "<div class='tags'><span class='meta-icons fa fa-map-marker' /><a href='{locationUrl}' target='_blank'>{location}</a></div>";
	var DATE_TEMPLATE = "<div class='tags'><span class='meta-icons fa fa-calendar-check-o' />{date}</div>";
	var HARDWARE_TEMPLATE = "<div class='tags'><span class='meta-icons fa fa-gears' />{hardwares}</div>";
	var SOFTWARE_TEMPLATE = "<div class='tags'><span class='meta-icons fa fa-code' />{softwares}</div>";
	var GITHUB_TEMPLATE = "<div class='tags'><span class='meta-icons fa fa-github' /><a href='{url}' target='_blank'>{displayUrl}</a></div>";
	var TAGS_TEMPLATE = "<span class='tag'>{tag}</span>";
	var ANIMATION_DURATION = 750;

	var settings = {
		"language": "en",
		"possibleLanguages": [/*"fr", */"en"]
	};

	var projects = {}

	var nbProjects = 0;

	var nbRequestToComeBack = 0;

	var pageTitle = "";

	// URI util
	function get(name){
		if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
			return decodeURIComponent(name[1]);
	}

	// Detects browser language and save it
	var detectBrowserLanguage = function () {
		// settings.language = (get("l") || navigator.language || navigator.userLanguage) != "fr" ? "en" : "fr";
		// console.log(settings.language);
	}

	// Takes content.js info and fill the blanks
	var fillContent = function () {
		
		$.each(info, function(index, value) {
			// console.log(index);
			$(index).html(value[settings.language]);
		});
	}

	// Donwloads all the projects
	var getProjects = function (callback) {
		// fileExist(++nbProjects, function(){
		// 	// console.log("Call callback");
		// 	// callback();
		// }.bind(callback),
		// function(data){
		// 	// Success callback
		// 	loadProject(data, callback);
		// 	// console.log("Found " + nbProjects + " projects");
		// 	getProjects(callback);
		// }.bind(callback))

		// console.log(PROJECT_LIST_URL);
		$.ajax({
			url: PROJECT_LIST_URL,
			dataType: "json",
			error: function(jqXHR, textStatus, errorThrown ){
				// If we don't find the page, log it and don't block
				console.warn("Coudn't find project list");
				console.warn(textStatus);
			},
			success: function(data, textStatus){
				// console.log("Found " + PROJECT_LIST_URL);
				projects = data;

				// console.log(data);
				for (var project in projects){
					// console.log("Looking for project " + project);
					nbProjects++;
					loadProject(project, callback);
				}
			}
		});
	}

	var loadProject = function(id, callback) {
		// var id = nbProjects;
		// projects[id] = data;

		// global nbRequestToComeBack;

		for (var i = settings.possibleLanguages.length - 1; i >= 0; i--) {
			var lang = settings.possibleLanguages[i];
			var targetUrl = PROJECTS_PREFIX + id + "." + lang + PROJECTS_TXT_SUFFIX;
			// console.log(targetUrl);
			nbRequestToComeBack++;
			$.ajax({
				url: targetUrl,
				dataType: "text",
				error: function(jqXHR, textStatus, errorThrown ){
					// If we don't find the page, log it and don't block
					console.warn("Coudn't find post " + id + " in " + lang);
					console.warn(textStatus);
					nbRequestToComeBack--;

					if (nbRequestToComeBack == 0) {
						console.log("callback");
						callback();
					}
				}.bind(id, lang),
				success: function(l, data, textStatus){
					nbRequestToComeBack--;
					// console.log("got " + id + " in " + l);
					// console.log(data);
					// console.log(l);
					projects[id][l].long_description = data;

					if (nbRequestToComeBack == 0) {
						console.log("Got all articles content");
						callback();
					}
				}.bind(id, lang)
			});
		}
		// console.log(projects[nbProjects]);
	}

	// Test if a file exist and execute a callback according to the result
	var fileExist = function (idx, errorCallback, successCallback){
		var ret;

		$.ajax({
			url: PROJECTS_PREFIX + idx + PROJECTS_JSON_SUFFIX,
			dataType: "json",
			error: errorCallback,
			success: successCallback
		});
	}

	// Fills the project part
	var fillProjects = function () {

		var projectsContent = "";

		for (let id in projects) { // var i = nbProjects ; i > 0 ; i--) {
			// console.log(nbProjects);

			var txt = PROJECT_TEMPLATE;
			// console.log(projects[i].media.type == "image");
			// Set media type
			// if (projects[i].media.type == "image") {
			// 	txt = txt.replace("{link}", "images/fulls/{id}.jpg");
			// 	txt = txt.replace("data-poptrox='{poptroxData}' ", "");
			// } else {
			// 	txt = txt.replace("{poptroxData}", projects[i].media.type);
			// 	txt = txt.replace("{link}", projects[i].media.content);
			// }
			
			let nth = Object.keys(projects).findIndex(x => x == id);
			let i = Object.keys(projects)[nth];

			if (nth == -1) {
				console.error("Index "+id+" not found");
				return;
			}

			txt = txt.replace("{link}", "#" + projects[i].en.title); // + PROJECT_ID_PREFIX + i);

			let isRight = (nbProjects - nth) % 2 == 0;

			// Set div to left of right
			// left is without '$', right has it
			// if ((nbProjects - i + 1) % 2 == 0) { // if right
			// if (isRight) {
			// 	txt = txt.replace("6u", "6u$");
			// }

			// Fill content of the project
			var content = projects[id][settings.language];
			// id
			txt = txt.replace(new RegExp("{id}", 'g'), i);
			// other
			$.each(projects[i][settings.language], function(index, value) {
				txt = txt.replace(new RegExp("{" + index + "}", 'g'), value);
			});
			// console.log(i);
			// console.log(isRight);

			// if ((nbProjects - i + 1) % 2 == 0) { // if right
			if (isRight) {
				let nthPlusOne = Object.keys(projects).findIndex(x => x == id) + 1;
				if (nthPlusOne == 0) {
					console.error("Index "+id+" not found");
					return;
				}
				projectsContent = fillCaption(i) + projectsContent;
				projectsContent = fillCaption(Object.keys(projects)[nthPlusOne]) + projectsContent;
				// $("#projects").append(fillCaption(Object.keys(projects)[nthPlusOne]));
				// $("#projects").append(fillCaption(i));
			} else if (i == Object.keys(projects)[0] ) { // if last left
				projectsContent = fillCaption(i) + projectsContent;
			}
			
			// $("#projects").append(txt);
			projectsContent = txt + projectsContent;
		}

		$("#projects").html("");
		$("#projects").append(projectsContent);
		$(".project-show").click(showProjectCaption);
		$(".internal-link").click(goToLinkedProject);

		// If link to an anchor
		goToProject();

		// $('#two').poptrox({
		// 	// caption: function($a) { return $a.next('div').html(); },
		// 	caption: fillCaption,
		// 	overlayColor: '#2c2c2c',
		// 	overlayOpacity: 0.85,
		// 	popupCloserText: '',
		// 	popupLoaderText: '',
		// 	selector: '.work-item a.image',
		// 	usePopupCaption: true,
		// 	usePopupDefaultStyling: false,
		// 	usePopupEasyClose: false,
		// 	usePopupNav: true,
		// 	windowMargin: (skel.breakpoint('small').active ? 0 : 50)
		// 	// onPopupOpen: fillProjectContent
		// });
	}

	var fillCaption = function (a) {
		/*
		LOCATION_TEMPLATE
		LOCATION_WITH_URL_TEMPLATE
		DATE_TEMPLATE
		HARDWARE_TEMPLATE
		SOFTWARE_TEMPLATE
		GITHUB_TEMPLATE
		*/
		
		// var i = a[0].id;	// poptrox
		var i = a;			// custom
		// console.log(i);
		// console.log(projects);
		// console.log(projects[i]);

		var txt = "";
		var boxtxt = CAPTION_BOX;
		var content = projects[i][settings.language];

		if (projects[i].media.type == "image") {
			txt = CAPTION_DEFAULT_IMAGE + CAPTION_TEMPLATE;

			// Picture
			txt = txt.replace("{id}", i);
		} else if (projects[i].media.type == "customImage") {
			txt = CAPTION_CUSTOM_IMAGE + CAPTION_TEMPLATE;

			// Picture
			txt = txt.replace("{image}", projects[i].media.content);
		} else {
			// No big picture
			txt = CAPTION_TEMPLATE;
		}

		// Title
		txt = txt.replace("{title}", content.title);

		// Tags
		var tags = content.tags.map(tagThisText).join('');
		txt = txt.replace("{tags}", tags);
		// long_description
		txt = txt.replace("{long_description}", content.long_description); // .split(new RegExp("\\n\\n", 'g')).join("</p><p>").replace(new RegExp("\\n", 'g'), "<br/>"));
		$.each(projects[i][settings.language], function(index, value) {
			txt = txt.replace(new RegExp("{" + index + "}", 'g'), value);
		});


		// Date
		if (!!projects[i].meta.date) {
			txt += DATE_TEMPLATE.replace("{date}", projects[i].meta.date);
		}
		// Location
		if (!!projects[i].meta.location) {
			var location;
			if (!!projects[i].meta.locationUrl) {
				location = LOCATION_WITH_URL_TEMPLATE.replace("{locationUrl}", projects[i].meta.locationUrl);
			} else {
				location = LOCATION_TEMPLATE;
			}
			location = location.replace("{location}", projects[i].meta.location);
			txt += location;
		}
		// hardwares tags
		if (!!projects[i].meta.hardware && projects[i].meta.hardware.length > 0) {
			var hardwares = projects[i].meta.hardware.map(tagThisText).join('');
			txt += HARDWARE_TEMPLATE.replace("{hardwares}", hardwares);
		}
		// softwares tags
		if (!!projects[i].meta.software && projects[i].meta.software.length > 0) {
			var softwares = projects[i].meta.software.map(tagThisText).join('');
			txt += SOFTWARE_TEMPLATE.replace("{softwares}", softwares);
		}
		// Github link
		if (!!projects[i].meta.github) {
			txt += GITHUB_TEMPLATE.replace("{url}", projects[i].meta.github).replace("{displayUrl}",  projects[i].meta.github.split("github.com")[1]);
		}

		boxtxt = boxtxt.replace("{CAPTION_TEMPLATE}", txt);
		// console.log(i);
		boxtxt = boxtxt.replace("{project-name}", PROJECT_ID_PREFIX + i);
		
		//console.log(boxtxt);
		return boxtxt;
	}

	// Add a tag span to a text
	var tagThisText = function (text){
		return TAGS_TEMPLATE.replace("{tag}", text);
	}

	// Puts and @ in the email address
	var decipherMail = function () {
		// $(".email").attr("href", $(".email").attr("href").replace("---", "@"));
		$("#email").text($("#email").text().replace("---", "@"));
	}

	var switchLanguage = function () {
		// Animation + change view
		  $( "#two" ).slideUp( ANIMATION_DURATION, updateLanguage);

		// Change settings
		settings.language = settings.language == "fr" ? "en" : "fr";
		
		return false;
	}

	var updateLanguage = function () {
		fillContent();
		fillProjects();
		$( "#two" ).slideDown( ANIMATION_DURATION );
	}

	var toggleInfo = function (event) {
		var $child = $(event.currentTarget).find("span.expand");

		if ($child.length == 0) {
			return true;
		}
		// console.log(event);
		// console.log($child);
		if ($child.hasClass("expanded")) {
			$child.animate( { 'max-width':'0px' },ANIMATION_DURATION);
			$child.removeClass("expanded");
		} else {
			$child.addClass("expanded");
			$child.animate( { 'max-width':'200%' },ANIMATION_DURATION);
		}
		
		return false;
	}

	var showLabel = function (event) {
		var $label = $(event.currentTarget).find("span.label");
		$label.fadeIn( ANIMATION_DURATION );
		$label.css("left", -$label.width()/2);
	}

	var hideLabel = function (event) {
		var $label = $(event.currentTarget).find("span.label");
		$label.fadeOut( ANIMATION_DURATION );
	}

	// var slideDownCaption = function(target, targetId){
	var slideDownCaption = function(id){
		$("#" + PROJECT_ID_PREFIX + id).addClass("active");
		$("#" + PROJECT_ID_PREFIX + id).slideDown(500);

		// left border x pos + width/2 + radius
		// var pos = $(event.currentTarget).offset().left + $(event.currentTarget).innerWidth()/2 - 10;
		var pos = $("#a-" + id).offset().left + $("#a-" + id).innerWidth()/2 - 10;

		$("#" + PROJECT_ID_PREFIX + id + ">.caption-arrow").css("left", pos + "px");

		$("#a-"+id).addClass("minimize");

		document.title = projects[id].en.title + " | " + pageTitle;
	}

	var slideUpCaption = function(openedId, cond, callback){
		let opened = $("#" + PROJECT_ID_PREFIX + openedId); // $("#a-"+openedId);

		$("#a-"+openedId).removeClass("minimize");
		opened.removeClass("active");

		// id == openedId
		if (cond) {
			// Just close the caption
			opened.slideUp(500);
		} else {
			// Close the previous caption, and next open the selected one (= callback)
			opened.slideUp(500, callback);
		}

		document.title = pageTitle;
	}

	var showProjectCaption = function (event) {
		var id = $(event.currentTarget).first().attr('id').split("-")[1];
		// var target = event.currentTarget;
		// console.log(target);

		// $(".caption-container").removeClass("active");
		// $("#" + PROJECT_ID_PREFIX + id).addClass("active"); // find the caption-container to show

		return changeProjectCaption(id);
	}

	var changeProjectCaption = function(id){
		var opened = $(".caption-container.active");

		if (opened.length > 0) {
			// console.log("Clicked :" + id);
			// console.log(opened.length + " opened :" + opened.first().attr('id').split("-")[1]);

			let openedId = opened.first().attr('id').split("-")[1];
			slideUpCaption(openedId, openedId == id, function(){
					slideDownCaption(id);
				});


			history.replaceState({}, "", window.location.href.split("#")[0]);

			return false;
		} else {
			// slideDownCaption(target, id);
			slideDownCaption(id);

			return true;
		}

	}

	var initResumeBlink = function() {
		// console.log("blink");
		$("#resume").addClass("blinking");

		// Unset color
		setTimeout(function(){
			// console.log("blinkend");
			$("#resume").removeClass("blinking");

			// Loop
			setTimeout(function(){
				initResumeBlink();
			}, 10000);
		}, 1000);
	}

	var findKey = function(obj, conditionCallback) {
		for (let key in obj) {
			if (conditionCallback(obj[key])) {
				return key;
			}
		}
		return undefined;
	};

	var goToProject = function(){
		let encodedAnchor = window.location.href.split("#")[1];
		if (!!encodedAnchor && encodedAnchor.length > 0) {
			let anchorName = decodeURIComponent(encodedAnchor);
			let k = findKey(projects, x => x.en.title == anchorName);
			// console.log(k);
			if (k != undefined) {
				console.log("Going to " + projects[k].en.title);
				slideDownCaption(k);
				scrollTo("#a-" + k);
			}
		}
	}

	var goToLinkedProject = function(event){
		let anchorName = $(event.currentTarget).first().attr("href").split("#")[1];
		let k = findKey(projects, x => x.en.title == anchorName);
		// console.log(k);
		if (k != undefined) {
			console.log("Going to " + projects[k].en.title);
			changeProjectCaption(k);
			scrollTo("#a-" + k);
		}
	}

	function scrollTo(id){
		$('html,body').animate({
			scrollTop: $(id).offset().top},
			'slow');
	}

	// Document on load.
	$(function(){
		pageTitle = document.title;
		detectBrowserLanguage();
		updateLanguage();
		getProjects(fillProjects);
		decipherMail();
		// initResumeBlink();
		$("#switchLanguage").click(switchLanguage);
		$(".icon").click(toggleInfo);
		$(".icon").hover(showLabel, hideLabel);
		$(".label").hover(function(){ return false; });
	});

})();
