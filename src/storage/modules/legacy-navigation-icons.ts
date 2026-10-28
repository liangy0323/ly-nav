/**
 * 上一版曾写入数据库的默认图标，仅用于一次性识别并清除旧值，迁移到自动获取。
 * 新导航不再维护网站与图标的映射；此表不参与卡片展示。
 */
export const LEGACY_NAVIGATION_ICONS: Readonly<Record<string, string>> = {
  deepseek: 'https://www.deepseek.com/favicon.ico',
  yuanbao: 'https://static.yuanbao.tencent.com/m/yuanbao-web/logo_with_bg.png',
  github: 'https://github.githubassets.com/favicons/favicon-dark.svg',
  vue: 'https://cn.vuejs.org/logo.svg',
  react: 'https://react.dev/apple-touch-icon.png',
  juejin: 'https://lf-web-assets.juejin.cn/obj/juejin-web/xitu_juejin_web/static/favicons/apple-touch-icon.png',
  youdao: 'https://shared-https.ydstatic.com/images/favicon.ico',
  weixin: 'https://res.wx.qq.com/a/wx_fed/assets/res/OTE0YTAw.png',
};
