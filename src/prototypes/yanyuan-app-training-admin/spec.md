---
title: "Training Admin Management Prototype Specification"
description: "Specification for the mobile Admin Training & Exam Management dashboard"
---

# yanyuan-app-training-admin

**原型说明**  
Admin 角色的培训与考核移动工作台。定位属于 `yanyuan-app-training` 中 Admin 视角的下级页面，处理课程管理的上下架以及考卷批阅的列表流转。

## 1. 结构与布局

页面遵循严格的移动端约束 (`max-width: 420px;`)。

- **顶部导航（Header）**
  - 左侧：返回键 (`<`)
  - 中间：页面标题 (`培训考务管理`)
  - 下方：双选项卡（Tabs） -> `课程管理` / `考核与批阅`
- **内容区域（Content）**
  - `<div className="yanyuan-train-admin-scroll">` 支持内容纵向滚动，隐藏滚动条。
  - 动态渲染“课程列表”或“试卷列表”。
- **BottomSheet 抽屉面板 (Dialog)**
  - 用于“学员进度查看”和“试卷打分”。

## 2. 交互与状态描述

### 2.1 课程管理视图 (Tab 0)

- **列表展示**：卡片式列表，每个课程对应一张卡片。
- **信息展示**：包含 封面、标题、报名人数、进行状态（已发布/草稿/已下架）。
- **操作互动**：
  - `操作按钮组`：支持【上下架切换】、【查看学情】。
  - 点击【查看学情】时，呼出底部 Bottom Sheet，展示 `yanyuan-train-students-sheet` 面板（含头部标题栏+内部用户列表滚动）。

### 2.2 考核与批阅视图 (Tab 1)

- **列表展示**：卡片式列表，每个考核任务（试卷集）为一项。
- **信息展示**：标题、分类、参考人数、**待批阅份数**（红色高亮标记）。
- **过滤与切换**：提供 `待批阅` / `已完成` Segmented Control 分段器。
- **操作互动**：
  - 点击【开始批阅】按钮，呼出全屏或 Bottom Sheet 模态框进入“简易阅卷视图”。

### 2.3 底部交互浮层：试卷批阅面板

- 在 420px 宽度内实现。
- 包含考生信息概要、答题卷局部预览区。
- **评分模块**：分数 Input 或者 滑动条（Stepper/Range）。
- **评语录入**：多行 Textarea。
- **操作确认**：提交评分按钮联动 Toast 动画。

## 3. 组件数据接口 (Axure 标准)

- **Variables (VAR_LIST)**  
  `current_tab` (Int): 当前激活的顶部分类Tab, `0`=课程管理, `1`=考核与批阅  
  `review_dialog_open` (Boolean): 阅卷面板是否展开

- **Actions (ACTION_LIST)**  
  暂不声明复杂行为。

- **Events (EVENT_LIST)**  
  `on_back`: 点击顶部返回按钮
  `on_course_toggle_status`: 点击课程上下架
  `on_student_view`: 点击查看学情
  `on_review_submit`: 点击提交阅卷分数

## 4. 视觉要求

该文件仍需要和项目主题兼容，使用 `.yanyuan-app-container` 套壳。主色调偏管理端的深蓝色及用于报警预警的红色（批阅任务等）。

## 5. 参考文件

- `/src/prototypes/yanyuan-app-cert-admin/style.css` (复用 BottomSheet 框架和 卡片层级)
