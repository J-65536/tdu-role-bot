import { CommandContext, ComponentContext } from 'discord-hono';

type DiscordContext = CommandContext | ComponentContext;

// 現在のロールID一覧を取得するヘルパー関数
const fetchCurrentRoleIds = async (c: DiscordContext, guildId: string, userId: string): Promise<string[]> => {
  const response = await c.rest(
    'GET',
    '/guilds/{guild.id}/members/{user.id}',
    [guildId, userId]
  );
  const member = await response.json();
  return (member as { roles: string[] }).roles;
};

// 基本付与 選択肢に応じたロール群を付与
export const addRoles = async (
  c: DiscordContext,
  guildId: string,
  userId: string,
  roleIdsToAdd: string[]
) => {
  for (const roleId of roleIdsToAdd) {
    await c.rest(
      'PUT',
      '/guilds/{guild.id}/members/{user.id}/roles/{role.id}',
      [guildId, userId, roleId]
    );
  }

  const mentions = roleIdsToAdd.map(id => `<@&${id}>`).join('\n');
  return { status: 'added', message: `ロールを付与しました:\n${mentions}` };
};

// 排他付与 管理対象ロールを全て剥がしてから新ロール群を付与
export const assignExclusiveRoles = async (
  c: DiscordContext,
  guildId: string,
  userId: string,
  newRoleIds: string[],
  allManagedRoleIds: string[]
) => {
  const currentRoles = await fetchCurrentRoleIds(c, guildId, userId);

  // 現在のロールから管理対象ロールを除外して、残すロールを決定
  const keepRoles = currentRoles.filter(id => !allManagedRoleIds.includes(id));

  // 残すロールに新ロール群を追加して重複排除
  const finalRoles = [...new Set([...keepRoles, ...newRoleIds])];

  // 一括上書き
  await c.rest(
    'PATCH',
    '/guilds/{guild.id}/members/{user.id}',
    [guildId, userId],
    { roles: finalRoles }
  );

  const mentions = newRoleIds.map(id => `<@&${id}>`).join('\n');
  return { status: 'updated', message: `ロールを更新しました:\n${mentions}` };
};

// 初回限定付与 管理対象ロールを一つも持っていなければ新ロール群を付与
export const addRolesIfNoneExists = async (
  c: DiscordContext,
  guildId: string,
  userId: string,
  newRoleIds: string[],
  allManagedRoleIds: string[]
) => {
  const currentRoles = await fetchCurrentRoleIds(c, guildId, userId);

  // 管理対象ロールを既に持っていたら拒否
  const alreadyHasManagedRole = currentRoles.some(id => allManagedRoleIds.includes(id));
  if (alreadyHasManagedRole) {
    return { status: 'rejected', message: '学科・学系は一度しか選択できません。\n変更が必要な場合は、管理人にお問い合わせください。' };
  }

  // 持っていなければ付与
  for (const roleId of newRoleIds) {
    await c.rest(
      'PUT',
      '/guilds/{guild.id}/members/{user.id}/roles/{role.id}',
      [guildId, userId, roleId]
    );
  }

  const mentions = newRoleIds.map(id => `<@&${id}>`).join('\n');
  return { status: 'added', message: `ロールを付与しました:\n${mentions}\n変更が必要な場合は、管理人にお問い合わせください。` };
};