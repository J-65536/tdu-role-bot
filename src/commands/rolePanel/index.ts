import { CommandContext } from 'discord-hono';
import { rolePanelDept } from './dept';

export const rolePanelHandler = (c: CommandContext) => {
  const subCommand = c.sub.command;

  switch (subCommand) {
    case 'dept':
      return rolePanelDept(c);
    default:
      return c.res({
        content: '不明な引数です。',
        flags: 64
      });
  }
};