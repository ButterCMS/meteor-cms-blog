# MeteorJS CMS-powered blog

You know the story, you've built a great MeteorJS website for your client and they want a blog that lives in a subdirectory (not a subdomain) for SEO purposes.

In this tutorial I’m going to show you how to build a CMS-powered blog using MeteorJS and ButterCMS. The finished code for this tutorial is [available on Github](https://github.com/buttercms/meteor-cms-blog).

[ButterCMS](https://buttercms.com) is a hosted API-based CMS and blog engine that lets you build CMS-powered apps using any programming language. You can think of Butter as being similar to WordPress except that you build your website in your language of choice and then plug-in the dynamic content using an API. If you want to try Butter for yourself, [sign in with Github](https://buttercms.com/github/oauth).

## Getting Started

If you're new to MeteorJS, check out their [quick start guide](https://guide.meteor.com/#quickstart) or follow the steps below.

Install Meteor:
```
curl https://install.meteor.com/ | sh
```

Create a new app and make sure it runs:
```
meteor create meteor-cms-blog
cd meteor-cms-blog
meteor npm install
meteor
```

Open your web browser and go to `http://localhost:3000` to see the app running.

## Creating the blog

First install the [ButterCMS Node.js API client](https://github.com/buttercms/buttercms-node):

```
meteor npm install buttercms
```

We'll also use [Iron Router](https://github.com/iron-meteor/iron-router/) to setup our blog routes:
```
meteor add iron:router
```

We'll then create some basic routes and templates. We're using an API token for a ButterCMS test account. [Sign in with Github](https://buttercms.com/github/oauth) to create your own account and API token.

`client/main.js`:

```
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

    that.render('Post', {data: {post: post}});
  });
});
```

`client/main.html`:

```
<head>
  <title>Meteor Blog</title>
</head>
<body>
</body>

<template name="home">
  <a href="/blog">View blog</a>
</template>

<template name="blog">
<h2>Blog Posts</h2>
{{#each posts}}
  <div>
    <a href="/blog/{{slug}}">{{title}}</a>
  </div>
{{/each}}
</template>

<template name="post">
  <h2>{{post.title}}</h2>
  {{{post.body}}}
</template>
```

Let's take a closer look at one of our routes to see what's happening.

```
Router.route('/blog/:slug', function() {
  let slug = this.params.slug;
  let that = this;

  butter.post.retrieve(slug).then(function(response) {
    let post = response.data.data;

    that.render('Post', {data: {post: post}});
  });
});
```

In the code above, we create a route for the URL `/blog/:slug` which takes a post slug as a URL parameter, and then uses the slug to make an API request to [ButterCMS](https://buttercms.com) to fetch the post and render it.

## SEO

Our blog is setup, but crawlers from search engines and social networks do not execute Javascript so our blog has terrible SEO.

First we'll install the [ms-seo helper package](https://atmospherejs.com/manuelschoebel/ms-seo) and make sure we have good HTML titles, descriptions, and meta tags.

```shell
meteor add check
meteor add manuelschoebel:ms-seo
```

ms-seo provides a simple `SEO.set` method for configuring tags. You can verify that tags are getting set properly by inspecting the DOM.

```javascript
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
```

Finally, we want to server render our blog so that its crawalable by search engines and social networks like Twitter.

The easiest way to do this is to use [Meteor's hosting platform, Galaxy](https://www.meteor.com/galaxy/), which provides an integrated pre-rendering service (Prerender.io). The Prerender.io service is included as part of Galaxy at no additional cost.

Follow Meteor's [guide](https://guide.meteor.com/deployment.html#galaxy) for deploying to Galaxy. To turn on the built-in Prerender.io integration, add the [Galaxy SEO](https://atmospherejs.com/mdg/seo) package:

```
meteor add mdg:seo
```

If you don't want to use Galaxy, you can manually integrate Prerender.io. Another option is implementing server-side rendering into your app. At the time of this writing, server-side rendering isn't natively supported by Meteor, but you can check out [Meteor SSR](https://github.com/meteorhacks/meteor-ssr) or [Flow Router's](https://github.com/kadirahq/flow-router/tree/ssr) alpha release of SSR support.