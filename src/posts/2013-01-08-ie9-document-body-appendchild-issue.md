---
category: Dev
date: 2013-01-08T00:00:00Z
layout: post
status: published
tags:
  - appendChild
  - body
  - IE9
  - Javascript
title: IE9 - document.body.appendChild issue
---

Whilst working on some code at work, [Ellie](http://www.twitter.com/exp172) and I bumped into a problem with IE9. It wouldn't allow us to append any divs directly to the body. We tried appendChild and insertBefore but both failed us.

We read up and initially thought the issue could have been due to a few divx plugins but again, this was not the case.

After chatting with [Pedro](https://twitter.com/fritoebola), he suggested that we try using `document.documentElement` instead of the body. The crying then changed from sadness, to happiness.

I whipped up a little snippet that I will probably need again and felt like sharing as I couldn't find a good fix.

```js
var fnAppendToBody = (function () {
  var domBody = document.body;

  try {
    domBody.appendChild(document.createElement('div'));
  } catch (e) {
    domBody = document.documentElement.getElementsByTagName('body')[0];
  }

  return function (domElm) {
    domBody.appendChild(domElm);
  };
})();
```
