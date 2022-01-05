const { format } = require("date-fns");
const slugify = require("slugify");

function getPostSchema(data) {
  const url = new URL(data.page.url, `https://danpalmer.club`);
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    author: {
      "@type": "Person",
      name: "Dan Palmer",
    },
    datePublished: "2015-02-05T08:00:00+08:00",
    headline: data.title,
    mainEntityOfPage: url.toString(),
    url: url.toString(),
  };

  if (data.description) schema.abstract = data.description;

  return JSON.stringify(schema);
}

module.exports = {
  eleventyComputed: {
    category_name: (data) => data.category,
    category_url: (data) =>
      `/categories/#${slugify(data.category, { lower: true })}`,
    is_external: (data) => !!data.external_url,
    publish_date_label: (data) => format(data.date, "do MMM, y"),
    publish_date_datetime: (data) => data.date,
    schema: getPostSchema,
    tags: (data) => {
      if (!data.tags) return [];
      return data.tags.map((tag) => {
        return {
          label: tag,
          url: `/tags/#${slugify(tag, { lower: true })}`,
        };
      });
    },
    url: (data) => data.external_url || data.page.url
  },
};
