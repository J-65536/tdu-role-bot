import { DiscordHono } from 'discord-hono';
import { scheduledHandler } from './scheduled';

import { setupHandler } from './commands/setup';
import { deptSelectHandler } from './components/deptSelect';
import { verifyButtonHandler } from './components/verifyButton';
import { pinSubmitHandler } from './components/pinSubmit';
import { FACULTIES } from './constants';
import { Bindings } from './types';

const app = new DiscordHono<{ Bindings: Bindings }>();

// --- コマンド ---
app.command('setup', setupHandler);

// --- コンポーネント ---
// ルール同意（認証）ボタン
app.component('agree_rules', verifyButtonHandler);

// 学科・学系選択メニュー
FACULTIES.forEach((faculty) => {
	app.component(`select_dept_${faculty.id}`, deptSelectHandler);
});

app.modal('submit_pin', pinSubmitHandler);

export default {
	fetch: (request: Request, env: Bindings, ctx: ExecutionContext) => {
		return app.fetch(request, env, ctx);
	},

	// Cron Triggers (1分ごとの自動実行)
	scheduled: scheduledHandler,
};