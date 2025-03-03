// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

export const translations = {
  test: {
    zh: '测试',
    en: 'test'
  },
  switch_language: {
    zh: 'Switch To English',
    en: '切换中文'
  },
  feedback: {
    zh: '问题反馈',
    en: 'feedback'
  },
  feedback_please_select_option: {
    zh: '请选择反馈类型',
    en: 'Please choose a feedback option'
  },
  feedback_option_upload_and_oncall: {
    zh: '上传环境日志并发起Oncall',
    en: 'Upload env logs and start Oncall'
  },
  feedback_option_upload_only: {
    zh: '仅上传环境日志',
    en: 'Upload env logs only'
  },
  feedback_upload_success_desc: {
    zh: '上传成功，请复制日志地址',
    en: 'Upload succeeded. Please copy the log URLs.'
  },
  page_not_opened: {
    zh: '未打开页面',
    en: 'page not opened'
  },
  info: {
    zh: '信息',
    en: 'info'
  },
  app_name: {
    zh: '应用名',
    en: 'App Name'
  },
  app_version: {
    zh: '应用版本',
    en: 'App Version'
  },
  os_version: {
    zh: '系统版本',
    en: 'OS Version'
  },
  os_not_support_webview_debug: {
    zh: '系统版本不支持WebView调试',
    en: 'Operate system version does not support WebView debugging'
  },
  unsupported_function: {
    zh: '不支持的功能',
    en: 'Unsupported function'
  },
  sdk_version: {
    zh: 'SDK版本',
    en: 'SDK Version'
  },
  ldt_version: {
    zh: 'LDT版本',
    en: 'LDT Version'
  },
  kernel_engine: {
    zh: 'JS引擎',
    en: 'JS Engine'
  },
  settings: {
    zh: '设置',
    en: 'Settings'
  },
  stop_at_entry: {
    zh: '首行断点',
    en: 'First-Line Breakpoints'
  },
  stop_lepus_at_entry: {
    zh: '主线程调试',
    en: 'Main Thread Debugging'
  },
  stop_at_entry_tooltip: {
    zh: '仅在后台线程',
    en: 'Background thread only'
  },
  focus_on_latest_card: {
    zh: '对焦最新卡片',
    en: 'Focus on latest card'
  },
  tips_for_focus_on_latest_card_on: {
    zh: '打开:自动对焦到最新加载的卡片。',
    en: 'ON: auto focus on newest card.'
  },
  tips_for_focus_on_latest_card_off: {
    zh: '关闭:初次加载时只对焦到第一张卡片，刷新网页时对焦到上次选中的卡片。',
    en: 'OFF: Focuses only on the first card when first loaded, and on the last selected card when the page is refreshed.'
  },
  keep_card_open: {
    zh: '保留当前卡片',
    en: 'keep current card open'
  },
  tips_for_keep_card_open: {
    zh: '在当前卡片跳转或关闭后，仍然保留平台调试面板。',
    en: 'Keep devtool page of current card open on platform after card navigates or closes.'
  },
  multi_card_mode: {
    zh: '多卡片模式',
    en: 'Multi-card mode'
  },
  card_list: {
    zh: '卡片列表',
    en: 'Card list'
  },
  keyword_filter: {
    zh: '查找关键词',
    en: 'Keyword filter'
  },
  no_cards_opened: {
    zh: '设备没有打开任何卡片',
    en: 'No cards opened on your device'
  },
  retry_connection: {
    zh: '重试连接',
    en: 'Retry connection'
  },
  connect_tips_via_usb: {
    zh: '请使用数据线连接设备',
    en: 'Please connect the device via cable.'
  },
  scan_qr_to_connect_tips_offline: {
    zh: '扫上方二维码，或使用USB线连接App',
    en: 'Scan the QR code above, or use the USB cable to connect the App.'
  },
  scan_qr_to_connect_tips: {
    zh: '扫上方二维码连接App',
    en: 'Scan the QR code above to connect the App.'
  },
  retry_connect_tips: {
    zh: '平台未连接成功，点击按钮重试',
    en: 'The platform is not successfully connected, click the button to retry.'
  },
  connect_device_first: {
    zh: '请先连接App',
    en: 'Please connect your App first.'
  },
  click_btn_or: {
    zh: '点击 <0/> 按钮，或',
    en: 'Click <0/> , or '
  },
  please_open_the_card: {
    zh: '请打开页面',
    en: 'Please Open The Page'
  },
  please_open_lynx_or_web: {
    zh: '请打开Lynx或WebView页面',
    en: 'Please Open Lynx Or Web Page.'
  },
  connect: {
    zh: '连接',
    en: 'connect'
  },
  connect_button_desc: {
    zh: '点击按钮，选择的APP将自动使用WIFI连接平台',
    en: 'Click this button, then the selected APP will connect platform automatically by WIFI'
  },
  connect_timeout_tips: {
    zh: '连接超时，可以尝试直接扫码或使用USB连接调试',
    en: 'Connection timeout, you can try to scan the QR code or use USB to connection.'
  },
  disconnected: {
    zh: '未连接',
    en: 'Disconnected'
  },
  connected: {
    zh: '已连接',
    en: 'Connected'
  },
  unstable: {
    zh: '不稳定',
    en: 'Unstable'
  },
  connecting: {
    zh: '连接中...',
    en: 'Connecting...'
  },
  no_device: {
    zh: '未连接设备',
    en: 'No device'
  },
  unbind_success: {
    zh: '解绑成功',
    en: 'unbind success'
  },
  confirm_unbind_device: {
    zh: '确定解绑该设备？',
    en: 'Are you sure to unbind the device?'
  },
  irreversible_operation: {
    zh: '此操作将不可逆',
    en: 'This operation will be irreversible'
  },
  device_management: {
    zh: '设备管理',
    en: 'device management'
  },
  fetch_data: {
    zh: '数据下发',
    en: 'fetch data'
  },
  scan_qr_to_bind_device: {
    zh: '扫描上方二维码绑定设备',
    en: 'Scan the QR code above to bind device'
  },
  scan_qr_to_fetch_data: {
    zh: '扫描上方二维码获取数据',
    en: 'Scan the QR code above to fetch data'
  },
  add_manully: {
    zh: '手动添加',
    en: 'add manully'
  },
  add_device_failed: {
    zh: '添加设备失败，设备已经绑定或者设备信息不全！',
    en: 'add device failed, device already bound or device information incomplete!'
  },
  add_device_success: {
    zh: '添加设备成功！',
    en: 'add device success'
  },
  update_device_failed: {
    zh: '更新设备失败！',
    en: 'update device failed'
  },
  update_device_success: {
    zh: '更新设备成功！',
    en: 'update device success'
  },
  add_device: {
    zh: '添加设备',
    en: 'add device'
  },
  edit_device_description: {
    zh: '编辑设备描述',
    en: 'edit device description'
  },
  device: {
    zh: '设备',
    en: 'device'
  },
  host: {
    zh: '宿主',
    en: 'host'
  },
  device_id: {
    zh: '设备DID',
    en: 'DID of device'
  },
  empty_did: {
    zh: '设备DID不能为空！',
    en: 'DID cannot be empty!'
  },
  device_description: {
    zh: '设备描述',
    en: 'device description'
  },
  empty_device_description: {
    zh: '设备描述不能为空！',
    en: 'device description cannot be empty!'
  },
  reach_max_device_discription: {
    zh: '描述至多{{char_count}}个字符',
    en: 'Description up to {{char_count}} character(s)'
  },
  please_select_the_card: {
    zh: '请选择页面',
    en: 'Please Select The Page'
  },
  no_filter_select_card: {
    zh: '未找到对应的卡片',
    en: 'No Matching Page Found'
  },
  router_proxy: {
    zh: '代理',
    en: 'Proxy'
  },
  router_home: {
    zh: '首页',
    en: 'Home'
  },
  router_network_capture: {
    zh: '网络抓包',
    en: 'Network Capture'
  },
  router_log: {
    zh: '日志',
    en: 'Log'
  },
  router_device_info: {
    zh: '设备信息',
    en: 'Device Info'
  },
  manage: {
    zh: '管理',
    en: 'manage'
  },
  add: {
    zh: '添加',
    en: 'add'
  },
  ios_simulator: {
    zh: 'iOS 模拟器',
    en: 'iOS simulator'
  },
  url_filter: {
    zh: 'url过滤',
    en: 'url filter'
  },
  no_data: {
    zh: '暂无数据',
    en: 'no data'
  },
  start_to_capture_network: {
    zh: '点击开始按钮，抓取网络日志',
    en: 'click start button to capture network log'
  },
  loading: {
    zh: '请求中',
    en: 'loading'
  },
  pause: {
    zh: '暂停',
    en: 'pause'
  },
  start: {
    zh: '开始',
    en: 'start'
  },
  clear: {
    zh: '清除',
    en: 'clear'
  },
  export: {
    zh: '导出',
    en: 'export'
  },
  import: {
    zh: '导入',
    en: 'import'
  },
  rule: {
    zh: '规则',
    en: 'Rule'
  },
  method: {
    zh: '方法',
    en: 'Method'
  },
  proxy_config: {
    zh: '代理配置',
    en: 'Proxy Config'
  },
  proxy_list: {
    zh: '代理列表',
    en: 'Proxy List'
  },
  network_proxy_list: {
    zh: '网络代理列表',
    en: 'Network Proxy List'
  },
  network_proxy: {
    zh: '网络代理',
    en: 'Network Proxy'
  },
  jsb_mock: {
    zh: 'JSB代理',
    en: 'JSB Mock'
  },
  jsb_mock_list: {
    zh: 'JSB代理列表',
    en: 'JSB Mock List'
  },
  jsb_mock_rule: {
    zh: 'JSON格式，将作为拦截规则，value支持通配符，但不支持数组，需LDT客户端版本大于1.2',
    en: 'JSON format here used as an interception rule. Value supports wildcards but not arrays. LDT client version must be greater than 1.2'
  },
  qr_code: {
    zh: '二维码',
    en: 'QR Code'
  },
  lynx_devtool_switch_tips: {
    zh: '启用后支持元素审查,CSS编辑,JS调试等功能',
    en: 'After enabled, it supports element inspection, CSS editing, JS debugging, etc.'
  },
  lynx_devtool_switch: {
    zh: 'Lynx DevTool 开关',
    en: 'Lynx DevTool switch'
  },
  dom_inspect_switch_tips: {
    zh: '在 DevTool 开启的情况下,开启后即可使用元素审查功能',
    en: 'If DevTool is on, you can use the element inspection function when it is on'
  },
  dom_inspect_switch: {
    zh: 'DOM 元素审查开关',
    en: 'DOM element inspection switch'
  },
  cancel: {
    zh: '取消',
    en: 'cancel'
  },
  confirm: {
    zh: '确定',
    en: 'confirm'
  },
  select_data_type: {
    zh: '请选择数据类型',
    en: 'please select data type'
  },
  edit_config_success: {
    zh: '修改配置成功',
    en: 'edit config success'
  },
  edit_config_failed: {
    zh: '修改配置失败',
    en: 'edit config failed'
  },
  save: {
    zh: '保存',
    en: 'save'
  },
  edit: {
    zh: '编辑',
    en: 'edit'
  },
  add_to_client_conf: {
    zh: '添加到客户端配置项',
    en: 'Add to client configuration'
  },
  filter_repo: {
    zh: '数据太多, 搜索Repo关键字看看吧～',
    en: 'Too much data, try to filter repo keyword'
  },
  filter_key: {
    zh: '数据太多, 搜索Key关键字看看吧～',
    en: 'Too much data, try to filter key keyword'
  },
  devtool_switch_should_enable: {
    zh: '检测到以下 DevTool 调试相关的开关没打开, 请确认是否打开?',
    en: 'Please check whether the following DevTool debugging related switches are enabled'
  },
  get_data_failed: {
    zh: '获取数据失败',
    en: 'get data failed'
  },
  update_completed_local_uptodate: {
    zh: '更新成功！本地已是最新!',
    en: 'Update completed! Local is up to date!'
  },
  check_for_updates_failed: {
    zh: '检查更新失败!',
    en: 'Check for updates failed!'
  },
  success_append: {
    zh: '成功!',
    en: ' success!'
  },
  failed_append: {
    zh: '失败!',
    en: ' failed!'
  },
  add_success: {
    zh: '添加成功!',
    en: 'add success!'
  },
  add_failed: {
    zh: '添加失败!',
    en: 'add failed!'
  },
  update_success: {
    zh: '更新成功!',
    en: 'Update completed!'
  },
  update_failed: {
    zh: '更新失败!',
    en: 'Update failed!'
  },
  delete_success: {
    zh: '删除成功',
    en: 'delete success'
  },
  delete_failed: {
    zh: '删除失败',
    en: 'delete failed'
  },
  collect: {
    zh: '收藏',
    en: 'Collect'
  },
  collect_success: {
    zh: '收藏成功',
    en: 'collect success'
  },
  uncollect_success: {
    zh: '取消收藏成功',
    en: 'cancel collect success'
  },
  collect_failed: {
    zh: '收藏失败',
    en: 'collect failed'
  },
  confirm_delete: {
    zh: '确认删除',
    en: 'are you sure to delete '
  },
  delete_warn: {
    zh: '此操作将不可逆',
    en: 'This operation will be irreversible'
  },
  update_channel: {
    zh: '更新channel',
    en: 'update channel'
  },
  activated: {
    zh: '已激活',
    en: 'Active'
  },
  inactivated: {
    zh: '未激活',
    en: 'Not Active'
  },
  try_filter: {
    zh: '数据太多, 搜索看看吧',
    en: 'Too much data, try to filter'
  },
  current_channel: {
    zh: '当前channel',
    en: 'current channel'
  },
  channel_version: {
    zh: 'channel版本号',
    en: 'channel version'
  },
  default_channel_tips: {
    zh: '不输入则会默认更新到最新版本',
    en: 'If not entered, it will be updated to the latest version by default'
  },
  update: {
    zh: '更新',
    en: 'update '
  },
  not_found: {
    zh: '未查询到相关数据',
    en: 'No related data found'
  },
  fill_in_did: {
    zh: '请填写查询的设备DID',
    en: 'Please fill in the query device DID'
  },
  offline_log_entrance: {
    zh: '离线日志分析工具入口',
    en: 'Offline log analysis tool entrance'
  },
  offline_log_welcome: {
    zh: '这里新增离线日志分析工具入口啦，欢迎来使用',
    en: 'Here is the offline log analysis tool entrance, welcome to use'
  },
  got_it: {
    zh: '我知道了',
    en: 'got it'
  },
  switching: {
    zh: '切换中',
    en: 'switching'
  },
  real_time_log_on: {
    zh: '开启实时日志',
    en: 'Turn on real-time logging'
  },
  real_time_log_off: {
    zh: '关闭实时日志',
    en: 'Turn off real-time logging'
  },
  clear_log: {
    zh: '清除',
    en: 'clear'
  },
  offline_log_analysis_entry: {
    zh: '离线日志分析入口',
    en: 'Offline log analysis entry'
  },
  offline_log: {
    zh: '离线日志',
    en: 'offline log'
  },
  real_time_log: {
    zh: '实时日志',
    en: 'real-time log'
  },
  log_no_content: {
    zh: '日志详情暂无内容，请选择某一条日志查看',
    en: 'There is no content in the log details, please select a log to view'
  },
  load_earlier_logs: {
    zh: '加载更早日志',
    en: 'load earlier logs'
  },
  no_logs_to_show: {
    zh: '空空如也',
    en: 'no logs to show'
  },
  no_logs_to_show_tips: {
    zh: '筛选离线日志条件，获取离线日志列表',
    en: 'Filter offline log conditions to obtain a list of offline logs'
  },
  send_msg_to_client: {
    zh: '发送消息给客户端',
    en: 'send msg to client'
  },
  chat_with_client: {
    zh: '平台接力',
    en: 'chat with client'
  },
  get_resource_failed: {
    zh: '获取资源失败',
    en: 'get resource failed'
  },
  filter_messages: {
    zh: '过滤message消息，支持正则匹配',
    en: 'Filter messages, support regular matching'
  },
  last: {
    zh: '最近',
    en: 'last '
  },
  minute: {
    zh: '分钟',
    en: ' minute(s)'
  },
  hour: {
    zh: '小时',
    en: ' hour(s)'
  },
  advanced_filter: {
    zh: '高级过滤条件',
    en: 'advanced filter'
  },
  search: {
    zh: '查询',
    en: 'search'
  },
  equal: {
    zh: '等于',
    en: 'equal '
  },
  or_regular_match: {
    zh: '(或者正则)',
    en: '(or regular match)'
  },
  share: {
    zh: '分享',
    en: 'share'
  },
  share_success: {
    zh: '分享链接已成功复制到剪切板！',
    en: 'share url has copied to clipboard!'
  },
  distribute: {
    zh: '下发',
    en: 'distribute'
  },
  unattached_dialog_tip: {
    zh: '您已经打开了其他LDT，是否继续使用当前LDT?',
    en: 'You have opened other LDT applications, Do you need continue use current LDT?'
  },
  unattached_dialog_ok: {
    zh: '继续使用，并断开其它LDT的连接',
    en: 'Yes, and disconnect other LDTs'
  },
  unattached_dialog_no: {
    zh: '否',
    en: 'No'
  },
  distribute_empty_device: {
    zh: '请选择要下发的设备',
    en: 'Please select device to be distributed'
  },
  delete: {
    zh: '删除',
    en: 'delete'
  },
  copy: {
    zh: '复制',
    en: 'copy'
  },
  copy_url_success: {
    zh: '复制url成功',
    en: 'copy url successfully'
  },
  copy_curl_success: {
    zh: '复制cURL成功',
    en: 'copy cURL successfully'
  },
  copy_config: {
    zh: '复制配置',
    en: 'Copy config'
  },
  test_map: {
    zh: 'Map测试',
    en: 'Test map'
  },
  test_result: {
    zh: '测试结果',
    en: 'Test result'
  },
  platform_not_connected_to_devtool: {
    zh: '平台侧未连接到DevTool',
    en: 'platform not connected to DevTool'
  },
  device_offline: {
    zh: '操作失败，请确保设备在线',
    en: 'Operation failed, please make sure the device is online'
  },
  enter_did: {
    zh: '请输入查询的DID或者保持设备在线!',
    en: 'Please enter the DID of the query or keep the device online'
  },
  history_devices: {
    zh: '历史设备',
    en: 'Historical Devices'
  },
  switch_server_notice: {
    zh: '切换服务器后，请重新连接设备',
    en: 'After switching server, please reconnect the device'
  },
  server: {
    zh: '服务器',
    en: 'Server'
  },
  status: {
    zh: '状态',
    en: 'Status'
  },
  multiple_app_tips: {
    zh: '服务器同时打开多个LDT应用是不支持的, 已经有其他LDT应用在运行, 请先关闭其他LDT应用',
    en: 'Running multiple LDT applications at the same time is not supported, there are already other LDT applications running, please close other LDT applications first'
  },
  base_info: {
    zh: '基本信息',
    en: 'Base Info'
  },
  quick_fillter_tips: {
    zh: '点击具体数值即可快速勾选高级过滤条件',
    en: 'Click on the specific value to quickly check the advanced filter conditions'
  },
  download: {
    zh: '下载',
    en: 'Download'
  },
  login: {
    zh: '登录',
    en: 'Login'
  },
  logout: {
    zh: '登出',
    en: 'Logout'
  },
  login_notice: {
    zh: '使用该功能前需要先授权登录员工账号',
    en: 'Before using, it is necessary to authorize the employee account'
  },
  my_creation: {
    zh: '我创建的',
    en: 'My creation'
  },
  all_config: {
    zh: '全部配置',
    en: 'All configs'
  },
  my_collection: {
    zh: '我的收藏',
    en: 'My collection'
  },
  config_append: {
    zh: '配置',
    en: ' config'
  },
  config_name: {
    zh: '配置名',
    en: 'Config name'
  },
  config_no_name: {
    zh: '未命名配置',
    en: 'Unnamed Configuration'
  },
  config_name_empty_notice: {
    zh: '配置名不能为空！',
    en: 'Config name cannot be empty!'
  },
  config_name_filter: {
    zh: '输入配置名查询',
    en: 'config name filter'
  },
  config_name_input_placeholder: {
    zh: '请输入配置名称',
    en: 'input config name'
  },
  config_name_placeholder: {
    zh: '设置标题方便区分，未设置将随机生成',
    en: 'Set title for easy differentiation, not set, will be randomly generated'
  },
  create: {
    zh: '创建',
    en: 'create'
  },
  creator: {
    zh: '创建人',
    en: 'Creator'
  },
  update_time: {
    zh: '修改时间',
    en: 'UpdatedAt'
  },
  operation: {
    zh: '操作',
    en: 'Operation'
  },
  manual_import: {
    zh: '手动导入mapLocal文件',
    en: 'Manually importing mapLocal files'
  },
  ldt_not_open_notice: {
    zh: '请先在设备上打开LDT!',
    en: 'Please open LDT on the device first!'
  },
  proxy_rule_test: {
    zh: '代理规则测试',
    en: 'Proxy Rule Testing'
  },
  pass: {
    zh: '通过',
    en: 'Pass'
  },
  not_pass: {
    zh: '不通过',
    en: 'No pass'
  },
  export_not_support: {
    zh: '暂不支持导出',
    en: 'Export not currently supported'
  },
  export_proxy_browser_not_support: {
    zh: '由于浏览器无法直接读取本地文件,所以请选择手动导入MapLocal中To的Data文件!',
    en: 'Due to the browser being unable to directly read the local file, please choose to manually import the To data file in MapLocal!'
  },
  export_no_config_notice: {
    zh: '请勾选选择导出的配置!',
    en: 'Please check to select the exported config!'
  },
  export_charles_notice: {
    zh: '由于浏览器无法直接读取本地文件,所以导出的mapLocal配置需要在Charles里面手动导入Data文件!',
    en: "Due to the browser's inability to directly read local files, the exported mapLocal configuration needs to be manually imported into the Data file in Charles!"
  },
  export_proxy_confirm_pre: {
    zh: '您即将导出',
    en: 'You are about to export'
  },
  export_proxy_confirm_append: {
    zh: '份文件！',
    en: 'files'
  },
  new_config: {
    zh: '新建配置集',
    en: 'New config'
  },
  proxy_config_no_select_notice: {
    zh: '请选择目标配置集',
    en: 'Please select the target config set'
  },
  testbench_notice: {
    zh: '请先点击“Start record”，再打开App端的Lynx页面，这样才能录制到完整的数据',
    en: 'No valid data recorded! Please start record before opening the lynx page'
  },
  type: {
    zh: '类型',
    en: 'Type'
  },
  data_type: {
    zh: '数据类型',
    en: 'Data type'
  },
  default_value: {
    zh: '默认值',
    en: 'Default value'
  },
  description: {
    zh: '说明',
    en: 'Description'
  },
  config_list: {
    zh: '配置项列表',
    en: 'Config list'
  },
  config_group: {
    zh: '配置集',
    en: 'config group'
  },
  config_group_list: {
    zh: '配置集列表',
    en: 'Config group list'
  },
  config_group_name_filter: {
    zh: '输入配置集名称检索',
    en: 'config group name filter'
  },
  config_group_name: {
    zh: '配置集名称',
    en: 'Config group name'
  },
  more: {
    zh: '更多',
    en: 'more'
  },
  view: {
    zh: '查看',
    en: 'view'
  },
  platform: {
    zh: '平台',
    en: 'Platform'
  },
  app: {
    zh: '客户端',
    en: 'App'
  },
  platform_config: {
    zh: '平台配置项',
    en: 'platform config'
  },
  is_common_config: {
    zh: '是否通用配置项',
    en: 'Is it a common config'
  },
  is_common_config_tips: {
    zh: '通用配置项无关宿主，添加后在所有宿主中可见',
    en: 'Common config is not related to the host and is visible in all hosts after addition'
  },
  not_empty_append: {
    zh: '不能为空',
    en: ' is required'
  },
  add_group: {
    zh: '添加组',
    en: 'add group'
  },
  input_group_placeholder: {
    zh: '请输入组名',
    en: 'input config group name'
  },
  selected_config_notice: {
    zh: '已选配置项数:',
    en: 'Number of selected configs'
  },
  not_exist: {
    zh: '不存在',
    en: 'not exists'
  },
  config_group_name_empty_error: {
    zh: '配置集名称不能为空',
    en: 'Config group name cannot be empty'
  },
  group_exist: {
    zh: '组名已经存在',
    en: 'Group name already exists'
  },
  group_empty_error: {
    zh: '组名不能为空',
    en: 'Group name cannot be empty'
  },
  diagnose: {
    zh: '诊断',
    en: 'Diagnose'
  },
  start_diagnose: {
    zh: '发起诊断',
    en: 'start diagnose'
  },
  diagnose_result: {
    zh: '诊断结果',
    en: ' Diagnose Result'
  },
  view_detail: {
    zh: '查看详情',
    en: 'view detail'
  },
  view_suggestion: {
    zh: '查看详情',
    en: 'view suggestion'
  },
  network: {
    zh: '网络',
    en: 'Network'
  },
  env: {
    zh: '环境',
    en: 'Env'
  },
  config: {
    zh: '配置',
    en: 'Config'
  },
  diagnosis_passed: {
    zh: '诊断通过',
    en: 'Diagnosis passed'
  },
  diagnose_desc: {
    zh: '诊断工具用来诊断调试中网络、环境、配置是否存在问题',
    en: 'Used to find problems with the network, environment, and configuration during debugging'
  },
  diagnose_timeout: {
    zh: '客户端诊断失败，请确认当前设备在线且LDT版本>=1.4.0',
    en: 'Client diagnosis failed. Please confirm that the current device is online and the LDT version is>=1.4.0'
  },
  offline_recommand: {
    zh: '推荐使用离线版本，具有更完善的功能和稳定性，详见：',
    en: 'We recommended you to use the offline version, which has more complete functions and stability. Please refer to: '
  },
  network_prefix: {
    zh: '当前网络不稳定，',
    en: 'Current network is unstable, '
  },
  lynx_memory_not_work_notice: {
    zh: '使用Memory能力，需要Lynx版本>=2.9！',
    en: 'To use the Memory capability, Lynx version>=2.9 is required!'
  },
  support_in_offline: {
    zh: '仅在离线版本支持',
    en: 'Only supported in offline version'
  },
  support_in_offline_pre: {
    zh: '请按照',
    en: 'Please follow the '
  },
  support_in_offline_append: {
    zh: '指引使用离线版本',
    en: ' guidelines to use the offline version'
  },
  https_will_try_replace: {
    zh: '检测到当前协议为https，这将导致LDT功能异常，3秒后将尝试自动切换...',
    en: 'Https protocol will cause malfunction. Redirecting in 3 seconds...'
  },
  https_fix_suggestions: {
    zh: '检测到当前协议仍为https，请尝试手动将网址前缀修改为http后访问。如果修改后仍被强制替换，请参考：',
    en: 'Https protocol will cause malfunction. Please change URL prefix to http. If manual change does not work, please refer to:'
  },
  https_how_to_disable: {
    zh: '如何关闭浏览器强制https选项',
    en: 'How to turn off force-https option in Chrome'
  },
  app_select_session_success: {
    zh: '客户端切换卡片成功',
    en: 'Successfully switched client cards'
  },
  add_to_bam_scene: {
    zh: '添加到BAM场景',
    en: 'Add to BAM scene'
  },
  expectation_name: {
    zh: '期望名称',
    en: 'Expected name'
  },
  no_scene_permission: {
    zh: '无场景权限，请联系场景负责人{{owner}}添加权限',
    en: 'No scene Permissions, please contact the scene owner {{owner}} to add permissions'
  },
  please_input: {
    zh: '请输入',
    en: 'Please input'
  },
  please_select: {
    zh: '请选择',
    en: 'Please select'
  },
  required: {
    zh: '必填项',
    en: 'Required'
  },
  branch: {
    zh: '分支',
    en: 'Branch'
  },
  version: {
    zh: '版本',
    en: 'Version'
  },
  no_psm_permission: {
    zh: '无psm权限',
    en: 'No psm Permission'
  },
  no_such_api_in_psm: {
    zh: '该psm下无此接口',
    en: 'There is no such API in this psm'
  },
  service_group: {
    zh: '服务分组',
    en: 'Service group'
  },
  refresh: {
    zh: '刷新',
    en: 'Refresh'
  },
  mock_scene: {
    zh: 'Mock场景',
    en: 'Mock scene'
  },
  no_suitable_scene: {
    zh: '没有合适的场景？',
    en: 'No suitable scene? '
  },
  to_add: {
    zh: '去添加',
    en: 'To add.'
  },
  tip_after_add: {
    zh: '添加后需手动点击刷新',
    en: 'After adding, you need to manually click refresh'
  },
  branch_version: {
    zh: '分支版本',
    en: 'Branch or version'
  },
  select_branch_tip: {
    zh: '该psm未添加到场景中，需选择分支版本',
    en: 'The psm has not been added to the scene, you need to select branch or version'
  },
  service_group_tip: {
    zh: '默认展示收藏数据，支持远程搜索',
    en: 'Collection data is displayed by default and remote search is supported.'
  },
  // devmode
  ldt_test_mode: {
    zh: '测试模式',
    en: 'Test Mode'
  },
  ldt_test_mode_config: {
    zh: 'LDT测试模式配置',
    en: 'LDT Test Mode Config'
  },
  ldt_test_mode_downloading_target_version: {
    zh: '正在下载指定的LDT版本',
    en: 'Downloading target LDT version'
  },
  ldt_test_mode_download_target_version_success_toast: {
    zh: '下载成功，重启LDT后生效。',
    en: 'Download succeeded. Restart LDT to apply target version.'
  },
  ldt_test_mode_download_target_version_fail_toast: {
    zh: '下载失败，错误信息在终端中。',
    en: 'Download failed. Check terminal for details.'
  },
  proxy_host_notice: {
    zh: '如果使用 0.0.0.0 ，客户端会用当前连接的PC端的本机IP替换。（需LDT客户端SDK版本：Android >= 2.0.15, iOS >= 6.0.2）',
    en: 'If use 0.0.0.0 , the client will replace it with the local IP of the PC currently connected.(LDT client SDK version required: Android >= 2.0.15, iOS >= 6.0.2)'
  },
  devtool_abnormal_title: {
    zh: '{{type}}DevTool 功能异常',
    en: '{{type}}DevTool feature abnormality'
  },
  devtool_abnormal_notice: {
    zh: '检测到客户端打开了{{type}}卡片，但平台没有反应',
    en: "Detected that client opened a {{type}} card, but platform didn't respond."
  },
  devtool_abnormal_close_notice: {
    zh: '24小时内不再提示',
    en: 'No more reminders within 24 hours'
  },
  debug_mode_not_support: {
    zh: '客户端LDT版本过低，不支持卡片调试模式',
    en: 'The LDT version of the client is outdated and does not support card debugging mode'
  }
};