/**
 * 导航的可编辑内容，由表单提供，保存前统一校验与去除首尾空白。
 */
export interface NavigationDraft {
  /**
   * 卡片名称。
   */
  title: string;
  /**
   * HTTP 或 HTTPS 网站地址。
   */
  href: string;
  /**
   * 卡片的一行用途说明。
   */
  description: string;
  /**
   * 可选的 HTTP 或 HTTPS 图标地址，空值按网站域名自动获取，加载失败使用卡片首字兜底。
   */
  icon: string;
}

/**
 * IndexedDB 中持久化的导航记录，页面列表以此为唯一数据来源。
 */
export interface NavigationItem extends NavigationDraft {
  /**
   * 数据库自动生成的主键。
   */
  id: number;
  /**
   * 展示顺序，新增记录追加在已有记录之后。
   */
  position: number;
  /**
   * 创建时间，单位为毫秒。
   */
  createdAt: number;
  /**
   * 最近一次保存时间，单位为毫秒。
   */
  updatedAt: number;
}

/**
 * 默认导航的初始化标记，与导航数据在同一个事务内写入。
 */
export interface NavigationInitialization {
  /**
   * 初始化批次的唯一标识。
   */
  key: string;
  /**
   * 首次完成初始化的时间，单位为毫秒。
   */
  initializedAt: number;
}
