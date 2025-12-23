import { CommandContext } from 'discord-hono';
import { setupDept } from './dept';
import { setupRules } from './rules';
import { setupPin } from './pin';
import { setupUnpin } from './unpin';

export const setupHandler = (c: CommandContext) => {
  const subCommand = c.sub.command;

  switch (subCommand) {
    case 'dept':
      return setupDept(c);
    case 'rules':
      return setupRules(c);
    case 'pin':
      return setupPin(c);
    case 'unpin':
      return setupUnpin(c);
    default:
      return c.res({
        content: '不明なサブコマンドです。',
        flags: 64
      });
  }
};