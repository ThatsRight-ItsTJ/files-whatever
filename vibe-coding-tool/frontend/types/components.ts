
import type { BaseComponentProps } from './index'

// Type alias for React types to avoid import issues
type ReactNode = any
type MouseEvent<T = Element> = any
type ChangeEvent<T = Element> = any
type FocusEvent<T = Element> = any
type CSSProperties = any

// Button Component Props
export interface ButtonProps extends BaseComponentProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  loading?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  type?: 'button' | 'submit' | 'reset'
  href?: string
  target?: string
  rel?: string
}

// Input Component Props
export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'url' | 'tel'
  placeholder?: string
  value?: string | number
  disabled?: boolean
  readOnly?: boolean
  error?: string
  helperText?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
  maxLength?: number
  minLength?: number
  required?: boolean
  autoFocus?: boolean
}

// Textarea Component Props
export interface TextareaProps extends BaseComponentProps {
  placeholder?: string
  value?: string
  disabled?: boolean
  readOnly?: boolean
  error?: string
  helperText?: string
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void
  maxLength?: number
  minLength?: number
  required?: boolean
  autoFocus?: boolean
  rows?: number
  cols?: number
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

// Select Component Props
export interface SelectProps extends BaseComponentProps {
  options: Array<{ value: string; label: string; disabled?: boolean }>
  value?: string | string[]
  placeholder?: string
  disabled?: boolean
  error?: string
  helperText?: string
  onChange?: (value: string | string[]) => void
  onBlur?: (event: React.FocusEvent<HTMLSelectElement>) => void
  onFocus?: (event: React.FocusEvent<HTMLSelectElement>) => void
  required?: boolean
  multiple?: boolean
  autoFocus?: boolean
}

// Checkbox Component Props
export interface CheckboxProps extends BaseComponentProps {
  checked?: boolean
  disabled?: boolean
  error?: string
  helperText?: string
  onChange?: (checked: boolean) => void
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
  required?: boolean
  autoFocus?: boolean
  indeterminate?: boolean
}

// Radio Group Component Props
export interface RadioGroupProps extends BaseComponentProps {
  options: Array<{ value: string; label: string; disabled?: boolean }>
  value?: string
  disabled?: boolean
  error?: string
  helperText?: string
  onChange?: (value: string) => void
  required?: boolean
  orientation?: 'horizontal' | 'vertical'
}

// Card Component Props
export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  clickable?: boolean
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
  header?: React.ReactNode
  footer?: React.ReactNode
}

// Table Component Props
export interface TableProps extends BaseComponentProps {
  data: any[]
  columns: TableColumn[]
  striped?: boolean
  bordered?: boolean
  hoverable?: boolean
  loading?: boolean
  emptyMessage?: string
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
  }
  sorting?: {
    key: string
    direction: 'asc' | 'desc'
    onSort: (key: string, direction: 'asc' | 'desc') => void
  }
  selection?: {
    selectedRows: string[]
    onSelectionChange: (selectedRows: string[]) => void
    selectable?: boolean
  }
}

export interface TableColumn {
  key: string
  title: string
  dataIndex: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, record: any, index: number) => React.ReactNode
}

// Modal Component Props
export interface ModalProps extends BaseComponentProps {
  open: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  maskClosable?: boolean
  footer?: React.ReactNode
  destroyOnClose?: boolean
  centered?: boolean
  keyboard?: boolean
  mask?: boolean
  maskStyle?: React.CSSProperties
  bodyStyle?: React.CSSProperties
  headerStyle?: React.CSSProperties
  footerStyle?: React.CSSProperties
}

// Form Component Props
export interface FormProps extends BaseComponentProps {
  initialValues?: Record<string, any>
  onSubmit: (values: Record<string, any>) => void | Promise<void>
  onReset?: () => void
  validate?: (values: Record<string, any>) => Record<string, string> | Promise<Record<string, string>>
  layout?: 'horizontal' | 'vertical' | 'inline'
  size?: 'small' | 'middle' | 'large'
  disabled?: boolean
  loading?: boolean
  requiredMark?: boolean | 'optional'
  colon?: boolean
  labelAlign?: 'left' | 'right'
  labelWrap?: boolean
  labelCol?: React.CSSProperties
  wrapperCol?: React.CSSProperties
}

export interface FormItemProps extends BaseComponentProps {
  label?: string
  name?: string
  rules?: FormRule[]
  dependencies?: string[]
  required?: boolean
  validateTrigger?: string | string[] | 'onChange' | 'onBlur' | 'onSubmit'
  help?: string
  extra?: string
  hasFeedback?: boolean
  validateStatus?: 'success' | 'warning' | 'error' | 'validating' | ''
  noStyle?: boolean
  children: React.ReactNode
}

export interface FormRule {
  required?: boolean
  message?: string
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date' | 'email' | 'url'
  min?: number
  max?: number
  len?: number
  pattern?: RegExp
  validator?: (rule: any, value: any) => Promise<void> | void
  transform?: (value: any) => any
  whitespace?: boolean
}

// Tooltip Component Props
export interface TooltipProps extends BaseComponentProps {
  title: React.ReactNode
  placement?: 'top' | 'left' | 'right' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom'
  trigger?: 'hover' | 'focus' | 'click' | 'contextMenu'
  mouseEnterDelay?: number
  mouseLeaveDelay?: number
  overlayStyle?: React.CSSProperties
  overlayClassName?: string
  arrowPointAtCenter?: boolean
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
  zIndex?: number
}

// Popover Component Props
export interface PopoverProps extends BaseComponentProps {
  title?: React.ReactNode
  content: React.ReactNode
  placement?: 'top' | 'left' | 'right' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom'
  trigger?: 'hover' | 'focus' | 'click' | 'contextMenu'
  mouseEnterDelay?: number
  mouseLeaveDelay?: number
  overlayStyle?: React.CSSProperties
  overlayClassName?: string
  arrowPointAtCenter?: boolean
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
  zIndex?: number
  destroyTooltipOnHide?: boolean
}

// Dropdown Component Props
export interface DropdownProps extends BaseComponentProps {
  menu: DropdownMenuItem[]
  trigger?: 'hover' | 'click' | 'contextMenu'
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'
  arrow?: boolean
  disabled?: boolean
  overlayStyle?: React.CSSProperties
  overlayClassName?: string
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
  zIndex?: number
}

export interface DropdownMenuItem {
  key: string
  label: React.ReactNode
  icon?: React.ReactNode
  disabled?: boolean
  danger?: boolean
  divider?: boolean
  onClick?: () => void
  children?: DropdownMenuItem[]
}

// Tabs Component Props
export interface TabsProps extends BaseComponentProps {
  items: TabItem[]
  activeKey?: string
  defaultActiveKey?: string
  onChange?: (activeKey: string) => void
  type?: 'line' | 'card' | 'editable-card'
  size?: 'small' | 'middle' | 'large'
  centered?: boolean
  tabPosition?: 'top' | 'right' | 'bottom' | 'left'
  addable?: boolean
  editable?: {
    onEdit: (targetKey: string, action: 'add' | 'remove') => void
  }
  moreIcon?: React.ReactNode
  tabBarExtraContent?: React.ReactNode
}

export interface TabItem {
  key: string
  label: React.ReactNode
  icon?: React.ReactNode
  children: React.ReactNode
  disabled?: boolean
  closable?: boolean
  forceRender?: boolean
}

// Progress Component Props
export interface ProgressProps extends BaseComponentProps {
  percent?: number
  size?: 'small' | 'default' | 'large'
  type?: 'line' | 'circle' | 'dashboard'
  status?: 'success' | 'exception' | 'warning' | 'active'
  showInfo?: boolean
  strokeColor?: string | React.ReactNode
  trailColor?: string
  strokeWidth?: number
  width?: number
  format?: (percent: number) => React.ReactNode
  gapDegree?: number
  gapPosition?: 'top' | 'right' | 'bottom' | 'left'
}

// Badge Component Props
export interface BadgeProps extends BaseComponentProps {
  count?: number | React.ReactNode
  showZero?: boolean
  overflowCount?: number
  dot?: boolean
  status?: 'success' | 'processing' | 'default' | 'error' | 'warning'
  text?: string
  color?: string
  size?: 'default' | 'small'
  title?: string
}

// Avatar Component Props
export interface AvatarProps extends BaseComponentProps {
  src?: string
  alt?: string
  shape?: 'circle' | 'square'
  size?: number | 'small' | 'default' | 'large'
  icon?: React.ReactNode
  gap?: number
  style?: React.CSSProperties
  className?: string
  children?: React.ReactNode
}

// List Component Props
export interface ListProps extends BaseComponentProps {
  items: ListItem[]
  loading?: boolean
  dataSource?: any[]
  renderItem?: (item: any, index: number) => React.ReactNode
  size?: 'small' | 'default' | 'large'
  bordered?: boolean
  split?: boolean
  grid?: {
    gutter?: number | [number, number]
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    xxl?: number
  }
  pagination?: {
    current: number
    pageSize: number
    total: number
    onChange: (page: number, pageSize: number) => void
  }
}

export interface ListItem {
  key?: string | number
  actions?: React.ReactNode[]
  extra?: React.ReactNode
  avatar?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
}

// Alert Component Props
export interface AlertProps extends BaseComponentProps {
  type?: 'success' | 'info' | 'warning' | 'error'
  message: React.ReactNode
  description?: React.ReactNode
  showIcon?: boolean
  closable?: boolean
  closeText?: React.ReactNode
  action?: React.ReactNode
  banner?: boolean
  icon?: React.ReactNode
  style?: React.CSSProperties
  className?: string
  afterClose?: () => void
}

// Message Component Props
export interface MessageProps extends BaseComponentProps {
  content: React.ReactNode
  duration?: number
  type?: 'success' | 'info' | 'warning' | 'error' | 'loading'
  icon?: React.ReactNode
  closable?: boolean
  onClose?: () => void
  style?: React.CSSProperties
  className?: string
}

// Notification Component Props
export interface NotificationProps extends BaseComponentProps {
  message: React.ReactNode
  description?: React.ReactNode
  duration?: number
  type?: 'success' | 'info' | 'warning' | 'error'
  icon?: React.ReactNode
  placement?: 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight'
  closable?: boolean
  onClose?: () => void
  btn?: React.ReactNode
  style?: React.CSSProperties
  className?: string
  top?: number
  bottom?: number
  getContainer?: () => HTMLElement
}

// Spin Component Props
export interface SpinProps extends BaseComponentProps {
  spinning?: boolean
  size?: 'small' | 'default' | 'large'
  tip?: string
  delay?: number
  indicator?: React.ReactNode
  wrapperClassName?: string
  style?: React.CSSProperties
}

// Tag Component Props
export interface TagProps extends BaseComponentProps {
  color?: string
  closable?: boolean
  visible?: boolean
  onClose?: () => void
  checked?: boolean
  onChange?: (checked: boolean) => void
  prefixCls?: string
  className?: string
  style?: React.CSSProperties
}

// Rate Component Props
export interface RateProps extends BaseComponentProps {
  count?: number
  value?: number
  defaultValue?: number
  allowHalf?: boolean
  disabled?: boolean
  tooltips?: string[]
  onChange?: (value: number) => void
  onHoverChange?: (value: number) => void
  character?: React.ReactNode
  characterRender?: (node: React.ReactNode, index: number) => React.ReactNode
}

// Switch Component Props
export interface SwitchProps extends BaseComponentProps {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  loading?: boolean
  size?: 'default' | 'small'
  checkedChildren?: React.ReactNode
  unCheckedChildren?: React.ReactNode
  onChange?: (checked: boolean) => void
  onClick?: (checked: boolean) => void
}

// Slider Component Props
export interface SliderProps extends BaseComponentProps {
  min?: number
  max?: number
  step?: number
  value?: number | [number, number]
  defaultValue?: number | [number, number]
  disabled?: boolean
  range?: boolean
  dots?: boolean
  marks?: Record<number | string, React.ReactNode | { style?: React.CSSProperties; label?: React.ReactNode }>
  included?: boolean
  tooltipVisible?: boolean
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right'
  getTooltipPopupContainer?: (triggerNode: HTMLElement) => HTMLElement
  onChange?: (value: number | [number, number]) => void
  onAfterChange?: (value: number | [number, number]) => void
}

// Upload Component Props
export interface UploadProps extends BaseComponentProps {
  name?: string
  action?: string | ((file: File) => Promise<string>)
  accept?: string
  multiple?: boolean
  showUploadList?: boolean
  fileList?: UploadFile[]
  defaultFileList?: UploadFile[]
  beforeUpload?: (file: File, fileList: File[]) => boolean | Promise<boolean>
  onChange?: (info: UploadChangeParam) => void
  onRemove?: (file: UploadFile) => void
  onPreview?: (file: UploadFile) => void
  onDownload?: (file: UploadFile) => void
  customRequest?: (options: any) => void
  disabled?: boolean
  listType?: 'text' | 'picture' | 'picture-card'
  className?: string
  style?: React.CSSProperties
  headers?: Record<string, string>
  data?: Record<string, any>
  withCredentials?: boolean
  openFileDialogOnClick?: boolean
}

export interface UploadFile {
  uid: string
  name: string
  status?: 'uploading' | 'done' | 'error' | 'removed'
  url?: string
  response?: any
  linkProps?: any
  type?: string
  size?: number
  originFileObj?: File
  preview?: string
}

export interface UploadChangeParam {
  file: UploadFile
  fileList: UploadFile[]
  event?: ProgressEvent
}

// Tree Component Props
export interface TreeProps extends BaseComponentProps {
  treeData: TreeNode[]
  checkedKeys?: string[]
  defaultCheckedKeys?: string[]
  selectedKeys?: string[]
  defaultSelectedKeys?: string[]
  expandedKeys?: string[]
  defaultExpandedKeys?: string[]
  multiple?: boolean
  checkable?: boolean
  selectable?: boolean
  showLine?: boolean
  showIcon?: boolean
  icon?: React.ReactNode
  switcherIcon?: React.ReactNode
  draggable?: boolean
  blockNode?: boolean
  loadData?: (treeNode: TreeNode) => Promise<void>
  onCheck?: (checkedKeys: string[], info: { node: TreeNode; checked: boolean; halfCheckedKeys: string[] }) => void
  onSelect?: (selectedKeys: string[], info: { selected: boolean; selectedNodes: TreeNode[]; node: TreeNode }) => void
  onExpand?: (expandedKeys: string[], info: { node: TreeNode; expanded: boolean }) => void
  onDragStart?: (info: { node: TreeNode; event: React.MouseEvent }) => void
  onDragOver?: (info: { node: TreeNode; event: React.MouseEvent }) => void
  onDrop?: (info: { dragNode: TreeNode; dropNode: TreeNode; dropPosition: number }) => void
}

export interface TreeNode {
  key: string
  title: React.ReactNode
  children?: TreeNode[]
  selectable?: boolean
  disabled?: boolean
  disableCheckbox?: boolean
  checkable?: boolean
  expanded?: boolean
  selected?: boolean
  halfChecked?: boolean
  icon?: React.ReactNode
  switcherIcon?: React.ReactNode
}

// Calendar Component Props
export interface CalendarProps extends BaseComponentProps {
  value?: Date
  defaultValue?: Date
  mode?: 'year' | 'month' | 'date'
  fullscreen?: boolean
  locale?: any
  headerRender?: (current: Date) => React.ReactNode
  validRange?: [Date, Date]
  disabledDate?: (current: Date) => boolean
  dateCellRender?: (current: Date) => React.ReactNode
  monthCellRender?: (current: Date) => React.ReactNode
  onSelect?: (date: Date) => void
  onPanelChange?: (date: Date, mode: string) => void
}

// DatePicker Component Props
export interface DatePickerProps extends BaseComponentProps {
  value?: Date
  defaultValue?: Date
  placeholder?: string
  disabled?: boolean
  format?: string
  showTime?: boolean
  showToday?: boolean
  showNow?: boolean
  disabledDate?: (current: Date) => boolean
  onChange?: (date: Date, dateString: string) => void
  onOk?: (date: Date) => void
  style?: React.CSSProperties
  className?: string
  popupStyle?: React.CSSProperties
  dropdownClassName?: string
  size?: 'small' | 'middle' | 'large'
  borderless?: boolean
}

// TimePicker Component Props
export interface TimePickerProps extends BaseComponentProps {
  value?: Date
  defaultValue?: Date
  placeholder?: string
  disabled?: boolean
  format?: string
  use12Hours?: boolean
  onChange?: (time: Date, timeString: string) => void
  onOk?: (time: Date) => void
  style?: React.CSSProperties
  className?: string
  popupStyle?: React.CSSProperties
  dropdownClassName?: string
  size?: 'small' | 'middle' | 'large'
  borderless?: boolean
}

// Select Search Component Props
export interface SelectSearchProps extends BaseComponentProps {
  options: Array<{ value: string; label: string; disabled?: boolean }>
  value?: string | string[]
  placeholder?: string
  disabled?: boolean
  error?: string
  helperText?: string
  onChange?: (value: string | string[]) => void
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
  required?: boolean
  multiple?: boolean
  autoFocus?: boolean
  showSearch?: boolean
  filterOption?: (input: string, option: any) => boolean
  onSearch?: (value: string) => void
  notFoundContent?: React.ReactNode
  allowClear?: boolean
  clearIcon?: React.ReactNode
  searchIcon?: React.ReactNode
  suffixIcon?: React.ReactNode
  loading?: boolean
}

// Tree Select Component Props
export interface TreeSelectProps extends BaseComponentProps {
  treeData: TreeNode[]
  value?: string | string[]
  defaultValue?: string | string[]
  placeholder?: string
  disabled?: boolean
  error?: string
  helperText?: string
  onChange?: (value: string | string[]) => void
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
  required?: boolean
  multiple?: boolean
  autoFocus?: boolean
  showSearch?: boolean
  allowClear?: boolean
  treeCheckable?: boolean
  showCheckedStrategy?: 'show-all' | 'show-parent' | 'show-child'
  dropdownStyle?: React.CSSProperties
  popupClassName?: string
  labelInValue?: boolean
}

// Cascader Component Props
export interface CascaderProps extends BaseComponentProps {
  options: Array<CascaderOption>
  value?: string | string[]
  defaultValue?: string | string[]
  placeholder?: string
  disabled?: boolean
  error?: string
  helperText?: string
  onChange?: (value: string | string[], selectedOptions: CascaderOption[]) => void
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
  required?: boolean
  multiple?: boolean
  autoFocus?: boolean
  showSearch?: boolean
  fieldNames?: { label?: string; value?: string; children?: string }
  expandTrigger?: 'click' | 'hover'
  changeOnSelect?: boolean
  displayRender?: (labels: string[]) => string
  popupClassName?: string
  dropdownRender?: (menus: React.ReactNode) => React.ReactNode
}

export interface CascaderOption {
  value: string
  label: string
  children?: CascaderOption[]
  disabled?: boolean
  isLeaf?: boolean
  loading?: boolean
}

// Transfer Component Props
export interface TransferProps extends BaseComponentProps {
  dataSource: TransferItem[]
  titles?: [string, string]
  targetKeys?: string[]
  selectedKeys?: string[]
  defaultTargetKeys?: string[]
  defaultSelectedKeys?: string[]
  onChange?: (targetKeys: string[], direction: 'left' | 'right', moveKeys: string[]) => void
  onSelectChange?: (selectedKeys: string[], direction: 'left' | 'right') => void
  onScroll?: (direction: 'left' | 'right', e: React.UIEvent<HTMLUListElement>) => void
  render?: (item: TransferItem) => React.ReactNode
  showSearch?: boolean
  filterOption?: (inputValue: string, item: TransferItem) => boolean
  searchPlaceholder?: string
  notFoundContent?: string
  style?: React.CSSProperties
  listStyle?: React.CSSProperties
  operations?: React.ReactNode[]
  footer?: (props: TransferProps) => React.ReactNode
  rowKey?: (record: TransferItem) => string
  disabled?: boolean
}

export interface TransferItem {
  key: string
  title: string
  description?: string
  chosen?: boolean
  disabled?: boolean
}

// AutoComplete Component Props
export interface AutoCompleteProps extends BaseComponentProps {
  options: Array<{ value: string; label: string; disabled?: boolean }>
  value?: string
  defaultValue?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  helperText?: string
  onChange?: (value: string) => void
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
  required?: boolean
  autoFocus?: boolean
  showSearch?: boolean
  filterOption?: (input: string, option: any) => boolean
  onSearch?: (value: string) => void
  notFoundContent?: React.ReactNode
  allowClear?: boolean
  clearIcon?: React.ReactNode
  suffixIcon?: React.ReactNode
  loading?: boolean
  onSelect?: (value: string, option: any) => void
  onDropdownVisibleChange?: (visible: boolean) => void
}

// Mentions Component Props
export interface MentionsProps extends BaseComponentProps {
  options: Array<{ value: string; label: string; disabled?: boolean }>
  value?: string
  defaultValue?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  helperText?: string
  onChange?: (value: string) => void
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void
  required?: boolean
  autoFocus?: boolean
  prefix?: string | string[]
  split?: string
  validateSearch?: (text: string, prefix: string) => boolean
  onSearch?: (text: string, prefix: string) => void
  filterOption?: (input: string, option: any) => boolean
  notFoundContent?: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

// Divider Component Props
export interface DividerProps extends BaseComponentProps {
  type?: 'horizontal' | 'vertical'
  orientation?: 'left' | 'center' | 'right'
  orientationMargin?: string | number
  dashed?: boolean
  plain?: boolean
  children?: React.ReactNode
}

// Space Component Props
export interface SpaceProps extends BaseComponentProps {
  size?: 'small' | 'middle' | 'large' | number
  direction?: 'horizontal' | 'vertical'
  align?: 'start' | 'end' | 'center' | 'baseline'
  wrap?: boolean
  split?: React.ReactNode
  style?: React.CSSProperties
}

// Typography Component Props
export interface TypographyProps extends BaseComponentProps {
  type?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  disabled?: boolean
  mark?: boolean
  code?: boolean
  keyboard?: boolean
  underline?: boolean
  delete?: boolean
  strong?: boolean
  italic?: boolean
  copyable?: boolean | { text: string; onCopy?: () => void }
  editable?: boolean | { text: string; onChange?: (text: string) => void; onStart?: () => void; onEnd?: () => void }
  ellipsis?: boolean | { rows: number; onEllipsis?: (ellipsis: boolean) => void }
  style?: React.CSSProperties
}

// Result Component Props
export interface ResultProps extends BaseComponentProps {
  status?: 'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500'
  title?: React.ReactNode
  subTitle?: React.ReactNode
  extra?: React.ReactNode
  icon?: React.ReactNode
  style?: React.CSSProperties
}

// Statistic Component Props
export interface StatisticProps extends BaseComponentProps {
  title?: React.ReactNode
  value?: number | string
  precision?: number
  valueStyle?: React.CSSProperties
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  loading?: boolean
  className?: string
  style?: React.CSSProperties
}

// Countdown Component Props
export interface CountdownProps extends BaseComponentProps {
  value?: number | Date
  valueStyle?: React.CSSProperties
  format?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  onFinish?: () => void
  onChange?: (value: number) => void
}

// Descriptions Component Props
export interface DescriptionsProps extends BaseComponentProps {
  title?: React.ReactNode
  column?: number | { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number }
  size?: 'middle' | 'small' | 'default'
  bordered?: boolean
  layout?: 'horizontal' | 'vertical'
  colon?: boolean
  items: DescriptionsItem[]
}

export interface DescriptionsItem {
  label?: React.ReactNode
  children: React.ReactNode
  span?: number
  labelStyle?: React.CSSProperties
  contentStyle?: React.CSSProperties
}

// PageHeader Component Props
export interface PageHeaderProps extends BaseComponentProps {
  title?: React.ReactNode
  subTitle?: React.ReactNode
  tags?: React.ReactNode
  extra?: React.ReactNode
  footer?: React.ReactNode
  breadcrumb?: React.ReactNode
  ghost?: boolean
  avatar?: React.ReactNode
  backIcon?: React.ReactNode
  onBack?: () => void
}

// Comment Component Props
export interface CommentProps extends BaseComponentProps {
  author?: React.ReactNode
  avatar?: React.ReactNode
  content?: React.ReactNode
  datetime?: React.ReactNode
  actions?: React.ReactNode[]
  align?: 'left' | 'right'
  style?: React.CSSProperties
}

// Steps Component Props
export interface StepsProps extends BaseComponentProps {
  current?: number
  status?: 'wait' | 'process' | 'finish' | 'error'
  direction?: 'horizontal' | 'vertical'
  labelPlacement?: 'horizontal' | 'vertical'
  progressDot?: boolean | ((dot: React.ReactNode, { status, index }: { status: string; index: number }) => React.ReactNode)
  size?: 'default' | 'small'
  items: StepItem[]
  onChange?: (current: number) => void
}

export interface StepItem {
  key?: string
  title?: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  status?: 'wait' | 'process' | 'finish' | 'error'
  disabled?: boolean
}

// Timeline Component Props
export interface TimelineProps extends BaseComponentProps {
  mode?: 'left' | 'right' | 'alternate'
  reverse?: boolean
  items: TimelineItem[]
}

export interface TimelineItem {
  color?: string
  dot?: React.ReactNode
  label?: React.ReactNode
  children: React.ReactNode
}

// Timeline.Item Component Props
export interface TimelineItemProps extends BaseComponentProps {
  color?: string
  dot?: React.ReactNode
  label?: React.ReactNode
  children: React.ReactNode
}

// Empty Component Props
export interface EmptyProps extends BaseComponentProps {
  image?: React.ReactNode
  imageStyle?: React.CSSProperties
  description?: React.ReactNode
  children?: React.ReactNode
}

// Image Component Props
export interface ImageProps extends BaseComponentProps {
  src?: string
  alt?: string
  width?: number | string
  height?: number | string
  fallback?: string
  placeholder?: React.ReactNode
  preview?: boolean | { mask?: React.ReactNode; maskClassName?: string }
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void
  style?: React.CSSProperties
  className?: string
}

// Skeleton Component Props
export interface SkeletonProps extends BaseComponentProps {
  active?: boolean
  loading?: boolean
  avatar?: boolean | { shape?: 'circle' | 'square'; size?: number | 'large' | 'small' | 'default' }
  title?: boolean | { width?: number | string }
  paragraph?: boolean | { rows?: number; width?: number | string[] }
  round?: boolean
  children?: React.ReactNode
}

// Layout Component Props
export interface LayoutProps extends BaseComponentProps {
  hasSider?: boolean
  style?: React.CSSProperties
}

export interface HeaderProps extends BaseComponentProps {
  style?: React.CSSProperties
}

export interface FooterProps extends BaseComponentProps {
  style?: React.CSSProperties
}

export interface ContentProps extends BaseComponentProps {
  style?: React.CSSProperties
}

export interface SiderProps extends BaseComponentProps {
  collapsible?: boolean
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
  reverseArrow?: boolean
  trigger?: React.ReactNode
  width?: number | string
  collapsedWidth?: number | string
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  theme?: 'light' | 'dark'
  style?: React.CSSProperties
}

// ConfigProvider Component Props
export interface ConfigProviderProps extends BaseComponentProps {
  theme?: {
    primaryColor?: string
    infoColor?: string
    successColor?: string
    processingColor?: string
    errorColor?: string
    warningColor?: string
    token?: any
  }
  locale?: any
  direction?: 'ltr' | 'rtl'
  space?: any
  form?: any
  input?: any
  pagination?: any
  table?: any
  transfer?: any
  tree?: any
  typography?: any
  alert?: any
  anchor?: any
  avatar?: any
  badge?: any
  breadcrumb?: any
  button?: any
  calendar?: any
  card?: any
  carousel?: any
  cascader?: any
  checkbox?: any
  collapse?: any
  colorPicker?: any
  comment?: any
  configProvider?: any
  date-picker?: any
  divider?: any
  drawer?: any
  dropdown?: any
  empty?: any
  form?: any
  grid?: any
  image?: any
  input?: any
  input-number?: any
  layout?: any
  list?: any
  menu?: any
  message?: any
  modal?: any
  notification?: any
  page-header?: any
  pagination?: any
  popconfirm?: any
  popover?: any
  progress?: any
  radio?: any
  rate?: any
  result?: any
  select?: any
  skeleton?: any
  slider?: any
  space?: any
  spin?: any
  statistic?: any
  steps?: any
  switch?: any
  table?: any
  tabs?: any
  tag?: any
  time-picker?: any
  timeline?: any
  tooltip?: any
  transfer?: any
  tree-select?: any
  typography?: any
  upload?: any
  water-mark?: any
}

// FormattedMessage Component Props
export interface FormattedMessageProps {
  id?: string
  description?: string
  defaultMessage?: string
  values?: Record<string, React.ReactNode>
  tagName?: keyof JSX.IntrinsicElements
  className?: string
}

// ConfigConsumer Component Props
export interface ConfigConsumerProps {
  getPrefixCls: (suffixCls?: string, customizePrefix?: string) => string
  direction?: 'ltr' | 'rtl'
  locale?: any
  space?: any
  form?: any
  input?: any
  pagination?: any
  table?: any
  transfer?: any
  tree?: any
  typography?: any
  alert?: any
  anchor?: any
  avatar?: any
  badge?: any
  breadcrumb?: any
  button?: any
  calendar?: any
  card?: any
  carousel?: any
  cascader?: any
  checkbox?: any
  collapse?: any
  colorPicker?: any
  comment?: any
  configProvider?: any
  date-picker?: any
  divider?: any
  drawer?: any
  dropdown?: any
  empty?: any
  form?: any
  grid?: any
  image?: any
  input?: any
  input-number?: any
  layout?: any
  list?: any
  menu?: any
  message?: any
  modal?: any
  notification?: any
  page-header?: any
  pagination?: any
  popconfirm?: any
  popover?: any
  progress?: any
  radio?: any
  rate?: any
  result?: any
  select?: any
  skeleton?: any
  slider?: any
  space?: any
  spin?: any
  statistic?: any
  steps?: any
  switch?: any
  table?: any
  tabs?: any
  tag?: any
  time-picker?: any
  timeline?: any
  tooltip?: any
  transfer?: any
  tree-select?: any
  typography?: any
  upload?: any
  water-mark?: any
}

// Theme Consumer Component Props
export interface ThemeConsumerProps {
  children: (theme: any) => React.ReactNode
}

// SizeContext Component Props
export interface SizeContextProps {
  size?: 'small' | 'middle' | 'large'
  children: (size: 'small' | 'middle' | 'large') => React.ReactNode
}

// Breakpoint Component Props
export interface BreakpointProps {
  children: (breakpoint: string) => React.ReactNode
}

// Responsive Component Props
export interface ResponsiveProps {
  children: (matches: boolean) => React.ReactNode
  query: string
}

// MediaQuery Component Props
export interface MediaQueryProps {
  children: (matches: boolean) => React.ReactNode
  query: string
}

// DeviceProvider Component Props
export interface DeviceProviderProps {
  children: (device: { mobile: boolean; tablet: boolean; desktop: boolean }) => React.ReactNode
}

// ResponsiveObserver Component Props
export interface ResponsiveObserverProps {
  children: (responsive: { xs: boolean; sm: boolean; md: boolean; lg: boolean; xl: boolean; xxl: boolean }) => React.ReactNode
  breakpoints?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    xxl?: number
  }
}

// BreakpointProvider Component Props
export interface BreakpointProviderProps {
  children: (breakpoint: string) => React.ReactNode
  breakpoints?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    xxl?: number
  }
}

// ResponsiveConsumer Component Props
export interface ResponsiveConsumerProps {
  children: (responsive: { xs: boolean; sm: boolean; md: boolean; lg: boolean; xl: boolean; xxl: boolean }) => React.ReactNode
}

// BreakpointConsumer Component Props
export interface BreakpointConsumerProps {
  children: (breakpoint: string) => React.ReactNode
}

// ResponsiveContext Component Props
export interface ResponsiveContextProps {
  responsive: { xs: boolean; sm: boolean; md: boolean; lg: boolean; xl: boolean; xxl: boolean }
}

// BreakpointContext Component Props
export interface BreakpointContextProps {
  breakpoint: string
}

// SizeContextProvider Component Props
export interface SizeContextProviderProps {
  size?: 'small' | 'middle' | 'large'
  children: React.ReactNode
}

// SizeContextConsumer Component Props
export interface SizeContextConsumerProps {
  children: (size: 'small' | 'middle' | 'large') => React.ReactNode
}

// ConfigProviderContext Component Props
export interface ConfigProviderContextProps {
  getPrefixCls: (suffixCls?: string, customizePrefix?: string) => string
  direction?: 'ltr' | 'rtl'
  locale?: any
  space?: any
  form?: any
  input?: any
  pagination?: any
  table?: any
  transfer?: any
  tree?: any
  typography?: any
  alert?: any
  anchor?: any
  avatar?: any
  badge?: any
  breadcrumb?: any
  button?: any
  calendar?: any
  card?: any
  carousel?: any
  cascader?: any
  checkbox?: any
  collapse?: any
  colorPicker?: any
  comment?: any
  configProvider?: any
  date-picker?: any
  divider?: any
  drawer?: any
  dropdown?: any
  empty?: any
  form?: any
  grid?: any
  image?: any
  input?: any
  input-number?: any
  layout?: any
  list?: any
  menu?: any
  message?: any
  modal?: any
  notification?: any
  page-header?: any
  pagination?: any
  popconfirm?: any
  popover?: any
  progress?: any
  radio?: any
  rate?: any
  result?: any
  select?: any
  skeleton?: any
  slider?: any
  space?: any
  spin?: any
  statistic?: any
  steps?: any
  switch?: any
  table?: any
  tabs?: any
  tag?: any
  time-picker?: any
  timeline?: any
  tooltip?: any
  transfer?: any
  tree-select?: any
  typography?: any
  upload?: any
  water-mark?: any
}

// ConfigProviderConsumer Component Props
export interface ConfigProviderConsumerProps {
  children: (context: ConfigProviderContextProps) => React.ReactNode
}

// ThemeProvider Component Props
export interface ThemeProviderProps {
  theme: any
  children: React.ReactNode
}

// ThemeConsumer Component Props
export interface ThemeConsumerProps {
  children: (theme: any) => React.ReactNode
}

// SizeProvider Component Props
export interface SizeProviderProps {
  size?: 'small' | 'middle' | 'large'
  children: React.ReactNode
}

// SizeConsumer Component Props
export interface SizeConsumerProps {
  children: (size: 'small' | 'middle' | 'large') => React.ReactNode
}

// BreakpointProvider Component Props
export interface BreakpointProviderProps {
  children: (breakpoint: string) => React.ReactNode
  breakpoints?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    xxl?: number
  }
}

// BreakpointConsumer Component Props
export interface BreakpointConsumerProps {
  children: (breakpoint: string) => React.ReactNode
}

// ResponsiveProvider Component Props
export interface ResponsiveProviderProps {
  children: (responsive: { xs: boolean; sm: boolean; md: boolean; lg: boolean; xl: boolean; xxl: boolean }) => React.ReactNode
  breakpoints?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    xxl?: number
  }
}

// ResponsiveConsumer Component Props
export interface ResponsiveConsumerProps {
  children: (responsive: { xs: boolean; sm: boolean; md: boolean; lg: boolean; xl: boolean; xxl: boolean }) => React.ReactNode
}

// ConfigProviderContext Component Props
export interface ConfigProviderContextProps {
  getPrefixCls: (suffixCls?: string, customizePrefix?: string) => string
  direction?: 'ltr' | 'rtl'
  locale?: any
  space?: any
  form?: any
  input?: any
  pagination?: any
  table?: any
  transfer?: any
  tree?: any
  typography?: any
  alert?: any
  anchor?: any
  avatar?: any
  badge?: any
  breadcrumb?: any
  button?: any
  calendar?: any
  card?: any
  carousel?: any
  cascader?: any
  checkbox?: any
  collapse?: any
  colorPicker?: any
  comment?: any
  configProvider?: any
  date-picker?: any
  divider?: any
  drawer?: any
  dropdown?: any
  empty?: any
  form?: any
  grid?: any
  image?: any
  input?: any
  input-number?: any
  layout?: any
  list?: any
  menu?: any
  message?: any
  modal?: any
  notification?: any
  page-header?: any
  pagination?: any
  popconfirm?: any
  popover?: any
  progress?: any
  radio?: any
  rate?: any
  result?: any
  select?: any
  skeleton?: any
  slider?: any
  space?: any
  spin?: any
  statistic?: any
  steps?: any
  switch?: any
  table?: any
  tabs?: any
  tag?: any
  time-picker?: any
  timeline?: any
  tooltip?: any
  transfer?: any
  tree-select?: any
  typography?: any
  upload?: any
  water-mark?: any
}

// ConfigProviderConsumer Component Props
export interface ConfigProviderConsumerProps {
  children: (context: ConfigProviderContextProps) => React.ReactNode
}

// ThemeProvider Component Props
export interface ThemeProviderProps {
  theme: any
  children: React.ReactNode
}

// ThemeConsumer Component Props
export interface ThemeConsumerProps {
  children: (theme: any) => React.ReactNode
}

// SizeProvider Component Props
export interface SizeProviderProps {
  size?: 'small' | 'middle' | 'large'
  children: React.ReactNode
}

// SizeConsumer Component Props
export interface SizeConsumerProps {
  children: (size: 'small' | 'middle' | 'large') => React.ReactNode
}

// BreakpointProvider Component Props
export interface BreakpointProviderProps {
  children: (breakpoint: string) => React.ReactNode
  breakpoints?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    xxl?: number
  }
}

// BreakpointConsumer Component Props
export interface BreakpointConsumerProps {
  children: (breakpoint: string) => React.ReactNode
}

// ResponsiveProvider Component Props
export interface ResponsiveProviderProps {
  children: (responsive: { xs: boolean; sm: boolean; md: boolean; lg: boolean; xl: boolean; xxl: boolean }) => React.ReactNode
  breakpoints?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    xxl?: number
  }
}

// ResponsiveConsumer Component Props
export interface ResponsiveConsumerProps {
  children: (responsive: { xs: boolean; sm: boolean; md: boolean; lg: boolean; xl: boolean; xxl: boolean }) => React.ReactNode
}

// ConfigProviderContext Component Props
export interface ConfigProviderContextProps {
  getPrefixCls: (suffixCls?: string, customizePrefix?: string) => string
  direction?: 'ltr' | 'rtl'
  locale?: any
  space?: any
  form?: any
  input?: any
  pagination?: any
  table?: any
  transfer?: any
  tree?: any
  typography?: any
  alert?: any
  anchor?: any
  avatar?: any
  badge?: any
  breadcrumb?: any
  button?: any
  calendar?: any
  card?: any
  carousel?: any
  cascader?: any
  checkbox?: any
  collapse?: any
  colorPicker?: any
  comment?: any
  configProvider?: any
  date-picker?: any
  divider?: any
  drawer?: any
  dropdown?: any
  empty?: any
  form?: any
  grid?: any
  image?: any
  input?: any
  input-number?: any
  layout?: any
  list?: any
  menu?: any
  message?: any
  modal?: any
  notification?: any
  page-header?: any
  pagination?: any
  popconfirm?: any
  popover?: any
  progress?: any
  radio?: any
  rate?: any
  result?: any
  select?: any
  skeleton?: any
  slider?: any
  space?: any
  spin?: any
  statistic?: any
  steps?: any
  switch?: any
  table?: any
  tabs?: any
  tag?: any
  time-picker?: any
  timeline?: any
  tooltip?: any
  transfer?: any
  tree-select?: any
  typography?: any
  upload?: any
  water-mark?: any
}

// ConfigProviderConsumer Component Props
export interface ConfigProviderConsumerProps {
  children: (context: ConfigProviderContextProps) => React.ReactNode
}

// ThemeProvider Component Props
export interface ThemeProviderProps {
  theme: any
  children: React.ReactNode
}

// ThemeConsumer Component Props
export interface ThemeConsumerProps {
  children: (theme: any) => React.ReactNode
}

// SizeProvider Component Props
export interface SizeProviderProps {
  size?: 'small' | 'middle' | 'large'
  children: React.ReactNode
}

// SizeConsumer Component Props
export interface SizeConsumerProps {
  children: (size: 'small' | 'middle' | 'large') => React.ReactNode
}

// BreakpointProvider Component Props
export interface BreakpointProviderProps {
  children: (breakpoint: string) => React.ReactNode
  breakpoints?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    xxl?: number
  }
}

// BreakpointConsumer Component Props
export interface BreakpointConsumerProps {
  children: (breakpoint: string) => React.ReactNode
}

// ResponsiveProvider Component Props
export interface ResponsiveProviderProps {
  children: (responsive: { xs: boolean; sm: boolean; md: boolean; lg: boolean; xl: boolean; xxl: boolean }) => React.ReactNode
  breakpoints?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    xxl?: number
  }
}

// ResponsiveConsumer Component Props
export interface ResponsiveConsumerProps {
  children: (responsive: { xs: boolean; sm: boolean; md: boolean; lg: boolean; xl: boolean; xxl: boolean }) => React.ReactNode
}

// ConfigProviderContext Component Props
export interface ConfigProviderContextProps {
  getPrefixCls: (suffixCls?: string, customizePrefix?: string) => string
  direction?: 'ltr' | 'rtl'
  locale?: any
  space?: any
  form?: any
  input?: any
  pagination?: any
  table?: any
  transfer?: any
  tree?: any
  typography?: any
  alert?: any
  anchor?: any
  avatar?: any
  badge?: any
  breadcrumb?: any
  button?: any
  calendar?: any
  card?: any
  carousel?: any
  cascader?: any
  checkbox?: any
  collapse?: any
  colorPicker?: any
  comment?: any
  configProvider?: any
  date-picker?: any
  divider?: any
  drawer?: any
  dropdown?: any
  empty?: any
  form?: any
  grid?: any
  image?: any
  input?: any
  input-number?: any
  layout?: any
  list?: any
  menu?: any
  message?: any
  modal?: any
  notification?: any
  page-header?: any
  pagination?: any
  popconfirm?: any
  popover?: any
  progress?: any
  radio?: any
  rate?: any
  result?: any
  select?: any
  skeleton?: any
  slider?: any
  space?: any
  spin?: any
  statistic?: any
  steps?: any
  switch?: any
  table?: any
  tabs?: any
  tag?: any
  time-picker?: any
  timeline?: any
  tooltip?: any
  transfer?: any
  tree-select?: any
  typography?: any
  upload?: any
  water-mark?: any
}

// ConfigProviderConsumer Component Props
export interface ConfigProviderConsumerProps {
  children: (context: ConfigProviderContextProps) => React.ReactNode
}

// ThemeProvider Component Props
export interface ThemeProviderProps {
  theme: any
  children: React.ReactNode
}

// ThemeConsumer Component Props
export interface ThemeConsumerProps {
  children: (theme: any) => React.ReactNode
}

// SizeProvider Component Props
export interface SizeProviderProps {
  size?: 'small' | 'middle' | 'large'
  children: React.ReactNode
}

// SizeConsumer Component Props
export interface Size