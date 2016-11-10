# 3A
> 连接[3A](http://www.aaa-aaa.cn)网站作为行情数据源，连接本地交易客户端作为交易终端，进行一体化包装
#### 界面截图
(http://github.com/JQKid/3aClient/raw/master/dist/screenshot1.png)
(http://github.com/JQKid/3aClient/raw/master/dist/screenshot2.png)

#### 配套支持华泰核新的交易客户端，其他客户端可自行修改脚本开发
#### 实现方式采用autoit，可自行开发其他实现方式如web/dll接入

#### 如果你的环境是win10-64位，可以直接运行3A.exe，使用步骤：
* 安装[autoit](https://www.autoitscript.com/site/autoit/)
* 修改./resources/app/trade/HxTradeProcessor.js中的config里的配置
* 运行程序3A.exe
* 如非华泰核新的交易客户端或者版本(配套华泰版本为：华泰网上证券委托系统V5.18.54)不同,需要自行调通脚本(./resources/app/script/hx),参考[autoit文档(http://www.autoitx.com/Doc/)

#### 如果你的环境不是win10-64位，或者你想开发基于web或者dll的交易接口接入然后重新打包，则需要先更新一下开发环境，开发步骤
* 安装[autoit](https://www.autoitscript.com/site/autoit/)
* 安装[nodejs](https://nodejs.org/en/)
* 安装淘宝cnpm:npm install -g cnpm --registry=https://registry.npm.taobao.org
* 安装依赖:cnpm install
* 修改./resources/app/trade/HxTradeProcessor.js中的config里的配置
* 运行:npm start
* 如非华泰核新的交易客户端或者版本(配套华泰版本为：华泰网上证券委托系统V5.18.54)不同,需要自行调通脚本(./resources/app/script/hx),参考[autoit文档(http://www.autoitx.com/Doc/)
* 如想开发基于web或者dll的交易接口，需要使用js和nodejs开发，建议用[ES6](http://es6.ruanyifeng.com)
* 打包:npm run package
* 发布:npm run release
