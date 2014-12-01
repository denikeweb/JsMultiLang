/**
 * JsMultiLang
 *
 * @documentation http://lux-blog.org/blog/development/jsmultilang-framework
 * @author Denis Dragomirik <den@lux-blog.org>
 * @version 1.0
 *
 */
var JsMultiLang = {
	/**
	 * @private
	 */
	langName : '',

	/**
	 * Array of working functions
	 *
	 * @private
	 */
	translators : {},

	/**
	 * @returns string
	 */
	toString : function () {
		return JSON.stringify (this.getLangObj ());
	},

	/**
	 * Returns set language object
	 *
	 * @private
	 * @returns JsMultiLang.languages.[thisLang] Object
	 */
	getLangObj : function () {
		return this.languages [this.langName];
	},

	/**
	 * Set usage language
	 *
	 * @param langName
	 */
	setLang : function (langName) {
		this.langName = langName;
	},

	/**
	 * Set new language
	 *
	 * @param langName
	 * @param words
	 */
	addLangConfig : function (langName, words) {
		this.languages [langName] = new this.languages.construct ();
		if (words != undefined)
			this.languages [langName] ['words'] = words;
	},

	/**
	 * Set of languages
	 */
	languages : {
		/**
		 * Languages prototypes constructor
		 *
		 * @returns {{words: {}}}
		 */
		construct : function () {
			return {
				words : {},
				dictionary : {
					siteContents : {},
					translates : {}
				}
			}
		}
	},

	/**
	 * Returns sth word from sth set
	 *
	 * @param setName
	 * @param wordId
	 * @returns {word}
	 */
	getWords : function (setName, wordId) {
		return this.getLangObj () ['words'] [setName] [wordId];
	},

	/**
	 * Set sth contents for element checked by id
	 *
	 * @param elementId
	 * @param setName
	 * @param wordId
	 */
	setForId : function (elementId, setName, wordId) {
		document.getElementById (elementId).innerHTML = this.getWords (setName, wordId);
	},

	/**
	 * Set sth contents for first element checked by className
	 *
	 * @param elementClassName
	 * @param setName
	 * @param wordId
	 */
	setForFirstClassElement : function (elementClassName, setName, wordId) {
		document.getElementsByClassName (elementClassName) [0].innerHTML = this.getWords (setName, wordId);
	},

	/**
	 * Set sth contents for all elements checked by className
	 *
	 * @param elementClassName
	 * @param setName
	 * @param wordId
	 */
	setForClassElements : function (elementClassName, setName, wordId) {
		var elementSet = document.getElementsByClassName (elementClassName);
		for (key in elementSet)
			elementSet [key].innerHTML = this.getWords(setName, wordId);
	},

	/**
	 * Set contents of title tag
	 *
	 * @param setName
	 * @param wordId
	 */
	setPageTitle : function (setName, wordId) {
		var title = document.getElementsByTagName ('title') [0];
		if (title != undefined)
			title.innerHTML = this.getWords(setName, wordId);
	},

	/**
	 * Add translators functions
	 *
	 * @param translators
	 */
	addTranslators : function (translators) {
		this.translators = translators;
	},

	/**
	 * Run translators function
	 *
	 * @param funcName
	 */
	translate : function (funcName) {
		this.translators [funcName] ();
	},

	/**
	 * Add new words to setted array
	 *
	 * JsMultiLang.addWords ('eng', 'locations', 'denwer', 'Denwer');
	 * JsMultiLang.addWords ('rus', 'locations', 'denwer', 'Денвер');
	 *
	 * @param langName
	 * @param setName
	 * @param wordId
	 * @param word
	 */
	addWords : function (langName, setName, wordId, word) {
		if (this.languages [langName] ['words'] [setName] == undefined)
			this.languages [langName] ['words'] [setName] = [];
		this.languages [langName] ['words'] [setName] [wordId] = word;
	},

	/**
	 * Add new words to setted array
	 *
	 * JsMultiLang.addWordsSet ('locations', 'denwer', {
	 *      eng : 'Denwer',
	 *      rus : 'Денвер'
	 * });
	 *
	 * @param setName
	 * @param wordId
	 * @param wordsHash
	 */
	addWordsSet : function (setName, wordId, wordsHash) {
		for (lang in wordsHash) {
			this.addWords (lang, setName, wordId, wordsHash [lang]);
		}
	},

	/**
	 * Set dictionary for translateAll.
	 *
	 * You must send 3 params:
	 * siteContents is need for translation words [or phrases] {nodes} on site;
	 * translates is new variation of words [or phrases] with same key from siteContents;
	 * and language name that use this dictionary
	 * Also you can use another format with 2 parameters:
	 * array of elements with 2 parameters: original word [or phrase]
	 * and new variation of word [or phrase]
	 * second: and language name that use this dictionary
	 *
	 * @see translateAll
	 * @param siteContents
	 * @param translates
	 * @param langName
	 */
	setDictionary : function (siteContents, translates, langName) {
		if (typeof siteContents == 'object' && typeof translates == 'object' && typeof langName == 'string') {
			if (langName == undefined)
				langName = getLangObj();
			var dictionary = this.languages [langName] ['dictionary'];
			dictionary.siteContents = siteContents;
			dictionary.translates = translates;
		} else {
			langName = (translates == undefined) ? getLangObj() : translates;
			var dictionary = this.languages [langName] ['dictionary'];
			for (var i = 0; i < siteContents.length; i++) {
				dictionary.siteContents [i] = siteContents [i] [0];
				dictionary.translates [i] = siteContents [i] [1];
			}
		}
	},

	/**
	 * Translate all nodes at site.
	 * You can set root scan area.
	 * Default root scan area - body children nodes
	 *
	 * @param rootNode
	 */
	translateAll : function (rootNode) {
		var
			/**
			 * Scan nodes and change phrases
			 *
			 * @param el {node element}
			 * @param jmlObj
			 */
			actionFunc = function (el, jmlObj) {
				var str = el.nodeValue,
					dictionary = jmlObj.getLangObj () ['dictionary'];
				// text nodeType code - 3, check is not empty
				if (el.nodeType === 3 && str.length > 0) {
					// check this trimmed phrase for all cells in dictionary
					for (key in dictionary.siteContents) {
						if (str.trim() == dictionary.siteContents [key])
							// set new phrase value
							el.nodeValue = dictionary.translates [key];
					}
				}
			},

			/**
			 * recursion function for nodes brute force
			 * of children nodes of root node
			 *
			 * @param el {node element}
			 * @param actionFunc
			 * @param jmlObj
			 */
			rec = function (el, actionFunc, jmlObj){
				var childs = el.childNodes,
					i = childs.length;
				//call action function
				actionFunc (el, jmlObj);
				while (i--)
					if( el.nodeType === 1 )
						rec( childs[i], actionFunc, jmlObj );
			};
		// set default root scan area
		if (rootNode == undefined) rootNode = document.body;
		rec (rootNode, actionFunc, this);
	}
};