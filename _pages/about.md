---
permalink: /
title: ""
layout: single
author_profile: false
classes: wide lvmin-home
redirect_from:
  - /about/
  - /about.html
---

<figure class="home-figure">
  <img src="{{ '/images/profile.png' | relative_url }}" alt="Yudi Xie">
  <figcaption>Figure 1. Yudi Xie.</figcaption>
</figure>

Hi, I am **Yudi Xie** (谢宇迪), a third-year undergraduate student in Software Engineering (Honor Class) at Wuhan University. I am currently a student at the Multimedia Analysis and Reasoning Lab (MARS Lab), advised by Prof. [Mang Ye](https://marswhu.github.io/).

My research interests focus on Computer Vision, Multi-Modal Learning, and Generative AI. I am particularly interested in trustworthy visual recognition, privacy-preserving person re-identification, and multimodal representation learning.

xieyudiwhu AT 163.com / [GitHub](https://github.com/Dige945) / [Google Scholar](https://scholar.google.com/citations?user=PS_CX0AAAAAJ)

---

{% assign news_items = site.data.news | sort: "date" | reverse %}
{% for item in news_items limit: 5 %}
<div class="home-news-item">
  <span class="home-news-date">{{ item.date_label }}</span>
  <span>{{ item.text | markdownify | remove: '<p>' | remove: '</p>' }}</span>
</div>
{% endfor %}

---

{% assign pubs = site.publications | sort: "date" | reverse %}
{% for post in pubs %}
  {% include home-publication.html post=post index=forloop.index %}
{% endfor %}

---

Miscs: Orienteering, computer competitions, scholarships, selected awards, and campus activities.
