---
category: Dev
date: 2014-11-07T00:00:00Z
layout: post
status: published
tags:
  - getUserMedia
  - MediaStreamTrack
  - Audio
  - Video
  - Devices
  - Javascript
title: Nice input device labels from getUserMedia
---

Over the past couple of days, I’ve been tinkering around with getUserMedia for a potential future project. In the process, I’ve read a lot of specification, [current](http://www.w3.org/TR/mediacapture-streams/) and maybe [future](http://w3c.github.io/mediacapture-main/getusermedia.html).

Something I was curious about was whether it was possible to get all the audio and video input devices currently connected to the computer with friendlier names. Like Built-in microphone or FaceTime HD camera.

I happened to spot Google Hangout use a combo box that had nice readable names of your devices. So I figured it was possible.
![GOOGLE CAN DO IT! SO CAN YOU!](/images/THESE-NAMES-ARE-FRIENDLY.png)

This post is separated into two sections: MediaStreamTrack and getUserMedia.

### MediaStreamTrack

MediaStreamTrack represents a media source from a given stream. So when you first call getUserMedia, you are returned a stream and these consist of MediaStreamTracks. One for the audio input and one for the video input.

As a static function on this object is getSources. (_In the latest published draft spec, it is under getSourceInfos and previously it was under something else :S. However, in the latest edited version it is stored under something completely different that I will explain later._) This is currently only available in Chrome. Despite Firefox supporting MediaStreamTrack, it is missing getSources.
With getSources, you pass it a function and it will return an array of information about the sources (SourceInfo object).

```js
MediaStreamTrack.getSources(function (sources) {
  sources.forEach(function (source) {
    console.log('Source id: ', source.id);
    console.log('Source kind: ', source.kind);
    console.log('Source label: ', source.label);
  });
});
```

- **id**: unique id that represents the device
- **kind**: the type of device, audio or video.
- **label**: a nice friendly name

[**HI FIVE!**](http://sendamessage.to/READER/I) We have the list of audio/video input devices connected to the computer. If you notice, label, which is suppose to house our nice name is empty.

When this api was initially implemented, the value stored in the label property contained the name/description of the input however this changed due to a [ticket that was filed](https://code.google.com/p/chromium/issues/detail?id=267880) requesting this information only being available if we have permission.

But do not worry! We can combine some of the information we gathered with another glorious method to retrieve readable labels.

### getUserMedia

A part of getUserMedia allows you to specify some constraints for the call. These constraints might consist of choosing whether you want an audio stream, video stream or both. Or you might want to set mandatory width and height for the video feed.

Another property you can set is sourceId. This allows you to choose a stream from a specific device. Luckily we managed to get this juicy piece of information from MediaStreamTrack.getSources.

So how do we choose which source we want. Well like this:

```js
navigator.getUserMedia(
  {
    audio: {
      optional: [
        {
          sourceId: 'OUR_GLORIOUS_ID',
        },
      ],
    },
    video: false,
  },
  onSuccess,
  onFail
);

function onSuccess(stream) {
  var track = stream.getAudioTracks()[0];
  console.log('Nice label: ', track.label);
  stream.stop();
}
function onFail() {
  console.error('Woah crap, there was an error');
}
```

This example only applies to getting audio information but with a few minor changes, this would work for video.

Here we have a nice (kind of) readable label for the input device. There is one bummer though. In order to get multiple input labels, we must call on getUserMedia multiple times as we can only specify one sourceId each time. This can result in the request permission bar to pop up multiple times on the screen (unless you’re on a https connection which only asks you once). You could cache the ids in local storage to save making the calls every time but then you would not know if there is anything new.

I’ve set up an [example](http://jsbin.com/mehet/1/edit?js,console) on jsbin to demonstrate retrieving all connected inputs.

### The future

As you can see there is no way of currently detecting whether a new device connected without re-triggering the whole thing again. But do not fear! I’ve seen/read the [future](http://w3c.github.io/mediacapture-main/getusermedia.html) (_spec, maybe_).

#### MediaDevices

This is a new object that will will be stored under navigator. The idea is that this will look after device access available to the browser. There will be an event called devicechange which will be triggered when a new input or output device is made available. In addition there will be a function called enumerateDevices that will act similarly to MediaStreamTrack’s getSources however will use promises instead of a function callback.

getUserMedia will also be added to it, supporting promises instead of the success and fail callback. There is a giant note in the latest editor draft questioning whether it would be worth keeping the original navigator.getUserMedia and if so updating it to use promises. In my eyes, it might lead to another [one of these incidents](https://code.google.com/p/chromium/issues/detail?id=395130).

### Final words

So by the time you or I have read this, the specification for media capturing and streams might have changed again making some of these words incorrect (_but I’ll try to update_). So along with making sure you eat your breakfast in the morning and cleaning behind your ears, also remember to check the specification of the feature you’re using (_especially if it’s currently still under draft status_).
