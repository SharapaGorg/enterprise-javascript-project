<template>
  <section class="summary-ai-section" v-if="book">
    <div class="summary-header">
      <h3>Краткое содержание (AI)</h3>
      <div class="summary-controls">
        <button class="ai-btn" :disabled="isLoading" @click="startGeneration" title="Сгенерировать заново">
          <span v-if="!isLoading">🔄</span>
          <span v-else class="spinner">⏳</span>
        </button>
        <button class="stop-btn" v-if="isLoading" @click="stopGeneration" title="Остановить">
          ⏹
        </button>
      </div>
    </div>

    <div class="summary-body">
      <div v-if="isError" class="summary-error">Ошибка генерации: {{ errorMessage }}</div>

      <div v-else>
        <div class="summary-progress" v-if="isLoading && !content">
          Генерация... Пожалуйста, подождите.
        </div>

        <!-- render markdown as sanitized HTML -->
        <div class="summary-text" v-if="renderedHtml" v-html="renderedHtml"></div>

        <div v-if="!isLoading && !content" class="summary-empty">
          Краткое содержание отсутствует.
        </div>
      </div>
    </div>

    <div class="summary-footer">
      <small class="muted">AI-генерация. Результат можно отредактировать вручную.</small>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue';
import type { Book } from '~~/types/books';

const props = withDefaults(defineProps<{
  book: Book | null
}>(), {
  book: null
});

const MAX_WORDS_DEFAULT = 250;

const isLoading = ref(false);
const isError = ref(false);
const errorMessage = ref('');
const content = ref('');
const renderedHtml = ref(''); // HTML after markdown -> sanitized
let controller: AbortController | null = null;

watch(() => props.book, (b) => {
  if (b) {
    startGeneration();
  } else {
    reset();
  }
}, { immediate: true });

onBeforeUnmount(() => {
  stopGeneration();
});

function reset() {
  stopGeneration();
  content.value = '';
  renderedHtml.value = '';
  isError.value = false;
  errorMessage.value = '';
}

function stopGeneration() {
  if (controller) {
    try { controller.abort(); } catch (e) {}
    controller = null;
  }
  isLoading.value = false;
}

/* ---------------- markdown rendering ---------------- */

async function renderMarkdown(md: string) {
  // prefer client-side libs; graceful fallback to simple parser
  if (!md) {
    renderedHtml.value = '';
    return;
  }

  // try using marked + DOMPurify if available (dynamic import)
  try {
    // only run in client
    if (typeof window !== 'undefined') {
      const [{ marked }, DOMPurify] = await Promise.all([
        import('marked').then(m => m.default ? { marked: m.default } : m),
        import('dompurify').then(m => m.default ? m.default : m)
      ]);
      const html = typeof marked === 'function' ? marked(md) : (marked.parse ? marked.parse(md) : String(md));
      const clean = DOMPurify.sanitize ? DOMPurify.sanitize(html) : (DOMPurify.default ? DOMPurify.default.sanitize(html) : html);
      renderedHtml.value = clean;
      return;
    }
  } catch {
    // ignore and fallback
  }

  // simple fallback: escape + basic md transforms (headings, bold, italic, links, lists, paragraphs)
  const escaped = escapeHtml(md);
  let html = escaped
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^\s*-\s+(.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br>');
  html = `<p>${html}</p>`;
  renderedHtml.value = html;
}

// simple HTML escaper
function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* watch content -> render markdown progressively */
watch(content, (c) => {
  renderMarkdown(c || '');
});

/* ---------------- existing generation logic ---------------- */

function extractMessageFromJsonString(s: string): string | null {
  if (!s) return null;
  try {
    const j = JSON.parse(s);
    const candidate =
      j?.message ??
      j?.data?.message ??
      j?.data ??
      j?.text ??
      j?.content ??
      j?.result ??
      j?.data?.choices?.[0]?.message?.content ??
      j?.choices?.[0]?.message?.content ??
      j?.choices?.[0]?.text ??
      null;
    if (candidate) return typeof candidate === 'string' ? candidate : JSON.stringify(candidate);
  } catch {}
  const jsonMatch = s.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const j = JSON.parse(jsonMatch[0]);
      const candidate =
        j?.message ??
        j?.data?.message ??
        j?.data ??
        j?.text ??
        j?.content ??
        j?.result ??
        j?.data?.choices?.[0]?.message?.content ??
        j?.choices?.[0]?.message?.content ??
        j?.choices?.[0]?.text ??
        null;
      if (candidate) return typeof candidate === 'string' ? candidate : JSON.stringify(candidate);
    } catch {}
  }
  const dataRegex = /data:\s*(\{[\s\S]*?\})(?:\n|$)/g;
  let m;
  while ((m = dataRegex.exec(s)) !== null) {
    try {
      const j = JSON.parse(m[1]);
      const candidate =
        j?.message ??
        j?.data?.message ??
        j?.text ??
        j?.content ??
        j?.choices?.[0]?.message?.content ??
        null;
      if (candidate) return typeof candidate === 'string' ? candidate : JSON.stringify(candidate);
    } catch {}
  }
  return null;
}

async function startGeneration(maxWords = MAX_WORDS_DEFAULT) {
  if (!props.book) return;
  stopGeneration();
  isLoading.value = true;
  isError.value = false;
  errorMessage.value = '';
  content.value = '';
  renderedHtml.value = '';
  controller = new AbortController();

  const messagesToSend = [
    {
      role: 'system',
      content: 'Ты — помощник, который последовательно генерирует краткое содержание книги. Пиши по абзацам, логично, полно, но не более указанного лимита слов.'
    },
    {
      role: 'user',
      content: `Сгенерируй краткое содержание (summary) для книги. Формат: несколько кратких абзацев. Максимум слов: ${maxWords}.
Title: ${props.book.title || '—'}
Authors: ${props.book.authors?.join(', ') || '—'}
Publisher: ${props.book.publisher || '—'}
PublishedDate: ${props.book.publishedDate || '—'}
PageCount: ${props.book.pageCount || '—'}
Categories: ${props.book.categories?.join(', ') || '—'}
Существующее описание: ${props.book.description ? props.book.description.substring(0, 800) : '—'}`
    }
  ];

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messagesToSend, stream: true })
    });

    const rawText = await res.clone().text().catch(() => '');

    const immediate = extractMessageFromJsonString(rawText);
    if (!res.ok) {
      if (immediate) {
        content.value = truncateWords(immediate, maxWords);
      } else {
        content.value = truncateWords(rawText || 'Ошибка генерации', maxWords);
      }
      isLoading.value = false;
      return;
    }

    if (res.body && res.body.getReader) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: d } = await reader.read();
        if (d) {
          done = true;
          break;
        }
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          processStreamChunk(chunk, maxWords);
        }
      }

      content.value = truncateWords(content.value, maxWords);
      isLoading.value = false;
      controller = null;
      return;
    }

    if (immediate) {
      content.value = truncateWords(immediate, maxWords);
    } else {
      content.value = truncateWords(rawText || '', maxWords);
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      // aborted
    } else {
      isError.value = true;
      errorMessage.value = String(err?.message || err);
    }
  } finally {
    isLoading.value = false;
    controller = null;
  }
}

function processStreamChunk(chunk: string, maxWords: number) {
  if (!chunk) return;
  const extracted = extractMessageFromJsonString(chunk);
  if (extracted) {
    content.value += (content.value ? '\n' : '') + extracted;
    content.value = truncateWords(content.value, maxWords);
    return;
  }
  const cleaned = chunk
    .split('\n')
    .map(line => line.replace(/^data:\s*/, '').trim())
    .filter(Boolean)
    .join(' ');
  if (cleaned) {
    content.value += (content.value ? '\n' : '') + cleaned;
    content.value = truncateWords(content.value, maxWords);
  }
}

function truncateWords(text: string, maxWords = MAX_WORDS_DEFAULT) {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(' ').replace(/\s+$/, '') + '...';
}
</script>

<style scoped>
.summary-ai-section {
  border-top: 1px solid #eef2f6;
  padding-top: 18px;
  margin-top: 12px;
}

.summary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.summary-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1a202c;
}

.summary-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.ai-btn {
  height: 36px;
  min-width: 36px;
  padding: 0 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #2b6cb0;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.12s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ai-btn:hover { transform: translateY(-2px); background: #f5f8ff; }

.stop-btn {
  height: 36px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff5f5;
  color: #c53030;
  cursor: pointer;
}

.summary-body { margin-top: 8px; }

/* now accepts HTML (rendered markdown) */
.summary-text {
  background: #ffffff;
  border: 1px solid #edf2f7;
  padding: 14px;
  border-radius: 8px;
  color: #2d3748;
  line-height: 1.6;
  max-height: 420px;
  overflow: auto;
}

/* small typographic tweaks for MD elements */
.summary-text h2, .summary-text h3, .summary-text h4 { margin: 8px 0; color: #1a202c; }
.summary-text p { margin: 8px 0; }
.summary-text ul { margin: 8px 0 8px 20px; }
.summary-text a { color: #2b6cb0; text-decoration: underline; }
.summary-error { color: #c53030; }
.summary-progress { color: #4a5568; font-style: italic; }
.summary-footer { margin-top: 8px; font-size: 12px; color: #718096; }
.spinner { animation: spin 1s linear infinite; display: inline-block; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>