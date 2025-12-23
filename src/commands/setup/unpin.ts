import { CommandContext } from 'discord-hono';
import { Bindings, StickyMessage } from '../../types';

export const setupUnpin = async (c: CommandContext<{ Bindings: Bindings }>) => {
  const channelId = c.interaction.channel_id;
  if (!channelId) return c.res({ content: 'チャンネルIDが取得できません。', flags: 64 });

  const record = await c.env.DB.prepare(
    'SELECT * FROM sticky_messages WHERE channel_id = ?'
  ).bind(channelId).first<StickyMessage>();

  if (!record) {
    return c.res({
      content: 'このチャンネルにはピン留めされたメッセージがありません。',
      flags: 64
    });
  }

  // メッセージ削除
  try {
    await c.rest(
      'DELETE',
      '/channels/{channel.id}/messages/{message.id}',
      [channelId, record.current_message_id]
    );
  } catch (e) {
    // 存在しない場合はエラーを無視して続行
  }

  // DBから削除
  await c.env.DB.prepare(
    'DELETE FROM sticky_messages WHERE channel_id = ?'
  ).bind(channelId).run();

  return c.res({
    content: 'ピン留めを解除しました。',
    flags: 64
  });
};