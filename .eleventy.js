const util = require("util");
const slugify = require("slugify");
const {
  getAllPublishedPosts,
  getCardModel,
  getMarkdownRenderer,
  isPublished,
  sortPostPublishDateMostRecent,
} = require("./.eleventy-utils");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({
    "src/static": "/static",
  });

  // Add layouts
  eleventyConfig.addLayoutAlias("post", "layouts/post.njk");
  eleventyConfig.addLayoutAlias("project", "layouts/project.njk");

  // Collections
  eleventyConfig.addCollection("mostRecent", (collectionApi) => {
    return getAllPublishedPosts(collectionApi).sort((post1, post2) =>
      sortPostPublishDateMostRecent(post1, post2)
    );
  });

  eleventyConfig.addCollection("groupedByCategories", (collectionApi) => {
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
            .sort((post1, post2) =>
              sortPostPublishDateMostRecent(post1, post2)
            ),
        };
      });
  });

  eleventyConfig.addCollection("groupedByTags", (collectionApi) => {
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
            .sort((post1, post2) =>
              sortPostPublishDateMostRecent(post1, post2)
            ),
        };
      });
  });

  // Markdown renderer
  eleventyConfig.setLibrary("md", getMarkdownRenderer());

  // Debug
  eleventyConfig.addFilter("console", function (value) {
    const str = util.inspect(value);
    return `<div style="white-space: pre-wrap;">${unescape(str)}</div>;`;
  });

  return {
    dir: {
      input: "src",
    },
  };
};
