const { format } = require("date-fns");

module.exports = {
  eleventyComputed: {
    publish_date_label: (data) => format(data.date, "do MMM, y"),
    publish_date_datetime: (data) => data.date,
    url: (data) => data.page.url,
  },
};
