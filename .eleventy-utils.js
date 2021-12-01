const slugify = require("slugify");
const { format } = require("date-fns");
const markdownIt = require("markdown-it");
const hljs = require("highlight.js");

const numbers = ["", "one", "two", "three", "four", "five", "six"];

function applyRendererRules(markdownRenderer) {
  markdownRenderer.renderer.rules.heading_open = (
    tokens,
    idx,
    options,
    env,
    renderer
  ) => {
    const token = tokens[idx];
    const level = numbers[parseInt(token.tag.substr(1), 10)];
    return `<${tokens[idx].tag} class="heading heading--${level}">`;
  };

  markdownRenderer.renderer.rules.paragraph_open = () => {
    return `<p class="paragraph">`;
  };

  markdownRenderer.renderer.rules.hr = () => {
    return `<hr class="rule" />`;
  };

  markdownRenderer.renderer.rules.link_open = (
    tokens,
    index,
    options,
    env,
    renderer
  ) => {
    const token = tokens[index];
    return `<a class="anchor anchor--primary" ${renderer.renderAttrs(token)}>`;
  };

  markdownRenderer.renderer.rules.blockquote_open = (
    tokens,
    index,
    options,
    env,
    renderer
  ) => {
    const token = tokens[index];
    return `<blockquote class="blockquote">`;
  };

  markdownRenderer.renderer.rules.table_open = () => {
    return `<table class="table">`;
  };

  const originalImageRule = markdownRenderer.renderer.rules.image;
  markdownRenderer.renderer.rules.image = (
    tokens,
    idx,
    options,
    env,
    renderer
  ) => {
    const token = tokens[idx];
    // Add class attribute
    token.attrs.push(["class", "image"]);
    // Do the original render
    return originalImageRule(tokens, idx, options, env, renderer);
  };

  markdownRenderer.renderer.rules.mark_open = () => {
    return `<mark class="mark">`;
  };
}

function getAllPublishedPosts(collectionApi) {
  return collectionApi
    .getAll()
    .filter((post) => isPublished(post))
    .map((post) => getCardModel(post));
}

function getCardModel({ data }) {
  return {
    category_name: data.category,
    category_url: `/categories/#${slugify(data.category, { lower: true })}`,
    publish_date_label: format(data.date, "do MMM, y"),
    publish_date_datetime: data.date,
    tags: data.tags.slice(0),
    teaser: data.description,
    title: data.title,
    url: data.page.url,
  };
}

function getMarkdownRenderer() {
  const markdownRenderer = markdownIt({
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          const highlightedText = hljs.highlight(str, {
            language: lang,
            ignoreIllegals: true,
          }).value;
          return `<pre class="hljs"><code>${highlightedText}</code></pre>`;
        } catch (__) {}
      }

      const highlightedText = markdownRenderer.utils.escapeHtml(str);
      return `<pre class="hljs"><code>${highlightedText}</code></pre>`;
    },
  })
    .use(require("markdown-it-sub"))
    .use(require("markdown-it-sup"))
    .use(require("markdown-it-footnote"))
    .use(require("markdown-it-deflist"))
    .use(require("markdown-it-abbr"))
    .use(require("markdown-it-ins"))
    .use(require("markdown-it-mark"));
  applyRendererRules(markdownRenderer);
  return markdownRenderer;
}

function isPublished(post) {
  return post.data.status === "published";
}

function sortPostPublishDateMostRecent(post1, post2) {
  return post2.publish_date_datetime - post1.publish_date_datetime;
}

module.exports = {
  applyRendererRules,
  getAllPublishedPosts,
  getCardModel,
  getMarkdownRenderer,
  isPublished,
  sortPostPublishDateMostRecent,
};
