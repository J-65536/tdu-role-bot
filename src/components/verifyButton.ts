import { ComponentContext } from 'discord-hono';
import { VERIFIED_ROLE_ID } from '../constants';
import { addRolesIfNoneExists } from '../utils/roleManager';
import { Bindings } from '../types';

export const verifyButtonHandler = async (c: ComponentContext<{ Bindings: Bindings }>) => {
  const guildId = c.interaction.guild_id;
  const memberId = c.interaction.member?.user?.id;

  if (!guildId || !memberId) {
    return c.res({ content: 'エラーが発生しました。', flags: 64 });
  }

  const task = async () => {
    const rolesToAdd = [VERIFIED_ROLE_ID];
    const checkRoles = [VERIFIED_ROLE_ID];

    const result = await addRolesIfNoneExists(
      c,
      guildId,
      memberId,
      rolesToAdd,
      checkRoles
    );

    let messageContent = '';

    if (result.status === 'added') {
      messageContent = '認証が完了しました。\nhttps://discord.com/channels/1451183228613296232/1452450627362885632 へ移動してください。';
    } else if (result.status === 'rejected') {
      messageContent = '既に認証済みです。\n他のチャンネルが表示されない場合は、 https://discord.com/channels/1451183228613296232/1452450627362885632 へ移動してください。';
    } else {
      messageContent = result.message;
    }

    await c.rest(
      'POST',
      '/webhooks/{application.id}/{interaction.token}',
      [c.env.DISCORD_APPLICATION_ID, c.interaction.token],
      {
        content: messageContent,
        flags: 64,
      }
    );
  };

  c.executionCtx.waitUntil(task());

  return c.update().res({});
};