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
         }
      },

      // Builds media player on the page
      _construct: function(){
         var jb = this;

         var html =
            '<div id="' + jb.id + '_container" class="jp-video jp-jukebox jp-pos-float-bl">'
            + '   <div class="jp-type-playlist">'
            + '      <div class="jp-playlist"><ul><li></li></ul></div>'
            + '      <div class="jp-no-solution">'
            + '         <span>Update Required</span>'
            + '         To play the media you will need to either update your browser to a recent version or update your <a href="http://get.adobe.com/flashplayer/" target="_blank">Flash plugin</a>.'
            + '      </div>'
            + '      <div id="' + jb.id + '" class="jp-jplayer"></div>'
            + '      <div class="jp-gui">'
            + '         <div class="jp-video-play">'
            + '            <a href="javascript:;" class="jp-video-play-icon" tabindex="1">play</a>'
            + '         </div>'
            + '         <div class="jp-interface">'
            + '            <div class="jp-progress">'
            + '               <div class="jp-seek-bar">'
            + '                  <div class="jp-play-bar"></div>'
            + '               </div>'
            + '            </div>'
            + '            <div class="jp-current-time"></div>'
            + '            <div class="jp-duration"></div>'
            + '            <div class="jp-controls-holder">'
            + '               <ul class="jp-controls">'
            + '                  <li><a href="javascript:;" class="jp-previous" tabindex="1">previous</a></li>'
            + '                  <li><a href="javascript:;" class="jp-play" tabindex="1">play</a></li>'
            + '                  <li><a href="javascript:;" class="jp-pause" tabindex="1">pause</a></li>'
            + '                  <li><a href="javascript:;" class="jp-next" tabindex="1">next</a></li>'
            + '                  <li><a href="javascript:;" class="jp-stop" tabindex="1">stop</a></li>'
            + '                  <li><a href="javascript:;" class="jp-mute" tabindex="1" title="mute">mute</a></li>'
            + '                  <li><a href="javascript:;" class="jp-unmute" tabindex="1" title="unmute">unmute</a></li>'
            + '                  <li><a href="javascript:;" class="jp-volume-max" tabindex="1" title="max volume">max volume</a></li>'
            + '               </ul>'
            + '               <div class="jp-volume-bar"><div class="jp-volume-bar-value"></div></div>'
            + '               <ul class="jp-toggles">'
            + '                  <li><a href="javascript:;" class="jp-playlist-off" tabindex="1" title="hide playlist">hide playlist</a></li>'
            + '                  <li><a href="javascript:;" class="jp-playlist-on" tabindex="1" title="show playlist">show playlist</a></li>'
            + '                  <li><a href="javascript:;" class="jp-full-screen" tabindex="1" title="full screen">full screen</a></li>'
            + '                  <li><a href="javascript:;" class="jp-restore-screen" tabindex="1" title="restore screen">restore screen</a></li>'
            + '                  <li><a href="javascript:;" class="jp-shuffle" tabindex="1" title="shuffle">shuffle</a></li>'
            + '                  <li><a href="javascript:;" class="jp-shuffle-off" tabindex="1" title="shuffle off">shuffle off</a></li>'
            + '                  <li><a href="javascript:;" class="jp-repeat" tabindex="1" title="repeat">repeat</a></li>'
            + '                  <li><a href="javascript:;" class="jp-repeat-off" tabindex="1" title="repeat off">repeat off</a></li>'
            + '               </ul>'
            + '            </div>'
            + '            <div class="jp-title"><ul><li></li></ul></div>'
            + '            <div class="jp-visibility-toggle jp-visibility-toggle-on"><div class="jp-visibility-toggle-arrow"></div></div>'
            + '         </div>'
            + '      </div>'
            + '   </div>'
            + '</div>';
         $('body').append(html);
      },

      // Gets media type from file extension
      _getTypeFromExtension: function (url) {
         var jb = this;

         var type = null;
         try {
            var str = url;

            var index = str.indexOf("://");
            var is_proto_avail = false;
            if(index != -1){
               is_proto_avail = true;
               str = str.substring(index + 3);
            }

            index = str.indexOf('?');
            if(index != -1){
               str = str.substring(0, index);
            }

            index = str.indexOf("/");
            var is_file_avail = false;
            if(index != -1){
               is_file_avail = true;
               str = str.substring(index + 1);
            }

            index = str.lastIndexOf(".");
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

         var anchors = $('a');

         var mediaTracks = [];
         $.each($('a'), function(index, el){
            var $el = $(el);
            if($el.hasClass('jp-media')){
               var type = jb._getTypeFromExtension($el.attr('href'));
               if(type){
                  mediaTracks.push({ el: $el, type: type, id: mediaTracks.length, time: 0 });
               }
            }
         });

         if(!mediaTracks.length){
            $.each($('a'), function(index, el){
               var $el = $(el);
               var type = jb._getTypeFromExtension($el.attr('href'));
               if(type){
                  mediaTracks.push({ el: $el, type: type, id: mediaTracks.length, time: 0 });
               }
            });
         }

         $.each(mediaTracks, function(index, track){
            track.btn = $('<span />', { 'class': 'jp-page-btn-play', 'text': 'Play' });

            track.btn.click(function(e){
               $(this).next('.jp-page-link').click();
               e.preventDefault();
            });

            var playlistEntry = {
               title:(track.el.attr('title')) ? track.el.attr('title') : track.el.attr('href'),
               artist:(track.el.data('artist')) ? track.el.data('artist') : "",
               track: track
            };

            playlistEntry[track.type] = track.el.attr('href');
            jb.pl.add(playlistEntry);

            track.el.before(track.btn);
            track.el.addClass('jp-page-link');

            track.el.click(function(e){
               if(track.btn.hasClass('jp-page-btn-pause')){
                  jb.p.jPlayer("pause");

               } else {
                  var playTime = 0;
                  if(jb.trackCur){
                     if(track.id == jb.trackCur.id){
                       playTime = jb.trackCur.time;
                     } else {
                       jb.trackCur.time = 0;
                     }
                  }

                  // Determine item index in the playlist and select it
                  var playlistItemSelected = -1;
                  if(playTime === 0){
                     $.each(jb.pl.playlist, function(index, playlistItem){
                        if(playlistItem.track.id == track.id){
                           jb.pl.select(index);
                           playlistItemSelected = index;
                           return false;
                        }
                     });
                  }

                  // If item exists in the playlist
                  if(playlistItemSelected != -1){
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
         });

         $('.jp-playlist-off').hide();
         $('.jp-playlist').slideUp(0);
         $('.jp-playlist-on').click(function(e){
            $('.jp-playlist').slideDown(400, function(){
               $('.jp-playlist-off').show();
               $('.jp-playlist-on').hide();
            });
         });
         $('.jp-playlist-off').click(function(e){
            $('.jp-playlist').slideUp(400, function(){
               $('.jp-playlist-on').show();
               $('.jp-playlist-off').hide();
            });
         });

         jb.setVisibility(!jb.options.autohide.minimize, 0);
         $('.jp-visibility-toggle').click(function(e){
            var $btn = $(this);
            jb.setVisibility(($btn.hasClass('jp-visibility-toggle-off')), 400);
         });
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