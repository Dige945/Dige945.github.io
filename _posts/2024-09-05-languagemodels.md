---
layout: single
title: 'Language Models'
date: 2024-09-05 15:57:12
tags: DeepLearning
mathjax: true
---

# 语言模型

给定文本序列$x_1,...,x_T$ ,语言模型的目标是估计联合概率 $p(x_1,..,x_T)$

应用�?
* 预训练模型如 BERT,GPT
* 生成文本，给定前面几个词，不断的使用 $x_t\sim p(x_t|x_{t-\tau},...,x_{t-1})$ 来生成后续文�?* 判断多个序列中哪个更常见

# 使用计数建模

* 若序列长度为2 �?预测
  $$p(x,x^{\prime})=p(x)p(x^{\prime}|x)=\frac{n(x)}{x}\frac{n(x,x^{\prime})}{n(x)}$$
  n为总词数（即为词库中所有词的数量，$n(x)$ , $n(x,x^{\prime})$是单个单词和连续单词�?的出现次�?* 序列长度3同理

# N元语�?
* 当序列很长，因为文本量不够大，很可能 $n(x_1,...,x_T)\leq 1$
* 使用马尔科夫假设缓解问题

  * 一元语�? $p(x_1,x_2,x_3,x_4)=p(x_1)p(x_2)p(x_3)p(x_4)\\ \\  =\frac{n(x_1)}{n}\frac{n(x_2)}{n}\frac{n(x_3)}{n}\frac{n(x_4)}{n}$
  此语法其实有点像各事件相对独立的概率乘积
  * 二元语法
  $$p(x_1,x_2,x_3,x_4)=p(x_1)p(x_2|x_1)p(x_3|x_2)p(x_4|x_3)\\ \\  =\frac{n(x_1)}{n}\frac{n(x_1,x_2)}{n}\frac{n(x_2,x_3)}{n}\frac{n(x_3,x_4)}{n}$$

  * 三元语法同理
   

