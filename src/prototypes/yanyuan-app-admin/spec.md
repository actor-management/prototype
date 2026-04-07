# 管理功能导航页 (Admin 专用)

## 概述

- **页面名称**：管理中心
- **角色**：仅 Admin 可见
- **用途**：Admin 底部 Tab「管理」的落地页，汇聚全部后台管理功能入口

## 页面结构

```
┌── 顶部标题栏（管理中心）
├── 功能导航宫格（9个入口）
│   ├── 认证管理
│   ├── 证书管理
│   ├── 培训管理
│   ├── 考核管理
│   ├── 档案管理
│   ├── 财务管理
│   ├── 舆情监控
│   ├── 红黑榜管理
│   └── 后台设置
└── 底部导航栏（Admin 6 Tab，管理高亮）
```

## 功能入口路由

| 入口 | 图标 | 路由 | 说明 |
|------|------|------|------|
| 认证管理 | ShieldCheck | /prototypes/yanyuan-app-certification | 认证审核管理 |
| 证书管理 | Award | /prototypes/yanyuan-app-certificate | 证书申领/发放管理 |
| 培训管理 | BookOpen | /prototypes/yanyuan-app-training-admin | 课程管理 |
| 考核管理 | ClipboardCheck | /prototypes/yanyuan-app-exam-list | 考核与批阅 |
| 档案管理 | FolderOpen | （预留） | 演员档案管理 |
| 财务管理 | Wallet | （预留） | 费用管理 |
| 舆情监控 | Eye | （预留） | 舆情预警 |
| 红黑榜管理 | Star | （预留） | 红黑榜维护 |
| 后台设置 | Settings | （预留） | 系统参数 |

## 设计规范

- 顶部：#E85D4A 渐变背景 + 白字标题
- 宫格：3列布局，带图标圆形色块 + 文字
- 底部导航：6 Tab，第3个「管理」高亮
