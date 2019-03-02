## Content types

**Stremio supports the following content types as of Apr 2016:**

* ``movie`` - movie type - has metadata like name, genre, description, director, actors, images, etc. 
* ``series`` - series type - has all the metadata a movie has, plus an array of episodes
* ``channel`` - channel type - created to cover YouTube channels; has name, description and an array of uploaded videos
* ``tv`` - tv type - has name, description, genre; streams for ``tv`` should be live (without duration)

**If you think Stremio should add another content type, feel free to open an issue on this repository.**
