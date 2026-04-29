---
title: ML/Deep Learning Note1-杂记
date: 2024-08-31 10:16:15
tags: ML
mathjax: true
---

机器学习的一点笔记（其实只是拿来练一下公式输入）

1、sigmoid activation function

$$ f(x)= \frac1 {1+e^x} $$

2、RELU activation function

$$ f(x) = max(0,x) $$

通常 $x$ 用线性函数 $y=wx+b$代替

即上述函数可以化为
$$ f(x)= \frac{1}{e^{wx+b}+1} $$
$$ f(x) = max(0,wx+b) $$

tip：RELU用得比较多，因为计算量少，理论上一次$e^x$的计算，就相当于百多次乘法运算，重复使用对算力要求比较高。

3、梯度下降（Gradient Descent）的通式

repeat
$$w_i = w_i - \alpha\frac{\partial J(\vec{w},b)}{\partial w_i} $$
$$b = b-\alpha\frac{\partial J(\vec{w},b)}{\partial b} $$
其中，$\alpha$为学习率，需要手动选择，这类参数称为超参数


4、sigmoid 函数的 loss function

$L(f_{ {\vec{w},b} }(\vec{x}^i,y^i)) = \begin{cases} -\log(f_{ {\vec{w},b} }(\vec{x}^i)) & y^i = 1 \\\\ -\log(1-f_{\vec{w},b}(\vec{x}^i)) & y^i = 0 \end{cases}$
 

可以化简为：

$$ L(f_{ {\vec{w},b}}(\vec{x}^i,y^i))=-y^ilog(f_{ {\vec{w},b} }(\vec{x}^i))-(1-y^i)log(1-f_{\vec{w},b}(\vec{x}^i))$$

5、sigmoid 函数的cost function

$$J(\vec{w},b) = \frac{1}{m}\sum_{i=1}^m[L(f_{\vec{w},b},y^i)]=-\frac{1}{m}\sum_{i=1}^\infty[y^ilog(f_{\vec{w},b}(\vec{x}^i))+(1-y^i)log(1-f_{\vec{w},b}(\vec{x}^i))]$$

6、多类分类函数 Softmax
$$\hat{y}=softmax(o)$$

$$\hat{y}_i=\frac{e^{o_i}}{\sum_ke^{o_k}}$$
可以将每个类转化为0-1的概率分布(预测置信度)，且和为1

概率$y$和$\hat{y}$的区别作为损失

通常用交叉熵来衡量两个概率的区别
$$H(p,q)=\sum_i-p_ilog(q_i)$$
故$y$与$\hat{y}$的损失为
$$l(y,\hat{y})=-\sum_iy_ilog(\hat{y_i})=-log\hat{y_y}$$

其梯度是真实概率和预测概率的区别
$$\partial_{o_i}l(y,\hat{y})=softmax(o)_i-y_i$$



softmax（直接调用）代码
```
import torch
from d2l import torch as d2l
from torch import nn

batch_size = 256
train_iter, test_iter = d2l.load_data_fashion_mnist(batch_size)

net = nn.Sequential(nn.Flatten(), nn.Linear(784, 10))
#Flatten函数将图像格式从二维数组转换为一维数组，输入形状是(批量大小，通道，高，宽)
def init_weights(m):
    if type(m) == nn.Linear:
        nn.init.normal_(m.weight, std=0.01)

net.apply(init_weights)

loss = nn.CrossEntropyLoss()

trainer = torch.optim.SGD(net.parameters(), lr=0.1)

num_epochs = 10
d2l.train_ch3(net, train_iter, test_iter, loss, num_epochs, trainer)

```

softmax实现代码
```
import torch
from IPython import display
from d2l import torch as d2l
from d2l.torch import Accumulator, Animator

batch_size = 256
train_iter, test_iter = d2l.load_data_fashion_mnist(batch_size)

#把图像拉成一条向量，28*28 = 784
num_inputs = 784
#分类有十个类
num_outputs = 10
#W为权重，b为偏差
W = torch.normal(0, 0.01, size=(num_inputs, num_outputs), requires_grad=True)
b = torch.zeros(num_outputs, requires_grad=True)

def softmax(X):
    #0是行，1是列，sum里面是哪个就把哪一个压缩
    X_exp = torch.exp(X)
    partition = X_exp.sum(1, keepdim=True)
    return X_exp / partition  # 这里应用了广播

def net(X):
    return softmax(torch.matmul(X.reshape((-1, W.shape[0])), W) + b)
def cross_entropy(y_hat, y):
    return - torch.log(y_hat[range(len(y_hat)), y])

def accuracy(y_hat, y):
    """计算预测正确的数量"""
    if len(y_hat.shape) > 1 and y_hat.shape[1] > 1:
        y_hat = y_hat.argmax(axis=1)
    cmp = y_hat.type(y.dtype) == y
    return float(cmp.type(y.dtype).sum())

def evaluate_accuracy(net, data_iter):
    """计算在指定数据集上模型的精度"""
    if isinstance(net, torch.nn.Module):
        net.eval()  # 将模型设置为评估模式
    metric = Accumulator(2)  # 正确预测数、预测总数
    with torch.no_grad():
        for X, y in data_iter:
            metric.add(accuracy(net(X), y), y.numel())
    return metric[0] / metric[1]

def train_epoch_ch3(net, train_iter, loss, updater):
    """训练模型一个迭代周期"""
    # 将模型设置为训练模式
    if isinstance(net, torch.nn.Module):
        net.train()
    # 训练损失总和、训练准确度总和、样本数
    metric = Accumulator(3)
    for X, y in train_iter:
        # 计算梯度并更新参数
        y_hat = net(X)
        l = loss(y_hat, y)
        if isinstance(updater, torch.optim.Optimizer):
            # 使用PyTorch内置的优化器和损失函数
            updater.zero_grad()
            l.mean().backward()
            updater.step()
        else:
            # 使用定制的优化器和损失函数
            l.sum().backward()
            updater(X.shape[0])
            metric.add(float(l.sum()), accuracy(y_hat, y), y.numel())
    # 返回训练损失和训练精度
    return metric[0] / metric[2], metric[1] / metric[2]


def train_ch3(net, train_iter, test_iter, loss, num_epochs, updater):
    """训练模型"""
    animator = Animator(xlabel='epoch', xlim=[1, num_epochs], ylim=[0.3, 0.9],
                        legend=['train loss', 'train acc', 'test acc'])
    for epoch in range(num_epochs):
        train_metrics = train_epoch_ch3(net, train_iter, loss, updater)
        test_acc = evaluate_accuracy(net, test_iter)
        animator.add(epoch + 1, train_metrics + (test_acc,))
    train_loss, train_acc = train_metrics
    assert train_loss < 0.5, train_loss
    assert train_acc <= 1 and train_acc > 0.7, train_acc
    assert test_acc <= 1 and test_acc > 0.7, test_acc

lr = 0.1
def updater(batch_size):
    return d2l.sgd([W, b], lr, batch_size)
num_epochs = 10
train_ch3(net, train_iter, test_iter, cross_entropy, num_epochs, updater)

def show_images(imgs, num_rows, num_cols, titles=None, scale=1.5):
    """Plot a list of images.

    Defined in :numref:`sec_fashion_mnist`"""
    figsize = (num_cols * scale, num_rows * scale)
    _, axes = d2l.plt.subplots(num_rows, num_cols, figsize=figsize)
    axes = axes.flatten()
    for i, (ax, img) in enumerate(zip(axes, imgs)):
        if torch.is_tensor(img):
            # Tensor Image
            ax.imshow(img.numpy())
        else:
            # PIL Image
            ax.imshow(img)
        ax.axes.get_xaxis().set_visible(False)
        ax.axes.get_yaxis().set_visible(False)
        if titles:
            ax.set_title(titles[i])
    d2l.plt.show()
    return axes
def predict_ch3(net, test_iter, n=6):
    """预测标签"""
    for X, y in test_iter:
        break
    trues = d2l.get_fashion_mnist_labels(y)
    preds = d2l.get_fashion_mnist_labels(net(X).argmax(axis=1))
    titles = [true +'\n' + pred for true, pred in zip(trues, preds)]
    d2l.show_images(
        X[0:n].reshape((n, 28, 28)), 1, n, titles=titles[0:n])

predict_ch3(net, test_iter)
```
 

