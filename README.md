jplayer-jukebox
===============

jPlayer Jukebox is add-on to jPlayer that allows to play media files on the page by scanning all links and adding them to a playlist.


Installation
------------

1. Follow instructions in jPlayer Quick Start Guide on how to download and install jPlayer on your server. It is recommended to upload jPlayer into a separate folder, for example `/js/jplayer`.

2. Download jPlayer Jukebox add-on, unzip the ZIP file and upload the files into the same location where you have uploaded jPlayer files.

    For example, if you have uploaded jPlayer into `/js/jplayer` folder, then the add-on should be placed in `/js/jplayer/add-on` folder and modified Blue Monday skin – in `/js/jplayer/skin` folder.

3. Include the following lines in HTML page right before `</head>` tag if you haven’t done so already.

    ```
    <!-- jQuery -->
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>

    <!-- jPlayer -->
    <link type="text/css" href="/js/jplayer/skin/blue.monday/jplayer.blue.monday.css" rel="stylesheet" />
    <script type="text/javascript" src="/js/jplayer/jquery.jplayer.min.js"></script>
    <script type="text/javascript" src="/js/jplayer/add-on/jplayer.playlist.min.js"></script>
    <script type="text/javascript" src="/js/jplayer/add-on/jplayer.jukebox.min.js"></script>

    <script type="text/javascript">
       // Initialize jPlayerJukebox
       jQuery(document).ready(function(){
          var jpjb = new jPlayerJukebox({
             swfPath: '/js/jplayer'
          });
       });
    </script>
    ```

    If you have uploaded jPlayer into folder other than `/js/jplayer` folder, please modify the code accordingly.

    If you are already using jQuery on your page, you can skip the line that includes it above.


Demo
----
Demo is available at [gyrocode.com/projects/jplayer-jukebox/](http://www.gyrocode.com/projects/jplayer-jukebox/).


Copyright
---------

Michael Ryvkin, [gyrocode.com](http://www.gyrocode.com)


License
-------

MIT License, [opensource.org/licenses/MIT](http://www.opensource.org/licenses/MIT)

