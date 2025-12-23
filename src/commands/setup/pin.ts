import { CommandContext, Modal, TextInput } from 'discord-hono';

export const setupPin = (c: CommandContext) => {
  return c.resModal(
    new Modal('submit_pin', '📌ピン留めの設定')
      .row(
        new TextInput('input_title', 'タイトル', 'Single')
          .placeholder('タイトルを入力')
          .required(true)
          .max_length(256)
      )
      .row(
        new TextInput('input_content', 'メッセージ内容', 'Multi')
          .placeholder('メッセージ内容を入力')
          .required(true)
          .max_length(4000)
      )
  );
};