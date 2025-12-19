import { DiscordHono } from 'discord-hono';
import { rolePanelHandler } from './commands/rolePanel';
import { deptSelectHandler } from './components/deptSelect';
import { FACULTIES } from './constants';

const app = new DiscordHono();
// --- コマンドハンドリング ---
// role_panel コマンド
app.command('role_panel', (c) => rolePanelHandler(c));

// --- コンポーネントハンドリング ---
// 学科・学系セレクトメニュー
FACULTIES.forEach((faculty) => {
	app.component(`select_dept_${faculty.id}`, deptSelectHandler);
});

export default app;