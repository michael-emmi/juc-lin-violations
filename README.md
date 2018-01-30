[![Build Status](https://travis-ci.org/michael-emmi/violat.svg?branch=master)](https://travis-ci.org/michael-emmi/violat)
[![npm version](https://badge.fury.io/js/violat.svg)](https://badge.fury.io/js/violat)

## Violat
Find test harnesses that expose atomicity violations.

This project demonstrates that many of the methods in Java’s library of
[concurrent collections][] are non-linearizable. For each non-linearizable
method in the selected collection classes, a small test harness witnesses
violations via stress testing with OpenJDK’s [jcstress][] tool.

# Requirements

* [Node.js][]
* [Java SE Development Kit 8][]
* [Gradle][]
* [Maven][]

# Installation

    $ npm i -g violat

# Usage

    $ violat

# Development

Emulate installation of local repository:

    $ npm link

Release a new version to npm:

    $ npm version [major|minor|patch]
    $ npm publish

# Experiments

Run all of the included experiments:

    $ npm run experiments

Or the subset of them that match any of the given expressions:

    $ npm run experiments 'Map' 'Set'

# History Generation

Add to the set of histories generated in `violat-output/histories` with the `violat-histories` command:

    $ violat-histories resources/specs/java/util/concurrent/ConcurrentHashMap.json

# History Checking

Check the histories stored in `violat-output/histories` with the `violat-history-checker` command:

    $ find violat-output/histories -name "*.json" | xargs violat-history-checker


# Visualization

Install and start a web server to visualize histories and history-checking results:

    $ npm i -g http-server
    $ http-server violat-output

Then point the web browser to one of the URLS output by the history checker:

    http://localhost:8080/histories/**/*.html

Or point the web browser to the plot of data generated by the history checker:

    http://localhost:8080/results/plot.html


[Node.js]: https://nodejs.org
[concurrent collections]: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/package-summary.html
[Java SE Development Kit 8]: http://www.oracle.com/technetwork/java/javase
[Gradle]: http://gradle.org
[Maven]: https://maven.apache.org
[jcstress]: http://openjdk.java.net/projects/code-tools/jcstress/
