import { CommandContext } from 'discord-hono';
import { getDeptComponents } from '../../utils/deptComponents';

export const rolePanelDept = (c: CommandContext) => {
  const components = getDeptComponents();

  return c.res({
    content: '所属する学科・学系を選択するとロールが付与されます。変更が必要な場合は、管理人にお問い合わせください。',
    components: components,
  });
};