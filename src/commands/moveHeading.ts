import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface HeadingInfo {
    level: number;
    text: string;
    line: number;
    content: string[];
}

function findHeadingAtCursor(document: vscode.TextDocument, position: vscode.Position): HeadingInfo | null {
    const currentLine = position.line;
    
    for (let i = currentLine; i >= 0; i--) {
        const line = document.lineAt(i).text;
        const match = line.match(/^(#+)\s+(.+)$/);
        if (match) {
            const level = match[1].length;
            const text = match[2];
            const content = extractHeadingContent(document, i, level);
            return { level, text, line: i, content };
        }
    }
    return null;
}

function extractHeadingContent(document: vscode.TextDocument, startLine: number, level: number): string[] {
    const lines: string[] = [document.lineAt(startLine).text];
    
    for (let i = startLine + 1; i < document.lineCount; i++) {
        const line = document.lineAt(i).text;
        const match = line.match(/^(#+)\s+/);
        if (match && match[1].length <= level) {
            break;
        }
        lines.push(line);
    }
    return lines;
}

function getAncestorChain(document: vscode.TextDocument, startLine: number, targetLevel: number): HeadingInfo[] {
    const ancestors: HeadingInfo[] = [];
    let currentLevel = targetLevel;
    
    for (let i = startLine - 1; i >= 0; i--) {
        const line = document.lineAt(i).text;
        const match = line.match(/^(#+)\s+(.+)$/);
        if (match) {
            const level = match[1].length;
            if (level < currentLevel) {
                ancestors.unshift({ level, text: match[2], line: i, content: [] });
                currentLevel = level;
                if (level === 1) break;
            }
        }
    }
    return ancestors;
}

function buildArchiveContent(ancestors: HeadingInfo[], heading: HeadingInfo): string {
    let content = '';
    
    ancestors.forEach(ancestor => {
        content += '#'.repeat(ancestor.level) + ' ' + ancestor.text + '\n';
    });
    
    heading.content.forEach(line => {
        content += line + '\n';
    });
    
    return content;
}

export async function moveToArchive() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    
    const heading = findHeadingAtCursor(document, position);
    if (!heading) {
        vscode.window.showErrorMessage('No heading found');
        return;
    }

    const archivePath = document.uri.fsPath + '.archive.md';
    const ancestors = getAncestorChain(document, heading.line, heading.level);
    const archiveContent = buildArchiveContent(ancestors, heading);
    
    let existingContent = '';
    if (fs.existsSync(archivePath)) {
        existingContent = fs.readFileSync(archivePath, 'utf8');
        if (existingContent && !existingContent.endsWith('\n\n')) {
            existingContent += existingContent.endsWith('\n') ? '\n' : '\n\n';
        }
    }
    
    fs.writeFileSync(archivePath, existingContent + archiveContent);
    
    const edit = new vscode.WorkspaceEdit();
    const startLine = heading.line;
    const endLine = heading.line + heading.content.length;
    edit.delete(document.uri, new vscode.Range(startLine, 0, endLine, 0));
    await vscode.workspace.applyEdit(edit);
    
    vscode.window.showInformationMessage(`Moved to ${path.basename(archivePath)}`);
}

export async function promoteToMaintain() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return;
    }

    const config = vscode.workspace.getConfiguration('markdown-org');
    const maintainPath = config.get<string>('maintainFilePath', '');
    
    if (!maintainPath) {
        vscode.window.showErrorMessage('Markdown Org: Please configure markdown-org.maintainFilePath in settings');
        return;
    }
    
    const document = editor.document;
    const position = editor.selection.active;
    
    const heading = findHeadingAtCursor(document, position);
    if (!heading) {
        vscode.window.showErrorMessage('No heading found');
        return;
    }

    let maintainContent = '';
    if (fs.existsSync(maintainPath)) {
        maintainContent = fs.readFileSync(maintainPath, 'utf8');
    }
    
    const lines = maintainContent.split('\n');
    let incomingIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/^#\s+incoming$/i)) {
            incomingIndex = i;
            break;
        }
    }
    
    const newHeading = '## ' + heading.text;
    const newContent = heading.content.slice(1).map(line => {
        const match = line.match(/^(#+)\s+(.+)$/);
        if (match) {
            return '#'.repeat(match[1].length + 1) + ' ' + match[2];
        }
        return line;
    });
    
    if (incomingIndex === -1) {
        maintainContent += (maintainContent && !maintainContent.endsWith('\n\n') ? '\n\n' : '') + '# incoming\n';
        maintainContent += newHeading + '\n' + newContent.join('\n') + '\n';
    } else {
        lines.splice(incomingIndex + 1, 0, newHeading, ...newContent, '');
        maintainContent = lines.join('\n');
    }
    
    fs.writeFileSync(maintainPath, maintainContent);
    
    const edit = new vscode.WorkspaceEdit();
    const startLine = heading.line;
    const endLine = heading.line + heading.content.length;
    edit.delete(document.uri, new vscode.Range(startLine, 0, endLine, 0));
    await vscode.workspace.applyEdit(edit);
    
    vscode.window.showInformationMessage(`Promoted to ${path.basename(maintainPath)}`);
}
