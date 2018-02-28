# Publishing A Webpage

When you are ready to publish a webpage, paste the following into a notebook
cell:

```python
import nbi

nbi.publish('my_binder_spec', 'my_notebook.ipynb')
#            Binder spec       Name of the notebook
```

Replace `my_binder_spec` with your Binder spec. This is a string that looks
like `{username}/{repo}/{branch}`. For example, if you forked the
`nbinteract-image` repo in the previous [GitHub Setup][gh-setup] section of the
tutorial, your Binder spec will be `<username>/nbinteract-image/master` where
`<username>` is replaced with your GitHub username.

[gh-setup]: ./tutorial_github_setup.md

Replace `my_notebook.ipynb` with the name of the notebook you are converting.
For example, if your Binder spec is `calebs11/nbinteract-image/master` and
notebook name is `tutorial.ipynb`, you should run:

```python
import nbi
nbi.publish('calebs11/nbinteract-image/master', 'tutorial.ipynb')
```

Click the link created by the code above to download the `tutorial.html` HTML
file.

Now, go to the `nbinteract-tutorial` GitHub repository you created earlier.
Drag the `tutorial.html` file from your filesystem browser onto the page to
upload it. Then, click Commit Changes to confirm the upload.

Congrats! You now have a URL you can share with anyone in the world:

```
<username>.github.io/nbinteract-tutorial/tutorial.html
```

Where `<username>` is replaced with your GitHub username. For example, if my
username is `SamLau95`, my URL is:

```
SamLau95.github.io/nbinteract-tutorial/tutorial.html
```

## Publishing to a different URL

To change the URL of the page you publish, you may rename the file before you
upload it. For example, if I rename `tutorial.html` to `hello.html`, my URL
would be

```
SamLau95.github.io/nbinteract-tutorial/hello.html
```

To change the path segment before the filename (in this case,
`nbinteract-tutorial`) you should create a new GitHub repo with the subpath
name you want. Then, you may upload your HTML files into that repo. For
example, if I create a new repo called `blog-posts` and upload a
file called `tutorial.html` the resulting URL is:

```
SamLau95.github.io/blog-posts/tutorial.html
```

# Onward

You have learned a simple workflow to create interactive webpages:

1. Write a Jupyter notebook containing Python functions
2. Use `interact` to create UI elements to interact with the functions.
3. Run `nbi.publish('NOTEBOOK_NAME.ipynb')` in your notebook to generate an
   interactive webpage using your notebook code.
4. Publish your webpage to GitHub pages to make it publicly accessible.

In the next section, you will create an interactive simulation of the Monty
Hall Problem. Onward!
