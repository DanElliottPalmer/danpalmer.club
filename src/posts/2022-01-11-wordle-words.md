---
category: Dev
date: 2022-01-11T12:00:00Z
description: Where I try to improve my Wordle game.
layout: post
slug: lares-toing-ducky
permalink: "/posts/lares-toing-ducky/"
status: published
tags:
  - Python
  - Wordle
title: My Quest for Good Words
---

Like a lot of people, I too have fallen for Wordle.

[Wordle](https://www.powerlanguage.co.uk/wordle/) is a word game where the user must guess a five-letter word in a maximum of six turns. It displays a green block if the letter is in the word and in the correct location, and a yellow block if the letter is in the word. The word changes daily.

My morning routine consists of waking up, completing the NYT crossword mini and then attempting the daily Wordle. Instead of sharing my attempt on social media, I have a small WhatsApp chat with a group of friends that we use for discussing questions on gameshows, Danny Dyer impressions, planning movie marathons, and now, sharing our Wordle attempt. At the moment, there is a light layer of competition amongst us.

In an effort to try and improve my guesses, I was curious if I could programmatically find some better words.

The words I currently start with are "earnt" and "slick". To me, both of these words are using some common vowels and consonants, and also a common ending ('ck'). To improve this, I want to try and find:

- Three strong words. Two that I hope should cover me well enough that by my third attempt, I can begin guessing the word. However, I also want a strong third word in case that goes to shit.
- A strong word counts as:
  - A word using the most common letters.
  - There are no duplicate letters.
  - A word using a common suffix.

From this, I can split this out into a few tasks:

1. Get all five-letter words
2. Count each letter in every word
3. Count each suffix in every word
4. Score each word by the letters it contains and suffix
5. Calculate the best word groups

**Note**: some of the math I have used to calculate the score of the words could be insanely incorrect however it seemed to work alright. There is very likely a far better way of calculating a score.

---

## Task 0: Just some prerequisites

Just to make this easier if you happen to be copying & pasting, I have these bits at the top.

```python
import re
import pprint

pp = pprint.PrettyPrinter(indent=4)
alphabet = 'abcdefghijklmnopqrstuvwxyz'
```

## Task 1: Get all five-letter words

My plan for this was to get my Oxford dictionary, scan every page and use [OCR](https://en.wikipedia.org/wiki/Optical_character_recognition) to extract all five-letter words. However my scanner was playing up so I opted for finding some dictionaries online.

I actually ended up going through three different dictionary lists as the top words that were coming out at the end, were not real words (according to my computer and Google).

```python
def get_all_5_letter_words():
  # Create a unique set for our words. We have no clue if
  # the dictionary lists contain duplicate words (hopefully
  # not).
  words = set();
  with open('./words3.txt', 'r') as fh:
    # Get rid of whitespace and lowercase the text. We want
    # to make it easy to compare and have unique words.
    line = fh.readline().strip().lower()
    while line:
      # We only care about words that are five-letters long.
      if len(line) == 5:
        words.add(line)
      line = fh.readline().strip().lower()
  # I just wanted a list.
  return list(words)

five_letter_words = get_all_5_letter_words()

pp.pprint(five_letter_words)
"""
[   'leeks',
    'dooks',
    'daraf',
    'adzes',
    'coram',
    ...]
"""
```

## Task 2: Count each letter in every word

Next we need to work out how common each letter is in every word. Previously I was calculating this over all words in the dictionary but realised we only care about five-letter words (not sure if I've said that already). We normalise the values at the end so we are working on a scale of 0 to 1, 1 being the most common and 0 being the least.

```python
# Create a basic dict containing all letters in the alphabet
# set to 0.
all_letters_count = { letter: 0 for letter in alphabet }
for word in five_letter_words:
  for letter in word:
    all_letters_count[letter] += 1

# Get the maximum value of one of the letters as this is
# used to help normalise the value.
max_letter_count = max(all_letters_count.values())
all_letters_normalised = {
  key: value / max_letter_count
  for key, value in all_letters_count.items()
}

pp.pprint(all_letters_normalised)
"""
{   'a': 0.8987246811702926,
    'b': 0.24411102775693924,
    'c': 0.3042760690172543,
    'd': 0.36804201050262564,
    'e': 0.999549887471868,
    ...}
"""
```

## Task 3: Count each suffix in every word

As I wanted to also score a word based on it's ending, I needed to calculate what they were. I chose to use a suffix length of 3 as it felt like a suitable amount. An alternative would have been 2. After counter, we apply the same normalising rule as before.

```python
suffix_count = 3
all_suffixes_count = {}
for word in five_letter_words:
  suffix = word[-suffix_count:]
  # Suffix does not already exist in our dict so we need to
  # add it with a default value of 0.
  if suffix not in all_suffixes_count:
    all_suffixes_count[suffix] = 0
  all_suffixes_count[suffix] += 1

max_suffix_count = max(all_suffixes_count.values())
all_suffixes_normalised = {
  key: value / max_suffix_count
  for key, value in all_suffixes_count.items()
}

pp.pprint(all_suffixes_normalised)
"""
{   'aai': 0.015384615384615385,
    'aak': 0.015384615384615385,
    'aal': 0.06153846153846154,
    'aam': 0.015384615384615385,
    'aap': 0.015384615384615385,
    ...}
"""
```

## Task 4: Score each word

This work I split into two sub-tasks: one to work out the score of the word based on the letters it contains and then add that score with the suffix one.

### Task 4a: Scoring based on letters

As mentioned in my opening monologue, a key characteristic I want for my words is to not contain duplicate letters. The reason for this is that I cover as many letters as possible with my guesses. This means that when I give a word a score, it is calculated based on the unique letters in the word. If the word I'm scoring is "tooth", the only letters counted would be h, o and t.

```python
word_score_by_letter = {}
for word in five_letter_words:
  word_score = 0
  for letter in set(word):
    word_score += all_letters_normalised[letter]
  word_score_by_letter[word] = word_score

max_score = max(word_score_by_letter.values())
word_score_by_letter_normalised = {}
for word in five_letter_words:
  word_score_by_letter_normalised[word] = word_score_by_letter[word] / max_score

pp.pprint(word_score_by_letter_normalised)
"""
{   'aahed': 0.6041987604342064,
    'aalii': 0.4700318847848674,
    'aargh': 0.48550854440583247,
    'aarti': 0.6162719879625982,
    'abaca': 0.34553792139863154,
    ...}
"""
```

### Task 4b: Getting a total score

```python
word_score_by_all_normalised = {}
# This magic number is based on max letter count score (1)
# and the max suffix count score (1).
max_score = 2
for word in five_letter_words:
  suffix = word[-suffix_count:]
  score = word_score_by_letter_normalised[word] + all_suffixes_normalised[suffix]
  word_score_by_all_normalised[word] = score / max_score

pp.pprint(word_score_by_all_normalised)
"""
{   'aahed': 0.37133014944787246,
    'aalii': 0.25040055777704906,
    'aargh': 0.2581388875875316,
    'aarti': 0.3312129170582221,
    'abaca': 0.18046126839162344,
    ...}
"""
```

## Task 5: Calculate the best word groups

We almost have everything we need to find the best starting words. This task was also split into two sub-tasks.

### Task 5a: Group words by letters

To help with finding which words have what letters, I created a dictionary where the key was an alphabetised string of the letters and the value was a list with the highest ranked word first.

Alphabetising the letters for the key makes finding words consisting of a certain set of letters a lot easier to lookup for later on.

```python
sorted_scored_words = sorted([
  [key, value]
  for key, value in word_score_by_all_normalised.items()
], key=lambda word: word[1], reverse=True)
# This is used later for permutations of letters.
sorted_letters_set = set()
words_grouped_by_letters = {}
for word in sorted_scored_words:
  # Alphabetise the letters
  sorted_letters = "".join(sorted(word[0]))
  # Check that we have no duplicates. If we do, I don't care
  # about the word.
  has_five_letters = len(set(sorted_letters)) == 5
  if not has_five_letters:
    continue
  if sorted_letters not in words_grouped_by_letters:
    words_grouped_by_letters[sorted_letters] = []
    sorted_letters_set.add(sorted_letters)
  words_grouped_by_letters[sorted_letters].append(word)

pp.pprint(words_grouped_by_letters)
"""
{   'abceh': [['beach', 0.43132287409505904]],
    'abcei': [['ceiba', 0.3671305622690282]],
    'abcel': [['cable', 0.4601803956799837]],
    'abcep': [['becap', 0.3513469048058666]],
    'abcer': [   ['caber', 0.49735469274035526],
                 ['brace', 0.4358162312018937],
                 ['cabre', 0.40504700043266295],
                 ['acerb', 0.3742777696634322]],
    ...}
"""
```

### Task 5b: Group words by score

There are a few things going on in this chunk. We have to identify which letters to create words from, create permutations from those letters but only care about ones that actually make letters and then choose the best word.

In my first attempt, I was creating string permutations based off the alphabet * 2 to accomodate double letters (not even thinking if a letter was used 3 or 4 times). This ultimately never finished running as its just too many options. This is where I realised if we store the alphabetised keys in a set, we can perform an intersection on the remaining letters and use that for permutations instead.

```python
def get_remaining_letters(find):
  # Replace any of the letters identified in the regex with
  # nothing
  return re.sub('[{}]'.format(find), "", alphabet)

# input_set is a set of the alphabetised letter keys
# { 'abceh', 'abcei', 'abcel', ... }
def get_permutations(input_set, letters):
  permutations = set()
  # Create a set so we can use it for an intersection later
  letters_set = set(letters)
  for word in input_set:
    word_letters_set = set(word)
    # If we have 5 unique letters in our word that also
    # happen to be in our remaining letters, we want to
    # keep it
    if len(word_letters_set.intersection(letters_set)) == 5:
      permutations.add(word)
  return permutations

def get_best_word_from_letters(letters):
  remaining_letters = get_remaining_letters(letters)
  permutations = get_permutations(sorted_letters_set, remaining_letters)
  best_word = None
  for key2 in permutations:
    # All of our values are structured as [word, score]
    if best_word is None or best_word[1] < words_grouped_by_letters[key2][0][1]:
      best_word = words_grouped_by_letters[key2][0]
  return best_word

word_tuples = []
word_tuples_set = set()
print('Total letter groups:', len(words_grouped_by_letters))
for key, words in words_grouped_by_letters.items():
  starting_word = words[0]
  # starting_word[0] will contain the same letters as key.
  # This is just for readability.
  best_word1 = get_best_word_from_letters(starting_word[0])
  best_word2 = get_best_word_from_letters(starting_word[0] + best_word1[0])

  # If we don't have a third word, it can get outta 'ere
  if not best_word2:
    continue

  score1 = starting_word[1] + best_word1[1]
  score2 = score1 + best_word2[1]

  # We could potentially get duplicates where starting_word
  # and best_word1 are swapped with first and second. To
  # eliminate them, we generate a key to help filter the
  # duplicates.
  tuple_key = "-".join(sorted([
    starting_word[0],
    best_word1[0],
    best_word2[0]
  ]))
  if tuple_key not in word_tuples_set:
    word_tuples.append((starting_word, best_word1, best_word2, score1, score2))
    word_tuples_set.add(tuple_key)

  # Display progress as we've got a lotta words
  if len(word_tuples) % 100 == 0:
    print(len(word_tuples))

# Sort the values by score1 and then score2. If we wanted to
# always play a strong three word start, we would sort just
# by score2.
pp.pprint(sorted(word_tuples, key=lambda item: (item[3], item[4]), reverse=True))
"""
[   (   ['lares', 0.9808870418801274],
        ['toing', 0.6497195957769883],
        ['ducky', 0.3662792908735659],
        1.6306066376571158,
        1.9968859285306817),
    (   ['doing', 0.6346370177667422],
        ['lares', 0.9808870418801274],
        ['mutch', 0.5072511016372299],
        1.6155240596468696,
        2.1227751612840997),
    (   ['aures', 0.9654820334611113],
        ['toing', 0.6497195957769883],
        ['lymph', 0.2467772116108017],
        1.6152016292380997,
        1.8619788408489015),
    ...]
"""
```

## Epilogue

I've already had to play my third one to help myself out and it did exactly what it needed to. I will also be dead honest and this is fucking overkill. Do I seriously think this is going to help me? Not really but it was fun to try and come up with a solution, and also dust off my python skills.

---

**lares** *(plural, noun)*:
~ (in ancient Roman belief) household gods worshipped in conjunction with Vesta and the penates.

**toing** *(noun)*:
~ movement or travel backwards and forwards between two or more places.

**ducky** *(adjective)*:
~ charming; delightful.