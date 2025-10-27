// ==UserScript==
// @name         Copy Jira Issue Ref
// @version      1.1
// @description  Copy Jira Issue Ref
// @match        https://*.atlassian.net/*
// @match        https://*.atlassian.com/*
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @icon         https://jira.atlassian.com/favicon.ico
// @author       Artem Avramenko
// @homepageURL  https://artemavramenko.github.io/userscripts/
// @updateURL    https://artemavramenko.github.io/userscripts/copy-jira-issue-ref.user.js
// @downloadURL  https://artemavramenko.github.io/userscripts/copy-jira-issue-ref.user.js
// @supportURL   https://github.com/ArtemAvramenko/artemavramenko.github.io/issues
// ==/UserScript==

(function () {
    'use strict';

    const escapeHtmlEntities = s => s.replace(/[&<>"']/g, char => `&#${char.charCodeAt(0)};`);

    const escapeMarkdown = s => s.replace(/[\^\\\[`\*_\{\}\[\]\(\)\#\+\.!<>\-]/g, '\\$&');

    function extractIssueKey() {
        // Examples:
        // /browse/PROJ-1234
        // /issues/...&selectedIssue=PROJ-1234
        // /jira/software/c/projects/...&selectedIssue=PROJ-1234
        const url = new URL(window.location.href);
        return (
            url.pathname.match(/\/browse\/([A-Z][A-Z0-9]{1,9}-\d+)/i)?.[1] ||
            url.searchParams.get('selectedIssue') ||
            ''
        ).toUpperCase();
    }

    function extractIssueTitle() {
        return (
            document.querySelector('[data-testid="issue.views.issue-base.foundation.summary.heading"]')?.innerText ||
            document.querySelector('#summary-val')?.innerText ||
            ''
        ).trim();
    }

    function extractIssue() {
        const key = extractIssueKey();
        const title = extractIssueTitle();
        const url = `${window.location.origin}/browse/${key}`;
        return { key, title, url };
    }

    function copyForGit() {
        const issue = extractIssue();
        let result = issue.key || 'Unknown';
        if (issue.title) {
            result += ' - ' + issue.title;
        }
        if (issue.key) {
            result += `\n\n${issue.url}`;
        }
        GM_setClipboard(result);
    }

    function copyForTeams() {
        const issue = extractIssue();
        let result = `<a href="${issue.url}">${issue.key}</a>`;
        result += ` <i>${escapeHtmlEntities(issue.title)}</i>`;
        GM_setClipboard(result, 'html');
    }

    function copyForObsidian() {
        const issue = extractIssue();
        let result = `[${issue.key}](${issue.url})`
        result += ` ${escapeMarkdown(issue.title)}`;
        GM_setClipboard(result);
    }

    GM_registerMenuCommand('Copy for Git 🔶 (text)', copyForGit);
    GM_registerMenuCommand('Copy for Teams 👥 (html)', copyForTeams);
    GM_registerMenuCommand('Copy for Obsidian 🌑 (md)', copyForObsidian);
})();