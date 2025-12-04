import * as vscode from 'vscode';
import { setTaskStatus } from './commands/taskStatus';
import { showAgenda } from './commands/agenda';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('markdown-org.setTodo', () => setTaskStatus('TODO')),
        vscode.commands.registerCommand('markdown-org.setDone', () => setTaskStatus('DONE')),
        vscode.commands.registerCommand('markdown-org.showAgendaDay', () => showAgenda(context, 'day')),
        vscode.commands.registerCommand('markdown-org.showAgendaWeek', () => showAgenda(context, 'week')),
        vscode.commands.registerCommand('markdown-org.showTasks', () => showAgenda(context, 'tasks'))
    );
}

export function deactivate() {}
