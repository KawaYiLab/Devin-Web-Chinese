// ==UserScript==
// @name         Devin 网页端汉化
// @namespace    https://github.com/KawaYiLab/Devin-Web-Chinese
// @version      1.0.7
// @description  将 Devin (app.devin.ai) 网页界面全面汉化为中文，基于静态词典映射 + 正则规则
// @author       KawaYiLab
// @match        https://app.devin.ai/*
// @match        https://*.devin.ai/*
// @grant        none
// @run-at       document-idle
// @license      MIT
// @homepageURL  https://github.com/KawaYiLab/Devin-Web-Chinese
// @supportURL   https://github.com/KawaYiLab/Devin-Web-Chinese/issues
// ==/UserScript==

(function () {
  "use strict";

/**
 * Devin 网页端汉化词典
 * 
 * 结构说明： 
 * - DICTIONARY: 精确匹配的 英文 -> 中文 对照表 
 * - REGEX_RULES: 带正则的替换规则数组，用于处理含动态内容的文案 
 */ 
// eslint-disable-next-line no-unused-vars 
const DICTIONARY = { 
  // ========== 登录与注册页面 ========== 
  "Welcome back": "欢迎回来", 
  "Welcome to Devin": "欢迎使用 Devin", 
  "Log in to your account": "登录到您的账户", 
  "Create a new account": "创建新账户", 
  "Continue with GitHub": "使用 GitHub 继续", 
  "Continue with Google": "使用 Google 继续", 
  "Continue with Windsurf": "使用 Windsurf 继续", 
  "OR": "或", 
  "Email address": "邮箱地址", 
  "Log in": "登录", 
  "Log In": "登录", 
  "Sign up": "注册", 
  "Sign Up": "注册", 
  "Sign in": "登录", 
  "Sign In": "登录", 
  "Sign out": "退出登录", 
  "Log out": "退出登录", 
  "Don't have an account?": "还没有账户？", 
  "Already have an account?": "已有账户？", 
  "Create account": "创建账户", 
  "Forgot password": "忘记密码", 
  "Forgot password?": "忘记密码？", 

  // ========== 顶部导航与全局 ========== 
  "Back to app": "返回应用", 
  "Back to organization": "返回组织", 
  "Search": "搜索", 
  "Search settings...": "搜索设置...", 
  "Search sessions...": "搜索会话...", 
  "Search secrets": "搜索密钥", 
  "Search for knowledge...": "搜索知识...", 
  "Display": "显示", 
  "Settings": "设置", 
  "Help": "帮助", 
  "Download apps": "下载应用", 
  "New": "新建", 
  "Continue": "继续", 

  // ========== 侧边栏 - 个人设置 ========== 
  "Personal": "个人", 
  "Preferences": "偏好设置", 
  "Connections": "连接", 

  // ========== 侧边栏 - 组织设置 ========== 
  "Organization": "组织", 
  "General": "通用", 
  "Sessions": "会话", 
  "Plans": "订阅方案", // 优化：Plans 在此语境下是订阅计划
  "Invoices": "账单发票", 
  "Usage & limits": "用量与限制", 
  "Devin": "Devin", 
  "Review": "代码审查", // 优化：更符合开发语境
  "DeepWiki": "DeepWiki", 
  "Schedules": "定时任务", 
  "Devin Desktop": "Devin 桌面版", 
  "Skills & Rules": "技能与规则", 
  "Environment": "运行环境", // 优化：比单纯“环境”更明确
  "Knowledge": "知识库", 
  "Playbooks": "自动化剧本", // 优化：强调自动化属性
  "Secrets": "密钥", 
  "Repositories": "代码仓库", // 优化：加上代码二字更符合语境
  "Membership": "成员管理", 
  "Devin API": "Devin API", 
  "Analytics": "数据统计", 

  // ========== 会话列表页 ========== 
  "New session": "新建会话", 
  "New Session": "新建会话", 
  "No sessions found": "未找到会话", 
  "Creator is": "创建者为", 
  "Archived Status is": "归档状态为", 
  "Not Archived": "未归档", 
  "Archived": "已归档", 
  "Updated date is": "更新日期为", 
  "Clear filters": "清除筛选", 
  "Deselect all sessions": "取消选择所有会话", 
  "Filter": "筛选", 
  "Sort": "排序", 

  // ========== 会话详情页 ========== 
  "Send": "发送", 
  "Stop": "停止", 
  "Restart": "重启", 
  "Resume": "恢复", 
  "Pause": "暂停", 
  "Cancel": "取消", 
  "Confirm": "确认", 
  "Delete": "删除", 
  "Edit": "编辑", 
  "Save": "保存", 
  "Close": "关闭", 
  "Copy": "复制", 
  "Share": "分享", 
  "Refresh": "刷新", 
  "Loading": "加载中", 
  "Loading...": "加载中...", 
  "Thinking...": "思考中...", 
  "Type a message...": "输入消息...", 
  "Send a message": "发送消息", 
  "Ask Devin anything...": "向 Devin 提问...", 
  "What would you like Devin to do?": "您希望 Devin 做什么？", 

  // ========== 会话状态 ========== 
  "Running": "运行中", 
  "Completed": "已完成", 
  "Failed": "失败", 
  "Pending": "等待中", 
  "Blocked": "已阻塞", 
  "Active": "活跃", 
  "Idle": "空闲", 
  "Paused": "已暂停", 
  "Queued": "排队中", 
  "In Progress": "执行中", // 优化：执行中比进行中更符合任务状态
  "Waiting for user response": "等待用户回复", 
  "Waiting for CI": "等待 CI", 
  "Working": "工作中", 
  "Stopped": "已停止", 
  "Errored": "出错", 
  "Suspended": "已挂起", // 优化：Suspended 挂起比暂停更准确
  "Timed out": "已超时", 

  // ========== 会话面板与标签 ========== 
  "Desktop": "桌面", 
  "Browser": "浏览器", 
  "Shell": "终端", 
  "Editor": "编辑器", 
  "Planner": "任务规划器", // 优化：明确是任务规划
  "Timeline": "时间线", 
  "Code": "代码", 
  "Terminal": "终端", 
  "Output": "输出", 
  "Preview": "预览", 
  "Conversation": "对话", 
  "Machine": "运行环境", // 优化：Devin的Machine指沙盒环境，译为运行环境
  "Activity": "活动", 
  "Attachments": "附件", 

  // ========== 操作与按钮 ========== 
  "Submit": "提交", 
  "Approve": "批准", 
  "Reject": "拒绝", 
  "Retry": "重试", 
  "Back": "返回", 
  "Next": "下一步", 
  "Previous": "上一步", 
  "Skip": "跳过", 
  "Done": "完成", 
  "Apply": "应用", 
  "Reset": "重置", 
  "Clear": "清除", 
  "Download": "下载", 
  "Upload": "上传", 
  "Import": "导入", 
  "Export": "导出", 
  "Add": "添加", 
  "Remove": "移除", 
  "Create": "创建", 
  "Update": "更新", 
  "Rename": "重命名", 
  "Duplicate": "创建副本", // 优化：比“复制”更明确
  "Archive": "归档", 
  "Unarchive": "取消归档", 
  "Pin": "固定", 
  "Unpin": "取消固定", 
  "Expand": "展开", 
  "Collapse": "收起", 
  "Select": "选择", 
  "Select all": "全选", 
  "Deselect all": "取消全选", 
  "Copy link": "复制链接", 
  "Copy to clipboard": "复制到剪贴板", 
  "Copied!": "已复制！", 
  "Copied to clipboard": "已复制到剪贴板", 

  // ========== 知识库页面 ========== 
  "Create knowledge": "创建知识", 
  "New folder": "新建文件夹", 
  "Admin-only knowledge suggestions": "仅管理员可管理知识建议", 
  "Restrict knowledge suggestion approval to admins": "限制知识建议审批权限为管理员", 
  "Suggestions": "建议", 
  "System knowledge": "系统知识", 
  "Enabled in your sessions": "在您的会话中启用", 
  "Name": "名称", 
  "Author": "作者", 
  "Created at": "创建时间", 
  "Cognition": "Cognition", 

  // ========== 环境设置页面 ========== 
  "Blueprints": "环境蓝图", // 优化：加上环境二字
  "Snapshots": "快照", 
  "Migration": "迁移", 
  "Configuration": "配置", 
  "Organization blueprint": "组织环境蓝图", 
  "Not set. Add one to share setup across this org": "未设置。添加一个以在此组织中共享配置", 
  "Added repositories are cloned and set up in the order shown during snapshot builds. Drag to reorder": "已添加的仓库将按显示顺序在快照构建期间克隆和配置。拖拽以重新排序", 
  "No repositories added": "未添加仓库", 
  "Add repositories to configure per-repo setup instructions.": "添加仓库以配置每个仓库的初始化指令。", 
  "Add repositories": "添加仓库", 
  "All repositories": "所有仓库", 

  // ========== 密钥页面 ========== 
  "Add secret": "添加密钥", 
  "Bulk add secrets": "批量添加密钥", 
  "No secrets found": "未找到密钥", 
  "Add your first secret to get started.": "添加您的第一个密钥以开始使用。", 
  "Note": "备注", 
  "Updated by": "更新者", 
  "Updated at": "更新时间", 
  "Type": "类型", 

  // ========== 主页与引导 ========== 
  "Say hello to Devin, your": "向 Devin 打个招呼，您的", 
  "new engineering collaborator": "全新 AI 研发协作伙伴", // 优化：加上AI更贴切
  "Index your codebase and create Wikis": "索引您的代码库并创建 Wiki", 
  "Run multiple agents for large tasks": "运行多个智能体以处理大型任务", // 优化：代理 -> 智能体
  "Schedule recurring sessions": "安排定期会话", 
  "Run scheduled chores": "运行定时任务", 
  "Run security scan": "运行安全扫描", 
  "Triage Datadog incident": "排查 Datadog 告警", // 优化：incident 译为告警，triage 译为排查
  "Review last 5 PRs": "审查最近 5 个 PR", 
  "Add unit tests": "添加单元测试", 
  "Generate wiki for repo": "为仓库生成 Wiki", 

  // ========== 剧本页面 ========== 
  "Create playbook": "创建自动化剧本", 
  "No playbooks found": "未找到自动化剧本", 
  "Trigger": "触发器", 
  "Manual": "手动", 
  "Automatic": "自动", 
  "Last run": "上次运行", 
  "Never": "从不", 

  // ========== 定时任务页面 ========== 
  "Create schedule": "创建定时任务", 
  "No schedules found": "未找到定时任务", 
  "Frequency": "频率", 
  "Next run": "下次运行", 
  "Daily": "每天", 
  "Weekly": "每周", 
  "Monthly": "每月", 
  "Custom schedule": "自定义时间表", 

  // ========== 成员管理页面 ========== 
  "Invite members": "邀请成员", 
  "Invite": "邀请", 
  "Members": "成员", 
  "Pending invitations": "待处理邀请", 
  "Admin": "管理员", 
  "Member": "成员", 
  "Owner": "所有者", 
  "Role": "角色", 
  "Joined": "加入时间", 
  "Last active": "上次活跃", 
  "Remove member": "移除成员", 
  "Change role": "更改角色", 

  // ========== 仓库页面 ========== 
  "Add repository": "添加仓库", 
  "Search for a repository": "搜索仓库...", 
  "Connected repositories": "已连接仓库", 
  "Repository name": "仓库名称", 
  "Last synced": "上次同步", 
  "Sync now": "立即同步", 
  "Disconnect": "断开连接", 
  "Connect": "连接", 

  // ========== 连接页面 ========== 
  "Connected": "已连接", 
  "Not connected": "未连接", 
  "GitHub": "GitHub", 
  "GitLab": "GitLab", 
  "Bitbucket": "Bitbucket", 
  "Slack": "Slack", 
  "Linear": "Linear", 
  "Jira": "Jira", 
  "Datadog": "Datadog", 
  "Configure": "配置", 
  "Reconnect": "重新连接", 

  // ========== 账单与用量 ========== 
  "Billing": "计费", // 优化：账单 -> 计费
  "Usage": "用量", 
  "Current plan": "当前方案", 
  "Upgrade": "升级", 
  "Downgrade": "降级", 
  "Cancel plan": "取消方案", 
  "Free": "免费", 
  "Pro": "专业版", 
  "Team": "团队版", 
  "Enterprise": "企业版", 
  "ACUs used": "已使用 ACU", 
  "ACUs remaining": "剩余 ACU", 
  "Billing period": "计费周期", 
  "Payment method": "支付方式", 
  "Invoice history": "发票历史", 
  "Amount": "金额", 
  "Date": "日期", 
  "Status": "状态", 
  "Paid": "已支付", 
  "Unpaid": "未支付", 
  "Overdue": "逾期", 

  // ========== PR 与 Git 相关 ========== 
  // 优化：国内开发者极少说“拉取请求”，直接使用 PR 或合并请求
  "Pull Request": "Pull Request (PR)", 
  "Pull Requests": "Pull Requests (PR)", 
  "Commit": "提交", 
  "Commits": "提交记录", 
  "Branch": "分支", 
  "Branches": "分支", 
  "Merge": "合并", 
  "Repository": "仓库", 
  "Open": "打开", 
  "Closed": "已关闭", 
  "Merged": "已合并", 
  "Draft": "草稿", 
  "Ready for review": "待审查", // 优化：比“等待审查”更简洁
  "Changes requested": "需修改", // 优化：比“已请求更改”更符合 GitHub 语境
  "Approved": "已批准", 
  "Review required": "需代码审查", 
  "CI passed": "CI 通过", 
  "CI failed": "CI 失败", 
  "CI pending": "CI 执行中", 
  "Checks": "CI 检查", // 优化：明确是 CI 检查
  "Files changed": "变更文件", // 优化：比“更改的文件”更专业
  "Conversations": "对话", 

  // ========== 通用状态与标签 ========== 
  "Error": "错误", 
  "Warning": "警告", 
  "Info": "信息", 
  "Success": "成功", 
  "Description": "描述", 
  "Created": "已创建", 
  "Updated": "已更新", 
  "Actions": "操作", 
  "More": "更多", 
  "More actions": "更多操作", 
  "Options": "选项", 
  "All": "全部", 
  "None": "无", 
  "Default": "默认", 
  "Custom": "自定义", 
  "Enabled": "已启用", 
  "Disabled": "已禁用", 

  // ========== 会话内交互文案 ========== 
  "Worked for": "工作了", 
  "Edited": "编辑了", 
  "Moved mouse to": "移动鼠标到", 
  "Accessed knowledge": "访问了知识库", 
  "Searched codebase for": "搜索了代码库", 
  "Approve suggestion": "批准建议", 
  "Reject suggestion": "拒绝建议", 
  "View diff": "查看 Diff", 
  "View PR": "查看 PR", 
  "Open PR": "打开 PR", 
  "View session": "查看会话", 
  "Open in new tab": "在新标签页中打开", 

  // ========== 通知与提示 ========== 
  "Notifications": "通知", 
  "No notifications": "没有通知", 
  "Mark all as read": "全部标记为已读", 
  "Mark as read": "标记为已读", 
  "Dismiss": "关闭", 
  "Undo": "撤销", 
  "Something went wrong": "出了点问题", 
  "Try again": "重试", 
  "Please try again later": "请稍后重试", 
  "An error occurred": "发生了错误", 
  "No results found": "未找到结果", 
  "No data available": "暂无数据", 

  // ========== 表格与列表 ========== 
  "Showing": "显示", 
  "per page": "每页", 
  "First": "第一页", 
  "Last": "最后一页", 
  "Previous page": "上一页", 
  "Next page": "下一页", 
  "No items": "无项目", 
  "Empty": "空", 

  // ========== 确认对话框 ========== 
  "Are you sure?": "确定要执行此操作吗？", 
  "This action cannot be undone.": "此操作无法撤销。", 
  "Confirm deletion": "确认删除", 
  "Are you sure you want to delete this?": "确定要删除此项吗？", 
  "Yes, delete": "是的，删除", 
  "No, cancel": "不，取消", 
  "Discard changes": "放弃更改", 
  "Save changes": "保存更改", 
  "Unsaved changes": "未保存的更改", 
  "You have unsaved changes. Are you sure you want to leave?": "您有未保存的更改。确定要离开吗？", 

  // ========== 文件与编辑器 ========== 
  "File": "文件", 
  "Files": "文件", 
  "Folder": "文件夹", 
  "Folders": "文件夹", 
  "Open file": "打开文件", 
  "New file": "新建文件", 
  "Save file": "保存文件", 
  "Rename file": "重命名文件", 
  "Delete file": "删除文件", 
  "Copy path": "复制路径", 
  "Reveal in sidebar": "在侧边栏中显示", 

  // ========== 偏好设置页面 ========== 
  "Theme": "主题", 
  "Light": "浅色", 
  "Dark": "深色", 
  "System": "跟随系统", 
  "Language": "语言", 
  "Email notifications": "邮件通知", 
  "Slack notifications": "Slack 通知", 
  "Notify me when": "在以下情况通知我", 
  "Session completes": "会话完成时", 
  "Session fails": "会话失败时", 
  "Session needs input": "会话需要输入时", 
  "PR is ready": "PR 准备好时", 

  // ========== Devin Review 相关 ========== 
  "Devin Review": "Devin 代码审查", 
  "Enable review": "启用审查", 
  "Auto-review PRs": "自动审查 PR", 
  "Review settings": "审查设置", 
  "Severity": "严重程度", // 优化：加上程度更明确
  "Critical": "严重", 
  "High": "高", 
  "Medium": "中", 
  "Low": "低", 
  "Suggestion": "建议", 
  "Issue": "问题", 
  "Issues": "问题", 

  // ========== 搜索与筛选 ========== 
  "Search...": "搜索...", 
  "Filter by": "按条件筛选", 
  "Sort by": "排序方式", 
  "Date created": "创建日期", 
  "Date updated": "更新日期", 
  "Newest first": "最新优先", 
  "Oldest first": "最早优先", 
  "Alphabetical": "按字母排序", 
  "Recently updated": "最近更新", 
  "Clear all": "全部清除", 
  "Apply filters": "应用筛选", 
  "Reset filters": "重置筛选", 

  // ========== 常见短语 ========== 
  "Learn more": "了解更多", 
  "View all": "查看全部", 
  "Show more": "显示更多", 
  "Show less": "收起", 
  "See details": "查看详情", 
  "View details": "查看详情", 
  "documentation": "文档", 
  "Documentation": "文档", 
  "Feedback": "反馈", 
  "What's new": "新功能", 
  "Changelog": "更新日志", 
  "Version": "版本", 
  "Upgrade available": "有可用更新", 
  "Get started": "开始使用", 
  "Quick start": "快速开始", 

  // ========== API 与密钥管理 ========== 
  "API Keys": "API 密钥", 
  "API Key": "API 密钥", 
  "Generate API key": "生成 API 密钥", 
  "Regenerate": "重新生成", 
  "Revoke": "吊销", 
  "Expires": "过期时间", 
  "Never expires": "永不过期", 
  "Created by": "创建者", 
  "Last used": "上次使用", 
  "Token": "令牌", 
  "Secret key": "密钥", 
  "Copy key": "复制密钥", 
  "Show key": "显示密钥", 
  "Hide key": "隐藏密钥", 

  // ========== 会话消息类型 ========== 
  "User message": "用户消息", 
  "System message": "系统消息", 
  "Error message": "错误消息", 
  "Devin is thinking...": "Devin 正在思考...", 
  "Devin is working...": "Devin 正在工作...", 
  "Devin has completed the task": "Devin 已完成任务", 
  "Devin needs your input": "Devin 需要您的输入", 
  "Devin is waiting for approval": "Devin 正在等待批准", 

  // ========== 快照与构建 ========== 
  "Build": "构建", 
  "Builds": "构建", 
  "Building": "构建中", 
  "Build successful": "构建成功", 
  "Build failed": "构建失败", 
  "Build in progress": "构建进行中", 
  "Rebuild": "重新构建", 
  "Snapshot": "快照", 
  "Create snapshot": "创建快照", 
  "Restore snapshot": "恢复快照", 

  // ========== 技能与规则 ========== 
  "Skills": "技能", 
  "Rules": "规则", 
  "Create skill": "创建技能", 
  "Create rule": "创建规则", 
  "No skills found": "未找到技能", 
  "No rules found": "未找到规则", 
  "Scope": "作用域", // 优化：Scope 标准译法
  "Global": "全局", 
  "Repository-specific": "仓库级别", 
  "Enabled for": "启用于", 
  "All sessions": "所有会话", 

  // ========== DeepWiki ========== 
  "Generate wiki": "生成 Wiki", 
  "Regenerate wiki": "重新生成 Wiki", 
  "Wiki generated": "Wiki 已生成", 
  "Generating...": "生成中...", 
  "Open wiki": "打开 Wiki", 
  "View wiki": "查看 Wiki", 

  // ========== 时间相关 ========== 
  "Today": "今天", 
  "Yesterday": "昨天", 
  "Last week": "上周", 
  "Last month": "上个月", 
  "Last 7 days": "最近 7 天", 
  "Last 30 days": "最近 30 天", 
  "Last 90 days": "最近 90 天", 
  "All time": "所有时间", 
  "Just now": "刚刚", 
  "seconds ago": "秒前", 
  "a minute ago": "1 分钟前", 
  "an hour ago": "1 小时前", 
  "a day ago": "1 天前", 
  "a week ago": "1 周前", 

  // ========== 用户操作反馈 ========== 
  "Saved successfully": "保存成功", 
  "Updated successfully": "更新成功", 
  "Deleted successfully": "删除成功", 
  "Created successfully": "创建成功", 
  "Copied to clipboard!": "已复制到剪贴板！", 
  "Failed to save": "保存失败", 
  "Failed to delete": "删除失败", 
  "Failed to load": "加载失败", 
  "Connection error": "连接错误", 
  "Network error": "网络错误", 
  "Permission denied": "权限不足", 
  "Access denied": "访问被拒绝", 
  "Not found": "未找到", 
  "Page not found": "页面未找到", 
  "Session not found": "会话未找到", 
  "Invalid input": "输入无效", 
  "Required field": "必填字段", 
  "This field is required": "此字段为必填项", 

  // ========== 通用界面元素 ========== 
  "Drag to reorder": "拖拽以重新排序", 
  "Click to copy": "点击复制", 
  "Click to expand": "点击展开", 
  "Click to collapse": "点击收起", 
  "Toggle": "切换", 
  "Switch": "切换", 
  "Maximize": "最大化", 
  "Minimize": "最小化", 
  "Full screen": "全屏", 
  "Exit full screen": "退出全屏", 
  "Zoom in": "放大", 
  "Zoom out": "缩小", 
  "Scroll to top": "滚动到顶部", 
  "Scroll to bottom": "滚动到底部", 

  // ========== 安全与权限 ========== 
  "Security": "安全", 
  "Permissions": "权限", 
  "Access control": "访问控制", 
  "Two-factor authentication": "双因素认证", // 优化：比两步验证更专业
  "Enable 2FA": "启用 2FA", 
  "Disable 2FA": "关闭 2FA", 
  "Password": "密码", 
  "Change password": "修改密码", 
  "Current password": "当前密码", 
  "New password": "新密码", 
  "Confirm password": "确认密码", 

  // ========== 导出与分享 ========== 
  "Share session": "分享会话", 
  "Export session": "导出会话", 
  "Share with team": "与团队分享", 
  "Public link": "公开链接", 
  "Private": "私有", 
  "Public": "公开", 
  "Anyone with the link": "拥有链接的任何人", 
  "Only team members": "仅团队成员", 

  // ========== 其他功能 ========== 
  "Webhooks": "Webhooks", 
  "Teams": "团队", 
  "Invitations": "邀请", 
  "Profile": "个人资料", 
  "Account": "账户", 
  "Appearance": "外观", 
  "About": "关于", 
  "Terms of Service": "服务条款", 
  "Privacy Policy": "隐私政策", 
  "Contact us": "联系我们", 
  "Report a bug": "提交 Bug", // 优化：更符合开发者习惯
  "Request a feature": "需求反馈", // 优化：比请求功能更自然
  "Community": "社区", 

  // ========== 主页描述文案 ========== 
  "Devin is the AI software engineer built for teams. Devin autonomously plans, codes, tests, and ships.": "Devin 是专为团队打造的 AI 软件工程师。Devin 能够自主规划、编码、测试并交付。", 
  "Configure how Devin's environment is set up for your organization.": "配置 Devin 运行环境在您组织中的初始化方式。", 
  "Devin recalls relevant knowledge automatically during sessions. Learn more in our": "Devin 在会话期间会自动检索相关知识。在我们的", 
  "Reference a secret with a dollar sign, e.g.": "使用 $ 符号引用密钥，例如", 

  // ========== 用量与限额 ========== 
  "Limits": "限额", 
  "Current usage": "当前用量", 
  "Remaining": "剩余", 
  "Total": "总计", 
  "Used": "已使用", 
  "Available": "可用", 
  "Exceeded": "已超出", 
  "Unlimited": "无限制", 
  "Session limit": "会话限额", 
  "Concurrent sessions": "并发会话数", 
  "Max concurrent sessions": "最大并发会话数", 

  // ========== 通用设置页面 ========== 
  "Organization name": "组织名称", 
  "The name shown across Devin and in notifications": "在 Devin 和通知中显示的名称", 
  "Organization ID": "组织 ID", 
  "Your unique organization identifier for API usage": "用于 API 调用的唯一组织标识符", 
  "Data controls & privacy": "数据控制与隐私", 
  "Choose what Cognition is allowed to use for improving its products": "选择允许 Cognition 使用哪些数据来改进其产品", 
  "Share data for evaluation": "共享数据用于评估", 
  "Share session data to help us measure Devin's performance": "共享会话数据以帮助我们衡量 Devin 的表现", 
  "Share data for training": "共享数据用于模型训练", // 优化：明确是模型训练
  "Share session input and output to help us train and improve Devin": "共享会话输入和输出以帮助我们训练和改进 Devin", 

  // ========== 偏好设置详细页面 ========== 
  "Manage your personal preferences": "管理您的个人偏好设置", 
  "Picture": "头像", 
  "Set your profile picture": "设置您的个人头像", 
  "Set your display name": "设置您的显示名称", 
  "Email": "邮箱", 
  "Your account email": "您的账户邮箱", 
  "User ID": "用户 ID", 
  "Your unique user identifier for API usage": "用于 API 调用的唯一用户标识符", 
  "Display language": "显示语言", 
  "Select your preferred language for the UI": "选择您偏好的界面语言", 
  "Set your preferred in-app color theme": "设置您偏好的应用内颜色主题", 
  "In-app notifications": "应用内通知", 
  "Get notified in-app when a session needs your attention": "当会话需要您关注时在应用内通知您", 
  "Play sound with notifications": "通知时播放声音", 
  "Plays a sound when a session needs your attention": "当会话需要您关注时播放声音", 
  "Browser notifications": "浏览器通知", 
  "Receive desktop browser notifications when a session needs your attention": "当会话需要您关注时接收桌面浏览器通知", 
  "Enable": "启用", 
  "Receive a direct message when your sessions have updates": "当您的会话有更新时接收私信", 
  "Newsletter": "产品通讯", 
  "Receive product updates and announcements via email": "通过邮件接收产品更新和公告", 
  "Devin sessions": "Devin 会话", 
  "Git commit author": "Git 提交作者", 
  "Set a git author and committer for Devin's commits": "为 Devin 的提交设置 Git 作者和提交者", 
  "Devin only": "仅 Devin 署名", 
  "Co-authored (Devin + you)": "共同署名（Devin + 你）", 
  "Co-authored (you + Devin)": "共同署名（你 + Devin）", 
  "You only": "仅自己署名", 
  "You as author, Devin as committer": "作者：你；提交者：Devin", 
  "Devin as author, you as committer": "作者：Devin；提交者：你", 
  "Git commit email": "Git 提交邮箱", 
  "Set an email to use for git commits": "设置用于 Git 提交的邮箱", 
  "custom": "自定义", 
  "Custom email…": "自定义邮箱…", 
  "Enter custom email address": "请输入自定义邮箱地址", 
  "Open pull requests as drafts": "以草稿模式创建 PR", // 优化：更符合操作直觉
  "Devin will always create pull requests as drafts": "Devin 将始终以草稿形式创建 PR", 
  "Pre-approve testing": "预批准测试", 
  "Devin will test the app without asking for approval first": "Devin 将无需事先征求批准即进行应用测试", 
  "Auto-approve child sessions": "自动批准子会话", 
  "Devin will start child sessions without asking for approval first": "Devin 将无需事先征求批准即启动子会话", 
  "Review trigger": "审查触发条件", 
  "When will Devin review any of my new or updated pull requests": "Devin 何时审查我的新建或更新的 PR", 
  "Comment language": "评论语言", 
  "Language Devin Review uses when writing comments on your PRs": "Devin 审查在您的 PR 上写评论时使用的语言", 
  "Follow display language": "跟随显示语言", 
  "Only triggered manually": "仅手动触发", 
  "On PR creation only": "仅在创建 PR 时", 
  "Only triggered when a PR is first created": "仅在首次创建 PR 时触发", 
  "Auto review": "自动审查", 
  "Triggered on PR creation and new commits": "在创建 PR 和有新提交时触发", 

  // ========== Devin 设置页面 ========== 
  "Organization preferences and settings for Devin sessions": "Devin 会话的组织偏好和设置", 
  "Configure Devin's behavior in sessions": "配置 Devin 在会话中的行为", 
  "Enable native deployments": "启用原生部署", 
  "Allow Devin to deploy to the public internet with its built-in deployment tools": "允许 Devin 使用其内置部署工具部署到公网", 
  "Computer use": "桌面控制", // 优化：比“计算机使用”自然得多
  "Devin uses full computer use tools (mouse, keyboard, screen). When disabled, Devin uses legacy browser tools instead.": "Devin 使用完整的桌面控制工具（鼠标、键盘、屏幕）。禁用时，Devin 将使用旧版浏览器工具。", 
  "Session agents": "会话智能体", // 优化：代理 -> 智能体
  "Choose which agents are used in sessions": "选择会话中使用的智能体", 
  "Default agent": "默认智能体", 
  "Default agent for all new sessions in your organization": "组织中所有新会话的默认智能体", 
  "Default platform": "默认平台", 
  "Default platform for all new sessions in your organization": "组织中所有新会话的默认平台", 
  "Commands": "指令", // 优化：命令 -> 指令（在向AI输入的场景下更贴切）
  "Custom commands for the chat input. Type / to see available commands": "聊天输入框的自定义指令。输入 / 查看可用指令", 
  "Manage commands": "管理指令", 
  "Add Command": "添加指令", 
  "Request implementation of a change": "请求实现代码变更", 
  "Create a detailed plan before implementation": "在实现前创建详细计划", 
  "Review the changes for correctness and completeness": "审查代码变更的正确性和完整性", 
  "Test the changes thoroughly": "彻底测试代码变更", 
  "Request thorough analysis before proceeding": "在继续之前请求深入分析", 
  "Usage limits": "用量限额", 
  "Set limits for session creation and usage": "设置会话创建和使用的限额", 
  "Batch limit": "批量限额", 
  "Maximum sessions Devin can create per batch (1–500)": "Devin 每批次最多可创建的会话数（1–500）", 
  "Message usage limit": "消息用量限额", 
  "Maximum on-demand usage that Devin can use per message you send": "每条消息 Devin 可使用的最大按需用量", 
  "Pull requests": "Pull Requests (PR)", 
  "How Devin creates, manages, and responds to pull requests": "Devin 如何创建、管理和响应 PR", 
  "Share prompts in PRs": "在 PR 中分享提示词", 
  "Include the original prompt in PR descriptions": "在 PR 描述中包含原始提示词", 
  "Require @Devin to respond": "需要 @Devin 才能回复", 
  "Only respond to PR comments that directly mention @Devin": "仅回复直接提及 @Devin 的 PR 评论", 
  "Auto-add reviewer": "自动添加审查者", 
  "Add the session creator as a reviewer on Devin's PRs": "将会话创建者添加为 Devin PR 的审查者", 
  "Open PRs as": "以此身份创建 PR", 
  "Author identity for Devin-created PRs": "Devin 创建的 PR 的作者身份", 
  "Responding to bots": "响应机器人", 
  "Devin will respond to comments from these bots": "Devin 将回复这些机器人的评论", 
  "No bots": "无机器人", 

  // ========== Devin 审查设置页面 ========== 
  "Organization preferences and settings for Devin Review": "Devin 代码审查的组织偏好和设置", 
  "PR descriptions": "PR 描述", 
  "Adjust how Devin Review edits pull request descriptions": "调整 Devin 代码审查编辑 PR 描述的方式", 
  "Add \"Devin Review\" link in PR description": "在 PR 描述中添加\"Devin 代码审查\"链接", 
  "Includes a link to Devin Review in the pull request description": "在 PR 描述中包含 Devin 代码审查的链接", 
  "Security scan": "安全扫描", 
  "Run an additional security-focused analysis phase on each PR": "对每个 PR 运行额外的安全分析阶段", 
  "Enable security scan": "启用安全扫描", 
  "Detect vulnerabilities and security hardening opportunities": "检测漏洞和安全加固机会", 
  "Post as PR comments": "作为 PR 评论发布", 
  "Analyses from Devin Review can be posted as comments to git providers": "Devin 审查的分析结果可以作为评论发布到 Git 服务商", 
  "Bugs": "Bug", // 优化：缺陷 -> Bug
  "Likely errors or incorrect behavior in the code": "代码中可能的错误或不正确行为", 
  "Vulnerabilities and security hardening suggestions": "漏洞和安全加固建议", 
  "Flags (investigate)": "标记（需排查）", // 优化：调查 -> 排查
  "Potential issues worth a closer look before merging": "合并前值得仔细查看的潜在问题", 
  "Flags (note)": "标记（备注）", 
  "Informational observations that may not require action": "可能无需操作的信息性观察", 
  "Post GitHub CI checks": "发布 GitHub CI 检查", 
  "Creates a commit status check on the PR for each review": "为每次审查在 PR 上创建提交状态检查", 
  "Automatic review": "自动审查", 
  "Auto-review limits": "自动审查限额", 
  "Limit how much Devin Review spends on automatic reviews": "限制 Devin 代码审查在自动审查上的花费", 
  "Per-PR on-demand spend limit": "每个 PR 的按需花费限额", 
  "Skips future auto-reviews on a PR once its total on-demand spend hits this limit.": "当 PR 的总按需花费达到此限额时，跳过后续自动审查。", 
  "Add context to help Devin find bugs": "添加上下文以帮助 Devin 发现 Bug", 
  "Common file patterns": "常用文件模式", 
  "are read automatically": "会被自动读取", 
  "Prioritized by proximity to changed files.": "按与变更文件的接近程度排序。", 
  "Add repo": "添加仓库", 
  "No repositories configured": "未配置仓库", 
  "Click \"Add repo\" to add repositories": "点击\"添加仓库\"来添加仓库", 
  "Search repositories...": "搜索仓库...", 
  "All modes": "所有模式", 
  "Users": "用户", 

  // ========== 成员管理详细 ========== 
  "Single-seat plan": "单人席位方案", 
  "Your current plan supports only 1 member.": "您当前的方案仅支持 1 位成员。", 
  "Upgrade to the Teams plan": "升级到团队方案", 
  "to add more members.": "以添加更多成员。", 
  "Join requests": "加入请求", 
  "Search for a member": "搜索成员", 
  "Add member": "添加成员", 

  // ========== 环境设置补充 ========== 
  "personal settings": "个人设置", 

  // ========== 会话交互补充 ========== 
  "Approve all": "全部批准", 
  "Reject all": "全部拒绝", 
  "Show all": "显示全部", 
  "Hide all": "隐藏全部", 
  "Expand all": "全部展开", 
  "Collapse all": "全部收起", 
  "View source": "查看源码", 
  "Run again": "重新运行", 
  "Stop session": "停止会话", 
  "Archive session": "归档会话", 
  "Unarchive session": "取消归档会话", 
  "Delete session": "删除会话", 
  "New tab": "新标签页", 
  "Fullscreen": "全屏", 
  "Split view": "分屏视图", 

  // ========== 弹窗和对话框补充 ========== 
  "Confirm action": "确认操作", 
  "Cancel action": "取消操作", 
  "OK": "确定", 
  "Got it": "知道了", 
  "Dismiss all": "全部关闭", 
  "Don't show again": "不再显示", 
  "Remind me later": "稍后提醒", 
  "Learn more about": "了解更多关于", 
  "Optional": "可选", 
  "Required": "必填", 

  // ========== 连接页面详细 ========== 
  "Install": "安装", 
  "Installed": "已安装", 
  "Not installed": "未安装", 
  "Manage": "管理", 
  "Manage connection": "管理连接", 
  "Connection status": "连接状态", 
  "Last connected": "上次连接", 
  "Authorize": "授权", 
  "Reauthorize": "重新授权", 
  "Revoke access": "撤销访问", 
  "Grant access": "授予访问", 

  // ========== 方案与账单补充 ========== 
  "Manage plan": "管理方案", 
  "Change plan": "更改方案", 
  "View plans": "查看方案", 
  "Compare plans": "对比方案", 
  "Monthly billing": "月付", 
  "Annual billing": "年付", 
  "per month": "每月", 
  "per year": "每年", 
  "per seat": "每席位", 
  "Seats": "席位", 
  "Add seats": "增加席位", 
  "Remove seats": "减少席位", 

  // ========== 数据分析页面 ========== 
  "Session analytics": "会话数据统计", 
  "Total sessions": "总会话数", 
  "Active sessions": "活跃会话数", 
  "Completed sessions": "已完成会话数", 
  "Failed sessions": "失败会话数", 
  "Average duration": "平均时长", 
  "Success rate": "成功率", 
  "Time range": "时间范围", 
  "Last 24 hours": "最近 24 小时", 
  "Custom range": "自定义范围", 
  "Export data": "导出数据", 
  "Download CSV": "下载 CSV", 
  "Download PDF": "下载 PDF", 

  // ========== 主应用侧边栏 ========== 
  "Ask": "提问", 
  "Automations": "自动化", 
  "Wiki": "Wiki", 
  "Recent": "最近", 
  "No asks": "暂无提问", 
  "No automations": "暂无自动化", 
  "Exceeded limit": "超出限额", 

  // ========== 主页与新建会话 ========== 
  "You ran out of free credits. Please subscribe to continue using Devin": "您的免费额度已用完。请订阅以继续使用 Devin", 
  "Explore plans": "查看方案", 
  "Ask Devin to build features, fix bugs, or work on your code": "让 Devin 实现功能、修复 Bug 或处理您的代码", 
  "Upgrade plan": "升级方案", 
  "Advanced capabilities →": "高级功能 →", 
  "Advanced capabilities": "高级功能", 
  "Get started with Devin": "开始使用 Devin", 
  "Connect to Git": "连接到 Git", 
  "Select repositories": "选择仓库", 
  "Make your first session": "创建第一个会话", 
  "Validate in Devin Review": "在 Devin 代码审查中验证", 
  "Set up your wiki": "设置您的 Wiki", 
  "Ask Devin about your codebase": "向 Devin 提问代码库相关问题", 
  "Show advanced tips": "显示高级技巧", 
  "Hide advanced tips": "隐藏高级技巧", 
  "Inactive sessions": "非活跃会话", 
  
  // ========== ASK 界面 ========== 
  "What questions do you have?": "您有什么问题？", 
  "Ask Devin questions about your code": "向 Devin 提问代码相关问题", 
  "Auto": "自动", 
  "Try out Deep mode": "试用深度思考模式", // 优化：Deep mode -> 深度思考模式
  "Get more thorough answers with deeper reasoning": "通过更深入的推理获得更全面的回答", 
  "Tell Devin which repositories it should work with in your session": "告诉 Devin 本次会话要使用哪些仓库", 
  "Your repos": "我的仓库", 
  "Last indexed": "最新索引", 
  "Manage repositories": "管理仓库", 
  "Continue without repos": "无需仓库", 
  "Select repositories to use Ask Devin": "需选择仓库以询问Devin", 
  "Automatically select mode": "自动选择模式", 
  "Answer questions about codebase": "回答关于仓库的问题", 
  "Create actionable plans for tasks": "为任务创建可执行的计划", 
  "Deep mode": "深度思考模式", 
  "More thorough answers with deeper reasoning": "通过更深入的推理获得更全面的回答", 
  "Deep mode usage is billed. All other usage remains free.": "深度模式的使用需计费，其他使用保持免费。", 
  "Upload image": "上传图像", 
  "Add files, repos": "添加文件，仓库", 
  "How to use Ask Devin →": "如何使用 Ask Devin →", 
  "Subscribe to use Ask Devin →": "订阅以使用 Ask Devin →", 

  // ========== Automations 界面 ========== 
  "Fix lint errors whenever CI fails on a PR": "当 PR 的 CI 失败时自动修复 Lint 错误", 
  "Featured automations": "推荐自动化", 
  "View all examples": "查看所有示例", 
  "Triage Bug Reports on Slack": "在 Slack 上分流 Bug 报告", 
  "CI Failure Fixer": "CI 失败修复器", 
  "Triage Devins": "分流 Devin 任务", 
  "Create automation": "创建自动化", 
  "No automations yet": "暂无自动化", 

  // ========== 模型选择弹窗 ========== 
  "Fast and good at long-horizon planning": "快速且擅长长周期任务规划", 
  "Ultra": "Ultra", 
  "Our most powerful and hardest thinking agent, significantly more expensive": "我们最强大的深度思考智能体，调用成本显著增加", 
  "Fast Mode": "Fast", 
  "2.5x faster, 2x more expensive, same intelligence": "速度快 2.5 倍，成本增加 2 倍，能力保持一致", 
  "Tuned for smaller, well-defined tasks. 60% cheaper": "适用于规模较小、目标明确的任务，成本比标准版低 60%。", 
  "OpenAI's most capable model": "OpenAI 最强大的模型", 
  "Good at instruction following": "擅长遵循指令", 
  "Capability": "能力", 
  "Higher capability means more powerful models but higher costs": "能力越高，模型越强大，但成本也越高。", 
  "Introducing Devin Fusion": "向您介绍 Devin Fusion", 
  "A frontier model and a fast sidekick, working as one — top quality, lower cost.": "顶尖模型与快速模型协同运行——带来顶级质量，并大幅降低成本。", 
  "Try now": "立即体验", 
  "Best balance of capability, speed, and cost": "质量、速度与成本的最佳选择。", 

  // ========== 加号弹窗 ========== 
  "Add files, repos, macros": "添加文件、仓库、宏", 
  "Send secrets": "发送密钥", 
  "All repositories added to Devin's machine": "已添加到 Devin 运行环境的所有仓库", 
  "All indexed files": "所有已索引的文件", 
  "Available skills from repos": "仓库提供的可用技能", 
  "Devin Sessions": "Devin 会话", 
  "Mention other Devin sessions": "引用其他 Devin 会话", 
  "Macros from Knowledge": "来自知识库的宏", 
  "Upload attachment": "上传附件", 
  "Codebase files": "代码库文件", 

  // ========== 三个点弹窗 ========== 
  "Manage MCP connectors": "管理 MCP 连接器", 
  "Improve prompt": "优化提示词", 
  "Schedule Devin": "预约 Devin", 
  "Copy prompt as link": "复制提示词为链接", 
  "Record voice prompt": "录制语音提示", 
  "Use Imperative Environment": "使用命令式环境", 
  "Legacy": "旧版", 
  "More options": "更多设置", 
  "Virtual environment": "虚拟环境", 
  "Notable repositories": "仓库", 

  // ========== 侧边栏三点菜单 ========== 
  "Created time": "创建时间", 
  "Last updated": "最后更新", 
  "View all sessions": "查看所有会话", 
  "Archive all sessions": "归档所有会话", 

  // ========== 会话详情页 ========== 
  "Worklog": "执行日志", // 优化：工作日志 -> 执行日志
  "Understand Devin's history and actions": "查看 Devin 的历史操作", // 优化：工作日志 -> 执行日志
  "Changes": "代码变更", // 优化：明确是代码变更
  "See Devin's file edits": "查看 Devin 的文件编辑记录", 
  "Watch and control Devin's Desktop": "观察和控制 Devin 的桌面环境", 
  "View Devin's command history": "查看 Devin 的命令行历史记录", 
  "Wake up Devin to use the IDE": "唤醒 Devin 以使用 IDE", 
  "View child sessions started by this session": "查看此会话启动的子会话", 
  "Full control of Devin's machine": "进入网页端 Vscode", 
  "Discussion": "讨论",
  "Devin went to sleep": "Devin 进入休眠", 
  "Send a message to resume": "发送消息以继续工作", 
  "Wake up to see live": "唤醒以查看实时状态", 
  "High server load. Devin is waiting for capacity...": "服务器负载较高，Devin 正在等待可用资源……", 
  "Live": "实时", 
  "Executed": "已执行", 
  "Thinking": "思考中", 

  // ========== Wiki 页面 ========== 
  "Are you sure you want to put Devin to sleep?": "你确定要让 Devin 休眠吗？", 
  "Put to sleep": "休眠", 
  "Devin is currently working on your task. Putting Devin to sleep will interrupt this work. You can wake Devin up later by sending a new message.": "devin 正在处理你的任务。让 devin 休眠会打断这项工作。你可以稍后通过发新消息来唤醒 Devin。", 
  
  // ========== Wiki 页面 ========== 
  
  "Generate": "生成", 
  "Search repositories": "搜索仓库", 

  // ========== 会话筛选补充 ========== 
  "Status is": "状态为", 

  // ========== 更多通用界面文案 ========== 
  "Subscribe": "订阅", 
  "Subscription": "订阅", 
  "Start free trial": "开始免费试用", 
  "Free trial": "免费试用", 
  "Credits": "额度", 
  "On-demand": "按需", 
  "On-demand usage": "按需用量", 
  "Included": "已包含", 
  "Copy ID": "复制 ID", 
  "Copied": "已复制", 
  "Attach": "附加", 
  "Attachment": "附件", 
  "Voice": "语音", 
  "Macro": "宏", 
  "Macros": "宏", 
  "Connector": "连接器", 
  "Connectors": "连接器", 
  "MCP": "MCP", 
  "Integration": "集成", 
  "Integrations": "集成", 
  "Prompt": "提示词", 
  "Prompts": "提示词", 
  "Template": "模板", 
  "Templates": "模板", 
  "Example": "示例", 
  "Examples": "示例", 
  "Featured": "推荐", 
  "Popular": "热门", 
  "Recommended": "推荐", 

  // ========== 会话内工具调用 ========== 
  "Tool calls": "工具调用", 
  "Tool call": "工具调用", 
  "Running tool": "运行工具中", 
  "Shell command": "Shell 命令", 
  "File edit": "文件编辑", 
  "File read": "文件读取", 
  "Browser action": "浏览器操作", 
  "Code search": "代码搜索", 
  "Web search": "网页搜索", 
  "Devin ran a shell command": "Devin 执行了 Shell 命令", 
  "Devin edited a file": "Devin 编辑了文件", 
  "Devin read a file": "Devin 读取了文件", 
  "Devin searched the codebase": "Devin 搜索了代码库", 
  "Devin browsed the web": "Devin 浏览了网页", 
  "Devin used the browser": "Devin 使用了浏览器", 
  "Devin created a PR": "Devin 创建了 PR", 
  "Devin pushed code": "Devin 推送了代码", 
  "View output": "查看输出", 
  "Hide output": "隐藏输出", 
  "Show output": "显示输出", 
  "Collapse output": "折叠输出", 
  "Expand output": "展开输出", 

  // ========== 会话底部操作栏 ========== 
  "Type / for commands": "输入 / 查看指令", 
  "Attach file": "附加文件", 
  "Add context": "添加上下文", 
  "Send message": "发送消息", 

  // ========== 更多弹窗/对话框 ========== 
  "Are you sure you want to archive this session?": "确定要归档此会话吗？", 
  "Are you sure you want to delete this session?": "确定要删除此会话吗？", 
  "This will permanently delete the session and all its data.": "这将永久删除该会话及其所有数据。", 
  "Session archived": "会话已归档", 
  "Session unarchived": "会话已取消归档", 
  "Session deleted": "会话已删除", 

  // ========== 排序和筛选补充 ========== 
  "Group by": "分组方式", 
  "Order": "顺序", 
  "Ascending": "升序", 
  "Descending": "降序", 

  // ========== ASK 界面补充 ========== 
  "to add a new line": "换行", 
  "Select repository": "选择仓库", 
  "Add repositories to use Ask Devin": "添加仓库以使用 Ask Devin", 
  "Drop files to share with Devin": "拖放文件以与 Devin 共享", 
  "Show more breadcrumbs": "显示更多导航", 

  // ========== Automations 描述 ========== 
  "Monitors a Slack channel for bug reports \u2014 when one comes in, Devin triages it, investigates the root cause and replies in the thread with findings": "监控 Slack 频道的 Bug 报告 \u2014 当收到报告时，Devin 会进行分流、排查根因并在回复线程中提供发现", 
  "Automatically fix failing CI checks on non-Devin PRs. Devin reads the build logs, identifies the root cause, pushes a fix, and verifies it passes.": "自动修复非 Devin PR 上失败的 CI 检查。Devin 读取构建日志、定位根因、推送修复并验证通过。", 
  "When someone comments /devin on a GitHub issue, Devin reads the issue, investigates the codebase, and opens a fix PR \u2014 turning any issue into an actionable code change.": "当有人在 GitHub Issue 上评论 /devin 时，Devin 读取 Issue、排查代码库并创建修复 PR \u2014 将任何 Issue 转为可执行的代码变更。", 

  // ========== Wiki 页面补充 ========== 
  "Refetch repositories": "重新获取仓库", 
  "Filter repositories": "筛选仓库", 

  // ========== 连接设置页面 ========== 
  "Connect your personal accounts to use integrations and MCPs established by your team members.": "连接您的个人账户以使用团队成员建立的集成和 MCP。", 
  "Link Devin Desktop with this account": "将 Devin 桌面版与此账户关联", 
  "Log in to Devin Desktop": "登录 Devin 桌面版", 
  "Connect your personal accounts to use team-enabled integrations": "连接您的个人账户以使用团队启用的集成", 
  "Unlink user": "取消关联用户", 
  "Missing an integration?": "缺少集成？", 
  "Connect your personal accounts to use team-enabled MCPs": "连接您的个人账户以使用团队启用的 MCP", 
  "No MCPs": "暂无 MCP", 
  "Missing an MCP?": "缺少 MCP？", 
  "Connect external services and tools to your organization in Devin.": "在 Devin 中将外部服务和工具连接到您的组织。", 
  "MCP servers": "MCP 服务器", 
  "Git providers": "Git 服务商", // 优化：提供商 -> 服务商
  "Try Devin on your codebase": "让 Devin 连接到您的仓库", 
  "Communication": "通讯", 
  "Tag @Devin in your team workspaces": "在团队工作区中 @Devin", 
  "Task management": "任务管理", 
  "Turn tickets into pull requests": "将工单转为 PR", 

  // ========== 会话列表补充 ========== 
  "Select all sessions": "选择所有会话", 
  "Select all inactive sessions": "选择所有非活跃会话", 

  // ========== 方案/计费页面 ========== 
  "Manage your subscription plan": "管理您的订阅方案", 
  "Individual plans": "个人方案", 
  "Includes:": "包含：", 
  "Limited Devin usage": "有限的 Devin 用量", 
  "Everything in Free, plus:": "Free 方案的所有内容，另加：", 
  "Devin usage quota": "Devin 用量配额", 
  "IDE usage quota": "IDE 用量配额", 
  "Pay-as-you-go for usage past quota": "超出配额的用量按需计费", 
  "Slack, Linear, and MCP integrations": "Slack、Linear 和 MCP 集成", 
  "Use Devin to plan, code, test, and ship": "使用 Devin 规划、编码、测试和发布", 
  "Purchase": "购买", 
  "Everything in Pro, plus:": "Pro 方案的所有内容，另加：", 
  "Increased Devin usage quota": "更多 Devin 用量配额", 
  "Business plans": "企业方案", 
  "Unlimited team members": "无限团队成员", 
  "Share and collaborate": "分享与协作", 
  "Centralized billing": "集中计费", 
  "Admin dashboard with analytics": "带分析功能的管理仪表板", 
  "Custom pricing": "定制报价", // 优化：自定义定价 -> 定制报价
  "Everything in Teams, plus:": "Teams 方案的所有内容，另加：", 
  "Access to Devin Enterprise": "访问 Devin 企业版", 
  "SAML/OIDC SSO": "SAML/OIDC 单点登录", 
  "Centralized enterprise admin controls": "集中式企业管理控制", 
  "Dedicated account team": "专属客户团队", 
  "Contact sales": "联系销售", 
  "per user": "每用户", 
  "Billed annually": "按年计费", 
  "Billed monthly": "按月计费", 

  // ========== 发票页面 ========== 
  "You don't have any invoices yet.": "您还没有任何发票。", 

  // ========== 用量页面 ========== 
  "Usage & Limits": "用量与限制", 
  "Overview": "概览", 
  "Reviews": "代码审查", 
  "Remaining balance": "剩余额度", 
  "No on-demand balance remaining. Sessions will pause when your included quota is exceeded.": "无剩余按需额度。当您的包含配额用完时，会话将暂停。", 
  "Usage this billing period": "本计费周期用量", 

  // ========== 审查设置补充 ========== 
  "No limit": "无限制", 
  "PRs are reviewed automatically when they match an enrolled repository or user. When both are configured, the most permissive trigger mode applies. Users can self-enroll in": "当 PR 匹配已注册的仓库或用户时自动审查。当两者都配置时，使用最宽松的触发模式。用户可以在以下文件中自行注册", 

  // ========== DeepWiki 设置 ========== 
  "Choose how DeepWiki generates and displays content for your organization": "选择 DeepWiki 如何为您的组织生成和显示内容", 
  "Generation": "生成", 
  "Configure how DeepWiki indexes your repository source code for Wiki and Ask Devin": "配置 DeepWiki 如何索引您的仓库源代码用于 Wiki 和 提问", 
  "Effort": "算力投入", // 优化：Effort 译为算力投入
  "Higher effort generates better quality at greater cost": "更高的算力投入会产生更好的质量但成本更高", 
  "Fast and lightweight (free)": "快速且轻量化（免费）", 
  "Balances speed and quality ($10-$20)": "速度与质量的平衡（10-20美元）", 
  "More detailed, higher quality wiki ($40-$80)": "更详细、更高质量（40-80美元）", 
  "Talk to the team to find out more": "与团队联系以了解更多信息", 
  "How often wikis are regenerated to reflect code changes": "Wiki 多久重新生成一次以反映代码变更", 
  "Languages": "语言", 
  "Configure language settings": "配置语言设置", 
  "Selected languages": "已选语言", 
  "Choose which languages DeepWiki content is generated in": "选择 DeepWiki 内容生成的语言", 
  "Choose repositories to index for DeepWiki and Ask Devin": "选择需要生成 Wiki 的仓库", 

  // ========== 定时任务页面 ========== 
  "No scheduled tasks yet": "暂无定时任务", 
  "Create a schedule": "创建定时任务", 
  "Schedule a recurring Devin session": "定时执行 Devin 会话", 

  // ========== 技能与规则页面 ========== 
  "Configure skills and rules for Devin": "配置 Devin 的技能和规则", 
  "No skills configured": "未配置技能", 
  "No rules configured": "未配置规则", 

  // ========== 环境设置页面 ========== 
  "Environment setup for Devin sessions": "Devin 会话的运行环境配置", 
  "Blueprint": "环境蓝图", 
  "Build status": "构建状态", 
  "Last built": "上次构建", 
  "View build logs": "查看构建日志", 

  // ========== 知识库页面 ========== 
  "Knowledge base": "知识库", 
  "Manage knowledge for Devin": "管理 Devin 的知识", 
  "No knowledge items": "暂无知识条目", 

  // ========== Devin API 页面 ========== 
  "API keys": "API 密钥", 
  "Organization ID": "组织 ID", 
  "Service users": "服务用户", 
  "API keys (legacy)": "API密钥（旧版）", 
  "Search for a service user": "搜索服务用户", 
  "All roles": "所有角色", 
  "Provision service user": "配置服务角色", 
  "No service users yet": "目前还没有服务用户", 
  "Provision a service user to see them listed here.": "设置服务用户以查看此处的列表。", 
  "Role name": "角色名称", 
  "Provision": "创建", 
  "organization": "组织级", 
  "service user": "服务用户", 
  "Create an organization-level service user. The service user will need to be assigned appropriate roles within the selected organization.": "创建一个组织级服务用户，并为其分配所选组织内的相应角色。", 
  "Create API key": "创建 API 密钥", 
  "Display name": "显示名称", 
  "Organization role": "组织角色", 
  "Expiration": "有效期", 
  "Please enter a display name to continue": "请输入显示名称以继续", 
  "Please select a role to continue": "请选择一个角色以继续", 
  "Enter display name ": "输入名称", 
  "No API keys": "暂无 API 密钥", 
  "Generate a new API key": "生成新的 API 密钥", 
  "Never used": "从未使用", 

  // ========== 数据分析页面 ========== 
  "Analytics overview": "数据统计概览", 
  "Sessions created": "已创建会话", 
  "PRs created": "已创建 PR", 
  "PRs merged": "已合并 PR", 
  "Total time saved": "节省总时间", 

  // ========== 通用补充 ========== 
  "Read more": "阅读更多", 
  "See more": "查看更多", 
  "See all": "查看全部", 
  "View more": "查看更多", 
  "Load more": "加载更多", 
  "Finish": "完成", 
  "Discard": "放弃", 
  "Inactive": "非活跃", 
  "Deprecated": "已弃用", 
  "Beta": "测试版", 
  "Experimental": "实验性", 
  "Coming soon": "即将推出", 
  "Not available": "不可用", 
  "No results": "无结果", 
  "No data": "暂无数据", 
  "Saving...": "保存中...", 
  "Updating...": "更新中...", 
  "Processing...": "处理中...", 
  "Connecting...": "连接中...", 
  "Uploading...": "上传中...", 
  "Downloading...": "下载中...", 

  // ========== 方案页面补充 ========== 
  "Increased": "更多", 
  "Devin Desktop IDE usage quota": "Devin 桌面版 IDE 用量配额", 
  "Increased Devin Desktop IDE usage quota": "更多 Devin 桌面版 IDE 用量配额", 

  // ========== 组织连接设置页面 ========== 
  "Connect integrations to your organization": "连接集成到您的组织", 

  // ========== DeepWiki 设置补充 ========== 
  "Indexing": "索引", 
  "Standard": "标准", 
  "Thorough": "深入", 
  "Comprehensive": "全面", 

  // ========== 更多设置文案 ========== 
  // ========== 会话右键/三点菜单 ========== 
  "Edit tags": "编辑标签", 
  "Copy session ID": "复制会话 ID", 
  "Update network config": "更新网络配置", 
  "Hide from team": "对团队隐藏", 
  "Create playbook from session": "从会话创建自动化剧本", 
  "Analyze session": "分析会话", 
  "Reboot session": "重启会话", 
  "Terminate session": "强制终止会话", // 优化：明确强制
  "Focus mode": "专注模式", 
  "Knowledge suggestions": "知识建议", 
  "Session usage limits": "会话用量限制", 
  "Give feedback": "提供反馈", 
  "View session insights": "查看会话洞察", 
  "User messages": "用户消息", 
  "Session size": "会话大小", 
  "Category": "类别", 
  "Feature development": "功能开发", 
  "Bug fix": "Bug 修复", 
  "Refactoring": "重构", 
  "Testing": "测试", 
  "Put Devin to sleep": "休眠", 
  "Pin session": "固定会话", 
  "Unpin session": "取消固定会话", 

  // ========== 会话状态消息 ========== 
  "Devin is running into issues": "Devin 遇到了问题", 
  "Usage quota exceeded": "用量配额已超出", 
  "Your usage quota has been exceeded and you are out of on-demand usage. Check your usage settings for details.": "您的用量配额已超出且按需用量已耗尽。请检查用量设置了解详情。", 
  "View usage settings": "查看用量设置", 
  "Devin went to sleep because your usage quota has been exceeded and you are out of on-demand usage": "Devin 进入休眠，因为您的用量配额已超出且按需用量已耗尽", 
  "no write access": "无写入权限", 

  // ========== GitHub 连接设置页面 ========== 
  "Back to connections": "返回连接", 
  "Put Devin to work. Your repositories, supercharged.": "让 Devin 工作。您的仓库，超级加速。", 
  "Integrate Devin with GitHub": "将 Devin 与 GitHub 连接", 
  "Delete GitHub connection": "断开 Github 连接", 
  "Connect GitHub Organization": "连接 Github 组织", 
  "You successfully connected GitHub. Start getting work done with Devin.": "你成功连接了 GitHub。开始和 Devin 一起工作吧。", 
  "Add or remove repositories": "添加或移除仓库", 
  "Add connection": "添加连接", 
  "Support": "支持", 
  "Create a new organization?": "创建新组织？", 
  "We suggest keeping GitHub connections in separate organizations to cleanly manage membership and permissions.": "我们建议将 GitHub 连接保持在不同的组织中，以便清晰地管理成员和权限。", 
  "Add to this organization": "添加到此组织", 
  "Create new organization": "创建新组织", 
  "Allow members of your connected GitHub organizations to join without waiting for approval": "允许已连接 GitHub 组织的成员无需等待审批即可加入", 
  "Configure PR author": "配置 PR 作者", 
  "Installed on": "已安装于", 
  "repositories": "个仓库", 

  // ========== 会话工作时间 ========== 
  "on-demand": "按需", 
  "on-demand usage": "按需用量", 
  "out of on-demand usage": "按需用量已耗尽", 

  // ========== GitHub 连接页补充 ========== 
  "Devin in GitHub": "GitHub 中的 Devin", 
  "Learn how Devin can interact with your GitHub repositories": "了解 Devin 如何与您的 GitHub 仓库交互", 
  "Allow teammates to auto-join workspace": "允许队友自动加入工作区", 

  // ========== 会话筛选器标签 ========== 
  "Creator": "创建者", 
  "Archived Status": "归档状态", 
  "Updated date": "更新日期", 
  "Created date": "创建日期", 
  "After": "之后", 
  "Before": "之前", 
  "Not archived": "未归档", 

  // ========== 更多会话页面文案 ========== 
  "Work log": "执行日志", 
  "Wake to see live status": "唤醒以查看实时状态", 
  "Let Devin build features, fix bugs, or handle your code": "让 Devin 实现功能、修复 Bug 或处理您的代码", 
  "Your free quota has been used up. Please subscribe to continue using Devin": "您的免费额度已用完。请订阅以继续使用 Devin", 

  // ========== 筛选器连接词 ========== 
  "is": "为", 
  "is not": "不为", 
  "contains": "包含", 
  "does not contain": "不包含", 

  // ========== 会话工作日志（静态） ========== 
  "Stopped working": "已停止工作", 
  "Test the webapp": "测试 Web 应用", 
  "Pre-approve testing for future sessions": "预批准未来会话的测试", 
  "Devin's execution plan": "Devin 的执行计划", 
  "Report results": "报告结果", 
  "Create PRs for both repos": "为两个仓库创建 PR", 
  "Wait for CI and verify checks pass": "等待 CI 并验证检查通过", 
  "Wait for CI to pass": "等待 CI 通过", 
  "Verify checks pass": "验证检查通过", 
  "ignored": "已忽略", 
  "Started working": "开始工作", 
  "Resumed working": "恢复工作", 
  "Waiting for user": "等待用户", 
  "Devin is thinking": "Devin 正在思考", 
  "Devin is working": "Devin 正在工作", 
  "Running command": "正在运行命令", 
  "Editing file": "正在编辑文件", 
  "Reading file": "正在读取文件", 
  "Searching": "正在搜索", 
  "Browsing": "正在浏览", 
  "Planning": "正在规划", 
  "Test the app": "测试应用", 
  "Run an eval": "运行评估", 
  "Repro the bug": "复现 Bug", 
  "Create PRs": "创建 PR", 
  "Create PR": "创建 PR", 
  "Wait for CI": "等待 CI", 
  "Make changes": "进行修改", // 优化：更改 -> 修改（代码）
  "Make frontend changes": "进行前端修改", 
  "Make backend changes": "进行后端修改", 
  "Investigate": "排查", // 优化：调查 -> 排查
  "Implement": "实现", 
  "Fix": "修复", 
  "Research": "调研", // 优化：研究 -> 调研
  "Analyze": "分析" 
  
  // ========== 杂项 ========== 
  ,"Organization preferences and settings": "组织偏好与设置",
  "Products": "产品",
  "Configure core products and features": "配置核心功能",
  "Resources": "资源",
  "Configure Devin's resources": "配置 Devin 的资源",
  "Administration": "管理",
  "Manage access, infrastructure, and analytics": "管理接入、基础设施和分析"
}; 

// eslint-disable-next-line no-unused-vars 
const REGEX_RULES = [ 
  // 会话数量 
  { pattern: /^(\d+)\s+sessions?$/i, replacement: "$1 个会话" }, 
  // 成员数量 
  { pattern: /^(\d+)\s+members?$/i, replacement: "$1 位成员" }, 
  // 仓库数量 
  { pattern: /^(\d+)\s+repositor(y|ies)$/i, replacement: "$1 个仓库" }, 
  // 文件数量 
  { pattern: /^(\d+)\s+files?$/i, replacement: "$1 个文件" }, 
  // 任务数量 
  { pattern: /^(\d+)\s+tasks?$/i, replacement: "$1 个任务" }, 
  // 结果数量 
  { pattern: /^(\d+)\s+results?$/i, replacement: "$1 个结果" }, 
  // 项目数量 
  { pattern: /^(\d+)\s+items?$/i, replacement: "$1 个项目" }, 
  // 变更数量 
  { pattern: /^(\d+)\s+changes?$/i, replacement: "$1 个变更" }, 
  // 通知数量 
  { pattern: /^(\d+)\s+notifications?$/i, replacement: "$1 条通知" }, 
  // 评论数量 
  { pattern: /^(\d+)\s+comments?$/i, replacement: "$1 条评论" }, 
  // "Created X minutes/hours/days ago" → 完全汉化时间 
  { pattern: /^Created\s+(\d+)\s+seconds?\s+ago$/i, replacement: "创建于 $1 秒前" }, 
  { pattern: /^Created\s+(\d+)\s+minutes?\s+ago$/i, replacement: "创建于 $1 分钟前" }, 
  { pattern: /^Created\s+(\d+)\s+hours?\s+ago$/i, replacement: "创建于 $1 小时前" }, 
  { pattern: /^Created\s+(\d+)\s+days?\s+ago$/i, replacement: "创建于 $1 天前" }, 
  { pattern: /^Created\s+(\d+)\s+weeks?\s+ago$/i, replacement: "创建于 $1 周前" }, 
  { pattern: /^Created\s+(\d+)\s+months?\s+ago$/i, replacement: "创建于 $1 个月前" }, 
  { pattern: /^Created\s+(\d+)\s+years?\s+ago$/i, replacement: "创建于 $1 年前" }, 
  // "Updated X minutes/hours/days ago" → 完全汉化时间 
  { pattern: /^Updated\s+(\d+)\s+seconds?\s+ago$/i, replacement: "更新于 $1 秒前" }, 
  { pattern: /^Updated\s+(\d+)\s+minutes?\s+ago$/i, replacement: "更新于 $1 分钟前" }, 
  { pattern: /^Updated\s+(\d+)\s+hours?\s+ago$/i, replacement: "更新于 $1 小时前" }, 
  { pattern: /^Updated\s+(\d+)\s+days?\s+ago$/i, replacement: "更新于 $1 天前" }, 
  { pattern: /^Updated\s+(\d+)\s+weeks?\s+ago$/i, replacement: "更新于 $1 周前" }, 
  { pattern: /^Updated\s+(\d+)\s+months?\s+ago$/i, replacement: "更新于 $1 个月前" }, 
  { pattern: /^Updated\s+(\d+)\s+years?\s+ago$/i, replacement: "更新于 $1 年前" }, 
  // "Last active X ago" → 完全汉化时间 
  { pattern: /^Last active\s+(\d+)\s+seconds?\s+ago$/i, replacement: "上次活跃于 $1 秒前" }, 
  { pattern: /^Last active\s+(\d+)\s+minutes?\s+ago$/i, replacement: "上次活跃于 $1 分钟前" }, 
  { pattern: /^Last active\s+(\d+)\s+hours?\s+ago$/i, replacement: "上次活跃于 $1 小时前" }, 
  { pattern: /^Last active\s+(\d+)\s+days?\s+ago$/i, replacement: "上次活跃于 $1 天前" }, 
  { pattern: /^Last active\s+(\d+)\s+weeks?\s+ago$/i, replacement: "上次活跃于 $1 周前" }, 
  { pattern: /^Last active\s+(\d+)\s+months?\s+ago$/i, replacement: "上次活跃于 $1 个月前" }, 
  { pattern: /^Last active\s+(\d+)\s+years?\s+ago$/i, replacement: "上次活跃于 $1 年前" }, 
  // "Worked for X min" → "工作了 X 分钟" 
  { pattern: /^Worked for\s+(\d+)\s+min$/i, replacement: "工作了 $1 分钟" }, 
  // "Worked for X hr" → "工作了 X 小时" 
  { pattern: /^Worked for\s+(\d+)\s+hr$/i, replacement: "工作了 $1 小时" }, 
  // X seconds ago 
  { pattern: /^(\d+)\s+seconds?\s+ago$/i, replacement: "$1 秒前" }, 
  // X minutes ago 
  { pattern: /^(\d+)\s+minutes?\s+ago$/i, replacement: "$1 分钟前" }, 
  // X hours ago 
  { pattern: /^(\d+)\s+hours?\s+ago$/i, replacement: "$1 小时前" }, 
  // X days ago 
  { pattern: /^(\d+)\s+days?\s+ago$/i, replacement: "$1 天前" }, 
  // X weeks ago 
  { pattern: /^(\d+)\s+weeks?\s+ago$/i, replacement: "$1 周前" }, 
  // X months ago 
  { pattern: /^(\d+)\s+months?\s+ago$/i, replacement: "$1 个月前" }, 
  // X years ago 
  { pattern: /^(\d+)\s+years?\s+ago$/i, replacement: "$1 年前" }, 
  // "in X minutes" 
  { pattern: /^in\s+(\d+)\s+minutes?$/i, replacement: "$1 分钟后" }, 
  // "in X hours" 
  { pattern: /^in\s+(\d+)\s+hours?$/i, replacement: "$1 小时后" }, 
  // "in X days" 
  { pattern: /^in\s+(\d+)\s+days?$/i, replacement: "$1 天后" }, 
  // "Showing X of Y" → "显示 X / Y" 
  { pattern: /^Showing\s+(\d+)\s+of\s+(\d+)$/i, replacement: "显示 $1 / $2" }, 
  // "Page X of Y" → "第 X / Y 页" 
  { pattern: /^Page\s+(\d+)\s+of\s+(\d+)$/i, replacement: "第 $1 / $2 页" }, 
  // "X more" → "还有 X 个" 
  { pattern: /^(\d+)\s+more$/i, replacement: "还有 $1 个" }, 
  // "Search X added repositories..." → "搜索 X 个已添加的仓库..." 
  { pattern: /^Search\s+(\d+)\s+added\s+repositories\.\.\.$/i, replacement: "搜索 $1 个已添加的仓库..." }, 
  // "Editing X" → "正在编辑 X" 
  { pattern: /^Editing\s+(.+)$/i, replacement: "正在编辑 $1" }, 
  // "After Mon DD" → 保持时间格式不变 
  { pattern: /^After\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d+)$/i, replacement: "$1 $2 之后" }, 
  // "Before Mon DD" 
  { pattern: /^Before\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d+)$/i, replacement: "$1 $2 之前" }, 
  // "Thought for Xs" → "思考了 X 秒" 
  { pattern: /^Thought for\s+(\d+)s$/i, replacement: "思考了 $1 秒" }, 
  // "Thought for Xm" → "思考了 X 分钟" 
  { pattern: /^Thought for\s+(\d+)m$/i, replacement: "思考了 $1 分钟" }, 
  // "Thought for X min" → "思考了 X 分钟" 
  { pattern: /^Thought for\s+(\d+)\s*min$/i, replacement: "思考了 $1 分钟" }, 
  // "X of Y" 进度 → "X / Y" 
  { pattern: /^(\d+)\s+of\s+(\d+)$/i, replacement: "$1 / $2" }, 
  // "Powered by X" → "由 X 驱动" 
  { pattern: /^Powered by\s+(.+)$/i, replacement: "由 $1 提供支持" }, // 优化：提供支持比驱动更自然
  // "Inactive sessions (X)" → "非活跃会话 (X)" 
  { pattern: /^Inactive sessions\s*\((\d+)\)$/i, replacement: "非活跃会话 ($1)" }, 
  // "Earned $X" → "赚取 $X" 
  { pattern: /^Earned\s+\$(\d+)$/i, replacement: "赚取 $$$1" }, 
  // "$X/month" → "$X/月" 
  { pattern: /^\$(\d+)\/month$/i, replacement: "$$$1/月" }, 
  // "$X/year" → "$X/年" 
  { pattern: /^\$(\d+)\/year$/i, replacement: "$$$1/年" }, 
  // "$X per month" → "$X 每月" 
  { pattern: /^\$(\d+)\s+per\s+month$/i, replacement: "$$$1 每月" }, 
  // "Notifications alt+T" → "通知 alt+T" 
  { pattern: /^Notifications\s+alt\+T$/i, replacement: "通知 alt+T" }, 
  // "X ACUs" → "X ACU" 
  { pattern: /^(\d+[\d,]*)\s+ACUs?$/i, replacement: "$1 ACU" }, 
  // "X sessions" → "X 个会话" 
  { pattern: /^(\d+)\s+sessions$/i, replacement: "$1 个会话" }, 
  // "Select X" → "选择 X" 
  { pattern: /^Select\s+(\d+)$/i, replacement: "选择 $1" }, 
  // "X selected" → "已选择 X 个" 
  { pattern: /^(\d+)\s+selected$/i, replacement: "已选择 $1 个" }, 
  // "Worked for Xm Ys" → "工作了 X分 Y秒" 
  { pattern: /^Worked for\s+(\d+)m\s+(\d+)s$/i, replacement: "工作了 $1分 $2秒" }, 
  // "Worked for Xs" → "工作了 X秒" 
  { pattern: /^Worked for\s+(\d+)s$/i, replacement: "工作了 $1秒" }, 
  // "Worked for Xh Ym" → "工作了 X小时 Y分钟" 
  { pattern: /^Worked for\s+(\d+)h\s+(\d+)m$/i, replacement: "工作了 $1小时 $2分钟" }, 
  // "Push to X denied (403, no write access)" → "推送到 X 被拒绝（403，无写入权限）" 
  { pattern: /^Push to\s+(.+)\s+denied\s*\(403.*no write access\)$/i, replacement: "推送到 $1 被拒绝（403，无写入权限）" }, 
  // "Push to X denied (403) — no write access" variant 
  { pattern: /^Push to\s+(.+)\s+denied\s*\(403\)\s*[\u2014\-]+\s*no write access$/i, replacement: "推送到 $1 被拒绝（403）— 无写入权限" }, 
  // 独立时间格式 (当时间是单独的文本节点时) 
  // "Xm Ys" → "X分 Y秒" 
  { pattern: /^(\d+)m\s+(\d+)s$/i, replacement: "$1分 $2秒" }, 
  // "Xs" → "X秒" (但只在短文本中) 
  { pattern: /^(\d+)s$/i, replacement: "$1秒" }, 
  // "Xm" → "X分钟" 
  { pattern: /^(\d+)m$/i, replacement: "$1分钟" }, 
  // "Xh Ym" → "X小时 Y分钟" 
  { pattern: /^(\d+)h\s+(\d+)m$/i, replacement: "$1小时 $2分钟" }, 
  // "Xh" → "X小时" 
  { pattern: /^(\d+)h$/i, replacement: "$1小时" }, 
  // "+X -Y" (diff stats) 
  { pattern: /^\+(\d+)\s+\-(\d+)$/i, replacement: "+$1 -$2" }, 
  // "On-demand $X.XX" → "按需用量 $X.XX" 
  { pattern: /^On-demand\s+\$([0-9.]+)$/i, replacement: "按需用量 $$$1" }, 
  // "X User messages" → "X 条用户消息" 
  { pattern: /^(\d+)\s+User messages?$/i, replacement: "$1 条用户消息" }, 
  // ========== 会话工作日志正则 ========== 
  // "Viewed CI status for PR #X in Y" → "查看了 Y 中 PR #X 的 CI 状态" 
  { pattern: /^Viewed CI status for PR #(\d+) in (.+)$/i, replacement: "查看了 $2 中 PR #$1 的 CI 状态" }, 
  // "Viewed pull request #X in Y" → "查看了 Y 中的拉取请求 #X" 
  { pattern: /^Viewed pull request #(\d+) in (.+)$/i, replacement: "查看了 $2 中的 PR #$1" }, // 优化：拉取请求 -> PR
  // "Bot comment from X ignored" → "来自 X 的机器人评论已忽略" 
  { pattern: /^Bot comment from (.+) ignored$/i, replacement: "来自 $1 的机器人评论已忽略" }, 
  // "Pushed branch X to Y" → "推送分支 X 到 Y" 
  { pattern: /^Pushed branch (.+) to (.+)$/i, replacement: "推送分支 $1 到 $2" }, 
  // "Searched X for Y" → "在 X 中搜索 Y" 
  { pattern: /^Searched (.+) for (.+)$/i, replacement: "在 $1 中搜索 $2" }, 
  // "Created X Tasks" → "创建了 X 个任务" 
  { pattern: /^Created (\d+) Tasks?$/i, replacement: "创建了 $1 个任务" }, 
  // "Read file1, file2, ..." → "读取了 file1, file2, ..." 
  { pattern: /^Read (.+)$/i, replacement: "读取了 $1" }, 
  // "X/Y description" (task progress prefix) → "X/Y description" 
  { pattern: /^(\d+)\/(\d+)\s+Report results$/i, replacement: "$1/$2 报告结果" }, 
  // 执行计划中的动态条目 
  // "Search X frontend for Y references" → "搜索 X 前端中的 Y 引用" 
  { pattern: /^Search (.+) frontend for (.+) references$/i, replacement: "搜索 $1 前端中的 $2 引用" }, 
  // "Search X backend for Y references" → "搜索 X 后端中的 Y 引用" 
  { pattern: /^Search (.+) backend for (.+) references$/i, replacement: "搜索 $1 后端中的 $2 引用" }, 
  // "Make frontend changes to X" → "进行前端更改以 X" 
  { pattern: /^Make frontend changes to (.+)$/i, replacement: "进行前端修改以$1" }, 
  // "Make backend changes to X" → "进行后端更改以 X" 
  { pattern: /^Make backend changes to (.+)$/i, replacement: "进行后端修改以$1" }, 
  // "Create PRs for X" → "为 X 创建 PR" 
  { pattern: /^Create PRs for (.+)$/i, replacement: "为 $1 创建 PR" },
];

  /**
   * 翻译文本节点
   * 取 node.nodeValue，trim 后在词典里查精确匹配，命中则替换；保留原有首尾空白。
   * @param {Text} node - 文本节点
   */
  function translateTextNode(node) {
    const original = node.nodeValue;
    if (!original) return;

    const trimmed = original.trim();
    if (!trimmed) return;

    // 精确匹配词典
    if (DICTIONARY[trimmed]) {
      const leading = original.match(/^(\s*)/)[1];
      const trailing = original.match(/(\s*)$/)[1];
      const translated = leading + DICTIONARY[trimmed] + trailing;
      if (node.nodeValue !== translated) {
        node.nodeValue = translated;
      }
      return;
    }

    // 正则规则匹配
    for (let i = 0; i < REGEX_RULES.length; i++) {
      const rule = REGEX_RULES[i];
      if (rule.pattern.test(trimmed)) {
        const leading = original.match(/^(\s*)/)[1];
        const trailing = original.match(/(\s*)$/)[1];
        const translated = leading + trimmed.replace(rule.pattern, rule.replacement) + trailing;
        if (node.nodeValue !== translated) {
          node.nodeValue = translated;
        }
        return;
      }
    }
  }

  /**
   * 翻译元素属性
   * 处理 placeholder、title、aria-label、alt 属性
   * @param {Element} element - DOM 元素
   */
  function translateAttributes(element) {
    const attrs = ["placeholder", "title", "aria-label", "alt"];
    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs[i];
      const value = element.getAttribute(attr);
      if (!value) continue;

      const trimmed = value.trim();
      if (DICTIONARY[trimmed]) {
        const translated = DICTIONARY[trimmed];
        if (element.getAttribute(attr) !== translated) {
          element.setAttribute(attr, translated);
        }
      } else {
        // 尝试正则规则
        for (let j = 0; j < REGEX_RULES.length; j++) {
          const rule = REGEX_RULES[j];
          if (rule.pattern.test(trimmed)) {
            const translated = trimmed.replace(rule.pattern, rule.replacement);
            if (element.getAttribute(attr) !== translated) {
              element.setAttribute(attr, translated);
            }
            break;
          }
        }
      }
    }
  }

  /**
   * 遍历 DOM 树，翻译所有文本节点和元素属性
   * @param {Node} root - 遍历的根节点
   */
  function walk(root) {
    // 遍历文本节点
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      null
    );

    let textNode;
    while ((textNode = walker.nextNode())) {
      translateTextNode(textNode);
    }

    // 遍历元素节点，处理属性
    if (root.nodeType === Node.ELEMENT_NODE) {
      translateAttributes(root);
    }

    const elements = root.querySelectorAll
      ? root.querySelectorAll("*")
      : [];
    for (let i = 0; i < elements.length; i++) {
      translateAttributes(elements[i]);
    }
  }

  // 待处理节点队列与防抖标记
  let pendingNodes = [];
  let pendingFrame = null;

  /**
   * 防抖执行翻译，使用 requestAnimationFrame 合并多次回调
   * 所有调用的 nodes 都会被累积到队列中，确保不丢失任何变化节点
   * @param {Node[]} nodes - 需要翻译的节点列表
   */
  function scheduleTranslation(nodes) {
    for (let i = 0; i < nodes.length; i++) {
      pendingNodes.push(nodes[i]);
    }
    if (pendingFrame) return;
    pendingFrame = requestAnimationFrame(function () {
      pendingFrame = null;
      var toProcess = pendingNodes;
      pendingNodes = [];
      for (var i = 0; i < toProcess.length; i++) {
        var node = toProcess[i];
        if (node && node.nodeType === Node.TEXT_NODE) {
          translateTextNode(node);
        } else if (node && (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE)) {
          walk(node);
        }
      }
    });
  }

  /**
   * MutationObserver 回调
   * 监听 childList、subtree、characterData 变化
   */
  function onMutations(mutations) {
    const nodesToProcess = [];

    for (let i = 0; i < mutations.length; i++) {
      const mutation = mutations[i];

      if (mutation.type === "childList") {
        for (let j = 0; j < mutation.addedNodes.length; j++) {
          nodesToProcess.push(mutation.addedNodes[j]);
        }
      } else if (mutation.type === "characterData") {
        nodesToProcess.push(mutation.target);
      }
    }

    if (nodesToProcess.length > 0) {
      scheduleTranslation(nodesToProcess);
    }
  }

  // 初始化：页面加载完成后执行一次全量翻译
  function init() {
    if (document.body) {
      walk(document.body);
    }

    // 设置 MutationObserver 监听 DOM 变化
    const observer = new MutationObserver(onMutations);
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  // 确保 DOM 已就绪
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
