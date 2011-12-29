/*Css class names from Google Plus (likely to change over time with updates, keep here to make easier updating.)*/
var body_className_isMainPage = 'ULpcLb';
var a_className_isTitleLink = 'B-u-Y-j';
var div_className_isDescLinkParent = 'B-u-wa-ea';
var a_className_userLink = 'ot-anchor';


/*Created Elements that are used in multiple functions*/
var youTubeBox = document.createElement('div');
var iframe = document.createElement('iframe');

/*Keeps a count of found links on page*/
var currentCount = 0;

initialize();
setInterval(function()
{ 
	/*Cross checks currentCount with any new links found, if changed, call placeLinks()*/
	var Links = document.getElementsByClassName(a_className_userLink);
	if(currentCount != Links.length)
		placeLinks();
}, 2000);

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
									"bottom: 0px; width: 402px; height: 30px;} "+
							".cllHead {background-color:#484848;width:170px; float:left; height:30px;vertical-align:center; cursor: pointer;} "+ 
							".cllText{color:white; font:bold 13px/30px arial,sans-serif; margin: auto 0px; padding-top:1px; padding-left:10px;text-align:center; cursor: pointer; float:left;} "+
							".cllLinks {color:red; font-weight:bold; padding-right: 5px;cursor: pointer;} "+
							".cllLinksVmid { vertical-align: middle;}"+
							".title_widget_button { height:24px; width: 24px; margin-top: 5px; margin-bottom: 0px; vertical-align:center; -webkit-appearance: none; padding: 0; margin-right: 3px; overflow: hidden; cursor: pointer; background-color: transparent; border: 0px !important;} .hoverOutline :hover{background-color: #777;}"+
							".fRight{float:right;margin-right: 7px !important;}"+
							".fLeft{float:left;}";
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
		youTubeBoxHead.innerHTML = '<p class="cllText"><button id="mn" class="title_widget_button fLeft" style="vertical-align:bottom !important;" title="Minimize" aria-label="Minimize">' + "<img src='"+chrome.extension.getURL("youtubeicon.png")+"'></button>YouTube+ </p>" + '<button id="mn" class="title_widget_button hoverOutline minimize fRight" title="Minimize" aria-label="Minimize">  <img src="https://talkgadget.google.com/talkgadget/resources/minimize.png" class="icon  minimize "> </button>';
		
		/*Sets the onclick to Expand/Collapse*/
		youTubeBoxHead.onclick = function(){ this.parentNode.style.height=((this.parentNode.style.height=='30px')&&(this.parentNode.getAttribute('cllState') !== "false"))? (this.parentNode.lastChild.className === "cllFrame cllFrameMp3")? '57px' : '316px': '30px';}; /*Different height for MP3 (added)*/
		
		/*Appends header div to container div*/
		youTubeBox.appendChild(youTubeBoxHead);

		/*Creates the iframe div (initialized at higher level)*/
		iframe.name = "cllFrame";
		iframe.className  = "cllFrame";
		iframe.id = "cllFrame";
		/*Appends iframe to container div*/
		youTubeBox.appendChild(iframe);
		
		
	}
}

function placeLinks()
{
		var Links = document.getElementsByClassName(a_className_userLink); /*Finds all embeded links*/
		
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
			if(Links[i].href.indexOf("http://www.youtube.com/watch?v=") != -1)
			{
				embedLoc = "http://www.youtube.com/embed/" + Links[i].href.replace("http://www.youtube.com/watch?v=", "");
				/*Found googles full Youtube Link*/
			}	
			else if(Links[i].href.indexOf("http://youtu.be/") != -1)
			{
				embedLoc = "http://www.youtube.com/embed/" + Links[i].href.replace("http://youtu.be/", "");
				/*Found googles short-hand Youtube Link*/
			}
			else if(Links[i].href.indexOf(".mp3") != -1)
			{
				embedLoc = Links[i].href; 
				/*Found mp3 Link*/
			}
			else
			{
				continue; 
				/*Doesn't find youtube link, continues through loop.*/
			}
			
			/*Creates "YouTube+" link next to existing YouTube link.*/
			var newField = document.createElement('a'); 
			
			/*Stores location in link*/
			newField.setAttribute('cll', embedLoc); 
			
			/*Checks to see if text is Title text (has different text formatting css)*/
			if(Links[i].className.indexOf(a_className_isTitleLink) != -1)
				newField.className = "cllLinks cllLinksVmid";
			else
				newField.className = "cllLinks";
				
			/*Force expances the YouTube+ widget in the bottom-left corner onclick and sets the src*/	
			newField.onclick = function(){toggle(this)};
			/*Sets link target to the iframe (shouldn't actually do anything)*/
			newField.target = "cllFrame";
			/*Sets text*/
			newField.innerHTML ="<b>YouTube+</b>";
			/*Inserts my link directly before previous YouTube link*/
			Links[i].parentNode.insertBefore(newField, Links[i]);
			
		}
		/*Keeps track of how many links were found to cross check when links are rescanned in the top setInterval() */
		currentCount = Links.length;
}

function toggle(element)
{ 
	var newLink = element.getAttribute('cll'); 
	d_nested = youTubeBox.firstChild.nextSibling;
	youTubeBox.removeChild(d_nested); 
	
	/*Recreates the iframe because I was having issues with the iframe not loading by just changing the src.*/
	var newIframe = document.createElement('iframe');
	newIframe.name = "cllFrame";
	newIframe.id = "cllFrame";
	
	if(newLink.indexOf(".mp3") == -1)
	{	
		newIframe.className  = "cllFrame";
		newIframe.setAttribute('src', newLink);
	}
	else
	{
		newIframe.className  = "cllFrame cllFrameMp3";
		newIframe.setAttribute('src', "http://www.google.com/reader/ui/3523697345-audio-player.swf?autoPlay=true&audioUrl=" +newLink);
		newIframe.setAttribute('audioUrl', newLink);
	}
	
	youTubeBox.appendChild(newIframe);
	
	/*Expand the bottom left area to show iframe*/
	var oYouTubeBox = document.getElementById("cllDiv");
	oYouTubeBox.style.height= (newLink.indexOf(".mp3") == -1)?'316px':'57px'; /*Different height for MP3*/
	oYouTubeBox.setAttribute('cllState', "true");
}


