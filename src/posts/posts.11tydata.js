const { format } = require("date-fns");
const slugify = require('slugify');

module.exports = {
  eleventyComputed: {
    category_name: data => data.category,
    category_url: data => `/categories/#${slugify(data.category, {lower:true})}`,
    publish_date_label: data => format(data.date, "do MMM, y"),
    publish_date_datetime: data => data.date,
    tags: data => {
      if(!data.tags) return [];
      return data.tags.map(tag => {
        return {
          label: tag,
          url: `/tags/#${slugify(tag, {lower:true})}`
        };
      });
    }
  }
};