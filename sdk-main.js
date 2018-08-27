/* YP SDK */
(function(window, document) {"use strict";

var version = "1.0";

if (typeof window.ypSdkVersion !== "undefined" && window.ypSdkVersion === version) return;

window.ypSdkVersion = version;

/**
  * @desc Our configuration variables
*/

// var baseUrl = "http://10.0.2.15:8081";
// var baseUrl = "http://localhost:8081";
var baseUrl = "https://www.example.com";

var imageBaseUrl = baseUrl;
var pdfBaseUrl = baseUrl;
var sdkHostUrl = baseUrl+"/";
var requestUrl = sdkHostUrl;
var sdkDirectory = "yp_sdk";
var ypSwiperScroll = 0;

var jQuery, $; // Localize jQuery variables

var ypLibUrl = {
  "jquery": "https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js",
  "jsPlugins": sdkHostUrl + sdkDirectory + "/sdk-plugins.js",
  "css": sdkHostUrl + sdkDirectory + "/sdk.css",
}
function loadScript(url, callback) {
  /* Load script from url and calls callback once it's loaded */
  var scriptTag = document.createElement('script');
  scriptTag.setAttribute("type", "text/javascript");
  scriptTag.setAttribute("src", url);
  if (typeof callback !== "undefined") {
    if (scriptTag.readyState) {
      /* For old versions of IE */
      scriptTag.onreadystatechange = function () {
        if (this.readyState === 'complete' || this.readyState === 'loaded') {
          callback();
        }
      };
    } else {
      scriptTag.onload = callback;
    }
  }
  (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(scriptTag);
}

function loadCss(url, callback) {
  /* Load Css from url and calls callback once it's loaded */
  var linkTag = document.createElement('link');
  linkTag.setAttribute("rel", "stylesheet");
  linkTag.setAttribute("type", "text/css");
  linkTag.setAttribute("href", url);
  if (typeof callback !== "undefined") {
    if (linkTag.readyState) {
      /* For old versions of IE */
      linkTag.onreadystatechange = function () {
        if (this.readyState === 'complete' || this.readyState === 'loaded') {
          callback();
        }
      };
    } else {
      linkTag.onload = callback;
    }
  }
  (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(linkTag);
}

function loadCustomCss(clientId) {
  var cssUrl = baseUrl + "/portal/clients/" + clientId + "/custom_css.css";
  loadCss(cssUrl , function() {
  });
}

/**
  * @desc This is our main funtion will run after loading all scripts
  * @author Harpreet Singh
*/
function ypMain() {
  var clientId;
  $(".yp-sdk-widget[data-sdk]").each(function(index){
    var currentWidget = $(this);
    currentWidget.attr("id", "yp-sdk-widget-"+index);
    if (currentWidget.data('client-id')) {
      clientId = currentWidget.data('client-id');
      loadCustomCss(clientId);
      switch (currentWidget.data('sdk')) {
        case "quick-booking":
            quickBooking(currentWidget, clientId);
            break;
        case "event-slider":
            eventSlider(currentWidget, clientId);
            break;
        case "food-menu":
            ypMenu(currentWidget, clientId, "food");
            break;
        case "drink-menu":
            ypMenu(currentWidget, clientId, "drink");
            break;
        case "package-booking":
            packageBooking(currentWidget, clientId);
            break;
        case "event-booking":
            eventBooking(currentWidget, clientId);
            break;
        default:
      }
    }


  });

  var resizeTimeout;
  $(window).resize(function(){
    if(!!resizeTimeout){ clearTimeout(resizeTimeout); }
    resizeTimeout = setTimeout(function(){
      adjustColumns();
    },200);
  });

  bindAdjustmentEvents();
}


function bindAdjustmentEvents(){
  $( document ).ajaxComplete(function( event, xhr, settings ) {
    adjustFrames();
  });
  $(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
    // var target = $(e.target).attr("href") // activated tab
    adjustFrames();
  });
}

/**
  * @desc Funtion will Load food menus widget
  * @param Object currentWidget - Current element for widget
  * @param Int clientID - clientID for widget
  * @author Harpreet Singh
*/
function ypMenu(currentWidget, clientId, type){

  var typeSlug = "";
  var modalLabal = "";
  var id = currentWidget.index();


  if (type === "food") {
    typeSlug = "show_pdf";
    modalLabal = "Food Menu";
  }
  else {
    typeSlug = "drink_menu_pdf";
    modalLabal = "Drink Menu";
  }

  $.ajax({
    url: requestUrl+"widgets/clients/" + clientId + "/menus/"+typeSlug,
    jsonp: "callback",
    dataType: "jsonp",
    success: function (res) {
      var html = '';
      html += '<div class="yp-foodmenu">';
      var images;
      var pdf;

      if (type === "food") {
        images = res.food;
         pdf = res.pdf;
      }
      else {
        images = res.drink;
        pdf = res.pdf;
      }
      for (var i=0; i < images.length; i++){
        html += '<div class="yp-foodmenu-item"><a data-toggle="modal" data-target="#foodMenuModel'+id+'" href="#"><img src="'+images[i]+'"></a></div>';
      }

      html += '<div class="modal food-menu-modal fade" id="foodMenuModel'+id+'" tabindex="-1" role="dialog">';
      html += '  <div class="modal-dialog modal-lg" role="document">';
      html += '    <div class="modal-content">';
      html += '      <div class="modal-header">';
      html += '        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
      html += '        <h4 class="modal-title">'+modalLabal+'</h4>';
      html += '      </div>';
      html += '      <div class="modal-body">';
      html += '        <iframe id="foodMenuIframe'+id+'" src="'+pdf+'" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>';
      html += '      </div>';
      html += '    </div>';
      html += '  </div>';
      html += '</div>';

      currentWidget.html(html);

      $('#foodMenuModel'+id).on('shown.bs.modal', function () {
        $('#foodMenuIframe'+id).css('height', ($('#foodMenuModel'+id).height()-160)+'px');
        // alert($('#foodMenuModel'+id).height());
      })
    },
    error: function (err) {
      // console.log(err.message);
    }
  });
}
 
/**
  * @desc This funtion will create eventslider on basis of options
  * @param Object currentWidget - Current element for widget
  * @param Int clientID - clientID for widget
  * @author Harpreet Singh
*/
function eventSlider(currentWidget, clientId){
  var feedsUrlSlug = [];
      feedsUrlSlug[1] = "feed_one_events";
      feedsUrlSlug[2] = "feed_two_events";
      feedsUrlSlug[3] = "feed_three_events";

  var options = {
    multislide: false,
    detailonclick: false,
    detailonbottom: false
  };
  var classes = "";

  if (currentWidget.data("event-feed")) {
    var currentFeedIndex = currentWidget.data("event-feed");
  }else{
    return 0;
  }


  $.ajax({
    url: requestUrl+"widgets/clients/" + clientId + "/events/"+ feedsUrlSlug[currentFeedIndex],
    jsonp: "callback",
    dataType: "jsonp",
    success: function (res, a, b) {
      var sliderType,
          sliderSpacing,
          sliderSpeed;

      // console.log(requestUrl+"widgets/clients/" + clientId + "/events/"+ feedsUrlSlug[currentFeedIndex]);
      // console.log(res);
      if ($.isEmptyObject(res)) {
        return;
      }

      if (typeof res[0].slider_style !== "undefined")
        sliderType = res[0].slider_style;
      else
        sliderType = 'type1';

      if (typeof res[0].image_spaceing !== "undefined")
        sliderSpacing = res[0].image_spaceing;
      else
        sliderSpacing = 0;

      if (typeof res[0].scroll_speed !== "undefined")
        sliderSpeed = res[0].scroll_speed;
      else
        sliderSpeed = 0;

      if (currentWidget.data('slider')) sliderType = currentWidget.data('slider');
      if (currentWidget.data('speed')) sliderSpeed = currentWidget.data('speed');
      if (currentWidget.data('spacing')) sliderSpacing = currentWidget.data('spacing');

      switch (sliderType) {
        case "type1":
            options.multislide = false;
            options.detailonclick = false;
            options.detailonbottom = false;
            break;
        case "type2":
            options.multislide = true;
            options.slidesPerView = 3;  
            options.detailonclick = false;
            options.detailonbottom = false;
            break;
        case "type3":
            options.multislide = true;
            options.slidesPerView = 3;  
            options.detailonclick = true;
            options.detailonbottom = false;
            break;
        case "type4":
            options.multislide = true;
            options.slidesPerView = 3;  
            options.detailonclick = true;
            options.detailonbottom = true;
            break;
        case "type5":
            options.multislide = false;
            options.detailonclick = true;
            options.detailonbottom = false;
            break;
        case "type6":
            options.multislide = false;
            options.detailonclick = true;
            options.detailonbottom = true;
            break;
        default:
          options.multislide = false;
          options.detailonclick = false;
          options.detailonbottom = false;
      }



      options.space = sliderSpacing;
      options.speed = sliderSpeed;
      // console.log(options);
      // if(typeof res[0].scroll_speed !== undefined && res[0].scroll_speed !== '' ){
      //   ypSwiperScroll = Math.abs(parseInt(res[0].scroll_speed));
      // }

      var ypSliderWidth = 'auto';
      if (typeof res[0].slider_width !== undefined && parseInt(res[0].slider_width) >= 200) {
        ypSliderWidth = parseInt(res[0].slider_width)+'px';
      }
      if (currentWidget.data('width')) ypSliderWidth = currentWidget.data('width');

      var ypSliderHeight = 'auto';
      if (typeof res[0].slider_height !== undefined && parseInt(res[0].slider_height) >= 200) {
        ypSliderHeight = parseInt(res[0].slider_height)+'px';
      }
      if (currentWidget.data('height')) ypSliderHeight = currentWidget.data('height');


      var html = "";
      html += '<div class="yp-slider-widget" id="yp-slider-widget" style="width: '+ypSliderWidth+'">';

      if (options.detailonclick && !options.detailonbottom) {
        html += '<div class="yp-event-details"></div>';
      }

      html += '<div class="swiper-container '+classes+'" style="height: '+ypSliderHeight+';"><div class="swiper-wrapper">';
      // html += '<div class="swiper-container '+classes+'" style=""><div class="swiper-wrapper">';

      $.each(res, function (i, event) {

        html += '<div class="swiper-slide"><a class="yp-event-link" data-client-id="'+clientId+'" data-id="'+event.id+'" href="'+requestUrl+'widgets/clients/'+event.client_id+'/events/'+event.id+'/show_event" target="_blank"><img src="'+event.image+'" alt="'+event.name+'"></a></div>';

      });
      html += '</div><div class="swiper-pagination"></div><div class="swiper-button-next"></div><div class="swiper-button-prev"></div></div>';

      if (options.detailonclick && options.detailonbottom) {
        html += '<div class="yp-event-details"></div>';
      }

      html += '</div>';

      currentWidget.html(html);
      styleWidget(currentWidget);
      // console.log(options);
      bindingEventSliderEvents(currentWidget, clientId, options);
    },
    error: function (err) {
      // console.log(err.message);
    }
  });
}

function getInt(value){
  if(typeof value !== undefined && !!value){
    value = Math.abs(parseInt(value));
    return value;
  }
  else{
    return 0;
  }
}

/**
  * @desc This funtion will initialize slider and bind required click events
  * @param Object currentWidget - Current element for widget
  * @param Int clientID - clientID for widget
  * @param ArrayObject options - Containing slider settings
  * @author Harpreet Singh
*/
function bindingEventSliderEvents(currentWidget, clientId, options){
  var sliderSpacing = options.space;
  var sliderSpeed = options.speed;

  var sliderOptions = {
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      el: '.swiper-pagination',
    },
    loop: true,
    paginationClickable: true,
    centeredSlides: true,
  }

  sliderSpeed = sliderSpeed * 1000;

  if (sliderSpeed >= 1000 && sliderSpeed <= 10000) {
    // sliderOptions.autoplay = sliderSpeed;
    // sliderOptions.autoplayDisableOnInteraction = false;
    sliderOptions.autoplay = {
      delay: sliderSpeed,
      disableOnInteraction: false,
    }
  }

  // spaceBetween : '30',
  sliderOptions.spaceBetween = sliderSpacing;
  if (sliderSpacing == null) {
    sliderOptions.spaceBetween = 10;
  }
  
  // sliderOptions.spaceBetween = 30;


  if (options['multislide']){
    slidesPerView: 'auto',
    sliderOptions.slidesPerView = 'auto';
    // sliderOptions.slidesPerView = 3;
    // sliderOptions.breakpoints = {
    //     1024: {
    //       slidesPerView: 3,
    //     },
    //     768: {
    //       slidesPerView: 2,
    //     },
    //     480: {
    //       slidesPerView: 1,
    //     }
    //   };
    // currentWidget.find(".swiper-slide").css("width", "auto");
  }
  // console.log(sliderOptions);
  var swiper = new Swiper(currentWidget.find('.swiper-container'), sliderOptions);

  if (options.detailonclick) {
    currentWidget.on("click", ".yp-event-link", function(e){
      e.preventDefault();
      eventSummary($(this), $(this).data("client-id"), $(this).data("id"));
    });
    currentWidget.find(".yp-event-link").first().trigger("click");
    // eventSummaryLayoutAdjust(currentWidget);
  }
}


/**
  * @desc This funtion Show details of events on click event
  * @param Object currentWidget - Current element for widget
  * @param Int clientID - clientID for widget
  * @param Int eventID - eventID for clicked event
  * @author Harpreet Singh
*/
function eventSummary(currentEventObj, clientId, eventId){
  var eventDetailContainer = currentEventObj.parents(".yp-sdk-widget").find(".yp-event-details");
  eventDetailContainer.append('<div class="yp-event-loader"><img width="50" alt="" src="'+requestUrl+sdkDirectory+'/puff.svg"></div>')
  var html='';
  $.ajax({
    url: requestUrl+"widgets/clients/" + clientId + "/events/"+eventId,
    jsonp: "callback",
    dataType: "jsonp",
    success: function (event) {
      html += "<div id='' class='yp-row'>";
      html += "<div class='yp-col-6'>";
      html += "<a href='#'><img src='"+event.image+"'></a>";
      html += "</div>";
      html += "<div class='yp-col-6'>";
      html += "<div><h2>"+event.event_name+"</h2></div>";
      html += "<div class='table-responsive'>";
      html += "<table class='yp-event-details-table table'><tr>";
      html += "<td><strong>Event Date</strong></td>";
      html += "<td>"+event.occurs_on;
      if(event.available_till_date !="")
      html += " to "+event.available_till_date;
      html +="</td></tr><tr>";
      html += "<td><strong>Event Time</strong></td>";
      html += "<td>"+event.event_starts_at+" to "+event.event_ends_at+"</td></tr><tr>";
      html += "<td><strong>Description</strong></td>";
      html += "<td>"+event.desc+"</td></tr><tr>";
      html += "<td colspan='2'>";
      html += "<a class='yp-btn' href='"+imageBaseUrl+"/widgets/clients/"+clientId+"/events/"+eventId+"/show_event' target='_blank'>Learn More</a></div>";
      html += "</td></tr>";
      html += "</div>";
      html += "</div>";
      html += "</div>";
      eventDetailContainer.html(html);
      adjustColumns();
    }
  })
}
// function eventSummaryLayoutAdjust(currentWidget){
//   currentWidget = currentWidget || null;
//   if (currentWidget === null) {
//     $(".yp-event-details").each(function(index){
//       eventSummaryClassOnWidth($(this));
//     });
//   }else{
//     eventSummaryClassOnWidth(currentWidget.find(".yp-event-details"));
//   }

// }
// function eventSummaryClassOnWidth(eventDetailContainer){
//   if (eventDetailContainer.width() < 600) {
//     eventDetailContainer.addClass("yp-one-column-detail");
//   }else{
//     eventDetailContainer.removeClass("yp-one-column-detail");
//   }
// }

/**
  * @desc This funtion will initialize all quick booking widgets
  * @param Object currentWidget - Current element for widget
  * @param Int clientID - clientID for widget
  * @author Harpreet Singh
*/
function quickBooking(currentWidget, clientId){
  $.ajax({
    url: requestUrl+"widgets/clients/" + clientId + "/bookings/new",
    jsonp: "callback",
    dataType: "jsonp",
    success: function (res) {

      var html = '';
      html += '<div class="yp-container">';
      html += '   <h2 class="yp-title">Quick Booking</h2>';
      html += '   <div class="">';
      html += '      <div class="yp-form-conatiner">';
      html += '         <form id="quickbookingForm" class="" role="form" action="'+requestUrl+'widgets/clients/'+clientId+'/bookings">';
      html += '            <div class="yp-form-group"><input type="text" required="" name="first_name" placeholder="First Name" id="first_name" class="yp-form-control"></div>';
      html += '            <div class="yp-form-group"><input type="text" name="last_name" placeholder="Last Name" id="lastname" class="yp-form-control"></div>';
      html += '            <div class="yp-form-group"><input type="email" required="" placeholder="Email" name="customer_email" id="customer_email" class="yp-form-control"></div>';
      html += '            <div class="yp-form-group"><input type="text"  placeholder="Phone Number" name="customer_phone" id="customer_phone" class="yp-form-control"></div>';
      html += '            <div class="yp-row">';
      html += '               <div class="yp-col-6">';
      html += '                  <div class="yp-form-group"><input type="number" required="" name="form_query" id="form_query" min="1" class="yp-form-control" placeholder="Estimated Amount Of Guests"></div>';
      html += '               </div>';
      html += '               <div class="yp-col-6">';
      html += '                  <div class="yp-form-group">';
      html += '                     <div id="yp-qb-on-date" class="yp-icon-right date"><input type="text" required="" name="on_date" id="on_date" placeholder="Date" class="yp-form-control"><span class="yp-icon yp-icon-calendar"></span></div>';
      html += '                  </div>';
      html += '               </div>';
      html += '            </div>';
      html += '            <div class="yp-row">';
      html += '               <div class="yp-col-6">';
      html += '                  <div class="yp-form-group">';
      html += '                     <div id="yp-qb-start-time" class="yp-icon-right date"><input type="text" required="" name="start_time" id="start_time" placeholder="Start Time" required="" class="yp-form-control"><span class="yp-icon yp-icon-time"></span></div>';
      html += '                  </div>';
      html += '               </div>';
      html += '               <div class="yp-col-6">';
      html += '                  <div class="yp-form-group">';
      html += '                     <div id="yp-qb-end-time" class="yp-icon-right date"><input type="text" name="end_time" id="end_time" class="yp-form-control" placeholder="End Time"><span class="yp-icon yp-icon-time"></span></div>';
      html += '                  </div>';
      html += '               </div>';
      html += '            </div>';
      html += '            <textarea id="message" placeholder="Message" name="note" yp-rows="5" class="yp-form-control"></textarea>';
      html += '            <div style="display:none" class="form-error-msg alert alert-danger text-center"></div>';
      html += '            <div style="display:none" class="form-response-msg alert alert-success text-center"></div>';
      html += '            <br>';
      html += '            <div class=""><button class="submit yp-btn yp-btn-primary yp-btn-block" id="quicksubmit" type="submit">Submit</button></div>';
      html += '         </form>';
      html += '      </div>';
      html += '   </div>';
      html += '</div>';

      currentWidget.html(html);
      styleWidget(currentWidget);
      bindQuickBookingEvents(currentWidget, clientId);
    },
    error: function (err) {
      // console.log(err.message);
    }
  });
}


/**
  * @desc This funtion will initialize all PackageBooking widgets
  * @param Object currentWidget - Current element for widget
  * @param Int clientID - clientID for widget
  * @author Harpreet Singh
*/

function packageBooking(currentWidget, clientId){
  $.ajax({
    url: requestUrl+"widgets/clients/" + clientId + "/packages",
    jsonp: "callback",
    dataType: "jsonp",
    success: function (res) {
      var html = '';
      html += "<div id='content' class='yp-container package-content'>";
      html +=     "<div class='yp-row'>";
      html +=         "<div class='col-md-12 top-heading'>";
      html +=             "<h1 class='yp-title'>Book An Event</h1>";
      html +=             "<ul class='nav nav-tabs clearfix' role='tablist'>";
      html +=             "</ul>";
      html +=             "<div class='tab-content'>";
      html +=             "</div>";
      html +=          "</div>";
      html +=      "</div>";
      html +=  "</div>";


      var inhtml = ""
      // var typep
      currentWidget.html(html);
      $.each(res, function (i, package_data) {
        // console.log(package_data.price_model);
        // if (package_data.price_model == "PerParty")
        // {
        //   typep = "Per Party"
        // }

        // if (package_data.price_model == "PerPerson")
        // {
        //   typep = "Per Person"
        // }


        var data = "<li class=''>"+"<a href='#"+package_data.name.replace(/ /g,'_')+"'"+" role='tab' data-toggle='tab'>"+package_data.name+"</a>"+"</li>"
        $('.package-content .nav-tabs').append(data).find('li:first-child').addClass('active');
        data = "<div class='tab-pane fade in' id='"+package_data.name.replace(/ /g,'_')+"'>";
        data += "<div class='yp-row'>";
        data += "<div class='col-md-6 sidebar'>";
        data += "<div class='text-center'>";
        data += "<img class='img-rounded' src='"+ package_data.avatar+"'><br><br>";
        data += "<a target='_blank' href='"+ requestUrl +"widgets/clients/" + clientId + "/bookings/packagebooking_new?package_id="+ package_data.id +"' class='btn btn-primary btn-block'>I&#39;M INTERESTED</a><br>";
        data += "<span class='st_facebook_large' displayText='Facebook'>";
        data += '<span style="text-decoration:none;color:#000000;display:inline-block;cursor:pointer;" class="stButton">';
        data += '<span class="stLarge" style="background-image: url(&quot;https://w.sharethis.com/images/facebook_32.png&quot;);"></span>';
        data += '</span>';
        data += "</span>";
        data += "<span class='st_twitter_large' displayText='Tweet'></span>";
        data += "<span class='st_googleplus_large' displayText='Google +'></span>";
        data += "<span class='st_pinterest_large' displayText='Pinterest'></span>";
        data += "</div>";
        data += "<h4 class=''>Other Info:</h4>";
        data += '<small>' +package_data.other_info+ '</small>';
        data += "</div>";
        data += "<div class='col-md-6 main-content'>";
        data += '<div class="panel panel-default">';
        data += "<div class='panel-heading'>" +package_data.name+ "</div>";
        // data += "<p><strong>Price:</strong>"+package_data.price+"</p>";
        // data += "<p><strong>Price Type:</strong> "+package_data.price_model+"</p>";
        // data += "<p><strong>Start Date:</strong> "+package_data.starts_on+"</p>";
        // data += "<p><strong>End Date:</strong> "+package_data.ends_on+"</p>";
        data += '<div class="panel-body">';
        data += "<p><strong>Description:</strong>"+package_data.description+"</p>";
        data += "<p><strong>Price:</strong>"+package_data.price+" "+" "+package_data.price_model+"</p>";
        data += "</div>";
        data += "</div>";
        data += "</div>";
        data += "</div>";
        data += "</div>";
          $('.package-content .tab-content').append(data).find('.tab-pane:first-child').addClass('active');
      });

    },
    error: function (err) {
      // console.log(err.message);
    }
  });
}


/**
  * @desc This funtion will initialize all Events booking widgets
  * @param Object currentWidget - Current element for widget
  * @param Int clientID - clientID for widget
  * @author Harpreet Singh
*/

function eventBooking(currentWidget,clientId){

  $.ajax({
    url: requestUrl+"widgets/clients/" + clientId + "/events",
    jsonp: "callback",
    dataType: "jsonp",
    success: function (res) {
      var html ="";
      html += "<div id='content' class='container event-list'>";
      html +=     "<div class='yp-row'>";

      $.each(res, function (i, event) {
         html +=      "<div class='col-sm-3'>";
         html +=           "<div class='event-container'>";
        if (event.available_until == ""){
          html +=               "<a href='"+requestUrl+"widgets/clients/"+event.client_id+"/events/"+event.id+"/show_event' target='_blank'>";
          html +=                    "<div class='img-container' style='background-image:url("+event.image+");'>";
          // html +=                         "<img src='"+imageBaseUrl+event.image+"'>";
          html +=                     "</div>";
          html +=                     "<div class='img-title'>";
          html +=                          "<h4 class='margin'><strong>"+ event.name +"</strong></h4>";
          html +=                     "</div>";
          html +=                     "<div class='time clearfix'>";
          html +=                          "<div class='date pull-left'>";
          html +=                                "<span>"+ event.occurs_on +"</span>";
          html +=                          "</div>"
        }
        else{
          html +=               "<a href='"+requestUrl+"widgets/clients/"+event.client_id+"/events/"+event.id+"/show_event' target='_blank'>";
          html +=                    "<div class='img-container' style='background-image:url("+event.image+");'>";
          // html +=                        "<img src='"+imageBaseUrl+event.image+"'>";
          html +=                    "</div>";
          html +=                    "<div class='img-title'>";
          html +=                        "<h4 class='margin'>"+ event.name +"</h4>";
          html +=                    "</div>";
          html +=                    "<div class='time clearfix'>";
          html +=                        "<div class='date pull-left'>";
          html +=                            "<span>"+ event.occurs_on +"-"+event.available_until +"</span>";
          html +=                        "</div>"
        }

        if (event.ticket == ""){
          html +=                        "<span class='pull-right'>"+event.ticket+"</span>";
        }else{
          html +=                        "<span class='pull-right'>"+event.ticket+"</span>";
        }
        html +=                       "</div>";
        html +=                   "</a>";
        html +=               "</div>";
        html +=          "</div>";

        var img = "";
        if (event.image)
            // img = "<img src=\"" + event.image + "\" />";
          img = "<img src='https://yp-stage-client.s3.amazonaws.com/images/1/Koala.jpg'>";


        });

        html +="</div>"+"</div>"
        currentWidget.html(html);
    },
    error: function (err) {
      // console.log(err.message);
    }
  });
styleWidget(currentWidget);
}

/**
  * @desc This funtion is called within quickBooking for binding events of quickbooking current widget
  * @param Object currentWidget - Current element for widget
  * @param Int clientID - clientID for widget
  * @author Harpreet Singh
*/
function bindQuickBookingEvents(currentWidget, clientId){
  var date = new Date();
  date.setDate(date.getDate());

  currentWidget.find('#on_date').datetimepicker({
    format: 'L',
    minDate : date

  });
  currentWidget.find('#start_time').datetimepicker({
    format: 'LT'
  });
  currentWidget.find('#end_time').datetimepicker({
    format: 'LT'
  });
    currentWidget.find('form#quickbookingForm').submit(function(event) {
  // $("#quicksubmit").on("click", function(e){
    var loadingClass = "yp-btn-loading";
    var button = $('#quicksubmit');
      var form = $("#quickbookingForm");
      button.addClass(loadingClass);
      $.ajax({
        type: "POST",
        url: "https://www.example.com/"+"widgets/clients/"+clientId+"/bookings",
        crossDomain: true,
        xhrFields: {
          withCredentials: true
        },
        jsonp: "callback",
        dataType: "json",
        data: form.serialize(),

        success: function (event) {
          currentWidget.find('.form-response-msg').html('Your request has been sent successfully').slideDown('fast', function(){
            adjustFrames();
          }).delay(5000).slideUp('fast', function(){
            adjustFrames();
          });

          currentWidget.find("#first_name").val("");
          currentWidget.find("#lastname").val("");
          currentWidget.find('#message').val("");
          currentWidget.find("#client_id").val("");
          currentWidget.find("#customer_email").val("");
          currentWidget.find("#form_query").val("");
          currentWidget.find("#on_date").val("");
          currentWidget.find("#customer_phone").val("");
          button.removeClass(loadingClass);
        },
        error: function (err) {
          currentWidget.find('.form-error-msg').html('Your request has not been sent successfully').slideDown().delay(5000).slideUp();
          button.removeClass(loadingClass);
        }
      });
      event.preventDefault();
      return false;
    //});
  });  /* QuickBooking */
}

/**
  * @desc This funtion will adjust yp-col on basis of yp-row
  * @author Harpreet Singh
*/
function adjustColumns(){
  $('.yp-row').each(function(index){
    var current = $(this);
    if (parseInt(current.width()) <= 480) {
      current.addClass('yp-col-full');
    }else{
      current.removeClass('yp-col-full');
    }
  });
}

function adjustFrames(){
  if (typeof parent.ypSDKAdjustFrameCallback === 'function') {
    // console.log("its working")
    parent.ypSDKAdjustFrameCallback();
  }
}

/**
  * @desc This funtion will add custom styling for widgets.
  * @param Object options - contains array of settings
  * @author Harpreet Singh
*/
function styleWidget(currentWidget, options){

  var id = "#"+currentWidget.attr('id');

  var settings = $.extend({
      // These are the defaults.
      // color: "#333",
      // bgColor: "transparent",
      // primaryColor: "#399BFF"
      color: "",
      bgColor: "",
      primaryColor: ""
  }, options );

  if (currentWidget.data('color')) settings.color = currentWidget.data('color');
  if (currentWidget.data('bg-color')) settings.bgColor = currentWidget.data('bg-color');
  if (currentWidget.data('primaryColor')) settings.primaryColor = currentWidget.data('primaryColor');


  var css = prepareCss("", settings),
      head = document.head || document.getElementsByTagName('head')[0],
      style = document.createElement('style');

  style.type = 'text/css';
  if (style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }

  head.appendChild(style);
}

/**
  * @desc This funtion will prepare css for widgets
  * @param Object options - contains array of settings
  * @author Harpreet Singh
*/
function prepareCss(id, options){
  var css = "";

  if (options.primaryColor != "") {
    css += id + ' .yp-btn{';
    css += '  color: #fff;';
    css += '}';

    css += id + ' .yp-btn,';
    css += id + ' .swiper-pagination-bullet-active{ ';
    css += '  background-color: '+options.primaryColor+';';
    css += '}';

    css += id + ' .yp-form-control:focus{';
    css += '  border-color: '+options.primaryColor+';';
    css += '}';

    css += id + ' .swiper-button-next,';
    css += id + ' .swiper-button-prev{';
    css += '  color:'+options.primaryColor+'; ';
    css += '}';

    css += id + ' .bootstrap-datetimepicker-widget table td.today::before{';
    css += '  border-color: rgba(0, 0, 0, 0.2) transparent '+options.primaryColor+' transparent;';
    css += '}';

    css += id + ' .bootstrap-datetimepicker-widget table td.active, ';
    css += id + ' .bootstrap-datetimepicker-widget table td.active:hover,';
    css += id + ' .bootstrap-datetimepicker-widget table td span.active,';
    css += id + ' .bootstrap-datetimepicker-widget table td span.active,';
    css += id + ' .btn.btn-primary,';
    css += id + ' .btn.btn-primary:hover{';
    css += '  background-color: '+options.primaryColor+';';
    css += '}';
    
    css += id + ' a{';
    css += '  color: '+options.primaryColor+';';
    css += '}';
  }

  if (options.color != "") {
    css += id + ' .yp-container{';
    css += '  color: '+options.color+';';
    css += '}';

    css += id + ' h2,';
    css += id + ' .yp-event-details-table td{';
    css += '  color: '+options.color+';';
    css += '}';
  }

  if (options.bgColor != "") {
    css += id + ' .yp-container{';
    css += '  background-color: '+options.bgColor+';';
    css += '}';

    css += id + ' .yp-slider-widget{';
    css += '  background-color: '+options.bgColor+';';
    css += '}';
  }


  return (css);
}



/* Load jQuery */
loadScript(ypLibUrl.jquery, function() {
  /* Restore $ and window.jQuery to their previous values and store the
     new jQuery in our local jQuery variables. */
  $ = jQuery = window.jQuery.noConflict(true);
  /* Load jQuery plugin and execute the main logic of yourportal widgets once the
     plugin is loaded */
  loadScript(ypLibUrl.jsPlugins, function() {
    loadCss(ypLibUrl.css , function() {
      initYpSdkPlugins(jQuery);
      ypMain();
    });
  });
});
}(window, document));
