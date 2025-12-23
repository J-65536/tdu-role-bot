import { ComponentContext } from 'discord-hono';
import { FACULTIES, YEAR_26_ROLE } from '../constants';
import { getDeptComponents } from '../utils/deptComponents';
import { addRolesIfNoneExists } from '../utils/roleManager';

export const deptSelectHandler = async (c: ComponentContext) => {
  const selectedDeptValue = c.interaction.data?.values?.[0];
  const guildId = c.interaction.guild_id;
  const memberId = c.interaction.member?.user?.id;

  if (!selectedDeptValue || !guildId || !memberId) {
    return c.res({ content: 'エラーが発生しました。', flags: 64 });
  }

  const targetFaculty = FACULTIES.find(f => f.departments.some(d => d.value === selectedDeptValue));
  const targetDept = targetFaculty?.departments.find(d => d.value === selectedDeptValue);

  if (!targetFaculty || !targetDept) {
    return c.res({ content: 'ロールが見つかりませんでした。', flags: 64 });
  }

  const task = async () => {
    const rolesToAdd = [
      YEAR_26_ROLE.id,
      targetFaculty.roleId,
      targetDept.roleId
    ];

    const allManagedIds = [...FACULTIES.flatMap(f => [f.roleId, ...f.departments.map(d => d.roleId)])];

    const result = await addRolesIfNoneExists(
      c,
      guildId,
      memberId,
      rolesToAdd,
      allManagedIds
    );

    await c.rest(
      'POST',
      '/webhooks/{application.id}/{interaction.token}',
      // @ts-ignore
      [c.env.DISCORD_APPLICATION_ID, c.interaction.token],
      {
        content: result.message,
        flags: 64,
      }
    );
  };

  c.executionCtx.waitUntil(task());

  return c.update().res({
    content: '所属する学科・学系を選択するとロールが付与されます。\n変更が必要な場合は、管理人にお問い合わせください。',
    components: getDeptComponents(),
  });
};