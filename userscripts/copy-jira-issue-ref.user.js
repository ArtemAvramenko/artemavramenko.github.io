// ==UserScript==
// @name         Copy Jira Issue Ref
// @version      1.0
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

    function escapeHtmlEntities(text) {
         return text.replace(/[&<>"']/g, char => `&#${char.charCodeAt(0)};`);
    }

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

    function copyForGit() {
        const issueKey = extractIssueKey();
        const title = extractIssueTitle();
        let result = issueKey || 'Unknown';
        if (title) {
            result += ' - ' + title
        }
        if (issueKey) {
            result += `\n\n${window.location.origin}/browse/${issueKey}`;
        }
        GM_setClipboard(result);
    }

    function copyForTeams() {
        const issueKey = extractIssueKey();
        const title = extractIssueTitle();
        let result = `<a href="${window.location.origin}/browse/${issueKey}">${issueKey}</a>`;
        result += ` <i>${escapeHtmlEntities(title)}</i>`;
        GM_setClipboard(result, 'html');
    }

    GM_registerMenuCommand('Copy for Git 🔶', copyForGit);
    GM_registerMenuCommand('Copy for Teams 👥', copyForTeams);
})();