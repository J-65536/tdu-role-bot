import { CommandContext, Components, Button } from 'discord-hono';
import { SERVER_RULES_TEXT } from '../../constants';

export const setupRules = (c: CommandContext) => {
  const components = new Components().row(
    new Button('agree_rules', '認証（ルールに同意する）', 'Success')
  );

  return c.res({
    content: SERVER_RULES_TEXT,
    components: components,
  });
};