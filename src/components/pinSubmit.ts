import { ModalContext } from 'discord-hono';
import { Bindings } from '../types';

const getModalValue = (interaction: any, customId: string): string | undefined => {
  const rows = interaction.data?.components || [];
  for (const row of rows) {
    for (const component of row.components || []) {
      if (component.custom_id === customId) {
        return component.value;
      }
    }
  }
  return undefined;
};

export const pinSubmitHandler = async (c: ModalContext<{ Bindings: Bindings }>) => {
  const title = getModalValue(c.interaction, 'input_title');
  const content = getModalValue(c.interaction, 'input_content');
  const channelId = c.interaction.channel_id;

  if (!title || !content || !channelId) {
    return c.res({ content: '入力内容の取得に失敗しました。', flags: 64 });
  }

  // メッセージ送信
  const response = await c.rest(
    'POST',
    '/channels/{channel.id}/messages',
    [channelId],
    {
      embeds: [{
        title: title,
        description: content,
        color: 0x0099ff,
      }],
      flags: 4096 // サイレント
    }
  );

  const message = await response.json() as { id: string };

  // 永続化
  c.executionCtx.waitUntil(
    c.env.DB.prepare(
      `INSERT INTO sticky_messages (channel_id, current_message_id, title, content) 
       VALUES (?, ?, ?, ?)
       ON CONFLICT(channel_id) DO UPDATE SET 
       current_message_id = excluded.current_message_id,
       title = excluded.title,
       content = excluded.content`
    ).bind(channelId, message.id, title, content).run()
  );

  return c.res({
    content: 'ピン留めが完了しました。\n1分ごとに新しいメッセージとして表示します。`/setup unpin` で解除可能です。',
    flags: 64
  });
};