const util = require("node:util");
const slugify = require("slugify");
const htmlmin = require("html-minifier");
const sass = require("node-sass");
const {
  getAllPublishedPosts,
  getMarkdownRenderer,
  sortContentMostRecent,
  getAllPublishedProjects,
} = require("./.eleventy-utils");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({
    "src/static": "/static",
  });

  // Add layouts
  eleventyConfig.addLayoutAlias("post", "layouts/post.njk");
  eleventyConfig.addLayoutAlias("project", "layouts/project.njk");

  // Collections
  eleventyConfig.addCollection("mostRecentPosts", (collectionApi) => {
    return getAllPublishedPosts(collectionApi).sort((post1, post2) =>
      sortContentMostRecent(post1, post2)
    );
  });

  eleventyConfig.addCollection("postsGroupedByCategories", (collectionApi) => {
    const publishedPosts = getAllPublishedPosts(collectionApi);
    const categories = new Map();

    publishedPosts.forEach((post) => {
      if (!categories.has(post.category_name)) {
        categories.set(post.category_name, []);
      }
      categories.get(post.category_name).push(post);
    });

    return Array.from(categories.keys())
      .sort((a, b) => a.localeCompare(b))
      .map((key) => {
        return {
          label: key,
          slug: slugify(key, { lower: true }),
          posts: categories
            .get(key)
            .slice(0)
            .sort((post1, post2) => sortContentMostRecent(post1, post2)),
        };
      });
  });

  eleventyConfig.addCollection("postsGroupedByTags", (collectionApi) => {
    const publishedPosts = getAllPublishedPosts(collectionApi);
    const tags = new Map();

    publishedPosts.forEach((post) => {
      post.tags.forEach((tag) => {
        if (!tags.has(tag.label)) {
          tags.set(tag.label, []);
        }
        tags.get(tag.label).push(post);
      });
    });

    return Array.from(tags.keys())
      .sort((a, b) => a.localeCompare(b))
      .map((key) => {
        return {
          label: key,
          slug: slugify(key, { lower: true }),
          posts: tags
            .get(key)
            .slice(0)
            .sort((post1, post2) => sortContentMostRecent(post1, post2)),
        };
      });
  });

  eleventyConfig.addCollection("projects", (collectionApi) => {
    return getAllPublishedProjects(collectionApi);
  });

  // Markdown renderer
  eleventyConfig.setLibrary("md", getMarkdownRenderer());

  // Debug
  eleventyConfig.addFilter("console", function (value) {
    const str = util.inspect(value);
    return `<div style="white-space: pre-wrap;">${unescape(str)}</div>;`;
  });

  // CSS (SASS) Minifier
  eleventyConfig.addFilter("cssminify", function (code) {
    return sass
      .renderSync({ data: code, outputStyle: "compressed" })
      .css.toString("utf8");
  });

  // HTML Minifier
  eleventyConfig.addTransform("html-minify", (content, outputPath) => {
    if (outputPath.endsWith(".html")) {
      return htmlmin.minify(content, {
        collapseWhitespace: true,
        minifyURLs: true,
        removeComments: true,
        useShortDoctype: true,
      });
    }
    return content;
  });

  return {
    dir: {
      input: "src",
    },
  };
};
