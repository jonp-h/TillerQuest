# Contributing to Tiller Quest 

Thanks for taking the time to contribute!👍

Before we start, to make contributing easy, get set up in a compatible
dev-environment. Check out our handy guide [here!](#getting-set-up) 💻

If you're not interested in contributing (no hard feelings 😉), but have a
question - take a look [here!](#i-just-want-to-ask-a-question)

This is a set of guidelines and tips for contributing to our project. Although
there are some rules that are set in stone, most of these things are guidelines
and should be treated as such. Use your best judgement, and don't hesitate to
propose changes to this document through a PR.

## Overview 📖

- [Information ℹ️](#information)
  - [Notify us of a security isse](#security-issue-notifications)
  - [I just want to ask a question...](#i-just-want-to-ask-a-question)
  - [Code of conduct](#code-of-conduct)
- [Contributing 🤝](#contributing)
  - [Getting set up](#getting-set-up)
  - [Reporting bugs and requesting features](#reporting-bugs-and-requesting-features)
  - [Contributing with PRs](#contributing-via-prs)
  - [Finding what to contribute with](#finding-to-contribute-with)
- [Styleguides 🕶️](#styleguides)
  - [Git commit messages](#git-commit-messages)
  - [Github issues](#github-issues)
  - [Documentation styleguide](#documentation)
- [Misc 📜](#misc)
  - [Licensing](#licensing)
  - [Additional info](#additional-info)

## Information ℹ️

### Security issue notifications

If you discover a potential security issue in this project we ask that you
notify one of the project owners. Please do not post it to a public issue or PR.

### I just want to ask a question...

> **_NB!_** Please do not create an issue to ask a question. You'll get a
> response much sooner if you use the options below.

\[TODO: Expand seciton\]

### Code of conduct

See our [code of conduct file][code-of-conduct] for information.

## Contributing 🤝

### Getting set up

### First steps

To get started, you'll need to ensure that:

 -

#### Git commit message template

This project uses a git commit message template to make it easier for
contributors to follow the [conventional commits][con-com] standard.

Enable the projects git commit message template by running the following
command:

```sh
git config commit.template .gitmessage
```

### Reporting bugs and requesting features

Feel free to use the GitHub issue tracker to report bugs or request any
features.

When filing an issue, please check [existing open][open-issues], or
[recently closed][closed-issues], issues to make sure somebody else hasn't
already reported the issue. Please try to include as much information as you
can. When you create your issue, our template will guide you on what
innformation is useful. However, we encourage adding any additional information
you find relevant that is not covered in the template.

### Contributing via PRs

Contributions via pull requests are much appreciated. Before sending us a pull
request, please ensure that:

1. You are working against the latest source of the project.
1. You check existing open, and recently merged, pull requests to make sure
   someone else hasn't addressed the problem already.
1. You open an issue to discuss any significant work.

#### To create a PR:

1. [Fork][repo-forking] the repository.
1. Modify relevant code.
   - Please keep any modificaitons outside the scope of the change you are
     making to a minimum. Reformatting or other big changes will make it hard to
     see your change.
1. Commit to your fork, making sure to follow our
   [guidelines](#git-commit-messages) for commit messages.
1. [Create a pull request][PRs], answering any questions in the PR template.
1. Pay attention to any CI failures in the pull request.
1. Remain available to discuss the request.

### Finding contributions to work on

Looking at the existing issues is a great way to find something to contribute
on. For your first issue, having a look at the ['good first issue'][gfi] label
is the place to start. Any other issues marked with ['help wanted'][hw] are also
a good option, however, these may be more complex and may also require a deeper
understanding of the project.

## Styleguides 🕶️

Tiller Quest follows certain styleguides and standards. This is to make the
codebase universally readable and consistent. When contributing, please follow
these guides to the best of your ability.

### Git commit messages

This project strives to follow the [conventional commits][con-com] standard for
commit messages. In an effort to make this specification more convenient to
follow, we include a gitmessage template. See the project README for a guide on
enabling it.

Example:

```
<type>(<optional scope>): <description>

<optional body>

<optional footer(s)>
```

In short:

- Use the present tense
- Use the imperative mood
- Limit the first line to 50 characters
- Limit the body to 72 characters
- Refer to any issues in the footer
- Breaking changes must have ! before ':'
  - optionally add 'BREAKING CHANGE' as a footer

For a quick (but more complete) summary, see Conventional Commits'
[summary][con-com-sum]. For the full specification, see their
[guide][con-com-spec].

### Github Issues

Answer the questions given in the issue template. If you are reporting a bug, be
sure to include:

- A description of the bug
- Any relevant screenshots
- A guide on how to reproduce the bug (to your best ability)
- The version of the project you are using
- The version of unity you are using
- The platform you are running on
- Any relevant stack traces
- Any relevant log messages

The more precise you are with your description, the easier it will be for us to
either reproduce and fix the bug or implement the requested feature.

### Documentation

| Question                                     | Reference                                                       |
| -------------------------------------------- | --------------------------------------------------------------- |
| How do I write documentation?                | [Markdown][md]                                                  |
| Formatting prefrences in markdown?           | [GitHub Flavor][gfm], linelength within column 80 when possible |
| How do I write code documentation?           | [XML Documentation][ms-xmldoc]                                  |
| What is the standard for spelling & grammar? | [British English][dict]                                         |

## Misc 📜

### Licensing

This project is released under the MIT License. We ask that you ensure
contributions you make also follow this license. For the full license
information, see our [LICENSE][lcns] file or read more [here][mit].

[code-of-conduct]: 
[open-issues]: 
[closed-issues]: 
[repo-forking]: https://docs.github.com/en/get-started/quickstart/contributing-to-projects#forking-a-repository
[PRs]: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork
[con-com]: https://www.conventionalcommits.org/en/v1.0.0/
[con-com-sum]: https://www.conventionalcommits.org/en/v1.0.0/#summary
[con-com-spec]: https://www.conventionalcommits.org/en/v1.0.0/#specification
[md]: https://www.markdownguide.org/
[ms-xmldoc]: https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/xmldoc/
[dict]: https://dictionary.cambridge.org/dictionary/english/
[lcns]: 
[mit]: https://opensource.org/license/MIT/
[gfm]: https://github.github.com/gfm/
