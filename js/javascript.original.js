/**
 * Virgo
 */

var Design = {

	data : {

		activeSetLink : undefined,
		timeOutId : undefined,
		firstClickFlag : false,
		centerVertical : undefined,
		verticalMargin : 0,
		slideshownavThreshold : 28,
		calculatedMargin : 0,
		thumbWidth: 0,
		columnizeSlideThumbs: true

	},


	init: function(){

		Design.data.thumbWidth = Cargo.Model.DisplayOptions.get('thumb_size').w;

		if ( Cargo.Helper.isPhone() && Design.data.thumbWidth > Design.Mobile.data.thumbWidth ){

			Design.data.thumbWidth = Design.Mobile.data.thumbWidth ;

		};

		// Don't allow padding set on Search view
		if ( Cargo.Helper.IsSearch() ){

			Design.data.centerVertical = false;

		} else {

			Design.data.centerVertical = Cargo.Model.DisplayOptions.get('image_scale_vertical');

		}

		if ( Cargo.Model.DisplayOptions.get("use_set_links") && Cargo.Model.DisplayOptions.get("projects_in_text_nav") ) {

			Cargo.Collection.Navigation.url = Cargo.API.GetNavigationCargoPath(0, 9999);
			Cargo.Collection.Navigation.fetch({reset: true});

		}
	},

	Mobile : {

		data : {

			mobileMargin : 0,
			thumbWidth : 240,
			headerHeight: 0

		},

		init: function(){


			if ( Cargo.Helper.isMobile() ) {
				Design.Mobile.setMobileMargin();

				// Give button elements touch active state, allow :active styling
				$('.project_nav a, .header_text a, .navigation_toggle').bind( "touchstart", function(){
					return true;
				});


				// Deal with device rotations
				$(window).resize(function(){

					setTimeout(function(){

						Design.SetProjectBlockImagePadding();

					}, 250);

				});

			}

			if ( Cargo.Helper.isTablet()){

				$('body').addClass("tablet");

			}

			if ( Cargo.Helper.isPhone() ){
				$('body').addClass("mobile");
				$('body').css("max-width", screen.width + "px");
				$('head').append('<meta name="viewport" content="width=device-width">');

				Design.Mobile.data.headerHeight = $('.site_header').outerHeight(true);

				// Set thumbnails to columnize at ideal width of 240
				$('#thumbnails').attr("data-columnize-width", Design.Mobile.data.thumbWidth );


				$('.navigation_toggle').bind("click", function(){

					Design.Mobile.toggleNav();

				});

				$('.navigation').bind( "touchstart", function(e){

					var touchtarget = $(e.target);

					if ( !touchtarget.is('a') ) {

						Design.Mobile.toggleNav();

					}

				});


				$(window).scroll(function() {

					if ( $(window).scrollTop() > Design.Mobile.data.headerHeight){

						$('body').addClass("scrolled");

					} else {

						$('body').removeClass("scrolled");

					}

				});


				Cargo.Event.on("project_load_complete", function(pid) {

					Design.Mobile.toggleNav(true);

				});

			}
		},

		setMobileMargin: function(){


			if ( Design.data.centerVertical ){


				var listenForChange = null,
					prevHeight = 0,
					currentHeight = 0;


				// Deal with iOS UI Chrome
				clearInterval(listenForChange);

				listenForChange = setInterval(function(){

					currentHeight = window.innerHeight;

				    if (currentHeight !== prevHeight ) {

						Design.Mobile.data.mobileMargin = document.documentElement.clientHeight - window.innerHeight;
						Design.setVerticalMargin();
						Cargo.Plugins.elementResizer.refresh();

					}

					prevHeight = currentHeight;

				}, 100);


			}
		},


		toggleNav: function(closeNav){

			if ( $('.navigation_toggle').is(".active") || closeNav ){

				$(".navigation, .navigation_toggle").removeClass("active");

			} else {

				$(".navigation, .navigation_toggle").addClass("active");

			}

		}

	},

	setVerticalMargin: function(){
		Design.data.calculatedMargin = 0;

		// Set additional margin for slideshow text nav on top
		if ( $('.first_block').is('.slide.block') &&
			 Cargo.Model.DisplayOptions.get("slide_text_nav").enabled ){

			Design.data.calculatedMargin = Design.data.slideshownavThreshold * 2;

		}

		// Set Margin from project content top
		if (  $('.project_content').length > 0 ){

			Design.data.verticalMargin = $(".project_content", Cargo.View.ProjectDetail.$el).offset().top * 2;

		}

		Cargo.Plugins.elementResizer.setOptions({

			adjustElementsToWindowHeight: Design.data.centerVertical,
			forceVerticalMargin: ( Design.data.verticalMargin + Design.data.calculatedMargin) + Design.Mobile.data.mobileMargin

		});


	},


	/**
	* Set the padding of each image block inside the content
	* to ensure that each block has enough padding to show completely
	*/
	SetProjectBlockImagePadding: function(el, obj){

        if ( $(".project_content", Cargo.View.ProjectDetail.$el).length < 1 ){
           return
        }

		var container_height = window.innerHeight,
			parentBlock,
			padding,
			topPadding,
			bottomPadding,
			this_height;

		if(el !== undefined){

			// if slideshow transition, we just change one block
			parentBlock = el.closest('.block');

		} else {

			// if not slideshow transition, we change all blocks
			parentBlock = $(".project_content .block", Cargo.View.ProjectDetail.$el);

		}

		parentBlock.each(function(){

			// for slideshow transitions
			if (el !== undefined){

				// For navigating straight to the thumbnails
				//if ( obj.getActiveSlide().height() < 1 )

				this_height = obj.getActiveSlide().height() + (el.height() -  $('.slideshow_container', el).height() );

				if (this_height < 1){

					padding = 0;
					Design.RemoveSlideBlockTransitions(el);

					$(this).css("visibility", "visible");

				} else {

					padding = Math.max(((container_height - this_height) / 2), 0);

					$(this).css({
						'height': this_height+'px',
						'visibility': 'visible'
					});

				}

			// for everything else
			} else {

				this_height = $(this).height();

				if( $(this).is('.slide') ){


					// if not transition, but still a slideshow. setting height prevents bottom from creeping up
					this_height = $('.slideshow', this).height() ;
					$(this).css("height", this_height + "px");

				} else {

					$(this).css("height", "auto");

				}

				padding = Math.max(Math.floor((container_height - this_height) / 2), 0);

			};

			topPadding = Math.max(padding - $(".project_content", Cargo.View.ProjectDetail.$el).offset().top, 0);
			bottomPadding = Math.max(padding - ( $(".project_footer", Cargo.View.ProjectDetail.$el).outerHeight(true) ), 0 );

			$(this).css({
				'padding-top' : padding + 'px',
				'padding-bottom' : padding + 'px'
			});

			if ( $(this).is(".first_block") ){

				$(this).css({
					'padding-top' : topPadding + 'px'
				});

			}

			if ($(this).is(".last_block") && !$('body').is('.mobile') ) {

				$(this).css({
					'padding-bottom' : bottomPadding + 'px'
				});

			}


		});

	},


	SetSlidecontainerTransition : function(){

		if ( $('#slideContainerTransition').length < 1 ) {

			$('head').append('<style id="slideContainerTransition"></style>');

		};

		var slideTransitionLength = Cargo.Model.DisplayOptions.get("slide_transition_duration");

		$('#slideContainerTransition').text(
			'.slideshow.slideshow_transitioning .slideshow_container { \n\
				-webkit-transition: all ' +slideTransitionLength + 's ease; \n\
				-moz-transition: all ' + slideTransitionLength + 's ease; \n\
				-ms-transition: all ' + slideTransitionLength + 's ease; \n\
				transition: all ' + slideTransitionLength + 's ease; \n\
			}'
		);

	},

	SetSlideshowWidth: function(){
		var largeWidth, projectContentWidth;

		if ( $('#slideshowWidth').length < 1 ) {

			$('head').append('<style id="slideshowWidth"></style>');

		};

		if ( Cargo.View.ProjectDetail !== undefined ) {
			largeWidth = $(Cargo.View.ProjectDetail.$el).width();
			projectContentWidth = $(".project_content", Cargo.View.ProjectDetail.$el).width();

		} else {

			largeWidth = $('body').width();
			projectContentWidth = largeWidth;

		}

		$('#slideshowWidth').text(
			'.slideshow { \n\
				width: ' + largeWidth + 'px !important; \n\
				margin-left: -' + ((largeWidth - projectContentWidth) / 2) + 'px !important; \n\
			}'
		);

	},

	RemoveSlideBlockTransitions: function(el){

		var styleTag = $("#slideblockTransition_" + el.attr('data-id'));

		if ( styleTag.length > 0){

			styleTag[0].disabled = true;

		}

	},


	SetSlideBlockTransitions: function(el) {


		var dataId					= el.attr('data-id'),
			styleTag				= $('#slideblockTransition_' + dataId),
			slideTransitionLength	= Cargo.Model.DisplayOptions.get("slide_transition_duration");

		if (styleTag.length > 0 ) {

			styleTag[0].disabled = false;

		} else {

			$('head').append('<style id="slideblockTransition_' + dataId + '"></style>');

			$('#slideblockTransition_' + dataId).text(
				'#slideblock_' + dataId + '.slide.block { \n\
					-webkit-transition: all ' + slideTransitionLength + 's ease; \n\
					-moz-transition: ' + slideTransitionLength + 's all ease; \n\
					-ms-transition: all ' + slideTransitionLength + 's ease; \n\
					transition: all ' + slideTransitionLength + 's ease; \n\
				}'
			);

		}

	},


	ResizeWindowListener: function() {

		clearTimeout(Design.data.timeOutId);

		if(!Design.data.firstClickFlag){

			Cargo.Event.trigger("site_resize_start", "Cargo");
			Design.data.firstClickFlag = true;

		}

		Design.data.timeOutId = setTimeout(function(){

		   Design.data.firstClickFlag = false;
		   Cargo.Event.trigger("site_resize_end", "Cargo");

		}, 80);

	},


	/**
	 * Wrap all contents inside div blocks
	 */
	FormatProjectContent: function() {

		$(".project_content", Cargo.View.ProjectDetail.$el)
			.contents()
			.filter(function() {
				return this.nodeName == "IMG";
			})
			.wrap('<div class="block image" />')
			.end();

		$(".audio_component", Cargo.View.ProjectDetail.$el).wrap('<div class="block audio" />');
		$(".project_content > div", Cargo.View.ProjectDetail.$el).each(function(){

			if (this.attributes.length ===0 ){

			   $(this).addClass('block text');

			}

		});

		$(".slideshow", Cargo.View.ProjectDetail.$el).each(function(){
			$(this).wrap('<div id="slideblock_'+ $(this).attr("data-id")+'" class="block slide" />');
		});

		$(".project_content > .video_component", Cargo.View.ProjectDetail.$el).not('.slideshow .video_component').wrap('<div class="block video" />');
		$(".project_content > iframe", Cargo.View.ProjectDetail.$el).not('.slideshow iframe').wrap('<div class="block iframe" />');

		// Format the text into blocks
		this.formatText($(".project_content"));


		$('.block:first-child', Cargo.View.ProjectDetail.$el).addClass('first_block');
		$('.block:last-child', Cargo.View.ProjectDetail.$el).addClass('last_block');

		$('.block', Cargo.View.ProjectDetail.$el).each(function(i){

			$(this).attr("data-block", i);

		});

	},


	formatText: function(node, includeWhitespaceNodes) {

		var c = node.contents(),
			validTags = ['img', 'object', 'video', 'audio', 'iframe', 'div'],
			pageCache = [],
			pageCount = 0,
			textPages = {},
			newPageFromCache = true;

		c.each(function(key, val) {

			if ($.inArray(getTag(val), validTags) >= 0) {
				// save cache as new page
				if (pageCache.length > 0) {
					textPages[pageCount] = pageCache;
					pageCache = [];
					pageCount++;
				}
			} else {
				if (isValidText(val.data) && val.nodeType != 8) {
					pageCache.push(val);
				}
			}

		});

		// Still some stuff left in cache
		if (pageCache.length > 0) {
			// Check if it needs a new page
			for (var i = 0; i < pageCache.length; i++) {
				if (pageCache[i].nodeType == 8 || pageCache[i].nodeName == "SCRIPT" || pageCache[i].nodeName == "STYLE") {
					// Contains text, create new page
					newPageFromCache = false;
				}
			}

			if (newPageFromCache) {
				// Create new page
				textPages[pageCount] = pageCache;
				pageCache = [];
				pageCount++;
			} else {
				for (var i = 0; i < pageCache.length; i++) {
					// Dump and hide remaining elements
					$(pageCache[i]).hide().appendTo($('.project_footer'));
				}
			}
		}

		$.each(textPages, function(key, arr) {
			var breaks = 0;

			$.each(arr, function(key, el) {
				if (el.nodeName == "BR") {
					breaks++;
				}
			});

			if (breaks < arr.length) {
				var first = arr[0];
				var parent = $('<div class="text" />');
				$(first).before(parent);

				$.each(arr, function(key, el) {
					$(el).appendTo(parent);
				});
			} else {
				$.each(arr, function(key, el) {
					$(el).remove();
				});
			}
		});

		function isValidText(txt, strict) {
			if (txt !== undefined) {
				txt = txt.replace(/<!--([\s\S]*?)-->/mig, "");
				txt = txt.replace(/(\r\n|\n|\r|\t| )/gm, "");
				txt = txt.replace(/[^A-Za-z0-9\s!?\.,-\/#!$%\^&\*;:{}=\-_`~()[[\]]/g, "");

				if (txt.length > 0) {
					return true;
				}
			} else {
				if (strict) {
					return false;
				} else {
					return true;
				}
			}

			return false;
		}

		function getTag(el) {
			if (typeof el !== "undefined") {
				var tag = el.tagName;
				if (typeof tag === "undefined") {
					tag = 'text';
				}

				return tag.toLowerCase();
			}
		}
	},


	scroll: {

		indexPosition : 0,

		defaultScroll : function() {
			// Configured on setup
		},


		project : function() {

			// Set the data if we were on an index page
			if ( ! $('body').is('[data-pagetype]') ) {

				this.indexPosition = $(window).scrollTop();

			}

			// Default scroll method
			//Design.scroll.defaultScroll();

		},

		index : function() {

			$(window).scrollTop(this.indexPosition);

		},

		setup : function() {

			var self = this;

			// Set the default scroll event
			this.defaultScroll = Cargo.Helper.ScrollToTop;

			// Reset helper methods
			Cargo.Helper.ScrollToTop = function() {

				// Only scroll if project/page is open
				if ( Cargo.Helper.GetCurrentPageType() ){

					Design.scroll.defaultScroll();

				}


				// Close mobile nav if on Phone
				if( Cargo.Helper.isPhone()){

					Design.Mobile.toggleNav(true);

				}
			};

		}

	},


	keybindings: function() {

		// Remove previous bindings
		Cargo.Core.KeyboardShortcut.Remove("Left");
		Cargo.Core.KeyboardShortcut.Remove("Right");

		Cargo.Core.KeyboardShortcut.Add("Left", 37, function() {
			Action.Project.Prev();
			return false;
		});

		Cargo.Core.KeyboardShortcut.Add("Right", 39, function() {
			Action.Project.Next();
			return false;
		});

		Cargo.Core.KeyboardShortcut.Add("Escape", 27, function() {

			// Don't go to index if lightbox is open
			if ( lightbox.isActive ){
				return;

			} else {
				Action.Project.Index();
				return;
			}

		});

	},

	clickBlockToAdvance: function(speed, clickToThumbs) {

		var clickToThumbs = clickToThumbs,
			transitionSpeed = speed,
			lastIndex =  $('.project_content .block').length - 1,
			currentIndex = 0;

		$('.project_content .block').click(function(){

			currentIndex = parseInt($(this).attr("data-block"));
			nextIndex = currentIndex + 1;

			if ( currentIndex == lastIndex && !clickToThumbs ) {

				$('body, html').animate({
					'scrollTop' : 0
				}, ( lastIndex * transitionSpeed + transitionSpeed ) / 5 );

			} else if (currentIndex == lastIndex && clickToThumbs ) {

				$('body, html').animate({
					'scrollTop' : $('.thumbnails').offset().top
				}, transitionSpeed );

			} else {

				$('body, html').animate({
					'scrollTop' : $('.block[data-block="'+ nextIndex +'"]').offset().top
				}, transitionSpeed );

			};

		});

	},

	randomizeThumbnails: function() {

		var thumbs = $(".thumbnail[data-randomized!='true']");

		thumbs.attr('data-randomized', 'true');
		thumbs.shuffle();

	},

	formatThumbnails: function() {

		$(".thumbnail[data-formatted!='true']").each(function() {

			if ($(this).find(".thumb_image img").attr("src") == "/_gfx/thumb_custom.gif") {
				$(this).addClass("default_thumb");
			}

			$(this).attr("data-formatted", "true");

		});

	},

	formatNavigation: function() {

		if ( Cargo.Model.DisplayOptions.get("use_set_links") ) {

			if ( Cargo.Model.DisplayOptions.get("projects_in_text_nav") === false ) {
				$('.set_link').addClass('no_projects');
			}


			$(".set_link").each(function(i){

				if ( $(this).prev().not(".set_wrapper, .set_link.no_projects").length > 0 ) {
					$(this).addClass("first")
				}

				if ( $(this).next().not(".set_link").length > 0 ) {
					$(this).addClass("last")
				}

			})

		}

	}

};

/**
 * Events
 */

$(function() {
	$('body').css('visibility', 'hidden');

	if ( Cargo.View.ProjectDetail !== undefined ) {
		Design.init();
		Design.Mobile.init();
		$('body').css('visibility', 'visible');
		Design.scroll.setup();
		Design.keybindings();

		if ( !Cargo.Helper.IsSearch() ) {

			Design.SetSlideshowWidth();
			Design.SetSlidecontainerTransition();
			Design.formatThumbnails();

		}

		Design.formatNavigation();

	} else {
		$('body').css('visibility', 'visible');
	}

});

$(window).resize(function(){

	Design.ResizeWindowListener();
	Design.SetSlideshowWidth();

	if ( Design.data.centerVertical ) {

		Design.SetProjectBlockImagePadding();

	}

});

Cargo.Event.on("site_resize_start", function() {
	if ( Design.data.centerVertical ) {
		Design.SetProjectBlockImagePadding();
	}

});

Cargo.Event.on("site_resize_end", function() {

	if ( Design.data.centerVertical ) {

		Design.SetProjectBlockImagePadding();

	}

});

Cargo.Event.on("slideshow_thumbnails_toggle", function(el, obj) {

	if ( Design.data.centerVertical ) {
		Design.SetProjectBlockImagePadding(el, obj);
	}

});


Cargo.Event.on("slideshow_on", function(el, obj) {

	// Fix for firefox sloppy resize
	
	_.delay(function(){
		obj.endTransition();
	}, 15)

	$(el).removeClass("slideshow_transitioning");

	$('.slideshow .video_component').each(function(){

		$(this).attr({

			width: $('object', this).attr("width"),
			height: $('object', this).attr("height"),
			"data-elementresizer-child": "data-elementresizer-child"

		});

	});


	Cargo.Plugins.elementResizer.refresh();

	// Add classes for slideshow if nav is active
	if ( Cargo.Model.DisplayOptions.get("slide_text_nav").enabled ) {

		if ( Cargo.Model.DisplayOptions.get("slide_nav_position") == "top" ){

			el.addClass("slideshow_navigation_on_top");

		} else {

			el.addClass("slideshow_navigation_on_bottom");

		}

	}


	$('.slideshow_toggle_thumbnails').click(function(){

		Design.RemoveSlideBlockTransitions(el);
		el.find('.slideshow_thumbnails img.slideshow_active').removeClass('slideshow_active')

		if ( Design.data.centerVertical ) {

			window.requestAnimationFrame(function(){

				Cargo.Plugins.columnizer.updateTargets();
				Design.SetProjectBlockImagePadding();

			});

		} else {

			window.requestAnimationFrame(function(){

				Cargo.Plugins.columnizer.updateTargets();

			});

		}

	});


	if ( Design.data.centerVertical ) {

		Design.SetProjectBlockImagePadding(el, obj);

	}

	$('.slideshow_thumbnails > *', el).click(function(){

		// hack to prevent flashing on click
		el.find('.slideshow_container').css('visibility', 'hidden')
		if ( Design.data.centerVertical ){

			if (el.closest('.block').is('[data-block="0"]') && el.closest('.block').is('.project_content > div:first-child')  ){

				$('body, html').scrollTop( 0 );

			} else {

				$('body, html').scrollTop( el.closest('.block').offset().top);

			}

		} else {

			$('body, html').scrollTop( el.offset().top );

		};

		Design.RemoveSlideBlockTransitions(el);

	});

});


Cargo.Event.on("element_resizer_init", function(plugin) {

    Design.setVerticalMargin();

});


Cargo.Event.on("slideshow_transition_start", function(el, obj) {
	Design.SetSlideBlockTransitions(el);
	Design.SetProjectBlockImagePadding(el, obj);
	el.find('.slideshow_thumbnails img.slideshow_active').removeClass('slideshow_active')

});

Cargo.Event.on("slideshow_transition_finish", function(el, obj) {

	el.find('.slideshow_container').css('visibility', '')
	Design.RemoveSlideBlockTransitions(el);
	$('#slideContainerTransition')[0].disabled = false;
	Design.SetProjectBlockImagePadding(el, obj);

});

Cargo.Event.on("fullscreen_destroy_hotkeys", function() {

	Design.keybindings();

});

Cargo.Event.on("columnizer_update_complete", function() {

	if ( Design.data.centerVertical ){

		Design.SetProjectBlockImagePadding();

	}

});

Cargo.Event.on("columnizer_update_targets", function() {

	if ( Cargo.Model.DisplayOptions.get('randomize_thumbs') ) {
		Design.randomizeThumbnails();
	}

	if ( Design.data.centerVertical ){
		Design.SetProjectBlockImagePadding();
	}

});

Cargo.Event.on("project_collection_reset", function() {

	if ( Design.data.centerVertical ){

		Design.SetProjectBlockImagePadding();

	}

	Design.formatThumbnails();

});

Cargo.Event.on("direct_link_loaded", function(){

	Design.init();
	Design.SetSlideshowWidth();
	Cargo.Plugins.elementResizer.refresh();

});

Cargo.Event.on("project_load_start", function(pid) {

	Design.scroll.project();

});


Cargo.Event.on("project_load_complete", function(pid) {

	if ( Cargo.View.ProjectDetail !== undefined ) {

		var imgs,
			randomImgIndex;

		Design.SetSlideshowWidth();

		//set splash page
		if ( $('.splash', Cargo.View.ProjectDetail.$el).length > 0){


			$('#thumbnails').hide();

			// select random image in the splash
			$('.splash', Cargo.View.ProjectDetail.$el).each(function(){

				if ( $(this).is('a') && !$(this)[0].attributes.href ) {

					$(this).css("cursor", "pointer").attr("rel", "show_index");

				};

				imgs = $('img', this);
				randomImgIndex = Math.floor( Math.random() * imgs.length );

				$(this).css("background-image", "url(" + imgs.eq( randomImgIndex ).attr("src_o") + ")");

			});

			$('.project_footer').hide();

		}

		// Remove active state on Set link if thumbnails are hidden
		if ( (Cargo.Helper.GetCurrentPageType() =="page" && !Cargo.Model.DisplayOptions.get("thumbs_below_pages") && Cargo.Helper.IsOnSet()) ||
		$('.splash', Cargo.View.ProjectDetail.$el).length > 0) {

			$('.set_link.active').removeClass("active");

		}



		if ( Design.data.centerVertical && Cargo.Helper.GetCurrentPageType() !== "page"){

			Design.FormatProjectContent();
			Design.setVerticalMargin();
			Cargo.Plugins.elementResizer.refresh();
			Design.SetProjectBlockImagePadding();

			/* hack for direct links */
			setTimeout(function(){

				if ( !Design.data.columnizeSlideThumbs ) {
					$('.slideshow_thumbnails').removeAttr("data-columnize");

					$('.slideshow_thumbnails .column').each(function(){
						$('.padding_helper', this).unwrap();
						$(this).unwrap();
					})

					if (Cargo.Plugins.hasOwnProperty("columnizer")) {
						Cargo.Plugins.columnizer.updateTargets();
					}
				}

				Design.SetProjectBlockImagePadding();

			}, 10);
		}

	}

/*
	if (Cargo.Model.Project.GetType() == "project") {
		if (!Cargo.Model.DisplayOptions.attributes.thumbs_below_projects || Cargo.Helper.IsOnSet()) {
			$(".show_index").show();
		}
	}
	*/

	if ( Design.data.columnizeSlideThumbs ) {

		$('.slideshow_thumbnails').each(function(){

			this.setAttribute('data-columnize', 'img');
			this.setAttribute('data-columnize-equalize', 'true');
			this.setAttribute('data-columnize-width', Design.data.thumbWidth);
			this.setAttribute('data-columnize-fluid', 'true');

		});

	}

});


Cargo.Event.on("pagination_complete", function() {

	if (Cargo.Plugins.hasOwnProperty("columnizer")) {
		Cargo.Plugins.columnizer.updateTargets();
	}

	Design.formatThumbnails();

});

Cargo.Event.on("navigation_reset", function() {
    Design.formatNavigation();
});

// Re-trigger start page active state after nav is reloaded
Cargo.Event.on("navigation_reset project_load_complete", function(){
    if ( $('body').is('.start_project') || Cargo.Helper.IsOnStartProject() ) {
        $('#menu_' + Cargo.Helper.GetStartProjectId() ).addClass("active");
    }
});


Cargo.Event.on("inspector_open", function() {

		var prevProjectOffset = 0,
			currProjectOffset = 0;

		setInterval(function(){

			if ( $('.project_content').length > 0) {

				currProjectOffset = $('.project_content', Cargo.View.ProjectDetail.$el).offset().top;

				if ( currProjectOffset  !== prevProjectOffset ) {

					Design.setVerticalMargin();
					Cargo.Plugins.elementResizer.refresh();
					Design.SetProjectBlockImagePadding();

				}

				prevProjectOffset = currProjectOffset;
			}

		}, 400);

});


$(document).ready(function(){

	Cargo.Event.on("show_index_complete", function(pid) {

		Design.scroll.index();

		if (Cargo.Plugins.hasOwnProperty("columnizer")) {
			Cargo.Plugins.columnizer.updateTargets();
		}

	});

});


/**
 * Shuffling
 * http://css-tricks.com/snippets/jquery/shuffle-dom-elements/
 */

(function($){

	$.fn.shuffle = function() {

		var allElems = this.get(),
			getRandom = function(max) {
				return Math.floor(Math.random() * max);
			},
			shuffled = $.map(allElems, function(){
				var random = getRandom(allElems.length),
					randEl = $(allElems[random]).clone(true)[0];
				allElems.splice(random, 1);
				return randEl;
			});

		this.each(function(i){
			$(this).replaceWith($(shuffled[i]));
		});

		return $(shuffled);

	};

})(jQuery);

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Moeller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());