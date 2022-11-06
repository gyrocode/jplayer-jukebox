/*! jPlayer Jukebox add-on 0.6.8 (https://www.gyrocode.com/projects/jplayer-jukebox/) ~ (c) Gyrocode.com ~ MIT License */
(function($, undefined){
   jPlayerJukebox = function(options){
      //
      // INITIALIZATION
      //
      var jb = this;

      var g = {
         // Options: Default values
         'optionsDefaults': {
            'jukeboxOptions': {
               'autoAdvance': true,
               'className': 'ui-light ui-gradient',
               'uiCover': false,
               'uiRemove': true,
               'position': 'float-bl',
               'viewState': 'minimized',
               'selectorParse': window.document,
               'id': 'jplayer_jukebox',
               'playLink': true
            },
            'playlistOptions': {
               'enableRemoveControls': true
            },
            'swfPath': '//gyrocode.github.io/jplayer-jukebox/0.6.4/',
            'supplied': 'mp3,oga,wav,fla,webma,xspf',
            'smoothPlayBar': true,
            'keyEnabled': false,
            'audioFullScreen': false,
            'autohide': {
               'restored': false
            },
            'useStateClassSkin': true
         },

         // Current track
         'track': null,

         // Supported formats and their extensions
         'typesSupported': {
            'mp3':'mp3',
            'm4a':'m4a',
            'oga':'oga,ogg',
            'fla':'fla,flac',
            'wav':'wav',
            'webma':'webma,weba',
            'xspf':'xspf'
         }
      };


      // Options
      g.options = $.extend({}, g.optionsDefaults, options);
      if(typeof g.options['jukeboxOptions'] !== 'undefined'){
         g.options.jukeboxOptions = $.extend(
            {},
            g.optionsDefaults.jukeboxOptions,
            g.options.jukeboxOptions
         );
      }

      // Validate options parameters
      if( $.inArray(
            g.options.jukeboxOptions.position,
            ['float-bl','fixed-t','fixed-b','static']
          ) === -1 )
      {
         g.options.jukeboxOptions.position = g.optionsDefaults.jukeboxOptions.position;
      }

      if( $.inArray(
            g.options.jukeboxOptions.viewState,
            ['minimized','maximized', 'hidden']
          ) === -1 )
      {
         g.options.jukeboxOptions.viewState = g.optionsDefaults.jukeboxOptions.viewState;
      }


      // Translating jukeboxOptions properties into existing properties of playlistOptions
      g.options.playlistOptions.enableRemoveControls = g.options.jukeboxOptions.uiRemove;


      _construct();


      // Elements: Player
      g.$jp = $('#' + g.options.jukeboxOptions.id + '_player');

      // Elements: Player container
      g.$jc = $('#' + g.options.jukeboxOptions.id + '_container');

      // Override jPlayerPlaylist method for creating playlist items
      jPlayerPlaylist.prototype._createListItem = function(media) {
         var self = this;

         // Wrap the <li> contents in a <div>
         var listItem = "<li><div>";

         // Create link to remove a playlist entry
         listItem += "<a href='javascript:;' class='" + this.options.playlistOptions.removeItemClass + "'></a>";

         // Create link to download a song
         if(media.download){
            listItem += '<a href="' + media.url + '" class="jp-playlist-item-download" target="_blank" download></a>';
         }

         // Create link to buy a song
         if(media.buy){
            listItem += '<a href="' + media.buy + '" class="jp-playlist-item-buy" target="_blank"></a>';
         }

         if(g.options.jukeboxOptions.uiCover){
            listItem += '<span class="jp-playlist-item-cover">';

            if(media.poster){
               listItem += '<img src="' + media.poster + '">';
            } else {
               listItem += '<span class="jp-playlist-item-cover-default"></span>';
            }

            listItem += '</span>';
         }

         // The title is given next in the HTML otherwise the float:right on the free media corrupts in IE6/7
         listItem += "<a href='javascript:;' class='" + this.options.playlistOptions.itemClass + "' tabindex='0'>" + media.title + (media.artist ? " <span class='jp-artist'>by " + media.artist + "</span>" : "") + "</a>";
         listItem += "</div></li>";

         return listItem;
      };

      // Construct jPlayerPlaylist object
      g.pl = new jPlayerPlaylist({
            jPlayer: '#' + g.options.jukeboxOptions.id + '_player',
            cssSelectorAncestor: '#' + g.options.jukeboxOptions.id + '_container'
         },
         [], g.options
      );


      // Event handlers
      g.$jp.on($.jPlayer.event.ready,  function(e){ _onReady(e);  });
      g.$jp.on($.jPlayer.event.play,   function(e){ _onPlay(e);   });
      g.$jp.on($.jPlayer.event.pause,  function(e){ _onPause(e);  });
      g.$jp.on($.jPlayer.event.resize, function(e){ _onResize(e); });

      // Remove handler set by jPlayerPlaylist
      // to allow fine-grained control on auto-advancing functionality
      g.$jp.off($.jPlayer.event.ended);
      g.$jp.on($.jPlayer.event.ended,  function(e){ _onEnded(e); });


      //
      // PRIVILEGED FUNCTIONS
      //

      // Calls jPlayer method
      this.jPlayer = function(){
         g.$jp.jPlayer.apply(g.$jp, arguments);
         return this;
      };

      // Adds a media item to the end of the playlist
      this.add = function(track, playNow){
         track.data = {
            id: g.pl.playlist.length
         };

         $.each(track, function(key, value){
            if(g.typesSupported.hasOwnProperty(key)){
               track.type = key;
               track.url  = value;
               return false;
            } else {
               return true;
            }
         });

         return g.pl.add(track, playNow);
      };

      // Removes the item from the playlist
      this.remove = function(index){
         if(typeof index === 'undefined'){
            // Remove all tracks
            for(index = 0; index < g.pl.playlist.length; index++){
               _removeTrack(g.pl.playlist[index]);
            }

            return g.pl.remove();

         } else {
            // NOTE: Negative index relates to end of array.
            var index_adj = (index < 0) ? g.pl.playlist.length + index : index;
            if(0 <= index_adj && index_adj < g.pl.playlist.length){
               _removeTrack(g.pl.playlist[index_adj]);
            }

            return g.pl.remove(index);
         }
      };

      // Clears the playlist but leaves links playable
      this.clear = function(){
         $('.jp-cover', g.$jc).html('<div class="jp-cover-default"></div>');
         $('.jp-title', g.$jc).html('');

         return g.pl.remove();
      };

      // Selects the item in the playlist
      this.select = function(index){ return g.pl.select(index); };

      // Shuffles the playlist
      this.shuffle = function(shuffled, playNow){ return g.pl.shuffle(shuffled, playNow); };

      // Moves to and plays the next item in the playlist
      this.next = function(){ return g.pl.next(); };

      // Moves to and plays the previous item in the playlist
      this.previous = function(){ return g.pl.previous(); };

      // Pauses the current item
      this.pause = function(){ return g.pl.pause(); };

      // Plays the item in the playlist
      this.play = function(index){ return g.pl.play(index); };

      // Parses page and adds media links to the playlist
      this.parse = function(){
         var jb = this;

         // List of links that haven't been processed
         var $anchors_media = $('a.jp-media', $(g.options.jukeboxOptions.selectorParse));
         var $anchors = ($anchors_media.length) ? $anchors_media : $('a', g.options.jukeboxOptions.selectorParse).not('.jp-page-link, .jp-playlist-item-free, .jp-playlist-item-download, .jp-media-ignore');

         var i, $el, type, url;

         for(i = 0; i < $anchors.length; i++){
            $el = $($anchors[i]);
            url  = $el.attr('href');
            type = _getTypeFromUrl(url);

            if(!type && $el.attr('type') === 'application/xspf+xml'){
               if($.inArray('xspf', g.options.supplied.split(',')) !== -1){
                  type = 'xspf';
               }
            }

            if(type){
               if(type === 'xspf'){
                  _addPlaylist(type, $el);

               } else {
                  var track = {
                     'title':    ($el.attr('title'))    ? $el.attr('title')  : $el.text(),
                     'artist':   ($el.data('artist'))   ? $el.data('artist') : "",
                     'album':    ($el.data('album'))    ? $el.data('album')  : "",
                     'poster':   ($el.data('image'))    ? $el.data('image')  : "",
                     'buy':      ($el.data('buy'))      ? $el.data('buy')  : "",
                     'download': ($el.data('download')) ? $el.data('download')  : "",
                     'url':      url,
                     'type':     type,
                     'data': {
                        'el': $el,
                        'id': g.pl.playlist.length
                     }
                  };

                  track[type] = url;

                  // If title is empty, use file name instead
                  if(!track['title']){
                     track['title'] = _getFilenameFromUrl($el.attr('href'));
                  }

                  _addTrack(track);
               }

            }
         }
      };

      // Shows/hides the playlist
      this.showPlaylist = function(show, speed){
         if(typeof show === 'undefined'){ show = true; }
         if(typeof speed === 'undefined'){ speed = 0; }

         if(show){
            g.$jc.addClass('jp-state-playlist');
            $('.jp-playlist', g.$jc).slideDown(speed);
         } else {
            g.$jc.removeClass('jp-state-playlist');
            $('.jp-playlist', g.$jc).slideUp(speed);
         }
      };

      // Gets visual state of the player
      this.getViewState = function(){
         if(g.$jc.hasClass('jp-viewstate-minimized')){ return 'minimized'; }
         else if(g.$jc.hasClass('jp-viewstate-maximized')){ return 'maximized'; }
         else if(g.$jc.hasClass('jp-viewstate-hidden')){ return 'hidden'; }
         else { return null; }
      };

      // Sets visual state of the player
      this.setViewState = function(viewState, speed){
         var jb = this;
         var css = {};

         if(typeof speed === 'undefined'){ speed = 0; }

         if(g.options.jukeboxOptions.position === 'float-bl'){
            if(viewState === 'maximized'){
               css = { 'left': 0 };

            } else if(viewState === 'minimized'){
               css = { 'left': '-' + (g.$jc.outerWidth() + 1) + 'px' };

            } else if(viewState === 'hidden'){
               css = { 'left': '-' + (g.$jc.outerWidth() + $('.jp-viewstate-control', g.$jc).outerWidth() + 1) + 'px' };
            }

         } else {
            var property;
            if(g.options.jukeboxOptions.position === 'fixed-t'){
               property = 'top';
            } else {
               property = 'bottom';
            }

            if(viewState === 'maximized' || viewState === 'minimized'){
               css[property] = 0;

            } else {
               if(g.options.jukeboxOptions.position === 'fixed-t'){
                  var playlistHeight =
                     $(g.$jc).hasClass('jp-state-playlist')
                        ? $('.jp-playlist', g.$jc).outerHeight()
                        : 0;

                  css[property] = '-' + (g.$jc.outerHeight() + playlistHeight + 1) + 'px';

               } else {
                  css[property] = '-' + (g.$jc.outerHeight() + 1) + 'px';
               }
            }
         }

         g.$jc.finish().animate(css, speed, function(){
            $(this)
               .removeClass('jp-viewstate-minimized jp-viewstate-maximized jp-viewstate-hidden')
               .addClass('jp-viewstate-' + viewState);
         });
      };


      //
      // PRIVATE FUNCTIONS
      //

      // Builds media player on the page
      function _construct(){
         var html =
            '<div id="' + g.options.jukeboxOptions.id + '_container" class="jp-jukebox" style="visibility:hidden" role="application" aria-label="media player">'
            + '<div class="jp-playlist-container"><div class="jp-playlist jp-gui-bg"><div class="jp-gui-texture"></div><ul><li></li></ul></div></div>'
            + '<div id="' + g.options.jukeboxOptions.id + '_player" class="jp-jplayer"></div>'
            + '<div class="jp-gui jp-gui-bg">'
            + '   <div class="jp-gui-texture"></div>'
            + '   <div class="jp-gui-gradient"></div>'
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
            + '            <button class="jp-previous" role="button" tabindex="0" title="Previous track">previous</button>'
            + '            <button class="jp-play" role="button" tabindex="0" title="Play">play</button>'
            + '            <button class="jp-stop" role="button" tabindex="0">stop</button>'
            + '            <button class="jp-next" role="button" tabindex="0" title="Next track">next</button>'
            + '         </div>'
            + '         <div class="jp-volume-controls">'
            + '            <button class="jp-mute" role="button" tabindex="0" title="Mute">mute</button>'
            + '            <button class="jp-volume-max" role="button" tabindex="0" title="Max volume">max volume</button>'
            + '            <div class="jp-volume-bar">'
            + '               <div class="jp-volume-bar-value"></div>'
            + '            </div>'
            + '         </div>'
            + '         <div class="jp-toggles">'
            + '            <button class="jp-repeat" role="button" tabindex="0" title="Repeat all">repeat</button>'
            + '            <button class="jp-shuffle" role="button" tabindex="0" title="Shuffle">shuffle</button>'
            + '            <button class="jp-full-screen" role="button" tabindex="0" title="Full screen">full screen</button>'
            + '            <button class="jp-show-playlist" role="button" tabindex="0" title="Playlist">playlist</button>'
            + '         </div>'
            + '      </div>'
            + '      <div class="jp-details">'
            + '         <div class="jp-cover" aria-label="cover art"><div class="jp-cover-default"></div></div>'
            + '         <div class="jp-title" aria-label="title"></div>'
            + '      </div>'
            + '      <div class="jp-app-bar"><a href="https://www.gyrocode.com/projects/jplayer-jukebox/" target="_blank">jPlayer Jukebox</a></div>'
            + '      <div class="jp-viewstate-control jp-gui-bg"><div class="jp-gui-texture"></div><div class="jp-gui-gradient"></div><button class="jp-viewstate-toggle" role="button" tabindex="0">&times;</button></div>'
            + '   </div>'
            + '</div>'
            + '<div class="jp-no-solution">'
            + '   <span>Update Required</span>'
            + '   To play the media you will need to either update your browser to a recent version or update your <a href="http://get.adobe.com/flashplayer/" target="_blank">Flash plugin</a>.'
            + '</div>'
            + '</div>';

         var $container = $('#' + g.options.jukeboxOptions.id);
         if(!$container.length){
            $container = $('<div></div>', { 'id': g.options.jukeboxOptions.id });
            $('body').append($container);
         }

         $container.append(html);
      }

      // Gets filename from URL
      function _getFilenameFromUrl(url) {
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
      }

      // Gets media type from URL
      function _getTypeFromUrl(url) {
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

               for(var typeSupported in g.typesSupported){
                  if(g.typesSupported.hasOwnProperty(typeSupported)){
                     if($.inArray(extension, g.typesSupported[typeSupported].split(',')) != -1){
                        type = typeSupported;
                        break;
                     }
                  }
               }

               if($.inArray(type, g.options.supplied.split(',')) == -1){
                  type = null;
               }
            }

            return type;

         } catch(e) {
            return type;
         }
      }

      // Handles event when jPlayer is initialized
      function _onReady(e){
         // Hide playlist by default
         jb.showPlaylist(false, 0);
         // Handle playlist toggle button
         $('.jp-show-playlist', g.$jc).on('click', function(e){
            jb.showPlaylist(!g.$jc.hasClass('jp-state-playlist'), 400);
         });

         g.$jc
            .css('visibility', 'visible')
            .addClass('opt-pos-' + g.options.jukeboxOptions.position)
            .addClass('opt-ui-' + ((g.options.jukeboxOptions.uiCover) ? '' : 'no-') + 'cover')
            .addClass(g.options.jukeboxOptions.className);


         // Set view state
         jb.setViewState(g.options.jukeboxOptions.viewState, 0);

         // Add handler for .jp-viewstate-toggle button
         if(g.options.jukeboxOptions.position === 'float-bl'){
            $('.jp-viewstate-toggle', g.$jc).on('click', function(e){
               jb.setViewState(
                  g.$jc.hasClass('jp-viewstate-minimized')
                     ? 'maximized'
                     : 'minimized',
                  400
               );
            });
         }


         // Force visibility of details pane
         $('.jp-details', g.$jc).show();

         jb.parse();

         // If onInitComplete callback is defined
         if( g.options.jukeboxOptions.hasOwnProperty('onInitComplete')
             && typeof g.options.jukeboxOptions.onInitComplete === 'function' )
         {
            g.options.jukeboxOptions.onInitComplete(jb);
         }
      }

      // Adds external playlist
      function _addPlaylist(playlist_type, $el){
         if(playlist_type === 'xspf'){
            $.get($el.attr('href'), {}, function(xml){
               $('track', xml).each(function (index, value){
                  var url  =  $('location', this).text();
                  var type =  _getTypeFromUrl(url);

                  if(type){
                     var track = {
                        'title':  $('title', this).text(),
                        'artist': $('creator', this).text(),
                        'album':  $('album', this).text(),
                        'poster': $('image', this).text(),
                        'url':    url,
                        'type':   type,
                        'data': {
                           'el': $el,
                           'id': g.pl.playlist.length
                        }
                     };

                     track[type] = url;

                     _addTrack(track);
                  }
               });
            }, 'xml');
         }
      }

      // Adds track to playlist
      function _addTrack(track){
         track.data.time = 0;

         if(track.data.hasOwnProperty('el') && track.data.el instanceof jQuery){
            if(!track.data.el.hasClass('jp-page-link')){
               track.data.btn = $('<span />', { 'class': 'jp-page-btn-play' });
               track.data.btn.on('click', null, { 'track': track }, function(e){ _onClick(e); });
               track.data.el.before(track.data.btn);
               track.data.el.addClass('jp-page-link');

               if(g.options.jukeboxOptions.playLink){
                  track.data.el.on('click', null, { 'track': track }, function(e){ _onClick(e); });
               }
            } else {
               track.data.btn = track.data.el.prev('.jp-page-btn-play');
            }
         }

         g.pl.add(track);
      }

      // Removes track from the playlist
      function _removeTrack(track){
         if(track.data.hasOwnProperty('el') && track.data.el instanceof jQuery){
            if(track.data.el.hasClass('jp-page-link')){
               track.data.btn.remove();
               track.data.el.removeClass('jp-page-link');
               track.data.el.off('click');
            }
         }
      }

      // Handles mouse click event on media link
      function _onClick(e){
         var track = e.data.track;

         if(track.data.btn.hasClass('jp-page-btn-pause')){
            g.$jp.jPlayer("pause");

         } else {
            var isTrackFound = false;

            // Determine player position
            var playTime = 0;
            if(g.track){
               if(track.data.id == g.track.data.id){
                 playTime = g.track.data.time;
                 isTrackFound = true;

               } else {
                 g.track.data.time = 0;
               }
            }

            // Select track in the playlist
            var i;
            if(playTime === 0){
               for(i = 0; i < g.pl.playlist.length; i++){
                  if(g.pl.playlist[i].data.id == track.data.id){
                     g.pl.select(i);
                     isTrackFound = true;
                     break;
                  }
               }
            }

            // If item exists in the playlist
            if(isTrackFound){
               g.$jp.jPlayer('play', playTime);

            // Otherwise, if item doesn't exist in the playlist (removed by user)
            } else {
               g.$jp.jPlayer('setMedia', track);
               g.$jp.jPlayer('play', playTime);
            }
         }

         e.preventDefault();
      }

      // Handles play event
      function _onPlay(e){
         g.track = e.jPlayer.status.media;

         if($('.jp-page-btn-pause', $(g.options.jukeboxOptions.selectorParse)).length){
            $('.jp-page-btn-pause', $(g.options.jukeboxOptions.selectorParse))
               .removeClass('jp-page-btn-pause')
               .addClass('jp-page-btn-play');
         }

         // If cover art should be shown
         if(g.options.jukeboxOptions.uiCover){
            // If track image exists
            if(g.track.poster){
               $('.jp-cover', g.$jc).html(
                  $('<img>', { 'src': g.track.poster })
                     .wrap('<div></div>')
                     .parent()
                     .html()
               );

            // Otherwise, display default cover art
            } else {
               $('.jp-cover', g.$jc).html('<div class="jp-cover-default"></div>');
            }
         }

         if(g.track.data.hasOwnProperty('el') && g.track.data.el instanceof jQuery){
             g.track.data.btn.removeClass('jp-page-btn-play').addClass('jp-page-btn-pause');
         }
      }

      // Handles pause event
      function _onPause(e){
         if(g.track){
            if(!e.jPlayer.status.ended){
               g.track.data.time = e.jPlayer.status.currentTime;
            } else {
               g.track.data.time = 0;
            }
         }

         var track = e.jPlayer.status.media;
         if(track.data.hasOwnProperty('el') && track.data.el instanceof jQuery){
            track.data.btn.removeClass('jp-page-btn-pause').addClass('jp-page-btn-play');
         }
      }

      // Handles resize event
      function _onResize(e){
         if($('.jp-playlist-on', g.$jc).css('display') !== 'none'){
            if(e.jPlayer.options.fullScreen){
               $('.jp-playlist', g.$jc).slideDown(0);
            } else {
               $('.jp-playlist', g.$jc).slideUp(0);
            }
         }
      }

      // Handles ended event
      function _onEnded(e){
         if(g.options.jukeboxOptions.autoAdvance){
            jb.next();
         }
      }
   };

})(jQuery);
