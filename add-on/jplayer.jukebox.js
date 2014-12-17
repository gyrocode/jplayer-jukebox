/*!
 * Jukebox Object for the jPlayer Plugin
 * http://www.gyrocode.com/projects/jplayer-jukebox
 *
 * Copyright (c) 2014 Gyrocode
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/MIT
 *
 * Author: Michael Ryvkin (http://www.gyrocode.com/projects/jplayer-jukebox)
 * Version: 0.3
 * Date: 5/26/2014
 */

(function($, undefined){
   jPlayerJukebox = function(options){
      var jb = this;
      this.id = 'jplayer_jukebox';

      this.options = $.extend({}, this._options, options);

      this._construct();

      this.j = $('#' + jb.id + '_container');
      this.p = $('#' + jb.id);


      this.pl = new jPlayerPlaylist({
            jPlayer: '#' + jb.id,
            cssSelectorAncestor: '#' + jb.id + '_container'
         },
         [], this.options
      );

      this.trackCur = null;
      this.typesSupported = {
         'mp3':'mp3',
         'm4a':'m4a',
         'oga':'oga,ogg',
         'fla':'fla,flac',
         'wav':'wav',
         'webma':'webma,weba'
      };

      this.p.bind($.jPlayer.event.ready,  function(e){ jb._onReady(e);  });
      this.p.bind($.jPlayer.event.play,   function(e){ jb._onPlay(e);   });
      this.p.bind($.jPlayer.event.pause,  function(e){ jb._onPause(e);  });
      this.p.bind($.jPlayer.event.resize, function(e){ jb._onResize(e); });
   };

   jPlayerJukebox.prototype = {
      // Default options
      _options: {
         jukeboxOptions: {
         },
         playlistOptions: {
            enableRemoveControls: true
         },
         supplied: 'mp3',
         smoothPlayBar: true,
         keyEnabled: true,
         audioFullScreen: true,
         autohide: {
            minimize: true,
            restored: false
         },
         useStateClassSkin: true
      },

      // Builds media player on the page
      _construct: function(){
         var jb = this;

         var html =
            '<div id="' + jb.id + '_container" class="jp-video jp-jukebox jp-pos-float-bl" style="visibility:hidden" role="application" aria-label="media player">'
            + '<div class="jp-type-playlist">'
            + '<div class="jp-playlist"><ul><li></li></ul></div>'
            + '<div id="' + jb.id + '" class="jp-jplayer"></div>'
            + '<div class="jp-gui">'
            + '   <div class="jp-video-play">'
            + '      <button class="jp-video-play-icon" role="button" tabindex="0">play</button>'
            + '   </div>'
            + '   <div class="jp-interface">'
            + '      <div class="jp-progress">'
            + '         <div class="jp-seek-bar">'
            + '            <div class="jp-play-bar"></div>'
            + '         </div>'
            + '      </div>'
            + '      <div class="jp-current-time" role="timer" aria-label="time"></div>'
            + '      <div class="jp-duration" role="timer" aria-label="duration"></div>'
            + '      <div class="jp-controls-holder">'
            + '         <div class="jp-controls">'
            + '            <button class="jp-previous" role="button" tabindex="0">previous</button>'
            + '            <button class="jp-play" role="button" tabindex="0">play</button>'
            + '            <button class="jp-stop" role="button" tabindex="0">stop</button>'
            + '            <button class="jp-next" role="button" tabindex="0">next</button>'
            + '         </div>'
            + '         <div class="jp-volume-controls">'
            + '            <button class="jp-mute" role="button" tabindex="0">mute</button>'
            + '            <button class="jp-volume-max" role="button" tabindex="0">max volume</button>'
            + '            <div class="jp-volume-bar">'
            + '               <div class="jp-volume-bar-value"></div>'
            + '            </div>'
            + '         </div>'
            + '         <div class="jp-toggles">'
            + '            <button class="jp-repeat" role="button" tabindex="0">repeat</button>'
            + '            <button class="jp-shuffle" role="button" tabindex="0">shuffle</button>'
            + '            <button class="jp-full-screen" role="button" tabindex="0">full screen</button>'
            + '            <button class="jp-show-playlist" role="button" tabindex="0">playlist</button>'
            + '         </div>'
            + '      </div>'
            + '      <div class="jp-details">'
            + '         <div class="jp-title" aria-label="title"></div>'
            + '      </div>'
            + '      <div class="jp-visibility-toggle jp-visibility-toggle-on"><div class="jp-visibility-toggle-arrow"></div></div>'
            + '   </div>'
            + '</div>'
            + '<div class="jp-no-solution">'
            + '   <span>Update Required</span>'
            + '   To play the media you will need to either update your browser to a recent version or update your <a href="http://get.adobe.com/flashplayer/" target="_blank">Flash plugin</a>.'
            + '</div>'
            + '</div>'
            + '</div>';
         $('body').append(html);
      },

      // Gets filename from URL
      _getFilenameFromUrl: function (url) {
         var fn = url;

         index = fn.indexOf('?');
         if(index != -1){
            fn = fn.substring(0, index);
         }

         index = fn.lastIndexOf("/");
         if(index != -1){
            fn = fn.substring(index + 1);
         }

         return fn;
      },

      // Gets media type from URL
      _getTypeFromUrl: function (url) {
         var jb = this;

         var type = null;
         try {
            var str = url;

            var index = str.indexOf('://');
            var is_proto_avail = false;
            if(index != -1){
               is_proto_avail = true;
               str = str.substring(index + 3);
            }

            index = str.indexOf('?');
            if(index != -1){
               str = str.substring(0, index);
            }

            index = str.lastIndexOf('/');
            var is_file_avail = false;
            if(index != -1){
               is_file_avail = true;
               str = str.substring(index + 1);
            }

            index = str.lastIndexOf('.');
            if((!is_proto_avail || is_file_avail) && index != -1){
               var extension = str.substring(index + 1, str.length).toLowerCase();

               for(var typeSupported in jb.typesSupported){
                  if(jb.typesSupported.hasOwnProperty(typeSupported)){
                     if($.inArray(extension, jb.typesSupported[typeSupported].split(',')) != -1){
                        type = typeSupported;
                        break;
                     }
                  }
               }

               if($.inArray(type, jb.options.supplied.split(',')) == -1){
                  type = null;
               }
            }

            return type;

         } catch(e) {
            return type;
         }
      },

      // Handles event when jPlayer is initialized
      _onReady: function(e){
         var jb = this;

         $('.jp-playlist').slideUp(0);
         $('.jp-show-playlist').click(function(e){
            if(jb.j.hasClass('jp-state-playlist')){
               jb.j.removeClass('jp-state-playlist');
               $('.jp-playlist').slideUp(400);
            } else {
               jb.j.addClass('jp-state-playlist');
               $('.jp-playlist').slideDown(400);
            }
         });

         $('#' + jb.id + '_container').css('visibility', 'visible');
         jb.setVisibility(!jb.options.autohide.minimize, 0);
         $('.jp-visibility-toggle').click(function(e){
            var $btn = $(this);
            jb.setVisibility(($btn.hasClass('jp-visibility-toggle-off')), 400);
         });

         this.parsePage();
      },

      // Parses page and adds media links to the playlist
      parsePage: function(e){
         var jb = this;

         // List of links that haven't been processed
         var anchors = $('a').not('.jp-page-link');

         var mediaTracks = [];
         var idFirst = jb.pl.playlist.length;

         var i, $el, type;

         for(i = 0; i < anchors.length; i++){
            $el = $(anchors[i]);
            if($el.hasClass('jp-media')){
               type = jb._getTypeFromUrl($el.attr('href'));
               if(type){
                  mediaTracks.push({ el: $el, type: type, id: idFirst + mediaTracks.length, time: 0 });
               }
            }
         }

         if(!mediaTracks.length){
            for(i = 0; i < anchors.length; i++){
               $el = $(anchors[i]);
               type = jb._getTypeFromUrl($el.attr('href'));
               if(type){
                  mediaTracks.push({ el: $el, type: type, id: idFirst + mediaTracks.length, time: 0 });
               }
            }
         }

         for(i = 0; i < mediaTracks.length; i++){
            track = mediaTracks[i];
            track.btn = $('<span />', { 'class': 'jp-page-btn-play', 'text': 'Play' });

            track.btn.click(function(e){
               $(this).next('.jp-page-link').click();
               e.preventDefault();
            });

            var playlistEntry = {
               title:(track.el.attr('title')) ? track.el.attr('title') : jb._getFilenameFromUrl(track.el.attr('href')),
               artist:(track.el.data('artist')) ? track.el.data('artist') : "",
               track: track
            };

            playlistEntry[track.type] = track.el.attr('href');
            jb.pl.add(playlistEntry);

            track.el.before(track.btn);
            track.el.addClass('jp-page-link');

            track.el.click({ track: track }, function(e){
               var track = e.data.track;

               if(track.btn.hasClass('jp-page-btn-pause')){
                  jb.p.jPlayer("pause");

               } else {
                  var isTrackFound = false;

                  // Determine player position
                  var playTime = 0;
                  if(jb.trackCur){
                     if(track.id == jb.trackCur.id){
                       playTime = jb.trackCur.time;
                       isTrackFound = true;

                     } else {
                       jb.trackCur.time = 0;
                     }
                  }

                  // Select track in the playlist
                  var i;
                  if(playTime === 0){
                     for(i = 0; i < jb.pl.playlist.length; i++){
                        playlistItem = jb.pl.playlist[i];
                        if(playlistItem.track.id == track.id){
                           jb.pl.select(i);
                           isTrackFound = true;
                           break;
                        }
                     }
                  }

                  // If item exists in the playlist
                  if(isTrackFound){
                     jb.p.jPlayer('play', playTime);

                  // Otherwise, if item doesn't exist in the playlist
                  } else {
                     var media = { track: track };
                     media[jb.options.supplied] = $(this).attr('href');

                     jb.p.jPlayer('setMedia', media);
                     jb.p.jPlayer('play', playTime);
                  }
               }

               e.preventDefault();
            });
         }
      },

      setVisibility: function(state, speed){
         var jb = this;
         if(state){
            $('#' + jb.id + '_container').finish().animate({ left: '0' }, speed, function(){
               $('.jp-visibility-toggle').addClass('jp-visibility-toggle-on').removeClass('jp-visibility-toggle-off');
            });
         } else {
            var width = $('#' + jb.id + '_container').outerWidth();
            $('#' + jb.id + '_container').finish().animate({ left: '-' + (width+1) + 'px' }, speed, function(){
               $('.jp-visibility-toggle').addClass('jp-visibility-toggle-off').removeClass('jp-visibility-toggle-on');
            });
         }
      },

      // Handles play event
      _onPlay: function(e){
         var jb = this;
         jb.trackCur = e.jPlayer.status.media.track;

         if($('.jp-page-btn-pause').length){
            $('.jp-page-btn-pause').removeClass('jp-page-btn-pause').addClass('jp-page-btn-play');
         }

         jb.trackCur.btn.removeClass('jp-page-btn-play').addClass('jp-page-btn-pause');
      },

      // Handles pause event
      _onPause: function(e){
         var jb = this;

         if(jb.trackCur){
            if(!e.jPlayer.status.ended){
               jb.trackCur.time = e.jPlayer.status.currentTime;
            } else {
               jb.trackCur.time = 0;
            }
         }

         var track = e.jPlayer.status.media.track;
         track.btn.removeClass('jp-page-btn-pause').addClass('jp-page-btn-play');
      },

      // Handles resize event
      _onResize: function(e){
         var jb = this;
         if($('.jp-playlist-on').css('display') !== 'none'){
            if(e.jPlayer.options.fullScreen){
               $('.jp-playlist').slideDown(0);
            } else {
               $('.jp-playlist').slideUp(0);
            }
         }
      }
   };
})(jQuery);