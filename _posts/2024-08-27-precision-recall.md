---
layout: single
title: 'Precision & Recall Metrics'
date: 2024-08-27 12:16:32
tags: ML
mathjax: true
---
# First of all
In machine learing, precision and recall are two standards to evaluate a model , but why precision and recall can make such a useful work? Here are the answers
# Rare classification example
When we want to train a classifier to classify the disease on the patient, you train  a classifier $f_{\vec{w},b}(\vec{x})$ ($y=1$ if disease present,$y=0$ otherwise)

If the disease is a rare disease(means it only has 1% possibility to get such a disease) , you may find that you've got maybe 1% error on test set(which means 99% correct diagnoses)

you will find that you always print "the patient did not have this rare disease" because only 0.5% of patients have the disease

So if you design a model that always print("y=0",which means no this disease),you can find that the model have 99.5% accuracy to dignoses this disease . But obviously this model is not good , so stupid although it has a high accuracy.

So we need a new standard to evaluate the accuracy of a model

# Precision/recall

Suppose $y=1$ in presence of rare class we want to detect.

![img](/images/posts/example45.png)

From the picture ,  we can find in the actual class , the number of "$y=1$" is 15+10=25 , the number of "$y=0$" is 5+70 =75 , it meets with the situation of " Rare disease ".

![img](/images/posts/example46.png)

If "$y=1$" in both predicted class and actual class , we call it True positive.


If "$y=0$" in both predicted class and actual class , we call it True negative.

The same can be obtained "False positive" and "False negative"

## The Formula

$$Precision = \frac{True \ \  positives}{predicted \ \ positives}=\frac{True \ \ positives}{True\ \ pos+False\ \ pos}$$

Use the example above,$precision=\frac{15}{15+5}=0.75$

$$Recall=\frac{True\ \ positives}{actual\ \ positive}=\frac{True\ \ positives}{True\ \ pos+False \ \ neg}$$

Use the example above,$recall=\frac{15}{15+10}=0.6$


If the model is "print("y=0")",then the True positive will always be 0,and the precision and recall will be 0 because the numerator are 0
