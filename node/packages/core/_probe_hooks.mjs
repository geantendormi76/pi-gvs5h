import { createAgentSession, SessionManager, SettingsManager, DefaultResourceLoader } from '@earendil-works/pi-coding-agent';

const settingsManager = SettingsManager.inMemory({ retry: { enabled: false }, compaction: { enabled: false } });
const loader = new DefaultResourceLoader({
  cwd: process.cwd(), agentDir: '/tmp', settingsManager,
  noExtensions: true, noSkills: true, noPromptTemplates: true, noThemes: true,
});
await loader.reload();

const { session } = await createAgentSession({
  cwd: process.cwd(), agentDir: '/tmp',
  model: { id: 'dummy', name: 'dummy', provider: 'dummy', api: 'openai-completions' },
  resourceLoader: loader, settingsManager,
  sessionManager: SessionManager.inMemory(process.cwd()),
});

const agent = session.agent;
console.log('=== [1] session.agent 自身属性 ===');
const keys = Object.getOwnPropertyNames(agent);
console.log('Agent Direct Props:', keys.filter(k => k.toLowerCase().includes('tool') || k.toLowerCase().includes('hook') || k.toLowerCase().includes('call') || k.toLowerCase().includes('stream')));

console.log('=== [2] session.agent 原型链公共方法 ===');
const proto = Object.getPrototypeOf(agent);
console.log('Agent Prototype Methods:', Object.getOwnPropertyNames(proto).filter(k => typeof agent[k] === 'function' && !k.startsWith('_')));

console.log('=== [3] 工具拦截能力检查 ===');
console.log('has afterToolCall:', 'afterToolCall' in agent || 'afterToolCall' in proto);
console.log('has transformToolResult:', 'transformToolResult' in agent || 'transformToolResult' in proto);

session.dispose();
