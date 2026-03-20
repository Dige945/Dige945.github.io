---
title: Pooling（池化层）
date: 2024-07-25 16:07:24
tags: DeepLearning
mathjax: true
---

# 引入
在之前我们对图像进行卷积操作时，例如检测边界
（0与1的边界）
![img](/pic/example24.png)

用[0,-1]卷积核对图像进行卷积操作时候，会发现一旦得到的边界只有一列，这对于日常处理图片的时候，边界过小，在图像平移or模糊的情况下，不是很好得到有明显边界的矩阵

![img](/pic/example25.png)


所以池化层就是为了解决卷积核过于敏感的问题，使得卷积操作的容错率上升

![img](/pic/example26.png)

如上图，通过池化层处理后的卷积，图像边缘检测的范围增大了。


# 二维最大池化

![img](/pic/example26.png)

# 平均池化层

把取最大值改成了取平均值而已


# 代码实现
```
import torch
from torch import nn
from d2l import torch as d2l

def pool2d(X,pool_size,mode='max'):
    p_h,p_w = pool_size
    Y = torch.zeros((X.shape[0] - p_h + 1, X.shape[1] - p_w + 1))
    for i in range(Y.shape[0]):
        for j in range(Y.shape[1]):
            if mode == 'max':
                Y[i,j] = X[i:i + p_h, j:j + p_w].max()
            elif mode == 'avg':
                Y[i,j] = X[i:i + p_h, j:j + p_w].mean()
    return Y

#验证最大池化层与平均池化层的效果
X = torch.tensor([[0.0, 1.0, 2.0], [3.0, 4.0, 5.0], [6.0, 7.0, 8.0]])
print(pool2d(X,(2,2)))
print(pool2d(X,(2,2),'avg'))


```


Pytorch框架步幅与池化窗口的大小相同
```
#填充与步幅
X = torch.arange(16, dtype=torch.float32).reshape((1, 1, 4, 4))
print(X)
pool2d = nn.MaxPool2d(3)
print(pool2d(X))
```