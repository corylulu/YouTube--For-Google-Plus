/*Css class names from Google Plus (likely to change over time with updates, keep here to make easier updating.)*/
var body_className_isMainPage = 'ULpcLb';
var a_className_isTitleLink = 'B-u-Y-j';
var div_className_isDescLinkParent = 'B-u-wa-ea';
var a_className_userLink = 'ot-anchor';
var googlemusic_className_iframe = 'B-u-P0BJAe-uquGtd';
var leavefeedback_class_toHide = 'c-zh-Wf';

/*Heights of each link type in iFrame*/
var youtubeHeight = '316px';
var gmHeight = '64px';
var mp3Height = '57px';
var defaultHeight = '30px';
var hiddenHeight = '0px';

/*Created Elements that are used in multiple functions*/
var youTubeBox = document.createElement('div');
var iframe = document.createElement('iframe');

/*Keeps a count of found links on page*/
var CurrentCount = 0;
var gmCurrentCount = 0; //Google Music Addin
var periodicForceUpdateCounter = 0;
var CurrentDocumentLocation = document.location.href;

initialize();

/*Disables this script from running in Notifications page and Apps page 
 (Notifications page will need extra code to work since it needs to access a sibling iFrame)*/
if(document.location.href.indexOf("/_/") == -1)
{
	var regularChecker = setInterval(function()
	{ 		
		if(periodicForceUpdateCounter > 5)
		{
			/*Forces update every 12 seconds to ensure all links are found.*/
			ForceUpdate();
			periodicForceUpdateCounter=0;
		}
		else if(CurrentDocumentLocation != document.location.href)
		{
			/*If script detects a page location change, execute script*/
			
			/*Forces update to all links, but waits first to ensure page is loaded*/
			setTimeout("ForceUpdate()", 3000);
			CurrentDocumentLocation = document.location.href;
			/*Resets periodic check counter*/
			periodicForceUpdateCounter=0;
		}
		else
		{
			var Links = document.getElementsByClassName(a_className_userLink);
			var gmLinks = document.getElementsByClassName(googlemusic_className_iframe);
			
			/*Cross checks CurrentCount with any new links found, if changed, call placeLinks()*/
			if(CurrentCount != Links.length)
				PlaceLinks(Links);
			if(gmCurrentCount != gmLinks.length)
				gmPlaceLinks(gmLinks);
		}
		periodicForceUpdateCounter++;
	}, 2000);
}


/*Updates all links without condition.*/
function ForceUpdate()
{
	var Links = document.getElementsByClassName(a_className_userLink);
	var gmLinks = document.getElementsByClassName(googlemusic_className_iframe);
	PlaceLinks(Links);
	gmPlaceLinks(gmLinks);
}

function initialize()
{ 
	var gplusBody = document.getElementsByClassName(body_className_isMainPage)[0];
	/*Checks for body class name to ensure you're on a Google+ content page*/
	if(gplusBody !== undefined)
	{
		var sheet = document.createElement('style');
		/*creates the CSS that is used by this extension*/
		sheet.innerHTML = 	".cllFrameMp3{height:27px !important;} "+
							".cllFrame{width:400px;height:286px;bottom: 0px; border: #777 1px solid} "+
							".cll {z-index: 2; position: fixed; overflow-x: hidden; overflow-y: hidden; left: 10px; "+
							"bottom: 0px; width: 402px; height: "+ hiddenHeight +";} "+
							".cllHead {background-color:#484848;width:125px; float:left; height:30px;vertical-align:center; cursor: pointer;} "+
							".cllHeadButtons {background-color:#484848;width:45px; float:left; height:30px;vertical-align:center; cursor: pointer;} "+
							".cllText{color:white; font:bold 13px/"+ defaultHeight +" arial,sans-serif; margin: auto 0px; padding-top:1px; padding-left:10px;text-align:center; cursor: pointer; float:left;} "+
							".cllLinks {color:red; font:bold 11px arial,sans-serif; padding-right: 5px;cursor: pointer; position:relative; top:3px;} "+
							".cllLinksVmid { vertical-align: middle;}"+
							".title_widget_button { height:24px; width: 20px; margin-top: 5px; margin-bottom: 0px; vertical-align:center; -webkit-appearance: none; padding: 0; margin-right: 2px; overflow: hidden; cursor: pointer; background-color: transparent; border: 0px !important;} .hoverOutline :hover{background-color: #777;}"+
							".fRight{float:right;margin-right: 7px !important;}"+
							".fLeft{float:left;}"+
							"."+leavefeedback_class_toHide+"{display: none !important;}";
							
		/*Appends css to page body*/
		document.body.appendChild(sheet);

		/*Creates the container div (initialized at higher level)*/
		youTubeBox.className  = "cll";
		youTubeBox.id = "cllDiv";
		/*Creates attribute to indicate that no link is bound to the iframe (for disabling toggle)*/
		youTubeBox.setAttribute('cllState', "false");
		/*Appends container div to pages body*/
		gplusBody.appendChild(youTubeBox);
		
		/*Creates the header div*/
		var youTubeBoxHead = document.createElement('div');
		youTubeBoxHead.className  = "cllHead";
		
		/*Places icon, text and minimize button*/
		youTubeBoxHead.innerHTML = '<p class="cllText"><button id="mn" class="title_widget_button fLeft" style="vertical-align:bottom !important;" title="Minimize" aria-label="Minimize">' + "<img src='"+chrome.extension.getURL("youtubeicon.png")+"'></button>YouTube+ </p>";
		
		/*Sets the onclick to Expand/Collapse*/
		youTubeBoxHead.onclick = function(){ setDockHeight("toggle"); }; /*Toggles dock height between default value and height of particular link type*/
		
		/*Appends header div to container div*/		
		youTubeBox.appendChild(youTubeBoxHead);
		
		/*Creates additional header that contains the buttons. (should simplify a few things)*/
		var youTubeBoxHeadButtons = document.createElement('div');
		youTubeBoxHeadButtons.className  = "cllHeadButtons";
		
		/*Adds minimize button*/
		var minimizeButton = document.createElement('button');
		minimizeButton.className = "title_widget_button hoverOutline minimize";
		minimizeButton.setAttribute("title", "Minimize");
		minimizeButton.innerHTML = '<img src="https://talkgadget.google.com/talkgadget/resources/minimize.png" class="icon">';
		minimizeButton.onclick = function(){ setDockHeight("toggle"); }; /*Toggles dock height between default value and height of particular link type*/
		
		/*Adds hide button*/
		var hideButton = document.createElement('button');
		hideButton.className = "title_widget_button hoverOutline minimize";
		hideButton.setAttribute("title", "Hide");
		hideButton.innerHTML = '<img src="https://talkgadget.google.com/talkgadget/resources/close.png" class="icon">';
		hideButton.onclick = function() { setDockHeight("hide"); removeDockedFrame(); };
		
		/*Appends buttons to header and header to div*/		
		youTubeBoxHeadButtons.appendChild(minimizeButton);
		youTubeBoxHeadButtons.appendChild(hideButton);
		youTubeBox.appendChild(youTubeBoxHeadButtons);

		/*Creates the iframe div (initialized at higher level)*/
		iframe.name = "cllFrame";
		iframe.className  = "cllFrame";
		iframe.id = "cllFrame";
		/*Appends iframe to container div*/
		youTubeBox.appendChild(iframe);
	}
}
/*Sets dock height based on toggle type (toggle/hide/default)*/
function setDockHeight(cllToggleType)
{
	var cllInstance = document.getElementById("cllDiv");
	switch(cllToggleType)
	{
		case "toggle":
			if((cllInstance.style.height==defaultHeight)&&(cllInstance.getAttribute('cllState') !== "false"))
				cllInstance.style.height = getDockHeightByClassName(cllInstance.lastChild.className)
			else
				cllInstance.style.height = defaultHeight;
			break;
		case "hide":
			cllInstance.style.height = hiddenHeight;
			break;
		case "default":
			cllInstance.style.height = defaultHeight;
			break;
	}
}

/*Returns different height for different Link types based on classname*/
function getDockHeightByClassName(ClassName)
{
	if(ClassName.indexOf("cllFrameMp3") != -1)
		return mp3Height;
	else if(ClassName.indexOf("cllGM") != -1)
		return gmHeight;
		
	return youtubeHeight;
}

function PlaceLinks(Links)
{
		for(var i = 0; i < Links.length; i++)
		{
			if(Links[i].previousSibling) /*check null*/
			{
				if (Links[i].previousSibling.className === undefined){/*checks undefined className - do nothing if-so*/}
				else if (Links[i].previousSibling.className.indexOf("cllLinks") != -1) 
					continue;  
					/*Skips because "YouTube+" button already exists */
			}
			
			if(Links[i].parentNode.className == div_className_isDescLinkParent)
				continue; /*Skip links that are in descriptions of embeded videos*/
				
			var newField = document.createElement('a');
			var embedLoc = ""; /*Stores full location of embed-form link*/
			
			if(Links[i].href.indexOf("//www.youtube.com/watch?v=") != -1) 	/*Found googles full Youtube Link*/
				embedLoc = "//www.youtube.com/embed/" + Links[i].href.replace("http://www.youtube.com/watch?v=", "");
			else if(Links[i].href.indexOf("//youtu.be/") != -1)				/*Found googles short-hand Youtube Link*/
				embedLoc = "//www.youtube.com/embed/" + Links[i].href.replace("http://youtu.be/", ""); 
			else if(Links[i].href.indexOf("vimeo.com") != -1)					/*Found Vimeo link*/
			{																	
				embedLoc = Links[i].href.replace("http://www.vimeo.com/", "");
				if(embedLoc.indexOf("#") != -1) /*Replaces any commands before the ID, like "hd#0000000000" */
					embedLoc = embedLoc.substr(embedLoc.indexOf("#") + 1, embedLoc.length);
				embedLoc = "//player.vimeo.com/video/" + embedLoc;
				
			}
			else if(Links[i].href.indexOf(".mp3") != -1) 					/*Found mp3 Link*/
				embedLoc = Links[i].href;
			else 															/*Doesn't find link, continues through loop.*/
				continue; 
				
			
			/*Removes any extra commands and places Autoplay.*/
			if((embedLoc.indexOf("&") != -1)&&(embedLoc.indexOf("//www.youtube.com/embed/") != -1))
			{
				embedLoc = embedLoc.substr(0, embedLoc.indexOf("&"));
			}
				
			var addClassName = "";
			/*Checks to see if text is Title text (has different text formatting css)*/
			if(Links[i].className.indexOf(a_className_isTitleLink) != -1)
				addClassName = "cllLinksVmid";

			Links[i].parentNode.insertBefore(createLink(embedLoc,"false","cllLinksVmid"), Links[i]);
			
		}
		/*Keeps track of how many links were found to cross check when links are rescanned in the top setInterval() */
		CurrentCount = Links.length;
}
function gmPlaceLinks(Links)
{
		for(var i = 0; i < Links.length; i++)
		{
			if(Links[i].previousSibling) /*check null*/
			{
				if (Links[i].previousSibling.className === undefined){/*checks undefined className - do nothing if-so*/}
				else if (Links[i].previousSibling.className.indexOf("cllLinks") != -1) 
					continue;  
					/*Skips because "YouTube+" button already exists */
			}
			
			var embedLoc = ""; /*Stores full location of embed-form link*/
			
			if(Links[i].src.indexOf("https://music.google.com/music/playpreview") != -1)
				embedLoc = Links[i].src; /*Found Google Music Link*/
			else
				continue; /*Doesn't find youtube link, continues through loop.*/

			Links[i].parentNode.insertBefore(createLink(embedLoc, "true", ""), Links[i]);
			
		}
		/*Keeps track of how many links were found to cross check when links are rescanned in the top setInterval() */
		gmCurrentCount = Links.length;
}
function createLink(embedLoc, longLink, addClassName)
{
	/*Creates "YouTube+" link next to existing YouTube link.*/
	var newField = document.createElement('a'); 
	
	/*Stores location in link*/
	newField.setAttribute('cll', embedLoc); 
	newField.className = "cllLinks " + addClassName;
		
	/*Force expances the YouTube+ widget in the bottom-left corner onclick and sets the src*/	
	newField.onclick = function(){toggle(this)};
	/*Sets link target to the iframe (shouldn't actually do anything)*/
	newField.target = "cllFrame";
	/*Sets text*/
	if(longLink == "true")
		newField.innerHTML ="<img src=\""+ chrome.extension.getURL("youtubeicon.png") + "\" style='position:relative; top:4px;' /> Play song in YouTube+ dock.";
	else
		newField.innerHTML ="<img src=\""+ chrome.extension.getURL("youtubeicon.png") + "\" />";
	return newField;
}

function removeDockedFrame()
{
	/*Removes docked iframe*/
	var d_nested = youTubeBox.lastChild;
	if(d_nested.tagName == "IFRAME")
		youTubeBox.removeChild(d_nested);
}

function toggle(element)
{ 
	/*Get link from attribute we created*/
	var newLink = element.getAttribute('cll'); 
	
	/*Removes docked iframe*/
	removeDockedFrame();
	
	/*Recreates the iframe because I was having issues with the iframe not loading by just changing the src.*/
	var newIframe = document.createElement('IFRAME');
	newIframe.name = "cllFrame";
	newIframe.id = "cllFrame";
	
	var dockHeight = defaultHeight; /*Defaults to only display head.*/
	
	/*Determines type of link:*/
	if(newLink.indexOf(".mp3") == -1)
	{	
		newIframe.className  = "cllFrame";
		newIframe.src = newLink;
		if(newLink.indexOf("https://music.google.com/music/playpreview") == -1)
		{
			dockHeight = youtubeHeight;
			newIframe.className  = "cllFrame";
		}
		else
		{
			dockHeight = gmHeight;
			newIframe.className  = "cllFrame cllGM";
		}
	}
	else
	{
		newIframe.className  = "cllFrame cllFrameMp3";
		newIframe.src = "http://www.google.com/reader/ui/3523697345-audio-player.swf?autoPlay=true&audioUrl=" +newLink;
		newIframe.setAttribute('audioUrl', newLink);
		dockHeight = mp3Height;
	}
	
	youTubeBox.appendChild(newIframe);
	
	/*Expand the bottom left area to show iframe*/
	var oYouTubeBox = document.getElementById("cllDiv");
	
	/*Gets height based on link Type*/
	oYouTubeBox.style.height= dockHeight;
	oYouTubeBox.setAttribute('cllState', "true");
}



