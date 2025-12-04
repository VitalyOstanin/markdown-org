import * as vscode from 'vscode';

export function setTaskStatus(status: 'TODO' | 'DONE') {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'markdown') {
        return;
    }

    const line = editor.document.lineAt(editor.selection.active.line);
    const text = line.text;
    const match = text.match(/^(#+)\s+(?:TODO|DONE)?\s*(?:\[#[A-Z]\]\s*)?(.+)$/);
    
    if (!match) {
        return;
    }

    const [, hashes, title] = match;
    const priorityMatch = text.match(/\[#[A-Z]\]/);
    const priority = priorityMatch ? priorityMatch[0] + ' ' : '';
    const newText = `${hashes} ${status} ${priority}${title.replace(/^\[#[A-Z]\]\s*/, '')}`;

    editor.edit(editBuilder => {
        editBuilder.replace(line.range, newText);
    });
}
