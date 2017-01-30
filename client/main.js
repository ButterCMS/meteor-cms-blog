import Butter from 'buttercms';

import './main.html';

const butter = Butter('de55d3f93789d4c5c26fb07445b680e8bca843bd');

Router.route('/', function() {
  this.render("Home")
});

Router.route('/blog', function() {
  let that = this;

  butter.post.list({page: 1, page_size: 10}).then(function(response) {
    that.render('Blog', {data: {posts: response.data.data}});
  });
});

Router.route('/blog/:slug', function() {
  let slug = this.params.slug;
  let that = this;

  butter.post.retrieve(slug).then(function(response) {
    let post = response.data.data;

    SEO.set({
      title: post.seo_title,
      meta: {
        description: post.meta_description
      },
      rel_author: 'https://www.google.com/+ButterCMS',
      og: {
        'title': post.seo_title,
        'description': post.meta_description,
        'image': post.featured_image
      }
    });

    that.render('Post', {data: {post: post}});
  });
});
