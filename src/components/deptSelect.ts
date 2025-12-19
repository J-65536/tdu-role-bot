import { ComponentContext } from 'discord-hono';
import { FACULTIES, YEAR_26_ROLE } from '../constants';
import { getDeptComponents } from '../utils/deptComponents';

export const deptSelectHandler = async (c: ComponentContext) => {
  const selectedDeptValue = c.interaction.data?.values?.[0];
  const guildId = c.interaction.guild_id;
  const member = c.interaction.member;
  const memberId = member?.user?.id;

  if (!selectedDeptValue || !guildId || !member || !memberId) {
    return c.res({ content: 'エラーが発生しました。', flags: 64 });
  }

  const targetFaculty = FACULTIES.find(f => f.departments.some(d => d.value === selectedDeptValue));
  const targetDept = targetFaculty?.departments.find(d => d.value === selectedDeptValue);

  if (!targetFaculty || !targetDept) {
    return c.res({ content: 'ロールが見つかりませんでした。', flags: 64 });
  }

  const updateRolesBackgroundTask = async () => {
    const allManagedRoleIds = FACULTIES.flatMap(f => [
      f.roleId,
      ...f.departments.map(d => d.roleId)
    ]);
    const userCurrentRoleIds = member.roles || [];
    const rolesToRemove = userCurrentRoleIds.filter((id: string) => allManagedRoleIds.includes(id));

    for (const roleId of rolesToRemove) {
      try {
        await c.rest(
          'DELETE',
          '/guilds/{guild.id}/members/{user.id}/roles/{role.id}',
          [guildId, memberId, roleId]
        );
      } catch (e) {
        console.error(`Failed to remove role ${roleId}`, e);
      }
    }

    const rolesToAdd = [
      { id: YEAR_26_ROLE.id, name: YEAR_26_ROLE.name },
      { id: targetFaculty.roleId, name: targetFaculty.name },
      { id: targetDept.roleId, name: targetDept.label }
    ];

    const assignedRoles: string[] = [];

    for (const role of rolesToAdd) {
      try {
        await c.rest(
          'PUT',
          '/guilds/{guild.id}/members/{user.id}/roles/{role.id}',
          [guildId, memberId, role.id]
        );
        assignedRoles.push(`<@&${role.id}>`);
      } catch (e) {
        console.error(`Failed to add role ${role.id}`, e);
      }
    }

    await c.rest(
      'POST',
      '/webhooks/{application.id}/{interaction.token}',
      // @ts-ignore
      [c.env.DISCORD_APPLICATION_ID, c.interaction.token],
      {
        content: `ロールを更新しました:\n${assignedRoles.join('\n')}`,
        flags: 64,
      }
    );
  };
  c.executionCtx.waitUntil(updateRolesBackgroundTask());

  return c.update().res({
    content: '所属する学科・学系を選択するとロールが付与されます。',
    components: getDeptComponents(),
  });
};