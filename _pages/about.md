---
permalink: /
title: ""
layout: lvmin-home
author_profile: false
classes: wide lvmin-home
redirect_from:
  - /about/
  - /about.html
---

<figure class="home-figure">
  <img src="{{ '/images/profile.jpg' | relative_url }}" alt="Yudi Xie at an orienteering competition with teammates">
  <figcaption><strong>Figure 1.</strong> Orienteering with my lovely team family. I am second from the right.</figcaption>
</figure>

Hi, I am **Yudi Xie** (谢宇迪), a third-year undergraduate student in Software Engineering (Honor Class) at Wuhan University. I am currently a student at the Multimedia Analysis and Reasoning Lab (MARS Lab), advised by Prof. [Mang Ye](https://marswhu.github.io/).

My research interests focus on Computer Vision, Multi-Modal Learning, and Generative AI.

xieyudiwhu AT 163.com / [GitHub](https://github.com/Dige945) / [Blog]({{ '/blog/' | relative_url }})

---

{% assign news_items = site.data.news | sort: "date" | reverse %}
{% for item in news_items limit: 5 %}
<div class="home-news-item">
  <span class="home-news-date">{{ item.date_label }}</span>
  <span>{{ item.text | markdownify | remove: '<p>' | remove: '</p>' }}</span>
</div>
{% endfor %}

---

<button class="home-show-all" type="button" data-show-all-publications>
  <span class="home-show-all__box" aria-hidden="true"></span>
  <span>Show all works</span>
</button>

{% assign pubs = site.publications | sort: "date" | reverse %}
{% for post in pubs %}
  {% include home-publication.html post=post index=forloop.index %}
{% endfor %}

---

Miscs:

<div class="home-misc">
  <div class="home-misc__group">
    <strong>Orienteering.</strong>
    <ul>
      <li>1st Place, 2024 Hubei Provincial University Orienteering Championship, Men's Group Team-Race</li>
      <li>4th Place, 2024 Hubei Provincial University Orienteering Championship, Men's Group Relay Race</li>
      <li>2nd Place, 2023 Hubei Provincial Orienteering Championship, Middle Distance Race</li>
      <li>2nd Place, 2024 Hubei Provincial Orienteering and Radio Direction Finding Championship, Orienteering Elite Group Team</li>
      <li>6th Place, 2025 Hubei Provincial Orienteering and Radio Direction Finding Championship, 144MHz Radio Direction Finding</li>
      <li>1st Place, Wuhan University Campus Orienteering Challenge, Professional Group</li>
    </ul>
  </div>

  <div class="home-misc__group">
    <strong>Computer Competitions.</strong>
    <ul>
      <li>First Prize, China University Computer Design Competition, South Central Region</li>
      <li>First Prize, "Huazhong Cup" University Mathematical Modeling Challenge</li>
      <li>First Prize, The Chinese Mathematics Competitions for College Students</li>
    </ul>
  </div>

  <div class="home-misc__group">
    <strong>Honors.</strong>
    <ul>
      <li>2023-2024 National Scholarship</li>
      <li>2024-2025 National Scholarship</li>
      <li>First-Class Scholarship of Wuhan University</li>
      <li>Lei Jun Computer Innovation and Development Fund</li>
      <li>Wuhan University "Advanced Individual in Sports"</li>
      <li>Wuhan University "Activist in Social Activities"</li>
    </ul>
  </div>
</div>
