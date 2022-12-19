---
date: 2022-12-19T12:00:00Z
description: An automated video game newsletter.
layout: project
status: published
title: The Yesterdaily
---

## What is it?

The Yesterdaily is a daily automated newsletter about video games. It contains multiple groups of similarly news links, displaying the topics that link them. Depending on the amount of content available, it will also display a thumbnail image and poorly generated summary of the articles.

[![A screenshot of an email newsletter. The title reads The Yesterdaily on a bright pink background.](/static/images/projects/yesterdaily.jpg)](/static/images/projects/yesterdaily.jpg)

## Why did you build it?

I like to try and keep up-to-date with video game news however it can sometimes be difficult visiting multiple websites, sifting through things that might be considered important. However I realised that I could programmatically email myself with the news instead of doing it myself.

## How does it work?

During the day, a cron job will run collecting RSS feeds from news sites. They will be saved for later.

At midnight, another cron job will run that processes all of the feeds. It performs a few tasks to filter out poor articles or content that it outside of the requested time window. Once we have our "clean" data, it will begin topic extraction over all the articles. This returns us the groups. Some additional processes are applied to the groups to help tidy them a little more.

Once we have our groups, the data is passed into an email template, rendered out and emailed to all subscribers.

## What is it build from?

GCP, Node, Python, SciKit, NLTK, MJML and Mailchimp

## What's next?

First off is looking at scaling and opening it up available to other potential subscribers.

Secondly, this content processing should work for all content, not just video games.
