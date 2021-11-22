---
category: Dev
date: 2012-10-27T00:00:00Z
layout: post
status: published
tags:
  - Audio
  - HTML5
  - iOS
  - Javascript
title: iOS HTML5 audio corrections please thank you
---

After my last post, I had run into a few issues with iOS and HTML5 audio. So for a little bit tonight, I've been playing around with it to see what can be done to preload and play audio automatically on the devices. The two versions of iOS I played with were 5 and 6 as these are all I can get my hands on.

The reason I looked backed into this is because after I thought I had cracked it and managed to get audio preloading, it failed to work on a colleague's iPad. I was under the assumption that it was something to do with my setTimeout loop, trying to force it to play and then pause but it was due to the fact the iOS version was 5.

Here is a table to what I tested and played with earlier and to whether it played or not (plus I had forgot I styled up my table's header with the red colour which I rather like so it gives me another reason to show it):

| Device             | iOS version | Force load & play | Tap load & play |
| ------------------ | ----------- | ----------------- | --------------- |
| iPad (real)        | 6.0         | Yes               | Yes             |
| iPhone (real)      | 6.0         | No                | Yes             |
| iPad (simulator)   | 6.0         | No                | Yes             |
| iPhone (simulator) | 6.0         | No                | Yes             |
| iPad (simulator)   | 5.0         | No                | Yes             |
| iPhone (simulator) | 5.0         | No                | Yes             |

So for pretty much everything, you need to have the user's input to initialise any sort of load or play. However I am curious as to why my iPad preloads and plays straight away without any input.

I also did a little test to see what events are fired when loading the audio. This is more for reference:

1. loadstart
2. progress
3. suspend
