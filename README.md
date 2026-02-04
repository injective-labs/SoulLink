# 🛡️ SoulLink: Injective Human Verification

<div align="center">

**基于 Injective 生态的硬件级人类身份验证协议**

*硬件加密 (Passkey) • 链上 NFT 验证 • Supabase 云存储*

**Powered by Injective • Secured by WebAuthn**

</div>

---

## 📖 项目简介

SoulLink 是一个现代化的去中心化人类身份验证方案，专为 Injective 生态系统设计。它结合了 **N1NJ4:Origin NFT** 持有权限验证与 **WebAuthn (Passkeys)** 硬件级签名技术，为用户生成一个永久的、无法转让的数字人格绑定（Soul Binding）。

通过本项目，用户可以将自己的钱包地址与物理设备的硬件安全模块（Secure Enclave）进行唯一关联，从而证明“我是真人”。

---

## 🛠 技术架构

SoulLink 采用了高性能、易部署的现代技术栈：

- **Frontend**: React 19 + Vite 7 + TypeScript
- **Styling**: Tailwind CSS v4 (采用全新的引擎)
- **Animation**: Framer Motion (平滑的 UI 状态切换)
- **Database**: Supabase (PostgreSQL + RLS) - 取代传统的 Node.js 后端，实现 Serverless 存储
- **Blockchain**: Ethers.js v5 - 与 Injective 测试网进行交互
- **Identity**: WebAuthn API (Passkeys) - 硬件级生物识别/PIN 验证

---

## ✨ 核心特性

- **🔐 硬件级安全**: 使用 Passkey 进行身份绑定，私钥存储在设备的硬件芯片中，无法被盗取。
- **验证流**:
    1. **NFT 检测**: 检查用户是否持有 N1NJ4:Origin NFT。
    2. **硬件绑定**: 触发设备生物识别（指纹/面容）创建 Passkey。
    3. **数字护照**: 验证成功后生成专属的“SoulLink Passport”。
- **☁️ 云端同步**: 绑定状态持久化存储在 Supabase，支持多端即时查询。
- **⚡ 极简配置**: 所有网络参数、合约地址、数据库 API 均通过环境变量管理。

---

## 🚀 开发与部署流程

### 1. 环境准备

确保安装了以下工具：
- **Node.js**: >= 20.0.0
- **pnpm**: 推荐使用的包管理器

### 2. 本地设置

```bash
# 进入项目目录
cd SoulLink

# 安装依赖
pnpm install

# 配置环境变量
# 复制并编辑 .env 文件，填入你的 Supabase 和 Injective 配置
# cp .env.example .env 
```

**环境变量配置 (`.env`):**
```env
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名Key

VITE_NFT_CONTRACT_ADDRESS=0x3d5D8D565a20e648bD478FDC831b6576CEC54ab2
VITE_CHAIN_ID=1439
VITE_CHAIN_ID_HEX=0x59F
VITE_RPC_URL=https://k8s.testnet.json-rpc.injective.network
```

### 3. 运行开发服务器

```bash
pnpm dev
```

### 4. 部署 (Cloudflare Pages)

本项目支持使用 `wrangler` 快速部署到 Cloudflare Pages：

```bash
# 1. 全局安装 wrangler (如已安装可跳过)
npm install -g wrangler

# 2. 登录 Cloudflare
wrangler login

# 3. 执行本地构建 (生成 dist 文件夹)
pnpm build

# 4. 一键部署
wrangler pages deploy dist
```

---

## 🗄️ 数据库设置 (Supabase)

在 Supabase SQL Editor 中运行以下代码以初始化数据表：

```sql
-- 参照项目根目录下的 database.sql 文件
CREATE TABLE IF NOT EXISTS public.bindings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    address TEXT UNIQUE NOT NULL,
    passkey_id TEXT NOT NULL,
    credential_id TEXT,
    public_key TEXT,
    timestamp BIGINT NOT NULL,
    tx_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT address_format CHECK (address ~* '^0x[a-fA-F0-9]{40}$')
);

ALTER TABLE public.bindings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for all users" ON public.bindings FOR ALL USING (true);
```

---

## 🖊️ 文案修改

如果你需要修改 UI 上的任何标语、标题或加载提示，请直接编辑：
`src/constants/slogan.ts`

---

## 📄 许可证

本项目基于 MIT 许可证开源。

<div align="center">

**Built for the Injective Community 🥷**

</div>
