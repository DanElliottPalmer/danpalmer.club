---
category: Dev
date: 2012-10-20T00:00:00Z
layout: post
status: published
tags:
  - Audio
  - Flash
  - HTML5
  - Javascript
title: Some great stuff I learnt about HTML5 audio with a rather nice flash fallback
---

On Monday, [we](http://www.telegraph.co.uk/news/interactive-graphics) are planning on revealing an interactive graphic that uses audio as a way to explain some information used within itself. But in order to do so, we needed a suitable solution of being able to play that sound across a wide range of browsers (Firefox 3.5+, IE7+, Safari, Chrome, Opera, iOS). I knew existing libraries out there existed ([audio.js](http://kolber.github.com/audiojs/), [SoundJS](http://www.createjs.com/#!/SoundJS)) that cover the same browser spectrum, but honestly, if there's a chance for me to learn about something. I would prefer to.

So I dove in. Head first.

This is what the plan was:

1. Test if the browser supported HTML5 audio be it mp3 or ogg. If it did, create an audio element and use that for the graphic.
2. If it failed that test, check if the browser has flash as this is going to be the only other way of providing the audio.
3. If it fails the flash test, tell them to go away.

Seemed simple.

I had done some previous research into HTML5 audio and what are the best audio formats so I had this nice table:

| Browsers     | Wav | Mp3 | Ogg | AAC |
| ------------ | --- | --- | --- | --- |
| Firefox 3.5+ | Yes |     | Yes |     |
| Chrome 9+    |     | Yes | Yes |     |
| Safari 3+    |     | Yes |     | Yes |
| Opera 10+    |     |     | Yes |     |
| IE9+         | Yes | Yes |     | Yes |
| iOS          |     | Yes |     | Yes |
| Android      |     | Yes |     |     |
| Flash        |     | Yes |     | Yes |

I think my information is pretty much taken from [here](http://html5doctor.com/html5-audio-the-state-of-play/), so give it a read if you're curious.

### What I learnt first - HTML5 can be blunt

Testing a browser for HTML5 audio can consist of two tests: checking if the browser can play a certain file format and then actually trying to play the file format. The reason behind this is that whoever made the method for checking formats, made it's response quite blunt.

The code to test whether a browser can play a format consists of this:

```js
var AudioElement = document.createElement('audio'),
  AudioElementResponse = AudioElement.canPlayType('audio/mpeg');
```

However! It's response are probably, maybe or no (or just an empty string). Now to me, probably and maybe, are pretty much the same thing.

"Are you going out tonight?"

"Probably" / "Maybe" (In my case, no)

Anyway, what I read is that it is best to go with the assumption that the browser can play the audio if it says probably. But if it says maybe, you're going to need to check.

```js
var AudioElement = document.createElement('audio');
AudioElement.src = './I-like-to-Dance.mp3';
AudioElement.addEventListener('loadeddata', audioTestListener, false);
AudioElement.load();

try {
  AudioElement.play();
  AudioElement.pause();
} catch (e) {
  AudioElement.removeEventListener('loadeddata', audioTestListener, false);
  console.log('Fail');
}

function audioTestListener() {
  AudioElement.removeEventListener('loadeddata', audioTestListener, false);
  console.log('Success');
}
```

This allows us to attempt to load the audio, play it and then pause it. If it successfully loads the audio, we are good. If it catches an error, we are going to need to try something else. I sit somewhere on the fence for choosing the correct listener as you can pick canplay, canplaythrough and loadeddata. loadeddata seemed to always work for me so I stuck with it.

### What I learnt next - iOS is a little different

iOS does not like to fire off canplay, canplaythrough or loadeddata when trying audio. Instead, it fires off progress. So we need to do a switch if it happens to be an iOS device.

```js
var AudioElement = document.createElement('audio'),
  AudioPreloadEvent = navigator.userAgent.match(/(iPod|iPhone|iPad)/i)
    ? 'progress'
    : 'loadeddata';
AudioElement.src = './I-like-to-Dance.mp3';
AudioElement.addEventListener(AudioPreloadEvent, audioTestListener, false);
AudioElement.load();

try {
  AudioElement.play();
  AudioElement.pause();
} catch (e) {
  AudioElement.removeEventListener(AudioPreloadEvent, audioTestListener, false);
  console.log('Fail');
}

function audioTestListener() {
  AudioElement.removeEventListener(AudioPreloadEvent, audioTestListener, false);
  console.log('Success');
}
```

One issue with iOS is that you cannot play audio instantly without the user having some sort of input (which I suppose is fair as I wouldn't want sound just playing suddenly when I go on a page (however there was at one point, audio playing instantly when I loaded my test page. I'm not sure what happened)). So this means that the device will fail the play and pause methods meaning the only progress event to be fired will be the load if it is successful.

Now we are about to enter Flash territory.

Again, I had done previous experiments and knew that in Flash I could use ExternalInterface as a way of communicating between it and Javascript.

### Flash problem numero uno - security

I knew that one of the issues would be cross-domain scripting so I had this perfectly placed as the first thing Flash should do:

```actionscript
flash.system.Security.allowDomain('*');
```

But alas, nothing would communicate with each other. To make an insanely long story short, if you  are doing this sort of thing, have it on a server. Don't just load the page in your browser as that will **NOT** work.

### Flash problem numero dos - classid

I don't use Flash often. Actually, I don't use Flash. However I have seen enough example code of the object and embed tags and what is usually included attribute and parameter wise to know what to include. But if you don't include the classid attribute on the object tag and despite Flash is still working fine in Chrome, Safari, Firefox and Opera (I think) but not in Internet Explorer, you won't think that is a problem. Well guess what boys and girls, it does. I spent a good few hours going over if I was missing something that IE needs not thinking it was this attribute (especially as I read that IE only uses the embed tag, not the object). It wasn't till I actually read the spec of the tag for Flash on Adobe that it mentions classid is a must that I put it on.

### Flash problem numero tres - dynamically loading Flash into the page

I went through several stages of trying to load flash into a page.

```js
//Attempt 1
var FlashObject = document.createElement('object');
FlashObject.innerHTML = 'ALL THE PARAMS AND EMBED TAG';
document.body.appendChild(FlashObject);

//Attempt 2
var FlashObject = document.createElement('object'),
  ParamTag1 = document.createElement('param');
FlashObject.appendChild(ParamTag1);
document.body.appendChild(FlashObject);

//Attempt 3
var FlashObjectCont = document.createElement('div');
FlashObjectCont.innerHTML = 'OBJECT, PARAMS AND EMBED STUFF';
document.body.appendChild(FlashObjectCont);

//Attempt 4
var FlashObjectCont = document.createElement('div'),
  FlashObject = document.createElement('object');
FlashObject.innerHTML = 'ALL THE PARAMS AND EMBED TAG';
FlashObjectCont.appendChild(FlashObject);
document.body.appendChild(FlashObjectCont);

//Attempt 5 & 6
//Same method of setting up elements in 3 & 4
document.body.appendChild(FlashObjectCont.children[0]);
```

All of these examples worked in at least a few of them but none, worked in Internet Explorer. This was a kick in the nuts as my intention was to use Flash as the fallback for IE7 and 8. The problem that was occuring was that the ExternalInterface callbacks were not being added which led to me not being able to call them and when I closed the page, it threw errors trying to remove something that had not been added. So I decided to go sniffing and poked around audio.js' source where I came across this:

```js
// Inject the player markup using a more verbose `innerHTML` insertion technique that works with IE.
var html = audio.wrapper.innerHTML,
  div = document.createElement('div');
div.innerHTML = flashSource + html;
audio.wrapper.innerHTML = div.innerHTML;
audio.element = this.helpers.getSwf(id);
```

What you need to do is create a div element and set it's innerHTML to all the object and embed code and then add it to the page through innerHTML rather than appendChild. Honestly though, I'm not too sure why this work so if anyone happens to read this and knows why, I would like to know.

### Flash problem numero cuatro - getMovie

There's a common piece of code floating around used to get the Flash object consisting of:

```js
function getMovie(movieName) {
  if (navigator.appName.indexOf('Microsoft') != -1) {
    return window[movieName];
  } else {
    return document[movieName];
  }
}
```

It's great as it works in the majority of browsers but not in IE9. This is due to IE9 now including the [embed tag element in the DOM](http://msdn.microsoft.com/en-us/library/gg622942%28v=VS.85%29.aspx). So you then need to adjust the code a tiny bit so it's not including IE9 in the navigator.appName check.

```js
function getMovie(movieName) {
  return window[movieName] || document[movieName];
}
```

I've just had a quick look back over this post and realised it is fairly lengthy. However I hope this might help solve other people's problems if they come across certain issues when creating a cross-browser audio plugin/library through HTML5 audio and Flash.
