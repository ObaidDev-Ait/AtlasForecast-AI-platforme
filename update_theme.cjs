const fs = require('fs');

let content = fs.readFileSync('src/css/light-theme.css', 'utf-8');

// Replace colors
const replacements = [
    [/var\(--text-primary\)/g, '#1C1C1C'],
    [/var\(--text-secondary\)/g, '#6B7280'],
    [/var\(--accent-primary\)/g, '#F97316'],
    [/var\(--accent-secondary\)/g, '#C1440E'],
    [/#1E293B/gi, '#1C1C1C'],
    [/#475569/gi, '#6B7280'],
    [/#0EA5E9/gi, '#F97316'],
    [/#38BDF8/gi, '#C1440E'],
    [/#2563EB/gi, '#C1440E'],
    [/#0284C7/gi, '#F97316'],
    [/rgba\(255, 255, 255, 0\.\d+\)/gi, '#FFFFFF'],
    [/rgba\(241, 248, 255, 0\.\d+\)/gi, '#FFFFFF'],
    [/rgba\(148, 163, 184, 0\.\d+\)/gi, 'rgba(193, 68, 14, 0.1)'],
    [/rgba\(15, 23, 42, 0\.\d+\)/gi, 'rgba(193, 68, 14, 0.08)'],
    [/rgba\(56, 189, 248, 0\.\d+\)/gi, 'rgba(249, 115, 22, 0.2)'],
    [/#F0F6FB/gi, '#F5E6CA'],
    [/#CBD5E1/gi, '#F97316'],
    [/#94A3B8/gi, '#6B7280'],
    [/backdrop-filter:\s*blur\([^)]+\)\s*saturate\([^)]+\);/gi, ''],
    [/backdrop-filter:\s*blur\([^)]+\);/gi, ''],
    [/background:\s*linear-gradient\(135deg,\s*#1C1C1C\s*0%,\s*#F97316\s*100%\);/gi, 'background: #1C1C1C;'],
    [/background:\s*linear-gradient\(135deg,\s*#1C1C1C,\s*#F97316\);/gi, 'background: #1C1C1C;'],
    [/background:\s*linear-gradient\(135deg,\s*#F97316,\s*#C1440E\);/gi, 'background: #F97316;'],
    [/-webkit-background-clip:\s*text;/gi, ''],
    [/-webkit-text-fill-color:\s*transparent;/gi, 'color: inherit;'],
    [/background-clip:\s*text;/gi, ''],
];

replacements.forEach(([old, replaceWith]) => {
    content = content.replace(old, replaceWith);
});

// Since we replaced var(--...) with hex codes, some lines might be messed up if they were var(--text-primary).
// Actually, it's better to just keep the variables where they are. Let's undo the var replacements.
// Wait, I already defined the variables at the top. So using var(--text-primary) is correct!
// I should just replace the hardcoded slate colors with the new variables or hexes.

content = fs.readFileSync('src/css/light-theme.css', 'utf-8');

const safeReplacements = [
    [/#1E293B/gi, 'var(--text-primary)'],
    [/#475569/gi, 'var(--text-secondary)'],
    [/#0EA5E9/gi, 'var(--accent-primary)'],
    [/#38BDF8/gi, 'var(--accent-secondary)'],
    [/#2563EB/gi, 'var(--accent-secondary)'],
    [/#0284C7/gi, 'var(--accent-primary)'],
    [/rgba\(255, 255, 255, 0\.\d+\)/gi, 'var(--bg-glass)'],
    [/rgba\(241, 248, 255, 0\.\d+\)/gi, 'var(--bg-glass)'],
    [/rgba\(148, 163, 184, 0\.\d+\)/gi, 'var(--border-color)'],
    [/rgba\(15, 23, 42, 0\.\d+\)/gi, 'var(--shadow-color)'],
    [/rgba\(56, 189, 248, 0\.\d+\)/gi, 'var(--shadow-glow)'],
    [/#F0F6FB/gi, '#F5E6CA'],
    [/#CBD5E1/gi, 'var(--accent-primary)'],
    [/#94A3B8/gi, 'var(--text-secondary)'],
    [/backdrop-filter:\s*blur\([^)]+\)\s*saturate\([^)]+\);/gi, ''],
    [/backdrop-filter:\s*blur\([^)]+\);/gi, ''],
];

safeReplacements.forEach(([old, replaceWith]) => {
    content = content.replace(old, replaceWith);
});

// Fix gradients to solid colors for pure sharp design
content = content.replace(/background:\s*linear-gradient\([^)]+\);/gi, (match) => {
    if (match.includes('atlas-background')) return match; // Keep fallback
    if (match.includes('--text-primary')) return 'color: var(--text-primary);';
    if (match.includes('--accent-primary')) return 'color: var(--accent-primary);';
    return match;
});

content = content.replace(/-webkit-background-clip:\s*text;/gi, '');
content = content.replace(/-webkit-text-fill-color:\s*transparent;/gi, '');
content = content.replace(/background-clip:\s*text;/gi, '');


fs.writeFileSync('src/css/light-theme.css', content, 'utf-8');
console.log('Updated light-theme.css to sharp Marrakech via Node');
