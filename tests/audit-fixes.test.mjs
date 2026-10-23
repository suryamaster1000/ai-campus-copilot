import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('Tally webhook requires its signing secret and checks a Base64 HMAC before processing fields', () => {
  const source = read('supabase/functions/tally-registration-webhook/index.ts');
  assert.match(source, /if \(!webhookSecret\)/);
  assert.match(source, /hmacSha256Base64\(webhookSecret, JSON\.stringify\(payload\)\)/);
  assert.match(source, /return btoa\(binary\)/);
  assert.ok(source.indexOf('if (!signature || !safeEqual(signature.trim(), expected))') < source.indexOf('const values = extractFields(payload)'));
  assert.match(source, /rawBody\.length > 1_000_000/);
});

test('dynamic database content is escaped before the affected pages render it as HTML', () => {
  const expected = [
    ['js/pages/notices.js', 'auditEscapeHtml(n.title)', 'auditEscapeHtml(n.summary)'],
    ['js/pages/events.js', 'auditEscapeHtml(event.title)', 'auditEscapeHtml(event.description)'],
    ['js/pages/tasks.js', 'auditEscapeHtml(task.title)', 'auditEscapeHtml(task.id)'],
    ['js/pages/settings.js', 'auditEscapeHtml(campusData.student.name)', 'auditEscapeHtml(campusData.student.email)'],
    ['js/pages/dashboard.js', 'auditEscapeHtml(n.title)', 'auditEscapeHtml(task.title)'],
    ['js/pages/timetable.js', 'auditEscapeHtml(cls.name)', 'auditEscapeHtml(cls.room ||'],
    ['js/app.js', 'auditEscapeHtml(n.title)', 'auditEscapeHtml(n.summary)'],
    ['js/pages/study.js', 'auditEscapeHtml(course.name)', 'auditEscapeHtml(unit.title)'],
  ];
  for (const [path, ...needles] of expected) {
    const source = read(path);
    assert.match(source, /function auditEscapeHtml\(/, path);
    for (const needle of needles) assert.ok(source.includes(needle), path + ' is missing ' + needle);
  }
});

test('event calendar action generates an iCalendar download, not a fake success toast', () => {
  const source = read('js/pages/events.js');
  assert.match(source, /text\/calendar;charset=utf-8/);
  assert.match(source, /link\.download/);
  assert.match(source, /No registration was saved/);
  assert.doesNotMatch(source, /Successfully registered for:/);
  assert.doesNotMatch(source, /Event exported to campus Google Calendar!/);
});

test('unavailable study and notice downloads are not reported as completed', () => {
  const study = read('js/pages/study.js');
  const notices = read('js/pages/notices.js');
  assert.match(study, /Nothing was downloaded/);
  assert.doesNotMatch(study, /showToast\(\`Downloaded:/);
  assert.match(notices, /No document URL is attached to this notice/);
  assert.doesNotMatch(notices, /Downloading: \$\{file\}/);
});
