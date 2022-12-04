import { IconDef } from '@xunserver/icon'
import { h } from 'vue'

const renderIcon = (node: any) =>
  h(node.tag, node.attrs, (node.children || []).map(renderIcon))

const IconBase = ({ icon }: { icon: IconDef['icon'] }) => {
  return renderIcon(icon)
}
IconBase.props = ['icon']
export default IconBase
