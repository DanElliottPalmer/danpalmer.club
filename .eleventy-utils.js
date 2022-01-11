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

  markdownRenderer.renderer.rules.ordered_list_open = () => {
    return '<ol class="ordered-list">';
  };

  markdownRenderer.renderer.rules.bullet_list_open = () => {
    return '<ul class="unordered-list">';
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
    category_name: data.category_name,
    category_url: data.category_url,
    is_external: data.is_external || false,
    publish_date_label: data.publish_date_label,
    publish_date_datetime: data.publish_date_datetime,
    tags: data.tags.slice(0),
    teaser: data.description,
    title: data.title,
    url: data.url,
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
