# Post a new project

Note that the simplest way is of course to copy/paste a old post :)

* Determine the project number (`N`).
* Make a `N.json` file like :
```json
{
	"fr": {
		"title": "Titre en Français",
		"tags": ["tag 1", "tag 2"],
		"short_description": "Courte description"
	},
	"en": {
		"title": "Titre",
		"tags": ["tag 1", "tag 2"],
		"short_description": "Short descr."
	},
	"media": {
		"type": "image",
		"content": ""
	}
}
```
`type` can be `image` (no `content` needed), `youtube`, `vimeo`... `content` will be the link to the video (see [Poptrox](https://github.com/ajlkn/jquery.poptrox) types).
* Make a `N.en.txt` and a `N.fr.txt` with the post content.
* Put a thumbnail pict in `../images/thumbs` and a full size picture in `../images/thumbs` (if `"type": "image"` chosen).