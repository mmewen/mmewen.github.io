# Post a new project

Note that the simplest way is of course to copy/paste a old post :)

* Determine the project number (`N`).
* Add the new project data to `projects.json` file like :
```json
"N" : {
	"en": {
		"title": "Titre",
		"tags": ["tag 1", "tag 2"],
		"short_description": "Short descr."
	},
	"media": {
		"type": "image",
		"content": ""
	},
	"meta": {
		"location": "",
		"locationUrl": "",
		"date": "",
		"hardware": [],
		"software":[]
	}
}
```
_`type` can be `image` (no `content` needed), `youtube`, `vimeo`... `content` will be the link to the video (see [Poptrox](https://github.com/ajlkn/jquery.poptrox) types)_ (deprecated).
* Make a `N.en.txt` (and a `N.fr.txt` if enabled) with the post content.
* Put a thumbnail pict in `../images/thumbs` and a full size picture in `../images/thumbs` (if `"type": "image"` chosen).