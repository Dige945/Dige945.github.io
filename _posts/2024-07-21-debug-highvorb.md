---
title: debug a learning algorithm
date: 2024-07-21 16:02:28
tags: ML
mathjax: true
---
Look at this J funciton:
$$J(\vec{w},b)=\frac{1}{2m}\sum^m_{i=1}(f_{\vec{m},b}\vec({x}^{(i)})-y^{(i)})^2+\frac{\lambda}{2m}\sum^n_{j=1}w^2_j$$

it makes unacceptably large errors in predictions.

What do you try next?

### Get more training examples
Fixes high variance
(or we could say overfitting)

### Try smaller sets of features
Fixes high variance

### Try getting additional features 
Fixes high bias(or we could say our modal is not so accurate)

### Try adding polynomial features($x_1^2,x_2^2,x_1x_2 etc$)
Fixes high bias

### Try decreasing $\lambda$
Fixes high bias

### Try increasing $\lambda$

Fix high variance


