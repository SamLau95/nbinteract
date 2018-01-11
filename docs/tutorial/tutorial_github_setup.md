# Setting Up GitHub Pages

GitHub Pages is one of the simplest ways to host webpages for others to view.
We will walk through the necessary steps here to set up a repo that we will use
later in the tutorial to publish your webpage to the internet.

If you would prefer not to publish your webpage, you may skip this page of the
tutorial.

## Creating an Account and Repo

To begin, visit https://github.com/ and create an account. If you already have
an account, you should log in.

Then, create a new repo. You may do this using the GitHub UI or visiting
https://github.com/new . Name the repo `nbinteract-tutorial`. If you'd like a
different name, feel free to name it something else. However, we will use this
repo name in later parts of the tutorial.

Make sure your repo is public, and click the checkbox to initialize your repo
with a README. Your page should look like:

<img src="https://user-images.githubusercontent.com/2468904/34801736-1837d22a-f61f-11e7-92e3-8eddf7d5da0f.png"
  alt="gh-repo-setup"
  width="80%"
  style="margin: 0 10%;"
>

Now, click on the Settings link for the repo near the top of the page, scroll
down to the GitHub Pages section, and select the `master` branch as the GitHub
pages source. Click the Save button to save your changes.

<img src="https://user-images.githubusercontent.com/2468904/34801810-650af35c-f61f-11e7-8650-cb90c8ec60b1.png"
  alt="gh-pages-setup"
  width="80%"
  style="margin: 0 10%;"
>

Now, any file you upload to this repo will have a public URL. For example, the
`README.md` file in the repo has the following URL:

```
<username>.github.io/nbinteract-tutorial/README.md
```

Where `<username>` is replaced with your GitHub username. For example, if my
username is `SamLau95`, my URL is:

```
SamLau95.github.io/nbinteract-tutorial/README.md
```

If you can visit that URL and the page contains text (not a 404 error) you've
set up everything correctly. Let's move on to publishing your first interactive
webpage!
