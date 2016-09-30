(function() {
	
	'use strict';

	var PROJECTS_PREFIX = './projects/';
	var PROJECTS_JSON_SUFFIX = '.json';
	var PROJECTS_TXT_SUFFIX = '.html';
	var PROJECT_TEMPLATE = "\
		<article class='6u 12u$(xsmall) work-item'>\
			<a href='images/fulls/{id}.jpg' class='image fit thumb' id='{id}'><img src='images/thumbs/{id}.jpg' alt='' /></a>\
			<h3>{title}</h3>\
			<p>{short_description}</p>\
		</article>\
		";
	var CAPTION_TEMPLATE = "\
		<h3>{title}</h3>\
		<span>{tags}</span>\
		<p>{long_description}</p>\
		";
	var ANIMATION_DURATION = 750;

	var settings = {
		"language": "fr",
		"possibleLanguages": ["fr", "en"]
	};

	var projects = {}

	var nbProjects = 0;

	var nbRequestToComeBack = 0;

	// Detects browser language and save it
	var detectBrowserLanguage = function () {
		settings.language = (navigator.language || navigator.userLanguage) != "fr" ? "en" : "fr";
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
		fileExist(++nbProjects, function(){
			// console.log("Call callback");
			// callback();
		}.bind(callback),
		function(data){
			// Success callback
			loadProject(data, callback);
			// console.log("Found " + nbProjects + " projects");
			getProjects(callback);
		}.bind(callback))
	}

	var loadProject = function(data, callback) {
		var id = nbProjects;
		projects[id] = data;

		for (var i = settings.possibleLanguages.length - 1; i >= 0; i--) {
			var lang = settings.possibleLanguages[i];
			var targetUrl = PROJECTS_PREFIX + nbProjects + "." + lang + PROJECTS_TXT_SUFFIX;
			console.log(targetUrl);
			nbRequestToComeBack++;
			$.ajax({
				url: targetUrl,
				dataType: "text",
				error: function(jqXHR, textStatus, errorThrown ){
					// If we don't find the page, log it and don't block
					console.warn("Coudn't find post " + id + " in " + lang);
					console.warn(textStatus);
					nbRequestToComeBack--;
				}.bind(id, lang),
				success: function(l, data, textStatus){
					nbRequestToComeBack--;
					// console.log("got " + id + " in " + l);
					// console.log(data);
					// console.log(l);
					projects[id][l].long_description = data;
					if (nbRequestToComeBack == 0) {
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
		$("#projects").html("");

		for (var i = 1; i < nbProjects; i++) {
			var txt = PROJECT_TEMPLATE;
			txt = txt.replace(new RegExp("{id}", 'g'), i);
			if (i%2==0) {
				txt = txt.replace("6u", "6u$");
			}
			$.each(projects[i][settings.language], function(index, value) {
				txt = txt.replace(new RegExp("{" + index + "}", 'g'), value);
			});
			// console.log(txt);
			$("#projects").append(txt);
		}

		$('#two').poptrox({
			// caption: function($a) { return $a.next('div').html(); },
			caption: fillCaption,
			overlayColor: '#2c2c2c',
			overlayOpacity: 0.85,
			popupCloserText: '',
			popupLoaderText: '',
			selector: '.work-item a.image',
			usePopupCaption: true,
			usePopupDefaultStyling: false,
			usePopupEasyClose: false,
			usePopupNav: true,
			windowMargin: (skel.breakpoint('small').active ? 0 : 50)
			// onPopupOpen: fillProjectContent
		});
	}

	var fillCaption = function (a) {
		
		var i = a[0].id;

		var txt = CAPTION_TEMPLATE;
		$.each(projects[i][settings.language], function(index, value) {
			txt = txt.replace(new RegExp("{" + index + "}", 'g'), value);
		});

		// console.log(txt);
		return txt;
	}

	// Puts and @ in the email address
	var decipherMail = function () {
		$(".email").attr("href", $(".email").attr("href").replace("---", "@"));
		$("#email").text($("#email").text().replace("---", "@"));
	}

	var switchLanguage = function () {
		// Animation + change view
		  $( "#two" ).slideUp( ANIMATION_DURATION, updateLanguage);

		// Change settings
		settings.language = settings.language == "fr" ? "en" : "fr";
	}

	var updateLanguage = function () {
		fillContent();
		fillProjects();
		$( "#two" ).slideDown( ANIMATION_DURATION);
	}

	// Document on load.
	$(function(){
		detectBrowserLanguage();
		updateLanguage();
		getProjects(fillProjects);
		decipherMail();
		$("#switchLanguage").on("click", switchLanguage);
	});

})();
