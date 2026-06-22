# Radio Every Day

基于 Vue 3 的沉浸式电台播放器，接入网易云音乐 API，支持扫码/手机号登录解锁 VIP 音质。

## 功能

- 网易云音乐电台源，支持 VIP 音质（320kbps / 无损）
- 扫码登录 / 手机号密码登录
- 深色沉浸主题 + 黑胶唱片风格 UI
- 电台列表切台、上下曲切换
- 歌曲封面模糊背景
- 本地缓存电台数据（24h TTL）
- API 不可用时自动回退到内置流媒体电台

## 技术栈

- Vue 3 + Vite + Vue Router
- motion-v（动画）
- NeteaseCloudMusicApi（网易云音乐 API 服务端）

---

## 快速启动

### 前置要求

- Node.js >= 18
- Docker（用于运行网易云 API 服务端）
- 网易云音乐账号（VIP 账号可解锁高音质）

### 第一步：启动网易云 API 服务端

```bash
cd radio-every-day
docker compose up -d
```

验证服务是否正常：

```bash
curl http://localhost:3000/login/qr/key?timestamp=123
```

返回 JSON 且 `code: 200` 即表示服务端就绪。

> 如果没有 Docker，也可以用 npx 启动：
> ```bash
> npx NeteaseCloudMusicApi@latest
> ```

### 第二步：安装前端依赖

```bash
npm install
```

### 第三步：启动开发服务器

```bash
npm run dev
```

浏览器打开终端输出的地址即可。

---

## 登录（可选）

登录后可获取 VIP 音质的音频链接。

1. 点击首页右上角的用户图标
2. 选择登录方式：
   - **扫码登录**（推荐）：用网易云音乐 APP 扫描二维码
   - **手机号登录**：输入手机号和密码
3. 登录成功后自动返回首页，电台列表会自动刷新

> 登录状态由 API 服务端维护，重启 Docker 容器后需要重新登录。

---

## 项目结构

```
src/
  assets/               # 静态资源
  components/
    player/
      HeroSection.vue   # 深色头部区域（封面背景、波形、播放按钮）
      PlayerCard.vue    # 白色底部卡片（电台列表、控制按钮）
  composables/
    useAudioPlayer.js   # 音频播放器（HTMLAudioElement）
    useNeteaseAuth.js   # 登录状态管理
    useNeteaseStations.js # 电台数据获取 + 缓存
  data/
    neteaseSources.js   # 网易云歌单源配置
    stations.js         # 内置流媒体电台（fallback）
  router/
    index.js            # 路由配置
  services/
    neteaseApi.js       # 网易云 API 请求封装
  utils/
    stationStorage.js   # localStorage 工具
  views/
    PlayerView.vue      # 主播放页
    LoginView.vue       # 登录页
```

---

## 环境变量（可选）

创建 `.env` 文件可自定义 API 地址：

```
VITE_NETEASE_API_URL=http://localhost:3000
```

默认通过 Vite 代理转发到 `localhost:3000`，通常无需修改。

---

## 构建部署

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

> 注意：生产环境需要自行部署 NeteaseCloudMusicApi 服务端，并配置反向代理将 API 请求转发到该服务。

---

## 常见问题

**Q: 电台列表加载失败？**
A: 检查 Docker 容器是否在运行：`docker compose ps`。如果 API 服务不可用，应用会自动使用内置的流媒体电台。

**Q: 登录后音质没变化？**
A: 登录后需要清除缓存重新获取。应用会自动处理，如果没有生效，点击电台列表右上角的刷新按钮。

**Q: 扫码登录二维码过期？**
A: 点击二维码区域即可刷新。二维码有效期约 5 分钟。

**Q: 如何添加更多网易云歌单？**
A: 编辑 `src/data/neteaseSources.js`，添加歌单 ID 和元信息即可。
