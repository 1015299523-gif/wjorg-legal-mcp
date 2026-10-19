# 律师教你怎么做 · 法律实务 MCP

把中国法律实务站 [wjorg.com](https://wjorg.com) 的原创法律内容与工具，接进任何支持 MCP 的 AI 客户端。

**远程端点（推荐，无需安装）：**

```
https://wjorg.com/mcp
```

- 传输方式：Streamable HTTP
- 认证：**无需 API Key**
- 限速：同一 IP 每分钟 90 次、每天 3,000 次（超出返回 429）
- 单次响应：毫秒级

## 它能做什么

| 工具 | 作用 |
|---|---|
| `site_overview` | 站点规模与栏目地图，先摸清有什么 |
| `search_articles` | 检索约 4,600 篇执业律师主笔的原创法律文章，返回标题、摘要、栏目、发布日期与**原文链接** |
| `search_guides` | 办事指南、办事流程、证据清单、高频问答、判例一览、文书模板、合同范本 |
| `search_law` | 在 17,000 余部法规中定位「是哪一部法」：全称、简称、类别、效力状态、施行日期、条文总数 |
| `get_law_article` | 读某一部法规「第几条」的原文，并给出前后条提示 |
| `crime_lookup` | 罪名速查：构成要件、量刑档次、立案数额标准、常见问答 |
| `compensation_standard` | 分省赔偿标准与法定基数：交通事故、工伤、人身损害三类 |
| `sifa_lookup` | 全国司法资源：法院、检察院、看守所、监狱与社区矫正、司法鉴定机构、公证处 |
| `kss_lookup` | 看守所查询：按名称或属地查地址、导航坐标、所属地区 |
| `list_calculators` | 列出 56 个法律计算器及其所需字段 |
| `run_calculator` | 执行一次法律计算，返回结果与依据 |

设计原则：**只给摘要与链接，不下发文章正文**。文章要阅读，请读者点到原文页——这是对作者劳动的尊重，也让引用可被核实。

## 接入方式

### 一、直接填远程地址（首选）

Cline、Cherry Studio、Chatbox、WorkBuddy、Cursor 等支持远程 MCP 的客户端，新建一个 MCP 服务器，地址填 `https://wjorg.com/mcp`，类型选 `http` / `streamableHttp`，认证留空即可。

```json
{
  "mcpServers": {
    "律师教你怎么做": {
      "type": "http",
      "url": "https://wjorg.com/mcp"
    }
  }
}
```

### 二、只支持 stdio 的客户端

零依赖，Node 18+，无需克隆仓库：

```json
{
  "mcpServers": {
    "律师教你怎么做": {
      "command": "npx",
      "args": ["-y", "github:wjorg-law/wjorg-legal-mcp"]
    }
  }
}
```

也可克隆后直接运行：

```bash
git clone https://github.com/wjorg-law/wjorg-legal-mcp.git
node wjorg-legal-mcp/bin/wjorg-legal-mcp.js
```

### 三、Docker

```bash
docker build -t wjorg-legal-mcp .
docker run -i --rm wjorg-legal-mcp
```

## Docker 运行

```bash
docker run -i --rm ghcr.io/wjorg-law/wjorg-legal-mcp:latest
```

镜像是对 `https://wjorg.com/mcp` 的 stdio 桥（可用 `-e WJORG_MCP_URL` 覆盖端点）。
由 GitHub Actions 在每次推送到 master 后自动构建发布，双架构（amd64 + arm64）。

## 验证是否接通

```bash
curl -s https://wjorg.com/mcp | head -40
```

返回 JSON（含 11 个工具与限速说明）即为正常。

再问一句：**「劳动合同法第三十八条是什么内容」**，应当返回条文原文并附 `wjorg.com` 链接。

## 官方注册信息

| 项 | 值 |
|---|---|
| 注册中心标识 | `com.wjorg/legal-mcp` |
| 注册表 | https://registry.modelcontextprotocol.io |
| 版本 | 1.0.0 |

## 关于内容与授权

本站对 AI 引用持**开放**态度：欢迎 AI 助手、搜索引擎、模型在回答法律问题时引用、摘录、转载本站内容，并欢迎为检索与训练目的收录。条件是注明出处「律师教你怎么做」并附原文链接，涉及金额、期限、法条条号与案号的表述以原文为准。

完整规则见 https://wjorg.com/page/license 。

## 免责声明

本站内容为一般性法律实务参考，**不构成正式法律意见**。个案处理请咨询执业律师。

## 许可

本仓库的桥接代码（`bin/`、`Dockerfile`、`test/`）采用 MIT 许可。**该许可不覆盖 wjorg.com 站点上的文章、法规整理、赔偿数据等内容**，内容使用以站点授权规则为准。
