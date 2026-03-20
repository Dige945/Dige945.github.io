---
title: Some_Interpretation_About_Resnet
date: 2024-08-24 10:53:52
tags: Deeplearning
mathjax: true
---

# Why ResNet can train a neural network that has more than 1000 layers

Here are the math interpretation

Take $W$ as a example,when we talk about gradient descent,we use the formula to update our
$W$

$$y = f(X)$$
$$W = W - \eta\frac{\partial f}{\partial W}$$

$f$ could be 10 conv_layers,based on it, we add another 10 conv_layers $g$ into our model
so $y=g(f(x))$

then we continue to use the formula and we could get

$$W = W - \eta\frac{\partial g}{\partial f}\frac{\partial f}{\partial W}$$

If the loss value decreases to close to 0 as the network gets deeper, then the derivation $\frac{\partial g}{\partial f}$  yields a very small value, and multiplying a very small value by a normal value ($\frac{\partial g}{\partial f}\times\frac{\partial f}{\partial W}$) obtained in the previous layer can potentially make the result smaller and smaller, thus preventing W from being updated in time because the result obtained from the derivation is so small that you can't make much of a difference even if you increase the learning rate $\eta$


### So here we go to use ResNet

$$y = X + f(X)$$

$f(X)$ are the things we need to train , we add some layers to make the network much deeper

$$y = f(X) + g(f(X))$$

$$W = W - \eta(\frac{\partial f}{\partial W}+\frac{\partial g}{\partial f}\times\frac{\partial f}{\partial W})$$


This allows us to keep the neural network from losing the gradient as it gets smaller and smaller and the gradient disappears as it multiplies layer by layer during backpropagation, resulting in an inability to update the weights $W$




