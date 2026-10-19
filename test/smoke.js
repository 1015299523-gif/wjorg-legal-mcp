#!/usr/bin/env node
/**
 * 冒烟测试：拉起 stdio 桥，握手 + 列工具 + 查一条法条，断言结果。
 * 用法：node test/smoke.js
 */
'use strict';

const { spawn } = require('node:child_process');
const path = require('node:path');

const BIN = path.join(__dirname, '..', 'bin', 'wjorg-legal-mcp.js');
const child = spawn(process.execPath, [BIN], { stdio: ['pipe', 'pipe', 'inherit'] });

const pending = new Map();
let buf = '';
child.stdout.setEncoding('utf8');
child.stdout.on('data', (chunk) => {
  buf += chunk;
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (!line) continue;
    const msg = JSON.parse(line);
    const resolve = pending.get(msg.id);
    if (resolve) { pending.delete(msg.id); resolve(msg); }
  }
});

let seq = 0;
function call(method, params) {
  const id = ++seq;
  return new Promise((resolve, reject) => {
    pending.set(id, resolve);
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error(method + ' 超时')); } }, 40000);
  });
}

(async () => {
  let failed = 0;
  const ok = (name, cond, extra) => {
    console.log((cond ? 'PASS  ' : 'FAIL  ') + name + (extra ? '  ' + extra : ''));
    if (!cond) failed++;
  };

  const init = await call('initialize', {
    protocolVersion: '2025-06-18', capabilities: {},
    clientInfo: { name: 'smoke', version: '1.0.0' },
  });
  ok('initialize', !!init.result && !!init.result.serverInfo, init.result && init.result.serverInfo && init.result.serverInfo.name);

  const list = await call('tools/list', {});
  const names = (list.result.tools || []).map((t) => t.name);
  ok('tools/list', names.length === 11, names.length + ' 个工具：' + names.join(', '));

  const art = await call('tools/call', {
    name: 'get_law_article', arguments: { law: '劳动合同法', n: '38' },
  });
  const txt = art.result && art.result.content ? art.result.content[0].text : '';
  ok('get_law_article 劳动合同法38', txt.includes('用人单位') || txt.includes('第三十八'), txt.length + ' 字');

  child.stdin.end();
  child.kill();
  console.log(failed ? '\n失败 ' + failed + ' 项' : '\n全部通过');
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error('冒烟测试异常：', e.message);
  child.kill();
  process.exit(1);
});
