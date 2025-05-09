---
prev:
  text: 'primarchs'
  link: '/warhammer40k/primarchs'
next:
  text: 'epub'
  link: '/warhammer40k/epub'
---

# 书籍依赖关系梳理

由于黑图书馆的书内时间并不按照出版顺序/系列序号排列, 单纯按照序号阅读可能会有些混乱, 两件事之间穿插了一些不相关的事件, 希望能在本文档中为书籍/短篇集/有声书/广播剧/漫画等作品之间建立一个元数据表, 方便理解, 并且能够供解析程序将读取整体内容, 提供每一本书的元数据/前置阅读要求/最佳阅读顺序.

## 书籍元数据

``` toml
[book]
chinese_name = "无所畏惧"
english_name = "Know No Fear"
type = "长篇小说"
series.name = "Horus Heresy"
series.order = 19
authors = ["Dan Abnett"]
recommended_reading = [
    "深渊之战",
    { name = "异端之首", series = { name = "Horus Heresy", order = 14 } },
    { enname = "Legion", series = { name = "Horus Heresy", order = 7 } },
]
faction_keywords=["极限战士", "怀言者", "永生者"]
```

中文书名, 或者是英文书名+(系列名+系列序号)都能定位一本书, 优先使用中文书名.

belongto字段和上层字段一样, 现在只允许嵌套一层, 等发现了双层嵌套再说.
