#!/usr/bin/env node
/**
 * wjorg-legal-mcp —— stdio ↔ Streamable HTTP 桥
 *
 * 为什么有这个文件：部分 MCP 客户端（以及 Glama、Docker MCP Catalog 等目录的
 * 自动评测容器）只支持 stdio 传输，而本站服务是远程 HTTPS 端点。
 * 这个薄壳把 stdin 上的 JSON-RPC 逐行转发到远程端点，把响应原样写回 stdout。
 * 零依赖，只用 Node 18+ 内置的 fetch。
 *
 * 用法：
 *   node bin/wjorg-legal-mcp.js
 *   WJORG_MCP_URL=https://wjorg.com/mcp node bin/wjorg-legal-mcp.js
 */
'use strict';

const REMOTE = process.env.WJORG_MCP_URL || 'https://wjorg.com/mcp';
const UA = 'wjorg-legal-mcp-stdio/1.0.0 (+https://wjorg.com)';

process.stdin.setEncoding('utf8');

function send(obj) {
  if (obj === null || obj === undefined) return;
  process.stdout.write(JSON.stringify(obj) + '\n');
}

async function forward(payload) {
  const res = await fetch(REMOTE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'User-Agent': UA,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(45000),
  });

  const text = await res.text();
  if (!text) return null; // 通知类消息，服务端回 202 空体

  const ctype = res.headers.get('content-type') || '';
  if (ctype.includes('text/event-stream')) {
    const msgs = text.split('\n')
      .filter((l) => l.startsWith('data:'))
      .map((l) => l.slice(5).trim())
      .filter(Boolean)
      .map((l) => JSON.parse(l));
    return msgs.length === 1 ? msgs[0] : msgs;
  }
  return JSON.parse(text);
}

async function handleLine(line) {
  let msg;
  try {
    msg = JSON.parse(line);
  } catch (e) {
    send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } });
    return;
  }
  try {
    const out = await forward(msg);
    if (out) send(out);
  } catch (e) {
    const hasId = msg && !Array.isArray(msg) && msg.id !== undefined && msg.id !== null;
    if (hasId) {
      send({
        jsonrpc: '2.0',
        id: msg.id,
        error: { code: -32603, message: '上游服务不可达：' + e.message },
      });
    }
  }
}

let buf = '';
process.stdin.on('data', (chunk) => {
  buf += chunk;
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (line) handleLine(line);
  }
});

process.stdin.on('end', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
