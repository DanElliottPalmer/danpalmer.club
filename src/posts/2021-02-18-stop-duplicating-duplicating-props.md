---
category: Dev
date: 2021-02-18T09:00:00Z
description: You're complicating things.
layout: post
slug: stop-duplicating-props-props
status: published
tags:
  - Javascript
  - Design Systems
  - Components
title: Stop Duplicating Prop Functionality (please)
---

Since before Christmas, I've been trying to write some posts around design system and components; mistakes I have made and patterns I've noticed. I'm not doing very well on that writing front as I want to make sure I don't accidentally upset someone (in itself, that's a very exciting statement to write).

However, something has been coming up in my daily work that I guess I can't contain anymore...

**please** stop duplicating prop functionality.

Let me set the scene.

I have a card component. It contains an image, a title, a teaser and a byline. Four pieces of information. We might write it something like this in React:

```jsx
const Card = ({ byline, image, teaser, title }) => {
  return (
    <div>
      {image && <img {...image} />}
      {title && <h2>{title}</h2>}
      {teaser && <p>{teaser}</p>}
      {byline && <p>By: {byline}</p>}
    </div>
  );
};
```

Beautiful. Then we're asked to prevent the byline from rendering on profile pages. We know who wrote it, no need to show it every time. Oh, sure. That's easy...

```jsx
const Card = ({ byline, image, teaser, title, hideByline = false }) => {
  return (
    <div>
      {image && <img {...image} />}
      {title && <h2>{title}</h2>}
      {teaser && <p>{teaser}</p>}
      {!hideByline && byline && <p>By: {byline}</p>}
    </div>
  );
};
```

...

We've duplicated what was already possible. Byline was already enabled to be optionally rendered simply by choosing whether we should or should not pass in the byline data. That problem was solved. We have now introduced an unnecessary check.

> But Dan, if I don't put the optional rendering logic here, where should it go?

I'm about to make some assumptions (and in the process, make an ass out of u and ...mptions).

1. You are pulling data from some source. It is very likely you are transforming or shaping the data before you even pass it to the component. Almost like some kind of data layer that is separate from your presentational. Put the logic there. Treat yourself to not creating the byline data in the place you're transforming the content.
2. You might have a configuration layer that your data looks at when shaping the data. Maybe treat this option as a feature flag in your configuration. `hideBylineOnProfile`? Then when you're creating the data that is for the profile page, it checks if this feature flag is enabled and doesn't create the content as the data level.

---

I'm sure there might be other usecases such as you're not in control of the data being pushed into your components, which to that, I say fair enough (but that's also a little concerning and how are you getting `hideByline` there then?). A lot of the problems I see with components is that we've tacked on additional logic for no reason, when ultimately it should just be rendering the content you give it.
