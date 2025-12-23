import { Bindings, StickyMessage } from './types';

// Discord APIをfetchで叩くためのヘルパー関数
const discordFetch = async (token: string, method: string, path: string, body?: any) => {
  const url = 'https://discord.com/api/v10' + path;
  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': 'Bot ' + token,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return response;
};

export const scheduledHandler = async (event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) => {
  // 監視対象の全チャンネルを取得
  const { results } = await env.DB.prepare(
    'SELECT * FROM sticky_messages'
  ).all<StickyMessage>();

  if (!results || results.length === 0) return;

  // チャンネルごとに処理（並列実行）
  const tasks = results.map(async (record) => {
    try {
      // そのチャンネルの最新メッセージを取得
      const listRes = await discordFetch(env.DISCORD_TOKEN, 'GET', `/channels/${record.channel_id}/messages?limit=1`);

      if (!listRes.ok) return; // 取得失敗時はスキップ

      const messages = await listRes.json() as any[];
      if (messages.length === 0) return;

      const latestMessageId = messages[0].id;

      // ピン留めされたメッセージが最新なら何もしない
      if (latestMessageId === record.current_message_id) {
        return;
      }

      // 古いメッセージを削除
      await discordFetch(env.DISCORD_TOKEN, 'DELETE', `/channels/${record.channel_id}/messages/${record.current_message_id}`);

      // 新しいメッセージを送信
      const sendRes = await discordFetch(env.DISCORD_TOKEN, 'POST', `/channels/${record.channel_id}/messages`, {
        embeds: [{
          title: record.title,
          description: record.content,
          color: 0x0099ff,
        }],
        flags: 4096 // サイレント
      });

      if (!sendRes.ok) return;

      const newMessage = await sendRes.json() as { id: string };

      // DBのIDを更新
      await env.DB.prepare(
        'UPDATE sticky_messages SET current_message_id = ? WHERE channel_id = ?'
      ).bind(newMessage.id, record.channel_id).run();

      console.log(`[Sticky] Updated channel: ${record.channel_id}`);

    } catch (e) {
      console.error(`[Sticky] Error in channel ${record.channel_id}:`, e);
    }
  });

  await Promise.all(tasks);
};